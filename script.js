const FA_DIGITS='۰۱۲۳۴۵۶۷۸۹';
/* ============ Supabase Setup ============ */
const SUPABASE_URL = 'https://ybtjatkxsagsgathvjoe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_X8F1n-nhXl3YhDNZ7SeRTg_U280aKuX';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const faDigits=s=>String(s).replace(/\d/g,d=>FA_DIGITS[d]);
const faPrice=n=>faDigits(Number(n||0).toLocaleString('en-US'));
const timeAgo=ts=>{const m=Math.floor((Date.now()-ts)/60000);if(m<1)return'الان';if(m<60)return faDigits(m)+' دقیقه پیش';const h=Math.floor(m/60);if(h<24)return faDigits(h)+' ساعت پیش';return faDigits(Math.floor(h/24))+' روز پیش'};
const initials=n=>{const p=(n||'').trim().split(' ');if(!p[0])return'؟';return (p[0][0]||'')+((p[1]||'')[0]||'')};
const PLACEHOLDER='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#e8f0eb" width="100" height="100"/><text x="50" y="58" font-size="40" text-anchor="middle">📦</text></svg>');

function toast(m){const t=document.getElementById('toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}

function compressImage(file,maxW,quality){
maxW=maxW||300;
quality=quality||0.5;
return new Promise(function(res,rej){
var r=new FileReader();
r.onload=function(e){
var img=new Image();
img.onload=function(){
var c=document.createElement('canvas');
var w=img.width;
var h=img.height;
if(w>maxW){
h=Math.round(h*maxW/w);
w=maxW;
}
c.width=w;
c.height=h;
var ctx=c.getContext('2d');
ctx.drawImage(img,0,0,w,h);
var d=c.toDataURL('image/jpeg',quality);
res(d);
};
img.onerror=rej;
img.src=e.target.result;
};
r.onerror=rej;
r.readAsDataURL(file);
});
}

/* THEME */
function applyTheme(){
  const t=localStorage.getItem('taraz.theme')||'light';
  document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');
  const ic=document.getElementById('theme-ic');
  const lbl=document.getElementById('theme-lbl');
  if(ic&&lbl){ic.textContent=t==='dark'?'☀️':'🌙';lbl.textContent=t==='dark'?'روشن — برای روز':'خاموش'}
}
function toggleTheme(){
  const cur=localStorage.getItem('taraz.theme')||'light';
  localStorage.setItem('taraz.theme',cur==='dark'?'light':'dark');
  applyTheme();
  toast(cur==='dark'?'حالت روشن ✓':'حالت تاریک ✓');
}

/* DB */
const DB_VERSION='taraz.v3';
const DB={
  _k(k){return DB_VERSION+'.'+k},
  _get(k,d){try{const v=localStorage.getItem(this._k(k));return v?JSON.parse(v):d}catch(e){return d}},
  _set(k,v){try{localStorage.setItem(this._k(k),JSON.stringify(v))}catch(e){toast('حافظه پر است')}},
  get user(){return this._get('user',null)},set user(v){v?this._set('user',v):localStorage.removeItem(this._k('user'))},
  get listings(){return this._get('listings',[])},set listings(v){this._set('listings',v)},
  get demands(){return this._get('demands',[])},set demands(v){this._set('demands',v)},
  get requests(){return this._get('requests',[])},set requests(v){this._set('requests',v)},
  get ratings(){return this._get('ratings',[])},set ratings(v){this._set('ratings',v)},
  get conversations(){return this._get('convs',[])},set conversations(v){this._set('convs',v)},
  get messages(){return this._get('msgs',[])},set messages(v){this._set('msgs',v)},
  get trades(){return this._get('trades',[])},set trades(v){this._set('trades',v)},
  get interests(){return this._get('interests',{})},set interests(v){this._set('interests',v)},
  get notifications(){return this._get('notifs',[])},set notifications(v){this._set('notifs',v)},
  get capacities(){return this._get('capacities',[])},set capacities(v){this._set('capacities',v)},
  get bookings(){return this._get('bookings',[])},set bookings(v){this._set('bookings',v)},
  get missions(){return this._get('missions',[])},set missions(v){this._set('missions',v)},
  get userRoles(){return this._get('userRoles',{})},set userRoles(v){this._set('userRoles',v)}
};

/* MIGRATION */
(function migrate(){
  ['user','listings','demands','requests','ratings','convs','msgs','trades','interests','notifs','capacities','bookings','missions','userRoles'].forEach(k=>{
    const oldVal=localStorage.getItem('taraz.v2.'+k);
    if(oldVal&&!localStorage.getItem('taraz.v3.'+k)){
      try{localStorage.setItem('taraz.v3.'+k,oldVal)}catch(e){}
    }
  });
})();

/* BACKUP */
function exportBackup(){
  const data={};
  ['user','listings','demands','requests','ratings','conversations','messages','trades','interests','notifications','capacities','bookings','missions','userRoles'].forEach(k=>{data[k]=DB[k]});
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='taraz-v3-backup.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('دانلود شد ✓');
}
function importBackup(){
  const inp=document.createElement('input');inp.type='file';inp.accept='application/json';
  inp.onchange=()=>{
    const f=inp.files&&inp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=e=>{
      try{
        const data=JSON.parse(e.target.result);
        ['user','listings','demands','requests','ratings','conversations','messages','trades','interests','notifications','capacities','bookings','missions','userRoles'].forEach(k=>{if(data[k]!==undefined)DB[k]=data[k]});
        toast('بازیابی ✓');
        if(DB.user)go('home');else go('auth');
      }catch(err){toast('فایل معتبر نیست')}
    };
    r.readAsText(f);
  };
  inp.click();
}
function clearAllData(){
  if(!confirm('همه داده‌ها پاک شود؟'))return;
  ['user','listings','demands','requests','ratings','convs','msgs','trades','interests','notifs','capacities','bookings','missions','userRoles'].forEach(k=>{localStorage.removeItem(DB_VERSION+'.'+k)});
  toast('پاک شد');go('auth');
}

/* CONSTANTS */
const CATEGORIES_ALL=[
  {id:'all',short:'همه',icon:'🏷️'},
  {id:'urgent',short:'فوری',icon:'🔥'},
  {id:'livestock',short:'دام',icon:'🐑'},
  {id:'poultry',short:'طیور',icon:'🐔'},
  {id:'crops',short:'محصول',icon:'🌾'},
  {id:'feed',short:'نهاده',icon:'🌰'},
  {id:'forage',short:'علوفه',icon:'🌿'},
  {id:'agri_inputs',short:'بذر و کود',icon:'🌱'},
  {id:'vet_drugs',short:'دارو',icon:'💉'},
  {id:'vet_equipment',short:'دامپزشکی',icon:'🩺'},
  {id:'farm_equipment',short:'تجهیزات',icon:'🔧'},
  {id:'machinery',short:'ماشین‌آلات',icon:'🚜'}
];
const CATEGORIES=CATEGORIES_ALL.filter(c=>c.id!=='all'&&c.id!=='urgent');

const SERVICES = [
  {id:'transport', icon:'🚛', title:'حمل و نقل', types:[
    {id:'van', label:'وانت', unit:'تن', icon:'🚐'},
    {id:'nisan', label:'نیسان', unit:'تن', icon:'🚚'},
    {id:'kamion', label:'کامیون', unit:'تن', icon:'🚛'},
    {id:'tirili', label:'تریلی', unit:'تن', icon:'🚛'},
    {id:'live_animal', label:'حمل دام', unit:'رأس', icon:'🐑'},
    {id:'poultry_transport', label:'حمل طیور', unit:'قطعه', icon:'🐔'},
    {id:'cold_chain', label:'سردخانه‌ای', unit:'تن', icon:'❄️'},
    {id:'shared', label:'اشتراکی', unit:'تن', icon:'🤝'}
  ]},
  {id:'slaughter', icon:'🥩', title:'کشتار و بسته‌بندی', types:[
    {id:'butcher', label:'قصاب سیار', unit:'رأس', icon:'🔪'},
    {id:'abattoir', label:'کشتارگاه', unit:'رأس', icon:'🏭'},
    {id:'packaging', label:'بسته‌بندی', unit:'کیلو', icon:'📦'},
    {id:'cold_storage', label:'سردخانه', unit:'تن', icon:'❄️'}
  ]},
  {id:'poultry', icon:'🐔', title:'طیور و ماکیان', types:[
  {id:'broiler_chick', label:'جوجه یک‌روزه گوشتی', unit:'قطعه', icon:'🐥'},
  {id:'layer_chick', label:'جوجه یک‌روزه تخم‌گذار', unit:'قطعه', icon:'🐤'},
  {id:'turkey', label:'بوقلمون', unit:'قطعه', icon:'🦃'},
  {id:'quail', label:'بلدرچین', unit:'قطعه', icon:'🐦'},
  {id:'ostrich', label:'شترمرغ', unit:'قطعه', icon:'🦤'},
  {id:'other_poultry', label:'سایر ماکیان', unit:'قطعه', icon:'❓'}
]},

  {id:'machinery_rent', icon:'🚜', title:'ماشین‌آلات کشاورزی', types:[
    {id:'tractor', label:'تراکتور', unit:'هکتار', icon:'🚜'},
    {id:'harvester', label:'کمباین', unit:'هکتار', icon:'🌾'},
    {id:'tillage', label:'شخم', unit:'هکتار', icon:'🌱'},
    {id:'planting', label:'کاشت', unit:'هکتار', icon:'🌾'},
    {id:'harvesting', label:'برداشت', unit:'هکتار', icon:'🌾'},
    {id:'spraying', label:'سمپاشی', unit:'هکتار', icon:'💨'}
  ]},
  {id:'repairs', icon:'🔧', title:'تعمیرات و تجهیزات', types:[
    {id:'farm_equip_repair', label:'تجهیزات دامی', unit:'ساعت', icon:'🔧'},
    {id:'machinery_repair', label:'ماشین‌آلات', unit:'ساعت', icon:'🔧'},
    {id:'ventilation', label:'تهویه', unit:'عدد', icon:'💨'},
    {id:'milking', label:'شیردوش', unit:'عدد', icon:'🥛'}
  ]},
  {id:'specialist', icon:'🩺', title:'دامپزشکی و مشاوره', types:[
    {id:'vet', label:'دامپزشک', unit:'بازدید', icon:'👨‍⚕️'},
    {id:'lab', label:'آزمایشگاه', unit:'نمونه', icon:'🧪'},
    {id:'plant_doctor', label:'گیاه‌پزشک', unit:'بازدید', icon:'🌱'},
    {id:'insemination', label:'تلقیح', unit:'رأس', icon:'💉'},
    {id:'diagnosis', label:'تشخیص بیماری', unit:'بازدید', icon:'🩺'}
  ]},
  {id:'labor', icon:'👷', title:'نیروی کار و خدمات', types:[
    {id:'shepherd', label:'چوپان', unit:'روز', icon:'🐑'},
    {id:'gardener', label:'باغبان', unit:'روز', icon:'🌳'},
    {id:'farm_worker', label:'کارگر کشاورزی', unit:'روز', icon:'👷'},
    {id:'harvest_worker', label:'کارگر برداشت', unit:'روز', icon:'🌾'}
  ]}
];

const URGENT_REASONS={expiry:'نزدیک به انقضا',auction:'حراج',special:'تخفیف ویژه',overstock:'موجودی مازاد'};

function serviceOf(id){return SERVICES.find(s=>s.id===id)||SERVICES[0]}
function serviceTypeOf(sId,tId){const s=serviceOf(sId);return s.types.find(t=>t.id===tId)||s.types[0]}
function catOf(id){return CATEGORIES_ALL.find(c=>c.id===id)||CATEGORIES_ALL[0]}
function productKey(title){
  const words=(title||'').replace(/[۰-۹0-9]/g,' ').split(/\s+/).filter(w=>w.length>2);
  const stop={فروش:1,خرید:1,فوری:1,'رأس':1,کیلو:1,ویال:1,عدد:1,قطعه:1,کیسه:1,بسته:1,نژاد:1,زنده:1,درجه:1,تخفیف:1,حراج:1,ویژه:1,مازاد:1,موجودی:1,تحویل:1,سالم:1,حمل:1,بیمه:1,از:1,به:1,با:1};
  return words.find(w=>!stop[w])||(title||'').split(' ')[0]||'نامشخص';
}
function extractQtyNum(str){
  const en=String(str).split('').map(c=>{const i=FA_DIGITS.indexOf(c);return i>=0?String(i):c}).join('');
  const m=en.match(/\d+/);
  return m?Number(m[0]):1;
}
function avgRating(phone){
  const rs=DB.ratings.filter(r=>r.toPhone===phone);
  if(!rs.length)return{avg:0,count:0};
  const s=rs.reduce((a,b)=>a+b.score,0);
  return{avg:s/rs.length,count:rs.length};
}
function setAvatar(el,u){if(!el||!u)return;el.innerHTML='';if(u.avatar){const i=document.createElement('img');i.src=u.avatar;el.appendChild(i)}else{el.textContent=initials(u.name)}}

/* STATE */
let currentScreen='home';
let currentDetailId=null;
let currentConvId=null;
let ratingTarget=null;
let ratingScore=0;
let currentCategory='none';
let browseCategory='all';
let browseSearch='';
let detailReturnTo='home';
let currentCapacityId=null;
let capacityReturnTo='services';
let currentMissionDraft=null;
let servicesStep=1; 
let servicesCurrentService=null;
let servicesCurrentType=null;

/* HEADER AVATARS */
async function renderHeaderAvatars(){
  const u = DB.user;
  if (!u) return;
  
  var r = await avgRating(u.phone);
  
  // آواتار
  const avatarEl = document.getElementById('header-avatar');
  if (avatarEl) setAvatar(avatarEl, u);
  
  // نام کاربر
  const nameEl = document.getElementById('header-user-name');
  if (nameEl) nameEl.textContent = u.name ? u.name.split(' ')[0] : 'کاربر';
  
  // شغل
  const roleEl = document.getElementById('header-user-role');
  if (roleEl) roleEl.textContent = u.role || 'کاربر';
  
  // امتیاز
  const ratingEl = document.getElementById('header-user-rating');
  if (ratingEl) ratingEl.textContent = r.count > 0 ? faDigits(r.avg.toFixed(1)) : '۰';
}


/* NOTIFICATIONS */
async function updateBellBadge(){
var u=DB.user;if(!u)return;
var badge=document.getElementById('bell-badge'); if(!badge)return;
var result=null; try{result=await api.getNotifications(u.phone)}catch(e){}
var unread=0;
if(result&&result.notifications){ unread=result.notifications.filter(function(n){return !n.read}).length; } else { unread=DB.notifications.filter(function(n){return !n.read}).length; }
badge.textContent=faDigits(unread); badge.classList.toggle('show',unread>0);
}
var _favoritesCache = [];
async function loadFavorites(){
var u = DB.user; if(!u){ _favoritesCache = []; return; }
if (typeof api === 'undefined') return; // FIX
var result = null; try { result = await api.getFavorites(u.phone); } catch(e){ console.warn(e.message); }
if(result && result.favorites){ _favoritesCache = result.favorites.map(function(f){ return f.listing_id || f.listingId; }); } else { _favoritesCache = []; }
}
function isFavorite(listingId){ return _favoritesCache.indexOf(listingId) >= 0; }
async function enablePushNotifications(){
var u = DB.user; if(!u){ toast('اول وارد شو'); return; }
if(!('serviceWorker' in navigator) || !('PushManager' in window)){ toast('مرورگر پشتیبانی نمی‌کنه'); return; }
try {
var permission = await Notification.requestPermission();
if(permission !== 'granted'){ toast('اجازه اعلان داده نشد'); return; }
var registration = await navigator.serviceWorker.ready;
var keyResult = null; try { keyResult = await fetch('https://taraz-backend-prog.vercel.app/api/push/public-key').then(r => r.json()); } catch(e){}
if(!keyResult || !keyResult.publicKey){ toast('خطا در دریافت کلید'); return; }
var subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(keyResult.publicKey) });
var result = await fetch('https://taraz-backend-prog.vercel.app/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userPhone: u.phone, subscription: subscription }) }).then(r => r.json());
if(result && result.ok){ toast('✓ اعلان‌ها فعال شد'); } else { toast('خطا در ثبت'); }
} catch(e) { toast('خطا در فعال‌سازی'); }
}
function urlBase64ToUint8Array(base64String){
var padding = '='.repeat((4 - base64String.length % 4) % 4);
var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
var rawData = window.atob(base64);
var outputArray = new Uint8Array(rawData.length);
for (var i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
return outputArray;
}
async function toggleFavorite(listingId){
var u = DB.user; if(!u){ toast('اول وارد شو'); return; }
var result = null;
var btn = document.querySelector('.fav-btn[onclick*="' + listingId + '"]');
if(btn){ btn.classList.add('pop'); setTimeout(function(){ btn.classList.remove('pop'); }, 400); }
try { result = await api.addFavorite(u.phone, listingId); } catch(e){ console.warn(e.message); }
if(result && result.removed){ _favoritesCache = _favoritesCache.filter(function(id){ return id !== listingId; }); toast('از علاقه‌مندی حذف شد'); }
else if(result && result.added){ _favoritesCache.push(listingId); toast('به علاقه‌مندی اضافه شد'); }
else { toast('خطا'); }
if(currentScreen === 'home') renderHome();
else if(currentScreen === 'browse') renderBrowse();
else if(currentScreen === 'detail') openDetail(currentDetailId, detailReturnTo);
}
async function addNotification(n){
var u=DB.user;if(!u)return;
var notifData={ id:'N'+Date.now(), userPhone:u.phone, type:n.type||'info', icon:n.icon||'🔔', title:n.title||'اعلان', body:n.body||'' };
var result=null; try{result=await api.createNotification(notifData)}catch(e){}
var all=DB.notifications; all.unshift({ id:notifData.id, type:notifData.type, icon:notifData.icon, title:notifData.title, body:notifData.body, read:false, createdAt:Date.now() }); DB.notifications=all; updateBellBadge();
}
async function renderNotifs(){
var u=DB.user;if(!u)return;
var result=null; try{result=await api.getNotifications(u.phone)}catch(e){}
var list=(result&&result.notifications)?result.notifications:DB.notifications;
list=list.map(function(n){ return { id:n.id, type:n.type, icon:n.icon||'🔔', title:n.title, body:n.body, read:n.read, createdAt:Number(n.created_at||n.createdAt) }; });
list.sort(function(a,b){return b.createdAt-a.createdAt});
var wrap=document.getElementById('notif-list'); if(!wrap)return;
if(!list.length){ wrap.innerHTML='<div class="empty"><span class="emoji">🔔</span>اعلانی نیست</div>'; return; }
wrap.innerHTML=list.map(function(n){ return '<div class="notif-card '+(n.read?'':'unread')+'"><div class="notif-ic">'+(n.icon||'🔔')+'</div><div class="notif-main"><b>'+n.title+'</b><small>'+n.body+'</small><span class="time">'+timeAgo(n.createdAt)+'</span></div></div>'; }).join('');
var all=DB.notifications; all.forEach(function(n){n.read=true}); DB.notifications=all; updateBellBadge();
}

/* NAVIGATION */
function go(s){
  if(!DB.user&&s!=='auth')s='auth';
  if(s==='detail'&&!currentDetailId)s='browse';
  if(s==='chat'&&!currentConvId)s='chatlist';
  if(s==='capacity'&&!currentCapacityId)s='services';
  document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
  const target=document.getElementById('screen-'+s); if(target)target.classList.add('active');
  currentScreen=s;
  document.body.classList.toggle('no-nav',s==='auth'||s==='chat');
  document.querySelectorAll('#nav button').forEach(b=>b.classList.remove('active'));
  const map={home:'home',browse:'browse',services:'services',mission:'mission',profile:'profile',chatlist:'chatlist',buy:'home',sell:'home',settings:'profile',notifs:'home',capacity:'services',detail:'browse'};
  if(map[s]){const b=document.querySelector('#nav button[data-nav="'+map[s]+'"]');if(b)b.classList.add('active')}
if(s==='home') { loadFavorites().then(renderHome); updateHomeReadyButton(); }
  if(s==='browse'){ loadFavorites().then(renderBrowse); }
  if(s==='services')renderServices();
  if(s==='capacity')renderCapacityDetail();
  if(s==='mission')renderMission();
  if(s==='profile')renderProfile();
  if(s==='sell')resetSellForm();
  if(s==='chatlist')renderChatList();
  if(s==='chat')renderChat();
  if(s==='settings')applyTheme();
  if(s==='notifs')renderNotifs();
  if(s==='missions-list')renderMyMissions();
if(s==='mission-chain') renderMissionChainView();
if (s === 'mission') {
  var roleEl = document.getElementById('mission-user-role');
  if (roleEl && DB.user) {
    roleEl.textContent = DB.user.role || 'کاربر';
  }
  renderMission();
}
  renderHeaderAvatars(); updateChatBadge(); updateBellBadge();
  // ارسال رویداد برای راه‌اندازی نقشه و سایر کامپوننت‌ها
document.dispatchEvent(
  new CustomEvent('taraz:screenShown', {
    detail: { screenId: screenId }
  })
);

}
function backFromCapacity(){go(capacityReturnTo||'services')}
function goUrgentSell(){go('sell');setTimeout(()=>enableUrgentSellMode(),50)}
function enableUrgentSellMode(){
  const u=document.getElementById('sell-urgent-block');if(u)u.style.display='block';
  const f=document.getElementById('sell-urgent-fields');if(f)f.style.display='block';
  const h=document.getElementById('sell-title-header');if(h)h.textContent='🔥 فروش فوری';
  const b=document.getElementById('sell-submit');if(b){b.textContent='🔥 منتشر فوری';b.className='btn-red'}
}
function disableUrgentSellMode(){
  const u=document.getElementById('sell-urgent-block');if(u)u.style.display='none';
  const f=document.getElementById('sell-urgent-fields');if(f)f.style.display='none';
  const h=document.getElementById('sell-title-header');if(h)h.textContent='💰 ثبت فروش';
  const b=document.getElementById('sell-submit');if(b){b.textContent='📤 منتشر کن';b.className='btn-primary'}
}
function switchAuthTab(tab){
var tabLogin = document.getElementById('tab-login'); var tabRegister = document.getElementById('tab-register');
var formLogin = document.getElementById('form-login'); var formRegister = document.getElementById('form-register');
if(tab === 'login'){ tabLogin.classList.add('active'); tabRegister.classList.remove('active'); formLogin.style.display = 'block'; formRegister.style.display = 'none'; }
else { tabLogin.classList.remove('active'); tabRegister.classList.add('active'); formLogin.style.display = 'none'; formRegister.style.display = 'block'; }
}
async function doLoginWithPassword(){
var phone = document.getElementById('auth-phone').value.trim(); var password = document.getElementById('auth-password').value;
if(!/^09\d{9}$/.test(phone)){ toast('شماره معتبر وارد کن'); return; }
if(!password || password.length < 6){ toast('پسورد حداقل ۶ کاراکتر'); return; }
var result = null; try { result = await api.loginWithPassword(phone, password); } catch(e){}
if(result && result.ok && result.user){
DB.user = { phone: result.user.phone, name: result.user.name, role: result.user.role, avatar: result.user.avatar || null, joinedAt: Number(result.user.joined_at) || Date.now() };
if(result.user.avatar && result.user.avatar.length < 100000){ DB.user.avatar = result.user.avatar; }
toast('✓ خوش آمدید ' + result.user.name); go('home');
} else if(result && result.error){ toast(result.error); } else { toast('خطا در ورود'); }
}
async function doRegister(){
var phone = document.getElementById('reg-phone').value.trim(); var name = document.getElementById('reg-name').value.trim();
var role = document.getElementById('reg-role').value; var password = document.getElementById('reg-password').value; var password2 = document.getElementById('reg-password2').value;
if(!/^09\d{9}$/.test(phone)){ toast('شماره معتبر وارد کن'); return; }
if(name.length < 3){ toast('نام را وارد کن'); return; }
if(!password || password.length < 6){ toast('پسورد حداقل ۶ کاراکتر'); return; }
if(password !== password2){ toast('پسوردها یکسان نیستند'); return; }
var result = null; try { result = await api.register(phone, name, role, password); } catch(e){}
if(result && result.ok && result.user){
DB.user = { phone: result.user.phone, name: result.user.name, role: result.user.role, avatar: result.user.avatar || null, joinedAt: Number(result.user.joined_at) || Date.now() };
var roles = DB.userRoles; if(!roles[phone]) roles[phone] = []; if(roles[phone].indexOf(role) < 0) roles[phone].push(role); DB.userRoles = roles;
toast('✓ ثبت‌نام موفق'); go('home');
} else if(result && result.error){ toast(result.error); } else { toast('خطا در ثبت‌نام'); }
}
async function changePasswordDialog(){
var u = DB.user; if(!u){ toast('اول وارد شو'); return; }
var oldPass = prompt('پسورد فعلی رو وارد کن:'); if(!oldPass) return;
var newPass = prompt('پسورد جدید (حداقل ۶ کاراکتر):'); if(!newPass || newPass.length < 6){ toast('پسورد جدید حداقل ۶ کاراکتر'); return; }
var newPass2 = prompt('تکرار پسورد جدید:'); if(newPass2 !== newPass){ toast('پسوردها یکسان نیستند'); return; }
var result = null; try { result = await api.changePassword(u.phone, oldPass, newPass); } catch(e){}
if(result && result.ok){ toast('✓ پسورد تغییر کرد'); } else if(result && result.error){ toast(result.error); } else { toast('خطا در تغییر پسورد'); }
}
async function setSecurityDialog(){
var u = DB.user; if(!u){ toast('اول وارد شو'); return; }
var questions = ['اسم اولین حیوان خانگی‌ت چی بود؟','اسم اولین معلمت چی بود؟','توی کدوم شهر به دنیا اومدی؟','اسم بهترین دوست دوران کودکیت چی بود؟','اولین ماشینی که سوارش شدی چی بود؟'];
var questionText = '۱. ' + questions[0] + '\n' + '۲. ' + questions[1] + '\n' + '۳. ' + questions[2] + '\n' + '۴. ' + questions[3] + '\n' + '۵. ' + questions[4] + '\n\n' + 'شماره سوال رو انتخاب کن (۱ تا ۵):';
var choice = prompt(questionText); if(!choice) return;
var idx = parseInt(choice) - 1; if(idx < 0 || idx >= questions.length){ toast('شماره اشتباه'); return; }
var answer = prompt('جواب سوال:'); if(!answer || answer.length < 2){ toast('جواب حداقل ۲ کاراکتر'); return; }
var result = null; try { result = await api.setSecurity(u.phone, questions[idx], answer); } catch(e){}
if(result && result.ok){ toast('✓ سوال امنیتی ذخیره شد'); } else if(result && result.error){ toast(result.error); } else { toast('خطا در ذخیره'); }
}
async function forgotPasswordDialog(){
var phone = prompt('شماره موبایلت رو وارد کن:'); if(!phone || !/^09\d{9}$/.test(phone)){ toast('شماره معتبر وارد کن'); return; }
var result = null; try { result = await api.getSecurityQuestion(phone); } catch(e){}
if(!result || !result.question){ if(result && result.error){ toast(result.error); } else { toast('سوال امنیتی برای این شماره ثبت نشده'); } return; }
var answer = prompt(result.question); if(!answer) return;
var newPass = prompt('پسورد جدید (حداقل ۶ کاراکتر):'); if(!newPass || newPass.length < 6){ toast('پسورد جدید حداقل ۶ کاراکتر'); return; }
var newPass2 = prompt('تکرار پسورد جدید:'); if(newPass2 !== newPass){ toast('پسوردها یکسان نیستند'); return; }
var recoverResult = null; try { recoverResult = await api.recoverPassword(phone, answer, newPass); } catch(e){}
if(recoverResult && recoverResult.ok){ toast('✓ پسورد بازیابی شد، حالا وارد شو'); } else if(recoverResult && recoverResult.error){ toast(recoverResult.error); } else { toast('خطا در بازیابی'); }
}
async function doLogin(){
var phone=document.getElementById('auth-phone').value.trim(); var name=document.getElementById('auth-name').value.trim(); var role=document.getElementById('auth-role').value;
if(!/^09\d{9}$/.test(phone)){toast('شماره معتبر وارد کنید');return}
if(name.length<3){toast('نام را وارد کنید');return}
var result = await api.login(phone, name, role, null);
if(result && result.user && result.user.avatar){ DB.user.avatar = result.user.avatar; }
var prev=DB.user; DB.user={phone:phone,name:name,role:role,avatar:prev&&prev.avatar?prev.avatar:null,joinedAt:Date.now()};
var roles=DB.userRoles; if(!roles[phone])roles[phone]=[]; if(roles[phone].indexOf(role)<0)roles[phone].push(role); DB.userRoles=roles;
if(result && result.user){ toast('✓ خوش آمدید '+name); } else { toast('⚠ سرور پاسخ نداد، حالت محلی'); }
go('home');
}

/* مودال حذف حساب */
function confirmDeleteAccount() {
  if (!DB.user) return;
  var inputEl = document.getElementById('delete-confirm-input');
  if (inputEl) inputEl.value = '';
  document.getElementById('delete-account-modal').classList.add('show');
}

function closeDeleteModal() {
  document.getElementById('delete-account-modal').classList.remove('show');
}

async function executeDeleteAccount() {
  var inputVal = document.getElementById('delete-confirm-input').value.trim();
  if (inputVal !== 'حذف') {
    toast('لطفاً کلمه «حذف» را دقیقاً وارد کنید');
    return;
  }
 
  var btn = document.getElementById('btn-confirm-delete');
  btn.textContent = 'در حال حذف...';
  btn.disabled = true;
 
  var u = DB.user;
  try {
    try { await api.deleteAccount(u.phone); } catch(e) {}
   
    ['user','listings','demands','requests','ratings','convs','msgs','trades','interests','notifs','capacities','bookings','missions','userRoles'].forEach(function(k){
      localStorage.removeItem(DB_VERSION + '.' + k);
    });
   
    DB.user = null;
    closeDeleteModal();
    toast('✓ حساب شما با موفقیت حذف شد');
   
    setTimeout(function() {
      btn.textContent = 'تایید و حذف دائمی';
      btn.disabled = false;
      go('auth');
    }, 1500);
   
  } catch(err) {
    toast('خطا در حذف حساب');
    btn.textContent = 'تایید و حذف دائمی';
    btn.disabled = false;
  }
}

function logout(){DB.user=null;currentConvId=null;currentCapacityId=null;go('auth')}
var _mapPicker = null; var _mapMarker = null; var _tempListingLocation = null;
function toggleMapPicker(){
var wrap=document.getElementById('map-picker'); var help=document.getElementById('map-help'); var btn=document.getElementById('map-toggle-btn');
if(wrap.style.display==='none'){
wrap.style.display='block'; help.style.display='block'; btn.innerHTML='<span>❌ بستن نقشه</span>';
setTimeout(function(){
if(!_mapPicker){
_mapPicker = L.map('map-picker').setView([32.4279, 53.6880], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(_mapPicker);
_mapPicker.on('click', function(e){ var lat = e.latlng.lat; var lng = e.latlng.lng; if(_mapMarker) _mapMarker.remove(); _mapMarker = L.marker([lat, lng]).addTo(_mapPicker); _tempListingLocation = { lat: lat, lng: lng }; });
}
_mapPicker.invalidateSize();
}, 100);
} else { wrap.style.display='none'; help.style.display='none'; btn.innerHTML='<span>🗺️ انتخاب موقعیت روی نقشه</span>'; }
}
async function pickListingPhotos(){
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.multiple = true;
  
  inp.onchange = async function(){
    var files = inp.files;
    if(!files || !files.length) return;

    var currentPhotos = window._tempListingPhotos || [];
    var remaining = 3 - currentPhotos.length;
    if(remaining <= 0){ toast('حداکثر ۳ عکس'); return; }

    var toProcess = Math.min(files.length, remaining);
    toast('در حال آپلود عکس...');

    for(var i=0; i<toProcess; i++){
      try {
        // ۱. فشرده‌سازی عکس
        var base64Data = await compressImage(files[i], 800, 0.7);
        if(!base64Data) continue;

        // ۲. تبدیل base64 به Blob
        var response = await fetch(base64Data);
        var blob = await response.blob();

        // ۳. آپلود به Supabase Storage
        var fileName = 'listing_' + Date.now() + '_' + i + '.jpg';
        var uploadResult = await supabaseClient.storage
          .from('listings')
          .upload(fileName, blob);

        if(uploadResult.error) {
          console.error(uploadResult.error);
          toast('خطا در آپلود عکس');
          continue;
        }

        // ۴. دریافت لینک عمومی
        var publicUrlResult = supabaseClient.storage
          .from('listings')
          .getPublicUrl(fileName);

        if(publicUrlResult && publicUrlResult.data && publicUrlResult.data.publicUrl) {
          currentPhotos.push(publicUrlResult.data.publicUrl);
        } else {
          currentPhotos.push(base64Data); // فال‌بک در صورت خطا
        }

      } catch(e) {
        console.error(e);
        toast('خطا در پردازش عکس');
      }
    }

    window._tempListingPhotos = currentPhotos;
    renderSellPhotoPreviews();
    if(currentPhotos.length > 0) toast('✓ عکس‌ها با موفقیت آپلود شدند');
  };
  
  inp.click();
}

function renderSellPhotoPreviews(){
var wrap=document.getElementById('sell-photos-preview'); if(!wrap)return;
var photos=window._tempListingPhotos||[];
if(!photos.length){wrap.innerHTML='';return}
wrap.innerHTML=photos.map(function(p,i){ return '<div class="photo-preview-item"><img src="'+p+'"><button type="button" class="photo-remove" onclick="removeSellPhoto('+i+')">×</button></div>'; }).join('');
}
function removeSellPhoto(index){
var photos=window._tempListingPhotos||[]; photos.splice(index,1); window._tempListingPhotos=photos; renderSellPhotoPreviews();
}
async function pickAvatar(){
var u=DB.user;if(!u)return;
var inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
inp.onchange=async function(){
var f=inp.files&&inp.files[0]; if(!f)return;
try{
var d=await compressImage(f,400,0.7); if(!d){toast('خطا در پردازش عکس');return}
u.avatar=d; DB.user=u;
var result=null; try{result=await api.updateAvatar(u.phone,d)}catch(e){}
if(result&&result.ok){toast('✓ عکس ذخیره شد')} else{toast('⚠ محلی ذخیره شد')}
renderHeaderAvatars(); renderProfile();
}catch(e){ toast('خطا در آپلود'); }
};
inp.click();
}
function renderHomeSkeleton(){
var el = document.getElementById('home-listings'); if(!el) return;
var html = ''; for(var i=0;i<3;i++){ html += '<div class="skeleton-card"><div class="skeleton-photo"></div><div class="skeleton-line medium"></div><div class="skeleton-line short"></div></div>'; }
el.innerHTML = html;
}
function renderBrowseSkeleton(){
var grid = document.getElementById('browse-grid'); if(!grid) return;
var html = ''; for(var i=0;i<4;i++){ html += '<div class="skeleton-card-grid"><div class="skeleton-photo"></div><div class="skeleton-line medium"></div><div class="skeleton-line short"></div></div>'; }
grid.innerHTML = html;
}
async function renderHome(){
  renderHomeSkeleton();
  
  var result = await api.getListings();
  var list = (result && result.listings) ? result.listings : DB.listings;
  
  // --- محاسبه نبض بازار (میانگین قیمت) ---
  try {
    var sheepListings = list.filter(l => l.title.includes('گوسفند') || l.title.includes('میش'));
    var wheatListings = list.filter(l => l.title.includes('گندم'));
    var feedListings = list.filter(l => l.title.includes('کنسانتره'));
    
    var avg = (arr) => arr.length ? Math.round(arr.reduce((a,b) => a + Number(b.price), 0) / arr.length) : 0;
    
    document.getElementById('pulse-sheep').textContent = sheepListings.length ? faPrice(avg(sheepListings)) + ' تومان' : 'نامشخص';
    document.getElementById('pulse-wheat').textContent = wheatListings.length ? faPrice(avg(wheatListings)) + ' تومان' : 'نامشخص';
    document.getElementById('pulse-feed').textContent = feedListings.length ? faPrice(avg(feedListings)) + ' تومان' : 'نامشخص';
  } catch(e) { console.warn('Pulse error:', e); }

  // --- بقیه کدهای نمایش آگهی‌ها ---
  list = list.map(function(l){ return { id: l.id, sellerPhone: l.seller_phone, sellerName: l.seller_name, categoryId: l.category_id, title: l.title, qty: l.qty, qtyNum: l.qty_num, price: Number(l.price), oldPrice: l.old_price ? Number(l.old_price) : null, region: l.region, desc: l.description, urgent: l.urgent, urgentReason: l.urgent_reason, productKey: l.product_key, photos: l.photos || [], location: (l.location_lat && l.location_lng) ? { lat: Number(l.location_lat), lng: Number(l.location_lng) } : (l.location || null), createdAt: Number(l.created_at) }; });
  list.sort(function(a,b){return b.createdAt-a.createdAt}); list = list.slice(0,6);
  var el=document.getElementById('home-listings'); if(!el)return;
  el.innerHTML = list.length ? list.map(homeCard).join('') : '<div class="empty"><span class="emoji">🌾</span>آگهی‌ای نیست</div>';
}

function homeCard(l){
  const cat=catOf(l.categoryId);
  const photo=(l.photos&&l.photos.length)?l.photos[0]:PLACEHOLDER;
  var favActive = isFavorite(l.id) ? 'active' : ''; var favIcon = isFavorite(l.id) ? '♥' : '♡';
var photoHTML='<div class="card-photo"><img src="'+photo+'">'+(l.photos&&l.photos.length>1?'<span class="count">'+faDigits(l.photos.length)+'</span>':'')+'<button type="button" class="fav-btn '+favActive+'" onclick="event.stopPropagation();toggleFavorite(\''+l.id+'\')">'+favIcon+'</button></div>';
  const uBadge=l.urgent?'<div style="background:#ffe0e3;color:var(--fire);font-size:12px;font-weight:900;padding:4px 10px;border-radius:100px;display:inline-block;margin-bottom:6px">🔥 فوری</div>':'';
  const disc=l.oldPrice&&l.price<l.oldPrice?'<div style="background:var(--fire);color:#fff;font-size:12px;font-weight:900;padding:3px 8px;border-radius:100px;margin-bottom:6px;display:inline-block">تخفیف</div>':'';
  const priceHTML=l.oldPrice&&l.price<l.oldPrice?'<div><div style="font-size:13px;color:var(--muted);text-decoration:line-through;direction:ltr">'+faPrice(l.oldPrice)+'</div><div style="font-weight:900;color:var(--fire);font-size:18px;direction:ltr">'+faPrice(l.price)+'</div></div>':'<div style="font-weight:900;color:var(--forest);font-size:18px;direction:ltr">'+faPrice(l.price)+'</div><div style="font-size:11px;color:var(--muted)">تومان</div>';
  return '<div class="card" onclick="openDetail(\''+l.id+'\',\'home\')" style="cursor:pointer"><div class="card-with-photo">'+photoHTML+'<div style="flex:1;min-width:0">'+uBadge+'<b>'+cat.icon+' '+l.title+'</b><small>'+l.sellerName+' · '+l.region+'<br>'+l.qty+' · '+timeAgo(l.createdAt)+'</small></div><div style="text-align:left;flex-shrink:0">'+disc+priceHTML+'</div></div></div>';
}
function renderBrowseChips(){
  const el=document.getElementById('browse-chips');if(!el)return;
  const all=[{id:'all',short:'همه',icon:'🏷️'},{id:'urgent',short:'فوری',icon:'🔥'}].concat(CATEGORIES);
  el.innerHTML=all.map(c=>'<button type="button" class="chip-big'+(browseCategory===c.id?' active':'')+'" onclick="pickBrowseCat(\''+c.id+'\')"><span class="ic">'+c.icon+'</span>'+c.short+'</button>').join('');
}
function pickBrowseCat(id){browseCategory=id;renderBrowse()}
function filterBrowse(v){browseSearch=v.toLowerCase();const c=document.getElementById('browse-clear');if(c)c.hidden=!v;renderBrowse()}
var _browseFilters = { priceMin: 0, priceMax: 0, region: '' };
function toggleFilterPanel(){
var panel = document.getElementById('browse-filter-panel'); if(!panel) return;
panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}
function applyFilters(){
var minInput = document.getElementById('filter-price-min'); var maxInput = document.getElementById('filter-price-max'); var regionInput = document.getElementById('filter-region');
_browseFilters.priceMin = Number((minInput.value || '0').replace(/[^\d]/g,'')) || 0;
_browseFilters.priceMax = Number((maxInput.value || '0').replace(/[^\d]/g,'')) || 0;
_browseFilters.region = (regionInput.value || '').trim();
renderBrowse(); toast('فیلتر اعمال شد');
}
function clearFilters(){
var minInput = document.getElementById('filter-price-min'); var maxInput = document.getElementById('filter-price-max'); var regionInput = document.getElementById('filter-region');
if(minInput) minInput.value = ''; if(maxInput) maxInput.value = ''; if(regionInput) regionInput.value = '';
_browseFilters = { priceMin: 0, priceMax: 0, region: '' }; renderBrowse(); toast('فیلتر پاک شد');
}
function clearBrowseSearch(){const s=document.getElementById('browse-search');if(s)s.value='';browseSearch='';const c=document.getElementById('browse-clear');if(c)c.hidden=true;renderBrowse()}
function browseCard(l){
const cat=catOf(l.categoryId); const photo=(l.photos&&l.photos.length)?l.photos[0]:PLACEHOLDER;
const fire=l.urgent?'<div class="badge-fire">🔥</div>':'';
const priceHTML=l.oldPrice&&l.price<l.oldPrice?'<span class="old">'+faPrice(l.oldPrice)+'</span>'+faPrice(l.price):faPrice(l.price);
var favActive = isFavorite(l.id) ? 'active' : ''; var favIcon = isFavorite(l.id) ? '♥' : '♡';
return '<div class="browse-card" onclick="openDetail(\''+l.id+'\',\'browse\')"><div class="thumb"><img src="'+photo+'">'+fire+'<button type="button" class="fav-btn '+favActive+'" onclick="event.stopPropagation();toggleFavorite(\''+l.id+'\')">'+favIcon+'</button></div><div class="body"><div class="title">'+cat.icon+' '+l.title+'</div><div class="region">📍 '+l.region+'</div><div class="price-big">'+priceHTML+' <span class="unit">تومان</span></div></div></div>';
}
async function renderBrowse(){
  renderBrowseSkeleton(); renderBrowseChips();
var ss=document.getElementById('browse-search'); if(ss&&ss.value!==browseSearch)ss.value=browseSearch;
var bc=document.getElementById('browse-clear'); if(bc)bc.hidden=!browseSearch;
var result = null; try { result = await api.getListings(); } catch(e) { console.warn(e.message); }
var list = (result && result.listings) ? result.listings : DB.listings;
list = list.map(function(l){ return { id: l.id, sellerPhone: l.seller_phone || l.sellerPhone, sellerName: l.seller_name || l.sellerName, categoryId: l.category_id || l.categoryId, title: l.title, qty: l.qty, qtyNum: l.qty_num || l.qtyNum, price: Number(l.price), oldPrice: l.old_price ? Number(l.old_price) : (l.oldPrice ? Number(l.oldPrice) : null), region: l.region, desc: l.description || l.desc, urgent: l.urgent, urgentReason: l.urgent_reason || l.urgentReason, productKey: l.product_key || l.productKey, photos: l.photos || [], location: (l.location_lat && l.location_lng) ? { lat: Number(l.location_lat), lng: Number(l.location_lng) } : (l.location || null), createdAt: Number(l.created_at || l.createdAt) }; });
list = list.filter(function(l){
if(browseCategory==='urgent'){if(!l.urgent)return false} else if(browseCategory!=='all'&&l.categoryId!==browseCategory)return false;
if(browseSearch){ var hay=(l.title+' '+(l.desc||'')+' '+l.region+' '+l.sellerName).toLowerCase(); if(hay.indexOf(browseSearch)<0)return false; }
if(_browseFilters.priceMin > 0 && l.price < _browseFilters.priceMin) return false;
if(_browseFilters.priceMax > 0 && l.price > _browseFilters.priceMax) return false;
if(_browseFilters.region){ var regionHay = (l.region || '').toLowerCase(); if(regionHay.indexOf(_browseFilters.region.toLowerCase()) < 0) return false; }
return true;
});
list.sort(function(a,b){return b.createdAt-a.createdAt});
var grid=document.getElementById('browse-grid');
if(grid){ grid.innerHTML = list.length ? list.map(browseCard).join('') : '<div class="empty" style="grid-column:1/-1"><span class="emoji">🔍</span>آگهی‌ای پیدا نشد</div>'; }
}
function goServicesStep1(){
  servicesStep=1; servicesCurrentService=null; servicesCurrentType=null;
  const back=document.getElementById('services-back');if(back)back.style.display='none';
  const title=document.getElementById('services-title');if(title)title.textContent='🚛 چه کاری برایت انجام بدهیم؟';
  renderServices();
}
function goServicesStep2(serviceId){
  servicesStep=2; servicesCurrentService=serviceId;
  const back=document.getElementById('services-back');if(back)back.style.display='block';
  const s=serviceOf(serviceId); const title=document.getElementById('services-title');if(title)title.textContent=s.icon+' '+s.title+' — کدام؟';
  renderServices();
}
function goServicesStep3(serviceId,typeId){
  servicesStep=3; servicesCurrentService=serviceId; servicesCurrentType=typeId;
  const back=document.getElementById('services-back');if(back)back.style.display='block';
  const t=serviceTypeOf(serviceId,typeId); const title=document.getElementById('services-title');if(title)title.textContent=t.icon+' '+t.label;
  renderServices();
}
function servicesBack(){
  if(servicesStep===3)goServicesStep2(servicesCurrentService); else if(servicesStep===2)goServicesStep1();
}
function renderServices(){
  const el=document.getElementById('services-content'); if(!el)return;
  if(servicesStep===1)renderServicesStep1(el); else if(servicesStep===2)renderServicesStep2(el); else renderServicesStep3(el);
}
function renderServicesStep1(el){
  el.innerHTML='<div class="service-grid">'+SERVICES.map(s=>{ const cnt=DB.capacities.filter(c=>c.serviceType===s.id).length; return '<div class="service-step-card" onclick="goServicesStep2(\''+s.id+'\')"><div class="ic">'+s.icon+'</div><div class="t">'+s.title+'</div><div class="cnt">'+faDigits(cnt)+' نفر</div></div>'; }).join('')+'</div>';
}
function renderServicesStep2(el){
  const s=serviceOf(servicesCurrentService);
  el.innerHTML='<div class="service-grid">'+s.types.map(t=>{ const cnt=DB.capacities.filter(c=>c.serviceType===s.id&&c.typeId===t.id).length; return '<div class="service-step-card" onclick="goServicesStep3(\''+s.id+'\',\''+t.id+'\')"><div class="ic">'+t.icon+'</div><div class="t">'+t.label+'</div><div class="cnt">'+faDigits(cnt)+' نفر</div></div>'; }).join('')+'</div>';
}
async function renderServicesStep3(el){
  var result = null; 
  try { result = await api.getCapacities(); } catch(e) {}
  
  var list = (result && result.capacities) ? result.capacities : DB.capacities;
  
  // 👇 این بخش جدید: دریافت خدمات‌دهنده‌های آنلاین 👇
  var onlineProviders = [];
  try {
    var readyRes = await fetch('https://taraz-backend-prog.vercel.app/api/ready/' + servicesCurrentService);
    var readyData = await readyRes.json();
    if (readyData && readyData.profiles) {
      onlineProviders = readyData.profiles;
    }
  } catch(e) { console.warn('Ready fetch error:', e); }
  
  // فیلتر کردن ظرفیت‌های موجود (مثل قبل)
  list = list.map(function(c){ /* ... کد قبلی ... */ });
  list = list.filter(function(c){ /* ... کد قبلی ... */ });
  
  // 👇 نمایش خدمات‌دهنده‌های آنلاین در بالای لیست 👇
  var onlineHtml = '';
  if (onlineProviders.length > 0) {
    onlineHtml = '<div style="padding: 0 16px 16px;"><h3 style="font-size:16px;color:#16a34a;margin-bottom:8px;">🟢 آنلاین و آماده</h3>';
    onlineHtml += onlineProviders.map(function(p) {
      return '<div class="card" style="border-color:#cfe5da;background:#eef8f3;">' +
             '<b style="color:var(--forest);">' + p.name + '</b>' +
             '<small style="display:block;margin-top:4px;">📍 ' + p.region + (p.notes ? ' · ' + p.notes : '') + '</small>' +
             '</div>';
    }).join('');
    onlineHtml += '</div>';
  }
  
  if(!list.length && !onlineProviders.length){ 
    el.innerHTML = '<div class="empty"><span class="emoji">😔</span>هنوز کسی ثبت نشده<br><button type="button" class="btn-blue" style="margin-top:20px;max-width:280px;margin-left:auto;margin-right:auto" onclick="openCreateCapacity()">➕ من این کار را می‌کنم</button></div>'; 
    return; 
  }
  
  el.innerHTML = onlineHtml + '<div style="padding:8px 0 30px">' + list.map(function(c){ return capacityBigCard(c); }).join('') + '<div style="text-align:center;margin-top:20px"><button type="button" class="btn-blue" style="max-width:280px;margin:0 auto" onclick="openCreateCapacity()">➕ من هم این کار را می‌کنم</button></div></div>';
}

function capacityBigCard(c){
var s=serviceOf(c.serviceType); var t=serviceTypeOf(c.serviceType,c.typeId);
var free=Number(c.capacityTotal||0) - Number(c.capacityUsed||0);
var route=(c.routeFrom&&c.routeTo) ? (c.routeFrom+' ← '+c.routeTo) : c.region;
var full=free<=0;
return '<div class="capacity-big-card" onclick="openCapacity(\''+c.id+'\',\'services\')"><div class="head"><div class="avatar-big">'+t.icon+'</div><div class="info"><div class="name">'+c.ownerName+'</div><div class="route">📍 '+route+'</div></div></div><div class="avail-line '+(full?'full':'')+'">'+(full?'ظرفیت تکمیل':'✅ '+faDigits(free)+' '+c.unit+' آزاد')+'</div><div class="price-line"><span class="lbl">قیمت هر '+c.unit+'</span><span class="val">'+faPrice(c.price)+'</span></div><button type="button" class="reserve-btn" '+(full?'disabled':'')+' onclick="event.stopPropagation();openCapacity(\''+c.id+'\',\'services\')">'+(full?'تکمیل':'رزرو کن 📅')+'</button></div>';
}
function openCapacity(id,returnTo){ capacityReturnTo=returnTo||currentScreen||'services'; currentCapacityId=id; go('capacity'); }
function renderCapacityDetail(){
  const c=DB.capacities.find(x=>x.id===currentCapacityId); if(!c){go('services');return}
  const s=serviceOf(c.serviceType); const t=serviceTypeOf(c.serviceType,c.typeId);
  const free=c.capacityTotal-c.capacityUsed; const route=c.routeFrom&&c.routeTo?c.routeFrom+' ← '+c.routeTo:c.region;
  const u=DB.user; const isMine=u&&u.phone===c.ownerPhone;
  const title=document.getElementById('capacity-title');if(title)title.textContent=t.icon+' '+t.label;
  let actionBlock='';
  if(isMine){
    actionBlock='<button type="button" class="btn-red" onclick="deleteCapacity(\''+c.id+'\')" style="margin-top:16px">حذف ظرفیت</button>';
    const bks=DB.bookings.filter(b=>b.capacityId===c.id);
    if(bks.length){ actionBlock+='<div style="margin-top:20px"><h2 style="font-size:20px;margin:0 0 12px 16px">📨 رزروها</h2>'; actionBlock+=bks.map(b=>'<div class="booking-card"><div class="head"><b>'+b.customerName+'</b><span class="status '+b.status+'">'+(b.status==='pending'?'در انتظار':b.status==='confirmed'?'تأیید':'تکمیل')+'</span></div><small>'+faDigits(b.qty)+' '+c.unit+' · '+faPrice(b.total)+' تومان<br>'+timeAgo(b.createdAt)+'</small>'+(b.status==='pending'?'<button type="button" class="btn-green" style="margin-top:12px;padding:14px" onclick="acceptBooking(\''+b.id+'\')">تأیید</button>':'')+(b.status==='confirmed'?'<button type="button" class="btn-blue" style="margin-top:12px;padding:14px" onclick="completeBooking(\''+b.id+'\')">تکمیل شد</button>':'')+'</div>').join(''); actionBlock+='</div>'; }
  } else if(free>0){ actionBlock='<div class="field"><label>چقدر می‌خواهی؟</label><input id="book-qty" type="tel" inputmode="numeric" placeholder="مثلاً: ۵" style="direction:ltr;text-align:left"></div><button type="button" class="btn-green" onclick="submitBooking(\''+c.id+'\')" style="min-height:64px;font-size:18px">📅 رزرو کن</button>'; } else { actionBlock='<div class="card" style="background:#ffe0e3;border-color:#f5c8cc;text-align:center"><b style="color:var(--fire);font-size:17px">ظرفیت تکمیل است</b></div>'; }
  const body=document.getElementById('capacity-detail-body');
  body.innerHTML='<div class="capacity-big-card" style="cursor:default;margin:0 16px 0"><div class="head"><div class="avatar-big">'+t.icon+'</div><div class="info"><div class="name">'+c.ownerName+'</div><div class="route">📍 '+route+'</div></div></div><div class="avail-line '+(free<=0?'full':'')+'">'+(free>0?'✅ '+faDigits(free)+' '+c.unit+' آزاد':'ظرفیت تکمیل')+'</div><div class="price-line"><span class="lbl">قیمت هر '+c.unit+'</span><span class="val">'+faPrice(c.price)+'</span></div></div><div style="padding:0 16px 16px">'+actionBlock+'</div>';
}
function submitBooking(capacityId){
  const u=DB.user;if(!u){go('auth');return}
  const c=DB.capacities.find(x=>x.id===capacityId);if(!c)return;
  const inp=document.getElementById('book-qty'); const qtyStr=inp?inp.value.trim():'';
  if(!qtyStr){toast('مقدار را وارد کن');return}
  const qty=extractQtyNum(qtyStr); if(qty<=0){toast('مقدار معتبر وارد کن');return}
  const free=c.capacityTotal-c.capacityUsed; if(qty>free){toast('حداکثر '+faDigits(free)+' '+c.unit);return}
  const total=qty*c.price;
  const booking={id:'B'+Date.now(),capacityId:c.id,customerPhone:u.phone,customerName:u.name,qty:qty,total:total,status:'pending',createdAt:Date.now()};
  const all=DB.bookings;all.push(booking);DB.bookings=all;
  const caps=DB.capacities;const idx=caps.findIndex(x=>x.id===c.id); if(idx>=0){caps[idx].capacityUsed+=qty;DB.capacities=caps}
  addNotification({type:'booking',icon:'📅',title:'رزرو ثبت شد',body:c.title+' — '+faDigits(qty)+' '+c.unit});
  toast('رزرو شد ✓'); renderCapacityDetail();
}
function acceptBooking(id){ const b=DB.bookings.find(x=>x.id===id);if(!b)return; b.status='confirmed';DB.bookings=DB.bookings; toast('تأیید شد ✓'); renderCapacityDetail(); }
function completeBooking(id){ const b=DB.bookings.find(x=>x.id===id);if(!b)return; b.status='done';DB.bookings=DB.bookings; toast('تکمیل شد ✓'); renderCapacityDetail(); }
function deleteCapacity(id){ if(!confirm('حذف شود؟'))return; DB.capacities=DB.capacities.filter(x=>x.id!==id); toast('حذف شد'); go('services'); }
function openCreateCapacity(){
  const u=DB.user;if(!u){go('auth');return}
  const html='<div class="modal-overlay show" id="create-cap-modal" onclick="if(event.target===this)closeCreateCapacity()"><div class="modal" onclick="event.stopPropagation()"><h3>➕ ثبت شغل من</h3><div class="sub">اگر راننده، کمباین‌دار، دامپزشک یا قصاب هستی اینجا ثبت کن</div><div class="field"><label>چه کاری؟</label><select id="cap-service" onchange="updateCapTypes()">'+SERVICES.map(s=>'<option value="'+s.id+'">'+s.icon+' '+s.title+'</option>').join('')+'</select></div><div class="field"><label>دقیقاً چه؟</label><select id="cap-type"></select></div><div class="field"><label>اسم شغل / وسیله</label><input id="cap-title" placeholder="مثلاً: کامیون یخچال‌دار"></div><div class="field"><label>کجایی؟</label><input id="cap-region" placeholder="مثلاً: اصفهان"></div><div class="field"><label>مسیر (اختیاری)</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><input id="cap-from" placeholder="از"><input id="cap-to" placeholder="به"></div></div><div class="field"><label>چقدر ظرفیت داری؟</label><input id="cap-total" type="tel" inputmode="numeric" placeholder="مثلاً: ۱۵" style="direction:ltr;text-align:left"></div><div class="field"><label>قیمت هر واحد (تومان)</label><input id="cap-price" type="tel" inputmode="numeric" placeholder="مثلاً: ۳۵۰۰۰۰" style="direction:ltr;text-align:left"></div><div class="field"><label>از چه تاریخی آزادی؟</label><input id="cap-from-date" type="date"></div><button type="button" class="btn-green" onclick="submitCreateCapacity()" style="min-height:60px;font-size:17px">✅ ثبت کن</button><button type="button" class="btn-outline" onclick="closeCreateCapacity()">انصراف</button></div></div>';
  document.body.insertAdjacentHTML('beforeend',html); updateCapTypes();
}
function closeCreateCapacity(){const m=document.getElementById('create-cap-modal');if(m)m.remove()}
function updateCapTypes(){ const sv=document.getElementById('cap-service');if(!sv)return; const s=serviceOf(sv.value); const sel=document.getElementById('cap-type');if(!sel)return; sel.innerHTML=s.types.map(t=>'<option value="'+t.id+'">'+t.icon+' '+t.label+'</option>').join(''); }
async function submitCreateCapacity(){
var u=DB.user;if(!u)return;
var serviceType=document.getElementById('cap-service').value; var typeId=document.getElementById('cap-type').value;
var title=document.getElementById('cap-title').value.trim(); var region=document.getElementById('cap-region').value.trim();
var routeFrom=document.getElementById('cap-from').value.trim(); var routeTo=document.getElementById('cap-to').value.trim();
var total=Number(document.getElementById('cap-total').value.replace(/[^\d]/g,'')); var price=Number(document.getElementById('cap-price').value.replace(/[^\d]/g,''));
var fromDate=document.getElementById('cap-from-date').value;
if(!title){toast('اسم شغل را وارد کن');return} if(!region){toast('منطقه را وارد کن');return} if(!total){toast('ظرفیت را وارد کن');return} if(!price){toast('قیمت را وارد کن');return}
var t=serviceTypeOf(serviceType,typeId); var availableFrom=fromDate?new Date(fromDate).getTime():Date.now();
var cap={ id:'C'+Date.now(), ownerPhone:u.phone, ownerName:u.name, serviceType:serviceType, typeId:typeId, title:title, region:region, routeFrom:routeFrom||null, routeTo:routeTo||null, capacityTotal:total, capacityUsed:0, price:price, unit:t.unit, availableFrom:availableFrom, availableTo:null, meta:{}, rating:0, createdAt:Date.now() };
var result=null; try{result=await api.createCapacity(cap)}catch(e){}
var all=DB.capacities;all.push(cap);DB.capacities=all;
if(result&&result.ok){toast('✓ ثبت شد')}else{toast('⚠ محلی ذخیره شد')}
closeCreateCapacity(); goServicesStep3(serviceType,typeId);
}
function resetSellForm(){
['sell-item-title','sell-qty','sell-price','sell-region','sell-desc','sell-old-price'].forEach(function(id){ var el=document.getElementById(id); if(el)el.value=''; });
window._tempListingPhotos=[]; renderSellPhotoPreviews(); disableUrgentSellMode();
  _tempListingLocation = null; if(_mapMarker){_mapMarker.remove();_mapMarker=null;}
}
async function postListing(){
var u=DB.user;if(!u){go('auth');return}
var catId=document.getElementById('sell-category').value; var title=document.getElementById('sell-item-title').value.trim();
var qtyStr=document.getElementById('sell-qty').value.trim(); var price=Number(document.getElementById('sell-price').value.replace(/[^\d]/g,''));
var region=document.getElementById('sell-region').value.trim(); var desc=document.getElementById('sell-desc').value.trim();
if(!title){toast('اسم محصول را وارد کن');return} if(!qtyStr){toast('مقدار را وارد کن');return} if(!price){toast('قیمت را وارد کن');return} if(!region){toast('منطقه را وارد کن');return}
var qtyNum=extractQtyNum(qtyStr); var pk=productKey(title);
var item={ id:'L'+Date.now(), sellerName:u.name, sellerPhone:u.phone, categoryId:catId, title:title, qty:qtyStr, qtyNum:qtyNum, price:price, region:region, desc:desc, photos: window._tempListingPhotos || [], location: _tempListingLocation || null, productKey:pk, createdAt:Date.now() };
var uBlock=document.getElementById('sell-urgent-block');
if(uBlock&&uBlock.style.display==='block'){ item.urgent=true; item.urgentReason=document.getElementById('sell-urgent-reason').value; var op=Number(document.getElementById('sell-old-price').value.replace(/[^\d]/g,'')); if(op&&op>price)item.oldPrice=op; }
// ذخیره فیلدهای تخصصی (اگر دسته دام بود)
if (catId === 'livestock') {
  var breedEl = document.getElementById('sell-breed');
  var weightEl = document.getElementById('sell-weight');
  var ageEl = document.getElementById('sell-age');
  var vaccineEl = document.getElementById('sell-vaccine');
  
  item.breed = breedEl ? breedEl.value : null;
  item.weight = weightEl ? Number(weightEl.value.replace(/[^\d]/g, '')) : null;
  item.age = ageEl ? Number(ageEl.value.replace(/[^\d]/g, '')) : null;
  item.vaccine = vaccineEl ? vaccineEl.value : null;
}

  var result = await api.createListing(item);
var all=DB.listings;all.push(item);DB.listings=all;
if(result && result.ok){ toast('✓ آگهی منتشر شد'); } else { toast('⚠ آگهی محلی ذخیره شد'); }
  
try {
  await fetch('https://taraz-backend-prog.vercel.app/api/match-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listing_id: item.id,
      route_from: item.region,
      route_to: 'نامشخص', // فعلاً از دیتای آگهی استفاده می‌کنیم
      title: item.title,
      region: item.region
    })
  });
} catch(e) { console.warn('Match alert failed:', e); }

  window._tempListingPhotos = []; _tempListingLocation = null; if(_mapMarker){_mapMarker.remove();_mapMarker=null;}
resetSellForm(); go('home');
}
function submitBuyDemand(){
  const u=DB.user;if(!u){go('auth');return}
  const title=document.getElementById('buy-demand-title').value.trim(); const catId=document.getElementById('buy-demand-category').value;
  const qtyStr=document.getElementById('buy-demand-qty').value.trim(); const price=Number(document.getElementById('buy-demand-price').value.replace(/[^\d]/g,''));
  const region=document.getElementById('buy-demand-region').value.trim();
  if(!title){toast('اسم محصول را وارد کن');return} if(!qtyStr){toast('مقدار را وارد کن');return} if(!price){toast('قیمت را وارد کن');return} if(!region){toast('منطقه را وارد کن');return}
  const qtyNum=extractQtyNum(qtyStr); const pk=productKey(title);
  const demand={id:'D'+Date.now(),buyerPhone:u.phone,buyerName:u.name,categoryId:catId,title:title,productKey:pk,qty:qtyStr,qtyNum:qtyNum,unit:'عدد',price:price,region:region,status:'open',createdAt:Date.now()};
  const all=DB.demands;all.push(demand);DB.demands=all;
  addNotification({type:'demand',icon:'📥',title:'تقاضا ثبت شد',body:title}); toast('ثبت شد ✓');
  ['buy-demand-title','buy-demand-qty','buy-demand-price','buy-demand-region'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''}); go('home');
}
async function openDetail(id,returnTo){
detailReturnTo=returnTo||currentScreen||'home'; currentDetailId=id;
var result=null; try{result=await api.getListings()}catch(e){}
var list=(result&&result.listings)?result.listings:DB.listings;
list=list.map(function(l){ return { id:l.id, sellerPhone:l.seller_phone||l.sellerPhone, sellerName:l.seller_name||l.sellerName, categoryId:l.category_id||l.categoryId, title:l.title, qty:l.qty, qtyNum:l.qty_num||l.qtyNum, price:Number(l.price), oldPrice:l.old_price?Number(l.old_price):(l.oldPrice?Number(l.oldPrice):null), region:l.region, desc:l.description||l.desc, urgent:l.urgent, urgentReason:l.urgent_reason||l.urgentReason, productKey:l.product_key||l.productKey, photos:l.photos||[], location: (l.location_lat && l.location_lng) ? { lat: Number(l.location_lat), lng: Number(l.location_lng) } : (l.location || null), createdAt:Number(l.created_at||l.createdAt) }; });
var l=list.find(function(x){return x.id===id}); if(!l){toast('آگهی یافت نشد');return}
var u=DB.user; var isMine=u&&u.phone===l.sellerPhone; var cat=catOf(l.categoryId); var r = await avgRating(l.sellerPhone);
var actionBlock='';
if(isMine){ actionBlock='<button type="button" class="btn-red" onclick="deleteListing(\''+l.id+'\')" style="margin-top:12px">حذف آگهی</button>'; } else { actionBlock='<button type="button" class="btn-green" onclick="openChatWithSeller(\''+l.id+'\')" style="min-height:64px;font-size:18px">💬 تماس با فروشنده</button>'; }
var loc = l.location; var mapHTML = '';
if(loc && loc.lat && loc.lng){ mapHTML = '<div style="margin-top:20px;padding-top:16px;border-top:2px dashed var(--line)"><b style="font-size:15px">📍 موقعیت روی نقشه</b><div id="map-detail" style="height:250px;border-radius:14px;margin-top:10px;border:2px solid #e0e0e0"></div></div>'; }
var body=document.getElementById('detail-body');
body.innerHTML='<div style="padding:16px 16px 0"><div class="detail-card" style="margin:0"><span class="pill" style="display:inline-block;background:#eef8f3;color:var(--accent);font-size:13px;font-weight:900;padding:6px 14px;border-radius:100px">'+cat.icon+' '+cat.short+'</span><div class="detail-title" style="margin-top:14px">'+l.title+'</div><div class="detail-meta">فروشنده: <b>'+l.sellerName+'</b><br>📍 '+l.region+'<br>📦 '+l.qty+'<br>🕒 '+timeAgo(l.createdAt)+'</div>'+(r.count?'<div class="rate-badge-big">⭐ '+faDigits(r.avg.toFixed(1))+' از '+faDigits(r.count)+' نفر</div>':'')+'<div class="detail-price-block">'+(l.oldPrice&&l.price<l.oldPrice?'<div class="old-price">'+faPrice(l.oldPrice)+'</div>':'')+'<div class="lbl">قیمت هر واحد</div><div class="val">'+faPrice(l.price)+'</div>'+(l.oldPrice&&l.price<l.oldPrice?'<div class="discount">🔥 تخفیف ویژه</div>':'')+'</div>'+(l.desc?'<div style="margin-top:20px;padding-top:16px;border-top:2px dashed var(--line)"><b style="font-size:15px">توضیحات</b><div style="font-size:14px;color:var(--muted);margin-top:8px;line-height:2">'+l.desc+'</div></div>':'')+'</div>'+mapHTML+actionBlock+'</div>';
go('detail');
  if(loc && loc.lat && loc.lng){ setTimeout(function(){ if(window._mapDetail){window._mapDetail.remove();} window._mapDetail = L.map('map-detail').setView([loc.lat, loc.lng], 13); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(window._mapDetail); L.marker([loc.lat, loc.lng]).addTo(window._mapDetail); }, 100); }
}
async function deleteListing(id){
if(!confirm('حذف شود؟'))return;
var result=null; try{result=await api.deleteListing(id)}catch(e){}
DB.listings=DB.listings.filter(function(x){return x.id!==id});
if(result&&result.ok){toast('✓ حذف شد')}else{toast('⚠ محلی حذف شد')}
go(detailReturnTo||'home');
}
async function getOrCreateConv(listingId, otherPhone, otherName){
var u = DB.user; if(!u) return null;
var listing = null; try { var res = await api.getListings(); if(res && res.listings){ listing = res.listings.find(function(x){ return x.id === listingId; }); } } catch(e) { }
if(!listing){ listing = DB.listings.find(function(x){ return x.id === listingId; }); }
var isSeller = listing ? (listing.seller_phone === u.phone || listing.sellerPhone === u.phone) : false;
var convData = { id: 'C' + Date.now(), listingId: listingId, listingTitle: listing ? listing.title : 'گفتگو', buyerPhone: isSeller ? otherPhone : u.phone, buyerName: isSeller ? otherName : u.name, sellerPhone: isSeller ? u.phone : otherPhone, sellerName: isSeller ? u.name : otherName };
var result = null; try { result = await api.createConversation(convData); } catch(e) { }
var c = null;
if(result && result.conversation){ c = { id: result.conversation.id, listingId: result.conversation.listing_id || result.conversation.listingId, listingTitle: result.conversation.listing_title || result.conversation.listingTitle, buyerPhone: result.conversation.buyer_phone || result.conversation.buyerPhone, buyerName: result.conversation.buyer_name || result.conversation.buyerName, sellerPhone: result.conversation.seller_phone || result.conversation.sellerPhone, sellerName: result.conversation.seller_name || result.conversation.sellerName, createdAt: Number(result.conversation.created_at || result.conversation.createdAt) || Date.now(), lastMessageAt: Number(result.conversation.last_message_at || result.conversation.lastMessageAt) || Date.now() }; }
else { c = { id: convData.id, listingId: listingId, listingTitle: convData.listingTitle, buyerPhone: convData.buyerPhone, buyerName: convData.buyerName, sellerPhone: convData.sellerPhone, sellerName: convData.sellerName, createdAt: Date.now(), lastMessageAt: Date.now() }; }
var convs = DB.conversations; var idx = convs.findIndex(function(x){ return x.id === c.id; }); if(idx < 0) convs.push(c); else convs[idx] = c; DB.conversations = convs;
return c;
}
async function openChatWithSeller(listingId){
var u = DB.user; if(!u) return;
var listing = null; try { var res = await api.getListings(); if(res && res.listings){ listing = res.listings.find(function(x){ return x.id === listingId; }); } } catch(e) { }
if(!listing){ listing = DB.listings.find(function(x){ return x.id === listingId; }); }
if(!listing){ toast('آگهی یافت نشد'); return; }
var sellerPhone = listing.seller_phone || listing.sellerPhone; var sellerName = listing.seller_name || listing.sellerName;
if(sellerPhone === u.phone){ toast('آگهی خودت است'); return; }
createBuyRequest(listingId);
var c = await getOrCreateConv(listingId, sellerPhone, sellerName); if(c) openChat(c.id);
}
function openChat(convId){ currentConvId = convId; go('chat'); }
async function renderChatList(){
var u = DB.user; if(!u) return;
var result = null; try { result = await api.getConversations(u.phone); } catch(e) { }
var convs = [];
if(result && result.conversations){ convs = result.conversations.map(function(c){ return { id: c.id, listingId: c.listing_id || c.listingId, listingTitle: c.listing_title || c.listingTitle, buyerPhone: c.buyer_phone || c.buyerPhone, buyerName: c.buyer_name || c.buyerName, sellerPhone: c.seller_phone || c.sellerPhone, sellerName: c.seller_name || c.sellerName, createdAt: Number(c.created_at || c.createdAt), lastMessageAt: Number(c.last_message_at || c.lastMessageAt) || Number(c.created_at || c.createdAt) }; }); }
else { convs = DB.conversations.filter(function(c){ return c.buyerPhone === u.phone || c.sellerPhone === u.phone; }); }
convs.sort(function(a,b){ return b.lastMessageAt - a.lastMessageAt; });
var body = document.getElementById('chatlist-body'); if(!body) return;
if(!convs.length){ body.innerHTML = '<div class="empty"><span class="emoji">💬</span>گفتگویی نیست</div>'; return; }
body.innerHTML = convs.map(function(c){ var isSeller = u.phone === c.sellerPhone; var otherName = isSeller ? c.buyerName : c.sellerName; var msgs = DB.messages.filter(function(m){ return m.convId === c.id; }).sort(function(a,b){ return a.createdAt - b.createdAt; }); var last = msgs[msgs.length - 1]; var unread = msgs.filter(function(m){ return m.fromPhone !== u.phone && !m.read; }).length; var preview = last ? ((last.fromPhone === u.phone ? 'شما: ' : '') + (last.text.length > 40 ? last.text.slice(0,40) + '…' : last.text)) : 'شروع گفتگو'; return '<div class="conv-card" onclick="openChat(\'' + c.id + '\')"><div class="conv-avatar">' + initials(otherName) + '</div><div class="conv-main"><div class="conv-name"><span>' + otherName + '</span><span class="conv-time">' + timeAgo(c.lastMessageAt) + '</span></div><div class="conv-preview">' + preview + '</div></div>' + (unread ? '<span class="unread-badge">' + faDigits(unread) + '</span>' : '') + '</div>'; }).join('');
}
async function renderChat(){
var u = DB.user; if(!u || !currentConvId) return;
var c = DB.conversations.find(function(x){ return x.id === currentConvId; }); if(!c){ go('chatlist'); return; }
var isSeller = u.phone === c.sellerPhone; var otherName = isSeller ? c.buyerName : c.sellerName;
var nameEl = document.getElementById('chat-head-name'); if(nameEl) nameEl.textContent = otherName;
var subEl = document.getElementById('chat-head-sub'); if(subEl) subEl.textContent = c.listingTitle;
var avatarEl = document.getElementById('chat-head-avatar'); if(avatarEl) avatarEl.textContent = initials(otherName);
var result = null; try { result = await api.getMessages(c.id); } catch(e) { }
var thread = [];
if(result && result.messages){ thread = result.messages.map(function(m){ return { id: m.id, convId: m.conv_id || m.convId, fromPhone: m.from_phone || m.fromPhone, text: m.text, createdAt: Number(m.created_at || m.createdAt), read: m.read }; }); }
else { thread = DB.messages.filter(function(m){ return m.convId === c.id; }); thread.sort(function(a,b){ return a.createdAt - b.createdAt; }); }
var msgs = DB.messages; thread.forEach(function(m){ var idx = msgs.findIndex(function(x){ return x.id === m.id; }); if(idx < 0) msgs.push(m); else msgs[idx] = m; }); DB.messages = msgs;
var body = document.getElementById('chat-body'); if(!body) return;
if(!thread.length){ body.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:15px;padding:50px 20px">اولین پیام را بفرست</div>'; }
else {
var html = ''; var lastDay = '';
thread.forEach(function(m){ var d = new Date(m.createdAt); var dayStr = faDigits(d.toLocaleDateString('fa-IR')); if(dayStr !== lastDay){ html += '<div class="chat-day">' + dayStr + '</div>'; lastDay = dayStr; } var mine = m.fromPhone === u.phone; var t = new Date(m.createdAt); var hh = faDigits(String(t.getHours()).padStart(2,'0')); var mm = faDigits(String(t.getMinutes()).padStart(2,'0')); html += '<div class="msg ' + (mine ? 'me' : 'them') + '">' + m.text + '<span class="msg-time">' + hh + ':' + mm + '</span></div>'; });
body.innerHTML = html;
}
setTimeout(function(){ body.scrollTop = body.scrollHeight; }, 50); updateChatBadge();
supabaseClient.channel('chat_' + c.id)
  .on('broadcast', { event: 'new_message' }, (payload) => {
    if (payload.payload.fromPhone !== u.phone) {
      renderChat();
    }
  })
  .subscribe();

}
async function sendMessage(){
var u = DB.user; if(!u || !currentConvId) return;
var inp = document.getElementById('chat-input'); var text = inp.value.trim(); if(!text) return;
var c = DB.conversations.find(function(x){ return x.id === currentConvId; }); if(!c) return;
var msgData = { id: 'M' + Date.now(), convId: c.id, fromPhone: u.phone, text: text };
var result = null; try { result = await api.createMessage(msgData); } catch(e) { }
var msgs = DB.messages; msgs.push({ id: msgData.id, convId: c.id, fromPhone: u.phone, text: text, createdAt: Date.now(), read: false }); DB.messages = msgs;
var convs = DB.conversations; var idx = convs.findIndex(function(x){ return x.id === c.id; }); if(idx >= 0){ convs[idx].lastMessageAt = Date.now(); DB.conversations = convs; }
inp.value = '';
  try { var otherPhone = (u.phone === c.sellerPhone) ? c.buyerPhone : c.sellerPhone; fetch('https://taraz-backend-prog.vercel.app/api/push/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toPhone: otherPhone, title: 'پیام جدید از ' + u.name, body: text, data: { convId: c.id } }) }); } catch(e){}
supabaseClient.channel('chat_' + c.id).send({
  type: 'broadcast',
  event: 'new_message',
  payload: { text: text, fromPhone: u.phone }
});
  renderChat();
}
function createBuyRequest(listingId){
var u=DB.user;if(!u)return;
var l=DB.listings.find(function(x){return x.id===listingId});if(!l)return;
var reqs=DB.requests; reqs.push({ id:'R'+Date.now(), listingId:listingId, listingTitle:l.title, sellerPhone:l.sellerPhone, sellerName:l.sellerName, buyerPhone:u.phone, buyerName:u.name, price:l.price, region:l.region, status:'pending', createdAt:Date.now() }); DB.requests=reqs;
}
function updateChatBadge(){
var u=DB.user; var badge=document.getElementById('nav-chat-badge'); if(!badge)return;
if(!u){badge.textContent='';badge.classList.remove('show');return}
var unread=DB.messages.filter(function(m){ if(m.fromPhone===u.phone||m.read)return false; var c=DB.conversations.find(function(x){return x.id===m.convId}); if(!c)return false; return c.buyerPhone===u.phone||c.sellerPhone===u.phone; }).length;
badge.textContent=faDigits(unread); badge.classList.toggle('show',unread>0);
}
function openRating(toPhone,toName){
  ratingTarget={toPhone:toPhone,toName:toName}; ratingScore=0;
  document.getElementById('rating-title').textContent='تجربه‌ات با '+toName;
  document.getElementById('rating-comment').value='';
  document.getElementById('rating-label').textContent='یک امتیاز بده';
  document.querySelectorAll('#rating-stars .star-btn').forEach(s=>s.classList.remove('on'));
  document.getElementById('rating-modal').classList.add('show');
}
function closeRating(){document.getElementById('rating-modal').classList.remove('show');ratingTarget=null;ratingScore=0}
function submitRating(){
  if(!ratingTarget)return; if(!ratingScore){toast('امتیاز بده');return}
  const u=DB.user; const all=DB.ratings;
  all.push({id:'Rt'+Date.now(),fromPhone:u.phone,fromName:u.name,toPhone:ratingTarget.toPhone,score:ratingScore,comment:document.getElementById('rating-comment').value.trim(),createdAt:Date.now()});
  DB.ratings=all; toast('ثبت شد ⭐'); closeRating(); renderProfile();
}
document.querySelectorAll('#rating-stars .star-btn').forEach(btn=>{ btn.addEventListener('click',()=>{ ratingScore=Number(btn.dataset.v); document.querySelectorAll('#rating-stars .star-btn').forEach(s=>s.classList.toggle('on',Number(s.dataset.v)<=ratingScore)); const l=['','خیلی بد','بد','متوسط','خوب','عالی']; document.getElementById('rating-label').textContent=l[ratingScore]; }); });
async function renderProfile(){
var u = DB.user; if(!u) return;
setAvatar(document.getElementById('profile-avatar'), u);
var nameEl = document.getElementById('profile-name'); var phoneEl = document.getElementById('profile-phone');
if(nameEl) nameEl.textContent = u.name; if(phoneEl) phoneEl.textContent = faDigits(u.phone);
var r = await avgRating(u.phone); var ratingLine = document.getElementById('profile-rating-line');
if(ratingLine){ if(r.count > 0){ ratingLine.innerHTML = '⭐ ' + faDigits(r.avg.toFixed(1)) + ' از ' + faDigits(r.count) + ' نفر'; } else { ratingLine.textContent = 'هنوز امتیازی نداری'; } }
var myListings = DB.listings.filter(function(l){ return l.sellerPhone === u.phone; });
var c1 = document.getElementById('cnt-listings'); if(c1) c1.textContent = faDigits(myListings.length) + ' آگهی';
var cFav = document.getElementById('cnt-favorites'); if(cFav) cFav.textContent = faDigits(_favoritesCache.length) + ' آگهی';
renderProfileStats();
}
async function renderProfileStats(){
var u = DB.user; if(!u) return;
var listingsResult = null; try { listingsResult = await api.getListings(); } catch(e) {}
var allListings = (listingsResult && listingsResult.listings) ? listingsResult.listings : [];
var myListings = allListings.filter(function(l){ var phone = l.seller_phone || l.sellerPhone; return phone === u.phone; });
var favCount = _favoritesCache.length;
var convsResult = null; try { convsResult = await api.getConversations(u.phone); } catch(e) {}
var convsCount = (convsResult && convsResult.conversations) ? convsResult.conversations.length : 0;
var ratingResult = null; try { ratingResult = await api.getRatings(u.phone); } catch(e) {}
var ratingAvg = (ratingResult && typeof ratingResult.avg === 'number' && ratingResult.count > 0) ? ratingResult.avg.toFixed(1) : '۰';
var missionsResult = null; try { missionsResult = await api.getMissions(u.phone); } catch(e) {}
var missionsCount = (missionsResult && missionsResult.missions) ? missionsResult.missions.length : 0;
var bookingsResult = null; try { bookingsResult = await api.getBookings(u.phone); } catch(e) {}
var bookingsCount = (bookingsResult && bookingsResult.bookings) ? bookingsResult.bookings.length : 0;
var statListings = document.getElementById('stat-listings'); var statFavorites = document.getElementById('stat-favorites'); var statConvs = document.getElementById('stat-convs'); var statRating = document.getElementById('stat-rating'); var statMissions = document.getElementById('stat-missions'); var statBookings = document.getElementById('stat-bookings');
if(statListings) statListings.textContent = faDigits(myListings.length); if(statFavorites) statFavorites.textContent = faDigits(favCount); if(statConvs) statConvs.textContent = faDigits(convsCount); if(statRating) statRating.textContent = faDigits(ratingAvg); if(statMissions) statMissions.textContent = faDigits(missionsCount); if(statBookings) statBookings.textContent = faDigits(bookingsCount);
}
async function openProfileSection(section){
  const u=DB.user;if(!u)return; const title=document.getElementById('profile-sub-title'); const body=document.getElementById('profile-sub-body');
  if(section==='listings'){ title.textContent='📦 آگهی‌های من'; const list=DB.listings.filter(l=>l.sellerPhone===u.phone).sort((a,b)=>b.createdAt-a.createdAt); body.innerHTML=list.length?list.map(homeCard).join(''):'<div class="empty"><span class="emoji">📦</span>آگهی‌ای نداری</div>'; }
  else if(section==='favorites'){
title.textContent='❤️ علاقه‌مندی‌ها';
var favResult=null; try{favResult=await api.getFavorites(u.phone)}catch(e){}
var favIds=(favResult&&favResult.favorites)?favResult.favorites.map(function(f){return f.listing_id||f.listingId}):[];
var listingsResult=null; try{listingsResult=await api.getListings()}catch(e){}
var allListings=(listingsResult&&listingsResult.listings)?listingsResult.listings:[];
var favList=allListings.filter(function(l){return favIds.indexOf(l.id)>=0}); favList.sort(function(a,b){return (b.created_at||b.createdAt)-(a.created_at||a.createdAt)});
if(!favList.length){ body.innerHTML='<div class="empty"><span class="emoji">❤️</span>علاقه‌مندی‌ای نداری</div>'; } else {
body.innerHTML=favList.map(function(l){ var normalized={ id:l.id, sellerPhone:l.seller_phone||l.sellerPhone, sellerName:l.seller_name||l.sellerName, categoryId:l.category_id||l.categoryId, title:l.title, qty:l.qty, qtyNum:l.qty_num||l.qtyNum, price:Number(l.price), oldPrice:l.old_price?Number(l.old_price):null, region:l.region, desc:l.description||l.desc, urgent:l.urgent, urgentReason:l.urgent_reason||l.urgentReason, productKey:l.product_key||l.productKey, photos:l.photos||[], location:(l.location_lat&&l.location_lng)?{lat:Number(l.location_lat),lng:Number(l.location_lng)}:null, createdAt:Number(l.created_at||l.createdAt) }; return homeCard(normalized); }).join('');
}
  } else if(section==='bookings'){
    title.textContent='📅 رزروهای من'; const list=DB.bookings.filter(b=>b.customerPhone===u.phone).sort((a,b)=>b.createdAt-a.createdAt);
    if(!list.length){body.innerHTML='<div class="empty"><span class="emoji">📅</span>رزروی نداری</div>';return}
    body.innerHTML=list.map(b=>{ const c=DB.capacities.find(x=>x.id===b.capacityId); return '<div class="booking-card"><div class="head"><b>'+(c?c.title:'ظرفیت حذف شده')+'</b><span class="status '+b.status+'">'+(b.status==='pending'?'در انتظار':b.status==='confirmed'?'تأیید':'تکمیل')+'</span></div><small>'+faDigits(b.qty)+' '+(c?c.unit:'')+' · '+faPrice(b.total)+' تومان<br>'+timeAgo(b.createdAt)+'</small></div>'; }).join('');
  } else if(section==='requests'){
    title.textContent='📨 درخواست‌های خرید'; const list=DB.requests.filter(r=>r.buyerPhone===u.phone).sort((a,b)=>b.createdAt-a.createdAt);
    if(!list.length){body.innerHTML='<div class="empty"><span class="emoji">📨</span>درخواستی نداری</div>';return}
    body.innerHTML=list.map(r=>'<div class="card"><b>'+r.listingTitle+'</b><small>فروشنده: '+r.sellerName+'<br>'+timeAgo(r.createdAt)+'</small></div>').join('');
  } else if(section==='reviews'){
    title.textContent='⭐ امتیازهای من'; const list=DB.ratings.filter(x=>x.toPhone===u.phone).sort((a,b)=>b.createdAt-a.createdAt);
    if(!list.length){body.innerHTML='<div class="empty"><span class="emoji">⭐</span>هنوز امتیازی نگرفته‌ای</div>';return}
    body.innerHTML=list.map(r=>'<div class="card"><div class="row"><b>'+r.fromName+'</b><span style="color:var(--gold);font-size:18px">'+'★'.repeat(r.score)+'☆'.repeat(5-r.score)+'</span></div>'+(r.comment?'<div style="margin-top:10px;font-size:14px;color:var(--muted);line-height:2">"'+r.comment+'"</div>':'')+'</div>').join('');
  }
  go('profile-sub');
}
const IRAN_CITIES=['تهران','اهواز','اصفهان','مشهد','شیراز','تبریز','کرج','قم','دزفول','شوش','اندیمشک','کرمانشاه','رشت','یزد','کرمان','بندرعباس','زاهدان','اراک','همدان','سنندج','بوشهر','قزوین','گرگان','ساری','بابل','آمل','خرم‌آباد','ایلام','زنجان','ارومیه','اردبیل','سمنان','بیرجند','یاسوج','شهرکرد','فارس','گلستان','مازندران','خوزستان','خراسان','آذربایجان','گیلان','هرمزگان'];
function findCities(text){ const found=[]; IRAN_CITIES.forEach(c=>{if(text.indexOf(c)>=0)found.push(c)}); return found; }
const PRODUCT_KEYWORDS=[ {kw:['گوسفند','بره','میش','قوچ'],cat:'livestock',icon:'🐑',unit:'رأس',defaultPrice:385000}, {kw:['بز','بزغاله'],cat:'livestock',icon:'🐐',unit:'رأس',defaultPrice:280000}, {kw:['گاو','گوساله'],cat:'livestock',icon:'🐄',unit:'رأس',defaultPrice:25000000}, {kw:['جوجه'],cat:'poultry',icon:'🐔',unit:'قطعه',defaultPrice:28000}, {kw:['مرغ'],cat:'poultry',icon:'🐓',unit:'قطعه',defaultPrice:85000}, {kw:['گندم'],cat:'crops',icon:'🌾',unit:'تن',defaultPrice:18500}, {kw:['جو'],cat:'crops',icon:'🌾',unit:'تن',defaultPrice:16500}, {kw:['کنسانتره'],cat:'feed',icon:'🌰',unit:'تن',defaultPrice:24000}, {kw:['یونجه','سیلاژ'],cat:'forage',icon:'🌿',unit:'تن',defaultPrice:18000}, {kw:['بذر','کود'],cat:'agri_inputs',icon:'🌱',unit:'کیلو',defaultPrice:85000}, {kw:['دگزامتازون','واکسن'],cat:'vet_drugs',icon:'💉',unit:'ویال',defaultPrice:100} ];
function detectProduct(text){ for(const p of PRODUCT_KEYWORDS){ for(const kw of p.kw){if(text.indexOf(kw)>=0)return Object.assign({},p,{matched:kw})} } return null; }
const SERVICE_KEYWORDS=[ {kw:['راننده','حمل','انتقال'],service:'transport',type:'kamion',icon:'🚛',unit:'تن',defaultPrice:350000,label:'حمل'}, {kw:['وانت'],service:'transport',type:'van',icon:'🚐',unit:'تن',defaultPrice:90000,label:'وانت'}, {kw:['کامیون'],service:'transport',type:'kamion',icon:'🚛',unit:'تن',defaultPrice:350000,label:'کامیون'}, {kw:['قصاب','ذبح'],service:'slaughter',type:'butcher',icon:'🔪',unit:'رأس',defaultPrice:220000,label:'قصاب'}, {kw:['کشتارگاه'],service:'slaughter',type:'abattoir',icon:'🏭',unit:'رأس',defaultPrice:180000,label:'کشتارگاه'}, {kw:['کمباین'],service:'machinery_rent',type:'harvester',icon:'🚜',unit:'هکتار',defaultPrice:1800000,label:'کمباین'}, {kw:['تراکتور'],service:'machinery_rent',type:'tractor',icon:'🚜',unit:'هکتار',defaultPrice:2500000,label:'تراکتور'}, {kw:['برداشت'],service:'machinery_rent',type:'harvesting',icon:'🌾',unit:'هکتار',defaultPrice:1500000,label:'برداشت'}, {kw:['دامپزشک'],service:'specialist',type:'vet',icon:'👨‍⚕️',unit:'بازدید',defaultPrice:450000,label:'دامپزشک'} ];
function detectServices(text){
  const found=[]; const used={};
  SERVICE_KEYWORDS.forEach(s=>{ for(const kw of s.kw){ const key=s.service+':'+s.type; if(text.indexOf(kw)>=0&&!used[key]){ found.push(Object.assign({},s,{matched:kw})); used[key]=true; break; } } });
  return found;
}
function parseMissionText(text){
  const cities=findCities(text); const product=detectProduct(text); const services=detectServices(text); const qty=extractQtyNum(text);
  let fromCity=null,toCity=null;
  if(cities.length>=2){fromCity=cities[0];toCity=cities[1]} else if(cities.length===1){fromCity=cities[0]}
  return{raw:text,fromCity:fromCity,toCity:toCity,product:product,services:services,qty:qty};
}
function findBestProductOffer(product,fromCity){
  if(!product)return null;
  const matches=DB.listings.filter(l=>{ return l.categoryId===product.cat&&product.kw.some(kw=>l.title.indexOf(kw)>=0||l.productKey===kw); });
  if(!matches.length){ const byCat=DB.listings.filter(l=>l.categoryId===product.cat); if(!byCat.length)return null; byCat.sort((a,b)=>a.price-b.price); return byCat[0]; }
  if(fromCity){ const inCity=matches.filter(l=>l.region===fromCity); if(inCity.length){inCity.sort((a,b)=>a.price-b.price);return inCity[0]} }
  matches.sort((a,b)=>a.price-b.price); return matches[0];
}
function findBestCapacity(serviceType,typeId,fromCity,toCity){
  let list=DB.capacities.filter(c=>c.serviceType===serviceType); if(typeId)list=list.filter(c=>c.typeId===typeId);
  if(!list.length)return null;
  const free=list.filter(c=>c.capacityTotal-c.capacityUsed>0); if(!free.length)return null;
  if(fromCity&&toCity){ const onRoute=free.filter(c=>(c.routeFrom===fromCity||c.region===fromCity)||(c.routeTo===toCity||c.region===toCity)); if(onRoute.length){onRoute.sort((a,b)=>a.price-b.price);return onRoute[0]} }
  if(fromCity){ const nearFrom=free.filter(c=>c.region===fromCity||c.routeFrom===fromCity); if(nearFrom.length){nearFrom.sort((a,b)=>a.price-b.price);return nearFrom[0]} }
  free.sort((a,b)=>a.price-b.price); return free[0];
}
function buildMissionChain(parsed){
  const u=DB.user;if(!u)return null;
  const steps=[]; let total=0; const qty=parsed.qty||1;
  if(parsed.product){
    const offer=findBestProductOffer(parsed.product,parsed.fromCity);
    if(offer){ const stepTotal=offer.price*qty; total+=stepTotal; steps.push({type:'product',icon:parsed.product.icon,title:offer.title,subtitle:offer.sellerName+' · '+offer.region,why:'ارزان‌ترین گزینه',price:offer.price,unit:parsed.product.unit,qty:qty,total:stepTotal,status:'ok',refType:'listing'}); }
    else { steps.push({type:'product',icon:parsed.product.icon,title:parsed.product.matched,subtitle:'فروشنده پیدا نشد',why:'می‌توانی تقاضا ثبت کنی',price:parsed.product.defaultPrice,unit:parsed.product.unit,qty:qty,total:parsed.product.defaultPrice*qty,status:'alt',refType:null}); }
  }
  parsed.services.forEach(s=>{
    const cap=findBestCapacity(s.service,s.type,parsed.fromCity,parsed.toCity);
    if(cap){ const free=cap.capacityTotal-cap.capacityUsed; const stepQty=Math.min(free,Math.max(qty,1)); const stepTotal=cap.price*stepQty; total+=stepTotal; steps.push({type:'service',icon:s.icon,title:cap.title,subtitle:cap.ownerName+' · '+cap.region,why:s.label+' — '+faDigits(free)+' '+cap.unit+' آزاد',price:cap.price,unit:cap.unit,qty:stepQty,total:stepTotal,status:'ok',refId:cap.id,refType:'capacity'}); }
    else { steps.push({type:'service',icon:s.icon,title:s.label,subtitle:'ثبت نشده',why:'می‌توانی دستی هماهنگ کنی',price:s.defaultPrice,unit:s.unit,qty:qty,total:s.defaultPrice*qty,status:'alt',refType:null}); }
  });
  return{id:'M'+Date.now(),ownerPhone:u.phone,rawText:parsed.raw,steps:steps,total:total,status:'draft',createdAt:Date.now()};
}
function setMission(text){document.getElementById('mission-input').value=text}
function startMission() {
  var u = DB.user;
  if (!u) { go('auth'); return; }
  
  var input = document.getElementById('mission-input').value.trim();
  var region = document.getElementById('mission-region').value.trim();
  
  if (input.length < 5) { toast('لطفاً درخواست خود را کامل بنویسید'); return; }
  if (!region) { toast('لطفاً منطقه خود را وارد کنید'); return; }
  
  // جمع‌آوری آپشن‌های فعال
  var activeOptions = [];
  document.querySelectorAll('.chip-big.active').forEach(function(btn) {
    activeOptions.push(btn.textContent.trim());
  });
  
  // ساخت متن نهایی برای پردازش
  var finalText = input + ' در ' + region;
  if (activeOptions.length > 0) {
    finalText += ' (' + activeOptions.join('، ') + ')';
  }
  
  var parsed = parseMissionText(finalText);
  if (!parsed.product && !parsed.services.length) {
    toast('متأسفانه چیزی تشخیص ندادیم. لطفاً واضح‌تر بنویسید.');
    return;
  }
  
  showMissionThinking(parsed);
}

function showMissionThinking(parsed){
  const steps=['می‌فهمم چی می‌خواهی','دنبال محصول می‌گردم','دنبال خدمت می‌گردم','قیمت حساب می‌کنم'];
  const el=document.getElementById('mission-result');
  el.innerHTML='<div class="ai-thinking">'+steps.map((s,i)=>'<div class="think-step" data-ms="'+i+'"><span class="dot">'+faDigits(i+1)+'</span><span>'+s+'</span></div>').join('')+'</div>';
  let i=0;
  const tick=()=>{ const s=document.querySelector('.think-step[data-ms="'+i+'"]'); if(s){s.classList.add('show');setTimeout(()=>s.classList.add('done'),400)} i++; if(i<steps.length)setTimeout(tick,400); else setTimeout(()=>{ const mission=buildMissionChain(parsed); if(!mission)return; currentMissionDraft=mission; renderMissionChain(mission); },600); };
  setTimeout(tick,200);
}
function renderMissionChain(m){
  const el=document.getElementById('mission-result');
  el.innerHTML='<div style="padding:16px 0">'+m.steps.map((s,i)=>'<div class="mission-step"><div class="num">'+faDigits(i+1)+'</div><div class="head"><div class="ic">'+s.icon+'</div><div class="t"><b>'+s.title+'</b><small>'+s.subtitle+'</small></div><span class="status '+s.status+'">'+(s.status==='ok'?'✓':'⚠')+'</span></div><div class="why"><b>چرا؟</b> '+s.why+'</div><div class="price-line"><span class="l">'+faDigits(s.qty)+' '+s.unit+' × '+faPrice(s.price)+'</span><span class="v">'+faPrice(s.total)+'</span></div></div>').join('')+'<div class="mission-total"><div class="row"><span>جمع کل</span><span class="v big">'+faPrice(m.total)+' تومان</span></div></div><button type="button" class="btn-green" style="min-height:64px;font-size:18px" onclick="confirmMission()">✅ تأیید و رزرو همه</button><button type="button" class="btn-outline" onclick="discardMission()">انصراف</button></div>';
}
function discardMission(){currentMissionDraft=null;document.getElementById('mission-result').innerHTML='';toast('لغو شد')}
async function confirmMission(){
  var u = DB.user; 
  if(!u) return; 
  
  var m = currentMissionDraft; 
  if(!m) return; 
  
  m.status = 'confirmed';
  var result = null; 
  try { result = await api.createMission(m); } catch(e) {}
  
  var all = DB.missions; 
  all.unshift(m); 
  DB.missions = all;
  
  for(var i=0; i<m.steps.length; i++){ 
    var s = m.steps[i]; 
    if(s.refType === 'capacity' && s.refId){ 
      var cap = DB.capacities.find(function(c){ return c.id === s.refId; }); 
      if(cap){ 
        var booking = { id: 'B' + Date.now() + i, capacityId: cap.id, customerPhone: u.phone, customerName: u.name, qty: s.qty, total: s.total, status: 'pending', createdAt: Date.now() }; 
        var bks = DB.bookings; 
        bks.push(booking); 
        DB.bookings = bks; 
        try { await api.createBooking(booking); } catch(e){} 
      } 
    } 
  }
  
  addNotification({type: 'mission', icon: '🎯', title: 'مأموریت تأیید شد', body: faPrice(m.total) + ' تومان'}); 
  toast('✓ تأیید شد');
  
  document.getElementById('mission-input').value = ''; 
  document.getElementById('mission-result').innerHTML = ''; 
  currentMissionDraft = null; 
  
  setTimeout(function() { go('missions-list'); }, 1500);
}






async function renderMission(){
var u=DB.user;if(!u)return;
var result=null; try{result=await api.getMissions(u.phone)}catch(e){}
var list=(result&&result.missions)?result.missions:DB.missions;
list=list.filter(function(m){ var phone=m.owner_phone||m.ownerPhone; return phone===u.phone; });
list=list.map(function(m){ return { id:m.id, ownerPhone:m.owner_phone||m.ownerPhone, rawText:m.raw_text||m.rawText, steps:m.steps||[], total:Number(m.total), status:m.status, createdAt:Number(m.created_at||m.createdAt) }; });
list.sort(function(a,b){return b.createdAt-a.createdAt});
var el=document.getElementById('mission-history'); if(!el)return;
if(!list.length){el.innerHTML='<div class="empty" style="padding:30px 20px"><span class="emoji">🎯</span>مأموریتی نساخته‌ای</div>';return}
el.innerHTML=list.slice(0,10).map(function(m){ return '<div class="card"><b>🎯 '+(m.rawText||'').slice(0,50)+'</b><small>'+faDigits((m.steps||[]).length)+' مرحله · '+faPrice(m.total)+' تومان<br>'+timeAgo(m.createdAt)+'</small></div>'; }).join('');
}
async function renderMyMissions() {
  const u = DB.user;
  if (!u) return;
  
  const container = document.getElementById('my-missions-container');
  if (!container) return;
  
  container.innerHTML = '<div style="text-align:center;padding:20px;">در حال بارگذاری...</div>';
  
  try {
    var result = await api.getMissions(u.phone);
    var list = (result && result.missions) ? result.missions : [];
    
    if (!list.length) {
      container.innerHTML = '<div class="empty"><span class="emoji">🎯</span>هنوز مأموریتی نساخته‌ای</div>';
      return;
    }
    
    container.innerHTML = list.map(function(m) {
  var statusText = m.status === 'confirmed' ? 'تایید شده' : m.status === 'draft' ? 'پیش‌نویس' : 'در حال انجام';
  var statusColor = m.status === 'confirmed' ? '#16a34a' : '#9a6b00';
  return '<div class="card" style="margin:12px 16px; cursor:pointer;" onclick="viewMissionChain(\'' + m.id + '\')">' +
         '<div style="display:flex;justify-content:space-between;align-items:center;">' +
         '<b style="color:var(--forest);">' + (m.rawText || 'مأموریت بدون عنوان').substring(0, 40) + '...</b>' +
         '<span style="background:#e3f6ec;color:' + statusColor + ';padding:4px 10px;border-radius:100px;font-size:12px;font-weight:900;">' + statusText + '</span>' +
         '</div>' +
         '<small style="display:block;margin-top:8px;color:var(--muted);">' + faDigits((m.steps||[]).length) + ' مرحله · ' + faPrice(m.total) + ' تومان · مشاهده زنجیره 🔗</small>' +
         '</div>';
}).join('');

  } catch(e) {
    container.innerHTML = '<div class="empty">خطا در دریافت مأموریت‌ها</div>';
  }
}

function backFromDetail(){go(detailReturnTo||'home')}
if(DB.user){ loadFavorites().then(function(){ if(currentScreen==='home')renderHome(); else if(currentScreen==='browse')renderBrowse(); }); }
console.log('✓ Taraz v3.0 loaded');
/* ============ ADMIN PANEL LOGIC ============ */
const ADMIN_PHONE = '09163905174'; // شماره موبایل خودت رو اینجا بذار

// تابع مخفی برای باز کردن پنل ادمین (۵ بار کلیک روی لوگو)
let logoClicks = 0;
let logoTimer = null;

document.addEventListener('click', function(e) {
  // چک میکنیم روی لوگوی "تاراز" کلیک شده یا نه
  if (e.target.closest('.brand')) {
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => { logoClicks = 0; }, 2000); // ریست بعد از ۲ ثانیه
    
    if (logoClicks >= 5) {
      logoClicks = 0;
      if (DB.user && DB.user.phone === ADMIN_PHONE) {
        renderAdminPanel();
        go('admin');
      } else {
        toast('⛔ دسترسی غیرمجاز');
      }
    }
  }
});

async function renderAdminPanel() {
  try {
    // گرفتن آمار کلی از بک‌اند
    var statsRes = await fetch('https://taraz-backend-prog.vercel.app/api/admin/stats').then(r => r.json());
    
    if (statsRes) {
      document.getElementById('admin-stat-users').textContent = faDigits(statsRes.users || 0);
      document.getElementById('admin-stat-listings').textContent = faDigits(statsRes.listings || 0);
      document.getElementById('admin-stat-convs').textContent = faDigits(statsRes.conversations || 0);
    }

    // گرفتن لیست آگهی‌ها برای نمایش و حذف
    var listingsRes = await api.getListings();
    var listEl = document.getElementById('admin-listings-list');
    
    if (listingsRes && listingsRes.listings && listingsRes.listings.length > 0) {
      listEl.innerHTML = listingsRes.listings.map(function(l) {
        return '<div class="card" style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">' +
               '<div><b>' + l.title + '</b><br><small>' + l.seller_name + ' - ' + l.region + '</small></div>' +
               '<button type="button" class="btn-red" style="width:auto;padding:8px 12px;margin:0" onclick="adminDeleteListing(\'' + l.id + '\')">حذف</button>' +
               '</div>';
      }).join('');
    } else {
      if (listEl) listEl.innerHTML = '<div class="empty">آگهی‌ای وجود ندارد</div>';
    }
  } catch (e) {
    console.warn('Error rendering admin:', e);
  }
}

async function adminDeleteListing(id) {
  if (!confirm('آیا از حذف این آگهی مطمئن هستید؟')) return;
  var result = await api.deleteListing(id);
  if (result && result.ok) {
    toast('✓ آگهی حذف شد');
    renderAdminPanel();
  } else {
    toast('خطا در حذف');
  }
}
async function askAdminAI() {
  var input = document.getElementById('admin-ai-input');
  var responseEl = document.getElementById('admin-ai-response');
  var prompt = input.value.trim();
  if (!prompt) return;

  responseEl.textContent = 'در حال فکر کردن...';
  input.value = '';

  try {
    var res = await fetch('https://taraz-backend-prog.vercel.app/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });
    var data = await res.json();
    
    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      responseEl.textContent = data.choices[0].message.content;
    } else {
      responseEl.textContent = 'متأسفانه پاسخی دریافت نشد.';
    }
  } catch (e) {
    responseEl.textContent = 'خطا در ارتباط با هوش مصنوعی.';
  }
}
/* ============ نمایش فیلدهای تخصصی دام ============ */
document.addEventListener('DOMContentLoaded', function() {
  const categorySelect = document.getElementById('sell-category');
  const livestockFields = document.getElementById('livestock-fields');
  
  if (categorySelect && livestockFields) {
    categorySelect.addEventListener('change', function() {
      if (this.value === 'livestock') {
        livestockFields.style.display = 'block';
      } else {
        livestockFields.style.display = 'none';
      }
    });
  }
});
/* ============ READY STATUS LOGIC ============ */
var _isReady = false;

async function renderReadyProfile() {
  var u = DB.user;
  if (!u) return;

  // بارگذاری وضعیت از دیتای محلی (برای شروع)
  var profile = DB._get('ready_profile_' + u.phone, null);
  
  if (profile) {
    _isReady = profile.is_ready || false;
    var serviceEl = document.getElementById('ready-service-type');
    var regionEl = document.getElementById('ready-region');
    var notesEl = document.getElementById('ready-notes');
    
    if (serviceEl) serviceEl.value = profile.service_type || 'transport';
    if (regionEl) regionEl.value = profile.region || '';
    if (notesEl) notesEl.value = profile.notes || '';
  }

  var statusEl = document.getElementById('ready-status-text');
  var btn = document.getElementById('toggle-ready-btn');

  if (!statusEl || !btn) return;

  if (_isReady) {
    statusEl.innerHTML = '<span style="color:#16a34a">🟢 شما آماده به کار هستید (مأموریت‌ها به شما ارسال می‌شود)</span>';
    btn.textContent = 'رفتن به حالت استراحت';
    btn.className = 'btn-outline';
    btn.style.color = 'var(--fire)';
    btn.style.borderColor = 'var(--fire)';
  } else {
    statusEl.innerHTML = '<span style="color:var(--muted)">⚪ شما در حالت استراحت هستید</span>';
    btn.textContent = 'فعال‌سازی حالت آماده‌باش';
    btn.className = 'btn-green';
    btn.style.color = '';
    btn.style.borderColor = '';
  }
}
function updateHomeReadyButton() {
  var u = DB.user;
  if (!u) return;
  
  var profile = DB._get('ready_profile_' + u.phone, {}) || {};
  var isReady = profile.is_ready || false;
  
  var btn = document.getElementById('ready-toggle-btn');
  var icon = document.getElementById('ready-hand-icon');
  
  if (btn && icon) {
    if (isReady) {
      btn.style.background = '#16a34a'; // سبز
      btn.style.color = '#fff';
      icon.textContent = '👍';
    } else {
      btn.style.background = '#e63946'; // قرمز
      btn.style.color = '#fff';
      icon.textContent = '👎';
    }
  }
}

function toggleReadyFromHome() {
  var u = DB.user;
  if (!u) { go('auth'); return; }
  
  var profile = DB._get('ready_profile_' + u.phone, {}) || {};
  profile.is_ready = !profile.is_ready;
  DB._set('ready_profile_' + u.phone, profile);
  
  updateHomeReadyButton();
  toast(profile.is_ready ? '✓ شما آماده به کار شدید' : 'شما به حالت استراحت رفتید');
}

function toggleReadyStatus() {
  var u = DB.user;
  if (!u) return;

  _isReady = !_isReady;
  var profile = DB._get('ready_profile_' + u.phone, {}) || {};
  profile.is_ready = _isReady;
  DB._set('ready_profile_' + u.phone, profile);

  renderReadyProfile();
  toast(_isReady ? '✓ حالت آماده‌باش فعال شد' : 'حالت استراحت فعال شد');
}

async function saveReadyProfile() {
  var u = DB.user;
  if (!u) return;

  var serviceType = document.getElementById('ready-service-type').value;
  var region = document.getElementById('ready-region').value.trim();
  var notes = document.getElementById('ready-notes').value.trim();

  if (!region) {
    toast('لطفاً محدوده فعالیت را وارد کنید');
    return;
  }

  var profile = {
    phone: u.phone,
    name: u.name,
    is_ready: _isReady,
    service_type: serviceType,
    region: region,
    notes: notes
  };

  DB._set('ready_profile_' + u.phone, profile);

  try {
    var res = await fetch('https://taraz-backend-prog.vercel.app/api/ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      toast('✓ اطلاعات با موفقیت ذخیره شد');
    } else {
      toast('⚠ فقط محلی ذخیره شد');
    }
  } catch(e) {
    toast('⚠ فقط محلی ذخیره شد');
  }
}

async function addWatchCondition() {
  var u = DB.user;
  if (!u) return;

  var from = document.getElementById('watch-from').value.trim();
  var to = document.getElementById('watch-to').value.trim();
  var notes = document.getElementById('watch-notes').value.trim();

  if (!from && !to) {
    toast('حداقل یک مسیر (مبدا یا مقصد) را وارد کنید');
    return;
  }

  var watchData = {
    id: 'W' + Date.now(),
    user_phone: u.phone,
    service_type: 'transport',
    route_from: from,
    route_to: to,
    notes: notes
  };

  try {
    var res = await fetch('https://taraz-backend-prog.vercel.app/api/watches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(watchData)
    });
    if (res.ok) {
      toast('✓ درخواست شرطی شما ثبت شد. به‌زودی خبرت می‌کنیم!');
      document.getElementById('watch-from').value = '';
      document.getElementById('watch-to').value = '';
      document.getElementById('watch-notes').value = '';
    } else {
      toast('خطا در ثبت درخواست');
    }
  } catch(e) {
    toast('خطا در ارتباط با سرور');
  }
}

function quickReply(text) {
  var inp = document.getElementById('chat-input');
  if (inp) {
    inp.value = text;
    // اسکرول خودکار به آخرین پیام
    var body = document.getElementById('chat-body');
    if(body) body.scrollTop = body.scrollHeight;
  }
}
var _currentChainMission = null;

function viewMissionChain(missionId) {
  var all = DB.missions;
  var m = all.find(function(x){ return x.id === missionId; });
  if (!m) { toast('مأموریت یافت نشد'); return; }
  _currentChainMission = m;
  go('mission-chain');
}

async function renderMissionChainView() {
  var m = _currentChainMission;
  if (!m) { go('missions-list'); return; }

  try {
    var res = await api.getMissions(DB.user.phone);
    if (res && res.missions) {
      var freshM = res.missions.find(function(x){ return x.id === m.id; });
      if (freshM) {
        m.steps = freshM.steps || m.steps;
        m.total = freshM.total || m.total;
        _currentChainMission = m;
      }
    }
  } catch(e) { console.warn('Sync error:', e); }

  var titleEl = document.getElementById('chain-title');
  if(titleEl) titleEl.textContent = '🔗 ' + (m.rawText || 'زنجیره مأموریت');
  
  var container = document.getElementById('chain-content');
  if (!container) return;
  
  var html = '<div style="display:flex; flex-direction:column; align-items:center; gap:0;">';
  
  // گام اول: فروشنده
  html += '<div class="chain-node" style="background:#eef8f3; border:2px solid #cfe5da; border-radius:20px; padding:16px; width:100%; text-align:center;">';
  html += '<div style="font-size:40px; margin-bottom:8px;">👨‍🌾</div>';
  html += '<b style="color:var(--forest);">فروشنده / مبدأ</b>';
  html += '<div style="font-size:13px; color:var(--muted); margin-top:4px;">' + (m.steps[0] ? m.steps[0].subtitle : 'اطلاعات موجود نیست') + '</div>';
  html += '</div>';
  html += '<div style="width:3px; height:30px; background:var(--accent);"></div>';
  
  // گام‌های میانی
  var serviceSteps = m.steps.filter(function(s){ return s.type === 'service'; });
  if (serviceSteps.length > 0) {
    serviceSteps.forEach(function(s, idx) {
      html += '<div class="chain-node" style="background:#fff8e6; border:2px solid #f0b429; border-radius:20px; padding:16px; width:100%; text-align:center;">';
      html += '<div style="font-size:40px; margin-bottom:8px;">' + s.icon + '</div>';
      html += '<b style="color:#8a6400;">' + s.title + '</b>';
      html += '<div style="font-size:13px; color:var(--muted); margin-top:4px;">' + s.subtitle + '</div>';
      html += '</div>';
      html += '<div style="width:3px; height:30px; background:var(--accent);"></div>';
    });
  }
  
  // دکمه افزودن خدمت
  html += '<button type="button" onclick="openAddServiceModal()" style="width:100%; padding:16px; border:2px dashed var(--accent); border-radius:20px; background:#fff; color:var(--accent); font-size:16px; font-weight:900; margin-bottom:20px;">➕ افزودن خدمت (راننده، دامپزشک و...)</button>';
  html += '<div style="width:3px; height:30px; background:var(--accent);"></div>';
  
  // گام خریدار
  html += '<div class="chain-node" style="background:#e0f0ff; border:2px solid #93c5fd; border-radius:20px; padding:16px; width:100%; text-align:center;">';
  html += '<div style="font-size:40px; margin-bottom:8px;">🛒</div>';
  html += '<b style="color:#1a5fa8;">خریدار / مقصد</b>';
  html += '<div style="font-size:13px; color:var(--muted); margin-top:4px;">آماده دریافت محصول</div>';
  html += '</div>';
  
  // جمع کل و دکمه‌ها
  html += '<div style="margin-top:24px; text-align:center; width:100%;">';
  html += '<div style="font-size:22px; font-weight:900; color:var(--forest); margin-bottom:16px;">جمع کل: ' + faPrice(m.total) + ' تومان</div>';
  
  // 👇 دکمه ثبت بیعانه 👇
  html += '<button type="button" class="btn-gold" style="min-height:60px; font-size:18px; width:100%; margin-bottom:12px;" onclick="openEscrowModal()">🔒 ثبت بیعانه (پرداخت امن)</button>';
  // 👆 تا اینجا 👆
  
  html += '<button type="button" class="btn-green" style="min-height:64px; font-size:18px; width:100%;" onclick="finalizeMission()">✅ نهایی کردن معامله</button>';
  html += '</div>';
  
  html += '</div>';
  container.innerHTML = html;
}

function openAddServiceModal() {
  var m = _currentChainMission;
  if (!m) return;
  
  // ساخت HTML مودال
  var html = '<div class="modal-overlay show" id="add-service-modal" onclick="if(event.target===this)closeAddServiceModal()">';
  html += '<div class="modal">';
  html += '<h3 style="color:var(--accent);">افزودن خدمت به مأموریت</h3>';
  html += '<p style="text-align:center;font-size:14px;color:var(--muted);margin-bottom:16px;">چه کسی را به این زنجیره اضافه می‌کنید؟</p>';
  
  html += '<div class="service-grid" style="grid-template-columns:1fr 1fr; gap:12px; padding:0;">';
  SERVICES.forEach(function(s) {
    html += '<div class="service-step-card" style="min-height:100px; padding:12px;" onclick="addServiceToChain(\'' + s.id + '\')">';
    html += '<div class="ic" style="font-size:40px;">' + s.icon + '</div>';
    html += '<div class="t" style="font-size:14px;">' + s.title + '</div>';
    html += '</div>';
  });
  html += '</div>';
  
  html += '<button type="button" class="btn-outline" onclick="closeAddServiceModal()" style="margin-top:16px;">انصراف</button>';
  html += '</div></div>';
  
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeAddServiceModal() {
  var el = document.getElementById('add-service-modal');
  if (el) el.remove();
}

async function addServiceToChain(serviceId) {
  var m = _currentChainMission;
  if (!m) return;
  
  var s = SERVICES.find(function(x){ return x.id === serviceId; });
  if (!s) return;
  
  var newStep = {
    type: 'service',
    icon: s.icon,
    title: s.title,
    subtitle: 'در انتظار انتخاب متخصص',
    price: 0,
    unit: 'واحد',
    qty: 1,
    total: 0,
    status: 'alt',
    refType: null
  };
  
  m.steps.push(newStep);
  
  // ذخیره محلی
  var all = DB.missions;
  var idx = all.findIndex(function(x){ return x.id === m.id; });
  if (idx >= 0) {
    all[idx] = m;
    DB.missions = all;
  }
  
  closeAddServiceModal();
  renderMissionChainView();
  toast('✓ ' + s.title + ' به زنجیره اضافه شد');

  // 👇 ارسال به بک‌اند برای ذخیره دائمی 👇
  try {
    await fetch('https://taraz-backend-prog.vercel.app/api/missions/' + m.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps: m.steps, total: m.total })
    });
  } catch(e) { console.warn('Sync mission chain failed:', e); }
}


