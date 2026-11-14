const {isDepartureOpen}=require('./departureWindow');
const crypto=require('node:crypto');
const {fail}=require('../middleware/passenger');
const {names}=require('./vehiclePackages');
const aliases={tehran:'تهران',isfahan:'اصفهان',esfahan:'اصفهان',shiraz:'شیراز',tabriz:'تبریز',mashhad:'مشهد',qom:'قم',karaj:'کرج',rasht:'رشت',ahvaz:'اهواز',yazd:'یزد',kerman:'کرمان',sari:'ساری'};
const city=value=>{const normalized=String(value||'').trim().toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ');return aliases[normalized]||normalized;};
function validateInput(body){
 if(!Array.isArray(body.starts)||!body.starts.length||!Array.isArray(body.ends)||!body.ends.length)fail(400,'مبدا و مقصد را انتخاب کنید.');
 const points=[...body.starts,...body.ends];
 if(points.length>50||points.some(p=>!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||Math.abs(p.lat)>90||Math.abs(p.lng)>180))fail(400,'نقاط مسیر معتبر نیست.');
 if(!isDepartureOpen(body.scheduledAt))fail(400,'زمان حرکت گذشته است؛ زمان جدیدی انتخاب کنید.');
 if(!Number.isInteger(body.personCount)||body.personCount<1||body.personCount>8)fail(400,'تعداد مسافر معتبر نیست.');
 for(const key of ['luggageCount','bagCount'])if(!Number.isInteger(body[key])||body[key]<0||body[key]>10)fail(400,'تعداد بار معتبر نیست.');
 if(typeof body.hasAnimals!=='boolean'||body.hasAnimals&&(typeof body.animalType!=='string'||!body.animalType.trim()||body.animalType.length>200))fail(400,'اطلاعات حیوان همراه معتبر نیست.');
 return points;
}
function fingerprint(body){return crypto.createHash('sha256').update(JSON.stringify({starts:body.starts.map(p=>[p.lat,p.lng]),ends:body.ends.map(p=>[p.lat,p.lng]),scheduledAt:new Date(body.scheduledAt).toISOString(),personCount:body.personCount,luggageCount:body.luggageCount,bagCount:body.bagCount,hasAnimals:body.hasAnimals,animalType:body.hasAnimals?String(body.animalType||'').trim():''})).digest('hex');}
const matchesClass=(rule,carClass)=>!rule.car_class||rule.car_class==='all'||rule.car_class===carClass;
function scoped(rule,context){return rule.region_matches===true||!!(rule.origin_city&&rule.destination_city&&city(rule.origin_city)===city(context.origin_city)&&city(rule.destination_city)===city(context.destination_city));}
function best(rules){return [...rules].sort((a,b)=>Number(b.multiplier)-Number(a.multiplier)||String(a.id).localeCompare(String(b.id)))[0];}
function rate(value){const valueString=String(value);if(!/^\d+$/.test(valueString))fail(503,'یک نرخ قیمت‌گذاری معتبر نیست؛ تنظیمات ادمین را بررسی کنید.');return BigInt(valueString);}
const round=(numerator,denominator)=>(numerator+denominator/2n)/denominator;
function multiplier(value){const v=Number(value);if(!Number.isFinite(v)||v<=0||v>100)fail(503,'ضریب قیمت‌گذاری معتبر نیست.');return BigInt(Math.round(v*100));}
function calculate(fare,rules,context){
 const warnings=[],breakdown=[];const line=(type,label,amount,rule)=>breakdown.push({type,label,amount:amount.toString(),...(rule?{rule_id:rule.id}: {})});
 const intercity=rules.intercity.filter(r=>r.car_class===fare.car_class&&city(r.origin_city)===city(context.origin_city)&&city(r.destination_city)===city(context.destination_city)).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)))[0];
 const selected=intercity||fare;
 let total=rate(selected.base_fare);line('base',intercity?'نرخ پایه بین‌شهری':'نرخ پایه',total,selected);
 const distance=round(rate(selected.per_km_rate)*BigInt(Math.round(context.meters)),1000n);total+=distance;line('distance','هزینه مسافت',distance,selected);
 const duration=round(rate(fare.per_minute_rate)*BigInt(Math.round(context.seconds)),60n);total+=duration;line('time','هزینه زمان مسیر',duration,fare);
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(context.scheduledAt));
 const part=type=>parts.find(p=>p.type===type).value,day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(part('weekday')),clock=part('hour')+':'+part('minute')+':00';
 const time=best(rules.time.filter(r=>matchesClass(r,fare.car_class)&&(r.day_of_week===null||Number(r.day_of_week)===day)&&r.start_time<=clock&&clock<r.end_time));
 const supply=Number(context.supply[fare.car_class]||0);
 const surge=rules.surge.filter(r=>matchesClass(r,fare.car_class)&&((r.min_drivers!==null&&supply<Number(r.min_drivers))||(Number(r.max_wait_seconds)>0&&Number(context.wait_seconds||0)>=Number(r.max_wait_seconds)))).sort((a,b)=>a.priority-b.priority||String(a.id).localeCompare(String(b.id)))[0];
 const weather=best(rules.weather.filter(r=>matchesClass(r,fare.car_class)&&context.weather_conditions.includes(r.weather_condition)));
 const road=best(rules.road.filter(r=>scoped(r,context)));
 for(const [type,label,rule,factor] of [['time_rule','ضریب زمان حرکت',time,time?.multiplier],['surge','ضریب عرضه راننده',surge,surge?Math.min(Number(surge.multiplier),Number(surge.max_multiplier||surge.multiplier)):1],['weather','ضریب آب‌وهوا',weather,weather?.multiplier],['road','ضریب وضعیت مسیر',road,road?.multiplier]]){
  if(!rule)continue;const after=round(total*multiplier(factor),100n),difference=after-total;total=after;line(type,label,difference,rule);breakdown[breakdown.length-1].multiplier=String(factor);
 }
 const minimum=rate(selected.min_fare||fare.min_fare);if(total<minimum){line('minimum','تکمیل حداقل کرایه',minimum-total);total=minimum;}
 if(fare.max_fare!==null&&fare.max_fare!==undefined){const maximum=rate(fare.max_fare);if(maximum<minimum)fail(503,'حداکثر کرایه از حداقل آن کمتر است.');if(total>maximum){line('maximum','سقف کرایه',maximum-total);total=maximum;}}
 for(const toll of rules.tolls.filter(r=>scoped(r,context))){const amount=rate(toll.amount);total+=amount;line('toll',toll.name_fa||toll.name,amount,toll);}
 const rounded=ceilFare(total);
 if(rounded!==total)line('rounding','گرد کردن رو به بالا',rounded-total);
 total=rounded;
 if(total<=0n||total>999999999999n)fail(503,'مبلغ محاسبه‌شده در محدوده مجاز نیست.');
 if(!context.weather_available&&rules.weather.some(r=>matchesClass(r,fare.car_class)))warnings.push('آب‌وهوای زمان حرکت قابل دریافت نبود؛ تغییر شرایط ممکن است کرایه را تغییر دهد.');
 if(rules.road.some(r=>!r.region&&!r.origin_city&&!r.destination_city))warnings.push('برخی قوانین جاده هنوز به مسیر مشخصی متصل نشده‌اند.');
 if(rules.tolls.some(r=>!r.region&&!r.origin_city&&!r.destination_city))warnings.push('برخی قوانین عوارض هنوز به مسیر مشخصی متصل نشده‌اند.');
 return {amount:total.toString(),breakdown,warnings,intercity_rule_id:intercity?.id||null};
}
function ceilFare(rial){return ((rial+9999n)/10000n)*10000n;}
module.exports={names,city,validateInput,fingerprint,calculate,scoped,ceilFare};
