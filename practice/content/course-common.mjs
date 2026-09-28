// New content uses the established answer fields and unmodified grading engine.
export const R=String.raw;
export const N=(key,label,value)=>({key,label,type:'number',value:String(value),hint:'Enter a number, fraction, or equivalent arithmetic expression.'});
export const T=(key,label,value,accepted=[])=>({key,label,type:'text',value,accepted});
export const S=(value,label='Solution values')=>({key:'values',label,type:'numberSet',value,hint:'Separate values with commas. Order does not matter.'});
export const I=value=>({key:'interval',label:'Solution interval',type:'interval',value,hint:'Use brackets for included endpoints and parentheses for excluded endpoints.'});
export const P=value=>({key:'points',label:'Points',type:'points',value,hint:'Enter points as (x, y); (x, y).'});
export function unitContent(unit,title){
 const questions=[],lessons=[],graphs={};
 const lesson=(number,name,ebookPage,summary,rule,explanation,examples,mistakes,recap,connection)=>{
  const id=`${unit}-${number}`;lessons.push({id,name,chapter:unit,ebookPage,ebookUrl:`/ebook/chapter${unit}/p${ebookPage}`,url:`/workbook/${id}`,summary,rule,explanation,examples,mistakes,recap,connection});
 };
 const add=(number,difficulty,prompt,choices,correct,fields,work,reasoning,graph)=>{
  const id=`${unit}-${number}-q${difficulty}`;if(graph)graphs[id]=graph;
  questions.push({questionId:id,courseId:`chapter-${unit}`,courseName:`Chapter ${unit}: ${title}`,lessonId:`${unit}-${number}`,difficulty,difficultyLabel:['Standard','Hard','Hard–Challenge','Challenge','Hardest'][difficulty-1],prompt,choices:choices?.map((text,i)=>({letter:'ABCD'[i],text}))??[],correctChoice:correct,isGraph:!!graph,supportedMethods:graph?['mc']:['mc','written'],fields:fields??[],explanation:`**Correct Answer:** ${correct}\n\n#### Work\n\n${work}\n\n#### Explanation\n\n${reasoning}`,active:true,contentVersion:3});
 };
 return {questions,lessons,graphs,lesson,add};
}
export const example=(title,prompt,work,explanation)=>({title,prompt,work,explanation});
