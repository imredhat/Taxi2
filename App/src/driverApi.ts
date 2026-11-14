import axios from 'axios';
import { storage } from './storage';
import { API_URL } from './utils';
import {gregorianToJalali,JALALI_MONTHS,toFa} from './jalaliDate';

export type Coordinates = {lat:number;lng:number};
export type Point = Coordinates & {address:string};
export interface Offer {
 id:string; fare:string; scheduled_at:string; offer_expires_at?:string; distance_km:string|null; duration_minutes:number|null;
 starts:Point[]; ends:Point[]; coordinates:[number,number][];
 passenger_count:number; luggageCount:number; bagCount:number; hasAnimals:boolean; animalType:string; notes?:string;
}
export type MapRoute=Pick<Offer,'starts'|'ends'|'coordinates'> & {waypoints?:Point[];activeStopLabel?:string};
export type TripMessage={id:string;message:string;created_at:string;is_mine:boolean;is_read?:boolean};
export interface Dashboard {
 driver:{first_name:string;last_name:string;is_verified:boolean;active_vehicle_id:string|null;rating:number};
 vehicles:{id:string;model:string|null;brand:string|null;license_plate:string;car_class:string;color:string;year:number;is_active:boolean;approval_pending:boolean;front_document_id:string|null}[];
 assigned:{id:string;status:string;pickup_address:string;dropoff_address:string;fare:string|null;scheduled_at:string|null}[];
}
export type DriverTrip=Dashboard['assigned'][number] & {created_at:string};
export type VehicleDetails={vin:string|null;owner_name:string|null;fuel_type:string|null;insurance_expiry:string|null;
 documents:{id:string;type:string}[]};
