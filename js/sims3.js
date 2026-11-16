/* ============ RISE TIME : lab instruments for weeks 7 to 9 ============ */
(function(){
const RT = window.RT, H = RT.h;
const {simShell,knob,kv,eng,scopeGrid,glowLine,label,bindInputs,loop,rd,setT,css,$,$$,RM} = H;
const out = (id,t)=>setT(id+'-o',t);
const dim = 'rgba(200,230,220,.55)';

/* ------------------------------------------------------------ second-order response */
RT.registerSim('second',{name:'Second-order response',desc:'Drag damping and natural frequency, and watch overshoot, peak time and settling time move with the poles.',c:'var(--ch5)',from:'Week 7',icon:'M2,42 C10,40 14,2 24,6 C34,10 38,30 48,26 C58,22 62,16 72,19 S90,18 98,18'},host=>{
  const sh=simShell(host,'second',knob('so-z','Damping ζ',0.05,2,0.01,0.4)+knob('so-w','Natural frequency ωn (rad/s)',1,20,0.5,5)+rd([['Overshoot','so-os'],['Peak time','so-tp'],['Settling (2%)','so-ts'],['Poles','so-p'],['Type','so-ty']]));
  const get=()=>({z:kv($('#so-z')),w:kv($('#so-w'))});
  const y=(t,z,w)=>{
    if(Math.abs(z-1)<0.003) return 1-(1+w*t)*Math.exp(-w*t);
    if(z<1){ const wd=w*Math.sqrt(1-z*z); return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t)); }
    const r=Math.sqrt(z*z-1), s1=-w*(z-r), s2=-w*(z+r); return 1+(s2*Math.exp(s1*t)-s1*Math.exp(s2*t))/(s1-s2);
  };
  const calc=()=>{ const {z,w}=get(); const tmax=Math.max(1.5,Math.min(14,6/(Math.min(z,1)*w))); const N=500; let mx=0,tp=0,ts=0;
    for(let k=0;k<=N;k++){ const t=tmax*k/N, v=y(t,z,w); if(v>mx){mx=v;tp=t;} if(Math.abs(v-1)>0.02) ts=t; }
    return {z,w,tmax,os:Math.max(0,(mx-1)*100),tp:mx>1.0005?tp:0,ts}; };
  const upd=()=>{ const c=calc(); out('so-z',c.z.toFixed(2)); out('so-w',c.w.toFixed(1)+' rad/s');
    setT('so-os',c.os.toFixed(1)+' %'); setT('so-tp',c.tp?c.tp.toFixed(2)+' s':'none'); setT('so-ts',c.ts>=c.tmax*0.995?'> '+c.tmax.toFixed(1)+' s':c.ts.toFixed(2)+' s');
    const sg=c.z*c.w; setT('so-p',c.z<1?`−${sg.toFixed(2)} ± j${(c.w*Math.sqrt(1-c.z*c.z)).toFixed(2)}`:c.z<1.003&&c.z>0.997?`−${c.w.toFixed(2)} (double)`:`−${(c.w*(c.z-Math.sqrt(c.z*c.z-1))).toFixed(2)}, −${(c.w*(c.z+Math.sqrt(c.z*c.z-1))).toFixed(2)}`);
    setT('so-ty',c.z<0.997?'UNDERDAMPED':c.z<=1.003?'CRITICAL':'OVERDAMPED'); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const c=calc();
    const L=48,R=W-16,T=24,B=Hh-30, X=t=>L+(R-L)*t/c.tmax, Ymax=Math.max(1.5,1+c.os/100+0.1), Y=v=>B-(B-T)*v/Ymax;
    ctx.strokeStyle='rgba(200,230,220,.3)'; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(R,B); ctx.stroke();
    ctx.fillStyle='rgba(109,255,176,.08)'; ctx.fillRect(L,Y(1.02),R-L,Y(0.98)-Y(1.02));
    ctx.save(); ctx.setLineDash([5,5]); ctx.strokeStyle='rgba(255,191,71,.6)'; ctx.beginPath(); ctx.moveTo(L,Y(1)); ctx.lineTo(R,Y(1)); ctx.stroke(); ctx.restore();
    const pts=[]; for(let k=0;k<=300;k++){ const t=c.tmax*k/300; pts.push([X(t),Y(y(t,c.z,c.w))]); } glowLine(ctx,pts,css('--ch5'),2.6);
    label(ctx,'setpoint',R-4,Y(1)-6,css('--amber'),'right',10); label(ctx,'±2% band',L+6,Y(1.02)-5,'rgba(109,255,176,.7)','left',10);
    if(c.tp){ ctx.save(); ctx.fillStyle=css('--ch2'); ctx.beginPath(); ctx.arc(X(c.tp),Y(1+c.os/100),4.5,0,7); ctx.fill(); ctx.restore(); label(ctx,'peak',X(c.tp)+8,Y(1+c.os/100)-4,css('--ch2'),'left',10); }
    if(c.ts<c.tmax*0.995){ ctx.save(); ctx.strokeStyle=css('--ch1'); ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(X(c.ts),T); ctx.lineTo(X(c.ts),B); ctx.stroke(); ctx.restore(); label(ctx,'settled',X(c.ts)+6,B-8,css('--ch1'),'left',10); }
    label(ctx,'time (s)',(L+R)/2,B+22,dim,'center',10); label(ctx,'0',L,B+16,dim,'center',10); label(ctx,c.tmax.toFixed(1),R,B+16,dim,'right',10);
    // pole inset
    const ix=W-110, iy=T+4, iw=92, ih=92; ctx.strokeStyle='rgba(200,230,220,.25)'; ctx.strokeRect(ix,iy,iw,ih); ctx.beginPath(); ctx.moveTo(ix+iw*0.7,iy); ctx.lineTo(ix+iw*0.7,iy+ih); ctx.moveTo(ix,iy+ih/2); ctx.lineTo(ix+iw,iy+ih/2); ctx.stroke();
    const sc=Math.min(iw*0.62/Math.max(c.w*Math.max(1,c.z*1.0+0.0),1),(ih*0.44)/Math.max(c.w,1)); const px=ix+iw*0.7, py=iy+ih/2; const dot=(a,b)=>{ ctx.fillStyle=css('--ch5'); ctx.fillRect(px+a*sc-3,py-b*sc-3,6,6); };
    if(c.z<1){ const sg=c.z*c.w, wd=c.w*Math.sqrt(1-c.z*c.z); dot(-sg,wd); dot(-sg,-wd); } else { const r=Math.sqrt(Math.max(0,c.z*c.z-1)); dot(-c.w*(c.z-r),0); dot(-c.w*(c.z+r),0); }
    label(ctx,'poles',ix+4,iy+12,dim,'left',9);
  };
  sh.setDraw(draw); upd();
});