async function finalizeMission() {
  var m = _currentChainMission;
  if (!m) return;

  if (!confirm('آیا از نهایی کردن این معامله مطمئن هستید؟')) return;

  m.status = 'completed';

  try {
    await fetch('https://taraz-backend-prog.vercel.app/api/missions/' + m.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps: m.steps, total: m.total, status: 'completed' })
    });

    var all = DB.missions;
    var idx = all.findIndex(function(x){ return x.id === m.id; });
    if (idx >= 0) {
      all[idx] = m;
      DB.missions = all;
    }

    toast('✅ معامله با موفقیت نهایی شد!');
    
    // 👇 بعد از تایید، مودال امتیازدهی باز میشه 👇
    setTimeout(function(){ 
      openRatingModalForMission(m); 
    }, 1000);
    // 👆 تا اینجا 👆

  } catch(e) {
    toast('خطا در نهایی کردن معامله');
  }
}

function openEscrowModal() {
  var m = _currentChainMission;
  if (!m) return;
  
  var html = '<div class="modal-overlay show" id="escrow-modal" onclick="if(event.target===this)closeEscrowModal()">';
  html += '<div class="modal" style="text-align:center;">';
  html += '<h3 style="color:#8a6400;">🔒 پرداخت بیعانه امن</h3>';
  html += '<p style="font-size:14px;color:var(--muted);line-height:1.9;margin-bottom:16px;">مبلغ بیعانه تا زمان تحویل کالا نزد سیستم تاراز نگهداری می‌شود و پس از تایید شما، به فروشنده پرداخت می‌شود.</p>';
  html += '<div class="field" style="text-align:right;">';
  html += '<label>مبلغ بیعانه (تومان)</label>';
  html += '<input id="escrow-amount" type="tel" inputmode="numeric" placeholder="مثلاً: ۵۰۰۰۰۰۰" style="direction:ltr;text-align:left">';
  html += '</div>';
  html += '<button type="button" class="btn-gold" onclick="submitEscrow()" style="margin-top:12px;min-height:60px;font-size:16px;">تایید و ثبت بیعانه</button>';
  html += '<button type="button" class="btn-outline" onclick="closeEscrowModal()" style="margin-top:8px;">انصراف</button>';
  html += '</div></div>';
  
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeEscrowModal() {
  var el = document.getElementById('escrow-modal');
  if (el) el.remove();
}

async function submitEscrow() {
  var m = _currentChainMission;
  if (!m) return;
  
  var amountInput = document.getElementById('escrow-amount');
  var amount = Number(amountInput.value.replace(/[^\d]/g, ''));
  
  if (!amount || amount <= 0) {
    toast('لطفاً مبلغ بیعانه را وارد کنید');
    return;
  }
  
  var escrowData = {
    mission_id: m.id,
    buyer_phone: DB.user.phone,
    seller_phone: m.steps[0] ? m.steps[0].refId : 'unknown',
    amount: amount
  };
  
  try {
    var res = await fetch('https://taraz-backend-prog.vercel.app/api/escrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(escrowData)
    });
    if (res.ok) {
      toast('✓ بیعانه با موفقیت ثبت شد');
      closeEscrowModal();
    } else {
      toast('خطا در ثبت بیعانه');
    }
  } catch(e) {
    toast('خطا در ارتباط با سرور');
  }
}
function toggleMissionOption(btn, option) {
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    btn.style.background = '#fff';
    btn.style.color = 'var(--forest)';
  } else {
    btn.classList.add('active');
    btn.style.background = 'var(--accent)';
    btn.style.color = '#fff';
  }
}
function fillMissionInput(text) {
  var input = document.getElementById('mission-input');
  if (input) {
    input.value = text;
    input.focus(); // فوکوس روی کادر تا کاربر بتونه ادامه بده
  }
}
function showSuggestions() {
  var el = document.getElementById('mission-suggestions');
  if (el) el.style.display = 'block';
}

