const $=s=>document.querySelector(s),J=(k,d)=>{try{return JSON.parse(localStorage[k])||d}catch(e){return d}};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const DEF="You are Belal Box, a warm, sharp AI assistant and coding agent, working like Claude. Reply in the user's language (Bengali if they write Bengali). Answer directly; no filler or flattery. Use short paragraphs; lists only when they help. When asked to build something: one short line first, then create each file as its own fenced block whose info string is the language followed by the file name, e.g. ```html index.html. Put the COMPLETE file in each block, never truncate or use placeholders. For big projects split the work into several smaller files (html, css, js, README). Do not repeat file contents in prose; finish with a 2-3 line summary of what you made and how to run it. Ask at most one clarifying question, and only if truly needed.";
const TXT=/\.(txt|md|json|js|mjs|ts|jsx|tsx|html|css|py|java|kt|xml|yml|yaml|sh|bat|c|cpp|h|go|rs|php|rb|sql|csv|ini|toml|gradle|properties|cfg|svg)$/i;
let cfg=J('bb_cfg',null)||{active:0,max:16000,stream:true,sys:'',wall:'',tts:{},provs:[{name:'OpenRouter',type:'openai',base:'https://openrouter.ai/api/v1',key:'',model:'anthropic/claude-sonnet-4.5',models:[]},{name:'Anthropic',type:'anthropic',base:'https://api.anthropic.com',key:'',model:'claude-sonnet-5-5',models:[]},{name:'OpenAI',type:'openai',base:'https://api.openai.com/v1',key:'',model:'gpt-4o',models:[]}]};
let chats=J('bb_chats',[]),ci=0,pend=[],busy=false,ab=null,audio=null,F={},q=0;
const cur=()=>chats[ci];
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2600)};
const save=()=>{try{localStorage.bb_cfg=JSON.stringify(cfg);localStorage.bb_chats=JSON.stringify(chats)}catch(e){toast('স্টোরেজ ভরে গেছে, পুরনো চ্যাট মুছুন')}};
const newChat=()=>{chats.unshift({id:Date.now(),title:'নতুন চ্যাট',msgs:[]});ci=0};
const go=()=>{const e=$('#chat');e.scrollTop=e.scrollHeight};
const wall=()=>{document.body.style.backgroundImage=cfg.wall?`linear-gradient(var(--ov),var(--ov)),url(${cfg.wall})`:'';save()};
const shrink=(f,m,ql)=>new Promise(r=>{const i=new Image();i.onload=()=>{const s=Math.min(1,m/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',ql))};i.src=URL.createObjectURL(f)});
const isN=()=>{const C=window.Capacitor;return C&&C.isNativePlatform&&C.isNativePlatform()};
async function hx(url,h,body){if(isN()){const r=await Capacitor.Plugins.CapacitorHttp.request({url,method:body?'POST':'GET',headers:h,data:body});if(r.status>=400)throw new Error(r.status+' '+JSON.stringify(r.data).slice(0,200));return r.data}
const r=await fetch(url,{method:body?'POST':'GET',headers:h,body:body&&JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(r.status+' '+JSON.stringify(j).slice(0,200));return j}
/* markdown + file cards */
function md(t,mi){let out='',n=0,last=0,m;const re=/```([^\n]*)\n([\s\S]*?)(```|$)/g;
const inl=s=>esc(s).replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/\*([^*\n]+)\*/g,'<i>$1</i>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank">$1</a>');
const blk=s=>s.split(/\n\s*\n/).map(p=>{p=p.trim();if(!p)return'';const h=p.match(/^(#{1,4})\s+(.*)/);if(h&&!p.includes('\n')){const L=h[1].length+1;return`<h${L}>${inl(h[2])}</h${L}>`}
if(/^([-*]|\d+\.)\s/.test(p)){const o=/^\d/.test(p)?'ol':'ul';return`<${o}>`+p.split('\n').map(l=>`<li>${inl(l.replace(/^([-*]|\d+\.)\s+/,''))}</li>`).join('')+`</${o}>`}
return'<p>'+inl(p).replace(/\n/g,'<br>')+'</p>'}).join('');
const EX={javascript:'js',python:'py',typescript:'ts',bash:'sh',shell:'sh',text:'txt',markdown:'md'};
while((m=re.exec(t))){out+=blk(t.slice(last,m.index));const inf=m[1].trim().split(/\s+/),lg=inf[0]||'text',k=mi+':'+(n++);
F[k]={n:inf[1]||('file-'+n+'.'+(EX[lg]||lg)),c:m[2].replace(/\n$/,'')};
const nm=F[k].n,ex=(nm.split('.').pop()||'').toUpperCase(),dc=/^(MD|TXT)$/.test(ex);
out+=`<div class="fc" data-a="ar" data-k="${k}"><div class="ft ${dc?'bl':'or'}">${dc?'📄':'&lt;/&gt;'}</div><div><b>${esc(nm)}</b><small>${dc?'Document':'Code'} · ${esc(ex)}</small></div></div>`;last=re.lastIndex;if(!m[3])break}
return out+blk(t.slice(last))}
const nf=i=>Object.keys(F).filter(k=>i==='*'||k.startsWith(i+':')).length;
function mh(m,i){if(m.r=='user'){const im=m.imgs||[],nm=m.names||[];return`<div class="u">${im.map(d=>`<img src="${d}">`).join('')}${nm.map(x=>`<span class="ch">📎 ${esc(x)}</span>`).join('')}${im.length||nm.length?'<br>':''}${esc(m.show||'')}</div>`}
const b=m.t?md(m.t,i):'<span class="dots">●●●</span>';return`<div class="a" id="m${i}"><div class="ab">${b}</div><div class="ac"><button data-a="sp" data-i="${i}">🔊</button><button data-a="cm" data-i="${i}">📋</button>${nf(i)>1?`<button data-a="zp" data-i="${i}">📦 ZIP</button>`:''}</div></div>`}
const WEL=()=>{const h=new Date().getHours();return`<div class="wl"><div class="st">✳</div><h2>${h<5?'শুভ রাত্রি':h<12?'শুভ সকাল':h<17?'শুভ অপরাহ্ন':'শুভ সন্ধ্যা'}</h2></div>`};
function rend(){const c=cur(),p=cfg.provs[cfg.active];F={};$('#chat').innerHTML=c.msgs.length?c.msgs.map(mh).join(''):WEL();$('#pill').textContent=p.model||'মডেল বাছুন';go()}
const up=i=>{const e=$('#m'+i+' .ab');if(e){e.innerHTML=cur().msgs[i].t?md(cur().msgs[i].t,i):'<span class="dots">●●●</span>';go()}};
const tick=i=>{if(!q)q=requestAnimationFrame(()=>{q=0;up(i)})};
/* API */
async function call(c,p,sg,tok){const an=p.type=='anthropic';let b=p.base.replace(/\/+$/,'');if(an)b=b.replace(/\/v1$/,'');
const uc=m=>{const im=m.imgs||[];if(!im.length)return m.t;const tx={type:'text',text:m.t};return an?[...im.map(d=>({type:'image',source:{type:'base64',media_type:d.slice(5,d.indexOf(';')),data:d.split(',')[1]}})),tx]:[tx,...im.map(d=>({type:'image_url',image_url:{url:d}}))]};
const h=c.msgs.filter(m=>m.t&&!m.err).map(m=>m.r=='user'?{role:'user',content:uc(m)}:{role:'assistant',content:m.t}),sys=cfg.sys||DEF;
const url=an?b+'/v1/messages':b+'/chat/completions';
const hd=an?{'x-api-key':p.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true','content-type':'application/json'}:{Authorization:'Bearer '+p.key,'content-type':'application/json'};
const body=an?{model:p.model,max_tokens:+cfg.max||16000,system:sys,messages:h,stream:cfg.stream}:{model:p.model,max_tokens:+cfg.max||16000,messages:[{role:'system',content:sys},...h],stream:cfg.stream};
if(cfg.web){if(an)body.tools=[{type:'web_search_20250305',name:'web_search',max_uses:5}];else if(/openrouter/.test(b))body.plugins=[{id:'web'}]}
if(!cfg.stream){const j=await hx(url,hd,body);tok(an?j.content.map(x=>x.text||'').join(''):j.choices[0].message.content);return}
const r=await fetch(url,{method:'POST',headers:hd,body:JSON.stringify(body),signal:sg});if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,300));
const rd=r.body.getReader(),dc=new TextDecoder();let buf='';
for(;;){const{done,value}=await rd.read();if(done)break;buf+=dc.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop();
for(const l of ls){if(!l.startsWith('data:'))continue;const d=l.slice(5).trim();if(!d||d=='[DONE]')continue;try{const j=JSON.parse(d),x=an?(j.delta&&j.delta.text):(j.choices&&j.choices[0]&&j.choices[0].delta&&j.choices[0].delta.content);if(x)tok(x)}catch(e){}}}}
async function send(){if(busy){ab&&ab.abort();return}
const t=$('#inp').value.trim();if(!t&&!pend.length)return;const p=cfg.provs[cfg.active];
if(!p.key||!p.model||!p.base){toast('আগে সেটিংসে API Key, Base URL ও মডেল দিন');openSet();return}
const c=cur();let full=t;const imgs=[],names=pend.map(f=>f.name);
pend.forEach(f=>f.img?imgs.push(f.img):full+=`\n\n<attachment name="${f.name}">\n${f.txt}\n</attachment>`);
c.msgs.push({r:'user',t:full||'ছবিটি দেখো',show:t,imgs,names});if(c.msgs.length==1)c.title=(t||names[0]).slice(0,32);
c.msgs.push({r:'assistant',t:''});pend=[];chips();$('#inp').value='';$('#inp').style.height='auto';
rend();const i=c.msgs.length-1;busy=true;$('#send').textContent='■';ab=new AbortController();
try{await call(c,p,ab.signal,x=>{c.msgs[i].t+=x;tick(i)})}catch(e){if(e.name!='AbortError'){c.msgs[i].t+=(c.msgs[i].t?'\n\n':'')+'⚠️ ত্রুটি: '+e.message;c.msgs[i].err=1}}
if(!c.msgs[i].t)c.msgs.pop();busy=false;$('#send').textContent='↑';save();rend()}
/* download / zip / tts */
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
async function dl(name,blob){if(isN()){try{const{Filesystem,Share}=Capacitor.Plugins;await Filesystem.writeFile({path:name,data:await b64(blob),directory:'CACHE'});const u=await Filesystem.getUri({path:name,directory:'CACHE'});await Share.share({title:name,url:u.uri,dialogTitle:'সেভ / শেয়ার করুন'});return}catch(e){toast('ডাউনলোড ব্যর্থ: '+e.message)}}
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4e3)}
function zipAll(i){const z=new JSZip();Object.entries(F).filter(([k])=>k.startsWith(i+':')).forEach(([k,f])=>z.file(f.n.replace(/^\/+/,''),f.c));z.generateAsync({type:'blob'}).then(b=>dl('belal-box-files.zip',b))}
const speak=i=>speakT(cur().msgs[i].t.replace(/```[\s\S]*?(```|$)/g,' ').replace(/[*#`_>\[\]]/g,'').trim().slice(0,2800));
async function speakT(t){if(!t)return;if(audio){audio.pause();audio=null}speechSynthesis.cancel();const T=cfg.tts;
if(T.key){toast('🔊 লোড হচ্ছে…');try{const body={text:t,voiceId:T.voice,model:T.model,locale:T.locale,format:'MP3'};if(T.style)body.style=T.style;const hd={'api-key':T.key,'content-type':'application/json'};let u;
if(isN()){const r=await Capacitor.Plugins.CapacitorHttp.request({url:T.url,method:'POST',headers:hd,data:body,responseType:'blob'});if(r.status>=400)throw new Error(r.status+' '+String(r.data).slice(0,160));u='data:audio/mpeg;base64,'+r.data}
else{const r=await fetch(T.url,{method:'POST',headers:hd,body:JSON.stringify(body)});if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,160));u=URL.createObjectURL(await r.blob())}
audio=new Audio(u);await audio.play();return}catch(e){toast('ভয়েস ত্রুটি: '+e.message)}}
const u=new SpeechSynthesisUtterance(t);u.lang='bn-BD';speechSynthesis.speak(u)}
/* attachments */
async function unzip(f){const z=await JSZip.loadAsync(f),tr=[];let body='',tot=0;for(const[n,e]of Object.entries(z.files)){if(e.dir)continue;tr.push(n);if(TXT.test(n)&&tot<4e5){const s=await e.async('string');if(s.length<6e4){body+=`\n<file name="${n}">\n${s}\n</file>`;tot+=s.length}}}
return'ফাইল তালিকা ('+tr.length+'):\n'+tr.slice(0,400).join('\n')+'\n'+body}
const chips=()=>{$('#atts').innerHTML=pend.map((f,i)=>`<span class="ch">${f.img?'🖼️':'📎'} ${esc(f.name)} <b data-r="${i}">✕</b></span>`).join('')};
const attach=async e=>{for(const f of e.target.files){try{if(f.type.startsWith('image/'))pend.push({name:f.name,img:await shrink(f,1280,.8)});
else if(/\.(zip|apk|jar|aar)$/i.test(f.name))pend.push({name:f.name,txt:await unzip(f)});
else pend.push({name:f.name,txt:TXT.test(f.name)||f.type.startsWith('text/')?(await f.text()).slice(0,2e5):'(বাইনারি ফাইল, '+f.size+' bytes)'})}catch(x){toast(f.name+': '+x.message)}}e.target.value='';chips()};['f1','f2','f3'].forEach(id=>$('#'+id).onchange=attach);
$('#atts').onclick=e=>{const r=e.target.dataset.r;if(r!=null){pend.splice(+r,1);chips()}};
/* settings */
function openSet(){const p=cfg.provs[cfg.active],T=cfg.tts,o=(v,l)=>`<option value="${v}" ${p.type==v?'selected':''}>${l}</option>`;
$('#setb').innerHTML=`<label>প্রোভাইডার</label><select id="s_p">${cfg.provs.map((x,i)=>`<option value="${i}" ${i==cfg.active?'selected':''}>${esc(x.name)}</option>`).join('')}</select>
<div class="row"><button id="s_add">＋ নতুন</button><button id="s_del">🗑️ মুছুন</button></div>
<label>নাম</label><input id="s_n" value="${esc(p.name)}"><label>ধরন</label><select id="s_t">${o('openai','OpenAI-compatible (OpenRouter, কাস্টম…)')}${o('anthropic','Anthropic (Claude)')}</select>
<label>Base URL</label><input id="s_b" value="${esc(p.base)}"><label>API Key</label><input id="s_k" type="password" value="${esc(p.key)}">
<label>মডেল</label><input id="s_m" value="${esc(p.model)}">${p.models.length?`<select id="s_ml"><option value="">— ${p.models.length}টি মডেল থেকে বেছে নিন —</option>${p.models.map(m=>`<option>${esc(m)}</option>`).join('')}</select>`:''}
<div class="row"><button id="s_f">🔄 Fetch Models</button></div>
<label>Max tokens (বড় ফাইলের জন্য বাড়ান)</label><input id="s_x" type="number" value="${cfg.max}">
<label><input type="checkbox" id="s_st" ${cfg.stream?'checked':''}> লাইভ স্ট্রিমিং</label><label><input type="checkbox" id="s_web" ${cfg.web?'checked':''}> 🌐 ওয়েব সার্চ</label><label>থিম</label><select id="s_th">${['system','light','dark'].map(x=>`<option ${cfg.theme==x?'selected':''}>${x}</option>`).join('')}</select>
<label>System prompt (ফাঁকা = ডিফল্ট)</label><textarea id="s_s" rows="3">${esc(cfg.sys)}</textarea>
<label>🔊 ভয়েস API (Murf ইত্যাদি)</label><input id="s_tu" placeholder="TTS URL" value="${esc(T.url||'')}"><input id="s_tk" type="password" placeholder="Voice API Key" value="${esc(T.key||'')}"><input id="s_tv" placeholder="Voice ID (Debarati)" value="${esc(T.voice||'')}"><input id="s_ts" placeholder="Style (Conversational)" value="${esc(T.style||'')}"><input id="s_tm" placeholder="Model (falcon-2)" value="${esc(T.model||'')}"><input id="s_tl" placeholder="Locale (bn-IN)" value="${esc(T.locale||'')}"><button id="s_tt" style="margin-top:8px">▶ ভয়েস টেস্ট</button>
<label>🖼️ ওয়ালপেপার</label><input type="file" id="s_w" accept="image/*"><div class="row"><button id="s_wc">ওয়ালপেপার সরান</button></div>
<button class="pri" id="s_ok">সেভ করুন</button>`;$('#set').classList.add('on');
$('#s_p').onchange=e=>{rf();cfg.active=+e.target.value;openSet()};
$('#s_add').onclick=()=>{rf();cfg.provs.push({name:'Custom',type:'openai',base:'',key:'',model:'',models:[]});cfg.active=cfg.provs.length-1;openSet()};
$('#s_del').onclick=()=>{if(cfg.provs.length>1){cfg.provs.splice(cfg.active,1);cfg.active=0;openSet()}};
$('#s_f').onclick=fetchM;$('#s_tt').onclick=()=>{rf();save();speakT('আমি বেলাল বক্স, আপনার এআই সহকারী।')};if($('#s_ml'))$('#s_ml').onchange=e=>{if(e.target.value)$('#s_m').value=e.target.value};
$('#s_w').onchange=async e=>{if(e.target.files[0]){cfg.wall=await shrink(e.target.files[0],1080,.7);wall();toast('ওয়ালপেপার সেট হয়েছে')}};
$('#s_wc').onclick=()=>{cfg.wall='';wall()};
$('#s_ok').onclick=()=>{rf();save();theme();$('#set').classList.remove('on');rend()}}
function rf(){const p=cfg.provs[cfg.active],v=id=>$('#'+id).value;p.name=v('s_n')||'Custom';p.type=v('s_t');p.base=v('s_b').trim();p.key=v('s_k').trim();p.model=v('s_m').trim();cfg.max=+v('s_x')||16000;cfg.sys=v('s_s');cfg.stream=$('#s_st').checked;cfg.web=$('#s_web').checked;cfg.theme=v('s_th');cfg.tts={url:v('s_tu').trim(),key:v('s_tk').trim(),voice:v('s_tv').trim(),style:v('s_ts').trim(),model:v('s_tm').trim(),locale:v('s_tl').trim()}}
async function fetchM(){rf();const p=cfg.provs[cfg.active],an=p.type=='anthropic';let b=p.base.replace(/\/+$/,'');if(an)b=b.replace(/\/v1$/,'');
try{toast('মডেল আনা হচ্ছে…');const j=await hx(an?b+'/v1/models?limit=1000':b+'/models',an?{'x-api-key':p.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}:{Authorization:'Bearer '+p.key});
p.models=(j.data||j).map(x=>x.id||x).sort();save();openSet();toast(p.models.length+'টি মডেল পাওয়া গেছে')}catch(e){toast('ব্যর্থ: '+e.message)}}
/* drawer, events */
function side(){$('#cl').innerHTML=chats.map((c,i)=>`<div class="ci ${i==ci?'cur':''}" data-i="${i}"><span>${esc(c.title)}</span><button data-e="${i}">✏️</button><button data-x="${i}">🗑️</button></div>`).join('')}
$('#cl').onclick=e=>{const ed=e.target.closest('[data-e]');if(ed){const c=chats[+ed.dataset.e],n=prompt('নতুন নাম',c.title);if(n){c.title=n;save();side()}return}const x=e.target.closest('[data-x]');if(x){chats.splice(+x.dataset.x,1);if(!chats.length)newChat();ci=0;save();side();rend();return}const c=e.target.closest('.ci');if(c){ci=+c.dataset.i;$('#side').classList.remove('on');rend()}};
$('#menu').onclick=()=>{side();$('#side').classList.add('on')};$('#side').onclick=e=>{if(e.target.id=='side')$('#side').classList.remove('on')};
$('#nc').onclick=()=>{newChat();save();$('#side').classList.remove('on');rend()};$('#gear').onclick=openSet;$('#set').onclick=e=>{if(e.target.id=='set')$('#set').classList.remove('on')};
$('#pvx').onclick=()=>{$('#pv').classList.remove('on');$('#pvf').srcdoc=''};$('#send').onclick=send;
$('#inp').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,160)+'px'};
$('#chat').onclick=e=>{const b=e.target.closest('[data-a],.sg');if(!b)return;if(b.classList.contains('sg')){$('#inp').value=b.textContent;$('#inp').focus();return}
const a=b.dataset.a,k=b.dataset.k,i=b.dataset.i;
if(a=='cp')navigator.clipboard.writeText(F[k].c).then(()=>toast('কপি হয়েছে'));
if(a=='dl')dl(F[k].n.split('/').pop(),new Blob([F[k].c]));
if(a=='pv'){$('#pvf').srcdoc=F[k].c;$('#pv').classList.add('on')}
if(a=='sp')speak(+i);if(a=='cm')navigator.clipboard.writeText(cur().msgs[i].t).then(()=>toast('কপি হয়েছে'));if(a=='zp')zipAll(i);if(a=='ar')openAR(k)};
const D={url:'https://global.api.murf.ai/v1/speech/stream',voice:'Debarati',style:'Conversational',model:'falcon-2',locale:'bn-IN'};cfg.tts={...D,...cfg.tts};for(const k in D)if(!cfg.tts[k])cfg.tts[k]=D[k];if(/generate/.test(cfg.tts.url))cfg.tts.url=D.url;cfg.theme=cfg.theme||'system';
function theme(){document.documentElement.dataset.t=cfg.theme=='dark'||(cfg.theme!='light'&&matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light'}theme();wall();if(!chats.length)newChat();rend();
