import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAB6Ud5S2jqlD3CVZ0N3djxTbm0SMOWzUQ",
  authDomain: "jaalloop-4d51a.firebaseapp.com",
  databaseURL: "https://jaalloop-4d51a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jaalloop-4d51a",
  storageBucket: "jaalloop-4d51a.firebasestorage.app",
  messagingSenderId: "240707494665",
  appId: "1:240707494665:web:eaba75ff464d9e1eaa29d8",
  measurementId: "G-01HBBZXR0X"
};

let app  = null;
let db   = null;
let auth = null;

try {
  app  = initializeApp(firebaseConfig);
  db   = getDatabase(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("[JalLoop] Firebase init failed:", e.message);
}

export { db, auth };
export const isFirebaseReady = !!db && firebaseConfig.apiKey !== "YOUR_API_KEY";
