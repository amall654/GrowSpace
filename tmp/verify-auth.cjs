const {chromium}=require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 let mode='invalid',authRequests=0,profileCreated=false;
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'qa@example.com',app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:new Date().toISOString()};
 const session={access_token:'qa-access-token',refresh_token:'qa-refresh-token',token_type:'bearer',expires_in:3600,user};
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await context.route('https://*.supabase.co/**', async route=>{
 const req=route.request(),url=new URL(req.url());
 const send=(status,body)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body?.code ? {...body,error_code:body.code} : body)});
 if(url.pathname.startsWith('/auth/v1/')){
 if(url.pathname.endsWith('/logout'))return send(204,null);
 if(url.pathname.endsWith('/user'))return send(200,user);
 authRequests++;
 if(mode==='network')return route.abort('internetdisconnected');
 if(mode==='invalid')return send(400,{code:'invalid_credentials',msg:'Invalid login credentials'});
 if(mode==='unconfirmed')return send(400,{code:'email_not_confirmed',msg:'Email not confirmed'});
 if(mode==='limited')return send(429,{code:'over_request_rate_limit',msg:'Too many requests'});
 if(mode==='confirmation')return send(200,{...user,identities:[]});
 if(url.pathname.endsWith('/signup')){assert(url.searchParams.get('redirect_to').endsWith('/login/'));assert.equal(req.postDataJSON().password,'qa-password-123');}
 return send(200,session);
 }
 if(url.pathname.startsWith('/rest/v1/')){
 if(mode==='load-error')return send(403,{code:'42501',message:'permission denied'});
 if(url.pathname.endsWith('/profiles')){
 if(req.method()==='POST'){profileCreated=true;return send(201,null);}
 return send(200,profileCreated?{id:user.id,name:'QA Student',weekly_goal:5}:null);
 }
 return send(200,[]);
 }
 throw new Error('Unexpected request '+url.pathname);
 });
 await page.goto('http://127.0.0.1:3000/login/?mode=signup');
 await page.getByRole('heading',{name:'ابدأ مساحتك الدراسية'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'المتابعة باستخدام Google'}).count(),0);
 await page.locator('[name=email]').fill('qa@example.com');await page.locator('[name=password]').fill('qa-password-123');await page.locator('[name=confirmPassword]').fill('different-password');
 await page.getByRole('button',{name:'إنشاء حساب',exact:true}).click();await page.getByRole('status').filter({hasText:'غير متطابقتين'}).waitFor();assert.equal(authRequests,0);
 await page.getByRole('button',{name:'تسجيل الدخول',exact:true}).click();
 await page.getByRole('button',{name:'تسجيل الدخول',exact:true}).click();await page.getByRole('status').filter({hasText:'غير صحيحة'}).waitFor();
 mode='unconfirmed';await page.getByRole('button',{name:'تسجيل الدخول',exact:true}).click();await page.getByRole('button',{name:'إعادة إرسال رابط التأكيد'}).waitFor();
 mode='limited';await page.getByRole('button',{name:'تسجيل الدخول',exact:true}).click();await page.getByRole('status').filter({hasText:'محاولات كثيرة'}).waitFor();
 mode='success';await page.getByRole('button',{name:'إنشاء حساب',exact:true}).click();await page.locator('[name=confirmPassword]').fill('qa-password-123');await page.getByRole('button',{name:'إنشاء حساب',exact:true}).click();
 await page.waitForURL('**/dashboard/');await page.getByText('QA Student',{exact:false}).first().waitFor();assert(profileCreated);
 await page.reload();await page.getByText('QA Student',{exact:false}).first().waitFor();
 mode='load-error';await page.reload();await page.getByRole('alert').filter({hasText:'تعذر تحميل بيانات الحساب'}).waitFor();assert.equal(await page.locator('form').count(),0);
 mode='success';await page.getByRole('button',{name:'إعادة المحاولة'}).click();await page.getByText('QA Student',{exact:false}).first().waitFor();
 await page.getByRole('button',{name:'تسجيل الخروج',exact:true}).click();await page.waitForURL('**/login/');
 assert.deepEqual(errors,[]);await page.screenshot({path:'C:/Users/HP/Documents/project/tmp/auth-login-qa.png',fullPage:true});
 console.log('PASS: signup mismatch, invalid credentials, unconfirmed email, rate limits, signup redirect, profile initialization, persisted session, load failure/retry, signout; zero browser errors. All backend writes mocked.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
