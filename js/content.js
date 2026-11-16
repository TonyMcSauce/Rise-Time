/* ============ RISE TIME : curriculum content ============ */
(function(){
const f2 = n => +(+n).toFixed(2);

/* ---------- schematic drawing helpers ---------- */
const BODY = {
  R:{len:44, svg:'<polyline points="-22,0 -18,-7 -11,7 -4,-7 4,7 11,-7 18,7 22,0"/>'},
  C:{len:10, svg:'<line x1="-5" y1="-13" x2="-5" y2="13"/><line x1="5" y1="-13" x2="5" y2="13"/>'},
  L:{len:48, svg:'<path d="M-24,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0 a6,6 0 0 1 12,0"/>'},
  B:{len:10, svg:'<line x1="-5" y1="-14" x2="-5" y2="14"/><line x1="5" y1="-8" x2="5" y2="8" stroke-width="4"/>'},
  D:{len:18, svg:'<polygon points="-9,-9 -9,9 8,0" class="fillw"/><line x1="9" y1="-10" x2="9" y2="10"/>'},
  S:{len:30, svg:'<circle cx="-14" cy="0" r="2.6" class="fillw"/><circle cx="14" cy="0" r="2.6"/><line x1="-14" y1="0" x2="11" y2="-12"/>'},
  AC:{len:30, svg:'<circle r="15"/><path d="M-9,0 q4.5,-10 9,0 t9,0"/>'}
};
function comp(type,x1,y1,x2,y2,label,side=-1,cls=''){
  const b=BODY[type], dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy), ux=dx/L, uy=dy/L;
  const a=(L-b.len)/2, ax=x1+ux*a, ay=y1+uy*a, bx=x2-ux*a, by=y2-uy*a;
  const mx=(x1+x2)/2, my=(y1+y2)/2, ang=Math.atan2(dy,dx)*180/Math.PI;
  let s=`<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(ax)}" y2="${f2(ay)}"/><line x1="${f2(bx)}" y1="${f2(by)}" x2="${f2(x2)}" y2="${f2(y2)}"/>`;
  s+=`<g class="${cls}" transform="translate(${f2(mx)} ${f2(my)}) rotate(${f2(ang)})">${b.svg}</g>`;
  if(label){
    const px=-uy*side, py=ux*side;
    const anchor = Math.abs(px)>0.5 ? (px>0?'start':'end') : 'middle';
    const off = Math.abs(px)>0.5 ? 20 : 22;
    s+=`<text class="lab" x="${f2(mx+px*off)}" y="${f2(my+py*off+4)}" text-anchor="${anchor}">${label}</text>`;
  }
  return s;
}
const wire = pts => `<polyline class="wire" points="${pts}"/>`;
const dot = (x,y) => `<circle class="node" cx="${x}" cy="${y}" r="3.4"/>`;
const term = (x,y,t,anchor='start') => `<circle class="term" cx="${x}" cy="${y}" r="4"/>`+(t?`<text class="lab dim" x="${anchor==='start'?x+10:x-10}" y="${y+4}" text-anchor="${anchor}">${t}</text>`:'');
const gnd = (x,y) => `<g class="gnd"><line x1="${x}" y1="${y}" x2="${x}" y2="${y+8}"/><line x1="${x-12}" y1="${y+8}" x2="${x+12}" y2="${y+8}"/><line x1="${x-7}" y1="${y+13}" x2="${x+7}" y2="${y+13}"/><line x1="${x-3}" y1="${y+18}" x2="${x+3}" y2="${y+18}"/></g>`;
const txt = (x,y,t,cls='lab',anchor='middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;
const sch = (w,h,body,cap) => `<figure class="fig"><svg class="sch" viewBox="0 0 ${w} ${h}" role="img" aria-label="${cap||'diagram'}">${body}</svg>${cap?`<figcaption>${cap}</figcaption>`:''}</figure>`;
const arrowDefs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ahead"/></marker></defs>`;
function plotPath(fn,x0,x1,X,Y,n=120){let d='';for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;d+=(i?'L':'M')+f2(X(x))+','+f2(Y(fn(x)));}return d;}

/* ---------- tracks ---------- */
const TRACKS = {
  MATH:{name:'Maths', ch:'CH1', color:'var(--ch1)'},
  CIRC:{name:'Circuits', ch:'CH2', color:'var(--ch2)'},
  ELEC:{name:'Electronics', ch:'CH3', color:'var(--ch3)'},
  SENS:{name:'Sensors', ch:'CH4', color:'var(--ch4)'},
  CTRL:{name:'Control', ch:'CH5', color:'var(--ch5)'},
  DRIVE:{name:'Drives & actuators', ch:'CH6', color:'var(--ch6)'},
  PLC:{name:'PLC & automation', ch:'CH7', color:'var(--ch7)'},
  KIN:{name:'Kinematics', ch:'CH8', color:'var(--ch8)'},
  EMB:{name:'Embedded', ch:'CH9', color:'var(--ch9)'},
  REV:{name:'Review', ch:'REF', color:'var(--ref)'}
};

/* ---------- diagrams ---------- */
const DIAG = {
prefix(){
  const pre=[['p','10⁻¹²'],['n','10⁻⁹'],['µ','10⁻⁶'],['m','10⁻³'],['–','10⁰'],['k','10³'],['M','10⁶'],['G','10⁹']];
  let b='', x0=40, step=62;
  b+=`<line class="axis" x1="30" y1="70" x2="${x0+step*7+10}" y2="70"/>`;
  pre.forEach((p,i)=>{const x=x0+step*i;
    b+=`<line class="tick" x1="${x}" y1="60" x2="${x}" y2="80"/>`;
    b+=txt(x,48,p[0]==='–'?'base':p[0], i===4?'lab dim':'big');
    b+=txt(x,100,p[1],'lab dim');
    if(i<7) b+=`<path class="hop" d="M${x+6},86 Q${x+step/2},106 ${x+step-6},86" marker-end="url(#ah)"/>`;
  });
  b+=txt(x0+step*3.5,132,'each step = × 1000','lab amber');
  return sch(520,145,arrowDefs+b,'Engineering prefixes move in steps of a thousand');
},
ohm(){
  let b=arrowDefs;
  b+=comp('B',60,50,60,130,'12 V',1);
  b+=wire('60,50 260,50');
  b+=comp('R',260,50,260,130,'R',-1);
  b+=wire('60,130 260,130');
  b+=`<path class="flow" d="M120,36 L200,36" marker-end="url(#ah)"/>`+txt(160,28,'I','lab amber');
  b+=txt(44,52,'+','lab amber');
  return sch(330,165,b,'A single loop: one source, one load, one current');
},
unit(){
  const cx=130, cy=120, r=88, th=40*Math.PI/180, px=cx+r*Math.cos(th), py=cy-r*Math.sin(th);
  let b=arrowDefs;
  b+=`<line class="axis" x1="${cx-r-18}" y1="${cy}" x2="${cx+r+18}" y2="${cy}"/><line class="axis" x1="${cx}" y1="${cy+r+14}" x2="${cx}" y2="${cy-r-14}"/>`;
  b+=`<circle class="ring" cx="${cx}" cy="${cy}" r="${r}"/>`;
  b+=`<line class="vec" x1="${cx}" y1="${cy}" x2="${f2(px)}" y2="${f2(py)}"/>`;
  b+=`<line class="proj c1" x1="${cx}" y1="${cy}" x2="${f2(px)}" y2="${cy}"/>`;
  b+=`<line class="proj c2" x1="${f2(px)}" y1="${cy}" x2="${f2(px)}" y2="${f2(py)}"/>`;
  b+=`<path class="arc" d="M${cx+28},${cy} A28,28 0 0 0 ${f2(cx+28*Math.cos(th))},${f2(cy-28*Math.sin(th))}"/>`;
  b+=txt(cx+40,cy-10,'θ','lab amber');
  b+=txt(cx+r*Math.cos(th)/2,cy+18,'cos θ','lab c1t');
  b+=txt(px+10,cy-r*Math.sin(th)/2,'sin θ','lab c2t','start');
  b+=`<circle class="node" cx="${f2(px)}" cy="${f2(py)}" r="4"/>`+txt(px+8,py-8,'(cos θ, sin θ)','lab dim','start');
  b+=txt(cx-r/2+6,cy-r/2+2,'r = 1','lab dim');
  // little wave
  const X=x=>300+x*36, Y=y=>cy-y*60;
  b+=`<line class="axis" x1="300" y1="${cy}" x2="${X(6.6)}" y2="${cy}"/>`;
  b+=`<path class="trace c2s" d="${plotPath(Math.sin,0,6.28,X,Y)}"/>`;
  b+=`<path class="trace c1s dash" d="${plotPath(Math.cos,0,6.28,X,Y)}"/>`;
  b+=txt(X(1.57),Y(1)-8,'sin','lab c2t')+txt(X(0.2),Y(1)-8,'cos','lab c1t');
  b+=txt(X(3.14),cy+18,'π','lab dim')+txt(X(6.28),cy+18,'2π','lab dim');
  return sch(560,240,b,'Sine and cosine are just the shadows of a rotating radius');
},
divider(){
  let b='';
  b+=comp('B',50,40,50,180,'Vin',1);
  b+=wire('50,40 200,40');
  b+=comp('R',200,40,200,110,'R1',-1);
  b+=comp('R',200,110,200,180,'R2',-1);
  b+=wire('50,180 200,180')+wire('200,110 300,110')+wire('200,180 300,180');
  b+=dot(200,110)+dot(200,180)+term(300,110,'Vout')+term(300,180,'0 V');
  b+=gnd(120,180);
  return sch(380,215,b,'Voltage divider: the output is a fixed fraction of the input');
},
vectors(){
  const o=[90,170], s=34, th=35*Math.PI/180, v=[3,1.2];
  const rx=v[0]*Math.cos(th)-v[1]*Math.sin(th), ry=v[0]*Math.sin(th)+v[1]*Math.cos(th);
  const P=(x,y)=>`${f2(o[0]+x*s)},${f2(o[1]-y*s)}`;
  let b=arrowDefs;
  b+=`<line class="axis" x1="40" y1="${o[1]}" x2="250" y2="${o[1]}"/><line class="axis" x1="${o[0]}" y1="200" x2="${o[0]}" y2="20"/>`;
  b+=`<line class="vec c1s" x1="${o[0]}" y1="${o[1]}" x2="${P(v[0],v[1]).split(',')[0]}" y2="${P(v[0],v[1]).split(',')[1]}" marker-end="url(#ah)"/>`;
  b+=`<line class="vec c2s" x1="${o[0]}" y1="${o[1]}" x2="${P(rx,ry).split(',')[0]}" y2="${P(rx,ry).split(',')[1]}" marker-end="url(#ah)"/>`;
  b+=txt(o[0]+v[0]*s+6,o[1]-v[1]*s+14,'v','lab c1t','start')+txt(o[0]+rx*s+6,o[1]-ry*s,"v′ = R(θ)·v",'lab c2t','start');
  b+=`<path class="arc" d="M${o[0]+56},${o[1]-22} A60,60 0 0 0 ${f2(o[0]+60*Math.cos(Math.atan2(1.2,3)+th))},${f2(o[1]-60*Math.sin(Math.atan2(1.2,3)+th))}"/>`;
  b+=txt(o[0]+70,o[1]-48,'θ','lab amber');
  b+=`<g class="matrix" transform="translate(300 70)"><text class="lab dim" x="0" y="0">R(θ) =</text><path class="brk" d="M62,-22 h-6 v74 h6 M190,-22 h6 v74 h-6"/><text class="lab" x="70" y="0">cos θ</text><text class="lab" x="128" y="0">−sin θ</text><text class="lab" x="70" y="38">sin θ</text><text class="lab" x="134" y="38">cos θ</text></g>`;
  b+=txt(300,170,'x′ = x cos θ − y sin θ','lab c2t','start')+txt(300,192,'y′ = x sin θ + y cos θ','lab c2t','start');
  return sch(530,215,b,'A rotation matrix turns a vector without changing its length');
},
nodal(){
  let b='';
  b+=comp('B',40,50,40,180,'12 V',1);
  b+=comp('R',40,50,200,50,'R1 = 4 Ω');
  b+=comp('R',200,50,200,180,'R3 = 6 Ω',-1);
  b+=comp('R',200,50,360,50,'R2 = 2 Ω');
  b+=comp('B',360,50,360,180,'6 V',-1);
  b+=wire('40,180 360,180')+dot(200,50)+dot(200,180)+gnd(200,180);
  b+=txt(200,34,'node A','lab amber');
  return sch(420,215,b,'Two sources feeding one node: a classic nodal problem');
},
tangent(){
  const X=x=>40+x*90, Y=y=>190-y*120, fn=x=>0.2*x*x-0.02*x*x*x;
  let b=`<line class="axis" x1="40" y1="190" x2="${X(5.4)}" y2="190"/><line class="axis" x1="40" y1="200" x2="40" y2="20"/>`;
  // scale: x in seconds 0..5, y in metres (fn max ~1.0 at 5)
  const Ys=y=>190-y*150;
  b+=`<path class="trace c1s" d="${plotPath(fn,0,5,X,Ys)}"/>`;
  const t0=2, y0=fn(t0), m=0.4*t0-0.06*t0*t0;
  b+=`<line class="trace c2s" x1="${X(t0-1.3)}" y1="${f2(Ys(y0-m*1.3))}" x2="${X(t0+1.6)}" y2="${f2(Ys(y0+m*1.6))}"/>`;
  b+=`<circle class="node" cx="${X(t0)}" cy="${f2(Ys(y0))}" r="4"/>`;
  b+=txt(X(t0)+8,Ys(y0)+22,'slope = dx/dt = 0.56 m/s','lab c2t','start');
  b+=txt(X(4.6),Ys(fn(4.6))-10,'x(t)','lab c1t');
  b+=txt(X(5.2),205,'t (s)','lab dim')+txt(30,26,'x (m)','lab dim','end');
  for(let i=1;i<=5;i++) b+=`<line class="tick" x1="${X(i)}" y1="186" x2="${X(i)}" y2="194"/>`+txt(X(i),210,i,'lab dim');
  return sch(560,225,b,'The derivative is the slope of the tangent at one instant');
},
area(){
  const X=x=>50+x*200, Y=y=>190-y*1.15;
  const fn=t=>t<0.5?240*t:120;
  let d=`M${X(0)},${Y(0)} `+plotPath(fn,0,1.5,X,Y,90).replace('M','L')+` L${X(1.5)},${Y(0)} Z`;
  let b=`<path class="area" d="${d}"/>`;
  b+=`<path class="trace c1s" d="${plotPath(fn,0,1.5,X,Y,90)}"/>`;
  b+=`<line class="axis" x1="50" y1="190" x2="${X(1.62)}" y2="190"/><line class="axis" x1="50" y1="200" x2="50" y2="30"/>`;
  b+=`<line class="tick dash" x1="${X(0.5)}" y1="190" x2="${X(0.5)}" y2="${Y(120)}"/>`;
  b+=txt(X(0.32),Y(30),'30 m³','lab amber')+txt(X(1),Y(55),'120 m³','lab amber');
  b+=txt(X(0.5),208,'0.5 h','lab dim')+txt(X(1.5),208,'1.5 h','lab dim')+txt(42,Y(120)+4,'120','lab dim','end');
  b+=txt(X(1.55),Y(120)-12,'Q (m³/h)','lab c1t','end');
  return sch(440,222,b,'Total volume pumped = area under the flow curve');
},
thevenin(){
  let b='';
  b+=comp('B',40,40,40,170,'12 V',1);
  b+=comp('R',40,40,170,40,'6 kΩ');
  b+=comp('R',170,40,170,170,'3 kΩ',1);
  b+=wire('40,170 170,170')+wire('170,40 215,40')+wire('170,170 215,170')+dot(170,40)+dot(170,170);
  b+=term(215,40,'a')+term(215,170,'b');
  b+=txt(268,112,'≡','big amber');
  b+=comp('B',320,40,320,170,'Vth = 4 V',1);
  b+=comp('R',320,40,450,40,'Rth = 2 kΩ');
  b+=wire('320,170 450,170')+term(450,40,'a')+term(450,170,'b');
  return sch(520,200,b,'Any linear network looks like one source and one resistor from its terminals');
},
rc(){
  let b=arrowDefs;
  b+=comp('B',40,40,40,170,'Vs',1);
  b+=comp('S',40,40,120,40,'t = 0');
  b+=comp('R',120,40,250,40,'R');
  b+=wire('250,40 300,40')+comp('C',300,40,300,170,'C',-1)+wire('40,170 300,170');
  b+=dot(300,40);
  b+=`<line class="flow" x1="340" y1="160" x2="340" y2="52" marker-end="url(#ah)"/>`+txt(352,110,'vC','lab amber','start');
  // mini curve
  const X=t=>400+t*28, Y=v=>170-v*120;
  b+=`<line class="axis" x1="400" y1="170" x2="${X(5.4)}" y2="170"/><line class="axis" x1="400" y1="176" x2="400" y2="38"/>`;
  b+=`<path class="trace c2s" d="${plotPath(t=>1-Math.exp(-t),0,5.2,X,Y)}"/>`;
  b+=`<line class="tick dash" x1="${X(1)}" y1="170" x2="${X(1)}" y2="${f2(Y(0.632))}"/><line class="tick dash" x1="400" y1="${f2(Y(0.632))}" x2="${X(1)}" y2="${f2(Y(0.632))}"/>`;
  b+=txt(X(1),186,'τ','lab amber')+txt(394,Y(0.632)+4,'63%','lab dim','end')+txt(X(5),186,'5τ','lab dim');
  return sch(570,200,b,'Close the switch and the capacitor charges along an exponential');
},
complex(){
  const o=[80,180], s=3.2;
  let b=arrowDefs;
  b+=`<line class="axis" x1="40" y1="${o[1]}" x2="250" y2="${o[1]}"/><line class="axis" x1="${o[0]}" y1="200" x2="${o[0]}" y2="20"/>`;
  b+=txt(255,o[1]+4,'Re','lab dim','start')+txt(o[0],14,'Im (j)','lab dim');
  const px=o[0]+30*s, py=o[1]-40*s;
  b+=`<line class="proj c1" x1="${o[0]}" y1="${o[1]}" x2="${px}" y2="${o[1]}"/><line class="proj c2" x1="${px}" y1="${o[1]}" x2="${px}" y2="${py}"/>`;
  b+=`<line class="vec" x1="${o[0]}" y1="${o[1]}" x2="${px}" y2="${py}" marker-end="url(#ah)"/>`;
  b+=txt(o[0]+48,o[1]+18,'R = 30 Ω','lab c1t')+txt(px+8,o[1]-64,'XL = 40 Ω','lab c2t','start');
  b+=txt(px-70,py+20,'|Z| = 50 Ω','lab amber','end');
  b+=`<path class="arc" d="M${o[0]+34},${o[1]} A34,34 0 0 0 ${f2(o[0]+34*0.6)},${f2(o[1]-34*0.8)}"/>`+txt(o[0]+44,o[1]-12,'53.1°','lab amber','start');
  b+=`<g transform="translate(300 60)"><text class="lab" x="0" y="0">rectangular</text><text class="big" x="0" y="30">30 + j40</text><text class="lab" x="0" y="74">polar</text><text class="big" x="0" y="104">50 ∠ 53.1°</text></g>`;
  return sch(500,215,b,'One impedance, two ways of writing it');
},
flyback(){
  let b=arrowDefs;
  b+=txt(60,32,'+24 V','lab amber','start')+wire('60,40 240,40')+term(60,40);
  b+=comp('L',160,40,160,140,'coil',1);
  b+=comp('D',240,140,240,40,'diode',-1,'hot');
  b+=wire('160,140 240,140')+dot(160,40)+dot(160,140)+dot(240,40)+dot(240,140);
  b+=comp('S',160,140,160,205,'PLC output',1);
  b+=gnd(160,205);
  b+=`<path class="flow hotflow" d="M200,128 C210,110 210,70 200,54" marker-end="url(#ah)"/>`;
  b+=txt(296,100,'current loops','lab dim','start')+txt(296,116,'here at switch-off','lab dim','start');
  return sch(430,240,b,'Flyback diode: gives the coil current somewhere safe to go');
}
};

/* ---------- question helper ---------- */
const num = (id,q,ans,unit,explain,tol=0.02) => ({id,type:'num',q,ans,unit,explain,tol});
const mcq = (id,q,choices,ans,explain) => ({id,type:'mcq',q,choices,ans,explain});

/* ---------- baseline (cold start) questions ---------- */
const BASELINE = [
  num('b1','How many milliamps are in 0.025 A?',25,'mA','Milli means one thousandth, so multiply amps by 1000: 0.025 × 1000 = 25 mA.'),
  num('b2','What is 2⁵?',32,'','2 × 2 × 2 × 2 × 2 = 32. Powers of two show up everywhere in digital systems.'),
  mcq('b3','In V = I × R, what happens to current if resistance doubles and voltage stays the same?',['It doubles','It halves','It stays the same','It quadruples'],1,'I = V / R, so doubling R halves I.'),
  num('b4','Solve for x: 3x + 7 = 22',5,'','Subtract 7 from both sides (3x = 15), then divide by 3.'),
  num('b5','What is sin 90°?',1,'','At 90° the rotating radius points straight up, so its vertical shadow is the full radius: 1.')
];

/* ---------- full sessions ---------- */
const SESSIONS = [
/* ======================= WEEK 1 ======================= */
{ id:1, wk:1, day:1, track:'MATH', title:'Units, prefixes and engineering notation',
  kicker:'Every calculation starts with getting the units right. Today we rebuild that reflex.',
  learn:`<p>Engineering numbers span huge ranges: picofarads in a sensor filter, megawatts at the substation. Rather than juggling long strings of zeros, we use <b>prefixes that move in steps of 1000</b>. Engineering notation keeps the exponent a multiple of three, so the number always lines up with a prefix.</p>
<div class="eq">0.0047 A = 4.7 × 10⁻³ A = <b>4.7 mA</b></div>
<p>The second habit is to <b>carry units through every line</b>. If the units on the left of an equation don't match the units on the right, the maths is wrong even if the arithmetic is perfect. A volt is an amp times an ohm; a watt is a volt times an amp. Units are a free error check.</p>
<div class="eq">V = I · R &nbsp;→&nbsp; [V] = [A]·[Ω] &nbsp;&nbsp;&nbsp; P = V · I &nbsp;→&nbsp; [W] = [V]·[A]</div>
<p>Finally, <b>rearrange before you substitute</b>. Isolate the unknown symbolically, then drop numbers in at the end. It keeps the working clean and makes mistakes easy to spot.</p>`,
  diagram:'prefix',
  pins:['Prefixes step by 1000: p, n, µ, m, (base), k, M, G','Engineering notation: exponent is a multiple of 3','Carry units on every line; they catch errors for free','Rearrange symbolically first, substitute numbers last'],
  worked:{prompt:'A level transmitter draws 18 mA from a 24 V DC supply. How much power does it consume?',
    steps:['Write the relationship: <span class="m">P = V · I</span>','Convert to base units: <span class="m">18 mA = 0.018 A</span>','Substitute: <span class="m">P = 24 V × 0.018 A = 0.432 W</span>','Express in engineering notation: <span class="m">0.432 W = 432 mW</span>'],
    answer:'P = 432 mW. Small, but multiply by a few hundred field devices and it shapes the size of your 24 V supply.'},
  tryit:[
    num('s1q1','Convert 0.00068 F to microfarads.',680,'µF','0.00068 F = 680 × 10⁻⁶ F = 680 µF. Move the decimal six places right for micro.'),
    num('s1q2','A 3.3 kΩ resistor carries 2.5 mA. What is the voltage across it?',8.25,'V','V = I·R = 0.0025 A × 3300 Ω = 8.25 V. Notice mA × kΩ gives volts directly, a handy shortcut.'),
    mcq('s1q3','Which is the correct engineering notation for 47,000 Ω?',['4.7 × 10⁴ Ω','47 kΩ','0.047 MΩ','470 hΩ'],1,'47 kΩ uses an exponent of 3 (a multiple of three). 4.7 × 10⁴ is scientific notation, and 0.047 MΩ is correct but not engineering form.')
  ],
  recall:[ num('s1r1','A 4-20 mA transmitter ranges 0 to 10 m of level. It reads 12 mA. What is the level?',5,'m','The span is 16 mA (20 − 4). (12 − 4) / 16 = 0.5, so 50% of 10 m = 5 m.') ],
  plant:{title:'Why 4-20 mA and not 0-20 mA?',body:`<p>Most analogue field instruments on a processing plant speak <b>4-20 mA</b>. The transmitter regulates the loop current; at the PLC card a 250 Ω resistor turns that into 1 to 5 V.</p><p>The <b>live zero</b> at 4 mA is the clever part. A healthy instrument at 0% still draws 4 mA, so a reading of 0 mA can only mean a broken wire, blown fuse or dead transmitter. Many cards flag anything under about 3.6 mA as a fault. Next time you see a level or pressure value on the SCADA, back-calculate the loop current in your head. It's a two-second habit that makes fault-finding much faster.</p>`}
},
{ id:2, wk:1, day:2, track:'CIRC', title:"Ohm's law and power, properly",
  kicker:'Three letters you know by heart. Today we use them like an engineer, including the heat they predict.',
  learn:`<p>Ohm's law ties voltage, current and resistance together. Combine it with <span class="m">P = V·I</span> and you get three ways to calculate power. Pick whichever uses the two quantities you actually know.</p>
<div class="eq">V = I·R &nbsp;&nbsp;&nbsp; P = V·I = I²R = V²/R</div>
<p>Power in a resistor becomes <b>heat</b>. Every resistor has a power rating (0.25 W, 0.5 W, 5 W...). Exceed it and the part cooks. The square terms matter: double the current and the heat goes up <b>four times</b>.</p>
<p>Wires are resistors too. A conductor's resistance depends on its length <i>L</i>, cross-section <i>A</i> and the material's resistivity ρ. Copper is about 1.68 × 10⁻⁸ Ω·m.</p>
<div class="eq">R = ρ · L / A</div>
<p>Remember that current flows out of the source and <b>back again</b>, so the length that matters is the round trip.</p>`,
  diagram:'ohm',
  pins:['P = VI = I²R = V²/R: choose the form that matches what you know','Heat scales with the square of current or voltage','Wire resistance R = ρL/A, and use the round-trip length','Copper ρ ≈ 1.68 × 10⁻⁸ Ω·m'],
  worked:{prompt:'A 24 V DC solenoid coil measures 48 Ω. Find its current and power. What happens if the supply sags to 20 V?',
    steps:['Current at 24 V: <span class="m">I = V/R = 24 / 48 = 0.5 A</span>','Power at 24 V: <span class="m">P = V²/R = 576 / 48 = 12 W</span>','At 20 V: <span class="m">I = 20/48 = 0.417 A, P = 400/48 = 8.33 W</span>','Compare: voltage fell 17% but power fell <b>31%</b>, because power goes with V²'],
    answer:'0.5 A and 12 W at 24 V. At 20 V the coil only produces 8.3 W, which may not be enough force to pull the valve spool fully over.'},
  tryit:[
    num('s2q1','12 V is applied across a 220 Ω resistor. What current flows?',54.5,'mA','I = V/R = 12/220 = 0.0545 A = 54.5 mA.'),
    num('s2q2','A 100 Ω resistor carries 0.2 A. How much power does it dissipate?',4,'W','P = I²R = 0.04 × 100 = 4 W. A standard 0.25 W resistor would burn.'),
    num('s2q3','What is the maximum voltage you can put across a 1 kΩ, 0.25 W resistor?',15.8,'V','From P = V²/R: V = √(P·R) = √(0.25 × 1000) = 15.8 V.')
  ],
  recall:[ num('s2r1','What is the resistance of 200 m (total, round trip) of 2.5 mm² copper cable?',1.344,'Ω','R = ρL/A = 1.68e-8 × 200 / 2.5e-6 = 1.344 Ω.') ],
  plant:{title:'The 150 metre solenoid',body:`<p>A 24 V DC solenoid sits 150 m from its PLC panel on 1.5 mm² cable. Round trip is 300 m, so the cable resistance is <span class="m">1.68×10⁻⁸ × 300 / 1.5×10⁻⁶ ≈ 3.4 Ω</span>. At 0.5 A that drops about <b>1.7 V</b> before the coil even sees the supply.</p><p>Add a tired power supply already sitting at 23 V and the coil gets about 21 V, roughly 23% less force. That's the classic "valve works in the workshop but sticks in the field" fault. When a field device misbehaves, measure the voltage <b>at the device under load</b>, not just at the panel.</p>`}
},
{ id:3, wk:1, day:3, track:'MATH', title:'Trigonometry and the unit circle',
  kicker:'Sine and cosine are not just triangle ratios. They are what rotation looks like from the side.',
  learn:`<p>Picture a radius of length 1 rotating around a circle. At angle θ, its tip sits at <span class="m">(cos θ, sin θ)</span>. Cosine is the horizontal shadow, sine is the vertical one. Spin the radius at a steady speed and the vertical shadow traces a <b>sine wave</b>. That's why sinusoids appear wherever things rotate: alternators, motors, cranks, wheels.</p>
<p>Engineers measure angles in <b>radians</b>. One full turn is 2π rad, so:</p>
<div class="eq">rad = deg × π/180 &nbsp;&nbsp;&nbsp; ω = 2π f</div>
<p>Here ω is angular frequency in rad/s and <i>f</i> is frequency in Hz. A general sinusoid is written <span class="m">v(t) = V<sub>p</sub> sin(ωt + φ)</span>, where φ is the phase shift.</p>
<p>For right triangles, keep SOH CAH TOA and Pythagoras close: <span class="m">a² + b² = c²</span>. You'll use them for force components, slopes, and linkage geometry constantly.</p>`,
  diagram:'unit', sim:'phasor',
  pins:['(cos θ, sin θ) is the tip of a unit radius at angle θ','A rotating radius projects a sine wave','rad = deg × π/180, and ω = 2πf','v(t) = Vp sin(ωt + φ): amplitude, frequency, phase'],
  worked:{prompt:'A crane boom 12 m long is raised 35° above horizontal. How far out does it reach, and how high is the tip above the pivot?',
    steps:['Horizontal reach uses the adjacent side: <span class="m">x = L cos θ</span>','<span class="m">x = 12 × cos 35° = 12 × 0.819 = 9.83 m</span>','Height uses the opposite side: <span class="m">y = L sin θ = 12 × 0.574 = 6.88 m</span>','Check with Pythagoras: <span class="m">√(9.83² + 6.88²) = 12.0 m</span> ✓'],
    answer:'Reach 9.83 m, height 6.88 m. Raising the boom shortens reach, which is exactly why crane load charts change with boom angle.'},
  tryit:[
    num('s3q1','What is the angular frequency ω of a 50 Hz supply?',314.16,'rad/s','ω = 2πf = 2 × π × 50 = 314.16 rad/s.'),
    num('s3q2','Convert 135° to radians.',2.356,'rad','135 × π/180 = 3π/4 = 2.356 rad.'),
    num('s3q3','A conveyor belt 40 m long is inclined at 15°. How much height does it gain end to end?',10.35,'m','Height = 40 × sin 15° = 40 × 0.2588 = 10.35 m.')
  ],
  recall:[ num('s3r1','What is cos 60°?',0.5,'','At 60° the horizontal shadow of a unit radius is exactly half its length.') ],
  plant:{title:'Inclined conveyors and the sin θ load',body:`<p>On an inclined conveyor, gravity pulls each tonne of ore back down the belt with a force of <span class="m">m·g·sin θ</span>. On a 15° incline that's about 26% of the load's weight acting against the drive, on top of friction.</p><p>This is why inclined conveyors need <b>holdbacks</b> (backstops). If the drive trips with a loaded belt, that sin θ component will run the belt backwards. Next time you walk past one, find the holdback on the head pulley and think about the trig keeping it all in place.</p>`}
},
{ id:4, wk:1, day:4, track:'CIRC', title:'Series, parallel and dividers',
  kicker:'Most circuits are just resistors in series and parallel wearing a disguise.',
  learn:`<p>In <b>series</b>, the same current flows through every resistor and the resistances add. In <b>parallel</b>, every resistor sees the same voltage and the <i>conductances</i> add.</p>
<div class="eq">Series: R = R₁ + R₂ + … &nbsp;&nbsp;&nbsp; Parallel: 1/R = 1/R₁ + 1/R₂ + …</div>
<p>For exactly two in parallel, use <b>product over sum</b>: <span class="m">R = R₁R₂ / (R₁ + R₂)</span>. The result is always smaller than the smallest resistor.</p>
<p>Two resistors in series across a supply make a <b>voltage divider</b>. The output across R₂ is a fixed fraction of the input:</p>
<div class="eq">V<sub>out</sub> = V<sub>in</sub> · R₂ / (R₁ + R₂)</div>
<p>The catch is <b>loading</b>. Connect anything across V<sub>out</sub> and it sits in parallel with R₂, lowering the effective R₂ and pulling V<sub>out</sub> down. A divider only behaves if the load resistance is much bigger than R₂, ideally ten times or more. Try it in the simulator below.</p>`,
  diagram:'divider', sim:'divider',
  pins:['Series resistances add; parallel conductances add','Two in parallel: product over sum','Vout = Vin · R2/(R1 + R2)','A load across R2 drags Vout down; keep RL ≥ 10 × R2'],
  worked:{prompt:'You need to scale a 24 V signal down to about 5 V for a microcontroller input. Pick the resistors.',
    steps:['Choose R₂ = 10 kΩ (a common, sensible value)','Rearrange the divider: <span class="m">R₁ = R₂ (V<sub>in</sub>/V<sub>out</sub> − 1) = 10k × (24/5 − 1) = 38 kΩ</span>','Nearest standard E24 value is 39 kΩ','Check: <span class="m">V<sub>out</sub> = 24 × 10/(39 + 10) = 4.90 V</span>, safely under 5 V'],
    answer:'R₁ = 39 kΩ, R₂ = 10 kΩ gives 4.90 V. The microcontroller input is very high impedance, so loading is negligible.'},
  tryit:[
    num('s4q1','What is 1 kΩ in parallel with 4.7 kΩ?',824.6,'Ω','Product over sum: (1000 × 4700)/(5700) = 824.6 Ω. Smaller than the smallest, as expected.'),
    num('s4q2','A divider has Vin = 12 V, R1 = 10 kΩ, R2 = 2.2 kΩ. What is Vout?',2.164,'V','Vout = 12 × 2.2/(10 + 2.2) = 2.164 V.'),
    mcq('s4q3','You connect a 2.2 kΩ load across R2 in that divider. What happens to Vout?',['It rises','It falls','It stays the same','It goes to zero'],1,'R2 in parallel with the load becomes 1.1 kΩ, so Vout drops to 12 × 1.1/11.1 = 1.19 V. Loading always pulls the output down.')
  ],
  recall:[ num('s4r1','Three 330 Ω resistors are connected in series. What is the total?',990,'Ω','Series resistances simply add: 3 × 330 = 990 Ω.') ],
  plant:{title:'Dividers hiding in plain sight',body:`<p>Voltage dividers are everywhere on site. Potentiometer position sensors on valve actuators are adjustable dividers. Many analogue input cards use dividers to scale high voltages down to what the converter can read.</p><p>Loading bites when someone connects a low-impedance meter or a second device across a signal. If a reading drops the moment you connect test equipment, the source has a high internal resistance and your instrument is loading it. Use a high-impedance meter (10 MΩ input is typical for a good multimeter).</p>`}
},
{ id:5, wk:1, day:5, track:'REV', title:'Week 1 review: the bench check',
  kicker:'Friday. No new theory. We pull the week together and use it on a real fault.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Units</h4><p>p n µ m · k M G in steps of 1000. Engineering notation uses exponents in multiples of 3. Carry units on every line.</p></div>
<div class="cheat"><h4>Ohm & power</h4><p>V = IR. P = VI = I²R = V²/R. Heat scales with the square. Wire R = ρL/A, round trip.</p></div>
<div class="cheat"><h4>Trig</h4><p>Unit radius tip at (cos θ, sin θ). rad = deg × π/180. ω = 2πf. v = Vp sin(ωt + φ).</p></div>
<div class="cheat"><h4>Networks</h4><p>Series adds, parallel is product over sum. Vout = Vin·R2/(R1+R2). Loading drags Vout down.</p></div>
</div>`,
  pins:['If you could only keep one habit from this week: check units at every step'],
  worked:{prompt:'A tank level reads a frozen 0% on the SCADA. At the PLC card, you measure 2.6 V across the 250 Ω input resistor. What is going on?',
    steps:['Back-calculate the loop current: <span class="m">I = V/R = 2.6 / 250 = 10.4 mA</span>','Convert to percent of range: <span class="m">(10.4 − 4)/16 = 40%</span>','So the field signal is healthy and says 40%, yet the display says 0%','The fault is between the card and the screen: scaling, a forced value, a wrong tag or a card channel fault'],
    answer:'The transmitter is fine, sending 40%. Look at the PLC side: check the channel scaling, forces and tag mapping before anyone climbs the tank.'},
  tryit:[
    num('s5q1','A 4-20 mA temperature transmitter ranges 0 to 200 °C. It sends 7.2 mA. What temperature is that?',40,'°C','(7.2 − 4)/16 = 0.2, and 20% of 200 °C is 40 °C.'),
    num('s5q2','Two 1.2 kΩ resistors in series sit across 24 V. What current flows?',10,'mA','R = 2.4 kΩ, so I = 24/2400 = 0.01 A = 10 mA.'),
    num('s5q3','A 2 m pivot arm is raised to 60° above horizontal. How high is its tip above the pivot?',1.732,'m','Height = 2 × sin 60° = 2 × 0.866 = 1.732 m.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Pick one live analogue value on the plant each day this coming week. Work out the loop current it implies, and ask yourself what reading you'd see if the cable were cut. Five seconds a day, and 4-20 mA becomes second nature.</p>`}
},
/* ======================= WEEK 2 ======================= */
{ id:6, wk:2, day:1, track:'MATH', title:'Vectors, matrices and rotation',
  kicker:'The language of forces, torques and, later, robot arms.',
  learn:`<p>A <b>vector</b> has size and direction. In components, <span class="m">v = (x, y, z)</span> and its magnitude is <span class="m">|v| = √(x² + y² + z²)</span>.</p>
<p>The <b>dot product</b> measures how much two vectors point the same way. It gives work done by a force, or the component of one vector along another:</p>
<div class="eq">a · b = a<sub>x</sub>b<sub>x</sub> + a<sub>y</sub>b<sub>y</sub> = |a||b| cos θ</div>
<p>The <b>cross product</b> gives a vector at right angles to both. Its biggest job in mechanics is <b>torque</b>: <span class="m">τ = r × F</span>, with magnitude <span class="m">|r||F| sin θ</span>.</p>
<p>A <b>matrix</b> is a machine that transforms vectors. The 2D rotation matrix spins a vector by θ without stretching it. Chain rotations and translations together and you have the foundation of robot kinematics in Week 10.</p>`,
  diagram:'vectors', sim:'rotate',
  pins:['|v| = √(x² + y² + z²)','Dot product: a·b = |a||b|cos θ, gives projection and work','Cross product magnitude |r||F| sin θ, gives torque','Rotation matrix: [cos −sin; sin cos]'],
  worked:{prompt:'You apply 150 N to a 0.4 m wrench. Find the torque when you push at 90° to the handle, and at 60°.',
    steps:['Torque magnitude: <span class="m">τ = r F sin θ</span>','At 90°: <span class="m">τ = 0.4 × 150 × 1 = 60 N·m</span>','At 60°: <span class="m">τ = 0.4 × 150 × 0.866 = 52.0 N·m</span>','The 30° error costs about 13% of your torque'],
    answer:'60 N·m square to the handle, 52 N·m at 60°. Push at right angles to get the torque you think you are applying.'},
  tryit:[
    num('s6q1','What is the magnitude of the vector (3, 4, 12)?',13,'','√(9 + 16 + 144) = √169 = 13.'),
    num('s6q2','Compute the dot product (2, 1) · (4, −3).',5,'','2×4 + 1×(−3) = 8 − 3 = 5.'),
    num('s6q3','Rotate the vector (2, 0) by 30°. What is the new y component?',1,'','y′ = x sin θ + y cos θ = 2 × 0.5 + 0 = 1.')
  ],
  recall:[ num('s6r1','A 0.5 m spanner with 200 N applied square to the handle gives how much torque?',100,'N·m','τ = rF = 0.5 × 200 = 100 N·m.') ],
  plant:{title:'Torque during shutdown',body:`<p>Every flange, bearing housing and coupling bolted up during a shutdown has a specified torque. A torque wrench measures <span class="m">r × F</span> at its own handle length, which is why extensions and crow's-foot adapters change the real torque unless you correct for them.</p><p>Hydraulic torque tools on big liner and mill bolts are the same physics with a cylinder doing the pushing: pressure × piston area gives force, force × reaction arm gives torque.</p>`}
},
{ id:7, wk:2, day:2, track:'CIRC', title:"Kirchhoff's laws and nodal analysis",
  kicker:'Two conservation laws that solve almost any DC network.',
  learn:`<p><b>KCL (current law):</b> charge can't pile up at a node, so the currents leaving a node sum to zero. What flows in must flow out.</p>
<p><b>KVL (voltage law):</b> go around any closed loop and the voltage rises and drops sum to zero. Energy per charge is conserved.</p>
<p><b>Nodal analysis</b> turns KCL into a recipe:</p>
<ol class="steps-list"><li>Pick a reference node (ground, 0 V).</li><li>Label the unknown node voltages.</li><li>At each unknown node, write the sum of currents leaving: <span class="m">(V<sub>node</sub> − V<sub>other</sub>)/R</span> for every branch, and set it to zero.</li><li>Solve the equations, then find any branch current you need.</li></ol>
<p>The beauty is that you never have to guess current directions. Write every current as "leaving" and the signs take care of themselves.</p>`,
  diagram:'nodal',
  pins:['KCL: currents leaving a node sum to zero','KVL: voltages around a loop sum to zero','Nodal: write every branch as (V_node − V_other)/R leaving','Choose ground wisely; it eliminates an unknown'],
  worked:{fig:true,prompt:'In the circuit below, find the voltage at node A.',
    steps:['Sum the currents leaving A: <span class="m">(V<sub>A</sub> − 12)/4 + V<sub>A</sub>/6 + (V<sub>A</sub> − 6)/2 = 0</span>','Multiply through by 12: <span class="m">3(V<sub>A</sub> − 12) + 2V<sub>A</sub> + 6(V<sub>A</sub> − 6) = 0</span>','Expand: <span class="m">11V<sub>A</sub> − 72 = 0</span>','So <span class="m">V<sub>A</sub> = 72/11 = 6.545 V</span>'],
    answer:'V_A = 6.545 V. Check: current from the 12 V source is (12 − 6.545)/4 = 1.364 A, which splits into 1.091 A through R3 and 0.273 A into the 6 V source. KCL holds.'},
  tryit:[
    num('s7q1','Using V_A = 6.545 V, what current flows down through R3 (6 Ω)?',1.091,'A','I = V_A / 6 = 6.545 / 6 = 1.091 A.'),
    num('s7q2','Currents of 3 A and 1.5 A flow into a node. 2 A flows out on one wire. How much flows out on the only other wire?',2.5,'A','KCL: 3 + 1.5 = 2 + I, so I = 2.5 A.'),
    num('s7q3','A loop has a 24 V source and two loads dropping 10 V and 6 V. What is the drop across the third and final load?',8,'V','KVL: 24 = 10 + 6 + V, so V = 8 V.')
  ],
  recall:[],
  plant:{title:'KCL protects people',body:`<p>An <b>earth leakage relay</b> is KCL in a box. A core balance CT surrounds all the phase conductors (and neutral). In a healthy circuit the currents sum to zero, so the CT sees nothing.</p><p>If insulation breaks down and some current returns through earth, possibly through a person, the sum is no longer zero. The CT sees the imbalance and the relay trips. Settings of 30 mA for personnel protection come straight from how much current the human body can tolerate.</p>`}
},
{ id:8, wk:2, day:3, track:'MATH', title:'Derivatives: the rate of change',
  kicker:'Velocity, current in a capacitor, voltage across a coil. All derivatives.',
  learn:`<p>The derivative <span class="m">dy/dx</span> is the <b>slope</b> of a curve at one instant: how fast y is changing as x changes. Zoom in far enough on any smooth curve and it looks like a straight line; the derivative is that line's gradient.</p>
<p>The rules you'll use most:</p>
<div class="eq">d/dt (tⁿ) = n tⁿ⁻¹ &nbsp;&nbsp; d/dt sin(ωt) = ω cos(ωt) &nbsp;&nbsp; d/dt e^{at} = a e^{at}</div>
<p>Plus the <b>chain rule</b>: differentiate the outside, multiply by the derivative of the inside.</p>
<p>In mechatronics, derivatives describe how things move and how components react:</p>
<div class="eq">v = dx/dt &nbsp;&nbsp; a = dv/dt &nbsp;&nbsp; i<sub>C</sub> = C dv/dt &nbsp;&nbsp; v<sub>L</sub> = L di/dt</div>
<p>And to find a maximum or minimum, set the derivative to zero: at a peak, the slope is momentarily flat.</p>`,
  diagram:'tangent',
  pins:['Derivative = slope at an instant','d/dt tⁿ = n tⁿ⁻¹; d/dt sin ωt = ω cos ωt','Capacitor current i = C dv/dt; inductor voltage v = L di/dt','Max or min where the derivative is zero'],
  worked:{prompt:'A hydraulic cylinder rod moves as x(t) = 0.2t² − 0.02t³ metres. Find its velocity at t = 2 s, and when it reaches peak velocity.',
    steps:['Differentiate: <span class="m">v(t) = 0.4t − 0.06t²</span>','At t = 2 s: <span class="m">v = 0.8 − 0.24 = 0.56 m/s</span>','Peak velocity where acceleration is zero: <span class="m">dv/dt = 0.4 − 0.12t = 0</span>','<span class="m">t = 3.33 s</span>, where v = 0.4(3.33) − 0.06(3.33)² = 0.667 m/s'],
    answer:'0.56 m/s at 2 s, peaking at 0.667 m/s at 3.33 s.'},
  tryit:[
    num('s8q1','What is the derivative of 5t³, evaluated at t = 2?',60,'','d/dt 5t³ = 15t², and 15 × 4 = 60.'),
    num('s8q2','A 100 µF capacitor has its voltage ramping at 50 V/s. What current flows into it?',5,'mA','i = C dv/dt = 100e-6 × 50 = 0.005 A = 5 mA.'),
    num('s8q3','v(t) = 10 sin(100t) volts. What is dv/dt at t = 0?',1000,'V/s','dv/dt = 10 × 100 cos(100t) = 1000 cos(0) = 1000 V/s.')
  ],
  recall:[],
  plant:{title:'Rate-of-change alarms',body:`<p>A tank level of 40% tells you little. A level <b>falling at 5% per minute</b> tells you a lot: a burst line, a valve stuck open, a pump running away. Many control systems compute the derivative of key signals and alarm on rate of change, catching trouble long before an absolute high or low alarm.</p><p>Vibration monitoring works the same way. Accelerometers measure acceleration; integrate once for velocity (the standard mm/s severity measure) and you're moving between derivatives and integrals in real equipment.</p>`}
},
{ id:9, wk:2, day:4, track:'CIRC', title:'Thevenin, Norton and maximum power',
  kicker:'Shrink any messy network into one source and one resistor.',
  learn:`<p><b>Thevenin's theorem:</b> any linear network, seen from two terminals, behaves exactly like a single voltage source V<sub>th</sub> in series with a single resistance R<sub>th</sub>.</p>
<p>To find them:</p>
<ol class="steps-list"><li><b>V<sub>th</sub></b> is the open-circuit voltage across the terminals.</li><li><b>R<sub>th</sub></b> is the resistance seen looking back in, with sources switched off (voltage sources shorted, current sources opened).</li></ol>
<p><b>Norton</b> is the same idea as a current source <span class="m">I<sub>N</sub> = V<sub>th</sub>/R<sub>th</sub></span> in parallel with R<sub>th</sub>.</p>
<p>Once you have the equivalent, finding what any load does becomes a one-line divider problem. And there's a bonus: <b>maximum power</b> transfers to a load when <span class="m">R<sub>L</sub> = R<sub>th</sub></span>, giving <span class="m">P<sub>max</sub> = V<sub>th</sub>²/(4R<sub>th</sub>)</span>.</p>`,
  diagram:'thevenin',
  pins:['Vth = open-circuit voltage','Rth = look back with sources off (V shorted, I opened)','Norton: IN = Vth/Rth in parallel with Rth','Max power when RL = Rth: Pmax = Vth²/4Rth'],
  worked:{prompt:'A 12 V source feeds a 6 kΩ / 3 kΩ divider. Find the Thevenin equivalent at the output, then the output voltage with a 2 kΩ and a 10 kΩ load.',
    steps:['Open-circuit: <span class="m">V<sub>th</sub> = 12 × 3/(6 + 3) = 4 V</span>','Short the source and look back: <span class="m">R<sub>th</sub> = 6k ∥ 3k = 2 kΩ</span>','2 kΩ load: <span class="m">V = 4 × 2/(2 + 2) = 2 V</span> (and this is the max power case)','10 kΩ load: <span class="m">V = 4 × 10/(2 + 10) = 3.33 V</span>'],
    answer:'4 V behind 2 kΩ. Any load is now a quick divider calculation instead of a re-solve of the whole network.'},
  tryit:[
    num('s9q1','A 24 V source feeds two 10 kΩ resistors as a divider. What is Vth at the midpoint?',12,'V','Equal resistors split the supply in half: 12 V.'),
    num('s9q2','For that same divider, what is Rth in kΩ?',5,'kΩ','10k ∥ 10k = 5 kΩ.'),
    num('s9q3','A source has Vth = 12 V and Rth = 4 Ω. What is the maximum power it can deliver to a load?',9,'W','Pmax = Vth²/(4Rth) = 144/16 = 9 W, when the load is 4 Ω.')
  ],
  recall:[ num('s9r1','A 24 V supply reads 24.6 V with no load and 23.1 V delivering 3 A. What is its internal resistance?',0.5,'Ω','Rth = ΔV/ΔI = (24.6 − 23.1)/3 = 0.5 Ω.') ],
  plant:{title:'Every supply is a Thevenin source',body:`<p>A 24 V DC power supply, a battery bank, even the transformer feeding an MCC: each behaves like an ideal source behind an internal resistance (or impedance). Measure it under no load and full load, and the difference tells you R<sub>th</sub>.</p><p>A supply that sags badly under load has a high internal resistance: ageing capacitors, a failing battery, or undersized cabling. That's often the hidden cause of intermittent PLC resets when a big solenoid bank energises.</p>`}
},
{ id:10, wk:2, day:5, track:'REV', title:'Week 2 review: network detective',
  kicker:'Vectors, Kirchhoff, derivatives and Thevenin, applied to one sagging supply.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Vectors</h4><p>|v| = √Σx². a·b = |a||b|cos θ. Torque τ = rF sin θ. Rotation matrix [cos −sin; sin cos].</p></div>
<div class="cheat"><h4>Kirchhoff</h4><p>KCL: currents leaving a node sum to 0. KVL: voltages round a loop sum to 0. Nodal: (Vn − Vm)/R per branch.</p></div>
<div class="cheat"><h4>Derivatives</h4><p>Slope at an instant. n tⁿ⁻¹, ω cos ωt, a e^{at}. i = C dv/dt, v = L di/dt. Peaks where slope = 0.</p></div>
<div class="cheat"><h4>Thevenin</h4><p>Vth open circuit. Rth with sources off. IN = Vth/Rth. Max power at RL = Rth.</p></div>
</div>`,
  pins:['Big idea this week: reduce a complex system to something simple you can reason about'],
  worked:{prompt:'A PLC rack in a field junction box keeps resetting. The 24 V PSU reads 24.0 V at its terminals, but at the junction box you measure 22.8 V with 4 A flowing. The PLC drops out below 20.4 V. What is happening?',
    steps:['KVL around the supply loop: cable drop = <span class="m">24.0 − 22.8 = 1.2 V</span>','Loop cable resistance: <span class="m">R = 1.2 / 4 = 0.3 Ω</span>','When a solenoid bank adds 6 A: drop = <span class="m">0.3 × 10 = 3.0 V</span>, so the box sees 21.0 V, and the PSU itself sags too','Thevenin view: PSU plus cable is one source with a significant R<sub>th</sub>. Fix: thicker cable, a local PSU, or sense-wire regulation'],
    answer:'The cable resistance forms a large part of the source R_th. Under heavy load the junction box voltage approaches the PLC drop-out threshold.'},
  tryit:[
    num('s10q1','Find the torque from 80 N applied square to a 0.75 m lever.',60,'N·m','τ = rF = 0.75 × 80 = 60 N·m.'),
    num('s10q2','A position is x(t) = 3t². What is the velocity at t = 4 s?',24,'m/s','v = dx/dt = 6t = 24 m/s.'),
    num('s10q3','Vth = 10 V, Rth = 1 kΩ. What voltage appears across a 4 kΩ load?',8,'V','Divider: 10 × 4/(1 + 4) = 8 V.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>When you're near a panel this week, look for the biggest DC loads and ask where their current returns. Trace one return path in your head. Kirchhoff says every amp out comes back, and finding the return path is half of fault-finding.</p>`}
},
/* ======================= WEEK 3 ======================= */
{ id:11, wk:3, day:1, track:'MATH', title:'Integrals: accumulation',
  kicker:'If derivatives cut things into instants, integrals add the instants back up.',
  learn:`<p>The definite integral <span class="m">∫ f(t) dt</span> from a to b is the <b>area under the curve</b>: the total accumulation of something that has been flowing at rate f(t).</p>
<div class="eq">∫ tⁿ dt = tⁿ⁺¹/(n+1) &nbsp;&nbsp; ∫ sin(ωt) dt = −cos(ωt)/ω &nbsp;&nbsp; ∫ e^{at} dt = e^{at}/a</div>
<p>It's the reverse of differentiation, and it shows up whenever you want a total from a rate:</p>
<div class="eq">distance = ∫ v dt &nbsp;&nbsp; charge Q = ∫ i dt &nbsp;&nbsp; energy E = ∫ P dt &nbsp;&nbsp; v<sub>C</sub> = (1/C) ∫ i dt</div>
<p>For simple shapes, you don't even need calculus: break the area into rectangles and triangles. And the <b>average value</b> of a signal over a time T is just its integral divided by T.</p>`,
  diagram:'area',
  pins:['Integral = area under the curve = total accumulated','Reverse of the derivative: ∫ tⁿ dt = tⁿ⁺¹/(n+1)','Q = ∫ i dt, E = ∫ P dt, vC = (1/C) ∫ i dt','Simple shapes: rectangles and triangles beat calculus'],
  worked:{prompt:'A slurry pump ramps linearly from 0 to 120 m³/h over 30 minutes, then runs steady for an hour. How much has it pumped?',
    steps:['Split the area: a triangle (ramp) plus a rectangle (steady)','Triangle: <span class="m">½ × 0.5 h × 120 m³/h = 30 m³</span>','Rectangle: <span class="m">1 h × 120 m³/h = 120 m³</span>','Total: <span class="m">30 + 120 = 150 m³</span>'],
    answer:'150 m³. A flowmeter totaliser is doing exactly this integral, continuously.'},
  tryit:[
    num('s11q1','Evaluate the integral of 2t from t = 0 to t = 3.',9,'','∫2t dt = t². From 0 to 3: 9 − 0 = 9.'),
    num('s11q2','A 470 µF capacitor is charged by a constant 2 mA for 3 s. By how much does its voltage rise?',12.77,'V','Q = I·t = 0.002 × 3 = 6 mC. V = Q/C = 0.006/470e-6 = 12.77 V.'),
    num('s11q3','A 5 kW motor runs at full load for 6 hours. How much energy does it use?',30,'kWh','E = P·t = 5 kW × 6 h = 30 kWh.')
  ],
  recall:[],
  plant:{title:'Totalisers and energy meters',body:`<p>Every flowmeter totaliser on the plant integrates instantaneous flow into a running volume. PLC totaliser blocks do it by adding <span class="m">flow × Δt</span> every scan, the same rectangle method you just used.</p><p>Energy meters integrate power over time into kWh, which is what the mine actually pays for. And the I term in a PID controller (Week 8) is another integral, accumulating error over time until it's driven to zero.</p>`}
},
{ id:12, wk:3, day:2, track:'CIRC', title:'Capacitors and RC transients',
  kicker:"Where this app gets its name. Today you'll see a rise time for real.",
  learn:`<p>A capacitor stores charge: <span class="m">Q = CV</span>. Because <span class="m">i = C dv/dt</span>, its voltage <b>cannot jump instantly</b>. It has to be charged, and charging through a resistor takes time.</p>
<p>Connect a step of V<sub>s</sub> through R and the capacitor voltage rises exponentially:</p>
<div class="eq">v<sub>C</sub>(t) = V<sub>s</sub> (1 − e<sup>−t/τ</sup>) &nbsp;&nbsp;&nbsp; τ = RC</div>
<p>The <b>time constant τ</b> sets the pace. After one τ the capacitor reaches 63%; after 5τ it's over 99%, effectively done. Discharging follows <span class="m">v = V₀ e<sup>−t/τ</sup></span>.</p>
<p>The time to go from 10% to 90% of the final value is the <b>rise time</b>, and for a first-order system it's <span class="m">t<sub>r</sub> ≈ 2.2τ</span>. Energy stored is <span class="m">E = ½CV²</span>. Play with R and C in the simulator and watch the rise time move.</p>`,
  diagram:'rc', sim:'rc',
  pins:['Q = CV; i = C dv/dt; capacitor voltage cannot jump','τ = RC; 63% at 1τ, over 99% at 5τ','Charge: Vs(1 − e^(−t/τ)). Discharge: V0 e^(−t/τ)','Rise time (10% to 90%) ≈ 2.2τ. Energy = ½CV²'],
  worked:{prompt:'A switch debounce filter uses 10 kΩ and 10 µF. How long until the capacitor reaches 90% after the contact closes?',
    steps:['Time constant: <span class="m">τ = RC = 10 000 × 10×10⁻⁶ = 0.1 s</span>','Set 0.9 = 1 − e<sup>−t/τ</sup>, so <span class="m">e<sup>−t/τ</sup> = 0.1</span>','Take logs: <span class="m">t = τ · ln(10) = 2.303 τ</span>','<span class="m">t = 0.23 s</span>'],
    answer:'About 0.23 s. Slow enough to ignore contact bounce, though you may notice the lag on a fast pushbutton.'},
  tryit:[
    num('s12q1','What is the time constant of 4.7 kΩ with 100 µF?',0.47,'s','τ = RC = 4700 × 100e-6 = 0.47 s.'),
    num('s12q2','A capacitor charges from 0 V towards 24 V. What is its voltage after exactly one time constant?',15.17,'V','24 × (1 − e⁻¹) = 24 × 0.632 = 15.17 V.'),
    num('s12q3','How much energy is stored in a 2200 µF capacitor charged to 50 V?',2.75,'J','E = ½CV² = 0.5 × 2200e-6 × 2500 = 2.75 J.')
  ],
  recall:[ num('s12r1','For a first-order system with τ = 0.5 s, what is the 10-90% rise time?',1.1,'s','tr ≈ 2.2τ = 2.2 × 0.5 = 1.1 s.') ],
  plant:{title:'The VSD that bites after isolation',body:`<p>A variable speed drive rectifies the supply onto a <b>DC bus</b> of large capacitors at around 650 V. When you isolate the drive, those capacitors are still charged. They discharge through internal bleed resistors with a time constant that can be minutes long.</p><p>That's why drive manuals say <b>wait 5 to 15 minutes</b> and verify zero volts on the DC bus terminals before touching anything. The isolation is upstream; the stored energy is downstream. Test before touch, every time.</p>`}
},
{ id:13, wk:3, day:3, track:'MATH', title:'Complex numbers and phasors',
  kicker:'The trick that turns AC calculus back into simple algebra.',
  learn:`<p>Engineers write <span class="m">j = √−1</span> (i is taken by current). A complex number has two forms:</p>
<div class="eq">rectangular: a + jb &nbsp;&nbsp;&nbsp; polar: M ∠ θ, &nbsp; M = √(a² + b²), θ = tan⁻¹(b/a)</div>
<p>Add and subtract in rectangular form. <b>Multiply and divide in polar</b>: multiply the magnitudes and add the angles (or divide and subtract).</p>
<p>A <b>phasor</b> is a sinusoid frozen as a rotating arrow: its length is the amplitude and its angle is the phase. Because every voltage and current in a linear AC circuit spins at the same ω, we can drop the rotation and work with the arrows alone.</p>
<p>Components become <b>impedances</b>:</p>
<div class="eq">Z<sub>R</sub> = R &nbsp;&nbsp; Z<sub>L</sub> = jωL &nbsp;&nbsp; Z<sub>C</sub> = 1/(jωC) = −j/(ωC)</div>
<p>And Ohm's law works again: <span class="m">V = I·Z</span>, with complex numbers.</p>`,
  diagram:'complex', sim:'phasor',
  pins:['j = √−1. Rectangular a + jb, polar M∠θ','Add in rectangular, multiply and divide in polar','Phasor = amplitude and phase of a sinusoid','ZR = R, ZL = jωL, ZC = −j/(ωC); then V = IZ'],
  worked:{prompt:'A motor winding is modelled as 30 Ω resistance in series with 40 Ω inductive reactance, fed from 230 V. Find the current, its phase, and the power factor.',
    steps:['Impedance: <span class="m">Z = 30 + j40 Ω</span>','To polar: <span class="m">|Z| = √(30² + 40²) = 50 Ω, θ = tan⁻¹(40/30) = 53.13°</span>','Current: <span class="m">I = 230∠0° / 50∠53.13° = 4.6 ∠ −53.13° A</span>','Power factor: <span class="m">cos 53.13° = 0.6</span> lagging'],
    answer:'4.6 A lagging the voltage by 53°, power factor 0.6. Only 60% of the current is doing real work.'},
  tryit:[
    num('s13q1','What is the magnitude of 6 + j8?',10,'','√(36 + 64) = √100 = 10.'),
    num('s13q2','What is the angle of 1 + j1 in degrees?',45,'°','tan⁻¹(1/1) = 45°.'),
    num('s13q3','What is the reactance of a 10 µF capacitor at 50 Hz?',318.3,'Ω','XC = 1/(2πfC) = 1/(314.16 × 10e-6) = 318.3 Ω.')
  ],
  recall:[],
  plant:{title:'Power factor and the substation capacitor banks',body:`<p>Induction motors are inductive loads, so they draw current that <b>lags</b> the voltage. That reactive current heats cables and transformers without doing useful work, and utilities often penalise a poor power factor.</p><p>The fix is to add capacitance, whose current <b>leads</b>. Capacitor banks at substations and MCCs cancel the inductive phasor so the net current lines up with the voltage. It's literally adding arrows on the complex plane until the imaginary parts cancel.</p>`}
},
{ id:14, wk:3, day:4, track:'CIRC', title:'Inductors, RL circuits and flyback',
  kicker:'Coils resist change in current, and they fight back hard when you try to stop it.',
  learn:`<p>An inductor stores energy in its magnetic field. Its defining law mirrors the capacitor's:</p>
<div class="eq">v<sub>L</sub> = L di/dt &nbsp;&nbsp;&nbsp; E = ½ L I²</div>
<p>Because voltage depends on the <i>rate of change</i> of current, an inductor's <b>current cannot jump</b>. Switch on an RL circuit and the current rises exponentially with <span class="m">τ = L/R</span>, just like the capacitor's voltage did.</p>
<div class="eq">i(t) = (V/R)(1 − e<sup>−t/τ</sup>) &nbsp;&nbsp;&nbsp; τ = L/R</div>
<p>The danger comes at <b>switch-off</b>. Interrupt the current suddenly and di/dt becomes enormous, so L di/dt produces a huge voltage spike. It arcs across relay contacts and punches through transistors.</p>
<p>The fix is a <b>flyback diode</b> across the coil, reverse-biased in normal operation (cathode to the positive side). At switch-off, the coil current circulates through the diode and decays gently. AC coils use RC snubbers or MOVs instead.</p>`,
  diagram:'flyback',
  pins:['v = L di/dt; inductor current cannot jump','RL rise: τ = L/R, same shape as RC','Sudden switch-off: huge L di/dt spike','Flyback diode across DC coils, cathode to positive'],
  worked:{prompt:'A 24 V DC solenoid has L = 0.5 H and R = 48 Ω. Find τ, the steady current, the stored energy, and the theoretical spike if switched off in 10 µs with no suppression.',
    steps:['<span class="m">τ = L/R = 0.5/48 = 10.4 ms</span>','Steady current: <span class="m">I = 24/48 = 0.5 A</span>','Stored energy: <span class="m">E = ½ × 0.5 × 0.5² = 62.5 mJ</span>','Spike: <span class="m">v = L di/dt = 0.5 × 0.5 / 10×10⁻⁶ = 25 000 V</span> (in theory; in practice something arcs or fails first)'],
    answer:'τ = 10.4 ms, 0.5 A, 62.5 mJ, and a potential spike in the kilovolts. That energy has to go somewhere; the diode gives it a safe path.'},
  tryit:[
    num('s14q1','What is the time constant of a 0.2 H coil with 40 Ω resistance, in milliseconds?',5,'ms','τ = L/R = 0.2/40 = 0.005 s = 5 ms.'),
    num('s14q2','How much energy is stored in a 2 H inductor carrying 3 A?',9,'J','E = ½LI² = 0.5 × 2 × 9 = 9 J.'),
    mcq('s14q3','Which way should a flyback diode across a DC coil be connected?',['Cathode to the positive supply side','Anode to the positive supply side','Either way works','In series with the coil'],0,'Cathode to positive keeps it reverse-biased during normal operation. At switch-off the coil voltage reverses, the diode conducts and the current circulates safely.')
  ],
  recall:[],
  plant:{title:'Suppression on solenoid valves',body:`<p>Many DIN-plug solenoid valve connectors include a built-in suppression diode or varistor, often with an LED. When a transistor output card keeps failing on the same channel, or a relay's contacts are pitted and black, missing coil suppression is a prime suspect.</p><p>Watch the polarity: a connector with a diode only works one way round on DC. Swap the wires and you short the supply through the diode the moment the output turns on.</p>`}
},
{ id:15, wk:3, day:5, track:'REV', title:'Week 3 review: transients on the plant',
  kicker:'Integrals, RC, phasors and RL. One dangerous drive to make it real.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Integrals</h4><p>Area under the curve. Q = ∫i dt. E = ∫P dt. vC = (1/C)∫i dt. Use rectangles and triangles where you can.</p></div>
<div class="cheat"><h4>RC</h4><p>τ = RC. Charge Vs(1 − e^(−t/τ)). 63% at τ, done at 5τ. Rise time 2.2τ. E = ½CV².</p></div>
<div class="cheat"><h4>Phasors</h4><p>a + jb ↔ M∠θ. Multiply in polar. ZL = jωL, ZC = −j/ωC. V = IZ. pf = cos θ.</p></div>
<div class="cheat"><h4>RL</h4><p>τ = L/R. v = L di/dt. E = ½LI². Never interrupt coil current without a path for it.</p></div>
</div>`,
  pins:['Capacitors hold voltage, inductors hold current. Neither changes instantly.'],
  worked:{prompt:'A drive DC bus sits at 650 V with 2000 µF of capacitance and a 100 kΩ bleed resistor. How long until it falls below 50 V?',
    steps:['Time constant: <span class="m">τ = RC = 100 000 × 0.002 = 200 s</span>','Discharge: <span class="m">50 = 650 e<sup>−t/200</sup></span>','<span class="m">t = 200 × ln(650/50) = 200 × 2.565</span>','<span class="m">t = 513 s ≈ 8.6 minutes</span>'],
    answer:'Almost 9 minutes, and a failed bleed resistor would make it far longer. This is why you always prove the bus dead with a meter.'},
  tryit:[
    num('s15q1','A capacitor charging with τ = 0.2 s: how long until it reaches 50% of its final voltage?',0.139,'s','0.5 = 1 − e^(−t/τ) gives t = τ ln 2 = 0.693 × 0.2 = 0.139 s.'),
    num('s15q2','What is the magnitude of the impedance 40 + j30 Ω?',50,'Ω','√(1600 + 900) = 50 Ω.'),
    num('s15q3','A battery supplies a steady 3 A for 20 minutes. How much charge is that in amp-hours?',1,'Ah','Q = I·t = 3 A × (1/3) h = 1 Ah.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week we move into AC power, op amps and transistors. Before Monday, look at the nameplate of one motor and note its rated current, power and power factor. We'll use real numbers like those to make AC power concrete.</p>`}
}
];

