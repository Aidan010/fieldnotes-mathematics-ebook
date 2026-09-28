import {units} from '../content/lessons.mjs';
export const courseGraphSpecs=Object.assign({},...units.map(u=>u.graphs));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function curveValue(c,x){
 switch(c.kind){
 case 'polynomial':return c.coeff.reduce((v,a)=>v*x+a,0);
 case 'factored':return c.a*c.roots.reduce((v,[r,n])=>v*(x-r)**n,1);
 case 'root':return c.a*(c.degree===2?(x<c.h?NaN:Math.sqrt(x-c.h)):Math.cbrt(x-c.h))+c.k;
 case 'exponential':return c.a*c.b**(x-c.h)+c.k;
 case 'log':return x>c.h?c.a*Math.log(x-c.h)/Math.log(c.b)+c.k:NaN;
 case 'reciprocal':return x===c.h?NaN:c.a/(x-c.h)+c.k;
 case 'normal':return Math.exp(-.5*((x-c.mu)/c.sigma)**2)/(c.sigma*Math.sqrt(2*Math.PI));
 case 'trig':{const t=c.b*(x-c.h),sin=Math.sin(t),cos=Math.cos(t);const v=c.fn==='sin'?sin:c.fn==='cos'?cos:c.fn==='tan'?(Math.abs(cos)<1e-10?NaN:sin/cos):c.fn==='sec'?(Math.abs(cos)<1e-10?NaN:1/cos):(Math.abs(sin)<1e-10?NaN:1/sin);return c.a*v+c.k;}
 default:throw new Error('Unknown graph model '+c.kind);
 }
}
function poles(c,lo,hi){
 if(['log','reciprocal'].includes(c.kind))return [c.h].filter(x=>x>=lo&&x<=hi);
 if(c.kind==='trig'&&['tan','sec','csc'].includes(c.fn)){
  const offset=c.fn==='csc'?0:Math.PI/2,values=[];
  for(let n=-100;n<=100;n++){const x=c.h+(offset+n*Math.PI)/c.b;if(x>=lo&&x<=hi)values.push(x);}return values.sort((a,b)=>a-b);
 }return [];
}
const fmt=n=>Math.abs(n)<1e-9?'0':String(Number(n.toFixed(3)));
function niceStep(span){const raw=span/8,base=10**Math.floor(Math.log10(raw)),r=raw/base;return (r<=1?1:r<=2?2:r<=5?5:10)*base;}
export function describeCourseGraph(choice){return choice.curves.map(c=>{
 if(c.kind==='bars')return `Histogram with consecutive bin frequencies ${c.values.join(', ')}`;
 if(c.kind==='polynomial')return `Polynomial with coefficients ${c.coeff.join(', ')}${c.holes?.length?`, open holes at ${c.holes.map(p=>`(${p.join(', ')})`).join('; ')}`:''}`;
 if(c.kind==='factored')return `Polynomial with leading factor ${c.a} and roots ${c.roots.map(([r,n])=>`${r} of multiplicity ${n}`).join(', ')}`;
 if(c.kind==='root')return `${c.degree===2?'Square':'Cube'} root curve, ${c.degree===2?'endpoint':'center'} (${c.h}, ${c.k}), vertical multiplier ${c.a}`;
 if(c.kind==='exponential')return `Exponential curve: ${c.a} times ${c.b} to the power (x minus ${c.h}), plus ${c.k}`;
 if(c.kind==='log')return `Logarithmic curve, base ${c.b}, vertical asymptote x = ${c.h}, vertical shift ${c.k}`;
 if(c.kind==='reciprocal')return `Reciprocal curve ${c.a}/(x minus ${c.h}) plus ${c.k}; asymptotes x = ${c.h}, y = ${c.k}`;
 if(c.kind==='normal')return `Normal density centered at ${c.mu}, standard deviation ${c.sigma}`;
 if(c.kind==='trig')return `${c.fn} curve with multiplier ${c.a}, angular frequency ${fmt(c.b)}, horizontal shift ${fmt(c.h)} radians, vertical shift ${c.k}`;
 return c.kind;
 }).join('; ')+(choice.shade?`; shaded ${choice.shade.side} the ${choice.curves[0].dashed?'dashed':'solid'} boundary`:'');}
