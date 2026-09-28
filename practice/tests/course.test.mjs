import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {lessons,units} from '../content/lessons.mjs';
import {courseUnits} from '../../src/course.mjs';
import {getPage} from '../../src/book.mjs';
import {grade,numberValue} from '../server/grading.mjs';
import {initialState,selectQuestion,seededRandom} from '../server/engine.mjs';
import {courseGraphSpecs,curveValue,renderCourseGraph} from '../server/course-graphs.mjs';
const bank=JSON.parse(readFileSync(new URL('../content/questions.json',import.meta.url))),get=id=>bank.find(q=>q.questionId===id);
const same=(a,b)=>Number.isNaN(a)&&Number.isNaN(b)||Math.abs(a-b)<1e-7*Math.max(1,Math.abs(b));
const quadr=(a,b,c)=>{if(Math.abs(a)<1e-10)return Math.abs(b)<1e-10?[]:[-c/b];const d=b*b-4*a*c;if(d< -1e-8)return [];if(Math.abs(d)<1e-8)return [-b/(2*a)];return [(-b-Math.sqrt(d))/(2*a),(-b+Math.sqrt(d))/(2*a)];};
const distinct=arr=>arr.filter((v,i)=>arr.findIndex(w=>same(v,w))===i);
const verifyNumbers=(id,expected)=>{const q=get(id),f=q.fields.filter(f=>f.type==='number');assert.equal(f.length,expected.length,id);f.forEach((f,i)=>assert.ok(same(numberValue(f.value),expected[i]),`${id} ${f.key}: ${f.value} vs ${expected[i]}`));};
test('all source units, numbered lessons, and direct pages are represented',()=>{
 const counts=[9,7,7,9,6,10,6,7,6,5],pages=[80,64,78,86,58,94,64,62,62,46],starts=[4,84,148,226,312,370,464,528,590,652];
 assert.equal(lessons.length,72);assert.equal(bank.filter(q=>q.active!==false).length,360);
 for(let u=1;u<=10;u++){assert.equal(lessons.filter(l=>l.chapter===u).length,counts[u-1]);assert.equal(courseUnits[u-1].pages,pages[u-1]);for(let p=1;p<=pages[u-1];p++){const data=getPage(u,p);assert.equal(data.printed,starts[u-1]+p-1);assert.ok(existsSync(new URL(`../../dist/pages/chapter${u}-p${p}.html`,import.meta.url)));assert.ok(existsSync(new URL('../../dist'+data.asset,import.meta.url)));}}
 for(const l of lessons){assert.ok(l.explanation.length>200,l.id);assert.ok(l.rule.length>25,l.id);assert.equal(l.examples.length,2,l.id);assert.ok(l.examples.every(e=>e.work.length>10&&e.work.length+e.explanation.length>55),l.id);assert.ok(l.mistakes.length>=3);assert.deepEqual(bank.filter(q=>q.active!==false&&q.lessonId===l.id).map(q=>q.difficulty),[1,2,3,4,5]);assert.ok(getPage(l.chapter,l.ebookPage));}
});
test('original questions, grading, learning and persistence implementation are unchanged',()=>{
 const baseline=JSON.parse(readFileSync(new URL('./fixtures/course-baseline.json',import.meta.url)));
 for(const [path,hash] of Object.entries(baseline.hashes))assert.equal(createHash('sha256').update(readFileSync(new URL('../../'+path,import.meta.url))).digest('hex'),hash,path);
 for(const q of baseline.questions)assert.deepEqual(get(q.questionId),q,q.questionId);
});
test('Unit 10 and lesson 6-10 respect exact scope even with extreme outside weights',()=>{
 const state=initialState(bank),rng=seededRandom('ten-unit-boundaries');for(const q of bank)state.weights.questions[q.questionId]={power:q.lessonId==='10-5'?-999:999};
 for(const lessonId of ['10-5','6-10','8-6'])for(const answerMode of ['mc','written','both']){const scope={selectedCourseIds:['chapter-'+lessonId.split('-')[0]],selectedLessonIds:[lessonId],difficultyMode:'custom',selectedDifficulties:[3,5],answerMode};for(let i=0;i<200;i++){const q=selectQuestion(bank,state,scope,rng).question;assert.equal(q.lessonId,lessonId);assert.ok([3,5].includes(q.difficulty));if(answerMode==='written')assert.ok(!q.isGraph);}}
});
const samples=[-4.1,-3,-2,-1,-.25,0,.3,1,1.5,2,2.8,3,4,5,6,8];
const curvesMatch=(cs,functions)=>cs.length===functions.length&&cs.every((c,i)=>samples.every(x=>same(curveValue(c,x),functions[i](x))));
test('every new graph key satisfies the independent mathematical target uniquely',()=>{
 const fns={
 '3-1-q1':[x=>(x-2)**2-3], '3-2-q2':[x=>x*x-4,x=>x+2],
 '4-4-q1':[x=>-x*x*x+3*x], '4-5-q2':[x=>(x+2)**2*(x-1)**3/4],
 '5-4-q1':[x=>x<2?NaN:Math.sqrt(x-2)+1], '5-4-q4':[x=>x< -1?NaN:-2*Math.sqrt(x+1)+3], '5-5-q1':[x=>Math.cbrt(x)+1],
 '6-1-q1':[x=>2**x], '6-1-q4':[x=>-(2**(x-1))+3], '6-4-q1':[x=>x<=0?NaN:Math.log2(x)],
 '7-3-q1':[x=>x===2?NaN:1/(x-2)+1], '7-3-q4':[x=>x===3?NaN:12/(x-3)-2],
 '8-6-q3':[x=>Math.exp(-((x-2)**2)/2)/Math.sqrt(2*Math.PI)],
 '9-5-q1':[Math.sin], '9-5-q4':[x=>Math.abs(Math.cos(x))<1e-10?NaN:1/Math.cos(x)], '9-6-q3':[x=>1-2*Math.cos(x)]
 };
 const oracles=Object.fromEntries(Object.entries(fns).map(([id,fn])=>[id,c=>curvesMatch(c.curves,fn)]));
 oracles['3-7-q3']=c=>c.shade?.side==='above'&&!c.curves[0].dashed&&curvesMatch(c.curves,[x=>x*x-4*x+1]);
 oracles['7-4-q3']=c=>curvesMatch(c.curves,[x=>x+1])&&JSON.stringify(c.curves[0].holes)==='[[1,2]]';
 oracles['8-4-q3']=c=>{const v=c.curves[0].values,n=v.reduce((a,b)=>a+b,0),m=v.reduce((a,b,i)=>a+b*i,0)/n;return v.reduce((a,b,i)=>a+b*(i-m)**3,0)/n>1;};
 assert.equal(Object.keys(oracles).length,Object.keys(courseGraphSpecs).length);
 for(const [id,oracle] of Object.entries(oracles)){const spec=courseGraphSpecs[id];assert.equal(spec.choices.length,4,id);assert.deepEqual(spec.choices.flatMap((c,i)=>oracle(c)?['ABCD'[i]]:[]),[get(id).correctChoice],id);const svgs=spec.choices.map((_,i)=>renderCourseGraph(spec,i));assert.equal(new Set(svgs).size,4,id);for(const s of svgs){assert.match(s,/viewBox="0 0 370 370"/);assert.ok(!/NaN|Infinity/.test(s),id);}}
});
test('quadratic, radical, logarithmic, and rational parameter boundaries are sharp',()=>{
 for(let i=-100;i<=150;i++){
  const k=i/20;
  const min31=k<=0?k+2:-k*k+k+2;assert.equal(min31>=-1e-9,k>=-2&&k<=2);
  const roots325=k<0?[]:distinct([...quadr(1,0,-4-k),...quadr(1,0,-4+k)]);assert.equal(roots325.length===3,k===4);
  const roots365=quadr(1,-k-2,2*k+1);assert.equal(roots365.length===2&&roots365.every(x=>x>0),(k>-.5&&k<0)||k>4);
  const min375=Math.min(k+6,10-3*k,...(k>=0&&k<=2?[6+k-k*k]:[]));assert.equal(min375>1e-9,k> -6&&k<10/3);
  const t565=quadr(1,-1,k-4).filter(t=>t>=-1e-9);assert.equal(t565.length===1,k<4||k===17/4);
  const t625=k<0?[]:distinct([...quadr(1,-5,4-k),...quadr(1,-5,4+k)]).filter(t=>t>1e-8);assert.equal(t625.length===3,k===9/4);
  const roots725=quadr(2-k,-4,k).filter(x=>![1,-1,2].some(e=>same(e,x)));assert.equal(roots725.length===1,k===0||k===2);
  const roots765=quadr(1,0,-k-1).filter(x=>!same(x,1));assert.equal(roots765.length===1,k===-1||k===0);
  const values=distinct([1,k-1]);const count=values.reduce((n,v)=>n+(v< -1||v>1?0:Math.abs(v)===1?1:2),0);assert.equal(count===3,k>0&&k<2);
 }
});
test('independent optimization, geometry, data, and multiple-angle calculations match harder answer fields',()=>{
 let best=-Infinity,arg=[];for(let n=0;n<=15;n++){const revenue=(24+3*n)*(120-8*n);if(revenue>best){best=revenue;arg=[n]}else if(revenue===best)arg.push(n)}assert.deepEqual(arg,[3,4]);verifyNumbers('3-1-q4',[best]);
 verifyNumbers('3-3-q5',[3*3+3*3,6/2,Math.sqrt(13-(3-1)**2)]);
 verifyNumbers('3-5-q5',[4*4+(-3)**2-6*4+8*(-3)+30,4,-3]);
 const p4=x=>-6*(x+2)*(x-1)**2*(x-3);verifyNumbers('4-4-q5',[4,-6,p4(2)]);
 const generated=[];for(let m=2;m<20;m++)for(let n=1;n<m;n++)if(2*m*(m+n)===84)generated.push([m,n,m*m+n*n]);assert.equal(generated.length,1);verifyNumbers('4-7-q5',generated[0]);
 const cubic=x=>x+1+(x-1)*(x-2)*(x-3);verifyNumbers('4-8-q5',[cubic(0),cubic(4)]);
 const poly=x=>(x*x-2)*(x*x-2*x+2)*(x-3)**2;verifyNumbers('4-9-q5',[6,poly(0),poly(1)]);
 verifyNumbers('5-4-q5',[10-6*6/2,(10+(10-6*6/2))/2]);
 for(const x of [-5*Math.sqrt(2),5*Math.sqrt(2)])assert.ok(same(Math.cbrt(x+7)-Math.cbrt(x-7),2));verifyNumbers('5-5-q5',[5,2]);
 const r=(12*12-48)/(12*12+48);verifyNumbers('6-3-q5',[12*(1-r),r]);
 const n=Array.from({length:1000},(_,i)=>i+1).find(n=>2n**BigInt(n)>=10n**99n);verifyNumbers('6-7-q5',[n]);
 const crossing=Math.log(100/80)/(.06-.04);verifyNumbers('6-8-q5',[1/(.06-.04),100*Math.exp(.04*crossing)]);
 verifyNumbers('6-10-q5',[900/100-1,Math.log(16)/Math.log(2)]);
 for(const a of [1,2,3]){const outputs=Array.from({length:41},(_,i)=>(i-20)/10);const all=outputs.every(y=>quadr(y-1,-a,-y-1).some(x=>!same(Math.abs(x),1)));assert.equal(all,a===3);}
 verifyNumbers('7-5-q5',[Math.log2(48/12),Math.log(12/4)/Math.log(3),3**2*.5]);
 verifyNumbers('8-1-q5',[(600*.9+400*.2)/1000,110/1000,(110+800)/1000]);
 verifyNumbers('8-2-q5',[1*3/5+2*(2/5*3/4)+3*(2/5*1/4),1/(1-2/5)]);
 verifyNumbers('8-3-q5',[5000/2,5000/2,200/Math.sqrt(2500)]);
 const data=[8,8,12,12,18,18,22,22],mean=data.reduce((s,x)=>s+x,0)/data.length;verifyNumbers('8-4-q5',[mean,data.reduce((s,x)=>s+(x-mean)**2,0)/data.length]);
 verifyNumbers('8-5-q5',[(90+1)/(100+10),(19+40)/(20+100)]);
 const sd=(70-40)/(2-(-1)),mu=40+sd;verifyNumbers('8-6-q5',[mu,sd,.8413-.1587]);
 verifyNumbers('8-7-q5',[.01*.9/(.01*.9+.99*.05)]);
 const nearDistance=20/(Math.sqrt(3)-1),height=nearDistance*Math.sqrt(3);assert.ok(same(height,30+10*Math.sqrt(3)));verifyNumbers('9-1-q5',[30,10]);
 verifyNumbers('9-2-q5',[25,5,(20-2*5)/5]);
 const prod=(.5**2-1)/2;verifyNumbers('9-3-q5',[prod,4*(1-2*prod),2]);
 verifyNumbers('9-4-q5',[(2*Math.PI-Math.PI/2)/(Math.PI/4-Math.PI/6)]);
 verifyNumbers('9-5-q5',[(9-1)/2,(9-1)/2]);
 const frequencies=[];for(let n=0;n<10;n++){const b=1.5+6*n;if(Math.ceil(b)-1===7)frequencies.push(b)}assert.deepEqual(frequencies,[7.5]);verifyNumbers('9-6-q5',[(5-(-1))/2,frequencies[0],(5+(-1))/2]);
 verifyNumbers('10-1-q5',[2/5,1-2*(2/5)**2]);
 const A=Math.sqrt(54/6);verifyNumbers('10-2-q5',[A,A,2*A]);
 const sum=Math.atan(.5)+Math.atan(1/3);verifyNumbers('10-3-q5',[sum*180/Math.PI,Math.cos(2*sum)]);
 const theta=2*Math.PI-Math.acos(-7/25);verifyNumbers('10-4-q5',[Math.tan(theta/4)]);
});
