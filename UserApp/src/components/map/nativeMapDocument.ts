import { serializeMapData } from './nativeMapBridge';

const SDK_ROOT = 'https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8';

export function createNativeMapDocument(mapKey: string): string {
  return `<!DOCTYPE html><html lang="fa"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${SDK_ROOT}/index.css" />
<style>
html,body,#map{height:100%;width:100%;margin:0;background:#f4f7f5;overflow:hidden}
.leaflet-control-zoom a{width:42px!important;height:42px!important;line-height:42px!important;font-size:26px!important}
.leaflet-marker-icon{touch-action:none}
#map>div:has(>a[href*="maps.neshan.org"],>a>img[src*="neshan-pla"]){display:none!important}
.taxi-pin{width:32px;height:32px;box-sizing:border-box;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font:bold 15px sans-serif;box-shadow:0 2px 6px #0006;cursor:grab}
</style></head><body><div id="map"></div><script>
(function(){
  var map, userMarker, markers = new Map(), lastFocusRevision = 0, tilesLoaded = false, tileErrorTimer;
  function send(message){ window.ReactNativeWebView.postMessage(JSON.stringify(message)); }
  function fail(){send({type:'error'});}
  window.addEventListener('error', fail);
  window.initTaxiMap = function(){
    try {
      map = new L.Map('map', {
        key: ${serializeMapData(mapKey)}, maptype:'dreamy', center:[35.7219,51.3347],
        zoom:12, maxZoom:18, zoomControl:false, attributionControl:false, poi:false, traffic:false
      });
      L.control.zoom({position:'bottomright',zoomInText:'+',zoomOutText:'−',
        zoomInTitle:'بزرگ کردن نقشه',zoomOutTitle:'کوچک کردن نقشه'}).addTo(map);
      map.on('click', function(event){send({type:'add',lat:event.latlng.lat,lng:event.latlng.lng});});
      map.on('moveend', function(){var p=map.getCenter();send({type:'center',lat:p.lat,lng:p.lng});});
      // A single failed tile must not hide an otherwise working map.
      function onTileLoad(){
        if(!tilesLoaded){tilesLoaded=true;clearTimeout(tileErrorTimer);send({type:'tilesReady'});}
      }
      function onTileError(){
        if(!tilesLoaded && !tileErrorTimer)tileErrorTimer=setTimeout(function(){if(!tilesLoaded)fail();},8000);
      }
      function watchLayer(layer){
        if(layer.on){layer.on('tileload',onTileLoad);layer.on('tileerror',onTileError);}
      }
      map.eachLayer(watchLayer);
      map.on('layeradd',function(event){watchLayer(event.layer);});
      window.addEventListener('resize',function(){map.invalidateSize();});
      send({type:'ready'});
    } catch(error){fail();}
  };
  window.updateTaxiMap = function(state){
    if(!map)return;
    var ids=new Set(state.points.map(function(p){return p.id;}));
    markers.forEach(function(marker,id){if(!ids.has(id)){map.removeLayer(marker);markers.delete(id);}});
    state.points.forEach(function(point){
      var marker=markers.get(point.id);
      var icon=L.divIcon({className:'',iconSize:[32,32],iconAnchor:[16,16],
        html:'<div class="taxi-pin" style="background:'+point.color+';color:'+(point.color==='#ffd899'?'#422c00':'#fff')+'">'+point.number+'</div>'});
      if(!marker){
        marker=L.marker([point.lat,point.lng],{icon:icon,draggable:true,autoPan:true,bubblingMouseEvents:false}).addTo(map);
        marker.on('dragstart',function(){marker.taxiDragging=true;});
        marker.on('dragend',function(){
          marker.taxiDragging=false;
          var p=marker.getLatLng();send({type:'move',id:point.id,lat:p.lat,lng:p.lng});
        });
        markers.set(point.id,marker);
      }
      if(!marker.taxiDragging){marker.setLatLng([point.lat,point.lng]);marker.setIcon(icon);}
      var element=marker.getElement();if(element)element.title=point.label+(point.address?': '+point.address:'');
    });
    if(state.currentLocation){
      var location=[state.currentLocation.lat,state.currentLocation.lng];
      if(!userMarker)userMarker=L.circleMarker(location,{radius:7,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1,interactive:false}).addTo(map);
      else userMarker.setLatLng(location);
    } else if(userMarker){
      map.removeLayer(userMarker);userMarker=null;
    }
    if(state.focusPoint && state.focusRevision!==lastFocusRevision){
      lastFocusRevision=state.focusRevision;
      map.setView([state.focusPoint.lat,state.focusPoint.lng],16);
    }
  };
})();
</script><script src="${SDK_ROOT}/index.js" onload="initTaxiMap()" onerror="window.ReactNativeWebView.postMessage(JSON.stringify({type:'error'}))"></script></body></html>`;
}
