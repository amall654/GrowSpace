export const sample=()=>({formatVersion:1,exportedAt:'2026-09-10T00:00:00Z',mfaFactorCount:0,
  users:[{id:'owner',email:'student@example.com',encrypted_password:'$2b$10$'+'A'.repeat(53),display_name:'Student',email_confirmed_at:'2026-09-01T00:00:00Z'}],
  identities:[{user_id:'owner',provider:'google',provider_id:'google-subject'}],profiles:[{id:'owner',name:'طالب',weekly_goal:5}],
  courses:[{id:'c1',user_id:'owner',name:'رياضيات',code:'M1',color:'bg-sky-100 text-sky-700'}],
  tasks:[{id:'t1',user_id:'owner',title:'واجب',course:'رياضيات',due:'2026-09-12',priority:'high',done:true}],
  events:[{id:'e1',user_id:'owner',title:'محاضرة',course:'رياضيات',day:'Sunday',time:'09:00:00',kind:'class'}],
  books:[{id:'b1',user_id:'owner',title:'كتاب',author:'كاتب',note:'ملخص خاص',status:'reading',progress:40}]});