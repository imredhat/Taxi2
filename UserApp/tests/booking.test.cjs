const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
function load(file, mocks = {}, globals = {}) {
 const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,require:name=>name in mocks?mocks[name]:require(name),setTimeout,clearTimeout,AbortController,Error,TypeError,process:{env:{}},...globals});
 return module.exports;
}
test('Routing preserves all stops and sums every leg duration and distance',async()=>{
 let requested;
 const api=load('src/services/neshan.ts',{}, {fetch:async url=>{
  requested=new URL(url);return {ok:true,json:async()=>({routes:[{legs:[{duration:{value:90},distance:{value:1000}},{duration:{value:100},distance:{value:2000}},{duration:{value:200},distance:{value:3000}}]}]})};
 }});
 const result=await api.routeEstimate([{lat:35,lng:51},{lat:36,lng:52},{lat:37,lng:53},{lat:38,lng:54}],'key');
 assert.equal(requested.pathname,'/v4/direction');
 assert.equal(requested.searchParams.get('origin'),'35,51');
 assert.equal(requested.searchParams.get('destination'),'38,54');
 assert.equal(requested.searchParams.get('waypoints'),'36,52|37,53');
 assert.equal(result.seconds,390);assert.equal(result.meters,6000);
});
const fareRows=['eco_city','eco_intercity','eco_plus','vip','vip_plus','suv','van'].map((car_class,index)=>({id:`fare-${index}`,car_class,amount:'111000',available:true,city:'default',base_fare:'100000',per_km_rate:'10000',per_minute_rate:'1000',min_fare:'100000',max_fare:null}));
const fareHelpers=load('src/services/packages.ts',{'./api':{apiGet:async()=>({packages:fareRows})},'../utils/tripDateTime':{departureIso:()=>"2026-11-10T00:00:00Z"}});
test('Booking shows only first origin and last destination, compact fleet, and read-only passengers',()=>{
 const rn=Object.fromEntries(['View','Text','TouchableOpacity','ScrollView'].map(x=>[x,x]));rn.StyleSheet={create:x=>x};rn.Platform={OS:'web'};
 const Screen=load('src/screens/BookingScreen.tsx',{
  react:{useRef:initial=>({current:initial}),useState:initial=>[Array.isArray(initial)?fareRows:initial,()=>{}],useEffect(){}},'react-native':rn,
  'expo-blur':{BlurView:'BlurView',BlurTargetView:'BlurTargetView'},'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'../components/Icon':{Icon:'Icon'},
  '../components/BottomNav':{__esModule:true,default:'BottomNav'},'../components/PointAddress':{__esModule:true,default:'PointAddress'},
  '../components/LoadingState': { __esModule: true, default: 'LoadingState' },
    '../components/AppHeader':{__esModule:true,default:'AppHeader'},'../state/AppData':{useAppData:()=>({loaded:true,saveTrip:()=> 'trip-test'})},'../storage':{storage:{}},'../theme':{colors:{},fonts:{}},'../services/neshan':{},'../utils/tripDateTime':{displayJalaliDate:x=>x,persianDigits:x=>String(x).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])},'../utils/tripRoute':{},'../services/packages':fareHelpers,
 }).default;
 const starts=[{id:'first'},{id:'second'}], ends=[{id:'third'},{id:'last'}];
 const tree=Screen({route:{params:{starts,ends,personCount:3}},navigation:{}});
 function all(n){if(Array.isArray(n))return n.flatMap(all);if(!n||typeof n!=='object')return [];return [n,...all(n.props?.children)];}
 const nodes=all(tree), addresses=nodes.filter(n=>n.type==='PointAddress');
 assert.ok(nodes.some(n=>n.type==='BlurView'&&n.props.intensity===55));assert.ok(nodes.some(n=>n.type==='LoadingState'&&n.props.label==='در حال دریافت اطلاعات'));
 assert.ok(nodes.some(n=>n.type==='BlurTargetView'&&n.props.importantForAccessibility==='no-hide-descendants'));
 assert.equal(addresses[0].props.point.id,'first');assert.equal(addresses[1].props.point.id,'last');
 assert.equal(nodes.some(n=>n.type==='Image'),false);
 assert.equal(nodes.some(n=>n.type==='ScrollView'&&n.props.horizontal),false);
 assert.equal(nodes.filter(n=>n.props?.accessibilityLabel?.startsWith('انتخاب ')).length,7);
 assert.equal(nodes.some(n=>n.type==='Text'&&['+','-'].includes(n.props.children)),false);
 assert.ok(nodes.some(n=>n.type==='Text'&&all(n).length&&JSON.stringify(n.props.children).includes('۳')));
});
test('Luggage and pet aliases point to glyphs present in the installed font',()=>{
 const glyphs=require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');
 const {Icon}=load('src/components/Icon.tsx',{'@expo/vector-icons/MaterialCommunityIcons':{__esModule:true,default:'Glyph'}});
 for(const name of ['luggage','badge','paw'])assert.ok(glyphs[Icon({name}).props.name],name);
});

test('Passenger packages use the passenger API and rial prices are converted to toman',async()=>{
 assert.equal((await fareHelpers.passengerPackages()).length,7);
 assert.equal(fareHelpers.packagePrice(fareRows[0]),11100);
 assert.equal(fareHelpers.packagePrice({...fareRows[0],amount:null}),null);
});
