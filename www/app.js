const $=s=>document.querySelector(s),J=(k,d)=>{try{return JSON.parse(localStorage[k])||d}catch(e){return d}};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const DEF="You are Belal Box, a capable AI assistant and coding agent that behaves like Claude: warm, direct, honest, no filler or flattery. Begin EVERY reply with one line [[status: 3-8 word summary of what you are doing]] (hidden from the text, shown as a progress label). Create files only when the user asks for a file or the task truly needs one, and create exactly what was asked: if asked for one file or an index file, output ONE self-contained file (inline CSS and JS) and never extra README, css or js files. Split into several files only for real multi-file projects or when asked. Each file goes in its own fenced block whose info string is the language then the file name, e.g. ```html index.html ; use four backticks when the file itself contains code fences (for example README.md). Always write the COMPLETE file, never truncate or use placeholders, and edit an existing file by re-sending it whole under the same name. Shell commands and short snippets go in normal fenced blocks with only the language and no file name. After files add 1-3 lines on what you made and how to use it, without repeating the code. Ask at most one clarifying question and only if necessary. To store a durable fact or project decision for later chats add [[remember: short note]] at the end of the reply.";
const TXT=/\.(txt|md|json|js|mjs|ts|jsx|tsx|html|css|py|java|kt|xml|yml|yaml|sh|bat|c|cpp|h|go|rs|php|rb|sql|csv|ini|toml|gradle|properties|cfg|svg)$/i;
let cfg=J('bb_cfg',null)||{provs:[],active:0};
const kv={db:null,async o(){return this.db||(this.db=await new Promise((r,j)=>{const q=indexedDB.open('bb',1);q.onupgradeneeded=()=>q.result.createObjectStore('s');q.onsuccess=()=>r(q.result);q.onerror=j}))},async get(k){const d=await this.o();return new Promise(r=>{const q=d.transaction('s').objectStore('s').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r()})},async set(k,v){const d=await this.o();d.transaction('s','readwrite').objectStore('s').put(v,k)}};
let chats=[],ci=0,pend=[],busy=false,ab=null,audio=null,F={},q=0;
const cur=()=>chats[ci];
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2600)};
const save=()=>{try{localStorage.bb_cfg=JSON.stringify(cfg)}catch(e){toast('Storage full')}kv.set('chats',chats)};
const newChat=()=>{chats.unshift({id:Date.now(),title:'নতুন চ্যাট',msgs:[]});ci=0};
const go=()=>{const e=$('#chat');e.scrollTop=e.scrollHeight};
const wall=()=>{document.body.style.backgroundImage=cfg.wall?`linear-gradient(var(--ov),var(--ov)),url(${cfg.wall})`:'';save()};
const shrink=(f,m,ql)=>new Promise(r=>{const i=new Image();i.onload=()=>{const s=Math.min(1,m/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',ql))};i.src=URL.createObjectURL(f)});
const isN=()=>{const C=window.Capacitor;return C&&C.isNativePlatform&&C.isNativePlatform()};
async function hx(url,h,body){if(isN()){const r=await Capacitor.Plugins.CapacitorHttp.request({url,method:body?'POST':'GET',headers:h,data:body});if(r.status>=400)throw new Error(r.status+' '+JSON.stringify(r.data).slice(0,200));return r.data}
const r=await fetch(url,{method:body?'POST':'GET',headers:h,body:body&&JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(r.status+' '+JSON.stringify(j).slice(0,200));return j}
/* markdown + file cards */
const SR=/^\s*\[\[status:([^\]]*)\]\]\s*/,RM=/\[\[remember:[^\]]*\]\]/g,FN=/\.\w{1,8}$|^(Dockerfile|Makefile)$/i;
const TK=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|while|class|new|import|from|export|async|await|try|catch|throw|def|require|true|false|null|undefined)\b|\b(\d+\.?\d*)\b/g;
const hl=c=>{let o='',l=0,m;TK.lastIndex=0;while(m=TK.exec(c)){o+=esc(c.slice(l,m.index))+`<span class="${m[1]?'c':m[2]?'s':m[3]?'k':'n'}">${esc(m[0])}</span>`;l=TK.lastIndex}return o+esc(c.slice(l))};
function md(t,mi){t=t.replace(SR,'').replace(RM,'');let out='',n=0,pc=0,last=0,m;const re=/(`{3,})([^\n]*)\n([\s\S]*?)(\n\1(?!`)|$)/g;
const inl=s=>esc(s).replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/\*([^*\n]+)\*/g,'<i>$1</i>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank">$1</a>');
const blk=s=>s.split(/\n\s*\n/).map(p=>{p=p.trim();if(!p)return'';const h=p.match(/^(#{1,4})\s+(.*)/);if(h&&!p.includes('\n')){const L=h[1].length+1;return`<h${L}>${inl(h[2])}</h${L}>`}
if(/^([-*]|\d+\.)\s/.test(p)){const o=/^\d/.test(p)?'ol':'ul';return`<${o}>`+p.split('\n').map(l=>`<li>${inl(l.replace(/^([-*]|\d+\.)\s+/,''))}</li>`).join('')+`</${o}>`}
return'<p>'+inl(p).replace(/\n/g,'<br>')+'</p>'}).join('');
while((m=re.exec(t))){out+=blk(t.slice(last,m.index));const inf=m[2].trim().split(/\s+/),lg=inf[0]||'text',nm=inf[1]||'';
if(nm&&FN.test(nm)&&cfg.art){const k=mi+':'+(n++),ex=(nm.split('.').pop()||'').toUpperCase(),dc=/^(MD|TXT)$/.test(ex);F[k]={n:nm,c:m[3]};
out+=`<div class="fc" data-a="ar" data-k="${k}"><div class="ft ${dc?'bl':'or'}">${dc?ic('file',26):'&lt;/&gt;'}</div><div><b>${esc(nm)}</b><small>${dc?'Document':'Code'} · ${esc(ex)}</small></div></div>`}
else{const k=mi+':c'+(pc++);F[k]={n:'',c:m[3],p:1};out+=`<div class="cb"><div class="cbh"><span>${esc(lg)}</span><button class="ib" data-a="cp" data-k="${k}">${ic('copy',15)}</button></div><pre>${hl(m[3])}</pre></div>`}
last=re.lastIndex;if(!m[4])break}
return out+blk(t.slice(last))}
const nf=i=>Object.keys(F).filter(k=>k.startsWith(i+':')&&!F[k].p).length;
const lab=(tx,s)=>{const m=SR.exec(tx);if(m)return m[1].trim();if(!s)return'';const u=tx.match(/`{3,}\S*\s+(\S+\.\w+)\n(?![\s\S]*`{3})/);return u?t('Writing|লিখছি')+' '+u[1]:t('Thinking|চিন্তা করছি')};
function mh(m,i,s){if(m.r=='user'){const im=m.imgs||[],nm=m.names||[];return`<div class="u">${im.map(d=>`<img src="${d}">`).join('')}${nm.map(x=>`<span class="ch">${ic('clip',12)} ${esc(x)}</span>`).join('')}${im.length||nm.length?'<br>':''}${esc(m.show||'')}</div>`}
const l=cfg.sum?lab(m.t||'',s):'',b=m.t?md(m.t,i):'',z=nf(i);
return`<div class="a" id="m${i}">${l?`<div class="stt">${ic('bulb',16)}<span>${esc(l)}</span></div>`:''}<div class="ab">${b||'<span class="dots">●●●</span>'}</div><div class="ac"><button data-a="sp" data-i="${i}">${ic('play')}</button><button data-a="cm" data-i="${i}">${ic('copy')}</button><button data-a="lk" data-i="${i}" class="${m.lk==1?'on':''}">${ic('like')}</button><button data-a="dk" data-i="${i}" class="fl ${m.lk==-1?'on':''}">${ic('like')}</button>${z>1?`<button data-a="zp" data-i="${i}">${ic('dl')}</button>`:''}</div></div>`}
const WEL=()=>{const h=new Date().getHours();return`<div class="wl"><img class="wlg" src="logo.png"><h2>${t(h<5?'Good night|শুভ রাত্রি':h<12?'Good morning|শুভ সকাল':h<17?'Good afternoon|শুভ অপরাহ্ন':'Good evening|শুভ সন্ধ্যা')}${cfg.name?', '+esc(cfg.name):''}</h2></div>`};
function rend(){const c=cur(),p=cfg.provs[cfg.active]||{};F={};$('#chat').innerHTML=c.msgs.length?c.msgs.map((m,i)=>mh(m,i,busy&&i==c.msgs.length-1)).join(''):WEL();$('#pill').textContent=p.model||t('Choose model|মডেল বাছুন');go()}
const up=i=>{const e=$('#m'+i);if(e){e.outerHTML=mh(cur().msgs[i],i,1);go()}};
const tick=i=>{if(!q)q=requestAnimationFrame(()=>{q=0;up(i)})};
/* API */
const uc=(m,an)=>{const im=m.imgs||[];if(!im.length)return m.t;const tx={type:'text',text:m.t};return an?[...im.map(d=>({type:'image',source:{type:'base64',media_type:d.slice(5,d.indexOf(';')),data:d.split(',')[1]}})),tx]:[tx,...im.map(d=>({type:'image_url',image_url:{url:d}}))]};
async function llm(p,h,sys,o){const an=p.type=='anthropic';let b=p.base.replace(/\/+$/,'');if(an)b=b.replace(/\/v1$/,'');
const url=an?b+'/v1/messages':b+'/chat/completions',hd=an?{'x-api-key':p.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true','content-type':'application/json'}:{Authorization:'Bearer '+p.key,'content-type':'application/json'};
const body=an?{model:p.model,max_tokens:+cfg.max||16000,system:sys,messages:h,stream:!!o.stream}:{model:p.model,max_tokens:+cfg.max||16000,messages:[{role:'system',content:sys},...h],stream:!!o.stream};
if(cfg.web&&o.web){if(an)body.tools=[{type:'web_search_20250305',name:'web_search',max_uses:5}];else if(/openrouter/.test(b))body.plugins=[{id:'web'}]}
let acc='';const tk=x=>{acc+=x;o.tok&&o.tok(x)};
if(!o.stream){const j=await hx(url,hd,body);tk(an?j.content.map(x=>x.text||'').join(''):j.choices[0].message.content);return acc}
const r=await fetch(url,{method:'POST',headers:hd,body:JSON.stringify(body),signal:o.sg});if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,300));
const rd=r.body.getReader(),dc=new TextDecoder();let buf='';
for(;;){const{done,value}=await rd.read();if(done)break;buf+=dc.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop();
for(const l of ls){if(!l.startsWith('data:'))continue;const d=l.slice(5).trim();if(!d||d=='[DONE]')continue;try{const j=JSON.parse(d),x=an?(j.delta&&j.delta.text):(j.choices&&j.choices[0]&&j.choices[0].delta&&j.choices[0].delta.content);if(x)tk(x)}catch(e){}}}
return acc}
async function sysP(c,qq){const L={en:'Reply in English.',bn:'Reply in Bengali (Bangla) unless asked otherwise.',mix:'Reply in natural Bengali mixed with common English technical terms (Banglish).'}[cfg.lang]||'';
let s=DEF+' '+L+(cfg.name?` The user's name is ${cfg.name}.`:'')+(cfg.sys?'\n\n# Custom instructions\n'+cfg.sys:'')+(cfg.mem?'\n\n# Long-term memory\n'+cfg.mem:'');
if(c.sum){s+='\n\n# Earlier conversation summary\n'+c.sum;const e=Object.entries(c.proj||{});if(e.length)s+='\n\n# Project files (latest versions)\n'+e.map(([n,v])=>`<file name="${n}">\n${v}\n</file>`).join('\n').slice(0,300000)}
return s+await live(qq)}
async function compact(c,p){const all=c.msgs.filter(m=>m.t&&!m.err),f=c.cut||0,rs=all.slice(f);if(rs.reduce((a,m)=>a+m.t.length,0)<(cfg.ctx||100000)||rs.length<8)return;const k=Math.floor(rs.length/2),old=rs.slice(0,k).map(m=>(m.r=='user'?'User: ':'AI: ')+m.t.slice(0,5000)).join('\n\n');
try{c.sum=await llm(p,[{role:'user',content:'Summarize this conversation so another assistant can continue the work with no loss: goals, decisions, file names and purposes, open tasks, user preferences. Be dense.\n\n'+(c.sum?'Previous summary:\n'+c.sum+'\n\n':'')+old}],'You write precise project summaries.',{stream:false});c.cut=f+k;toast(t('Memory compacted|মেমরি সংক্ষিপ্ত হয়েছে'))}catch(e){}}
async function call(c,p,sg,tok){await compact(c,p);const an=p.type=='anthropic',L=c.msgs.filter(m=>m.t&&!m.err).slice(c.cut||0);while(L.length&&L[0].r!='user')L.shift();const u=[...L].reverse().find(m=>m.r=='user');
await llm(p,L.map(m=>m.r=='user'?{role:'user',content:uc(m,an)}:{role:'assistant',content:m.t}),await sysP(c,u&&u.show||''),{stream:cfg.stream,sg,tok,web:1})}
async function send(){if(busy){ab&&ab.abort();return}
const t0=$('#inp').value.trim();if(!t0&&!pend.length)return;const p=cfg.provs[cfg.active];
if(!p||!p.key||!p.model||!p.base){toast(t('Set provider, key and model first|আগে প্রোভাইডার, কী ও মডেল দিন'));openSet('prov');return}
const c=cur();c.proj=c.proj||{};let full=t0;const imgs=[],names=pend.map(f=>f.name);
pend.forEach(f=>{if(f.img){imgs.push(f.img);return}full+=`\n\n<attachment name="${f.name}">\n${f.txt}\n</attachment>`;const B=[...f.txt.matchAll(/<file name="([^"]*)">\n([\s\S]*?)\n<\/file>/g)];B.length?B.forEach(x=>c.proj[x[1]]=x[2]):c.proj[f.name]=f.txt});
hap();c.msgs.push({r:'user',t:full||'Describe this image.',show:t0,imgs,names});if(c.msgs.length==1)c.title=(t0||names[0]).slice(0,32);
c.msgs.push({r:'assistant',t:''});pend=[];chips();$('#inp').value='';$('#inp').style.height='auto';
busy=true;setSend(1);rend();const i=c.msgs.length-1;ab=new AbortController();
try{await call(c,p,ab.signal,x=>{c.msgs[i].t+=x;tick(i)})}catch(e){if(e.name!='AbortError'){c.msgs[i].t+=(c.msgs[i].t?'\n\n':'')+'Error: '+e.message;c.msgs[i].err=1}}
if(!c.msgs[i].t)c.msgs.pop();busy=false;setSend(0);rend();
const d=c.msgs[i];if(d&&d.t){const R=[...d.t.matchAll(/\[\[remember:([^\]]*)\]\]/g)];if(R.length&&cfg.auto)cfg.mem=(cfg.mem?cfg.mem+'\n':'')+R.map(x=>'- '+x[1].trim()).join('\n');Object.entries(F).forEach(([k,f])=>{if(k.startsWith(i+':')&&!f.p)c.proj[f.n]=f.c})}save()}
/* download / zip / tts */
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
async function dl(name,blob){if(isN()){try{const{Filesystem,Share}=Capacitor.Plugins;await Filesystem.writeFile({path:name,data:await b64(blob),directory:'CACHE'});const u=await Filesystem.getUri({path:name,directory:'CACHE'});await Share.share({title:name,url:u.uri,dialogTitle:'সেভ / শেয়ার করুন'});return}catch(e){toast('ডাউনলোড ব্যর্থ: '+e.message)}}
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4e3)}
function zipAll(i){const z=new JSZip();Object.entries(F).filter(([k,f])=>!f.p&&(i==='*'||k.startsWith(i+':'))).forEach(([k,f])=>z.file(f.n.replace(/^\/+/,''),f.c));z.generateAsync({type:'blob'}).then(b=>dl('belal-box-files.zip',b))}

/* attachments */
async function unzip(f){const z=await JSZip.loadAsync(f),tr=[];let body='',tot=0;for(const[n,e]of Object.entries(z.files)){if(e.dir)continue;tr.push(n);if(TXT.test(n)&&tot<15e5){const s=await e.async('string');if(s.length<2e5){body+=`\n<file name="${n}">\n${s}\n</file>`;tot+=s.length}}}
return'ফাইল তালিকা ('+tr.length+'):\n'+tr.slice(0,400).join('\n')+'\n'+body}
const chips=()=>{$('#atts').innerHTML=pend.map((f,i)=>`<span class="ch">${ic(f.img?'img':'clip',14)} ${esc(f.name)} <b data-r="${i}">×</b></span>`).join('')};
const attach=async e=>{for(const f of e.target.files){try{if(f.type.startsWith('image/'))pend.push({name:f.name,img:await shrink(f,1280,.8)});
else if(/\.(zip|apk|jar|aar)$/i.test(f.name))pend.push({name:f.name,txt:await unzip(f)});
else pend.push({name:f.name,txt:TXT.test(f.name)||f.type.startsWith('text/')?(await f.text()).slice(0,2e5):'(বাইনারি ফাইল, '+f.size+' bytes)'})}catch(x){toast(f.name+': '+x.message)}}e.target.value='';chips()};['f1','f2','f3'].forEach(id=>$('#'+id).onchange=attach);
$('#atts').onclick=e=>{const r=e.target.dataset.r;if(r!=null){pend.splice(+r,1);chips()}};
/* drawer, events */
function side(){$('#cl').innerHTML=chats.map((c,i)=>`<div class="ci ${i==ci?'cur':''}" data-i="${i}"><span>${esc(c.title)}</span><button data-e="${i}">${ic('edit',16)}</button><button data-x="${i}">${ic('trash',16)}</button></div>`).join('')}
$('#cl').onclick=e=>{const ed=e.target.closest('[data-e]');if(ed){const c=chats[+ed.dataset.e],n=prompt('নতুন নাম',c.title);if(n){c.title=n;save();side()}return}const x=e.target.closest('[data-x]');if(x){chats.splice(+x.dataset.x,1);if(!chats.length)newChat();ci=0;save();side();rend();return}const c=e.target.closest('.ci');if(c){ci=+c.dataset.i;$('#side').classList.remove('on');rend()}};
$('#menu').onclick=()=>{side();$('#side').classList.add('on')};$('#side').onclick=e=>{if(e.target.id=='side')$('#side').classList.remove('on')};
$('#nc').onclick=()=>{newChat();save();$('#side').classList.remove('on');rend()};$('#gear').onclick=()=>openSet();$('#set').onclick=e=>{if(e.target.id=='set')$('#set').classList.remove('on')};
$('#pvx').onclick=()=>{$('#pv').classList.remove('on');$('#pvf').srcdoc=''};$('#send').onclick=send;
$('#inp').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,160)+'px'};
$('#chat').onclick=e=>{const b=e.target.closest('[data-a],.sg');if(!b)return;if(b.classList.contains('sg')){$('#inp').value=b.textContent;$('#inp').focus();return}
const a=b.dataset.a,k=b.dataset.k,i=b.dataset.i;
if(a=='cp')navigator.clipboard.writeText(F[k].c).then(()=>toast('কপি হয়েছে'));
if(a=='dl')dl(F[k].n.split('/').pop(),new Blob([F[k].c]));
if(a=='pv'){$('#pvf').srcdoc=F[k].c;$('#pv').classList.add('on')}
if(a=='sp')speak(+i);if(a=='cm')navigator.clipboard.writeText(cur().msgs[i].t).then(()=>toast('কপি হয়েছে'));if(a=='zp')zipAll(i);if(a=='ar')openAR(k);if(a=='lk'||a=='dk'){const m=cur().msgs[i],v=a=='lk'?1:-1;m.lk=m.lk==v?0:v;hap();save();rend()}};
