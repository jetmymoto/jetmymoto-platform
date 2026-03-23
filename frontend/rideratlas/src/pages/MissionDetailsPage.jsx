import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Gauge,
  Shield,
  Download,
  Loader2,
  Plane,
  ArrowRight,
  CheckCircle2,
  Zap
} from 'lucide-react';

// LAYOUT



// SEO (🔥 SAFE, INVISIBLE)
import MissionSchema from '../components/seo/MissionSchema';
import MissionFAQ from '../components/seo/MissionFAQ';
import MissionBreadcrumbs from '../components/seo/MissionBreadcrumbs';

// ==============================
// CONFIG
// ==============================
const PREMIUM_FLEET = [
  {
    id: 'multi_v4',
    name: 'Ducati Multistrada V4S',
    tag: 'RACE BRED',
    image: 'https://images.unsplash.com/photo-1629580145211-13c43715c0e7?q=80&w=1000&auto=format&fit=crop',
    price: '€220/day'
  },
  {
    id: 'gs_1300',
    name: 'BMW R1300 GS Trophy',
    tag: 'COMMANDER',
    image: 'https://images.unsplash.com/photo-1623563943668-548d0b9571e2?q=80&w=1000&auto=format&fit=crop',
    price: '€195/day'
  },
  {
    id: 'pan_am',
    name: 'Harley-Davidson Pan America',
    tag: 'AMERICAN IRON',
    image: 'https://images.unsplash.com/photo-1628189591452-44f23b726487?q=80&w=1000&auto=format&fit=crop',
    price: '€185/day'
  }
];

// ==============================
// HELPERS
// ==============================
const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ==============================
// PAGE
// ==============================
export default function MissionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMission() {
      try {
        const ref = doc(db, 'missions_v4', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setMission({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error('Mission fetch failed', e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchMission();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-amber-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <span className="font-mono tracking-widest text-xs animate-pulse">
          DECRYPTING MISSION FILE…
        </span>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <h1 className="text-4xl font-black text-white/20">404 // MISSING INTEL</h1>
        <button
          onClick={() => navigate('/')}
          className="text-amber-500 border-b border-amber-500 pb-1 font-mono text-xs uppercase tracking-widest hover:text-white hover:border-white"
        >
          Return to Command
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-amber-500 selection:text-black">

      {/* ============================
          🔥 STRUCTURED DATA (SEO)
          ============================ */}
      <MissionSchema mission={mission} />
      <MissionFAQ mission={mission} />
      <MissionBreadcrumbs mission={mission} domain={site.domain} />

      {/* ============================
          UI
          ============================ */}


      <MissionHero mission={mission} />
      <IntelGrid mission={mission} />
      <MissionScope mission={mission} />
      <DetailedBriefing mission={mission} onUnlock={() => scrollToId('mission-files')} />
      <MissionFiles mission={mission} onUnlock={() => scrollToId('mission-files')} />
      <PremiumDeployment />
      <LeadGate mission={mission} />


    </div>
  );
}


