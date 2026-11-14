import type { MutableRefObject } from 'react';
import type { Coordinates } from '../../services/neshan';
import type { MapPoint } from '../NeshanMapPicker';

export interface NativeNeshanMapProps {
  points: MapPoint[];
  previousPoints: MapPoint[];
  currentStep: 'start' | 'end';
  onAdd: (point: MapPoint) => void;
  onMove: (id: string, coordinates: Coordinates) => void;
  focusPoint: Coordinates | null;
  currentLocation: Coordinates | null;
  centerRef: MutableRefObject<Coordinates>;
}

export function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') return false;
  const { lat, lng } = value as Coordinates;
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

// Keep data out of executable HTML, even if an address contains markup.
export function serializeMapData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
