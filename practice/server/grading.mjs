import {availableMethods} from './engine.mjs';
// Parse a bounded arithmetic grammar. Never evaluate student input as JavaScript.
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const scale=(a,n)=>a.map(v=>v*n);
const constant=a=>a[0]===0&&a[1]===0;
export function expression(text,allowVariables=false){
 const s=String(text).trim().replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/');
 if(!s||s.length>150) throw new Error('Enter a number or fraction.');
 const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|[xy()+*/-]/g)||[];
 if(tokens.join('')!==s.replace(/\s/g,'')||tokens.length>90) throw new Error('Use numbers, fractions, and arithmetic symbols.');
 let i=0,depth=0;
 const peek=()=>tokens[i];
 function factor(){
  if(++depth>20) throw new Error('Expression is too complex.');
  let r,t=tokens[i++];
  if(t==='+'||t==='-')r=scale(factor(),t==='-'?-1:1);
  else if(t==='('){r=sum();if(tokens[i++]!==')')throw new Error('Check the parentheses.');}
  else if(t==='x'||t==='y'){if(!allowVariables)throw new Error('Enter the value without a variable.');r=t==='x'?[1,0,0]:[0,1,0];}
  else if(t&&/^(\d+(\.\d*)?|\.\d+)$/.test(t))r=[0,0,Number(t)];
  else throw new Error('Check the expression.');
  depth--;return r;
 }
 function product(){let a=factor();while(peek()==='*'||peek()==='/'||peek()==='('||peek()==='x'||peek()==='y'){
  const op=peek()==='*'||peek()==='/'?tokens[i++]:'*';const b=factor();
  if(op==='/'){if(!constant(b)||b[2]===0)throw new Error('Divide only by a nonzero number.');a=scale(a,1/b[2]);}
  else {if(!constant(a)&&!constant(b))throw new Error('Enter a linear expression.');a=constant(a)?scale(b,a[2]):scale(a,b[2]);}
 }return a;}
 function sum(){let a=product();while(peek()==='+'||peek()==='-'){const op=tokens[i++];a=plus(a,scale(product(),op==='-'?-1:1));}return a;}
 const result=sum();if(i!==tokens.length||result.some(v=>!Number.isFinite(v)||Math.abs(v)>1e12))throw new Error('Check the expression.');return result;
}
export const numberValue=s=>expression(s)[2];
const close=(a,b)=>Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b));
export function linearRelation(text,isInequality=false){
 const s=String(text).replaceAll('≤','<=').replaceAll('≥','>=').replaceAll('−','-');
 const parts=s.split(/(<=|>=|=|<|>)/);
 if(parts.length!==3)throw new Error('Enter one complete equation or inequality.');
 if(isInequality?parts[1]==='=':parts[1]!=='=')throw new Error(isInequality?'Enter an inequality.':'Enter an equation using =.');
 const coeff=plus(expression(parts[0],true),scale(expression(parts[2],true),-1));
 if(Math.abs(coeff[0])+Math.abs(coeff[1])<1e-10)throw new Error('Include x or y in the relation.');
 return {coeff,op:parts[1]};
}
function sameRelation(a,b){
 const i=b.coeff.findIndex(v=>Math.abs(v)>1e-10),ratio=a.coeff[i]/b.coeff[i];
 if(Math.abs(ratio)<1e-10||!a.coeff.every((v,j)=>close(v,b.coeff[j]*ratio)))return false;
 const flipped={'<':'>','>':'<','<=':'>=','>=':'<=','=':'='};return a.op===(ratio>0?b.op:flipped[b.op]);
}
function parsePoints(s){
 if(String(s).length>500)throw new Error('Enter a short list of points.');
 const matches=[...String(s).matchAll(/\(([^(),]+),([^(),]+)\)/g)];
 if(!matches.length||String(s).replace(/\([^(),]+,[^(),]+\)/g,'').replace(/[;,\s]/g,''))throw new Error('Use points like (0, 0); (2, 3).');
 return matches.map(m=>[numberValue(m[1]),numberValue(m[2])]);
}
function parseInterval(s){const m=String(s).replaceAll('−','-').trim().match(/^([[(])\s*([^,]+),\s*([^,]+)\s*([\])])$/);if(!m)throw new Error('Use interval notation such as [-1, 13/2).');return [m[1],numberValue(m[2]),numberValue(m[3]),m[4]];}
export function grade(fields,answer){
 if(!answer||typeof answer!=='object'||Array.isArray(answer))throw new Error('Enter your answer.');
 const details=fields.map(field=>{
  const raw=answer[field.key];if(typeof raw!=='string'||!raw.trim()||raw.length>500)throw new Error(`Complete “${field.label}”.`);
  let correct=false;
  try{
   if(field.type==='text')correct=[field.value,...(field.accepted??[])].some(v=>normalizeText(v)===normalizeText(raw));
   if(field.type==='number')correct=close(numberValue(raw),numberValue(field.value));
   if(field.type==='choice'){if(!field.options.some(([v])=>v===raw))throw new Error('Choose one of the listed answers.');correct=raw===field.value;}
   if(field.type==='line'||field.type==='inequality')correct=sameRelation(linearRelation(raw,field.type==='inequality'),linearRelation(field.value,field.type==='inequality'));
   if(field.type==='points'){const a=parsePoints(raw),b=parsePoints(field.value);correct=a.length===b.length&&b.every(p=>a.filter(t=>p.every((v,i)=>close(v,t[i]))).length===1);}
   if(field.type==='numberSet'){const parse=s=>{const t=String(s).trim().replace(/^\{(.*)\}$/,'$1').split(/[,;]/).map(v=>numberValue(v));if(!t.length)throw new Error('Enter numbers separated by commas.');return t;};const a=parse(raw),b=parse(field.value);correct=a.length===b.length&&b.every(v=>a.filter(x=>close(x,v)).length===1);}
   if(field.type==='interval'){const a=parseInterval(raw),b=parseInterval(field.value);correct=a[0]===b[0]&&a[3]===b[3]&&close(a[1],b[1])&&close(a[2],b[2]);}
  }catch(e){throw new Error(`${field.label}: ${e.message}`);}
  return {key:field.key,label:field.label,isCorrect:correct,studentAnswer:raw.trim(),correctAnswer:field.type==='choice'?field.options.find(([v])=>v===field.value)[1]:field.value};
 });
 return {isCorrect:details.every(d=>d.isCorrect),details};
}

