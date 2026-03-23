import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { GRAPH } from "@/core/network/networkGraph";

export default function PoiPage() {
  const { slug } = useParams();
  const [poi, setPoi] = useState(() => GRAPH.pois?.[slug] || null);
  const [loading, setLoading] = useState(() => !GRAPH.pois?.[slug]);

  useEffect(() => {
    let active = true;

    const loadPoi = async () => {
      if (!slug) {
        if (!active) return;
        setPoi(null);
        setLoading(false);
        return;
      }

      const graphPoi = GRAPH.pois?.[slug];
      if (graphPoi) {
        if (!active) return;
        setPoi(graphPoi);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const module = await import("@/features/poi/poiFiltered.json");
        if (!active) return;
        setPoi(module.default?.[slug] || null);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load POI dataset", error);
        setPoi(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPoi();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto py-12 text-white">Loading POI...</div>;
  }

  if (!poi) {
    return <div className="container mx-auto py-12 text-white">POI not found</div>;
  }

  const airport = AIRPORT_INDEX[poi.nearest_airport];
  const routes = Object.values(GRAPH.routes || {}).filter(
    (route) => route.destination?.slug === "dolomites" || route.destination?.slug === "alps",
  );

  return (
    <div className="container mx-auto py-12">

      <h1 className="text-3xl font-bold mb-6">
        {poi.name}
      </h1>

      <p className="mb-4">
        {poi.description}
      </p>

      <h2 className="mt-8 text-xl font-semibold">
        Nearest Airport
      </h2>

      {airport ? (
        <Link
          to={`/airport/${(airport.code || "").toLowerCase()}`}
          className="text-blue-500"
        >
          {airport.city} ({airport.code})
        </Link>
      ) : (
        <span className="text-zinc-400">Airport data unavailable</span>
      )}

      <h2 className="mt-10 text-xl font-semibold">
        Ride Routes From Nearby Airports
      </h2>

      <ul>
        {routes.slice(0,5).map(r => (
          <li key={r.slug}>
            <Link to={`/route/${r.slug}`} className="text-blue-500">
              Ride from {r.airport.city} to the {r.destination.name}
            </Link>
          </li>
        ))}
      </ul>

    </div>
  )
}
