import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, MapPin, Plane, Route, ShieldCheck } from "lucide-react";

import RentalCard from "@/features/rentals/components/RentalCard";
import { GRAPH } from "@/core/network/networkGraph";
import { CINEMATIC_BACKGROUNDS } from "@/utils/cinematicBackgrounds";

function getRouteRecord(routeRef) {
  if (!routeRef) {
    return null;
  }

  if (typeof routeRef === "string") {
    return GRAPH?.routes?.[routeRef] || null;
  }

  if (typeof routeRef === "object") {
    const slug = routeRef.slug || routeRef.id;
    return GRAPH?.routes?.[slug] || routeRef;
  }

  return null;
}

function getRentalRecord(rentalRef) {
  if (!rentalRef) {
    return null;
  }

  if (typeof rentalRef === "string") {
    return GRAPH?.rentals?.[rentalRef] || null;
  }

  if (typeof rentalRef === "object") {
    const slug = rentalRef.slug || rentalRef.id;
    return GRAPH?.rentals?.[slug] || rentalRef;
  }

  return null;
}

function getRouteAirportCode(route) {
  const airportCode =
    route?.airport?.code ||
    route?.airportCode ||
    route?.hub?.code ||
    route?.origin?.code ||
    route?.entryAirport?.code ||
    route?.entry_airport?.code ||
    "";

  return String(airportCode || "").toUpperCase();
}

function getRouteName(route) {
  return (
    route?.name ||
    route?.title ||
    route?.route_name ||
    route?.slug?.replace(/-/g, " ") ||
    "Unnamed Route"
  );
}

function getRouteDistance(route) {
  return (
    route?.distance_km ||
    route?.distanceKm ||
    route?.distance ||
    route?.length_km ||
    null
  );
}

