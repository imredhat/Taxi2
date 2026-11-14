const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const {vehiclePackageLabel}=require('../utils/vehicleClasses.js');
function harness(response){
 const adminToken=`header.${Buffer.from(JSON.stringify({userId:'admin-id',role:'admin',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.signature`;
 const storage=new Map([['token',adminToken],['user','{}']]),requests=[];const window={location:{href:''}};
 const context={localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},window,AbortController,FormData,setTimeout,clearTimeout,URLSearchParams,fetch:async(url,options)=>{requests.push({url,options});return typeof response==='function'?response(url,options):response;}};
 const session=vm.runInNewContext(fs.readFileSync(path.join(root,'utils/adminSession.js'),'utf8').replace(/export /g,'')+'\n;({readAdminSession,clearAdminSession})',{...context,atob,Date});
 const useApi=vm.runInNewContext(fs.readFileSync(path.join(root,'composables/useApi.js'),'utf8').replace(/^[\uFEFF]?import [^\n]*\n/gm,'').replace('export const useApi','const useApi')+'\nuseApi',{...context,...session});
 const source=fs.readFileSync(path.join(root,'pages/panel/ride-requests.vue'),'utf8').match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import \{ vehiclePackageLabel \}[^\n]*\n/m,'');
 const state=vm.runInNewContext(source+'\n;({fetchData,items,total,errorMsg,loading,statusFilter,searchQuery,openAssignment,loadDrivers,saveAssignment,openEdit,saveEdit,modal,selectedRequest,drivers,assignment,selectedVehicle,modalError,editForm})',{...context,useApi,vehiclePackageLabel,definePageMeta(){},useHead(){},ref:value=>({value}),computed:fn=>({get value(){return fn();}}),onMounted(){},onBeforeUnmount(){}});
 return{state,requests,window,storage};
}
test('Admin requests include the saved Bearer token and display passenger reservations',async()=>{
 const h=harness({ok:true,status:200,json:async()=>({requests:[{id:'reservation-1',ride_type:'intercity',status:'pending'}],total:1,page:1})});
 h.state.statusFilter.value='pending';h.state.searchQuery.value='مسافر';await h.state.fetchData();
 assert.equal(h.requests[0].options.headers.Authorization,'Bearer '+h.storage.get('admin_token'));assert.ok(h.requests[0].url.includes('status=pending'));assert.equal(h.state.items.value[0].id,'reservation-1');assert.equal(h.state.total.value,1);assert.equal(h.state.errorMsg.value,'');
});
test('Unauthorized and failed responses show an error instead of an empty requests result',async()=>{
 const denied=harness({ok:false,status:401,json:async()=>({error:'نشست منقضی شده'})});await denied.state.fetchData();assert.equal(denied.window.location.href,'/login');assert.equal(denied.storage.has('token'),false);assert.equal(denied.state.errorMsg.value,'نشست منقضی شده');assert.equal(denied.state.loading.value,false);
 const failed=harness({ok:false,status:500,json:async()=>({error:'خطای سرور'})});await failed.state.fetchData();assert.equal(failed.state.errorMsg.value,'خطای سرور');
 const offline=harness(()=>{throw new TypeError('offline');});await offline.state.fetchData();assert.ok(offline.state.errorMsg.value);assert.equal(offline.state.loading.value,false);
});
test('Authenticated panel requests consistently use the shared API client',()=>{
 function check(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){check(file);continue;}if(!file.endsWith('.vue'))continue;const source=fs.readFileSync(file,'utf8');assert.equal(/\bfetch\(/.test(source),false,file);if(/\bapiFetch\(/.test(source))assert.ok(source.includes('useApi()'),file);}}
 check(path.join(root,'pages/panel'));
});


test('Assignment modal loads class-matched drivers and saves the chosen vehicle with concurrency context',async()=>{
 let body;
 const h=harness((url,options)=>{
  if(url.includes('/drivers?'))return{ok:true,status:200,json:async()=>({items:[{driver_id:'driver-a',vehicle_id:'vehicle-a'}],assignment:null,page:1})};
  if(url.endsWith('/assignment')){body=JSON.parse(options.body);return{ok:true,status:201,json:async()=>({ride:{id:'ride-a'}})};}
  return{ok:true,status:200,json:async()=>({requests:[],total:0,page:1})};
 });
 h.state.openAssignment({id:'request-a',car_class:'eco_intercity'});await h.state.loadDrivers();h.state.selectedVehicle.value='vehicle-a';await h.state.saveAssignment();
 assert.equal(body.driver_id,'driver-a');assert.equal(body.vehicle_id,'vehicle-a');assert.equal(body.expected_ride_id,null);assert.equal(h.state.modal.value,'');
});

test('Failed assignment leaves the modal and selection open for correction',async()=>{
 const h=harness((url)=>url.includes('/drivers?')?{ok:true,status:200,json:async()=>({items:[{driver_id:'driver-a',vehicle_id:'vehicle-a'}],assignment:{id:'ride-old',driver_id:'driver-old',vehicle_id:'vehicle-old'},page:1})}:{ok:false,status:409,json:async()=>({error:'راننده سفر دیگری دارد'})});
 h.state.openAssignment({id:'request-a'});await h.state.loadDrivers();h.state.selectedVehicle.value='vehicle-a';await h.state.saveAssignment();
 assert.equal(h.state.modal.value,'assign');assert.equal(h.state.modalError.value,'راننده سفر دیگری دارد');assert.equal(h.state.selectedVehicle.value,'vehicle-a');
});

test('Editing a priced reservation previews the new fare before saving its quote',async()=>{
 const h=harness((url,options)=>{
  if(url.endsWith('/fare-preview'))return{ok:true,status:200,json:async()=>({quoteId:'quote-new',packageId:'fare-new',amount:'500000'})};
  if(options.method==='PATCH')return{ok:true,status:200,json:async()=>({request:{id:'request-a'}})};
  return{ok:true,status:200,json:async()=>({requests:[],total:0,page:1})};
 });
 h.state.openEdit({id:'request-a',passenger_count:1,scheduled_at:new Date(Date.now()+86400000).toISOString(),booking_details:{fare:{amount:'100000'}},edit_version:'v1'});
 h.state.editForm.value.passenger_count=2;await h.state.saveEdit();assert.equal(h.requests.some(r=>r.options.method==='PATCH'),false);assert.equal(h.state.modal.value,'edit');
 await h.state.saveEdit();const patch=h.requests.find(r=>r.options.method==='PATCH');assert.equal(JSON.parse(patch.options.body).quoteId,'quote-new');assert.equal(h.state.modal.value,'');
});
