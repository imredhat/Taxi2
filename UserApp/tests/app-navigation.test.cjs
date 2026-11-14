const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file,mocks={},globals={}){const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require:name=>name in mocks?mocks[name]:require(name),...globals});return module.exports;}
const packages=load('src/services/packages.ts',{'./api':{},'../utils/tripDateTime':{}});
function storeHarness(submitReservation=async()=>({id:'server-reservation',status:'pending'}),api={}){
 const state=[];let cursor=0;const saved=new Map();
 const react={createContext:()=>({Provider:'Provider'}),useEffect(){},useContext(){},
 useRef(initial){const i=cursor++;if(!(i in state))state[i]={current:initial};return state[i];},
 useState(initial){const i=cursor++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value;}];}};
 const storage={getItem:async key=>saved.get(key)||null,setItem:async(key,value)=>{saved.set(key,value);},removeItem:async key=>{saved.delete(key);}};
 const {AppDataProvider}=load('src/state/AppData.tsx',{react,'../services/api':{API_URL:'http://localhost'},'../services/packages':packages,'../storage':{storage},'../services/devices':{restoreDeviceNotifications:async()=>{},unregisterDeviceNotifications:async()=>{}},'../services/passenger':{passengerApi:{readNotification:async()=>{},readAllNotifications:async()=>{},...api},allPages:load('src/services/passenger.ts',{'./api':{}}).allPages},'../services/reservations':{submitReservation}});
 const render=()=>{cursor=0;return AppDataProvider({children:null}).props.value;};
 return {render,saved};
}
test('Saving, editing and removing drafts updates trips and read/unread activity notices',async()=>{
 const h=storeHarness();await h.render().openAccount('09120000000');
 const input={starts:[{id:'s',lat:35,lng:51}],ends:[{id:'e',lat:36,lng:52}],date:'1405-09-01',time:'09:00',personCount:2,luggageCount:0,bagCount:0,hasAnimals:false,vehicle:'ECO'};
 const id=h.render().saveTrip(input);assert.equal(h.render().data.trips.length,1);assert.equal(h.render().data.notices[0].read,false);
 await h.render().markRead();assert.equal(h.render().data.notices[0].read,true);
 h.render().saveTrip({...input,id,personCount:3});assert.equal(h.render().data.trips.length,1);assert.equal(h.render().data.trips[0].personCount,3);
 h.render().setActivityNotices(false);const count=h.render().data.notices.length;h.render().saveTrip({...input,id});assert.equal(h.render().data.notices.length,count);
 await h.render().removeTrip(id);assert.equal(h.render().data.trips.length,0);
});
test('Switching accounts and logging out do not expose the previous profile or trips',async()=>{
 const h=storeHarness();h.saved.set('passenger:09120000000',JSON.stringify({profile:{name:'مسافر اول'},trips:[],notices:[]}));
 await h.render().openAccount('09120000000');assert.equal(h.render().data.profile.name,'مسافر اول');
 await h.render().openAccount('09350000000');assert.equal(h.render().data.profile.name,'');assert.equal(h.render().data.profile.phone,'09350000000');
 h.render().updateProfile('مسافر دوم');assert.equal(h.render().data.profile.name,'مسافر دوم');
 await h.render().logout();assert.equal(h.render().data.profile.phone,'');assert.equal(h.render().data.trips.length,0);
});
test('Every drawer and bottom-tab destination is registered and has a Persian browser title',()=>{
 const {MENU_ITEMS}=load('src/navigationItems.ts');const {pageTitle}=load('src/navigationTitles.ts');const app=fs.readFileSync(path.join(__dirname,'../App.tsx'),'utf8');
 for(const item of MENU_ITEMS){assert.ok(app.includes(`name="${item.route}"`),item.route);assert.equal(/[a-z]/i.test(pageTitle(item.route)),false);}
 const bottom=fs.readFileSync(path.join(__dirname,'../src/components/BottomNav.tsx'),'utf8');assert.ok(bottom.includes("route: 'Trips'"));assert.ok(!bottom.includes("route: 'Booking'"));
});
test('Hamburger opens and closes, links pages, and keeps account-only destinations out of the guest menu',()=>{
 const {MENU_ITEMS}=load('src/navigationItems.ts');const state=[];let cursor=0;const calls=[];
 const Header=load('src/components/AppHeader.tsx',{
  react:{useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],next=>{state[i]=next;}];}},
  'react-native':{...Object.fromEntries(['View','Text','TouchableOpacity','Modal','Pressable','ScrollView'].map(name=>[name,name])),StyleSheet:{create:value=>value}},
  'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'./Icon':{Icon:'Icon'},'../theme':{colors:{},fonts:{}},'../navigationItems':{MENU_ITEMS},
  '../state/AppData':{useAppData:()=>({data:{profile:{name:'مسافر',phone:'09120000000'},notices:[{read:false}]},logout:async()=>{}})},
  '../utils/tripDateTime':{persianDigits:value=>String(value)},
 }).default;
 const navigation={navigate:(...args)=>calls.push(args),getState:()=>({index:0,routes:[{name:'Home'}]})};
 function all(n){if(Array.isArray(n))return n.flatMap(all);if(!n||typeof n!=='object')return[];if(n.type==='Modal'&&!n.props.visible)return[];return[n,...all(n.props?.children)];}
 const render=guest=>{cursor=0;return all(Header({navigation,guest}));};
 render(false).find(n=>n.props?.accessibilityLabel==='باز کردن منو').props.onPress();
 let nodes=render(false);assert.equal(nodes.find(n=>n.type==='Modal').props.visible,true);
 const wallet=nodes.find(n=>n.type==='TouchableOpacity'&&all(n).some(child=>child.props?.children==='کیف پول'));
 wallet.props.onPress();assert.equal(calls.at(-1)[0],'Wallet');assert.equal(render(false).some(n=>n.type==='Modal'),false);
 render(true).find(n=>n.props?.accessibilityLabel==='باز کردن منو').props.onPress();
 nodes=render(true);assert.equal(nodes.some(n=>n.props?.children==='کیف پول'),false);assert.equal(nodes.some(n=>n.props?.children==='پشتیبانی و راهنما'),true);
 nodes.find(n=>n.props?.accessibilityLabel==='بستن منو').props.onPress();assert.equal(render(true).some(n=>n.type==='Modal'),false);
});

