import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepare} from '../scripts/migration/prepare.mjs';
import {sample} from './fixtures/migration.mjs';
test('preserves ids, password hashes, Google identity, private text and course links without inventing completion time',()=>{
 const source=sample(),p=prepare(source);
 assert.equal(p.authUsers[0].uid,'owner');assert.equal(Buffer.from(p.authUsers[0].passwordHashBase64,'base64').toString(),source.users[0].encrypted_password);
 assert.equal(p.authUsers[0].providerData[0].uid,'google-subject');
 assert.equal(p.documents.find(d=>d.path.endsWith('/t1')).data.courseId,'c1');
 assert.equal(p.documents.find(d=>d.path.endsWith('/t1')).data.completedAt,null);
 assert.equal(p.documents.find(d=>d.path.endsWith('/b1')).data.note,'ملخص خاص');assert.equal(p.documents.length,5);
 assert(!JSON.stringify(p.report).includes('student@example.com'));
});
test('rejects ambiguous and missing course references',()=>{
 const s=sample();s.courses.push({...s.courses[0],id:'c2'});assert.throws(()=>prepare(s),/ambiguous/);
 s.courses=[];assert.throws(()=>prepare(s),/Missing/);
});
test('rejects orphan records, duplicate accounts and unsafe paths',()=>{
 let s=sample();s.tasks[0].user_id='other';assert.throws(()=>prepare(s),/Orphan/);
 s=sample();s.users.push({...s.users[0],id:'other'});assert.throws(()=>prepare(s),/Duplicate/);
 s=sample();s.tasks[0].id='x/y';assert.throws(()=>prepare(s),/identifier/);
});
test('rejects unsupported login methods, hashes and MFA instead of silently dropping them',()=>{
 let s=sample();s.identities[0].provider='github';assert.throws(()=>prepare(s),/provider/);
 s=sample();s.users[0].encrypted_password='unsupported';assert.throws(()=>prepare(s),/hash/);
 s=sample();s.mfaFactorCount=1;assert.throws(()=>prepare(s),/MFA/);
});
test('rejects loss of precision or invalid values, does not truncate data',()=>{
 let s=sample();s.events[0].time='09:00:30';assert.throws(()=>prepare(s),/precision/);
 s=sample();s.tasks[0].due='2026-02-30';assert.throws(()=>prepare(s),/date/);
 s=sample();s.books[0].note='x'.repeat(20001);assert.throws(()=>prepare(s),/note/);
});
