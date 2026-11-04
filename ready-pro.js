/* اعلام آمادگی حرفه‌ای: ویزارد ۳ مرحله‌ای */
(function(){
  'use strict';
  var KEY=function(p){return 'ready_profile_'+p;};
  var SCOPES=[['country','کل کشور'],['province','استان'],['county','شهرستان'],['village','روستا / منطقه مشخص']];
  var SLOTS=[['morning','صبح'],['noon','ظهر'],['evening','عصر'],['full','تمام روز'],['night','شب‌کاری']];
  var HINT={'روز':'مثلاً ۱ میلیون تومان برای هر روز','بازدید':'مثلاً ۵۰۰ هزار تومان برای هر بازدید','ساعت':'مثلاً ۲۰۰ هزار تومان برای هر ساعت','رأس':'مثلاً ۱۰۰ هزار تومان برای هر رأس','نمونه':'هزینه هر نمونه','عدد':'هزینه هر عدد'};
  var st={step:1,scope:'province',lat:null,lng:null,auto:false,rateMode:'approx',slots:[],photo:null};

  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function prof(){var u=window.DB&&DB.user;return u?(DB._get(KEY(u.phone),{})||{}):{};}
  function unitOf(type){try{var f=null;SERVICES.forEach(function(s){s.types.forEach(function(t){if(t.id===type)f=t;});});return f?f.unit:'روز';}catch(e){return 'روز';}}

  function build(){
    var host=$('ready-pro');if(!host)return;
    var opts='';
    try{SERVICES.forEach(function(s){
      opts+='<optgroup label="'+esc(s.icon+' '+s.title)+'">';
      s.types.forEach(function(t){opts+='<option value="'+esc(t.id)+'">'+esc(t.icon+' '+t.label)+'</option>';});
      opts+='</optgroup>';
    });}catch(e){opts='<option value="transport">راننده</option>';}
    var chips=function(arr,k){return arr.map(function(x){return '<button type="button" class="rp-chip" data-'+k+'="'+x[0]+'">'+x[1]+'</button>';}).join('');};

    host.innerHTML=
     '<div class="rp-steps"><i data-s="1"></i><i data-s="2"></i><i data-s="3"></i></div>'+
     '<div class="rp-title" id="rp-title"></div>'+

     '<div class="rp-pane" data-p="1">'+
       '<div class="field" style="margin:0"><label>شغل / تخصص شما</label><select id="ready-service-type">'+opts+'</select></div>'+
       '<div class="card rp-card"><h3>📷 عکس کار شما</h3><div class="rp-small">یک عکس از خودتان یا محل کار/ابزار بگذارید تا اعتماد بیشتری جلب کنید.</div>'+
         '<div class="rp-photo" id="rp-photo"><span>＋</span></div>'+
         '<input type="file" id="rp-file" accept="image/*" style="display:none">'+
         '<button type="button" class="btn-gold" id="rp-pick" style="min-height:44px;font-size:14px">انتخاب عکس</button></div>'+
     '</div>'+

     '<div class="rp-pane" data-p="2">'+
       '<div class="card rp-card"><h3>📍 موقعیت و محدوده کار</h3>'+
         '<button type="button" class="btn-gold" id="rp-geo" style="min-height:46px;font-size:14px">📡 تشخیص خودکار موقعیت من</button>'+
         '<div id="rp-geo-out" class="rp-small"></div>'+
         '<label class="rp-lbl">تا کجا کار می‌کنید؟</label><div class="rp-row" id="rp-scope">'+chips(SCOPES,'scope')+'</div>'+
         '<div id="rp-manual">'+
           '<div class="field" id="rp-f-province"><label>استان</label><input id="rp-province" placeholder="مثلاً: خوزستان"></div>'+
           '<div class="field" id="rp-f-county"><label>شهرستان</label><input id="rp-county" placeholder="مثلاً: ایذه"></div>'+
           '<div class="field" id="rp-f-village"><label>روستا / منطقه</label><input id="rp-village" placeholder="نام روستا"></div>'+
         '</div>'+
         '<input type="hidden" id="ready-region">'+
       '</div>'+
     '</div>'+

     '<div class="rp-pane" data-p="3">'+
       '<div class="card rp-card"><h3>💰 دستمزد (اختیاری)</h3>'+
         '<div class="field" style="margin:0"><label id="rp-rate-lbl">دستمزد</label><input id="rp-rate" inputmode="numeric"></div>'+
         '<div class="rp-row" id="rp-mode"><button type="button" class="rp-chip" data-mode="approx">تقریبی</button><button type="button" class="rp-chip" data-mode="fixed">قطعی</button></div></div>'+
       '<div class="card rp-card"><h3>🕒 ساعات آمادگی</h3><div class="rp-row" id="rp-slots">'+chips(SLOTS,'slot')+'</div></div>'+
       '<div class="card rp-card rp-policy"><h3>⚖️ قانون لغو</h3>'+
         '<div>• تا <b>۲۴ ساعت</b> قبل از شروع کار، لغو رایگان است.</div>'+
         '<div>• از ۲۴ ساعت به بعد، رزرو قطعی است و طرفی که لغو کند «مقصر» ثبت می‌شود و امتیازش کم می‌شود.</div></div>'+
       '<div class="field" style="margin:0"><label>توضیحات (اختیاری)</label><textarea id="ready-notes" style="min-height:70px" placeholder="مثلاً: ابزار همراه خودم است..."></textarea></div>'+
     '</div>'+

     '<div class="rp-nav"><button type="button" class="btn-outline" id="rp-back">قبلی</button><button type="button" class="btn-primary" id="rp-next">بعدی</button></div>';

    host.onclick=function(e){
      var b=e.target.closest('button,.rp-photo');if(!b)return;
      if(b.id==='rp-geo')return geo();
      if(b.id==='rp-pick'||b.id==='rp-photo')return $('rp-file').click();
      if(b.id==='rp-back'){st.step=Math.max(1,st.step-1);return paint();}
      if(b.id==='rp-next')return next();
      if(b.dataset.scope){st.scope=b.dataset.scope;paint();}
      else if(b.dataset.mode){st.rateMode=b.dataset.mode;paint();}
      else if(b.dataset.slot){var i=st.slots.indexOf(b.dataset.slot);if(i<0)st.slots.push(b.dataset.slot);else st.slots.splice(i,1);paint();}
    };
    $('ready-service-type').onchange=paint;
    $('rp-file').onchange=function(){pickPhoto(this.files&&this.files[0]);};
  }

  function pickPhoto(f){
    if(!f)return;
    var img=new Image(),url=URL.createObjectURL(f);
    img.onload=function(){
      var m=480,r=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement('canvas');
      c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      st.photo=c.toDataURL('image/jpeg',0.65);URL.revokeObjectURL(url);paint();
    };
    img.onerror=function(){toast('عکس خوانده نشد');};
    img.src=url;
  }

  var TITLES=['','مرحله ۱ از ۳ — شغل و عکس','مرحله ۲ از ۳ — موقعیت و محدوده','مرحله ۳ از ۳ — دستمزد و شرایط'];
  function paint(){
    var order=['country','province','county','village'],ix=order.indexOf(st.scope);
    document.querySelectorAll('.rp-pane').forEach(function(p){p.style.display=(+p.dataset.p===st.step)?'':'none';});
    document.querySelectorAll('.rp-steps i').forEach(function(i){i.className=(+i.dataset.s<=st.step)?'on':'';});
    $('rp-title').textContent=TITLES[st.step];
    $('rp-back').style.visibility=st.step>1?'visible':'hidden';
    $('rp-next').textContent=st.step===3?'💾 ذخیره و پایان':'بعدی';
    document.querySelectorAll('#rp-scope .rp-chip').forEach(function(b){b.classList.toggle('on',b.dataset.scope===st.scope);});
    document.querySelectorAll('#rp-mode .rp-chip').forEach(function(b){b.classList.toggle('on',b.dataset.mode===st.rateMode);});
    document.querySelectorAll('#rp-slots .rp-chip').forEach(function(b){b.classList.toggle('on',st.slots.indexOf(b.dataset.slot)>=0);});
    /* با موقعیت خودکار، فیلدهای دستی غیرفعال می‌شوند */
    var man=$('rp-manual');man.classList.toggle('off',st.auto);
    ['province','county','village'].forEach(function(k,i){
      var f=$('rp-f-'+k),inp=$('rp-'+k);
      f.style.display=(ix>=i+1)?'':'none';inp.disabled=st.auto;
    });
    $('rp-geo').textContent=st.auto?'✓ موقعیت خودکار فعال (برای تغییر، دوباره بزنید)':'📡 تشخیص خودکار موقعیت من';
    var ph=$('rp-photo');ph.innerHTML=st.photo?'<img src="'+st.photo+'" alt="">':'<span>＋</span>';
    var u=unitOf($('ready-service-type').value);
    $('rp-rate-lbl').textContent='دستمزد (تومان برای هر '+u+')';
    $('rp-rate').placeholder=HINT[u]||'مبلغ به تومان';
    paintSw();
  }

  function geo(){
    var out=$('rp-geo-out');
    if(!navigator.geolocation){out.textContent='مرورگر از موقعیت‌یابی پشتیبانی نمی‌کند؛ محدوده را دستی بنویسید.';return;}
    out.textContent='در حال دریافت موقعیت...';
    navigator.geolocation.getCurrentPosition(function(p){
      st.lat=+p.coords.latitude.toFixed(4);st.lng=+p.coords.longitude.toFixed(4);st.auto=true;
      out.textContent='✓ موقعیت ثبت شد ('+st.lat+', '+st.lng+')؛ نیازی به نوشتن استان و شهرستان نیست.';
      paint();
    },function(){st.auto=false;out.textContent='دسترسی به موقعیت داده نشد؛ محدوده را دستی بنویسید.';paint();},{timeout:12000,maximumAge:600000});
  }

  function next(){
    if(st.step===2&&!st.auto&&st.scope!=='country'){
      var need={province:'rp-province',county:'rp-county',village:'rp-village'}[st.scope];
      if(!$(need).value.trim()){toast('موقعیت را خودکار بگیرید یا محدوده را بنویسید');return;}
    }
    if(st.step<3){st.step++;paint();window.scrollTo&&($('screen-ready').scrollTop=0);return;}
    save();
  }

  async function save(){
    var u=DB.user;if(!u){go('auth');return;}
    var type=$('ready-service-type').value;
    var d={scope:st.scope,auto:st.auto,lat:st.lat,lng:st.lng,slots:st.slots,cancel:{free_hours:24},photo:st.photo,
           province:'',county:'',village:''};
    if(!st.auto){
      var ord=['country','province','county','village'],ix=ord.indexOf(st.scope);
      if(ix>=1)d.province=$('rp-province').value.trim();
      if(ix>=2)d.county=$('rp-county').value.trim();
      if(ix>=3)d.village=$('rp-village').value.trim();
    }
    var amt=($('rp-rate').value||'').replace(/[^\d]/g,'');
    if(amt)d.rate={amount:amt,mode:st.rateMode,unit:unitOf(type)};
    var region=st.scope==='country'?'کل کشور':(st.auto&&!d.province?'موقعیت خودکار':[d.village,d.county,d.province].filter(Boolean).join('، '));
    var old=prof();
    var p={phone:u.phone,name:u.name,is_ready:old._off?false:true,_off:!!old._off,done:true,service_type:type,region:region,notes:$('ready-notes').value.trim(),details:d};
    DB._set(KEY(u.phone),p);
    try{
      var r=await fetch(API_BASE+'/api/ready',{method:'POST',headers:authHeaders(),body:JSON.stringify(p)});
      toast(r.ok?'✓ اطلاعات ذخیره شد':'⚠ فقط محلی ذخیره شد');
    }catch(e){toast('⚠ فقط محلی ذخیره شد');}
    try{_isReady=p.is_ready;renderReadyProfile();}catch(x){}setTimeout(paintSw,50);
    st.editing=false;fill();
  }
  window.saveReadyProfile=save;

  /* کلید دو حالته لایک / دیس‌لایک */
  function paintSw(){
    var on=!!prof().is_ready;
    try{if(typeof _isReady==='boolean'&&document.getElementById('ready-status-text').textContent.indexOf('آماده به کار هستید')>=0)on=true;else if(document.getElementById('ready-status-text').textContent.indexOf('استراحت')>=0)on=false;}catch(e){}
    document.querySelectorAll('#rp-sw button').forEach(function(b){b.classList.toggle('on',(b.dataset.v==='1')===on);});
  }
  function setReady(v){
    var u=DB.user;if(!u){go('auth');return;}
    var p=prof();p.is_ready=v;p._off=!v;DB._set(KEY(u.phone),p);
    try{_isReady=v;}catch(e){}
    try{renderReadyProfile();}catch(e){}
    setTimeout(paintSw,50);toast(v?'👍 شما آماده به کار هستید':'👎 شما غیرفعال هستید');
    if(p.service_type){fetch(API_BASE+'/api/ready',{method:'POST',headers:authHeaders(),body:JSON.stringify(p)}).catch(function(){});}
    else toast('بعد از تکمیل مراحل، اطلاعات ذخیره می‌شود');
  }

  function fill(){
    var p=prof(),d=p.details||{};
    if(p.service_type)$('ready-service-type').value=p.service_type;
    st.step=1;st.scope=d.scope||'province';st.lat=d.lat||null;st.lng=d.lng||null;st.auto=!!d.auto;
    st.rateMode=(d.rate&&d.rate.mode)||'approx';st.slots=d.slots||[];st.photo=d.photo||null;
    $('rp-province').value=d.province||'';$('rp-county').value=d.county||'';$('rp-village').value=d.village||'';
    $('rp-rate').value=(d.rate&&d.rate.amount)||'';
    $('ready-notes').value=p.notes||'';
    $('rp-geo-out').textContent=st.auto?('✓ موقعیت ثبت‌شده ('+st.lat+', '+st.lng+')'):'';
    paint();
    summary();
  }

  function summary(){
    var host=$('ready-pro');if(!host)return;
    var p=prof(),box=$('rp-sum');
    if(!box){box=document.createElement('div');box.id='rp-sum';host.parentNode.insertBefore(box,host);
      box.onclick=function(e){if(e.target.closest('#rp-edit')){st.editing=true;summary();}};}
    var show=!!p.done&&!st.editing;
    host.style.display=show?'none':'';box.style.display=show?'':'none';
    if(!show)return;
    var d=p.details||{},t=$('ready-service-type'),nm=t&&t.options[t.selectedIndex]?t.options[t.selectedIndex].text:'';
    box.innerHTML='<div class="card rp-card" style="margin:0 16px!important"><h3>✅ اطلاعات شما ثبت شده</h3>'
      +'<div class="rp-small">'+esc(nm)+(p.region?' — '+esc(p.region):'')+'</div>'
      +'<div class="rp-small">برای شروع یا توقف دریافت کار، فقط از کلید 👍 / 👎 بالا استفاده کنید.</div>'
      +'<button type="button" class="btn-outline" id="rp-edit" style="min-height:46px">✏️ ویرایش اطلاعات</button></div>';
  }

  var css=document.createElement('style');
  css.textContent='.rp-card{margin:0!important;display:flex;flex-direction:column;gap:10px}.rp-card h3{font-size:16px;margin:0}'
   +'#ready-pro{padding:0 16px;display:flex;flex-direction:column;gap:14px}.rp-pane{display:flex;flex-direction:column;gap:14px}'
   +'.rp-small{font-size:12px;opacity:.75;line-height:1.8}.rp-lbl{font-size:13px;font-weight:700}.rp-row{display:flex;flex-wrap:wrap;gap:8px}'
   +'.rp-chip{padding:9px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:transparent;color:inherit;font:600 13px Vazirmatn,Tahoma,sans-serif}'
   +'.rp-chip.on{border-color:#39ff14;color:#39ff14;background:rgba(57,255,20,.1)}'
   +'.rp-policy{border-color:#f0b429!important;line-height:1.9;font-size:13px}'
   +'.rp-steps{display:flex;gap:6px}.rp-steps i{flex:1;height:5px;border-radius:9px;background:rgba(255,255,255,.15)}.rp-steps i.on{background:#39ff14}'
   +'.rp-title{font-weight:800;font-size:15px}'
   +'#rp-manual.off{opacity:.4;pointer-events:none}'
   +'.rp-photo{width:120px;height:120px;border-radius:18px;border:2px dashed rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:36px;overflow:hidden;align-self:center}'
   +'.rp-photo img{width:100%;height:100%;object-fit:cover}'
   +'.rp-nav{display:flex;gap:10px}.rp-nav button{flex:1;min-height:54px;font-size:16px}'
   +'.rp-sw{display:flex;gap:12px;justify-content:center}'
   +'.rp-sw button{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:110px;padding:12px;border-radius:18px;border:2px solid rgba(128,128,128,.35);background:transparent;color:inherit;font-size:30px;opacity:.55}'
   +'.rp-sw button span{font:700 12px Vazirmatn,Tahoma,sans-serif}'
   +'.rp-sw button[data-v="1"].on{opacity:1;border-color:#16a34a;background:rgba(22,163,74,.15)}'
   +'.rp-sw button[data-v="0"].on{opacity:1;border-color:#e63946;background:rgba(230,57,70,.15)}';
  document.head.appendChild(css);

  var _rr=window.renderReadyProfile;
  if(typeof _rr==='function'){window.renderReadyProfile=async function(){var r=await _rr.apply(this,arguments);paintSw();return r;};}
  var _go=window.go;
  function init(){
    build();
    var sw=$('rp-sw');if(sw)sw.onclick=function(e){var b=e.target.closest('button');if(b)setReady(b.dataset.v==='1');};
    if(typeof _go==='function'&&!window.__rpWrapped){window.__rpWrapped=1;
      window.go=function(s){var r=_go.apply(this,arguments);if(s==='ready')setTimeout(function(){if(!$('rp-rate'))build();fill();},0),setTimeout(function(){paintSw();},400);return r;};}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
