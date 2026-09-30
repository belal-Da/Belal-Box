/* নতুন UI: শিট, আর্টিফ্যাক্ট, মডেল পিকার */
const sh=(id,on)=>$('#'+id).classList[on?'add':'remove']('on');
document.querySelectorAll('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o&&o.id!='pv')o.classList.remove('on')}));
$('#plus').onclick=()=>{$('#wt').checked=!!cfg.web;sh('ad',1)};$('#wt').onchange=e=>{cfg.web=e.target.checked;save()};
[1,2,3].forEach(n=>$('#t'+n).onclick=()=>{sh('ad',0);$('#f'+n).click()});
$('#nc2').onclick=()=>{newChat();save();rend()};
const tile=n=>{const x=(n.split('.').pop()||'').toUpperCase(),d=/^(MD|TXT)$/.test(x);return`<div class="ft ${d?'bl':'or'}">${d?'📄':'&lt;/&gt;'}</div><div><b>${esc(n)}</b><small>${d?'Document':'Code'} · ${esc(x)}</small></div>`};
function openAL(){const en=Object.entries(F);$('#alb').innerHTML=en.length?en.map(([k,f])=>`<div class="fc" data-a="ar" data-k="${k}">${tile(f.n)}<button class="ib" data-a="dl" data-k="${k}">⬇</button></div>`).join('')+'<button class="pri" data-a="zp" data-i="*">Download all</button>':'<p style="color:var(--mu);margin:14px 0">এখনো কোনো ফাইল নেই</p>';sh('al',1)}
$('#ar_b').onclick=openAL;
function openAR(k){const f=F[k];if(!f)return;$('#arb').innerHTML=`<div class="ah"><b>${esc(f.n)}</b><span>${/\.(html|svg)$/i.test(f.n)?`<button data-a="pv" data-k="${k}">👁️</button> `:''}<button data-a="cp" data-k="${k}">কপি</button> <button data-a="dl" data-k="${k}">⬇</button></span></div><pre>${esc(f.c)}</pre>`;sh('ar',1)}
$('#alb').onclick=$('#arb').onclick=$('#chat').onclick;
$('#pill').onclick=()=>{$('#mpb').innerHTML='<input id="mq" placeholder="মডেল খুঁজুন…" style="width:100%;padding:10px;border-radius:12px;border:1px solid var(--bd);background:var(--cp);color:var(--fg)"><div id="mpl"></div>';const L=q=>{const p=cfg.provs[cfg.active];$('#mpl').innerHTML=p.models.length?p.models.filter(m=>m.toLowerCase().includes(q.toLowerCase())).slice(0,150).map(m=>`<div class="ci ${m==p.model?'cur':''}" data-m="${esc(m)}"><span>${esc(m)}</span></div>`).join(''):'<p style="margin:14px 0;color:var(--mu)">আগে ⚙ সেটিংসে Fetch Models চাপুন</p>'};L('');$('#mq').oninput=e=>L(e.target.value);sh('mp',1)};
$('#mpb').onclick=e=>{const d=e.target.closest('[data-m]');if(d){cfg.provs[cfg.active].model=d.dataset.m;save();sh('mp',0);rend()}};
