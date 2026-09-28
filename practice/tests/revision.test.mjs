import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gradeQuestion} from '../server/grading.mjs';
import {graphSpecs,contains,feasiblePolygon,renderGraph} from '../server/graphs.mjs';
import {migrateState} from '../server/migrate.mjs';
import {initialState,weight} from '../server/engine.mjs';
import {studentView} from '../../dist/practice/views.mjs';
const bank=JSON.parse(readFileSync(new URL('../content/questions.json',import.meta.url)));
const active=bank.filter(q=>q.active!==false);
test('360 questions, each with exactly four distinct A–D choices and one correct choice',()=>{
 assert.equal(active.length,360);for(const q of active){assert.deepEqual(q.choices.map(c=>c.letter),['A','B','C','D']);assert.equal(new Set(q.choices.map(c=>q.isGraph?c.image:c.html)).size,4);assert.equal(q.choices.filter(c=>gradeQuestion(q,{method:'mc',choice:c.letter},{answerMode:'mc'}).isCorrect).length,1);assert.deepEqual(q.supportedMethods,q.isGraph?['mc']:['mc','written']);if(!q.isGraph)assert.equal(gradeQuestion(q,{method:'written',written:Object.fromEntries(q.fields.map(f=>[f.key,f.value]))},{answerMode:'written'}).isCorrect,true,q.questionId);}
});
test('44 graph choices have equal frames and match their mathematical regions',()=>{
 assert.equal(Object.keys(graphSpecs).length,11);for(const [id,spec]of Object.entries(graphSpecs)){assert.equal(spec.choices.length,4);const signatures=[];for(let i=0;i<4;i++){const svg=renderGraph(spec,i);assert.match(svg,/viewBox="0 0 370 370" width="370" height="370"/);assert.equal((svg.match(/stroke-dasharray/g)??[]).length,spec.choices[i].filter(c=>c.op.length===1).length);for(const p of feasiblePolygon(spec.choices[i],spec.bounds))assert.ok(contains(spec.choices[i].map(c=>({...c,op:c.op.replace(/^[<>]$/,s=>s+'=')})),...p),id);const sample=[];for(let x=-10;x<=10;x+=.5)for(let y=-10;y<=10;y+=.5)sample.push(contains(spec.choices[i],x,y));signatures.push(JSON.stringify(sample));}assert.equal(new Set(signatures).size,4,id);}
});
test('migration retains old prompts, totals, mistakes, and replays one question weight',()=>{
 const old=initialState(bank,'2026-09-01');old.version=1;old.weights.questions={'1-1-q1':.01,'1-9-q1':.03};old.weights.courses={'chapter-1':2};old.attempts=[{attemptId:'a',questionId:'1-1-q1',isCorrect:false,details:[]},{attemptId:'b',questionId:'1-1-q1',isCorrect:true,details:[]},{attemptId:'c',questionId:'1-9-q1',isCorrect:false,details:[]}];old.mistakes={'1-9-q1':{questionId:'1-9-q1',wrongCount:1,correctStreak:0}};old.seen={'1-1-q1':2,'1-9-q1':1};old.recentQuestions=['1-9-q1'];old.session={sessionId:'s',selectedCourseIds:['chapter-1'],selectedLessonIds:['1-1'],selectedDifficulties:[1],difficultyMode:'custom',questionsAnswered:3,correctCount:1,incorrectCount:2,current:{instanceId:'pending'},lastFeedback:'c'};
 const migrated=migrateState(old,bank);assert.equal(old.version,1);assert.equal(migrated.version,2);assert.equal(migrated.attempts.length,3);assert.equal(migrated.session.questionsAnswered,3);assert.equal(migrated.session.current,null);assert.equal(migrated.session.answerMode,'written');assert.equal(weight(migrated,'question','1-1-q1'),1);assert.equal(weight(migrated,'question','legacy:1-9-q1'),2);assert.equal(weight(migrated,'question','1-9-q1'),1);assert.deepEqual(migrated.weights.courses,old.weights.courses);assert.equal(migrated.mistakes['legacy:1-9-q1'].wrongCount,1);assert.equal(studentView(migrated,bank).feedback.question.questionId,'legacy:1-9-q1');assert.equal(migrateState(migrated,bank),migrated);
});
test('Hardest integer optimization answer is the global integer optimum',()=>{let best=-Infinity,points=[];for(let x=0;x<=6;x++)for(let y=0;y<=7;y++)if(3*x+y<=18&&x+2*y<=14){const p=7*x+9*y;if(p>best){best=p;points=[[x,y]];}else if(p===best)points.push([x,y]);}assert.equal(best,73);assert.deepEqual(points,[[4,5]]);});

test('Hardest parameter reasoning gives exactly the supplied graph B, including its boundary',()=>{
 const q=active.find(q=>q.questionId==='1-5-q5');assert.match(q.prompt,/every real number/);assert.equal(q.correctChoice,'B');
 for(let x=-10;x<=10;x+=.5)for(let y=-10;y<=10;y+=.5){
  const original=1.5*x-1.25*y>=6;
  assert.equal(contains(graphSpecs['1-5-q5'].choices[1],x,y),original);
  assert.equal([0,.01,1,10,10000].every(t=>1.5*(x+t)-1.25*(y+t)>=6),original);
 }
});
