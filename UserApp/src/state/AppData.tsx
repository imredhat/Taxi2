import {vehicleClassLabel} from '../services/packages';
import {io} from 'socket.io-client';
import {API_URL} from '../services/api';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { passengerApi, allPages } from '../services/passenger';
import {restoreDeviceNotifications,unregisterDeviceNotifications} from '../services/devices';
import { submitReservation } from '../services/reservations';
import { storage } from '../storage';
import type { MapPoint } from '../components/NeshanMapPicker';

export interface SavedTrip {
  id: string; createdAt: string; quoteId?:string; quoteExpiresAt?:string; fare?:{amount:string;currency:string;breakdown:import('../services/packages').FareLine[];warnings:string[]}; pendingSync?: boolean; draftId?: string; packageId?: string; serverStatus?: string; status?: 'draft' | 'reserved'; reservationId?: string; starts: MapPoint[]; ends: MapPoint[]; date: string; time: string;
  personCount: number; luggageCount: number; bagCount: number; hasAnimals: boolean; animalType?: string; notes?: string; vehicle: string;
}
interface Notice { id: string; title: string; body: string; read: boolean; tripId?: string; createdAt: string }
interface AppData { profile: { name: string; phone: string }; trips: SavedTrip[]; notices: Notice[]; activityNotices: boolean }
const empty = (): AppData => ({ profile: { name: '', phone: '' }, trips: [], notices: [], activityNotices: true });
interface Store {
  data: AppData; loaded: boolean; openAccount: (phone: string) => Promise<void>; logout: () => Promise<void>;
  updateProfile: (name: string) => void; saveTrip: (trip: Omit<SavedTrip, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => string;
  refresh: () => Promise<void>;
  syncDraft: (trip: SavedTrip) => Promise<void>;
  registerTrip: (trip: SavedTrip) => Promise<string>;
  removeTrip: (id: string) => Promise<void>; markRead: (id?: string) => Promise<void>; setActivityNotices: (value: boolean) => void;
}
const Context = createContext<Store | null>(null);
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(empty);
  const [account, setAccount] = useState('');
  const [loaded, setLoaded] = useState(false);
  const inFlight = useRef(new Map<string, Promise<string>>());
  const revision = useRef(0), queue = useRef(Promise.resolve());
  const dataRevision = useRef(0), refreshSequence = useRef(0);
  const openAccount = async (phone: string) => {
    const current = ++revision.current; setLoaded(false);
    const key = phone || 'device';
    let next = empty();
    try {
      const raw = await storage.getItem(`passenger:${key}`);
      if (raw) { const parsed = JSON.parse(raw); next = { ...next, ...parsed, profile: { ...next.profile, ...parsed.profile } }; }
    } catch { /* Keep the empty account if saved data cannot be read. */ }
    if (current !== revision.current) return;
    next.profile.phone = phone;
    await storage.setItem('account_phone', phone);
    if (current !== revision.current) return;
    setData(next); setAccount(key); setLoaded(true);
    if(await storage.getItem('auth_token'))restoreDeviceNotifications().catch(()=>{});
  };
  useEffect(() => { storage.getItem('account_phone').then(phone => openAccount(phone || '')); }, []);
  useEffect(() => {
    if (!loaded || !account) return;
    const value = JSON.stringify(data), key = `passenger:${account}`;
    queue.current = queue.current.then(() => storage.setItem(key, value));
  }, [data, account, loaded]);
  const refresh = async () => {
    const token = await storage.getItem('auth_token');
    if (!token || token.startsWith('otp-session-')) return;
    const active = revision.current;
    const change = dataRevision.current, sequence = ++refreshSequence.current;
    const [profileResult, reservations, notifications, preferencesResult, drafts] = await Promise.all([
      passengerApi.profile(), allPages(passengerApi.reservations,'reservations'), allPages(passengerApi.notifications), passengerApi.preferences(), allPages(passengerApi.drafts),
    ]);
    if (active !== revision.current || change !== dataRevision.current || sequence !== refreshSequence.current) return;
    setData(previous => {
      const remote: SavedTrip[] = reservations.filter((item: any) => item.booking_details).map((item: any) => ({
        ...item.booking_details, id: item.client_reference, createdAt: item.created_at,
        status: 'reserved', serverStatus: item.status, reservationId: item.id,
        vehicle: vehicleClassLabel(item.booking_details.vehicle || ''),
      }));
      const remoteIds = new Set(remote.map(item => item.id));
      const remoteDrafts: SavedTrip[] = drafts.filter((item:any)=>!remoteIds.has(item.client_reference)).map((item:any)=>({
        ...item.trip_data,id:item.client_reference,draftId:item.id,createdAt:item.created_at,status:'draft',
        ...previous.trips.find(local=>local.id===item.client_reference&&local.pendingSync),
      }));
      const draftIds = new Set(remoteDrafts.map(item=>item.id));
      return { ...previous,
        activityNotices: preferencesResult.preferences.activity_notifications,
        profile: { name: [profileResult.profile.first_name,profileResult.profile.last_name].filter(Boolean).join(' '), phone: profileResult.profile.phone },
        trips: [...remote,...remoteDrafts,...previous.trips.filter(item => !remoteIds.has(item.id)&&!draftIds.has(item.id)&&(!item.draftId||item.pendingSync)&&item.status!=='reserved')],
        notices: [...notifications.map((item: any) => ({
          id:item.id,title:item.title_fa||item.title,body:item.body_fa||item.body,read:item.is_read,createdAt:item.created_at,
          tripId:remote.find(trip=>trip.reservationId===item.data?.reservation_id)?.id,
        })),...previous.notices.filter(item=>item.id.startsWith('notice-'))],
      };
    });
  };
  useEffect(() => { if(loaded&&account)refresh().catch(()=>{}); }, [loaded,account]);
  useEffect(()=>{
    if(!loaded||!account)return;
    const active=revision.current;
    let live=true,timer:ReturnType<typeof setTimeout>|undefined,retry:ReturnType<typeof setTimeout>|undefined,delay=2000;
    const socket=io(API_URL,{path:'/dispatch/socket.io',transports:['websocket'],autoConnect:false,timeout:6000});
    const updateNotices=()=>{
      if(timer)return;
      timer=setTimeout(()=>{
        timer=undefined;
        void passengerApi.notifications().then(({items})=>{
          if(!live||active!==revision.current)return;
          setData(previous=>{
            const notices=items.map((item:any)=>({
              id:item.id,title:item.title_fa||item.title,body:item.body_fa||item.body,read:item.is_read,createdAt:item.created_at,
              tripId:previous.trips.find(trip=>trip.reservationId===item.data?.reservation_id)?.id,
            }));
            const fresh=new Set(notices.map((item:Notice)=>item.id));
            return {...previous,notices:[...notices,...previous.notices.filter(item=>!fresh.has(item.id))]};
          });
        }).catch(()=>{});
      },200);
    };
    const reconnect=()=>{
      if(!live||socket.active||retry)return;
      retry=setTimeout(()=>{retry=undefined;if(live)socket.connect();},delay);
      delay=Math.min(delay*2,60000);
    };
    socket.on('chat:message',updateNotices).on('connect',()=>{delay=2000;updateNotices();});
    socket.on('disconnect',reconnect).on('connect_error',reconnect);
    void storage.getItem('auth_token').then(token=>{
      if(live&&token&&!token.startsWith('otp-session-')){socket.auth={token};socket.connect();}
    }).catch(()=>{});
    return()=>{live=false;clearTimeout(timer);clearTimeout(retry);socket.disconnect();};
  },[loaded,account]);
  const logout = async () => {
    ++revision.current;
    await unregisterDeviceNotifications().catch(()=>{});
    await Promise.all([storage.removeItem('auth_token'), storage.removeItem('user_role'), storage.removeItem('account_phone')]);
    setData(empty()); setAccount(''); setLoaded(true);
  };
  const saveTrip: Store['saveTrip'] = trip => {
    ++dataRevision.current;
    const id = trip.id || `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt = trip.createdAt || new Date().toISOString();
    setData(previous => ({ ...previous, trips: [{ ...trip, id, createdAt, pendingSync:true }, ...previous.trips.filter(item => item.id !== id)],
      notices: previous.activityNotices ? [{ id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: 'پیش‌نویس سفر ذخیره شد', body: 'اطلاعات سفرتان در سفرهای من قابل مشاهده است. این سفر هنوز رزرو نشده است.', read: false, tripId: id, createdAt }, ...previous.notices] : previous.notices,
    }));
    return id;
  };
  const registerTrip: Store['registerTrip'] = trip => {
    const existing = data.trips.find(item => item.id === trip.id);
    if (existing?.status === 'reserved' && existing.reservationId) return Promise.resolve(existing.reservationId);
    const pending = inFlight.current.get(trip.id);
    if (pending) return pending;
    const accountRevision = revision.current;
    const operation = submitReservation(trip).then(result => {
      if (accountRevision !== revision.current) throw new Error('حساب کاربری تغییر کرده است؛ دوباره وارد سفرهای خود شوید.');
      const reserved = { ...trip, status: 'reserved' as const, serverStatus: result.status, reservationId: result.id };
      ++dataRevision.current;
      setData(previous => ({ ...previous, trips: [reserved, ...previous.trips.filter(item => item.id !== trip.id)],
      }));
      refresh().catch(()=>{});
      if(trip.draftId)passengerApi.deleteDraft(trip.draftId).catch(()=>{});
      return result.id;
    }).finally(() => inFlight.current.delete(trip.id));
    inFlight.current.set(trip.id, operation);
    return operation;
  };
  const syncDraft: Store['syncDraft'] = async trip => {
    const active=revision.current;
    const result=await passengerApi.saveDraft(trip.id,trip as unknown as Record<string,unknown>);
    if(active!==revision.current)throw new Error('حساب کاربری تغییر کرده است.');
    ++dataRevision.current;
    setData(previous=>({...previous,trips:previous.trips.map(item=>item.id===trip.id?{...item,draftId:result.draft.id,pendingSync:false}:item)}));
  };
  const renderedAccount=revision.current;
  return <Context.Provider value={{ data, loaded, openAccount, logout, saveTrip, syncDraft, registerTrip, refresh,
    updateProfile: name => {if(renderedAccount===revision.current){++dataRevision.current;setData(previous => ({ ...previous, profile: { ...previous.profile, name } }));}},
    removeTrip: async id => {
      const active=revision.current,trip=data.trips.find(item=>item.id===id);
      if(trip?.draftId)await passengerApi.deleteDraft(trip.draftId);
      if(active===revision.current){++dataRevision.current;setData(previous => ({ ...previous, trips: previous.trips.filter(trip => trip.id !== id) }));}
    },
    markRead: async id => {
      const active=revision.current;
      if(!id || /^[0-9a-f-]{36}$/i.test(id))await(id?passengerApi.readNotification(id):passengerApi.readAllNotifications());
      if(active!==revision.current)return;
      setData(previous => ({ ...previous, notices: previous.notices.map(notice => !id || notice.id === id ? { ...notice, read: true } : notice) }));
    },
    setActivityNotices: activityNotices => {if(renderedAccount===revision.current)setData(previous => ({ ...previous, activityNotices }));},
  }}>{children}</Context.Provider>;
}
export function useAppData() {
  const store = useContext(Context);
  if (!store) throw new Error('AppDataProvider is required');
  return store;
}
