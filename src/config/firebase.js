import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const DEFAULT_APP_ID = 'toporyx-architecture';

function getFirebaseConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const hasRequiredConfig = requiredKeys.every((key) => Boolean(config[key]));

  return hasRequiredConfig ? config : null;
}

export function initFirebase() {
  try {
    const firebaseConfig = getFirebaseConfig();
    if (!firebaseConfig) throw new Error('Missing required Firebase env configuration');

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const currentAppId = import.meta.env.VITE_TOPORYX_APP_ID ?? globalThis.__app_id ?? DEFAULT_APP_ID;
    return { app, auth, db, currentAppId };
  } catch (error) {
    console.warn('Firebase not configured. Running in strictly Local Mode.', error);
    return { app: null, auth: null, db: null, currentAppId: DEFAULT_APP_ID };
  }
}
