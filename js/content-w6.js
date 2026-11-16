/* ============ RISE TIME : week 6 content (sensors and signals) ============ */
(function(){
const {SESSIONS, DIAG, comp, wire, dot, gnd, txt, sch, term, num, mcq, f2, plotPath, arrowDefs} = window.RT;
const cvd = T => 100*(1+3.9083e-3*T-5.775e-7*T*T);

DIAG.rtd = function(){
  const X=t=>60+t*0.7, Y=r=>190-(r-100)*0.9;
  let b=`<line class="axis" x1="60" y1="190" x2="${X(520)}" y2="190"/><line class="axis" x1="60" y1="200" x2="60" y2="20"/>`;
  b+=`<path class="trace c1s" d="${plotPath(cvd,0,500,X,Y,100)}"/>`;
  [0,100,200,300,400,500].forEach(t=>{b+=`<line class="tick" x1="${X(t)}" y1="186" x2="${X(t)}" y2="194"/>`+txt(X(t),208,t,'lab dim');});
  [[0,'100 Ω'],[100,'138.5 Ω'],[300,'212.0 Ω'],[500,'281.0 Ω']].forEach(([t,l])=>{b+=`<circle class="node" cx="${X(t)}" cy="${f2(Y(cvd(t)))}" r="3.4"/>`+txt(X(t)+(t===0?8:-8),Y(cvd(t))+(t===0?-8:-4),l,'lab amber',t===0?'start':'end');});
  b+=txt(250,150,'Pt100: nearly linear,','lab dim','start')+txt(250,168,'about 0.385 Ω per °C','lab dim','start')+txt(56,16,'R (Ω)','lab dim','end')+txt(X(500),224,'°C','lab dim');
  return sch(480,232,b,'A Pt100 resistance climbs smoothly with temperature');
};
DIAG.lowpass = function(){
  let b='';
  b+=txt(40,28,'Vin','lab dim')+wire('40,40 40,50')+comp('R',40,50,160,50,'R')+wire('160,50 220,50')+comp('C',220,50,220,140,'C',-1)+wire('40,140 220,140')+dot(220,50)+term(250,50,'Vout','start').replace('<circle','<circle style="display:none"').replace(/<text/,'<text');
  b+=wire('220,50 250,50');
  b+=gnd(130,140);
  const f=x=>-10*Math.log10(1+Math.pow(Math.pow(10,x),2));
  const X=x=>340+(x+1.5)*66, Y=db=>60-db*3.2;
  b+=`<line class="axis" x1="340" y1="60" x2="540" y2="60"/><line class="axis" x1="340" y1="40" x2="340" y2="190"/>`;
  b+=`<path class="trace c2s" d="${plotPath(f,-1.5,1.5,X,Y,100)}"/>`;
  b+=`<line class="tick dash" x1="${X(0)}" y1="60" x2="${X(0)}" y2="${f2(Y(-3.01))}"/>`;
  b+=txt(X(0),48,'fc: −3 dB','lab amber')+txt(X(1),Y(-20.04)-8,'−20 dB / decade','lab c2t')+txt(440,206,'frequency (log scale)','lab dim')+txt(130,185,'fc = 1/(2πRC)','lab c1t');
  return sch(570,215,b,'A first-order low-pass filter passes slow signals and cuts fast ones');
};
DIAG.quad = function(){
  let b='';
  const X=t=>60+t*40;
  const sq=(ph,y)=>{let d=`M${X(0)},${y}`;let lvl=0;for(let t=0;t<=12;t+=0.5){const hi=((Math.floor((t+ph)/1)%2)===1);}return d;};
  const wave=(shift,y)=>{let d='';let prev=null;for(let i=0;i<=12;i++){const hi=(Math.floor((i+shift)/2)%2)===1;const yy=hi?y-30:y;const x=X(i/1.2);if(prev===null)d+=`M${f2(x)},${f2(yy)}`;else{if(prev!==yy)d+=`L${f2(x)},${f2(prev)}L${f2(x)},${f2(yy)}`;else d+=`L${f2(x)},${f2(yy)}`;}prev=yy;}return d;};
  b+=`<path class="trace c1s" d="${wave(1,80)}"/><path class="trace c2s" d="${wave(0,150)}"/>`;
  b+=txt(30,70,'A','lab c1t','end')+txt(30,140,'B','lab c2t','end');
  for(let i=0;i<=8;i++) b+=`<line class="tick dash" x1="${X(i/1.2*1)}" y1="40" x2="${X(i/1.2)}" y2="165"/>`.replace(/x1="[^"]+"/,`x1="${f2(X(i/1.2))}"`);
  b+=txt(300,194,'Forward: A leads B by 90° · Reverse: B leads A','lab amber');
  b+=txt(300,22,'Count every edge of A and B: 4 counts per pulse (×4 decoding)','lab dim');
  return sch(560,210,b,'Quadrature outputs give direction as well as position');
};
DIAG.adc = function(){
  const X=t=>60+t*50, Y=v=>185-v*16.5;
  let b=`<line class="axis" x1="60" y1="180" x2="500" y2="180"/><line class="axis" x1="60" y1="190" x2="60" y2="20"/>`;
  b+=`<path class="trace c1s" d="${plotPath(t=>5+4*Math.sin(t*0.9),0,8.5,X,Y,160)}" style="opacity:.6"/>`;
  let d='';
  for(let i=0;i<=16;i++){const t=i*0.5,v=Math.round(5+4*Math.sin(t*0.9));d+=`<line class="tick dash" x1="${f2(X(t))}" y1="180" x2="${f2(X(t))}" y2="${f2(Y(v))}"/><circle class="node" cx="${f2(X(t))}" cy="${f2(Y(v))}" r="3.2"/>`;}
  b+=d;
  for(let k=0;k<=10;k+=2) b+=txt(52,Y(k)+4,k,'lab dim','end');
  b+=txt(490,200,'time','lab dim','end')+txt(60,12,'ADC samples at fixed times, rounds to the nearest level','lab amber','start');
  b+=txt(280,210,'LSB = full scale / 2ⁿ','lab c1t');
  return sch(540,222,b,'Sampling picks moments in time; quantising picks levels in value');
};
SESSIONS.push(
{ id:26, wk:6, day:1, track:'SENS', title:'Temperature: RTDs and thermocouples',
  kicker:'Two sensors, two physics, and a few ways they mislead you if you let them.',
  learn:`<p>The two workhorse industrial temperature sensors work very differently.</p>
<p><b>RTD (resistance temperature detector).</b> A platinum element whose resistance rises with temperature. A Pt100 reads <b>100 Ω at 0 °C</b> and about <b>138.5 Ω at 100 °C</b>. The curve is nearly straight, about 0.385 Ω/°C. Accurate and stable, good to about 600 °C.</p>
<div class="eq">R(T) ≈ 100 (1 + 3.908×10⁻³ T − 5.775×10⁻⁷ T²) Ω</div>
<p>You measure a resistance, so the <b>lead wires</b> matter. With 2 wires their resistance adds directly: 1 Ω of lead resistance reads as <b>2.6 °C</b> too hot. Three-wire and four-wire hookups cancel this.</p>
<p><b>Thermocouple.</b> Two dissimilar metals joined at the hot end produce a small voltage (microvolts per degree), set by the <b>difference</b> between the hot junction and the cold junction where the wires meet your instrument. So you must add the <b>cold-junction compensation</b>: measure the terminal temperature and add its equivalent voltage. Type K is the common general-purpose one, about 41 µV/°C, usable to 1200 °C.</p>
<p>Rule of thumb: RTD for accuracy below 500 °C, thermocouple for high temperature and fast response.</p>`,
  diagram:'rtd', sim:'temperature',
  pins:['Pt100: 100 Ω at 0 °C, 0.385 Ω per °C','2-wire leads add error; use 3-wire or 4-wire','Thermocouple voltage depends on hot minus cold junction','Always add cold-junction compensation'],
  worked:{prompt:'A Pt100 on a 2-wire connection has 0.5 Ω in each lead. The true temperature is 100 °C. What does the instrument read?',
    steps:['True element: <span class="m">R = 138.51 Ω</span> at 100 °C','Leads add: <span class="m">138.51 + 0.5 + 0.5 = 139.51 Ω</span>','Error in °C: <span class="m">1 Ω / 0.385 Ω/°C = 2.6 °C</span>','Reading ≈ <span class="m">102.6 °C</span>'],
    answer:'It reads about 2.6 °C high. A 3-wire connection measures the lead resistance and subtracts it.'},
  tryit:[
    num('s26q1','What is the resistance of a Pt100 at 100 °C?',138.5,'Ω','R = 100 × (1 + 0.39083 − 0.005775) = 138.5 Ω.'),
    num('s26q2','A 2-wire Pt100 has 2 Ω of total lead resistance. How many °C of error does that cause?',5.19,'°C','2 Ω / 0.385 Ω/°C = 5.19 °C too high.'),
    num('s26q3','A type K thermocouple gives 9.138 mV after adding cold-junction compensation. Using 200 °C = 8.138 mV and 300 °C = 12.209 mV, what is the temperature?',224.6,'°C','Interpolate: 200 + (9.138 − 8.138)/(12.209 − 8.138) × 100 = 224.6 °C.')
  ],
  recall:[ num('s26r1','A 4-20 mA transmitter spans 0 to 200 °C and reads 12 mA. What is the temperature?',100,'°C','(12 − 4)/16 = 0.5, so 0.5 × 200 = 100 °C.') ],
  plant:{title:'Bearing and winding temperatures',body:`<p>Large motors and gearboxes carry Pt100s in the windings and bearings. A protection relay trips at a set value (often 130 °C for windings, 90 to 100 °C for bearings). A reading that jumps between normal and a huge number points to an open sensor or a broken wire, not a real temperature.</p><p>A reading of exactly −50 °C or well over 800 °C is the classic open-circuit and short-circuit signature.</p>`}
},
{ id:27, wk:6, day:2, track:'SENS', title:'Signal conditioning and filters',
  kicker:'Get the signal you want, and throw away the noise you do not.',
  learn:`<p>Raw sensor signals are small, noisy and often the wrong shape for an input card. <b>Signal conditioning</b> fixes that: amplify, filter, isolate, convert.</p>
<p>The simplest filter is the <b>RC low-pass</b>. It passes slow signals and attenuates fast ones, with a corner at:</p>
<div class="eq">f<sub>c</sub> = 1 / (2πRC) &nbsp;&nbsp; |H| = 1 / √(1 + (f/f<sub>c</sub>)²)</div>
<p>At fc the gain is 0.707 (−3 dB). Beyond it the gain falls at <b>20 dB per decade</b> (a decade is a ×10 in frequency). The decibel is just a log of the ratio: <span class="m">dB = 20 log₁₀(Vout/Vin)</span>, and −20 dB means one tenth.</p>
<p>Use a low-pass before an ADC to remove noise and prevent aliasing, a <b>high-pass</b> to remove DC offset, and a <b>notch</b> to kill 50 Hz mains pickup. Higher-order filters (second order, Butterworth) cut off much more sharply.</p>
<p>The price of filtering is <b>delay</b>. A filter with a long time constant makes the signal slow to respond, which can destabilise a control loop. Choose fc well above the signal's bandwidth, and well below the noise.</p>`,
  diagram:'lowpass', sim:'freq',
  pins:['fc = 1/(2πRC), gain 0.707 (−3 dB) at fc','First-order roll-off: −20 dB per decade','dB = 20 log₁₀(Vout/Vin)','Filtering adds delay: do not over-filter a control signal'],
  worked:{prompt:'A 10 kΩ and 10 µF RC low-pass is used to filter a slow level signal. How much does it attenuate 50 Hz mains pickup?',
    steps:['<span class="m">fc = 1 / (2π × 10 000 × 10×10⁻⁶) = 1.59 Hz</span>','<span class="m">|H| = 1 / √(1 + (50/1.59)²) = 0.0318</span>','In dB: <span class="m">20 log₁₀(0.0318) = −29.9 dB</span>'],
    answer:'Mains hum is reduced to about 3% of its size, but the signal also has a 100 ms-scale lag (τ = 0.1 s), so it suits slow tanks, not fast loops.'},
  tryit:[
    num('s27q1','A 1.6 kΩ resistor and 100 nF capacitor form a low-pass. What is fc?',994.7,'Hz','fc = 1/(2π × 1600 × 100×10⁻⁹) = 994.7 Hz.'),
    num('s27q2','What is the gain of a first-order low-pass at exactly fc, in dB?',-3.01,'dB','|H| = 1/√2 = 0.707, which is 20 log₁₀(0.707) = −3.01 dB.'),
    num('s27q3','A first-order low-pass is driven one decade above fc. What is the gain in dB (approximately)?',-20.04,'dB','|H| = 1/√(1 + 100) = 0.0995, which is −20.04 dB.')
  ],
  recall:[ num('s27r1','What does a Pt100 read at 0 °C, in ohms?',100,'Ω','By definition, Pt100 means 100 Ω at 0 °C.') ],
  plant:{title:'Damping on a noisy level signal',body:`<p>Ultrasonic and radar level signals in turbulent tanks jump around. Most transmitters and PLC cards offer a <b>damping</b> setting in seconds, which is simply the time constant of a low-pass filter. Too little and the reading jitters; too much and the control loop reacts late to a real change.</p><p>Aim for the least damping that gives a usable reading, and remember it adds directly to the loop's response time.</p>`}
},
{ id:28, wk:6, day:3, track:'SENS', title:'Encoders, proximity and limit sensing',
  kicker:'How a machine knows where it is, how fast it is moving, and when something is in the way.',
  learn:`<p>An <b>incremental encoder</b> outputs pulses as the shaft turns: <b>PPR</b> (pulses per revolution). Two channels, <b>A and B</b>, are offset by 90° (quadrature). Which one leads tells you the direction, and counting all edges of both channels gives <b>4× resolution</b>:</p>
<div class="eq">counts per rev = PPR × 4 &nbsp;&nbsp; position = counts / (counts per rev) × 2π</div>
<p>Incremental encoders lose position at power-off; they need <b>homing</b> against a reference (an index pulse Z or a limit switch). An <b>absolute encoder</b> outputs a unique code for each angle, so it knows where it is the moment it powers up.</p>
<p>With a gearbox of ratio N, the motor encoder sees N times the output movement, so resolution at the load is finer by N. Add a lead or drum circumference and you can work out the <b>distance per count</b>.</p>
<p><b>Proximity sensors</b> detect objects without touching: inductive (metal), capacitive (any material), photoelectric (light beam). Wire them as PNP (switch positive) or NPN (switch to 0 V), and check the cable colours: brown +, blue 0 V, black signal.</p>`,
  diagram:'quad', sim:'encoder',
  pins:['Quadrature: A and B 90° apart give direction','Counts per rev = PPR × 4 with ×4 decoding','Incremental needs homing; absolute does not','Inductive for metal, capacitive for anything, optical for range'],
  worked:{prompt:'A winch drum 0.3 m in diameter is driven through a 20:1 gearbox by a motor with a 1000 PPR encoder using ×4 decoding. What distance does one count represent?',
    steps:['Counts per motor rev: <span class="m">1000 × 4 = 4000</span>','Counts per drum rev: <span class="m">4000 × 20 = 80 000</span>','Drum circumference: <span class="m">π × 0.3 = 0.9425 m</span>','<span class="m">0.9425 / 80 000 = 11.78 µm per count</span>'],
    answer:'About 12 µm per count. Far finer than the cable stretch you will actually see, so encoder resolution is rarely the limit.'},
  tryit:[
    num('s28q1','A 2500 PPR encoder is read with ×4 decoding. How many counts per revolution?',10000,'','2500 × 4 = 10 000 counts per rev.'),
    num('s28q2','A 1000 PPR encoder with ×4 decoding delivers 6000 counts in one second. What is the shaft speed in rpm?',90,'rpm','6000 / 4000 = 1.5 rev/s, which is 90 rpm.'),
    mcq('s28q3','How does a quadrature encoder indicate direction?',['Which of A or B leads the other by 90°','The amplitude of channel A','The frequency of the Z pulse','The sign of the supply voltage'],0,'If A rises before B the shaft turns one way; if B leads, the other way. A decoder counts up or down accordingly.')
  ],
  recall:[ num('s28r1','A first-order low-pass has R = 10 kΩ and C = 1 µF. What is fc?',15.92,'Hz','fc = 1/(2π × 10 000 × 10⁻⁶) = 15.92 Hz.') ],
  plant:{title:'Proximity switches on a conveyor',body:`<p>Inductive proximity sensors confirm position on gates, chutes and pulleys. A switch that works on the bench but misses on site often has too large an air gap: the rated sensing distance is for mild steel, and stainless, aluminium or brass need a much shorter range. Check the correction factors on the datasheet.</p><p>PNP versus NPN is a common wiring mistake. The PLC input card decides which you need.</p>`}
},
{ id:29, wk:6, day:4, track:'EMB', title:'ADCs, DACs and sampling',
  kicker:'Where analogue becomes numbers, and where information can be lost for good.',
  learn:`<p>An <b>ADC</b> turns a voltage into an integer. With <b>n bits</b> it has 2ⁿ levels, so the smallest step, the <b>LSB</b>, is:</p>
<div class="eq">LSB = V<sub>full-scale</sub> / 2<sup>n</sup> &nbsp;&nbsp; code = V / LSB</div>
<p>A 12-bit ADC on 0 to 10 V has an LSB of 10/4096 = <b>2.44 mV</b>. More bits means finer resolution (but not always better accuracy: noise and reference error matter too).</p>
<p>The ADC also samples in time. The <b>Nyquist theorem</b> says you must sample at more than <b>twice</b> the highest frequency in the signal. Sample too slowly and fast signals fold down into false slow ones: <b>aliasing</b>. That's why a low-pass anti-alias filter sits in front of every ADC.</p>
<p>A <b>DAC</b> does the reverse, turning a number into a voltage or current. On a PLC, analogue cards scale the 4-20 mA range onto an integer. Siemens uses <b>0 to 27 648</b> counts for the nominal range. To scale:</p>
<div class="eq">engineering value = low + (raw / 27 648) × (high − low)</div>
<p>Counts above 27 648 mean overrange; a 4-20 mA input falling below about 3.6 mA triggers a wire-break alarm.</p>`,
  diagram:'adc', sim:'adc',
  pins:['LSB = full scale / 2ⁿ','Sample above 2× the highest signal frequency','Anti-alias low-pass before every ADC','Siemens analogue: 0 to 27 648 for the nominal span'],
  worked:{prompt:'A level transmitter spans 0 to 12 m on 4-20 mA. The PLC card shows a raw value of 17 280 (nominal range 0 to 27 648). Find the loop current and the level.',
    steps:['Fraction of span: <span class="m">17 280 / 27 648 = 0.625</span>','Current: <span class="m">4 + 0.625 × 16 = 14 mA</span>','Level: <span class="m">0.625 × 12 m = 7.5 m</span>'],
    answer:'14 mA and 7.5 m. Always check the loop current first when the PLC value looks wrong: it separates field faults from scaling errors.'},
  tryit:[
    num('s29q1','What is the LSB of a 16-bit ADC with a 10 V full scale, in millivolts?',0.1526,'mV','10 / 65 536 = 0.1526 mV.'),
    num('s29q2','A signal contains frequencies up to 1.5 kHz. What is the minimum sample rate to avoid aliasing, in hertz?',3000,'Hz','Nyquist: at least twice the highest frequency, so 3000 Hz (in practice sample at 5 to 10 times).'),
    num('s29q3','On a 4-20 mA input with nominal range 0 to 27 648, what raw value corresponds to 8 mA?',6912,'','(8 − 4)/16 = 0.25, and 0.25 × 27 648 = 6912.')
  ],
  recall:[ num('s29r1','A 2500 PPR encoder uses ×4 decoding on a motor turning at 30 rpm. How many counts per second does it produce?',5000,'','30 rpm = 0.5 rev/s. 0.5 × 10 000 counts/rev = 5000 counts/s.') ],
  plant:{title:'Scaling blocks and bad numbers',body:`<p>When a SCADA value is wrong, work backwards: raw count, then loop current, then the transmitter. A raw value pinned at 32 767 or −32 768 means the card is out of range or has lost the signal. A raw value that tracks the process but reads 10% off usually means the scaling limits in the program do not match the transmitter's calibration.</p><p>Write down the transmitter range and compare it with the program, both times.</p>`}
},
{ id:30, wk:6, day:5, track:'REV', title:'Week 6 review: a bearing temperature chain',
  kicker:'One signal from Pt100 to SCADA, using every idea this week.',
  review:true,
  learn:`<div class="cheats">
<div class="cheat"><h4>Pt100</h4><p>R = 100(1 + 3.908e−3 T − 5.775e−7 T²). 0.385 Ω/°C. Lead resistance adds to a 2-wire reading.</p></div>
<div class="cheat"><h4>Filter</h4><p>fc = 1/(2πRC). −3 dB at fc, −20 dB/decade. dB = 20 log(Vout/Vin).</p></div>
<div class="cheat"><h4>Encoder</h4><p>Counts/rev = PPR × 4. Quadrature gives direction. Gearbox multiplies resolution.</p></div>
<div class="cheat"><h4>ADC</h4><p>LSB = FS/2ⁿ. Nyquist: more than 2f. Siemens raw 0 to 27 648 maps to 4 to 20 mA.</p></div>
</div>`,
  pins:['Always trace: sensor → conditioner → transmitter → loop → card → scaling → display'],
  worked:{prompt:'A Pt100 bearing sensor feeds a transmitter spanning 0 to 150 °C on 4-20 mA. The PLC raw value is 15 000. What current, temperature and Pt100 resistance does that represent?',
    steps:['Fraction: <span class="m">15 000 / 27 648 = 0.5425</span>','Current: <span class="m">4 + 0.5425 × 16 = 12.68 mA</span>','Temperature: <span class="m">0.5425 × 150 = 81.4 °C</span>','Pt100 at that temperature: <span class="m">100(1 + 0.3181 − 0.0038) = 131.4 Ω</span>'],
    answer:'12.68 mA, 81.4 °C and 131.4 Ω at the sensor. A multimeter on the loop and an ohm reading on the sensor would confirm each link.'},
  tryit:[
    num('s30q1','A transmitter spans 0 to 100 °C on 4-20 mA. The loop reads 16 mA. What is the temperature?',75,'°C','(16 − 4)/16 = 0.75, so 75 °C.'),
    num('s30q2','What is the Pt100 resistance at 200 °C?',175.86,'Ω','100(1 + 0.78166 − 0.0231) = 175.86 Ω.'),
    num('s30q3','A 12-bit ADC covers 0 to 5 V. What is the LSB in millivolts?',1.2207,'mV','5 / 4096 = 1.2207 mV.')
  ],
  recall:[],
  plant:{title:'Habit for next week',body:`<p>Next week starts the control theory block. Look at one control loop on the plant (a level, flow or pressure loop) and note the setpoint, the measured value and the output. We'll use them to put names to the blocks.</p>`}
}
);
})();
