import React,{useMemo} from 'react';
import {Text,View} from 'react-native';
import {WebView} from 'react-native-webview';
import type {Coordinates,MapRoute} from '../driverApi';
import {mapKey,offerMapDocument} from './offerMapDocument';
import {ui} from '../driverStyles';
const baseUrl=process.env.EXPO_PUBLIC_NESHAN_MAP_BASE_URL?.trim()||'https://localhost/';
export default function OfferMap({position,offer,fitRoute}:{position:Coordinates|null;offer?:MapRoute;fitRoute:boolean}){
 const html=offerMapDocument(position,offer,fitRoute);
 const source=useMemo(()=>({html,baseUrl}),[html]);
 if(!mapKey)return <View style={ui.body}><Text style={ui.muted}>کلید نقشهٔ نشان تنظیم نشده است.</Text></View>;
 return <WebView source={source} style={{flex:1}} originWhitelist={['about:blank',baseUrl]} onShouldStartLoadWithRequest={({url})=>url==='about:blank'||url===baseUrl}/>;
}
