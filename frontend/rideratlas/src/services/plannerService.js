const PROJECT_ID = "movie-chat-factory";
const REGION = "us-central1";
const BASE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/plannerGateway`;

export async function updateWaypoints(planId, waypoints) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "UPDATE_WAYPOINTS",
      planId,
      waypoints
    })
  });
  
  if (!res.ok) throw new Error("Failed to update waypoints");
  return res.json();
}

export async function compileRoute(planId) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "COMPILE_ROUTE", planId })
  });
  
  if (!res.ok) throw new Error("Failed to compile route");
  return res.json();
}
