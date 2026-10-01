/* icons, i18n, providers, voice, live data, settings */
const P={menu:'M4 7h16M4 12h10M4 17h16',file:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',plus:'M12 5v14M5 12h14',edit:'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',gear:'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1',copy:'M9 9h11v11H9zM5 15V4h11',play:'M8 5v14l11-7z',up:'M12 19V5M5 12l7-7 7 7',stop:'M7 7h10v10H7z',dl:'M12 4v11M7 11l5 5 5-5M5 20h14',back:'M15 5l-7 7 7 7',x:'M6 6l12 12M18 6L6 18',like:'M7 11v9H4v-9zM7 11l4-7c2 0 2 2 2 3l-.5 3H19a2 2 0 0 1 2 2l-1.5 6a2 2 0 0 1-2 1.5H7',globe:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',cam:'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',img:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4',clip:'M20 11l-8 8a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8',more:'M12 5h.01M12 12h.01M12 19h.01',chev:'M9 5l7 7-7 7',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z',tool:'M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 0-2-2z',voice:'M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2',user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',bolt:'M13 3L5 14h6l-1 7 8-11h-6z',brain:'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V4a3 3 0 0 0-3 0zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1',lang:'M4 5h9M8 3v2M6 5c1 4 3 6 6 8M11 5c-1 4-3 6-6 8M13 20l4-9 4 9M14.5 17h5',shield:'M12 3l8 3v6c0 5-3 8-8 9-5-1-8-4-8-9V6z',moon:'M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13'};
const ic=(n,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${(P[n]||'').split('M').filter(Boolean).map(d=>`<path d="M${d}"/>`).join('')}</svg>`;
const t=s=>{const[a,b]=String(s).split('|');return cfg.lang=='bn'?(b||a):cfg.lang=='mix'?(b?a+' · '+b:a):a};
const hap=()=>{try{cfg.hap&&navigator.vibrate(12)}catch(e){}};
const setSend=b=>{$('#send').innerHTML=ic(b?'stop':'up')};
const look=()=>{const d=cfg.theme=='dark'||(cfg.theme!='light'&&matchMedia('(prefers-color-scheme:dark)').matches),r=document.documentElement;r.dataset.t=d?'dark':'light';r.dataset.f=cfg.font};
const DEFC={lang:'bn',theme:'system',font:'serif',stream:true,art:true,sum:true,auto:true,ltime:true,web:false,hap:true,max:16000,ctx:100000,name:'',sys:'',mem:'',lw:'',ltk:'',wall:'',provs:[],active:0,tts:{eng:'auto',murfU:'https://global.api.murf.ai/v1/speech/stream',murfV:'Debarati',murfS:'Conversational',murfM:'falcon-2',murfL:'bn-IN',gemM:'gemini-2.5-flash-preview-tts',gemV:'Leda',oaU:'https://api.groq.com/openai/v1/audio/speech',oaM:'playai-tts',oaV:'Celeste-PlayAI'}};
const PRE=[['OpenRouter','openai','https://openrouter.ai/api/v1'],['Anthropic','anthropic','https://api.anthropic.com'],['OpenAI','openai','https://api.openai.com/v1'],['Gemini','openai','https://generativelanguage.googleapis.com/v1beta/openai'],['Groq','openai','https://api.groq.com/openai/v1'],['DeepSeek','openai','https://api.deepseek.com/v1'],['xAI','openai','https://api.x.ai/v1'],['Mistral','openai','https://api.mistral.ai/v1'],['SiliconFlow','openai','https://api.siliconflow.cn/v1'],['Ollama','openai','http://localhost:11434/v1'],['Custom','openai','']];
/* model abilities */
function caps(id,p){const m=(p.meta||{})[id]||{},s=id.toLowerCase();return{v:m.v??/claude|gpt-[45]|gemini|vision|-vl|llava|kimi|qwen3|pixtral|grok-[2-9]/.test(s),r:m.r??/opus|sonnet|fable|mythos|o[134](-|$)|r1|thinking|gpt-5|gemini-(2\.5|3)|deepseek.*(pro|r)|qwq|glm-[45]/.test(s),t:m.t??!/embed|tts|whisper|image|dall/.test(s),c:m.c||''}}
const bd=(id,p)=>{const c=caps(id,p);return`<span class="bd">${c.v?ic('eye',15):''}${c.r?ic('bulb',15):''}${c.t?ic('tool',15):''}${c.c?`<small>${c.c}</small>`:''}</span>`};
async function fetchM(p){const an=p.type=='anthropic';let b=p.base.replace(/\/+$/,'');if(an)b=b.replace(/\/v1$/,'');
try{toast('…');const j=await hx(an?b+'/v1/models?limit=1000':b+'/models',an?{'x-api-key':p.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}:{Authorization:'Bearer '+p.key}),d=j.data||j;p.meta={};
p.models=d.map(x=>{const id=String(x.id||x.name||x).replace(/^models\//,''),f=n=>n>=1e6?(n/1e6)+'M':Math.round(n/1e3)+'K';if(x.context_length||x.architecture)p.meta[id]={c:x.context_length?f(x.context_length):'',v:x.architecture?(x.architecture.input_modalities||[]).includes('image'):undefined,r:x.supported_parameters?x.supported_parameters.includes('reasoning'):undefined,t:x.supported_parameters?x.supported_parameters.includes('tools'):undefined};return id}).sort();save();drawSet();toast(p.models.length+' models')}catch(e){toast(e.message)}}
/* live data */
async function live(q){const o=[];if(cfg.ltime)o.push('Now: '+new Date().toString());
if(cfg.lw){try{const g=await hx('https://geocoding-api.open-meteo.com/v1/search?count=1&name='+encodeURIComponent(cfg.lw),{}),r=g.results[0],w=await hx(`https://api.open-meteo.com/v1/forecast?latitude=${r.latitude}&longitude=${r.longitude}&current=temperature_2m,weather_code,wind_speed_10m`,{});o.push(`Weather in ${r.name}: ${JSON.stringify(w.current)}`)}catch(e){}}
if(cfg.ltk&&q){try{const r=await hx('https://api.tavily.com/search',{'content-type':'application/json'},{api_key:cfg.ltk,query:q.slice(0,300),max_results:5,include_answer:true});o.push('Web results: '+(r.answer||'')+'\n'+r.results.map(x=>`- ${x.title}: ${x.content.slice(0,300)} (${x.url})`).join('\n'))}catch(e){}}
return o.length?'\n\n# Live data (fetched just now, trust over training data)\n'+o.join('\n'):''}
/* voice */
let spk=0;const stopA=()=>{spk++;if(audio){audio.pause();audio=null}speechSynthesis.cancel()};
const bin=async(url,hd,body)=>{if(isN()){const r=await Capacitor.Plugins.CapacitorHttp.request({url,method:'POST',headers:hd,data:body,responseType:'blob'});if(r.status>=400)throw new Error(r.status+' '+String(r.data).slice(0,120));return'data:audio/mpeg;base64,'+r.data}const r=await fetch(url,{method:'POST',headers:hd,body:JSON.stringify(body)});if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,120));return URL.createObjectURL(await r.blob())};
const wav=b=>{const d=Uint8Array.from(atob(b),c=>c.charCodeAt(0)),h=new DataView(new ArrayBuffer(44)),w=(o,s)=>[...s].forEach((c,i)=>h.setUint8(o+i,c.charCodeAt(0)));w(0,'RIFF');h.setUint32(4,36+d.length,true);w(8,'WAVEfmt ');h.setUint32(16,16,true);h.setUint16(20,1,true);h.setUint16(22,1,true);h.setUint32(24,24000,true);h.setUint32(28,48000,true);h.setUint16(32,2,true);h.setUint16(34,16,true);w(36,'data');h.setUint32(40,d.length,true);return URL.createObjectURL(new Blob([h,d],{type:'audio/wav'}))};
async function synth(e,x){const T=cfg.tts;
if(e=='murf'){const b={text:x,voiceId:T.murfV,model:T.murfM,locale:T.murfL,format:'MP3'};if(T.murfS)b.style=T.murfS;return bin(T.murfU,{'api-key':T.murfK,'content-type':'application/json'},b)}
if(e=='gemini'){const j=await hx(`https://generativelanguage.googleapis.com/v1beta/models/${T.gemM}:generateContent?key=${T.gemK}`,{'content-type':'application/json'},{contents:[{parts:[{text:'Say warmly in a natural female Bengali voice: '+x}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:T.gemV}}}}});return wav(j.candidates[0].content.parts[0].inlineData.data)}
return bin(T.oaU,{Authorization:'Bearer '+T.oaK,'content-type':'application/json'},{model:T.oaM,voice:T.oaV,input:x,response_format:'mp3'})}
const play=u=>new Promise((r,j)=>{audio=new Audio(u);audio.onended=r;audio.onerror=()=>j(new Error('audio'));audio.play().catch(j)});
const speak=i=>speakT(cur().msgs[i].t.replace(SR,'').replace(RM,'').replace(/`{3,}[\s\S]*?(`{3,}|$)/g,' ').replace(/[*#`_>\[\]]/g,'').trim().slice(0,3000));
async function speakT(text){if(!text)return;stopA();const my=spk,T=cfg.tts,cs=[];let c='';for(const s of text.match(/[^।.!?\n]+[।.!?\n]*/g)||[text]){if((c+s).length>380&&c){cs.push(c);c=''}c+=s}if(c)cs.push(c);
const K={murf:T.murfK,gemini:T.gemK,openai:T.oaK},ord=(T.eng=='device'?[]:[T.eng,'gemini','murf','openai']).filter((e,i,a)=>K[e]&&a.indexOf(e)==i);
for(const e of ord){try{let Pm=synth(e,cs[0]);for(let i=0;i<cs.length;i++){const u=await Pm;if(my!=spk)return;if(i+1<cs.length)Pm=synth(e,cs[i+1]);await play(u);if(my!=spk)return}return}catch(x){toast(e+': '+x.message)}}
if(my==spk){const u=new SpeechSynthesisUtterance(text);u.lang='bn-BD';speechSynthesis.speak(u)}}
/* settings */
const SEC=[
['profile','user','Profile|প্রোফাইল',[['name','text','Your name|আপনার নাম']]],
['prov','bolt','Models & providers|মডেল ও প্রোভাইডার'],
['cap','gear','Capabilities|সক্ষমতা',[['web','sw','Web search (Anthropic, OpenRouter)|ওয়েব সার্চ'],['stream','sw','Live streaming|লাইভ স্ট্রিমিং'],['art','sw','File cards|ফাইল কার্ড'],['sum','sw','Progress summary|কাজের সারাংশ'],['max','num','Max output tokens|সর্বোচ্চ আউটপুট'],['sys','area','Custom instructions|নিজস্ব নির্দেশনা']]],
['live','globe','Live data|লাইভ তথ্য',[['ltime','sw','Date and time|তারিখ ও সময়'],['lw','text','Weather city (Open-Meteo, free)|আবহাওয়ার শহর'],['ltk','pw','Tavily API key (web search for any model)|Tavily কী']]],
['mem','brain','Memory|মেমরি',[['mem','area','Long-term notes|দীর্ঘমেয়াদি নোট'],['auto','sw','AI may save notes|AI নোট সেভ করবে'],['ctx','num','Compact chat after N characters|কত অক্ষর পর সংক্ষেপ']]],
['voice','voice','Voice|ভয়েস',[['tts.eng','sel','Engine|ইঞ্জিন',['auto','gemini','murf','openai','device']],['tts.gemK','pw','Gemini API key'],['tts.gemV','text','Gemini voice (Leda, Aoede, Kore)'],['tts.gemM','text','Gemini TTS model'],['tts.murfK','pw','Murf API key'],['tts.murfV','text','Murf voice ID'],['tts.murfS','text','Murf style'],['tts.murfM','text','Murf model'],['tts.murfL','text','Murf locale'],['tts.murfU','text','Murf URL'],['tts.oaK','pw','OpenAI-compatible TTS key (Groq...)'],['tts.oaU','text','TTS URL'],['tts.oaM','text','TTS model'],['tts.oaV','text','TTS voice'],['_tts','btn','Test voice|ভয়েস টেস্ট']]],
['look','moon','Appearance|চেহারা',[['theme','sel','Color mode|রঙের মোড',['system','light','dark']],['font','sel','Font style|ফন্ট',['serif','sans','mono']],['hap','sw','Haptic feedback|হ্যাপটিক'],['wall','wall','Wallpaper|ওয়ালপেপার']]],
['lang','lang','Language|ভাষা',[['lang','sel','App and AI language: en / bn / mix|ভাষা: en / bn / mix',['en','bn','mix']]]],
['priv','shield','Privacy and data|গোপনীয়তা ও ডেটা',[['_exp','btn','Export chats|চ্যাট এক্সপোর্ট'],['_clr','btn','Delete all chats|সব চ্যাট মুছুন']]]];
let sp='';
const gp=(o,k)=>k.split('.').reduce((a,x)=>a&&a[x],o),sv=(o,k,v)=>{const a=k.split('.'),l=a.pop();let d=o;a.forEach(x=>d=d[x]=d[x]||{});d[l]=v};
const objOf=()=>/^p\d/.test(sp)?cfg.provs[+sp.slice(1)]:cfg;
const FLD=(k,ty,lb,op)=>{const v=gp(objOf(),k),a=`data-k="${k}"`,L=`<label>${t(lb)}</label>`,x=esc(v??'');
if(ty=='sw')return`<div class="rw"><span>${t(lb)}</span><label class="tg"><input type="checkbox" ${a} ${v?'checked':''}><i></i></label></div>`;
if(ty=='sel')return L+`<select ${a}>${op.map(z=>`<option ${z==v?'selected':''}>${z}</option>`).join('')}</select>`;
if(ty=='area')return L+`<textarea rows="4" ${a}>${x}</textarea>`;
if(ty=='btn')return`<button class="pri" data-b="${k}">${t(lb)}</button>`;
if(ty=='wall')return L+`<input type="file" accept="image/*" data-w="1"><button data-b="nowall" style="margin-top:8px">${t('Remove|সরান')}</button>`;
return L+`<input ${a} type="${ty=='pw'?'password':ty=='num'?'number':'text'}" value="${x}">`};
const hd=(ti,bk)=>`<div class="vh"><button class="ib" data-sb="${bk}">${ic(bk=='x'?'x':'back')}</button><b>${ti}</b><i style="width:40px"></i></div>`;
function openSet(p=''){sp=p;drawSet();sh('set',1)}
function drawSet(){let h;
if(sp=='')h=hd(t('Settings|সেটিংস'),'x')+SEC.map(s=>`<div class="rw" data-s="${s[0]}"><span class="ri">${ic(s[1])}${t(s[2])}</span>${ic('chev',16)}</div>`).join('');
else if(sp=='prov')h=hd(t('Models & providers|মডেল ও প্রোভাইডার'),'')+cfg.provs.map((p,i)=>`<div class="rw" data-s="p${i}"><span class="ri"><i class="dt ${p.key?'on':''}"></i>${esc(p.name)}${i==cfg.active?' (active)':''}</span>${ic('chev',16)}</div>`).join('')+`<button class="pri" data-s="add">${t('Add provider|প্রোভাইডার যোগ করুন')}</button>`;
else if(sp=='add')h=hd(t('Add provider|প্রোভাইডার যোগ করুন'),'prov')+PRE.map((x,i)=>`<div class="rw" data-add="${i}"><span>${x[0]}</span>${ic('plus',16)}</div>`).join('');
else if(/^p\d/.test(sp)){const p=objOf();h=hd(esc(p.name),'prov')+FLD('name','text','Name|নাম')+FLD('type','sel','Type|ধরন',['openai','anthropic'])+FLD('base','text','Base URL')+FLD('key','pw','API key|এপিআই কী')+FLD('model','text','Model|মডেল')+`<div class="row"><button data-b="fetch">${t('Fetch models|মডেল আনুন')}</button><button data-b="use">${t('Use this|এটা ব্যবহার করুন')}</button></div>`+(p.models||[]).slice(0,300).map(m=>`<div class="rw" data-m="${esc(m)}"><span>${esc(m)}</span>${bd(m,p)}</div>`).join('')+`<button data-b="del" style="margin-top:14px">${t('Delete provider|মুছুন')}</button>`}
else{const s=SEC.find(x=>x[0]==sp);h=hd(t(s[2]),'')+s[3].map(f=>FLD(...f)).join('')}
$('#setb').innerHTML=h}
$('#setb').addEventListener('input',e=>{const k=e.target.dataset.k;if(!k)return;sv(objOf(),k,e.target.type=='checkbox'?e.target.checked:e.target.type=='number'?+e.target.value:e.target.value);save();if(k=='theme'||k=='font')look();if(k=='lang'){drawSet();rend();lbl()}});
$('#setb').addEventListener('change',async e=>{if(e.target.dataset.w&&e.target.files[0]){cfg.wall=await shrink(e.target.files[0],1080,.7);wall()}});
$('#setb').onclick=async e=>{const g=s=>e.target.closest(s);let x;
if(x=g('[data-sb]')){const b=x.dataset.sb;if(b=='x')return sh('set',0);sp=b;drawSet();return}
if(x=g('[data-s]')){sp=x.dataset.s;drawSet();return}
if(x=g('[data-add]')){const r=PRE[+x.dataset.add];cfg.provs.push({name:r[0],type:r[1],base:r[2],key:'',model:'',models:[]});sp='p'+(cfg.provs.length-1);save();drawSet();return}
if(x=g('[data-m]')){objOf().model=x.dataset.m;save();drawSet();rend();return}
if(x=g('[data-b]')){const b=x.dataset.b;
if(b=='fetch')await fetchM(objOf());
if(b=='use'){cfg.active=+sp.slice(1);save();toast(t('Active|সক্রিয়'));rend()}
if(b=='del'&&cfg.provs.length>1){cfg.provs.splice(+sp.slice(1),1);cfg.active=0;sp='prov';save();drawSet();rend()}
if(b=='nowall'){cfg.wall='';wall()}
if(b=='_clr'&&confirm('?')){chats=[];newChat();save();rend()}
if(b=='_exp')dl('belal-box-chats.json',new Blob([JSON.stringify(chats)]));
if(b=='_tts')speakT('আমি বেলাল বক্স, আপনার এআই সহকারী।')}};
