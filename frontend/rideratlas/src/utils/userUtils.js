/**
 * Gets or creates a persistent anonymous user ID.
 * This ensures we can track a user's plan across reloads 
 * before they authenticate.
 */
export function getAnonUserId() {
  const STORAGE_KEY = 'rider_atlas_anon_id';
  
  // 1. Try to get from local storage
  let userId = localStorage.getItem(STORAGE_KEY);

  // 2. If missing, generate a new one
  if (!userId) {
    // Generate a random string like "anon_x9s8f7d6..."
    const randomPart = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    userId = `anon_${randomPart}`;
    
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}
