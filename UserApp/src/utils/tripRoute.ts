import { persianDigits } from './tripDateTime';

export function formatRouteDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  return persianDigits([
    hours ? `${hours} ساعت` : '', minutes ? `${minutes} دقیقه` : '',
    remaining || !total ? `${remaining} ثانیه` : '',
  ].filter(Boolean).join(' و '));
}
