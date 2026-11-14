import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { persianDigits } from '../../utils/tripDateTime';
import { createNativeMapDocument } from './nativeMapDocument';
import { isCoordinates, serializeMapData, type NativeNeshanMapProps } from './nativeMapBridge';

const MAP_KEY = process.env.EXPO_PUBLIC_NESHAN_MAP_KEY?.trim() || '';
const MAP_BASE_URL = process.env.EXPO_PUBLIC_NESHAN_MAP_BASE_URL?.trim() || 'https://localhost/';

export default function NativeNeshanMap({
  points, previousPoints, onAdd, onMove, currentStep, focusPoint, currentLocation, centerRef,
}: NativeNeshanMapProps) {
  const webView = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [tilesReady, setTilesReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const idSequence = useRef(0);
  const focusState = useRef({ point: focusPoint, revision: focusPoint ? 1 : 0 });
  if (focusState.current.point !== focusPoint) {
    focusState.current = { point: focusPoint, revision: focusState.current.revision + 1 };
  }
  // This source stays stable when points, their addresses, or the step change.
  const source = useMemo(() => ({ html: createNativeMapDocument(MAP_KEY), baseUrl: MAP_BASE_URL }), []);
  const state = {
    points: [
      ...previousPoints.map((point, index) => ({ ...point, color: '#07846c', number: persianDigits(index + 1) })),
      ...points.map((point, index) => ({ ...point, color: currentStep === 'start' ? '#07846c' : '#ff9f1a', number: persianDigits(index + 1) })),
    ],
    focusPoint, currentLocation, focusRevision: focusState.current.revision,
  };
  const serializedState = serializeMapData(state);

  useEffect(() => {
    if (ready) webView.current?.injectJavaScript(`window.updateTaxiMap(${serializedState});true;`);
  }, [ready, serializedState]);

  useEffect(() => {
    if (tilesReady || error || !MAP_KEY.startsWith('web.')) return;
    const timer = setTimeout(() => setError(true), 20000);
    return () => clearTimeout(timer);
  }, [tilesReady, error, attempt]);

  const onMessage = ({ nativeEvent }: WebViewMessageEvent) => {
    let message: Record<string, unknown>;
    try { message = JSON.parse(nativeEvent.data); } catch { return; }
    if (!message || typeof message !== 'object') return;
    if (message.type === 'ready') { setReady(true); return; }
    if (message.type === 'tilesReady') { setTilesReady(true); setError(false); return; }
    if (message.type === 'error') { setError(true); return; }
    if (!isCoordinates(message)) return;
    if (message.type === 'center') centerRef.current = { lat: message.lat, lng: message.lng };
    if (message.type === 'add') {
      onAdd({
        id: `native-${Date.now()}-${++idSequence.current}`, lat: message.lat, lng: message.lng,
        label: `${currentStep === 'start' ? 'مبدا' : 'مقصد'} ${points.length + 1}`,
      });
    }
    if (message.type === 'move' && typeof message.id === 'string' && [...points, ...previousPoints].some(point => point.id === message.id)) {
      onMove(message.id, { lat: message.lat, lng: message.lng });
    }
  };

  if (!MAP_KEY.startsWith('web.')) {
    return <View style={styles.status}><Text style={styles.text}>نمایش نقشه فعلاً در دسترس نیست.</Text></View>;
  }

  return (
    <View style={styles.root}>
      <WebView key={attempt} ref={webView} source={source} style={styles.root}
        originWhitelist={['*']} javaScriptEnabled domStorageEnabled scrollEnabled={false}
        mixedContentMode="never" setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={({ url }) => url === 'about:blank' || url === MAP_BASE_URL}
        onMessage={onMessage} onError={() => setError(true)} onHttpError={() => setError(true)}
        onContentProcessDidTerminate={() => { setReady(false); setError(true); }}
        onRenderProcessGone={() => { setReady(false); setError(true); }} />
      {(!tilesReady || error) && <View style={styles.status}>
        {error ? <>
          <Text style={styles.text}>نقشه بارگذاری نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.retry} onPress={() => {
            setReady(false); setTilesReady(false); setError(false); setAttempt(value => value + 1);
          }}><Text style={styles.retryText}>تلاش مجدد</Text></TouchableOpacity>
        </> : <ActivityIndicator accessibilityLabel="در حال بارگذاری نقشه" color="#07846c"/>}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f7f5' },
  status: { position: 'absolute', top: 80, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14, backgroundColor: '#f4f7f5' },
  text: { fontFamily: 'Estedad-Regular', fontSize: 14, color: '#17212a', textAlign: 'center' },
  retry: { backgroundColor: '#07846c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { fontFamily: 'Estedad-Bold', color: '#ffffff' },
});
