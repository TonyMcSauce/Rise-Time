/* ============ RISE TIME : weeks 10 to 12 (kinematics, embedded, networks, fault finding) ============ */
(function(){
const {SESSIONS, DIAG, comp, wire, dot, gnd, txt, sch, term, num, mcq, f2, plotPath, arrowDefs} = window.RT;
const box=(x,y,w,h,t,cls='')=>`<rect class="boxn" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`+txt(x+w/2,y+h/2+4,t,'lab '+cls);
const arr=(x1,y1,x2,y2,c='flow')=>`<path class="${c}" d="M${x1},${y1} L${x2},${y2}" marker-end="url(#ah)"/>`;
const R2=Math.PI/180;

/* ---------------- diagrams ---------------- */
DIAG.frames = function(){
  let b=arrowDefs;
  b+=arr(50,170,175,170)+arr(50,170,50,45)+txt(182,174,'xA','lab dim','start')+txt(44,40,'yA','lab dim','end');
  b+=`<path class="flow" d="M50,170 L150,110" stroke-dasharray="4 4" marker-end="url(#ah)"/>`+txt(84,150,'d','lab amber');
  b+=arr(150,110,236,60,'flow c2s')+arr(150,110,107,35,'flow c2s')+txt(244,58,'xB','lab c2t','start')+txt(104,28,'yB','lab c2t','end');
  b+=`<circle cx="194" cy="27" r="4" class="c1s"/>`+txt(204,24,'p','lab c1t','start');
  b+=`<path class="trace c2s" d="M178,110 A28,28 0 0 0 175,95"/>`+txt(184,100,'θ','lab amber','start');
  b+=txt(310,70,'pA = R(θ) pB + d','lab amber','start')+txt(310,98,'R = [ cos θ  −sin θ ]','lab c1t','start')+txt(310,118,'    [ sin θ   cos θ ]','lab c1t','start')+txt(310,148,'Frame B sits at d, turned by θ','lab dim','start');
  return sch(560,195,b,'A point is described in one frame, then carried into another');
};
DIAG.arm2r = function(){
  const l1=110,l2=80,t1=35*R2,t2=50*R2,bx=70,by=165;
  const ex=bx+l1*Math.cos(t1), ey=by-l1*Math.sin(t1), tx=ex+l2*Math.cos(t1+t2), ty=ey-l2*Math.sin(t1+t2);
  let b='';
  b+=`<line class="tick dash" x1="${bx}" y1="${by}" x2="${bx+170}" y2="${by}"/><line class="tick dash" x1="${ex}" y1="${ey}" x2="${ex+90}" y2="${ey-90*Math.tan(t1)}"/>`;
  b+=`<line class="trace c1s" x1="${bx}" y1="${by}" x2="${ex}" y2="${ey}"/><line class="trace c2s" x1="${ex}" y1="${ey}" x2="${tx}" y2="${ty}"/>`;
  b+=`<circle cx="${bx}" cy="${by}" r="7" class="c1s"/><circle cx="${ex}" cy="${ey}" r="6" class="c1s"/><circle cx="${tx}" cy="${ty}" r="5" class="amber"/>`;
  b+=txt(bx+36,by-8,'θ1','lab amber','start')+txt(ex+30,ey-4,'θ2','lab amber','start')+txt((bx+ex)/2-26,(by+ey)/2,'l1','lab c1t','end')+txt((ex+tx)/2+8,(ey+ty)/2-2,'l2','lab c2t','start')+txt(tx+10,ty+4,'tip (x, y)','lab amber','start');
  b+=txt(300,62,'x = l1 cos θ1 + l2 cos(θ1 + θ2)','lab c1t','start')+txt(300,88,'y = l1 sin θ1 + l2 sin(θ1 + θ2)','lab c1t','start')+txt(300,126,'Each joint angle adds to the next link','lab dim','start');
  return sch(620,195,b,'Forward kinematics of a planar two-link arm');
};
DIAG.ik2r = function(){
  const l=100,bx=60,by=170,Tx=190,Ty=58, dx=Tx-bx, dy=by-Ty, c2=(dx*dx+dy*dy-2*l*l)/(2*l*l);
  let b='';
  const solve=s=>{const t2=s*Math.acos(c2), t1=Math.atan2(dy,dx)-Math.atan2(l*Math.sin(t2),l+l*Math.cos(t2)); return [bx+l*Math.cos(t1), by-l*Math.sin(t1)];};
  const e1=solve(1), e2=solve(-1);
  {const a0=55*R2,a1=-5*R2;b+=`<path class="tick dash" style="fill:none" d="M${bx+2*l*Math.cos(a0)},${by-2*l*Math.sin(a0)} A${2*l},${2*l} 0 0 1 ${bx+2*l*Math.cos(a1)},${by-2*l*Math.sin(a1)}"/>`;}
  b+=`<line class="trace c1s" x1="${bx}" y1="${by}" x2="${e1[0]}" y2="${e1[1]}"/><line class="trace c1s" x1="${e1[0]}" y1="${e1[1]}" x2="${Tx}" y2="${Ty}"/>`;
  b+=`<line class="trace c2s" x1="${bx}" y1="${by}" x2="${e2[0]}" y2="${e2[1]}" stroke-dasharray="5 4"/><line class="trace c2s" x1="${e2[0]}" y1="${e2[1]}" x2="${Tx}" y2="${Ty}" stroke-dasharray="5 4"/>`;
  b+=`<circle cx="${Tx}" cy="${Ty}" r="6" class="amber"/><circle cx="${bx}" cy="${by}" r="6" class="c1s"/>`;
  b+=txt(Tx+12,Ty+4,'target','lab amber','start')+txt(e1[0]+10,e1[1]+14,'elbow down','lab c1t','start')+txt(e2[0]-10,e2[1]-6,'elbow up','lab c2t','end');
  b+=txt(300,60,'cos θ2 = (x² + y² − l1² − l2²) / (2 l1 l2)','lab c1t','start')+txt(300,86,'θ1 = atan2(y, x) − atan2(l2 sin θ2, l1 + l2 cos θ2)','lab c1t','start')+txt(300,124,'Two answers, mirror images:','lab dim','start')+txt(300,144,'the elbow bends either way','lab dim','start')+txt(300,170,'Outside the circle: no solution','lab amber','start');
  return sch(700,200,b,'Inverse kinematics usually has two answers, and sometimes none');
};
DIAG.singular = function(){
  let b=arrowDefs;
  b+=`<line class="trace c1s" x1="60" y1="100" x2="170" y2="100"/><line class="trace c2s" x1="170" y1="100" x2="250" y2="100"/><circle cx="60" cy="100" r="7" class="c1s"/><circle cx="170" cy="100" r="6" class="c1s"/><circle cx="250" cy="100" r="5" class="amber"/>`;
  b+=arr(262,100,330,100,'flow amber')+`<path class="trace" d="M300,86 L316,114 M316,86 L300,114" style="stroke:#ff6b6b"/>`+txt(300,132,'cannot move along the arm','lab dim');
  b+=arr(250,92,250,34,'flow c1s')+txt(262,38,'can only move across it','lab c1t','start');
  b+=txt(250,170,'θ2 = 0: arm fully stretched, det J = l1 l2 sin θ2 = 0','lab amber');
  b+=txt(250,190,'Joint speeds blow up near this pose','lab dim');
  return sch(500,205,b,'A singularity: the arm loses a direction of motion');
};
DIAG.gpio = function(){
  let b='';
  b+=`<rect class="boxn" x="30" y="25" width="110" height="150" rx="6"/>`+txt(85,48,'MCU','lab c1t')+txt(60,92,'PA0 in','lab dim','start')+txt(60,154,'PA1 out','lab dim','start');
  b+=wire('140,88 200,88')+`<rect class="boxn" x="193" y="40" width="14" height="30"/>`+wire('200,40 200,24 290,24')+txt(294,28,'3V3','lab amber','start')+wire('200,70 200,88')+txt(216,60,'10 kΩ pull-up','lab dim','start');
  b+=wire('200,88 200,100')+`<line x1="188" y1="100" x2="212" y2="112"/>`+wire('200,114 200,126')+txt(214,124,'switch to GND','lab dim','start');
  b+=txt(260,96,'open: reads 1, pressed: reads 0','lab c1t','start').replace('x="260"','x="214"').replace('y="96"','y="84"');
  b+=wire('140,150 260,150')+`<rect class="boxn" x="260" y="142" width="40" height="16"/>`+txt(280,136,'R','lab dim')+wire('300,150 340,150')+`<path class="c2s" d="M340,140 L340,160 L358,150 Z" style="fill:none"/>`+wire('358,150 410,150 410,172')+txt(350,132,'LED','lab c2t','start')+txt(416,176,'GND','lab dim','start');
  return sch(560,190,b,'A button needs a pull-up, an LED needs a series resistor');
};
DIAG.timerwave = function(){
  const x0=90,w=480,N=4,top=40,bot=110;
  let b=`<line class="axis" x1="${x0}" y1="${bot}" x2="${x0+w}" y2="${bot}"/>`;
  let d='';for(let k=0;k<N;k++){const a=x0+k*w/N, e=x0+(k+1)*w/N;d+=`${k?'L':'M'}${a},${bot} L${e},${top} L${e},${bot} `;}
  b+=`<path class="trace c1s" d="${d}"/>`;
  const cm=bot-(bot-top)*0.35;
  b+=`<line class="tick dash" x1="${x0}" y1="${cm}" x2="${x0+w}" y2="${cm}"/>`+txt(x0-4,cm+4,'compare','lab amber','end')+txt(x0-4,top+4,'N','lab dim','end');
  let p='M'+x0+',170 ';for(let k=0;k<N;k++){const a=x0+k*w/N,e=x0+(k+1)*w/N,m=a+(e-a)*0.35;p+=`L${a},150 L${m},150 L${m},170 L${e},170 `;}
  b=b.replace('<path class="trace c1s"',`<path class="trace c2s" d="${p.replace('M'+x0+',170','M'+x0+',150')}"/><path class="trace c1s"`);
  b+=txt(x0-4,154,'output','lab c2t','end')+txt(x0+w/N,28,'overflow: interrupt fires','lab dim','middle').replace('middle','middle');
  b+=txt(x0+w/2,200,'duty = compare ÷ period','lab amber')+txt(x0+w,126,'time','lab dim','end');
  return sch(600,215,b,'A timer counts up, matches, and resets: PWM and periodic interrupts');
};
DIAG.uartframe = function(){
  const x0=60,bw=40,hi=50,lo=100, bits=[1,0, 1,0,0,0,0,0,1,0, 1,1];
  let d='',cur=bits[0],x=x0-40;
  b0:{ }
  let pts=[[x0-32,hi]]; let lvl=hi;
  bits.slice(1).forEach((v,k)=>{ const xs=x0+k*bw, y=v?hi:lo; pts.push([xs,lvl]); pts.push([xs,y]); lvl=y; });
  pts.push([x0+(bits.length-1)*bw,lvl]);
  d='M'+pts.map(p=>p.join(',')).join(' L');
  let b=`<path class="trace c1s" d="${d}"/>`;
  const labels=['idle','START','D0','D1','D2','D3','D4','D5','D6','D7','STOP'];
  labels.slice(1).forEach((l,k)=>{ b+=txt(x0+k*bw+bw/2,130,l,'lab '+(k===0||k===9?'amber':'dim')); b+=`<line class="tick" x1="${x0+k*bw}" y1="${hi-14}" x2="${x0+k*bw}" y2="${lo+10}" style="opacity:.25"/>`; });
  b+=txt(14,hi+4,'1','lab dim','end')+txt(14,lo+4,'0','lab dim','end');
  b+=txt(x0+5*bw,28,'0x41 ("A") sent least significant bit first','lab c1t')+txt(x0+5*bw,165,'1 start + 8 data + 1 stop = 10 bits per byte','lab amber');
  return sch(560,185,b,'One UART byte on the wire, 8N1');
};
DIAG.rs485 = function(){
  let b='';
  b+=`<line class="wire" x1="40" y1="100" x2="520" y2="100"/><line class="wire" x1="40" y1="118" x2="520" y2="118"/>`;
  b+=txt(30,104,'A','lab dim','end')+txt(30,122,'B','lab dim','end');
  b+=`<rect class="boxn" x="30" y="94" width="10" height="30"/><rect class="boxn" x="520" y="94" width="10" height="30"/>`+txt(40,146,'120 Ω','lab amber')+txt(522,146,'120 Ω','lab amber');
  [[110,'Master'],[250,'Slave 1'],[390,'Slave 2']].forEach(([x,n],i)=>{b+=box(x-40,30,80,36,n,i?'':'c1t')+`<line class="wire" x1="${x}" y1="66" x2="${x}" y2="100"/><line class="wire" x1="${x+8}" y1="66" x2="${x+8}" y2="118"/>`;});
  b+=txt(280,176,'Two wires, one pair per bus, terminated at both ends','lab c1t')+txt(280,196,'Up to 32 unit loads on a segment, about 1200 m','lab dim');
  return sch(560,210,b,'An RS-485 bus: one pair, daisy-chained, terminated at both ends');
};
DIAG.faultflow = function(){
  let b=arrowDefs;
  const s=[['Symptom','what, when'],['Isolate','split it up'],['Measure','no guessing'],['Fix one','one thing only'],['Retest','cleared?']];
  s.forEach((t,i)=>{const x=14+i*112;b+=box(x,40,96,44,t[0],i===3?'amber':'')+txt(x+48,102,t[1],'lab dim')+(i<4?arr(x+98,62,x+110,62):'');});
  b+=`<path class="hop" d="M510,86 L510,140 L62,140 L62,88" marker-end="url(#ah)"/>`+txt(286,132,'not fixed? back to isolate with what you learned','lab amber');
  b+=txt(286,26,'Change one thing at a time and write it down','lab c1t');
  return sch(580,160,b,'A fault-finding loop that works on any machine');
};

/* ---------------- sessions ---------------- */
SESSIONS.push(
{ id:46, wk:10, day:1, track:'KIN', title:'Frames and homogeneous transforms',
  kicker:'Every robot problem starts by asking: where is this point, and in whose coordinates?',
  learn:`<p>A robot cell has many <b>frames</b>: the world, the robot base, each joint, the tool, the camera. A point has different coordinates in each. A <b>transform</b> moves a point from one frame into another.</p>
<p>In 2D, a frame B that is turned by θ and sits at d relative to A maps a point like this:</p>
<div class="eq">p<sub>A</sub> = R(θ) p<sub>B</sub> + d &nbsp;&nbsp; R(θ) = [cos θ, −sin θ; sin θ, cos θ]</div>
<p>The rotation matrix R keeps lengths and angles: it only turns. Rotating (x, y) by 90° counter-clockwise gives <span class="m">(−y, x)</span>.</p>
<p>To chain several frames in one multiplication, we use <b>homogeneous transforms</b>, a 3 × 3 matrix in 2D (4 × 4 in 3D) that packs rotation and translation together:</p>
<div class="eq">T = [ R  d ; 0  1 ] &nbsp;&nbsp; p<sub>A</sub> = T p<sub>B</sub> &nbsp;&nbsp; T<sub>AC</sub> = T<sub>AB</sub> T<sub>BC</sub></div>
<p>Two rules save you hours: <b>order matters</b> (rotate then move is not move then rotate), and you read a chain from the world frame inwards. Angles are counter-clockwise positive, in radians in code, in degrees in your head.</p>`,
  diagram:'frames', sim:'arm',
  pins:['p_A = R p_B + d','R keeps lengths: it only turns','Rotating (x, y) by 90° CCW gives (−y, x)','Chain with T_AC = T_AB T_BC; order matters'],
  worked:{prompt:'Frame B is turned 30° from frame A and its origin sits at (2, 1) in A. A point has coordinates (1, 0) in B. Where is it in A?',
    steps:['Rotate the point: <span class="m">R(30°)(1, 0) = (cos 30°, sin 30°) = (0.866, 0.5)</span>','Add the origin offset: <span class="m">(0.866 + 2, 0.5 + 1) = (2.866, 1.5)</span>'],
    answer:'The point sits at (2.87, 1.50) in frame A. Check: its distance from B\'s origin is still 1, as it must be.'},
  tryit:[
    num('s46q1','A point at (2, 0) is rotated 90° counter-clockwise about the origin. What is its y coordinate?',2,'','R(90°)(x, y) = (−y, x), so (2, 0) becomes (0, 2).'),
    num('s46q2','The point (3, 4) is rotated 90° counter-clockwise. What is its new x coordinate?',-4,'','(−y, x) = (−4, 3).'),
    num('s46q3','How far from the origin is the point (3, 4) after it is rotated by any angle?',5,'','Rotation preserves length: √(3² + 4²) = 5.')
  ],
  recall:[ num('s46r1','A PLC scan takes 8 ms. What is the worst-case input to output delay, in ms?',16,'ms','About two scans: 16 ms.') ],
  plant:{title:'Frames on a real robot cell',body:`<p>When a robot picks from a conveyor, someone has calibrated a <b>user frame</b> on that conveyor and a <b>tool frame</b> at the gripper tip. If a part is always 5 mm off, the first suspect is a frame (a knocked fixture, a wrong tool offset), not the motors. Learn where your cell stores its frames.</p>`}
},
{ id:47, wk:10, day:2, track:'KIN', title:'Forward kinematics',
  kicker:'From joint angles to where the tool actually is.',
  learn:`<p><b>Forward kinematics</b> answers: given the joint angles, where is the tool? For a planar arm with two links (lengths l1 and l2) and joint angles θ1 and θ2, each joint angle adds to the one before it:</p>
<div class="eq">x = l<sub>1</sub> cos θ<sub>1</sub> + l<sub>2</sub> cos(θ<sub>1</sub> + θ<sub>2</sub>)<br>y = l<sub>1</sub> sin θ<sub>1</sub> + l<sub>2</sub> sin(θ<sub>1</sub> + θ<sub>2</sub>)</div>
<p>The second link points in the direction <b>θ1 + θ2</b>, because the second joint is measured relative to the first link. That sum is the usual place to slip.</p>
<p>Forward kinematics always has exactly one answer. A 6-axis industrial arm is the same idea with six transforms multiplied together, one per joint. Controllers do this a thousand times a second to show you the tool position on the pendant.</p>
<p>Use the lab below: move θ1 and θ2 and watch x and y follow.</p>`,
  diagram:'arm2r', sim:'arm',
  pins:['x = l1 cos θ1 + l2 cos(θ1 + θ2)','y = l1 sin θ1 + l2 sin(θ1 + θ2)','Link 2 points along θ1 + θ2','FK has exactly one answer'],
  worked:{prompt:'A two-link arm has l1 = 0.5 m and l2 = 0.3 m, with θ1 = 30° and θ2 = 45°. Find the tool position.',
    steps:['Total angle of link 2: <span class="m">θ1 + θ2 = 75°</span>','<span class="m">x = 0.5 cos 30° + 0.3 cos 75° = 0.4330 + 0.0776 = 0.511 m</span>','<span class="m">y = 0.5 sin 30° + 0.3 sin 75° = 0.2500 + 0.2898 = 0.540 m</span>'],
    answer:'The tool is at (0.511, 0.540) m, about 0.74 m from the base, inside the 0.8 m maximum reach.'},
  tryit:[
    num('s47q1','l1 = l2 = 1 m, θ1 = 0°, θ2 = 90°. What is x?',1,'m','x = 1·cos 0 + 1·cos 90° = 1 + 0 = 1.'),
    num('s47q2','l1 = 0.4 m, l2 = 0.3 m, θ1 = 90°, θ2 = 0°. What is y?',0.7,'m','Both links point straight up: y = 0.4 + 0.3 = 0.7.'),
    num('s47q3','l1 = 2 m, l2 = 1 m, θ1 = 60°, θ2 = −60°. What is y?',1.732,'m','θ1 + θ2 = 0, so y = 2 sin 60° + 1·sin 0 = 1.732.')
  ],
  recall:[ num('s47r1','A point at (5, 0) is rotated 90° counter-clockwise. What is its y coordinate?',5,'','(−y, x) = (0, 5).') ],
  plant:{title:'Reading the pendant',body:`<p>The teach pendant shows both joint values (J1 to J6) and Cartesian values (X, Y, Z, W, P, R). The joints are what the motors do; the Cartesian numbers are forward kinematics of them in the selected frame. If Cartesian values look wrong but joints are right, check which user and tool frame is active.</p>`}
},
{ id:48, wk:10, day:3, track:'KIN', title:'Inverse kinematics',
  kicker:'From where you want the tool, back to the joint angles that put it there.',
  learn:`<p><b>Inverse kinematics</b> goes the other way: given a target (x, y), find θ1 and θ2. For the two-link arm, the law of cosines gives the elbow angle first:</p>
<div class="eq">cos θ<sub>2</sub> = (x² + y² − l<sub>1</sub>² − l<sub>2</sub>²) / (2 l<sub>1</sub> l<sub>2</sub>)</div>
<div class="eq">θ<sub>1</sub> = atan2(y, x) − atan2(l<sub>2</sub> sin θ<sub>2</sub>, l<sub>1</sub> + l<sub>2</sub> cos θ<sub>2</sub>)</div>
<p>Three things to know:</p>
<ul><li><b>Two solutions.</b> θ2 can be positive or negative (elbow down or elbow up). The controller picks one, and swapping between them mid-move is a classic crash.</li><li><b>Limits.</b> The target must lie within reach: <span class="m">|l1 − l2| ≤ r ≤ l1 + l2</span>, with <span class="m">r = √(x² + y²)</span>. If cos θ2 comes out beyond ±1, the point is unreachable.</li><li><b>Use atan2, not atan,</b> so the quadrant is right.</li></ul>
<p>Click in the lab to place a target and flip between the two elbows.</p>`,
  diagram:'ik2r', sim:'arm',
  pins:['cos θ2 = (x² + y² − l1² − l2²) / (2 l1 l2)','Two solutions: elbow up and elbow down','Reachable only if |l1 − l2| ≤ r ≤ l1 + l2','Use atan2 to get the quadrant right'],
  worked:{prompt:'With l1 = l2 = 1 m, find both joint solutions that put the tool at (1, 1).',
    steps:['<span class="m">cos θ2 = (1 + 1 − 1 − 1) / 2 = 0</span>, so <span class="m">θ2 = ±90°</span>','For θ2 = +90°: <span class="m">θ1 = atan2(1, 1) − atan2(1·1, 1 + 0) = 45° − 45° = 0°</span>','For θ2 = −90°: <span class="m">θ1 = 45° − atan2(−1, 1) = 45° + 45° = 90°</span>'],
    answer:'(θ1, θ2) = (0°, 90°) elbow down, or (90°, −90°) elbow up. Check the first: x = 1 + 0 = 1, y = 0 + 1 = 1.'},
  tryit:[
    num('s48q1','With l1 = l2 = 1 m, the target is √3 m from the base. What is |θ2| in degrees?',60,'°','cos θ2 = (3 − 2)/2 = 0.5, so θ2 = 60°.'),
    num('s48q2','l1 = 0.6 m and l2 = 0.4 m. What is the farthest the tool can reach from the base, in metres?',1,'m','Fully stretched: l1 + l2 = 1.0 m.'),
    num('s48q3','With l1 = l2 = 1 m and target (0, 1), the elbow-down solution has θ2 = 120°. What is θ1, in degrees?',30,'°','θ1 = atan2(1, 0) − atan2(sin 120°, 1 + cos 120°) = 90° − atan2(0.866, 0.5) = 90° − 60° = 30°.')
  ],
  recall:[ num('s48r1','l1 = l2 = 0.5 m, θ1 = 90°, θ2 = 0°. What is y, in metres?',1,'m','Both links vertical: 0.5 + 0.5 = 1.0 m.') ],
  plant:{title:'Why robots stop at "out of reach"',body:`<p>Alarms such as "target out of range" or "singularity" come from exactly this maths. A programmed point that was fine from one pose can be unreachable from another, because the arm changed elbow configuration. When a taught point fails after a mechanical change, remember: the point has moved relative to the base, not the other way round.</p>`}
},
{ id:49, wk:10, day:4, track:'KIN', title:'The Jacobian and velocity',
  kicker:'How joint speeds turn into tool speed, and the poses where that breaks down.',
  learn:`<p>The <b>Jacobian</b> J links joint velocities to tool velocity: <span class="m">v = J q̇</span>. For the two-link arm:</p>
<div class="eq">J = [ −l<sub>1</sub> sin θ<sub>1</sub> − l<sub>2</sub> sin(θ<sub>1</sub>+θ<sub>2</sub>) &nbsp; −l<sub>2</sub> sin(θ<sub>1</sub>+θ<sub>2</sub>) ; l<sub>1</sub> cos θ<sub>1</sub> + l<sub>2</sub> cos(θ<sub>1</sub>+θ<sub>2</sub>) &nbsp; l<sub>2</sub> cos(θ<sub>1</sub>+θ<sub>2</sub>) ]</div>
<p>Its determinant is <span class="m">det J = l<sub>1</sub> l<sub>2</sub> sin θ<sub>2</sub></span>. When that is zero (θ2 = 0 or 180°, arm fully stretched or folded) the arm is at a <b>singularity</b>: it has lost a direction of motion. Asking for tool motion along that lost direction needs unbounded joint speed, so the controller slows down or throws an alarm.</p>
<p>The same matrix also handles force. <b>Joint torques are τ = Jᵀ F</b>, where F is the force at the tool. This is how a robot estimates contact force, and why a stretched arm is weak in one direction.</p>
<p>A single link is a handy sanity check: tip speed is just <span class="m">v = ω r</span>.</p>`,
  diagram:'singular', sim:'arm',
  pins:['v = J q̇ (tool velocity from joint velocities)','det J = l1 l2 sin θ2 for the two-link arm','det J = 0 is a singularity: lost direction','τ = Jᵀ F'],
  worked:{prompt:'With l1 = l2 = 1 m, θ1 = 0 and θ2 = 90°, the joints move at q̇ = (1, 0.5) rad/s. Find the tool velocity and det J.',
    steps:['sin θ1 = 0, cos θ1 = 1, and θ1 + θ2 = 90°, so sin = 1 and cos = 0','<span class="m">J = [ −0 − 1, −1 ; 1 + 0, 0 ] = [ −1, −1 ; 1, 0 ]</span>','<span class="m">vx = (−1)(1) + (−1)(0.5) = −1.5 m/s</span>, <span class="m">vy = (1)(1) + (0)(0.5) = 1.0 m/s</span>','<span class="m">det J = (−1)(0) − (−1)(1) = 1 = l1 l2 sin 90°</span>'],
    answer:'The tool moves at (−1.5, 1.0) m/s. det J = 1, so this pose is far from any singularity.'},
  tryit:[
    num('s49q1','Same arm and pose as the worked example, but q̇ = (2, 0) rad/s. What is vx, in m/s?',-2,'m/s','vx = J11 × 2 = (−1)(2) = −2.'),
    num('s49q2','l1 = 0.5 m, l2 = 0.4 m, θ2 = 90°. What is det J?',0.2,'','det J = 0.5 × 0.4 × sin 90° = 0.2.'),
    num('s49q3','A single link 0.8 m long turns at 2.5 rad/s. What is its tip speed, in m/s?',2,'m/s','v = ω r = 2.5 × 0.8 = 2.0 m/s.')
  ],
  recall:[ num('s49r1','l1 = 0.3 m and l2 = 0.2 m. What is the maximum reach, in metres?',0.5,'m','l1 + l2 = 0.5 m.') ],
  plant:{title:'Singularity warnings',body:`<p>A robot that slows to a crawl near full stretch, or throws a singularity alarm in the middle of a line move, is protecting itself from this maths. The fix is in the program: re-teach points to keep the wrist or elbow away from the fully stretched pose, or use a joint move through that region.</p>`}
},
{ id:50, wk:10, day:5, track:'REV', title:'Week 10 review: placing a part',
  kicker:'Frames, forward and inverse kinematics, and gearing on one pick.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Frames</h4><p>p_A = R p_B + d. R keeps lengths. Chain T_AB T_BC, order matters.</p></div>
<div class="cheat"><h4>Forward</h4><p>x = l1c1 + l2c12, y = l1s1 + l2s12. Link 2 points along θ1 + θ2.</p></div>
<div class="cheat"><h4>Inverse</h4><p>cos θ2 from the law of cosines, then θ1 with atan2. Two solutions, limits |l1 − l2| to l1 + l2.</p></div>
<div class="cheat"><h4>Jacobian</h4><p>v = J q̇. det J = l1 l2 sin θ2. Zero means singular. τ = Jᵀ F.</p></div>
</div>`,
  pins:['Joint maths first, then motors: gear ratio and encoder counts turn degrees into counts.'],
  worked:{prompt:'An arm with l1 = 0.4 m and l2 = 0.3 m must put its tool at (0.5, 0.2) m. Find the elbow-down joint angles, and check them.',
    steps:['<span class="m">r² = 0.25 + 0.04 = 0.29</span>, and <span class="m">cos θ2 = (0.29 − 0.16 − 0.09) / 0.24 = 0.1667</span>','<span class="m">θ2 = 80.4°</span>','<span class="m">θ1 = atan2(0.2, 0.5) − atan2(0.3 sin 80.4°, 0.4 + 0.3 × 0.1667) = 21.8° − 33.3° = −11.5°</span>','Check: <span class="m">x = 0.4 cos(−11.5°) + 0.3 cos(68.9°) = 0.392 + 0.108 = 0.500</span>, <span class="m">y = −0.080 + 0.280 = 0.200</span>'],
    answer:'(θ1, θ2) = (−11.5°, 80.4°). The elbow-up alternative is (55.1°, −80.4°).'},
  tryit:[
    num('s50q1','l1 = 0.4 m, l2 = 0.3 m, and the target is 0.5 m from the base. What is |θ2| in degrees?',90,'°','cos θ2 = (0.25 − 0.16 − 0.09) / 0.24 = 0, so 90°.'),
    num('s50q2','A joint needs to turn 80° through a 50:1 gearbox. How many motor revolutions is that?',11.11,'rev','80 / 360 × 50 = 11.11 revolutions.'),
    num('s50q3','An encoder gives 2000 pulses per rev (counted ×4) on a motor behind a 50:1 gearbox. How many counts per degree of joint rotation?',1111.1,'','8000 counts/rev × 50 / 360 = 1111.1 counts per joint degree.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week is the embedded side: microcontrollers, timers, serial buses and fieldbuses. Pick one device with a serial port or network cable and find out what protocol it speaks and at what baud rate.</p>`}
},

{ id:51, wk:11, day:1, track:'EMB', title:'Microcontrollers and GPIO',
  kicker:'The pins are where software meets the real world. Treat them gently.',
  learn:`<p>A microcontroller is a CPU, memory and peripherals on one chip. Its <b>GPIO</b> pins can be an input or an output, and most logic runs at 3.3 V or 5 V. Know the limits: a pin may only source or sink about 10 to 20 mA, so it cannot drive a motor or a relay coil directly.</p>
<p><b>Outputs.</b> To light an LED, pick a series resistor so the current is safe:</p>
<div class="eq">R = (V<sub>supply</sub> − V<sub>f</sub>) / I</div>
<p><b>Inputs.</b> A pin left unconnected floats and reads random values. A <b>pull-up</b> resistor (10 kΩ to supply) makes it read 1 until a switch ties it to ground. Mechanical switches also <b>bounce</b> for a few milliseconds, so a press can read as many, and software needs a debounce delay.</p>
<p><b>Analogue.</b> An ADC with n bits and reference V<sub>ref</sub> reports <span class="m">counts = V / V<sub>ref</sub> × 2<sup>n</sup></span>, so 12 bits on 3.3 V has a step of 0.8 mV. Never connect a 5 V or 24 V signal straight to a 3.3 V pin: use a divider, opto-isolator or a proper input module.</p>`,
  diagram:'gpio',
  pins:['Pins source or sink only ~10 to 20 mA','R = (Vsupply − Vf) / I','Floating inputs need a pull-up or pull-down','Debounce switches; protect against 24 V'],
  worked:{prompt:'A 5 V pin must drive an LED with Vf = 2.1 V at 15 mA. What series resistor is needed, and what preferred value would you fit?',
    steps:['Voltage across the resistor: <span class="m">5 − 2.1 = 2.9 V</span>','<span class="m">R = 2.9 / 0.015 = 193 Ω</span>','The next E12 value up is 220 Ω, giving <span class="m">2.9 / 220 = 13 mA</span>'],
    answer:'193 Ω calculated, 220 Ω fitted: a little dimmer, a little safer.'},
  tryit:[
    num('s51q1','A 3.3 V pin drives an LED with Vf = 2.0 V at 10 mA. What series resistor is needed, in ohms?',130,'Ω','R = (3.3 − 2.0) / 0.010 = 130 Ω.'),
    num('s51q2','A 3.3 V input has a 10 kΩ pull-up. When the switch closes to ground, how much current flows, in mA?',0.33,'mA','I = 3.3 / 10 000 = 0.33 mA.'),
    num('s51q3','A 12-bit ADC with a 3.3 V reference reads 2048. What voltage is that?',1.65,'V','2048 / 4096 × 3.3 = 1.65 V.')
  ],
  recall:[ num('s51r1','What is the length of the vector (6, 8), in any units?',10,'','√(36 + 64) = 10.') ],
  plant:{title:'Why plant I/O is never wired straight to a chip',body:`<p>Field signals are 24 V and sit in a noisy world of motors and long cables. That is why I/O cards have opto-isolators and input filters, and why a hobby board wired directly to a 24 V sensor does not survive long. If you ever prototype on a microcontroller, put an isolating stage between the plant and the pin.</p>`}
},
{ id:52, wk:11, day:2, track:'EMB', title:'Interrupts and timers',
  kicker:'Let the hardware count, and let events interrupt the code only when they matter.',
  learn:`<p>A <b>timer</b> is a hardware counter that ticks from a divided clock. Its frequency and period follow from three numbers:</p>
<div class="eq">f<sub>out</sub> = f<sub>clk</sub> / (prescaler × N) &nbsp;&nbsp; tick = prescaler / f<sub>clk</sub></div>
<p>Count up to N, then overflow: that is a periodic <b>interrupt</b>. In PWM mode the output is high until the counter reaches the <b>compare</b> value: <span class="m">duty = compare / N</span>.</p>
<p>An <b>interrupt service routine</b> (ISR) pauses the main code when an event arrives (a timer overflow, a pulse edge, a received byte). Keep an ISR very short: set a flag, read the register, and return. Long work belongs in the main loop. Variables shared with an ISR must be marked <span class="m">volatile</span> and protected from half-updated reads.</p>
<p>CPU load is easy to estimate: <span class="m">load = ISR time × interrupt rate</span>. Encoders, UARTs and timers all compete for that time budget. Compare with a PLC: the scan cycle polls everything, but an interrupt reacts at once.</p>`,
  diagram:'timerwave',
  pins:['f_out = f_clk / (prescaler × N)','PWM duty = compare / N','Keep ISRs short; use volatile for shared flags','CPU load = ISR time × interrupt rate'],
  worked:{prompt:'A 16 MHz timer uses a prescaler of 64 and counts to 250. What are the tick time, the period and the interrupt frequency?',
    steps:['Tick: <span class="m">64 / 16×10⁶ = 4 µs</span>','Period: <span class="m">250 × 4 µs = 1 ms</span>','Frequency: <span class="m">1 / 1 ms = 1000 Hz</span>'],
    answer:'The interrupt fires every 1 ms, which is a convenient system tick.'},
  tryit:[
    num('s52q1','A 16 MHz clock goes through a prescaler of 8 and the counter counts to 2000. What is the output frequency, in Hz?',1000,'Hz','16×10⁶ / (8 × 2000) = 1000 Hz.'),
    num('s52q2','An 8-bit PWM counter runs 0 to 255 (256 counts). What compare value gives 25% duty?',64,'','0.25 × 256 = 64.'),
    num('s52q3','An ISR takes 50 µs and fires 1000 times per second. What fraction of the CPU does it use, in percent?',5,'%','50 µs × 1000 = 0.05 s per second = 5%.')
  ],
  recall:[ num('s52r1','An encoder has 2000 PPR and counts all edges (×4). How many counts per revolution?',8000,'','2000 × 4 = 8000.') ],
  plant:{title:'Where you meet interrupts on the plant',body:`<p>High-speed counter inputs on a PLC, a drive reading an encoder, and a safety relay timing a stop all rely on hardware timers and interrupts, not the normal scan. When a PLC misses fast pulses, the answer is to move them to a high-speed counter or an interrupt OB.</p>`}
},
{ id:53, wk:11, day:3, track:'EMB', title:'Serial comms: UART, I²C and SPI',
  kicker:'Three ways of getting bytes between chips, and how long each really takes.',
  learn:`<p><b>UART</b> (asynchronous serial) sends bytes with no shared clock, so both ends must agree on the <b>baud rate</b>. The common frame is 8N1: one start bit, 8 data bits (least significant first), no parity, one stop bit. That is <b>10 bits per byte</b>, so the byte rate is baud ÷ 10. RS-232 and RS-485 are electrical levels carrying UART data.</p>
<p><b>I²C</b> uses two wires, SDA and SCL, shared by many devices with 7-bit addresses. A master clocks every transfer: each byte takes 9 clocks (8 data plus an ACK), and typical speeds are 100 kHz and 400 kHz. It is slow but needs only two pins.</p>
<p><b>SPI</b> uses four wires (clock, MOSI, MISO, chip-select), is fast (several MHz) and full duplex, and needs one chip-select per device.</p>
<p>The common faults are all mismatches: wrong baud rate or parity (garbled text), swapped TX/RX, no common ground, or two I²C devices with the same address. An oscilloscope or logic analyser shows the truth in seconds.</p>`,
  diagram:'uartframe',
  pins:['UART 8N1 = 10 bits per byte; bytes/s = baud / 10','I²C: 2 wires, 9 clocks per byte, addressed devices','SPI: 4 wires, fast, one chip-select per device','Check baud, parity, TX/RX swap and common ground'],
  worked:{prompt:'A 20-byte message is sent at 115 200 baud, 8N1. How long does it take?',
    steps:['Bits: <span class="m">20 × 10 = 200 bits</span>','Time: <span class="m">200 / 115 200 = 1.74 ms</span>'],
    answer:'About 1.74 ms. At 9600 baud the same message takes 20.8 ms, twelve times longer.'},
  tryit:[
    num('s53q1','A 48-byte message is sent at 9600 baud, 8N1. How long does it take, in ms?',50,'ms','48 × 10 / 9600 = 0.05 s = 50 ms.'),
    num('s53q2','An I²C master at 400 kHz sends an address byte and two data bytes (9 clocks each). How long do these 27 clock periods take, in µs?',67.5,'µs','27 / 400 000 = 67.5 µs.'),
    num('s53q3','An SPI bus at 8 MHz sends a 16-bit word. How long does it take, in µs?',2,'µs','16 / 8 000 000 = 2 µs.')
  ],
  recall:[ num('s53r1','A 5 V pin drives an LED with Vf = 2 V at 20 mA. What series resistor is needed, in ohms?',150,'Ω','(5 − 2) / 0.020 = 150 Ω.') ],
  plant:{title:'Garbled text on the plant',body:`<p>When a serial device returns nonsense, the usual fix is a matching baud rate, data bits and parity (8N1, 7E1, and so on) on both ends. It happens often when a new meter or scale is added to a PLC. Check the label or manual first, then the settings, then the wiring.</p>`}
},
{ id:54, wk:11, day:4, track:'PLC', title:'Industrial networks and fieldbus',
  kicker:'Modbus, Profibus and Profinet: how the plant talks to itself.',
  learn:`<p>A <b>fieldbus</b> replaces one wire per signal with a shared cable carrying many. The big families are Modbus (RTU over RS-485, or TCP over Ethernet), Profibus (RS-485) and Profinet or EtherNet/IP (industrial Ethernet).</p>
<p><b>Modbus RTU</b> is the one you will meet most. A master asks, a slave answers. A frame is: <b>address (1 byte), function (1), data, CRC (2)</b>. A request to read holding registers (function 03) is 8 bytes. The reply with N registers is <span class="m">5 + 2N</span> bytes.</p>
<div class="eq">time = bytes × bits per char / baud</div>
<p>Bits per char: 10 for 8N1, 11 for 8E1 (parity bit). Add a short silent gap between frames, and a turnaround time for the slave.</p>
<p><b>RS-485</b> is a two-wire differential pair in a <b>daisy chain</b> (not a star), with a <b>120 Ω termination resistor at each end</b> and up to 32 unit loads per segment. Faults are usually in this physical layer: missing termination, a star wiring, swapped A and B, or a missing common reference.</p>
<p>Industrial Ethernet is faster and star-wired through switches, but the same ideas apply: unique addresses, matching settings, and the cabling checked first.</p>`,
  diagram:'rs485',
  pins:['Modbus frame: address, function, data, CRC (2 bytes)','Read N registers reply: 5 + 2N bytes','time = bytes × bits per char / baud','RS-485: daisy chain, 120 Ω at both ends'],
  worked:{prompt:'A master reads 10 holding registers over Modbus RTU at 19 200 baud, 8E1 (11 bits per char). How long do request plus reply take on the wire?',
    steps:['Request: <span class="m">8 bytes</span>','Reply: <span class="m">5 + 2 × 10 = 25 bytes</span>','Total: <span class="m">33 bytes × 11 bits = 363 bits</span>','Time: <span class="m">363 / 19 200 = 18.9 ms</span>'],
    answer:'About 19 ms on the wire, plus the slave\'s processing time and frame gaps. Polling 10 slaves therefore takes roughly 0.2 s.'},
  tryit:[
    num('s54q1','How many bytes are in the reply to a Modbus read of 4 holding registers?',13,'','5 + 2 × 4 = 13 bytes.'),
    num('s54q2','An 8-byte Modbus request is sent at 9600 baud, 8N1. How long does it take, in ms?',8.33,'ms','8 × 10 / 9600 = 8.33 ms.'),
    mcq('s54q3','Where should the 120 Ω termination resistors on an RS-485 bus be fitted?',['At both ends of the cable','At every device','Only at the master','Only at the last slave'],0,'Terminate the two physical ends of the line, never the middle nodes.')
  ],
  recall:[ num('s54r1','A 20-byte message is sent at 19 200 baud, 8N1. How long does it take, in ms?',10.4,'ms','200 / 19 200 = 10.4 ms.') ],
  plant:{title:'Reading a network fault',body:`<p>When one device drops off a Modbus or Profibus line, look at its address, then its cable and termination, then the master's diagnostics. A whole segment going down at once usually means a broken trunk, a shorted connector or a missing terminator. Intermittent faults love a loose screw terminal.</p>`}
},
{ id:55, wk:11, day:5, track:'REV', title:'Week 11 review: a transmitter to the screen',
  kicker:'A 4-20 mA signal, an ADC, and a serial link on one measurement.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>GPIO</h4><p>R = (V − Vf)/I. Pull-ups for inputs. Pins give ~10 to 20 mA. Isolate 24 V.</p></div>
<div class="cheat"><h4>Timers</h4><p>f = fclk/(prescaler × N). Duty = compare/N. Load = ISR time × rate.</p></div>
<div class="cheat"><h4>Serial</h4><p>8N1 = 10 bits per byte. I²C 9 clocks per byte. SPI fast, 4 wires.</p></div>
<div class="cheat"><h4>Fieldbus</h4><p>Modbus: reply = 5 + 2N bytes. RS-485: daisy chain, 120 Ω both ends.</p></div>
</div>`,
  pins:['The chain: transmitter current, shunt voltage, ADC counts, scaled value, then the bus.'],
  worked:{prompt:'A 4 to 20 mA transmitter feeds a 100 Ω shunt read by a 12-bit ADC with a 3.3 V reference. At 12 mA, find the voltage, the count and the percentage of range.',
    steps:['Voltage: <span class="m">12 mA × 100 Ω = 1.2 V</span>','Counts: <span class="m">1.2 / 3.3 × 4096 = 1489</span>','Percent of the 4 to 20 mA span: <span class="m">(12 − 4) / 16 = 50%</span>'],
    answer:'1.2 V, about 1489 counts, 50% of range. The firmware subtracts the 4 mA offset (0.4 V, 497 counts) before scaling.'},
  tryit:[
    num('s55q1','What voltage does a 20 mA signal develop across a 100 Ω shunt?',2,'V','20 mA × 100 Ω = 2.0 V.'),
    num('s55q2','What ADC count does that 2.0 V give on a 12-bit, 3.3 V reference converter?',2482,'','2.0 / 3.3 × 4096 = 2482.'),
    num('s55q3','A Modbus master reads 20 registers at 9600 baud, 8N1. How long does the reply (5 + 2 × 20 bytes) take, in ms?',46.9,'ms','45 bytes × 10 / 9600 = 46.9 ms.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>The last week is fault finding. Next time something on site trips or misbehaves, write down the symptom, what you checked and what finally cleared it. You will use those notes in the sessions.</p>`}
},

{ id:56, wk:12, day:1, track:'DRIVE', title:'Fault finding: a conveyor drive',
  kicker:'Symptom, isolate, measure, fix one thing, retest.',
  learn:`<p>Good fault finding is a method, not a feeling. Use the same loop every time:</p>
<ol><li><b>Symptom.</b> What exactly happens, when, and since when? What changed?</li><li><b>Isolate.</b> Split the system: is it <b>power</b> (supply, fuses, contactors), <b>control</b> (PLC, drive parameters, signals) or <b>mechanical</b> (gearbox, belt, bearings, jam)?</li><li><b>Measure,</b> do not guess: volts, amps, speed, temperature, fault codes.</li><li><b>Fix one thing,</b> then retest. Changing two things hides the cause.</li></ol>
<p>For a conveyor drive, the numbers tell the story:</p>
<ul><li><b>Current against nameplate:</b> load % = measured ÷ rated. Well above 100% means jam, overload or a short ramp.</li><li><b>Slip:</b> (ns − n) / ns. A healthy motor runs at 2 to 5%. Much more points to overload or a supply problem.</li><li><b>Voltage unbalance:</b> max deviation from the average ÷ the average. Over about 2% on a three-phase supply overheats the motor.</li><li><b>Fault timing:</b> an overcurrent trip <i>during acceleration</i> points at ramp or inertia; <i>at steady speed</i> points at load.</li></ul>
<p>Always isolate and lock out before touching the mechanics.</p>`,
  diagram:'faultflow',
  pins:['Symptom, isolate, measure, fix one, retest','Split into power, control and mechanical','Load % = measured / rated current; healthy slip 2 to 5%','Voltage unbalance = max deviation / average','Lock out before touching'],
  worked:{prompt:'A conveyor on a 4-pole motor at 30 Hz from a VSD should run near 870 rpm, but it measures 810 rpm and the drive shows 128% of rated current. What does that tell you?',
    steps:['Synchronous speed: <span class="m">120 × 30 / 4 = 900 rpm</span>','Slip: <span class="m">(900 − 810) / 900 = 10%</span>, against the normal 3 to 4%','Current 128% of rated agrees: the motor is working far too hard'],
    answer:'The motor is overloaded. Suspect a jam, a seized roller or gearbox, or belt tension, before touching drive parameters.'},
  tryit:[
    num('s56q1','Line voltages read 400 V, 392 V and 408 V. What is the voltage unbalance, in percent?',2,'%','Average 400 V, maximum deviation 8 V: 8/400 = 2%.'),
    num('s56q2','A motor draws 18 A and is rated at 14 A. What load is that, in percent of rated current?',128.6,'%','18 / 14 = 1.286, so 128.6%.'),
    mcq('s56q3','A drive trips on overcurrent only while accelerating, and runs fine at steady speed. What is the most likely cause?',['Acceleration ramp too short for the load inertia','A short between a motor winding and earth','Loss of one input phase','A bad encoder cable'],0,'A trip only on acceleration points at ramp time against inertia. A winding short would trip immediately and at any speed.')
  ],
  recall:[ num('s56r1','A 4-pole motor on 50 Hz runs at 1455 rpm. What is the slip, in percent?',3,'%','(1500 − 1455)/1500 = 3%.') ],
  plant:{title:'The conveyor that keeps tripping',body:`<p>Ask what changed, then split the problem in three. Check the drive fault history and the current trend first, because they cost nothing. Then walk the line: a seized idler roller or a belt rubbing on a frame can quietly add load for weeks until the day it crosses the trip point.</p>`}
},
{ id:57, wk:12, day:2, track:'DRIVE', title:'Fault finding: a hydraulic circuit',
  kicker:'Pressure tells you about load, flow tells you about speed, and heat tells you about waste.',
  learn:`<p>On a hydraulic circuit, read the symptom against the three quantities from week 9:</p>
<ul><li><b>Slow cylinder, normal pressure:</b> low flow. Suspect a worn pump, a blocked filter or suction line, or flow escaping somewhere.</li><li><b>Cannot build pressure:</b> a leak path, such as a stuck-open relief valve or a worn pump or cylinder seal.</li><li><b>Cylinder drifts under load:</b> an internal leak in the cylinder or a leaking holding valve.</li><li><b>Hot oil:</b> energy is being wasted, often flow dumped over a relief valve. The heat is <span class="m">P = Δp × Q</span>.</li></ul>
<p>Compare what you <b>should</b> get with what you measure. Actual flow into a cylinder is <span class="m">Q = A × v</span>. Divide by the pump's rated flow to estimate the <b>volumetric efficiency</b>. Overall efficiency is hydraulic power out ÷ shaft power in.</p>
<p>Method: read the pressure at the pump, then at the actuator, then at the tank return. Where the pressure disappears is where the fault lives. Keep the oil clean, cool and the right level: most hydraulic faults start with contamination.</p>
<p>Safety first: pressurised oil can penetrate skin. Depressurise, lock out and relieve trapped pressure before opening anything.</p>`,
  diagram:'faultflow', sim:'hydcyl',
  pins:['Slow with normal pressure: low flow','No pressure: a leak path','Heat = Δp × Q over a relief valve','Q = A × v; efficiency = actual / theoretical','Depressurise and lock out before opening'],
  worked:{prompt:'A pump supplies 60 L/min to a 100 mm bore cylinder, which extends at only 0.10 m/s. How much flow is reaching the cylinder, and where did the rest go?',
    steps:['Area: <span class="m">π/4 × 0.1² = 7.854×10⁻³ m²</span>','Flow used: <span class="m">Q = 7.854×10⁻³ × 0.10 = 7.85×10⁻⁴ m³/s = 47.1 L/min</span>','Missing: <span class="m">60 − 47.1 = 12.9 L/min</span>, about 21%'],
    answer:'Nearly a fifth of the flow is lost. It is probably going over the relief valve, or leaking internally past a worn pump or seal. Check oil temperature: a hot tank supports this.'},
  tryit:[
    num('s57q1','A pump is rated at 60 L/min but delivers 54 L/min. What is its volumetric efficiency, in percent?',90,'%','54 / 60 = 90%.'),
    num('s57q2','A relief valve set at 180 bar passes 10 L/min back to tank. What power is turned into heat, in kW?',3,'kW','Δp × Q = 18×10⁶ × (10/60 000) = 3000 W = 3 kW.'),
    num('s57q3','A 22 kW motor drives a pump that delivers 16 kW of hydraulic power. What is the overall efficiency, in percent?',72.7,'%','16 / 22 = 0.727, so 72.7%.')
  ],
  recall:[ num('s57r1','A cylinder has a 50 mm bore and is supplied at 160 bar. What force does it develop, in kN?',31.4,'kN','A = π/4 × 0.05² = 1.9635×10⁻³ m². F = 16×10⁶ × 1.9635×10⁻³ = 31.4 kN.') ],
  plant:{title:'The slow cylinder',body:`<p>Before blaming the pump, put a gauge at the cylinder port and check the oil temperature. If the oil is hot and the pump flow is fine, the energy is leaking somewhere you can feel with a thermometer: a hot relief valve body is the classic tell. If the oil is cold and the pressure is normal, look for a blockage upstream of the actuator.</p>`}
},
{ id:58, wk:12, day:3, track:'CTRL', title:'Fault finding: an oscillating loop',
  kicker:'Is it the tuning, the valve, or the sensor? The shape of the cycle tells you.',
  learn:`<p>A control loop that cycles has three usual causes, and the shape of the trace separates them:</p>
<ul><li><b>Gain too high.</b> A smooth <b>sinusoidal</b> cycle that grows or holds. The cure is lower Kp (or a longer Ti). If the cycle holds at constant amplitude, the loop sits at the ultimate gain Ku and the period is Tu, exactly the Ziegler-Nichols test.</li><li><b>Valve stiction.</b> The valve sticks, then jumps. The output is a <b>sawtooth</b> and the process variable a squarish wave. Integral action keeps winding until the valve breaks free. Tuning will not cure this; the valve needs maintenance.</li><li><b>External disturbance.</b> Another loop or a cycling upstream process. The cycle keeps the same period when you change your gains.</li></ul>
<p>Measure first. The period is <span class="m">T = time / number of cycles</span> and the frequency is <span class="m">f = 1 / T</span>. A simple test: put the loop in manual. If the cycling stops, the loop is the cause. If it continues, the disturbance is elsewhere.</p>
<p>When the fix is gain, back off Kp by 30 to 50% from the oscillating value, and retest with a small setpoint step, one change at a time.</p>`,
  diagram:'stepresp',
  pins:['Sinusoidal cycle: gain too high','Sawtooth with a flat-topped PV: stiction','Test: put it in manual; if the cycle stays, look upstream','Period T = time / cycles; f = 1 / T','Back Kp off 30 to 50%'],
  worked:{prompt:'A level loop with Kp = 5 cycles steadily with a 20 s period. Use Ziegler-Nichols PI settings from this, and say what the test showed.',
    steps:['Steady oscillation means Kp is at the ultimate gain: <span class="m">Ku = 5</span>, <span class="m">Tu = 20 s</span>','PI: <span class="m">Kp = 0.45 × 5 = 2.25</span>','<span class="m">Ti = Tu / 1.2 = 16.7 s</span>'],
    answer:'Set Kp = 2.25 and Ti = 16.7 s as a starting point (then trim down if overshoot is too large). The loop was simply running at its stability limit.'},
  tryit:[
    num('s58q1','A loop completes 8 cycles in 96 s. What is the period, in seconds?',12,'s','96 / 8 = 12 s.'),
    num('s58q2','For that 12 s period, what is the cycle frequency, in Hz?',0.0833,'Hz','1 / 12 = 0.0833 Hz.'),
    num('s58q3','A loop oscillates with Kp = 5. You decide to cut it by 30%. What is the new Kp?',3.5,'','5 × 0.7 = 3.5.')
  ],
  recall:[ num('s58r1','With Ku = 5, what Kp does Ziegler-Nichols give for a PID controller?',3,'','0.6 × 5 = 3.') ],
  plant:{title:'Tuning will not fix a sticking valve',body:`<p>If the output ramps and the valve does nothing, then the PV jumps, you are watching stiction. Another giveaway: the cycle persists at any gain you try. Ask for a valve stroke test and a look at the packing, positioner and air supply. Cycling that stops in manual is the loop's own problem.</p>`}
},
{ id:59, wk:12, day:4, track:'KIN', title:'Fault finding: a robot cell',
  kicker:'Small angle errors become big position errors at the end of a long arm.',
  learn:`<p>When a robot misses a pick by a few millimetres, think in this order:</p>
<ol><li><b>Frames and tools:</b> a knocked fixture, a moved conveyor, or a wrong tool offset. Re-check the user and tool frames first.</li><li><b>Mechanical play:</b> backlash in gearboxes, loose couplings, worn bearings, a loose gripper.</li><li><b>Encoder or calibration:</b> a lost reference position, a battery that has gone flat (absolute encoders), or slipped mastering marks.</li><li><b>Process variation:</b> the part itself moving in its pallet.</li></ol>
<p>Angle errors scale with reach. For a small joint error Δθ (in radians) at radius r:</p>
<div class="eq">position error ≈ r × Δθ</div>
<p>So 0.2° at 0.7 m gives about 2.4 mm. The resolution of a joint is set by the encoder and the gearbox: <span class="m">360° / (counts per rev × gear ratio)</span>. A motor encoder behind a 100:1 gearbox gives a very fine joint resolution, so backlash, not the encoder, usually limits accuracy.</p>
<p>Safety: robots move without warning. Enter the cell only with the controller in a safe state and the proper permit, and keep to the zone rules.</p>`,
  diagram:'arm2r', sim:'arm',
  pins:['Check frames first, then play, then encoders','Position error ≈ r × Δθ','Joint resolution = 360° / (counts × ratio)','Tip speed = ω r','Enter the cell only with a safe state and permit'],
  worked:{prompt:'A robot reaches 0.7 m and one joint is out by 0.2°. How far is the tool off, in millimetres?',
    steps:['Convert: <span class="m">0.2° = 0.2 × π/180 = 3.49×10⁻³ rad</span>','<span class="m">error = 0.7 × 3.49×10⁻³ = 2.44×10⁻³ m</span>'],
    answer:'About 2.4 mm. If your gripper tolerance is ±2 mm, that single joint is enough to cause missed picks.'},
  tryit:[
    num('s59q1','A joint is out by 0.25° with the tool 0.8 m away. What is the tool error, in mm?',3.49,'mm','0.8 × 0.25 × π/180 = 3.49 mm.'),
    num('s59q2','A joint encoder has 4096 counts per rev behind a 100:1 gearbox. What is the joint resolution, in millidegrees?',0.879,'m°','360 / (4096 × 100) = 0.000879° = 0.879 millidegrees.'),
    num('s59q3','The tool is 1 m from a joint turning at 90°/s (1.571 rad/s). What is its speed, in m/s?',1.571,'m/s','v = ω r = 1.571 × 1 = 1.571 m/s.')
  ],
  recall:[ num('s59r1','A motor turns at 3000 rpm through a 50:1 gearbox. What is the output speed, in rpm?',60,'rpm','3000 / 50 = 60 rpm.') ],
  plant:{title:'Mastering and the flat battery',body:`<p>If a robot reports a position error alarm after being off for a while, a flat encoder backup battery is the first suspect. After replacement the arm usually needs its mastering (calibration) positions refreshed. Check the manual and do it with the permit in place, because getting it wrong moves every taught point.</p>`}
},
{ id:60, wk:12, day:5, track:'REV', title:'Final review and what next',
  kicker:'Twelve weeks in one machine, and where to go from here.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Maths and circuits</h4><p>V = IR, P = VI, dividers, RC and RL time constants, phasors, three-phase √3.</p></div>
<div class="cheat"><h4>Control</h4><p>ts ≈ 4τ, ζ and overshoot, poles left of the axis, PID, Z-N, loop gain and error.</p></div>
<div class="cheat"><h4>Drives and PLC</h4><p>ns = 120f/p, slip, V/f, F = P·A, scan = 2× delay, seal-in rung, S = K·T + C.</p></div>
<div class="cheat"><h4>Robots and embedded</h4><p>FK, IK, Jacobian, timers, 8N1 = 10 bits, Modbus 5 + 2N, RS-485 terminated both ends.</p></div>
</div>`,
  pins:['Fault finding is the skill that ties it all together: symptom, isolate, measure, fix one, retest.'],
  worked:{prompt:'A conveyor feeds a robot pick point. The 4-pole motor runs at 40 Hz with 3% slip through a 15:1 gearbox to a 0.35 m drum. The part must travel 0.9 m to the pick point. How long does it take?',
    steps:['<span class="m">ns = 120 × 40 / 4 = 1200 rpm</span>, shaft <span class="m">1200 × 0.97 = 1164 rpm</span>','Drum: <span class="m">1164 / 15 = 77.6 rpm</span>','Belt speed: <span class="m">77.6/60 × π × 0.35 = 1.422 m/s</span>','Time: <span class="m">0.9 / 1.422 = 0.633 s</span>'],
    answer:'0.63 s from sensor to pick point. The PLC and the robot controller must stay inside that budget, so check scan time and robot cycle together.'},
  tryit:[
    num('s60q1','A 4-pole motor at 50 Hz with 3% slip drives a 20:1 gearbox and a 0.4 m drum. What is the belt speed, in m/s?',1.524,'m/s','ns = 1500, n = 1455, drum = 72.75 rpm, v = 72.75/60 × π × 0.4 = 1.524 m/s.'),
    num('s60q2','A part travels 0.6 m at 1.2 m/s. How long does that take, in seconds?',0.5,'s','0.6 / 1.2 = 0.5 s.'),
    num('s60q3','A PLC scans in 12 ms (worst case two scans) and the valve takes 40 ms. How far does a part on a 1.2 m/s belt move in that time, in mm?',76.8,'mm','Delay 2 × 12 + 40 = 64 ms. Distance = 1.2 × 0.064 = 0.0768 m = 76.8 mm.')
  ],
  recall:[],
  plant:{title:'What next',body:`<p>You have covered the whole loop from a resistor to a robot cell. To keep it alive: redo the drill every week, choose one topic each month to go deeper on (tuning a real loop, wiring a drive, a small PLC program, a two-link arm in code), and keep a fault log of what you meet on site. The best refresher is the plant itself.</p>`}
}
);

/* ---------------- hints, watch-outs, formulas ---------------- */
const F=(n,f,note)=>({n,f,note:note||''});
const HINTS={
 s46q1:'Use (x, y) → (−y, x) for a 90° turn.',s46q2:'Same rule: new x is the old y with its sign flipped.',s46q3:'A rotation cannot change length. Use Pythagoras.',s46r1:'Worst case is about two scans.',
 s47q1:'cos 0 = 1 and cos 90° = 0.',s47q2:'Both links point at 90°, so the lengths simply add.',s47q3:'θ1 + θ2 is zero here. What is sin 0?',s47r1:'(x, y) → (−y, x).',
 s48q1:'cos θ2 = (r² − l1² − l2²) / (2 l1 l2). What is r²?',s48q2:'Fully stretched means the links line up.',s48q3:'atan2(0.866, 0.5) is the angle whose tangent is 1.732.',s48r1:'Both links straight up: add the lengths.',
 s49q1:'vx is the first row of J times q̇. With q̇2 = 0 only J11 matters.',s49q2:'det J = l1 l2 sin θ2.',s49q3:'v = ω r.',s49r1:'Add the two link lengths.',
 s50q1:'Use the law of cosines with r = 0.5.',s50q2:'Turns of the joint times the gear ratio.',s50q3:'Counts per motor rev, times the ratio, divided by 360.',
 s51q1:'R = (V − Vf) / I, with I in amps.',s51q2:'I = V / R.',s51q3:'counts / 4096 × Vref.',s51r1:'Pythagoras: 3-4-5 scaled by two.',
 s52q1:'f = fclk / (prescaler × N).',s52q2:'Duty × number of counts.',s52q3:'Multiply the ISR time by how often it runs.',s52r1:'PPR × 4.',
 s53q1:'10 bits per byte at 8N1.',s53q2:'Clock periods divided by clock frequency.',s53q3:'Bits divided by clock rate.',s53r1:'(5 − 2) / 0.02.',
 s54q1:'5 + 2N bytes.',s54q2:'Bytes × 10 / baud.',s54q3:'Terminate the physical ends of the cable.',s54r1:'20 bytes × 10 bits ÷ 19 200.',
 s55q1:'V = I R.',s55q2:'V / Vref × 4096.',s55q3:'5 + 2 × 20 bytes, then bits ÷ baud.',
 s56q1:'Average first, then the biggest difference from it.',s56q2:'Measured divided by rated.',s56q3:'Think about when the extra current is needed: while speeding up.',s56r1:'ns = 1500 for 4 poles on 50 Hz.',
 s57q1:'Actual divided by rated.',s57q2:'Pressure in Pa times flow in m³/s.',s57q3:'Output divided by input.',s57r1:'Area of a 50 mm circle, times pressure in Pa.',
 s58q1:'Total time divided by number of cycles.',s58q2:'1 / period.',s58q3:'Multiply by 0.7.',s58r1:'0.6 × Ku.',
 s59q1:'Radians first: degrees × π/180, then × radius.',s59q2:'360° divided by total counts per joint rev.',s59q3:'v = ω r with ω in rad/s.',s59r1:'Divide by the ratio.',
 s60q1:'ns, then slip, then gearbox, then circumference.',s60q2:'Time = distance / speed.',s60q3:'Total delay first, then distance = speed × time.'
};
const WATCH={
 46:['Rotating and translating in the wrong order.','Mixing degrees and radians in a calculator.'],
 47:['Forgetting link 2 points along θ1 + θ2, not θ2 alone.','Calculator in the wrong angle mode.'],
 48:['Using atan instead of atan2 and landing in the wrong quadrant.','Not checking the target is inside the reach limits.'],
 49:['Treating det J = 0 as only a maths curiosity. It is a real loss of motion.','Using degrees per second in v = ω r. It wants rad/s.'],
 50:['Using the wrong elbow solution when checking.','Forgetting the gear ratio when going from joint to motor.'],
 51:['Driving a relay or motor straight from a pin.','Connecting a 24 V signal to a 3.3 V input.'],
 52:['Long code inside an interrupt service routine.','Sharing a variable with an ISR without volatile.'],
 53:['Counting 8 bits per byte instead of 10 on the wire.','Swapped TX and RX, or no common ground.'],
 54:['Wiring RS-485 as a star instead of a daisy chain.','Terminating the middle devices instead of the two ends.'],
 55:['Forgetting the 4 mA live zero when scaling.','Using 5 V ranges on a 3.3 V ADC.'],
 56:['Changing two things at once, which hides the cause.','Resetting a drive fault without reading the code.'],
 57:['Opening a hydraulic line before relieving pressure.','Blaming the pump before checking the relief valve and filter.'],
 58:['Retuning a loop whose valve is simply sticking.','Changing Kp and Ti together.'],
 59:['Blaming motors when a frame or tool offset moved.','Entering a cell without a safe state and permit.'],
 60:['Trusting a speed readout without a hand check.','Leaving out the PLC or valve delay in a timing budget.']
};
const FORMULAS={
 46:[F('Frame change','p<sub>A</sub> = R(θ) p<sub>B</sub> + d'),F('Chain','T<sub>AC</sub> = T<sub>AB</sub> T<sub>BC</sub>')],
 47:[F('Tool x','l<sub>1</sub>cos θ<sub>1</sub> + l<sub>2</sub>cos(θ<sub>1</sub>+θ<sub>2</sub>)'),F('Tool y','l<sub>1</sub>sin θ<sub>1</sub> + l<sub>2</sub>sin(θ<sub>1</sub>+θ<sub>2</sub>)')],
 48:[F('Elbow','cos θ<sub>2</sub> = (x²+y²−l<sub>1</sub>²−l<sub>2</sub>²)/(2l<sub>1</sub>l<sub>2</sub>)'),F('Shoulder','θ<sub>1</sub> = atan2(y,x) − atan2(l<sub>2</sub>sin θ<sub>2</sub>, l<sub>1</sub>+l<sub>2</sub>cos θ<sub>2</sub>)')],
 49:[F('Velocity','v = J q̇'),F('Determinant','det J = l<sub>1</sub>l<sub>2</sub>sin θ<sub>2</sub>'),F('Torque','τ = Jᵀ F')],
 50:[F('Counts per joint degree','counts/rev × ratio / 360')],
 51:[F('LED resistor','R = (V − V<sub>f</sub>)/I'),F('ADC','counts = V/V<sub>ref</sub> × 2ⁿ')],
 52:[F('Timer','f = f<sub>clk</sub>/(prescaler × N)'),F('PWM duty','compare / N'),F('CPU load','ISR time × rate')],
 53:[F('UART time','bytes × 10 / baud'),F('I²C byte','9 clocks'),F('SPI time','bits / f<sub>clk</sub>')],
 54:[F('Modbus reply','5 + 2N bytes'),F('Frame time','bytes × bits per char / baud')],
 55:[F('Shunt','V = I R'),F('4-20 mA scale','(I − 4) / 16')],
 56:[F('Load','I / I<sub>rated</sub>'),F('Slip','(n<sub>s</sub>−n)/n<sub>s</sub>'),F('Unbalance','max deviation / average')],
 57:[F('Flow used','Q = A v'),F('Heat','P = Δp × Q'),F('Efficiency','out / in')],
 58:[F('Period','T = time / cycles'),F('Frequency','f = 1 / T'),F('Z-N PI','K<sub>p</sub> = 0.45K<sub>u</sub>, T<sub>i</sub> = T<sub>u</sub>/1.2')],
 59:[F('Tool error','r × Δθ (rad)'),F('Joint resolution','360° / (counts × ratio)')],
 60:[F('Belt speed','n<sub>drum</sub>/60 × πD'),F('Time','distance / speed')]
};
SESSIONS.forEach(s=>{ if(s.id<46) return;
  [...(s.tryit||[]),...(s.recall||[])].forEach(q=>{ if(HINTS[q.id]) q.hint=HINTS[q.id]; });
  if(WATCH[s.id]) s.watch=WATCH[s.id];
  if(FORMULAS[s.id]) s.formulas=FORMULAS[s.id];
});
if(window.RT.HINTS){Object.assign(window.RT.HINTS,HINTS);Object.assign(window.RT.WATCH,WATCH);Object.assign(window.RT.FORMULAS,FORMULAS);}
})();
