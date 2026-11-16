/* ============ RISE TIME : app ============ */
(function(){
const {TRACKS, SESSIONS, OUTLINE, BASELINE, DIAG} = window.RT;
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const app = $('#app');
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* ---------- dates ---------- */
const ymd = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const TODAY = () => ymd(new Date());
const parseYmd = s => {const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);};
const isWeekday = d => {const w=d.getDay();return w>0&&w<6;};
function weekdaysAfter(a,b){let d=parseYmd(a),e=parseYmd(b),n=0;let g=0;while(d<e&&g++<2000){d.setDate(d.getDate()+1);if(isWeekday(d))n++;}return n;}
function addWeekdays(a,n){const d=parseYmd(a);let g=0;while(n>0&&g++<2000){d.setDate(d.getDate()+1);if(isWeekday(d))n--;}return d;}
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = d => `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;

/* ---------- curriculum index ---------- */
const ALL = [];   // 60 slots
for(let w=1; w<=12; w++) for(let d=1; d<=5; d++){
  const i=(w-1)*5+d, s=SESSIONS.find(x=>x.id===i);
  if(s) ALL.push(s);
  else { const o=OUTLINE.find(x=>x.wk===w); const it=o.items[d-1]; ALL.push({id:i,wk:w,day:d,track:it[0],title:it[1],pipe:true,phase:o.phase}); }
}
const PHASE_OF = w => w<=3?'Foundations':(OUTLINE.find(x=>x.wk===w)||{}).phase;
const QINDEX = {}, QTRACK = {}, QFROM = {};
SESSIONS.forEach(s=>[...(s.tryit||[]),...(s.recall||[])].forEach(q=>{QINDEX[q.id]=q;QTRACK[q.id]=s.track==='REV'?null:s.track;QFROM[q.id]=s.id;}));
BASELINE.forEach(q=>{QINDEX[q.id]=q;});
const code = s => `W${String(s.wk).padStart(2,'0')} · D${s.day}`;
const trk = t => TRACKS[t]||TRACKS.REV;

/* ---------- state + storage ---------- */
const LS='risetime.v1';
const blank = () => ({v:1,start:null,ahead:0,done:{},cards:{},log:[],updated:0});
let S = blank();
try{ const raw=localStorage.getItem(LS); if(raw) S=Object.assign(blank(),JSON.parse(raw)); }catch(e){}
let ref=null, sync='connecting', saveTimer=null, chain=Promise.resolve();
function setSync(s){ sync=s; paintStatus(); }
function save(){
  S.updated=Date.now();
  try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}
  if(ref){ clearTimeout(saveTimer); saveTimer=setTimeout(flush,500); }
}
function flush(){
  if(!ref) return;
  const body=JSON.parse(JSON.stringify(S));
  chain = chain.then(()=>ref.set(body)).then(()=>setSync('synced')).catch(e=>{
    if(e && (e.code==='unavailable')) { setTimeout(flush, 1500+Math.random()*1000); setSync('retry'); }
    else setSync('local');
  });
}
function ensureStart(){ if(!S.start){ S.start=TODAY(); save(); } }
async function initCloud(){
  let settled=false;
  const timer=setTimeout(()=>{ if(!settled){ settled=true; setSync('local'); ensureStart(); rerender(); } },10000);
  const local=()=>{ if(settled) return; settled=true; clearTimeout(timer); setSync('local'); ensureStart(); rerender(); };
  try{
    if(!window.claude || typeof window.claude.use!=='function') return local();
    const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!db||!user) return local();
    const id=await user.id();
    if(!id) return local();
    const r=db.doc('data/users/'+id+'/rise-time');
    const snap=await r.get();
    if(settled) { ref=r; flush(); return; }
    settled=true; clearTimeout(timer); ref=r;
    if(snap.exists){
      const cloud=snap.data()||{};
      if((cloud.updated||0) >= (S.updated||0)){ S=Object.assign(blank(),JSON.parse(JSON.stringify(cloud))); try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){} }
      else flush();
    } else if(S.start) flush();
    setSync('synced'); ensureStart(); rerender();
  }catch(e){ local(); }
}

/* ---------- progress logic ---------- */
const startDate = () => S.start||TODAY();
const unlocked = () => Math.min(60, 1 + weekdaysAfter(startDate(),TODAY()) + (S.ahead||0));
function status(s){
  if(S.done[s.id]) return 'done';
  if(s.pipe) return 'pipe';
  return s.id<=unlocked() ? 'open' : 'locked';
}
const unlockDate = s => addWeekdays(startDate(), Math.max(0, s.id-1-(S.ahead||0)));
const todays = () => ALL.find(s=>status(s)==='open');
const doneDays = () => new Set(Object.values(S.done));
function streak(){
  const days=doneDays(); const d=new Date(); let n=0;
  if(!days.has(ymd(d))) d.setDate(d.getDate()-1);
  for(let i=0;i<500;i++){ if(isWeekday(d)){ if(days.has(ymd(d))) n++; else break; } d.setDate(d.getDate()-1); }
  return n;
}
function best(){ // longest run of consecutive weekdays
  const days=[...doneDays()].sort(); if(!days.length) return 0;
  let bestN=1,cur=1;
  for(let i=1;i<days.length;i++){ const prev=parseYmd(days[i-1]); const nxt=addWeekdays(days[i-1],1); cur = ymd(nxt)===days[i] ? cur+1 : 1; bestN=Math.max(bestN,cur); }
  return bestN;
}
function mastery(){
  const out={};
  Object.keys(TRACKS).forEach(t=>{ if(t!=='REV') out[t]={sum:0,n:0}; });
  for(const [qid,c] of Object.entries(S.cards)){ const t=QTRACK[qid]; if(t&&out[t]){ out[t].sum+=(c.b-1)/4; out[t].n++; } }
  return out;
}
function record(qid,ok){
  const c=S.cards[qid]||{b:1,n:0,c:0,t:null};
  c.b = ok ? Math.min(5,(c.n===0?2:c.b+1)) : 1;
  c.n++; if(ok) c.c++; c.t=TODAY();
  S.cards[qid]=c; save();
}
function pool(excludeId){
  const ids=[];
  ALL.forEach(s=>{ if(S.done[s.id] && s.id!==excludeId && !s.pipe) [...(s.tryit||[]),...(s.recall||[])].forEach(q=>ids.push(q.id)); });
  return ids;
}
function pickWeakest(ids,n){
  const scored=ids.map(id=>{const c=S.cards[id];return {id,k:(c?c.b:1.5)*10+(c&&c.t===TODAY()?8:0)+Math.random()*4};});
  scored.sort((a,b)=>a.k-b.k);
  return scored.slice(0,n).map(x=>QINDEX[x.id]);
}

/* ---------- question rendering ---------- */
let QS = {}; // per-view question state
function renderQ(q,i,showFrom){
  const st=QS[q.id]||{};
  const n=String(i+1).padStart(2,'0');
  let h=`<div class="q ${st.done?(st.first?'ok':'no'):''}" data-q="${q.id}" data-i="${i}" data-from="${showFrom?1:0}"><div class="qt"><span class="qn">Q${n}</span><div>${q.q}</div></div>`;
  if(q.type==='mcq'){
    h+=`<div class="choices">`+q.choices.map((c,k)=>{
      let cls=''; if(st.done){ if(k===q.ans) cls='right'; else if(st.picked===k) cls='wrong'; }
      return `<button class="choice ${cls}" data-choice="${k}" ${st.done?'disabled':''}><span class="ix">${'ABCD'[k]}</span><span>${c}</span></button>`;
    }).join('')+`</div>`;
  } else {
    h+=`<div class="ans"><div class="inp"><input id="in-${q.id}" inputmode="decimal" autocomplete="off" placeholder="answer" aria-label="Your answer" value="${st.val!=null?esc(st.val):''}" ${st.done?'disabled':''}>${q.unit?`<span class="u">${q.unit}</span>`:''}</div>
    ${st.done?'':`<button class="btn sm" data-check>Check</button>`}</div>`;
  }
  if(st.done){
    h+=`<div class="fb ${st.first?'':'no'}"><span class="v">${st.first?'Correct, first time':(st.ok?'Got there':'Answer')}${q.type==='num'?` · ${fmtNum(q.ans)} ${q.unit||''}`:''}</span>${q.explain}</div>`;
  } else if(st.tries){
    h+=`<div class="fb no"><span class="v">Not quite · try again</span>Check your units and rounding.<div class="reveal"><button class="btn sm amber" data-show>Show answer</button></div></div>`;
  }
  if(showFrom && QFROM[q.id]){ const s=ALL[QFROM[q.id]-1]; h+=`<div class="from">From ${code(s)} · ${esc(s.title)}</div>`; }
  else if(showFrom) h+=`<div class="from">Primer</div>`;
  return h+`</div>`;
}
const fmtNum = v => Math.abs(v)>=1000||Number.isInteger(v)?String(v):String(+v.toPrecision(4));
function checkNum(q,raw){
  const v=parseFloat(String(raw).replace(/\s/g,'').replace(',','.'));
  if(!isFinite(v)) return null;
  return q.ans===0 ? Math.abs(v)<1e-6 : Math.abs(v-q.ans)/Math.abs(q.ans) <= (q.tol||0.02);
}
function answer(qid,ok,extra={}){
  const st=QS[qid]||(QS[qid]={tries:0});
  Object.assign(st,extra);
  if(st.tries===0) { st.first=ok; record(qid,ok); }
  st.tries++;
  if(ok){ st.done=true; st.ok=true; }
  repaintQ(qid);
}
function repaintQ(qid){
  const el=$(`[data-q="${qid}"]`); if(!el) return;
  const q=QINDEX[qid]; const i=+el.dataset.i; const f=el.dataset.from==='1';
  el.outerHTML=renderQ(q,i,f);
  if(RUN && RUN.view==='drill') paintDrillScore();
}
app.addEventListener('click',e=>{
  const qel=e.target.closest('[data-q]'); if(!qel) return;
  const qid=qel.dataset.q, q=QINDEX[qid];
  const ch=e.target.closest('[data-choice]');
  if(ch){ const k=+ch.dataset.choice; const st=QS[qid]||(QS[qid]={tries:0}); if(st.done) return;
    const ok=k===q.ans; if(st.tries===0){st.first=ok;record(qid,ok);} st.tries++; st.done=true; st.ok=ok; st.picked=k; repaintQ(qid); return; }
  if(e.target.closest('[data-check]')){ doCheck(qid); return; }
  if(e.target.closest('[data-show]')){ const st=QS[qid]; st.done=true; st.ok=false; repaintQ(qid); }
});
app.addEventListener('keydown',e=>{ if(e.key==='Enter' && e.target.matches('.inp input')){ const qid=e.target.closest('[data-q]').dataset.q; doCheck(qid);} });
function doCheck(qid){
  const q=QINDEX[qid]; const inp=$('#in-'+qid); const raw=inp.value;
  const ok=checkNum(q,raw); if(ok===null){ inp.focus(); toast('Enter a number'); return; }
  const st=QS[qid]||(QS[qid]={tries:0}); st.val=raw;
  answer(qid,ok);
  if(!ok){ const n=$('#in-'+qid); if(n){ n.focus(); n.select(); } }
}

/* ---------- shared graphics ---------- */
function stepResponse(zeta=0.34){
  const wd=Math.sqrt(1-zeta*zeta);
  return t => t<=0?0:1-Math.exp(-zeta*t)*(Math.cos(wd*t)+zeta/wd*Math.sin(wd*t));
}
function stepSvg(W,H,opt={}){
  const f=stepResponse(opt.zeta||0.34), x0=opt.x0||60, T=opt.T||16, y0=H-(opt.pb||50), y1=opt.top||H*0.38;
  const X=t=>x0+(W-x0-20)*t/T, Y=v=>y0-(y0-y1)*v;
  let d=`M10,${y0} L${x0},${y0}`;
  for(let i=1;i<=220;i++){const t=T*i/220; d+=` L${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`;}
  let t10=0,t90=0; for(let t=0;t<T;t+=0.01){ if(!t10&&f(t)>=0.1) t10=t; if(!t90&&f(t)>=0.9){t90=t;break;} }
  let g=''; for(let i=0;i<=10;i++){ g+=`<line class="g" x1="${10+(W-20)*i/10}" y1="10" x2="${10+(W-20)*i/10}" y2="${H-10}"/>`; }
  for(let i=0;i<=6;i++){ g+=`<line class="g" x1="10" y1="${10+(H-20)*i/6}" x2="${W-10}" y2="${10+(H-20)*i/6}"/>`; }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">${g}
  <rect class="band" x="${X(t10)}" y="10" width="${X(t90)-X(t10)}" height="${H-20}"/>
  <line class="sp" x1="${x0}" y1="${Y(1)}" x2="${W-10}" y2="${Y(1)}"/>
  <line class="sp" x1="${X(t10)}" y1="${Y(0.1)}" x2="${X(t10)}" y2="${H-14}"/><line class="sp" x1="${X(t90)}" y1="${Y(0.9)}" x2="${X(t90)}" y2="${H-14}"/>
  <text x="${(X(t10)+X(t90))/2}" y="${H-18}" text-anchor="middle">${opt.label||'tr'}</text>
  <path class="tr" d="${d}"/></svg>`;
}
const brandSvg = `<svg viewBox="0 0 54 30" aria-hidden="true"><line class="sp" x1="0" y1="9" x2="54" y2="9"/><path class="tr" d="M0,27 L10,27 C14,27 16,4 22,3 C28,2 29,13 34,11 C38,9.5 40,8.5 54,9"/></svg>`;

/* ---------- shell ---------- */
function paintStatus(){
  const el=$('#status'); if(!el) return;
  const off = navigator.onLine===false;
  const map={connecting:['led warn pulse','CONNECTING'],synced:['led on','SYNCED'],retry:['led warn pulse','RETRYING'],local:['led on',off?'OFFLINE · SAVED':'SAVED ON DEVICE']};
  const [c,t]=map[sync]||map.local;
  el.innerHTML=`<span class="${c}"></span><span>${t}</span>`;
  el.title = sync==='local' ? 'Progress is saved on this device and works offline. Use Back up and Restore in the footer to move it to another device.' : '';
}
function navOn(name){ $$('.nav a').forEach(a=>a.classList.toggle('on',a.dataset.n===name)); }
let RUN=null; let cleanup=[];
function clearView(){ cleanup.forEach(f=>{try{f()}catch(e){}}); cleanup=[]; }
function route(){
  clearView();
  const h=(location.hash||'#today').slice(1);
  if(h.startsWith('session-')) return viewSession(+h.slice(8));
  if(h==='map') return viewMap();
  if(h==='lab') return viewLab();
  if(h.startsWith('lab-')) return viewLab(h.slice(4));
  if(h==='drill') return viewDrill();
  return viewToday();
}
function rerender(){ paintStatus(); const h=location.hash; if(!h||h==='#today'||h==='#map') route(); }
window.addEventListener('hashchange',()=>{ route(); window.scrollTo({top:0,behavior:RM?'auto':'smooth'}); });

function footer(){
  const n=Object.keys(S.done).length;
  return `<footer class="foot"><span>RISE TIME · ${n}/60 SESSIONS LOGGED · STARTED ${S.start?fmtDate(parseYmd(S.start)).toUpperCase():'TODAY'}</span>
  <span class="row"><button data-act="ahead">Unlock next session early</button>${sync==='local'?'<button data-act="backup">Back up progress</button><button data-act="restore">Restore</button>':''}<button data-act="reset">Reset progress</button></span></footer>`;
}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]'); if(!a) return;
  const act=a.dataset.act;
  if(act==='ahead'){ const nxt=ALL.find(s=>!S.done[s.id]&&status(s)==='locked'); if(!nxt){toast('Nothing left to unlock yet');return;} S.ahead=(S.ahead||0)+1; save(); toast(`Unlocked ${code(nxt)}`); route(); }
  if(act==='backup') backup();
  if(act==='restore') restore();
  if(act==='reset') modal('Reset all progress?','This clears your streak, logged sessions and question history on every device. It cannot be undone.','Reset',()=>{ const keep=S.updated; S=blank(); S.start=TODAY(); S.updated=keep+1; save(); flush(); location.hash='#today'; route(); toast('Progress reset'); });
});
function modal(title,body,okLabel,onOk){
  const m=document.createElement('div'); m.className='modal';
  m.innerHTML=`<div class="panel" role="dialog" aria-modal="true" aria-labelledby="mt"><h3 id="mt">${title}</h3><p>${body}</p><div class="row"><button class="btn amber" id="m-ok">${okLabel}</button><button class="btn" id="m-no">Cancel</button></div></div>`;
  document.body.appendChild(m);
  const close=()=>m.remove();
  $('#m-no',m).onclick=close; m.onclick=e=>{if(e.target===m)close();};
  $('#m-ok',m).onclick=()=>{close();onOk();};
  $('#m-no',m).focus();
}
function backup(){
  const json=JSON.stringify(S,null,1), name=`rise-time-backup-${TODAY()}.json`;
  try{
    const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
    const l=document.createElement('a'); l.href=url; l.download=name; document.body.appendChild(l); l.click(); l.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000); toast('Backup saved: '+name);
  }catch(e){
    navigator.clipboard?.writeText(json).then(()=>toast('Backup copied to clipboard'),()=>toast('Backup failed on this device'));
  }
}
function restore(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json,.json';
  inp.onchange=()=>{ const f=inp.files&&inp.files[0]; if(!f) return;
    f.text().then(txt=>{ let d; try{ d=JSON.parse(txt); }catch(e){ toast('That file is not a Rise Time backup'); return; }
      if(!d||typeof d!=='object'||!d.done||!d.cards){ toast('That file is not a Rise Time backup'); return; }
      const n=Object.keys(d.done).length;
      modal('Restore this backup?',`It holds ${n} logged session${n===1?'':'s'}, started ${d.start||'unknown'}. It replaces the progress on this device.`,'Restore',()=>{
        S=Object.assign(blank(),d); S.updated=Date.now(); save(); flush(); location.hash='#today'; route(); toast('Progress restored'); });
    }); };
  inp.click();
}
function banner(t,btn,fn){ const el=document.createElement('div'); el.className='toast'; el.style.display='flex'; el.style.gap='12px'; el.style.alignItems='center'; el.innerHTML=`<span>${t}</span><button class="btn sm">${btn}</button>`; el.querySelector('button').onclick=fn; document.body.appendChild(el); }
function toast(t){ const el=document.createElement('div'); el.className='toast'; el.textContent=t; document.body.appendChild(el); setTimeout(()=>el.remove(),2200); }

