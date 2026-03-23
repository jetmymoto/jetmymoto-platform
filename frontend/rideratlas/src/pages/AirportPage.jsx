import { useParams, useSearchParams } from "react-router-dom"
import { GRAPH } from "@/core/network/networkGraph"
import AirportTemplate from "@/features/airport/AirportTemplate"
import { useState } from "react"

export default function AirportPage() {
  const { code } = useParams()
  const [searchParams] = useSearchParams()
  const airport = GRAPH.airports?.[code?.toUpperCase()]
  const initialRideMode = searchParams.get("mode") === "rent" ? "rent" : "bring";

  const [intent, setIntent] = useState("moto")

  if (!airport) {
    return (
      <div className="p-20 text-white text-center">
        <h1 className="text-2xl font-bold text-red-500">UNKNOWN AIRPORT ARRIVAL OS</h1>
        <p className="text-zinc-400">This airport code ({code}) is not recognized in the network.</p>
      </div>
    );
  }

  return (
    <AirportTemplate
      airport={airport}
      intent={intent}
      setIntent={setIntent}
      initialRideMode={initialRideMode}
    />
  )
}
