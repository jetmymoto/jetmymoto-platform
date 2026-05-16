import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

import MissionHero from "../../features/missions/sections/MissionHero";
import MissionRouteTheater from "../../features/missions/sections/MissionRouteTheater";
import MissionBrief from "../../features/missions/sections/MissionBrief";
import MissionBikeMatch from "../../features/missions/sections/MissionBikeMatch";
import MissionLogistics from "../../features/missions/sections/MissionLogistics";
import MissionA2AOffer from "../../features/missions/sections/MissionA2AOffer";
import MissionTrustLayer from "../../features/missions/sections/MissionTrustLayer";
import MissionCTA from "../../features/missions/sections/MissionCTA";

// High-conversion lead capture overlay for Dossier traffic
function DossierLeadCapture({ missionId, source }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  // Log open event on mount
  useEffect(() => {
    async function logOpen() {
      try {
        await addDoc(collection(db, "mission_leads"), {
          missionId,
          source,
          action: "opened",
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error("Failed to log open event", e);
      }
    }
    logOpen();
  }, [missionId, source]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await addDoc(collection(db, "mission_leads"), {
        missionId,
        source,
        contact: email,
        action: "submitted_lead",
        timestamp: serverTimestamp()
      });
      setStatus("success");
    } catch (error) {
      console.error("Lead capture failed", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[#1C1917] border-b border-[rgba(205,167,85,0.2)]">
        <div className="mb-6 text-[#CDA755]">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[#FDFCFB] mb-4 uppercase">Plan Request Received</h2>
        <p className="text-[#8A8175] max-w-md mx-auto mb-8 leading-relaxed font-medium">
          Our team is preparing your custom route plan and will contact you within 24 hours to confirm machine availability.
        </p>
        <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#CDA755] font-bold">
          High-Season Availability Limited
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-24 px-6 bg-[#050505] overflow-hidden border-b border-[#2A2A2A]">
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#CDA755 1px, transparent 1px), linear-gradient(90deg, #CDA755 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="h-[1px] w-12 bg-[#CDA755] opacity-50 mr-4"></div>
          <div className="text-[10px] font-mono font-bold tracking-[0.3em] text-[#CDA755] uppercase">Route Verified</div>
          <div className="h-[1px] w-12 bg-[#CDA755] opacity-50 ml-4"></div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#FDFCFB] mb-6 text-center uppercase leading-none">
          Request <br/><span className="text-[#CDA755]">Availability</span>
        </h1>
        
        <p className="text-[#8A8175] text-center mb-12 max-w-lg mx-auto leading-relaxed">
          Your route is verified. Enter your email to request a custom plan for {missionId}. Our team will finalize your logistics options.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="YOUR EMAIL ADDRESS" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#111] border border-[#333] text-[#FDFCFB] px-6 py-5 text-[11px] font-mono tracking-[0.1em] placeholder-[#555] focus:outline-none focus:border-[#CDA755] transition-colors uppercase"
            />
          </div>
          <button 
            type="submit" 
            disabled={status === "loading"}
            className="w-full bg-[#CDA755] hover:bg-[#D4B36D] text-[#050505] px-6 py-5 text-[11px] font-bold font-mono tracking-[0.2em] uppercase transition-all disabled:opacity-50"
          >
            {status === "loading" ? "SENDING..." : "REQUEST AVAILABILITY →"}
          </button>
        </form>
        
        <div className="mt-8 text-center text-[9px] font-mono tracking-widest text-[#555] uppercase">
          JETMYMOTO OPERATIONS // CONFIDENTIAL INTEL // REF: {missionId}
        </div>
      </div>
    </div>
  );
}

export default function MissionLandingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [mission, setMission] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for Dossier query param
  const searchParams = new URLSearchParams(location.search);
  const source = searchParams.get("source");
  const isDossierTraffic = source === "dossier";

  useEffect(() => {
    async function loadMissionData() {
      setLoading(true);
      try {
        // 1. Fetch page data by slug
        const pageRef = doc(db, "mission_pages_v1", slug);
        const pageSnap = await getDoc(pageRef);
        
        let missionId;
        let enrichedData;

        if (pageSnap.exists()) {
          enrichedData = pageSnap.data();
          missionId = enrichedData.missionId;
        } else {
          // Fallback: search missions_v1 directly if slug doesn't match a page record
          missionId = slug.replace(/-/g, "_"); 
        }

        // 2. Fetch core mission data
        const missionRef = doc(db, "missions_v1", missionId);
        const missionSnap = await getDoc(missionRef);

        if (missionSnap.exists()) {
          const rawMission = { id: missionSnap.id, ...missionSnap.data() };
          const normalizedMission = normalizeMission(rawMission);
          setMission(normalizedMission);
          setPageData(enrichedData || generateDefaultPageData(normalizedMission));
        }
      } catch (error) {
        console.error("[MissionLandingPage] Error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadMissionData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-[#eac26d]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#eac26d] mx-auto" />
          <p className="font-mono text-[10px] uppercase tracking-[0.5em]">Decrypting Intel</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
        <h1 className="font-headline text-4xl font-black opacity-20 uppercase tracking-tighter">404 // Mission Missing</h1>
      </div>
    );
  }

  // Hide incomplete briefing
  const hasValidBriefing = pageData?.briefing && pageData.briefing.length > 0 && !pageData.briefing.some(b => b.title.includes("Placeholder"));

  return (
    <div className="bg-[#050505]">
      {/* High-Impact Capture for Dossier Traffic */}
      {isDossierTraffic && <DossierLeadCapture missionId={mission.id || slug} source={source} />}

      <MissionHero mission={mission} pageData={pageData} />
      
      {!isDossierTraffic && pageData?.whyThisRide && (
        <MissionRouteTheater mission={mission} pageData={pageData} />
      )}
      
      {hasValidBriefing && <MissionBrief briefing={pageData.briefing} />}
      
      {!isDossierTraffic && mission.missionType === "a2a" && pageData.a2aOffer && (
        <MissionA2AOffer offer={pageData.a2aOffer} />
      )}
      
      {pageData.bikeMatch?.model && (
        <MissionBikeMatch bikeMatch={pageData.bikeMatch} />
      )}
      
      {pageData.logistics && (
        <MissionLogistics logistics={pageData.logistics} />
      )}
      
      <MissionTrustLayer mission={mission} />
      
      <MissionCTA mission={mission} />
    </div>
  );
}

function normalizeMission(mission) {
  // Ensure we have a baseline structure
  return {
    ...mission,
    title: mission.title || "Unclassified Mission",
    description: mission.description || "Mission details pending tactical review.",
    stats: {
      distance_km: mission.stats?.distance_km || 0,
      days: mission.stats?.days || 0,
      difficulty: mission.stats?.difficulty || "Standard",
      ...mission.stats
    }
  };
}

function generateDefaultPageData(mission) {
  // Only generate if we have enough info, otherwise return minimal
  return {
    whyThisRide: mission.intelligence?.pitch || `Curated expedition. Experience technical performance and pure riding theater in the ${mission.cluster || 'target'} sector.`,
    briefing: mission.itinerary || [],
    bikeMatch: {
      headline: "Recommended Machine",
      model: mission.recommended_bike || "BMW R1300GS",
      reason: "Optimized for the specific terrain profile of this mission."
    },
    logistics: {
      insertion: mission.start || "Mission Start",
      extraction: mission.end || "Mission End",
      support: "24/7 Digital Concierge"
    }
  };
}
