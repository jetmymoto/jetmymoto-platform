import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

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