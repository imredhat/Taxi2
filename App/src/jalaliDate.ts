const JALALI_LEAP_POSITIONS = [1, 5, 9, 13, 17, 22, 26, 30];

function isJalaliLeapYear(jy: number): boolean {
  return JALALI_LEAP_POSITIONS.includes(((jy - 1) % 33) + 1);
}

function jalaliDaysCount(jy: number, jm: number, jd: number): number {
  let days = 0;
  const fullCycles = Math.floor((jy - 1) / 33);
  const yearInCycle = (jy - 1) % 33;
  days += fullCycles * (33 * 365 + 8);
  for (let i = 0; i < yearInCycle; i++) {
    days += JALALI_LEAP_POSITIONS.includes(i + 1) ? 366 : 365;
  }
  for (let m = 1; m < jm; m++) {
    days += m <= 6 ? 31 : m <= 11 ? 30 : isJalaliLeapYear(jy) ? 30 : 29;
  }
  days += jd - 1;
  return days;
}

// Reference: 1 Farvardin 1379 = 2000-03-20
const REF_GREG = Date.UTC(2000, 2, 20);
const REF_JALALI_DAYS = jalaliDaysCount(1379, 1, 1);

export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const diffDays = (Date.UTC(gy, gm - 1, gd) - REF_GREG) / 86400000;
  const jDays = REF_JALALI_DAYS + diffDays;

  let lo = 1, hi = 3000;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (jalaliDaysCount(mid, 1, 1) <= jDays) lo = mid;
    else hi = mid - 1;
  }
  const jy = lo;
  const remaining = jDays - jalaliDaysCount(jy, 1, 1);

  let accum = 0;
  for (let m = 1; m <= 12; m++) {
    const monthDays = m <= 6 ? 31 : m <= 11 ? 30 : isJalaliLeapYear(jy) ? 30 : 29;
    if (accum + monthDays > remaining) {
      return [jy, m, remaining - accum + 1];
    }
    accum += monthDays;
  }
  return [jy, 12, 30];
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const jDays = jalaliDaysCount(jy, jm, jd);
  const diffDays = jDays - REF_JALALI_DAYS;
  const result = new Date(REF_GREG + diffDays * 86400000);
  return [result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate()];
}

// ── Helpers ──
export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export const toFa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
