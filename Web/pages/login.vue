<template>
  <main class="admin-login" dir="rtl">
    <form class="login-card" @submit.prevent="login">
      <h1>ورود به مدیریت پویش تاکسی</h1>
      <p>با حساب مدیر وارد شوید. حساب مسافر برای ورود به این بخش دسترسی ندارد.</p>
      <label for="admin-username">نام کاربری، شماره همراه یا ایمیل</label>
      <input id="admin-username" v-model.trim="username" autocomplete="username" required dir="ltr" :disabled="loading">
      <label for="admin-password">رمز عبور</label>
      <input id="admin-password" v-model="password" type="password" autocomplete="current-password" required :disabled="loading">
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'در حال ورود…' : 'ورود به پنل مدیریت' }}</button>
      <NuxtLink to="/">بازگشت به سایت</NuxtLink>
    </form>
  </main>
</template>
<script setup>
import { readAdminSession, saveAdminSession } from '~/utils/adminSession'
definePageMeta({ layout: false })
useHead({ title: 'پویش تاکسی | ورود مدیر', link: [{ rel: 'stylesheet', href: '/assets/fonts/estedad/fontface.css' }] })
const username=ref(''),password=ref(''),loading=ref(false),error=ref('')
onMounted(()=>{if(readAdminSession())navigateTo('/panel/dashboard',{replace:true})})
async function login(){
 if(loading.value)return
 loading.value=true;error.value=''
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000)
 try{
  const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.value,password:password.value}),signal:controller.signal})
  const data=await response.json()
  if(!response.ok)throw new Error(data.error==='Invalid credentials'?'شماره همراه یا رمز عبور اشتباه است.':data.error||'ورود انجام نشد.')
  saveAdminSession(data)
  password.value=''
  window.location.href='/panel/dashboard'
 }catch(err){error.value=err.name==='AbortError'?'پاسخ سرور طول کشید؛ دوباره تلاش کنید.':err instanceof TypeError?'ارتباط با سرور برقرار نشد.':err.message}
 finally{clearTimeout(timer);loading.value=false}
}
</script>
<style scoped>
.admin-login{min-height:100vh;display:grid;place-items:center;background:#f3f7f6;padding:24px;font-family:Estedad,Tahoma,sans-serif;box-sizing:border-box}.login-card{width:100%;max-width:400px;background:white;padding:28px;border-radius:20px;display:flex;flex-direction:column;gap:14px;box-sizing:border-box;color:#16252d}h1{font-size:21px;margin:0}p{font-size:13px;line-height:1.9;margin:0}label{font-size:14px}input,button{min-height:48px;border-radius:10px;padding:10px 12px;font:inherit;box-sizing:border-box}input{border:1px solid #d6e0df}button{background:#07846c;color:white;border:0;cursor:pointer}button:disabled{opacity:.5}.error{color:#b42318}a{color:#07846c;font-size:14px;text-align:center}
</style>
