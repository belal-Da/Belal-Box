/* sheets, artifact viewer, model picker, boot */
const sh=(id,on)=>$('#'+id).classList[on?'add':'remove']('on');
document.querySelectorAll('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o&&o.id!='pv')o.classList.remove('on')}));
const IC={menu:'menu',ar_b:'file',nc2:'edit',gear:'gear',plus:'plus',mic:'mic'};for(const k in IC)$('#'+k).innerHTML=ic(IC[k]);$('#pvx').innerHTML=ic('x');
function lbl(){$('#inp').placeholder=t('Message Belal Box…|Belal Box-কে লিখুন…');$('#adt').textContent=t('Add to chat|চ্যাটে যোগ করুন');$('#wtl').textContent=t('Web search|ওয়েব সার্চ');$('#alt').textContent=t('Artifacts|আর্টিফ্যাক্ট');$('#nc').textContent=t('New chat|নতুন চ্যাট');$('#stbtn').textContent='Studio · '+t('Image & video|ছবি ও ভিডিও');[['t1','cam','Camera|ক্যামেরা'],['t2','img','Photos|ছবি'],['t3','clip','Files|ফাইল'],['t4','wand','Studio|স্টুডিও']].forEach(([i,n,l])=>$('#'+i).innerHTML=ic(n,26)+'<br>'+t(l));if($('#setb')&&$('#set').classList.contains('on'))drawSet()}
$('#plus').onclick=()=>{$('#wt').checked=cfg.search!='off';sh('ad',1)};$('#wt').onchange=e=>{cfg.search=e.target.checked?'auto':'off';save()};
[1,2,3].forEach(n=>$('#t'+n).onclick=()=>{sh('ad',0);$('#f'+n).click()});$('#t4').onclick=()=>{sh('ad',0);openStudio('image')};
$('#stbtn').onclick=()=>{sh('side',0);openStudio('image')};
$('#nc2').onclick=()=>{newChat();save();rend()};
const tile=n=>{const x=(n.split('.').pop()||'').toUpperCase(),d=/^(MD|TXT)$/.test(x);return`<div class="ft ${d?'bl':'or'}">${d?ic('file',26):'&lt;/&gt;'}</div><div><b>${esc(n)}</b><small>${d?'Document':'Code'} · ${esc(x)}</small></div>`};
function openAL(){const en=Object.entries(F).filter(([k,f])=>!f.p);$('#alb').innerHTML=en.length?en.map(([k,f])=>`<div class="fc" data-a="ar" data-k="${k}">${tile(f.n)}<button class="ib" data-a="dl" data-k="${k}">${ic('dl')}</button></div>`).join('')+`<button class="pri" data-a="zp" data-i="*">${t('Download all|সব ডাউনলোড')}</button>`:`<p style="color:var(--mu);margin:14px 0">${t('No files yet|এখনো কোনো ফাইল নেই')}</p>`;sh('al',1)}
$('#ar_b').onclick=openAL;
let AK='';
function openAR(k){const f=viewF(k);if(!f)return;AK=k;const M=[['cp','copy','Copy|কপি'],['dl','dl','Download|ডাউনলোড'],['pdf','file','Save as PDF|PDF সেভ'],...(/\.(html|svg)$/i.test(f.n)?[['pv','eye','Preview|প্রিভিউ']]:[])];
$('#arb').innerHTML=`<div class="vh"><button class="ib" data-v="x">${ic('x')}</button><b>${esc(f.n)}</b><button class="ib" data-v="m">${ic('more')}</button></div><div id="vm" class="vm" hidden>${M.map(([a,i,l])=>`<div class="rw" data-v="${a}">${ic(i,18)}<span>${t(l)}</span></div>`).join('')}</div><pre class="vp">${hl(f.c)}</pre>`;sh('ar',1)}
async function vact(a){const f=viewF(AK);if(a=='x')return sh('ar',0);if(a=='m'){const m=$('#vm');m.hidden=!m.hidden;return}$('#vm').hidden=true;
if(a=='cp')navigator.clipboard.writeText(f.c).then(()=>toast(t('Copied|কপি হয়েছে')));
if(a=='dl')dl(f.n.split('/').pop(),new Blob([f.c]));
if(a=='pv'){$('#pvf').srcdoc=bundle(AK);sh('pv',1)}
if(a=='pdf'){try{if(!window.jspdf)await new Promise((r,j)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=r;s.onerror=j;document.head.appendChild(s)});const d=new jspdf.jsPDF({unit:'pt',format:'a4'});d.setFont('courier');d.setFontSize(8);let y=30;for(const l of d.splitTextToSize(f.c,540)){if(y>810){d.addPage();y=30}d.text(l,28,y);y+=10}dl(f.n.split('/').pop()+'.pdf',d.output('blob'))}catch(e){toast(e.message)}}}
$('#alb').onclick=$('#chat').onclick;
$('#arb').onclick=e=>{const v=e.target.closest('[data-v]');if(v)return vact(v.dataset.v);$('#chat').onclick(e)};
$('#pvx').onclick=()=>{sh('pv',0);$('#pvf').srcdoc=''};
const pretty=id=>{const s=id.replace(/^.*\//,'').replace(/:free$/,''),m=/(opus|sonnet|haiku|fable|mythos)[-_ ]?(\d+)?[-_.]?(\d+)?/i.exec(s);if(/claude/i.test(s)&&m)return m[1][0].toUpperCase()+m[1].slice(1).toLowerCase()+(m[2]?' '+m[2]+(m[3]?'.'+m[3]:''):'');return s.replace(/[-_]+/g,' ').replace(/\b\w/g,x=>x.toUpperCase()).replace(/(\d) (\d)/g,'$1.$2')};
const MD={opus:'For complex work and everyday tasks',sonnet:'Most efficient for simpler tasks',haiku:'Fastest for quick answers',fable:'For your toughest challenges',mythos:'Most capable preview model'};
const mdesc=(id,p)=>{const f=(/(opus|sonnet|haiku|fable|mythos)/i.exec(id)||[])[1];if(f&&/claude/i.test(id))return MD[f.toLowerCase()];const c=caps(id,p),a=[];if(c.r)a.push('Reasoning');if(c.v)a.push('Vision');if(c.t)a.push('Tools');if(c.c)a.push(c.c+' context');return a.join(' · ')||'Chat model'};
let PALL=0;
function usageCard(p){const c=cur(),mx=ctxMax(p),u=cfg.use||{i:0,o:0},k=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':n,r=p.rl||{};return`<div class="card pad"><div class="ur"><span>Context</span><b>${k(c.ctx||0)} / ${k(mx)}</b></div><div class="ub"><i style="width:${Math.min(100,(c.ctx||0)/mx*100)}%"></i></div><div class="ur"><span>This chat</span><b>in ${k((c.u||{}).i||0)} · out ${k((c.u||{}).o||0)}</b></div><div class="ur"><span>Today</span><b>in ${k(u.i)} · out ${k(u.o)}</b></div>${r.tk||r.rq?`<div class="ur"><span>Limit left</span><b>${r.rq?r.rq+' req ':''}${r.tk?k(+r.tk)+' tok':''}</b></div>`:''}</div>`}
function openPicker(all){PALL=!!all;const p=cfg.provs[cfg.active],fav=p.fav||[],rc=p.recent||[],eff=cfg.effort||'auto',row=m=>`<div class="mr" data-m="${esc(m)}"><div class="mi"><b>${esc(pretty(m))}</b><small>${esc(mdesc(m,p))}</small></div><span class="mrr">${bd(m,p)}${m==p.model?ic('check',20):''}<button class="ib ${fav.includes(m)?'on':''}" data-fav="${esc(m)}">${ic('star',17)}</button></span></div>`;
let h=`<div class="vh"><button class="ib" data-v="x">${ic(all?'back':'x')}</button><b>${all?'All models':'Select model'}</b><i style="width:40px"></i></div>`;
if(all)h+=`<input id="mq" placeholder="Search models" style="width:100%;padding:10px;border-radius:12px;border:1px solid var(--bd);background:var(--cp);color:var(--fg)"><div class="card" id="mpl"></div>`;
else{const L=[...new Set([...fav,...rc,p.model].filter(Boolean))].slice(0,6);h+=`<div class="card">${L.map(row).join('')||'<p class="ds" style="padding:14px">Fetch models first: Settings > Models and providers</p>'}</div>${usageCard(p)}<div class="card"><div class="rw" data-eff="1"><span>Effort</span><span class="rt2">${eff[0].toUpperCase()+eff.slice(1)} ${ic('chev',16)}</span></div><div class="rw" data-all="1"><span>More models</span>${ic('chev',16)}</div></div>`}
$('#mpb').innerHTML=h;sh('mp',1);if(all){const L=q=>{$('#mpl').innerHTML=(p.models||[]).filter(m=>m.toLowerCase().includes(q.toLowerCase())).slice(0,200).map(row).join('')||'<p class="ds" style="padding:14px">No models yet</p>'};L('');$('#mq').oninput=e=>L(e.target.value)}}
$('#pill').onclick=()=>openPicker(0);$('#ctxb').onclick=()=>openPicker(0);
$('#mpb').onclick=e=>{const g=s=>e.target.closest(s),p=cfg.provs[cfg.active];let x;
if(g('[data-v]'))return PALL?openPicker(0):sh('mp',0);
if(x=g('[data-fav]')){const m=x.dataset.fav;p.fav=p.fav||[];const i=p.fav.indexOf(m);i<0?p.fav.push(m):p.fav.splice(i,1);save();return openPicker(PALL)}
if(g('[data-eff]')){const L=['auto','low','medium','high'];cfg.effort=L[(L.indexOf(cfg.effort||'auto')+1)%4];save();return openPicker(0)}
if(g('[data-all]'))return openPicker(1);
if(x=g('[data-m]')){const m=x.dataset.m;p.model=m;p.recent=[m,...(p.recent||[]).filter(z=>z!=m)].slice(0,4);save();sh('mp',0);rend()}};
async function boot(){chats=(await kv.get('chats'))||J('bb_chats',[]);cfg={...DEFC,...cfg,tts:{...DEFC.tts,...cfg.tts}};const T=cfg.tts;if(!T.murfK&&T.key)T.murfK=T.key;if(/generate/.test(T.murfU||''))T.murfU=DEFC.tts.murfU;
if(!cfg.provs.length)cfg.provs=PRE.slice(0,4).map(r=>({name:r[0],type:r[1],base:r[2],key:'',model:'',models:[]}));
if(!cfg.v6){cfg.v6=1;cfg.projCap=120000;cfg.ctx=60000;if(!cfg.max||cfg.max<32000)cfg.max=32000;cfg.effort=cfg.effort||'auto';const T6=cfg.tts||{};if(!T6.mk&&T6.murfK)T6.mk=T6.murfK}
if(!cfg.v4){cfg.v4=1;cfg.read=false;cfg.wdim=90;cfg.noemo=true}
if(!chats.length)newChat();look();wall();lbl();setSend(0);rend()}
boot();

/* summary sheet (Claude-style timeline) */
function openSM(i){const m=cur().msgs[i],L=[];if(m.src&&m.src.length)L.push('Searched the web'+' · '+m.src.length);(m.t||'').replace(/\[\[status:([^\]]*)\]\]/g,(x,l)=>L.push(l.trim()));Object.keys(F).filter(k=>k.startsWith(i+':')&&!F[k].p).forEach(k=>L.push('Wrote'+' '+F[k].n));
const live=busy&&i==cur().msgs.length-1;$('#smb').innerHTML=`<div class="vh"><button class="ib" data-v="x">${ic('x')}</button><b>${t('Summary|সারাংশ')}</b><i style="width:40px"></i></div><div class="tl">${L.map((x,k)=>`<div class="${live&&k==L.length-1?'on':''}" style="--c:${kind(x)[0]}">${esc(x)}</div>`).join('')}${live?`<div class="on">${'Thinking'}</div>`:''}</div>${m.think?`<div class="thk">${esc(m.think.slice(-2500))}</div>`:''}`;sh('sm',1)}
$('#smb').onclick=e=>{if(e.target.closest('[data-v]'))sh('sm',0)};
/* mic: speech to text with Gemini */
let MR=null;const setMic=b=>$('#mic').classList.toggle('rec',!!b);
async function micGo(){if(MR)return micStop();if(!cfg.tts.gemK){toast(t('Add your Gemini key in Settings > Google Gemini|সেটিংস > Google Gemini-তে কী দিন'));return openSet('gem')}
try{const st=await navigator.mediaDevices.getUserMedia({audio:true}),ac=new(window.AudioContext||window.webkitAudioContext)(),src=ac.createMediaStreamSource(st),pr=ac.createScriptProcessor(4096,1,1),bufs=[];pr.onaudioprocess=e=>bufs.push(new Float32Array(e.inputBuffer.getChannelData(0)));src.connect(pr);pr.connect(ac.destination);MR={st,ac,pr,bufs};setMic(1);hap()}catch(e){toast('Mic: '+e.message)}}
async function micStop(){const{st,ac,pr,bufs}=MR;MR=null;setMic(0);pr.disconnect();st.getTracks().forEach(x=>x.stop());const sr=ac.sampleRate;ac.close();
const n=bufs.reduce((a,b)=>a+b.length,0);if(n<sr/4)return;const f=new Float32Array(n);let o=0;bufs.forEach(b=>{f.set(b,o);o+=b.length});const r=sr/16000,m=Math.floor(n/r),pc=new Int16Array(m);for(let i=0;i<m;i++)pc[i]=Math.max(-1,Math.min(1,f[Math.floor(i*r)]))*32767;
const h=new DataView(new ArrayBuffer(44)),w=(p,s)=>[...s].forEach((c,i)=>h.setUint8(p+i,c.charCodeAt(0)));w(0,'RIFF');h.setUint32(4,36+pc.length*2,true);w(8,'WAVEfmt ');h.setUint32(16,16,true);h.setUint16(20,1,true);h.setUint16(22,1,true);h.setUint32(24,16000,true);h.setUint32(28,32000,true);h.setUint16(32,2,true);h.setUint16(34,16,true);w(36,'data');h.setUint32(40,pc.length*2,true);
toast(t('Listening…|শুনছি…'));try{const d=await b64(new Blob([h,pc],{type:'audio/wav'}));let tx='',err;for(const m2 of ['gemini-2.5-flash','gemini-flash-latest']){try{const j=await hx(`https://generativelanguage.googleapis.com/v1beta/models/${m2}:generateContent?key=${encodeURIComponent(cfg.tts.gemK)}`,{'content-type':'application/json'},{contents:[{parts:[{text:'Transcribe this audio exactly as spoken in its original language (Bengali in Bengali script). Output only the transcript.'},{inlineData:{mimeType:'audio/wav',data:d}}]}]});tx=((j.candidates||[])[0].content.parts||[]).map(p=>p.text||'').join('').trim();if(tx)break}catch(e){err=e}}
if(!tx)throw err||new Error('No speech');const i=$('#inp');i.value+=(i.value?' ':'')+tx;i.dispatchEvent(new Event('input'));i.focus()}catch(e){toast(String(e.message).slice(0,160))}}
$('#mic').onclick=micGo;