/* ------------------------------------------------------------ DC motor */
RT.registerSim('dcm',{name:'DC motor torque-speed',desc:'Set the supply, winding resistance and load. Read the speed, current and efficiency, or push it into a stall.',c:'var(--ch6)',from:'Week 8',icon:'M6,6 L92,42 M6,42 L92,42 M6,6 L6,42'},host=>{
  const sh=simShell(host,'dcm',knob('dm-v','Supply voltage',6,48,1,24)+knob('dm-r','Winding resistance R (Ω)',0.2,2,0.05,0.8)+knob('dm-k','Constant Kt = Ke',0.02,0.2,0.005,0.06)+knob('dm-t','Load torque (N·m)',0,4,0.05,0.3)+rd([['Speed','dm-n'],['Current','dm-i'],['Efficiency','dm-e'],['Shaft power','dm-p'],['Stall current','dm-s'],['Status','dm-st']]));
  const get=()=>({V:kv($('#dm-v')),R:kv($('#dm-r')),K:kv($('#dm-k')),TL:kv($('#dm-t'))});
  const calc=()=>{ const {V,R,K,TL}=get(); const Ts=K*V/R, w0=V/K, stall=TL>=Ts; const I=stall?V/R:TL/K, w=stall?0:(V-I*R)/K; const Pm=TL*w, Pe=V*I; return {V,R,K,TL,Ts,w0,stall,I,w,Pm,Pe,eff:Pe>0?Pm/Pe*100:0}; };
  const upd=()=>{ const c=calc(); out('dm-v',c.V+' V'); out('dm-r',c.R.toFixed(2)+' Ω'); out('dm-k',c.K.toFixed(3)); out('dm-t',c.TL.toFixed(2)+' N·m');
    setT('dm-n',c.stall?'0 rpm':(c.w*60/(2*Math.PI)).toFixed(0)+' rpm'); setT('dm-i',c.I.toFixed(1)+' A'); setT('dm-e',c.eff.toFixed(0)+' %'); setT('dm-p',eng(c.Pm,'W')); setT('dm-s',(c.V/c.R).toFixed(1)+' A'); setT('dm-st',c.stall?'STALLED':'RUNNING'); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const c=calc();
    const L=52,R=W-18,T=26,B=Hh-34, xm=c.w0*1.06, ym=Math.max(c.Ts,c.TL)*1.1, X=w=>L+(R-L)*w/xm, Y=t=>B-(B-T)*t/ym;
    ctx.strokeStyle='rgba(200,230,220,.3)'; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(R,B); ctx.stroke();
    const pp=[]; const pmax=c.Ts*c.w0/4; for(let k=0;k<=80;k++){ const w=c.w0*k/80, t=c.Ts*(1-w/c.w0); pp.push([X(w),B-(B-T)*0.9*(t*w/pmax)*0.45*(ym>0?c.Ts/ym:1)]); }
    glowLine(ctx,pp,css('--amber'),1.6,[4,4]);
    glowLine(ctx,[[X(0),Y(c.Ts)],[X(c.w0),Y(0)]],css('--ch6'),3);
    ctx.save(); ctx.setLineDash([5,5]); ctx.strokeStyle='rgba(63,224,255,.7)'; ctx.beginPath(); ctx.moveTo(L,Y(c.TL)); ctx.lineTo(R,Y(c.TL)); ctx.stroke(); ctx.restore(); label(ctx,'load',R-4,Y(c.TL)-6,css('--ch2'),'right',10);
    const ox=c.stall?0:c.w, oy=c.stall?Math.min(c.TL,c.Ts):c.TL; ctx.save(); ctx.fillStyle=c.stall?'#ff6b5e':css('--phos'); ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=12; ctx.beginPath(); ctx.arc(X(ox),Y(oy),6,0,7); ctx.fill(); ctx.restore();
    label(ctx,c.Ts.toFixed(2),L-6,Y(c.Ts)+4,css('--ch6'),'right',10); label(ctx,(c.w0*60/(2*Math.PI)).toFixed(0)+' rpm',R,B+18,css('--ch6'),'right',10);
    label(ctx,'speed',L,B+18,dim,'left',10); label(ctx,'torque (N·m)',L,T-8,dim,'left',10); label(ctx,'power (dashed)',L+8,T+8,css('--amber'),'left',10);
    if(c.stall) label(ctx,'load exceeds stall torque: the motor cannot turn',(L+R)/2,T+30,'#ff6b5e','center',11);
  };
  sh.setDraw(draw); upd();
});

