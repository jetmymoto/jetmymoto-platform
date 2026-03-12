export function getAnonUserId() {
  const key = "ra_anon_user_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `anon_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
    localStorage.setItem(key, id);
  }
  return id;
}