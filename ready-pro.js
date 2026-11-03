/* اعلام آمادگی حرفه‌ای: شغل، محدوده کاری، موقعیت، دستمزد تقریبی، قوانین لغو */
(function(){
  'use strict';
  var KEY=function(p){return 'ready_profile_'+p;};
  var SCOPES=[['country','کل کشور'],['province','استان'],['county','شهرستان'],['village','روستا / منطقه مشخص']];
  var SLOTS=[['morning','صبح'],['noon','ظهر'],['evening','عصر'],['full','تمام روز'],['night','شب‌کاری']];
  /* پیشنهاد دستمزد بر حسب واحد هر شغل */
  var HINT={'روز':'مثلاً ۱ ملیون تومان برای هر روز','بازدید':'مثلاً ۵۰۰ هزار تومان برای هر بازدید','ساعت':'مثلاً ۲۰۰ هزار تومان برای هر ساعت',
            'رأس':'مثلاً ۱۰۰ هزار تومان برای هر رأس','نمونه':'هزینه هر نمونه','عدد':'هزینه هر عدد'};
  var st={scope:'province',lat:null,lng:null,rateMode:'approx',slots:[]};

  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function prof(){var u=window.DB&&DB.user;return u?(DB._get(KEY(u.phone),{})||{}):{};}
  function unitOf(type){
    try{var found=null;SERVICES.forEach(function(s){s.types.forEach(function(t){if(t.id===type)found=t;});});return found?found.unit:'روز';}catch(e){return 'روز';}
  }

  function build(){
    var host=$('ready-pro');if(!host)return;
    var opts='';
    try{SERVICES.forEach(function(s){
      opts+='<optgroup label="'+esc(s.icon+' '+s.title)+'">';
      s.types.forEach(function(t){opts+='<option value="'+esc(t.id)+'">'+esc(t.icon+' '+t.label)+'</option>';});
      opts+='</optgroup>';
    });}catch(e){opts='<option value="transport">راننده</option>';}
    var scopeBtns=SCOPES.map(function(x){return '<button type="button" class="rp-chip" data-scope="'+x[0]+'">'+x[1]+'</button>';}).join('');
    var slotBtns=SLOTS.map(function(x){return '<button type="button" class="rp-chip" data-slot="'+x[0]+'">'+x[1]+'</button>';}).join('');
    host.innerHTML=
     '<div class="field" style="margin:16px"><label>شغل / تخصص شما</label><select id="ready-service-type">'+opts+'</select></div>'+

     '<div class="card rp-card"><h3>📍 موقعیت و محدوده کار</h3>'+
       '<button type="button" class="btn-gold" id="rp-geo" style="min-height:46px;font-size:14px">📡 تشخیص خودکار موقعیت من</button>'+
       '<div id="rp-geo-out" class="rp-small"></div>'+
       '<label class="rp-lbl">تا کجا کار می‌کنید؟</label><div class="rp-row" id="rp-scope">'+scopeBtns+'</div>'+
       '<div class="field" id="rp-f-province"><label>استان</label><input id="rp-province" placeholder="مثلاً: خوزستان"></div>'+
       '<div class="field" id="rp-f-county"><label>شهرستان</label><input id="rp-county" placeholder="مثلاً: ایذه"></div>'+
       '<div class="field" id="rp-f-village"><label>روستا / منطقه</label><input id="rp-village" placeholder="نام روستا"></div>'+
       '<input type="hidden" id="ready-region">'+
     '</div>'+

     '<div class="card rp-card"><h3>💰 دستمزد (اختیاری)</h3>'+
       '<div class="rp-small">قیمت تقریبی بگذارید؛ مبلغ نهایی با توافق دو طرف است.</div>'+
       '<div class="field"><label id="rp-rate-lbl">دستمزد</label><input id="rp-rate" inputmode="numeric" placeholder=""></div>'+
       '<div class="rp-row" id="rp-mode"><button type="button" class="rp-chip" data-mode="approx">تقریبی</button><button type="button" class="rp-chip" data-mode="fixed">قطعی</button></div>'+
     '</div>'+

     '<div class="card rp-card"><h3>🕒 ساعات آمادگی</h3><div class="rp-row" id="rp-slots">'+slotBtns+'</div></div>'+

     '<div class="card rp-card rp-policy"><h3>⚖️ قانون لغو</h3>'+
       '<div>• تا <b>۲۴ ساعت</b> قبل از شروع کار، لغو رایگان است.</div>'+
       '<div>• از ۲۴ ساعت به بعد، رزرو قطعی است و طرفی که لغو کند «مقصر» ثبت می‌شود و امتیازش کم می‌شود.</div>'+
       '<div class="rp-small">با ذخیره، این قانون را می‌پذیرید.</div></div>'+

     '<div class="field" style="margin:16px"><label>توضیحات (اختیاری)</label><textarea id="ready-notes" style="min-height:80px" placeholder="مثلاً: ظرفیت یک گاو اضافه دارم، ابزار همراه خودم است..."></textarea></div>';

    host.onclick=function(e){
      var b=e.target.closest('button');if(!b)return;
      if(b.id==='rp-geo')return geo();
      if(b.dataset.scope){st.scope=b.dataset.scope;paint();}
      else if(b.dataset.mode){st.rateMode=b.dataset.mode;paint();}
      else if(b.dataset.slot){var i=st.slots.indexOf(b.dataset.slot);if(i<0)st.slots.push(b.dataset.slot);else st.slots.splice(i,1);paint();}
    };
    $('ready-service-type').onchange=paintRate;
  }

  function paintRate(){
    var t=$('ready-service-type').value,u=unitOf(t);
    $('rp-rate-lbl').textContent='دستمزد (تومان برای هر '+u+')';
    $('rp-rate').placeholder=HINT[u]||'مبلغ به تومان';
  }
  function paint(){
    var order=['country','province','county','village'],ix=order.indexOf(st.scope);
    document.querySelectorAll('#rp-scope .rp-chip').forEach(function(b){b.classList.toggle('on',b.dataset.scope===st.scope);});
    document.querySelectorAll('#rp-mode .rp-chip').forEach(function(b){b.classList.toggle('on',b.dataset.mode===st.rateMode);});
    document.querySelectorAll('#rp-slots .rp-chip').forEach(function(b){b.classList.toggle('on',st.slots.indexOf(b.dataset.slot)>=0);});
    ['province','county','village'].forEach(function(k,i){var f=$('rp-f-'+k);if(f)f.style.display=(ix>=i+1)?'':'none';});
    paintRate();
  }

  function geo(){
    var out=$('rp-geo-out');
    if(!navigator.geolocation){out.textContent='مرورگر از موقعیت‌یابی پشتیبانی نمی‌کند؛ محدوده را دستی بنویسید.';return;}
    out.textContent='در حال دریافت موقعیت...';
    navigator.geolocation.getCurrentPosition(function(p){
      st.lat=+p.coords.latitude.toFixed(4);st.lng=+p.coords.longitude.toFixed(4);
      out.textContent='✓ موقعیت ثبت شد ('+st.lat+', '+st.lng+')';
    },function(){out.textContent='دسترسی به موقعیت داده نشد؛ محدوده را دستی بنویسید.';},{enableHighAccuracy:false,timeout:12000,maximumAge:600000});
  }

  function fill(){
    var p=prof(),d=p.details||{};
    if(p.service_type)$('ready-service-type').value=p.service_type;
    st.scope=d.scope||'province';st.lat=d.lat||null;st.lng=d.lng||null;
    st.rateMode=(d.rate&&d.rate.mode)||'approx';st.slots=d.slots||[];
    $('rp-province').value=d.province||'';$('rp-county').value=d.county||'';$('rp-village').value=d.village||'';
    $('rp-rate').value=(d.rate&&d.rate.amount)||'';
    $('ready-notes').value=p.notes||'';
    $('rp-geo-out').textContent=st.lat?('✓ موقعیت ثبت‌شده ('+st.lat+', '+st.lng+')'):'';
    paint();
  }

  window.saveReadyProfile=async function(){
    var u=DB.user;if(!u){go('auth');return;}
    var type=$('ready-service-type').value;
    var d={scope:st.scope,province:$('rp-province').value.trim(),county:$('rp-county').value.trim(),village:$('rp-village').value.trim(),
           lat:st.lat,lng:st.lng,slots:st.slots,cancel:{free_hours:24}};
    var amt=($('rp-rate').value||'').replace(/[^\d۰-۹]/g,'');
    if(amt)d.rate={amount:amt,mode:st.rateMode,unit:unitOf(type)};
    if(st.scope==='country'){d.province=d.county=d.village='';}
    if(st.scope==='province'){d.county=d.village='';}
    if(st.scope==='county'){d.village='';}
    var need={province:d.province,county:d.county,village:d.village}[st.scope];
    if(st.scope!=='country'&&!need){toast('محدوده کار را کامل کنید');return;}
    if(st.scope==='country')d.country=true;
    if(!st.lat&&st.scope==='country'){/* موقعیت اختیاری برای کل کشور */}
    else if(!st.lat&&!need){toast('موقعیت را تشخیص دهید یا محدوده را بنویسید');return;}
    var region=st.scope==='country'?'کل کشور':[d.village,d.county,d.province].filter(Boolean).join('، ');
    var old=prof();
    var profile={phone:u.phone,name:u.name,is_ready:!!old.is_ready,service_type:type,region:region,notes:$('ready-notes').value.trim(),details:d};
    DB._set(KEY(u.phone),profile);
    try{
      var r=await fetch(API_BASE+'/api/ready',{method:'POST',headers:authHeaders(),body:JSON.stringify(profile)});
      toast(r.ok?'✓ اطلاعات ذخیره شد':'⚠ فقط محلی ذخیره شد');
    }catch(e){toast('⚠ فقط محلی ذخیره شد');}
  };

  var css=document.createElement('style');
  css.textContent='.rp-card{margin:16px;display:flex;flex-direction:column;gap:10px}.rp-card h3{font-size:16px;margin:0}'
   +'.rp-small{font-size:12px;opacity:.75;line-height:1.8}.rp-lbl{font-size:13px;font-weight:700}'
   +'.rp-row{display:flex;flex-wrap:wrap;gap:8px}'
   +'.rp-chip{padding:9px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:transparent;color:inherit;font:600 13px Vazirmatn,Tahoma,sans-serif}'
   +'.rp-chip.on{border-color:#39ff14;color:#39ff14;background:rgba(57,255,20,.1)}'
   +'.rp-policy{border-color:#f0b429!important;line-height:1.9;font-size:13px}';
  document.head.appendChild(css);

  var _go=window.go;
  function init(){build();if(typeof _go==='function'&&!window.__rpWrapped){window.__rpWrapped=1;window.go=function(s){var r=_go.apply(this,arguments);if(s==='ready')setTimeout(function(){if(!$('rp-rate'))build();fill();},0);setTimeout(fill,400);return r;};}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