/* ------------------------------------------------------------ hydraulic cylinder */
RT.registerSim('hydcyl',{name:'Hydraulic cylinder',desc:'Size a cylinder: bore, rod, pressure, pump flow and load. See force, speed, and what happens when the load wins.',c:'var(--ch7)',from:'Week 9',icon:'M6,14 L74,14 L74,32 L6,32 Z M74,23 L96,23 M40,14 L40,32'},host=>{
  const sh=simShell(host,'hydcyl',knob('hy-d','Bore (mm)',30,160,1,100)+knob('hy-r','Rod (mm)',10,120,1,56)+knob('hy-p','Relief pressure (bar)',20,250,5,160)+knob('hy-q','Pump flow (L/min)',5,120,1,60)+knob('hy-l','Load force (kN)',0,300,1,60)+rd([['Extend force','hy-fe'],['Extend speed','hy-ve'],['Retract speed','hy-vr'],['Pressure needed','hy-pn'],['Power to load','hy-pw'],['Status','hy-st']]));
  let pos=0, dir=1;
  const get=()=>{ const D=kv($('#hy-d'))/1000; let r=kv($('#hy-r'))/1000; r=Math.min(r,D*0.9); const P=kv($('#hy-p'))*1e5, Q=kv($('#hy-q'))/60000, F=kv($('#hy-l'))*1000; const A=Math.PI/4*D*D, Ar=A-Math.PI/4*r*r; return {D,r,P,Q,F,A,Ar}; };
  const calc=()=>{ const g=get(); const Fe=g.P*g.A, Fr=g.P*g.Ar; const stall=g.F>Fe; return Object.assign(g,{Fe,Fr,stall,ve:g.Q/g.A,vr:g.Q/g.Ar,pn:g.F/g.A,heat:stall?g.P*g.Q:0}); };
  const upd=()=>{ const c=calc(); out('hy-d',(c.D*1000).toFixed(0)+' mm'); out('hy-r',(c.r*1000).toFixed(0)+' mm'); out('hy-p',(c.P/1e5).toFixed(0)+' bar'); out('hy-q',(c.Q*60000).toFixed(0)+' L/min'); out('hy-l',(c.F/1000).toFixed(0)+' kN');
    setT('hy-fe',(c.Fe/1000).toFixed(1)+' kN'); setT('hy-ve',c.ve.toFixed(3)+' m/s'); setT('hy-vr',c.vr.toFixed(3)+' m/s'); setT('hy-pn',(c.pn/1e5).toFixed(0)+' bar'); setT('hy-pw',c.stall?'0 W':eng(c.F*c.ve,'W')); setT('hy-st',c.stall?'STALLED: '+(c.heat/1000).toFixed(1)+' kW as heat':'MOVING'); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const c=calc();
    const L=40,R=W-40,cy=Hh*0.42,bh=Math.min(70,Hh*0.22),len=R-L-80, px=L+len*(0.08+0.84*pos);
    ctx.strokeStyle='rgba(200,230,220,.6)'; ctx.lineWidth=2; ctx.strokeRect(L,cy-bh/2,len,bh);
    ctx.fillStyle='rgba(109,255,176,.14)'; ctx.fillRect(L+1,cy-bh/2+1,px-L-1,bh-2);
    ctx.fillStyle=css('--ch7'); ctx.fillRect(px-4,cy-bh/2+2,8,bh-4);
    const rh=Math.max(4,bh*(c.r/c.D)*0.9); ctx.fillStyle='rgba(220,235,230,.85)'; ctx.fillRect(px,cy-rh/2,R-px,rh);
    ctx.fillStyle=c.stall?'#ff6b5e':css('--amber'); ctx.fillRect(R-2,cy-bh*0.5,10,bh);
    label(ctx,'P = '+(c.stall?c.P/1e5:Math.min(c.P,c.pn)/1e5).toFixed(0)+' bar',L+8,cy+bh/2+16,css('--ch7'),'left',11);
    label(ctx,'load '+(c.F/1000).toFixed(0)+' kN',R,cy-bh/2-10,css('--amber'),'right',11);
    // relief valve
    const vx=L+len*0.5, vy=Hh*0.78; ctx.strokeStyle=c.stall?'#ff6b5e':'rgba(200,230,220,.5)'; ctx.lineWidth=2; ctx.strokeRect(vx-26,vy-16,52,32); ctx.beginPath(); ctx.moveTo(vx-14,vy+10); ctx.lineTo(vx+14,vy-10); ctx.stroke();
    label(ctx,'relief valve',vx,vy+32,c.stall?'#ff6b5e':dim,'center',10);
    if(c.stall){ glowLine(ctx,[[L+10,cy+bh/2],[L+10,vy],[vx-26,vy]],'#ff6b5e',2.2,[5,4]); label(ctx,'all the flow goes over relief: '+(c.heat/1000).toFixed(1)+' kW of heat',vx,vy-28,'#ff6b5e','center',11); }
    else label(ctx,'flow '+(c.Q*60000).toFixed(0)+' L/min → speed '+(dir>0?c.ve:c.vr).toFixed(3)+' m/s',vx,vy-24,css('--ch2'),'center',11);
    label(ctx,dir>0?'extending':'retracting',L,Hh-12,dim,'left',10);
  };
  sh.setDraw(draw); upd();
  if(RM){ draw(); return; }
  loop(dt=>{ const c=calc(); if(!c.stall){ const v=(dir>0?c.ve:c.vr)/0.5; pos+=dir*v*dt; if(pos>=1){pos=1;dir=-1;} if(pos<=0){pos=0;dir=1;} } draw(); });
});
})();
