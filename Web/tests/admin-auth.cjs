const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),saved=new Map();
const storage={getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)};
const sessionSource=fs.readFileSync(path.join(root,'utils/adminSession.js'),'utf8').replace(/export /g,'');
const session=vm.runInNewContext(sessionSource+'\n;({readAdminSession,saveAdminSession,clearAdminSession})',{localStorage:storage,atob,Date});
const token=(role,exp=Math.floor(Date.now()/1000)+3600)=>`header.${Buffer.from(JSON.stringify({userId:'test-user',role,exp})).toString('base64url')}.signature`;
const context={process:{client:true},localStorage:storage,readAdminSession:session.readAdminSession,defineNuxtRouteMiddleware:handler=>handler,navigateTo:destination=>destination};
const source=fs.readFileSync(path.join(root,'middleware/auth.global.js'),'utf8').replace(/^[\uFEFF]?import [^\n]*\n/gm,'').replace('export default ','');
const guard=vm.runInNewContext(source,context);
for(const role of [null,'passenger','driver']){
 saved.clear();if(role){saved.set('token',token(role));saved.set('user',JSON.stringify({role:'admin'}));}
 for(const route of ['/panel','/panel/','/panel/dashboard','/panel/users'])assert.equal(guard({path:route}),'/login');
}
saved.set('token',token('admin'));assert.equal(guard({path:'/panel'}),'/panel/dashboard');assert.equal(guard({path:'/panel/users'}),undefined);assert.equal(saved.get('admin_token'),saved.get('token'));
// A later passenger login must not overwrite the separate administrator session.
saved.set('token',token('passenger'));saved.set('auth_token','userapp-session');assert.equal(session.readAdminSession().user.role,'admin');session.clearAdminSession();assert.equal(saved.get('token'),token('passenger'));assert.equal(saved.get('auth_token'),'userapp-session');
assert.throws(()=>session.saveAdminSession({token:token('passenger'),role:'passenger',userId:'test-user'}));
saved.clear();saved.set('admin_token',token('admin',1));assert.equal(guard({path:'/panel/users'}),'/login');
for(const route of ['/','/login','/home','/panel-other'])assert.equal(guard({path:route}),undefined);
context.process.client=false;assert.equal(guard({path:'/panel'}),undefined);
assert.equal(fs.existsSync(path.join(root,'pages/login.vue')),true);
console.log('Admin roles, session isolation, expiration, login route and migration checks passed');
