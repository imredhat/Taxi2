const test=require('node:test'),assert=require('node:assert/strict');
const {calculate,city,fingerprint,ceilFare}=require('../app/services/fareCalculator');
const fare={id:'base',car_class:'eco_intercity',base_fare:'1000',per_km_rate:'100',per_minute_rate:'10',min_fare:'1000',max_fare:null};
const context={meters:1000,seconds:600,origin_city:'تهران',destination_city:'اصفهان',scheduledAt:'2026-11-09T06:30:00Z',supply:{economy:0},weather_conditions:['rain'],weather_available:true};
const rules=()=>({intercity:[],time:[],surge:[],weather:[],road:[],tolls:[]});
test('All seven pricing categories produce exact rial amounts and an explainable breakdown',()=>{
 const r=rules();r.intercity=[{id:'inter',car_class:'eco_intercity',origin_city:'Tehran',destination_city:'Isfahan',base_fare:'2000',per_km_rate:'200',min_fare:'2000'}];
 r.time=[{id:'time',car_class:'all',day_of_week:1,start_time:'09:00:00',end_time:'11:00:00',multiplier:'1.20'}];
 r.surge=[{id:'surge',car_class:'eco_intercity',min_drivers:2,max_wait_seconds:300,multiplier:'1.50',max_multiplier:'1.30',priority:1}];
 r.weather=[{id:'weather',car_class:null,weather_condition:'rain',multiplier:'1.25'}];
 r.road=[{id:'road',origin_city:'تهران',destination_city:'اصفهان',multiplier:'1.10'}];
 r.tolls=[{id:'toll',origin_city:'Tehran',destination_city:'Isfahan',amount:'300',name_fa:'عوارض'}];
 const quote=calculate(fare,r,context);assert.equal(quote.amount,'10000');assert.equal(quote.intercity_rule_id,'inter');assert.deepEqual(quote.breakdown.map(line=>line.type),['base','distance','time','time_rule','surge','weather','road','toll','rounding']);assert.equal(quote.breakdown.reduce((sum,line)=>sum+BigInt(line.amount),0n).toString(),quote.amount);
});
test('Unmatched or unscoped toll and road templates never charge unrelated trips; missing weather stays explicit',()=>{
 const r=rules();r.road=[{id:'road',multiplier:'2'}];r.tolls=[{id:'toll',amount:'999',name:'unscoped'},{id:'elsewhere',origin_city:'شیراز',destination_city:'رشت',amount:'999'}];r.weather=[{weather_condition:'snow',multiplier:'2',car_class:'all'}];
 const result=calculate(fare,r,{...context,weather_available:false,weather_conditions:[]});assert.equal(result.amount,'10000');assert.equal(result.warnings.length,3);
});
test('Overlapping category rules do not multiply each other; max and min apply before scoped tolls',()=>{
 const r=rules();r.time=[{id:'one',car_class:'all',day_of_week:1,start_time:'00:00:00',end_time:'23:59:00',multiplier:'2'},{id:'two',car_class:'all',day_of_week:1,start_time:'00:00:00',end_time:'23:59:00',multiplier:'3'}];r.tolls=[{id:'toll',region_matches:true,amount:'100',name:'test'}];
 const result=calculate({...fare,max_fare:'2000'},r,context);assert.equal(result.amount,'10000');assert.equal(result.breakdown.filter(r=>r.type==='time_rule').length,1);assert.equal(result.breakdown.find(r=>r.type==='time_rule').rule_id,'two');
});
test('Trip fingerprints bind stops and departure while ignoring untrusted price and address fields',()=>{
 const input={starts:[{lat:35,lng:51,address:'start'}],ends:[{lat:36,lng:52}],scheduledAt:'2026-11-10T09:00:00Z',personCount:1,luggageCount:0,bagCount:0,hasAnimals:false};
 assert.equal(fingerprint(input),fingerprint({...input,amount:'1',starts:[{lat:35,lng:51,address:'fake'}]}));assert.notEqual(fingerprint(input),fingerprint({...input,personCount:2}));assert.equal(city('Tehran'),'تهران');
});

test('Final fares round upward to 1000 toman, including fractional-toman input',()=>{assert.equal(ceilFare(16467165n),16470000n);assert.equal(ceilFare(16470000n),16470000n);assert.equal(ceilFare(16470001n),16480000n);});
