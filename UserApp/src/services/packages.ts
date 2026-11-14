import { apiGet,apiPost } from './api';
import {departureIso} from '../utils/tripDateTime';
export interface FareLine {type:string;label:string;amount:string;rule_id?:string;multiplier?:string}
export interface FarePackage {id:string;car_class:string;city?:string;label?:string;available?:boolean;amount?:string|null;breakdown?:FareLine[];warnings?:string[];base_fare:string;per_km_rate:string;per_minute_rate:string;min_fare:string;max_fare:string|null}
export interface FareQuote {context?:{weather_available:boolean;weather_source:string};quoteId:string;expiresAt:string;packages:FarePackage[];route:{ride_type?:'normal'|'intercity';meters:number;seconds:number;origin_city:string;destination_city:string}}
const names:Record<string,string>={eco_city:'ECO شهری',eco_intercity:'ECO بین‌شهری',eco_plus:'ECO+',vip:'VIP',vip_plus:'VIP+',suv:'SUV',van:'ون'};
const legacyNames:Record<string,string>={eco:'ECO بین‌شهری',economy:'ECO بین‌شهری',comfort:'ECO+',premium:'VIP',اقتصادی:'ECO بین‌شهری',اکونومی:'ECO بین‌شهری',کامفورت:'ECO+',پریمیوم:'VIP'};
export const vehicleClassLabel=(value:string)=>names[value]||legacyNames[value]||value;
export const packageLabel=(fare:FarePackage)=>names[fare.car_class]||fare.label||vehicleClassLabel(fare.car_class);
export const packageIcon=(fare:FarePackage)=>({van:'van-passenger',vip:'car-sports',vip_plus:'car-sports',suv:'car-estate'}[fare.car_class]||'car');
export const packagePrice=(fare:FarePackage)=>fare.amount===undefined||fare.amount===null?null:Number(fare.amount)/10;
export async function passengerPackages():Promise<FarePackage[]>{const result=await apiGet('/api/passenger/packages');if(!Array.isArray(result.packages))throw new Error('پاسخ ناوگان معتبر نیست.');return result.packages.filter((fare:FarePackage)=>Object.hasOwn(names,fare.car_class));}
export async function passengerQuote(trip:any):Promise<FareQuote>{
 const result=await apiPost('/api/passenger/fare-quotes',{starts:trip.starts,ends:trip.ends,scheduledAt:departureIso(trip.date,trip.time),personCount:trip.personCount||1,luggageCount:trip.luggageCount||0,bagCount:trip.bagCount||0,hasAnimals:!!trip.hasAnimals,animalType:trip.animalType||''},true);
 if(!Array.isArray(result.packages)||typeof result.quoteId!=='string'||!Number.isFinite(Date.parse(result.expiresAt)))throw new Error('پاسخ محاسبه قیمت معتبر نیست.');
 return {...result,packages:result.packages.filter((fare:FarePackage)=>Object.hasOwn(names,fare.car_class))};
}
