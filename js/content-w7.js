/* ============ RISE TIME : weeks 7 to 9 (control, drives, hydraulics, PLC) ============ */
(function(){
const {SESSIONS, DIAG, comp, wire, dot, gnd, txt, sch, term, num, mcq, f2, plotPath, arrowDefs} = window.RT;
const box=(x,y,w,h,t,cls='')=>`<rect class="boxn" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`+txt(x+w/2,y+h/2+4,t,'lab '+cls);
const arr=(x1,y1,x2,y2)=>`<path class="flow" d="M${x1},${y1} L${x2},${y2}" marker-end="url(#ah)"/>`;

DIAG.blockloop = function(){
  let b=arrowDefs;
  b+=term(20,70,'R(s)','start').replace('<text','<text style="display:none"')+txt(14,60,'R(s)','lab dim','start');
  b+=wire('24,70 70,70')+`<circle cx="86" cy="70" r="14"/>`+txt(86,74,'Σ','lab')+txt(70,56,'+','lab amber')+txt(96,98,'−','lab amber');
  b+=wire('100,70 150,70')+box(150,45,100,50,'C(s)','c1t')+wire('250,70 300,70')+box(300,45,100,50,'G(s)','c2t')+wire('400,70 470,70')+txt(440,56,'Y(s)','lab dim');
  b+=dot(440,70)+wire('440,70 440,140 86,140 86,84')+txt(262,158,'feedback H(s) = 1','lab dim');
  b+=txt(150,26,'controller','lab dim','start')+txt(300,26,'plant','lab dim','start');
  b+=txt(250,190,'Closed loop: Y/R = CG / (1 + CGH)','lab amber');
  return sch(500,205,b,'The feedback loop that every controller on the plant is built on');
};
DIAG.stepresp = function(){
  const X=t=>50+t*50, Y=v=>170-v*100;
  let b=`<line class="axis" x1="50" y1="170" x2="${X(8.6)}" y2="170"/><line class="axis" x1="50" y1="180" x2="50" y2="30"/>`;
  b+=`<line class="tick dash" x1="50" y1="${Y(1)}" x2="${X(8.4)}" y2="${Y(1)}"/>`;
  b+=`<path class="trace c1s" d="${plotPath(t=>1-Math.exp(-t/1.2),0,8.4,X,Y)}"/>`;
  const z=0.4,w=1.6,wd=w*Math.sqrt(1-z*z);
  b+=`<path class="trace c2s" d="${plotPath(t=>1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t)),0,8.4,X,Y,200)}"/>`;
  b+=txt(X(3.2),Y(0.8)+34,'first order: no overshoot','lab c1t','start')+txt(X(1.6),Y(1.22)-6,'second order, ζ = 0.4','lab c2t','start');
  b+=txt(X(1.2),186,'τ','lab amber')+`<line class="tick" x1="${X(1.2)}" y1="166" x2="${X(1.2)}" y2="174"/>`+txt(X(8.4),186,'time','lab dim','end');
  return sch(520,200,b,'First order creeps up; second order can overshoot and ring');
};
DIAG.pzmap = function(){
  let b='';
  b+=`<rect x="180" y="26" width="150" height="170" style="fill:rgba(255,191,71,.07);stroke:none"/>`;
  b+=`<line class="axis" x1="30" y1="110" x2="330" y2="110"/><line class="axis" x1="180" y1="26" x2="180" y2="196"/>`;
  const X=(x,y,c)=>`<path class="${c}" d="M${x-6},${y-6} L${x+6},${y+6} M${x-6},${y+6} L${x+6},${y-6}"/>`;
  b+=X(130,62,'c1s')+X(130,158,'c1s')+X(70,110,'c2s');
  b+=txt(120,58,'−1 ± 2j','lab c1t','end')+txt(70,132,'−4','lab c2t');
  b+=txt(100,40,'stable','lab c1t')+txt(255,40,'unstable','lab amber');
  b+=txt(334,106,'Re','lab dim','start')+txt(186,20,'Im','lab dim','start')+txt(180,214,'real part sets the decay rate','lab dim');
  b+=txt(370,70,'Left of the axis: stable','lab c1t','start')+txt(370,94,'Right of the axis: unstable','lab amber','start')+txt(370,128,'Farther left: faster decay','lab dim','start')+txt(370,150,'Higher up: more ringing','lab dim','start');
  return sch(660,225,b,'Where the poles sit decides how the system behaves');
};
DIAG.pidblocks = function(){
  let b=arrowDefs;
  const rows=[[18,'P   Kp · e : now','c1t'],[68,'I   Ki · ∫e dt : the past','c2t'],[118,'D   Kd · de/dt : the trend','c5t']];
  b+=txt(32,78,'e','lab dim')+wire('20,87 60,87')+wire('60,36 60,136');
  rows.forEach(r=>{const y=r[0]+18;b+=wire(`60,${y} 90,${y}`)+box(90,r[0],240,36,r[1],r[2])+wire(`330,${y} 360,${y}`);});
  b+=wire('360,36 360,136')+wire('360,87 380,87')+`<circle cx="394" cy="87" r="14"/>`+txt(394,91,'Σ','lab');
  b+=wire('408,87 440,87')+box(440,62,90,50,'Plant')+wire('530,87 590,87')+txt(560,76,'output','lab dim');
  return sch(610,172,b,'P looks at now, I at the past, D at where the error is heading');
};
DIAG.dcmotor = function(){
  const X=w=>60+w*0.6, Y=t=>170-t*60;
  let b=`<line class="axis" x1="60" y1="170" x2="${X(430)}" y2="170"/><line class="axis" x1="60" y1="180" x2="60" y2="40"/>`;
  b+=`<line class="trace c1s" x1="${X(0)}" y1="${Y(1.8)}" x2="${X(400)}" y2="170"/><line class="trace c2s" x1="${X(0)}" y1="${Y(0.9)}" x2="${X(200)}" y2="170"/>`;
  b+=txt(52,Y(1.8)+4,'1.8','lab dim','end')+txt(52,Y(0.9)+4,'0.9','lab dim','end');
  b+=txt(X(200),186,'200','lab dim')+txt(X(400),186,'400','lab dim');
  b+=txt(X(0)+60,Y(1.8)-4,'24 V','lab c1t','start')+txt(X(0)+16,Y(0.9)-6,'12 V','lab c2t','start');
  b+=txt(60,30,'torque (N·m)','lab dim','start')+txt(X(430),204,'speed (rad/s)','lab dim','end');
  b+=txt(350,86,'Straight lines.','lab dim','start')+txt(350,108,'Voltage moves the line.','lab amber','start')+txt(350,130,'Stall torque = Kt·V/R','lab dim','start');
  return sch(560,215,b,'DC motor torque-speed lines: voltage sets how far out the line reaches');
};
DIAG.vsd = function(){
  const X=f=>50+f*5, Y=v=>170-v*0.33;
  let b=`<line class="axis" x1="50" y1="170" x2="${X(70)}" y2="170"/><line class="axis" x1="50" y1="180" x2="50" y2="30"/>`;
  b+=`<path class="trace c1s" d="M${X(0)},${Y(0)} L${X(50)},${Y(400)} L${X(70)},${Y(400)}"/>`;
  b+=`<line class="tick dash" x1="${X(50)}" y1="${Y(400)}" x2="${X(50)}" y2="170"/>`+txt(X(50),186,'50 Hz','lab amber')+txt(44,Y(400)+4,'400 V','lab dim','end');
  b+=txt(X(14),Y(110),'V/f constant:','lab c1t','start')+txt(X(14),Y(110)+18,'flux stays steady','lab c1t','start');
  b+=txt(X(52),Y(400)+24,'above 50 Hz the voltage','lab dim','start')+txt(X(52),Y(400)+42,'is capped and torque falls','lab dim','start');
  b+=txt(X(70),186,'f (Hz)','lab dim','end');
  return sch(600,200,b,'A drive scales voltage with frequency so the motor keeps its torque');
};
DIAG.cylinder = function(){
  let b=arrowDefs;
  b+=`<rect class="boxn" x="130" y="60" width="200" height="70"/><line x1="230" y1="60" x2="230" y2="130"/><line x1="230" y1="95" x2="440" y2="95"/>`;
  b+=txt(180,99,'A','lab c1t')+txt(230,50,'bore D','lab dim')+txt(385,86,'rod','lab dim');
  b+=wire('160,60 160,34')+txt(160,26,'P port','lab amber')+wire('300,130 300,154')+txt(300,168,'tank','lab dim');
  b+=arr(445,95,505,95)+txt(475,84,'F = P · A','lab amber');
  b+=txt(260,194,'Force = pressure × area      Speed = flow ÷ area','lab c2t');
  return sch(520,208,b,'A cylinder turns pressure into force and flow into speed');
};
DIAG.scancycle = function(){
  let b=arrowDefs;
  const steps=[['Read inputs','copy to image'],['Run program','top to bottom'],['Write outputs','from image'],['Housekeeping','comms, diag.']];
  steps.forEach((s,i)=>{const x=15+i*140; b+=txt(x+59,46,String(i+1),'lab dim')+box(x,54,118,52,s[0],i===1?'amber':'')+txt(x+59,124,s[1],'lab dim')+(i<3?arr(x+120,80,x+138,80):'');});
  b+=`<path class="hop" d="M494,134 L494,176 L74,176 L74,136" marker-end="url(#ah)"/>`+txt(284,166,'repeat every 5 to 50 ms','lab amber');
  b+=txt(284,22,'Inputs are frozen at the start of the scan','lab c1t');
  return sch(570,195,b,'The PLC scan cycle: the loop everything else rests on');
};
DIAG.ladder = function(){
  let b='';
  b+=`<line x1="40" y1="30" x2="40" y2="140"/><line x1="480" y1="30" x2="480" y2="140"/>`;
  const no=(x,y,l)=>`<line x1="${x-14}" y1="${y-12}" x2="${x-14}" y2="${y+12}"/><line x1="${x+14}" y1="${y-12}" x2="${x+14}" y2="${y+12}"/>`+txt(x,y-18,l,'lab dim');
  const nc=(x,y,l)=>no(x,y,l)+`<line x1="${x-18}" y1="${y+10}" x2="${x+18}" y2="${y-10}"/>`;
  b+=wire('40,70 110,70')+no(124,70,'START')+wire('138,70 200,70')+nc(214,70,'STOP')+wire('228,70 300,70')+nc(314,70,'FAULT')+wire('328,70 420,70')+`<circle cx="434" cy="70" r="14"/>`+txt(434,46,'MOTOR','lab c1t')+wire('448,70 480,70');
  b+=wire('90,70 90,115 110,115')+no(124,115,'MOTOR')+wire('138,115 170,115 170,70');
  b+=txt(200,119,'seal-in contact keeps it running','lab amber','start');
  b+=txt(260,164,'Press START and the motor latches.','lab dim')+txt(260,184,'STOP or a fault breaks the rung.','lab dim');
  return sch(520,200,b,'The start-stop seal-in rung every PLC programmer writes first');
};

SESSIONS.push(
{ id:31, wk:7, day:1, track:'MATH', title:'The Laplace transform',
  kicker:'Turn calculus into algebra, so a differential equation becomes a fraction you can read.',
  learn:`<p>Differential equations describe real systems, but solving them is slow. The <b>Laplace transform</b> trades time <i>t</i> for a complex variable <i>s</i>. Calculus becomes algebra, and the answer turns back into a time response.</p>
<div class="eq">F(s) = ∫₀^∞ f(t) e<sup>−st</sup> dt</div>
<p>You almost never integrate. You use a short table:</p>
<div class="eq">1 → 1/s &nbsp;&nbsp; t → 1/s² &nbsp;&nbsp; e<sup>−at</sup> → 1/(s + a) &nbsp;&nbsp; sin ωt → ω/(s² + ω²)</div>
<p>The key property: <b>differentiation becomes multiplication by s</b> (with zero starting conditions), and integration becomes division by s. So <span class="m">τ dy/dt + y = u</span> becomes <span class="m">(τs + 1) Y(s) = U(s)</span>, and the ratio <span class="m">Y/U = 1/(τs + 1)</span> is the <b>transfer function</b>.</p>
<p>Two handy shortcuts: the <b>final value theorem</b> gives where a response settles, <span class="m">y(∞) = lim s→0 of s·Y(s)</span>, without solving for the whole curve, and the <b>initial value theorem</b> does the same for t = 0.</p>`,
  diagram:'stepresp', sim:'rc',
  pins:['Table: 1 → 1/s, e^(−at) → 1/(s+a)','d/dt becomes × s, ∫ becomes ÷ s','Transfer function = output ÷ input in s','Final value: y(∞) = lim s·Y(s) as s → 0'],
  worked:{prompt:'An RC stage obeys τ dy/dt + y = u with τ = 0.2 s. It is hit with a 5 V step. Find y(t) and its value at t = 0.2 s.',
    steps:['Transform: <span class="m">(0.2 s + 1) Y(s) = 5/s</span>','So <span class="m">Y(s) = 5 / (s (0.2 s + 1)) = 25 / (s (s + 5))</span>','Split into fractions: <span class="m">Y(s) = 5/s − 5/(s + 5)</span>','Back to time: <span class="m">y(t) = 5 (1 − e<sup>−5t</sup>)</span>','At t = 0.2 s: <span class="m">5 (1 − e<sup>−1</sup>) = 3.16 V</span>'],
    answer:'3.16 V, the familiar 63% of the step. The Laplace route gave the same curve we found in week 3, with far less effort.'},
  tryit:[
    num('s31q1','What is the Laplace transform of e^(−3t), evaluated at s = 2?',0.2,'','1/(s + a) = 1/(2 + 3) = 0.2.'),
    num('s31q2','Y(s) = 10 / (s (s + 5)). What does y(t) settle to?',2,'','Final value theorem: s·Y(s) = 10/(s + 5), at s = 0 that is 10/5 = 2.'),
    mcq('s31q3','What does differentiation in time become in the s-domain (zero initial conditions)?',['Multiplication by s','Division by s','Addition of s','Nothing, it is unchanged'],0,'d/dt ↔ ×s. That is why differential equations become polynomials in s.')
  ],
  recall:[ num('s31r1','A 48 V supply is PWM switched at 25% duty. What is the average voltage?',12,'V','Vavg = 0.25 × 48 = 12 V.') ],
  plant:{title:'Why every control engineer reads in s',body:`<p>Vendor datasheets, tuning guides and drive manuals describe plants as G(s) = K/(τs + 1) or similar. You rarely do the transform yourself; you read the denominator. A (τs + 1) is a first-order lag with time constant τ. An s² term means a second-order system that can ring.</p><p>When a level or temperature loop is "slow", you are looking at a large τ in exactly this form.</p>`}
},
{ id:32, wk:7, day:2, track:'CTRL', title:'Transfer functions and block diagrams',
  kicker:'Draw the loop, write the maths, and see why feedback speeds things up and trades away gain.',
  learn:`<p>A <b>transfer function</b> G(s) is output ÷ input. For a first-order plant, <span class="m">G(s) = K/(τs + 1)</span>: <b>K</b> is the steady-state gain (output per unit input once it settles) and <b>τ</b> sets the speed.</p>
<p>A <b>block diagram</b> chains blocks with arrows. The rules are short:</p>
<div class="eq">Series: G₁G₂ &nbsp;&nbsp; Parallel: G₁ + G₂ &nbsp;&nbsp; Feedback: G / (1 + GH)</div>
<p>In a closed loop with a controller C and plant G, the response to the setpoint is <span class="m">T = CG / (1 + CG)</span>. The product <b>CG</b> is the <b>loop gain</b>. When it is large, T is close to 1 and the output follows the setpoint.</p>
<p>Feedback has a side effect worth knowing. For a first-order plant under proportional control, the loop is again first-order, but with a <b>smaller time constant</b> and a DC gain slightly under 1. You get speed, at the price of a small <b>steady-state error</b> that integral action will later remove.</p>`,
  diagram:'blockloop', sim:'pid',
  pins:['G(s) = K/(τs + 1): K is DC gain, τ is speed','Series multiply, parallel add','Feedback: T = G / (1 + GH)','Loop gain CG large → output tracks the setpoint'],
  worked:{prompt:'A plant G(s) = 20/(s + 4) is controlled with unity feedback and no controller. Find the closed-loop transfer function, DC gain and pole.',
    steps:['<span class="m">T = G/(1 + G) = [20/(s + 4)] / [1 + 20/(s + 4)]</span>','Multiply through by (s + 4): <span class="m">T = 20 / (s + 4 + 20) = 20 / (s + 24)</span>','DC gain: <span class="m">20/24 = 0.833</span>','Pole at s = −24, so τ = 1/24 = 0.042 s. The open loop pole was −4 (τ = 0.25 s).'],
    answer:'Feedback made the system six times faster but left an error of about 17%. Gain for speed, error for the price.'},
  tryit:[
    num('s32q1','Two blocks, G₁ = 2 and G₂ = 5, are in series. What is the overall gain?',10,'','Series blocks multiply: 2 × 5 = 10.'),
    num('s32q2','Unity feedback is closed around a plant with constant gain 4. What is the closed-loop gain?',0.8,'','T = G/(1 + G) = 4/5 = 0.8.'),
    num('s32q3','A plant G(s) = 3/(τs + 1) gets a 2 V step. What does the output settle to?',6,'V','DC gain is 3, so 3 × 2 = 6 V.')
  ],
  recall:[ num('s32r1','A Pt100 element reads what resistance at 100 °C, in ohms?',138.5,'Ω','R = 100(1 + 0.39083 − 0.005775) = 138.5 Ω.') ],
  plant:{title:'Reading the loop on a P&ID',body:`<p>Every PID controller faceplate maps onto this diagram: setpoint (R), process variable (the fed-back Y), the error summing point, the controller block and the plant. When someone says "the loop gain is too high", they mean the product of controller and plant gain: ringing and instability follow.</p>`}
},
{ id:33, wk:7, day:3, track:'CTRL', title:'First and second order responses',
  kicker:'Two shapes cover most of what plants do: a smooth climb, or a climb that overshoots and rings.',
  learn:`<p><b>First order</b> responses climb smoothly with time constant τ. You already know the numbers: 63% at τ, rise time about 2.2τ, and <b>settling to 2% at about 4τ</b>.</p>
<p><b>Second order</b> systems have a natural frequency <b>ωn</b> and a damping ratio <b>ζ</b>. Their character depends on ζ:</p>
<div class="eq">ζ &gt; 1 overdamped &nbsp; ζ = 1 critical &nbsp; ζ &lt; 1 underdamped (overshoot)</div>
<p>For an underdamped step response:</p>
<div class="eq">%OS = 100 e<sup>−πζ/√(1 − ζ²)</sup> &nbsp;&nbsp; t<sub>p</sub> = π / (ω<sub>n</sub>√(1 − ζ²)) &nbsp;&nbsp; t<sub>s</sub> ≈ 4 / (ζ ω<sub>n</sub>)</div>
<p>Rules of thumb: ζ = 0.7 gives about 5% overshoot and a good compromise; ζ = 0.5 about 16%; ζ = 0.2 rings for a long time. A valve with a stiff spring and a heavy load, a pendulum, a motor with a flexible coupling: all second order.</p>`,
  diagram:'stepresp', sim:'rc',
  pins:['First order: ts ≈ 4τ (2%), tr ≈ 2.2τ','ζ < 1 overshoots; ζ = 0.7 is a good design target','%OS = 100 exp(−πζ/√(1−ζ²))','ts ≈ 4/(ζ ωn)'],
  worked:{prompt:'A second-order position loop has ωn = 10 rad/s and ζ = 0.4. Find the overshoot, peak time and settling time.',
    steps:['<span class="m">√(1 − 0.16) = 0.9165</span>','Overshoot: <span class="m">100 e<sup>−π × 0.4 / 0.9165</sup> = 100 e<sup>−1.371</sup> = 25.4%</span>','Peak time: <span class="m">π / (10 × 0.9165) = 0.343 s</span>','Settling: <span class="m">4 / (0.4 × 10) = 1.0 s</span>'],
    answer:'25% overshoot, peaking at 0.34 s and settling in about 1 s. Raise the damping to cut the overshoot.'},
  tryit:[
    num('s33q1','A first-order system has τ = 0.5 s. What is its approximate 2% settling time?',2,'s','ts ≈ 4τ = 2 s.'),
    num('s33q2','What is the percent overshoot of a second-order system with ζ = 0.5?',16.3,'%','100 e^(−π × 0.5 / 0.866) = 16.3%.'),
    num('s33q3','A second-order system has ωn = 20 rad/s and ζ = 0.25. What is its approximate settling time?',0.8,'s','ts ≈ 4/(ζωn) = 4/5 = 0.8 s.')
  ],
  recall:[ num('s33r1','A coil has L = 0.5 H and R = 20 Ω. What is its time constant, in milliseconds?',25,'ms','τ = L/R = 0.5/20 = 0.025 s = 25 ms.') ],
  plant:{title:'Why a stiff valve overshoots',body:`<p>A positioner driving a heavy valve is a mass on a spring with friction. Too little friction (damping) and the valve overshoots and hunts around the target. Many positioner datasheets list damping or "speed" settings: they move ζ.</p><p>When a controller overshoots a setpoint every time and then settles, you are looking at ζ well below one.</p>`}
},
{ id:34, wk:7, day:4, track:'CTRL', title:'Poles and stability',
  kicker:'Read the behaviour of a system straight off the roots of its denominator.',
  learn:`<p>The <b>poles</b> of a transfer function are the roots of its denominator. Each pole is a number <span class="m">s = σ + jω</span>, and it fixes one piece of the time response:</p>
<div class="eq">e<sup>σt</sup> · (cos ωt + …)</div>
<p>The <b>real part σ</b> controls growth or decay. A negative σ means the response dies away: <b>stable</b>. A positive σ means it grows: <b>unstable</b>. The <b>imaginary part ω</b> is the ringing frequency.</p>
<p>So the rule is plain: <b>a system is stable only if every pole has a negative real part</b>, that is, they all sit in the left half of the s-plane. Farther left means faster decay. A pole on the imaginary axis oscillates forever without growing or shrinking.</p>
<p>For <span class="m">s² + 2ζωn s + ωn²</span> the poles are <span class="m">−ζωn ± jωn√(1 − ζ²)</span>. High gain in a loop often pushes poles to the right: that is why too much gain makes a loop oscillate and then run away.</p>`,
  diagram:'pzmap',
  pins:['Poles = roots of the denominator','All poles with negative real parts → stable','Real part sets decay speed, imaginary part sets ringing','Too much loop gain pushes poles right'],
  worked:{prompt:'Analyse G(s) = 1/(s² + 2s + 5): find the poles, ωn, ζ and the overshoot.',
    steps:['Roots: <span class="m">s = (−2 ± √(4 − 20)) / 2 = −1 ± 2j</span>','Both have real part −1, so it is stable','<span class="m">ωn = √5 = 2.236 rad/s</span>','<span class="m">ζ = 2 / (2 × 2.236) = 0.447</span>','Overshoot: <span class="m">100 e<sup>−π × 0.447 / 0.894</sup> = 20.8%</span>'],
    answer:'Stable, ringing at 2 rad/s, with about 21% overshoot. The decay envelope follows e^(−t).'},
  tryit:[
    num('s34q1','Where is the pole of 1/(s + 5)? Enter its value on the real axis.',-5,'','Set s + 5 = 0, so s = −5. The time constant is 0.2 s.'),
    num('s34q2','The poles of s² + 4s + 13 are −2 ± j(something). What is the something?',3,'','s = (−4 ± √(16 − 52)) / 2 = −2 ± j3.'),
    mcq('s34q3','When is a linear system unstable?',['When any pole has a positive real part','When any pole is complex','When the gain is above 1','When the damping is below 1'],0,'A pole in the right half plane produces e^(σt) with σ > 0, which grows without limit. Complex poles only cause ringing.')
  ],
  recall:[ num('s34r1','What time constant gives 63% charge in a 10 kΩ and 22 µF circuit, in milliseconds?',220,'ms','τ = RC = 10 000 × 22×10⁻⁶ = 0.22 s = 220 ms.') ],
  plant:{title:'Hunting loops and oscillations',body:`<p>When a flow or level loop starts to cycle up and down by itself, the poles have moved close to, or across, the imaginary axis. The classic cause is gain turned up too far, or a valve that has become slow and added delay.</p><p>Look at the period of the cycle: it is roughly the ringing frequency of those poles, and it tells you how fast a tuning change has to act.</p>`}
},
{ id:35, wk:7, day:5, track:'REV', title:'Week 7 review: a pressure loop',
  kicker:'Transfer functions, feedback and poles on a plant you could meet tomorrow.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Laplace</h4><p>d/dt → ×s. Final value: lim s·Y(s). First order: K/(τs + 1).</p></div>
<div class="cheat"><h4>Feedback</h4><p>T = CG/(1 + CG). Gain buys speed, leaves error. Series multiply, parallel add.</p></div>
<div class="cheat"><h4>Responses</h4><p>ts ≈ 4τ. %OS = 100e^(−πζ/√(1−ζ²)). ts ≈ 4/(ζωn).</p></div>
<div class="cheat"><h4>Stability</h4><p>All poles with negative real parts. Farther left is faster; imaginary part rings.</p></div>
</div>`,
  pins:['Gain makes loops faster and leaves error. Integral action removes the error.'],
  worked:{prompt:'A pressure plant is G = 2/(5s + 1). A proportional controller Kp = 4 is used with unity feedback. Find the closed-loop DC gain, time constant and steady-state error for a unit step.',
    steps:['Loop gain at DC: <span class="m">Kp × K = 4 × 2 = 8</span>','Closed-loop DC gain: <span class="m">8 / (1 + 8) = 0.889</span>','Closed-loop time constant: <span class="m">5 / (1 + 8) = 0.556 s</span>','Steady-state error: <span class="m">1 − 0.889 = 0.111</span>, that is 11%'],
    answer:'The loop is nine times faster (0.56 s against 5 s), but sits 11% short of the setpoint. Integral action fixes that, next week.'},
  tryit:[
    num('s35q1','A plant with K = 1.5 is under unity feedback with Kp = 2. What is the closed-loop DC gain?',0.75,'','Loop gain 3. T = 3/(1 + 3) = 0.75.'),
    num('s35q2','A plant has τ = 10 s and the loop gain at DC is 4. What is the closed-loop time constant, in seconds?',2,'s','τcl = τ/(1 + loop gain) = 10/5 = 2 s.'),
    num('s35q3','With a DC loop gain of 9, what is the steady-state error for a step, in percent?',10,'%','Error = 1/(1 + 9) = 10%.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week is PID in practice and motors. Look at one control loop on the plant and write down its P, I and D values if the controller shows them. We'll use real numbers like those.</p>`}
},

{ id:36, wk:8, day:1, track:'CTRL', title:'PID control',
  kicker:'Three terms: what the error is, what it has been, and where it is heading.',
  learn:`<p>A PID controller computes its output from the error <span class="m">e = setpoint − measurement</span>:</p>
<div class="eq">u = K<sub>p</sub> e + K<sub>i</sub> ∫ e dt + K<sub>d</sub> de/dt</div>
<p><b>P (proportional)</b> reacts to the present error. Bigger gain, faster response, but it leaves a steady-state offset on its own.</p>
<p><b>I (integral)</b> accumulates past error. As long as any error remains, the integral keeps growing and pushes the output until the error is exactly zero. It removes offset, but adds lag and can overshoot.</p>
<p><b>D (derivative)</b> reacts to how fast the error is changing, so it brakes the response before overshoot. It amplifies noise, so it is often filtered or left out. Many industrial loops are simply <b>PI</b>.</p>
<p>Controllers often use <b>time-based settings</b>: integral time Ti and derivative time Td, with <span class="m">K<sub>i</sub> = K<sub>p</sub>/T<sub>i</sub></span> and <span class="m">K<sub>d</sub> = K<sub>p</sub>·T<sub>d</sub></span>. Check which form your controller uses.</p>
<p>Watch for <b>integral windup</b>: if the output is saturated (valve fully open), the integral keeps growing and then takes ages to unwind. Good controllers include anti-windup.</p>`,
  diagram:'pidblocks', sim:'pid',
  pins:['P: now. I: past. D: future','I removes steady-state error; it also adds lag','D adds damping but amplifies noise','Ki = Kp/Ti and Kd = Kp·Td in time form','Beware integral windup'],
  worked:{prompt:'The error has been a constant 2 units for 3 s. With Kp = 1.5, Ki = 0.4 and Kd = 0.1, what is the controller output?',
    steps:['Proportional: <span class="m">1.5 × 2 = 3.0</span>','Integral: <span class="m">0.4 × (2 × 3) = 2.4</span>','Derivative: the error is constant, so de/dt = 0, giving <span class="m">0</span>','Total: <span class="m">3.0 + 2.4 + 0 = 5.4</span>'],
    answer:'The output is 5.4 and still rising, since the integral grows every second the error stays at 2.'},
  tryit:[
    num('s36q1','The error is 5 and Kp = 0.8. What is the proportional output?',4,'','P = Kp × e = 0.8 × 5 = 4.'),
    num('s36q2','The error is held at 4 for 2.5 s with Ki = 0.5. What is the integral term?',5,'','I = Ki × e × t = 0.5 × 4 × 2.5 = 5.'),
    num('s36q3','The error is changing at a rate of 2 units per second and Kd = 0.3. What is the derivative output?',0.6,'','D = Kd × de/dt = 0.3 × 2 = 0.6.')
  ],
  recall:[ num('s36r1','A second-order system has ζ = 0.7. Roughly what is its percent overshoot? (Use ζ = 0.7, √(1−ζ²) = 0.714.)',4.6,'%','100 e^(−π × 0.7/0.714) = 4.6%.') ],
  plant:{title:'Reading a PID faceplate',body:`<p>On most DCS and PLC faceplates you will see SP, PV and OUT, with a manual/auto switch. When you swap to auto, a good controller uses bumpless transfer so the output does not jump. If the output sits pinned at 100% and the PV is not moving, suspect integral windup or a saturated valve.</p>`}
},
{ id:37, wk:8, day:2, track:'CTRL', title:'Tuning a loop in practice',
  kicker:'A repeatable recipe to get decent gains in an afternoon, and the trade-offs behind it.',
  learn:`<p>Tuning means choosing Kp, Ti and Td. The <b>Ziegler-Nichols closed-loop method</b> is the classic starting recipe:</p>
<ol><li>Set Ti to maximum and Td to zero (P only).</li><li>Raise Kp until the output oscillates steadily. That gain is the <b>ultimate gain Ku</b>.</li><li>Measure the period of the oscillation: the <b>ultimate period Tu</b>.</li><li>Look up the settings:</li></ol>
<div class="eq">P: K<sub>p</sub> = 0.5 K<sub>u</sub><br>PI: K<sub>p</sub> = 0.45 K<sub>u</sub>, T<sub>i</sub> = T<sub>u</sub>/1.2<br>PID: K<sub>p</sub> = 0.6 K<sub>u</sub>, T<sub>i</sub> = T<sub>u</sub>/2, T<sub>d</sub> = T<sub>u</sub>/8</div>
<p>These settings are aggressive and often give 25% overshoot, so back Kp off by a third to half for a calmer loop. On a live plant you often cannot push a loop to oscillate: use a <b>step test</b> instead and read the delay and time constant from the response (reaction-curve method, or the Lambda/IMC rules).</p>
<p>Practical order: tune in manual and auto with small setpoint steps, change one term at a time, and always check the response to a disturbance, not just the setpoint. Slow processes (tanks, furnaces) reward a long Ti. Fast ones (flow, pressure) want a short Ti and almost no D.</p>`,
  diagram:'pidblocks', sim:'pid',
  pins:['Ziegler-Nichols PID: Kp = 0.6Ku, Ti = Tu/2, Td = Tu/8','PI: Kp = 0.45Ku, Ti = Tu/1.2','Z-N is aggressive; reduce Kp for a calmer loop','Change one term at a time, small steps'],
  worked:{prompt:'A loop sustains oscillation at Ku = 8 with period Tu = 4 s. Give Z-N PID settings, and the equivalent Ki and Kd.',
    steps:['<span class="m">Kp = 0.6 × 8 = 4.8</span>','<span class="m">Ti = 4 / 2 = 2 s</span>, <span class="m">Td = 4 / 8 = 0.5 s</span>','<span class="m">Ki = Kp / Ti = 4.8 / 2 = 2.4</span>','<span class="m">Kd = Kp × Td = 4.8 × 0.5 = 2.4</span>'],
    answer:'Kp = 4.8, Ti = 2 s, Td = 0.5 s. Expect noticeable overshoot, so start about a third lower on a real plant.'},
  tryit:[
    num('s37q1','Ku = 10. What is Kp for a Z-N PI controller?',4.5,'','Kp = 0.45 × 10 = 4.5.'),
    num('s37q2','Tu = 6 s. What integral time does Z-N give for a PID controller, in seconds?',3,'s','Ti = Tu/2 = 3 s.'),
    num('s37q3','Ku = 5 and Tu = 2 s. What is Kd for a Z-N PID controller (Kd = Kp·Td)?',0.75,'','Kp = 3, Td = 2/8 = 0.25, so Kd = 3 × 0.25 = 0.75.')
  ],
  recall:[ num('s37r1','The error is held at 3 for 4 s with Ki = 0.25. What is the integral term?',3,'','I = 0.25 × 3 × 4 = 3.') ],
  plant:{title:'Tuning without upsetting production',body:`<p>You rarely get permission to push a live loop to oscillation. A small step on the setpoint (or OUT in manual) lets you read the dead time and time constant from the response. Many modern controllers also have auto-tune. Write the old settings down before you start, so you can restore them in one minute if it goes wrong.</p>`}
},
{ id:38, wk:8, day:3, track:'DRIVE', title:'DC motors and torque-speed curves',
  kicker:'Two equations cover the whole motor: one for the electrical side, one for the mechanical.',
  learn:`<p>A permanent-magnet DC motor has a winding resistance R and generates a <b>back-EMF</b> proportional to speed. The electrical and mechanical sides link through the same constant:</p>
<div class="eq">V = I R + K<sub>e</sub> ω &nbsp;&nbsp;&nbsp; T = K<sub>t</sub> I &nbsp;&nbsp;&nbsp; (K<sub>t</sub> = K<sub>e</sub> in SI)</div>
<p>Combine them and torque falls linearly as speed rises: a <b>straight torque-speed line</b>. Two endpoints define it:</p>
<div class="eq">Stall: ω = 0, I = V/R, T = K<sub>t</sub>V/R &nbsp;&nbsp; No-load: T = 0, ω = V/K<sub>e</sub></div>
<p>Current is proportional to torque, which is why a stalled motor draws many times its rated current and cooks itself. Voltage sets the speed (shifts the line); current sets the torque. This is the whole idea behind PWM speed control from last week and a servo's current loop.</p>
<p>Mechanical power is <span class="m">P = T ω</span>, peaking halfway between stall and no-load. Remember <b>rad/s to rpm</b>: multiply by 60/2π, about 9.55.</p>`,
  diagram:'dcmotor',
  pins:['V = IR + Keω, T = Kt·I','Stall: I = V/R. No-load speed: V/Ke','Voltage sets speed, current sets torque','rpm = rad/s × 9.55'],
  worked:{prompt:'A 24 V DC motor has R = 0.8 Ω and Ke = Kt = 0.06. It carries a steady load torque of 0.3 N·m. Find the current, the speed, and the stall current.',
    steps:['Current from torque: <span class="m">I = T / Kt = 0.3 / 0.06 = 5 A</span>','Back-EMF: <span class="m">E = V − I R = 24 − 5 × 0.8 = 20 V</span>','Speed: <span class="m">ω = E / Ke = 20 / 0.06 = 333 rad/s = 3183 rpm</span>','Stall current: <span class="m">24 / 0.8 = 30 A</span>, torque <span class="m">0.06 × 30 = 1.8 N·m</span>'],
    answer:'5 A, 333 rad/s (about 3200 rpm). The stall current is six times the running current, so a jammed drive must limit current.'},
  tryit:[
    num('s38q1','A 12 V motor with R = 0.5 Ω is stalled. What current flows?',24,'A','I = V/R = 12/0.5 = 24 A.'),
    num('s38q2','A motor with Kt = 0.05 N·m/A draws 8 A. What torque does it produce?',0.4,'N·m','T = Kt × I = 0.05 × 8 = 0.4 N·m.'),
    num('s38q3','A 48 V motor with Ke = 0.1 V·s/rad runs with no load (ignore losses). What is its speed?',480,'rad/s','ω = V/Ke = 48/0.1 = 480 rad/s.')
  ],
  recall:[ num('s38r1','Convert 480 rad/s to rpm.',4584,'rpm','480 × 60 / (2π) = 4584 rpm.') ],
  plant:{title:'Why drives have current limits',body:`<p>A motor jammed by a stuck conveyor stalls, and the current is limited only by R: many times the rated value. Drives and soft starters therefore watch current and trip on overload. Remember: current maps to torque, so a high-current trip often just means "the mechanical load is too big".</p>`}
},
{ id:39, wk:8, day:4, track:'DRIVE', title:'Induction motors and VSDs',
  kicker:'The workhorse of every plant, and the drive that gives it a speed knob.',
  learn:`<p>The rotor of an <b>induction motor</b> always turns a little slower than the rotating magnetic field. That gap is <b>slip</b>:</p>
<div class="eq">n<sub>s</sub> = 120 f / p &nbsp;&nbsp; slip = (n<sub>s</sub> − n) / n<sub>s</sub></div>
<p>Typical full-load slip is 2 to 5%. A 4-pole motor on 50 Hz has ns = 1500 rpm and runs near 1450.</p>
<p>A <b>variable speed drive (VSD)</b> changes the supply frequency to change ns. But the motor's magnetic flux depends on V/f, so voltage must follow frequency to keep the flux (and torque) constant. This is <b>constant V/f control</b>:</p>
<div class="eq">V<sub>out</sub> = 400 V × (f / 50 Hz) &nbsp;&nbsp; for f ≤ 50 Hz</div>
<p>Above 50 Hz the voltage cannot rise further, so flux and torque fall (field weakening). Most VSDs also provide ramps, current limit, and slip compensation. Remember the cooling: a self-cooled motor at low speed has less fan airflow, so sustained low-speed, full-torque duty needs an external fan.</p>`,
  diagram:'vsd',
  pins:['ns = 120f/p; slip = (ns − n)/ns','Typical full-load slip 2 to 5%','VSD keeps V/f constant up to base speed','Above base speed: field weakening, torque falls','Low speed at full torque needs extra cooling'],
  worked:{prompt:'A 4-pole 50 Hz motor runs at 1455 rpm. Find the slip. Then, at 30 Hz from a VSD (400 V at 50 Hz), find the synchronous speed and the voltage.',
    steps:['<span class="m">ns = 120 × 50 / 4 = 1500 rpm</span>','<span class="m">slip = (1500 − 1455) / 1500 = 3.0%</span>','At 30 Hz: <span class="m">ns = 120 × 30 / 4 = 900 rpm</span>','Voltage: <span class="m">400 × 30/50 = 240 V</span>'],
    answer:'3% slip. At 30 Hz the motor wants 900 rpm and 240 V, which keeps the same flux.'},
  tryit:[
    num('s39q1','A 6-pole 50 Hz motor runs at 960 rpm. What is the slip in percent?',4,'%','ns = 1000. Slip = (1000 − 960)/1000 = 4%.'),
    num('s39q2','A VSD runs a motor at 25 Hz. With 400 V at 50 Hz and constant V/f, what output voltage is needed?',200,'V','400 × 25/50 = 200 V.'),
    num('s39q3','What is the synchronous speed of a 4-pole motor at 40 Hz?',1200,'rpm','ns = 120 × 40/4 = 1200 rpm.')
  ],
  recall:[ num('s39r1','A DC motor has V = 24 V and R = 0.8 Ω. What is the stall current?',30,'A','I = 24/0.8 = 30 A.') ],
  plant:{title:'VSDs on the plant',body:`<p>Drives on conveyors, pumps and fans save energy by running slower rather than throttling a valve. Because pump power falls with the cube of speed, a pump at 80% speed uses roughly half the power. Always check what a drive fault code means before resetting it: an overcurrent trip on acceleration and one on a steady run point to very different problems.</p>`}
},
{ id:40, wk:8, day:5, track:'REV', title:'Week 8 review: a conveyor drive',
  kicker:'PID, motors, VSD and gearing on one real calculation.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>PID</h4><p>u = Kp e + Ki∫e + Kd de/dt. Ki = Kp/Ti, Kd = Kp·Td. Mind windup.</p></div>
<div class="cheat"><h4>Z-N</h4><p>PID: 0.6Ku, Tu/2, Tu/8. PI: 0.45Ku, Tu/1.2. Back off Kp a third.</p></div>
<div class="cheat"><h4>DC motor</h4><p>V = IR + Keω, T = KtI. Stall V/R, no-load V/Ke. P = Tω.</p></div>
<div class="cheat"><h4>Induction / VSD</h4><p>ns = 120f/p, slip = (ns − n)/ns. V/f constant up to base speed.</p></div>
</div>`,
  pins:['Motor speed → gearbox → drum → belt speed. Carry the units through.'],
  worked:{prompt:'A conveyor uses a 4-pole motor on a VSD at 35 Hz, with 3% slip, through a 20:1 gearbox to a 0.4 m diameter drum. Find the belt speed.',
    steps:['<span class="m">ns = 120 × 35 / 4 = 1050 rpm</span>','Shaft speed: <span class="m">1050 × (1 − 0.03) = 1018.5 rpm</span>','Drum speed: <span class="m">1018.5 / 20 = 50.9 rpm</span>','Belt speed: <span class="m">50.9/60 × π × 0.4 = 1.066 m/s</span>'],
    answer:'About 1.07 m/s. Check against the line requirement before trusting a speed readout.'},
  tryit:[
    num('s40q1','A 4-pole motor at 25 Hz with 4% slip drives a 10:1 gearbox and a 0.3 m drum. What is the belt speed, in m/s?',1.131,'m/s','ns = 750, n = 720, drum = 72 rpm, v = 72/60 × π × 0.3 = 1.131 m/s.'),
    num('s40q2','A 7.5 kW motor delivers its rated power at 1450 rpm. What shaft torque is that?',49.4,'N·m','ω = 1450 × 2π/60 = 151.8 rad/s. T = P/ω = 7500/151.8 = 49.4 N·m.'),
    num('s40q3','A first-order loop has τ = 1.2 s. What is its approximate 2% settling time?',4.8,'s','ts ≈ 4τ = 4.8 s.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week covers hydraulics and PLCs. Find one hydraulic cylinder and read its bore, stroke and supply pressure, and look at the PLC rack that controls it. We'll build on those numbers.</p>`}
},

{ id:41, wk:9, day:1, track:'DRIVE', title:'Hydraulic actuators and proportional valves',
  kicker:'Fluid power in three equations, and how a valve turns a small signal into big motion.',
  learn:`<p>Hydraulics moves force with pressurised oil. Three relationships do most of the work:</p>
<div class="eq">F = P × A &nbsp;&nbsp;&nbsp; v = Q / A &nbsp;&nbsp;&nbsp; P<sub>hyd</sub> = P × Q</div>
<p><b>Force</b> is pressure times piston area. <b>Speed</b> is flow divided by area. <b>Power</b> is pressure times flow. Keep units consistent: pressure in pascals (1 bar = 10⁵ Pa), flow in m³/s (1 L/min = 1.667×10⁻⁵ m³/s), and area in m².</p>
<p>The rod side of a double-acting cylinder has a smaller area (annulus), so it pushes less and retracts faster at the same flow.</p>
<p>A <b>proportional valve</b> or <b>servo valve</b> takes a 4-20 mA or ±10 V command and moves a spool, opening a flow path in proportion. Flow through the opening depends on the square root of the pressure drop, so the flow you get depends on both the command and the load. A relief valve protects the system by opening at its set pressure.</p>
<p>Hydraulic stiffness is huge, so loops can be very responsive, but air in the oil makes a cylinder spongy and unstable.</p>`,
  diagram:'cylinder',
  pins:['F = P·A, v = Q/A, P = P·Q','1 bar = 10⁵ Pa; 1 L/min = 1.667×10⁻⁵ m³/s','Rod side has less area: less force, more speed','Valve flow depends on pressure drop'],
  worked:{prompt:'A cylinder has a 100 mm bore and a 56 mm rod, supplied at 160 bar and 60 L/min. Find the extend force, extend speed and hydraulic power.',
    steps:['Area: <span class="m">A = π/4 × 0.1² = 7.854×10⁻³ m²</span>','Force: <span class="m">F = 16×10⁶ × 7.854×10⁻³ = 125.7 kN</span>','Flow: <span class="m">60 L/min = 1.0×10⁻³ m³/s</span>, so <span class="m">v = 1.0×10⁻³ / 7.854×10⁻³ = 0.127 m/s</span>','Power: <span class="m">16×10⁶ × 1.0×10⁻³ = 16 kW</span>'],
    answer:'About 126 kN at 0.13 m/s, using 16 kW of hydraulic power. Retracting, the rod reduces the area to 5.39×10⁻³ m², so it is faster but weaker.'},
  tryit:[
    num('s41q1','A cylinder with an 80 mm bore is supplied at 200 bar. What force does it develop on extension, in kN?',100.5,'kN','A = π/4 × 0.08² = 5.027×10⁻³ m². F = 20×10⁶ × 5.027×10⁻³ = 100.5 kN.'),
    num('s41q2','That same cylinder gets 30 L/min. What is its extend speed, in m/s?',0.0995,'m/s','Q = 5×10⁻⁴ m³/s. v = 5×10⁻⁴ / 5.027×10⁻³ = 0.0995 m/s.'),
    num('s41q3','A pump delivers 90 L/min at 120 bar. What is the hydraulic power, in kW?',18,'kW','Q = 1.5×10⁻³ m³/s, P = 12×10⁶ Pa. Power = 18 kW.')
  ],
  recall:[ num('s41r1','A 4-pole motor runs at 1470 rpm on 50 Hz. What is the slip in percent?',2,'%','Slip = (1500 − 1470)/1500 = 2%.') ],
  plant:{title:'Hydraulic troubleshooting on the plant',body:`<p>A cylinder that drifts under load is leaking past a seal or a valve. A slow cylinder with normal pressure points to low flow (worn pump, blocked filter). Hot oil means energy is being wasted over a relief valve. Always read pressure at the pump and at the actuator: the difference is lost in the lines and valves.</p>`}
},
{ id:42, wk:9, day:2, track:'PLC', title:'PLC architecture and the scan cycle',
  kicker:'Understand the loop a PLC runs and most of its quirks stop being mysteries.',
  learn:`<p>A PLC is a ruggedised computer that runs one repeating loop, the <b>scan cycle</b>:</p>
<ol><li><b>Read inputs</b> into an input image (a snapshot).</li><li><b>Execute the program</b>, top to bottom, using that snapshot.</li><li><b>Write outputs</b> from the output image to the real terminals.</li><li><b>Housekeeping:</b> communications and diagnostics.</li></ol>
<p>The scan repeats every few milliseconds. Two consequences matter:</p>
<ul><li>An input that changes <b>during</b> the scan is not seen until the next one. A pulse shorter than the scan time can be missed entirely.</li><li>The worst-case time from an input change to the output reacting is about <b>two scan times</b> (it just missed the read, then waits for the write).</li></ul>
<p>The system has a CPU, input and output cards (digital 24 V DC, analogue 4-20 mA), a power supply, and a communications network to HMIs, drives and remote I/O. Fast events use <b>interrupts</b> or high-speed counter inputs that run outside the normal scan.</p>
<p>The program is stored as blocks (OB, FB, FC, DB on Siemens; tasks and POUs on IEC platforms). Always watch the <b>scan-time monitor</b>: a long or growing scan is a warning sign.</p>`,
  diagram:'scancycle',
  pins:['Scan: read inputs, run program, write outputs, housekeeping','Inputs are a snapshot taken at the start of the scan','Worst-case reaction ≈ 2 × scan time','Pulses shorter than the scan can be missed; use interrupts or high-speed inputs'],
  worked:{prompt:'A PLC has a scan time of 12 ms. A proximity sensor pulse lasts 8 ms. Can the PLC be sure to see it? What is the worst-case delay from sensor to output?',
    steps:['The pulse (8 ms) is shorter than the scan (12 ms), so it can fall between two input reads','A guaranteed catch needs a pulse longer than one scan, or a hardware latch or interrupt input','Worst-case delay: <span class="m">≈ 2 × 12 = 24 ms</span> (plus the output module delay)'],
    answer:'No: it can be missed. Use a fast interrupt input, slow the target down, or lengthen the pulse. Worst-case reaction is about 24 ms.'},
  tryit:[
    num('s42q1','A PLC executes 4000 instructions at 0.25 µs each. How long does the program portion of the scan take, in milliseconds?',1,'ms','4000 × 0.25 µs = 1000 µs = 1 ms.'),
    num('s42q2','The scan time is 15 ms. What is the worst-case input-to-output delay, in milliseconds (approximately)?',30,'ms','About two scans: 2 × 15 = 30 ms.'),
    mcq('s42q3','When does a PLC read its physical inputs?',['Once at the start of each scan','Continuously while the program runs','Only when the program asks','Only at power-up'],0,'The scan reads all inputs into an image first, then runs the program against that frozen copy.')
  ],
  recall:[ num('s42r1','A hydraulic pump gives 60 L/min at 100 bar. What is the hydraulic power, in kW?',10,'kW','Q = 10⁻³ m³/s, P = 10⁷ Pa. Power = 10 kW.') ],
  plant:{title:'Reading a PLC rack',body:`<p>Walk up to a PLC cabinet and you can identify the CPU (with its RUN/STOP and fault LEDs), the input cards (a lit LED per active input), the output cards and the analogue cards. A red SF or BF LED points to a system or bus fault. Learning what each LED pattern means saves a lot of laptop time.</p>`}
},
{ id:43, wk:9, day:3, track:'PLC', title:'Ladder logic patterns',
  kicker:'Five patterns that cover most of what you will read in an existing program.',
  learn:`<p>Ladder logic draws a program as <b>rungs</b> between two power rails. Contacts on the left act as conditions; the coil on the right is the result. A <b>normally open</b> (NO) contact passes when its bit is 1. A <b>normally closed</b> (NC) contact passes when its bit is 0.</p>
<p>The patterns you will see everywhere:</p>
<ul><li><b>Seal-in (latch):</b> START in parallel with the motor's own contact, in series with STOP. START latches the motor on; STOP or a fault drops it.</li><li><b>Set/reset:</b> a coil that sets and holds until a reset coil clears it.</li><li><b>On-delay timer (TON):</b> the output goes true after its input has been true continuously for the preset time PT.</li><li><b>Counter (CTU):</b> counts rising edges up to a preset PV, then its output goes true.</li><li><b>Edge detection:</b> a contact true for one scan only, on a rising or falling edge.</li></ul>
<p>Wire <b>stop</b> and <b>safety</b> inputs as normally closed on the field side, so a broken wire stops the machine. Read them in the program as NO or NC according to the I/O manual, and check the real state against the on-screen status.</p>
<p>When reading someone else's program, start from the output you care about and trace backwards through its conditions, rung by rung.</p>`,
  diagram:'ladder',
  pins:['NO passes when 1; NC passes when 0','Seal-in: START parallel with its own coil contact, STOP in series','TON: delays turn-on by PT; CTU counts rising edges','Stop and safety inputs wired normally closed in the field'],
  worked:{prompt:'A conveyor must start 8 s after a warning horn begins. The horn runs from the start button. Describe the logic and the timeline for a button press at t = 0.',
    steps:['Rung 1: START latches the horn coil (seal-in with STOP)','Rung 2: the horn contact drives a TON with PT = 8 s','Rung 3: the timer output Q drives the motor coil (with STOP and fault contacts in series)','Timeline: t = 0 horn on, t = 8 s timer done, motor on'],
    answer:'The motor starts at t = 8 s. Remember the timer resets whenever the horn drops, so a stop press clears the whole sequence.'},
  tryit:[
    mcq('s43q1','Which contact passes power when its input bit is 0?',['Normally closed (NC)','Normally open (NO)','Either one','Neither one'],0,'An NC contact is true when its bit is 0 (inverts the bit). A NO contact passes when the bit is 1.'),
    num('s43q2','A TON timer has PT = 8 s. How many seconds after its input goes true does its output turn on?',8,'s','The output comes on when the elapsed time reaches the preset: 8 s.'),
    num('s43q3','A CTU counter has PV = 12 and has counted 7 so far. How many more pulses until its output turns on?',5,'','12 − 7 = 5 more rising edges.')
  ],
  recall:[ num('s43r1','A PLC has a 20 ms scan. What is the worst-case input-to-output delay, in ms?',40,'ms','About two scans: 40 ms.') ],
  plant:{title:'Reading a motor start rung',body:`<p>Nearly every motor starter in the plant is the seal-in rung above, with a few extra conditions: overload OK, remote/local, interlocks. When a motor will not start, go online and look at which contact on the rung is not green. The first red one is your answer.</p>`}
},
{ id:44, wk:9, day:4, track:'PLC', title:'Interlocks and safety functions',
  kicker:'Rules for making a machine stop reliably, even when something breaks.',
  learn:`<p><b>Interlocks</b> are conditions that must be true before something is allowed to run: guard closed, lubrication OK, downstream conveyor running. They prevent damage and bad sequences.</p>
<p><b>Safety functions</b> protect people, and they follow different rules. A normal PLC program is not good enough. Safety functions use <b>certified safety relays or safety PLCs</b>, rated to a performance level (PL a to e, ISO 13849) or SIL (IEC 62061), chosen from a risk assessment.</p>
<p>Core design ideas:</p>
<ul><li><b>Fail-safe:</b> a broken wire, a dead power supply or a lost signal must lead to the safe state (stopped).</li><li><b>Normally closed, dual-channel:</b> two contacts watched against each other detect a welded contact or short.</li><li><b>Stop category 0</b> removes power at once (E-stop); category 1 brakes to a stop, then removes power.</li><li><b>Manual reset:</b> a restart after a safety trip needs a deliberate reset, never an automatic restart.</li></ul>
<p>Guards and light curtains must stop the hazard before a person can reach it. The minimum distance is:</p>
<div class="eq">S = K × T + C</div>
<p>with K the approach speed (2000 mm/s for walking, 1600 mm/s for hand speed in some cases), T the <b>total stopping time</b> (sensor response plus machine stop) and C an extra reach allowance (for light curtains, <span class="m">C = 8 (d − 14) mm</span> with detection capability d in mm).</p>`,
  diagram:'ladder',
  pins:['Safety uses certified relays or safety PLCs, not standard logic','Fail-safe: broken wire means stop','Dual-channel NC contacts, monitored','Manual reset after a safety trip','S = K·T + C sets the safe distance'],
  worked:{prompt:'A light curtain has a 30 mm detection capability. The machine stops in 0.25 s in total. Take K = 2000 mm/s and C = 8 (d − 14). What is the minimum safe distance?',
    steps:['<span class="m">K × T = 2000 × 0.25 = 500 mm</span>','<span class="m">C = 8 × (30 − 14) = 128 mm</span>','<span class="m">S = 500 + 128 = 628 mm</span>'],
    answer:'The light curtain must be at least 628 mm from the hazard. If the stop time doubles, so does the K × T part.'},
  tryit:[
    num('s44q1','Using the same K = 2000 mm/s, d = 30 mm and T = 0.4 s, what is the minimum safe distance, in mm?',928,'mm','800 + 128 = 928 mm.'),
    num('s44q2','A light curtain with d = 14 mm and a total stopping time of 0.2 s, K = 2000 mm/s. What distance is needed, in mm?',400,'mm','C = 8 × 0 = 0, so S = 2000 × 0.2 = 400 mm.'),
    mcq('s44q3','Why are E-stops wired normally closed, dual-channel?',['A broken wire or fault is detected and causes a stop','It saves cable','It makes the button easier to press','It lets the PLC ignore them'],0,'An open circuit means stop. Two monitored channels also catch a welded contact or cross-fault.')
  ],
  recall:[ mcq('s44r1','Which statement about a PLC scan is correct?',['Inputs are read once at the start of the scan','Outputs update the instant a coil turns on','The program runs only when an input changes','Scan time is always one millisecond'],0,'Inputs are copied at the start of each scan and the program runs on that copy.') ],
  plant:{title:'Never bridge a safety circuit',body:`<p>Bridging out an interlock or safety input to "get it running" is the root cause of many serious accidents. If a safety device keeps nuisance tripping, find the real cause (misaligned sensor, loose connector) and fix it. Follow your site's isolation and lock-out rules, and record any temporary override under a permit.</p>`}
},
{ id:45, wk:9, day:5, track:'REV', title:'Week 9 review: a hydraulic press cell',
  kicker:'Pressure, PLC timing, motors and safety in one machine.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Hydraulics</h4><p>F = P·A. v = Q/A. Power = P·Q. 1 bar = 10⁵ Pa, 1 L/min = 1.667×10⁻⁵ m³/s.</p></div>
<div class="cheat"><h4>Scan cycle</h4><p>Read, run, write, housekeeping. Worst case ≈ 2 × scan. Short pulses can be missed.</p></div>
<div class="cheat"><h4>Ladder</h4><p>Seal-in, TON, CTU, edge. NO passes at 1, NC passes at 0.</p></div>
<div class="cheat"><h4>Safety</h4><p>Fail-safe, dual-channel NC, manual reset. S = K·T + C.</p></div>
</div>`,
  pins:['In a machine, everything is a chain: sensor, scan, output, valve, cylinder, stopping distance.'],
  worked:{prompt:'A press cylinder has a 125 mm bore at 180 bar. The guard sensor goes to a PLC with a 20 ms scan, then the valve takes 80 ms to close. Find the force, and the total stopping time budget including the worst-case PLC delay.',
    steps:['Area: <span class="m">π/4 × 0.125² = 0.012272 m²</span>','Force: <span class="m">18×10⁶ × 0.012272 = 220.9 kN</span>','PLC: <span class="m">2 × 20 = 40 ms</span>','Total: <span class="m">40 + 80 = 120 ms</span>'],
    answer:'221 kN, 0.12 s total reaction. A press this strong must use a safety relay or safety PLC, not the standard scan, for its guard.'},
  tryit:[
    num('s45q1','A cylinder with a 63 mm bore is supplied at 100 bar. What force does it develop, in kN?',31.2,'kN','A = π/4 × 0.063² = 3.117×10⁻³ m². F = 10⁷ × 3.117×10⁻³ = 31.2 kN.'),
    num('s45q2','A PLC has a 10 ms scan and the output valve takes 60 ms to act. What is the worst-case total, in ms?',80,'ms','2 × 10 + 60 = 80 ms.'),
    num('s45q3','A DC motor with Kt = 0.08 N·m/A produces 0.4 N·m. What current does it draw?',5,'A','I = T/Kt = 0.4/0.08 = 5 A.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week starts robotics: frames and transforms. Look at one robot or manipulator on site, and identify its base, joints and tool. We'll put coordinate frames on it.</p>`}
}
);
})();
