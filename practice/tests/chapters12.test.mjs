import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {grade,gradeQuestion,numberValue} from '../server/grading.mjs';
import {functionGraphSpecs,renderFunctionGraph} from '../server/function-graphs.mjs';
import {graphSpecs,contains} from '../server/graphs.mjs';
import {initialState,eligibleQuestions,selectQuestion,seededRandom,weight} from '../server/engine.mjs';
import {studentView} from '../../dist/practice/views.mjs';
import {lessons as fullLessons} from '../content/lessons.mjs';
const lessons=fullLessons.filter(l=>l.chapter<=2);
const bank=JSON.parse(readFileSync(new URL('../content/questions.json',import.meta.url))),active=bank.filter(q=>q.active!==false&&Number(q.lessonId.split('-')[0])<=2),get=id=>active.find(q=>q.questionId===id);
const near=(a,b)=>Math.abs(a-b)<1e-8;
// Independently solved values, separate from the content answer-key definitions.
const expected={
 '1-1-q1':[7],'1-1-q2':[5],'1-1-q3':[16],'1-1-q4':[10],
 '1-3-q1':[2],'1-3-q2':[-2],'1-3-q3':[-2],'1-3-q4':[-30],'1-3-q5':[15/7],
 '1-6-q1':[6,3],'1-6-q2':[55/17,37/17],'1-6-q4':[2],'1-6-q5':[18,24],
 '1-8-q2':[4,4,36],'1-8-q3':[3,2,26],'1-8-q4':[4,4,360],'1-8-q5':[4,5,73],
 '1-9-q1':[4,2,3],'1-9-q2':[1,2,3],'1-9-q3':[3,0,2],'1-9-q4':[2,1,3],'1-9-q5':[-1],
 '2-1-q1':[3*(-4)-2],'2-1-q2':[4-6],'2-1-q3':[(3*2-1-3)/2],'2-1-q4':[3+3],'2-1-q5':[5-2*1,1],
 '2-2-q2':[1+4*(1-7)/(1+2)],'2-2-q4':[2,-3],'2-2-q5':[1,-4,3],
 '2-3-q1':[-4,3],'2-3-q4':[-4,-1,5,2],'2-5-q1':[Math.floor(-1.2)],
 '2-6-q1':[-2+5],'2-6-q3':[(6+4)/2,3*5-1],'2-6-q5':[3,2,-4]
};
test('independent algebra results match all numeric answer fields',()=>{for(const [id,values]of Object.entries(expected)){const fields=get(id).fields.filter(f=>f.type==='number');assert.equal(fields.length,values.length,id);fields.forEach((f,i)=>assert.ok(near(numberValue(f.value),values[i]),`${id} ${f.key}`));}});
test('all 16 lessons have five levels, both chapters, valid textbook links, and 2 × 2 graph sheets',()=>{
 assert.equal(lessons.length,16);assert.equal(active.length,80);assert.equal(active.filter(q=>q.courseId==='chapter-1').length,45);assert.equal(active.filter(q=>q.courseId==='chapter-2').length,35);
 for(const l of lessons){assert.deepEqual(active.filter(q=>q.lessonId===l.id).map(q=>q.difficulty),[1,2,3,4,5]);assert.ok(existsSync(new URL(`../../dist/pages/chapter${l.chapter}-p${l.ebookPage}.html`,import.meta.url)));}
 for(const q of active){assert.match(q.explanation,/#### Work/);assert.match(q.explanation,/#### Explanation/);if(q.isGraph){assert.equal(q.fields.length,0);assert.ok(existsSync(new URL(`../../dist/practice/graphs/${q.questionId}-choices.svg`,import.meta.url)));}else assert.deepEqual(q.supportedMethods,['mc','written']);}
 assert.equal(active.filter(q=>q.isGraph).length,24);assert.equal(active.filter(q=>!q.isGraph).length,56);
});
test('new course never escapes selected course, lessons, difficulty or answer method',()=>{
 const state=initialState(bank),rng=seededRandom('actual-two-chapters');for(const q of active)state.weights.questions[q.questionId]={power:q.courseId==='chapter-1'?5000:-1000};
 for(const answerMode of ['mc','written','both']){
  const scope={selectedCourseIds:['chapter-2'],selectedLessonIds:['2-3','2-4'],difficultyMode:'custom',selectedDifficulties:[3,5],answerMode};
  for(let i=0;i<1000;i++){const q=selectQuestion(bank,state,scope,rng).question;assert.equal(q.courseId,'chapter-2');assert.ok(scope.selectedLessonIds.includes(q.lessonId));assert.ok(scope.selectedDifficulties.includes(q.difficulty));if(answerMode==='written')assert.equal(q.isGraph,false);}
 }
});
test('set answers accept reordered equivalent values and reject duplicates or missing values',()=>{const f=get('2-3-q5').fields;assert.equal(grade(f,{values:'{3, -2/2}'}).isCorrect,true);for(const values of ['-1','-1,-1','-1,3,3','1,3'])assert.equal(grade(f,{values}).isCorrect,false);assert.throws(()=>grade(f,{values:'alert(1)'}));});
test('Chapter 2 parameter intervals have correct included and excluded endpoints',()=>{
 for(const [id,value,wrong]of [['2-5-q3','(0,12]','[0,12]'],['2-5-q5','[3/2,2)','(3/2,2)'],['2-7-q5','(-1/2,1)','[-1/2,1)']]){assert.equal(grade(get(id).fields,{interval:value}).isCorrect,true);assert.equal(grade(get(id).fields,{interval:wrong}).isCorrect,false);}
 for(let i=-500;i<500;i++){const x=i/100;assert.equal(Math.floor(x)+Math.floor(2*x)===4,x>=1.5&&x<2);}
 for(let i=-400;i<=400;i++){const k=i/100,roots=[];if(k!==-1){const x=1/(k+1);if(x<=2+1e-10)roots.push(x);}if(k!==1){const x=3/(1-k);if(x>=2-1e-10&&!roots.some(r=>near(r,x)))roots.push(x);}assert.equal(roots.length===2,k>-.5&&k<1,`k=${k}`);}
});
test('hardest interval and mixture guarantees are sufficient and sharp',()=>{
 for(let i=-100;i<=100;i++){const x=i/10;const robust=Array.from({length:101},(_,j)=>j/100).every(t=>-7<=(5-3*x)/2+3*t&&(5-3*x)/2+3*t<11);assert.equal(robust,x>-11/3&&x<=19/3);}
 for(let i=0;i<=100;i++){const concentration=.6+.05*i/100;assert.ok(concentration*24+.3*18<=21+1e-9);}
 assert.ok(.65*(42-17.99)+.3*17.99>21);
 for(let i=-40;i<=60;i++){const a=i/10,minDistance=a< -1?-1-a:a>3?a-3:0,min=minDistance**2-4,max=Math.max((-1-a)**2,(3-a)**2)-4;assert.equal(near(min,-4)&&near(max,12),a===-1||a===3);}
});
test('all Chapter 1 graph keys match independent original inequalities, with exactly one correct panel',()=>{
 const original={
 '1-5-q1':(x,y)=>y>2*x-3,'1-5-q2':(x,y)=>3*x+2*y<=12,'1-5-q3':(x,y)=>-2*x+4*y>8,'1-5-q4':(x,y)=>2*x-5*y<10,'1-5-q5':(x,y)=>1.5*x-1.25*y>=6,
 '1-7-q1':(x,y)=>y>=x&&y<=5,'1-7-q2':(x,y)=>x>=0&&y>=0&&x+y<=8,'1-7-q3':(x,y)=>x+y<=6&&2*x-y>=0&&y>=1,'1-7-q4':(x,y)=>x>=0&&y>=0&&2*x+y<=10&&x+2*y<=8,'1-7-q5':(x,y)=>x>=0&&y>=0&&x+y<=8&&2*x+y>=6&&x+2*y>=6,'1-8-q1':(x,y)=>x>=0&&y>=0&&x+y<=6
 };
 for(const [id,oracle]of Object.entries(original)){const matches=[];for(let choice=0;choice<4;choice++){let same=true;for(let x=-10;x<=10;x+=.25)for(let y=-10;y<=10;y+=.25){if(contains(graphSpecs[id].choices[choice],x,y)!==oracle(x,y))same=false;}if(same)matches.push('ABCD'[choice]);}assert.deepEqual(matches,[get(id).correctChoice],id);}
});
const sample=[-4,-3,-2,-1,-.5,0,.5,1,2,3,4];
const functionMatches=(shapes,fn)=>shapes.length===1&&shapes[0].kind==='curve'&&sample.every(x=>near(shapes[0].fn(x),fn(x)));
const polyValue=(shape,x)=>{const pts=shape.points;for(let i=1;i<pts.length;i++){const [a,b]=[pts[i-1],pts[i]];if(x>=a[0]&&x<=b[0])return a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]);}return NaN;};
test('each Chapter 2 graph question has exactly one panel satisfying independently stated features',()=>{
 const oracles={
 '2-2-q3':s=>functionMatches(s,x=>x*x-2),
 '2-3-q3':s=>{const f=s[0].fn;return f&&near(f(-1),1)&&near(f(1),-1)&&f(-1.1)<f(-1)&&f(-.9)<f(-1)&&f(.9)>f(1)&&f(1.1)>f(1)&&f(10)>100;},
 '2-4-q1':s=>functionMatches(s,x=>Math.abs(x)-2),'2-4-q2':s=>functionMatches(s,x=>x<0?x+2:-2*x+2),
 '2-4-q3':s=>functionMatches(s,x=>x*(x-2)*(x+2)/4),
 '2-4-q4':s=>s[0].kind==='polyline'&&s[0].endpoints==='closed'&&JSON.stringify(s[0].points)===JSON.stringify([[-4,-2],[-2,2],[1,-1],[4,2]]),
 '2-4-q5':s=>s[0].kind==='polyline'&&near(polyValue(s[0],1),3)&&near(polyValue(s[0],3),1)&&near(polyValue(s[0],4),3)&&sample.every(x=>near(polyValue(s[0],x),-polyValue(s[0],-x))),
 '2-5-q2':s=>s[0].kind==='steps'&&s[0].closedLeft&&s[0].direction===1&&s[0].shift===1,
 '2-5-q4':s=>functionMatches(s,x=>-Math.abs(x-1)+3),'2-6-q2':s=>functionMatches(s,x=>-((x+2)**2)/2+3),'2-6-q4':s=>functionMatches(s,x=>Math.abs(2*x-4)-3),
 '2-7-q1':s=>s.length===2&&sample.every(x=>near(s[0].fn(x),x*x)&&near(s[1].fn(x),4)),
 '2-7-q3':s=>s.length===2&&sample.every(x=>near(s[0].fn(x),Math.abs(x))&&near(s[1].fn(x),x/2+1))
 };
 assert.equal(Object.keys(oracles).length,13);
 for(const [id,oracle]of Object.entries(oracles)){const spec=functionGraphSpecs[id],letters=spec.choices.map((s,i)=>oracle(s)?'ABCD'[i]:null).filter(Boolean);assert.deepEqual(letters,[get(id).correctChoice],id);const renders=spec.choices.map((_,i)=>renderFunctionGraph(spec,i));assert.equal(new Set(renders).size,4,id);for(const svg of renders)assert.match(svg,/viewBox="0 0 370 370"/);}
});
test('v2 history retains the original prompt and every existing weight and scope selection',()=>{
 const s=initialState(bank);s.weights.questions={'1-2-q5':{power:4}};s.attempts=[{attemptId:'old-answer',questionId:'1-2-q5',contentVersion:2,lessonId:'1-2',details:[],studentAnswer:{method:'written',written:{interval:'(-11/3,19/3]'}},isCorrect:true,timestamp:'2026-09-12'}];
 const before=JSON.stringify(s),v=studentView(s,bank);assert.equal(v.history[0].question.questionId,'v2:1-2-q5');assert.match(v.history[0].question.promptHtml,/compound inequality/);assert.equal(JSON.stringify(s),before);assert.equal(weight(s,'question','1-2-q5'),16);
});
test('working is saved content, not a second grade or an answer-key leak',()=>{
 const q=get('2-1-q5'),answer={method:'both',choice:q.correctChoice,written:{a:'3',b:'1'},work:'My reasoning is saved, without adding points.'};const checked=gradeQuestion(q,answer,{answerMode:'both'});assert.equal(checked.isCorrect,true);assert.equal(checked.details.length,3);
 const s=initialState(bank);s.session={current:{questionId:q.questionId,instanceId:'sample'},selectedCourseIds:['chapter-2'],selectedLessonIds:['2-1'],selectedDifficulties:[5],difficultyMode:'custom',answerMode:'both'};
 const v=studentView(s,bank);for(const key of ['explanation','explanationHtml','work','reasoning','correctChoice'])assert.equal(v.current.question[key],undefined,key);
});
