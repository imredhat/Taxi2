const titles: Record<string, string> = {
  Ticket: 'گفتگو با پشتیبانی', Payment: 'پرداخت سامان',
  Login: 'ورود', Otp: 'تأیید شماره همراه', Landing: 'خوش آمدید',
  Addresses: 'آدرس‌های من', Trips: 'سفرهای من', TripDetails: 'جزئیات سفر', Wallet: 'کیف پول', Notifications: 'اعلانات', Support: 'پشتیبانی و راهنما', Settings: 'تنظیمات', About: 'درباره پویش تاکسی',
  DriverChat: 'گفتگو با راننده', Home: 'درخواست سفر', Booking: 'رزرو سفر', Tracking: 'پیگیری سفر', Profile: 'حساب کاربری',
};
export function pageTitle(routeName = 'Home'): string {
  return `پویش تاکسی | ${titles[routeName] || 'درخواست سفر'}`;
}
