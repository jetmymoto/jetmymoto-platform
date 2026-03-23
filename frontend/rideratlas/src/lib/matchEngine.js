import { API_URL } from "@/config/api";

export async function getBestOptionLive(from, to) {
  try {
    const res = await fetch(`${API_URL}/getRouteMatches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to })
    });

    if (!res.ok) {
      console.warn(`Match engine HTTP error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!data || !data.success) return null;

    if (data.type === "join") {
      return {
        type: "join",
        message: `${data.data.riders || 1} riders already on this route`,
        cta: "Join Pool",
        poolId: data.data.poolId
      };
    }

    return {
      type: "create",
      message: "Be the first rider on this route",
      cta: "Start Pool"
    };

  } catch (err) {
    console.error("Match engine error", err);
    return null;
  }
}