/* ---------- outline for weeks 4-12 ---------- */
const OUTLINE = [
 {wk:4, phase:'Analogue foundations', items:[['CIRC','AC power, RMS and power factor'],['ELEC','Op amps: the two golden rules'],['CIRC','Impedance networks and resonance'],['ELEC','Op amp circuits: inverting, non-inverting, summing'],['REV','Week 4 review']]},
 {wk:5, phase:'Analogue foundations', items:[['ELEC','Diodes and rectifiers'],['ELEC','Transistors as switches: BJT and MOSFET'],['ELEC','Power electronics: PWM and the H-bridge'],['CIRC','Three-phase power'],['REV','Week 5 review']]},
 {wk:6, phase:'Analogue foundations', items:[['SENS','Temperature: RTDs and thermocouples'],['SENS','Signal conditioning and filters'],['SENS','Encoders, proximity and limit sensing'],['EMB','ADCs, DACs and sampling'],['REV','Week 6 review']]},
 {wk:7, phase:'Control and actuation', items:[['MATH','The Laplace transform'],['CTRL','Transfer functions and block diagrams'],['CTRL','First and second order responses'],['CTRL','Poles and stability'],['REV','Week 7 review']]},
 {wk:8, phase:'Control and actuation', items:[['CTRL','PID control'],['CTRL','Tuning a loop in practice'],['DRIVE','DC motors and torque-speed curves'],['DRIVE','Induction motors and VSDs'],['REV','Week 8 review']]},
 {wk:9, phase:'Control and actuation', items:[['DRIVE','Hydraulic actuators and proportional valves'],['PLC','PLC architecture and the scan cycle'],['PLC','Ladder logic patterns'],['PLC','Interlocks and safety functions'],['REV','Week 9 review']]},
 {wk:10, phase:'Robotics and integration', items:[['KIN','Frames and homogeneous transforms'],['KIN','Forward kinematics'],['KIN','Inverse kinematics'],['KIN','The Jacobian and velocity'],['REV','Week 10 review']]},
 {wk:11, phase:'Robotics and integration', items:[['EMB','Microcontrollers and GPIO'],['EMB','Interrupts and timers'],['EMB','Serial comms: UART, I²C, SPI, Modbus'],['PLC','Industrial networks and fieldbus'],['REV','Week 11 review']]},
 {wk:12, phase:'Robotics and integration', items:[['DRIVE','Fault finding: a conveyor drive'],['DRIVE','Fault finding: a hydraulic circuit'],['CTRL','Fault finding: an oscillating loop'],['KIN','Fault finding: a robot cell'],['REV','Final review and what next']]}
];
const PHASES = {1:'Foundations',2:'Foundations',3:'Foundations'};

window.RT = {TRACKS, SESSIONS, OUTLINE, PHASES, BASELINE, DIAG, comp, wire, dot, gnd, txt, sch, term, num, mcq, f2, plotPath, arrowDefs};
})();
