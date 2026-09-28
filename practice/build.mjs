import {readFile,writeFile,mkdir,copyFile,cp,appendFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import katex from 'katex';
import {marked} from 'marked';
import {answersV2} from './server/answers-v2.mjs';
import {graphSpecs,renderGraph,graphDescription} from './server/graphs.mjs';
import {reviseForDepth} from './content/revisions.mjs';
import {refineChapter1} from './content/refinements-v3.mjs';
import {chapter2} from './content/chapter2.mjs';
import {lessons,units} from './content/lessons.mjs';
import {functionGraphSpecs,renderFunctionGraph,describeFunctionGraph,fourGraphSheet} from './server/function-graphs.mjs';
import {courseGraphSpecs,renderCourseGraph,describeCourseGraph} from './server/course-graphs.mjs';
import {buildWorkbook} from './workbook.mjs';
const root=dirname(fileURLToPath(import.meta.url));
export function renderMarkdown(raw){
 const math=[];
 let text=raw.replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g,(_,block,inline)=>{
  const i=math.length;math.push({display:block!==undefined,html:katex.renderToString(block??inline,{displayMode:block!==undefined,throwOnError:true,trust:false,output:'htmlAndMathml'})});return block!==undefined?`\n\nMATHPLACEHOLDER${i}END\n\n`:`MATHPLACEHOLDER${i}END`;
 });
 text=text.replace(/<(?=[a-zA-Z!/])/g,'&lt;');
 let html=marked.parse(text,{gfm:true});
 html=html.replace(/<p>MATHPLACEHOLDER(\d+)END<\/p>/g,(match,i)=>math[Number(i)].display?`<div class="math-block">${math[Number(i)].html}</div>`:match);
 html=html.replace(/MATHPLACEHOLDER(\d+)END/g,(_,i)=>math[Number(i)].html);
 html=html.replace(/src="images\//g,'loading="lazy" src="/practice/images/');
 return html;
}
const source=[...JSON.parse(await readFile(join(root,'content/source.json'),'utf8')).map(reviseForDepth).map(refineChapter1),...chapter2,...units.flatMap(u=>u.questions)].map(q=>{
 const lesson=lessons.find(l=>l.id===q.lessonId);
 let explanation=q.explanation;
 if(!explanation.includes('#### Work')){
  const work=explanation.replace(/^\*\*Correct answer: [A-D]\*\*\s*/i,'').replace(/\n---\s*$/,'').trim();
  explanation=`**Correct Answer:** ${q.correctChoice}\n\n#### Work\n\n${work}\n\n#### Explanation\n\n${q.isGraph?'The boundary types and the common shaded region must all agree with the conditions above.':'The result must satisfy every original condition, including the stated domain and units.'} Choice ${q.correctChoice} is the only option that does so.`;
 }
 return {...q,lessonName:lesson.name,ebookPage:lesson.ebookPage,ebookUrl:lesson.ebookUrl,lessonUrl:lesson.url,contentVersion:3,explanation};
});
const unchanged=new Set(['1-1-q1','1-1-q2','1-1-q3','1-1-q4','1-1-q5','1-2-q1','1-2-q2','1-2-q3','1-2-q4','1-3-q1','1-3-q2','1-3-q3','1-3-q4','1-4-q1','1-4-q2','1-4-q3','1-4-q4','1-5-q1','1-5-q2','1-5-q3','1-6-q1','1-6-q2','1-6-q3','1-7-q1','1-7-q2','1-7-q4','1-8-q2','1-8-q3','1-8-q4','1-9-q2','1-9-q3','1-9-q4']);
const questions=source.map(q=>({...q,active:true,preservesLegacyContent:unchanged.has(q.questionId),questionWeight:1,promptHtml:renderMarkdown(q.prompt),explanationHtml:renderMarkdown(q.explanation),fields:q.isGraph?[]:(q.fields??answersV2[q.questionId]).map(f=>q.questionId==='1-6-q5'?{...f,label:f.key==='thirty'?'Minimum liters replaced':'Liters of original solution remaining'}:f),
 choices:(q.isGraph?[...'ABCD'].map(letter=>({letter,text:''})):q.choices).map((c,i)=>({...c,html:renderMarkdown(c.text),...(q.isGraph?{image:`/practice/graphs/${q.questionId}-${c.letter}.svg`,description:graphSpecs[q.questionId]?graphDescription(graphSpecs[q.questionId].choices[i]):functionGraphSpecs[q.questionId]?describeFunctionGraph(functionGraphSpecs[q.questionId].choices[i]):describeCourseGraph(courseGraphSpecs[q.questionId].choices[i])}:{})}))}));
for(const q of questions){
 if(!q.fields||(!q.isGraph&&!q.fields.length))throw new Error(`Missing written answer: ${q.questionId}`);
 if(q.choices.map(c=>c.letter).join('')!=='ABCD'||!q.choices.some(c=>c.letter===q.correctChoice))throw new Error(`Invalid choices: ${q.questionId}`);
 if(q.isGraph&&((!graphSpecs[q.questionId]&&!functionGraphSpecs[q.questionId]&&!courseGraphSpecs[q.questionId])||q.fields.length))throw new Error(`Invalid graph question: ${q.questionId}`);
}
if(questions.length!==360||new Set(questions.map(q=>q.questionId)).size!==360)throw new Error('Expected 360 unique questions');
for(const lesson of lessons){const qs=questions.filter(q=>q.lessonId===lesson.id);if(qs.map(q=>q.difficulty).join('')!=='12345')throw new Error('Expected five difficulty levels for '+lesson.id);}
const archived=JSON.parse(await readFile(join(root,'content/legacy-v1.json'),'utf8')).map(q=>({...q,questionId:'legacy:'+q.questionId,promptHtml:renderMarkdown(q.prompt),explanationHtml:renderMarkdown(q.explanation),active:false,contentVersion:1,supportedMethods:['written']}));
const archivedV2=JSON.parse(await readFile(join(root,'content/legacy-v2.json'),'utf8')).map(q=>({...q,questionId:'v2:'+q.questionId,promptHtml:renderMarkdown(q.prompt),explanationHtml:renderMarkdown(q.explanation),choices:q.choices.map(c=>({...c,html:renderMarkdown(c.text)})),active:false,contentVersion:2}));
const bank=[...questions,...archived,...archivedV2];
await writeFile(join(root,'content/questions.json'),JSON.stringify(bank));
const dist=join(root,'../dist/practice');await mkdir(dist,{recursive:true});
await mkdir(join(dist,'graphs'),{recursive:true});
for(const q of questions.filter(q=>q.isGraph)){
 const spec=graphSpecs[q.questionId]??functionGraphSpecs[q.questionId]??courseGraphSpecs[q.questionId],render=graphSpecs[q.questionId]?renderGraph:functionGraphSpecs[q.questionId]?renderFunctionGraph:renderCourseGraph;
 const svgs=[0,1,2,3].map(i=>render(spec,i));
 for(let i=0;i<4;i++)await writeFile(join(dist,'graphs',`${q.questionId}-${'ABCD'[i]}.svg`),svgs[i]);
 await writeFile(join(dist,'graphs',q.questionId+'-choices.svg'),fourGraphSheet(svgs));
}
await cp(join(root,'public'),dist,{recursive:true});
for(const file of ['app.js','styles.css','store.mjs','views.mjs'])await copyFile(join(root,'src',file),join(dist,file));
await cp(join(root,'../node_modules/katex/dist/fonts'),join(dist,'fonts'),{recursive:true});
await copyFile(join(root,'../node_modules/katex/dist/katex.min.css'),join(dist,'katex.min.css'));
await copyFile(join(root,'src/index.html'),join(dist,'index.html'));
for(const file of ['engine.mjs','grading.mjs','answers.mjs','migrate.mjs'])await copyFile(join(root,'server',file),join(dist,file));
await writeFile(join(dist,'questions.json'),JSON.stringify(bank));
await buildWorkbook(questions,lessons,root,renderMarkdown);
await appendFile(join(root,'../dist/_redirects'),'\n/workbook /workbook/index.html 200\n/workbook/ /workbook/index.html 200\n'+lessons.map(l=>`${l.url} /workbook/${l.id}.html 200\n${l.url}/ /workbook/${l.id}.html 200\n`).join('')+'/practice /practice/index.html 200\n/practice/* /practice/index.html 200\n');
console.log(`Practice built: ${questions.length} questions, ${lessons.length} lessons, ${archived.length+archivedV2.length} archived questions.`);
