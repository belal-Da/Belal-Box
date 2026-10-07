/* pure helpers: no DOM access (testable in node) */
const TD8=new TextDecoder();
function axml(u8){try{const dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength);if(u8.length<8||dv.getUint16(0,true)!=3)return null;let off=dv.getUint16(2,true),strs=[],out=[],d=0;
while(off+8<=u8.length){const ty=dv.getUint16(off,true),sz=dv.getUint32(off+4,true);if(!sz)break;
if(ty==1){const n=dv.getUint32(off+8,true),fl=dv.getUint32(off+16,true),so=dv.getUint32(off+20,true);for(let i=0;i<n;i++){let p=off+so+dv.getUint32(off+28+i*4,true);if(fl&256){let l=u8[p++];if(l&128)p++;let b=u8[p++];if(b&128)b=((b&127)<<8)|u8[p++];strs.push(TD8.decode(u8.subarray(p,p+b)))}else{let l=dv.getUint16(p,true);p+=2;if(l&32768){l=((l&32767)<<16)|dv.getUint16(p,true);p+=2}strs.push(new TextDecoder('utf-16le').decode(u8.subarray(p,p+l*2)))}}}
else if(ty==258){const nm=strs[dv.getInt32(off+20,true)],ac=dv.getUint16(off+28,true);let a='';for(let i=0;i<ac;i++){const b=off+36+i*20,an=strs[dv.getInt32(b+4,true)],dt=u8[b+15],dd=dv.getUint32(b+16,true),v=dt==3?strs[dv.getInt32(b+8,true)]:dt==16?(dd|0):dt==18?(dd?'true':'false'):dt==1?'@0x'+dd.toString(16):dt==4?dv.getFloat32(b+16,true):dt==17?'0x'+dd.toString(16):dd;a+=` ${an}="${v}"`}out.push(' '.repeat(d)+'<'+nm+a+'>');d++}
else if(ty==259){d=Math.max(0,d-1);out.push(' '.repeat(d)+'</'+strs[dv.getInt32(off+20,true)]+'>')}
off+=sz}
return out.join('\n')}catch(e){return null}}
function dexClasses(u8){try{const dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength),n=dv.getUint32(0x38,true),so=dv.getUint32(0x3C,true),cls=[];for(let i=0;i<n;i++){let p=dv.getUint32(so+i*4,true);while(u8[p]&128)p++;p++;let e=p;while(u8[e]&&e-p<300)e++;if(u8[p]==76&&u8[e-1]==59){const s=TD8.decode(u8.subarray(p,e));if(/^L[\w$\/]+;$/.test(s))cls.push(s.slice(1,-1))}}return cls}catch(e){return[]}}
const nz=s=>s.replace(/\r/g,'').split('\n').map(l=>l.replace(/[ \t]+$/,'')).join('\n');
function editApply(src,body){const re=/<<<<<<< SEARCH\n([\s\S]*?)\n?=======\n([\s\S]*?)\n?>>>>>>> REPLACE/g;let m,out=src,ok=0,bad=0,add=0,del=0;
while((m=re.exec(body))){const a=m[1],b=m[2];if(!a.trim()){out=out?out+'\n'+b:b;ok++;add+=b.split('\n').length;continue}
let i=out.indexOf(a);if(i>=0)out=out.slice(0,i)+b+out.slice(i+a.length);else{const o2=nz(out),a2=nz(a);i=o2.indexOf(a2);if(i<0){bad++;continue}out=o2.slice(0,i)+b+o2.slice(i+a2.length)}
ok++;add+=b?b.split('\n').length:0;del+=a.split('\n').length}
return{out,ok,bad,add,del}}
function fenceOpen(t){let o=0;for(const l of t.split('\n')){const m=/^(`{3,})(.*)$/.exec(l.trimStart());if(!m)continue;if(!o)o=m[1].length;else if(m[1].length>=o&&!m[2].trim())o=0}return o>0}
function dedupe(part,t){const k=Math.min(400,part.length,t.length);for(let j=k;j>=12;j--)if(part.endsWith(t.slice(0,j)))return t.slice(j);return t}
if(typeof module!='undefined')module.exports={axml,dexClasses,editApply,fenceOpen,dedupe};
