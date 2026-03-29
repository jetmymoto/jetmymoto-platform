import { API_URL } from "@/config/api";

export async function geocodeCity(city) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY";
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`
  );
  
  if (!res.ok) throw new Error("Geocoding failed");
  
  const data = await res.json();
  const loc = data.results[0]?.geometry?.location;
  return loc || null;
}

export async function createMotoQuote(payload) {
  const res = await fetch(`${API_URL}/createMotoQuote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }
  
  return data;
}

export async function createRentalReservation(payload) {
  const res = await fetch(`${API_URL}/createRentalReservation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data?.error || "Reservation failed");
  }

  return data;
}

export async function createCheckoutSession(payload) {
  const res = await fetch(`${API_URL}/createCheckoutSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data?.error || "Checkout session failed");
  }

  return data;
}
