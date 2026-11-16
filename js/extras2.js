/* Rise Time: hints, watch-outs and formulas for sessions 31 to 45 */
(function(){
const RT = window.RT;
const F = (n,f,note)=>({n,f,note:note||''});
const HINTS = {
 s31q1:'Use the table entry 1/(s + a). Which number is a here?',
 s31q2:'Multiply Y(s) by s first, which cancels the 1/s, then set s = 0.',
 s31q3:'Think of d/dt of e^(st). What factor drops out?',
 s31r1:'Average voltage is duty cycle times supply.',
 s32q1:'Blocks in series multiply their gains.',
 s32q2:'Use G/(1 + G) with G = 4.',
 s32q3:'DC gain times input step.',
 s32r1:'Put T = 100 into R = 100(1 + 3.9083e-3 T − 5.775e-7 T²).',
 s33q1:'Settling to 2% takes about four time constants.',
 s33q2:'Find √(1 − ζ²) first, then the exponent πζ/√(1 − ζ²).',
 s33q3:'ts ≈ 4 / (ζ ωn). Multiply ζ and ωn first.',
 s33r1:'τ = L/R. Answer in ms, so multiply by 1000.',
 s34q1:'Set the denominator to zero and solve for s.',
 s34q2:'Use the quadratic formula. The square root of a negative number gives the j part.',
 s34q3:'What does e^(σt) do when σ is positive?',
 s34r1:'τ = R × C. Convert kΩ and µF to base units.',
 s35q1:'Loop gain = Kp × K. Then T = L/(1 + L).',
 s35q2:'Closed-loop τ = open-loop τ divided by (1 + loop gain).',
 s35q3:'Steady-state error = 1/(1 + loop gain), as a percentage.',
 s36q1:'P output = Kp × error.',
 s36q2:'Integral of a constant is the constant times time.',
 s36q3:'D output = Kd × rate of change of the error.',
 s36r1:'Use ζ = 0.7 in 100 e^(−πζ/√(1−ζ²)).',
 s37q1:'Z-N PI uses 0.45 times Ku.',
 s37q2:'Z-N PID integral time is Tu divided by 2.',
 s37q3:'Find Kp = 0.6 Ku, then Td = Tu/8, then Kd = Kp × Td.',
 s37r1:'Ki × error × time.',
 s38q1:'Stalled means no back-EMF, so only the resistance limits current.',
 s38q2:'T = Kt × I.',
 s38q3:'No load, no losses: back-EMF equals the supply, so ω = V/Ke.',
 s38r1:'Multiply by 60 and divide by 2π.',
 s39q1:'Find ns for 6 poles at 50 Hz first: 120 × 50 / 6.',
 s39q2:'Voltage scales with frequency: V × (f / 50).',
 s39q3:'ns = 120 f / p.',
 s39r1:'At stall, I = V / R.',
 s40q1:'ns, then slip gives shaft rpm, divide by 10, then rpm to rev/s times circumference.',
 s40q2:'Convert rpm to rad/s first, then T = P / ω.',
 s40q3:'Four time constants.',
 s41q1:'Area of a circle from the bore, in m². Pressure 200 bar = 20 MPa.',
 s41q2:'Convert L/min to m³/s first, then divide by the area.',
 s41q3:'Power = pressure (Pa) × flow (m³/s). Convert both first.',
 s41r1:'Slip = (ns − n) / ns with ns = 1500.',
 s42q1:'Multiply the count by the time per instruction, then convert to ms.',
 s42q2:'Worst case is about two scans.',
 s42q3:'Think of the snapshot of inputs taken before the program runs.',
 s42r1:'Convert both to base units before multiplying.',
 s43q1:'NC is the inverted contact.',
 s43q2:'The output turns on when the elapsed time reaches the preset.',
 s43q3:'Preset minus what has been counted.',
 s43r1:'About two scans.',
 s44q1:'S = K × T + C. Compute K × T and C separately.',
 s44q2:'With d = 14 mm, C = 8 × (14 − 14) = 0.',
 s44q3:'Which fault would an open circuit signal, and what should it cause?',
 s44r1:'Which part of the scan takes the snapshot, and when?',
 s45q1:'Bore area first (π/4 × d²), then F = P × A.',
 s45q2:'Worst case is two scans plus the output action time.',
 s45q3:'I = T / Kt.'
};
const WATCH = {
 31:['Forgetting the s in s·Y(s) when using the final value theorem.','The final value theorem only works if the system is stable.'],
 32:['Using T = G/(1 + G) with the wrong sign when feedback is positive.','Treating DC gain as 1 after feedback. It drops slightly.'],
 33:['Using 4τ for a second-order system. It uses 4/(ζωn).','Entering ζ as a percentage in the overshoot formula.'],
 34:['Reading ringing frequency from the real part. It is the imaginary part.','Calling a system stable because poles are complex. Check the real parts.'],
 35:['Forgetting that gain buys speed and costs steady-state error.','Mixing up open-loop and closed-loop time constants.'],
 36:['Integrating with the wrong time. Use total time the error was present.','Running D on a noisy signal with no filter.'],
 37:['Applying Z-N settings straight to a live plant. They are aggressive.','Confusing Ti (time) with Ki (gain).'],
 38:['Using rpm in V = IR + Keω. It wants rad/s.','Forgetting that stall current can be many times the running current.'],
 39:['Using slip in rpm instead of percent of ns.','Forgetting the voltage must follow frequency to hold flux.'],
 40:['Dropping slip when finding shaft speed.','Dividing by the gear ratio twice, or not at all.'],
 41:['Mixing bar and Pa, or L/min and m³/s. Convert first.','Using bore area on the retract stroke. Subtract the rod.'],
 42:['Assuming an input change is seen mid-scan.','Forgetting that short pulses can fall between reads.'],
 43:['Swapping NO and NC when reading a rung.','Forgetting a TON resets as soon as its input drops.'],
 44:['Bridging a safety input to get the machine running.','Using total stopping time that leaves out the PLC or valve delay.'],
 45:['Skipping the unit conversion on the cylinder area.','Counting the PLC delay once instead of twice.']
};
const FORMULAS = {
 31:[F('Laplace pair','e⁻ᵃᵗ ↔ 1/(s + a)'),F('Derivative','d/dt ↔ s'),F('Final value','y(∞) = lim s·Y(s) as s → 0')],
 32:[F('First order','G(s) = K / (τs + 1)'),F('Feedback','T = G / (1 + GH)'),F('Series','G₁ · G₂')],
 33:[F('Overshoot','%OS = 100 e<sup>−πζ/√(1−ζ²)</sup>'),F('Peak time','t<sub>p</sub> = π / (ω<sub>n</sub>√(1−ζ²))'),F('Settling','t<sub>s</sub> ≈ 4 / (ζ ω<sub>n</sub>)')],
 34:[F('Second-order poles','−ζω<sub>n</sub> ± jω<sub>n</sub>√(1−ζ²)'),F('Stability','all Re(s) < 0')],
 35:[F('Closed-loop DC gain','L/(1 + L)'),F('Closed-loop τ','τ/(1 + L)'),F('Steady-state error','1/(1 + L)')],
 36:[F('PID','u = K<sub>p</sub>e + K<sub>i</sub>∫e dt + K<sub>d</sub> de/dt'),F('Time form','K<sub>i</sub> = K<sub>p</sub>/T<sub>i</sub>, K<sub>d</sub> = K<sub>p</sub>T<sub>d</sub>')],
 37:[F('Z-N PID','K<sub>p</sub> = 0.6K<sub>u</sub>, T<sub>i</sub> = T<sub>u</sub>/2, T<sub>d</sub> = T<sub>u</sub>/8'),F('Z-N PI','K<sub>p</sub> = 0.45K<sub>u</sub>, T<sub>i</sub> = T<sub>u</sub>/1.2')],
 38:[F('Electrical','V = IR + K<sub>e</sub>ω'),F('Torque','T = K<sub>t</sub>I'),F('Power','P = Tω'),F('rad/s to rpm','× 60/2π ≈ 9.55')],
 39:[F('Sync speed','n<sub>s</sub> = 120f/p'),F('Slip','(n<sub>s</sub> − n)/n<sub>s</sub>'),F('V/f','V = 400 × f/50')],
 40:[F('Belt speed','v = n<sub>drum</sub>/60 × πD'),F('Shaft power','T = P/ω')],
 41:[F('Force','F = P·A'),F('Speed','v = Q/A'),F('Power','P<sub>hyd</sub> = P·Q'),F('Units','1 bar = 10⁵ Pa; 1 L/min = 1.667×10⁻⁵ m³/s')],
 42:[F('Worst-case delay','≈ 2 × scan time')],
 43:[F('TON','output after input true for PT'),F('CTU','output when count ≥ PV')],
 44:[F('Safe distance','S = K·T + C'),F('Light curtain reach','C = 8(d − 14) mm')],
 45:[F('Cylinder force','F = P·π/4·D²'),F('Reaction','2 × scan + valve time')]
};
RT.SESSIONS.forEach(s=>{
  if(s.id<31) return;
  [...(s.tryit||[]),...(s.recall||[])].forEach(q=>{ if(HINTS[q.id]) q.hint=HINTS[q.id]; });
  if(WATCH[s.id]) s.watch=WATCH[s.id];
  if(FORMULAS[s.id]) s.formulas=FORMULAS[s.id];
});
Object.assign(RT.HINTS,HINTS); Object.assign(RT.WATCH,WATCH); Object.assign(RT.FORMULAS,FORMULAS);
})();
