import {renderGraph} from './graphs.mjs';
const curve=(fn,description)=>({kind:'curve',fn,description});
const polyline=(points,description,options={})=>({kind:'polyline',points,description,...options});
const steps=(direction,shift,closedLeft=true)=>({kind:'steps',direction,shift,closedLeft,description:`Unit steps of ${direction===1?'increasing':'decreasing'} height with vertical shift ${shift}; ${closedLeft?'filled left and open right':'open left and filled right'} endpoints.`});
const group=choices=>({bounds:[-6,6],choices:choices.map(c=>Array.isArray(c)?c:[c])});
const parabola=(a,h,k)=>curve(x=>a*(x-h)**2+k,`Parabola with vertex (${h}, ${k}), ${a>0?'opening upward':'opening downward'}, coefficient ${a}.`);
const absolute=(a,h,k)=>curve(x=>a*Math.abs(x-h)+k,`V-shaped graph with vertex (${h}, ${k}), ${a>0?'opening upward':'opening downward'}, branch slope magnitude ${Math.abs(a)}.`);
const line=(m,b)=>curve(x=>m*x+b,`Line with slope ${m} and y-intercept ${b}.`);
const cubic=(a,b,c=0)=>curve(x=>a*x**3+b*x+c,`Cubic y = ${a}x³ ${b<0?'−':'+'} ${Math.abs(b)}x ${c<0?'−':'+'} ${Math.abs(c)}.`);
const joined=(left,right,k)=>curve(x=>(x<0?left:right)*x+k,`Two lines meeting at (0, ${k}), with slope ${left} to the left and ${right} to the right.`);
export const functionGraphSpecs={
 '2-2-q3':group([parabola(1,1,-2),parabola(-1,0,-2),parabola(1,0,2),parabola(1,0,-2)]),
 '2-3-q3':group([cubic(.5,-1.5),cubic(-.5,1.5),cubic(.5,-1.5,2),cubic(.5,1.5)]),
 '2-4-q1':group([absolute(1,2,0),absolute(-1,0,-2),absolute(2,0,-2),absolute(1,0,-2)]),
 '2-4-q2':group([joined(1,-2,2),joined(-1,-2,2),joined(1,2,2),joined(1,-2,-2)]),
 '2-4-q3':group([cubic(-.25,1),cubic(.25,-1),cubic(.25,-2.25),parabola(1,0,-4)]),
 '2-4-q4':group([
  polyline([[-4,2],[-2,-2],[1,1],[4,-2]],'Line segments through (-4,2), (-2,-2), (1,1), (4,-2); both endpoints filled.',{endpoints:'closed'}),
  polyline([[-4,-2],[-2,2],[1,1],[4,2]],'Line segments through (-4,-2), (-2,2), (1,1), (4,2); both endpoints filled.',{endpoints:'closed'}),
  polyline([[-4,-2],[-2,2],[1,-1],[4,2]],'Line segments through (-4,-2), (-2,2), (1,-1), (4,2); both endpoints filled.',{endpoints:'closed'}),
  polyline([[-4,-2],[-2,2],[1,-1],[4,2]],'Line segments through (-4,-2), (-2,2), (1,-1), (4,2); both endpoints open.',{endpoints:'open'})]),
 '2-4-q5':group([
  polyline([[-6,7],[-3,1],[-1,3],[0,0],[1,3],[3,1],[6,7]],'Continuous piecewise linear graph with y-axis symmetry; outer rays point upward on both sides.'),
  polyline([[-6,-7],[-3,-1],[-1,-2],[0,0],[1,2],[3,1],[6,7]],'Origin-symmetric piecewise linear graph through (1,2), (3,1), (-1,-2), (-3,-1); outer slopes 2.'),
  polyline([[-6,2],[-3,-1],[-1,-3],[0,0],[1,3],[3,1],[6,-2]],'Origin-symmetric piecewise linear graph through (1,3), (3,1), (-1,-3), (-3,-1); outer slopes -1.'),
  polyline([[-6,-7],[-3,-1],[-1,-3],[0,0],[1,3],[3,1],[6,7]],'Origin-symmetric piecewise linear graph through (1,3), (3,1), (-1,-3), (-3,-1); outer slopes 2.')]),
 '2-5-q2':group([steps(1,1,false),steps(1,1),steps(1,-1),steps(-1,1)]),
 '2-5-q4':group([absolute(-1,-1,3),absolute(1,1,3),absolute(-2,1,3),absolute(-1,1,3)]),
 '2-6-q2':group([parabola(-.5,2,3),parabola(.5,-2,3),parabola(-.5,-2,3),parabola(-2,-2,3)]),
 '2-6-q4':group([absolute(2,2,-3),absolute(2,-2,-3),absolute(.5,2,-3),absolute(-2,2,-3)]),
 '2-7-q1':group([[parabola(1,0,0),line(0,2)],[parabola(-1,0,0),line(0,4)],[parabola(1,0,0),line(0,4)],[parabola(1,1,0),line(0,4)]]),
 '2-7-q3':group([[absolute(1,0,0),line(.5,1)],[absolute(1,0,0),line(-.5,1)],[absolute(1,0,0),line(.5,-1)],[absolute(1,1,0),line(.5,1)]])
};
export const describeFunctionGraph=shapes=>shapes.map(s=>s.description).join(' ');
export function renderFunctionGraph(spec,index){
 const [lo,hi]=spec.bounds,size=304,left=42,top=20;
 const X=x=>left+(x-lo)/(hi-lo)*size,Y=y=>top+(hi-y)/(hi-lo)*size,n=v=>Number(v.toFixed(3));
 const coord=([x,y])=>`${n(X(x))},${n(Y(y))}`;
 const marker=(x,y,closed,color)=>`<circle cx="${n(X(x))}" cy="${n(Y(y))}" r="3.4" fill="${closed?color:'white'}" stroke="${color}" stroke-width="1.8"/>`;
 const colors=['#245bc3','#bd6424'];
 const paths=spec.choices[index].map((s,i)=>{
  const color=colors[i%colors.length];let path='';
  if(s.kind==='curve'){
   const pts=Array.from({length:601},(_,j)=>{const x=lo+(hi-lo)*j/600;return [x,s.fn(x)];});
   path=`<polyline points="${pts.map(coord).join(' ')}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
  }else if(s.kind==='polyline'){
   path=`<polyline points="${s.points.map(coord).join(' ')}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
   if(s.endpoints)for(const p of [s.points[0],s.points.at(-1)])path+=marker(...p,s.endpoints==='closed',color);
  }else if(s.kind==='steps'){
   for(let x=lo;x<hi;x++){const y=s.direction*x+s.shift;if(y<lo||y>hi)continue;
    path+=`<path d="M${coord([x,y])} L${coord([x+1,y])}" stroke="${color}" stroke-width="2.2"/>`+marker(x,y,s.closedLeft,color)+marker(x+1,y,!s.closedLeft,color);
   }
  }
  return path;
 }).join('');
 // Reuse the Chapter 1 coordinate frame, grid, scale and label typography.
 let svg=renderGraph({bounds:spec.bounds,choices:[[]]},0).replace(/<polygon[^>]*\/>/g,'');
 const layers=`<defs><clipPath id="plot"><rect x="${left}" y="${top}" width="${size}" height="${size}"/></clipPath></defs><g clip-path="url(#plot)">${paths}</g>`;
 return svg.replace('<g fill="#435b76"',layers+'<g fill="#435b76"');
}
// One portable A/B/C/D image guarantees 2 × 2 layout in Markdown readers.
export function fourGraphSheet(svgs){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 832" width="780" height="832"><rect width="780" height="832" fill="white"/>${svgs.map((s,i)=>{const x=(i%2)*390,y=Math.floor(i/2)*416;const inner=s.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replaceAll('id="plot"',`id="plot-${i}"`).replaceAll('url(#plot)',`url(#plot-${i})`);return `<g transform="translate(${x} ${y})"><text x="20" y="26" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#172c42">${'ABCD'[i]}</text><g transform="translate(10 36)">${inner}</g></g>`;}).join('')}</svg>`;
}
