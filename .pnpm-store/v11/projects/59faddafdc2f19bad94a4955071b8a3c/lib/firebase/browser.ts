import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { firebaseConfig } from "./config";

let services: ReturnType<typeof createServices> | undefined;
function createServices() {
  const emulated = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true";
  if (emulated && !["localhost", "127.0.0.1"].includes(window.location.hostname)) throw new Error("Emulators require localhost");
  const config = emulated ? { ...firebaseConfig, projectId: "demo-growspace", apiKey: "demo-key" } : firebaseConfig;
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  // Account data is read from the server; unsynced drafts use a separate per-account store.
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  if (emulated) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return { auth, db };
}
export function getFirebase() {
  if (typeof window === "undefined") return null;
  return services ??= createServices();
}
