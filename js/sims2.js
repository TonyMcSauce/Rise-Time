/* ============ RISE TIME : lab instruments for weeks 4 to 6 ============ */
(function(){
const RT = window.RT, H = RT.h;
const {simShell,knob,kv,eng,scopeGrid,glowLine,label,bindInputs,loop,rd,setT,css,$,$$,RM} = H;
const TAU = Math.PI*2;
const dim = 'rgba(200,230,220,.55)';
const out = (id,t)=>setT(id+'-o',t);
const tog = (title,opts)=>`<div class="knob"><label>${title}</label><div class="tog">${opts.map((o,i)=>`<button data-v="${o[0]}" class="${i?'':'on'}">${o[1]}</button>`).join('')}</div></div>`;
function bindTog(host,cb){ const g=$('.tog',host); let cur=$('button.on',g).dataset.v; $$('button',g).forEach(b=>b.onclick=()=>{ cur=b.dataset.v; $$('button',g).forEach(x=>x.classList.toggle('on',x===b)); cb(cur); }); return ()=>cur; }
const axisBox=(ctx,x0,y0,x1,y1)=>{ ctx.strokeStyle='rgba(200,230,220,.3)'; ctx.lineWidth=1; ctx.strokeRect(x0+.5,y0+.5,x1-x0,y1-y0); };

/* ------------------------------------------------------------ AC power */
RT.registerSim('acpower',{name:'AC power triangle',desc:'Change the phase angle and watch real, reactive and apparent power trade places.',c:'var(--ch1)',from:'Week 4',icon:'M2,40 L98,40 L98,8 Z'},host=>{
  const sh=simShell(host,'acpower',knob('ap-v','Voltage (V rms)',100,400,1,230)+knob('ap-i','Current (A rms)',1,30,0.5,12)+knob('ap-p','Phase φ (deg)',-80,80,1,41)+rd([['S (VA)','ap-s'],['P (W)','ap-pp'],['Q (var)','ap-q'],['Power factor','ap-pf']])+`<p class="hint">Positive φ means the current lags the voltage (inductive). The shaded part of p(t) below zero is energy flowing back to the source.</p>`);
  let ph=0;
  const get=()=>({V:kv($('#ap-v')),I:kv($('#ap-i')),p:kv($('#ap-p'))*Math.PI/180});
  const upd=()=>{ const {V,I,p}=get(); const S=V*I,P=S*Math.cos(p),Q=S*Math.sin(p);
    out('ap-v',V.toFixed(0)+' V'); out('ap-i',I.toFixed(1)+' A'); out('ap-p',(p*180/Math.PI).toFixed(0)+'°');
    setT('ap-s',eng(S,'VA')); setT('ap-pp',eng(P,'W')); setT('ap-q',eng(Q,'var')); setT('ap-pf',Math.cos(p).toFixed(3)+(p>0?' lag':p<0?' lead':'')); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{
    const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const {V,I,p}=get(); const Vp=V*1.4142,Ip=I*1.4142;
    const L=14,R=W-14,T=22,B=Hh*0.62, cy=(T+B)/2, hh=(B-T)/2-6;
    const x=t=>L+(R-L)*t; // t in 0..2 cycles /2
    const v=t=>Math.sin(TAU*t*2-ph), i=t=>Math.sin(TAU*t*2-ph-p);
    // power fill
    const pw=t=>v(t)*i(t); const pmax=Math.max(0.0001,1);
    ctx.save(); for(let k=0;k<=240;k++){ const t=k/240, val=pw(t); const xx=x(t), y0=cy, y1=cy-val*hh*0.9; ctx.fillStyle=val>=0?'rgba(109,255,176,.16)':'rgba(255,191,71,.22)'; ctx.fillRect(xx,Math.min(y0,y1),(R-L)/240+1,Math.abs(y1-y0)); } ctx.restore();
    ctx.strokeStyle='rgba(200,230,220,.25)'; ctx.beginPath(); ctx.moveTo(L,cy); ctx.lineTo(R,cy); ctx.stroke();
    const mk=f=>{ const a=[]; for(let k=0;k<=240;k++){ const t=k/240; a.push([x(t),cy-f(t)*hh]); } return a; };
    glowLine(ctx,mk(v),css('--ch1'),2.2); glowLine(ctx,mk(i),css('--ch2'),2.2); glowLine(ctx,mk(t=>pw(t)*0.9),css('--amber'),1.6,[4,4]);
    label(ctx,'v',L+4,T+4,css('--ch1')); label(ctx,'i',L+22,T+4,css('--ch2')); label(ctx,'p = v·i',L+42,T+4,css('--amber'));
    // triangle
    const S=V*I,P=S*Math.cos(p),Q=S*Math.sin(p); const bx=44, by=Hh-26, sc=Math.min((W*0.34)/Math.max(S,1),(Hh*0.28)/Math.max(S,1)*1.0);
    const px=bx+P*sc, py=by-Q*sc;
    ctx.save(); ctx.fillStyle='rgba(255,191,71,.08)'; ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(px,by); ctx.lineTo(px,py); ctx.closePath(); ctx.fill(); ctx.restore();
    glowLine(ctx,[[bx,by],[px,by]],css('--ch1'),3); glowLine(ctx,[[px,by],[px,py]],css('--ch2'),3); glowLine(ctx,[[bx,by],[px,py]],css('--amber'),3);
    label(ctx,'P',(bx+px)/2,by+16,css('--ch1'),'center'); label(ctx,'Q',px+8,(by+py)/2+4,css('--ch2')); label(ctx,'S',(bx+px)/2-8,(by+py)/2-8,css('--amber'),'right');
    label(ctx,'φ = '+(p*180/Math.PI).toFixed(0)+'°',bx+30,by-6,css('--amber'));
    // cursor
    const cx=x((ph/TAU/2)%1); ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(cx,T); ctx.lineTo(cx,B); ctx.stroke();
  };
  sh.setDraw(draw); upd();
  if(!RM) loop(dt=>{ ph=(ph+dt*1.2)%(TAU*2); draw(); });
});

/* ------------------------------------------------------------ Op amp */
RT.registerSim('opamp',{name:'Op amp transfer',desc:'Pick the circuit and gain, then sweep the input into saturation.',c:'var(--ch3)',from:'Weeks 4',icon:'M2,40 L30,40 L70,6 L98,6'},host=>{
  const sh=simShell(host,'opamp',tog('Circuit',[['inv','Inverting'],['non','Non-inverting']])+knob('oa-f','Rf',1000,1000000,1,47000,true)+knob('oa-g','Rin / Rg',1000,1000000,1,10000,true)+knob('oa-v','Input (V)',-5,5,0.05,0.5)+knob('oa-s','Supply ±(V)',5,15,1,12)+rd([['Gain','oa-gain'],['Vout','oa-out'],['State','oa-st'],['V− node','oa-vm']]));
  const mode=bindTog(host,()=>upd());
  const calc=()=>{ const Rf=kv($('#oa-f')),Rg=kv($('#oa-g')),Vin=kv($('#oa-v')),Vs=kv($('#oa-s')),m=mode();
    const G=m==='inv'?-Rf/Rg:1+Rf/Rg; const raw=G*Vin; const Vo=Math.max(-Vs,Math.min(Vs,raw)); return {Rf,Rg,Vin,Vs,G,raw,Vo,sat:Math.abs(raw)>Vs}; };
  const upd=()=>{ const c=calc(); out('oa-f',eng(c.Rf,'Ω')); out('oa-g',eng(c.Rg,'Ω')); out('oa-v',c.Vin.toFixed(2)+' V'); out('oa-s',c.Vs+' V');
    setT('oa-gain',c.G.toFixed(2)); setT('oa-out',c.Vo.toFixed(2)+' V'); setT('oa-st',c.sat?'SATURATED':'LINEAR'); setT('oa-vm',mode()==='inv'?'0 V (virtual)':c.Vin.toFixed(2)+' V'); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const c=calc();
    const pl=44,pr=20,pt=20,pb=34, X=v=>pl+(W-pl-pr)*(v+5)/10, Y=v=>(pt+(Hh-pt-pb)*(1-(v+15)/30));
    ctx.strokeStyle='rgba(200,230,220,.3)'; ctx.beginPath(); ctx.moveTo(X(-5),Y(0)); ctx.lineTo(X(5),Y(0)); ctx.moveTo(X(0),Y(-15)); ctx.lineTo(X(0),Y(15)); ctx.stroke();
    ctx.setLineDash([5,5]); ctx.strokeStyle='rgba(255,191,71,.55)'; [c.Vs,-c.Vs].forEach(r=>{ ctx.beginPath(); ctx.moveTo(pl,Y(r)); ctx.lineTo(W-pr,Y(r)); ctx.stroke(); }); ctx.setLineDash([]);
    label(ctx,'+Vs rail',W-pr-4,Y(c.Vs)-6,css('--amber'),'right',10); label(ctx,'−Vs rail',W-pr-4,Y(-c.Vs)+14,css('--amber'),'right',10);
    const pts=[]; for(let k=0;k<=200;k++){ const vi=-5+10*k/200; pts.push([X(vi),Y(Math.max(-c.Vs,Math.min(c.Vs,c.G*vi)))]); }
    glowLine(ctx,pts,css('--ch3'),2.6);
    ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(X(c.Vin),Y(0)); ctx.lineTo(X(c.Vin),Y(c.Vo)); ctx.lineTo(X(0),Y(c.Vo)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=c.sat?css('--amber'):css('--phos'); ctx.beginPath(); ctx.arc(X(c.Vin),Y(c.Vo),6,0,7); ctx.fill();
    label(ctx,'Vin →',W-pr,Y(0)+16,dim,'right',10); label(ctx,'Vout',X(0)+6,pt+8,dim,'left',10);
    [-5,0,5].forEach(v=>label(ctx,v+'',X(v),Hh-12,dim,'center',9)); [-10,10].forEach(v=>label(ctx,v+'',pl-6,Y(v)+4,dim,'right',9));
  };
  sh.setDraw(draw); upd();
});

/* ------------------------------------------------------------ Frequency response */
RT.registerSim('freq',{name:'Filters and resonance',desc:'Sweep a low-pass filter or a series RLC and read the corner, Q and bandwidth.',c:'var(--ch4)',from:'Weeks 4 and 6',icon:'M2,10 L40,10 C60,10 62,40 98,42'},host=>{
  const sh=simShell(host,'freq',tog('Circuit',[['lp','RC low-pass'],['rlc','Series RLC']])+knob('fr-r','R',1,100000,1,10,true)+knob('fr-l','L',0.0001,1,1,0.01,true)+knob('fr-c','C',1e-9,1e-3,1,10e-6,true)+knob('fr-f','Test frequency',1,100000,1,200,true)+rd([['f₀ or fc','fr-f0'],['Gain / |I|','fr-g'],['Q','fr-q'],['Bandwidth','fr-bw']]));
  const mode=bindTog(host,()=>{ $('#fr-l').parentElement.style.opacity=mode()==='rlc'?1:.4; upd(); });
  const calc=()=>{ const R=kv($('#fr-r')),L=kv($('#fr-l')),C=kv($('#fr-c')),f=kv($('#fr-f')),m=mode();
    if(m==='lp'){ const fc=1/(TAU*R*C); return {m,R,L,C,f,f0:fc,mag:ff=>1/Math.sqrt(1+(ff/fc)**2),Q:null,bw:null}; }
    const f0=1/(TAU*Math.sqrt(L*C)), Q=Math.sqrt(L/C)/R; const w=ff=>TAU*ff; const Z=ff=>Math.hypot(R,w(ff)*L-1/(w(ff)*C));
    return {m,R,L,C,f,f0,mag:ff=>R/Z(ff),Q,bw:f0/Q}; };
  const upd=()=>{ const c=calc(); out('fr-r',eng(c.R,'Ω')); out('fr-l',eng(c.L,'H')); out('fr-c',eng(c.C,'F')); out('fr-f',eng(c.f,'Hz'));
    setT('fr-f0',eng(c.f0,'Hz')); const g=c.mag(c.f); setT('fr-g',c.m==='lp'?(20*Math.log10(g)).toFixed(1)+' dB':(g*100).toFixed(1)+'% of max'); setT('fr-q',c.Q?c.Q.toFixed(2):'n/a'); setT('fr-bw',c.bw?eng(c.bw,'Hz'):'n/a'); sh.draw(); };
  bindInputs(host,upd); $('#fr-l').parentElement.style.opacity=.4;
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const c=calc();
    const pl=50,pr=16,pt=20,pb=30; const lo=Math.log10(1),hi=Math.log10(100000); const X=f=>pl+(W-pl-pr)*(Math.log10(f)-lo)/(hi-lo);
    const isLP=c.m==='lp'; const Y=isLP?(g=>pt+(Hh-pt-pb)*Math.min(1,Math.max(0,-20*Math.log10(Math.max(g,1e-4))/60))):(g=>pt+(Hh-pt-pb)*(1-Math.min(1,g)));
    for(let d=0;d<=5;d++){ label(ctx,eng(Math.pow(10,d),'Hz',2),X(Math.pow(10,d)),Hh-10,dim,'center',9); }
    if(isLP){ [0,-20,-40,-60].forEach(db=>{ label(ctx,db+' dB',pl-6,Y(Math.pow(10,db/20))+4,dim,'right',9); }); }
    else [0,0.5,1].forEach(g=>label(ctx,(g*100)+'%',pl-6,Y(g)+4,dim,'right',9));
    const pts=[]; for(let k=0;k<=300;k++){ const f=Math.pow(10,lo+(hi-lo)*k/300); pts.push([X(f),Y(c.mag(f))]); }
    glowLine(ctx,pts,css('--ch4'),2.6);
    ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(255,191,71,.6)'; ctx.beginPath(); ctx.moveTo(X(c.f0),pt); ctx.lineTo(X(c.f0),Hh-pb); ctx.stroke(); ctx.setLineDash([]);
    label(ctx,isLP?'fc':'f₀',X(c.f0)+4,pt+10,css('--amber'),'left',10);
    if(!isLP && c.bw){ const a=Math.max(1,c.f0-c.bw/2), b=c.f0+c.bw/2; ctx.fillStyle='rgba(255,191,71,.1)'; ctx.fillRect(X(a),Y(1/Math.SQRT2),X(b)-X(a),Hh-pb-Y(1/Math.SQRT2)); label(ctx,'−3 dB band',X(c.f0),Y(0.707)-6,css('--amber'),'center',9); }
    const g=c.mag(c.f), px=X(c.f), py=Y(g); ctx.fillStyle=css('--phos'); ctx.beginPath(); ctx.arc(px,py,6,0,7); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.setLineDash([2,4]); ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px,Hh-pb); ctx.stroke(); ctx.setLineDash([]);
  };
  sh.setDraw(draw); upd();
});

/* ------------------------------------------------------------ Rectifier */
RT.registerSim('rectifier',{name:'Rectifier and ripple',desc:'Choose half-wave or bridge, size the capacitor and see the ripple appear.',c:'var(--ch5)',from:'Week 5',icon:'M2,40 L10,12 L22,40 L34,12 L46,40 L58,12 L70,40 L82,12 L98,40'},host=>{
  const sh=simShell(host,'rectifier',tog('Rectifier',[['br','Bridge'],['hw','Half-wave']])+knob('rc2-v','Supply (V rms)',6,30,0.5,18)+knob('rc2-c','Capacitor',100e-6,0.05,1,2200e-6,true)+knob('rc2-i','Load current',0.1,5,0.1,1)+rd([['Peak out','rc2-pk'],['Ripple','rc2-rp'],['Minimum','rc2-mn'],['Formula ΔV','rc2-fm']]));
  const mode=bindTog(host,()=>upd());
  const sim=()=>{ const Vr=kv($('#rc2-v')),C=kv($('#rc2-c')),I=kv($('#rc2-i')),m=mode(); const drop=m==='br'?1.4:0.7, f=50, N=4000, T=3/f, dt=T/N;
    const arr=[],vin=[]; let vc=0; let mn=1e9,mx=0;
    for(let k=0;k<N;k++){ const t=k*dt; const vi=Vr*1.4142*Math.sin(TAU*f*t); const vr=m==='br'?Math.abs(vi):Math.max(0,vi); const vt=Math.max(0,vr-drop); vc=Math.max(vt, vc-I*dt/C); arr.push(vc); vin.push(vr); if(t>2/f){ mn=Math.min(mn,vc); mx=Math.max(mx,vc); } }
    return {Vr,C,I,m,arr,vin,mn,mx,N,T,drop,fr:m==='br'?100:50}; };
  let d=null;
  const upd=()=>{ d=sim(); out('rc2-v',kv($('#rc2-v')).toFixed(1)+' V'); out('rc2-c',eng(d.C,'F')); out('rc2-i',d.I.toFixed(1)+' A');
    setT('rc2-pk',d.mx.toFixed(2)+' V'); setT('rc2-rp',(d.mx-d.mn).toFixed(2)+' V'); setT('rc2-mn',d.mn.toFixed(2)+' V'); setT('rc2-fm',(d.I/(d.fr*d.C)).toFixed(2)+' V'); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ if(!d) return; const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const pl=40,pr=14,pt=18,pb=26; const vmax=Math.max(10,Math.ceil(d.Vr*1.5/5)*5);
    const X=k=>pl+(W-pl-pr)*k/d.N, Y=v=>pt+(Hh-pt-pb)*(1-v/vmax);
    for(let v=0;v<=vmax;v+=vmax/4) label(ctx,v.toFixed(0)+' V',pl-6,Y(v)+4,dim,'right',9);
    glowLine(ctx,d.vin.filter((_,k)=>k%8===0).map((v,k)=>[X(k*8),Y(v)]),'rgba(120,230,255,.45)',1.4,[4,4]);
    glowLine(ctx,d.arr.filter((_,k)=>k%6===0).map((v,k)=>[X(k*6),Y(v)]),css('--ch5'),2.8);
    const x2=X(d.N*2/3); ctx.fillStyle='rgba(255,191,71,.12)'; ctx.fillRect(x2,Y(d.mx),W-pr-x2,Y(d.mn)-Y(d.mx)); label(ctx,'ripple',W-pr-4,Y(d.mx)-6,css('--amber'),'right',10);
    label(ctx,'dashed: rectified input   solid: smoothed output',pl+4,Hh-8,dim,'left',9); };
  sh.setDraw(draw); upd();
});

/* ------------------------------------------------------------ PWM */
RT.registerSim('pwm',{name:'PWM and motor current',desc:'Set duty cycle, frequency and inductance. See average voltage, speed and ripple.',c:'var(--ch6)',from:'Week 5',icon:'M2,40 L2,10 L30,10 L30,40 L50,40 L50,10 L78,10 L78,40 L98,40'},host=>{
  const sh=simShell(host,'pwm',knob('pw-v','Supply (V)',12,60,1,48)+knob('pw-d','Duty cycle',0.05,0.95,0.01,0.35)+knob('pw-f','Frequency',1000,40000,1,20000,true)+knob('pw-l','Motor L',0.0002,0.01,1,0.001,true)+knob('pw-k','Ke (V·s/rad)',0.02,0.2,0.005,0.05)+rd([['V average','pw-va'],['Speed','pw-rpm'],['Ripple ΔI','pw-di'],['Formula ΔI','pw-fm']]));
  const sim=()=>{ const Vs=kv($('#pw-v')),D=kv($('#pw-d')),f=kv($('#pw-f')),L=kv($('#pw-l')),Ke=kv($('#pw-k')); const R=0.5,Va=D*Vs,Iavg=4; const E=Va-Iavg*R; const N=1200,T=1/f,dt=T*3/N; let i=Iavg-Vs*D*(1-D)/(f*L)/2; const arr=[],g=[]; let mn=1e9,mx=-1e9;
    for(let s=0;s<N*3;s++){ const t=(s%N)*dt, ph=(t%T)/T; const on=ph<D; const v=on?Vs:0; i+=(v-E-i*R)/L*dt; if(s>=N){ arr.push(i); g.push(on?1:0); mn=Math.min(mn,i); mx=Math.max(mx,i);} }
    return {Vs,D,f,L,Ke,Va,arr,g,mn,mx,N:arr.length,rpm:Va/Ke*60/TAU}; };
  let d=null;
  const upd=()=>{ d=sim(); out('pw-v',d.Vs+' V'); out('pw-d',(d.D*100).toFixed(0)+'%'); out('pw-f',eng(d.f,'Hz')); out('pw-l',eng(d.L,'H')); out('pw-k',d.Ke.toFixed(3));
    setT('pw-va',d.Va.toFixed(1)+' V'); setT('pw-rpm',Math.round(d.rpm)+' rpm'); setT('pw-di',(d.mx-d.mn).toFixed(2)+' A'); setT('pw-fm',(d.Vs*d.D*(1-d.D)/(d.f*d.L)).toFixed(2)+' A'); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ if(!d) return; const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const pl=44,pr=14; const X=k=>pl+(W-pl-pr)*k/d.N;
    const gy0=Hh*0.08,gy1=Hh*0.36; const gp=d.g.map((v,k)=>[X(k),v?gy0+4:gy1]);
    glowLine(ctx,gp,css('--ch6'),2.2); label(ctx,'gate',6,gy0+14,css('--ch6'),'left',10);
    const iy0=Hh*0.5,iy1=Hh*0.92; const lo=d.mn-(d.mx-d.mn)*0.4-0.001, hi=d.mx+(d.mx-d.mn)*0.4+0.001; const Y=v=>iy1-(iy1-iy0)*(v-lo)/(hi-lo);
    ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(255,191,71,.5)'; ctx.beginPath(); ctx.moveTo(pl,Y((d.mx+d.mn)/2)); ctx.lineTo(W-pr,Y((d.mx+d.mn)/2)); ctx.stroke(); ctx.setLineDash([]);
    glowLine(ctx,d.arr.map((v,k)=>[X(k),Y(v)]),css('--phos'),2.4);
    label(ctx,'motor current',6,iy0-2,css('--phos'),'left',10); label(ctx,(d.mx).toFixed(2)+' A',W-pr,Y(d.mx)-6,dim,'right',9); label(ctx,(d.mn).toFixed(2)+' A',W-pr,Y(d.mn)+14,dim,'right',9);
  };
  sh.setDraw(draw); upd();
});

/* ------------------------------------------------------------ Three-phase */
RT.registerSim('threephase',{name:'Three-phase explorer',desc:'See the three phases, the line voltage, and the constant total power.',c:'var(--ch7)',from:'Week 5',icon:'M2,23 C20,0 30,0 50,23 S80,46 98,23'},host=>{
  const sh=simShell(host,'threephase',tog('Show',[['p','Phase voltages'],['l','Line voltage L1-L2']])+knob('tp-v','Phase voltage (V rms)',100,400,1,230)+knob('tp-i','Line current (A)',1,60,0.5,10)+knob('tp-p','Power factor',0.3,1,0.01,0.8)+rd([['Line voltage','tp-vl'],['Real power','tp-pw'],['Apparent','tp-s'],['Total p(t)','tp-c']]));
  let th=0; const show=bindTog(host,()=>sh.draw());
  const get=()=>({V:kv($('#tp-v')),I:kv($('#tp-i')),pf:kv($('#tp-p'))});
  const upd=()=>{ const {V,I,pf}=get(); const VL=V*Math.sqrt(3); out('tp-v',V+' V'); out('tp-i',I.toFixed(1)+' A'); out('tp-p',pf.toFixed(2));
    setT('tp-vl',VL.toFixed(0)+' V'); setT('tp-pw',eng(Math.sqrt(3)*VL*I*pf,'W')); setT('tp-s',eng(Math.sqrt(3)*VL*I,'VA')); setT('tp-c','constant'); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const {V}=get(); const cols=[css('--ch1'),css('--ch2'),css('--ch5')];
    const pad=14, wx0=Math.min(W*0.34,230)+30, cy=Hh/2, amp=Hh*0.34; const A=k=>k*TAU/3;
    const mk=f=>{ const a=[]; for(let k=0;k<=240;k++){ const x=wx0+(W-wx0-pad)*k/240, t=k/240*TAU*1.5; a.push([x,cy-f(t)*amp]); } return a; };
    ctx.strokeStyle='rgba(200,230,220,.25)'; ctx.beginPath(); ctx.moveTo(wx0,cy); ctx.lineTo(W-pad,cy); ctx.stroke();
    if(show()==='p'){ [0,1,2].forEach(k=>glowLine(ctx,mk(t=>Math.sin(t-th-A(k))),cols[k],2.2)); [0,1,2].forEach(k=>label(ctx,'L'+(k+1),W-pad-4,Hh-10-k*0,cols[k],'right')); label(ctx,'L1  L2  L3',W-pad,Hh-10,dim,'right',10); }
    else { glowLine(ctx,mk(t=>Math.sin(t-th)*0.577),'rgba(109,255,176,.4)',1.4,[4,4]); glowLine(ctx,mk(t=>Math.sin(t-th-A(1))*0.577),'rgba(63,224,255,.4)',1.4,[4,4]); glowLine(ctx,mk(t=>Math.sin(t-th+Math.PI/6)),css('--amber'),3); label(ctx,'VL = √3 · VP, 30° ahead of L1',W-pad,Hh-10,css('--amber'),'right',10); }
    // phasor
    const cx=pad+Math.min(W*0.34,230)/2, R=Math.min(Math.min(W*0.34,230)/2-8,Hh*0.36);
    ctx.strokeStyle='rgba(120,255,190,.25)'; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke();
    const tip=k=>[cx+R*Math.cos(th+A(k)*-1+Math.PI*0),cy-R*Math.sin(th+A(k)*-1+Math.PI*0)];
    [0,1,2].forEach(k=>{ const a=th-A(k); glowLine(ctx,[[cx,cy],[cx+R*Math.cos(a),cy-R*Math.sin(a)]],cols[k],2.6); label(ctx,'L'+(k+1),cx+(R+12)*Math.cos(a),cy-(R+12)*Math.sin(a)+4,cols[k],'center',10); });
    if(show()==='l'){ const a1=th,a2=th-A(1); glowLine(ctx,[[cx+R*Math.cos(a2),cy-R*Math.sin(a2)],[cx+R*Math.cos(a1),cy-R*Math.sin(a1)]],css('--amber'),3); }
    label(ctx,'phasors, 120° apart',cx,Hh-10,dim,'center',9); void V; void tip;
  };
  sh.setDraw(draw); upd();
  if(!RM) loop(dt=>{ th=(th+dt*1.6)%(TAU); draw(); });
});

/* ------------------------------------------------------------ Encoder */
RT.registerSim('encoder',{name:'Quadrature encoder',desc:'Spin the shaft, change the PPR, and watch A, B and the count.',c:'var(--ch8)',from:'Week 6',icon:'M2,40 L2,10 L20,10 L20,40 L40,40 L40,10 L60,10 L60,40 L80,40 L80,10 L98,10'},host=>{
  const sh=simShell(host,'encoder',knob('en-p','Encoder PPR',20,5000,1,100,true)+knob('en-r','Speed (rpm)',-120,120,1,30)+knob('en-g','Gear ratio',1,50,1,1)+`<div class="knob"><label>Count</label><div class="tog"><button data-z="1" class="on">Reset to zero</button></div></div>`+rd([['Counts/rev','en-cr'],['Counts','en-ct'],['Direction','en-dir'],['Shaft angle','en-an']]));
  let ang=0, counts=0;
  $$('.tog button',host).forEach(b=>b.onclick=()=>{ counts=0; ang=0; });
  const get=()=>({P:Math.round(kv($('#en-p'))),rpm:kv($('#en-r')),G:kv($('#en-g'))});
  const upd=()=>{ const {P,rpm,G}=get(); out('en-p',P+' PPR'); out('en-r',rpm+' rpm'); out('en-g',G+':1'); setT('en-cr',String(P*4)); sh.draw(); };
  bindInputs(host,upd);
  const A=a=>{ const P=get().P; return (Math.floor(a/TAU*P*2)%2+2)%2===0?0:1; };
  const B=a=>{ const P=get().P; return (Math.floor((a/TAU*P*2)-0.5)%2+2)%2===0?0:1; };
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const {P,rpm,G}=get(); const cx=Math.min(W*0.26,150)+10, cy=Hh/2, R=Math.min(cx-12,Hh*0.4);
    ctx.strokeStyle='rgba(200,230,220,.4)'; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(cx,cy,R*0.55,0,7); ctx.stroke();
    const slots=Math.min(P,72); ctx.save(); ctx.translate(cx,cy); ctx.rotate(ang);
    for(let k=0;k<slots;k++){ const a=TAU*k/slots, w=TAU/slots/2; ctx.fillStyle='rgba(109,255,176,.5)'; ctx.beginPath(); ctx.arc(0,0,R,a,a+w); ctx.arc(0,0,R*0.62,a+w,a,true); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle=css('--amber'); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(R,0); ctx.stroke(); ctx.restore();
    ctx.fillStyle=css('--ch2'); ctx.fillRect(cx+R+4,cy-14,6,10); ctx.fillStyle=css('--ch1'); ctx.fillRect(cx+R+4,cy+4,6,10);
    label(ctx,'A',cx+R+14,cy-5,css('--ch2'),'left',10); label(ctx,'B',cx+R+14,cy+13,css('--ch1'),'left',10);
    // traces (window ahead of the current angle, speed independent): show history
    const x0=cx+R+50, wv=W-x0-12; const hist=sh.hist||[]; const row=(key,y,col)=>{ const pts=[]; hist.forEach((h,k)=>{ const x=x0+wv*k/Math.max(1,hist.length-1); pts.push([x,y-h[key]*28]); }); const sq=[]; pts.forEach((p,k)=>{ if(k&&pts[k-1][1]!==p[1]) sq.push([p[0],pts[k-1][1]]); sq.push(p); }); if(sq.length) glowLine(ctx,sq,col,2.2); };
    row(0,cy-18,css('--ch2')); row(1,cy+52,css('--ch1')); label(ctx,'A',x0-8,cy-24,css('--ch2'),'right',10); label(ctx,'B',x0-8,cy+46,css('--ch1'),'right',10);
    label(ctx,rpm===0?'stopped':rpm>0?'forward: A leads B':'reverse: B leads A',x0,Hh-12,css('--amber'),'left',10);
    setT('en-ct',String(Math.round(counts))); setT('en-dir',rpm===0?'still':rpm>0?'FORWARD':'REVERSE'); setT('en-an',(((ang*180/Math.PI)%360+360)%360).toFixed(0)+'°');
  };
  sh.hist=[]; sh.setDraw(draw); upd();
  if(RM){ draw(); return; }
  let acc=0;
  loop(dt=>{ const {P,rpm}=get(); const da=rpm/60*TAU*dt*0.6; ang+=da; counts+=da/TAU*P*4; acc+=dt; if(acc>0.016){ acc=0; sh.hist.push([A(ang),B(ang)]); if(sh.hist.length>240) sh.hist.shift(); } draw(); });
});

/* ------------------------------------------------------------ ADC */
RT.registerSim('adc',{name:'ADC and aliasing',desc:'Change bits and sample rate. Sample too slowly and a fast signal turns into a slow one.',c:'var(--ch9)',from:'Week 6',icon:'M2,40 L14,40 L14,30 L26,30 L26,18 L38,18 L38,10 L50,10 L50,22 L62,22 L62,34 L74,34 L74,40 L98,40'},host=>{
  const sh=simShell(host,'adc',knob('ad-b','Bits',2,12,1,4)+knob('ad-f','Signal (Hz)',1,200,1,10)+knob('ad-s','Sample rate (Hz)',4,500,1,60,true)+rd([['LSB','ad-lsb'],['Levels','ad-lv'],['Nyquist','ad-ny'],['Seen as','ad-al']]));
  const get=()=>({b:Math.round(kv($('#ad-b'))),f:kv($('#ad-f')),fs:Math.round(kv($('#ad-s')))});
  const upd=()=>{ const {b,f,fs}=get(); const lsb=10/Math.pow(2,b); out('ad-b',b+' bit'); out('ad-f',f+' Hz'); out('ad-s',fs+' Hz');
    setT('ad-lsb',lsb>=0.1?lsb.toFixed(3)+' V':(lsb*1000).toFixed(2)+' mV'); setT('ad-lv',String(Math.pow(2,b))); setT('ad-ny',(fs/2)+' Hz');
    const alias=Math.abs(f-Math.round(f/fs)*fs); setT('ad-al',f<fs/2?f+' Hz (true)':alias.toFixed(1)+' Hz (ALIAS)'); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const {b,f,fs}=get(); const pl=36,pr=14,pt=16,pb=26; const T=0.5; const X=t=>pl+(W-pl-pr)*t/T, Y=v=>pt+(Hh-pt-pb)*(1-(v+1)/2);
    const lv=Math.pow(2,b); const q=v=>{ const k=Math.min(lv-1,Math.max(0,Math.floor((v+1)/2*lv))); return -1+2*(k+0.5)/lv; };
    if(lv<=32) for(let k=1;k<lv;k++){ const y=Y(-1+2*k/lv); ctx.strokeStyle='rgba(120,255,190,.1)'; ctx.beginPath(); ctx.moveTo(pl,y); ctx.lineTo(W-pr,y); ctx.stroke(); }
    const sig=t=>Math.sin(TAU*f*t); const an=[]; for(let k=0;k<=600;k++){ const t=T*k/600; an.push([X(t),Y(sig(t))]); }
    glowLine(ctx,an,'rgba(120,230,255,.7)',1.6);
    const pts=[]; for(let n=0;n*(1/fs)<=T;n++){ const t=n/fs; pts.push([X(t),Y(q(sig(t)))]); }
    glowLine(ctx,pts,css('--amber'),1.8,[5,3]);
    pts.forEach(p=>{ ctx.fillStyle=css('--phos'); ctx.beginPath(); ctx.arc(p[0],p[1],3.4,0,7); ctx.fill(); });
    label(ctx,'blue: real signal   dots: samples   amber: what the computer sees',pl+4,Hh-8,dim,'left',9);
    if(f>=fs/2) label(ctx,'BELOW 2× SIGNAL: ALIASING',W-pr,pt+12,css('--amber'),'right',11);
    ['+1','0','−1'].forEach((t,k)=>label(ctx,t,pl-6,Y(1-k)+4,dim,'right',9));
  };
  sh.setDraw(draw); upd();
});

/* ------------------------------------------------------------ Temperature */
const KTAB=[[0,0],[100,4.096],[200,8.138],[300,12.209],[400,16.397],[500,20.644],[600,24.905],[700,29.129],[800,33.275],[900,37.326],[1000,41.276]];
const kmv=T=>{ for(let k=1;k<KTAB.length;k++){ if(T<=KTAB[k][0]){ const [t0,v0]=KTAB[k-1],[t1,v1]=KTAB[k]; return v0+(v1-v0)*(T-t0)/(t1-t0); } } return 41.276; };
const kT=mv=>{ for(let k=1;k<KTAB.length;k++){ if(mv<=KTAB[k][1]){ const [t0,v0]=KTAB[k-1],[t1,v1]=KTAB[k]; return t0+(t1-t0)*(mv-v0)/(v1-v0); } } return 1000; };
const cvd=T=>100*(1+3.9083e-3*T-5.775e-7*T*T);
const cvdInv=R=>{ let a=-100,b=700; for(let k=0;k<50;k++){ const m=(a+b)/2; if(cvd(m)<R) a=m; else b=m; } return (a+b)/2; };
RT.registerSim('temperature',{name:'Pt100 and thermocouple',desc:'See what lead resistance and a missing cold junction do to a reading.',c:'var(--ch2)',from:'Week 6',icon:'M2,40 C30,34 60,20 98,6'},host=>{
  const sh=simShell(host,'temperature',tog('Sensor',[['rtd','Pt100 (2-wire)'],['tc','Type K']])+knob('tm-t','True temperature (°C)',0,500,1,100)+knob('tm-l','Lead resistance, total (Ω)',0,5,0.1,1)+knob('tm-c','Cold junction (°C)',0,50,1,25)+`<div class="knob"><label>Compensation</label><div class="tog" id="tm-cmp"><button data-c="0" class="on">Off</button><button data-c="1">On</button></div></div>`+rd([['Sensor output','tm-o'],['Instrument reads','tm-r'],['Error','tm-e'],['Slope','tm-s']]));
  let comp=false; const mode=bindTog(host,()=>upd());
  $$('#tm-cmp button',host).forEach(b=>b.onclick=()=>{ comp=b.dataset.c==='1'; $$('#tm-cmp button',host).forEach(x=>x.classList.toggle('on',x===b)); upd(); });
  const calc=()=>{ const T=kv($('#tm-t')),Rl=kv($('#tm-l')),Tc=kv($('#tm-c')),m=mode();
    if(m==='rtd'){ const R=cvd(T)+Rl; const read=cvdInv(R); return {m,T,Rl,Tc,o:R.toFixed(2)+' Ω',read,err:read-T,slope:'0.385 Ω/°C'}; }
    const mvHot=kmv(T), mvCj=kmv(Tc); const mv=mvHot-mvCj; const read=comp?kT(mv+mvCj):kT(mv); return {m,T,Rl,Tc,o:mv.toFixed(3)+' mV',read,err:read-T,slope:'≈'+Math.round((kmv(T+1)-kmv(T))*1000)+' µV/°C'}; };
  const upd=()=>{ const c=calc(); out('tm-t',c.T+' °C'); out('tm-l',c.Rl.toFixed(1)+' Ω'); out('tm-c',c.Tc+' °C'); $('#tm-l').parentElement.style.opacity=c.m==='rtd'?1:.4; $('#tm-c').parentElement.style.opacity=c.m==='tc'?1:.4; $('#tm-cmp').parentElement.style.opacity=c.m==='tc'?1:.4;
    setT('tm-o',c.o); setT('tm-r',c.read.toFixed(1)+' °C'); setT('tm-e',(c.err>=0?'+':'')+c.err.toFixed(1)+' °C'); setT('tm-s',c.slope); sh.draw(); };
  bindInputs(host,upd);
  const draw=()=>{ const {ctx,S:{W,H:Hh}}=sh; scopeGrid(ctx,W,Hh); const c=calc(); const pl=48,pr=16,pt=20,pb=30; const X=t=>pl+(W-pl-pr)*t/500;
    const rtd=c.m==='rtd'; const f=rtd?cvd:kmv; const vmax=rtd?cvd(500)+6:kmv(500)+0.5, vmin=rtd?90:0; const Y=v=>pt+(Hh-pt-pb)*(1-(v-vmin)/(vmax-vmin));
    for(let t=0;t<=500;t+=100) label(ctx,t+'',X(t),Hh-10,dim,'center',9);
    const pts=[]; for(let t=0;t<=500;t+=5) pts.push([X(t),Y(f(t))]); glowLine(ctx,pts,css('--ch2'),2.6);
    const tx=X(c.T), ty=Y(f(c.T)); ctx.setLineDash([3,4]); ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.beginPath(); ctx.moveTo(tx,Hh-pb); ctx.lineTo(tx,ty); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle=css('--phos'); ctx.beginPath(); ctx.arc(tx,ty,6,0,7); ctx.fill(); label(ctx,'true',tx+8,ty+16,css('--phos'),'left',10);
    const rx=X(Math.min(500,Math.max(0,c.read))); ctx.fillStyle=css('--amber'); ctx.beginPath(); ctx.arc(rx,Y(f(Math.min(500,Math.max(0,c.read)))),5,0,7); ctx.fill(); label(ctx,'instrument says',rx+8,Y(f(Math.min(500,Math.max(0,c.read))))-8,css('--amber'),'left',10);
    label(ctx,rtd?'Resistance (Ω) vs °C':'EMF (mV) vs °C',pl+4,pt+8,dim,'left',10); };
  sh.setDraw(draw); upd();
});
})();
