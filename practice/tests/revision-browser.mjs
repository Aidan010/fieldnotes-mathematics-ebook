import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.FIELDNOTES_PLAYWRIGHT_PACKAGE || new URL('../../package.json',import.meta.url));
const {chromium}=require('playwright');
const base=process.argv[2]??'http://127.0.0.1:4173';
const out=new URL('../../verification/revision/',import.meta.url);await mkdir(out,{recursive:true});
const errors=[],checks=[];
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
const ready=async()=>p.locator('.app-header').waitFor();
const state=async()=>p.evaluate(async()=>{const {readState}=await import('/practice/store.mjs');return readState(await(await fetch('/practice/questions.json')).json());});
const command=async(payload,page=p)=>page.evaluate(async payload=>{const {runCommand}=await import('/practice/store.mjs');return runCommand(await(await fetch('/practice/questions.json')).json(),{operationId:crypto.randomUUID(),...payload});},payload);
const scope=(lesson='1-1',difficulty=1,answerMode='written')=>({selectedCourseIds:['chapter-'+lesson.split('-')[0]],selectedLessonIds:[lesson],difficultyMode:'custom',selectedDifficulties:[difficulty],answerMode});
await p.goto(base+'/practice/setup');await ready();
assert.equal(await p.locator('[name="answer-mode"]').count(),3);
await p.getByRole('button',{name:'Clear all',exact:true}).click();await p.locator('#lesson-1-1').check();await p.locator('label.mode-option').filter({hasText:'Custom'}).click();for(let d=2;d<=5;d++)await p.locator('#level-'+d).uncheck();
await p.locator('#answer-mode-mc').check();await p.locator('#start-practice').click();await p.waitForURL('**/practice/question');
assert.equal(await p.locator('.answer-choice').count(),4);assert.equal(await p.locator('.field').count(),0);
await p.locator('input[name="choice"][value="A"]').check();await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');
let s=await state();assert.equal(s.attempts.length,1);assert.equal(s.weights.questions['1-1-q1'].power,-1);
await p.reload();await ready();assert.equal((await state()).attempts.length,1);
await command({action:'scope',scope:scope('1-1',1,'written')});await p.goto(base+'/practice/question');await ready();assert.equal(await p.locator('.answer-choice').count(),0);await p.locator('#answer-x').fill('99');await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');
s=await state();assert.equal(s.attempts.length,2);assert.equal(s.weights.questions['1-1-q1'].power,0);assert.equal(s.session.questionsAnswered,2);assert.equal(s.session.correctCount,1);
await command({action:'scope',scope:scope('1-1',1,'both')});await p.goto(base+'/practice/question');await ready();assert.equal(await p.locator('.answer-section').count(),2);await p.locator('input[name="choice"][value="A"]').check();await p.locator('#answer-x').fill('14/2');await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:fileURLToPath(new URL('both-desktop.png',out)),fullPage:true});await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');
s=await state();assert.equal(s.attempts.length,3);assert.equal(s.session.questionsAnswered,3);assert.equal(s.weights.questions['1-1-q1'].power,-1);assert.equal(Object.keys(s.weights.questions).length,1);
checks.push('MC, Written, and matching Both results share one question ID and weight; each counts once.');
await command({action:'next'});s=await state();const p2=await context.newPage();await p2.goto(base+'/practice/question');await p2.locator('.app-header').waitFor();const payload={action:'answer',instanceId:s.session.current.instanceId,answer:{method:'both',choice:'A',written:{x:'7'}}};await Promise.all([command(payload),command(payload,p2)]);assert.equal((await state()).attempts.length,4);await p2.close();checks.push('Concurrent tab submissions remain atomic and count once.');
await p.goto(base+'/practice/history');await ready();assert.equal(await p.locator('tbody tr').count(),4);await p.locator('[data-attempt]').first().click();assert.equal(await p.locator('#attempt-dialog').evaluate(d=>d.open),true);await p.getByRole('button',{name:'Close answer review'}).click();
for(const [choice,x]of [['A','8'],['B','7']]){
 await command({action:'scope',scope:scope('1-1',1,'both')});await p.goto(base+'/practice/question');await ready();
 const before=await state();await p.locator(`input[name="choice"][value="${choice}"]`).check();await p.locator('#answer-x').fill(x);await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');
 const after=await state();assert.equal(after.attempts.length,before.attempts.length+1);assert.equal(after.session.questionsAnswered,before.session.questionsAnswered+1);assert.equal(after.attempts.at(-1).isCorrect,false);assert.equal(after.weights.questions['1-1-q1'].power,before.weights.questions['1-1-q1'].power+1);assert.equal(after.mistakes['1-1-q1'].wrongCount,before.mistakes['1-1-q1'].wrongCount+1);
}
checks.push('Either conflicting Both combination is Wrong, counts once, and doubles only the shared question weight.');
await command({action:'configure',scope:scope('1-5',1,'written')});await p.goto(base+'/practice/setup');await ready();assert.equal(await p.locator('#start-practice').isDisabled(),true);assert.equal((await state()).attempts.length,6);checks.push('Written-only selection excludes graphs and preserves all existing practice history.');
const bank=await(await p.request.get(base+'/practice/questions.json')).json();
for(const q of bank.filter(q=>q.active!==false&&q.isGraph)){
 await command({action:'scope',scope:scope(q.lessonId,q.difficulty,'both')});await p.goto(base+'/practice/question');await ready();
 assert.equal(await p.locator('.answer-section').count(),1);assert.equal(await p.locator('.answer-choice').count(),4);assert.equal(await p.locator('.field').count(),0);
 await p.locator('.graph-choices img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
 const sizes=await p.locator('.graph-choices img').evaluateAll(imgs=>imgs.map(i=>[i.clientWidth,i.clientHeight,i.naturalWidth,i.naturalHeight]));assert.equal(new Set(sizes.map(JSON.stringify)).size,1);assert.ok(sizes.every(([w,h])=>w===h));
 if(q.questionId==='1-7-q5')await p.screenshot({path:fileURLToPath(new URL('graphs-desktop.png',out)),fullPage:true});
 await p.locator(`input[name="choice"][value="${q.correctChoice}"]`).check();await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');assert.equal((await state()).attempts.at(-1).isCorrect,true);
}
checks.push('Every graph question displays exactly four equally sized choices; correct graphs grade once in Both scope.');
for(const width of [320,390,768]){
 await p.setViewportSize({width,height:900});await command({action:'scope',scope:scope('1-7',5,'mc')});await p.goto(base+'/practice/question');await ready();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`graph width ${width}`);await p.locator('.graph-choices img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));if(width===390)await p.screenshot({path:fileURLToPath(new URL('graphs-mobile.png',out)),fullPage:true});
 await p.goto(base+'/practice/setup');await ready();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`setup width ${width}`);
}
checks.push('Question and setup layouts fit 320, 390, and 768 pixel screens.');
await p.setViewportSize({width:320,height:900});
for(const q of bank.filter(q=>q.active!==false&&!q.isGraph)){
 await command({action:'scope',scope:scope(q.lessonId,q.difficulty,'both')});await p.goto(base+'/practice/question');await ready();
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`written/MC overflow ${q.questionId}`);
 assert.equal(await p.locator('.answer-choice').count(),4);await p.locator(`input[name="choice"][value="${q.correctChoice}"]`).check();
 for(const f of q.fields)await p.locator('#answer-'+f.key).fill(f.value);
 await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');assert.equal((await state()).attempts.at(-1).isCorrect,true,q.questionId);
}
checks.push('All 56 non-graph questions render at 320 pixels and grade correctly using Both.');
for(const path of ['/ebook/chapter1/p1','/ebook/chapter1/p25','/ebook/chapter1/p80']){
 const isolated=await browser.newContext();const tab=await isolated.newPage();const response=await tab.goto(base+path);assert.equal(response.status(),200);assert.equal(new URL(tab.url()).pathname,path);assert.equal(await tab.locator('body').getAttribute('data-page'),path.split('/p').at(-1));await tab.reload();assert.equal(new URL(tab.url()).pathname,path);assert.equal(await tab.locator('body').getAttribute('data-page'),path.split('/p').at(-1));await isolated.close();
}
checks.push('Chapter 1 pages 1, 25, and 80 open independently in new browser contexts and survive refresh.');
await browser.close();assert.deepEqual(errors,[]);await writeFile(new URL('results.json',out),JSON.stringify({base,at:new Date().toISOString(),checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
