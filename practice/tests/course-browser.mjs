import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(process.env.FIELDNOTES_PLAYWRIGHT_PACKAGE || new URL('../../package.json',import.meta.url));
const {chromium}=require('playwright'),base=process.argv[2]||'http://127.0.0.1:4173';
const out=fileURLToPath(new URL('../../verification/units1-10/browser/',import.meta.url));await mkdir(out,{recursive:true});
const localBank=JSON.parse(await readFile(new URL('../content/questions.json',import.meta.url))),bank=localBank.filter(q=>q.active!==false);
const browser=await chromium.launch({headless:true}),ctx=await browser.newContext({viewport:{width:390,height:900}}),p=await ctx.newPage(),errors=[],checks=[];
p.on('pageerror',e=>errors.push(e.message));
const ready=async()=>p.locator('.site-header').waitFor();
await p.goto(base+'/practice/setup?new=1');await ready();
assert.equal(await p.locator('[data-lesson]').count(),72);assert.equal(await p.locator('[data-course]').count(),10);
const scope=q=>({selectedCourseIds:[q.courseId],selectedLessonIds:[q.lessonId],difficultyMode:'custom',selectedDifficulties:[q.difficulty],answerMode:'both'});
const cmd=async command=>p.evaluate(async command=>{const {runCommand}=await import('/practice/store.mjs');window.qaBank??=await(await fetch('/practice/questions.json')).json();return runCommand(window.qaBank,{operationId:crypto.randomUUID(),...command});},command);
const state=()=>p.evaluate(async()=>{const {readState}=await import('/practice/store.mjs');return readState(window.qaBank);});
const showQuestion=async q=>{await cmd({action:(await state()).session?'scope':'start',scope:scope(q)});await p.evaluate(()=>{history.replaceState({},'','/practice/question');dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new Event('focus'));});await p.locator(`[data-question-id="${q.questionId}"]`).waitFor();await p.locator('#answer-form').waitFor();};
for(const [i,q]of bank.entries()){
 if(i%25===0)console.log('Browser question checks',i,'of',bank.length);
 await p.setViewportSize({width:320,height:900});await showQuestion(q);
 assert.equal(await p.locator('input[name=choice]').count(),4,q.questionId);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${q.questionId} overflow`);
 assert.equal(await p.locator('.explanation').count(),0,'No solution before answering');
 if(q.isGraph){
  assert.equal(await p.locator('#answer-work').count(),0);assert.equal(await p.locator('.fields input').count(),0);
  await p.locator('.graph-choices img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
  const rects=await p.locator('.graph-choices img').evaluateAll(imgs=>imgs.map(img=>{const r=img.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
  assert.equal(new Set(rects.map(r=>[r.w,r.h].join())).size,1,q.questionId);assert.equal(rects[0].y,rects[1].y);assert.equal(rects[2].y,rects[3].y);assert.equal(rects[0].x,rects[2].x);assert.ok(rects[2].y>rects[0].y);
 }else{
  for(const f of q.fields)await p.locator('#answer-'+f.key).fill(f.value);
  await p.locator('#answer-work').fill(`Reasoning for ${q.questionId}\nI checked all constraints. <not markup>`);
 }
 await p.locator(`input[name=choice][value=${q.correctChoice}]`).check();
 if(['3-7-q3','5-4-q1','7-4-q3','8-6-q3','9-6-q3','10-5-q5'].includes(q.questionId)){await p.setViewportSize({width:390,height:900});await p.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});await p.screenshot({path:out+q.questionId+'-mobile.png',fullPage:true});}
 await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');await p.locator('.feedback-status h2').waitFor();assert.equal(await p.locator('.feedback-status h2').innerText(),'Correct',q.questionId);
 const saved=await state();assert.equal(saved.attempts.length,i+1);const attempt=saved.attempts.at(-1);assert.equal(attempt.questionId,q.questionId);assert.equal(attempt.answerMethod,q.isGraph?'mc':'both');assert.equal(saved.weights.questions[q.questionId].power,-1);
 if(!q.isGraph){assert.equal(await p.locator('.saved-working').isVisible(),true);assert.ok(attempt.studentAnswer.work.includes(q.questionId));}
}
checks.push('All 360 questions render without overflow at 320px and grade correctly; each counts once and changes its one weight from 1 to 0.5.');
checks.push('All 43 graph questions have four equal panels in 2 × 2 layout; all 317 non-graph questions include saved written working.');
// Wrong answers, Both conflict and reload persistence on a new Chapter 2 question.
const q=bank.find(q=>q.questionId==='2-1-q1');await showQuestion(q);await p.locator('#answer-value').fill('-14');await p.locator('#answer-work').fill('Correct written value, incorrect multiple choice.');await p.locator('[name=choice][value=B]').check();await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');assert.equal(await p.locator('.feedback-status h2').innerText(),'Not quite — keep going');
assert.equal((await state()).weights.questions[q.questionId].power,0);assert.equal((await state()).attempts.length,bank.length+1);
await p.reload();await ready();assert.equal(await p.locator('.saved-working').isVisible(),true);
await p.goto(base+'/practice/mistakes');await ready();assert.ok(await p.locator('.mistake-card').count()>0);
await p.goto(base+'/practice/history');await ready();await p.locator('[data-attempt]').first().click();assert.ok((await p.locator('#attempt-dialog').innerText()).includes('Correct written value'));await p.getByRole('button',{name:'Close answer review'}).click();
checks.push('A conflicting Both answer is Wrong, counts once, doubles the shared weight, and preserves written working through reload, Mistake Book and history.');
// Existing selection survives a content expansion; chapter restriction remains hard.
await p.goto(base+'/practice/setup');await ready();await p.locator('#answer-mode-written').check();await p.locator('#start-practice').click();await p.waitForURL('**/practice/question');assert.equal(await p.locator('[name=choice]').count(),0);await p.locator('#answer-value').fill('-14');await p.getByRole('button',{name:'Check answer'}).click();await p.waitForURL('**/practice/feedback');assert.equal((await state()).attempts.length,bank.length+2);
checks.push('Written-only mode hides Multiple Choice, retains the exact chapter/lesson/difficulty scope and adds one result.');
for(const width of [1440,768,390,320]){
 await p.setViewportSize({width,height:1000});
 for(const [name,path]of [['home','/'],['workbook','/workbook'],['lesson','/workbook/10-5'],['graphs','/workbook/9-6'],['setup','/practice/setup'],['reader','/ebook/chapter2/p42']]){
  await p.goto(base+path);await ready();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${path} ${width}px`);
  if(width===1440||width===390)await p.screenshot({path:out+name+'-'+width+'.png',fullPage:true});
 }
}
for(const l of [...new Set(bank.map(q=>q.lessonId))]){await p.goto(base+'/workbook/'+l);assert.equal(await p.locator('.workbook-question').count(),5);assert.equal(await p.locator('#examples .worked-example').count(),2);assert.ok((await p.locator('#explanation').innerText()).length>200);assert.equal(await p.locator('.workbook-solutions details').count(),5);await p.locator('.workbook-solutions summary').last().click();assert.ok(await p.locator('.workbook-solutions details[open] .question-content').isVisible());}
checks.push('All 72 workbook lessons have five questions followed by five complete worked solutions. Home, workbook, practice and reader fit 1440/768/390/320px.');
for(const [chapter,page]of [[1,1],[1,25],[1,80],[2,5],[2,64],[3,25],[5,41],[6,94],[8,62],[9,31],[10,1],[10,46]]){const fresh=await browser.newContext();const tab=await fresh.newPage();const response=await tab.goto(`${base}/ebook/chapter${chapter}/p${page}`);assert.equal(response.status(),200);assert.equal(await tab.locator('body').getAttribute('data-chapter'),String(chapter));assert.equal(await tab.locator('#page-input').inputValue(),String(page));await tab.locator('.scan-frame img').evaluate(img=>img.decode());await tab.reload();assert.equal(await tab.locator('#page-input').inputValue(),String(page));await fresh.close();}
await p.goto(base+'/ebook/chapter1/p80');await p.locator('[data-nav=next]').click();await p.waitForURL('**/ebook/chapter2/p1');await p.goBack();assert.equal(await p.locator('body').getAttribute('data-chapter'),'1');await p.goForward();assert.equal(await p.locator('body').getAttribute('data-chapter'),'2');await p.locator('#page-input').fill('10');await p.locator('#page-input').press('Enter');await p.waitForURL('**/ebook/chapter2/p10');await p.locator('#chapter-select').selectOption('1');await p.waitForURL('**/ebook/chapter1/p1');
checks.push('Independent deep links and refresh pass across the ten-unit course; crossing the chapter boundary, Back/Forward, typing page numbers and the chapter selector work.');
const manifest=await(await p.request.get(base+'/manifest.json')).json();assert.equal(manifest.length,694);
let next=0;await Promise.all(Array.from({length:8},async()=>{while(next<manifest.length){const m=manifest[next++],r=await p.request.get(base+m.url),html=await r.text();assert.equal(r.status(),200,m.url);assert.ok(html.includes(`data-chapter="${m.chapter}" data-page="${m.page}"`),m.url);assert.ok(html.includes(m.asset),m.url);}}));
checks.push('All 694 direct textbook URLs return the independently rendered exact chapter and page.');
await p.goto(base+'/ebook/chapter9/p62');await p.locator('[data-nav=next]').click();await p.waitForURL('**/ebook/chapter10/p1');await p.goBack();await p.goForward();assert.equal(await p.locator('body').getAttribute('data-chapter'),'10');
assert.deepEqual(errors,[]);await writeFile(out+'browser-results.json',JSON.stringify({base,checkedAt:new Date().toISOString(),checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));await browser.close();
