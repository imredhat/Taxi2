import type {Coordinates,MapRoute} from '../driverApi';
const sdk='https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8';
const configuredMapKey=process.env.EXPO_PUBLIC_NESHAN_MAP_KEY;
export const mapKey=configuredMapKey?.trim()||'';
const validPoint=([lat,lng]:number[])=>Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
export function offerMapDocument(position:Coordinates|null,offer:MapRoute|undefined,fitRoute:boolean){
 const starts=offer?.starts.map(({lat,lng})=>[lat,lng]).filter(validPoint)||[];
 const ends=offer?.ends.map(({lat,lng})=>[lat,lng]).filter(validPoint)||[];
 const waypoints=offer?.waypoints?.map(({lat,lng})=>[lat,lng]).filter(validPoint)||[];
 const route=offer?.coordinates.map(([lng,lat])=>[lat,lng]).filter(validPoint)||[];
 return `<!doctype html><html lang="fa"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${sdk}/index.css"><style>html,body,#map{margin:0;height:100%;background:#eaf8f4}.stop-pin{display:grid;place-items:center;box-sizing:border-box;border:2px solid white;border-radius:50%;box-shadow:0 2px 7px #10392f55;color:white;font:bold 12px sans-serif}.pickup{background:#08745e}.destination{background:#945411}#map>div:has(>a[href*="maps.neshan.org"],>a>img[src*="neshan-pla"]){display:none!important}#error{position:absolute;inset:0;display:none;place-items:center;font:14px sans-serif;color:#17212a}</style></head><body><div id="map"></div><div id="error">نقشهٔ نشان بارگذاری نشد</div><script>
 function fail(){document.getElementById('error').style.display='grid';}
 function init(){try{
  const driver=${json(position?[position.lat,position.lng]:null)},center=driver||[35.7219,51.3347],starts=${json(starts)},ends=${json(ends)},waypoints=${json(waypoints)},route=${json(route)};
  const map=new L.Map('map',{key:${json(mapKey)},maptype:'dreamy',center,zoom:13,maxZoom:18,poi:false,traffic:false,attributionControl:false});
  let loaded=false; const attach=layer=>{if(layer.on)layer.on('tileload',()=>{loaded=true;document.getElementById('error').style.display='none';});};map.eachLayer(attach);map.on('layeradd',event=>attach(event.layer));setTimeout(()=>{if(!loaded)fail();},12000);
  const activeStopLabel=${json(offer?.activeStopLabel??null)};
  function stopMarker(point,index,pickup){
   const number=(index+1).toLocaleString('fa-IR');
   const icon=L.divIcon({className:'stop-pin '+(pickup?'pickup':'destination'),html:activeStopLabel?'•':number,iconSize:[24,24],iconAnchor:[12,12]});
   L.marker(point,{icon}).addTo(map).bindTooltip(activeStopLabel||((pickup?'مبدأ ':'مقصد ')+number));
  }
  if(route.length>1){
   L.polyline(route,{color:'#fff',weight:9,opacity:.95,interactive:false}).addTo(map);
   L.polyline(route,{color:'#08745e',weight:5,opacity:.95,interactive:false}).addTo(map);
  }
  if(driver){
   L.circleMarker(driver,{radius:14,color:'#2563eb',weight:1,fillColor:'#2563eb',fillOpacity:.16}).addTo(map);
   L.circleMarker(driver,{radius:7,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1}).addTo(map).bindTooltip('موقعیت شما');
  }
  starts.forEach((point,i)=>stopMarker(point,i,true));
  ends.forEach((point,i)=>stopMarker(point,i,false));
  waypoints.forEach((point,i)=>L.circleMarker(point,{radius:7,color:'#fff',weight:2,fillColor:'#617568',fillOpacity:1}).addTo(map).bindTooltip(activeStopLabel||('توقف '+(i+1).toLocaleString('fa-IR'))));
  const points=[...starts,...waypoints,...ends,...route];
  if(${fitRoute}&&points.length){
   if(driver)points.push(driver);
   const bounds=L.latLngBounds(points);
   const container=map.getContainer();
   let lastWidth=0,lastHeight=0;
   const fit=()=>{
    const width=container.clientWidth,height=container.clientHeight;
    if(!width||!height||width===lastWidth&&height===lastHeight)return;
    lastWidth=width;lastHeight=height;
    map.invalidateSize({pan:false});
    map.fitBounds(bounds,{paddingTopLeft:[24,52],paddingBottomRight:[24,24],maxZoom:15,animate:false});
   };
   requestAnimationFrame(fit);
   if(typeof ResizeObserver!=='undefined')new ResizeObserver(fit).observe(container);
  }
 }catch(error){fail();}}
 </script><script src="${sdk}/index.js" onload="init()" onerror="fail()"></script></body></html>`;
}
