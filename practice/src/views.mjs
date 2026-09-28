import { publicFields } from './answers.mjs';
import { eligibleQuestions, currentScope } from './engine.mjs';
export function catalog(bank){bank=bank.filter(q=>q.active!==false);return [...new Set(bank.map(q=>q.courseId))].map(id=>({id,name:bank.find(q=>q.courseId===id).courseName,lessons:[...new Set(bank.filter(q=>q.courseId===id).map(q=>q.lessonId))].map(lid=>{const questions=bank.filter(q=>q.courseId===id&&q.lessonId===lid);const q=questions[0];return {id:lid,name:q.lessonName,ebookPage:q.ebookPage,ebookUrl:q.ebookUrl,count:questions.length,difficulties:[...new Set(questions.map(q=>q.difficulty))]};})}));}
function publicQuestion(q){return Object.fromEntries(Object.entries({...q,fields:publicFields(q.fields)}).filter(([k])=>!['questionWeight','explanation','explanationHtml','prompt','correctChoice','preservesLegacyContent','sourceGraph','work','reasoning','depth'].includes(k)));}
function publicAttempt(a,bank){const historical=a.displayQuestionId??(a.contentVersion===2&&bank.some(q=>q.questionId==='v2:'+a.questionId)?'v2:'+a.questionId:a.questionId);const q=bank.find(q=>q.questionId===historical);return {attemptId:a.attemptId,sessionId:a.sessionId,questionId:a.questionId,lessonId:a.lessonId,difficulty:a.difficulty,answerMethod:a.answerMethod??'written',studentAnswer:a.studentAnswer,isCorrect:a.isCorrect,responseTime:a.responseTime,timestamp:a.timestamp,details:a.details,question:publicQuestion(q),explanationHtml:q.explanationHtml};}
export function studentView(state,bank){
 const session=state.session;const current=session?.current;const last=state.attempts.find(a=>a.attemptId===session?.lastFeedback);
 return {revision:state.revision,catalog:catalog(bank),createdAt:state.createdAt,updatedAt:state.updatedAt,
  session:session?{sessionId:session.sessionId,...currentScope(session),startedAt:session.startedAt,questionsAnswered:session.questionsAnswered,correctCount:session.correctCount,incorrectCount:session.incorrectCount}:null,
  current:current?{instanceId:current.instanceId,shownAt:current.shownAt,question:publicQuestion(bank.find(q=>q.questionId===current.questionId)),onlyOneEligible:eligibleQuestions(bank,session).length===1}:null,
  feedback:last?publicAttempt(last,bank):null,
  mistakes:Object.values(state.mistakes).map(m=>({...m,question:publicQuestion(bank.find(q=>q.questionId===m.questionId)),eligible:!!session&&eligibleQuestions(bank,session).some(q=>q.questionId===m.questionId)})),
  history:state.attempts.map(a=>publicAttempt(a,bank)),
  sessions:[...state.sessions,...(session?[session]:[])].map(s=>({sessionId:s.sessionId,startedAt:s.startedAt,endedAt:s.endedAt,questionsAnswered:s.questionsAnswered,correctCount:s.correctCount,incorrectCount:s.incorrectCount,...currentScope(s)})),
  mastery:Object.fromEntries(Object.entries(state.mastery).map(([id,m])=>[id,{attempts:m.attempts,score:Math.round(100*m.correctEvidence/(m.correctEvidence+m.incorrectEvidence))}]))};
}