function hideSuggestions() {
  var el = document.getElementById('mission-suggestions');
  if (el) el.style.display = 'none';
}

function fillMissionInput(text) {
  var input = document.getElementById('mission-input');
  if (input) {
    input.value = text;
    input.focus();
    hideSuggestions(); // بعد از انتخاب، منو بسته میشه
  }
}
function openRatingModalForMission(mission) {
  // پیدا کردن طرف مقابل (فروشنده یا خریدار)
  var u = DB.user;
  var otherPhone = mission.steps[0] && mission.steps[0].refId ? mission.steps[0].refId : 'unknown';
  var otherName = mission.steps[0] ? mission.steps[0].subtitle : 'طرف مقابل';
  
  var html = '<div class="modal-overlay show" id="rating-modal-new" onclick="if(event.target===this)closeRatingModalNew()">';
  html += '<div class="modal">';
  html += '<h3 style="color:var(--gold);">⭐ امتیاز به طرف مقابل</h3>';
  html += '<p style="text-align:center;font-size:14px;color:var(--muted);margin-bottom:16px;">تجربه شما با ' + otherName + ' چطور بود؟</p>';
  html += '<div class="stars-row" id="new-rating-stars" style="direction:ltr;">';
  for (var i = 1; i <= 5; i++) {
    html += '<span class="star-btn" data-v="' + i + '">★</span>';
  }
  html += '</div>';
  html += '<div class="field" style="text-align:right;">';
  html += '<label>نظر شما (اختیاری)</label>';
  html += '<textarea id="new-rating-comment" placeholder="..."></textarea>';
  html += '</div>';
  html += '<button type="button" class="btn-gold" onclick="submitRatingForMission(\'' + otherPhone + '\')" style="margin-top:12px;min-height:60px;font-size:16px;">ثبت امتیاز</button>';
  html += '<button type="button" class="btn-outline" onclick="closeRatingModalNew()" style="margin-top:8px;">بعداً</button>';
  html += '</div></div>';
  
  document.body.insertAdjacentHTML('beforeend', html);
  
  // فعال کردن ستاره‌ها
  document.querySelectorAll('#new-rating-stars .star-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var val = Number(this.dataset.v);
      document.querySelectorAll('#new-rating-stars .star-btn').forEach(function(s) {
        s.classList.toggle('on', Number(s.dataset.v) <= val);
      });
    });
  });
}

