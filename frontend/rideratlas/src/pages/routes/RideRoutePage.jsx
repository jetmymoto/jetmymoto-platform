import { useReducer, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  Plane,
  Route as RouteIcon,
  ShieldCheck
} from "lucide-react";

import SeoHelmet from "../../components/seo/SeoHelmet";
import RentalCard from "@/features/rentals/components/RentalCard";
import { getRentalPrice } from "@/features/rentals/utils/rentalFormatters";
import {
  GRAPH,
  readGraphShard,
  getGraphShardStatus,
  loadGraphShard,
} from "@/core/network/networkGraph";
import { CINEMATIC_BACKGROUNDS } from "@/utils/cinematicBackgrounds";
import { trackEvent } from "@/core/analytics/trackEvent";

function getRouteDistance(route) {
  return (
    route?.distanceKm ??
    route?.distance_km ??
    route?.distance ??
    route?.length_km ??
    null
  );
}

function getRouteDifficulty(route) {
  return (
    route?.difficulty ??
    route?.roadProfile?.difficulty ??
    route?.difficultyLevel ??
    route?.profile ??
    "Operational"
  );
}

function getRouteDuration(route) {
  return (
    route?.estimated_duration ??
    route?.estimatedDuration ??
    route?.duration ??
    route?.duration_days ??
    route?.rideTime ??
    "Classified"
  );
}

function getBestRouteRental(rentals) {
  if (!Array.isArray(rentals) || rentals.length === 0) {
    return null;
  }

  return rentals.reduce((best, candidate) => {
    if (!best) return candidate;
    const bestPrice = getRentalPrice(best);
    const candidatePrice = getRentalPrice(candidate);

    if (candidatePrice < bestPrice) {
      return candidate;
    }

    return best;
  }, null);
}

function trackLeadEvent({ routeSlug, airportCode, rentalId, source }) {
  trackEvent("lead_rental_booking", {
    route_slug: routeSlug || "",
    airport_code: airportCode || "",
    rental_id: rentalId || "none",
    source,
  });
}

function getRouteHeroImage(route) {
  return (
    route?.imageUrl ||
    route?.posterUrl ||
    route?.destination?.imageUrl ||
    route?.destination?.posterUrl ||
    CINEMATIC_BACKGROUNDS.courtyardClassic
  );
}

function getPoiRecords(route) {
  const routePoiRefs =
    route?.poiSlugs ||
    route?.pois ||
    route?.waypoints ||
    route?.poi_refs ||
    [];

  if (Array.isArray(routePoiRefs) && routePoiRefs.length > 0) {
    return routePoiRefs
      .map((poiRef) => {
        if (typeof poiRef === "string") {
          return GRAPH?.pois?.[poiRef] || null;
        }

        const slug = poiRef?.slug || poiRef?.id;
        return GRAPH?.pois?.[slug] || poiRef || null;
      })
      .filter(Boolean)
      .slice(0, 6);
  }

  const destinationSlug = route?.destination?.slug?.toLowerCase?.();

  return (GRAPH?.poisByDestination?.[destinationSlug] || [])
    .map((poiSlug) => GRAPH?.pois?.[poiSlug])
    .filter(Boolean)
    .slice(0, 6);
}

function BriefMetric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#121212] p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        <Icon className="h-4 w-4 text-[#CDA755]" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-black tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, body }) {
  return (
    <div className="max-w-3xl">
      <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white lg:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-sm leading-7 text-zinc-400 lg:text-base">{body}</p>
      ) : null}
    </div>
  );
}

function FallbackCard({ title, body }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[#121212] p-6">
      <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
        Standby
      </div>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  );
}