/* ================= TODAY ================= */
function viewToday(){
  navOn('today'); RUN=null;
  const t=todays(); const st=streak(); const doneN=Object.keys(S.done).length;
  const now=new Date();
  const mon=new Date(now); const wd=now.getDay(); mon.setDate(now.getDate()-((wd+6)%7)); if(wd===0||wd===6) mon.setDate(mon.getDate()+7);
  const days=doneDays();
  let dayCells=''; for(let k=0;k<5;k++){ const d=new Date(mon); d.setDate(mon.getDate()+k); const key=ymd(d);
    dayCells+=`<div class="day ${days.has(key)?'done':''} ${key===TODAY()?'today':''}"><i></i>${DOW[d.getDay()].toUpperCase()}</div>`; }

  let hero;
  if(t){
    const tk=trk(t.track);
    hero=`<section class="panel hero" style="--c:${tk.color}">
      <div class="wave">${stepSvg(600,320,{label:'rise time'})}</div>
      <div>
        <div class="eyebrow"><span>${code(t)}</span><span>·</span><span>${t.id===1&&!doneN?'Day one':'Today on the bench'}</span></div>
        <h1 style="margin-top:14px;max-width:15ch">${esc(t.title)}</h1>
        <p class="kick">${t.kicker}</p>
      </div>
      <div style="display:grid;gap:18px">
        <div class="row"><span class="chip" style="--c:${tk.color}">${tk.ch} · ${tk.name}</span><span class="chip" style="--c:var(--ink-3)">≈ 15 min</span></div>
        <div class="probes"><span class="probe"><b>01</b>Warm-up</span><span class="probe"><b>02</b>Learn</span><span class="probe"><b>03</b>Work it</span><span class="probe"><b>04</b>On the plant</span></div>
        <div class="row"><a class="btn pri" href="#session-${t.id}">Begin session <span class="k">→</span></a><a class="btn" href="#map">Open the 12-week map</a></div>
      </div></section>`;
  } else {
    const nxt=ALL.find(s=>!S.done[s.id]);
    const nxtTxt = !nxt ? 'You have completed every session. Outstanding work.' :
      nxt.pipe ? `Next up is ${code(nxt)}: ${esc(nxt.title)}. That week's content is being written; ask Claude to load it into Rise Time.` :
      `Next session unlocks ${fmtDate(unlockDate(nxt))}: ${esc(nxt.title)}.`;
    hero=`<section class="panel hero"><div class="wave">${stepSvg(600,320,{label:'settled'})}</div>
      <div><div class="eyebrow"><span>Bench clear</span></div><h1 style="margin-top:14px;max-width:14ch">Signal settled for today.</h1><p class="kick">${nxtTxt}</p></div>
      <div class="row"><a class="btn pri" href="#drill">Quick drill: 5 questions <span class="k">→</span></a>${nxt&&!nxt.pipe?`<button class="btn" data-act="ahead">Work ahead</button>`:''}<a class="btn" href="#lab">Play in the lab</a></div></section>`;
  }

  const m=mastery();
  const vu=Object.entries(m).map(([k,v])=>{ const tk=TRACKS[k]; const pct=v.n?Math.round(v.sum/v.n*100):0; const lit=Math.round(pct/5);
    return `<div class="vu-row ${v.n?'':'off'}" style="--c:${tk.color}"><span class="nm"><em>${tk.ch}</em> ${tk.name}</span><span class="segs">${Array.from({length:20},(_,i)=>`<i class="${i<lit?'lit':''}" style="animation-delay:${i*30}ms"></i>`).join('')}</span><span class="pc">${v.n?pct+'%':'·'}</span></div>`; }).join('');

  const upIdx = t ? t.id : (ALL.find(s=>!S.done[s.id])||{id:61}).id;
  const ups=ALL.filter(s=>s.id>=upIdx && !S.done[s.id]).slice(t?1:0, t?5:4);
  const upHtml = ups.length ? ups.map(s=>{const sv=status(s); const tk=trk(s.track);
    const when = sv==='open'?'READY':sv==='locked'?fmtDate(unlockDate(s)).toUpperCase():'IN PIPELINE';
    const inner=`<span class="when">${code(s)}</span><span class="t">${esc(s.title)}</span><span class="st">${when}</span>`;
    return sv==='open'?`<a class="li" style="--c:${tk.color}" href="#session-${s.id}">${inner}</a>`:`<div class="li" style="--c:${tk.color}">${inner}</div>`; }).join('') : `<p class="empty">Nothing queued.</p>`;

  const recent=[...S.log].reverse().slice(0,1)[0];
  app.innerHTML=`<div class="bench">
    ${hero}
    <div class="side">
      <section class="panel streak"><div class="eyebrow">Weekday streak</div>
        <div class="big">${st}<small>${st===1?'DAY':'DAYS'} · BEST ${Math.max(best(),st)}</small></div>
        <div class="days">${dayCells}</div></section>
      <section class="panel"><div class="eyebrow">Programme</div>
        <h3 style="margin-top:10px">${doneN} of 60 sessions</h3>
        <div class="meter"><i style="width:${Math.max(1.5,doneN/60*100)}%"></i></div>
        <div class="readout"><span>WEEK ${t?t.wk:Math.min(12,Math.ceil((doneN+1)/5))} OF 12</span><span>${recent?'LAST '+(recent.c)+'/'+(recent.n)+' CORRECT':'NO SESSIONS YET'}</span></div></section>
    </div>
    <section class="panel mastery"><div class="eyebrow">Mastery by channel</div><h2 style="margin-top:10px">What's sticking</h2>
      <div class="vu">${vu}</div>
      <p class="hint" style="margin-top:16px">Each bar rises as you answer correctly over repeated days. A miss drops that question back to the start of the queue, and it returns in your warm-ups until it sticks.</p></section>
    <section class="panel next"><div class="eyebrow">Coming down the line</div><h2 style="margin-top:10px">Up next</h2><div class="list">${upHtml}</div>
      <div class="row" style="margin-top:16px"><a class="btn sm" href="#drill">Quick drill</a><a class="btn sm" href="#map">Full map</a></div></section>
    <section class="panel labstrip"><div class="eyebrow">The lab · open any time</div><h2 style="margin-top:10px">Turn the knobs, watch the physics</h2><div class="labs">${labTiles()}</div></section>
  </div>${footer()}`;
}