export function renderCourseGraph(spec,index){
 const [xmin,xmax,ymin,ymax]=spec.window,choice=spec.choices[index],left=42,top=20,size=304;
 const X=x=>left+(x-xmin)*size/(xmax-xmin),Y=y=>top+(ymax-y)*size/(ymax-ymin),coord=(x,y)=>`${X(x).toFixed(3)},${Y(y).toFixed(3)}`;
 const line=(x1,y1,x2,y2,attr='')=>`<line x1="${X(x1).toFixed(3)}" y1="${Y(y1).toFixed(3)}" x2="${X(x2).toFixed(3)}" y2="${Y(y2).toFixed(3)}" ${attr}/>`;
 let grid='',labels='',guides='',layers='';
 const sx=spec.xPi?Math.PI:niceStep(xmax-xmin),sy=niceStep(ymax-ymin);
 for(let x=Math.ceil(xmin/sx)*sx;x<=xmax+1e-8;x+=sx){grid+=line(x,ymin,x,ymax,'stroke="#e4eaf1"');const n=Math.round(x/Math.PI),label=spec.xPi?(n===0?'0':n===1?'π':n===-1?'−π':`${n}π`):fmt(x);labels+=`<text x="${X(x)}" y="344" text-anchor="middle">${label}</text>`;}
 for(let y=Math.ceil(ymin/sy)*sy;y<=ymax+1e-8;y+=sy){grid+=line(xmin,y,xmax,y,'stroke="#e4eaf1"');labels+=`<text x="35" y="${Y(y)+4}" text-anchor="end">${fmt(y)}</text>`;}
 if(ymin<=0&&ymax>=0)grid+=line(xmin,0,xmax,0,'stroke="#8294a8" stroke-width="1.2"');
 if(xmin<=0&&xmax>=0)grid+=line(0,ymin,0,ymax,'stroke="#8294a8" stroke-width="1.2"');
 if(choice.shade){const {curve,side}=choice.shade;const cap=side==='above'?ymax:ymin;const pts=Array.from({length:1001},(_,i)=>{const x=xmin+(xmax-xmin)*i/1000;return coord(x,Math.max(ymin,Math.min(ymax,curveValue(curve,x))));});layers+=`<polygon points="${coord(xmin,cap)} ${pts.join(' ')} ${coord(xmax,cap)}" fill="#d8e5fb"/>`;}
 for(const [i,c] of choice.curves.entries()){
  const color=c.color==='gray'?'#78899c':i%2?'#bd6424':'#245bc3';
  if(c.kind==='bars'){layers+=c.values.map((v,j)=>`<rect x="${X(j-.44)}" y="${Y(v)}" width="${size/(xmax-xmin)*.88}" height="${Y(0)-Y(v)}" fill="#b6ccee" stroke="#245bc3" stroke-width="1.4"/>`).join('');continue;}
  const ps=poles(c,xmin,xmax);
  for(const x of ps)guides+=line(x,ymin,x,ymax,'stroke="#98a7b9" stroke-width="1" stroke-dasharray="5 4"');
  if(['reciprocal','exponential'].includes(c.kind)&&c.k>=ymin&&c.k<=ymax)guides+=line(xmin,c.k,xmax,c.k,'stroke="#98a7b9" stroke-width="1" stroke-dasharray="5 4"');
  const bounds=[xmin,...ps.filter(x=>x>xmin&&x<xmax),xmax],eps=(xmax-xmin)*1e-7;
  for(let j=0;j<bounds.length-1;j++){
   const a=bounds[j]+(ps.includes(bounds[j])?eps:0),b=bounds[j+1]-(ps.includes(bounds[j+1])?eps:0);let pts=[];
   const flush=()=>{if(pts.length>1)layers+=`<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2.2" ${c.dashed?'stroke-dasharray="6 4"':''} stroke-linejoin="round"/>`;pts=[];};
   for(let n=0;n<=1600;n++){const x=a+(b-a)*n/1600,y=curveValue(c,x);if(Number.isFinite(y)&&Math.abs(y)<1e8)pts.push(coord(x,y));else flush();}flush();
  }
  if(c.kind==='root'&&c.degree===2)layers+=`<circle cx="${X(c.h)}" cy="${Y(c.k)}" r="3" fill="${color}"/>`;
  for(const [x,y] of c.holes??[])layers+=`<circle cx="${X(x)}" cy="${Y(y)}" r="4.2" fill="white" stroke="${color}" stroke-width="2"/>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="370" height="370" viewBox="0 0 370 370" role="img"><title>${esc(describeCourseGraph(choice))}</title><rect width="370" height="370" fill="white"/><defs><clipPath id="plot"><rect x="${left}" y="${top}" width="${size}" height="${size}"/></clipPath></defs><g clip-path="url(#plot)">${grid}${guides}${layers}</g><rect x="${left}" y="${top}" width="${size}" height="${size}" fill="none" stroke="#c1ccda"/><g fill="#435b76" font-family="Arial,sans-serif" font-size="11">${labels}<text x="352" y="344">x</text><text x="28" y="14">y</text></g></svg>`;
}