export default function RideRoutePage() {
  const { slug } = useParams();
  const route = GRAPH?.routes?.[slug];
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // ── Non-blocking shard load → re-render when done ──
  useEffect(() => {
    const status = getGraphShardStatus("rentals");
    if (status === "idle") {
      loadGraphShard("rentals").then(forceUpdate);
    } else if (status === "loading") {
      const interval = setInterval(() => {
        if (getGraphShardStatus("rentals") === "loaded") {
          clearInterval(interval);
          forceUpdate();
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  if (!route) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-zinc-200">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-[#121212] p-8 lg:p-10">
          <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
            Mission Briefing
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Route Not Found
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            The requested mission line is not currently indexed in the route graph. Return to the global hub map to re-enter the network from an active airport.
          </p>
          <div className="mt-8">
            <Link
              to="/airport"
              className="inline-flex items-center gap-3 rounded-full border border-[#A76330]/40 bg-[#A76330]/15 px-5 py-3 text-sm font-semibold text-[#E2BB76] transition-colors hover:border-[#A76330]/60 hover:bg-[#A76330]/20"
            >
              Return To Hub Map
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const airportCode = route?.airport?.code?.toUpperCase?.() || "";
  const airportCity = route?.airport?.city || "Origin Hub";
  const destinationName = route?.destination?.name || "Destination";
  const destinationSlug = route?.destination?.slug || "";
  const routeName =
    route?.name ||
    route?.title ||
    `${airportCity} to ${destinationName}`;
  const routeDistance = getRouteDistance(route);
  const routeDifficulty = getRouteDifficulty(route);
  const routeDuration = getRouteDuration(route);
  const heroImage = getRouteHeroImage(route);
  const pois = getPoiRecords(route);

  const rentalShard = readGraphShard("rentals");
  const rentalsMap = rentalShard?.rentals ?? GRAPH.rentals;
  const rentalsByAirport =
    rentalShard?.rentalIndexes?.rentalsByAirport ?? GRAPH.rentalsByAirport;

  const rentals = (rentalsByAirport?.[airportCode] || [])
    .map((rentalId) => rentalsMap?.[rentalId])
    .filter(Boolean);

  const bestRental = getBestRouteRental(rentals);
  const routeParam = encodeURIComponent(route?.slug || slug || "");
  const rentalParam = bestRental
    ? encodeURIComponent(bestRental?.id || bestRental?.slug || "")
    : "";

  const airportBasePath = airportCode
    ? `/airport/${airportCode.toLowerCase()}`
    : "/airport";
  const routeToAirportRentPath = `${airportBasePath}?mode=rent${routeParam ? `&route=${routeParam}` : ""}${rentalParam ? `&rental=${rentalParam}` : ""}`;
  const routeToAirliftPath = airportCode
    ? `/moto-airlift?airport=${airportCode}${routeParam ? `&route=${routeParam}` : ""}`
    : "/moto-airlift";

  const canonicalUrl = `https://jetmymoto.com/route/${route?.slug || slug}`;
  const routeSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: routeName,
    touristType: "Motorcycle",
    location: [airportCity, destinationName].filter(Boolean).join(" to ")
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      <SeoHelmet
        title={`${routeName} | Motorcycle Mission Briefing | JetMyMoto`}
        description={`Mission briefing for ${routeName}. Deploy from ${airportCity}${airportCode ? ` (${airportCode})` : ""} and choose between local rentals or full motorcycle logistics.`}
        canonicalUrl={canonicalUrl}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(routeSchema) }}
      />

      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={routeName}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.2)_0%,rgba(5,5,5,0.5)_36%,rgba(5,5,5,0.92)_76%,rgba(5,5,5,1)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.16),transparent_28%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-10 pt-28 lg:pb-0">
          <div className="w-full">
            <div className="max-w-4xl">
              <div className="text-[10px] uppercase tracking-[0.38em] text-[#CDA755]">
                Tactical Mission Briefing
              </div>
              <h1 className="mt-5 text-5xl font-black tracking-tight text-white md:text-7xl lg:text-[5.5rem]">
                {routeName}
              </h1>
              <p className="mt-5 text-sm uppercase tracking-[0.3em] text-zinc-300">
                {airportCity}
                {airportCode ? ` • ${airportCode}` : ""}
                {destinationName ? ` • ${destinationName}` : ""}
              </p>
              {route?.description ? (
                <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-300 lg:text-base">
                  {route.description}
                </p>
              ) : null}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3 lg:translate-y-1/2">
              <BriefMetric
                label="Distance"
                value={routeDistance ? `${routeDistance} km` : "Classified"}
                icon={RouteIcon}
              />
              <BriefMetric
                label="Difficulty"
                value={routeDifficulty}
                icon={ShieldCheck}
              />
              <BriefMetric
                label="Mission Duration"
                value={routeDuration}
                icon={Clock3}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-20 px-6 pb-24 pt-20 lg:pt-40">
        <section className="space-y-8">
          <SectionHeader
            eyebrow="Origin Hub & Waypoints"
            title="Theater Entry And Route Intelligence"
            body="Every mission line resolves back to an origin airport hub so the rider can choose between shipping in their own machine or pulling from the local rental fleet."
          />

          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-white/10 bg-[#121212] p-6">
              <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Origin Hub
              </div>
              <div className="mt-5 rounded-[24px] border border-white/10 bg-[#050505] p-5">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  <Plane className="h-4 w-4 text-[#CDA755]" />
                  Airport Staging
                </div>
                <div className="mt-3 text-3xl font-black tabular-nums text-white">
                  {airportCode || "TBD"}
                </div>
                <div className="mt-2 text-sm text-zinc-300">{airportCity}</div>
                <div className="mt-5">
                  <Link
                    to={airportCode ? `/airport/${airportCode.toLowerCase()}` : "/airport"}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#E2BB76] transition-colors hover:text-white"
                  >
                    Open Hub Briefing
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {pois.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {pois.map((poi) => (
                    <Link
                      key={poi?.slug || poi?.id || poi?.name}
                      to={`/poi/${poi?.slug || poi?.id}`}
                      className="group rounded-[28px] border border-white/10 bg-[#121212] p-5 transition-colors hover:border-[#A76330]/35 hover:bg-[#151515]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                            Waypoint
                          </div>
                          <h3 className="mt-3 text-xl font-semibold text-white">
                            {poi?.name || "Unnamed POI"}
                          </h3>
                        </div>
                        <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#CDA755]" />
                      </div>

                      <div className="mt-4 text-sm leading-6 text-zinc-400">
                        {[poi?.type, poi?.country, poi?.region]
                          .filter(Boolean)
                          .join(" • ") || "Route intelligence node"}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <FallbackCard
                  title="No POI briefings linked"
                  body="This route does not currently expose waypoint records in the graph. The mission can still be deployed from the origin hub and rental fleet below."
                />
              )}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="Mission-Specific Fleet"
            title="Best Machines For This Route"
            body="Fleet selection is resolved from the route's origin airport so the rider sees what is actually staged at the starting line."
          />

          {bestRental ? (() => {
            const destName = (route?.destination?.name || route?.destinationDetails?.name || destinationName || "").toLowerCase();
            const cat = (bestRental?.category || "").toLowerCase();
            const dist = route?.distanceKm || route?.distance_km || route?.distance || null;
            const bikeName = bestRental?.bikeName || bestRental?.bike_name || `${bestRental?.brand || ""} ${bestRental?.model || ""}`.trim() || bestRental?.name || "Prime Machine";
            const priceNum = getRentalPrice(bestRental);
            const priceFmt = new Intl.NumberFormat("en-IE", {
              style: "currency",
              currency: String(bestRental?.currency || "EUR").toUpperCase(),
              maximumFractionDigits: priceNum % 1 === 0 ? 0 : 2,
            }).format(priceNum);

            const bullets = [];
            if (/alp|dolom|mountain|pass|ridge|peak/.test(destName)) {
              bullets.push("Stable in high-altitude switchbacks");
            } else if (/coast|riviera|island|bay|shore/.test(destName)) {
              bullets.push("Smooth coastal touring capability");
            } else {
              bullets.push("Balanced performance for this route");
            }
            if (cat === "adventure") bullets.push("Handles mixed terrain confidently");
            else if (cat === "touring" || cat === "sport-touring") bullets.push("Comfortable for extended riding");
            else if (cat === "scrambler") bullets.push("Agile on varied road surfaces");
            else if (cat === "classic") bullets.push("Refined ride quality for scenic routes");
            if (dist && dist > 400 && bullets.length < 3) bullets.push("Long-range capable with touring comfort");

            return (
              <div className="rounded-2xl border border-amber-500/30 bg-zinc-950 p-6 lg:p-8">
                <div className="text-[10px] uppercase tracking-[0.34em] text-amber-500">
                  Mission Match
                </div>
                <p className="mt-1 text-sm text-zinc-400">
                  Optimized for {airportCity} → {destinationName}
                </p>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
                  {bestRental?.imageUrl ? (
                    <img
                      src={bestRental.imageUrl}
                      alt={bikeName}
                      className="h-48 w-full rounded-xl object-cover lg:h-56 lg:w-72"
                    />
                  ) : null}
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white">{bikeName}</h3>
                    <div className="mt-1 text-sm text-zinc-400">
                      {bestRental?.category ? bestRental.category.charAt(0).toUpperCase() + bestRental.category.slice(1) : "Premium"}
                    </div>

                    <div className="mt-5">
                      <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                        Why This Works
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm leading-6 text-zinc-300">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm">
                      {bestRental?.category ? (
                        <div className="rounded-lg border border-white/10 bg-[#121212] px-3 py-1.5">
                          <span className="text-zinc-500">Type </span>
                          <span className="font-semibold text-white">{bestRental.category.charAt(0).toUpperCase() + bestRental.category.slice(1)}</span>
                        </div>
                      ) : null}
                      <div className="rounded-lg border border-white/10 bg-[#121212] px-3 py-1.5">
                        <span className="text-zinc-500">From </span>
                        <span className="font-black tabular-nums text-white">{priceFmt}</span>
                        <span className="text-zinc-500">/day</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to={routeToAirportRentPath}
                  onClick={() =>
                    trackLeadEvent({
                      routeSlug: route?.slug || slug,
                      airportCode,
                      rentalId: bestRental?.id,
                      source: "mission_match_block",
                    })
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-amber-400"
                >
                  Deploy This Machine at {airportCode || "Hub"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <div className="mt-3 text-center">
                  <Link
                    to={`/rental/${bestRental?.slug || bestRental?.id}`}
                    className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                  >
                    View Machine Details
                  </Link>
                </div>
              </div>
            );
          })() : (
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 lg:p-8">
              <div className="text-[10px] uppercase tracking-[0.34em] text-zinc-500">
                Mission Match
              </div>
              <p className="mt-3 text-lg font-black text-zinc-400">
                No optimized machine found — showing all available units
              </p>
              <Link
                to={routeToAirportRentPath}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-amber-400"
              >
                Browse Fleet at {airportCode || "Hub"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* ⚔️ COMPARISON TRAP — Decision Forcing Block */}
          {(() => {
            const bikeA = rentals?.[0];
            const bikeB = rentals?.[1];
            if (!bikeA || !bikeB) return null;

            const nameA = bikeA?.bikeName || bikeA?.bike_name || `${bikeA?.brand || ""} ${bikeA?.model || ""}`.trim() || "Machine A";
            const nameB = bikeB?.bikeName || bikeB?.bike_name || `${bikeB?.brand || ""} ${bikeB?.model || ""}`.trim() || "Machine B";
            const destName = (route?.destination?.name || destinationName || "").toLowerCase();
            const isAlpine = /alp|dolom|mountain|pass|ridge|peak/.test(destName);
            const isCoastal = /coast|riviera|island|bay|shore/.test(destName);

            const proA = isAlpine
              ? "Comfort + control in tight alpine turns"
              : isCoastal
                ? "Smooth touring stability on coastal sweepers"
                : "Balanced handling for mixed terrain";
            const antiA = isAlpine
              ? "You want aggressive high-speed riding"
              : isCoastal
                ? "You want a sport-forward pace"
                : "You want raw power over comfort";
            const proB = isAlpine
              ? "Power + aggressive high-altitude performance"
              : isCoastal
                ? "Sport-forward pace on open coast roads"
                : "Responsive power for varied conditions";
            const antiB = isAlpine
              ? "You want comfort over outright speed"
              : isCoastal
                ? "You want relaxed touring over sporty pace"
                : "You want stability over raw responsiveness";

            const linkA = `${airportBasePath}?mode=rent&rental=${encodeURIComponent(bikeA?.id || bikeA?.slug || "")}&route=${routeParam}`;
            const linkB = `${airportBasePath}?mode=rent&rental=${encodeURIComponent(bikeB?.id || bikeB?.slug || "")}&route=${routeParam}`;

            return (
              <div className="rounded-2xl border border-white/10 bg-[#050505] p-6 lg:p-8">
                <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
                  Mission Comparison
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-white lg:text-3xl">
                  {nameA} <span className="text-zinc-500">vs</span> {nameB}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Optimized for {destinationName}
                </p>

                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                  {/* Bike A */}
                  <div className="space-y-5 rounded-xl border border-white/10 bg-[#121212] p-5">
                    {bikeA?.imageUrl ? (
                      <img src={bikeA.imageUrl} alt={nameA} className="h-40 w-full rounded-lg object-cover" />
                    ) : null}
                    <h4 className="text-xl font-black text-white">{nameA}</h4>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-500">Choose {nameA} if</div>
                      <p className="mt-1 text-sm leading-6 text-zinc-300">{proA}</p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-red-400">Avoid {nameA} if</div>
                      <p className="mt-1 text-sm leading-6 text-zinc-300">{antiA}</p>
                    </div>
                    <Link
                      to={linkA}
                      onClick={() =>
                        trackLeadEvent({
                          routeSlug: route?.slug || slug,
                          airportCode,
                          rentalId: bikeA?.id,
                          source: "comparison_block",
                        })
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-amber-400"
                    >
                      Deploy This Machine
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Bike B */}
                  <div className="space-y-5 rounded-xl border border-white/10 bg-[#121212] p-5">
                    {bikeB?.imageUrl ? (
                      <img src={bikeB.imageUrl} alt={nameB} className="h-40 w-full rounded-lg object-cover" />
                    ) : null}
                    <h4 className="text-xl font-black text-white">{nameB}</h4>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-500">Choose {nameB} if</div>
                      <p className="mt-1 text-sm leading-6 text-zinc-300">{proB}</p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-red-400">Avoid {nameB} if</div>
                      <p className="mt-1 text-sm leading-6 text-zinc-300">{antiB}</p>
                    </div>
                    <Link
                      to={linkB}
                      onClick={() =>
                        trackLeadEvent({
                          routeSlug: route?.slug || slug,
                          airportCode,
                          rentalId: bikeB?.id,
                          source: "comparison_block",
                        })
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-amber-400"
                    >
                      Deploy This Machine
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {rentals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {rentals.map((rental) => (
                <RentalCard
                  key={rental?.id || rental?.slug}
                  rental={rental}
                  airport={GRAPH?.airports?.[airportCode?.toLowerCase?.()] || null}
                />
              ))}
            </div>
          ) : (
            <FallbackCard
              title="No staged rental fleet indexed"
              body="No rental machines are currently linked to this route's origin airport in `GRAPH.rentalsByAirport`. The logistics handoff remains fully available."
            />
          )}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(10,10,10,0.9))] p-8 lg:p-10">
          <SectionHeader
            eyebrow="Dual-Engine Deployment Handoff"
            title="Initiate Mission Deployment"
            body="How do you want to execute this mission?"
          />

          <div className="mt-8 space-y-4">
            {/* PRIMARY — Rent Locally */}
            <Link
              to={routeToAirportRentPath}
              onClick={() =>
                trackLeadEvent({
                  routeSlug: route?.slug || slug,
                  airportCode,
                  rentalId: bestRental?.id,
                  source: "route_page",
                })
              }
              className="group flex w-full items-center justify-between rounded-[28px] bg-amber-500 p-6 transition-colors hover:bg-amber-400"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-black/60">
                  Primary Action
                </div>
                <h3 className="mt-2 text-2xl font-black text-black">
                  Rent Locally
                </h3>
                <p className="mt-2 text-sm leading-6 text-black/70">
                  Stage a machine from the premium fleet at {airportCode || "the origin hub"}.
                </p>
              </div>
              <ArrowUpRight className="h-6 w-6 shrink-0 text-black/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            {/* SECONDARY — Ship Your Machine */}
            <Link
              to={routeToAirliftPath}
              onClick={() =>
                trackLeadEvent({
                  routeSlug: route?.slug || slug,
                  airportCode,
                  rentalId: bestRental?.id,
                  source: "route_page",
                })
              }
              className="group flex w-full items-center justify-between rounded-[28px] border border-white/10 bg-[#121212] p-4 transition-colors hover:border-white/20 hover:bg-[#151515]"
            >
              <div>
                <h3 className="text-lg font-semibold text-zinc-300">
                  Ship Your Machine
                </h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Open Moto Airlift with the origin hub preloaded for {airportCode || "this route"}.
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {destinationSlug ? (
            <div className="mt-6">
              <Link
                to={`/destination/${destinationSlug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Continue into destination intelligence
                <ArrowUpRight className="h-4 w-4 text-[#CDA755]" />
              </Link>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
