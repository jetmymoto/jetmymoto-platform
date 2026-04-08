import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

/**
 * Fetch a single entry from the asset_library.
 * @param {string} entityType - e.g., 'destination', 'route', 'rental'
 * @param {string} entityId - e.g., 'abruzzo-gran-sasso'
 * @returns {Promise<Object|null>}
 */
export async function getAssetLibraryEntry(entityType, entityId) {
  const libraryId = `${entityType}_${entityId}`;
  const docRef = doc(db, "asset_library", libraryId);
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/**
 * Subscribe to an asset_library entry for real-time updates (useful for status flow).
 * @param {string} entityType 
 * @param {string} entityId 
 * @param {Function} callback 
 * @returns {Function} - unsubscribe function
 */
export function subscribeToAssetLibraryEntry(entityType, entityId, callback) {
  const libraryId = `${entityType}_${entityId}`;
  const docRef = doc(db, "asset_library", libraryId);
  
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback(null);
    }
  });
}