function closeRatingModalNew() {
  var el = document.getElementById('rating-modal-new');
  if (el) el.remove();
}

async function submitRatingForMission(toPhone) {
  var u = DB.user;
  if (!u) return;
  
  var activeStars = document.querySelectorAll('#new-rating-stars .star-btn.on');
  var score = activeStars.length;
  if (score === 0) { toast('لطفاً امتیاز بدهید'); return; }
  
  var comment = document.getElementById('new-rating-comment').value.trim();
  
  try {
    await fetch('https://taraz-backend-prog.vercel.app/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'Rt' + Date.now(),
        fromPhone: u.phone,
        fromName: u.name,
        toPhone: toPhone,
        score: score,
        comment: comment
      })
    });
    toast('✓ امتیاز شما ثبت شد');
    closeRatingModalNew();
    go('missions-list');
  } catch(e) {
    toast('خطا در ثبت امتیاز');
  }
}

/* ============================================================
   API LAYER 
   ============================================================ */
var API_BASE = 'https://taraz-backend-prog.vercel.app';
var api = {
  _fetch: async function(path, options, retries = 2) {
  try {
    var url = API_BASE + path;
    var config = { headers: { 'Content-Type': 'application/json' } };
    if (options) { 
      if (options.method) config.method = options.method; 
      if (options.body) config.body = options.body; 
    }
    
    var res = await fetch(url, config);
    if (!res.ok) { 
      return null; 
    }
    return await res.json();
  } catch (e) {
    // 👇 اگر خطا داد و هنوز فرصت تلاش داریم، دوباره امتحان کن 👇
    if (retries > 0) {
      console.warn('Retrying request in 2 seconds:', path);
      await new Promise(r => setTimeout(r, 2000)); // ۲ ثانیه صبر کن
      return this._fetch(path, options, retries - 1);
    }
    return null;
  }
},

  health: async function() { return this._fetch('/'); },
  login: async function(phone, name, role, avatar) { return this._fetch('/api/users/login', { method: 'POST', body: JSON.stringify({ phone: phone, name: name, role: role, avatar: avatar }) }); },
  register: async function(phone, name, role, password) { return this._fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ phone: phone, name: name, role: role, password: password }) }); },
  loginWithPassword: async function(phone, password) { return this._fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone: phone, password: password }) }); },
  changePassword: async function(phone, oldPassword, newPassword) { return this._fetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ phone: phone, oldPassword: oldPassword, newPassword: newPassword }) }); },
  setSecurity: async function(phone, question, answer) { return this._fetch('/api/auth/set-security', { method: 'POST', body: JSON.stringify({ phone: phone, question: question, answer: answer }) }); },
  getSecurityQuestion: async function(phone) { return this._fetch('/api/auth/security-question/' + encodeURIComponent(phone)); },
  recoverPassword: async function(phone, answer, newPassword) { return this._fetch('/api/auth/recover', { method: 'POST', body: JSON.stringify({ phone: phone, answer: answer, newPassword: newPassword }) }); },
  getUser: async function(phone) { return this._fetch('/api/users/' + encodeURIComponent(phone)); },
  updateAvatar: async function(phone, avatar) { return this._fetch('/api/users/' + encodeURIComponent(phone) + '/avatar', { method: 'POST', body: JSON.stringify({ avatar: avatar }) }); },
  getListings: async function() { return this._fetch('/api/listings'); },
  createListing: async function(listing) { return this._fetch('/api/listings', { method: 'POST', body: JSON.stringify(listing) }); },
  deleteListing: async function(id) { return this._fetch('/api/listings/' + encodeURIComponent(id), { method: 'DELETE' }); }, 
  createCapacity: async function(cap){ return this._fetch('/api/capacities', { method: 'POST', body: JSON.stringify(cap) }); },
  getCapacities: async function(){ return this._fetch('/api/capacities'); },
  createBooking: async function(b){ return this._fetch('/api/bookings', { method: 'POST', body: JSON.stringify(b) }); },
  getBookings: async function(phone){ return this._fetch('/api/bookings/' + encodeURIComponent(phone)); },
  createConversation: async function(c){ return this._fetch('/api/conversations', { method: 'POST', body: JSON.stringify(c) }); },
  getConversations: async function(phone){ return this._fetch('/api/conversations/' + encodeURIComponent(phone)); },
  createMessage: async function(m){ return this._fetch('/api/messages', { method: 'POST', body: JSON.stringify(m) }); },
  getMessages: async function(convId){ return this._fetch('/api/messages/' + encodeURIComponent(convId)); },
  createRating: async function(r){ return this._fetch('/api/ratings', { method: 'POST', body: JSON.stringify(r) }); },
  getRatings: async function(phone){ return this._fetch('/api/ratings/' + encodeURIComponent(phone)); },
  createMission: async function(m){ return this._fetch('/api/missions', { method: 'POST', body: JSON.stringify(m) }); },
  getMissions: async function(phone){ return this._fetch('/api/missions/' + encodeURIComponent(phone)); },
  createNotification: async function(n){ return this._fetch('/api/notifications', { method: 'POST', body: JSON.stringify(n) }); },
  getNotifications: async function(phone){ return this._fetch('/api/notifications/' + encodeURIComponent(phone)); },
  addFavorite: async function(phone, listingId){ return this._fetch('/api/favorites', { method: 'POST', body: JSON.stringify({ id: 'F' + Date.now(), userPhone: phone, listingId: listingId }) }); },
  getFavorites: async function(phone){ return this._fetch('/api/favorites/' + encodeURIComponent(phone)); },
  deleteAccount: async function(phone) { return this._fetch('/api/users/' + encodeURIComponent(phone) + '/delete', { method: 'DELETE' }); },
};
window.apiHealthCheck = async function() {
  console.log('Testing API connection...');
  var result = await api.health();
  if (result && result.status === 'ok') { console.log('✓ API connected:', result); if (typeof toast === 'function') toast('✓ اتصال به سرور برقرار شد'); return true; }
  else { console.warn('✗ API not reachable'); if (typeof toast === 'function') toast('✗ اتصال به سرور برقرار نشد'); return false; }
};
console.log('✓ API layer v1 loaded');



