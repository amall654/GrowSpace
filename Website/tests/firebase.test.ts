import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, type Firestore } from 'firebase/firestore';
import { executeCommand, loadAccount, type Command } from '../lib/firebase/repository';
import { readDrafts, storeDraft, removeDraft } from '../lib/firebase/drafts';

let env: RulesTestEnvironment;
before(async () => { env = await initializeTestEnvironment({ projectId:'demo-growspace',firestore:{host:'127.0.0.1',port:8080,rules:await readFile('firestore.rules','utf8')} }); await env.clearFirestore(); });
after(async () => { await env?.cleanup(); });
const userDb = (uid:string,verified=true) => env.authenticatedContext(uid,{email_verified:verified}).firestore() as unknown as Firestore;
const meta = {revision:1,lastMutationId:'create'};
const records = {
  courses: {name:'Algorithms',code:'CS101',color:'bg-sky-100 text-sky-700'},
  tasks: {title:'Assignment',courseId:'',due:'2026-09-12',priority:'high',done:false,completedAt:null},
  events: {title:'Lecture',courseId:'',day:'Sunday',time:'09:00',kind:'class'},
  books: {title:'Reading',author:'Author',progress:0,status:'planned',note:'Private note'},
};
test('anonymous and unverified users cannot access account data',async()=>{
  for(const db of [env.unauthenticatedContext().firestore(),userDb('unverified',false)]){
    await assertFails(setDoc(doc(db as unknown as Firestore,'users','unverified'),{name:'A',weeklyGoal:5,...meta}));
    await assertFails(getDoc(doc(db as unknown as Firestore,'users','unverified')));
  }
});
test('profile creation is idempotent and preserves personalization',async()=>{
  const db=userDb('profile-user');
  const first=await loadAccount(db,'profile-user','Student');assert.equal(first.profile.name,'Student');
  await executeCommand(db,{id:'rename',uid:'profile-user',collection:'profiles',documentId:'profile-user',expectedRevision:1,data:{name:'Customized',weeklyGoal:8}});
  const again=await loadAccount(db,'profile-user','Default');assert.equal(again.profile.name,'Customized');assert.equal(again.profile.weeklyGoal,8);
  await assertFails(getDoc(doc(userDb('other'),'users','profile-user')));
  await assertFails(setDoc(doc(db,'users','profile-user'),{name:'A',weeklyGoal:100,revision:3,lastMutationId:'invalid'}));
});
for(const [kind,data] of Object.entries(records))test(`${kind}: owner CRUD, cross-account and anonymous access denied`,async()=>{
  const uid=`owner-${kind}`,db=userDb(uid),path=['users',uid,kind,'record'] as const;
  await assertSucceeds(setDoc(doc(db,...path),{...data,...meta}));
  await assertSucceeds(getDoc(doc(db,...path)));
  await assertSucceeds(getDocs(collection(db,'users',uid,kind)));
  for(const other of [userDb('other'),env.unauthenticatedContext().firestore() as unknown as Firestore]){
    await assertFails(getDoc(doc(other,...path)));await assertFails(getDocs(collection(other,'users',uid,kind)));
    await assertFails(setDoc(doc(other,...path),{...data,revision:2,lastMutationId:'attack'}));
    await assertFails(deleteDoc(doc(other,...path)));
  }
  await assertSucceeds(updateDoc(doc(db,...path),{revision:2,lastMutationId:'update'}));
  await assertFails(updateDoc(doc(db,...path),{admin:true,revision:3,lastMutationId:'injection'}));
  await assertSucceeds(deleteDoc(doc(db,...path)));
});
test('linked course must exist within the same account',async()=>{
  await setDoc(doc(userDb('course-owner'),'users','course-owner','courses','foreign'),{...records.courses,...meta});
  const db=userDb('task-owner');
  await assertFails(setDoc(doc(db,'users','task-owner','tasks','bad'),{...records.tasks,courseId:'foreign',...meta}));
  await setDoc(doc(db,'users','task-owner','courses','own'),{...records.courses,...meta});
  await assertSucceeds(setDoc(doc(db,'users','task-owner','tasks','good'),{...records.tasks,courseId:'own',...meta}));
});
test('reject invalid progress, weekly goal, time, priority and unknown collections',async()=>{
  const db=userDb('validation');
  for(const progress of [-1,101,4.5])await assertFails(setDoc(doc(db,'users','validation','books','bad'),{...records.books,progress,...meta}));
  await assertFails(setDoc(doc(db,'users','validation','events','bad'),{...records.events,time:'25:00',...meta}));
  await assertFails(setDoc(doc(db,'users','validation','tasks','bad'),{...records.tasks,priority:'urgent',...meta}));
  await assertFails(setDoc(doc(db,'users','validation','anything','bad'),meta));
});
test('retry after lost acknowledgement does not duplicate or increment twice; stale draft never overwrites',async()=>{
  const db=userDb('retry');
  const command:Command={id:'first',uid:'retry',collection:'tasks',documentId:'task',expectedRevision:null,data:records.tasks};
  await executeCommand(db,command);await executeCommand(db,command);
  assert.equal((await getDoc(doc(db,'users','retry','tasks','task'))).data()?.revision,1);
  const update={...command,id:'second',expectedRevision:1,data:{...records.tasks,title:'Newer'}};
  await executeCommand(db,update);
  await assert.rejects(executeCommand(db,{...update,id:'stale',data:{...records.tasks,title:'Stale'}}),/draft-conflict/);
  assert.equal((await getDoc(doc(db,'users','retry','tasks','task'))).data()?.title,'Newer');
  await executeCommand(db,{...command,id:'delete',expectedRevision:2,data:null});
  await assert.rejects(executeCommand(db,{...update,id:'deleted-record'}),/draft-conflict/);
});
test('drafts remain separate by uid, retain data until removed, and expose storage failures',()=>{
  const memory=new Map<string,string>();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>memory.get(k)||null,setItem:(k:string,v:string)=>memory.set(k,v)}});
  const command:Command={id:'draft',uid:'A',collection:'tasks',documentId:'task',expectedRevision:null,data:records.tasks};
  storeDraft(command);assert.equal(readDrafts('B').length,0);assert.equal(readDrafts('A')[0].data?.title,'Assignment');
  storeDraft({...command,id:'edited',data:{...records.tasks,title:'Edited'}});assert.equal(readDrafts('A').length,1);
  removeDraft('A','edited');assert.equal(readDrafts('A').length,0);
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>{throw new Error('blocked');}}});
  assert.throws(()=>storeDraft(command),/blocked/);
  delete (globalThis as unknown as {localStorage?:unknown}).localStorage;
});
