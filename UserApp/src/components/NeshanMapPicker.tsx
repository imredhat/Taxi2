import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Text, TextInput, Platform, ScrollView, Keyboard } from 'react-native';

import { Coordinates, PlaceResult, searchPlaces, reverseAddress } from '../services/neshan';
import NativeNeshanMap from './map/NativeNeshanMap';
import { isCoordinates } from './map/nativeMapBridge';
import { persianDigits } from '../utils/tripDateTime';
import { Icon } from './Icon';
import { useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';

const DEFAULT_CENTER = [35.7219, 51.3347]; // [lat, lng] Tehran

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  address?: string;
  addressStatus?: 'loading' | 'ready' | 'error';
  addressError?: string;
}

interface NeshanMapPickerProps {
  points: MapPoint[];
  onPointAdd: (point: MapPoint) => void;
  onPointUpdate: (id: string, patch: Partial<MapPoint>, expectedCoordinates?: Coordinates) => void;
  currentStep: 'start' | 'end';
  apiToken: string;
  height?: number;
  previousPoints?: MapPoint[];
  focusCoordinates?: Coordinates | null;
}

// ── Web: Leaflet map ────────────────────────────────────────────
function WebMap({ points, previousPoints, onAdd, currentStep, accentColor, focusPoint, currentLocation, centerRef, onMove }: any) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const selectionRef = useRef({ onAdd, onMove, currentStep });
  selectionRef.current = { onAdd, onMove, currentStep };
  const locationMarker = useRef<any>(null);
  const markersRef = useRef(new Map<string, any>());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    const container = mapContainerRef.current;
    import('leaflet').then((m: any) => {
      const L = m;
      if (disposed || !container || !L) return;
      const map = L.map(container, {
        center: DEFAULT_CENTER,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
      L.control.zoom({
        position: 'bottomright',
        zoomInText: '+',
        zoomOutText: '−',
        zoomInTitle: 'بزرگ کردن نقشه',
        zoomOutTitle: 'کوچک کردن نقشه',
      }).addTo(map);
      leafletRef.current = L;
      (mapContainerRef.current as any)._leafletMap = map;

      map.on('moveend', () => {
        const center = map.getCenter();
        centerRef.current = { lat: center.lat, lng: center.lng };
      });
      map.on('click', (e: any) => {
        selectionRef.current.onAdd({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          label: `${selectionRef.current.currentStep === 'start' ? 'مبدأ' : 'مقصد'} ${pointsRef.current.length + 1}`,
        });
      });
      setReady(true);
      const observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(container);
      (container as any)._resizeObserver = observer;
    });
    return () => {
      disposed = true;
      (container as any)?._resizeObserver?.disconnect();
      const map = (container as any)?._leafletMap;
      if (map) map.remove();
      markersRef.current.clear();
      locationMarker.current=null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = (mapContainerRef.current as any)?._leafletMap;
    if (!L || !map) return;
    const ids = new Set([...previousPoints, ...points].map((point: MapPoint) => point.id));
    markersRef.current.forEach((marker, id) => {
      if (!ids.has(id)) { map.removeLayer(marker); markersRef.current.delete(id); }
    });
    [...previousPoints.map((p: MapPoint, index: number) => ({ point: p, color: '#07846c', number: index + 1 })),
      ...points.map((p: MapPoint, index: number) => ({ point: p, color: accentColor, number: index + 1 }))].forEach(({ point: p, color, number }) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${persianDigits(number)}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      let marker = markersRef.current.get(p.id);
      if (!marker) {
        marker = L.marker([p.lat, p.lng], { icon, draggable: true, autoPan: true, bubblingMouseEvents: false }).addTo(map);
        marker.on('dragstart', () => { marker._dragging = true; });
        marker.on('dragend', () => {
          marker._dragging = false;
          const position = marker.getLatLng();
          selectionRef.current.onMove(p.id, { lat: position.lat, lng: position.lng });
        });
        markersRef.current.set(p.id, marker);
      }
      if (!marker._dragging) {
        marker.setLatLng([p.lat, p.lng]);
        marker.setIcon(icon);
      }
      const element = marker.getElement();
      if (element) element.title = `${p.label}${p.address ? `: ${p.address}` : ''} — برای جابه‌جایی بکشید`;
    });
  }, [points, previousPoints, accentColor, ready]);

  useEffect(() => {
    const map = (mapContainerRef.current as any)?._leafletMap;
    if (map && focusPoint) map.setView([focusPoint.lat, focusPoint.lng], 16);
  }, [focusPoint, ready]);

  useEffect(() => {
    const map=(mapContainerRef.current as any)?._leafletMap;
    const L=leafletRef.current;
    if(!map||!L)return;
    if(!currentLocation){
      if(locationMarker.current)map.removeLayer(locationMarker.current);
      locationMarker.current=null;
      return;
    }
    const coordinates=[currentLocation.lat,currentLocation.lng];
    if(locationMarker.current)locationMarker.current.setLatLng(coordinates);
    else locationMarker.current=L.circleMarker(coordinates,{
      radius:7,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1,interactive:false,
    }).addTo(map);
  },[currentLocation,ready]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
}

