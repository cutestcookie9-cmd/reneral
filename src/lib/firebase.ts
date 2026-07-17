import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';

interface ImportMetaEnv {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_DATABASE_URL: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}

const firebaseConfig = {
  apiKey: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_APP_ID,
  databaseURL: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_DATABASE_URL,
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let database: Database;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
  database = getDatabase(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  database = getDatabase(app);
}

export { app, auth, firestore, database };
