import { useParams, useSearchParams } from "react-router-dom"
import { GRAPH } from "@/core/network/networkGraph"
import AirportTemplate from "@/features/airport/AirportTemplate"
import { useState } from "react"
import { airportConfig } from "@/features/airport/data/airportConfig.generated.js"
import { staticAirports } from "@/features/airport/data/staticAirports"
import { staticAirportsEnriched } from "@/features/airport/data/staticAirportsEnriched"

function createDefaultArrivalOS(city) {
  return {
    arrivals: [{ label: `${city} Arrivals`, note: "Follow airport signage" }],
    departures: [{ label: `${city} Departures`, note: "Upper terminal level" }],
    baggageClaim: [{ label: "Baggage Claim", note: "Main terminal" }],
    rideshare: [{ label: "Uber / Lyft Pickup", note: "Rideshare zone" }],
    transport: [{ label: "Ground Transport", note: `${city} transit links` }],
  }
}

function normalizeAirportCode(value) {
  return String(value || "").trim().toUpperCase()
}

function normalizeAirportSlug(value) {
  return String(value || "").trim().toLowerCase()
}

function matchAirportRecord(airport, airportCode, airportSlug) {
  if (!airport) return false

  const candidateCode = normalizeAirportCode(
    airport.code || airport.iata || airport.airportCode || airport.id
  )
  const candidateSlug = normalizeAirportSlug(airport.slug || airport.id)

  return candidateCode === airportCode || candidateSlug === airportSlug
}

function buildStaticAirportFallback(code) {
  const airportCode = normalizeAirportCode(code)
  const airportSlug = normalizeAirportSlug(code)
  const baseAirport =
    airportConfig.find((airport) => {
      return (
        normalizeAirportCode(airport.code) === airportCode ||
        normalizeAirportSlug(airport.slug) === airportSlug
      )
    }) || null

  if (!baseAirport) {
    return null
  }

  const staticAirport = staticAirports?.[airportCode] || {}
  const enrichedAirport = staticAirportsEnriched?.[airportCode] || {}
  const fallbackAirport = {
    ...baseAirport,
    ...staticAirport,
    ...enrichedAirport,
    code: airportCode,
    airportCode: airportCode,
    iata: airportCode,
    slug:
      normalizeAirportSlug(enrichedAirport.slug) ||
      normalizeAirportSlug(staticAirport.slug) ||
      normalizeAirportSlug(baseAirport.slug) ||
      airportSlug,
  }

  if (!fallbackAirport.arrivalOS) {
    fallbackAirport.arrivalOS = createDefaultArrivalOS(
      fallbackAirport.city || fallbackAirport.name || airportCode
    )
  }

  return fallbackAirport
}

function resolveAirport(code) {
  const airportCode = normalizeAirportCode(code)
  const airportSlug = normalizeAirportSlug(code)

  return (
    GRAPH.airports?.[airportCode] ||
    GRAPH.airports?.[code] ||
    GRAPH.airportsBySlug?.[airportSlug] ||
    GRAPH.airportsBySlug?.[code] ||
    buildStaticAirportFallback(code)
  )
}

export default function AirportPage() {
  const { code } = useParams()
  const [searchParams] = useSearchParams()
  const airport = resolveAirport(code)
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
