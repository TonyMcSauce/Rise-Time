/* ============ RISE TIME : week 5 content (power electronics) ============ */
(function(){
const {SESSIONS, DIAG, comp, wire, dot, gnd, txt, sch, term, num, mcq, f2, plotPath, arrowDefs} = window.RT;

DIAG.bridge = function(){
  let b='';
  const L=[110,110],T=[170,50],R=[230,110],B=[170,170];
  b+=comp('AC',30,70,30,150,'',1)+txt(18,114,'~','lab dim','end');
  b+=wire('30,70 60,70 60,110 110,110')+dot(110,110);
  b+=comp('D',L[0],L[1],T[0],T[1],'')+comp('D',R[0],R[1],T[0],T[1],'')+comp('D',B[0],B[1],L[0],L[1],'')+comp('D',B[0],B[1],R[0],R[1],'');
  b+=dot(T[0],T[1])+dot(B[0],B[1])+dot(R[0],R[1]);
  b+=wire('30,150 30,205 260,205 260,110 230,110');
  b+=wire(`${T[0]},${T[1]} 300,50`)+comp('R',300,50,300,170,'Load',-1)+wire(`300,170 ${B[0]},170`);
  b+=txt(T[0],38,'+','lab amber')+txt(B[0],188,'−','lab amber');
  const X=t=>372+t*26, Y=v=>150-v*100;
  const rect=t=>Math.abs(Math.sin(t)), sm=t=>{const k=Math.floor((t-Math.PI/2)/Math.PI), pk=Math.PI/2+k*Math.PI;return Math.max(rect(t), t>=pk?Math.exp(-(t-pk)*0.55):0);};
  b+=`<line class="axis" x1="372" y1="150" x2="545" y2="150"/><line class="axis" x1="372" y1="170" x2="372" y2="40"/>`;
  b+=`<path class="trace c2s" d="${plotPath(rect,0,6.2,X,Y,160)}" style="opacity:.45"/>`;
  b+=`<path class="trace c1s" d="${plotPath(sm,0,6.2,X,Y,200)}"/>`;
  b+=txt(372,26,'dim = rectified','lab dim','start')+txt(372,42,'bright = smoothed','lab c1t','start');
  b+=txt(460,192,'ripple = the dip between peaks','lab amber');
  return sch(570,225,b,'A bridge turns both halves of the AC wave into the same polarity');
};
DIAG.transistor = function(){
  let b=arrowDefs;
  b+=txt(120,24,'+24 V','lab amber')+wire('120,32 120,60')+comp('L',120,60,120,130,'relay coil',1)+comp('D',190,130,190,60,'',-1,'hot')+wire('120,60 190,60')+wire('120,130 190,130')+dot(120,60)+dot(120,130);
  b+=wire('120,130 120,150');
  b+=`<circle cx="130" cy="180" r="30" class="ring"/><line x1="115" y1="165" x2="115" y2="195"/><line x1="115" y1="172" x2="132" y2="158"/><line x1="115" y1="188" x2="132" y2="202"/><polygon points="132,202 122,200 128,193" class="fillw"/>`;
  b+=wire('132,158 132,150 120,150')+wire('132,202 132,222')+gnd(132,222);
  b+=comp('R',70,180,115,180,'Rb',-1)+term(70,180,'from PLC/MCU','end');
  b+=txt(300,70,'Saturated: Vce ≈ 0.2 V','lab c1t','start')+txt(300,92,'Cut-off: Ic ≈ 0','lab dim','start');
  b+=txt(300,128,'Rb = (Vin − 0.7) / Ib','lab amber','start')+txt(300,150,'Ib ≥ Ic / 10 (forced β)','lab amber','start');
  return sch(500,245,b,'A transistor as a switch: the base current is the key');
};
DIAG.hbridge = function(){
  let b='';
  b+=txt(190,24,'+V','lab amber')+wire('90,32 290,32')+wire('90,32 90,70')+wire('290,32 290,70');
  b+=comp('S',90,70,90,120,'S1',1)+comp('S',290,70,290,120,'S2',-1);
  b+=wire('90,120 90,140 290,140 290,120')+dot(90,140)+dot(290,140);
  b+=`<circle cx="190" cy="140" r="22" class="ring"/>`+txt(190,145,'M','big');
  b+=wire('90,140 168,140')+wire('212,140 290,140');
  b+=comp('S',90,160,90,210,'S3',1)+comp('S',290,160,290,210,'S4',-1);
  b+=wire('90,140 90,160')+wire('290,140 290,160')+wire('90,210 90,226 290,226 290,210')+gnd(190,226);
  b+=txt(340,76,'S1 + S4 on: forward','lab c1t','start')+txt(340,98,'S2 + S3 on: reverse','lab c2t','start')+txt(340,120,'S3 + S4 on: brake (motor shorted)','lab dim','start')+txt(340,152,'Never both switches of one leg','lab amber','start')+txt(340,170,'(S1 + S3, S2 + S4): shoot-through','lab amber','start');
  return sch(660,250,b,'Four switches reverse the current through the motor');
};
DIAG.threephase = function(){
  let b=arrowDefs;
  const X=t=>40+t*70, Y=v=>110-v*60;
  b+=`<line class="axis" x1="40" y1="110" x2="${X(6.4)}" y2="110"/><line class="axis" x1="40" y1="180" x2="40" y2="30"/>`;
  [['c1s',0],['c2s',-2*Math.PI/3],['c3s',-4*Math.PI/3]].forEach(([c,p])=>{
    b+=`<path class="trace ${c}" d="${plotPath(t=>Math.sin(t+p),0,2*Math.PI,X,Y,140)}"/>`;
  });
  b+=txt(X(1.35),Y(1)-8,'L1','lab c1t')+txt(X(3.45),Y(1)-8,'L2','lab c2t')+txt(X(5.5),Y(1)-8,'L3','lab c3t');
  b+=txt(X(3.14),200,'120° apart, so total instantaneous power is constant','lab amber');
  b+=`<g transform="translate(540 100)"><text class="lab dim" x="0" y="-30">Line 400 V</text><text class="lab dim" x="0" y="-12">Phase 230 V</text><text class="lab amber" x="0" y="20">VL = √3 · VP</text></g>`;
  return sch(660,215,b,'Three sine waves offset by 120 degrees');
};
SESSIONS.push(
{ id:21, wk:5, day:1, track:'ELEC', title:'Diodes and rectifiers',
  kicker:'A one-way valve for current, and how it turns AC into the DC your electronics need.',
  learn:`<p>A diode conducts when its anode is more positive than its cathode by about <b>0.7 V</b> (silicon), and blocks the other way. Use <span class="m">V<sub>out</sub> = V<sub>in</sub> − 0.7</span> as the working rule.</p>
<p>A <b>half-wave</b> rectifier passes only one half of the sine. A <b>bridge rectifier</b> uses four diodes so both halves point the same way, and two diodes are always in the path, so you lose about 1.4 V.</p>
<div class="eq">V<sub>peak</sub> = V<sub>rms</sub>·√2 − 1.4 V &nbsp;&nbsp;(bridge)</div>
<p>The output is a bumpy 100 Hz (on 50 Hz mains) pulse train. A <b>smoothing capacitor</b> fills the gaps. It discharges into the load between peaks, giving <b>ripple</b>:</p>
<div class="eq">ΔV ≈ I<sub>load</sub> / (f<sub>ripple</sub> · C) &nbsp;&nbsp; f<sub>ripple</sub> = 100 Hz for a bridge on 50 Hz</div>
<p>More capacitance or less current means less ripple. Other diodes worth knowing: <b>Zener</b> (regulates a voltage in breakdown), <b>Schottky</b> (low 0.3 V drop, fast), and <b>LEDs</b> (about 2 V, always limit the current).</p>`,
  diagram:'bridge', sim:'rectifier',
  pins:['Silicon diode drops about 0.7 V; Schottky about 0.3 V','Bridge: two diodes in the path, lose 1.4 V','Ripple ΔV = I / (f·C), f = 2 × mains for full wave','Always limit LED current with a series resistor'],
  worked:{prompt:'A transformer gives 18 V RMS to a bridge rectifier with a 4700 µF smoothing capacitor, supplying 1 A. Find the peak output and the ripple.',
    steps:['Peak AC: <span class="m">18 × √2 = 25.46 V</span>','Minus two diodes: <span class="m">25.46 − 1.4 = 24.06 V</span>','Ripple frequency on a 50 Hz supply: 100 Hz','<span class="m">ΔV = 1 / (100 × 0.0047) = 2.13 V</span>'],
    answer:'The rail swings between about 24.06 V and 21.9 V. Fine for a regulator, not fine for a motor that cares.'},
  tryit:[
    num('s21q1','A half-wave rectifier with one 0.7 V diode is fed 12 V RMS. What is the peak output?',16.27,'V','12 × √2 = 16.97 V, minus 0.7 V = 16.27 V.'),
    num('s21q2','A bridge rectifier is fed 12 V RMS. What is the peak output?',15.57,'V','16.97 V − 1.4 V = 15.57 V.'),
    num('s21q3','A bridge with a 2200 µF capacitor supplies 1 A on a 50 Hz supply. What is the ripple?',4.55,'V','ΔV = 1 / (100 × 0.0022) = 4.55 V.')
  ],
  recall:[ num('s21r1','A non-inverting amplifier has Rf = 20 kΩ and Rg = 10 kΩ. What is the gain?',3,'','Gain = 1 + 20/10 = 3.') ],
  plant:{title:'Why the 24 V supply hums',body:`<p>Most control panels have a 24 V DC supply, either linear (transformer, bridge, capacitor, regulator) or switch-mode. In older panels a failing smoothing capacitor shows up as excess ripple: relays chatter, PLC inputs flicker and analogue readings jitter at 100 Hz.</p><p>An oscilloscope on the 24 V rail is the quickest way to see it. A healthy rail is a flat line; a sick one has a visible sawtooth.</p>`}
},
{ id:22, wk:5, day:2, track:'ELEC', title:'Transistors as switches: BJT and MOSFET',
  kicker:'How a tiny signal switches a big load, and why the base resistor matters.',
  learn:`<p>A transistor is a switch that another signal controls. Two families matter on a plant:</p>
<p><b>BJT (bipolar).</b> Current controlled. A small base current Ib lets a larger collector current flow, <span class="m">Ic = β·Ib</span>. To use it as a hard switch, drive it into <b>saturation</b> with a base current of about <b>Ic/10</b> (the "forced β" rule). In saturation Vce is only about 0.2 V, so it barely heats.</p>
<div class="eq">R<sub>b</sub> = (V<sub>in</sub> − 0.7) / I<sub>b</sub> &nbsp;&nbsp; I<sub>b</sub> ≈ I<sub>c</sub> / 10</div>
<p><b>MOSFET.</b> Voltage controlled. The gate draws almost no current once charged; a gate voltage above the threshold (logic-level types about 5 V, standard about 10 V) turns the channel on, with a tiny resistance <b>Rds(on)</b>. Power lost is <span class="m">P = I²·R<sub>ds(on)</sub></span>, so a 20 mΩ part at 30 A dissipates only 18 W.</p>
<p>Always add a <b>flyback diode</b> across inductive loads and a pull-down on the gate or base so the device is off during start-up.</p>`,
  diagram:'transistor',
  pins:['BJT: current controlled, Ic = β·Ib; saturate with Ib ≈ Ic/10','MOSFET: voltage controlled, loss = I²·Rds(on)','Add a flyback diode across relays and solenoids','Pull-down resistor keeps the switch off at power-up'],
  worked:{prompt:'A 3.3 V microcontroller must switch a relay coil drawing 200 mA through an NPN transistor. Find the base resistor and check the pin limit.',
    steps:['Forced β rule: <span class="m">Ib = 200 mA / 10 = 20 mA</span>','<span class="m">Rb = (3.3 − 0.7) / 0.02 = 130 Ω</span>','But a typical MCU pin only supplies 5 to 20 mA, so this fails','Fix: use a logic-level MOSFET (no gate current) or a Darlington pair that needs far less base current'],
    answer:'The maths gives 130 Ω, but the pin cannot deliver 20 mA. That is the reason MOSFET drivers dominate modern designs.'},
  tryit:[
    num('s22q1','A BJT must switch 100 mA with a forced β of 10 from a 5 V signal. What base resistor is needed?',430,'Ω','Ib = 100/10 = 10 mA. Rb = (5 − 0.7)/0.01 = 430 Ω.'),
    num('s22q2','A MOSFET with Rds(on) = 20 mΩ carries 30 A. How much power does it dissipate?',18,'W','P = I²R = 900 × 0.02 = 18 W.'),
    mcq('s22q3','Which device is controlled by voltage rather than by current?',['MOSFET','BJT','Both','Neither'],0,'A MOSFET gate is insulated, so a voltage creates the channel and almost no current flows. A BJT needs a continuous base current.')
  ],
  recall:[ num('s22r1','A bridge rectifier is fed 18 V RMS. What is the DC peak after two diode drops?',24.06,'V','18 × √2 = 25.46 V, minus 1.4 V = 24.06 V.') ],
  plant:{title:'Why PLC outputs come in two flavours',body:`<p>Digital output cards are either <b>relay</b> or <b>transistor</b>. Relay outputs switch AC or DC loads and last about 100 000 operations. Transistor outputs (a MOSFET inside) switch only DC, are very fast and have no moving contacts, but they have a small leakage current when off and a tight current limit.</p><p>Driving a small relay from a transistor card is the classic way to protect it from a heavy or inductive load.</p>`}
},
{ id:23, wk:5, day:3, track:'ELEC', title:'Power electronics: PWM and the H-bridge',
  kicker:'Switching on and off very fast to deliver any voltage you like, with almost no loss.',
  learn:`<p>A linear regulator burns the excess voltage as heat. A <b>PWM</b> (pulse width modulation) stage instead switches fully on and off, thousands of times a second. The load, usually an inductor-like motor, sees the <b>average</b>:</p>
<div class="eq">V<sub>avg</sub> = D × V<sub>supply</sub> &nbsp;&nbsp; D = t<sub>on</sub> / T (duty cycle)</div>
<p>The motor winding's inductance smooths the current. The remaining wobble is the <b>ripple</b>, and it is smaller with a higher switching frequency or more inductance:</p>
<div class="eq">ΔI ≈ V<sub>s</sub>·D·(1 − D) / (f·L)</div>
<p>A DC motor then turns at a speed set by its back-EMF: <span class="m">ω = V<sub>avg</sub> / K<sub>e</sub></span> (unloaded). Change the duty cycle, change the speed.</p>
<p>To reverse direction you need an <b>H-bridge</b>: four switches around the motor. Turn on one diagonal pair for forward, the other for reverse. Never turn on both switches of one leg together. That's <b>shoot-through</b>, a dead short across the supply. Real drivers insert a short <b>dead time</b> between switching one off and the other on.</p>`,
  diagram:'hbridge', sim:'pwm',
  pins:['Vavg = D × Vs; speed ∝ duty cycle','Higher f or bigger L means less ripple','H-bridge: diagonal pairs for forward and reverse','Dead time prevents shoot-through'],
  worked:{prompt:'A 48 V supply drives a DC motor with Ke = 0.05 V·s/rad at D = 0.35, switching at 20 kHz with a 1 mH motor inductance. Find the average voltage, the no-load speed and the current ripple.',
    steps:['<span class="m">V<sub>avg</sub> = 0.35 × 48 = 16.8 V</span>','<span class="m">ω = 16.8 / 0.05 = 336 rad/s</span>','Convert: <span class="m">336 × 60 / 2π = 3209 rpm</span>','<span class="m">ΔI = 48 × 0.35 × 0.65 / (20 000 × 0.001) = 0.546 A</span>'],
    answer:'16.8 V average, about 3200 rpm, with roughly 0.55 A of ripple, which is small if the load current is several amps.'},
  tryit:[
    num('s23q1','A 24 V supply is PWM-switched at 60% duty. What is the average voltage?',14.4,'V','Vavg = 0.6 × 24 = 14.4 V.'),
    num('s23q2','A 24 V PWM stage at D = 0.5 uses a 2 mH motor and switches at 10 kHz. What is the current ripple?',0.3,'A','ΔI = 24 × 0.5 × 0.5 / (10 000 × 0.002) = 0.3 A.'),
    mcq('s23q3','What is shoot-through in an H-bridge?',['Both switches in one leg conducting at once, shorting the supply','The motor reversing too quickly','Back-EMF exceeding the supply','PWM duty reaching 100%'],0,'High-side and low-side on together make a dead short. Gate drivers add dead time to prevent it.')
  ],
  recall:[ num('s23r1','A 200 mA relay coil is driven by an NPN with forced β of 10. What base current is needed, in mA?',20,'mA','Ib = Ic/10 = 200/10 = 20 mA.') ],
  plant:{title:'Inside a small DC drive',body:`<p>A 24 V or 48 V DC drive on a conveyor or a servo axis is an H-bridge with a current sensor and a controller. The speed command sets the duty cycle; the current loop limits it to protect the motor. The audible whine in some drives is the switching frequency or its sub-harmonics, so a higher switching frequency usually means quieter operation and more switching loss in the MOSFETs.</p>`}
},
{ id:24, wk:5, day:4, track:'CIRC', title:'Three-phase power',
  kicker:'Why industry runs on three wires, and the single factor, √3, that keeps tripping people up.',
  learn:`<p>Three-phase supplies carry three sine waves, each offset by <b>120°</b>. Add three phases together and the instantaneous power delivered to a balanced load is <b>constant</b>, which is why three-phase motors run smoothly and need less copper than single-phase for the same power.</p>
<p>Two voltages exist: the <b>phase</b> voltage (line to neutral, 230 V) and the <b>line</b> voltage (between any two lines, 400 V). They're related by <span class="m">V<sub>L</sub> = √3 · V<sub>P</sub></span>.</p>
<div class="eq">P = √3 · V<sub>L</sub> · I<sub>L</sub> · cos φ &nbsp;&nbsp; S = √3 · V<sub>L</sub> · I<sub>L</sub></div>
<p>Always use <b>line values</b> in that formula, the ones you read on a clamp meter and a nameplate. A motor's winding is connected in <b>star (Y)</b> or <b>delta (Δ)</b>. In star the line current equals the phase current; in delta the line voltage equals the phase voltage. A star-delta starter reduces starting current by connecting in star first, then switching to delta.</p>
<p>An AC motor's field rotates at the <b>synchronous speed</b> <span class="m">n<sub>s</sub> = 120 f / p</span> rpm, where p is the number of poles. The shaft turns slightly slower: the difference is <b>slip</b>.</p>`,
  diagram:'threephase', sim:'threephase',
  pins:['Phases are 120° apart; power is constant','VL = √3 × VP (400 V line from 230 V phase)','P = √3 · VL · IL · cos φ using line values','ns = 120f/p (1500 rpm for 4 poles at 50 Hz)'],
  worked:{prompt:'An 11 kW (shaft) motor on a 400 V supply has efficiency 0.9 and power factor 0.85. What line current does it draw?',
    steps:['Electrical input: <span class="m">11 000 / 0.9 = 12 222 W</span>','Rearrange: <span class="m">I = P / (√3 · V · cos φ)</span>','<span class="m">I = 12 222 / (1.732 × 400 × 0.85) = 20.8 A</span>'],
    answer:'About 20.8 A per line. Use this to size cables, contactors and the overload relay.'},
  tryit:[
    num('s24q1','What is the line voltage of a system with 230 V phase voltage?',398.4,'V','VL = √3 × 230 = 398.4 V, which is why we call it 400 V.'),
    num('s24q2','A balanced load draws 10 A at 400 V line voltage with a power factor of 0.8. What real power does it use?',5543,'W','P = √3 × 400 × 10 × 0.8 = 5543 W.'),
    num('s24q3','What is the synchronous speed of a 4-pole motor on a 50 Hz supply?',1500,'rpm','ns = 120 × 50 / 4 = 1500 rpm.')
  ],
  recall:[ num('s24r1','A 24 V PWM stage runs at a duty of 25%. What is the average voltage?',6,'V','Vavg = 0.25 × 24 = 6 V.') ],
  plant:{title:'Clamp meters and unbalance',body:`<p>On a healthy motor the three line currents are equal within a few percent. A large unbalance points to a loose lug, a failing contactor pole, a blown fuse or a developing winding fault. Measuring all three phases with a clamp meter takes a minute and is one of the best condition checks on rotating equipment.</p><p>A single-phase condition (one phase lost) makes the other two currents jump, and the motor overheats quickly.</p>`}
},
{ id:25, wk:5, day:5, track:'REV', title:'Week 5 review: a 24 V rail under load',
  kicker:'Diodes, capacitors, transistors, PWM and three-phase in one design check.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Rectifier</h4><p>Vpeak = Vrms√2 − 1.4. Ripple = I/(2f·C) → I/(100·C) on 50 Hz mains.</p></div>
<div class="cheat"><h4>Transistor</h4><p>BJT: Ib = Ic/10, Rb = (Vin−0.7)/Ib. MOSFET: P = I²Rds(on).</p></div>
<div class="cheat"><h4>PWM</h4><p>Vavg = D·Vs. ΔI = Vs·D(1−D)/(fL). H-bridge diagonals; avoid shoot-through.</p></div>
<div class="cheat"><h4>Three-phase</h4><p>VL = √3·VP. P = √3·VL·IL·cos φ. ns = 120f/p.</p></div>
</div>`,
  pins:['Size the capacitor from the ripple you can tolerate, then check the minimum voltage'],
  worked:{prompt:'A 24 V DC rail is made from 18 V RMS through a bridge rectifier and a 2200 µF capacitor. A load takes 2 A. A regulator needs at least 15 V in. Does it work?',
    steps:['Peak: <span class="m">18 × √2 − 1.4 = 24.06 V</span>','Ripple: <span class="m">2 / (100 × 0.0022) = 9.09 V</span>','Minimum: <span class="m">24.06 − 9.09 = 14.97 V</span>, just under 15 V','Fix: 10 000 µF gives <span class="m">2 / (100 × 0.01) = 2 V</span> ripple, minimum 22.06 V'],
    answer:'It fails marginally with 2200 µF and works comfortably with 10 000 µF. Check the minimum, not the average.'},
  tryit:[
    num('s25q1','A bridge rectifier supplies 2 A with a 10 000 µF capacitor. What is the ripple?',2,'V','ΔV = 2 / (100 × 0.01) = 2 V.'),
    num('s25q2','What capacitance gives 0.5 V ripple at 1 A on a 50 Hz full-wave supply, in microfarads?',20000,'µF','C = I / (f·ΔV) = 1 / (100 × 0.5) = 0.02 F = 20 000 µF.'),
    num('s25q3','A 5.5 kW shaft-output motor has efficiency 0.88 and power factor 0.85 on 400 V. What is its line current?',10.6,'A','Input = 5500/0.88 = 6250 W. I = 6250 / (1.732 × 400 × 0.85) = 10.6 A.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week is sensors and signals. Find one thermocouple or RTD on the plant and trace where its signal goes: head transmitter, cable, card. Note the type if it is labelled.</p>`}
}
);
})();
