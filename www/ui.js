/* sheets, artifact viewer, model picker, boot */
const sh=(id,on)=>$('#'+id).classList[on?'add':'remove']('on');
document.querySelectorAll('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o&&o.id!='pv')o.classList.remove('on')}));
const IC={menu:'menu',ar_b:'file',nc2:'edit',gear:'gear',plus:'plus'};for(const k in IC)$('#'+k).innerHTML=ic(IC[k]);$('#pvx').innerHTML=ic('x');
function lbl(){$('#inp').placeholder=t('Message Belal Box…|Belal Box-কে লিখুন…');$('#adt').textContent=t('Add to chat|চ্যাটে যোগ করুন');$('#wtl').textContent=t('Web search|ওয়েব সার্চ');$('#alt').textContent=t('Artifacts|আর্টিফ্যাক্ট');$('#nc').textContent=t('New chat|নতুন চ্যাট');[['t1','cam','Camera|ক্যামেরা'],['t2','img','Photos|ছবি'],['t3','clip','Files|ফাইল']].forEach(([i,n,l])=>$('#'+i).innerHTML=ic(n,26)+'<br>'+t(l));if($('#setb')&&$('#set').classList.contains('on'))drawSet()}
$('#plus').onclick=()=>{$('#wt').checked=cfg.search!='off';sh('ad',1)};$('#wt').onchange=e=>{cfg.search=e.target.checked?'auto':'off';save()};
[1,2,3].forEach(n=>$('#t'+n).onclick=()=>{sh('ad',0);$('#f'+n).click()});
$('#nc2').onclick=()=>{newChat();save();rend()};
const tile=n=>{const x=(n.split('.').pop()||'').toUpperCase(),d=/^(MD|TXT)$/.test(x);return`<div class="ft ${d?'bl':'or'}">${d?ic('file',26):'&lt;/&gt;'}</div><div><b>${esc(n)}</b><small>${d?'Document':'Code'} · ${esc(x)}</small></div>`};
function openAL(){const en=Object.entries(F).filter(([k,f])=>!f.p);$('#alb').innerHTML=en.length?en.map(([k,f])=>`<div class="fc" data-a="ar" data-k="${k}">${tile(f.n)}<button class="ib" data-a="dl" data-k="${k}">${ic('dl')}</button></div>`).join('')+`<button class="pri" data-a="zp" data-i="*">${t('Download all|সব ডাউনলোড')}</button>`:`<p style="color:var(--mu);margin:14px 0">${t('No files yet|এখনো কোনো ফাইল নেই')}</p>`;sh('al',1)}
$('#ar_b').onclick=openAL;
let AK='';
function openAR(k){const f=F[k];if(!f)return;AK=k;const M=[['cp','copy','Copy|কপি'],['dl','dl','Download|ডাউনলোড'],['pdf','file','Save as PDF|PDF সেভ'],...(/\.(html|svg)$/i.test(f.n)?[['pv','eye','Preview|প্রিভিউ']]:[])];
$('#arb').innerHTML=`<div class="vh"><button class="ib" data-v="x">${ic('x')}</button><b>${esc(f.n)}</b><button class="ib" data-v="m">${ic('more')}</button></div><div id="vm" class="vm" hidden>${M.map(([a,i,l])=>`<div class="rw" data-v="${a}">${ic(i,18)}<span>${t(l)}</span></div>`).join('')}</div><pre class="vp">${hl(f.c)}</pre>`;sh('ar',1)}
async function vact(a){const f=F[AK];if(a=='x')return sh('ar',0);if(a=='m'){const m=$('#vm');m.hidden=!m.hidden;return}$('#vm').hidden=true;
if(a=='cp')navigator.clipboard.writeText(f.c).then(()=>toast(t('Copied|কপি হয়েছে')));
if(a=='dl')dl(f.n.split('/').pop(),new Blob([f.c]));
if(a=='pv'){$('#pvf').srcdoc=bundle(AK);sh('pv',1)}
if(a=='pdf'){try{if(!window.jspdf)await new Promise((r,j)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=r;s.onerror=j;document.head.appendChild(s)});const d=new jspdf.jsPDF({unit:'pt',format:'a4'});d.setFont('courier');d.setFontSize(8);let y=30;for(const l of d.splitTextToSize(f.c,540)){if(y>810){d.addPage();y=30}d.text(l,28,y);y+=10}dl(f.n.split('/').pop()+'.pdf',d.output('blob'))}catch(e){toast(e.message)}}}
$('#alb').onclick=$('#chat').onclick;
$('#arb').onclick=e=>{const v=e.target.closest('[data-v]');if(v)return vact(v.dataset.v);$('#chat').onclick(e)};
$('#pvx').onclick=()=>{sh('pv',0);$('#pvf').srcdoc=''};
$('#pill').onclick=()=>{$('#mpb').innerHTML=`<input id="mq" placeholder="${t('Search models…|মডেল খুঁজুন…')}" style="width:100%;padding:10px;border-radius:12px;border:1px solid var(--bd);background:var(--cp);color:var(--fg)"><div id="mpl"></div>`;
const L=q=>{const p=cfg.provs[cfg.active];$('#mpl').innerHTML=p.models&&p.models.length?p.models.filter(m=>m.toLowerCase().includes(q.toLowerCase())).slice(0,150).map(m=>`<div class="rw ${m==p.model?'cur':''}" data-m="${esc(m)}"><span>${esc(m)}</span>${bd(m,p)}</div>`).join(''):`<p style="margin:14px 0;color:var(--mu)">${t('Fetch models in Settings first|আগে সেটিংসে মডেল আনুন')}</p>`};L('');$('#mq').oninput=e=>L(e.target.value);sh('mp',1)};
$('#mpb').onclick=e=>{const d=e.target.closest('[data-m]');if(d){cfg.provs[cfg.active].model=d.dataset.m;save();sh('mp',0);rend()}};
async function boot(){chats=(await kv.get('chats'))||J('bb_chats',[]);cfg={...DEFC,...cfg,tts:{...DEFC.tts,...cfg.tts}};const T=cfg.tts;if(!T.murfK&&T.key)T.murfK=T.key;if(/generate/.test(T.murfU||''))T.murfU=DEFC.tts.murfU;
if(!cfg.provs.length)cfg.provs=PRE.slice(0,4).map(r=>({name:r[0],type:r[1],base:r[2],key:'',model:'',models:[]}));
if(!chats.length)newChat();look();wall();lbl();setSend(0);rend()}
boot();
