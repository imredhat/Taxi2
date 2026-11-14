import React from 'react';
import {Text,View} from 'react-native';
import type {Coordinates,MapRoute} from '../driverApi';
import {mapKey,offerMapDocument} from './offerMapDocument';
import {ui} from '../driverStyles';
export default function OfferMap({position,offer,fitRoute,fixed}:{position:Coordinates|null;offer?:MapRoute;fitRoute:boolean;fixed?:boolean}){
 if(!mapKey)return <View style={ui.body}><Text style={ui.muted}>کلید نقشهٔ نشان تنظیم نشده است.</Text></View>;
 return React.createElement('iframe',{title:'نقشهٔ سفر و موقعیت راننده',srcDoc:offerMapDocument(position,offer,fitRoute,fixed),style:{width:'100%',height:'100%',border:0}});
}
