const {fail}=require('../middleware/passenger');
const {city}=require('./fareCalculator');
async function get(url,headers={}){
 const response=await fetch(url,{headers,signal:AbortSignal.timeout(12000),redirect:'error'});if(!response.ok)throw new Error('Provider unavailable');return response.json();
}
function decodePolyline(encoded){let index=0,lat=0,lng=0;const points=[];while(index<encoded.length){const read=()=>{let result=0,shift=0,byte;do{if(index>=encoded.length||shift>30)throw new Error('Invalid route geometry');byte=encoded.charCodeAt(index++)-63;result|=(byte&31)<<shift;shift+=5;}while(byte>=32);return result&1?~(result>>1):result>>1;};lat+=read();lng+=read();points.push([lng/1e5,lat/1e5]);}return points;}
async function reverse(point,key){const data=await get(`https://api.neshan.org/v5/reverse?lat=${point.lat}&lng=${point.lng}`,{'Api-Key':key});if(data.status!=='OK'||!data.city)throw new Error('City unavailable');return data.city;}
function weatherConditions(code,temp){const values=[];if([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code))values.push('rain');if([65,67,82,95,96,99].includes(code))values.push('heavy_rain');if([71,73,75,77,85,86].includes(code))values.push('snow');if([45,48].includes(code))values.push('fog');if(temp>=40)values.push('extreme_heat');return values;}
async function forecast(points,scheduledAt){
 if(Date.parse(scheduledAt)>Date.now()+15*86400000)return{available:false,conditions:[]};
 const sample=[points[0],points[points.length-1]],hour=Math.floor(Date.parse(scheduledAt)/3600000)*3600;
 const endpoint=process.env.WEATHER_FORECAST_URL||'https://api.open-meteo.com/v1/forecast';
 const url=new URL(endpoint);if(url.protocol!=='https:')throw new Error('HTTPS weather provider required');
 url.search=new URLSearchParams({latitude:sample.map(p=>p.lat).join(','),longitude:sample.map(p=>p.lng).join(','),hourly:'weather_code,temperature_2m',forecast_days:'16',timeformat:'unixtime',timezone:'UTC',...(process.env.WEATHER_FORECAST_KEY?{apikey:process.env.WEATHER_FORECAST_KEY}:{})}).toString();
 const result=await get(url),locations=Array.isArray(result)?result:[result],conditions=[];
 if(locations.length!==2)throw new Error('Incomplete forecast');
 for(const location of locations){const index=location.hourly?.time?.indexOf(hour);if(index===undefined||index<0||!Number.isFinite(location.hourly.weather_code[index]))throw new Error('Forecast unavailable');conditions.push(...weatherConditions(location.hourly.weather_code[index],location.hourly.temperature_2m[index]));}
 return{available:true,conditions:[...new Set(conditions)]};
}
function directions(points,key){
 const coord=p=>`${p.lat},${p.lng}`;
 const query=new URLSearchParams({type:'car',origin:coord(points[0]),destination:coord(points.at(-1)),alternative:'false'});
 if(points.length>2)query.set('waypoints',points.slice(1,-1).map(coord).join('|'));
 return get(`https://api.neshan.org/v4/direction?${query}`,{'Api-Key':key});
}
exports.stopTimes=async(points)=>{
 const key=process.env.NESHAN_SERVICE_KEY;
 if(!key)fail(503,'سرویس اطلاعات مسیر فعلاً در دسترس نیست.');
 try{
  const data=await directions(points,key);
  const legs=data.routes?.[0]?.legs;
  if(!Array.isArray(legs)||legs.length!==points.length-1)throw new Error('Incomplete route');
  const minutes=[], meters=[];
  for(const leg of legs){
   const seconds=leg.duration?.value, distance=leg.distance?.value;
   if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(distance)||distance<0)throw new Error('Invalid route metrics');
   minutes.push(Math.ceil(seconds/60));
   meters.push(distance);
  }
  return {minutes,meters};
 }catch{
  fail(502,'زمان توقف‌ها از نشان دریافت نشد.');
 }
};
exports.route=async(points,scheduledAt)=>{
 const key=process.env.NESHAN_SERVICE_KEY;if(!key)fail(503,'سرویس اطلاعات مسیر فعلاً در دسترس نیست.');
 try{
 const [data,origin,destination,weather]=await Promise.all([directions(points,key),reverse(points[0],key),reverse(points[points.length-1],key),forecast(points,scheduledAt).catch(()=>({available:false,conditions:[]}))]);
 let sameCity=city(origin)===city(destination);
 if(sameCity&&points.length>2){
  const endpointKeys=new Set([points[0],points.at(-1)].map(p=>`${p.lat},${p.lng}`));
  const intermediate=[...new Map(points.slice(1,-1).map(p=>[`${p.lat},${p.lng}`,p])).entries()]
   .filter(([pointKey])=>!endpointKeys.has(pointKey)).map(([,point])=>point);
  const cities=await Promise.all(intermediate.map(point=>reverse(point,key).catch(()=>null)));
  sameCity=cities.every(value=>value&&city(value)===city(origin));
 }
 const route=data.routes?.[0],legs=route?.legs;
 if(!Array.isArray(legs)||!legs.length||legs.some(l=>!Number.isFinite(l.distance?.value)||l.distance.value<0||!Number.isFinite(l.duration?.value)||l.duration.value<=0))throw new Error('Invalid route');
 const geometry=typeof route.overview_polyline==='string'?route.overview_polyline:route.overview_polyline?.points;
 const coordinates=geometry?decodePolyline(geometry):[];
 return{sameCity,legs:legs.map(leg=>({meters:leg.distance.value,seconds:leg.duration.value})),meters:Math.round(legs.reduce((n,l)=>n+l.distance.value,0)),seconds:Math.round(legs.reduce((n,l)=>n+l.duration.value,0)),origin_city:origin,destination_city:destination,weather_available:weather.available,weather_conditions:weather.conditions,geometry:coordinates.length>1?{type:'LineString',coordinates}:null,polyline:geometry||null,scheduledAt};
 }catch(error){if(error.status)throw error;fail(502,'دریافت اطلاعات مسیر انجام نشد؛ دوباره تلاش کنید.');}
};
exports.weatherConditions=weatherConditions;exports.decodePolyline=decodePolyline;
