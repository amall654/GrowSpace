import {readFile,writeFile} from 'node:fs/promises';
import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {cliCredential} from './cli-credential.mjs';
const project='growspace-c516a',mode=process.argv[2];
if(!['pause','resume','inspect'].includes(mode))throw Error('Expected pause, resume or inspect');
const credential=await cliCredential(project);
const token=await credential.getAccessToken();
const root=`https://identitytoolkit.googleapis.com/admin/v2/projects/${project}`;
async function request(path,body){
 const response=await fetch(root+path,{method:body?'PATCH':'GET',headers:{Authorization:`Bearer ${token.access_token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json();if(!response.ok)throw Error(data.error?.message||`HTTP ${response.status}`);return data;
}
const config=await request('/config');
const provider=await request('/defaultSupportedIdpConfigs/google.com');
const auth=getAuth(initializeApp({projectId:project,credential}));
const users=await auth.listUsers(1000);
console.log(JSON.stringify({emailEnabled:config.signIn?.email?.enabled,googleEnabled:provider.enabled,domains:config.authorizedDomains,users:users.users.length,moreUsers:!!users.pageToken,signupDisabled:!!config.client?.permissions?.disabledUserSignup}));
const backup='migration-private/target-permissions.json';
if(mode==='pause'){
 if(users.users.length||users.pageToken)throw Error('Target must be empty before initial migration maintenance');
 await writeFile(backup,JSON.stringify(config.client?.permissions||{}),{flag:'wx',mode:0o600});
 await request('/config?updateMask=client.permissions.disabledUserSignup',{client:{permissions:{disabledUserSignup:true}}});
 console.log('Target signup paused');
}
if(mode==='resume'){
 const previous=JSON.parse(await readFile(backup,'utf8'));
 await request('/config?updateMask=client.permissions.disabledUserSignup',{client:{permissions:{disabledUserSignup:!!previous.disabledUserSignup}}});
 console.log('Target signup restored');
}
