import {initialState,startSession,changeScope,issueQuestion,recordAnswer,seededRandom} from './engine.mjs';
import {gradeQuestion} from './grading.mjs';
import {migrateState} from './migrate.mjs';
import {studentView} from './views.mjs';
let database;
const DB_NAME='fieldnotes-adaptive-practice';
export function openDatabase(){
 if(database)return Promise.resolve(database);
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('learning'))request.result.createObjectStore('learning');};
  request.onerror=()=>reject(new Error('Browser storage is unavailable. Enable storage for this site to save practice.'));
  request.onblocked=()=>reject(new Error('Close other practice tabs, then reload to update saved practice.'));
  request.onsuccess=()=>{database=request.result;database.onversionchange=()=>{database.close();database=null;};resolve(database);};
 });
}
export async function readState(bank){
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{const tx=db.transaction('learning','readwrite');const store=tx.objectStore('learning');const r=store.get('state');let result,error;
  r.onsuccess=()=>{try{result=migrateState(r.result,bank);if(r.result&&result.version!==r.result.version)store.put(result,'state');}catch(e){error=e;tx.abort();}};
  tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(error??tx.error);tx.onabort=()=>reject(error??tx.error);
 });
}
export async function runCommand(bank,command){
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  // One read-write transaction serializes updates, including across browser tabs.
  const tx=db.transaction('learning','readwrite');const store=tx.objectStore('learning');const request=store.get('state');let result,error;
  request.onsuccess=()=>{
   const now=new Date().toISOString();let state;
   try{state=migrateState(request.result,bank,now);}catch(e){error=e;tx.abort();return;}
   if(state.processed.includes(command.operationId)){result=studentView(state,bank);return;}
   try{
    const rng=seededRandom(command.operationId);
    switch(command.action){
     case 'start':startSession(state,bank,command.scope,{id:command.operationId,now});issueQuestion(state,bank,{id:crypto.randomUUID(),now,rng});break;
     case 'configure':changeScope(state,bank,command.scope,now,{allowEmpty:true});break;
     case 'scope':changeScope(state,bank,command.scope,now);issueQuestion(state,bank,{id:crypto.randomUUID(),now,rng});break;
     case 'next':issueQuestion(state,bank,{id:crypto.randomUUID(),now,rng});break;
     case 'review':issueQuestion(state,bank,{id:crypto.randomUUID(),now,reviewQuestionId:command.questionId,rng});break;
     case 'answer':{
      if(state.attempts.some(a=>a.instanceId===command.instanceId)){result=studentView(state,bank);return;}
      const current=state.session?.current;
      if(!current||current.instanceId!==command.instanceId)throw new Error('This question changed in another tab. Return to Practice to load the current question.');
      const q=bank.find(q=>q.questionId===current.questionId);const checked=gradeQuestion(q,command.answer,state.session);
      recordAnswer(state,bank,command.instanceId,command.answer,checked,now);break;
     }
     default:throw new Error('Unknown practice action.');
    }
    state.revision++;state.updatedAt=now;state.processed.push(command.operationId);state.processed=state.processed.slice(-200);store.put(state,'state');result=studentView(state,bank);
   }catch(e){error=e;tx.abort();}
  };
  tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(error??new Error('Your answer could not be saved. Check browser storage and try again.'));
  tx.onabort=()=>reject(error??new Error('Your progress could not be saved. Your existing history is unchanged.'));
 });
}
export async function readView(bank){return studentView(await readState(bank),bank);}
