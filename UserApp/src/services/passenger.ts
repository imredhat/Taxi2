import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './api';
const root = '/api/passenger';
const page = (number = 1) => `?page=${number}&limit=20`;
export const passengerApi = {
 content: (type:'faq'|'about'|'terms'|'page') => apiGet(`${root}/content?type=${type}`,false),
 profile: () => apiGet(`${root}/profile`),
 updateProfile: (data: {first_name?: string;last_name?: string;email?:string|null;gender?:string|null;birth_date?:string|null}) => apiPatch(`${root}/profile`,data),
 wallet: () => apiGet(`${root}/wallet`),
 transactions: (number = 1) => apiGet(`${root}/wallet/transactions${page(number)}`),
 payments: (number = 1) => apiGet(`${root}/payments${page(number)}`),
 payment: (id: string) => apiGet(`${root}/payments/${id}`),
 createPayment: (data: {purpose:'topup'|'ride'|'deposit'|'full';amount?:string;ride_id?:string;request_id?:string;client_reference:string}) => apiPost(`${root}/payments`,data,true),
 verifyPayment: (id:string,sandboxAction?:'complete'|'cancel') => apiPost(`${root}/payments/${id}/verify`,{sandbox_action:sandboxAction},true),
 walletPayment: (tripId:string) => apiPost(`${root}/trips/${tripId}/wallet-payment`,{},true),
 refundRequest: (id:string,reason:string) => apiPost(`${root}/payments/${id}/refund-request`,{reason},true),
 reservations: (number = 1) => apiGet(`${root}/reservations${page(number)}`),
 reservation: (id:string) => apiGet(`${root}/reservations/${id}`),
 cancelReservation: (id:string) => apiPost(`${root}/reservations/${id}/cancel`,{},true),
 trips: (number = 1) => apiGet(`${root}/trips${page(number)}`),
 trip: (id:string) => apiGet(`${root}/trips/${id}`),
 drafts: (number = 1) => apiGet(`${root}/drafts${page(number)}`),
 saveDraft: (client_reference:string,trip_data:Record<string,unknown>) => apiPost(`${root}/drafts`,{client_reference,trip_data},true),
 deleteDraft: (id:string) => apiDelete(`${root}/drafts/${id}`),
 notifications: (number = 1) => apiGet(`${root}/notifications${page(number)}`),
 readNotification: (id:string) => apiPost(`${root}/notifications/${id}/read`,{},true),
 readAllNotifications: () => apiPost(`${root}/notifications/read-all`,{},true),
 preferences: () => apiGet(`${root}/preferences`),
 updatePreferences: (activity_notifications:boolean) => apiPatch(`${root}/preferences`,{activity_notifications}),
 favorites: () => apiGet(`${root}/favorites`),
 saveFavorite: (data:{name:string;address:string;lat:number;lng:number},id?:string) => id?apiPut(`${root}/favorites/${id}`,data):apiPost(`${root}/favorites`,data,true),
 deleteFavorite: (id:string) => apiDelete(`${root}/favorites/${id}`),
 tickets: (number = 1) => apiGet(`${root}/support/tickets${page(number)}`),
 ticket: (id:string,number=1) => apiGet(`${root}/support/tickets/${id}${page(number)}`),
 createTicket: (subject:string,message:string,ride_id?:string) => apiPost(`${root}/support/tickets`,{subject,message,ride_id},true),
 ticketMessage: (id:string,message:string) => apiPost(`${root}/support/tickets/${id}/messages`,{message},true),
 closeTicket: (id:string) => apiPost(`${root}/support/tickets/${id}/close`,{},true),
 registerDevice: (token:string,platform:'android'|'ios'|'web') => apiPost(`${root}/devices`,{token,platform},true),
 removeDevice: (id:string) => apiDelete(`${root}/devices/${id}`),
 rating: (id:string,score:number,comment?:string,tags:string[]=[]) => apiPut(`${root}/trips/${id}/rating`,{score,comment,tags}),
 messages: (id:string,number=1) => apiGet(`${root}/trips/${id}/messages${page(number)}`),
 markMessagesRead: (id:string,ids:string[]) => apiPost(`${root}/trips/${id}/messages/read`,{ids},true),
 sendMessage: (id:string,message:string) => apiPost(`${root}/trips/${id}/messages`,{message},true),
};

// Lists have bounded pages on the server; cached account data must include later pages too.
export async function allPages(load:(number:number)=>Promise<any>,field='items'):Promise<any[]> {
 const items:any[]=[];
 for(let number=1;;number++){
  const result=await load(number);items.push(...result[field]);
  if(result[field].length<(result.limit||20))return items;
 }
}
