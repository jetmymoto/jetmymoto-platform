import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export async function generateMission(payload) {
  const fn = httpsCallable(functions, "generateMission");
  const res = await fn(payload);
  return res.data;
}

export async function dispatchDirector(payload) {
  const fn = httpsCallable(functions, "dispatchDirector");
  const res = await fn(payload);
  return res.data;
}