import { departureIso } from '../utils/tripDateTime';
import type { SavedTrip } from '../state/AppData';
import { apiPost } from './api';
import { reverseAddress, NESHAN_SERVICE_KEY } from './neshan';
export async function submitReservation(trip: SavedTrip): Promise<{ id: string; status: string }> {
  if (!trip.packageId) throw new Error('ابتدا پکیج ناوگان را انتخاب کنید.');
  const scheduledAt = departureIso(trip.date,trip.time);
  if(!trip.quoteId||!trip.quoteExpiresAt||Date.parse(trip.quoteExpiresAt)<=Date.now())throw new Error('برای دریافت قیمت جدید، ویرایش سفر و سپس انتخاب ناوگان را باز کنید.');
  const resolve = async (point: SavedTrip['starts'][number]) => ({ ...point, address: point.address || await reverseAddress(point, NESHAN_SERVICE_KEY) });
  const [starts, ends] = await Promise.all([Promise.all(trip.starts.map(resolve)), Promise.all(trip.ends.map(resolve))]);
  const result = await apiPost('/api/passenger/reservations', { ...trip, starts, ends, clientReference: trip.id, scheduledAt }, true);
  if (typeof result.reservation?.id !== 'string') throw new Error('پاسخ ثبت رزرو معتبر نیست؛ با همین درخواست دوباره تلاش کنید.');
  return result.reservation;
}
