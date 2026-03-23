const ENGINE_URL = "https://poster-engine-778225783812.us-central1.run.app/generate-poster";

export async function createAdminPoster(payload) {
  const res = await fetch(ENGINE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Poster engine error (${res.status})`);
  }

  return res.json();
}
