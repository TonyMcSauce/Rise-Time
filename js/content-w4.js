/* ============ RISE TIME : week 4 content (AC power, op amps, resonance) ============ */
(function(){
const {SESSIONS, DIAG, comp, wire, dot, gnd, txt, sch, term, num, mcq, f2, plotPath, arrowDefs} = window.RT;

DIAG.acpower = function(){
  let b=arrowDefs;
  const o=[70,200], px=o[0]+170, py=o[1]-150;
  b+=`<line class="vec" x1="${o[0]}" y1="${o[1]}" x2="${px}" y2="${o[1]}" marker-end="url(#ah)"/>`;
  b+=`<line class="proj c2" x1="${px}" y1="${o[1]}" x2="${px}" y2="${py}"/>`;
  b+=`<line class="vec amb" x1="${o[0]}" y1="${o[1]}" x2="${px}" y2="${py}" marker-end="url(#ah)"/>`;
  b+=`<path class="arc" d="M${o[0]+44},${o[1]} A44,44 0 0 0 ${o[0]+33},${o[1]-29}"/>`;
  b+=txt(o[0]+52,o[1]-8,'φ','lab amber','start');
  b+=txt(o[0]+85,o[1]+22,'P = 2070 W  (real, does work)','lab c1t');
  b+=txt(px+14,o[1]-80,'Q = 1826 var','lab c2t','start')+txt(px+14,o[1]-64,'(reactive, shuttles)','lab dim','start');
  b+=txt(o[0]+70,o[1]-100,'S = 2760 VA','lab amber','end');
  b+=txt(o[0],22,'The power triangle: S² = P² + Q²','lab dim','start');
  return sch(520,235,b,'Apparent power is the hypotenuse; only the real part does work');
};
DIAG.opamp = function(){
  let b='';
  b+=`<polygon points="150,40 150,160 270,100" />`;
  b+=txt(168,76,'−','big')+txt(168,134,'+','big');
  b+=wire('90,76 150,76')+wire('90,124 150,124')+wire('270,100 340,100');
  b+=term(90,76,'V−','end')+term(90,124,'V+','end')+term(340,100,'Vout','start');
  b+=txt(210,30,'+Vs','lab dim')+txt(210,184,'−Vs','lab dim');
  b+=`<rect x="400" y="40" width="220" height="120" rx="6" class="boxn"/>`;
  b+=txt(414,66,'Golden rules','lab amber','start')+txt(414,84,'(with negative feedback)','lab dim','start');
  b+=txt(414,112,'1. V+ = V−','lab','start')+txt(414,134,'2. No current enters','lab','start')+txt(414,150,'    either input','lab','start');
  return sch(640,200,b,'The ideal op amp: two rules that make every circuit solvable');
};
DIAG.rlc = function(){
  let b='';
  b+=comp('AC',40,50,40,150,'Vs',1)+wire('40,50 90,50');
  b+=comp('R',90,50,170,50,'R')+comp('L',170,50,250,50,'L')+wire('250,50 290,50');
  b+=comp('C',290,50,290,150,'C',-1)+wire('40,150 290,150');
  const X=f=>340+f*60, Y=g=>170-g*115;
  const fn=f=>1/Math.sqrt(1+Math.pow(5*(f-1/f)/1.4,2)*0.16*6);
  b+=`<line class="axis" x1="340" y1="170" x2="540" y2="170"/><line class="axis" x1="340" y1="176" x2="340" y2="40"/>`;
  b+=`<path class="trace c1s" d="${plotPath(f=>fn(f),0.35,2.7,X,Y,160)}"/>`;
  b+=`<line class="tick dash" x1="${X(1)}" y1="170" x2="${X(1)}" y2="${Y(1)}"/>`;
  b+=txt(X(1),188,'f₀','lab amber')+txt(X(2.6),188,'f','lab dim')+txt(334,50,'I','lab dim','end');
  b+=txt(X(1)+8,Y(1)-6,'peak: Z = R','lab c1t','start');
  return sch(570,210,b,'Series RLC: reactances cancel at f₀ and the current peaks');
};
DIAG.opampcircuits = function(){
  let b='';
  // inverting: - input on top, + input to ground below
  b+=`<polygon points="170,60 170,150 250,105"/>`+txt(180,86,'−','lab')+txt(180,134,'+','lab');
  b+=term(50,80,'Vin','end')+comp('R',50,80,110,80,'Rin',-1)+wire('110,80 170,80')+dot(110,80);
  b+=wire('170,132 150,132')+gnd(150,132);
  b+=wire('110,80 110,34')+comp('R',110,34,260,34,'Rf',-1).replace(/y="\d+"/,'y="12"')+wire('260,34 260,105')+wire('250,105 290,105')+term(290,105,'Vout','start')+dot(260,105);
  b+=txt(150,190,'Inverting','lab amber')+txt(150,208,'Gain = −Rf / Rin','lab c1t');
  // non-inverting: + input on top gets Vin, divider on the - input below
  const X=350;
  b+=`<polygon points="${X+110},60 ${X+110},150 ${X+190},105"/>`+txt(X+120,86,'+','lab')+txt(X+120,134,'−','lab');
  b+=term(X,80,'Vin','end')+wire(`${X},80 ${X+110},80`);
  b+=wire(`${X+110},132 ${X+85},132`)+dot(X+85,132)+comp('R',X+85,132,X+15,132,'Rg',1)+wire(`${X+15},132 ${X+15},142`)+gnd(X+15,142);
  b+=wire(`${X+85},132 ${X+85},180`)+comp('R',X+85,180,X+225,180,'Rf',-1)+wire(`${X+225},180 ${X+225},105`)+wire(`${X+190},105 ${X+225},105 ${X+250},105`)+term(X+250,105,'Vout','start')+dot(X+225,105);
  b+=txt(X+90,222,'Non-inverting','lab amber')+txt(X+90,240,'Gain = 1 + Rf / Rg','lab c2t');
  return sch(680,250,b,'The two workhorse amplifier circuits');
};
SESSIONS.push(
{ id:16, wk:4, day:1, track:'CIRC', title:'AC power, RMS and power factor',
  kicker:'Why the nameplate says kVA and kW, and why those two numbers are never the same.',
  learn:`<p>A sinusoid swings between +Vp and −Vp, so its simple average is zero. Engineers quote the <b>RMS</b> value instead: the DC voltage that would heat a resistor by the same amount. For a sine wave it is the peak divided by √2.</p>
<div class="eq">V<sub>rms</sub> = V<sub>p</sub> / √2 &nbsp;&nbsp;&nbsp; 230 V<sub>rms</sub> → 325 V peak</div>
<p>With a reactive load the current lags (or leads) the voltage by a phase angle <b>φ</b>. That splits power into three kinds:</p>
<div class="eq">S = V·I (VA) &nbsp;&nbsp; P = V·I·cos φ (W) &nbsp;&nbsp; Q = V·I·sin φ (var)</div>
<p><b>Real power P</b> does work and makes heat. <b>Reactive power Q</b> is energy that sloshes back and forth into magnetic and electric fields. <b>Apparent power S</b> is what the cables and transformers must carry. The ratio <span class="m">pf = P/S = cos φ</span> is the <b>power factor</b>.</p>
<p>A poor power factor means more current for the same real power, so thicker cable, hotter transformers and, often, a penalty on the electricity bill. Fix it by adding capacitance to cancel the inductive Q.</p>`,
  diagram:'acpower', sim:'acpower',
  pins:['Vrms = Vpeak / √2 (sine waves only)','P = VI cos φ, Q = VI sin φ, S = VI','S² = P² + Q²; pf = P / S','Capacitors supply the reactive power inductive loads need'],
  worked:{prompt:'A motor draws 12 A at 230 V with a power factor of 0.75 lagging. Find S, P and Q, then the capacitor needed to correct to 0.95.',
    steps:['<span class="m">S = 230 × 12 = 2760 VA</span>','<span class="m">P = 2760 × 0.75 = 2070 W</span>, and <span class="m">Q = 2760 × sin(41.4°) = 1826 var</span>','At pf 0.95, φ = 18.19°, so <span class="m">Q<sub>new</sub> = 2070 × tan(18.19°) = 680 var</span>','Capacitor must supply the difference: <span class="m">1826 − 680 ≈ 1145 var</span>','<span class="m">C = Q / (ωV²) = 1145 / (314.2 × 230²) = 68.9 µF</span>'],
    answer:'About 69 µF across the motor cuts the supply current from 12 A to 9.5 A with the same real power.'},
  tryit:[
    num('s16q1','What is the peak voltage of a 230 V RMS supply?',325.3,'V','Vp = 230 × √2 = 325.3 V. Insulation and capacitors must be rated for the peak, not the RMS.'),
    num('s16q2','A load draws 10 A at 230 V with power factor 0.8. How much real power does it use?',1840,'W','P = V·I·pf = 230 × 10 × 0.8 = 1840 W.'),
    num('s16q3','For that same load, what is the reactive power?',1380,'var','sin φ = √(1 − 0.8²) = 0.6, so Q = 2300 × 0.6 = 1380 var.')
  ],
  recall:[ num('s16r1','A 12 V supply is connected across a 470 Ω resistor. How much power does it dissipate, in milliwatts?',306.4,'mW','P = V²/R = 144/470 = 0.3064 W = 306.4 mW.') ],
  plant:{title:'Reading a motor nameplate',body:`<p>A motor nameplate lists kW (shaft output), volts, amps, efficiency and cos φ. Electrical input is shaft power ÷ efficiency, and the current follows from the apparent power. A lightly loaded motor has a much worse power factor than a fully loaded one, because the magnetising current stays the same while the real current drops.</p><p>That's why oversized motors on small duties hurt your site power factor, and why capacitor banks are often switched in steps by a controller.</p>`}
},
{ id:17, wk:4, day:2, track:'ELEC', title:'Op amps: the two golden rules',
  kicker:'A tiny triangle that does most of the analogue work on a plant.',
  learn:`<p>An op amp is a differential amplifier with enormous gain, typically 100 000 or more. It outputs <span class="m">Vout = A(V+ − V−)</span>. On its own that is useless, because any tiny input difference slams the output to the supply rail. That's exactly how a <b>comparator</b> works.</p>
<p>The magic happens when you add <b>negative feedback</b>, feeding part of the output back to the inverting input. The output moves until the two inputs are almost equal, because only then does the amplifier stop pushing. From that, two rules follow:</p>
<div class="eq">Rule 1: V+ = V− &nbsp;&nbsp;&nbsp; Rule 2: input currents ≈ 0</div>
<p>Rule 1 is the <b>virtual short</b>. Rule 2 comes from the very high input impedance. Together they let you analyse a circuit with just Ohm's law and Kirchhoff's current law at the inverting node.</p>
<p>The simplest example is the <b>voltage follower</b> (buffer). Connect the output straight back to V−. Then Vout = V+. Gain of one sounds pointless, but it isolates a weak source from a heavy load, which is very handy for sensors.</p>`,
  diagram:'opamp', sim:'opamp',
  pins:['Vout = A(V+ − V−), A is huge','Negative feedback forces V+ ≈ V−','Inputs draw no current','Without feedback it is a comparator; output saturates'],
  worked:{prompt:'An op amp with feedback has its non-inverting input at 0 V. The inverting input connects to a 2 V source through 10 kΩ, and a 30 kΩ resistor goes from output back to the inverting input. Find Vout.',
    steps:['Rule 1: V− = V+ = 0 V (a virtual ground)','Current in: <span class="m">I = (2 − 0) / 10 kΩ = 0.2 mA</span>','Rule 2: that current cannot enter the op amp, so it all flows through the 30 kΩ','<span class="m">Vout = 0 − 0.2 mA × 30 kΩ = −6 V</span>'],
    answer:'Vout = −6 V. Gain is −30k/10k = −3, and the sign flips because the output pulls current the other way.'},
  tryit:[
    mcq('s17q1','With negative feedback, what is the voltage between the two inputs of an ideal op amp?',['About zero','Equal to Vout','Equal to the supply','Infinite'],0,'Feedback drives the output until V+ and V− match. A real amp with gain 100 000 and a 10 V output needs only 100 µV of difference.'),
    num('s17q2','An op amp has open-loop gain 100 000. Its output is 10 V. What input difference is needed, in microvolts?',100,'µV','V+ − V− = Vout/A = 10/100 000 = 100 µV.'),
    num('s17q3','A non-inverting amplifier has Rf = 90 kΩ and Rg = 10 kΩ. What is the output for a 0.3 V input?',3,'V','Gain = 1 + 90k/10k = 10, so Vout = 0.3 × 10 = 3 V.')
  ],
  recall:[ num('s17r1','What is the rms value of a sine wave with a 170 V peak?',120.2,'V','Vrms = 170 / √2 = 120.2 V.') ],
  plant:{title:'Where op amps hide',body:`<p>Inside many analogue input cards, 4-20 mA transmitters, sensor amplifiers and signal isolators there is an op amp doing exactly what we covered today. A buffer protects a high-impedance sensor from the load of the next stage. A comparator with a little hysteresis makes a clean switching point from a noisy signal.</p><p>If a signal looks flat at the supply voltage, think saturation: the op amp has run out of range, or feedback has been lost.</p>`}
},
{ id:18, wk:4, day:3, track:'CIRC', title:'Impedance networks and resonance',
  kicker:'Put a coil and a capacitor together and they trade energy at one special frequency.',
  learn:`<p>Reactance changes with frequency. An inductor's rises with it, <span class="m">X<sub>L</sub> = 2πfL</span>, and a capacitor's falls, <span class="m">X<sub>C</sub> = 1/(2πfC)</span>. In a series RLC circuit the impedance is:</p>
<div class="eq">Z = R + j(X<sub>L</sub> − X<sub>C</sub>)</div>
<p>At one frequency the two reactances are equal and cancel. This is <b>resonance</b>:</p>
<div class="eq">f<sub>0</sub> = 1 / (2π√(LC)) &nbsp;&nbsp;&nbsp; Q = (1/R)√(L/C) &nbsp;&nbsp;&nbsp; BW = f<sub>0</sub> / Q</div>
<p>At f₀, <span class="m">Z = R</span>, the minimum possible, so the current peaks. The <b>quality factor Q</b> tells you how sharp the peak is. A low resistance gives a high Q, a tall narrow peak, and large voltages across L and C (each can be Q times the source!).</p>
<p>Resonance is useful in radio tuning and filters, but it is also a hazard. A drive's long cable has inductance and capacitance, and ringing at its resonance can overvoltage a motor winding.</p>`,
  diagram:'rlc', sim:'freq',
  pins:['XL = 2πfL rises with f; XC = 1/(2πfC) falls','Z = R + j(XL − XC)','f₀ = 1/(2π√LC); at f₀, Z = R','Q = √(L/C)/R; BW = f₀/Q'],
  worked:{prompt:'A series circuit has L = 10 mH, C = 10 µF and R = 5 Ω. Find f₀, Q and the bandwidth.',
    steps:['<span class="m">f₀ = 1 / (2π√(0.01 × 10×10⁻⁶)) = 1 / (2π × 3.162×10⁻⁴) = 503 Hz</span>','<span class="m">Q = (1/5) × √(0.01 / 10×10⁻⁶) = 0.2 × 31.6 = 6.32</span>','<span class="m">BW = 503 / 6.32 = 79.6 Hz</span>'],
    answer:'Resonant at 503 Hz, Q of 6.3, 80 Hz wide. With a 10 V source, the capacitor sees about 63 V at resonance.'},
  tryit:[
    num('s18q1','What is the resonant frequency of a 1 mH inductor with a 1 µF capacitor?',5033,'Hz','f₀ = 1/(2π√(10⁻⁹)) = 1/(2π × 3.162×10⁻⁵) = 5033 Hz.'),
    num('s18q2','What is the reactance of a 50 mH inductor at 50 Hz?',15.71,'Ω','XL = 2π × 50 × 0.05 = 15.71 Ω.'),
    num('s18q3','A series RLC circuit with R = 10 Ω is driven at resonance by 20 V. What current flows?',2,'A','At resonance the reactances cancel, so I = V/R = 20/10 = 2 A.')
  ],
  recall:[ num('s18r1','What time constant does a 100 kΩ resistor with a 10 µF capacitor give?',1,'s','τ = RC = 100 000 × 0.00001 = 1 s.') ],
  plant:{title:'Ringing on VSD cables',body:`<p>A variable speed drive switches its output in fast edges. A long motor cable acts as a distributed L and C, and the fast edge excites its resonance. The result is voltage overshoot at the motor terminals, sometimes close to twice the DC bus voltage.</p><p>That is why long runs often use output reactors or dV/dt filters: they damp the resonance and protect winding insulation. Now you know what they are doing.</p>`}
},
{ id:19, wk:4, day:4, track:'ELEC', title:'Op amp circuits: inverting, non-inverting, summing',
  kicker:'Three recipes that cover most analogue signal handling.',
  learn:`<p>Apply the two golden rules to a resistor pair and you get the building blocks of analogue electronics.</p>
<p><b>Inverting amplifier.</b> The input goes through Rin to V−, which sits at virtual ground. All the current flows through Rf:</p>
<div class="eq">V<sub>out</sub> = −(R<sub>f</sub> / R<sub>in</sub>) V<sub>in</sub></div>
<p><b>Non-inverting amplifier.</b> The input drives V+; Rf and Rg form a divider back to V−, which must match V+:</p>
<div class="eq">V<sub>out</sub> = (1 + R<sub>f</sub> / R<sub>g</sub>) V<sub>in</sub></div>
<p><b>Summing amplifier.</b> Several inputs through their own resistors meet at the same virtual ground. Currents add, so the outputs add (inverted):</p>
<div class="eq">V<sub>out</sub> = −R<sub>f</sub> (V₁/R₁ + V₂/R₂ + …)</div>
<p>Useful practical rules: the non-inverting gain can never be below 1, the inverting stage has an input impedance of Rin (not infinite), and gain × bandwidth is roughly constant for a real op amp.</p>`,
  diagram:'opampcircuits', sim:'opamp',
  pins:['Inverting: −Rf/Rin, input impedance = Rin','Non-inverting: 1 + Rf/Rg, minimum gain 1','Summing: currents add at the virtual ground','Choose resistors 10 kΩ to 100 kΩ for most signal work'],
  worked:{prompt:'A temperature sensor gives 10 mV/°C. You want 0 to 100 °C to span 0 to 5 V into a PLC input. Design the stage.',
    steps:['Sensor output at 100 °C: <span class="m">10 mV × 100 = 1 V</span>','Gain needed: <span class="m">5 V / 1 V = 5</span>','Non-inverting stage: <span class="m">1 + Rf/Rg = 5, so Rf = 4 Rg</span>','Pick <span class="m">Rg = 10 kΩ, Rf = 40 kΩ</span> (use 39 kΩ plus a trim, or 2 × 20 kΩ)'],
    answer:'Non-inverting amp, gain 5, Rg = 10 kΩ and Rf ≈ 40 kΩ. Non-inverting keeps the high input impedance a sensor likes.'},
  tryit:[
    num('s19q1','An inverting amplifier has Rin = 10 kΩ and Rf = 47 kΩ. What is its gain?',-4.7,'','Gain = −Rf/Rin = −47/10 = −4.7.'),
    num('s19q2','A non-inverting amplifier has Rf = 47 kΩ and Rg = 10 kΩ. What is its gain?',5.7,'','Gain = 1 + 47/10 = 5.7.'),
    num('s19q3','A summing amplifier has two 10 kΩ inputs carrying 1 V and 2 V, with Rf = 10 kΩ. What is Vout?',-3,'V','Vout = −10k × (1/10k + 2/10k) = −3 V.')
  ],
  recall:[ num('s19r1','A series RLC circuit has a 22 mH coil and a 4.7 µF capacitor. What is f₀?',494.9,'Hz','f₀ = 1/(2π√(0.022 × 4.7×10⁻⁶)) = 494.9 Hz.') ],
  plant:{title:'Signal scaling you will actually meet',body:`<p>Most plant instruments arrive as 4-20 mA, but strain gauges, thermocouples and RTDs give tiny voltages that need amplifying first. The scaling stage is just a non-inverting or differential amp with a carefully chosen gain, followed by a filter and an ADC.</p><p>When a transmitter's output reads high or low by a fixed percentage, suspect a resistor in this gain network: drift, a wrong value fitted, or a damaged trim pot.</p>`}
},
{ id:20, wk:4, day:5, track:'REV', title:'Week 4 review: a load cell weighing chain',
  kicker:'Tie AC power, op amps and resonance together on a real measurement.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>AC power</h4><p>Vrms = Vp/√2. S = VI, P = VI cos φ, Q = VI sin φ. pf = P/S. Add capacitors to cancel inductive Q.</p></div>
<div class="cheat"><h4>Op amp rules</h4><p>V+ = V− and no input current, but only with negative feedback. No feedback means a comparator.</p></div>
<div class="cheat"><h4>Gains</h4><p>Inverting −Rf/Rin. Non-inverting 1 + Rf/Rg. Summing adds currents at the virtual ground.</p></div>
<div class="cheat"><h4>Resonance</h4><p>f₀ = 1/(2π√LC). At f₀, Z = R. Q = √(L/C)/R. BW = f₀/Q.</p></div>
</div>`,
  pins:['A strain gauge bridge gives millivolts: amplify first, filter next, convert last'],
  worked:{prompt:'A 5000 kg load cell is rated 2 mV/V and excited with 10 V. An instrumentation amplifier with gain ≈ 500 (G = 1 + 50 kΩ/Rg, Rg = 100 Ω) feeds a 0 to 10 V input. What is the output at 3250 kg?',
    steps:['Full-scale cell output: <span class="m">2 mV/V × 10 V = 20 mV</span>','Gain: <span class="m">1 + 50 000 / 100 = 501</span>','Full scale after amplifier: <span class="m">20 mV × 501 ≈ 10 V</span>','At 3250 kg: <span class="m">(3250 / 5000) × 10 V = 6.5 V</span>'],
    answer:'6.5 V. The same chain also explains why a wrong Rg shifts every reading by a fixed percentage.'},
  tryit:[
    num('s20q1','A 2 mV/V load cell is excited with 5 V and loaded to half its rating. The amplifier gain is 200. What is the output?',1,'V','Full-scale cell output = 2 × 5 = 10 mV. Half load = 5 mV. × 200 = 1 V.'),
    num('s20q2','What non-inverting gain scales a 0 to 50 mV signal to 0 to 5 V?',100,'','5 V / 50 mV = 100.'),
    num('s20q3','A 6 kW load at power factor 0.6 draws how much apparent power, in kVA?',10,'kVA','S = P / pf = 6 / 0.6 = 10 kVA.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week is power electronics: diodes, transistors, PWM and three-phase. Find one switch-mode power supply or drive in your area and read its label for input range and output rating. We'll use that kind of label to ground the calculations.</p>`}
}
);
})();
