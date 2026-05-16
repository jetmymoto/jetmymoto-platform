import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFunctions,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCjdLN_NjZY03wnSGxO3ojKTmYoWcacxag",
  authDomain: "movie-chat-factory.firebaseapp.com",
  projectId: "movie-chat-factory",
  storageBucket: "movie-chat-factory.firebasestorage.app",
  messagingSenderId: "778225783812",
  appId: "1:778225783812:web:0d6e647fe84e6c0b291151",
  measurementId: "G-H56HC5NNQG",
};

let firebaseApp;

try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn("Firebase re-init caught, using existing app.", error);
  firebaseApp = getApp();
}

// Export both names so old/new imports work.
export const app = firebaseApp;
export { firebaseApp };

export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);

// IMPORTANT: match deployed callable region.
export const functions = getFunctions(firebaseApp, "us-central1");

// Prevent Vite hot reload from connecting emulator multiple times.
if (import.meta.env.DEV && !globalThis.__FIREBASE_FUNCTIONS_EMULATOR_CONNECTED__) {
  const isLocalhost = 
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1";

  const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";

  if (isLocalhost && useEmulator) {
    console.log("[Firebase] Connecting to Functions emulator at 127.0.0.1:5001");
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  } else {
    console.log("[Firebase] Using deployed Functions (us-central1)");
  }
  globalThis.__FIREBASE_FUNCTIONS_EMULATOR_CONNECTED__ = true;
}

export const provider = new GoogleAuthProvider();

export const analytics = isSupported().then((yes) =>
  yes ? getAnalytics(firebaseApp) : null
);

export default firebaseApp;