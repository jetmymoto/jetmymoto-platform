import { useReducer, useEffect, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Clock3,
  MapPin,
  Mountain,
  Plane,
  Route as RouteIcon,
  ShieldCheck,
  Layers,
  Truck,
  Bike,
} from "lucide-react";

import SeoHelmet from "../../components/seo/SeoHelmet";
import A2AOperatorFleet from "@/features/a2a/components/A2AOperatorFleet";
import MissionCinematicVideo from "@/features/a2a/components/MissionCinematicVideo";
import TacticalDossierTrap from "@/components/conversion/TacticalDossierTrap";
import RelatedEntityLinks from "@/components/seo/RelatedEntityLinks";
import EntityIntroBlock from "@/components/seo/EntityIntroBlock";
import EntityFitSummary from "@/components/seo/EntityFitSummary";
import FaqBlock from "@/components/seo/FaqBlock";
import { getLinksForMissionPage } from "@/utils/seoLinkGraph";
import { getFaqsForMission, getFaqSchema } from "@/utils/seoFaqEngine";
import JsonLd from "@/components/seo/JsonLd";
import { getA2AMissionSchema, getBreadcrumbSchema } from "@/utils/seoSchema";
import {
  GRAPH,
  readGraphShard,
  getGraphShardStatus,
  loadGraphShard,
} from "@/core/network/networkGraph";
import { CINEMATIC_BACKGROUNDS } from "@/utils/cinematicBackgrounds";
import { withBrandContext } from "@/utils/navigationTargets";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
        <p className="mt-4 text-sm leading-7 text-zinc-400 lg:text-base">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function HubCard({ label, airport, airportCode, icon: Icon }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[#121212] p-6">
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-zinc-500">
        <Icon className="h-4 w-4 text-[#CDA755]" />
        {label}
      </div>
      <div className="mt-5 rounded-[24px] border border-white/10 bg-[#050505] p-5">
        <div className="text-4xl font-black tabular-nums text-white">
          {airportCode}
        </div>
        <div className="mt-2 text-sm text-zinc-300">
          {airport?.city || airportCode}
        </div>
        {airport?.region ? (
          <div className="mt-1 text-xs text-zinc-500">{airport.region}</div>
        ) : null}
      </div>
    </div>
  );
}

