/* Studio: image and video generation (free engines + custom providers) */
const IMGM=/image|dall|flux|stable|sdxl|sd3|imagen|cogview|kolors|seedream|recraft|ideogram|midjourney|playground|qwen-image|gpt-image/i,VIDM=/video|sora|veo|kling|wan|hunyuan|cogvideo|runway|luma|pika|minimax|seedance|vidu|hailuo/i;
const STY=[['None',''],['Photoreal','photorealistic, ultra detailed, natural light, 8k'],['Cinematic','cinematic lighting, dramatic, film still, shallow depth of field'],['Anime','anime style, vibrant colors, clean line art'],['3D','3D render, soft studio lighting, octane render'],['Watercolor','watercolor painting, soft washes, paper texture'],['Logo','minimal vector logo, flat design, clean shapes'],['Pixel','pixel art, 16-bit, crisp pixels']];
const ARS={'1:1':[1024,1024],'16:9':[1344,768],'9:16':[768,1344],'4:3':[1152,864]};
let SK={k:'image',e:'',ar:'1:1',st:0,n:1,d:6,pr:'',busy:0,err:'',sel:[],gal:[]};
const NOTE=id=>id=='pol'?'Free, no key. Pollinations FLUX through a public queue; can be slow at busy times.':id=='gem'?'Uses your Gemini key. The free tier may have no image quota.':id=='hf'?'Free Hugging Face token (Settings > Studio). Rate limited.':id=='veo'?'Gemini Veo. Needs a Gemini key with video access (usually paid).':id=='loc'?'Free and on your phone: turns your images into a smooth zoom video (WebM).':'Custom provider. It must support the OpenAI images or videos API.';
function engines(kind){const E=[];if(kind=='image'){E.push({id:'pol',n:'Pollinations FLUX (free, no key)'});if(cfg.tts.gemK)E.push({id:'gem',n:'Gemini image'});if(cfg.hfK)E.push({id:'hf',n:'Hugging Face FLUX (free token)'})}else{if(cfg.tts.gemK)E.push({id:'veo',n:'Gemini Veo'});E.push({id:'loc',n:'Motion video from images (free, on device)'})}
cfg.provs.forEach((p,i)=>(p.models||[]).filter(m=>(kind=='image'?IMGM:VIDM).test(m)).forEach(m=>E.push({id:'p:'+i+':'+m,n:p.name+' · '+m})));return E}
const blob2url=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
async function getBin(url,hd,body,mime){if(isN()){const r=await Capacitor.Plugins.CapacitorHttp.request({url,method:body?'POST':'GET',headers:hd||{},data:body,responseType:'blob'});if(r.status>=400)throw new Error(r.status+' '+String(r.data).slice(0,120));return'data:'+(mime||'image/jpeg')+';base64,'+r.data}const r=await fetch(url,{method:body?'POST':'GET',headers:hd,body:body&&JSON.stringify(body)});if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,120));return blob2url(await r.blob())}
const pbase=p=>p.base.trim().replace(/\/+$/,'').replace(/\/(chat\/completions|messages)$/,'');
async function genOA(p,m,pr,ar,n){const b=pbase(p),SZ={'1:1':'1024x1024','16:9':'1536x1024','9:16':'1024x1536','4:3':'1536x1024'},hd={...(p.key?{Authorization:'Bearer '+p.key}:{}),'content-type':'application/json'};let j;
try{j=await hx(b+'/images/generations',hd,{model:m,prompt:pr,n,size:SZ[ar],response_format:'b64_json'})}catch(e){j=await hx(b+'/images/generations',hd,{model:m,prompt:pr,n})}
return Promise.all((j.data||[]).map(async x=>x.b64_json?'data:image/png;base64,'+x.b64_json:getBin(x.url,{},null,'image/png').catch(()=>x.url)))}
async function runImg(e,pr,ar,n){const[w,h]=ARS[ar],rep=f=>Promise.all([...Array(n)].map(f));
if(e.id=='pol')return rep(()=>getBin(`https://image.pollinations.ai/prompt/${encodeURIComponent(pr)}?width=${w}&height=${h}&seed=${Math.floor(Math.random()*1e9)}&model=${encodeURIComponent(cfg.polM||'flux')}&nologo=true`,{},null,'image/jpeg'));
if(e.id=='gem')return(await rep(()=>genImage(pr,ar))).flatMap(g=>g.imgs);
if(e.id=='hf')return rep(()=>getBin(`https://router.huggingface.co/hf-inference/models/${cfg.hfM||'black-forest-labs/FLUX.1-schnell'}`,{Authorization:'Bearer '+cfg.hfK,'content-type':'application/json',Accept:'image/png'},{inputs:pr,parameters:{width:w,height:h}},'image/png'));
const x=e.id.match(/^p:(\d+):(.*)$/);return genOA(cfg.provs[+x[1]],x[2],pr,ar,n)}
async function quickImage(pr){const E=engines('image'),e=E.find(x=>x.id==cfg.imgEng)||E.find(x=>x.id=='gem')||E[0];return{imgs:await runImg(e,pr,'1:1',1),txt:''}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function veo(pr,ar){const K=encodeURIComponent(cfg.tts.gemK),B='https://generativelanguage.googleapis.com/v1beta',H={'content-type':'application/json'};let op,last;
for(const m of['veo-3.0-fast-generate-001','veo-3.0-generate-001','veo-2.0-generate-001']){try{op=await hx(`${B}/models/${m}:predictLongRunning?key=${K}`,H,{instances:[{prompt:pr}],parameters:{aspectRatio:ar=='9:16'?'9:16':'16:9'}});break}catch(e){last=e;if(!/404|NOT_FOUND|not found|not supported/i.test(e.message))throw e}}
if(!op)throw last;for(let i=0;i<75&&!op.done;i++){await sleep(8000);op=await hx(`${B}/${op.name}?key=${K}`,{})}
if(!op.done)throw new Error('Video is taking too long, try again later');if(op.error)throw new Error(op.error.message);
const v=(((op.response||{}).generateVideoResponse||{}).generatedSamples||[])[0];if(!v)throw new Error('No video returned: '+JSON.stringify(op.response||{}).slice(0,150));
return getBin(v.video.uri+(v.video.uri.includes('?')?'&':'?')+'key='+K,{},null,'video/mp4')}
async function sora(p,m,pr,ar,d){const b=pbase(p),hd={...(p.key?{Authorization:'Bearer '+p.key}:{})};let j=await hx(b+'/videos',{...hd,'content-type':'application/json'},{model:m,prompt:pr,seconds:String(d),size:ar=='9:16'?'720x1280':'1280x720'});const id=j.id;if(!id)throw new Error('Unexpected response: '+JSON.stringify(j).slice(0,150));
for(let i=0;i<90&&j.status!='completed';i++){if(j.status=='failed')throw new Error((j.error&&j.error.message)||'Video failed');await sleep(6000);j=await hx(b+'/videos/'+id,hd)}
if(j.status!='completed')throw new Error('Timed out');return getBin(b+'/videos/'+id+'/content',hd,null,'video/mp4')}
async function motion(srcs,d,ar){if(!srcs.length)throw new Error('Generate or select an image first');const[W,H]={'1:1':[720,720],'16:9':[1280,720],'9:16':[720,1280],'4:3':[960,720]}[ar];
const ims=await Promise.all(srcs.map(u=>new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>j(new Error('Image failed to load'));i.src=u})));
const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),mt=['video/webm;codecs=vp9','video/webm'].find(x=>MediaRecorder.isTypeSupported(x)),mr=new MediaRecorder(cv.captureStream(30),{mimeType:mt,videoBitsPerSecond:4e6}),ch=[];mr.ondataavailable=e=>ch.push(e.data);
const done=new Promise(r=>mr.onstop=()=>r(new Blob(ch,{type:'video/webm'})));mr.start();const T=d*1000,t0=performance.now(),seg=T/ims.length;
const dr=(im,a,z0,z1,lt)=>{const s=Math.max(W/im.width,H/im.height)*(z0+(z1-z0)*lt),w=im.width*s,h=im.height*s;g.globalAlpha=a;g.drawImage(im,(W-w)/2,(H-h)/2,w,h)};
await new Promise(res=>{const fr=()=>{const t=performance.now()-t0;if(t>=T)return res();const k=Math.min(ims.length-1,Math.floor(t/seg)),lt=(t-k*seg)/seg;g.globalAlpha=1;g.fillStyle='#000';g.fillRect(0,0,W,H);dr(ims[k],1,k%2?1.28:1,k%2?1:1.28,lt);if(k<ims.length-1&&lt>.85)dr(ims[k+1],(lt-.85)/.15,(k+1)%2?1.28:1,(k+1)%2?1:1.28,0);requestAnimationFrame(fr)};fr()});
mr.stop();return blob2url(await done)}
async function genVideo(e,pr,ar,d,srcs){if(e.id=='loc')return motion(srcs,d,ar);if(e.id=='veo')return veo(pr,ar);const x=e.id.match(/^p:(\d+):(.*)$/);return sora(cfg.provs[+x[1]],x[2],pr,ar,d)}
const galLoad=async()=>{SK.gal=(await kv.get('gallery'))||[]};
const gcard=(x,i,sel)=>`<div class="gc ${sel?'on':''}" ${sel!==undefined?`data-s="selimg" data-v="${x.ts}"`:''}>${x.k=='i'?`<img src="${x.u}">`:`<video src="${x.u}" controls playsinline></video>`}<div class="ga"><button class="ib" data-s="dl" data-v="${i}">${ic('dl',18)}</button>${x.k=='i'?`<button class="ib" data-s="use" data-v="${i}">${ic('plus',18)}</button><button class="ib" data-s="anim" data-v="${i}">${ic('play',18)}</button>`:''}<button class="ib" data-s="cp" data-v="${i}">${ic('copy',18)}</button><button class="ib" data-s="del" data-v="${i}">${ic('trash',18)}</button></div></div>`;
function drawStudio(){const E=engines(SK.k);if(!E.find(x=>x.id==SK.e))SK.e=(SK.k=='image'?cfg.imgEng:cfg.vidEng);if(!E.find(x=>x.id==SK.e))SK.e=E[0]&&E[0].id;
const tab=(k,l)=>`<button class="tb ${SK.k==k?'on':''}" data-s="tab" data-v="${k}">${l}</button>`,chip=(a,v,l,on)=>`<button class="cp ${on?'on':''}" data-s="${a}" data-v="${v}">${l}</button>`,imgs=SK.gal.map((x,i)=>[x,i]).filter(z=>z[0].k=='i');
$('#stb').innerHTML=`<div class="vh"><button class="ib" data-s="x">${ic('x')}</button><b class="gr">Studio</b><i style="width:40px"></i></div>
<div class="tabs">${tab('image','Image')}${tab('video','Video')}</div>
<label>Engine</label><select data-s="eng">${E.map(x=>`<option value="${x.id}" ${x.id==SK.e?'selected':''}>${esc(x.n)}</option>`).join('')}</select><small class="ds">${NOTE((SK.e||'').split(':')[0]=='p'?'p':SK.e)}</small>
<label>Prompt</label><textarea id="sp" rows="4" placeholder="${SK.k=='image'?'A glowing lantern in a misty bamboo forest at dawn':'Slow zoom on a neon city street at night'}">${esc(SK.pr)}</textarea><div class="row"><button data-s="imp">Improve prompt</button><button data-s="clr">Clear</button></div>
<label>Style</label><div class="chs">${STY.map((x,i)=>chip('sty',i,x[0],SK.st==i)).join('')}</div>
<label>Aspect ratio</label><div class="chs">${Object.keys(ARS).map(a=>chip('ar',a,a,SK.ar==a)).join('')}</div>
${SK.k=='image'?`<label>Images</label><div class="chs">${[1,2,3,4].map(n=>chip('n',n,n,SK.n==n)).join('')}</div>`:`<label>Length</label><div class="chs">${[4,6,8,10].map(n=>chip('d',n,n+'s',SK.d==n)).join('')}</div>`}
${SK.k=='video'&&SK.e=='loc'?`<label>Images in the video (tap to choose, newest is used if none)</label><div class="gal sel">${imgs.slice(0,12).map(([x,i])=>gcard(x,i,SK.sel.includes(x.ts))).join('')||'<small class="ds">Generate an image first</small>'}</div>`:''}
<button class="pri go" data-s="go">${SK.busy?'Generating...':'Generate'}</button>${SK.err?`<p class="er">${esc(SK.err)}</p>`:''}
<label>Gallery</label><div class="gal">${SK.gal.map((x,i)=>gcard(x,i)).join('')||'<small class="ds">Nothing yet</small>'}</div>`}
async function sgo(){if(SK.busy)return;const e=engines(SK.k).find(x=>x.id==SK.e);if(!e){SK.err='No engine available. Add a key in Settings.';return drawStudio()}
const pr=(SK.pr+(STY[SK.st][1]?', '+STY[SK.st][1]:'')).trim();if(!pr&&!(SK.k=='video'&&e.id=='loc')){SK.err='Write a prompt first';return drawStudio()}
SK.busy=Date.now();SK.err='';cfg[SK.k=='image'?'imgEng':'vidEng']=e.id;save();drawStudio();const iv=setInterval(()=>{const g=$('#stb .go');if(g&&SK.busy)g.textContent='Generating... '+Math.floor((Date.now()-SK.busy)/1000)+'s'},1000);
try{let outs;if(SK.k=='image')outs=await runImg(e,pr,SK.ar,SK.n);else{let srcs=SK.sel.map(ts=>(SK.gal.find(g=>g.ts==ts)||{}).u).filter(Boolean);if(!srcs.length){const l=SK.gal.find(g=>g.k=='i');if(l)srcs=[l.u]}outs=[await genVideo(e,pr,SK.ar,SK.d,srcs)]}
for(const u of outs)SK.gal.unshift({k:SK.k=='image'?'i':'v',u,p:pr,ts:Date.now()+Math.random()});SK.gal=SK.gal.slice(0,30);kv.set('gallery',SK.gal)}catch(x){SK.err=String(x.message).slice(0,300)}
SK.busy=0;clearInterval(iv);drawStudio()}
async function improve(){const p=cfg.provs[cfg.active];if(!SK.pr.trim()||!p)return;toast('...');try{SK.pr=(await llm(p,[{role:'user',content:'Rewrite as one detailed English prompt for an AI '+SK.k+' generator (subject, setting, lighting, style, camera). Output only the prompt.\n\n'+SK.pr}],'You write image prompts.',{stream:false,mt:300})).trim()}catch(e){toast(String(e.message).slice(0,120))}drawStudio()}
async function openStudio(k){await galLoad();SK.k=k||SK.k;drawStudio();sh('st',1)}
$('#stb').onclick=async e=>{const b=e.target.closest('[data-s]');if(!b||b.tagName=='SELECT')return;const a=b.dataset.s,v=b.dataset.v;
if(a=='x')return sh('st',0);if(a=='tab'){SK.k=v;SK.e=v=='image'?cfg.imgEng:cfg.vidEng}
else if(a=='sty')SK.st=+v;else if(a=='ar')SK.ar=v;else if(a=='n')SK.n=+v;else if(a=='d')SK.d=+v;else if(a=='clr')SK.pr='';
else if(a=='selimg'){const k=SK.sel.indexOf(+v);k<0?SK.sel.push(+v):SK.sel.splice(k,1)}
else if(a=='imp')return improve();else if(a=='go')return sgo();
else if(a=='dl'){const x=SK.gal[+v];fetch(x.u).then(r=>r.blob()).then(bl=>dl('belal-'+(x.k=='i'?'image-'+(+v+1)+'.png':'video-'+(+v+1)+(x.u.startsWith('data:video/webm')?'.webm':'.mp4')),bl));return}
else if(a=='use'){pend.push({name:'studio-image.png',img:SK.gal[+v].u});chips();return sh('st',0)}
else if(a=='anim'){SK.k='video';SK.e='loc';SK.sel=[SK.gal[+v].ts]}
else if(a=='cp'){navigator.clipboard.writeText(SK.gal[+v].p||'');toast('Copied');return}
else if(a=='del'){SK.gal.splice(+v,1);kv.set('gallery',SK.gal)}
drawStudio()};
$('#stb').addEventListener('input',e=>{if(e.target.id=='sp')SK.pr=e.target.value});
$('#stb').addEventListener('change',e=>{if(e.target.dataset.s=='eng'){SK.e=e.target.value;cfg[SK.k=='image'?'imgEng':'vidEng']=SK.e;save();drawStudio()}});