function normalizeText(value){return String(value).normalize('NFKC').trim().toLowerCase().replace(/[.!]+$/,'').replace(/\s+/g,' ');}
// User rule: Both is correct only when both responses are correct.
// The result is still recorded and weighted once for the question.
export function gradeQuestion(question,answer,scope){
 if(!answer||typeof answer!=='object'||Array.isArray(answer))throw new Error('Enter your answer.');
 const methods=availableMethods(question,scope);
 const expected=methods.length===2?'both':methods[0];
 if(!expected)throw new Error('This question is outside your selected answer methods.');
 if(answer.method!==expected)throw new Error('Use the answer method selected for this session.');
 if(answer.work!==undefined&&(typeof answer.work!=='string'||answer.work.length>5000))throw new Error('Keep your working within 5,000 characters.');
 const results=[];
 if(methods.includes('mc')){
  if(!question.choices.some(c=>c.letter===answer.choice))throw new Error('Choose A, B, C, or D.');
  const correct=answer.choice===question.correctChoice;
  results.push({method:'mc',isCorrect:correct,details:[{key:'choice',label:'Multiple Choice',studentAnswer:answer.choice,correctAnswer:question.correctChoice,isCorrect:correct}]});
 }
 if(methods.includes('written'))results.push({method:'written',...grade(question.fields,answer.written)});
 return {answerMethod:expected,isCorrect:results.every(r=>r.isCorrect),details:results.flatMap(r=>r.details.map(d=>({...d,method:r.method})))};
}
