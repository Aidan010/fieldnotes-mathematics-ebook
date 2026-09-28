export const ADAPTIVE = Object.freeze({
 version:2,
 weights:{course:{initial:1,step:.5,min:.1,max:3},lesson:{initial:.125,step:.05,min:.025,max:.5},question:{initial:1,correctMultiplier:.5,incorrectMultiplier:2}},
 evidence:{1:{correct:.5,incorrect:1.5},2:{correct:.75,incorrect:1.25},3:{correct:1,incorrect:1},4:{correct:1.25,incorrect:.75},5:{correct:1.5,incorrect:.5}},
 auto:{base:[.15,.30,.30,.20,.05],step:.08,maxShift:1.5,targetAccuracy:.72,recentWindow:12},
 recentWindow:8,recentPenalty:.08,exploration:.2,masteryStreak:3,masteryPrior:1
});
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const round=n=>Math.round(n*1e6)/1e6;
export function seededRandom(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
export function initialState(bank,now=new Date().toISOString()){
 return {version:2,revision:0,createdAt:now,updatedAt:now,weights:{courses:{},lessons:{},questions:{}},mastery:{},difficultyShift:{},recentPerformance:{},recentQuestions:[],seen:{},mistakes:{},attempts:[],sessions:[],session:null,processed:[]};
}
export function normalizeScope(scope,bank){
 if(!scope||typeof scope!=='object')throw new Error('Choose your practice scope.');
 const courses=new Set(bank.map(q=>q.courseId)),lessons=new Set(bank.map(q=>q.lessonId));
 if(!Array.isArray(scope.selectedCourseIds)||!Array.isArray(scope.selectedLessonIds)||!['auto','custom'].includes(scope.difficultyMode))throw new Error('Invalid practice selections.');
 if(scope.selectedCourseIds.some(id=>!courses.has(id))||scope.selectedLessonIds.some(id=>!lessons.has(id)))throw new Error('Choose courses and lessons from this edition.');
 const answerMode=scope.answerMode??'written';
 if(!['mc','written','both'].includes(answerMode))throw new Error('Choose an answer method.');
 const difficulties=scope.selectedDifficulties??(scope.difficultyMode==='auto'?[1,2,3,4,5]:[]);
 if(!Array.isArray(difficulties)||difficulties.some(d=>!Number.isInteger(d)||d<1||d>5))throw new Error('Choose valid difficulty levels.');
 return {answerMode,selectedCourseIds:[...new Set(scope.selectedCourseIds)],selectedLessonIds:[...new Set(scope.selectedLessonIds)],difficultyMode:scope.difficultyMode,selectedDifficulties:[...new Set(difficulties)].sort()};
}
export function availableMethods(q,scope){
 const allowed=scope?.answerMode==='mc'?['mc']:scope?.answerMode==='both'?['mc','written']:['written'];
 return allowed.filter(method=>(q.supportedMethods??['written']).includes(method)&&(!q.isGraph||method==='mc'));
}
export function eligibleQuestions(bank,scope){
 if(!scope)return [];
 const allowed=scope.difficultyMode==='auto'?[1,2,3,4,5]:scope.selectedDifficulties;
 return bank.filter(q=>q.active!==false&&availableMethods(q,scope).length&&scope.selectedCourseIds.includes(q.courseId)&&scope.selectedLessonIds.includes(q.lessonId)&&allowed.includes(q.difficulty));
}
// A power of two stores the one question weight exactly, without rounding,
// clamps, or floating-point overflow after long practice histories.
export function questionPower(state,id){return state.weights.questions[id]?.power??0;}
export function weight(state,kind,id,config=ADAPTIVE){
 if(kind==='question'){const power=questionPower(state,id);return power>1023||power< -1074?`2^${power}`:2**power;}
 return state.weights[{course:'courses',lesson:'lessons'}[kind]][id]??config.weights[kind].initial;
}
export function updateQuestionWeight(state,id,isCorrect){
 const power=questionPower(state,id)+(isCorrect?-1:1);state.weights.questions[id]={power};return weight(state,'question',id);
}
const logSum=values=>{const top=Math.max(...values);return top+Math.log(values.reduce((total,n)=>total+Math.exp(n-top),0));};
function massNode(children){return {children,logMass:logSum(children.map(n=>Math.log(n.base)+n.logMass))-Math.log(children.reduce((sum,n)=>sum+n.base,0))};}
function pickMass(children,rng){const logs=children.map(n=>Math.log(n.base)+n.logMass),top=Math.max(...logs);return weightedPick(children,n=>Math.exp(Math.log(n.base)+n.logMass-top),rng);}

export function weightedPick(items,getWeight,rng=Math.random){
 if(!items.length)return null;
 const weights=items.map(x=>Math.max(0,getWeight(x)));const total=weights.reduce((a,b)=>a+b,0);
 if(!Number.isFinite(total)||total<=0)throw new Error('Selection requires positive finite weights.');
 let roll=rng()*total;for(let i=0;i<items.length;i++){roll-=weights[i];if(roll<0)return items[i];}return items.at(-1);
}
export function difficultyWeights(state,lessonId,allowed,config=ADAPTIVE){
 const shift=state.difficultyShift[lessonId]||0;
 return allowed.map(d=>({difficulty:d,weight:config.auto.base[d-1]*Math.exp(shift*(d-3))}));
}
export function selectQuestion(bank,state,scope,rng=Math.random,config=ADAPTIVE){
 const eligible=eligibleQuestions(bank,scope);if(!eligible.length)return null;
 const recent=state.recentQuestions.slice(-config.recentWindow);
 let pool=eligible.filter(q=>!recent.includes(q.questionId));
 if(!pool.length){pool=eligible.filter(q=>q.questionId!==recent.at(-1));if(!pool.length)pool=eligible;}
 const unseen=pool.filter(q=>!state.seen[q.questionId]);const explore=rng()<config.exploration&&unseen.length>0;
 if(explore)pool=unseen;
 // Preserve the course → lesson → difficulty hierarchy. Propagate the
 // question mass upward so a question's weight still matters when a
 // lesson has only one question at each difficulty.
 const courses=[...new Set(pool.map(q=>q.courseId))].map(courseId=>{
  const coursePool=pool.filter(q=>q.courseId===courseId);
  const lessons=[...new Set(coursePool.map(q=>q.lessonId))].map(lessonId=>{
   const lessonPool=coursePool.filter(q=>q.lessonId===lessonId);
   const ds=difficultyWeights(state,lessonId,[...new Set(lessonPool.map(q=>q.difficulty))].sort(),config);
   const levels=ds.map(d=>({...massNode(lessonPool.filter(q=>q.difficulty===d.difficulty).map(question=>({question,base:1,logMass:questionPower(state,question.questionId)*Math.LN2+(recent.includes(question.questionId)?Math.log(config.recentPenalty):0)}))),base:d.weight,difficulty:d.difficulty}));
   return {...massNode(levels),base:weight(state,'lesson',lessonId,config),lessonId};
  });
  return {...massNode(lessons),base:weight(state,'course',courseId,config),courseId};
 });
 const course=pickMass(courses,rng),lesson=pickMass(course.children,rng),level=pickMass(lesson.children,rng),selected=pickMass(level.children,rng).question;
 return {question:selected,decision:{configVersion:config.version,eligibleCount:eligible.length,candidateCount:pool.length,exploration:explore,courseId:course.courseId,lessonId:lesson.lessonId,difficulty:level.difficulty,allowedDifficulties:lesson.children.map(d=>d.difficulty),exactRepeatUnavoidable:eligible.length===1,questionWeight:weight(state,'question',selected.questionId)}};
}
export function startSession(state,bank,scope,{id,now}){
 const normalized=normalizeScope(scope,bank);if(!eligibleQuestions(bank,normalized).length)throw new Error('Select a lesson, difficulty, and answer method with available questions.');
 if(state.session){state.session.endedAt=now;state.sessions.push(state.session);}
 state.session={sessionId:id,...normalized,startedAt:now,questionsAnswered:0,correctCount:0,incorrectCount:0,current:null,lastFeedback:null,scopeChanges:[]};
 return state.session;
}
export function changeScope(state,bank,scope,now,{allowEmpty=false}={}){
 if(!state.session)throw new Error('Start a practice session first.');
 const normalized=normalizeScope(scope,bank);if(!allowEmpty&&!eligibleQuestions(bank,normalized).length)throw new Error('Select at least one lesson and one available difficulty.');
 state.session.scopeChanges.push({at:now,previous:currentScope(state.session),next:normalized});
 Object.assign(state.session,normalized,{current:null,lastFeedback:null});return state.session;
}
export const currentScope=session=>Object.fromEntries(['selectedCourseIds','selectedLessonIds','difficultyMode','selectedDifficulties','answerMode'].map(k=>[k,session[k]]));
export function issueQuestion(state,bank,{id,now,reviewQuestionId,rng=Math.random}){
 if(!state.session)throw new Error('Choose topics and start practice.');
 if(state.session.current&&!reviewQuestionId)return state.session.current;
 let selection;
 if(reviewQuestionId){
  const question=eligibleQuestions(bank,state.session).find(q=>q.questionId===reviewQuestionId);
  if(!question)throw new Error('This question is outside your selected topics or difficulties. Change your selections to practice it.');
  if(!state.mistakes[reviewQuestionId])throw new Error('This question is not in your Mistake Book.');
  selection={question,decision:{review:true,eligibleCount:eligibleQuestions(bank,state.session).length}};
 }else selection=selectQuestion(bank,state,state.session,rng);
 if(!selection)throw new Error('No questions match your selections.');
 const {question,decision}=selection;
 state.session.current={instanceId:id,questionId:question.questionId,shownAt:now,decision};
 state.session.lastFeedback=null;
 state.recentQuestions.push(question.questionId);state.recentQuestions=state.recentQuestions.slice(-ADAPTIVE.recentWindow);
 state.seen[question.questionId]=(state.seen[question.questionId]||0)+1;
 return state.session.current;
}
export function recordAnswer(state,bank,instanceId,studentAnswer,result,now,config=ADAPTIVE){
 const duplicate=state.attempts.find(a=>a.instanceId===instanceId);if(duplicate)return duplicate;
 const session=state.session,current=session?.current;
 if(!current||current.instanceId!==instanceId)throw new Error('This question changed in another tab. Reload the current question.');
 const q=eligibleQuestions(bank,session).find(q=>q.questionId===current.questionId);
 if(!q)throw new Error('This question is outside your current selections.');
 const evidence=config.evidence[q.difficulty][result.isCorrect?'correct':'incorrect'];
 const before={question:weight(state,'question',q.questionId,config)},after={};
 after.question=updateQuestionWeight(state,q.questionId,result.isCorrect);
 for(const [kind,id] of [['lesson',q.lessonId],['course',q.courseId]]){
  before[kind]=weight(state,kind,id,config);const rule=config.weights[kind];
  after[kind]=round(clamp(before[kind]+(result.isCorrect?-1:1)*rule.step*evidence,rule.min,rule.max));
  state.weights[{course:'courses',lesson:'lessons',question:'questions'}[kind]][id]=after[kind];
 }
 const mastery=state.mastery[q.lessonId]??{correctEvidence:config.masteryPrior,incorrectEvidence:config.masteryPrior,attempts:0};
 mastery[result.isCorrect?'correctEvidence':'incorrectEvidence']+=evidence;mastery.attempts++;state.mastery[q.lessonId]=mastery;
 state.recentPerformance??={};
 const recentResults=[...(state.recentPerformance[q.lessonId]||[]),result.isCorrect?1:0].slice(-config.auto.recentWindow);
 state.recentPerformance[q.lessonId]=recentResults;
 const recentAccuracy=recentResults.reduce((a,b)=>a+b,0)/recentResults.length;
 state.difficultyShift[q.lessonId]=round(clamp((state.difficultyShift[q.lessonId]||0)+config.auto.step*(recentAccuracy-config.auto.targetAccuracy)*evidence,-config.auto.maxShift,config.auto.maxShift));
 let mistake=state.mistakes[q.questionId];
 if(!result.isCorrect&&!mistake){mistake={questionId:q.questionId,studentAnswer,correctAnswer:Object.fromEntries(result.details.map(d=>[d.key,d.correctAnswer])),wrongCount:0,correctCount:0,correctStreak:0,firstWrongAt:now,lastWrongAt:now,lastAttemptAt:now,isMastered:false};state.mistakes[q.questionId]=mistake;}
 if(mistake){mistake.lastAttemptAt=now;if(result.isCorrect){mistake.correctCount++;mistake.correctStreak++;mistake.isMastered=mistake.correctStreak>=config.masteryStreak;}else{mistake.wrongCount++;mistake.correctStreak=0;mistake.isMastered=false;mistake.lastWrongAt=now;mistake.studentAnswer=studentAnswer;}}
 const attempt={attemptId:instanceId,instanceId,sessionId:session.sessionId,questionId:q.questionId,courseId:q.courseId,lessonId:q.lessonId,difficulty:q.difficulty,answerMethod:result.answerMethod??'written',contentVersion:q.contentVersion??1,studentAnswer,isCorrect:result.isCorrect,details:result.details,responseTime:Math.max(0,new Date(now)-new Date(current.shownAt)),timestamp:now,questionWeightBefore:before.question,questionWeightAfter:after.question,lessonWeightBefore:before.lesson,lessonWeightAfter:after.lesson,courseWeightBefore:before.course,courseWeightAfter:after.course,evidenceMultiplier:evidence,decision:current.decision};
 state.attempts.push(attempt);session.questionsAnswered++;session[result.isCorrect?'correctCount':'incorrectCount']++;session.current=null;session.lastFeedback=instanceId;return attempt;
}