/* ================= MAP ================= */
function viewMap(){
  navOn('map'); RUN=null;
  let h=`<div class="maphead"><div><div class="eyebrow">12 weeks · 60 sessions · weekdays</div><h1 style="margin-top:12px">The map</h1></div>
  <div class="legend"><span class="l-done"><i></i>LOGGED</span><span class="l-open"><i></i>READY</span><span><i></i>LOCKED</span><span class="l-pipe"><i></i>IN PIPELINE</span></div></div>`;
  let lastPhase='';
  for(let w=1;w<=12;w++){
    const ph=PHASE_OF(w); if(ph!==lastPhase){ h+=`<div class="phase">${ph}</div>`; lastPhase=ph; }
    h+=`<div class="wk"><div class="wkn"><small>WEEK</small>${String(w).padStart(2,'0')}</div>`;
    for(let d=1;d<=5;d++){
      const s=ALL[(w-1)*5+d-1], sv=status(s), tk=trk(s.track);
      const lab={done:'LOGGED',open:'READY',locked:fmtDate(unlockDate(s)).toUpperCase(),pipe:'PIPELINE'}[sv];
      const inner=`<div class="d"><span>${['MON','TUE','WED','THU','FRI'][d-1]} · ${tk.ch}</span><b>${lab}</b></div><div class="t">${esc(s.title)}</div>`;
      h+= (sv==='done'||sv==='open') ? `<a class="cell ${sv}" style="--c:${tk.color}" href="#session-${s.id}">${inner}</a>` : `<div class="cell ${sv}" style="--c:${tk.color}">${inner}</div>`;
    }
    h+=`</div>`;
  }
  app.innerHTML=h+footer();
}