export type DriverTripDetails=DriverTrip & MapRoute & {
 rating_options:string[];
 my_rating:{score:number;comment:string|null;tags:string[]|null}|null;
 payment_status:'pending'|'processing'|'completed'|'failed'|'refunded'|null;
 driver_share:string|null;
 route_metrics:{minutes:number[];meters:number[]}|null;
 car_class:string; distance_km:string|null; duration_minutes:number|null; passenger_count:number|null;
 luggage_count:number|null; bag_count:number|null; has_animals:boolean|null; can_contact:boolean; passenger_name:string|null; passenger_notes?:string|null; unread_count:number;
 cancellation_label:string|null; cancellation_options:{id:string;label:string}[]; stops_reached:number;
};
const classLabels:Record<string,string>={eco_city:'ECO شهری',eco_intercity:'ECO بین‌شهری',eco_plus:'ECO+',vip:'VIP',vip_plus:'VIP+',suv:'SUV',van:'ون'};
export const carClassLabel=(value:string)=>classLabels[value]||value;
export interface DriverFinance {
 total:string;balance:string;
 items:{id:string;ride_id:string;driver_share:string;created_at:string}[];
 transactions:{id:string;ride_id:string|null;type:string;amount:string;description_fa:string;created_at:string}[];
}
async function request<T>(path:string, method='GET', data?:unknown):Promise<T> {
 const token=await storage.getItem('auth_token');
 if(!token) throw new Error('دوباره با حساب راننده وارد شوید.');
 const response=await axios.request<T>({url:`${API_URL}/api/driver${path}`,method,data,headers:{Authorization:`Bearer ${token}`},timeout:20000});
 return response.data;
}
export const driverApi={
 registerDevice:(token:string)=>request<{device:{id:string}}>('/devices','POST',{token,platform:'android'}),
 removeDevice:(id:string)=>request(`/devices/${encodeURIComponent(id)}`,'DELETE'),
 dashboard:()=>request<Dashboard>('/dashboard'),
 profilePhoto:()=>request<{image:string|null}>('/profile-photo'),
 updateProfilePhoto:(base64:string)=>request<{image:string}>('/profile-photo','PUT',{base64}),
 trips:(page:number)=>request<{items:DriverTrip[];has_more:boolean}>(`/trips?page=${page}`),
 trip:(id:string)=>request<{trip:DriverTripDetails}>(`/trips/${encodeURIComponent(id)}`),
 rateTrip:(id:string,score:number,comment:string,tags:string[])=>request<{rating:NonNullable<DriverTripDetails['my_rating']>}>(`/trips/${encodeURIComponent(id)}/rating`,'PUT',{score,comment,tags}),
 pickupMetrics:(id:string,p:Coordinates)=>request<{minutes:(number|null)[];meters:(number|null)[]}>(`/trips/${encodeURIComponent(id)}/pickup-metrics?lat=${p.lat}&lng=${p.lng}`),
 cancelTrip:(id:string,reason:string)=>request<{trip:{id:string;status:string}}>(`/trips/${encodeURIComponent(id)}/cancel`,'POST',{reason}),
 reachStop:(id:string,stops_reached:number)=>request<{trip:Pick<DriverTripDetails,'status'|'stops_reached'>}>(`/trips/${encodeURIComponent(id)}/reach-stop`,'POST',{stops_reached}),
 contact:(id:string)=>request<{phone:string}>(`/trips/${encodeURIComponent(id)}/contact`),
 messages:(id:string,page=1)=>request<{items:TripMessage[];has_more:boolean}>(`/trips/${encodeURIComponent(id)}/messages?page=${page}`),
 markMessagesRead:(id:string,ids:string[])=>request<{updated:number}>(`/trips/${encodeURIComponent(id)}/messages/read`,'POST',{ids}),
 sendMessage:(id:string,message:string)=>request<{message:TripMessage}>(`/trips/${encodeURIComponent(id)}/messages`,'POST',{message}),
 finance:()=>request<DriverFinance>('/finance'),
 reviews:(page:number)=>request<{tags:{tag:string;count:number}[];comments:{id:string;score:number;comment:string;created_at:string}[];has_more:boolean}>(`/reviews?page=${page}`),
 offers:(p:Coordinates)=>request<{vehicle_id:string;items:Offer[]}>(`/offers?lat=${p.lat}&lng=${p.lng}`),
 stopTimes:(id:string,p:Coordinates)=>request<{minutes:(number|null)[];meters?:(number|null)[]}>(`/offers/${id}/stop-times?lat=${p.lat}&lng=${p.lng}`),
 accept:(id:string,vehicle_id:string,point:Coordinates)=>request<{ride:{id:string}}>(`/offers/${id}/accept`,'POST',{vehicle_id,...point}),
 addVehicle:(vehicle:unknown)=>request('/vehicles','POST',vehicle),
 vehicle:(id:string)=>request<{vehicle:VehicleDetails}>(`/vehicles/${encodeURIComponent(id)}`),
 vehicleDocument:(id:string,documentId:string)=>request<{image:string}>(`/vehicles/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}`),
 activate:(id:string)=>request(`/vehicles/${id}/active`,'PUT'),
};
export const errorText=(error:unknown)=>axios.isAxiosError(error)?error.response?.data?.error||'ارتباط با سرور انجام نشد.':error instanceof Error?error.message:'درخواست انجام نشد.';
export const numberFa=(n:number)=>new Intl.NumberFormat('fa-IR').format(n);
export const toman=(rial:string|null)=>rial==null?'تعیین نشده':(BigInt(rial.split('.')[0])/10n).toString()
 .replace(/\B(?=(\d{3})+(?!\d))/g,'٬')
 .replace(/\d/g,digit=>'۰۱۲۳۴۵۶۷۸۹'[Number(digit)])
 .replace(/^-/,'\u200e−');
const tehranDateTime=new Intl.DateTimeFormat('en-GB',{
 timeZone:'Asia/Tehran',year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,
});
export function tripTime(value:string|null){
 const date=new Date(value??NaN);
 if(!Number.isFinite(date.getTime()))return 'زمان مشخص نشده';
 const parts=tehranDateTime.formatToParts(date);
 const part=(type:string)=>parts.find(entry=>entry.type===type)?.value;
 const [year,month,day]=gregorianToJalali(Number(part('year')),Number(part('month')),Number(part('day')));
 return toFa(`${day} ${JALALI_MONTHS[month-1]} ${year}، ${part('hour')}:${part('minute')}`);
}
