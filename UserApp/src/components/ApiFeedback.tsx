import React from 'react';
import {Text,TouchableOpacity,View} from 'react-native';
import LoadingState from './LoadingState';
import {ui} from './ScreenPage';
export default function ApiFeedback({loading,error,retry,navigation}:{loading:boolean;error:string;retry:()=>void;navigation:any}){
 return <>{loading&&<LoadingState label="در حال دریافت اطلاعات…"/>}{!!error&&<View style={ui.card}><Text accessibilityRole="alert" style={ui.text}>{error}</Text><TouchableOpacity onPress={retry}><Text style={ui.link}>تلاش مجدد</Text></TouchableOpacity>{/وارد|نشست|پیامکی/.test(error)&&<TouchableOpacity onPress={()=>navigation.navigate('Login')}><Text style={ui.link}>ورود به حساب</Text></TouchableOpacity>}</View>}</>;
}
