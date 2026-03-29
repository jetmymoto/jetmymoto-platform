import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";

import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { GRAPH, loadGraphShard, readGraphShard } from "@/core/network/networkGraph";
import { withBrandContext } from "@/utils/navigationTargets";

function hasPoiDetailData(poi) {
  return Boolean(poi?.description) && Boolean(poi?.nearest_airport);
}

function normalizeDestinationKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function mergePoiRecord(graphPoi, detailPoi) {
  if (graphPoi && detailPoi) {
    return {
      ...detailPoi,
      ...graphPoi,
      description: detailPoi.description ?? graphPoi.description,
      nearest_airport: detailPoi.nearest_airport ?? graphPoi.nearest_airport,
    };
  }

  if (detailPoi) {
    const normalizedDestination = normalizeDestinationKey(
      detailPoi.destination || detailPoi.region
    );

    return {
      ...detailPoi,
      destination: normalizedDestination || detailPoi.destination || null,
      region: normalizedDestination || detailPoi.region || null,
    };
  }

  return graphPoi || null;
}

function resolvePoiRecord(slug) {
  if (!slug) {
    return null;
  }

  const shardPoi = readGraphShard("poiDetails")?.[slug] || null;
  const graphPoi = GRAPH.pois?.[slug] || null;

  if (hasPoiDetailData(shardPoi)) {
    return mergePoiRecord(graphPoi, shardPoi);
  }

  if (hasPoiDetailData(graphPoi)) {
    return mergePoiRecord(graphPoi, shardPoi);
  }

  return graphPoi;
}

export default function PoiPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [poi, setPoi] = useState(() => resolvePoiRecord(slug));
  const [loading, setLoading] = useState(() => !hasPoiDetailData(resolvePoiRecord(slug)));
  const withCtx = (path) => withBrandContext(path, location.search);

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
      const shardPoi = readGraphShard("poiDetails")?.[slug] || null;

      if (hasPoiDetailData(shardPoi) || hasPoiDetailData(graphPoi)) {
        if (!active) return;
        setPoi(mergePoiRecord(graphPoi, shardPoi));
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        await loadGraphShard("poiDetails");
        if (!active) return;
        const poiShard = readGraphShard("poiDetails");
        setPoi(mergePoiRecord(graphPoi, poiShard?.[slug] || null));
      } catch (error) {
        if (!active) return;
        console.error("Failed to load POI dataset", error);
        setPoi(graphPoi || null);
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
  const destSlug = poi.destination || poi.region;
  const routeSlugs = destSlug ? (GRAPH.indexes.routesByDestination?.[destSlug] || []) : [];
  const routes = routeSlugs.map(slug => GRAPH.routes?.[slug]).filter(Boolean);

  return (
    <div className="container mx-auto py-12">

      <h1 className="text-3xl font-bold mb-6">
        {poi.name}
      </h1>

      <p className="mb-4">
        {poi?.cinematic_description || poi?.description}
      </p>
      {poi?.rider_tip ? (
        <p className="mb-4 text-sm italic text-zinc-400">
          {poi.rider_tip}
        </p>
      ) : null}

      <h2 className="mt-8 text-xl font-semibold">
        Nearest Airport
      </h2>

      {airport ? (
        <Link
          to={withCtx(`/airport/${(airport.code || "").toLowerCase()}`)}
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
            <Link to={withCtx(`/route/${r.slug}`)} className="text-blue-500">
              Ride from {r.airport.city} to the {r.destination.name}
            </Link>
          </li>
        ))}
      </ul>

    </div>
  )
}
