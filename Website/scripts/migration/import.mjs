// Administrative CLI only. Never import from app/features or expose in a route.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {prepare} from './prepare.mjs';
import {cliCredential,cliFirestore} from './cli-credential.mjs';

async function main(){
  const [input,project,mode]=process.argv.slice(2);
  if(!input||!['growspace-c516a','demo-growspace'].includes(project)||!['--check','--apply'].includes(mode))throw new Error('Usage: import.mjs <source.json> <growspace-c516a|demo-growspace> <--check|--apply>');
  const emulated=project==='demo-growspace';
  if(emulated && (process.env.FIREBASE_AUTH_EMULATOR_HOST!=='127.0.0.1:9099'||process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080'))throw new Error('Both local emulators must be configured explicitly');
  if(!emulated && (process.env.FIREBASE_AUTH_EMULATOR_HOST||process.env.FIRESTORE_EMULATOR_HOST))throw new Error('Production cannot run with emulator variables');
  if(!emulated && mode==='--apply' && process.env.GROWSPACE_MIGRATION_WRITES_PAUSED!=='true')throw new Error('Pause source writes and target account/data changes before production apply; set GROWSPACE_MIGRATION_WRITES_PAUSED=true only after doing so');
  const raw=await readFile(input,'utf8'),plan=prepare(JSON.parse(raw));
  const digest=createHash('sha256').update(raw).digest('hex');
  const journalPath=resolve(dirname(input),`import-${project}.journal.json`);
  let journal={sourceSha256:digest,project,authCreated:[]};
  try{journal=JSON.parse(await readFile(journalPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  if(journal.sourceSha256!==digest||journal.project!==project||!Array.isArray(journal.authCreated))throw new Error('Journal belongs to another snapshot or target');
  const credential=!emulated&&(process.env.GROWSPACE_USE_CLI_LOGIN==='true')?await cliCredential(project):applicationDefault();
  const app=initializeApp(emulated?{projectId:project}:{projectId:project,credential});
  const auth=getAuth(app),db=!emulated&&process.env.GROWSPACE_USE_CLI_LOGIN==='true'?cliFirestore(project):getFirestore(app);
  const lookup=async(fn)=>{try{return await fn();}catch(e){if(e.code==='auth/user-not-found')return null;throw e;}};
  const sameUser=(existing,u)=>existing.uid===u.uid&&existing.email?.toLowerCase()===u.email&&existing.emailVerified===u.emailVerified&&existing.disabled===u.disabled
    &&(existing.displayName||'')===u.displayName
    &&u.providerData.every(p=>existing.providerData.some(e=>e.providerId===p.providerId&&e.uid===p.uid))
    &&existing.providerData.filter(p=>p.providerId!=='password').length===u.providerData.length;
  // Complete read-only preflight before the first mutation. Never merge by email.
  for(const u of plan.authUsers){
    const existing=await lookup(()=>auth.getUser(u.uid));
    if(existing && (!journal.authCreated.includes(u.uid)||!sameUser(existing,u)))throw new Error('Existing target account conflicts with source; manual identity review required');
    const emailOwner=await lookup(()=>auth.getUserByEmail(u.email));
    if(emailOwner&&emailOwner.uid!==u.uid)throw new Error('Email already belongs to a different target uid');
    for(const p of u.providerData){const providerOwner=await lookup(()=>auth.getUserByProviderUid(p.providerId,p.uid));if(providerOwner&&providerOwner.uid!==u.uid)throw new Error('Google identity already belongs to another target uid');}
  }
  const expectedPaths=new Set(plan.documents.map(d=>d.path));
  for(const u of plan.authUsers){
    const collections=await db.doc(`users/${u.uid}`).listCollections();
    for(const collection of collections){
      const records=await collection.listDocuments();
      if(records.some(r=>!expectedPaths.has(r.path)))throw new Error('Unexpected target account data; source cannot replace it');
    }
  }
  for(const entry of plan.documents){const existing=await db.doc(entry.path).get();if(existing.exists&&!isDeepStrictEqual(existing.data(),entry.data))throw new Error('Target document differs; refusing to overwrite');}
  console.log(JSON.stringify({phase:'preflight',mode,...plan.report}));
  if(mode==='--check')return;
  await writeFile(journalPath,JSON.stringify(journal),{mode:0o600});
  for(const u of plan.authUsers){
    if(journal.authCreated.includes(u.uid))continue;
    const {passwordHashBase64,displayName,...rest}=u;
    const record={...rest,...(displayName?{displayName}:{}),...(passwordHashBase64?{passwordHash:Buffer.from(passwordHashBase64,'base64')}:{})};
    const result=await auth.importUsers([record],{hash:{algorithm:'BCRYPT'}});
    if(result.failureCount)throw new Error(`Account import failed (${result.errors[0]?.error.code}); no source data changed`);
    journal.authCreated.push(u.uid);
    await writeFile(journalPath,JSON.stringify(journal),{mode:0o600});
  }
  for(const entry of plan.documents){
    await db.runTransaction(async tx=>{
      const ref=db.doc(entry.path),current=await tx.get(ref);
      if(current.exists){if(!isDeepStrictEqual(current.data(),entry.data))throw new Error('Concurrent target change; refusing overwrite');return;}
      tx.create(ref,entry.data);
    });
  }
  for(const u of plan.authUsers){if(!sameUser(await auth.getUser(u.uid),u))throw new Error('Imported identity verification failed');}
  for(const entry of plan.documents){if(!isDeepStrictEqual((await db.doc(entry.path).get()).data(),entry.data))throw new Error('Imported document verification failed');}
  console.log(JSON.stringify({phase:'verified',users:plan.authUsers.length,documents:plan.documents.length,
    note:'Data matched this snapshot. Live sign-in, source write freeze/delta reconciliation and cutover approval still required. Source was not deleted.'}));
}
main().catch(error=>{console.error(error.code||error.message);process.exitCode=1;});
