const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file,mocks={},globals={}){const module={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,require:name=>name in mocks?mocks[name]:require(name),Intl,BigInt,URL,...globals});return module.exports;}
function nodes(n){if(Array.isArray(n))return n.flatMap(nodes);return !n||typeof n!=='object'?[]:[n,...nodes(n.props?.children)];}
function text(n){if(Array.isArray(n))return n.map(text).join('');if(n&&typeof n==='object')return text(n.props?.children);return n??'';}
function screen(file,api,data,params={}){
 const state=[];let cursor=0;const calls=[];
 const react={useState(initial){const i=cursor++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return[state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value;}];},useRef(initial){const i=cursor++;if(!(i in state))state[i]={current:initial};return state[i];},useEffect(){}};
 const display=load('src/utils/display.ts');
 const Component=load(file,{react,'react-native':{Text:'Text',View:'View',TouchableOpacity:'Button',TextInput:'Input',StyleSheet:{create:value=>value},AppState:{addEventListener:()=>({remove(){}})}},'../components/JalaliDatePicker':{__esModule:true,default:'DatePicker'},'../state/AppData':{useAppData:()=>({updateProfile(){}})},'../components/Icon':{Icon:'Icon'},'../theme':{colors:{},fonts:{}},'../components/ScreenPage':{ScreenPage:'Page',EmptyState:'Empty',ui:{}},'../components/ApiFeedback':{default:'Feedback',__esModule:true},'../components/BankCheckout':{default:'Bank',__esModule:true},'../services/useRemote':{useRemote:()=>({data,loading:false,error:'',reload(){},setData(){}})},'../services/passenger':{passengerApi:api},'../utils/display':display,'../utils/tripDateTime':{...load('src/utils/tripDateTime.ts'),persianDigits:String}}).default;
 const navigation={navigate:(...args)=>calls.push(args),push:(...args)=>calls.push(args)};
 const render=()=>{cursor=0;return nodes(Component({navigation,route:{params}}));};
 const button=label=>render().find(n=>n.type==='Button'&&text(n)===label);
 return{render,button,calls};
}
test('Support submits the real ticket payload and opens the returned conversation',async()=>{
 let payload;const h=screen('src/screens/SupportScreen.tsx',{createTicket:async(...args)=>{payload=args;return{ticket:{id:'ticket-123'}};}},{faq:{items:[]},tickets:{items:[]}},{rideId:'ride-1'});
 h.render().find(n=>n.type==='Input'&&n.props.accessibilityLabel==='موضوع درخواست').props.onChangeText('کرایه');
 h.render().find(n=>n.type==='Input'&&n.props.accessibilityLabel==='متن درخواست').props.onChangeText('نیاز به بررسی دارم');
 await h.button('ثبت درخواست').props.onPress();assert.equal(payload[2],'ride-1');assert.equal(payload[0],'کرایه');assert.equal(h.calls[0][0],'Ticket');assert.equal(h.calls[0][1].ticketId,'ticket-123');
});
test('Wallet converts entered Persian toman to exact rial before checkout',()=>{
 const h=screen('src/screens/WalletScreen.tsx',{},null);
 h.render().find(n=>n.type==='Input').props.onChangeText('۱۲۳۴۵۶');h.button('ادامه پرداخت').props.onPress();assert.equal(h.calls[0][1].amount,'1234560');assert.equal(h.calls[0][1].purpose,'topup');
});
test('Trip wallet payment needs explicit confirmation and rating calls the trip API',async()=>{
 let charged=0,rating;const h=screen('src/screens/TrackingScreen.tsx',{walletPayment:async id=>{assert.equal(id,'ride-1');charged++;},rating:async(...args)=>{rating=args;}},{trip:{id:'ride-1',status:'completed',payment_status:'pending',fare:'120000',created_at:'2026-11-08'},items:[]},{rideId:'ride-1'});
 h.button('پرداخت از کیف پول').props.onPress();assert.equal(charged,0);await h.button('تأیید پرداخت').props.onPress();assert.equal(charged,1);
 await h.button('ثبت امتیاز').props.onPress();assert.equal(rating[0],'ride-1');assert.equal(rating[1],5);
});
test('Payment creation retries reuse one reference and backend errors do not fabricate success',async()=>{
 const refs=[];let fail=true;const h=screen('src/screens/PaymentScreen.tsx',{createPayment:async input=>{refs.push(input.client_reference);if(fail)throw new Error('درگاه تنظیم نشده');return{payment:{id:'p1',amount:'1000',status:'pending',redirect:{url:'bank'}}};}},null,{purpose:'topup',amount:'1000'});
 await h.button('ایجاد درخواست پرداخت').props.onPress();assert.ok(h.render().some(n=>n.type==='Feedback'&&n.props.error==='درگاه تنظیم نشده'));assert.equal(h.render().some(n=>n.type==='Bank'),false);
 fail=false;await h.button('ایجاد درخواست پرداخت').props.onPress();assert.equal(refs[0],refs[1]);assert.equal(h.render().some(n=>n.type==='Bank'),true);
});
test('Every passenger client operation has a UI or account-lifecycle caller',()=>{
 const {passengerApi}=load('src/services/passenger.ts',{'./api':{}});
 const roots=['src/screens','src/state','src/components','src/services'];
 const sources=roots.flatMap(root=>fs.readdirSync(path.join(__dirname,'..',root)).filter(name=>/\.tsx?$/.test(name)&&!['passenger.ts'].includes(name)).map(name=>fs.readFileSync(path.join(__dirname,'..',root,name),'utf8'))).join('\n');
 for(const name of Object.keys(passengerApi))assert.ok(sources.includes(`passengerApi.${name}`),`${name} needs a caller`);
});

