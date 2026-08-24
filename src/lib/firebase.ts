import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

const rawConfig = firebaseConfig as any;

let dbInstance;
try {
  const databaseId = rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== "(default)"
    ? rawConfig.firestoreDatabaseId
    : undefined;

  dbInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    databaseId
  );
} catch (e) {
  dbInstance = rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== "(default)"
    ? getFirestore(app, rawConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/calendar.events");
googleProvider.addScope("https://www.googleapis.com/auth/spreadsheets");
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
