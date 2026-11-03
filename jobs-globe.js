/* کره‌ی زنده‌ی صفحه مشاغل (بدون لوگو) - مستقل از script.js */
(function(){
  var st=document.getElementById('jb-stage'),sc=document.getElementById('screen-jobs');
  if(!st||!sc)return;
  var cv=document.createElement('canvas');cv.id='jb-globe';st.insertBefore(cv,st.firstChild);
  var ctx=cv.getContext('2d'),W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2);
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* نقاط کره (فیبوناچی) + ماسک خشکی تقریبی */
  var P=[],N=1500,ga=Math.PI*(3-Math.sqrt(5));
  for(var i=0;i<N;i++){
    var y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),t=i*ga,x=Math.cos(t)*r,z=Math.sin(t)*r;
    var lat=Math.asin(y),lon=Math.atan2(z,x);
    var n=Math.sin(lon*2+1.3)*Math.cos(lat*3)+Math.sin(lon*3.7-lat*2)*.7+Math.sin(lon*1.3+lat*5+2)*.5+Math.cos(lat*2.2)*.2;
    P.push({x:x,y:y,z:z,land:n>.15});
  }
  function size(){
    W=st.clientWidth;H=st.clientHeight;
    cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
  }
  var ang=0,tilt=.38,raf=0;
  function ring(cx,cy,rx,ry,rot,col,blur,a0,a1){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);
    ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.shadowColor=col;ctx.shadowBlur=blur;
    ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,a0||0,a1||Math.PI*2);ctx.stroke();ctx.restore();
  }
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    var cx=W/2,cy=H*.362,R=W*.235;
    /* هاله */
    var g=ctx.createRadialGradient(cx,cy,R*.6,cx,cy,R*2);
    g.addColorStop(0,'rgba(57,255,20,.22)');g.addColorStop(.5,'rgba(30,160,70,.10)');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    /* مدارها (همان ابعاد jbDims) */
    var rx=[W*.3,W*.39,W*.47];
    var cols=['rgba(243,195,60,.55)','rgba(57,255,20,.4)','rgba(243,195,60,.35)'];
    for(var k=0;k<3;k++)ring(cx,cy,rx[k],rx[k]*.3,(k-1)*-6*Math.PI/180,cols[k],10);
    /* نقطه‌ها */
    var ca=Math.cos(ang),sa=Math.sin(ang),ct=Math.cos(tilt),stt=Math.sin(tilt);
    for(var i=0;i<N;i++){
      var p=P[i];
      var x=p.x*ca+p.z*sa,z=-p.x*sa+p.z*ca,y=p.y;
      var y2=y*ct-z*stt,z2=y*stt+z*ct;
      var front=z2>0,d=(z2+1)/2;
      if(!front&&p.land===false)continue;
      var a=front?(p.land?.35+d*.65:.12+d*.18):(.08);
      ctx.fillStyle=p.land?(front?'rgba(120,255,90,'+a+')':'rgba(60,160,80,'+a+')'):'rgba(90,200,140,'+a+')';
      var s=front?(p.land?1.7:1.1)*(.6+d*.6):.9;
      ctx.fillRect(cx+x*R-s/2,cy-y2*R-s/2,s,s);
    }
    /* لبه */
    ctx.strokeStyle='rgba(57,255,20,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke();
    /* قوس‌های درخشان جلوی کره */
    ring(cx,cy,rx[0]*.78,rx[0]*.3,-.1,'rgba(243,230,120,.9)',14,Math.PI*1.05,Math.PI*1.75);
    ring(cx,cy,rx[1]*.62,rx[1]*.2,.12,'rgba(57,255,20,.9)',14,Math.PI*.1,Math.PI*.7);
  }
  function loop(){
    if(!sc.classList.contains('active')){raf=0;return}
    var v=(window._jb&&window._jb.v)||.005;
    if(!still)ang+=Math.min(v,.2)*.9;
    draw();raf=requestAnimationFrame(loop);
  }
  function kick(){size();if(!raf)raf=requestAnimationFrame(loop)}
  window.addEventListener('resize',kick);
  new MutationObserver(kick).observe(sc,{attributes:true,attributeFilter:['class']});
  kick();
})();
