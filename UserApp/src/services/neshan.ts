export const NESHAN_SERVICE_KEY = process.env.EXPO_PUBLIC_NESHAN_SERVICE_KEY || '';
export interface Coordinates { lat: number; lng: number }
export interface PlaceResult extends Coordinates { title: string; address: string }

async function request(path: string, apiToken: string, signal?: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort);
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(`https://api.neshan.org/${path}`, {
      headers: { 'Api-Key': apiToken }, signal: controller.signal,
    });
    if (!response.ok) {
      if ([401, 403, 480, 483, 484, 485].includes(response.status)) {
        throw new Error('دسترسی به سرویس نقشه فعلاً امکان‌پذیر نیست.');
      }
      if ([429, 481, 482].includes(response.status)) {
        throw new Error('تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.');
      }
      throw new Error('اطلاعات نقشه دریافت نشد؛ دوباره تلاش کنید.');
    }
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('دریافت اطلاعات طول کشید؛ دوباره تلاش کنید.');
    if (error instanceof TypeError) throw new Error('ارتباط با سرویس نقشه برقرار نشد؛ اینترنت را بررسی کنید.');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export async function searchPlaces(term: string, center: Coordinates, apiToken: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const data = await request(`v1/search?term=${encodeURIComponent(term)}&lat=${center.lat}&lng=${center.lng}`, apiToken, signal);
  if (!Array.isArray(data.items)) throw new Error('دریافت نتیجه جستجو انجام نشد؛ دوباره تلاش کنید.');
  return data.items.filter((item: any) =>
    Number.isFinite(item.location?.x) && Number.isFinite(item.location?.y),
  ).map((item: any) => ({
    title: item.title || item.address || 'مکان',
    address: item.address || item.region || item.title || '',
    lat: item.location.y, lng: item.location.x,
  }));
}

export async function reverseAddress(point: Coordinates, apiToken: string, signal?: AbortSignal): Promise<string> {
  const data = await request(`v5/reverse?lat=${point.lat}&lng=${point.lng}`, apiToken, signal);
  if (data.status !== 'OK' || !data.formatted_address?.trim()) {
    throw new Error('برای این نقطه آدرسی پیدا نشد؛ دوباره تلاش کنید.');
  }
  return data.formatted_address.trim();
}

export interface RouteEstimate { seconds: number; meters: number }
export async function routeEstimate(points: Coordinates[], apiToken: string, signal?: AbortSignal): Promise<RouteEstimate> {
  if (points.length < 2) throw new Error('ابتدا مبدا و مقصد را انتخاب کنید.');
  const coordinate = (point: Coordinates) => `${point.lat},${point.lng}`;
  let path = `v4/direction?type=car&origin=${encodeURIComponent(coordinate(points[0]))}&destination=${encodeURIComponent(coordinate(points[points.length - 1]))}&alternative=false`;
  if (points.length > 2) path += `&waypoints=${encodeURIComponent(points.slice(1, -1).map(coordinate).join('|'))}`;
  const data = await request(path, apiToken, signal);
  const legs = data.routes?.[0]?.legs;
  if (!Array.isArray(legs) || legs.length === 0 || legs.some((leg: any) =>
    !Number.isFinite(leg.duration?.value) || !Number.isFinite(leg.distance?.value))) {
    throw new Error('زمان مسیر در دسترس نیست؛ دوباره تلاش کنید.');
  }
  return legs.reduce((total: RouteEstimate, leg: any) => ({
    seconds: total.seconds + leg.duration.value, meters: total.meters + leg.distance.value,
  }), { seconds: 0, meters: 0 });
}