/* ================= SESSION ================= */
const STAGES=['Warm-up','Learn','Work it','On the plant'];
function viewSession(id){
  navOn('');
  const s=ALL[id-1];
  if(!s || s.pipe || status(s)==='locked'){ app.innerHTML=`<section class="panel"><div class="eyebrow">Locked</div><h2 style="margin-top:10px">${s?esc(s.title):'Session not found'}</h2><p class="empty" style="margin-top:10px">${s&&!s.pipe?'This session unlocks '+fmtDate(unlockDate(s))+'.':'This content is still in the pipeline.'}</p><a class="btn" href="#today">Back to the bench</a></section>`; return; }
  if(!RUN || RUN.id!==id || RUN.view!=='session'){
    QS={};
    let warm = pickWeakest(pool(id),3);
    let cold=false;
    if(warm.length<3){ cold=!warm.length; const extra=BASELINE.filter(q=>!warm.includes(q)).sort(()=>Math.random()-.5).slice(0,3-warm.length); warm=warm.concat(extra); }
    RUN={view:'session',id,stage:0,seen:new Set([0]),warm,cold,t0:Date.now(),complete:false,showSteps:0};
  }
  paintSession();
}
function paintSession(){
  const s=ALL[RUN.id-1], tk=trk(s.track);
  if(RUN.complete) return paintComplete(s);
  const rail=`<nav class="rail" aria-label="Session stages"><a class="back" href="#today">← BENCH</a>${STAGES.map((l,i)=>`<button class="stg ${i===RUN.stage?'on':''} ${RUN.seen.has(i)&&i!==RUN.stage?'seen':''}" data-stage="${i}"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="l">${l}</span></button>`).join('')}</nav>`;
  let body='';
  if(RUN.stage===0){
    body=`<div class="sub">${RUN.cold?'Cold start · three quick primers':'Three from the archive'}</div>
    <p class="empty" style="margin:-4px 0 18px">${RUN.cold?'Nothing in your archive yet, so here are three primers to get the brain turning over.':'Spaced review. These are the questions you have struggled with or not seen for a while.'}</p>
    <div class="qs">${RUN.warm.map((q,i)=>renderQ(q,i,true)).join('')}</div>`;
  } else if(RUN.stage===1){
    body=`<div class="prose">${s.learn}</div>${s.diagram?DIAG[s.diagram]():''}${s.sim?`<div id="simhost"></div>`:''}
    <div class="pins"><h4>Pin these</h4><ul>${s.pins.map(p=>`<li>${p}</li>`).join('')}</ul></div>`;
  } else if(RUN.stage===2){
    const w=s.worked, n=RUN.showSteps;
    body=`<div class="sub">Worked example</div>${w.fig&&s.diagram?DIAG[s.diagram]():''}<div class="worked"><div class="wq"><span class="tag">PROBLEM</span><div>${w.prompt}</div></div>
      <ol class="wsteps">${w.steps.slice(0,n).map(x=>`<li>${x}</li>`).join('')}</ol>
      ${n>=w.steps.length?`<div class="wans"><b>Result.</b> ${w.answer}</div>`:`<div class="wctl row"><button class="btn sm" data-step>${n?'Next step':'Show the first step'}</button><button class="btn sm" data-allsteps>Reveal all</button><span class="empty" style="font-size:12px">Try it yourself first, then compare.</span></div>`}
    </div>
    <div class="sub">Your turn</div><div class="qs">${s.tryit.map((q,i)=>renderQ(q,i,false)).join('')}</div>`;
  } else {
    const done=S.done[s.id];
    body=`<article class="plant"><div class="tagline">On the plant</div><h2>${s.plant.title}</h2>${s.plant.body}</article>
    ${s.recall&&s.recall.length?`<div class="sub">One for the archive</div><div class="qs">${s.recall.map((q,i)=>renderQ(q,i,false)).join('')}</div>`:''}`;
    void done;
  }
  const last=RUN.stage===3;
  const nav=`<div class="snav"><button class="btn" data-go="${RUN.stage-1}" ${RUN.stage===0?'disabled':''}>← ${RUN.stage?STAGES[RUN.stage-1]:'Back'}</button>
   ${last ? (S.done[s.id]?`<a class="btn pri" href="#today">Logged ${fmtDate(parseYmd(S.done[s.id]))} · back to bench</a>`:`<button class="btn pri" data-log>Log session <span class="k">✓</span></button>`) : `<button class="btn pri" data-go="${RUN.stage+1}">${STAGES[RUN.stage+1]} <span class="k">→</span></button>`}</div>`;
  app.innerHTML=`<div class="sess">${rail}<div>
    <header class="shead"><div class="eyebrow"><span>${code(s)}</span><span class="ch" style="--c:${tk.color}">${tk.ch} · ${tk.name}</span></div><h1>${esc(s.title)}</h1><p>${s.kicker}</p></header>
    <div class="stage" id="stage">${body}${nav}</div></div></div>`;
  if(RUN.stage===1 && s.sim){ clearView(); mountSim(s.sim,$('#simhost')); }
}
app.addEventListener('click',e=>{
  if(!RUN||RUN.view!=='session') return;
  const g=e.target.closest('[data-go],[data-stage]');
  if(g){ const to=+(g.dataset.go??g.dataset.stage); if(to<0||to>3) return; clearView(); RUN.stage=to; RUN.seen.add(to); paintSession(); window.scrollTo({top:0,behavior:RM?'auto':'smooth'}); return; }
  if(e.target.closest('[data-step]')){ RUN.showSteps++; paintSession(); return; }
  if(e.target.closest('[data-allsteps]')){ RUN.showSteps=99; paintSession(); return; }
  if(e.target.closest('[data-log]')) logSession();
});
function logSession(){
  const s=ALL[RUN.id-1];
  const qids=[...RUN.warm.map(q=>q.id),...s.tryit.map(q=>q.id),...(s.recall||[]).map(q=>q.id)];
  const att=qids.filter(id=>QS[id]&&QS[id].tries); const c=att.filter(id=>QS[id].first).length;
  const ms=Date.now()-RUN.t0;
  S.done[s.id]=TODAY(); S.log.push({d:TODAY(),s:s.id,c,n:att.length,ms}); if(S.log.length>200) S.log=S.log.slice(-200);
  save(); RUN.complete=true; RUN.result={c,n:att.length,ms,total:qids.length}; paintSession(); window.scrollTo({top:0});
}
function paintComplete(s){
  const r=RUN.result, mm=Math.floor(r.ms/60000), ss=Math.floor(r.ms/1000)%60;
  const nxt=ALL.find(x=>!S.done[x.id]);
  app.innerHTML=`<section class="panel done-card"><div>${stepSvg(560,300,{label:'your rise time'})}</div>
  <div><div class="eyebrow"><span>${code(s)}</span><span>· logged</span></div><h1 style="margin-top:12px">Session logged.</h1>
  <p class="kick" style="color:var(--ink-2)">${esc(s.title)} is in the archive. Its questions will come back in future warm-ups, more often if they gave you trouble.</p>
  <div class="stats"><div class="stat"><div class="v">${r.c}/${r.n||0}</div><div class="k">Right first time</div></div><div class="stat"><div class="v">${mm}:${String(ss).padStart(2,'0')}</div><div class="k">Your rise time</div></div><div class="stat"><div class="v">${streak()}</div><div class="k">Weekday streak</div></div></div>
  ${r.n<r.total?`<p class="hint">You skipped ${r.total-r.n} question${r.total-r.n>1?'s':''}. Skipped questions don't count against you, but they won't build mastery either.</p>`:''}
  <div class="row" style="margin-top:18px"><a class="btn pri" href="#today">Back to the bench</a>${nxt&&status(nxt)==='open'?`<a class="btn" href="#session-${nxt.id}">Next session</a>`:`<a class="btn" href="#lab">Visit the lab</a>`}</div></div></section>${footer()}`;
}

/* ================= DRILL ================= */
function viewDrill(){
  navOn('drill'); QS={};
  let ids=pool(null); let qs=pickWeakest(ids,5);
  const cold=qs.length<5; if(cold) qs=qs.concat(BASELINE.filter(q=>!qs.includes(q)).slice(0,5-qs.length));
  RUN={view:'drill',qs};
  app.innerHTML=`<header class="shead"><div class="eyebrow">Quick drill · ${qs.length} questions</div><h1>Five-minute drill</h1><p>${ids.length?'Pulled from your archive, weakest first. Results feed your mastery and your warm-up queue.':'Your archive is empty, so these are primers. Log a session and the drill starts targeting your weak spots.'}</p></header>
  <div class="qs" style="max-width:820px">${qs.map((q,i)=>renderQ(q,i,true)).join('')}</div>
  <div class="snav" style="max-width:820px"><span class="readout" id="dscore" style="margin:0"></span><div class="row"><a class="btn" href="#drill" data-redrill>New set</a><a class="btn pri" href="#today">Back to bench</a></div></div>${footer()}`;
  paintDrillScore();
  $('[data-redrill]').onclick=e=>{e.preventDefault();viewDrill();};
}
function paintDrillScore(){ const el=$('#dscore'); if(!el||!RUN) return; const a=RUN.qs.filter(q=>QS[q.id]&&QS[q.id].tries); const c=a.filter(q=>QS[q.id].first).length; el.textContent=`${c} OF ${a.length} RIGHT FIRST TIME · ${RUN.qs.length-a.length} TO GO`; }

