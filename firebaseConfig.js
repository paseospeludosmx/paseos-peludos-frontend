// firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXkGHwJSIUe8VzLvBVlIPGmud09wspxE",
  authDomain: "paseospeludos-659aa.firebaseapp.com",
  projectId: "paseospeludos-659aa",
  storageBucket: "paseospeludos-659aa.appspot.com",
  messagingSenderId: "112053971214",
  appId: "1:112053971214:web:65bd77bbc8b3c132810f5f"
};

// ✅ Aseguramos que solo se inicialice una vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

export { db };
