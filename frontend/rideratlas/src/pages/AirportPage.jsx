import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import AirportTemplate from "@/features/airport/AirportTemplate"
import { resolveAirport } from "@/utils/resolveAirport"

// pSEO Manifest
import GENERATED_MANIFEST from "../../public/data/generated_pages/entity_page_manifest.json"

function normalizeAirportSlug(value) {
  return String(value || "").trim().toLowerCase()
}

export default function AirportPage() {
  const { code } = useParams()
  const [searchParams] = useSearchParams()
  const [premiumData, setPremiumData] = useState(null)
  const airport = resolveAirport(code)
  const initialRideMode = searchParams.get("mode") === "rent" ? "rent" : "bring";

  const [intent, setIntent] = useState("moto")

  // Check for premium pSEO data
  useEffect(() => {
    const slug = normalizeAirportSlug(code)
    const premiumMatch = GENERATED_MANIFEST.pages.find(p => p.type === 'airport' && p.slug === slug)
    if (premiumMatch) {
       // Fetch the JSON payload
       fetch(`/data/generated_pages/airport/${slug}.json`)
         .then(res => res.json())
         .then(data => setPremiumData(data))
         .catch(err => console.error("Failed to load premium airport data:", err))
    }
  }, [code])

  if (!airport && !premiumData) {
    return (
      <div className="p-20 text-white text-center">
        <h1 className="text-2xl font-bold text-red-500">UNKNOWN AIRPORT ARRIVAL OS</h1>
        <p className="text-zinc-400">This airport code ({code}) is not recognized in the network.</p>
      </div>
    );
  }

  return (
    <AirportTemplate
      airport={premiumData?.entity || airport}
      intent={intent}
      setIntent={setIntent}
      initialRideMode={initialRideMode}
    />
  )
}
