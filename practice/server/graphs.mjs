// Mathematical equivalents of the supplied A–D graph panels. Each plot uses
// the same vector frame, grid, typography, boundary weight, and shading.
const h=(a,b,c,op='<=')=>({a,b,c,op});
const y=(m,b,op)=>h(-m,1,b,op);
const quadrant=(x='>=',yy='>=')=>[h(1,0,0,x),h(0,1,0,yy)];
const group=(bounds,choices)=>({bounds,choices});
export const graphSpecs={
 '1-5-q1':group([-8,8],[[y(2,-3,'>')],[y(2,-3,'<')],[y(2,-3,'>=')],[y(-2,-3,'>')]]),
 '1-5-q2':group([-6,10],[[y(-1.5,6,'>=')],[y(-1.5,6,'<=')],[y(-1.5,6,'<')],[y(1.5,6,'<=')]]),
 '1-5-q3':group([-6,8],[[y(.5,2,'<')],[y(.5,2,'>=')],[y(.5,2,'>')],[y(-.5,2,'>')]]),
 '1-5-q4':group([-7,7],[[y(.4,-2,'<')],[y(.4,-2,'>=')],[y(.4,2,'>')],[y(.4,-2,'>')]]),
 '1-5-q5':group([-8,8],[[y(1.2,-4.8,'>=')],[y(1.2,-4.8,'<=')],[y(1.2,-4.8,'<')],[y(-1.2,4.8,'<=')]]),
 '1-7-q1':group([-3,8],[[y(1,0,'<='),y(0,5,'<=')],[y(1,0,'>='),y(0,5,'>=')],[y(1,0,'>='),y(0,5,'<=')],[y(1,0,'<='),y(0,5,'>=')]]),
 '1-7-q2':group([-2,10],[[...quadrant(),h(1,1,8)],[...quadrant(),h(1,1,8,'>=')],[...quadrant('<=','>='),h(1,1,8)],[...quadrant('>=','<='),h(1,1,8)]]),
 '1-7-q3':group([-1,7],[[h(1,1,6),y(2,0,'>='),y(0,1,'>=')],[h(1,1,6,'>='),y(2,0,'<='),y(0,1,'>=')],[h(1,1,6),y(2,0,'<='),y(0,1,'<=')],[h(1,1,6),y(2,0,'<='),y(0,1,'>=')]]),
 '1-7-q4':group([-1,7],[[...quadrant(),h(2,1,10,'>='),h(1,2,8)],[...quadrant(),h(2,1,10),h(1,2,8)],[...quadrant(),h(2,1,10),h(1,2,8,'>=')],[...quadrant('>=','<='),h(2,1,10),h(1,2,8)]]),
 '1-7-q5':group([-1,9],[[...quadrant(),h(1,1,8),h(2,1,6),h(1,2,6,'>=')],[...quadrant(),h(1,1,8,'>='),h(2,1,6,'>='),h(1,2,6,'>=')],[...quadrant(),h(1,1,8),h(2,1,6,'>='),h(1,2,6,'>=')],[...quadrant(),h(1,1,8),h(2,1,6,'>='),h(1,2,6)]]),
 '1-8-q1':group([-2,8],[[...quadrant(),h(1,1,6,'>=')],[...quadrant('<=','>='),h(1,1,6)],[...quadrant('>=','<='),h(1,1,6)],[...quadrant(),h(1,1,6)]])
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function contains(constraints,x,y){return constraints.every(c=>{const v=c.a*x+c.b*y-c.c;return c.op==='<'?v<0:c.op==='>'?v>0:c.op==='<='?v<=1e-9:v>=-1e-9;});}
export function feasiblePolygon(constraints,bounds){
 const [lo,hi]=bounds;let polygon=[[lo,lo],[hi,lo],[hi,hi],[lo,hi]];
 for(const c of constraints){const side=c.op.startsWith('<')?1:-1;const value=p=>side*(c.a*p[0]+c.b*p[1]-c.c);const clipped=[];
  for(let i=0;i<polygon.length;i++){const p=polygon[i],q=polygon[(i+1)%polygon.length],vp=value(p),vq=value(q);if(vp<=1e-10)clipped.push(p);if((vp<=0)!==(vq<=0)){const t=vp/(vp-vq);clipped.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}}
  polygon=clipped;
 }return polygon;
}
export function renderGraph(spec,index){
 const constraints=spec.choices[index],[lo,hi]=spec.bounds,size=304,left=42,top=20;
 const X=x=>left+(x-lo)/(hi-lo)*size,Y=y=>top+(hi-y)/(hi-lo)*size;
 const n=v=>Number(v.toFixed(3));const coordinate=p=>`${n(X(p[0]))},${n(Y(p[1]))}`;
 const tick=hi-lo>12?2:1;let grid='',labels='';
 for(let t=Math.ceil(lo/tick)*tick;t<=hi;t+=tick){grid+=`<path d="M${n(X(t))} ${top}v${size} M${left} ${n(Y(t))}h${size}"/>`;if(t!==0){labels+=`<text x="${n(X(t))}" y="${n(Y(0)+17)}" text-anchor="middle">${t}</text><text x="${n(X(0)-8)}" y="${n(Y(t)+4)}" text-anchor="end">${t}</text>`;}}
 const colors=['#245bc3','#bd6424','#44816a','#8350a5','#9e4962'];
 const lines=constraints.map((c,i)=>{const points=[];
  if(c.b!==0)for(const x of [lo,hi]){const yy=(c.c-c.a*x)/c.b;if(yy>=lo-1e-8&&yy<=hi+1e-8)points.push([x,yy]);}
  if(c.a!==0)for(const yy of [lo,hi]){const x=(c.c-c.b*yy)/c.a;if(x>=lo-1e-8&&x<=hi+1e-8&&!points.some(p=>Math.hypot(p[0]-x,p[1]-yy)<1e-8))points.push([x,yy]);}
  if(points.length<2)return '';return `<line x1="${n(X(points[0][0]))}" y1="${n(Y(points[0][1]))}" x2="${n(X(points[1][0]))}" y2="${n(Y(points[1][1]))}" stroke="${colors[i%colors.length]}" stroke-width="2.2" ${c.op.length===1?'stroke-dasharray="7 5"':''}/>`;
 }).join('');
 const polygon=feasiblePolygon(constraints,spec.bounds);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 370" width="370" height="370"><rect width="370" height="370" fill="white"/><g stroke="#e3e8f0" stroke-width="1">${grid}</g>${polygon.length?`<polygon points="${polygon.map(coordinate).join(' ')}" fill="#9ebce7" fill-opacity=".43"/>`:''}<rect x="${left}" y="${top}" width="${size}" height="${size}" stroke="#b0bfd2" fill="none"/><path d="M${left} ${n(Y(0))}h${size} M${n(X(0))} ${top}v${size}" stroke="#73869c" stroke-width="1.2"/>${lines}<g fill="#435b76" font-family="Arial,sans-serif" font-size="11">${labels}<text x="${n(X(0)-8)}" y="${n(Y(0)+17)}" text-anchor="end">0</text><text x="357" y="${n(Y(0)+4)}" font-size="14">x</text><text x="${n(X(0)+7)}" y="12" font-size="14">y</text></g></svg>`;
}
export function graphDescription(constraints){return constraints.map(c=>`${c.op.length===1?'Dashed':'Solid'} boundary ${c.a}x + ${c.b}y = ${c.c}; shaded where ${c.a}x + ${c.b}y ${c.op} ${c.c}`).join('. ');}
