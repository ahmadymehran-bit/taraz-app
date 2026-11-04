/* Swipe navigation + availability (like/dislike) toggle. Does not modify script.js. */
(function(){
  var ORDER=['home','browse','jobs','chatlist','profile'];

  /* ---------- availability toggle ---------- */
  var KEY=function(p){return 'ready_profile_'+p;};
  var ICON_ON='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2 21h4V9H2v12zm20-11a2 2 0 0 0-2-2h-6.3l1-4.6v-.3a1.5 1.5 0 0 0-.4-1L13.2 1 7.6 6.6A2 2 0 0 0 7 8v11a2 2 0 0 0 2 2h9a2 2 0 0 0 1.8-1.2l3-7A2 2 0 0 0 23 12v-2z"/></svg>';
  var ICON_OFF='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M22 3h-4v12h4V3zM2 14a2 2 0 0 0 2 2h6.3l-1 4.6v.3c0 .4.2.8.4 1l1.1 1.1 5.6-5.6A2 2 0 0 0 17 16V5a2 2 0 0 0-2-2H6a2 2 0 0 0-1.8 1.2l-3 7A2 2 0 0 0 1 12v2z"/></svg>';

  function prof(){var u=(typeof DB!=="undefined")&&DB.user;return u?DB._get(KEY(u.phone),null):null;}
  function paint(btn){
    var p=prof(),on=!!(p&&p.is_ready);
    btn.className='av-toggle '+(on?'on':'off');
    btn.innerHTML=(on?ICON_ON:ICON_OFF)+'<span>'+(on?'آماده به کار':'غیرفعال')+'</span>';
  }
  function ensure(id){
    var scr=document.getElementById(id);if(!scr)return null;
    var b=scr.querySelector('.av-toggle');
    if(!b){
      b=document.createElement('button');b.type='button';
      b.addEventListener('click',toggle);
      scr.appendChild(b);
    }

    return b;
  }
  function refresh(){['screen-jobs','screen-services'].forEach(function(id){var b=ensure(id);if(b)paint(b);});paintHome();}
  function paintHome(){
    var p=prof(),on=!!(p&&p.is_ready);
    document.querySelectorAll('.mh-info .av-home').forEach(function(x){x.remove();});
    document.querySelectorAll('.mh-bell').forEach(function(bell){
      var b=bell.parentNode.querySelector(':scope > .av-like');
      if(!b){
        b=document.createElement('button');b.type='button';b.className='av-like';
        b.setAttribute('aria-label','وضعیت آماده به کار');
        b.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();toggle();});
        bell.parentNode.insertBefore(b,bell);
      }
      b.className='av-like '+(on?'on':'off');
      b.title=on?'آماده به کار':'غیرفعال';
      b.innerHTML=ICON_ON;
    });
  }
  function toggle(){
    var u=DB.user;if(!u)return;
    var p=prof();
    if(!p||!p.service_type){
      toast('ابتدا از «پروفایل ← اعلام آمادگی» تنظیمات را یک بار ثبت کنید');return;
    }
    p.is_ready=!p.is_ready;p._off=!p.is_ready;try{_isReady=p.is_ready;}catch(e){}
    DB._set(KEY(u.phone),p);
    refresh();
    toast(p.is_ready?'👍 شما آماده به کار هستید':'👎 شما در حال حاضر غیرفعال هستید');
    try{
      fetch(API_BASE+'/api/ready',{method:'POST',headers:authHeaders(),body:JSON.stringify(p)})
        .then(function(r){if(!r.ok)toast('⚠ فقط محلی ذخیره شد');}).catch(function(){});
    }catch(e){}
  }

  /* repaint after navigation */
  var _go=window.go;
  if(typeof _go==='function'){
    window.go=function(s){var r=_go.apply(this,arguments);setTimeout(refresh,0);return r;};
  }
  document.addEventListener('DOMContentLoaded',refresh);
  setTimeout(refresh,500);
  document.addEventListener('click',function(){setTimeout(paintHome,0);},true);

  var css=document.createElement('style');
  css.textContent='.av-like{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;border:1px solid;background:transparent;margin-inline-end:6px;flex-shrink:0}.av-like svg{width:20px;height:20px}.modern-header .av-like{margin-inline-start:auto!important;margin-inline-end:8px!important}.av-like.on{color:#16a34a;border-color:#16a34a}.av-like.off{color:#e63946;border-color:#e63946}.av-toggle{position:fixed;left:14px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:30;display:none;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:rgba(7,32,15,.85);backdrop-filter:blur(8px);font:700 12px Vazirmatn,Tahoma,sans-serif}'
   +'#screen-jobs.active .av-toggle,#screen-services.active .av-toggle{display:flex}'
   +'.av-toggle.on{color:#39ff14;border-color:#39ff14}.av-toggle.off{color:#ff5252;border-color:#ff5252}';
  document.head.appendChild(css);
  
})();
