import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, relative, sep, isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';

const fail = message => {throw new Error(message);};
const text = (v, max, label, required = false) => {
  if(typeof v !== 'string' || v.length > max || (required && !v.trim())) fail(`Invalid ${label}`);
  return v;
};
const id = v => {if(typeof v !== 'string' || !/^[\w-]{1,128}$/.test(v)) fail('Invalid record identifier');return v;};
const integer = (v,min,max,label) => {if(!Number.isInteger(v)||v<min||v>max)fail(`Invalid ${label}`);return v;};
const choice = (v,values,label) => {if(!values.includes(v))fail(`Invalid ${label}`);return v;};
const date = v => {if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail('Invalid task date');return v;};
export function prepare(snapshot) {
  if(snapshot.formatVersion!==1)fail('Unsupported snapshot format');
  if(!snapshot.exportedAt || !Number.isFinite(Date.parse(snapshot.exportedAt)))fail('Missing snapshot timestamp');
  if(snapshot.mfaFactorCount!==0)fail('MFA needs a separate reviewed migration; nothing prepared');
  const kinds=['users','identities','profiles','courses','tasks','events','books'];
  for(const kind of kinds)if(!Array.isArray(snapshot[kind]))fail(`Missing ${kind} array`);
  const uidSet=new Set(), emails=new Set(), providerIds=new Set(), documents=[], authUsers=[], warnings=[];
  for(const user of snapshot.users){
    const uid=id(user.id),email=text(user.email,320,'email',true).toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('Invalid email');
    if(uidSet.has(uid)||emails.has(email))fail('Duplicate source user identifier or email');
    if(user.is_anonymous||user.phone)fail('Anonymous/phone accounts need a reviewed migration');
    uidSet.add(uid);emails.add(email);
    const hash=user.encrypted_password||'';
    if(hash && !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash))fail('Unsupported password hash; do not reset or replace silently');
    const providers=snapshot.identities.filter(i=>i.user_id===uid).map(identity=>{
      if(!['email','google'].includes(identity.provider))fail('Unsupported identity provider');
      if(identity.provider==='email')return null;
      const providerId=text(identity.provider_id,128,'Google subject',true);
      if(providerIds.has(providerId))fail('Duplicate Google identity');providerIds.add(providerId);
      return {providerId:'google.com',uid:providerId};
    }).filter(Boolean);
    if(!hash && !providers.length)fail('Account has no transferable sign-in method');
    if(user.banned_until && !Number.isFinite(Date.parse(user.banned_until)))fail('Invalid account ban timestamp');
    if(user.email_confirmed_at && !Number.isFinite(Date.parse(user.email_confirmed_at)))fail('Invalid email verification timestamp');
    authUsers.push({uid,email,emailVerified:!!user.email_confirmed_at,
      disabled:!!user.banned_until && Date.parse(user.banned_until)>Date.parse(snapshot.exportedAt),
      displayName:text(user.display_name||'',100,'display name'),
      ...(hash?{passwordHashBase64:Buffer.from(hash,'utf8').toString('base64')}:{}),providerData:providers});
  }
  for(const identity of snapshot.identities)if(!uidSet.has(identity.user_id))fail('Orphan identity');
  const seen=new Set();
  const add=(uid,kind,recordId,data)=>{
    if(!uidSet.has(uid))fail('Orphan study record');
    id(recordId);
    const path=kind==='profiles'?`users/${uid}`:`users/${uid}/${kind}/${recordId}`;
    if(seen.has(path))fail('Duplicate source document');seen.add(path);
    documents.push({path,data:{...data,revision:1,lastMutationId:'supabase-migration-v1'}});
  };
  const courseIndex=new Map();
  for(const c of snapshot.courses){
    add(c.user_id,'courses',c.id,{name:text(c.name,200,'course name',true),code:text(c.code,50,'course code'),color:text(c.color,100,'course color')});
    const key=JSON.stringify([c.user_id,c.name]);courseIndex.set(key,[...(courseIndex.get(key)||[]),c.id]);
  }
  const link=row=>{
    if(!uidSet.has(row.user_id))fail('Orphan study record');
    text(row.course,200,'course link');if(row.course==='')return '';
    const matches=courseIndex.get(JSON.stringify([row.user_id,row.course]))||[];
    if(matches.length!==1)fail('Missing or ambiguous course name; resolve source links before migration');
    return matches[0];
  };
  for(const p of snapshot.profiles)add(p.id,'profiles',p.id,{name:text(p.name,100,'profile name',true),weeklyGoal:integer(p.weekly_goal,1,99,'weekly goal')});
  // A missing profile is created only as the normal account default, and counted.
  for(const u of authUsers)if(!seen.has(`users/${u.uid}`)){
    add(u.uid,'profiles',u.uid,{name:u.displayName||'طالب',weeklyGoal:5});warnings.push('Missing profile initialized with documented defaults');
  }
  for(const t of snapshot.tasks){
    if(typeof t.done!=='boolean')fail('Invalid task completion flag');
    const completedAt=t.completed_at??null;
    if(completedAt!==null && (!t.done || !Number.isFinite(Date.parse(completedAt))))fail('Invalid completion timestamp');
    if(t.done&&completedAt===null)warnings.push('Completed task has unknown historical completion time; excluded from weekly time-based counts');
    add(t.user_id,'tasks',t.id,{title:text(t.title,500,'task title',true),courseId:link(t),due:date(t.due),priority:choice(t.priority,['low','medium','high'],'priority'),done:t.done,completedAt});
  }
  for(const e of snapshot.events){
    if(typeof e.time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(e.time))fail('Event time cannot be represented without precision loss');
    add(e.user_id,'events',e.id,{title:text(e.title,500,'event title',true),courseId:link(e),day:choice(e.day,['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'day'),time:e.time.slice(0,5),kind:choice(e.kind,['class','exam'],'event kind')});
  }
  for(const b of snapshot.books)add(b.user_id,'books',b.id,{title:text(b.title,500,'book title',true),author:text(b.author,200,'author'),progress:integer(b.progress,0,100,'progress'),status:choice(b.status,['planned','reading','finished'],'book status'),note:text(b.note,20000,'book note')});
  return {formatVersion:1,sourceExportedAt:snapshot.exportedAt,authUsers,documents,
    report:{sourceCounts:Object.fromEntries(kinds.map(k=>[k,snapshot[k].length])),targetUsers:authUsers.length,targetDocuments:documents.length,warnings}};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const [input,output]=process.argv.slice(2);if(!input||!output)fail('Usage: node scripts/migration/prepare.mjs <snapshot.json> <migration-private/output>');
    const root=resolve('migration-private'),dest=resolve(output),rel=relative(root,dest);
    if(rel===''||rel==='..'||isAbsolute(rel)||rel.startsWith('..'+sep)||resolve(input)===resolve(dest,'prepared.json'))fail('Use a new output subdirectory inside migration-private');
    const raw=await readFile(input,'utf8');const result=prepare(JSON.parse(raw));
    result.sourceSha256=createHash('sha256').update(raw).digest('hex');
    await mkdir(dest,{recursive:true});
    await writeFile(resolve(dest,'prepared.json'),JSON.stringify(result,null,2),{flag:'wx',mode:0o600});
    console.log(JSON.stringify(result.report)); // No emails, hashes, identities or study text.
  }catch(error){console.error(error.message);process.exitCode=1;}
}
