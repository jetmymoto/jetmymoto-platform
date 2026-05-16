import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin using Application Default Credentials
// It relies on GOOGLE_APPLICATION_CREDENTIALS environment variable
if (getApps().length === 0) {
  initializeApp({
    projectId: 'movie-chat-factory'
  });
}

export const db = getFirestore();
