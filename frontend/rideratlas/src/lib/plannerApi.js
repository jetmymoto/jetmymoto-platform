const DEFAULT_BASE =
  "https://us-central1-movie-chat-factory.cloudfunctions.net/plannerGateway";

export function getPlannerBase() {
  return (import.meta.env.VITE_PLANNER_API_BASE || DEFAULT_BASE).replace(/\/$/, "");
}

async function postJson(path, payload) {
  const url = `${getPlannerBase()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.error || data?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

export const plannerApi = {
  createPlan: (payload) => postJson("/createPlan", payload),
  telemetry: (payload) => postJson("/telemetry", payload),
  enrich: (payload) => postJson("/enrich", payload),
};
