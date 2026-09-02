import { ar, authAr, dashboardAr } from "./ar";
import { authEn, dashboardEn, en } from "./en";

export { type AuthCopy, type DashboardCopy, type HomeCopy, type Language } from "./types";

export const homeCopy = { ar, en };
export const dashboardCopy = { ar: dashboardAr, en: dashboardEn };
export const authCopy = { ar: authAr, en: authEn };
