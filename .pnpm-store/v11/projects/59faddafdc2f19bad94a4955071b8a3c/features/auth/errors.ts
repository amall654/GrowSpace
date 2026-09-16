export function authErrorMessage(error: unknown, arabic: boolean): string {
  const code = (error as {code?:string})?.code || "";
  const messages: Record<string,[string,string]> = {
    "auth/invalid-credential":["البريد أو كلمة المرور غير صحيحة.","The email or password is incorrect."],
    "auth/wrong-password":["البريد أو كلمة المرور غير صحيحة.","The email or password is incorrect."],
    "auth/user-not-found":["البريد أو كلمة المرور غير صحيحة.","The email or password is incorrect."],
    "auth/email-already-in-use":["هذا البريد مسجل. سجّل الدخول أو استعد كلمة المرور.","This email is registered. Sign in or reset your password."],
    "auth/invalid-email":["أدخل بريدًا إلكترونيًا صالحًا.","Enter a valid email address."],
    "auth/weak-password":["اختر كلمة مرور أقوى من 6 أحرف على الأقل.","Choose a stronger password with at least 6 characters."],
    "auth/too-many-requests":["محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.","Too many attempts. Wait a little and try again."],
    "auth/network-request-failed":["تعذر الاتصال. تحقق من الإنترنت وأعد المحاولة.","Unable to connect. Check your internet connection and retry."],
    "auth/popup-closed-by-user":["أُلغيت نافذة تسجيل Google. يمكنك المحاولة مجددًا.","Google sign-in was cancelled. You can try again."],
    "auth/cancelled-popup-request":["توجد محاولة دخول أخرى. أكملها أو أعد المحاولة.","Another sign-in is in progress. Complete it or retry."],
    "auth/popup-blocked":["اسمح بالنافذة المنبثقة لتسجيل Google ثم أعد المحاولة.","Allow the Google sign-in popup and retry."],
    "auth/unauthorized-domain":["عنوان الموقع غير مهيأ لتسجيل الدخول. تواصل مع مسؤول المنصة.","This site address is not configured for sign-in. Contact the platform owner."],
    "auth/operation-not-allowed":["طريقة الدخول غير مفعلة حاليًا.","This sign-in method is not enabled."],
    "auth/account-exists-with-different-credential":["استخدم طريقة الدخول المرتبطة بحسابك الحالي.","Use the sign-in method associated with your existing account."],
    "auth/expired-action-code":["انتهت صلاحية الرابط. اطلب رابطًا جديدًا.","This link has expired. Request a new one."],
    "auth/invalid-action-code":["الرابط غير صالح أو استُخدم سابقًا. اطلب رابطًا جديدًا.","This link is invalid or already used. Request a new one."],
  };
  return (messages[code] || ["تعذر إتمام العملية. أعد المحاولة أو تواصل مع مسؤول المنصة.","Unable to complete this action. Retry or contact the platform owner."])[arabic?0:1];
}
export function authRedirectUrl(path: "/login/" | "/reset-password/") {
  return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
