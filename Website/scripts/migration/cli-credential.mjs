import {createRequire} from 'node:module';
import {Firestore} from 'firebase-admin/firestore';
const require=createRequire(import.meta.url);
export function cliFirestore(project){
  const account=require('firebase-tools/lib/auth').getGlobalDefaultAccount();
  if(!account)throw new Error('Firebase CLI login required');
  const api=require('firebase-tools/lib/api');
  return new Firestore({projectId:project,credentials:{type:'authorized_user',client_id:api.clientId(),client_secret:api.clientSecret(),refresh_token:account.tokens.refresh_token}});
}

// Reuse the operator's explicit Firebase CLI login; never persist or log tokens.
export async function cliCredential(project){
  const auth=require('firebase-tools/lib/auth');
  const {requireAuth}=require('firebase-tools/lib/requireAuth');
  const account=auth.getGlobalDefaultAccount();
  if(!account)throw new Error('Firebase CLI login required');
  const options={...account,project};
  await requireAuth(options);
  return {getAccessToken:async()=>{
    const token=await auth.getAccessToken(account.tokens.refresh_token,options.authScopes);
    return {access_token:token.access_token,expires_in:Math.max(1,Math.floor((token.expires_at-Date.now())/1000))};
  }};
}
