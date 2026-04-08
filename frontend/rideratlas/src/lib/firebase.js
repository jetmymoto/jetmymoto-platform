import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCjdLN_NjZY03wnSGxO3ojKTmYoWcacxag",
  authDomain: "movie-chat-factory.firebaseapp.com",
  projectId: "movie-chat-factory",
  storageBucket: "movie-chat-factory.firebasestorage.app",
  messagingSenderId: "778225783812",
  appId: "1:778225783812:web:0d6e647fe84e6c0b291151",
  measurementId: "G-H56HC5NNQG"
};

// PREVENT DUPLICATE APP ERRORS
let firebaseApp;
try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn("Firebase re-init caught, using existing app.");
  firebaseApp = getApp();
}

// EXPORT EVERYTHING NEEDED
export { firebaseApp };
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);
export const functions = getFunctions(firebaseApp);
export const provider = new GoogleAuthProvider();
export const analytics = isSupported().then(yes => yes ? getAnalytics(firebaseApp) : null);

export default firebaseApp;