function getRouteDifficulty(route) {
  return (
    route?.difficulty ||
    route?.roadProfile?.difficulty ||
    route?.difficultyLevel ||
    route?.profile ||
    "Operational"
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

export default function RideDestinationPage() {
  const { slug } = useParams();

  const destination = GRAPH?.destinations?.[slug] || null;

  const routes = useMemo(() => {
    return (GRAPH?.routesByDestination?.[slug] || [])
      .map(getRouteRecord)
      .filter(Boolean);
  }, [slug]);

  const rentals = useMemo(() => {
    return (GRAPH?.rentalsByDestination?.[slug] || [])
      .map(getRentalRecord)
      .filter(Boolean);
  }, [slug]);

  const primaryAirportCode = useMemo(() => {
    return routes.map(getRouteAirportCode).find(Boolean) || "";
  }, [routes]);

  if (!slug || !destination) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-zinc-200">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-[#121212] p-8 lg:p-10">
          <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
            Destination Intelligence
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Theater Not Found
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            The requested destination is not currently indexed in the RiderAtlas graph. Return to the hub map to re-enter the network from an active theater.
          </p>
          <div className="mt-8">
            <Link
              to="/airports"
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

  const heroImage =
    destination.imageUrl ||
    destination.posterUrl ||
    CINEMATIC_BACKGROUNDS.bridgeLogistics;

  const subtitle =
    [destination.region, destination.country, destination.continent]
      .filter(Boolean)
      .join(" • ") || "RiderAtlas Intelligence Sector";

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={destination.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.2)_0%,rgba(5,5,5,0.5)_38%,rgba(5,5,5,0.9)_72%,rgba(5,5,5,1)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.16),transparent_28%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-16 pt-28 lg:pb-20">
          <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="max-w-4xl">
              <div className="text-[10px] uppercase tracking-[0.38em] text-[#CDA755]">
                Destination Intelligence Briefing
              </div>
              <h1 className="mt-5 font-serif text-5xl font-black italic tracking-tight text-white md:text-7xl lg:text-[5.5rem]">
                {destination.name}
              </h1>
              <p className="mt-5 text-sm uppercase tracking-[0.3em] text-zinc-300">
                {subtitle}
              </p>
              {destination.description ? (
                <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-300 lg:text-base">
                  {destination.description}
                </p>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#121212]/75 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Theater Snapshot
              </div>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#050505]/80 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Routes Indexed
                  </div>
                  <div className="mt-2 text-3xl font-black tabular-nums text-white">
                    {routes.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#050505]/80 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Machines Available
                  </div>
                  <div className="mt-2 text-3xl font-black tabular-nums text-white">
                    {rentals.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#050505]/80 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Primary Hub
                  </div>
                  <div className="mt-2 text-2xl font-black tabular-nums text-white">
                    {primaryAirportCode || "TBD"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-20 px-6 pb-24 pt-10">
        <section className="space-y-8">
          <SectionHeader
            eyebrow="Monetization Layer"
            title="Machines Deployed For This Theater"
            body="Contextual fleet inventory is pulled directly from the rental graph so each destination can convert inspiration into immediate rental intent."
          />

          {rentals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {rentals.map((rental) => (
                <RentalCard
                  key={rental.id || rental.slug}
                  rental={rental}
                  airport={GRAPH?.airports?.[rental.airport?.toLowerCase?.()] || null}
                />
              ))}
            </div>
          ) : (
            <FallbackCard
              title="No local fleet deployment indexed yet"
              body="This destination is live in discovery, but no rental machines are currently linked through the active graph. Route intelligence remains available below."
            />
          )}
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="Tactical Route Intelligence"
            title="Verified Ride Lines In This Theater"
            body="Each route briefing cross-links directly into the canonical route layer with distance and difficulty readouts kept visible for tactical comparison."
          />

          {routes.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {routes.map((route) => {
                const airportCode = getRouteAirportCode(route);
                const distance = getRouteDistance(route);
                const difficulty = getRouteDifficulty(route);

                return (
                  <Link
                    key={route.slug || route.id || getRouteName(route)}
                    to={`/route/${route.slug || route.id}`}
                    className="group rounded-[28px] border border-white/10 bg-[#121212] p-6 transition-colors hover:border-[#A76330]/35 hover:bg-[#151515]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                          Route Brief
                        </div>
                        <h3 className="mt-3 text-2xl font-semibold text-white">
                          {getRouteName(route)}
                        </h3>
                      </div>
                      <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#CDA755] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-[#050505] p-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                          <Route className="h-4 w-4 text-[#CDA755]" />
                          Distance
                        </div>
                        <div className="mt-3 text-lg font-bold tabular-nums text-white">
                          {distance ? `${distance} km` : "Classified"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#050505] p-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                          <ShieldCheck className="h-4 w-4 text-[#CDA755]" />
                          Difficulty
                        </div>
                        <div className="mt-3 text-lg font-bold text-white">
                          {difficulty}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#050505] p-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                          <Plane className="h-4 w-4 text-[#CDA755]" />
                          Hub
                        </div>
                        <div className="mt-3 text-lg font-bold tabular-nums text-white">
                          {airportCode || "TBD"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <FallbackCard
              title="No route records available"
              body="The destination node exists, but route briefings have not yet been linked through GRAPH.routesByDestination for this theater."
            />
          )}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(10,10,10,0.9))] p-8 lg:p-10">
          <SectionHeader
            eyebrow="Dual-Engine Deployment Handoff"
            title="Initiate Deployment"
            body="Move directly from discovery into either enclosed bike logistics or the local rental showroom using the primary hub extracted from this destination's route network."
          />

          {primaryAirportCode ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Link
                to={`/moto-airlift?airport=${primaryAirportCode}`}
                className="group rounded-[28px] border border-[#A76330]/35 bg-[#A76330]/12 p-6 transition-colors hover:border-[#A76330]/55 hover:bg-[#A76330]/18"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-[#CDA755]">
                      Logistics Engine
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      Ship Your Machine
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Open the Moto Airlift form with the deployment hub preloaded for {primaryAirportCode}.
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-[#CDA755] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>

              <Link
                to={`/airport/${primaryAirportCode.toLowerCase()}?mode=rent`}
                className="group rounded-[28px] border border-white/10 bg-[#121212] p-6 transition-colors hover:border-[#A76330]/35 hover:bg-[#151515]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-[#CDA755]">
                      Rental Engine
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      Rent Locally
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Open the {primaryAirportCode} showroom directly in rent mode and continue inside RiderAtlas.
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-[#CDA755] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-white/10 bg-[#121212] p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-[#CDA755]" />
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Deployment hub still resolving
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                    This destination does not yet expose a primary airport code through its connected routes, so the logistics and rental handoff buttons are held back until the graph is fully linked.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
