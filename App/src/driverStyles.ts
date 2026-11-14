import {Platform,StyleSheet} from 'react-native';
export const row = Platform.OS==='web'?{writingDirection:'ltr' as const,flexDirection:'row-reverse' as const}:{direction:'ltr' as const,flexDirection:'row-reverse' as const};
export const ui=StyleSheet.create({
 root:{flex:1,backgroundColor:'#f8faf9'}, header:{...row,alignItems:'center',justifyContent:'space-between',paddingHorizontal:18,minHeight:64,borderBottomWidth:1,borderBottomColor:'#e1ebe7',backgroundColor:'#fff'},
 body:{padding:16,gap:12}, title:{fontFamily:'Estedad-Bold',fontSize:19,color:'#17212a',textAlign:'right'}, text:{fontFamily:'Estedad-Regular',fontSize:13,lineHeight:23,color:'#17212a',textAlign:'right'}, muted:{fontFamily:'Estedad-Regular',fontSize:11,lineHeight:20,color:'#52615e',textAlign:'right'},
 link:{fontFamily:'Estedad-Bold',fontSize:13,color:'#07846c',paddingVertical:10,textAlign:'right'}, card:{padding:14,gap:8,borderRadius:18,borderWidth:1,borderColor:'#e1ebe7',backgroundColor:'#fff'},
 button:{minHeight:48,backgroundColor:'#07846c',borderRadius:15,alignItems:'center',justifyContent:'center',paddingHorizontal:12}, buttonText:{fontFamily:'Estedad-Bold',fontSize:14,color:'#fff'}, error:{fontFamily:'Estedad-Regular',fontSize:12,color:'#b42318',textAlign:'right',lineHeight:21},
});
