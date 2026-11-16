/* ============ RISE TIME : weeks 13 and 14 (optional extension: PLC practice, instrumentation, safety and reliability) ============ */
(function(){
const RT = window.RT;
const {SESSIONS, DIAG, txt, sch, num, mcq, f2, plotPath, arrowDefs} = RT;

/* new track and outline entries must exist before app.js builds its session list */
RT.TRACKS.SAFE = {name:'Safety & reliability', ch:'CH10', color:'var(--ch10)'};
RT.OUTLINE.push(
 {wk:13, phase:'Extension', items:[['PLC','PLC sequences and state machines'],['PLC','Analogue scaling and alarms'],['PLC','Counting and totalising'],['SENS','Level, flow and pressure measurement'],['REV','Week 13 review']]},
 {wk:14, phase:'Extension', items:[['SAFE','Risk assessment and performance levels'],['SAFE','Electrical safety and isolation'],['SAFE','Reliability and availability'],['SAFE','Maintenance and condition monitoring'],['REV','Extension review and what next']]}
);

const box=(x,y,w,h,t,cls='')=>`<rect class="boxn" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`+txt(x+w/2,y+h/2+4,t,'lab '+cls);
const arr=(x1,y1,x2,y2,c='flow')=>`<path class="${c}" d="M${x1},${y1} L${x2},${y2}" marker-end="url(#ah)"/>`;
const small=(x,y,t,cls='lab dim',anchor='middle')=>`<text class="${cls}" style="font-size:10.5px" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;

/* ---------------- diagrams ---------------- */
DIAG.sfc = function(){
  const xs=[20,170,320,470], names=['IDLE','FILL','MIX','DRAIN'], trans=['start','full','30 s','empty'], acts=['all off','inlet open','mixer on','outlet open'];
  let b=arrowDefs;
  names.forEach((n,i)=>{
    const x=xs[i];
    if(i===0) b+=`<rect class="boxn" x="${x-4}" y="66" width="108" height="52" rx="6"/>`;
    b+=box(x,70,100,44,n,'c1t');
    b+=small(x+8,64,'step '+i,'lab dim','start')+txt(x+50,140,acts[i],'lab c2t');
    if(i<3){ b+=arr(x+100,92,xs[i+1],92,'flow')+`<line class="brk" x1="${x+125}" y1="82" x2="${x+125}" y2="102"/>`+small(x+125,72,trans[i],'lab amber'); }
  });
  b+=`<path class="flow" d="M520,114 L520,178 L70,178 L70,120" marker-end="url(#ah)"/><line class="brk" x1="295" y1="168" x2="295" y2="188"/>`+small(295,162,trans[3],'lab amber');
  b+=small(20,216,'One step is active at a time. A transition fires when its condition is true.','lab dim','start');
  return sch(600,226,b,'A batch sequence: steps do the work, transitions decide when to move on');
};
DIAG.hyst = function(){
  const X=t=>50+t, Y=v=>180-(v-130)*5;
  const sig=t=>132+22*Math.sin(Math.PI*t/430)+1.7*Math.sin(0.5*t)+0.9*Math.sin(1.3*t);
  let b='';
  b+=`<line class="axis" x1="50" y1="180" x2="${X(432)}" y2="180"/><line class="axis" x1="50" y1="186" x2="50" y2="24"/>`;
  b+=`<rect x="50" y="${Y(150)}" width="${X(430)-50}" height="${Y(145)-Y(150)}" style="fill:rgba(255,191,71,.12);stroke:none"/>`;
  b+=`<line class="tick dash" x1="50" y1="${Y(150)}" x2="${X(430)}" y2="${Y(150)}"/><line class="tick dash" x1="50" y1="${Y(145)}" x2="${X(430)}" y2="${Y(145)}"/>`;
  b+=`<path class="trace c2s" d="${plotPath(sig,0,430,X,Y,430)}"/>`;
  // naive crossings of 150
  for(let t=1;t<=430;t++){ const a=sig(t-1)-150, c=sig(t)-150; if(a*c<0) b+=`<circle cx="${X(t)}" cy="${Y(150)}" r="3.4" style="fill:var(--amber);stroke:none"/>`; }
  // hysteresis events
  let on=false; for(let t=1;t<=430;t++){ const v=sig(t); if(!on&&v>=150){on=true;b+=`<circle cx="${X(t)}" cy="${Y(150)}" r="6" style="fill:none;stroke:var(--ch1);stroke-width:2"/>`+small(X(t)-10,Y(150)-12,'ON','lab c1t','end');} else if(on&&v<=145){on=false;b+=`<circle cx="${X(t)}" cy="${Y(145)}" r="6" style="fill:none;stroke:var(--ch1);stroke-width:2"/>`+small(X(t)+10,Y(145)+18,'OFF','lab c1t','start');} }
  b+=txt(X(436),Y(150)+4,'150 on','lab amber','start')+txt(X(436),Y(145)+4,'145 off','lab amber','start');
  b+=small(X(436),Y(150)-18,'deadband 5','lab dim','start');
  b+=small(50,18,'temperature (°C)','lab dim','start')+small(X(430),198,'time','lab dim','end');
  b+=small(60,210,'amber dots: a single trip point would toggle here','lab amber','start');
  return sch(600,224,b,'A deadband turns a noisy crossing into one clean alarm');
};
DIAG.pulses = function(){
  let b='', x0=40, p=38, n=10;
  let d=`M${x0-14},140`;
  for(let i=0;i<n;i++){ const x=x0+i*p; d+=` L${x},140 L${x},100 L${x+p/2},100 L${x+p/2},140`; }
  d+=` L${x0+n*p+14},140`;
  b+=`<path class="trace c2s" d="${d}"/>`;
  for(let i=0;i<n;i++) b+=small(x0+i*p+p/4,92,String(i+1),'lab c2t');
  b+=`<path class="arc" style="fill:none" d="M${x0},64 L${x0},56 L${x0+n*p},56 L${x0+n*p},64"/>`+txt(x0+n*p/2,48,'gate time T','lab amber');
  b+=small(x0,168,'each rising edge adds one to the counter','lab dim','start');
  b+=txt(460,64,'f = N / T','lab c1t','start')+txt(460,92,'Q = f / K','lab c1t','start')+txt(460,120,'volume = N / K','lab c1t','start')+small(460,146,'K = pulses per litre','lab dim','start');
  return sch(640,184,b,'Count the edges inside a known time to get a frequency');
};
DIAG.dplevel = function(){
  let b='';
  b+=`<rect x="60" y="30" width="140" height="160" style="fill:none;stroke:var(--ink-2);stroke-width:2"/>`;
  b+=`<rect x="61" y="80" width="138" height="109" style="fill:rgba(63,224,255,.14);stroke:none"/><line class="trace c2s" x1="61" y1="80" x2="199" y2="80"/>`;
  b+=`<line class="tick" x1="228" y1="190" x2="228" y2="80"/><line class="tick" x1="222" y1="190" x2="234" y2="190"/><line class="tick" x1="222" y1="80" x2="234" y2="80"/>`+txt(244,140,'h','lab amber','start');
  b+=`<path class="wire" d="M200,180 L300,180"/><path class="wire" d="M200,44 L350,44 L350,160"/>`;
  b+=box(300,160,100,40,'DP cell','c1t')+small(250,172,'HP','lab dim')+small(366,100,'LP','lab dim','start');
  b+=txt(130,128,'density ρ','lab c2t');
  b+=txt(440,60,'ΔP = ρ g h','lab c1t','start')+txt(440,88,'h = ΔP / (ρ g)','lab c1t','start')+small(440,116,'water: 9.81 kPa per metre','lab dim','start')+small(440,134,'LP leg cancels vessel pressure','lab dim','start');
  return sch(660,232,b,'A differential pressure cell reads the weight of the liquid column');
};
DIAG.bathtub = function(){
  const X=t=>50+t, lam=t=>0.9*Math.exp(-t/28)+0.18+0.62*Math.exp((t-430)/48), Y=v=>180-v*120;
  let b=`<line class="axis" x1="50" y1="180" x2="${X(440)}" y2="180"/><line class="axis" x1="50" y1="186" x2="50" y2="28"/>`;
  b+=`<line class="tick dash" x1="${X(95)}" y1="40" x2="${X(95)}" y2="180"/><line class="tick dash" x1="${X(330)}" y1="40" x2="${X(330)}" y2="180"/>`;
  b+=`<path class="trace c1s" d="${plotPath(lam,0,430,X,Y,430)}"/>`;
  b+=small(50,20,'failure rate λ','lab dim','start')+small(X(440),20,'time in service','lab dim','end');
  b+=txt(X(45),198,'early life','lab c2t')+txt(X(212),198,'useful life','lab c1t')+txt(X(385),198,'wear out','lab amber');
  b+=txt(X(212),Y(0.18)-14,'random failures','lab dim')+txt(X(212),Y(0.18)-30,'λ constant, MTBF = 1 / λ','lab c1t');
  return sch(600,212,b,'The bathtub curve: three phases of failure behaviour');
};
DIAG.riskmatrix = function(){
  const x0=80,y0=26,c=42; let b='';
  const col=s=>s<=4?'rgba(109,255,176,.22)':s<=9?'rgba(255,216,74,.22)':s<=14?'rgba(255,154,107,.30)':'rgba(255,90,80,.34)';
  for(let S=5;S>=1;S--) for(let L=1;L<=5;L++){ const x=x0+(L-1)*c,y=y0+(5-S)*c; b+=`<rect x="${x}" y="${y}" width="${c-2}" height="${c-2}" rx="3" style="fill:${col(S*L)};stroke:none"/>`+small(x+c/2-1,y+c/2+3,String(S*L),'lab dim'); }
  for(let i=1;i<=5;i++){ b+=small(x0+(i-1)*c+c/2-1,y0+5*c+14,String(i))+small(x0-12,y0+(5-i)*c+c/2+3,String(i)); }
  b+=small(x0+5*c/2,y0+5*c+32,'likelihood','lab dim')+`<text class="lab dim" style="font-size:10.5px" transform="rotate(-90 22 ${y0+5*c/2})" x="22" y="${y0+5*c/2}" text-anchor="middle">severity</text>`;
  const cx=L=>x0+(L-1)*c+c/2-1, cy=S=>y0+(5-S)*c+c/2-1;
  b+=`<path class="flow" d="M${cx(3)-9},${cy(4)} L${cx(1)+12},${cy(4)}" marker-end="url(#ah)"/>`;
  b+=`<circle cx="${cx(3)}" cy="${cy(4)}" r="8" style="fill:none;stroke:#fff;stroke-width:2"/><circle cx="${cx(1)}" cy="${cy(4)}" r="8" style="fill:none;stroke:var(--ch1);stroke-width:2"/>`;
  b+=small(x0+5*c+26,50,'score = severity × likelihood','lab c1t','start');
  [['1 to 4','low',109,255,176],['5 to 9','medium',255,216,74],['10 to 14','high',255,154,107],['15 to 25','extreme',255,90,80]].forEach((z,i)=>{ b+=`<rect x="${x0+5*c+26}" y="${72+i*26}" width="16" height="16" rx="3" style="fill:rgba(${z[2]},${z[3]},${z[4]},.5);stroke:none"/>`+small(x0+5*c+50,84+i*26,z[0]+': '+z[1],'lab','start'); });
  b+=small(x0+5*c+26,186,'White ring: before. Green ring: after.','lab dim','start')+small(x0+5*c+26,206,'A guard that cuts likelihood from 3 to 1','lab dim','start')+small(x0+5*c+26,222,'drops a 12 to a 4.','lab dim','start');
  return sch(680,272,b,'A risk matrix: control measures move the score down the grid');
};
DIAG.lotoflow = function(){
  const nm=['Plan','Notify','Isolate','Lock','Release','Prove'], sub=['scope job','tell crew','open supply','lock, tag','bleed stores','test, start'];
  let b=arrowDefs;
  nm.forEach((n,i)=>{ const x=14+i*104; b+=box(x,40,92,44,n,'c1t')+small(x+8,34,'step '+(i+1),'lab dim','start')+small(x+46,106,sub[i],'lab dim'); if(i<5) b+=arr(x+92,62,x+104,62,'flow'); });
  b+=small(14,140,'Release means every store: capacitors, accumulators, springs, raised loads.','lab amber','start')+small(14,158,'Prove dead means test the tester, test the circuit, test the tester again.','lab dim','start');
  return sch(640,172,b,'Isolation is a fixed sequence, and the last step is the one people skip');
};
DIAG.vibspec = function(){
  const X=f=>50+f*4, f1=24.67; let d='M50,170';
  for(let x=50;x<=520;x+=2){ const f=(x-50)/4; let y=170-3-2.2*Math.abs(Math.sin(x*0.37))-1.4*Math.abs(Math.sin(x*1.1));
    [[1,100],[2,52],[3,20]].forEach(([k,a])=>{ const dx=x-X(k*f1); y-=a*Math.exp(-dx*dx/18); });
    d+=` L${x},${y.toFixed(1)}`; }
  let b=`<line class="axis" x1="50" y1="170" x2="520" y2="170"/><line class="axis" x1="50" y1="176" x2="50" y2="26"/>`;
  b+=`<path class="trace c2s" d="${d}"/>`;
  b+=txt(X(f1),52,'1X, 24.7 Hz','lab c1t')+small(X(f1),66,'imbalance','lab dim')+txt(X(2*f1)+14,104,'2X, 49.3 Hz','lab amber','start')+small(X(2*f1)+14,118,'misalignment','lab dim','start')+txt(X(3*f1)+18,138,'3X','lab dim');
  b+=small(50,18,'vibration velocity (mm/s)','lab dim','start')+small(520,206,'frequency (Hz)','lab dim','end')+small(X(0),186,'0','lab dim')+small(X(100),186,'100','lab dim');
  return sch(560,214,b,'A vibration spectrum for a 1480 rpm motor: peaks at multiples of running speed');
};

/* ---------------- sessions ---------------- */
SESSIONS.push(
{ id:61, wk:13, day:1, track:'PLC', title:'PLC sequences and state machines',
  kicker:'Steps do the work. Transitions decide when to move on.',
  learn:`<p>Most machines are sequences, not just interlocks. The clean way to program one is a <b>state machine</b>: a list of <b>steps</b>, exactly one of which is active, and <b>transitions</b> with conditions that move you to the next step. IEC 61131 calls this approach <b>SFC</b> (sequential function chart), but you can build the same thing in ladder with a step bit per state or a single integer <b>state number</b>.</p>
<ul><li><b>Step:</b> an action runs while it is active (open inlet, start mixer).</li><li><b>Transition:</b> a condition such as a level switch, a timer or a button. It fires only when its step is active and the condition is true.</li><li><b>Initial step:</b> where the machine starts and returns to. Everything is safe and off there.</li></ul>
<p>In ladder, the pattern per step is: <b>set the next step, reset the current one</b>, using the same transition contact in both rungs, so the sequence can never have two steps active.</p>
<div class="eq">bits to hold N states = ⌈log₂ N⌉</div>
<p>Two habits make a sequence robust. First, give every step that waits for the real world a <b>timeout</b>, for example 1.5 times the normal duration, so a stuck valve or dead sensor becomes a fault message instead of a silent hang. Second, write the sequence on paper first: steps, transitions, actions and what each failure should do.</p>`,
  diagram:'sfc',
  pins:['One step active at a time','Set next, reset current, with the same transition','Initial step is safe and off','Timeout every waiting step','States N need ⌈log₂ N⌉ bits'],
  worked:{prompt:'A 200 L tank fills at 40 L/min, mixes for 3 min, then drains at 50 L/min. What is the cycle time, how many batches per hour, and what should the fill timeout be if you allow 1.5 times normal?',
    steps:['Fill: <span class="m">200 / 40 = 5 min</span>','Drain: <span class="m">200 / 50 = 4 min</span>','Cycle: <span class="m">5 + 3 + 4 = 12 min</span>, so <span class="m">60 / 12 = 5 batches per hour</span>','Fill timeout: <span class="m">1.5 × 5 = 7.5 min</span>'],
    answer:'12 minutes per batch, 5 batches an hour, and a 7.5 minute fill timeout. If the level switch has not tripped by then, the sequence goes to a fault step with the inlet closed.'},
  tryit:[
    num('s61q1','A sequence has 6 states and you store the state number in binary bits. How many bits do you need at minimum?',3,'bits','2 bits hold 4 states, 3 bits hold 8. ⌈log₂ 6⌉ = 3.'),
    num('s61q2','A batch takes 15 minutes from start to finish. How many batches can run in one hour?',4,'batches','60 / 15 = 4.'),
    mcq('s61q3','The fill valve is open but the level never rises, and the sequence sits in the fill step forever. Which feature turns this into a clear fault?',['A larger counter','A timeout on the fill step','A faster scan time','A second reset rung'],1,'A step timeout compares the time in the step with the expected time and raises a fault, so a stuck valve or dead sensor is reported instead of hidden.')
  ],
  recall:[ num('s61r1','A PLC scans in 10 ms. About how long is the worst-case delay from an input changing to the output responding, in ms?',20,'ms','Worst case is about two scan times: 20 ms.') ],
  plant:{title:'Sequence on one sheet',body:`<p>Pick one sequence on site, a start-up, a wash cycle or a transfer, and sketch it as steps and transitions on a single page. Mark which transition has no timeout. That is where the next mystery stoppage will hide.</p>`}
},
{ id:62, wk:13, day:2, track:'PLC', title:'Analogue scaling and alarms',
  kicker:'Counts in, engineering units out, and one clean alarm instead of fifty.',
  learn:`<p>A PLC analogue input module turns the 4 to 20 mA loop into an integer. Many families map the full range to <b>0 to 27648</b> counts. Your job is to turn counts into engineering units with a straight line:</p>
<div class="eq">value = lo + (raw − raw<sub>lo</sub>) / (raw<sub>hi</sub> − raw<sub>lo</sub>) × (hi − lo)</div>
<p>Do the percentage first, then multiply by the span. It is easy to check: 0% is the low end, 100% is the high end, 50% is the middle.</p>
<p>The <b>live zero</b> of 4 mA is a gift. A reading below about 3.6 mA cannot be a real process value, so it means a <b>broken wire</b> or a dead transmitter. Raise a fault for it and do not let the control loop act on it.</p>
<p>For alarms, a single trip point <b>chatters</b> when a noisy signal sits near it. Two cures work together:</p>
<ul><li><b>Deadband (hysteresis):</b> turn on at 150, turn off only below 145.</li><li><b>On-delay:</b> the condition must hold for a few seconds before the alarm is raised, which ignores short spikes.</li></ul>
<p>Choose the deadband from the noise: a few times the noise amplitude, small enough that the alarm still means something.</p>`,
  diagram:'hyst',
  pins:['Percent first, then multiply by span','4 mA live zero: under 3.6 mA is a wire break','Alarm on at the limit, off below limit minus deadband','Add an on-delay to ignore spikes','27648 counts is full scale on many modules'],
  worked:{prompt:'A temperature transmitter spans 0 to 200 °C on 4 to 20 mA, and the module reads 20736 counts out of 27648. What is the temperature and the loop current? If the high alarm is 150 °C with a 5 °C deadband, where does it clear?',
    steps:['Percent: <span class="m">20736 / 27648 = 0.75 = 75%</span>','Temperature: <span class="m">0.75 × 200 = 150 °C</span>','Current: <span class="m">4 + 0.75 × 16 = 16 mA</span>','The alarm clears below <span class="m">150 − 5 = 145 °C</span>'],
    answer:'150 °C at 16 mA, so the high alarm is just reached. With a 5 °C deadband it stays on until the temperature falls below 145 °C, so noise around 150 does not make it flicker.'},
  tryit:[
    num('s62q1','A pressure transmitter spans 0 to 10 bar. The module reads 13824 counts of 27648. What is the pressure, in bar?',5,'bar','13824 / 27648 = 50%. 50% of 10 bar = 5 bar.'),
    num('s62q2','A 4 to 20 mA transmitter spans 0 to 250 kPa. What pressure does 18 mA represent, in kPa?',218.75,'kPa','(18 − 4) / 16 = 0.875, and 0.875 × 250 = 218.75 kPa.'),
    mcq('s62q3','A 4 to 20 mA input suddenly reads 0.4 mA. What is the most likely cause?',['The process is at its lowest value','A broken wire or dead transmitter','A noisy signal','The ADC reference drifted'],1,'A healthy 4 to 20 mA loop never goes below 4 mA. Anything under about 3.6 mA is a wire break or a dead device.')
  ],
  recall:[ num('s62r1','A 12-bit ADC with a 3.3 V reference reads 1.65 V. What count does it give?',2048,'','1.65 / 3.3 × 4096 = 2048.') ],
  plant:{title:'Look at the scaling block',body:`<p>Open one analogue input in the program and check three things: the engineering range matches the transmitter nameplate, there is a wire-break check, and the alarm has a deadband. Those three catch most of the nuisance alarms.</p>`}
},
{ id:63, wk:13, day:3, track:'PLC', title:'Counting and totalising',
  kicker:'Pulses become frequency, frequency becomes flow, and the count becomes a volume.',
  learn:`<p>Flow meters, tachometers and encoders often give a <b>pulse train</b>. The meter datasheet gives a <b>K-factor</b>: pulses per litre (or per revolution). Everything follows from it:</p>
<div class="eq">f = N / T &nbsp;&nbsp; Q = f / K &nbsp;&nbsp; volume = N / K</div>
<p>Count the pulses N over a known gate time T for the frequency, then divide by K for the flow. For a <b>total</b>, keep adding the counts and divide by K only at the end, so no fractions are lost.</p>
<ul><li><b>Scan limits.</b> A normal input only sees a pulse if it is high at a scan. A scan of 10 ms can catch at most about 50 Hz reliably (one pulse per two scans). Faster signals need a <b>high-speed counter</b> input that counts in hardware.</li><li><b>Counter width.</b> A 16-bit counter rolls over at 65 536. At 250 Hz that is only 262 s. A 32-bit counter lasts about 199 days at the same rate, so use 32-bit for totals and handle the rollover.</li><li><b>Totals survive a stop.</b> Keep totals in retentive memory, or they restart at zero after a power cycle.</li></ul>`,
  diagram:'pulses',
  pins:['f = N / T; Q = f / K; volume = N / K','Add counts, divide by K last','Max reliable scan-counted frequency ≈ 1 / (2 × scan)','Use a high-speed counter for fast pulses','16-bit rolls over at 65 536'],
  worked:{prompt:'A flow meter has K = 500 pulses per litre. A high-speed counter sees 1500 pulses in a 6 s gate. Find the frequency, the flow in L/min and the volume passed. How long until a 16-bit counter rolls over at that rate?',
    steps:['Frequency: <span class="m">1500 / 6 = 250 Hz</span>','Flow: <span class="m">250 / 500 = 0.5 L/s = 30 L/min</span>','Volume: <span class="m">1500 / 500 = 3 L</span>','Rollover: <span class="m">65 536 / 250 = 262 s</span>'],
    answer:'250 Hz, 30 L/min, 3 L in the gate. A 16-bit counter fills in about 4.4 minutes, so use a 32-bit total (about 199 days at this rate).'},
  tryit:[
    num('s63q1','A PLC scans every 4 ms. What is the highest pulse frequency it can reliably count by scanning, using one pulse per two scans, in Hz?',125,'Hz','1 / (2 × 0.004) = 125 Hz.'),
    num('s63q2','A meter has K = 500 pulses per litre and the flow is 30 L/min. How many pulses arrive in 10 s?',2500,'pulses','30 L/min = 0.5 L/s, so 0.5 × 500 = 250 Hz, and 250 × 10 = 2500.'),
    num('s63q3','A totaliser holds 120 000 pulses and K = 500 pulses per litre. How many litres have passed?',240,'L','120 000 / 500 = 240 L.')
  ],
  recall:[ num('s63r1','A 12-bit ADC with a 3.3 V reference reads 3000 counts. What is the input voltage, in V?',2.417,'V','3000 / 4096 × 3.3 = 2.417 V.') ],
  plant:{title:'Where do the totals live?',body:`<p>Find one totaliser on site and ask three questions: what is its K-factor, how wide is the counter, and does the total survive a power cut? Mismatched K-factors after a meter swap are a classic reason a mass balance does not close.</p>`}
},
{ id:64, wk:13, day:4, track:'SENS', title:'Level, flow and pressure measurement',
  kicker:'Three plant measurements, three simple physical laws.',
  learn:`<p>Most plant measurements reduce to one law each:</p>
<ul><li><b>Level from pressure.</b> The bottom of a tank feels the weight of the liquid above it: <span class="m">ΔP = ρ g h</span>, so <span class="m">h = ΔP / (ρ g)</span>. For water that is 9.81 kPa per metre. A <b>differential</b> cell with the low side on the vapour space cancels the vessel pressure, so it works on closed tanks too.</li><li><b>Flow from differential pressure.</b> A restriction such as an orifice plate makes a pressure drop that grows with the <b>square</b> of the flow: <span class="m">Q ∝ √ΔP</span>. So the flow is the <b>square root</b> of the DP signal, and a transmitter at 25% DP is already at 50% flow.</li><li><b>Level or distance from time of flight.</b> An ultrasonic or radar unit sends a pulse and times the echo: <span class="m">d = c t / 2</span>. The factor 2 is the round trip. For ultrasonic, the speed of sound changes with temperature (about 0.6 m/s per °C), so good units compensate.</li></ul>
<p>Density matters for the first law, so a level cell on slurry, brine or hot oil must be scaled for that fluid, not for water. For all three, check the <b>impulse lines</b>: blocked or air-filled lines are the common cause of wrong DP readings.</p>`,
  diagram:'dplevel',
  pins:['ΔP = ρ g h; water 9.81 kPa per metre','Q ∝ √ΔP: 25% DP means 50% flow','d = c t / 2 for echo ranging','Scale for the real density','Check impulse lines first'],
  worked:{prompt:'A DP cell on a water tank reads 49.05 kPa. What is the level? Then an ultrasonic unit measures an echo time of 11.7 ms at 343 m/s. How far is the surface?',
    steps:['Level: <span class="m">h = 49 050 / (1000 × 9.81) = 5.0 m</span>','Echo distance: <span class="m">d = 343 × 0.0117 / 2 = 2.0 m</span>'],
    answer:'The tank holds 5.0 m of water. The ultrasonic surface is 2.0 m from the sensor (the 2 accounts for the there-and-back trip).'},
  tryit:[
    num('s64q1','A DP cell on a water tank reads 24.5 kPa. What is the level, in metres?',2.497,'m','24.5 kPa / 9.81 kPa per m = 2.50 m.'),
    num('s64q2','An ultrasonic sensor sees its echo after 8.0 ms in air at 343 m/s. How far away is the surface, in metres?',1.372,'m','d = 343 × 0.008 / 2 = 1.372 m.'),
    mcq('s64q3','An orifice-plate DP signal reads 25% of span. About what percentage of full flow is that?',['6%','25%','50%','75%'],2,'Flow follows the square root of DP: √0.25 = 0.5, so 50% of full flow.')
  ],
  recall:[ num('s64r1','A flow transmitter reads 80% of full flow. What percentage of the DP span is that?',64,'%','DP fraction = 0.8² = 0.64, so 64%.') ],
  plant:{title:'The wrong density',body:`<p>If a level reading drifts when the product changes, think density first: the DP cell measures weight, not height. Also check for a blocked low-side leg or a sensor that now sits in foam. A quick hand-dip against the reading settles it.</p>`}
},
{ id:65, wk:13, day:5, track:'REV', title:'Week 13 review',
  kicker:'From the sequence to the sensor, and back to a number on the screen.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Sequences</h4><p>One step active, set next and reset current, timeout every wait, bits = ⌈log₂ N⌉.</p></div>
<div class="cheat"><h4>Scaling and alarms</h4><p>Percent × span, 4 mA live zero, deadband and on-delay, 27648 counts full scale.</p></div>
<div class="cheat"><h4>Counting</h4><p>f = N / T, Q = f / K, volume = N / K, scan limit 1 / (2 × scan), use 32-bit totals.</p></div>
<div class="cheat"><h4>Measurement</h4><p>ΔP = ρ g h, Q ∝ √ΔP, d = c t / 2.</p></div>
</div>`,
  pins:['Every instrument loop is a chain: physics, signal, counts, engineering units, decision.'],
  worked:{prompt:'A level transmitter spans 0 to 5 m on 4 to 20 mA. The PLC reads 17280 of 27648 counts. What is the level and the current, and is a 3.0 m high alarm active?',
    steps:['Percent: <span class="m">17280 / 27648 = 0.625</span>','Level: <span class="m">0.625 × 5 = 3.125 m</span>','Current: <span class="m">4 + 0.625 × 16 = 14 mA</span>','Compare with the alarm: <span class="m">3.125 m ≥ 3.0 m</span>'],
    answer:'3.125 m at 14 mA, so the high alarm is active. With a 0.1 m deadband it will only clear below 2.9 m.'},
  tryit:[
    num('s65q1','The PLC reads 6912 counts of 27648 on a 0 to 5 m level range. What is the level, in metres?',1.25,'m','6912 / 27648 = 0.25, and 0.25 × 5 = 1.25 m.'),
    num('s65q2','A meter with K = 250 pulses per litre gives 125 Hz for 10 s. How many litres is that?',5,'L','125 × 10 = 1250 pulses. 1250 / 250 = 5 L.'),
    num('s65q3','A tank cycle takes 15 minutes. How many full cycles fit in an 8-hour shift?',32,'cycles','8 × 60 / 15 = 32.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week is about keeping people and plant safe and available: risk, isolation, reliability and maintenance. Before Monday, look at one guard or interlock near you and ask what happens if the switch fails.</p>`}
},
{ id:66, wk:14, day:1, track:'SAFE', title:'Risk assessment and performance levels',
  kicker:'Find the hazard, score it, reduce it, and prove the safety function is good enough.',
  learn:`<p>Risk assessment is a loop: <b>identify the hazard</b> (task by task), <b>estimate the risk</b>, <b>evaluate</b> whether it is acceptable, <b>reduce</b> it, and <b>review</b>. A simple estimate multiplies two scores:</p>
<div class="eq">risk = severity × likelihood</div>
<p>Reduce risk in this order, which is called the <b>hierarchy of controls</b>: <b>eliminate</b> or design out the hazard, <b>substitute</b>, apply <b>engineering controls</b> (fixed guards, interlocked guards, light curtains), then <b>administrative</b> controls (procedures, training, signs), and last <b>PPE</b>. Higher in the list is stronger, because it does not rely on people remembering.</p>
<p>When a safety <i>function</i> depends on a sensor, logic and an actuator, it must be reliable enough. Two standards express the target as the probability of dangerous failure per hour (PFH):</p>
<ul><li><b>ISO 13849:</b> performance levels a to e. PL d is a PFH from 10⁻⁷ to 10⁻⁶ per hour; PL e is 10⁻⁸ to 10⁻⁷.</li><li><b>IEC 62061 and IEC 61508:</b> SIL 1 to 3. SIL 2 is 10⁻⁷ to 10⁻⁶; SIL 3 is 10⁻⁸ to 10⁻⁷.</li></ul>
<p>For a chain in series (input, logic, output), the PFH values <b>add</b>. Use certified safety components and follow your site's safety standard, because the details of categories and architecture matter.</p>`,
  diagram:'riskmatrix',
  pins:['Risk = severity × likelihood','Eliminate first, PPE last','Series PFH values add','PL d is 10⁻⁷ to 10⁻⁶ per hour','Use certified safety components'],
  worked:{prompt:'A press hazard scores severity 4 and likelihood 3. An interlocked guard cuts likelihood to 1. What are the scores before and after? Then a safety function has sensor PFH 2×10⁻⁷, logic 3×10⁻⁷ and output 1×10⁻⁷ per hour. What is the total and the PL?',
    steps:['Before: <span class="m">4 × 3 = 12</span> (high). After: <span class="m">4 × 1 = 4</span> (low)','Total PFH: <span class="m">2 + 3 + 1 = 6 × 10⁻⁷ per hour</span>','That sits between 10⁻⁷ and 10⁻⁶, which is PL d'],
    answer:'The score falls from 12 to 4, a threefold reduction. The chain gives 6×10⁻⁷ per hour, which meets PL d, provided the architecture and diagnostics also meet the required category.'},
  tryit:[
    num('s66q1','A hazard has severity 5 and likelihood 4. What is the risk score?',20,'','5 × 4 = 20, in the extreme zone of the matrix.'),
    num('s66q2','A safety chain has input 1.5×10⁻⁷, logic 2.5×10⁻⁷ and output 1×10⁻⁷ per hour. What is the total, in units of 10⁻⁷ per hour?',5,'×10⁻⁷/h','1.5 + 2.5 + 1 = 5, so 5×10⁻⁷ per hour.'),
    mcq('s66q3','Which control is highest in the hierarchy of controls?',['Personal protective equipment','Warning signs','Designing the hazard out','An operator procedure'],2,'Eliminating the hazard by design beats everything below it, because nothing then depends on behaviour.')
  ],
  recall:[ num('s66r1','A light curtain safety distance uses S = K × T + C with K = 2000 mm/s, T = 0.25 s and C = 128 mm. What is S, in mm?',628,'mm','2000 × 0.25 = 500, plus 128 = 628 mm.') ],
  plant:{title:'Score one hazard',body:`<p>Pick one hazard from a job you did this month and score it twice: as it is, and with a proposed control. If the second score does not drop, the control is probably administrative and fragile. Look one step higher in the hierarchy.</p>`}
},
{ id:67, wk:14, day:2, track:'SAFE', title:'Electrical safety and isolation',
  kicker:'Prove it dead, with your own lock, before anyone puts a hand near it.',
  learn:`<p>Two ideas keep you alive around electrical equipment: <b>fault current must be big enough to trip the protection fast</b>, and <b>isolation must be proven</b>, not assumed.</p>
<p><b>Earth fault loop.</b> When a live conductor touches an earthed frame, the current is limited only by the loop impedance Zs:</p>
<div class="eq">I<sub>fault</sub> = U<sub>0</sub> / Z<sub>s</sub></div>
<p>A type B breaker trips magnetically at roughly 3 to 5 times its rating, so a 16 A breaker needs about 80 A or more. With Zs = 0.46 Ω on 230 V the fault current is 500 A, far above 80 A, so it clears almost at once. A high Zs, from a loose or corroded earth, can leave the fault current too low to trip, and the frame stays live.</p>
<p><b>Isolation (lock-out, tag-out).</b> Plan the job, notify those affected, isolate every source, apply <b>your own lock and tag</b>, release or restrain <b>stored energy</b>, then <b>prove dead</b> and try to start. Stored energy is not only electrical: hydraulic accumulators, springs and raised loads count.</p>
<p>A drive's DC bus capacitor is a good example. It holds <span class="m">E = ½ C V²</span> and discharges through its bleed resistor as <span class="m">V = V₀ e<sup>−t/RC</sup></span>, so the wait time is <span class="m">t = RC ln(V₀ / V)</span>. Always follow the drive's own discharge-time label and your site procedure, and measure before touching.</p>`,
  diagram:'lotoflow',
  pins:['I = U0 / Zs must exceed the trip current','Type B trips at about 3 to 5 times rating','Own lock, own tag, one lock per person','Release all stored energy','Prove dead: test, measure, test again'],
  worked:{prompt:'A motor frame fault sees loop impedance 0.46 Ω on 230 V, protected by a 16 A type B breaker (trips at about 5 × 16 A). Will it trip fast? Then a drive DC bus has 2000 µF at 565 V: how much energy is stored?',
    steps:['Fault current: <span class="m">230 / 0.46 = 500 A</span>','Trip threshold: <span class="m">5 × 16 = 80 A</span>, and 500 A is more than six times that','Energy: <span class="m">½ × 0.002 × 565² = 319 J</span>'],
    answer:'500 A against an 80 A threshold, so the breaker clears the fault almost instantly. The DC bus stores about 319 J, enough to hurt, which is why you wait and measure.'},
  tryit:[
    num('s67q1','A fault loop has Zs = 0.8 Ω on 230 V. What is the fault current, in A?',287.5,'A','230 / 0.8 = 287.5 A.'),
    num('s67q2','A DC bus has 2000 µF at 565 V. How much energy does it store, in joules?',319,'J','½ × 0.002 × 565² = 319 J.'),
    num('s67q3','A bleed resistor makes RC = 200 s. How long, in seconds, until 565 V falls to 50 V? (t = RC ln(V₀ / V))',485,'s','ln(565 / 50) = 2.425. 200 × 2.425 = 485 s, about 8 minutes.')
  ],
  recall:[ num('s67r1','A 400 V three-phase supply (line to line). What is the line to neutral voltage, in V?',231,'V','400 / √3 = 231 V.') ],
  plant:{title:'Your own lock',body:`<p>Next isolation you do, watch which step gets rushed. It is nearly always the last one: proving dead and trying to start. A test on a known live source before and after is what keeps a faulty tester from fooling you.</p>`}
},
{ id:68, wk:14, day:3, track:'SAFE', title:'Reliability and availability',
  kicker:'How often it fails, how long to fix it, and how redundancy changes the odds.',
  learn:`<p>Reliability is about <b>how long</b> something works; availability is about <b>how much of the time</b> it is ready. Three terms matter:</p>
<ul><li><b>MTBF:</b> mean time between failures. For a constant failure rate <span class="m">λ = 1 / MTBF</span>.</li><li><b>MTTR:</b> mean time to repair.</li><li><b>Availability:</b> <span class="m">A = MTBF / (MTBF + MTTR)</span>.</li></ul>
<p>The <b>bathtub curve</b> shows three phases: early-life failures (bad parts, bad installation), a long useful life with a roughly constant rate, and wear-out. During the useful life, the probability that an item is still working after time t is:</p>
<div class="eq">R(t) = e<sup>−t / MTBF</sup></div>
<p>Note what MTBF is not: it is not a guaranteed life. An item with an MTBF of 800 h only has an 88% chance of surviving 100 h, and about a 37% chance of surviving 800 h.</p>
<p><b>Series and parallel.</b> If everything must work (series), reliabilities multiply, so the chain is weaker than its weakest part. If any one is enough (parallel redundancy), the failure chances multiply instead:</p>
<div class="eq">series: R = R₁ R₂ &nbsp;&nbsp; parallel: R = 1 − (1 − R₁)(1 − R₂)</div>
<p>Cutting MTTR (spares on site, good fault finding) improves availability as surely as cutting failures does.</p>`,
  diagram:'bathtub',
  pins:['λ = 1 / MTBF; A = MTBF / (MTBF + MTTR)','R(t) = e^(−t / MTBF)','Series multiplies reliabilities','Parallel multiplies failure chances','Shorter MTTR raises availability too'],
  worked:{prompt:'A pump has MTBF = 800 h and MTTR = 4 h. Find its availability and the chance it survives 100 h. Then two such 0.9-reliable pumps are fitted in parallel with one needed: what is the pair reliability?',
    steps:['Availability: <span class="m">800 / (800 + 4) = 0.995</span>, or 99.5%','Survival: <span class="m">R(100) = e<sup>−100/800</sup> = e<sup>−0.125</sup> = 0.8825</span>','Parallel pair: <span class="m">1 − 0.1 × 0.1 = 0.99</span>'],
    answer:'99.5% available, an 88% chance of surviving 100 h without failure, and 0.99 for the redundant pair compared with 0.90 for a single pump.'},
  tryit:[
    num('s68q1','A gearbox has MTBF = 200 h and MTTR = 8 h. What is its availability, in percent?',96.15,'%','200 / 208 = 0.9615, so 96.15%.'),
    num('s68q2','An item has MTBF = 500 h. What is the probability it is still running after 100 h?',0.819,'','R = e^(−100/500) = e^(−0.2) = 0.8187.'),
    num('s68q3','Two parts with reliabilities 0.95 and 0.90 must both work (series). What is the system reliability?',0.855,'','0.95 × 0.90 = 0.855.')
  ],
  recall:[ num('s68r1','A motor draws 15 A and its nameplate current is 12 A. What load is that, in percent of rated current?',125,'%','15 / 12 = 1.25, so 125%.') ],
  plant:{title:'MTBF is a clue, not a promise',body:`<p>Look at one critical item and ask two questions: how long does it take to get it running again (spares, access, permits) and what happens if it fails during the next shutdown rather than during the quiet week? The answers usually point to a cheaper fix than a new component.</p>`}
},
{ id:69, wk:14, day:4, track:'SAFE', title:'Maintenance and condition monitoring',
  kicker:'Listen to the machine early, and plan the repair before the failure.',
  learn:`<p>There are four broad maintenance strategies: <b>run to failure</b> (fine for cheap, non-critical items), <b>preventive</b> (time-based, replace on a schedule), <b>predictive</b> or <b>condition-based</b> (act on measured condition), and <b>reliability-centred</b> (choose the right one per failure mode).</p>
<p>Condition monitoring measures something that changes <b>before</b> failure. The common ones are vibration, temperature, oil analysis, motor current and ultrasound.</p>
<ul><li><b>Vibration spectrum.</b> Peaks sit at multiples of running speed. <span class="m">1X = rpm / 60</span> Hz: a 1480 rpm motor gives 24.7 Hz. High 1X suggests <b>imbalance</b>; high 2X suggests <b>misalignment</b> or looseness. Bearing defects show up at their own higher frequencies.</li><li><b>Temperature.</b> A common rule of thumb for insulation and lubricant life is that life roughly <b>halves for every 10 °C</b> above rating. Twenty degrees too hot means about a quarter of the life.</li><li><b>Trending.</b> A single number means little. A rising trend tells you when to act: <span class="m">time to limit = (limit − now) / rate of rise</span>.</li></ul>
<p>Set alert levels so you have time to plan the job, not just to react. Take readings the same way each time, at the same place and under the same load, or the trend is meaningless.</p>`,
  diagram:'vibspec',
  pins:['1X = rpm / 60','High 1X: imbalance; high 2X: misalignment','Life halves per 10 °C above rating','Time to limit = (limit − now) / rate','Same place, same load, every time'],
  worked:{prompt:'A motor runs at 1480 rpm. Where do its 1X and 2X vibration peaks appear? Its vibration is 2.0 mm/s and rising 0.15 mm/s per week toward a 4.5 mm/s alarm: how long until the limit?',
    steps:['1X: <span class="m">1480 / 60 = 24.7 Hz</span>','2X: <span class="m">2 × 24.7 = 49.3 Hz</span>','Time to limit: <span class="m">(4.5 − 2.0) / 0.15 = 16.7 weeks</span>'],
    answer:'Look at 24.7 Hz and 49.3 Hz. At the current trend the alarm level is about 17 weeks away, so the repair can be planned into the next suitable shutdown.'},
  tryit:[
    num('s69q1','A 2970 rpm motor. At what frequency does its 1X vibration peak appear, in Hz?',49.5,'Hz','2970 / 60 = 49.5 Hz.'),
    num('s69q2','A motor winding runs 20 °C above its rated temperature. Using the halving rule, what fraction of normal insulation life remains, in percent?',25,'%','20 °C is two 10 °C steps: ½ × ½ = ¼, which is 25%.'),
    num('s69q3','Vibration is 3.0 mm/s and rising 0.25 mm/s per week. The alarm level is 4.5 mm/s. How many weeks remain?',6,'weeks','(4.5 − 3.0) / 0.25 = 6 weeks.')
  ],
  recall:[ num('s69r1','A motor with 1500 rpm synchronous speed runs at 1480 rpm. What is its slip, in percent?',1.33,'%','(1500 − 1480) / 1500 = 1.33%.') ],
  plant:{title:'Trend, do not snapshot',body:`<p>Pick one rotating machine and write down the last three vibration or temperature readings with their dates. If you cannot find them, or they were taken at different loads, that is the first improvement to make.</p>`}
},
{ id:70, wk:14, day:5, track:'REV', title:'Extension review and what next',
  kicker:'From a pulse on a wire to a plan you can defend.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>PLC practice</h4><p>Step bits, timeouts, percent × span, deadband and on-delay, N / T, Q = f / K, 32-bit totals.</p></div>
<div class="cheat"><h4>Measurement</h4><p>ΔP = ρ g h, Q ∝ √ΔP, d = c t / 2, 4 to 20 mA live zero.</p></div>
<div class="cheat"><h4>Safety</h4><p>Risk = S × L, hierarchy of controls, series PFH adds, I = U₀ / Zs, prove dead, E = ½ C V².</p></div>
<div class="cheat"><h4>Reliability</h4><p>A = MTBF / (MTBF + MTTR), R = e^(−t / MTBF), series multiplies, parallel 1 − (1 − R)².</p></div>
</div>`,
  pins:['The best engineers connect the number to the plant: what does it mean, and what do we do about it?'],
  worked:{prompt:'A filling skid meter has K = 500 pulses per litre and reads 250 Hz. How long does it take to deliver 600 L, and how many pulses is that? Is a 16-bit counter enough?',
    steps:['Flow: <span class="m">250 / 500 = 0.5 L/s</span>','Time: <span class="m">600 / 0.5 = 1200 s = 20 min</span>','Pulses: <span class="m">600 × 500 = 300 000</span>','A 16-bit counter holds 65 536 so it would roll over four times'],
    answer:'20 minutes and 300 000 pulses. Use a 32-bit total, because a 16-bit counter would wrap about every 4.4 minutes at this rate.'},
  tryit:[
    num('s70q1','A pump has MTBF = 1000 h and MTTR = 10 h. What is its availability, in percent?',99.01,'%','1000 / 1010 = 0.9901, so 99.01%.'),
    num('s70q2','A fault loop has Zs = 0.5 Ω on 230 V. What is the fault current, in A?',460,'A','230 / 0.5 = 460 A.'),
    num('s70q3','A DP cell reads 19.62 kPa on water. What is the level, in metres?',2,'m','19.62 / 9.81 = 2.0 m.')
  ],
  recall:[],
  plant:{title:'What next',body:`<p>You now have the full chain from a resistor to a risk register. Keep the weekday habit light: one drill a week, one topic a month to go deeper on, and one real number from site that you work out on paper. If you want a new track later, the natural next steps are motion control tuning, safety PLC programming, and a deeper dive into your own plant's instrument loops.</p>`}
}
);

/* ---------------- hints, watch-outs, formulas ---------------- */
const F=(n,f,note)=>({n,f,note:note||''});
const HINTS={
 s61q1:'Count how many different patterns n bits can make: 2ⁿ.',s61q2:'Divide 60 minutes by the cycle time.',s61q3:'Which feature compares time in the step with what is normal?',s61r1:'Think of two scans in the worst case.',
 s62q1:'Percent first, then multiply by the span.',s62q2:'Remove the 4 mA offset, divide by the 16 mA span, then scale.',s62q3:'Is 0.4 mA possible on a healthy 4 to 20 mA loop?',s62r1:'1.65 V is half of 3.3 V.',
 s63q1:'One pulse needs two scans to be seen reliably.',s63q2:'Convert L/min to L/s, multiply by K for Hz, then by the time.',s63q3:'Total pulses divided by K.',s63r1:'Counts divided by 4096, times the reference.',
 s64q1:'Divide by 9.81 kPa per metre.',s64q2:'Distance is c × t / 2, with t in seconds.',s64q3:'Flow is the square root of DP.',s64r1:'Square the flow fraction.',
 s65q1:'Percent first, then multiply by the 5 m span.',s65q2:'Pulses = f × T, then divide by K.',s65q3:'8 hours in minutes, divided by the cycle.',
 s66q1:'Severity times likelihood.',s66q2:'Series PFH values just add.',s66q3:'Remove the hazard instead of managing it.',s66r1:'K × T first, then add C.',
 s67q1:'Current = voltage divided by loop impedance.',s67q2:'E = ½ C V². Convert µF to F.',s67q3:'t = RC × ln(565 / 50). The natural log.',s67r1:'Divide by the square root of 3.',
 s68q1:'MTBF over MTBF plus MTTR.',s68q2:'e raised to minus t over MTBF.',s68q3:'Series: just multiply.',s68r1:'Measured over rated.',
 s69q1:'rpm divided by 60.',s69q2:'Two halvings.',s69q3:'Remaining margin divided by the weekly rise.',s69r1:'(ns − n) / ns.',
 s70q1:'MTBF / (MTBF + MTTR).',s70q2:'Voltage over impedance.',s70q3:'Divide by 9.81 kPa per metre.'
};
const WATCH={
 61:['Setting the next step without resetting the current one.','Waiting steps with no timeout.'],
 62:['Skipping the 4 mA offset when scaling by hand.','Alarms with no deadband that chatter.'],
 63:['Counting fast pulses with a normal scanned input.','Using a 16-bit total that quietly wraps.'],
 64:['Scaling a DP level for water when the fluid is not water.','Forgetting the square root on a DP flow signal.'],
 65:['Mixing counts, percent and engineering units in one step.','Forgetting the live zero.'],
 66:['Adding procedures when a physical guard is possible.','Adding up PFH values from different time bases.'],
 67:['Trusting a switch position instead of proving dead.','Forgetting stored energy after the supply is off.'],
 68:['Treating MTBF as a guaranteed life.','Counting redundancy that shares a single point of failure.'],
 69:['Readings taken at different loads and places.','Waiting for the alarm level instead of the trend.'],
 70:['Giving a number without saying what it means for the plant.','Stopping at the formula and skipping the units.']
};
const FORMULAS={
 61:[F('State bits','⌈log₂ N⌉'),F('Timeout','≈ 1.5 × normal')],
 62:[F('Scale','lo + % × (hi − lo)'),F('4-20 mA','4 + 16 × %'),F('Alarm off','limit − deadband')],
 63:[F('Frequency','f = N / T'),F('Flow','Q = f / K'),F('Volume','N / K'),F('Scan limit','1 / (2 × scan)')],
 64:[F('Level','h = ΔP / (ρ g)'),F('Flow','Q ∝ √ΔP'),F('Echo','d = c t / 2')],
 65:[F('Percent','(raw − lo) / (hi − lo)'),F('Volume','N / K')],
 66:[F('Risk','S × L'),F('Series PFH','Σ PFH')],
 67:[F('Fault current','U<sub>0</sub> / Z<sub>s</sub>'),F('Energy','½ C V²'),F('Discharge','t = RC ln(V<sub>0</sub>/V)')],
 68:[F('Availability','MTBF / (MTBF + MTTR)'),F('Survival','e<sup>−t/MTBF</sup>'),F('Parallel','1 − (1 − R)²')],
 69:[F('1X','rpm / 60'),F('Heat rule','life ÷ 2 per 10 °C'),F('Time to limit','(limit − now) / rate')],
 70:[F('Availability','MTBF / (MTBF + MTTR)'),F('Level','ΔP / (ρ g)')]
};
SESSIONS.forEach(s=>{ if(s.id<61) return;
  [...(s.tryit||[]),...(s.recall||[])].forEach(q=>{ if(HINTS[q.id]) q.hint=HINTS[q.id]; });
  if(WATCH[s.id]) s.watch=WATCH[s.id];
  if(FORMULAS[s.id]) s.formulas=FORMULAS[s.id];
});
if(window.RT.HINTS){Object.assign(window.RT.HINTS,HINTS);Object.assign(window.RT.WATCH,WATCH);Object.assign(window.RT.FORMULAS,FORMULAS);}
})();
