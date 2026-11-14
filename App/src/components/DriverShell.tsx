import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {driverWorkingKey,storage} from '../storage';
import {driverApi} from '../driverApi';
import {rightAligned,row,ui} from '../driverStyles';

const tabs = [
  {route:'Home', label:'خانه', icon:'home-outline'},
  {route:'Trips', label:'سفرهای من', icon:'routes'},
  {route:'Finance', label:'مالی', icon:'wallet-outline'},
  {route:'Profile', label:'پروفایل', icon:'account-circle-outline'},
] as const;
const destinations = [...tabs,
  {route:'Vehicles', label:'خودروهای من', icon:'car-outline'},
] as const;
const green = '#07846c';
const muted = '#52615e';

export async function logoutDriver(navigation:any){
    const device=await storage.getItem('driver_push_device');
    if(device)await driverApi.removeDevice(device).catch(()=>{});
    await storage.removeItem('driver_push_device');
    await storage.removeItem(driverWorkingKey);
    await storage.removeItem('auth_token');
    await storage.removeItem('user_role');
    navigation.reset({index:0,routes:[{name:'Login'}]});
  }

type Props = {navigation:any; title:string; active?:typeof tabs[number]['route']; back?:boolean; onCancel?:()=>void; children:React.ReactNode};
export default function DriverShell({navigation,title,active,back,onCancel,children}:Props) {
  const [open,setOpen] = useState(false);
  const go = (route:string) => {setOpen(false);navigation.navigate(route,undefined,{pop:true});};
  return <SafeAreaView style={ui.root}>
    <View style={ui.header}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="باز کردن منو" style={styles.iconButton} onPress={()=>setOpen(true)}>
        <MaterialCommunityIcons name="menu" size={23} color={green}/>
      </TouchableOpacity>
      <View style={styles.heading}><Text style={styles.brand}>پویش تاکسی</Text><Text style={ui.muted}>{title}</Text></View>
      {onCancel&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="لغو سفر" style={styles.iconButton} onPress={onCancel}><MaterialCommunityIcons name="close" size={22} color="#b42318"/></TouchableOpacity>}
      {back&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="بازگشت" style={styles.iconButton} onPress={()=>navigation.goBack()}><MaterialCommunityIcons name="chevron-right" size={23} color={green}/></TouchableOpacity>}
    </View>
    <View style={styles.content}>{children}</View>
    <View style={styles.bottom}>
      {tabs.map(item=>{const selected=item.route===active;return <TouchableOpacity key={item.route} accessibilityRole="tab" accessibilityState={{selected}} onPress={()=>go(item.route)} style={[styles.tab,selected&&styles.selected]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={selected?green:muted}/>
        <Text style={[styles.tabLabel,selected&&styles.selectedLabel]}>{item.label}</Text>
      </TouchableOpacity>;})}
    </View>
    <Modal transparent visible={open} animationType="fade" onRequestClose={()=>setOpen(false)}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="بستن منو" style={StyleSheet.absoluteFill} onPress={()=>setOpen(false)}/>
        <View style={styles.drawerFrame}>
          <SafeAreaView accessibilityViewIsModal style={styles.drawer}>
            <View style={styles.drawerHead}><Text style={ui.title}>پویش تاکسی راننده</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="بستن منو" style={styles.iconButton} onPress={()=>setOpen(false)}><MaterialCommunityIcons name="close" size={22} color={green}/></TouchableOpacity></View>
            {destinations.map(item=><TouchableOpacity key={item.route} accessibilityRole="button" style={[styles.menuItem,item.route===active&&styles.selected]} onPress={()=>go(item.route)}>
              <MaterialCommunityIcons name={item.icon} size={22} color={green}/><Text style={[ui.text,styles.menuLabel]}>{item.label}</Text><MaterialCommunityIcons name="chevron-left" size={18} color={muted}/>
            </TouchableOpacity>)}
            <TouchableOpacity accessibilityRole="button" style={[styles.menuItem,styles.logout]} onPress={()=>logoutDriver(navigation)}><MaterialCommunityIcons name="logout" size={21} color="#b42318"/><Text style={ui.error}>خروج از حساب</Text></TouchableOpacity>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  content:{flex:1,minHeight:0},heading:{flex:1,paddingHorizontal:10},brand:{fontFamily:'Estedad-ExtraBold',fontSize:18,color:green,...rightAligned},
  iconButton:{width:44,height:44,borderRadius:15,borderWidth:1,borderColor:'#e1ebe7',alignItems:'center',justifyContent:'center',backgroundColor:'#fff'},
  bottom:{...row,flexShrink:0,backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#e1ebe7',paddingHorizontal:12,paddingVertical:7,gap:6},
  tab:{flex:1,minHeight:50,alignItems:'center',justifyContent:'center',gap:3,borderRadius:14},selected:{backgroundColor:'#eaf8f4'},tabLabel:{fontFamily:'Estedad-Medium',fontSize:11,color:muted},selectedLabel:{fontFamily:'Estedad-Bold',color:green},
  overlay:{flex:1,alignItems:'center',backgroundColor:'rgba(23,33,42,0.35)'},drawerFrame:{...row,pointerEvents:'box-none',width:'100%',maxWidth:430,flex:1},
  drawer:{width:'84%',maxWidth:340,backgroundColor:'#f8faf9',paddingHorizontal:14,gap:7,borderTopLeftRadius:24,borderBottomLeftRadius:24},
  drawerHead:{...row,justifyContent:'space-between',alignItems:'center',paddingVertical:16},menuItem:{...row,minHeight:49,alignItems:'center',gap:10,paddingHorizontal:12,borderRadius:14},menuLabel:{flex:1},logout:{marginTop:'auto',marginBottom:14},
});
