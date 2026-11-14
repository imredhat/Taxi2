import type { NativeNeshanMapProps } from './nativeMapBridge';

// Metro resolves NativeNeshanMap.native.tsx on Android/iOS. Web uses WebMap.
export default function NativeNeshanMap(_props: NativeNeshanMapProps) {
  return null;
}
