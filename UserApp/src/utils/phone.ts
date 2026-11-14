export function mobileDigits(value: string): string {
  const digits = value.replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632)).replace(/[^0-9]/g, '');
  return digits.replace(/^(0098|98)(?=9[0-9]{9}$)/, '').replace(/^0/, '').slice(0, 10);
}
export function domesticMobile(value: string): string | null {
  return /^9[0-9]{9}$/.test(value) ? `0${value}` : null;
}
