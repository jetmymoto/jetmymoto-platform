// SMART BRIDGE: Connects old imports to new locations
import { db, auth, provider, storage, analytics } from './lib/firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';

// Export everything the old files are looking for
export { 
  db, 
  auth, 
  provider, 
  storage, 
  analytics,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider
};
