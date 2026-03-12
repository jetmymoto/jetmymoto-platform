import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";


export default function PlannerPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  // Deployment params (user-tweakable)
  const [startDate, setStartDate] = useState("");
  const [bikeMode, setBikeMode] = useState("own"); // own | rental
  const [bikeChoice, setBikeChoice] = useState("");
  const [airport, setAirport] = useState("");

  // 1️⃣ Load mission blueprint
  useEffect(() => {
    async function loadMission() {
      const ref = doc(db, "missions_v5", missionId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMission({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }
    loadMission();
  }, [missionId]);

  async function handleDeploy() {
    setDeploying(true);

    const planDoc = {
      baseMissionId: mission.id,
      status: "DRAFT", // DRAFT → READY → QUOTED → BOOKED
      source: "mission_deploy",
      anonId: localStorage.getItem("anonId") || null,

      deploymentParams: {
        startDate,
        bikeMode,
        bikeChoice: bikeMode === "rental" ? bikeChoice : null,
        insertionAirport: airport || null,
      },

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, "plans"), planDoc);
    navigate(`/plan/${ref.id}`);
  }

  if (loading || !mission) {
    return <div className="h-screen bg-black text-white flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">


      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        <h1 className="text-4xl font-black">{mission.title}</h1>
        <p className="text-zinc-400">{mission.intel?.briefing_master}</p>

        {/* Deployment Params */}
        <div className="grid gap-6 border border-white/10 p-6 rounded-lg bg-zinc-950">

          <div>
            <label className="block text-xs uppercase mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-black border border-white/10 px-4 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-xs uppercase mb-2">Bike</label>
            <select
              value={bikeMode}
              onChange={e => setBikeMode(e.target.value)}
              className="bg-black border border-white/10 px-4 py-2 w-full"
            >
              <option value="own">Bring My Own</option>
              <option value="rental">Rental</option>
            </select>
          </div>

          {bikeMode === "rental" && (
            <div>
              <label className="block text-xs uppercase mb-2">Preferred Bike</label>
              <input
                value={bikeChoice}
                onChange={e => setBikeChoice(e.target.value)}
                placeholder="BMW R1300GS"
                className="bg-black border border-white/10 px-4 py-2 w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase mb-2">Arrival Airport</label>
            <input
              value={airport}
              onChange={e => setAirport(e.target.value)}
              placeholder="MUC"
              className="bg-black border border-white/10 px-4 py-2 w-full"
            />
          </div>

        </div>

        <button
          onClick={handleDeploy}
          disabled={deploying}
          className="w-full h-14 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition"
        >
          {deploying ? "Deploying…" : "Confirm & Continue"}
        </button>

      </div>
    </div>
  );
}