/* ================= LAB ================= */
const SIMS={
  phasor:{name:'Phasor and sine',desc:'Spin a phasor and watch its shadow become a sine wave.',c:'var(--ch1)',from:'Weeks 1 and 3',icon:'M2,23 C10,2 18,2 26,23 S42,44 50,23 S66,2 74,23 S90,44 98,23'},
  rotate:{name:'Rotation matrix',desc:'Rotate a vector and read the matrix live.',c:'var(--ch8)',from:'Week 2',icon:'M10,40 L60,40 M10,40 L52,12'},
  divider:{name:'Divider and loading',desc:'Hang a load on a divider and watch the output sag.',c:'var(--ch2)',from:'Week 1',icon:'M2,10 L30,10 L36,4 L42,16 L48,4 L54,16 L60,10 L98,10 M2,36 L98,36'},
  rc:{name:'RC rise time',desc:'Set R and C, see τ and the 10 to 90% rise time.',c:'var(--ch3)',from:'Week 3',icon:'M2,42 L10,42 C24,10 40,6 98,5'},
  pid:{name:'PID loop tuner',desc:'Tune Kp, Ki and Kd on a live step response.',c:'var(--ch5)',from:'Preview of Week 8',icon:'M2,42 L12,42 C18,0 26,0 32,16 C38,30 44,22 52,14 S70,12 98,14'},
  arm:{name:'Two-link robot arm',desc:'Drag joints, or tap a target and let IK solve it.',c:'var(--ch9)',from:'Preview of Week 10',icon:'M20,44 L44,18 L82,26'}
};
function labTiles(){ return Object.entries(SIMS).map(([k,v])=>`<a class="labt" style="--c:${v.c}" href="#lab-${k}"><svg viewBox="0 0 100 46" preserveAspectRatio="none"><path d="${v.icon}"/></svg><span class="n">${v.name}</span><span class="d">${v.desc}</span></a>`).join(''); }
function viewLab(which){
  navOn('lab'); RUN=null;
  const k = SIMS[which] ? which : null;
  app.innerHTML=`<header class="shead"><div class="eyebrow">The lab · six instruments</div><h1>${k?SIMS[k].name:'The lab'}</h1><p>${k?`${SIMS[k].desc} Linked to ${SIMS[k].from}.`:'Interactive instruments you can open any time. The later ones are previews of what is coming in the control and robotics weeks.'}</p></header>
  ${k?`<div id="simhost"></div><div class="sub">Other instruments</div>`:''}<div class="labs labgrid">${labTiles()}</div>${footer()}`;
  if(k) mountSim(k,$('#simhost'));
}

