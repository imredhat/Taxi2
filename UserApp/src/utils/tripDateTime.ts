import { isValidJalaaliDate, jalaaliMonthLength, toGregorian, toJalaali } from 'jalaali-js';

export const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
export interface JalaliDate { jy: number; jm: number; jd: number }
export const persianDigits = (value: string | number) => String(value).replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
const latinDigits = (value: string) => value.replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
export const padTwo = (value: number) => String(value).padStart(2, '0');

export function currentDeparture(now = new Date()) {
  return {
    date: serializeJalaliDate(todayInTehran(now)),
    time: new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(now),
  };
}

export function todayInTehran(now = new Date()): JalaliDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran', calendar: 'gregory', numberingSystem: 'latn', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return toJalaali(get('year'), get('month'), get('day'));
}

export function parseJalaliDate(value: string): JalaliDate | null {
  const match = latinDigits(value).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  return isValidJalaaliDate(year, month, day) ? { jy: year, jm: month, jd: day } : null;
}

export function serializeJalaliDate(date: JalaliDate): string {
  return `${date.jy}-${padTwo(date.jm)}-${padTwo(date.jd)}`;
}

export function displayJalaliDate(value: string): string {
  const date = parseJalaliDate(value);
  return date ? persianDigits(`${date.jd} ${JALALI_MONTHS[date.jm - 1]} ${date.jy}`) : 'انتخاب تاریخ حرکت';
}

export function departureIso(dateValue:string,time:string):string {
  const date=parseJalaliDate(dateValue);
  if(!date||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('تاریخ و ساعت حرکت را انتخاب کنید.');
  const {gy,gm,gd}=toGregorian(date.jy,date.jm,date.jd);
  const value=new Date(`${gy}-${padTwo(gm)}-${padTwo(gd)}T${time}:00+03:30`).toISOString();
  if(Date.parse(value)<=Date.now()-30*60*1000)throw new Error('زمان حرکت گذشته است؛ زمان جدیدی انتخاب کنید.');
  return value;
}

export function calendarDays(year: number, month: number): (number | null)[] {
  const { gy, gm, gd } = toGregorian(year, month, 1);
  const offset = (new Date(Date.UTC(gy, gm - 1, gd)).getUTCDay() + 1) % 7;
  const count = jalaaliMonthLength(year, month);
  return Array.from({ length: 42 }, (_, index) => index >= offset && index < offset + count ? index - offset + 1 : null);
}
