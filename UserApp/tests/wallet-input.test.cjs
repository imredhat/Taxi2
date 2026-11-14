const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file,mocks={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:name=>name in mocks?mocks[name]:require(name)});return module.exports;}
function all(n){return Array.isArray(n)?n.flatMap(all):!n||typeof n!=='object'?[]:[n,...all(n.props?.children)];}
test('Wallet groups typed amounts without changing payment units and tabs reset pagination',()=>{
 const state=[];let cursor=0;const calls=[];
 const Wallet=load('src/screens/WalletScreen.tsx',{
 react:{useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],next=>{state[i]=typeof next==='function'?next(state[i]):next;}];}},
 'react-native':{...Object.fromEntries(['Text','TextInput','TouchableOpacity','View'].map(n=>[n,n])),StyleSheet:{create:s=>s}},
 '../components/ScreenPage':{ScreenPage:'ScreenPage',EmptyState:'EmptyState',ui:{}},'../components/ApiFeedback':{__esModule:true,default:'ApiFeedback'},
 '../components/Icon':{Icon:'Icon'},'../theme':{colors:{},fonts:{}},'../services/passenger':{passengerApi:{}},'../services/useRemote':{useRemote:()=>({data:null})},'../utils/display':load('src/utils/display.ts'),
 }).default;
 const render=()=>{cursor=0;return all(Wallet({navigation:{navigate:(...args)=>calls.push(args)}}));};
 const input=()=>render().find(n=>n.type==='TextInput');
 input().props.onChangeText('۱۲۳۴۵۶۷');assert.equal(input().props.value,'1,234,567');
 render().find(n=>n.type==='TouchableOpacity'&&all(n).some(c=>c.props?.children==='ادامه پرداخت')).props.onPress();assert.equal(calls[0][0],'Payment');assert.equal(calls[0][1].amount,'12345670');
 input().props.onChangeText('1,234,56');assert.equal(input().props.value,'123,456');input().props.onChangeText('');assert.equal(input().props.value,'');
 input().props.onChangeText('00012345678901');assert.equal(input().props.value,'1,234,567,890');
 state[0]=3;render().find(n=>n.props?.accessibilityLabel==='پرداخت‌های بانکی').props.onPress();assert.equal(state[0],1);assert.equal(render().find(n=>n.props?.accessibilityLabel==='پرداخت‌های بانکی').props.accessibilityState.selected,true);
});
