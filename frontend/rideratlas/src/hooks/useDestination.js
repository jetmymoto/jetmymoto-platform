import { useEffect, useState } from "react";
import { GRAPH } from "@/core/network/networkGraph";

function normalizeStats(destination) {
  return {
    curves:
      destination?.stats?.curves ??
      destination?.curves ??
      destination?.roadCount ??
      "N/A",
    maxElevation:
      destination?.stats?.maxElevation ??
      destination?.maxElevation ??
      destination?.elevation ??
      "N/A",
    avgGripIndex:
      destination?.stats?.avgGripIndex ??
      destination?.avgGripIndex ??
      destination?.gripIndex ??
      "N/A",
    seasonalWindow:
      destination?.stats?.seasonalWindow ??
      destination?.seasonalWindow ??
      destination?.season ??
      "N/A",
  };
}

function getRouteSlugsForDestination(slug) {
  return GRAPH.routesByDestination?.[slug] || [];
}

function normalizePoi(poi) {
  return {
    name: poi?.name ?? poi?.title ?? "",
    elevation: poi?.elevation ?? poi?.altitude ?? "N/A",
    type: poi?.type ?? "POI",
  };
}

export function useDestination(slug) {
  const [data, setData] = useState({
    destination: null,
    airports: [],
    pois: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!slug) {
        if (!active) return;
        setData({
          destination: null,
          airports: [],
          pois: [],
          loading: false,
          error: "No slug provided",
        });
        return;
      }

      try {
        const rawDestination = GRAPH.destinations?.[slug];
        console.log("useDestination: rawDestination for slug", slug, rawDestination);

        if (!rawDestination) {
          if (!active) return;
          setData({
            destination: null,
            airports: [],
            pois: [],
            loading: false,
            error: `Destination not found for slug: ${slug}`,
          });
          return;
        }

        const routeSlugs = getRouteSlugsForDestination(slug);
        console.log("useDestination: routeSlugs found", routeSlugs);
        const routes = routeSlugs
          .map((routeSlug) => GRAPH.routes?.[routeSlug])
          .filter(Boolean);
        console.log("useDestination: routes found", routes);

        const airportCodes = new Set();

        routes.forEach(route => {
          if (route.airport?.code) {
            airportCodes.add(route.airport.code);
          }

          // origin airport
          if (route.origin?.code) {
            airportCodes.add(route.origin.code);
          }

          // sometimes stored flat
          if (route.originCode) {
            airportCodes.add(route.originCode);
          }

          // fallback: parse slug (VERY useful for your naming)
          if (!route.origin?.code && route.slug) {
            const parts = route.slug.split("-to-");
            if (parts[0]) {
              const code = parts[0].split("-").pop().toUpperCase();
              airportCodes.add(code);
            }
          }
        });

        const airports = Array.from(airportCodes)
          .map((code) => {
            const airport = GRAPH.airports?.[code];
            if (!airport) return null;

            return {
              code: airport.code ?? code,
              city: airport.city ?? airport.name ?? "",
              distance: airport.distance ?? "N/A",
              timeToGrid: airport.timeToGrid ?? "N/A",
            };
          })
          .filter(Boolean);

        let pois = [];

        if (Array.isArray(rawDestination.pois) && rawDestination.pois.length > 0) {
          pois = rawDestination.pois.map(normalizePoi);
        } else if (Array.isArray(GRAPH.poisByDestination?.[slug])) {
          pois = GRAPH.poisByDestination[slug]
            .map((poiSlug) => GRAPH.pois?.[poiSlug])
            .filter(Boolean)
            .map(normalizePoi);
        } else {
          // STEP 1 — collect only relevant POIs
          const poiMap = new Map();

          routes.forEach(route => {
            (route.pois || []).forEach(poi => {
              if (!poi) return;

              // 🔥 CRITICAL FILTER (destination match)
              const isRelevant =
                poi.destinationSlug === slug ||
                poi.region === slug ||
                poi.region === rawDestination.region ||
                poi.country && rawDestination.countries?.includes(poi.country);

              if (!isRelevant) return;

              const key = poi.slug || poi.name;
              if (!key) return;

              // STEP 2 — dedupe
              if (!poiMap.has(key)) {
                poiMap.set(key, {
                  name: poi.name || "",
                  elevation: poi.elevation || "N/A",
                  type: poi.type || "POI",
                });
              }
            });
          });

          // STEP 3 — LIMIT (VERY IMPORTANT)
          pois = Array.from(poiMap.values()).slice(0, 50);
        }

        console.log("Filtered POIs:", pois.length);

        const destination = {
          name: rawDestination.name ?? rawDestination.title ?? "",
          slug: rawDestination.slug ?? slug,
          description:
            rawDestination.description ??
            rawDestination.summary ??
            rawDestination.blurb ??
            "",
          stats: normalizeStats(rawDestination),
        };

        console.log("useDestination: final destination object", destination);
        console.log("useDestination: airports found", airports.length, airports.slice(0, 5), "...");
        console.log("useDestination: pois found", pois.length, pois.slice(0, 5), "...");

        if (!active) return;
        setData({
          destination,
          airports,
          pois,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!active) return;
        setData({
          destination: null,
          airports: [],
          pois: [],
          loading: false,
          error: err?.message ?? "Error fetching destination",
        });
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [slug]);

  return data;
}