test('Native notification registration uses the real granted token and removes the account device',async()=>{
 const saved=new Map([['account_phone','0912'],['auth_token','jwt']]);const calls=[];
 const storage={getItem:async key=>saved.get(key)||null,setItem:async(key,value)=>saved.set(key,value),removeItem:async key=>saved.delete(key)};
 const api=load('src/services/devices.native.ts',{'react-native':{Platform:{OS:'android'}},'../storage':{storage},'./passenger':{passengerApi:{registerDevice:async(token,platform)=>{calls.push([token,platform]);return{device:{id:'device-real'}};},removeDevice:async id=>calls.push(id)}},'expo-notifications':{AndroidImportance:{DEFAULT:3},setNotificationChannelAsync:async()=>{},getPermissionsAsync:async()=>({status:'granted'}),getDevicePushTokenAsync:async()=>({data:'real-fcm-token'})}});
 await api.enableDeviceNotifications();assert.equal(calls[0][0],'real-fcm-token');assert.equal(saved.get('push_device_id:0912'),'device-real');await api.unregisterDeviceNotifications();assert.equal(calls[1],'device-real');assert.equal(saved.has('push_device_id:0912'),false);
});

test('Profile uses a birthday picker, saves Gregorian dates and persists selected gender',async()=>{
 let payload;const h=screen('src/screens/ProfileScreen.tsx',{updateProfile:async value=>{payload=value;return{profile:{...value,phone:'09123456789'}};}},{profile:{phone:'09123456789'}});
 h.render().find(n=>n.type==='Input'&&n.props.accessibilityLabel==='نام').props.onChangeText('مینا');
 h.render().find(n=>n.type==='DatePicker').props.onChange('1399-12-30');
 h.render().find(n=>n.props?.accessibilityRole==='radio'&&n.props.accessibilityLabel==='خانم').props.onPress();
 await h.button('ذخیره اطلاعات').props.onPress();assert.equal(payload.gender,'female');assert.equal(payload.birth_date,'2021-03-20');assert.equal(payload.first_name,'مینا');
});
