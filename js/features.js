/* ============ RISE TIME : exam, plant log, settings, shortcuts, reminders ============ */
(function(){
const RT = window.RT, C = () => RT.core;
RT.views = RT.views || {};
const $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const PREF = 'risetime.prefs';
let P = {theme:'dark', remind:{on:false,time:'06:30'}};
try{ const d=JSON.parse(localStorage.getItem(PREF)||'{}'); P=Object.assign(P,d); P.remind=Object.assign({on:false,time:'06:30'},d.remind||{}); }catch(e){}
const saveP = () => { try{ localStorage.setItem(PREF,JSON.stringify(P)); }catch(e){} };
const isLight = () => P.theme==='light' || (P.theme==='auto' && matchMedia('(prefers-color-scheme: light)').matches);
function applyTheme(){
  document.documentElement.dataset.theme = isLight()?'light':'dark';
  const m=$('meta[name=theme-color]'); if(m) m.content = isLight()?'#ece8dc':'#06100e';
  const cs=$('meta[name=color-scheme]'); if(cs) cs.content = isLight()?'light':'dark';
}
applyTheme();
matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',()=>{ if(P.theme==='auto') applyTheme(); });
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

/* ---------------------------------------------------------- capstone exam */
const EXAM_N = 20;
function examPool(){
  const c=C(), by={};
  c.ALL.forEach(s=>{ if(s.pipe||s.review) return; const st=c.status(s); if(st!=='done'&&st!=='open') return;
    [...(s.tryit||[]),...(s.recall||[])].forEach(q=>{ (by[s.track]=by[s.track]||[]).push(q); }); });
  return by;
}
function pickExam(){
  const by=examPool(), keys=shuffle(Object.keys(by)); keys.forEach(k=>by[k]=shuffle(by[k]));
  const out=[]; let go=true;
  while(out.length<EXAM_N && go){ go=false; for(const k of keys){ if(out.length>=EXAM_N) break; const q=by[k].pop(); if(q){ out.push(q); go=true; } } }
  return shuffle(out);
}
RT.views.exam = function(){
  const c=C(); c.navOn('drill'); const app=c.app;
  const qs=pickExam();
  if(qs.length<8){
    c.setRUN(null);
    app.innerHTML=`<header class="shead"><div class="eyebrow">Capstone exam</div><h1>Not quite yet</h1><p>The exam draws ${EXAM_N} questions across every channel you have opened. Log a few more sessions first, then come back.</p></header><div class="row"><a class="btn pri" href="#today">Back to the bench</a></div>${c.footer()}`; return;
  }
  c.resetQS();
  const RUN={view:'exam',qs,t0:Date.now(),finished:false,onAnswer:()=>paintProg()};
  c.setRUN(RUN);
  const trks=[...new Set(qs.map(q=>c.QTRACK[q.id]))].filter(Boolean);
  app.innerHTML=`<div class="examview"><header class="shead"><div class="eyebrow">Capstone exam · ${qs.length} questions · ${trks.length} channels</div><h1>Prove it sticks</h1><p>Questions come from across the whole course, one channel at a time in turn. No hints here. Your first answer to each question is the one that counts.</p></header>
  <div class="qs" style="max-width:820px">${qs.map((q,i)=>c.renderQ(q,i,false)).join('')}</div>
  <div class="snav" style="max-width:820px"><span class="readout" id="eprog" style="margin:0"></span><div class="row"><button class="btn pri" id="efinish">Finish and score</button></div></div>
  <div id="examres"></div></div>${c.footer()}`;
  paintProg();
  $('#efinish').onclick=finishExam;
};
function paintProg(){ const c=C(), R=c.RUN; const el=$('#eprog'); if(!el||!R||R.view!=='exam') return; const done=R.qs.filter(q=>c.QS[q.id]&&c.QS[q.id].tries).length; el.textContent=`${done} OF ${R.qs.length} ANSWERED`; }
function finishExam(){
  const c=C(), R=c.RUN; if(!R||R.view!=='exam'||R.finished) return;
  const un=R.qs.filter(q=>!(c.QS[q.id]&&c.QS[q.id].tries)).length;
  const go=()=>{
    R.finished=true; const by={}; let ok=0; const miss=[];
    R.qs.forEach(q=>{ const t=c.QTRACK[q.id]||'REV', st=c.QS[q.id]; const good=!!(st&&st.first); by[t]=by[t]||[0,0]; by[t][1]++; if(good){ by[t][0]++; ok++; } else miss.push(q); });
    const ms=Date.now()-R.t0, n=R.qs.length, pct=Math.round(ok/n*100);
    const S=c.S; S.exams=S.exams||[]; const prev=S.exams.slice(-1)[0];
    S.exams.push({d:c.TODAY(),c:ok,n,ms,by}); if(S.exams.length>30) S.exams=S.exams.slice(-30); c.save();
    const msg = pct>=90?'Outstanding. This is firmly in long-term memory.':pct>=75?'Solid. A few gaps to tidy up.':pct>=50?'A decent base. The weak channels below are where to spend the next few mornings.':'The course is a lot to hold. Use the channels below to choose what to revisit first.';
    const rows=Object.entries(by).sort((a,b)=>a[1][0]/a[1][1]-b[1][0]/b[1][1]).map(([k,v])=>{ const t=c.TRACKS[k]||c.TRACKS.REV; const p=Math.round(v[0]/v[1]*100); return `<div class="sbar" style="--c:${t.color}"><span class="nm"><em>${t.ch}</em> ${t.name}</span><span class="trk"><i style="width:${p}%"></i></span><span class="pc">${v[0]}/${v[1]}</span></div>`; }).join('');
    const sess=[...new Set(miss.map(q=>c.QFROM[q.id]).filter(Boolean))].slice(0,6).map(id=>{ const s=c.ALL[id-1]; return `<a class="li" style="--c:${c.trk(s.track).color}" href="#session-${id}"><span class="when">${c.code(s)}</span><span class="t">${esc(s.title)}</span><span class="st">REVISIT</span></a>`; }).join('');
    $('#examres').innerHTML=`<section class="panel examres" style="max-width:820px;margin-top:22px"><div class="eyebrow">Exam result</div><div class="bigscore"><b>${ok}</b><span>/ ${n} right first time · ${pct}%</span></div><p>${msg}${prev?` Last time: ${prev.c}/${prev.n}.`:''}</p>
      <div class="sbars">${rows}</div>${sess?`<h3 style="margin:18px 0 8px">Worth revisiting</h3><div class="list">${sess}</div>`:''}
      <div class="row" style="margin-top:18px"><a class="btn pri" href="#exam" data-reexam>New exam</a><a class="btn" href="#stats">Your numbers</a></div></section>`;
    $('#efinish').disabled=true; $('[data-reexam]').onclick=e=>{ e.preventDefault(); RT.views.exam(); window.scrollTo({top:0}); };
    $('#examres').scrollIntoView({behavior:'smooth',block:'start'});
  };
  if(un) c.modal('Finish the exam?',`${un} question${un>1?'s are':' is'} unanswered and will count as wrong.`,'Finish',go); else go();
}
RT.examStats = function(){
  const c=C(), ex=(c.S.exams||[]).slice(-6).reverse();
  const list=ex.length?ex.map(e=>`<div class="li"><span class="when">${esc(e.d)}</span><span class="t">${e.c} of ${e.n} right first time</span><span class="st">${Math.round(e.c/e.n*100)}%</span></div>`).join(''):`<p class="empty">No exams taken yet.</p>`;
  return `<section class="panel statcard"><div class="eyebrow">Capstone exam</div><h3>Exam history</h3><div class="list">${list}</div><div class="row" style="margin-top:14px"><a class="btn sm" href="#exam">Take the exam</a></div></section>`;
};

/* ---------------------------------------------------------- plant log and notes */
const TAGS=['Fault','Observation','Question','Idea'];
const nid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function addNote(text,s,tag){
  const c=C(); text=text.trim(); if(!text) return false;
  c.S.notes=c.S.notes||[]; c.S.notes.push({id:nid(),d:c.TODAY(),s:s||0,tag,text:text.slice(0,2000)}); if(c.S.notes.length>400) c.S.notes=c.S.notes.slice(-400); c.save(); return true;
}
function delNote(id){ const c=C(); c.S.notes=(c.S.notes||[]).filter(n=>n.id!==id); c.save(); }
const tagSel = (id,sel) => `<select id="${id}" class="sel" aria-label="Tag">${TAGS.map(t=>`<option ${t===sel?'selected':''}>${t}</option>`).join('')}</select>`;
const noteHtml = (n,showSess) => { const c=C(); const s=n.s&&c.ALL[n.s-1]; return `<article class="note" data-note="${n.id}"><div class="nh"><span class="ntag t-${n.tag}">${esc(n.tag)}</span><span class="nd">${esc(n.d)}</span>${showSess&&s?`<a class="ns" href="#session-${s.id}">${c.code(s)} · ${esc(s.title)}</a>`:''}<button class="ndel" data-del="${n.id}" aria-label="Delete note" title="Delete">×</button></div><p>${esc(n.text).replace(/\n/g,'<br>')}</p></article>`; };
RT.notesBox = function(sid){
  const c=C(), mine=(c.S.notes||[]).filter(n=>n.s===sid).reverse();
  return `<section class="panel notesbox" id="notesbox"><div class="eyebrow">Your plant notes</div><h3>Where did you meet this on site?</h3>
  <textarea id="note-t" rows="3" maxlength="2000" placeholder="A fault you traced, a number you read off a nameplate, a question for your supervisor…"></textarea>
  <div class="row" style="margin-top:10px">${tagSel('note-tag','Observation')}<button class="btn sm pri" id="note-add">Save note</button><a class="btn sm ghost" href="#log">Open the log</a></div>
  <div class="notes" id="note-list">${mine.map(n=>noteHtml(n,false)).join('')}</div></section>`;
};
RT.notesBind = function(sid){
  const c=C(), box=$('#notesbox'); if(!box) return;
  const refresh=()=>{ $('#note-list').innerHTML=(c.S.notes||[]).filter(n=>n.s===sid).reverse().map(n=>noteHtml(n,false)).join(''); };
  $('#note-add').onclick=()=>{ if(addNote($('#note-t').value,sid,$('#note-tag').value)){ $('#note-t').value=''; refresh(); c.toast('Note saved'); } else c.toast('Write something first'); };
  box.addEventListener('click',e=>{ const d=e.target.closest('[data-del]'); if(d){ delNote(d.dataset.del); refresh(); } });
};
RT.views.log = function(){
  const c=C(); c.navOn('log'); c.setRUN(null); const app=c.app;
  let tag='', q='';
  const sessOpts=`<option value="0">General (no session)</option>`+c.ALL.filter(s=>!s.pipe&&(c.status(s)==='done'||c.status(s)==='open')).map(s=>`<option value="${s.id}">${c.code(s)} · ${esc(s.title)}</option>`).join('');
  app.innerHTML=`<header class="shead"><div class="eyebrow">Plant log · kept with your progress</div><h1>What you meet on site</h1><p>Faults, readings, questions and ideas, each tied to the session they relate to. It is backed up with your progress.</p></header>
  <div class="loggrid"><section class="panel notesbox"><div class="eyebrow">New entry</div>
    <textarea id="log-t" rows="5" maxlength="2000" placeholder="Symptom, what you checked, what cleared it…"></textarea>
    <div class="row" style="margin-top:10px">${tagSel('log-tag','Fault')}<select id="log-s" class="sel" aria-label="Related session">${sessOpts}</select></div>
    <div class="row" style="margin-top:12px"><button class="btn pri" id="log-add">Add to the log</button></div></section>
  <section><div class="phasebar" id="log-tags"><button class="on" data-t="">All</button>${TAGS.map(t=>`<button data-t="${t}">${t}</button>`).join('')}</div>
    <div class="searchbar"><input id="log-q" type="search" placeholder="Search your notes" autocomplete="off" aria-label="Search notes"><span class="readout" id="log-n" style="margin:0"></span></div>
    <div class="notes" id="log-list"></div>
    <div class="row" style="margin-top:16px"><button class="btn sm" id="log-copy">Copy all as text</button><button class="btn sm" id="log-dl">Download .txt</button></div></section></div>${c.footer()}`;
  const text=()=>(c.S.notes||[]).slice().reverse().map(n=>{ const s=n.s&&c.ALL[n.s-1]; return `[${n.d}] ${n.tag}${s?' · '+c.code(s)+' '+s.title:''}\n${n.text}\n`; }).join('\n');
  const paint=()=>{ const all=(c.S.notes||[]).slice().reverse().filter(n=>(!tag||n.tag===tag)&&(!q||(n.text+' '+n.tag).toLowerCase().includes(q)));
    $('#log-list').innerHTML=all.length?all.map(n=>noteHtml(n,true)).join(''):`<p class="empty">${(c.S.notes||[]).length?'Nothing matches.':'Nothing logged yet. The first fault you chase will be worth writing down.'}</p>`;
    $('#log-n').textContent=(c.S.notes||[]).length?all.length+' OF '+c.S.notes.length:''; };
  $('#log-add').onclick=()=>{ if(addNote($('#log-t').value,+$('#log-s').value,$('#log-tag').value)){ $('#log-t').value=''; paint(); c.toast('Added to the log'); } else c.toast('Write something first'); };
  $('#log-list').addEventListener('click',e=>{ const d=e.target.closest('[data-del]'); if(d){ delNote(d.dataset.del); paint(); } });
  $$('#log-tags button').forEach(b=>b.onclick=()=>{ tag=b.dataset.t; $$('#log-tags button').forEach(x=>x.classList.toggle('on',x===b)); paint(); });
  $('#log-q').addEventListener('input',e=>{ q=e.target.value.trim().toLowerCase(); paint(); });
  $('#log-copy').onclick=()=>{ navigator.clipboard?.writeText(text()).then(()=>c.toast('Copied'),()=>c.toast('Copy failed')); };
  $('#log-dl').onclick=()=>{ const u=URL.createObjectURL(new Blob([text()],{type:'text/plain'})); const a=document.createElement('a'); a.href=u; a.download='rise-time-plant-log-'+c.TODAY()+'.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),3000); };
  paint();
};

/* ---------------------------------------------------------- settings, reminders */
const ICS_URL = () => location.origin+location.pathname;
function downloadIcs(){
  const [hh,mm]=P.remind.time.split(':').map(Number); const d=new Date(); d.setHours(hh,mm,0,0);
  while(d.getDay()===0||d.getDay()===6||d<new Date()) d.setDate(d.getDate()+1);
  const f=x=>String(x).padStart(2,'0'), ds=`${d.getFullYear()}${f(d.getMonth()+1)}${f(d.getDate())}T${f(hh)}${f(mm)}00`;
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Rise Time//EN','BEGIN:VEVENT','UID:rise-time-daily@risetime','DTSTAMP:'+new Date().toISOString().replace(/[-:]|\.\d+/g,''),'DTSTART:'+ds,'DURATION:PT15M','RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR','SUMMARY:Rise Time: morning refresher','DESCRIPTION:15 minutes of mechatronics. '+ICS_URL(),'URL:'+ICS_URL(),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Rise Time','TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const u=URL.createObjectURL(new Blob([ics],{type:'text/calendar'})); const a=document.createElement('a'); a.href=u; a.download='rise-time-weekdays.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),3000);
}
async function pushState(){
  try{
    if(!('caches' in window)) return; const c=C(); const days=Object.values(c.S.done||{}).sort(); const last=days[days.length-1]||'';
    const cache=await caches.open('rtstate'); const old=await (await cache.match('state.json'))?.json().catch(()=>({}))||{};
    await cache.put('state.json',new Response(JSON.stringify({remind:P.remind,lastDone:last,notified:old.notified||''}),{headers:{'Content-Type':'application/json'}}));
  }catch(e){}
}
async function enableReminders(on){
  P.remind.on=on; saveP();
  if(!on){ await pushState(); try{ const reg=await navigator.serviceWorker?.ready; await reg?.periodicSync?.unregister('rise-time-daily'); }catch(e){} return 'Reminders are off.'; }
  if(!('Notification' in window)) return 'This browser does not support notifications. Use the calendar file instead.';
  let perm=Notification.permission; if(perm==='default') perm=await Notification.requestPermission();
  if(perm!=='granted'){ P.remind.on=false; saveP(); return 'Notifications are blocked for this site. Allow them in the browser settings, or use the calendar file.'; }
  await pushState(); let bg=false;
  try{ const reg=await navigator.serviceWorker.ready; if(reg.periodicSync){ await reg.periodicSync.register('rise-time-daily',{minInterval:12*3600*1000}); bg=true; } }catch(e){}
  return bg?'On. Rise Time will remind you on weekday mornings, even when closed. Browsers decide the exact moment, so treat it as "around" your time.':'On while Rise Time is open or in the background. This browser cannot wake the app when it is closed, so add the calendar file for a dependable alert.';
}
function openSettings(){
  const m=document.createElement('div'); m.className='modal';
  const th=(v,l)=>`<button data-th="${v}" class="${P.theme===v?'on':''}">${l}</button>`;
  m.innerHTML=`<div class="panel setpanel" role="dialog" aria-modal="true" aria-labelledby="st-h"><div class="sethead"><h3 id="st-h">Settings</h3><button class="ndel" data-close aria-label="Close">×</button></div>
   <div class="setrow"><label>Appearance</label><div class="tog" id="st-theme">${th('dark','Dark scope')}${th('light','Light paper')}${th('auto','Match device')}</div></div>
   <div class="setrow"><label>Morning reminder</label><div class="row"><input type="time" id="st-time" value="${P.remind.time}" class="sel"><button class="btn sm ${P.remind.on?'amber':''}" id="st-rem">${P.remind.on?'Turn off':'Turn on'}</button><button class="btn sm" id="st-ics">Calendar file</button></div><p class="hint" id="st-msg">${P.remind.on?'Reminders are on.':'Notifications where the browser allows them, or a repeating weekday calendar event that works anywhere.'}</p></div>
   <div class="setrow"><label>Keyboard shortcuts</label><div class="keys"><span><kbd>g</kbd> <kbd>t</kbd> Today</span><span><kbd>g</kbd> <kbd>m</kbd> Map</span><span><kbd>g</kbd> <kbd>l</kbd> Lab</span><span><kbd>g</kbd> <kbd>s</kbd> Sheet</span><span><kbd>g</kbd> <kbd>d</kbd> Drill</span><span><kbd>g</kbd> <kbd>p</kbd> Plant log</span><span><kbd>g</kbd> <kbd>x</kbd> Stats</span><span><kbd>g</kbd> <kbd>e</kbd> Exam</span><span><kbd>←</kbd> <kbd>→</kbd> Session stages</span><span><kbd>/</kbd> Search the sheet</span><span><kbd>Shift</kbd> <kbd>T</kbd> Switch theme</span><span><kbd>?</kbd> This panel</span></div></div></div>`;
  document.body.appendChild(m);
  const close=()=>m.remove(); m.onclick=e=>{ if(e.target===m||e.target.closest('[data-close]')) close(); };
  $$('#st-theme button',m).forEach(b=>b.onclick=()=>{ P.theme=b.dataset.th; saveP(); applyTheme(); $$('#st-theme button',m).forEach(x=>x.classList.toggle('on',x===b)); });
  $('#st-time',m).onchange=e=>{ P.remind.time=e.target.value||'06:30'; saveP(); pushState(); };
  $('#st-ics',m).onclick=()=>downloadIcs();
  $('#st-rem',m).onclick=async e=>{ const b=e.target; const msg=await enableReminders(!P.remind.on); b.textContent=P.remind.on?'Turn off':'Turn on'; b.classList.toggle('amber',P.remind.on); $('#st-msg',m).textContent=msg; };
  const esc2=e=>{ if(e.key==='Escape'){ close(); document.removeEventListener('keydown',esc2); } }; document.addEventListener('keydown',esc2);
}
RT.openSettings = openSettings;
// in-app reminder while the app is open
setInterval(()=>{
  try{
    if(!P.remind.on||!('Notification' in window)||Notification.permission!=='granted') return;
    const now=new Date(), wd=now.getDay(); if(wd===0||wd===6) return;
    const [h,m]=P.remind.time.split(':').map(Number); if(now.getHours()*60+now.getMinutes()<h*60+m) return;
    const c=C(), today=c.TODAY(); if(Object.values(c.S.done||{}).includes(today)) return;
    if(localStorage.getItem('risetime.notified')===today) return; localStorage.setItem('risetime.notified',today);
    navigator.serviceWorker?.ready.then(r=>r.showNotification('Rise Time',{body:"Today's session is ready. Fifteen minutes is all it takes.",icon:'icons/icon-192.png',tag:'rise-time-daily',data:{url:'./#today'}}));
  }catch(e){}
},60000);
addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') pushState(); });
addEventListener('pagehide',pushState);

/* ---------------------------------------------------------- keyboard */
let gWait=0;
addEventListener('keydown',e=>{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const t=e.target; if(t&&(t.matches('input,textarea,select')||t.isContentEditable)) return;
  if(document.querySelector('.modal')) return;
  const c=C(), k=e.key;
  if(gWait && Date.now()<gWait){ gWait=0; const map={t:'today',m:'map',l:'lab',s:'sheet',d:'drill',p:'log',x:'stats',e:'exam'}; if(map[k]){ location.hash='#'+map[k]; e.preventDefault(); } return; }
  if(k==='g'){ gWait=Date.now()+1300; return; }
  if(k==='?'){ openSettings(); e.preventDefault(); return; }
  if(k==='T'){ P.theme=isLight()?'dark':'light'; saveP(); applyTheme(); c.toast(isLight()?'Light paper':'Dark scope'); return; }
  if(k==='/'){ const s=$('#sheet-q')||$('#log-q'); if(s){ s.focus(); e.preventDefault(); } return; }
  const R=c.RUN;
  if(R&&R.view==='session'&&!R.complete&&(k==='ArrowRight'||k==='ArrowLeft')){ const bs=$$('.snav [data-go]'); const b=k==='ArrowRight'?bs[bs.length-1]:bs[0]; if(b&&!b.disabled){ b.click(); e.preventDefault(); } }
});
// show the daily nudge once per day when the app opens and the session is not logged
addEventListener('load',()=>{ pushState(); });
})();