test('Reservations are registered only after server success; failure preserves the draft',async()=>{
 let calls=0;const h=storeHarness(async()=>{calls++;return{id:'server-123',status:'pending'};});await h.render().openAccount('09120000000');
 const input={starts:[],ends:[],date:'1405-09-01',time:'09:00',personCount:1,luggageCount:0,bagCount:0,hasAnimals:false,vehicle:'اکونومی'};
 const id=h.render().saveTrip(input),trip=h.render().data.trips[0];
 await Promise.all([h.render().registerTrip(trip),h.render().registerTrip(trip)]);
 assert.equal(calls,1);assert.equal(h.render().data.trips[0].status,'reserved');assert.equal(h.render().data.trips[0].reservationId,'server-123');
 const failed=storeHarness(async()=>{throw new Error('network');});await failed.render().openAccount('09120000000');failed.render().saveTrip(input);
 await assert.rejects(failed.render().registerTrip(failed.render().data.trips[0]),/network/);
 assert.notEqual(failed.render().data.trips[0].status,'reserved');
});

test('Remote drafts are saved and deleted only after API success, and failures keep local data',async()=>{
 let fail=false,deleted='';
 const h=storeHarness(undefined,{saveDraft:async(id,data)=>{assert.ok(id.startsWith('trip-'));assert.equal(data.personCount,2);if(fail)throw new Error('offline');return{draft:{id:'draft-server'}};},deleteDraft:async id=>{if(fail)throw new Error('offline');deleted=id;}});
 await h.render().openAccount('09120000000');
 const id=h.render().saveTrip({starts:[],ends:[],date:'',time:'',personCount:2,luggageCount:0,bagCount:0,hasAnimals:false,vehicle:''});
 fail=true;await assert.rejects(h.render().syncDraft(h.render().data.trips[0]),/offline/);assert.equal(h.render().data.trips.length,1);
 fail=false;await h.render().syncDraft(h.render().data.trips[0]);assert.equal(h.render().data.trips[0].draftId,'draft-server');
 fail=true;await assert.rejects(h.render().removeTrip(id),/offline/);assert.equal(h.render().data.trips.length,1);
 fail=false;await h.render().removeTrip(id);assert.equal(deleted,'draft-server');assert.equal(h.render().data.trips.length,0);
});

test('Account refresh reads every page and restores cloud drafts without duplicating reserved trips',async()=>{
 let second=false;
 const h=storeHarness(undefined,{
 profile:async()=>({profile:{first_name:'مسافر',phone:'09120000000'}}),preferences:async()=>({preferences:{activity_notifications:true}}),
 reservations:async page=>({reservations:page===1?[{id:'r1',client_reference:'trip-reserved',status:'pending',booking_details:{starts:[],ends:[]}}]:[],limit:1}),
 notifications:async()=>({items:[],limit:20}),
 drafts:async page=>{if(page===2)second=true;return{items:page===1?[{id:'d1',client_reference:'trip-cloud',trip_data:{personCount:3},created_at:'2026-01-01'}]:page===2?[{id:'d2',client_reference:'trip-reserved',trip_data:{},created_at:'2026-01-01'}]:[],limit:1};},
 });
 await h.render().openAccount('09120000000');h.saved.set('auth_token','jwt');await h.render().refresh();
 assert.equal(second,true);assert.equal(h.render().data.trips.length,2);assert.equal(h.render().data.trips.find(x=>x.id==='trip-cloud').draftId,'d1');
});

test('A delayed profile or preference callback cannot update a different account',async()=>{
 const h=storeHarness();await h.render().openAccount('09120000000');const previous=h.render();
 await h.render().openAccount('09350000000');previous.updateProfile('حساب قبلی');previous.setActivityNotices(false);
 assert.equal(h.render().data.profile.name,'');assert.equal(h.render().data.activityNotices,true);
});