function TheaterIntelGrid({ theater }) {
  if (!theater) return null;

  const stats = [
    {
      label: "Terrain",
      value: theater.terrain_type || "Unclassified",
      icon: Mountain,
    },
    {
      label: "Difficulty",
      value: theater.difficulty_rating || "Unrated",
      icon: ShieldCheck,
    },
    {
      label: "Max Altitude",
      value: theater.max_altitude_m
        ? `${Math.round(theater.max_altitude_m).toLocaleString()}m`
        : "N/A",
      icon: Layers,
    },
    {
      label: "Road Segments",
      value: theater.road_segments
        ? theater.road_segments.toLocaleString()
        : "N/A",
      icon: RouteIcon,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-[24px] border border-white/10 bg-[#121212] p-5"
        >
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            <s.icon className="h-4 w-4 text-[#CDA755]" />
            {s.label}
          </div>
          <div className="mt-3 text-2xl font-black tabular-nums text-white">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function MissionSpine({ insertion, extraction, theater, distance, duration }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-[#121212] p-8">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* Insertion */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-[#CDA755]">
            Insertion Hub
          </div>
          <div className="mt-3 text-4xl font-black text-white">
            {insertion?.code || "---"}
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            {insertion?.city || "Origin"}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex flex-col items-center gap-1">
          <ArrowRight className="h-6 w-6 text-[#CDA755]" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
            {distance ? `${distance} km` : ""}
          </span>
        </div>

        {/* Theater */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-[#CDA755]">
            The Theater
          </div>
          <div className="mt-3 text-2xl font-black text-white">
            {theater?.name || "Unknown Theater"}
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            {duration ? `${duration} days` : "Multi-day mission"}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex flex-col items-center gap-1">
          <ArrowRight className="h-6 w-6 text-[#CDA755]" />
        </div>

        {/* Extraction */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-[#CDA755]">
            Extraction Hub
          </div>
          <div className="mt-3 text-4xl font-black text-white">
            {extraction?.code || "---"}
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            {extraction?.city || "Destination"}
          </div>
        </div>
      </div>
    </div>
  );
}

function DualEngineCTA({ mission, withCtx }) {
  const insertionCode = mission?.insertion?.code?.toLowerCase() || "";
  const extractionCode = mission?.extraction?.code?.toLowerCase() || "";
  const missionSlug = mission?.slug || "";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Rental Engine */}
      <Link
        to={withCtx(
          `/airport/${insertionCode}?mode=rent&mission=${encodeURIComponent(missionSlug)}`
        )}
        className="group rounded-[28px] border border-[#CDA755]/20 bg-gradient-to-br from-[#CDA755]/10 to-transparent p-8 transition-all hover:border-[#CDA755]/40 hover:shadow-[0_0_48px_rgba(205,167,85,0.08)]"
      >
        <div className="flex items-start justify-between">
          <Bike className="h-8 w-8 text-[#CDA755]" />
          <ArrowUpRight className="h-5 w-5 text-[#CDA755] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <h3 className="mt-6 text-2xl font-black text-white">
          Request One-Way Rental
        </h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Pick up a bike at{" "}
          <span className="font-semibold text-white">
            {mission?.insertion?.city || mission?.insertion_airport}
          </span>{" "}
          and drop it off at{" "}
          <span className="font-semibold text-white">
            {mission?.extraction?.city || mission?.extraction_airport}
          </span>
          . We match you with operators who support open-jaw one-way rentals on
          this corridor.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#CDA755]">
          Browse Fleet
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </Link>

      {/* Logistics Engine */}
      <Link
        to={withCtx(
          `/moto-airlift?insertion=${insertionCode}&extraction=${extractionCode}&mission=${encodeURIComponent(missionSlug)}`
        )}
        className="group rounded-[28px] border border-white/10 bg-[#121212] p-8 transition-all hover:border-white/20 hover:shadow-[0_0_48px_rgba(255,255,255,0.04)]"
      >
        <div className="flex items-start justify-between">
          <Truck className="h-8 w-8 text-zinc-400" />
          <ArrowUpRight className="h-5 w-5 text-zinc-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <h3 className="mt-6 text-2xl font-black text-white">
          Request A2A Bike Transport
        </h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Ship your own motorcycle to{" "}
          <span className="font-semibold text-white">
            {mission?.insertion?.city || mission?.insertion_airport}
          </span>{" "}
          and have it recovered from{" "}
          <span className="font-semibold text-white">
            {mission?.extraction?.city || mission?.extraction_airport}
          </span>
          . Open-jaw logistics handled end-to-end.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300">
          Request Quote
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function A2AMissionPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const withCtx = (path) => withBrandContext(path, location.search);

  const mission = GRAPH?.missions?.[slug] || null;

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

  const rentalShard = readGraphShard("rentals");
  const rentalsMap = rentalShard?.rentals ?? {};
  const rentalsByAirport =
    rentalShard?.rentalIndexes?.rentalsByAirport ?? {};

  const insertionCode = mission?.insertion?.code || mission?.insertion_airport || "";
  const extractionCode = mission?.extraction?.code || mission?.extraction_airport || "";

  const pois = useMemo(() => {
    const theaterSlug = mission?.theater || "";
    return (GRAPH?.poisByDestination?.[theaterSlug] || [])
      .map((poiSlug) => GRAPH?.pois?.[poiSlug])
      .filter(Boolean)
      .slice(0, 6);
  }, [mission?.theater]);

  // ── 404 ──
  if (!slug || !mission) {
    return (
      <div className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-zinc-200">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-[#121212] p-8 lg:p-10">
          <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
            A2A Mission Intelligence
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Mission Not Found
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            The requested A2A mission corridor is not currently indexed in the
            RiderAtlas graph. Return to the hub map to explore active corridors.
          </p>
          <div className="mt-8">
            <Link
              to={withCtx("/airport")}
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

  const theater = mission?.theaterData || null;
  const heroImage =
    theater?.imageUrl ||
    theater?.posterUrl ||
    CINEMATIC_BACKGROUNDS.bridgeLogistics;

  const canonicalUrl = `https://jetmymoto.com/a2a/${mission.slug}`;
  
  const fullGraph = { ...GRAPH, ...rentalShard };
  const linkGraph = getLinksForMissionPage(mission, fullGraph, location.pathname);
  const missionSchema = getA2AMissionSchema(mission);
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "A2A Missions", url: "/airport" },
    { name: mission.title || mission.slug, url: `/a2a/${mission.slug}` }
  ]);

  const faqs = getFaqsForMission(mission, mission?.insertion, mission?.extraction, theater);
  const faqSchema = getFaqSchema(faqs);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      <SeoHelmet
        title={mission.seo?.title || `${mission.title} | A2A Mission`}
        description={
          mission.seo?.description || mission.cinematic_pitch?.slice(0, 160)
        }
        canonicalUrl={canonicalUrl}
      />

      <JsonLd schema={missionSchema} />
      <JsonLd schema={breadcrumbs} />
      <JsonLd schema={faqSchema} />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          {mission.videoUrl ? (
            <MissionCinematicVideo mission={mission} />
          ) : (
            <>
              <img
                src={heroImage}
                alt={mission.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.2)_0%,rgba(5,5,5,0.5)_38%,rgba(5,5,5,0.9)_72%,rgba(5,5,5,1)_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
            </>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.16),transparent_28%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-16 pt-28 lg:pb-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CDA755]/30 bg-[#CDA755]/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.32em] text-[#CDA755]">
              <Plane className="h-3 w-3" />
              A2A Mission
            </div>
            <h1 className="mt-5 font-serif text-5xl font-black italic tracking-tight text-white md:text-7xl lg:text-[5.5rem]">
              {mission.title}
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-zinc-300">
              {insertionCode} → {theater?.name || mission.theater} →{" "}
              {extractionCode}
            </p>
            {mission.cinematic_pitch ? (
              <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-300 lg:text-base">
                {mission.cinematic_pitch}
              </p>
            ) : null}
            {(theater?.best_season || theater?.ride_character) ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {theater?.best_season ? (
                  <span className="rounded-full border border-[#CDA755]/30 bg-[#CDA755]/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.32em] text-[#CDA755]">
                    {theater.best_season}
                  </span>
                ) : null}
                {theater?.ride_character ? (
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.32em] text-zinc-300">
                    {theater.ride_character}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl space-y-20 px-6 pb-24 pt-10">
        <div>
          <EntityIntroBlock entityType="a2a" entityData={mission} graphData={{ insertion: mission.insertion, extraction: mission.extraction, theater: theater }} />
        </div>

        {/* ── Mission Spine ─────────────────────────────────────────────── */}
        <section>
          <MissionSpine
            insertion={mission.insertion}
            extraction={mission.extraction}
            theater={theater}
            distance={mission.distance_km}
            duration={mission.duration_days}
          />
        </section>

        <div>
          <EntityFitSummary entityType="a2a" entityData={mission} graphData={{ insertion: mission.insertion, extraction: mission.extraction, theater: theater }} />
        </div>

        {/* ── Theater Intel ─────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHeader
            eyebrow="Theater Intelligence"
            title={`${theater?.name || "Unknown"} — Riding Conditions`}
            body="Real telemetry pulled from OpenStreetMap road network analysis and satellite-verified surface data for this theater of operations."
          />
          <TheaterIntelGrid theater={theater} />

          {/* Highlights */}
          {mission.highlights?.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {mission.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-[20px] border border-white/10 bg-[#121212] p-5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#CDA755]/30 bg-[#CDA755]/10 text-xs font-bold text-[#CDA755]">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{h}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* ── Dual-Engine CTA ───────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHeader
            eyebrow="Deploy This Mission"
            title="Choose Your Logistics Engine"
            body="Two ways to execute this corridor. Rent a bike one-way from a local fleet, or ship your own machine and have it recovered at the extraction hub."
          />
          <DualEngineCTA mission={mission} withCtx={withCtx} />
        </section>

        {/* ── Insertion Hub Fleet ────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHeader
            eyebrow="Insertion Logistics"
            title={`Fleet Available at ${mission.insertion?.city || insertionCode} (${insertionCode})`}
            body="Bikes stationed at the insertion hub. Filter for one-way availability to confirm open-jaw drop-off at the extraction point."
          />
          <A2AOperatorFleet
            airportCode={insertionCode}
            rentalShard={rentalShard}
            GRAPH={GRAPH}
            missionContext={{
              insertionCode,
              extractionCode,
              missionSlug: mission.slug,
            }}
          />
        </section>

        {/* ── Extraction Hub Fleet ───────────────────────────────────────── */}
        {extractionCode !== insertionCode ? (
          <section className="space-y-8">
            <SectionHeader
              eyebrow="Extraction Logistics"
              title={`Fleet at ${mission.extraction?.city || extractionCode} (${extractionCode})`}
              body="Machines at the extraction hub for riders who need a return leg or want to continue into a new theater from this point."
            />
            <A2AOperatorFleet
              airportCode={extractionCode}
              rentalShard={rentalShard}
              GRAPH={GRAPH}
              missionContext={{
                insertionCode,
                extractionCode,
                missionSlug: mission.slug,
              }}
            />
          </section>
        ) : null}

        {/* ── POI Waypoints ──────────────────────────────────────────────── */}
        {pois.length > 0 ? (
          <section className="space-y-8">
            <SectionHeader
              eyebrow="Waypoint Briefings"
              title="Key Points of Interest Along This Corridor"
              body="Enriched intelligence nodes from the theater's POI database — mountain passes, cultural landmarks, and rider-rated stops."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pois.map((poi) => (
                <Link
                  key={poi?.slug || poi?.name}
                  to={withCtx(`/poi/${poi?.slug}`)}
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
                  <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {[poi?.type, poi?.elevation_m ? `${poi.elevation_m}m` : null]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                  {poi?.cinematic_description ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                      {poi.cinematic_description}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Tactical Dossier ───────────────────────────────────────────── */}
        <section className="space-y-8">
          <TacticalDossierTrap hubName={theater?.name || mission.title || "A2A"} />
        </section>

        <RelatedEntityLinks linkGraph={linkGraph} />
        <FaqBlock faqs={faqs} />

        {/* ── Back to Hub ────────────────────────────────────────────────── */}
        <div className="flex justify-center">
          <Link
            to={withCtx("/airport")}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#121212] px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-[#A76330]/35 hover:text-white"
          >
            Explore More Hubs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
