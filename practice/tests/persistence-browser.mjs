import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.FIELDNOTES_PLAYWRIGHT_PACKAGE || new URL('../../package.json',import.meta.url));
const {chromium}=require('playwright');
const base=process.argv[2]??'http://127.0.0.1:4173';
const profile='/private/tmp/fieldnotes-upgrade-check-'+Date.now();
const options={headless:true,viewport:{width:1280,height:1000}};
let browser=await chromium.launchPersistentContext(profile,options),page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/practice/setup');await page.locator('.app-header').waitFor();
await page.evaluate(async()=>{
 const bank=await(await fetch('/practice/questions.json')).json();
 const {initialState,startSession,recordAnswer}=await import('/practice/engine.mjs');const {grade}=await import('/practice/grading.mjs');const {openDatabase}=await import('/practice/store.mjs');
 const oldBank=bank.filter(q=>q.active===false).map(q=>({...q,questionId:q.questionId.replace('legacy:',''),active:true}));
 const now='2026-09-01T12:00:00Z';const s=initialState(oldBank,now);startSession(s,oldBank,{selectedCourseIds:['chapter-1'],selectedLessonIds:['1-1','1-9'],selectedDifficulties:[1],difficultyMode:'custom',answerMode:'written'},{id:'original-session',now});
 for(const [id,values,instanceId]of [['1-1-q1',{x:'8'},'old-wrong'],['1-9-q1',{x:'7/2',y:'5/2',z:'3'},'old-right']]){
  const q=oldBank.find(q=>q.questionId===id);s.session.current={instanceId,questionId:id,shownAt:now};recordAnswer(s,oldBank,instanceId,values,grade(q.fields,values),now);
 }
 s.version=1;delete s.session.answerMode;s.weights.questions={'1-1-q1':.0325,'1-9-q1':.0225};s.seen={'1-1-q1':1,'1-9-q1':1};s.recentQuestions=['1-1-q1','1-9-q1'];
 const db=await openDatabase();await new Promise((resolve,reject)=>{const tx=db.transaction('learning','readwrite');tx.objectStore('learning').put(s,'state');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
});
await page.goto(base+'/practice/feedback');await page.locator('.feedback-status').waitFor();
const read=async p=>p.evaluate(async()=>{const {readState}=await import('/practice/store.mjs');return readState(await(await fetch('/practice/questions.json')).json());});
let state=await read(page);assert.equal(state.version,2);assert.equal(state.attempts.length,2);assert.equal(state.session.questionsAnswered,2);assert.equal(state.attempts[1].questionId,'legacy:1-9-q1');assert.equal(state.weights.questions['1-1-q1'].power,1);assert.equal(state.weights.questions['legacy:1-9-q1'].power,-1);assert.equal(state.weights.questions['1-9-q1'],undefined);assert.equal(state.session.answerMode,'written');assert.equal(state.mistakes['1-1-q1'].wrongCount,1);
const before=JSON.stringify(state);await page.reload();await page.locator('.feedback-status').waitFor();assert.equal(JSON.stringify(await read(page)),before);
await page.goto(base+'/practice/history');await page.locator('tbody tr').first().waitFor();assert.equal(await page.locator('tbody tr').count(),2);await page.locator('[data-attempt="old-right"]').click();assert.ok((await page.locator('.answer-comparison').innerText()).includes('7/2'));await page.getByRole('button',{name:'Close answer review'}).click();
await page.evaluate(async()=>{const {runCommand}=await import('/practice/store.mjs');const bank=await(await fetch('/practice/questions.json')).json();await runCommand(bank,{action:'scope',operationId:'resume-upgrade',scope:{selectedCourseIds:['chapter-1'],selectedLessonIds:['1-1'],selectedDifficulties:[1],difficultyMode:'custom',answerMode:'both'}});});
const pending=(await read(page)).session.current;await browser.close();
browser=await chromium.launchPersistentContext(profile,options);page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/practice/question');await page.locator('#answer-form').waitFor();state=await read(page);assert.equal(state.session.current.instanceId,pending.instanceId);assert.equal(state.attempts.length,2);assert.equal(state.session.answerMode,'both');await page.locator('[name="choice"][value="A"]').check();await page.locator('#answer-x').fill('8');await page.getByRole('button',{name:'Check answer'}).click();await page.waitForURL('**/practice/feedback');state=await read(page);assert.equal(state.attempts.length,3);assert.equal(state.session.questionsAnswered,3);assert.equal(state.attempts.at(-1).isCorrect,false);assert.equal(state.weights.questions['1-1-q1'].power,2);
const out=new URL('../../verification/revision/',import.meta.url);await mkdir(out,{recursive:true});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:fileURLToPath(new URL('both-wrong-feedback.png',out)),fullPage:true});
await browser.close();assert.deepEqual(errors,[]);const checks=['Version 1 browser history upgrades once without losing counts, mistakes, or original answers.','Changed source questions retain their original historical content and separate identity.','A full browser restart restores the same unanswered instance and Both scope.','A conflicting Both response after restart is Wrong, counts once, and doubles the shared weight.'];await writeFile(new URL('persistence-results.json',out),JSON.stringify({base,at:new Date().toISOString(),checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
