import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {row,ui} from '../driverStyles';
import {toFa} from '../jalaliDate';

export default function VehiclePlate({value}:{value:string}){
 const parts=toFa(value.trim()).match(/^([۰-۹]{2})\s+([۰-۹]{2})\s+(.+?)\s+([۰-۹]{3})$/);
 if(!parts)return <Text style={ui.muted}>{toFa(value)}</Text>;
 const [,left,region,letter,middle]=parts;
 return <View style={styles.plate}>
  <Text style={styles.region}>ایران {region}</Text>
  <Text style={styles.number}>{middle}</Text><Text style={styles.number}>{letter}</Text><Text style={styles.number}>{left}</Text>
 </View>;
}

const styles=StyleSheet.create({
 plate:{...row,alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:5,borderWidth:1,borderColor:'#d8e5dd',borderRadius:7,paddingHorizontal:5,paddingVertical:3,backgroundColor:'#fff'},
 region:{...ui.muted,fontFamily:'Estedad-Bold',backgroundColor:'#eef4f0',paddingHorizontal:4,borderRadius:4},
 number:{...ui.muted,fontFamily:'Estedad-Bold',color:'#17212a'},
});
