import { useState, useEffect, useMemo } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { resolveAirport } from "@/utils/resolveAirport"
import { useAirportExperience } from "@/features/airport/hooks/useAirportExperience"
import { usePSeoManifest } from "@/hooks/usePSeoManifest"

import AirportTemplate from "@/features/airport/AirportTemplate"

export default function AirportPage() {
  const { airportCode: routeParam } = useParams()
  const [searchParams] = useSearchParams()
  const [premiumData, setPremiumData] = useState(null)
  const { manifest: GENERATED_MANIFEST, loading: manifestLoading } = usePSeoManifest()

  // 1. Resolve Canonical Airport
  const airport = useMemo(() => resolveAirport(routeParam), [routeParam]);
  const canonicalCode = airport?.code;
  const canonicalSlug = airport?.slug;

  // 2. Resolve Minimal Experience Payload
  const experience = useAirportExperience(canonicalCode);

  const initialRideMode = searchParams.get("mode") === "rent" ? "rent" : "bring";

  // 3. Fetch Premium pSEO Data using Canonical Slug
  useEffect(() => {
    if (!canonicalSlug || !GENERATED_MANIFEST) return;

    const premiumMatch = GENERATED_MANIFEST.pages.find(
      p => p.type === 'airport' && p.slug === canonicalSlug
    )

    if (premiumMatch) {
       fetch(`/data/generated_pages/airport/${canonicalSlug}.json`)
         .then(res => res.json())
         .then(data => setPremiumData(data))
         .catch(err => console.error("Failed to load premium airport data:", err))
    } else {
       setPremiumData(null);
    }
  }, [canonicalSlug, GENERATED_MANIFEST])

  // 4. Unknown State Handling
  if (manifestLoading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/20 font-mono text-xs uppercase tracking-widest">Hydrating Hub Intelligence...</div>
  }

  if (!airport && !premiumData) {
    return (
      <div className="p-20 text-[color:var(--text-primary)] text-center">
        <h1 className="text-2xl font-bold text-red-500">UNKNOWN AIRPORT ARRIVAL OS</h1>
        <p className="text-zinc-600">The identifier "{routeParam}" could not be resolved to a known airport hub.</p>
      </div>
    );
  }

  return (
    <AirportTemplate
      airport={premiumData?.entity || airport}
      experience={experience}
      initialRideMode={initialRideMode}
    />
  )
}

