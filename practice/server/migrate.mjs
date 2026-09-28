import {initialState,updateQuestionWeight} from './engine.mjs';
// Migrate once inside the same IndexedDB transaction as the caller. Historical
// prompts remain attached to the edition in which the answer was submitted.
export function migrateState(saved,bank,now=new Date().toISOString()){
 if(!saved)return initialState(bank,now);
 if(saved.version===2)return saved;
 if(saved.version!==1)throw new Error('Reload to update this version of saved practice.');
 const state=structuredClone(saved);const active=new Map(bank.filter(q=>q.active!==false).map(q=>[q.questionId,q]));
 state.weights.questions={};
 const target=id=>active.get(id)?.preservesLegacyContent===false?`legacy:${id}`:id;
 for(const attempt of state.attempts){
  const original=attempt.questionId;attempt.displayQuestionId=bank.some(q=>q.questionId===`legacy:${original}`)?`legacy:${original}`:original;
  attempt.questionId=target(original);attempt.answerMethod='written';attempt.contentVersion=1;
  updateQuestionWeight(state,attempt.questionId,attempt.isCorrect);
 }
 const mistakes={};for(const [id,m]of Object.entries(state.mistakes)){const newId=target(id);mistakes[newId]={...m,questionId:newId};}state.mistakes=mistakes;
 state.seen=Object.fromEntries(Object.entries(state.seen).map(([id,n])=>[target(id),n]));
 state.recentQuestions=state.recentQuestions.map(target);
 for(const session of [...state.sessions,...(state.session?[state.session]:[])]){
  session.answerMode='written';if(session.current)session.current=null;
 }
 state.version=2;state.revision++;state.updatedAt=now;state.migration={fromVersion:1,at:now,questionWeights:'Replayed each historical result from 1 using ×0.5 / ×2'};
 return state;
}
