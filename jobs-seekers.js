/* صفحه مشاغل: فقط افرادی که خودشان را «آماده به کار» کرده‌اند نشان داده می‌شوند.
   آگهی‌های عمومی (لیست‌ها و درخواست‌ها) در این صفحه نمایش داده نمی‌شوند. */
(function(){
  function allTypes(){
    var out=[];
    (typeof SERVICES!=='undefined'?SERVICES:[]).forEach(function(g){(g.types||[]).forEach(function(t){out.push({sv:g,t:t})})});
    return out;
  }
  function norm(s){ return (typeof rdNorm==='function'?rdNorm(String(s||'')):String(s||'')).toLowerCase(); }
  async function fetchReady(){
    var types=allTypes();
    var res=await Promise.all(types.map(function(x){
      return fetch(API_BASE+'/api/ready/'+encodeURIComponent(x.t.id))
        .then(function(r){return r.ok?r.json():{profiles:[]}}).catch(function(){return {profiles:[]}});
    }));
    var seen={},list=[];
    res.forEach(function(r,i){
      (r.profiles||[]).forEach(function(p){
        if(!p||seen[p.phone])return; seen[p.phone]=1;
        list.push({p:p,sv:types[i].sv,t:types[i].t});
      });
    });
    return list;
  }
  function label(x){ return x.sv.title+' - '+x.t.label; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}); }
  function card(x){
    var p=x.p, d=p.details||{};
    var region=p.region||[d.province,d.county,d.village].filter(Boolean).join('، ');
    return '<div class="seeker-card" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px;margin:8px 0;color:#fff">'
      +'<div style="font-weight:700;color:#39ff14">'+esc(p.name||'بدون نام')+'</div>'
      +'<div style="font-size:13px;margin-top:4px">'+esc(label(x))+'</div>'
      +(region?'<div style="font-size:12px;opacity:.7;margin-top:4px">📍 '+esc(region)+'</div>':'')
      +'</div>';
  }
  window.jbSearch=async function(e,fromChip){
    if(e&&e.preventDefault)e.preventDefault();
    if(window._jb&&_jb.busy)return;
    var qRaw=document.getElementById('jb-q').value.trim(), q=norm(qRaw);
    var stt=document.getElementById('jb-status'),list=document.getElementById('jb-list');
    _jb.busy=true; stt.textContent='در حال اسکن منظومه…'; list.innerHTML='';
    _jb.target=.42; document.getElementById('jb-stage').classList.add('jb-fast');
    var fetching=fetchReady().catch(function(){return []});
    await new Promise(function(r){setTimeout(r,1300)});
    _jb.target=.003;
    var all=await fetching;
    var out=all.filter(function(x){
      if(!q)return true;
      var d=x.p.details||{};
      return norm([x.p.name,label(x),x.p.region,x.p.notes,d.profession,d.work_area].join(' ')).indexOf(q)>-1;
    });
    await new Promise(function(r){setTimeout(r,1700)});
    document.getElementById('jb-stage').classList.remove('jb-fast');
    if(out.length){
      jbSetItems(out.slice(0,7).map(function(x){var g=x.sv;return {icon:g.icon||'👤',onclick:function(){}}}));
      stt.textContent=faDigits(out.length)+' فرد آماده به کار پیدا شد';
      list.innerHTML=out.map(card).join('');
    }else{
      jbIdleItems();
      stt.textContent=qRaw?'فرد آماده‌ای برای «'+qRaw+'» پیدا نشد':'فعلاً کسی آماده به کار نیست';
    }
    _jb.busy=false;
  };
  var _go=window.go;
  if(typeof _go==='function'&&!window.__jsWrapped){window.__jsWrapped=1;
    window.go=function(s){var r=_go.apply(this,arguments);
      if(s==='jobs')setTimeout(function(){var q=document.getElementById('jb-q');if(q&&!q.value.trim())window.jbSearch(null);},300);
      return r;};}
})();