/* ==========================================================
   TARAZ — نقشه تعاملی صفحه «چه می‌خواهم؟»
   نسخه: 1.0 (راه‌اندازی اولیه نقشه و GeoJSON)
   ========================================================== */

// تنظیمات اولیه نقشه
const TARAZ_MAP_CONFIG = {
  geoJsonUrl: 'https://raw.githubusercontent.com/ssepehrnoush/Iran-geojson-map-boundaries/master/ir_states_boundaries_coordinates.geojson',
  center: [32.4279, 53.688], // مرکز ایران
  zoom: 5,
  colors: {
    border: '#123d32', // مرز استان‌ها
    fill: '#1f8062', // رنگ داخل استان‌ها
    fillHover: '#f0b429' // رنگ هاور
  }
};

// متغیر سراسری برای نگهداری نمونه نقشه
let tarazMapInstance = null;

// تابع راه‌اندازی نقشه
function initTarazMap() {
  const container = document.getElementById('leaflet-map');
  if (!container) return; // اگر کانتینر نبود، خارج شو

  // اگر نقشه قبلاً ساخته شده، فقط سایز آن را آپدیت کن
  if (tarazMapInstance) {
    tarazMapInstance.invalidateSize();
    return;
  }

  // ۱. ساخت نقشه
  tarazMapInstance = L.map('leaflet-map').setView(TARAZ_MAP_CONFIG.center, TARAZ_MAP_CONFIG.zoom);

  // ۲. اضافه کردن لایه کاشی‌ها (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap | تاراز'
  }).addTo(tarazMapInstance);

  // ۳. اضافه کردن GeoJSON استان‌های ایران
  fetch(TARAZ_MAP_CONFIG.geoJsonUrl)
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: function(feature) {
          return {
            color: TARAZ_MAP_CONFIG.colors.border,
            weight: 1.5,
            opacity: 0.85,
            fillColor: TARAZ_MAP_CONFIG.colors.fill,
            fillOpacity: 0.2
          };
        },
        onEachFeature: function(feature, layer) {
          // نام استان را از دیتا استخراج کن
          const name = feature.properties.NAME_1 || feature.properties.name || 'استان';
          
          // اضافه کردن تولتیپ (هاور)
          layer.bindTooltip(name, { sticky: true, direction: 'top' });

          // افکت هاور
          layer.on({
            mouseover: function(e) {
              e.target.setStyle({ fillColor: TARAZ_MAP_CONFIG.colors.fillHover, fillOpacity: 0.4 });
            },
            mouseout: function(e) {
              e.target.setStyle({ fillColor: TARAZ_MAP_CONFIG.colors.fill, fillOpacity: 0.2 });
            }
          });
        }
      }).addTo(tarazMapInstance);
    })
    .catch(err => console.error('خطا در لود نقشه:', err));
}

// گوش دادن به رویداد تغییر صفحه برای راه‌اندازی نقشه
// (چون نقشه در صفحه‌ای غیرفعال است، باید وقتی صفحه باز شد ساخته شود)
document.addEventListener('taraz:screenShown', (e) => {
  if (e.detail && e.detail.screenId === 'map-detail') {
    // کمی تاخیر برای اطمینان از باز شدن کامل صفحه
    setTimeout(() => {
      initTarazMap();
      if (tarazMapInstance) tarazMapInstance.invalidateSize();
    }, 200);
  }
});

// راه‌اندازی اولیه اگر صفحه از قبل باز باشد (برای تست دستی)
document.addEventListener('DOMContentLoaded', () => {
  const mapScreen = document.getElementById('screen-map-detail');
  if (mapScreen && mapScreen.classList.contains('active')) {
    setTimeout(() => initTarazMap(), 200);
  }
});
