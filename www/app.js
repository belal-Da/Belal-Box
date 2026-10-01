const $=s=>document.querySelector(s),J=(k,d)=>{try{return JSON.parse(localStorage[k])||d}catch(e){return d}};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const DEF="You are Belal Box, a capable AI assistant and coding agent that behaves like Claude: warm, direct, honest, no filler or flattery. Begin EVERY reply with one line [[status: 3-8 word summary of what you are doing]] (hidden from the text, shown as a progress label). Create files only when the user asks for a file or the task truly needs one, and create exactly what was asked: if asked for one file or an index file, output ONE self-contained file (inline CSS and JS) and never extra README, css or js files. Split into several files only for real multi-file projects or when asked. Each file goes in its own fenced block whose info string is the language then the file name, e.g. ```html index.html ; use four backticks when the file itself contains code fences (for example README.md). Always write the COMPLETE file, never truncate or use placeholders, and edit an existing file by re-sending it whole under the same name. Shell commands and short snippets go in normal fenced blocks with only the language and no file name. After files add 1-3 lines on what you made and how to use it, without repeating the code. Ask at most one clarifying question and only if necessary. Web search results may be supplied below under a Live data or Web search heading: use them for current facts, mention source site names briefly, and say so if they are insufficient. For multi-file projects use relative paths such as css/style.css so the app can show folders and a zip; never paste a file's content outside a fenced file block. To store a durable fact or project decision for later chats add [[remember: short note]] at the end of the reply.";
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
const EXT={javascript:'js',python:'py',typescript:'ts',markdown:'md',kotlin:'kt',rust:'rs',text:'txt'},BIG=/^(html|css|js|javascript|ts|typescript|py|python|java|php|json|xml|sql|md|markdown|jsx|tsx|kt|kotlin|c|cpp|go|rs|rust|sh|yaml|yml)$/i,FE=/\.(html?|css|js|mjs|jsx|ts|tsx|json|md|txt|py|java|kt|php|xml|yml|yaml|sh|bat|sql|csv|c|cpp|h|go|rs|rb|env|gradle|properties|svg|toml|ini)$/i;
const fname=(inf,bf)=>{let m=/(?:title|filename|file|name)\s*=\s*["']?([^\s"']+)/i.exec(inf);if(m)return m[1];const k=inf.trim().split(/\s+/);let n=k.slice(1).find(x=>FE.test(x.replace(/["'`:]$/g,'')));if(n)return n.replace(/^["'`]|["'`:]$/g,'');if(/:/.test(k[0])){n=k[0].split(':')[1];if(n&&FE.test(n))return n}const b=/([\w./-]+\.\w{1,8})[`*\s:]*$/.exec((bf.trim().split('\n').pop()||''));return b&&FE.test(b[1])?b[1]:''};
const pjHTML=mi=>{const ks=Object.keys(F).filter(k=>k.startsWith(mi+':')&&!F[k].p);if(!ks.length)return'';
if(ks.length==1){const f=F[ks[0]],x=(f.n.split('.').pop()||'').toUpperCase(),d=/^(MD|TXT)$/.test(x);return`<div class="fc" data-a="ar" data-k="${ks[0]}"><div class="ft ${d?'bl':'or'}">${d?ic('file',26):'&lt;/&gt;'}</div><div><b>${esc(f.n)}</b><small>${d?'Document':'Code'} · ${esc(x)}</small></div>${/\.html?$/i.test(f.n)?`<button class="ib" data-a="pv" data-k="${ks[0]}">${ic('eye')}</button>`:''}</div>`}
const fs=ks.map(k=>[k,F[k].n]).sort((a,b)=>a[1].localeCompare(b[1])),r0=fs[0][1].split('/')[0],root=fs[0][1].includes('/')&&fs.every(x=>x[1].split('/')[0]==r0)?r0:'project',seen={},
rows=fs.map(([k,n])=>{const p=n.split('/');let h='';for(let d=0;d<p.length-1;d++){const key=p.slice(0,d+1).join('/');if(!seen[key]){seen[key]=1;h+=`<div class="tr" style="padding-left:${d*16+10}px">${ic('folder',16)}<span>${esc(p[d])}/</span></div>`}}return h+`<div class="tr" style="padding-left:${(p.length-1)*16+10}px" data-a="ar" data-k="${k}">${ic('file',16)}<span>${esc(p[p.length-1])}</span></div>`}).join(''),
hk=fs.find(x=>/(^|\/)index\.html?$/i.test(x[1]))||fs.find(x=>/\.html?$/i.test(x[1]));
return`<div class="pj"><div class="pjh"><div class="ft or">${ic('folder',26)}</div><div><b>${esc(root)}</b><small>${fs.length} ${t('files|ফাইল')}</small></div>${hk?`<button class="ib" data-a="pv" data-k="${hk[0]}">${ic('eye')}</button>`:''}<button class="ib" data-a="zp" data-i="${mi}">${ic('dl')}</button></div><div class="tree">${rows}</div></div>`};
function md(t,mi){t=t.replace(SR,'').replace(RM,'');let out='',n=0,pc=0,last=0,m,pj=0;const re=/(`{3,})([^\n]*)\n([\s\S]*?)(\n\1(?!`)|$)/g;
const inl=s=>esc(s).replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/\*([^*\n]+)\*/g,'<i>$1</i>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank">$1</a>');
const blk=s=>s.split(/\n\s*\n/).map(p=>{p=p.trim();if(!p)return'';const h=p.match(/^(#{1,4})\s+(.*)/);if(h&&!p.includes('\n')){const L=h[1].length+1;return`<h${L}>${inl(h[2])}</h${L}>`}
if(/^([-*]|\d+\.)\s/.test(p)){const o=/^\d/.test(p)?'ol':'ul';return`<${o}>`+p.split('\n').map(l=>`<li>${inl(l.replace(/^([-*]|\d+\.)\s+/,''))}</li>`).join('')+`</${o}>`}
return'<p>'+inl(p).replace(/\n/g,'<br>')+'</p>'}).join('');
while((m=re.exec(t))){const bf=t.slice(last,m.index);out+=blk(bf);const inf=m[2].trim(),lg=inf.split(/\s+/)[0]||'text';let nm=fname(inf,bf);
if(!nm&&BIG.test(lg)&&m[3].split('\n').length>30)nm='file'+(n+1)+'.'+(EXT[lg.toLowerCase()]||lg.toLowerCase());
if(nm&&cfg.art){const k=mi+':'+(n++);F[k]={n:nm.replace(/^\.?\//,''),c:m[3]};if(!pj){out+='\u0001';pj=1}}
else{const k=mi+':c'+(pc++);F[k]={n:'',c:m[3],p:1};out+=`<div class="cb"><div class="cbh"><span>${esc(lg)}</span><button class="ib" data-a="cp" data-k="${k}">${ic('copy',15)}</button></div><pre>${hl(m[3])}</pre></div>`}
last=re.lastIndex;if(!m[4])break}
out+=blk(t.slice(last));return out.replace('\u0001',pjHTML(mi))}
const nf=i=>Object.keys(F).filter(k=>k.startsWith(i+':')&&!F[k].p).length;
const SPK='<svg class="spk" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v6M12 16v6M2 12h6M16 12h6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2"/></svg>';
const lab=(tx,m)=>{if(m.st&&!tx)return m.st;const g=SR.exec(tx);if(g)return g[1].trim();const u=tx.match(/`{3,}\S*\s+(\S+\.\w+)\n(?![\s\S]*`{3})/);return u?t('Writing|লিখছি')+' '+u[1]:(m.st||t('Thinking|চিন্তা করছি'))};
function mh(m,i,s){if(m.r=='user'){const im=m.imgs||[],nm=m.names||[];return`<div class="u">${im.map(d=>`<img src="${d}">`).join('')}${nm.map(x=>`<span class="ch">${ic('clip',12)} ${esc(x)}</span>`).join('')}${im.length||nm.length?'<br>':''}${esc(m.show||'')}</div>`}
const b=m.t?md(m.t,i):'',fs=Object.keys(F).filter(k=>k.startsWith(i+':')&&!F[k].p).map(k=>F[k].n),g=SR.exec(m.t||''),
stp=[...(g?[g[1].trim()]:[]),...(m.src&&m.src.length?[t('Searched the web|ওয়েবে খুঁজেছি')+' · '+m.src.length]:[]),...fs.map(n=>t('Wrote|লিখেছি')+' '+n)];let top='';
if(s)top=`<div class="stt live"><span class="spk-w">${SPK}</span><span class="shim">${esc(lab(m.t||'',m))}</span></div>`;
else if(cfg.sum&&stp.length)top=`<div class="stt" data-a="stp" data-i="${i}"><span class="ti2">${ic('bulb',15)}</span><span>${stp.length} ${t('steps|ধাপ')}</span>${ic('chev',14)}</div>${m.open?`<div class="stl">${stp.map(x=>`<div>${ic('check',14)}<span>${esc(x)}</span></div>`).join('')}</div>`:''}`;
const src=m.src&&m.src.length&&!s?`<div class="srcs">${m.src.slice(0,6).map(x=>{let h=x.u;try{h=new URL(x.u).hostname.replace(/^www\./,'')}catch(e){}return`<a href="${esc(x.u)}" target="_blank">${ic('globe',13)}<span>${esc(h)}</span></a>`}).join('')}</div>`:'';
return`<div class="a" id="m${i}">${top}<div class="ab">${b}</div>${src}${s?'':`<div class="ac"><button data-a="sp" data-i="${i}">${ic('play')}</button><button data-a="cm" data-i="${i}">${ic('copy')}</button><button data-a="lk" data-i="${i}" class="${m.lk==1?'on':''}">${ic('like')}</button><button data-a="dk" data-i="${i}" class="fl ${m.lk==-1?'on':''}">${ic('like')}</button><button data-a="rg" data-i="${i}">${ic('refresh')}</button></div>`}</div>`}
const WEL=()=>{const h=new Date().getHours();return`<div class="wl"><img class="wlg" src="logo.png"><h2>${t(h<5?'Good night|শুভ রাত্রি':h<12?'Good morning|শুভ সকাল':h<17?'Good afternoon|শুভ অপরাহ্ন':'Good evening|শুভ সন্ধ্যা')}${cfg.name?', '+esc(cfg.name):''}</h2></div>`};
function rend(){const c=cur(),p=cfg.provs[cfg.active]||{};F={};$('#chat').innerHTML=c.msgs.length?c.msgs.map((m,i)=>mh(m,i,busy&&i==c.msgs.length-1)).join(''):WEL();$('#pill').textContent=p.model||t('Choose model|মডেল বাছুন');go()}
const up=i=>{const e=$('#m'+i);if(e){e.outerHTML=mh(cur().msgs[i],i,1);go()}};
const tick=i=>{if(!q)q=requestAnimationFrame(()=>{q=0;up(i)})};
/* API */
const uc=(m,an)=>{const im=m.imgs||[];if(!im.length)return m.t;const tx={type:'text',text:m.t};return an?[...im.map(d=>({type:'image',source:{type:'base64',media_type:d.slice(5,d.indexOf(';')),data:d.split(',')[1]}})),tx]:[tx,...im.map(d=>({type:'image_url',image_url:{url:d}}))]};
async function llm(p,h,sys,o){const an=p.type=='anthropic';let b=p.base.trim().replace(/\/+$/,'').replace(/\/(chat\/completions|messages)$/,'');if(an)b=b.replace(/\/v1$/,'');
const url=an?b+'/v1/messages':b+'/chat/completions',hd=an?{'x-api-key':p.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true','content-type':'application/json'}:{Authorization:'Bearer '+p.key,'content-type':'application/json'};
const mk=o.mc?'max_completion_tokens':'max_tokens',mt=o.mt||+cfg.max||16000,body=an?{model:p.model,max_tokens:mt,system:sys,messages:h,stream:!!o.stream}:{model:p.model,[mk]:mt,messages:[{role:'system',content:sys},...h],stream:!!o.stream};
let acc='',raw='';const tk=x=>{if(x){acc+=x;o.tok&&o.tok(x)}};
const ex=j=>{if(j.error)throw new Error(typeof j.error=='string'?j.error:(j.error.message||JSON.stringify(j.error)).slice(0,300));const c=j.choices&&j.choices[0];return(j.delta&&j.delta.text)||(c&&((c.delta&&c.delta.content)||(c.message&&c.message.content)||c.text))||(Array.isArray(j.content)?j.content.map(x=>x.text||'').join(''):'')||j.output_text||''};
const bad=(st,tx)=>{if(st==400&&!o.rt){if(/max_completion_tokens/.test(tx)&&!o.mc)return{...o,mc:1,rt:1};if(/max_tokens|too large|exceed|context/i.test(tx)&&mt>4096)return{...o,mt:4096,rt:1}}return null};
const ns=async()=>{try{const j=await hx(url,hd,{...body,stream:false});const x=ex(j);if(!x)throw new Error('Empty response: '+JSON.stringify(j).slice(0,300));tk(x);return acc}catch(e){const n=bad(+((/^(\d+)/.exec(e.message)||[])[1]),e.message);if(n)return llm(p,h,sys,{...n,tok:o.tok,stream:false});throw e}};
if(!o.stream)return ns();
let r;try{r=await fetch(url,{method:'POST',headers:hd,body:JSON.stringify(body),signal:o.sg})}catch(e){if(e.name=='AbortError')throw e;return ns()}
if(!r.ok){const tx=await r.text(),n=bad(r.status,tx);if(n)return llm(p,h,sys,{...n,tok:o.tok,sg:o.sg,stream:true});if(r.status==429||r.status>=500)return ns();throw new Error(r.status+' '+tx.slice(0,300))}
const rd=r.body.getReader(),dc=new TextDecoder();let buf='';
for(;;){const{done,value}=await rd.read();if(done)break;const ch=dc.decode(value,{stream:true});if(raw.length<4000)raw+=ch;buf+=ch;const ls=buf.split('\n');buf=ls.pop();
for(const l of ls){if(!l.startsWith('data:'))continue;const d=l.slice(5).trim();if(!d||d=='[DONE]')continue;let j;try{j=JSON.parse(d)}catch(e){continue}tk(ex(j))}}
if(buf.startsWith('data:')){try{tk(ex(JSON.parse(buf.slice(5))))}catch(e){}}
if(!acc){let j;try{j=JSON.parse(raw)}catch(e){}if(j)tk(ex(j))}
if(!acc)return ns();
return acc}
async function sysP(c,qq){const L={en:'Reply in English.',bn:'Reply in Bengali (Bangla) unless asked otherwise.',mix:'Reply in natural Bengali mixed with common English technical terms (Banglish).'}[cfg.lang]||'';
let s=DEF+' '+L+(cfg.name?` The user's name is ${cfg.name}.`:'')+(cfg.sys?'\n\n# Custom instructions\n'+cfg.sys:'')+(cfg.mem?'\n\n# Long-term memory\n'+cfg.mem:'');
if(c.sum){s+='\n\n# Earlier conversation summary\n'+c.sum;const e=Object.entries(c.proj||{});if(e.length)s+='\n\n# Project files (latest versions)\n'+e.map(([n,v])=>`<file name="${n}">\n${v}\n</file>`).join('\n').slice(0,300000)}
return s+await live(qq)}
async function compact(c,p){const all=c.msgs.filter(m=>m.t&&!m.err),f=c.cut||0,rs=all.slice(f);if(rs.reduce((a,m)=>a+m.t.length,0)<(cfg.ctx||100000)||rs.length<8)return;const k=Math.floor(rs.length/2),old=rs.slice(0,k).map(m=>(m.r=='user'?'User: ':'AI: ')+m.t.slice(0,5000)).join('\n\n');
try{c.sum=await llm(p,[{role:'user',content:'Summarize this conversation so another assistant can continue the work with no loss: goals, decisions, file names and purposes, open tasks, user preferences. Be dense.\n\n'+(c.sum?'Previous summary:\n'+c.sum+'\n\n':'')+old}],'You write precise project summaries.',{stream:false});c.cut=f+k;toast(t('Memory compacted|মেমরি সংক্ষিপ্ত হয়েছে'))}catch(e){}}
async function call(c,p,sg,tok){await compact(c,p);const an=p.type=='anthropic',L=c.msgs.filter(m=>m.t&&!m.err).slice(c.cut||0);while(L.length&&L[0].r!='user')L.shift();const u=[...L].reverse().find(m=>m.r=='user');
await llm(p,L.map(m=>m.r=='user'?{role:'user',content:uc(m,an)}:{role:'assistant',content:m.t}),await sysP(c,u&&u.show||''),{stream:cfg.stream,sg,tok,web:1})}
async function run(c,p){c.msgs.push({r:'assistant',t:''});const i=c.msgs.length-1;busy=true;setSend(1);rend();ab=new AbortController();
const u=[...c.msgs].reverse().find(m=>m.r=='user'),q=(u&&u.show)||'';lastWS='';
try{if(needS(q)){c.msgs[i].st=t('Searching the web|ওয়েবে খুঁজছি');rend();const W=await wsearch(q);c.msgs[i].src=W.src;lastWS=W.ctx;c.msgs[i].st=''}
await call(c,p,ab.signal,x=>{c.msgs[i].t+=x;tick(i)})}catch(e){if(e.name!='AbortError'){c.msgs[i].t+=(c.msgs[i].t?'\n\n':'')+'Error: '+e.message;c.msgs[i].err=1}}
c.msgs[i].st='';if(!c.msgs[i].t)c.msgs.pop();busy=false;setSend(0);rend();
const d=c.msgs[i];if(d&&d.t){const R=[...d.t.matchAll(/\[\[remember:([^\]]*)\]\]/g)];if(R.length&&cfg.auto)cfg.mem=(cfg.mem?cfg.mem+'\n':'')+R.map(x=>'- '+x[1].trim()).join('\n');c.proj=c.proj||{};Object.entries(F).forEach(([k,f])=>{if(k.startsWith(i+':')&&!f.p)c.proj[f.n]=f.c})}
save();if(d&&d.t&&!d.err&&cfg.tts&&cfg.tts.auto&&cfg.tts.gemK)speak(i)}
function regen(i){const c=cur(),p=cfg.provs[cfg.active];if(busy||!p)return;hap();c.msgs.splice(i);run(c,p)}
async function send(){if(busy){ab&&ab.abort();return}
const t0=$('#inp').value.trim();if(!t0&&!pend.length)return;const p=cfg.provs[cfg.active];
if(!p||!p.key||!p.model||!p.base){toast(t('Set provider, key and model first|আগে প্রোভাইডার, কী ও মডেল দিন'));openSet('prov');return}
const c=cur();c.proj=c.proj||{};let full=t0;const imgs=[],names=pend.map(f=>f.name);
pend.forEach(f=>{if(f.img){imgs.push(f.img);return}full+=`\n\n<attachment name="${f.name}">\n${f.txt}\n</attachment>`;const B=[...f.txt.matchAll(/<file name="([^"]*)">\n([\s\S]*?)\n<\/file>/g)];B.length?B.forEach(x=>c.proj[x[1]]=x[2]):c.proj[f.name]=f.txt});
hap();c.msgs.push({r:'user',t:full||'Describe this image.',show:t0,imgs,names});if(c.msgs.length==1)c.title=(t0||names[0]).slice(0,32);
pend=[];chips();$('#inp').value='';$('#inp').style.height='auto';
if(cfg.tts&&cfg.tts.auto){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}}
await run(c,p)}
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
if(a=='pv'){$('#pvf').srcdoc=bundle(k);$('#pv').classList.add('on')}if(a=='stp'){const m=cur().msgs[i];m.open=!m.open;rend()}if(a=='rg')regen(+i);
if(a=='sp')speak(+i);if(a=='cm')navigator.clipboard.writeText(cur().msgs[i].t).then(()=>toast('কপি হয়েছে'));if(a=='zp')zipAll(i);if(a=='ar')openAR(k);if(a=='lk'||a=='dk'){const m=cur().msgs[i],v=a=='lk'?1:-1;m.lk=m.lk==v?0:v;hap();save();rend()}};
