import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Platform } from 'react-native';

const DEFAULT_CENTER = [35.7219, 51.3347]; // [lat, lng] Tehran

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

interface NeshanMapPickerProps {
  points: MapPoint[];
  onPointAdd: (point: MapPoint) => void;
  currentStep: 'start' | 'end';
  apiToken: string;
  height?: number;
}

// Spread pins evenly across visible area
function getPinPos(index: number, total: number, w: number, h: number) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(total * 0.6)));
  const rows = Math.max(1, Math.ceil(total / cols));
  const row = Math.floor(index / cols);
  const col = index % cols;
  return {
    x: Math.max(12, Math.min((col + 0.5) * (w / cols), w - 12)),
    y: Math.max(12, Math.min((row + 0.5) * (h / rows), h - 12)),
  };
}

// ── Search bar overlay ─────────────────────────────────────────────
function SearchOverlay({
  query,
  setQuery,
  count,
  accentColor,
  stepLabel,
  onDone,
}: {
  query: string;
  setQuery: (q: string) => void;
  count: number;
  accentColor: string;
  stepLabel: string;
  onDone: () => void;
}) {
  return (
    <View style={styles.overlayWrapper}>
      {/* Search input */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="جستجوی مکان..."
            placeholderTextColor="rgba(212,196,174,0.4)"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={[styles.doneBtn, count === 0 && styles.doneBtnDisabled]} onPress={onDone} disabled={count === 0}>
          <Text style={styles.doneBtnText}>{count > 0 ? `${count} انتخاب شد` : 'انجام'}</Text>
        </TouchableOpacity>
      </View>
      {/* Step hint */}
      {count === 0 && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>{stepLabel}</Text>
        </View>
      )}
      {count > 0 && (
        <View style={[styles.countBadge, { borderColor: accentColor }]}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <Text style={styles.countText}>{count} نقطه {stepLabel} انتخاب شد</Text>
        </View>
      )}
    </View>
  );
}

// ── Web: Leaflet map ────────────────────────────────────────────
function WebMap({ points, onAdd, currentStep, accentColor }: any) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    import('leaflet').then((m: any) => {
      const L = m;
      if (!mapContainerRef.current || !L) return;
      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
      leafletRef.current = L;
      (mapContainerRef.current as any)._leafletMap = map;

      map.on('click', (e: any) => {
        onAdd({
          id: String(Date.now()),
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          label: `${currentStep === 'start' ? 'مبدأ' : 'مقصد'} ${pointsRef.current.length + 1}`,
        });
      });
    });
    return () => {
      const map = (mapContainerRef.current as any)?._leafletMap;
      if (map) map.remove();
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = (mapContainerRef.current as any)?._leafletMap;
    if (!L || !map) return;
    map.eachLayer((layer: any) => {
      if (layer._pointMarker) map.removeLayer(layer);
    });
    points.forEach((p: MapPoint) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${accentColor};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
      marker._pointMarker = true;
    });
  }, [points, accentColor]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
}

// ── Native: placeholder ─────────────────────────────────────────
function NativeFallback({ points, onAdd, currentStep, height }: any) {
  const accentColor = currentStep === 'start' ? '#ffd899' : '#1e7a65';
  const count = points.length;
  const [size, setSize] = useState({ w: 360, h: 500 });

  return (
    <View
      style={[styles.nativeFallbackWrapper, { height }]}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <View style={styles.fallbackBg} />
      <TouchableOpacity style={styles.overlay} activeOpacity={0.1} onPress={onAdd} />
      {count > 0 && (
        <View style={[styles.countBadge, { borderColor: accentColor }]}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
      {points.map((p: MapPoint, i: number) => {
        const pos = getPinPos(i, count, size.w, size.h);
        return (
          <View key={p.id} style={[styles.pin, { left: pos.x, top: pos.y }]}>
            <View style={[styles.pinRing, { borderColor: accentColor }]}>
              <View style={[styles.pinDot, { backgroundColor: accentColor }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Main component ──────────────────────────────────────────────
export default function NeshanMapPicker({
  points,
  onPointAdd,
  currentStep,
  apiToken,
  height = 400,
}: NeshanMapPickerProps) {
  const nextId = useRef(0);
  const [searchQuery, setSearchQuery] = useState('');
  const accentColor = currentStep === 'start' ? '#ffd899' : '#1e7a65';
  const count = points.length;

  const addPoint = useCallback(
    (point?: MapPoint) => {
      onPointAdd(
        point || {
          id: String(++nextId.current),
          lat: DEFAULT_CENTER[0] + (Math.random() - 0.5) * 0.015,
          lng: DEFAULT_CENTER[1] + (Math.random() - 0.5) * 0.015,
          label: `${currentStep === 'start' ? 'مبدأ' : 'مقصد'} ${points.length + 1}`,
        },
      );
    },
    [onPointAdd, currentStep, points.length],
  );

  const stepLabel = currentStep === 'start' ? 'مبدأ' : 'مقصد';
  const hintLabel = count === 0
    ? `روی نقشه ضربه بزنید تا نقطه ${stepLabel} اضافه شود`
    : `${count} نقطه ${stepLabel} انتخاب شده`;

  return (
    <View style={[styles.container, { height }]}>
      {Platform.OS === 'web' ? (
        <WebMap points={points} onAdd={addPoint} currentStep={currentStep} accentColor={accentColor} />
      ) : (
        <NativeFallback points={points} onAdd={addPoint} currentStep={currentStep} height={height} />
      )}
      <SearchOverlay
        query={searchQuery}
        setQuery={setSearchQuery}
        count={count}
        accentColor={accentColor}
        stepLabel={stepLabel}
        onDone={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', position: 'relative', overflow: 'hidden' },
  // Fallback native
  nativeFallbackWrapper: { width: '100%', position: 'relative', overflow: 'hidden' },
  fallbackBg: { width: '100%', height: '100%', backgroundColor: '#0f222b' },
  overlay: { ...StyleSheet.absoluteFillObject },
  // Overlay (search + done) — zIndex 9999 to sit above Leaflet's canvas/iframe
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
    backgroundColor: 'rgba(3,21,30,0.88)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,216,153,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: { fontSize: 16, marginLeft: 6 },
  searchInput: {
    flex: 1,
    fontFamily: 'Estedad-Regular',
    fontSize: 14,
    color: '#d2e5f2',
    textAlign: 'right',
  },
  doneBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ffd899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnDisabled: { opacity: 0.4 },
  doneBtnText: { fontFamily: 'Estedad-Bold', fontSize: 13, color: '#422c00' },
  hintBar: {
    backgroundColor: 'rgba(3,21,30,0.8)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,216,153,0.2)',
  },
  hintText: { fontFamily: 'Estedad-Regular', fontSize: 13, color: '#d4c4ae', textAlign: 'center' },
  countBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(3,21,30,0.88)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  countText: { fontFamily: 'Estedad-Bold', fontSize: 13, color: '#fff' },
  // Pins (native fallback)
  pin: { position: 'absolute', transform: [{ translateX: -12 }, { translateY: -12 }] },
  pinRing: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  pinDot: { width: 10, height: 10, borderRadius: 5 },
});
