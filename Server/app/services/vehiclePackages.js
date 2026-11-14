const names={
 eco_city:'ECO شهری',eco_intercity:'ECO بین‌شهری',eco_plus:'ECO+',vip:'VIP',vip_plus:'VIP+',suv:'SUV',van:'ون',
};
const economy=['eco_city','eco_intercity'];
const offerClass=value=>economy.includes(value)?'eco_intercity':value;
const vehicleMatchesClass=requested=>`(v.car_class=${requested} OR (v.car_class IN ('eco_city','eco_intercity') AND ${requested} IN ('eco_city','eco_intercity')))`;
module.exports={names,offerClass,vehicleMatchesClass};
