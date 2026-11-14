export const vehicleClassOptions = [
  { value:'eco_city', label:'ECO شهری' },
  { value:'eco_intercity', label:'ECO بین‌شهری' },
  { value:'eco_plus', label:'ECO+' },
  { value:'vip', label:'VIP' },
  { value:'vip_plus', label:'VIP+' },
  { value:'suv', label:'SUV' },
  { value:'van', label:'ون' },
]
export const pricingClassOptions = [{value:'all',label:'همه کلاس‌ها'},...vehicleClassOptions]
export const vehiclePackageLabel = value => pricingClassOptions.find(option=>option.value===value)?.label || value || '—'