/* ---------- sim framework ---------- */
function knob(id,label,min,max,step,val,log){
  return `<div class="knob"><label for="${id}">${label}<output id="${id}-o"></output></label><input type="range" id="${id}" min="${log?0:min}" max="${log?1000:max}" step="${log?1:step}" value="${log?Math.round(1000*Math.log(val/min)/Math.log(max/min)):val}" data-min="${min}" data-max="${max}" ${log?'data-log="1"':''}></div>`;
}
function kv(el){ const v=+el.value; if(el.dataset.log){const a=+el.dataset.min,b=+el.dataset.max;return a*Math.pow(b/a,v/1000);} return v; }
function fillTrack(el){ el.style.setProperty('--p',((el.value-el.min)/(el.max-el.min)*100)+'%'); }
function eng(v,u,d=3){ if(v===0) return '0 '+u; const a=Math.abs(v); const P=[[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n']]; for(const [m,p] of P){ if(a>=m*0.9999) return (+((v/m).toPrecision(d)))+' '+p+u; } return v.toExponential(2)+' '+u; }
function simShell(host,key,ctlHtml,extraHead=''){
  const m=SIMS[key];
  host.innerHTML=`<section class="sim" style="--c:${m.c}"><div class="sim-h"><span class="ttl"><span class="led on"></span>${m.name}</span>${extraHead}</div><div class="sim-b"><div class="scope"></div><div class="ctl">${ctlHtml}</div></div></section>`;
  const scope=$('.scope',host), cv=document.createElement('canvas'); scope.appendChild(cv);
  const ctx=cv.getContext('2d'); const S2={W:0,H:0};
  let drawFn=()=>{};
  const size=()=>{ const r=scope.getBoundingClientRect(), d=window.devicePixelRatio||1; S2.W=r.width; S2.H=r.height; cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); ctx.setTransform(d,0,0,d,0,0); drawFn(); };
  const ro=new ResizeObserver(size); ro.observe(scope); cleanup.push(()=>ro.disconnect());
  $$('input[type=range]',host).forEach(fillTrack);
  return {host,cv,ctx,S:S2,setDraw(f){drawFn=f;size();},draw(){drawFn();}};
}
function scopeGrid(ctx,W,H,cols=10,rows=8){
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(120,255,190,.08)'; ctx.lineWidth=1;
  for(let i=0;i<=cols;i++){const x=Math.round(W*i/cols)+.5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let i=0;i<=rows;i++){const y=Math.round(H*i/rows)+.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='rgba(120,255,190,.18)';
  const cx=Math.round(W/2)+.5, cy=Math.round(H/2)+.5;
  for(let i=0;i<=cols*5;i++){const x=W*i/(cols*5);ctx.beginPath();ctx.moveTo(x,cy-3);ctx.lineTo(x,cy+3);ctx.stroke();}
  for(let i=0;i<=rows*5;i++){const y=H*i/(rows*5);ctx.beginPath();ctx.moveTo(cx-3,y);ctx.lineTo(cx+3,y);ctx.stroke();}
}
function glowLine(ctx,pts,color,w=2.4,dash){
  ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=w; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.shadowColor=color; ctx.shadowBlur=10; if(dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke(); ctx.restore();
}
function label(ctx,t,x,y,color,align='left',size=11){ ctx.save(); ctx.font=`${size}px "Martian Mono", monospace`; ctx.fillStyle=color; ctx.textAlign=align; ctx.fillText(t,x,y); ctx.restore(); }
function bindInputs(host,fn){ $$('input[type=range]',host).forEach(el=>el.addEventListener('input',()=>{fillTrack(el);fn();})); }
function loop(fn){ let id, last=performance.now(); const step=t=>{ const dt=Math.min(.05,(t-last)/1000); last=t; fn(dt); id=requestAnimationFrame(step); }; id=requestAnimationFrame(step); cleanup.push(()=>cancelAnimationFrame(id)); }
const rd = (pairs) => `<div class="rd">${pairs.map(([k,id])=>`<div><b id="${id}">·</b><span>${k}</span></div>`).join('')}</div>`;
function setT(id,v){ const e=document.getElementById(id); if(e) e.textContent=v; }

function mountSim(key,host){ ({phasor:simPhasor,rotate:simRotate,divider:simDivider,rc:simRC,pid:simPID,arm:simArm})[key](host); }

/* --- phasor --- */
function simPhasor(host){
  const sh=simShell(host,'phasor',knob('ph-a','Amplitude',0.2,1,0.05,0.8)+knob('ph-f','Frequency (Hz)',0.25,2,0.05,0.5)+knob('ph-p','Phase φ (deg)',-180,180,5,60)+rd([['ω rad/s','ph-w'],['φ rad','ph-r'],['Period','ph-T'],['vs ref','ph-l']])+`<p class="hint">Yellow is the reference at 0°. Cyan is yours. Positive φ means your wave leads: it reaches its peak earlier.</p>`);
  let th=0; const hist=[];
  const get=()=>({A:kv($('#ph-a')),f:kv($('#ph-f')),p:kv($('#ph-p'))});
  const upd=()=>{const {A,f,p}=get(); setT('ph-a-o',A.toFixed(2)); setT('ph-f-o',f.toFixed(2)); setT('ph-p-o',p+'°'); setT('ph-w',(2*Math.PI*f).toFixed(2)); setT('ph-r',(p*Math.PI/180).toFixed(3)); setT('ph-T',(1/f).toFixed(2)+' s'); setT('ph-l',p>0?'LEADS':p<0?'LAGS':'IN PHASE');};
  bindInputs(host,upd); upd();
  const draw=()=>{
    const {ctx,S:{W,H}}=sh; const {A,f,p}=get(); scopeGrid(ctx,W,H);
    const R=Math.min(W*0.18,H*0.36), cx=R+24, cy=H/2, x0=cx+R+30;
    const c1=css('--ch1'), c2=css('--ch2');
    ctx.strokeStyle='rgba(120,255,190,.25)'; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke();
    const a1=th, a2=th+p*Math.PI/180;
    const p1=[cx+R*Math.cos(a1),cy-R*Math.sin(a1)], p2=[cx+R*A*Math.cos(a2),cy-R*A*Math.sin(a2)];
    glowLine(ctx,[[cx,cy],p1],c1,2); glowLine(ctx,[[cx,cy],p2],c2,3);
    ctx.setLineDash([3,4]); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(p2[0],p2[1]); ctx.lineTo(x0,p2[1]); ctx.stroke(); ctx.setLineDash([]);
    // waves: x axis time going right into the past
    const span=W-x0-10, Tw=2/f;
    const w1=[],w2=[]; for(let i=0;i<=200;i++){ const x=x0+span*i/200; const tt=-i/200*Tw*1.5; const ang=th+2*Math.PI*f*tt; w1.push([x,cy-R*Math.sin(ang)]); w2.push([x,cy-R*A*Math.sin(ang+p*Math.PI/180)]); }
    glowLine(ctx,w1,c1,1.6,[5,4]); glowLine(ctx,w2,c2,2.6);
    ctx.fillStyle=c2; ctx.beginPath(); ctx.arc(x0,p2[1],4,0,7); ctx.fill();
    label(ctx,'φ = '+p+'°',16,22,css('--amber')); label(ctx,'time →  past',W-12,H-12,'rgba(200,230,220,.45)','right',10);
  };
  sh.setDraw(draw);
  if(RM){ draw(); return; }
  loop(dt=>{ th+=2*Math.PI*kv($('#ph-f'))*dt; draw(); });
  void hist;
}
/* --- rotate --- */
function simRotate(host){
  const sh=simShell(host,'rotate',knob('ro-t','Rotation θ (deg)',-180,180,1,35)+knob('ro-x','Vector x',-3,3,0.1,2.5)+knob('ro-y','Vector y',-3,3,0.1,1)+`<div id="ro-m" class="rd"></div>`+rd([['x′','ro-xx'],['y′','ro-yy'],['|v|','ro-n'],['|v′|','ro-n2']]));
  const draw=()=>{
    const {ctx,S:{W,H}}=sh; scopeGrid(ctx,W,H);
    const t=kv($('#ro-t'))*Math.PI/180, x=kv($('#ro-x')), y=kv($('#ro-y'));
    const c=Math.cos(t), s=Math.sin(t), xr=x*c-y*s, yr=x*s+y*c;
    setT('ro-t-o',kv($('#ro-t'))+'°'); setT('ro-x-o',x.toFixed(1)); setT('ro-y-o',y.toFixed(1));
    $('#ro-m').innerHTML=`<div><b>${c.toFixed(3)}</b><span>cos θ</span></div><div><b>${(-s).toFixed(3)}</b><span>−sin θ</span></div><div><b>${s.toFixed(3)}</b><span>sin θ</span></div><div><b>${c.toFixed(3)}</b><span>cos θ</span></div>`;
    setT('ro-xx',xr.toFixed(3)); setT('ro-yy',yr.toFixed(3)); setT('ro-n',Math.hypot(x,y).toFixed(3)); setT('ro-n2',Math.hypot(xr,yr).toFixed(3));
    const cx=W/2, cy=H/2, k=Math.min(W,H)/8;
    ctx.strokeStyle='rgba(200,230,220,.35)'; ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke();
    const a0=Math.atan2(y,x), r=Math.hypot(x,y)*k*0.35;
    ctx.strokeStyle=css('--amber'); ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(cx,cy,Math.max(18,r),-a0,-(a0+t),t>0); ctx.stroke();
    const arrow=(px,py,col,w)=>{ glowLine(ctx,[[cx,cy],[cx+px*k,cy-py*k]],col,w); const ang=Math.atan2(-py,px); ctx.save(); ctx.translate(cx+px*k,cy-py*k); ctx.rotate(ang); ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-11,-5); ctx.lineTo(-11,5); ctx.fill(); ctx.restore(); };
    arrow(x,y,css('--ch1'),2.4); arrow(xr,yr,css('--ch8'),3);
    label(ctx,'v',cx+x*k+8,cy-y*k+14,css('--ch1')); label(ctx,'v′',cx+xr*k+8,cy-yr*k-6,css('--ch8'));
    label(ctx,'1 div = 1 unit',12,H-12,'rgba(200,230,220,.45)','left',10);
  };
  bindInputs(host,draw); sh.setDraw(draw);
}
/* --- divider --- */
function simDivider(host){
  const sh=simShell(host,'divider',knob('dv-v','Vin (V)',1,30,0.5,24)+knob('dv-1','R1',100,100000,1,39000,true)+knob('dv-2','R2',100,100000,1,10000,true)+`<div class="knob"><label>Load on Vout</label><div class="tog"><button data-l="0" class="on">No load</button><button data-l="1">Load on</button></div></div>`+knob('dv-l','RL',100,1000000,1,10000,true)+rd([['Vout','dv-o'],['Unloaded','dv-u'],['Current','dv-i'],['Sag','dv-s']]));
  let load=false, needle=0, vel=0;
  $$('.tog button',host).forEach(b=>b.onclick=()=>{ load=b.dataset.l==='1'; $$('.tog button',host).forEach(x=>x.classList.toggle('on',x===b)); calc(); });
  let vals={};
  const calc=()=>{
    const V=kv($('#dv-v')), R1=kv($('#dv-1')), R2=kv($('#dv-2')), RL=kv($('#dv-l'));
    const R2e=load?R2*RL/(R2+RL):R2, Vo=V*R2e/(R1+R2e), Vu=V*R2/(R1+R2), I=V/(R1+R2e);
    vals={V,R1,R2,RL,R2e,Vo,Vu,I};
    setT('dv-v-o',V.toFixed(1)+' V'); setT('dv-1-o',eng(R1,'Ω')); setT('dv-2-o',eng(R2,'Ω')); setT('dv-l-o',eng(RL,'Ω'));
    setT('dv-o',Vo.toFixed(2)+' V'); setT('dv-u',Vu.toFixed(2)+' V'); setT('dv-i',eng(I,'A')); setT('dv-s',load?((1-Vo/Vu)*100).toFixed(1)+'%':'0%');
    $('#dv-l').disabled=!load; $('#dv-l').parentElement.style.opacity=load?1:.45;
    if(RM){ needle=Vo; sh.draw(); }
  };
  bindInputs(host,calc); calc(); needle=0;
  const draw=()=>{
    const {ctx,S:{W,H}}=sh; scopeGrid(ctx,W,H);
    const {V,R1,R2e,Vo}=vals; if(V===undefined) return;
    // stacked bar
    const bx=34, bw=46, top=30, bot=H-34, h=bot-top;
    const h1=h*R1/(R1+R2e);
    ctx.fillStyle='rgba(255,191,71,.18)'; ctx.fillRect(bx,top,bw,h1); ctx.strokeStyle=css('--amber'); ctx.strokeRect(bx+.5,top+.5,bw,h1);
    ctx.fillStyle='rgba(63,224,255,.18)'; ctx.fillRect(bx,top+h1,bw,h-h1); ctx.strokeStyle=css('--ch2'); ctx.strokeRect(bx+.5,top+h1+.5,bw,h-h1);
    label(ctx,'R1 drop',bx+bw+10,top+h1/2+4,css('--amber'),'left',10); label(ctx,(V-Vo).toFixed(2)+' V',bx+bw+10,top+h1/2+18,'#fff','left',11);
    label(ctx,'R2'+(load?' ∥ RL':''),bx+bw+10,top+h1+(h-h1)/2+4,css('--ch2'),'left',10); label(ctx,Vo.toFixed(2)+' V',bx+bw+10,top+h1+(h-h1)/2+18,'#fff','left',11);
    label(ctx,V.toFixed(1)+' V',bx+bw/2,top-10,'rgba(200,230,220,.7)','center',10); label(ctx,'0 V',bx+bw/2,bot+18,'rgba(200,230,220,.7)','center',10);
    // analogue meter
    const mx=Math.max(bx+bw+170,W*0.62), my=H*0.7, R=Math.min(W-mx-20, H*0.55, 190);
    if(R>40){
      const full=Math.max(5,Math.ceil(V/5)*5);
      ctx.strokeStyle='rgba(200,230,220,.4)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(mx,my,R,Math.PI*1.15,Math.PI*1.85); ctx.stroke();
      for(let i=0;i<=10;i++){ const a=Math.PI*1.15+Math.PI*0.7*i/10; const r1=R-(i%5?6:12); ctx.beginPath(); ctx.moveTo(mx+R*Math.cos(a),my+R*Math.sin(a)); ctx.lineTo(mx+r1*Math.cos(a),my+r1*Math.sin(a)); ctx.stroke(); if(i%5===0) label(ctx,String(full*i/10),mx+(R+14)*Math.cos(a),my+(R+14)*Math.sin(a)+4,'rgba(200,230,220,.6)','center',10); }
      const a=Math.PI*1.15+Math.PI*0.7*Math.max(0,Math.min(1.04,needle/full));
      glowLine(ctx,[[mx,my],[mx+(R-4)*Math.cos(a),my+(R-4)*Math.sin(a)]],css('--phos'),2.4);
      ctx.fillStyle=css('--phos'); ctx.beginPath(); ctx.arc(mx,my,5,0,7); ctx.fill();
      label(ctx,'Vout',mx,my+26,css('--ch2'),'center',11); label(ctx,needle.toFixed(2)+' V',mx,my+44,'#fff','center',14);
    }
  };
  sh.setDraw(draw);
  if(RM) return;
  loop(dt=>{ // underdamped needle: ζ≈0.3
    const wn=9, z=0.28, target=vals.Vo||0; const acc=wn*wn*(target-needle)-2*z*wn*vel; vel+=acc*dt; needle+=vel*dt; draw();
  });
}
/* --- RC --- */
function simRC(host){
  const sh=simShell(host,'rc',knob('rc-r','R',100,100000,1,10000,true)+knob('rc-c','C',1e-6,1e-3,1,100e-6,true)+knob('rc-v','Vs (V)',1,30,0.5,12)+`<div class="knob"><label>Mode</label><div class="tog"><button data-m="c" class="on">Charge</button><button data-m="d">Discharge</button></div></div>`+rd([['τ = RC','rc-t'],['Rise 10-90%','rc-tr'],['5τ (settled)','rc-5'],['Energy ½CV²','rc-e']]));
  let mode='c', sweep=1, t0=0;
  $$('.tog button',host).forEach(b=>b.onclick=()=>{ mode=b.dataset.m; $$('.tog button',host).forEach(x=>x.classList.toggle('on',x===b)); restart(); });
  const restart=()=>{ sweep=RM?1:0; t0=performance.now(); upd(); };
  const nice=v=>{ const e=Math.pow(10,Math.floor(Math.log10(v))); for(const m of [1,2,5,10]) if(m*e>=v) return m*e; return 10*e; };
  const upd=()=>{ const R=kv($('#rc-r')),C=kv($('#rc-c')),V=kv($('#rc-v')),tau=R*C;
    setT('rc-r-o',eng(R,'Ω')); setT('rc-c-o',eng(C,'F')); setT('rc-v-o',V.toFixed(1)+' V');
    setT('rc-t',eng(tau,'s')); setT('rc-tr',eng(2.197*tau,'s')); setT('rc-5',eng(5*tau,'s')); setT('rc-e',eng(0.5*C*V*V,'J')); sh.draw(); };
  bindInputs(host,restart);
  const draw=()=>{
    const {ctx,S:{W,H}}=sh; scopeGrid(ctx,W,H);
    const R=kv($('#rc-r')),C=kv($('#rc-c')),V=kv($('#rc-v')),tau=R*C, win=nice(6*tau);
    const pl=46,pr=16,pt=26,pb=34, X=t=>pl+(W-pl-pr)*t/win, Y=v=>H-pb-(H-pb-pt)*v/30;
    const f=t=>mode==='c'?V*(1-Math.exp(-t/tau)):V*Math.exp(-t/tau);
    // axes labels
    for(let i=0;i<=5;i++) label(ctx,eng(win*i/5,'s',2),X(win*i/5),H-12,'rgba(200,230,220,.55)','center',9);
    for(const v of [0,10,20,30]) label(ctx,v+' V',pl-6,Y(v)+4,'rgba(200,230,220,.55)','right',9);
    // Vs line
    ctx.setLineDash([5,5]); ctx.strokeStyle='rgba(255,191,71,.6)'; ctx.beginPath(); ctx.moveTo(pl,Y(V)); ctx.lineTo(W-pr,Y(V)); ctx.stroke(); ctx.setLineDash([]);
    // rise band
    const a=mode==='c'?0.1:0.9, b=mode==='c'?0.9:0.1;
    const ta=-tau*Math.log(mode==='c'?1-a:a), tb=-tau*Math.log(mode==='c'?1-b:b);
    ctx.fillStyle='rgba(255,191,71,.08)'; ctx.fillRect(X(Math.min(ta,tb)),pt,X(Math.max(ta,tb))-X(Math.min(ta,tb)),H-pb-pt);
    label(ctx,mode==='c'?'rise time':'fall time',(X(ta)+X(tb))/2,pt+12,css('--amber'),'center',10);
    // tau marker
    ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.setLineDash([2,4]); ctx.beginPath(); ctx.moveTo(X(tau),Y(0)); ctx.lineTo(X(tau),Y(f(tau))); ctx.lineTo(pl,Y(f(tau))); ctx.stroke(); ctx.setLineDash([]);
    label(ctx,'τ',X(tau)+6,Y(0)-6,'#fff','left',11); label(ctx,(mode==='c'?'63%':'37%'),pl+4,Y(f(tau))-6,'rgba(255,255,255,.7)','left',10);
    const pts=[]; const N=240, upto=Math.floor(N*sweep); for(let i=0;i<=upto;i++){const t=win*i/N; pts.push([X(t),Y(f(t))]);}
    glowLine(ctx,pts,css('--ch3'),2.6);
    if(pts.length){ const p=pts[pts.length-1]; ctx.fillStyle=css('--ch3'); ctx.beginPath(); ctx.arc(p[0],p[1],4,0,7); ctx.fill(); }
    label(ctx,'vC',W-pr-4,pt+12,css('--ch3'),'right',11);
  };
  sh.setDraw(draw); upd(); restart();
  if(!RM) loop(()=>{ if(sweep<1){ sweep=Math.min(1,(performance.now()-t0)/900); draw(); } });
}
/* --- PID --- */
function simPID(host){
  const sh=simShell(host,'pid',knob('pd-p','Kp',0,12,0.1,2)+knob('pd-i','Ki',0,6,0.05,0.6)+knob('pd-d','Kd',0,3,0.05,0.2)+`<div class="knob"><label>Presets</label><div class="tog"><button data-p="slug">Sluggish</button><button data-p="good">Tuned</button><button data-p="wild">Aggressive</button></div></div>`+rd([['Rise 10-90%','pd-r'],['Overshoot','pd-o'],['Settling 2%','pd-s'],['Final error','pd-e']])+`<p class="hint">Plant: two lags, 1 s and 0.5 s, with a 0.15 s dead time. Like a heated tank or a slow hydraulic axis.</p>`);
  const presets={slug:[0.8,0.15,0],good:[2.6,1.0,0.55],wild:[9,4,0.1]};
  $$('[data-p]',host).forEach(b=>b.onclick=()=>{ const [p,i,d]=presets[b.dataset.p]; $('#pd-p').value=p; $('#pd-i').value=i; $('#pd-d').value=d; $$('input[type=range]',host).forEach(fillTrack); run(); });
  let res=null, sweep=1, t0=0;
  const run=()=>{
    const Kp=kv($('#pd-p')),Ki=kv($('#pd-i')),Kd=kv($('#pd-d'));
    setT('pd-p-o',Kp.toFixed(1)); setT('pd-i-o',Ki.toFixed(2)); setT('pd-d-o',Kd.toFixed(2));
    const dt=0.005, T=14, ts=1, delay=Math.round(0.15/dt); let x1=0,x2=0,I=0,yPrev=0; const buf=new Array(delay).fill(0);
    const ys=[],us=[];
    for(let k=0;k*dt<=T;k++){
      const t=k*dt, sp=t>=ts?1:0, y=x2, e=sp-y;
      const D=-(y-yPrev)/dt; yPrev=y;
      let u=Kp*e+Ki*I+Kd*D; const us_=Math.max(-2,Math.min(4,u));
      if(u===us_ || Math.sign(e)!==Math.sign(u)) I+=e*dt;
      buf.push(us_); const ud=buf.shift();
      x1+=dt*(ud-x1)/1.0; x2+=dt*(x1-x2)/0.5;
      if(k%4===0){ ys.push([t,y]); us.push([t,us_]); }
    }
    let t10=null,t90=null,ymax=0,tset=null;
    ys.forEach(([t,y])=>{ if(t<ts) return; if(t10===null&&y>=0.1) t10=t; if(t90===null&&y>=0.9) t90=t; ymax=Math.max(ymax,y); if(Math.abs(y-1)>0.02) tset=t; });
    const fin=ys[ys.length-1][1];
    res={ys,us,T,ts};
    setT('pd-r',t10!==null&&t90!==null?(t90-t10).toFixed(2)+' s':'never');
    setT('pd-o',ymax>1?((ymax-1)*100).toFixed(1)+'%':'none');
    setT('pd-s',tset===null?'0 s':(tset>=T-0.05?'not settled':(tset-ts).toFixed(2)+' s'));
    setT('pd-e',(Math.abs(1-fin)*100).toFixed(1)+'%');
    sweep=RM?1:0; t0=performance.now(); sh.draw();
  };
  bindInputs(host,run);
  const draw=()=>{
    const {ctx,S:{W,H}}=sh; scopeGrid(ctx,W,H); if(!res) return;
    const pl=40,pr=14,pt=20,pb=30, X=t=>pl+(W-pl-pr)*t/res.T, Y=v=>H-pb-(H-pb-pt)*(v+0.25)/2.0;
    for(const v of [0,0.5,1,1.5]) label(ctx,v.toFixed(1),pl-6,Y(v)+4,'rgba(200,230,220,.55)','right',9);
    for(let s=0;s<=res.T;s+=2) label(ctx,s+' s',X(s),H-10,'rgba(200,230,220,.55)','center',9);
    ctx.fillStyle='rgba(255,191,71,.07)'; ctx.fillRect(pl,Y(1.02),W-pl-pr,Y(0.98)-Y(1.02));
    glowLine(ctx,[[X(0),Y(0)],[X(res.ts),Y(0)],[X(res.ts),Y(1)],[X(res.T),Y(1)]],css('--amber'),1.4,[6,5]);
    const n=Math.floor(res.ys.length*sweep);
    glowLine(ctx,res.us.slice(0,n).map(([t,u])=>[X(t),Y(u*0.25)]),'rgba(63,224,255,.55)',1.2);
    glowLine(ctx,res.ys.slice(0,n).map(([t,y])=>[X(t),Y(y)]),css('--ch5'),2.6);
    label(ctx,'setpoint',W-pr-4,Y(1)-8,css('--amber'),'right',10); label(ctx,'PV',W-pr-4,Y(1)+18,css('--ch5'),'right',10); label(ctx,'output ÷ 4',pl+6,pt+10,'rgba(63,224,255,.8)','left',9);
  };
  sh.setDraw(draw); run();
  if(!RM) loop(()=>{ if(sweep<1){ sweep=Math.min(1,(performance.now()-t0)/1100); draw(); } });
}
/* --- arm --- */
function simArm(host){
  const sh=simShell(host,'arm',knob('ar-1','Link 1 (m)',0.4,1.4,0.05,1)+knob('ar-2','Link 2 (m)',0.3,1.2,0.05,0.75)+knob('ar-a','θ1 shoulder (deg)',-180,180,1,40)+knob('ar-b','θ2 elbow (deg)',-170,170,1,60)+`<div class="knob"><label>IK solution</label><div class="tog"><button data-e="1" class="on">θ2 negative</button><button data-e="-1">θ2 positive</button></div></div>`+rd([['x','ar-x'],['y','ar-y'],['Reach','ar-r'],['IK','ar-k']])+`<p class="hint">Tap or click inside the scope to set a target. Inverse kinematics solves the joint angles and the arm moves there.</p>`);
  let elbow=1, target=null, anim=null; const trail=[];
  $$('[data-e]',host).forEach(b=>b.onclick=()=>{ elbow=+b.dataset.e; $$('[data-e]',host).forEach(x=>x.classList.toggle('on',x===b)); if(target) solve(target); });
  const geo=()=>{ const {W,H}=sh.S; const l1=kv($('#ar-1')),l2=kv($('#ar-2')); const k=Math.min(W,H)*0.42/(l1+l2); return {cx:W/2,cy:H*0.55,k,l1,l2}; };
  const fk=()=>{ const {l1,l2}=geo(); const a=kv($('#ar-a'))*Math.PI/180, b=kv($('#ar-b'))*Math.PI/180; return {a,b,ex:l1*Math.cos(a),ey:l1*Math.sin(a),x:l1*Math.cos(a)+l2*Math.cos(a+b),y:l1*Math.sin(a)+l2*Math.sin(a+b)}; };
  const upd=()=>{ const {l1,l2}=geo(); const p=fk(); setT('ar-1-o',l1.toFixed(2)); setT('ar-2-o',l2.toFixed(2)); setT('ar-a-o',Math.round(kv($('#ar-a')))+'°'); setT('ar-b-o',Math.round(kv($('#ar-b')))+'°'); setT('ar-x',p.x.toFixed(3)+' m'); setT('ar-y',p.y.toFixed(3)+' m'); setT('ar-r',(l1+l2).toFixed(2)+' m'); };
  function solve(tg){
    const {l1,l2}=geo(); const d=(tg.x*tg.x+tg.y*tg.y-l1*l1-l2*l2)/(2*l1*l2);
    if(Math.abs(d)>1){ setT('ar-k','OUT OF REACH'); target={...tg,bad:true}; sh.draw(); return; }
    const b=elbow*Math.acos(d)*-1, a=Math.atan2(tg.y,tg.x)-Math.atan2(l2*Math.sin(b),l1+l2*Math.cos(b));
    let A=a*180/Math.PI, B=b*180/Math.PI; A=((A+540)%360)-180;
    setT('ar-k','SOLVED'); target=tg;
    const fromA=kv($('#ar-a')), fromB=kv($('#ar-b'));
    if(RM){ $('#ar-a').value=Math.round(A); $('#ar-b').value=Math.round(B); $$('input[type=range]',host).forEach(fillTrack); upd(); sh.draw(); return; }
    anim={fromA,fromB,A,B,t:0};
  }
  sh.cv.addEventListener('pointerdown',e=>{ const r=sh.cv.getBoundingClientRect(); const {cx,cy,k}=geo(); solve({x:(e.clientX-r.left-cx)/k,y:-(e.clientY-r.top-cy)/k}); });
  bindInputs(host,()=>{ anim=null; setT('ar-k','MANUAL'); upd(); sh.draw(); });
  const draw=()=>{
    const {ctx,S:{W,H}}=sh; scopeGrid(ctx,W,H); const {cx,cy,k,l1,l2}=geo(); const p=fk();
    ctx.setLineDash([4,6]); ctx.strokeStyle='rgba(95,255,215,.25)'; ctx.beginPath(); ctx.arc(cx,cy,(l1+l2)*k,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(cx,cy,Math.abs(l1-l2)*k,0,7); ctx.stroke(); ctx.setLineDash([]);
    if(trail.length>1){ ctx.strokeStyle='rgba(255,191,71,.35)'; ctx.lineWidth=1.2; ctx.beginPath(); trail.forEach((q,i)=>i?ctx.lineTo(cx+q[0]*k,cy-q[1]*k):ctx.moveTo(cx+q[0]*k,cy-q[1]*k)); ctx.stroke(); }
    ctx.fillStyle='rgba(200,230,220,.15)'; ctx.fillRect(cx-26,cy+6,52,10);
    const J=[[cx,cy],[cx+p.ex*k,cy-p.ey*k],[cx+p.x*k,cy-p.y*k]];
    glowLine(ctx,[J[0],J[1]],css('--ch9'),7); glowLine(ctx,[J[1],J[2]],css('--ch9'),5);
    J.forEach((q,i)=>{ ctx.fillStyle=i===2?css('--amber'):'#06100e'; ctx.strokeStyle=css('--ch9'); ctx.lineWidth=2; ctx.beginPath(); ctx.arc(q[0],q[1],i===2?5:7,0,7); ctx.fill(); ctx.stroke(); });
    if(target){ const tx=cx+target.x*k, ty=cy-target.y*k, col=target.bad?css('--bad'):css('--amber'); ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(tx-9,ty); ctx.lineTo(tx+9,ty); ctx.moveTo(tx,ty-9); ctx.lineTo(tx,ty+9); ctx.stroke(); ctx.beginPath(); ctx.arc(tx,ty,13,0,7); ctx.stroke(); }
    label(ctx,`x = l1 cos θ1 + l2 cos(θ1 + θ2)`,12,20,'rgba(200,230,220,.6)','left',10);
    label(ctx,`y = l1 sin θ1 + l2 sin(θ1 + θ2)`,12,36,'rgba(200,230,220,.6)','left',10);
  };
  sh.setDraw(draw); upd();
  loop(dt=>{
    if(anim){ anim.t=Math.min(1,anim.t+dt/0.9); const e=anim.t<1?1-Math.pow(1-anim.t,3):1;
      $('#ar-a').value=anim.fromA+(anim.A-anim.fromA)*e; $('#ar-b').value=anim.fromB+(anim.B-anim.fromB)*e; $$('input[type=range]',host).forEach(fillTrack); upd();
      const p=fk(); trail.push([p.x,p.y]); if(trail.length>160) trail.shift(); if(anim.t>=1) anim=null; draw(); }
  });
}

/* ---------- boot ---------- */
document.body.insertAdjacentHTML('afterbegin',`<div class="fx noise"></div><div class="fx scan"></div><div class="fx vig"></div>`);
$('#brandmark').innerHTML=brandSvg;
paintStatus();
route();
initCloud();
addEventListener('online',paintStatus); addEventListener('offline',paintStatus);
try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(e){}
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
  let had=!!navigator.serviceWorker.controller, shown=false;
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(had&&!shown){ shown=true; banner('Rise Time has been updated','Reload',()=>location.reload()); } had=true; });
}
window.__RT_TEST = {weekdaysAfter,addWeekdays,streak,unlocked,setState:x=>{S=Object.assign(blank(),x);},getState:()=>S,checkNum,ymd};
})();
