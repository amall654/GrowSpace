import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID,randomBytes} from 'node:crypto';
import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {cliCredential,cliFirestore} from './cli-credential.mjs';
const project='growspace-c516a';
const credential=await cliCredential(project),db=cliFirestore(project);
const auth=getAuth(initializeApp({projectId:project,credential}));
const source=JSON.parse(await readFile('migration-private/source.json','utf8'));
const all=await auth.listUsers(1000);
for(const original of source.users){
 const user=all.users.find(u=>u.uid===original.id);
 assert(user && user.email===original.email && user.emailVerified);
 assert.equal(Buffer.from(user.passwordHash,'base64').toString('utf8'),original.encrypted_password,'Imported password hash mismatch');
}
console.log('Both imported account identities and bcrypt password hashes match the source');
const uid='migration-check-'+randomUUID(),email=uid+'@example.invalid',password=randomBytes(24).toString('base64url');
let created=false;
try{
 await auth.createUser({uid,email,password,emailVerified:true});created=true;
 const key='AIzaSyA787Kz4pYJK91XVpMeOIaTRpOB6DlRRpU';
 const login=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
 const session=await login.json();assert.equal(login.status,200,session.error?.message);assert.equal(session.localId,uid);
 const root=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`;
 const headers={Authorization:`Bearer ${session.idToken}`,'Content-Type':'application/json'};
 const path=`/users/${uid}/tasks/check`;
 const fields={title:{stringValue:'Migration verification'},courseId:{stringValue:''},due:{stringValue:'2026-09-14'},priority:{stringValue:'low'},done:{booleanValue:false},completedAt:{nullValue:null},revision:{integerValue:'1'},lastMutationId:{stringValue:'verification'}};
 assert.equal((await fetch(root+path,{method:'PATCH',headers,body:JSON.stringify({fields})})).status,200,'Own task save failed');
 const restored=await fetch(root+path,{headers});assert.equal(restored.status,200);assert.equal((await restored.json()).fields.title.stringValue,'Migration verification');
 assert.equal((await fetch(root+`/users/${source.users[0].id}`,{headers})).status,403,'Cross-account read must be denied');
 assert.equal((await fetch(root+path)).status,403,'Anonymous read must be denied');
 console.log('Live password sign-in, server save/read, account isolation and anonymous denial passed');
}finally{
 if(created){await db.recursiveDelete(db.doc(`users/${uid}`));await auth.deleteUser(uid);console.log('Temporary verification account and records removed');}
 await db.terminate();
}
