import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { staticAirports } from "../data/staticAirports";
import { staticAirportsEnriched } from "../data/staticAirportsEnriched";

export default function useAirportData(code) {
  const [airport, setAirport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAirport() {
      if (!code) return;

      setLoading(true);

      // 🔥 ALWAYS NORMALIZE ROUTE PARAM
      const upperCode = code.toUpperCase();

      // 1️⃣ Static baseline
      const staticData = staticAirports[upperCode] || {};
      const enrichedData = staticAirportsEnriched[upperCode] || {};

      // Merge enriched into base
      const baseAirport = {
        ...staticData,
        ...enrichedData,
      };

      try {
        // 2️⃣ Firestore override
        const snap = await getDoc(doc(db, "airports", upperCode));

        if (snap.exists()) {
          const firestoreData = snap.data();

          // 🔥 Deep-safe merge (prevent wiping nested fields)
          setAirport({
            ...baseAirport,
            ...firestoreData,

            controlPanel:
              firestoreData.controlPanel ?? baseAirport.controlPanel,

            utilities:
              firestoreData.utilities ?? baseAirport.utilities,

            recovery: {
              ...baseAirport.recovery,
              ...firestoreData.recovery,
            },

            cityExtension:
              firestoreData.cityExtension ?? baseAirport.cityExtension,
          });
        } else {
          setAirport(baseAirport);
        }
      } catch (err) {
        console.error("Airport fetch error:", err);
        setAirport(baseAirport);
      }

      setLoading(false);
    }

    fetchAirport();
  }, [code]);

  return { airport, loading };
}