import {useCallback,useEffect,useRef,useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
export function useRemote<T>(load:()=>Promise<T>,key=''){
 const focused=useIsFocused(),loader=useRef(load);loader.current=load;
 const [data,setData]=useState<T|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[version,setVersion]=useState(0);
 const reload=useCallback(()=>setVersion(v=>v+1),[]);
 useEffect(()=>{if(!focused)return;let live=true;setData(null);setLoading(true);setError('');loader.current().then(value=>{if(live)setData(value);}).catch(err=>{if(live)setError(err instanceof Error?err.message:'دریافت اطلاعات انجام نشد.');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[focused,key,version]);
 return {data,error,loading,reload,setData};
}
