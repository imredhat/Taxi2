const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function all(n){return Array.isArray(n)?n.flatMap(all):!n||typeof n!=='object'?[]:[n,...all(n.props?.children)];}
function text(n){return Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):n??'';}
function harness(sendMessage,status='accepted'){
 const state=[];let cursor=0;
 const remote={data:{trip:{id:'r1',status,driver_first_name:'علی',pickup_address:'hidden origin',fare:100000},items:[{id:'m1',message:'سلام، در خدمتم',created_at:'2026-11-09T10:00:00Z',is_mine:false}]},loading:false,error:'',reload(){},setData(next){this.data=typeof next==='function'?next(this.data):next;}};
 const mocks={react:{useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],value=>state[i]=typeof value==='function'?value(state[i]):value];},useRef(initial){const i=cursor++;if(!(i in state))state[i]={current:initial};return state[i];},useEffect(){}},
 'react-native':{...Object.fromEntries(['KeyboardAvoidingView','ScrollView','Text','TextInput','TouchableOpacity','View'].map(n=>[n,n])),StyleSheet:{create:s=>s},Platform:{OS:'web'}},'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@react-navigation/native':{useIsFocused:()=>true},'../components/Icon':{Icon:'Icon'},'../components/ApiFeedback':{__esModule:true,default:'Feedback'},'../services/useRemote':{useRemote:()=>remote},'../services/passenger':{passengerApi:{sendMessage}},'../theme':{colors:{},fonts:{},ltrLayout:{}}};
 const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/screens/DriverChatScreen.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:n=>n in mocks?mocks[n]:require(n),Error});
 const render=()=>{cursor=0;return all(module.exports.default({navigation:{goBack(){},navigate(){}},route:{params:{rideId:'r1'}}}));};
 return{render,remote,input:()=>render().find(n=>n.type==='TextInput'),send:()=>render().find(n=>n.props?.accessibilityLabel==='ارسال پیام')};
}
test('Driver chat shows messages without trip details and appends a confirmed outgoing message once',async()=>{
 let calls=0,resolve;const h=harness(async(id,body)=>{calls++;assert.equal(id,'r1');assert.equal(body,'سلام');return await new Promise(r=>resolve=r);});
 assert.ok(text(h.render()).includes('سلام، در خدمتم'));assert.ok(!text(h.render()).includes('hidden origin'));assert.ok(!text(h.render()).includes('100000'));
 h.input().props.onChangeText(' سلام ');const first=h.send().props.onPress();await h.send().props.onPress();assert.equal(calls,1);assert.equal(h.send().props.disabled,true);
 resolve({message:{id:'m2',message:'سلام',created_at:'2026-11-09T10:01:00Z'}});await first;
 assert.equal(h.input().props.value,'');assert.equal(h.remote.data.items.length,2);assert.equal(h.remote.data.items[1].is_mine,true);
});
test('Failed sends retain the draft; completed conversations stay readable but cannot send',async()=>{
 const failed=harness(async()=>{throw new Error('offline');});failed.input().props.onChangeText('پیام من');await failed.send().props.onPress();assert.equal(failed.input().props.value,'پیام من');assert.equal(failed.remote.data.items.length,1);assert.ok(failed.render().some(n=>n.props?.accessibilityRole==='alert'&&n.props.children==='offline'));
 let calls=0;const closed=harness(async()=>{calls++;},'completed');closed.input().props.onChangeText('پیام');await closed.send().props.onPress();assert.equal(calls,0);assert.equal(closed.input().props.editable,false);assert.ok(text(closed.render()).includes('سلام، در خدمتم'));
});
