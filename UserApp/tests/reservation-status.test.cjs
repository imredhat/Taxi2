const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file,mocks={},globals={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:n=>n in mocks?mocks[n]:require(n),...globals});return module.exports;}
function all(n){return Array.isArray(n)?n.flatMap(all):!n||typeof n!=='object'?[]:[n,...all(n.props?.children)];}
function text(n){return Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):n??'';}
const native={Text:'Text',View:'View',TouchableOpacity:'Button',StyleSheet:{create:s=>s}};
const theme={colors:{},fonts:{}};
const display=load('src/utils/display.ts');
const packages=load('src/services/packages.ts',{'./api':{},'../utils/tripDateTime':{}});
const Status=load('src/components/ReservationStatus.tsx',{'../services/packages':packages,'react-native':native,'./Icon':{Icon:'Icon'},'./LoadingState':{__esModule:true,default:'Radar'},'../theme':theme,'../utils/display':display,'../utils/tripDateTime':{persianDigits:String}}).default;
test('Pending reservations show radar; accepted rides show real driver, vehicle and class; ended rides stop radar',()=>{
 const pending=all(Status({status:'pending',vehicle:'اقتصادی',onTrack(){}}));assert.ok(pending.some(n=>n.type==='Radar'));assert.ok(text(pending).includes('پس از پذیرش'));
 const accepted=all(Status({status:'accepted',ride:{id:'r1',status:'accepted',driver_first_name:'علی',driver_last_name:'رضایی',vehicle_model:'سمند',color:'سفید',license_plate:'12-A-345',car_class:'comfort'},vehicle:'economy',onTrack(){}}));
 for(const value of ['علی رضایی','سمند','سفید','12-A-345','ECO+'])assert.ok(text(accepted).includes(value),value);assert.ok(!accepted.some(n=>n.type==='Radar'));
 for(const status of ['cancelled','expired','completed'])assert.ok(!all(Status({status,vehicle:'economy',onTrack(){}})).some(n=>n.type==='Radar'));
});
test('Reservation follows assigned ride status, polls without clearing content, and stops after leaving',async()=>{
 const callbacks=[];let cleared=false,fetched=0,updated;
 const socket={connected:false,on(){return this;},disconnect(){}};
 const remote={data:{status:'pending',assigned_ride:{id:'ride-1',status:'accepted'}},error:'',loading:false,reload(){},setData:value=>{updated=value;}};
 const trip={id:'trip-1',status:'reserved',serverStatus:'pending',reservationId:'reservation-1',starts:[],ends:[],vehicle:'economy',personCount:1,luggageCount:0,bagCount:0};const effects=[];
 const Screen=load('src/screens/TripDetailsScreen.tsx',{
 react:{useState:x=>[x,value=>{if(value?.reservation)updated=value.reservation;}],useRef:current=>({current}),useEffect:fn=>effects.push(fn)},'react-native':{...native,AppState:{currentState:'active'}},'../services/api':{API_URL:'http://localhost'},'../storage':{storage:{getItem:async()=>null}},'socket.io-client':{io:()=>socket},'@react-navigation/native':{useIsFocused:()=>true},
 '../components/ScreenPage':{ScreenPage:'Page',EmptyState:'Empty',ui:{}},'../components/PointAddress':{__esModule:true,default:'PointAddress'},'../components/ReservationStatus':{__esModule:true,default:'Status'},'../components/Icon':{Icon:'Icon'},'../components/ApiFeedback':{__esModule:true,default:'Feedback'},'../theme':theme,'../utils/display':display,'../utils/tripDateTime':{persianDigits:String,displayJalaliDate:String},
 '../state/AppData':{useAppData:()=>({data:{trips:[trip]}})},'../services/useRemote':{useRemote:()=>remote},'../services/passenger':{passengerApi:{reservation:async id=>{assert.equal(id,'reservation-1');fetched++;return{reservation:{status:'accepted'}};}}},
 },{setTimeout,clearTimeout,setInterval:fn=>{callbacks.push(fn);return 1;},clearInterval:()=>{cleared=true;}}).default;
 const nodes=all(Screen({navigation:{navigate(){}},route:{params:{tripId:'trip-1'}}}));assert.equal(nodes.find(n=>n.type==='Status').props.status,'pending');
 const cleanup=effects[1]();await new Promise(setImmediate);assert.equal(fetched,1);assert.equal(updated.status,'accepted');cleanup();await callbacks[0]();assert.equal(fetched,1);assert.equal(cleared,true);
});

test('Driver contact actions open chat or call only when a valid phone is available',()=>{
 let calls=0,chats=0;const ride={id:'r1',status:'accepted',driver_phone:'09123456789'};
 const buttons=all(Status({status:'accepted',ride,vehicle:'economy',onTrack:()=>chats++,onCall:()=>calls++}));
 buttons.find(n=>n.props?.accessibilityLabel==='گفتگو با راننده').props.onPress();const call=buttons.find(n=>n.props?.accessibilityLabel==='تماس با راننده');assert.equal(call.props.disabled,false);call.props.onPress();assert.equal(chats,1);assert.equal(calls,1);
 for(const phone of [null,'','*123#']){const nodes=all(Status({status:'accepted',ride:{...ride,driver_phone:phone},vehicle:'economy',onTrack(){},onCall(){}}));assert.equal(nodes.find(n=>n.props?.accessibilityLabel==='شماره تماس راننده در دسترس نیست').props.disabled,true);}
});