// ── Main component ──────────────────────────────────────────────
export default function NeshanMapPicker({
  points, onPointAdd, onPointUpdate, currentStep, apiToken, height, previousPoints = [], focusCoordinates,
}: NeshanMapPickerProps) {
  const centerRef = useRef<Coordinates>({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] });
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [focusPoint, setFocusPoint] = useState<Coordinates | null>(null);
  const accentColor = currentStep === 'start' ? '#07846c' : '#ff9f1a';

  const focused=useIsFocused();
  const [currentLocation,setCurrentLocation]=useState<Coordinates|null>(null);
  const [locating,setLocating]=useState(false);
  const [locationError,setLocationError]=useState('');
  const mounted=useRef(false), initialLocate=useRef(false), locatingRef=useRef(false), cameraIntent=useRef(0);
  const selection=useRef({currentStep,hasPoints:points.length>0});
  selection.current={currentStep,hasPoints:points.length>0};
  useEffect(()=>{
    mounted.current=true;
    return()=>{mounted.current=false;};
  },[]);
  const locate=useCallback(async(manual:boolean)=>{
    if(locatingRef.current)return;
    locatingRef.current=true;
    setLocating(true);
    setLocationError('');
    const intent=++cameraIntent.current;
    const centerAtStart={...centerRef.current};
    let timer:ReturnType<typeof setTimeout>|undefined;
    try{
      let permission=await Location.getForegroundPermissionsAsync();
      if(!permission.granted&&permission.canAskAgain)permission=await Location.requestForegroundPermissionsAsync();
      if(!permission.granted)throw new Error('دسترسی موقعیت را در تنظیمات دستگاه فعال کنید.');
      if(Platform.OS!=='web'&&!await Location.hasServicesEnabledAsync())throw new Error('موقعیت مکانی دستگاه را روشن کنید.');
      let fix:Location.LocationObject|null;
      try{
        fix=await Promise.race([
          Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High}),
          new Promise<null>(resolve=>{timer=setTimeout(()=>resolve(null),12000);}),
        ]);
      }catch{fix=null;}
      if(!fix&&Platform.OS!=='web'){
        fix=await Location.getLastKnownPositionAsync({maxAge:120000,requiredAccuracy:250});
      }
      if(!fix)throw new Error('موقعیت فعلی دریافت نشد. دوباره تلاش کنید.');
      if(!mounted.current)return;
      const coordinates={lat:fix.coords.latitude,lng:fix.coords.longitude};
      if(!isCoordinates(coordinates))throw new Error('موقعیت فعلی دریافت نشد.');
      setCurrentLocation(coordinates);
      const cameraUnmoved=Math.abs(centerAtStart.lat-centerRef.current.lat)<0.0001
        &&Math.abs(centerAtStart.lng-centerRef.current.lng)<0.0001;
      if(intent===cameraIntent.current&&(manual||cameraUnmoved&&selection.current.currentStep==='start'&&!selection.current.hasPoints)){
        centerRef.current=coordinates;
        setFocusPoint(coordinates);
      }
    }catch(error){
      if(mounted.current&&manual)setLocationError(error instanceof Error?error.message:'موقعیت فعلی دریافت نشد.');
    }finally{
      clearTimeout(timer);
      locatingRef.current=false;
      if(mounted.current)setLocating(false);
    }
  },[]);
  useEffect(()=>{
    if(!focused||currentStep!=='start'||points.length||focusCoordinates||initialLocate.current)return;
    initialLocate.current=true;
    void locate(false);
  },[focused,currentStep,points.length,focusCoordinates,locate]);

  useEffect(() => { setSearchQuery(''); }, [currentStep]);
  useEffect(() => {
    if (!focusCoordinates) return;
    ++cameraIntent.current;
    centerRef.current = focusCoordinates;
    setFocusPoint(focusCoordinates);
  }, [focusCoordinates]);

  useEffect(() => {
    const term = searchQuery.trim();
    const controller = new AbortController();
    setResults([]);
    setSearchError('');
    setSearching(term.length >= 2);
    if (term.length < 2) return () => controller.abort();
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(term, centerRef.current, apiToken, controller.signal);
        if (!controller.signal.aborted) setResults(places);
      } catch (error) {
        if (!controller.signal.aborted) setSearchError(error instanceof Error ? error.message : 'جستجو ناموفق بود.');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery, apiToken, searchAttempt]);

  const addPoint = useCallback((point: MapPoint) => {
    ++cameraIntent.current;
    // Add immediately so multiple clicks retain their order while addresses load.
    onPointAdd({ ...point, addressStatus: 'loading' });
    reverseAddress(point, apiToken).then(address => {
      onPointUpdate(point.id, { address, addressStatus: 'ready', addressError: undefined }, point);
    }).catch(error => {
      onPointUpdate(point.id, {
        addressStatus: 'error', addressError: error instanceof Error ? error.message : 'دریافت آدرس ناموفق بود.',
      }, point);
    });
  }, [onPointAdd, onPointUpdate, apiToken]);

  const movePoint = useCallback((id: string, coordinates: Coordinates) => {
    onPointUpdate(id, { ...coordinates, address: undefined, addressStatus: 'loading', addressError: undefined });
    reverseAddress(coordinates, apiToken).then(address => {
      onPointUpdate(id, { address, addressStatus: 'ready', addressError: undefined }, coordinates);
    }).catch(error => {
      onPointUpdate(id, {
        addressStatus: 'error', addressError: error instanceof Error ? error.message : 'دریافت آدرس ناموفق بود.',
      }, coordinates);
    });
  }, [onPointUpdate, apiToken]);

  const selectResult = (place: PlaceResult) => {
    ++cameraIntent.current;
    setFocusPoint({ lat: place.lat, lng: place.lng });
    centerRef.current = { lat: place.lat, lng: place.lng };
    setSearchQuery('');
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, height === undefined ? { flex: 1 } : { height }]}>
      {Platform.OS === 'web' ? (
        <WebMap previousPoints={previousPoints} points={points} onAdd={addPoint} currentStep={currentStep}
          accentColor={accentColor} focusPoint={focusPoint} currentLocation={currentLocation} centerRef={centerRef} onMove={movePoint} />
      ) : (
        <NativeNeshanMap points={points} previousPoints={previousPoints} currentStep={currentStep}
          onAdd={addPoint} onMove={movePoint} focusPoint={focusPoint} currentLocation={currentLocation} centerRef={centerRef} />
      )}
      <View style={styles.overlayWrapper}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Icon name="search" size={19} color="#086d58"/>
            <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery}
              accessibilityLabel={currentStep === 'start' ? 'جستجوی مبدأ' : 'جستجوی مقصد'}
              placeholder={currentStep === 'start' ? 'مبدأ حرکتت کجاست؟ جستجو کن' : 'جستجوی شهر، خیابان یا مقصد'} placeholderTextColor="#71817d"
              autoCorrect={false} autoCapitalize="none" returnKeyType="search"
              onSubmitEditing={() => setSearchAttempt(value => value + 1)} />
            {searchQuery.length > 0 && <TouchableOpacity accessibilityLabel="پاک کردن جستجو" onPress={() => setSearchQuery('')}>
              <Text style={styles.countText}>×</Text>
            </TouchableOpacity>}
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="موقعیت فعلی من" accessibilityState={{busy:locating,disabled:locating}} disabled={locating}
            style={styles.locateButton} onPress={()=>void locate(true)}>
            {locating?<ActivityIndicator size="small" color="#086d58"/>:<Icon name="crosshairs-gps" size={21} color="#086d58"/>}
          </TouchableOpacity>
        </View>
        {!!locationError&&<Text accessibilityRole="alert" style={styles.locationError}>{locationError}</Text>}
        {searchQuery.trim().length >= 2 && <View style={styles.results}>
          {searching ? <Text style={styles.hintText}>در حال جستجو...</Text>
            : searchError ? <TouchableOpacity onPress={() => setSearchAttempt(value => value + 1)}>
              <Text style={styles.hintText}>{searchError} برای تلاش مجدد بزنید.</Text>
            </TouchableOpacity>
            : results.length === 0 ? <Text style={styles.hintText}>مکانی پیدا نشد.</Text>
            : <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
              {results.map((place, index) => <TouchableOpacity key={`${place.lat}-${place.lng}-${index}`}
                style={styles.resultRow} onPress={() => selectResult(place)}>
                <Text style={styles.countText}>{persianDigits(place.title)}</Text>
                <Text style={styles.hintText}>{persianDigits(place.address)}</Text>
              </TouchableOpacity>)}
            </ScrollView>}
        </View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  results: { backgroundColor: '#ffffff', borderRadius: 12, padding: 10 },
  resultRow: { paddingVertical: 10, gap: 4, borderBottomWidth: 1, borderBottomColor: '#e1ebe7' },
  container: { width: '100%', position: 'relative', overflow: 'hidden' },
  // Search stays above both map implementations.
  overlayWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 9999,
  },
  searchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 13,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#e1ebe7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  locateButton:{width:44,height:44,borderRadius:13,alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderWidth:1,borderColor:'#dbe7df'},
  locationError:{fontFamily:'Estedad-Medium',fontSize:11,color:'#9d291e',textAlign:'right',backgroundColor:'#fff',borderRadius:8,padding:7},
  searchInput: {
    flex: 1,
    fontFamily: 'Estedad-Regular',
    fontSize: 14,
    color: '#17212a',
    textAlign: 'right',
  },
  hintText: { fontFamily: 'Estedad-Regular', fontSize: 13, color: '#71817d', textAlign: 'center' },
  countText: { fontFamily: 'Estedad-Bold', fontSize: 13, color: '#17212a' },
});
