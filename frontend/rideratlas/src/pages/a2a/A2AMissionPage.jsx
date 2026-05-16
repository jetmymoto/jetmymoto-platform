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
  Bike,
  LogOut,
  Thermometer,
  Fuel,
} from "lucide-react";

import SeoHelmet from "../../components/seo/SeoHelmet";
import A2AOperatorFleet from "@/features/a2a/components/A2AOperatorFleet";
import MissionCinematicVideo from "@/features/a2a/components/MissionCinematicVideo";
import HowA2AWorks from "@/features/a2a/components/HowA2AWorks";
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

import SafeImage from "@/components/ui/SafeImage";
import { Atmosphere } from "@/components/cinematic/Atmosphere";
import { EditorialSplit } from "@/components/cinematic/EditorialSplit";
import { CinematicSectionHeader } from "@/components/cinematic/CinematicSectionHeader";
import MissionTrustLayer from "@/features/missions/sections/MissionTrustLayer";
import { getMissionMedia, getGeographicIntelligenceMedia, getEditorialMedia } from "@/lib/media/getMissionMedia";
import GeographicIntelligencePanel from "@/components/a2a/GeographicIntelligencePanel";

// ── Helpers ──────────────────────────────────────────────────────────────────

const LIBRARY_MAPS = {
  primary: "https://storage.googleapis.com/factory1/route-intelligence-v1/mxp-to-muc-alpine-traverse/operational_map.jpg",
  secondary1: "https://storage.googleapis.com/factory1/route-intelligence-v1/mxp-to-muc-alpine-traverse/days/day_01_map.jpg",
  secondary2: "https://storage.googleapis.com/factory1/route-intelligence-v1/mxp-to-muc-alpine-traverse/days/day_02_map.jpg",
  contact: "https://storage.googleapis.com/factory1/geographic-intelligence-v1/global_contact_sheet.jpg"
};

function GeographicIntelligence({ missionSlug, missionData }) {
  const media = getMissionMedia(missionSlug);
  const geo = media?.geographicIntelligence;
  
  return (
    <section className="space-y-16">
      <CinematicSectionHeader
        eyebrow="Intelligence Briefing"
        title="Geographic Node Analysis"
        body="Deterministic high-resolution terrain telemetry synchronized with verified GPX route geometry."
      />
      
      <GeographicIntelligencePanel 
        missionSlug={missionSlug}
        missionData={missionData}
        geoMedia={geo}
      />
    </section>
  );
}

function TheaterIntelGrid({ theater, mission }) {
  if (!theater) return null;

  const stats = [
    {
      label: "Elevation Gain",
      value: mission?.elevation_gain_m
        ? `${mission.elevation_gain_m.toLocaleString()}m`
        : theater.max_altitude_m
        ? `${Math.round(theater.max_altitude_m).toLocaleString()}m`
        : null,
      icon: Mountain,
    },
    {
      label: "Riding Style",
      value: mission?.riding_style || theater.ride_character,
      icon: Bike,
    },
    {
      label: "Weather Window",
      value: mission?.weather_window || theater.best_season,
      icon: Thermometer,
    },
    {
      label: "Fuel Requirement",
      value: mission?.fuel_range_requirement,
      icon: Fuel,
    },
    {
      label: "Difficulty",
      value: theater.difficulty_rating,
      icon: ShieldCheck,
    },
    {
      label: "Road Segments",
      value: theater.road_segments
        ? theater.road_segments.toLocaleString()
        : null,
      icon: RouteIcon,
    },
  ].filter(s => s.value && s.value !== "N/A" && s.value !== "Unrated");

  if (stats.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-[24px] border border-white/10 bg-[#121212] p-6 group hover:border-[#CDA755]/30 transition-all shadow-xl"
        >
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black">
            <s.icon className="h-4 w-4 text-[#CDA755]" />
            {s.label}
          </div>
          <div className="mt-4 text-xl font-black tabular-nums text-white uppercase tracking-tight">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function MissionSpine({ insertion, extraction, theater, distance, duration }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-[#121212] p-8 lg:p-12">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* Insertion */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-[#CDA755] font-black">
            Fly into
          </div>
          <div className="mt-4 text-5xl font-black text-white">
            {insertion?.code || "---"}
          </div>
          <div className="mt-2 text-sm font-bold text-zinc-300">
            {insertion?.city || "Origin"}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex flex-col items-center gap-2">
          <ArrowRight className="h-6 w-6 text-zinc-700" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CDA755]">
            {distance ? `${distance} KM` : ""}
          </span>
        </div>

        {/* Theater */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-black">
            Ride through
          </div>
          <div className="mt-4 text-2xl font-black text-white uppercase tracking-tight">
            {theater?.name || "Corridor"}
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            {duration ? `${duration} Days` : "One-Way"}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex flex-col items-center gap-2">
          <ArrowRight className="h-6 w-6 text-zinc-700" />
        </div>

        {/* Extraction */}
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-[#CDA755] font-black">
            Fly out of
          </div>
          <div className="mt-4 text-5xl font-black text-white">
            {extraction?.code || "---"}
          </div>
          <div className="mt-2 text-sm font-bold text-zinc-300">
            {extraction?.city || "Destination"}
          </div>
        </div>
      </div>
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
  const editorial = getEditorialMedia(slug);

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
  const insertionCity = mission?.insertion?.city || "Origin Hub";
  const extractionCity = mission?.extraction?.city || "Destination Hub";

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
          <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755] font-bold">
            A2A Mission Profile
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white uppercase">
            Route Not Found
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            The requested A2A corridor is not currently active in our logistics network. Return to the hub map to explore available routes.
          </p>
          <div className="mt-8">
            <Link
              to={withCtx("/airport")}
              className="inline-flex items-center gap-3 rounded-full border border-[#CDA755]/40 bg-[#CDA755]/15 px-5 py-3 text-sm font-semibold text-[#CDA755] transition-colors hover:border-[#CDA755]/60 hover:bg-[#CDA755]/20"
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
      <section className="relative isolate overflow-hidden min-h-screen flex flex-col justify-end">
        <div className="absolute inset-0 bg-[#050505]">
          {mission.videoUrl ? (
            <MissionCinematicVideo mission={mission} />
          ) : (
            <>
              <SafeImage
                src={heroImage}
                alt={mission.title}
                className="h-full w-full object-cover opacity-60 transition-transform duration-[10s] scale-105"
                showPlaceholder={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/40 via-transparent to-[#050505]/40" />
            </>
          )}
          {/* Visual Anchor / Map Overlay Hint */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(205,167,85,0.1)_0%,transparent_70%)]" />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-32 lg:pb-32">
          <div className="max-w-5xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-[1px] w-12 bg-[#CDA755]/50" />
              <div className="text-[11px] uppercase tracking-[0.5em] text-[#CDA755] font-black">
                One-Way A2A Corridor
              </div>
            </div>
            
            <h1 className="font-headline text-5xl font-black italic tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[7.5rem] leading-[0.85] uppercase break-words">
              {mission.title}
            </h1>
            
            <div className="mt-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Plane className="h-5 w-5 text-[#CDA755]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">Fly In</div>
                  <div className="text-xl font-black text-white uppercase">{insertionCity}</div>
                </div>
              </div>

              <div className="hidden md:block h-8 w-[1px] bg-white/10" />

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <LogOut className="h-5 w-5 text-[#CDA755]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">Fly Out</div>
                  <div className="text-xl font-black text-white uppercase">{extractionCity}</div>
                </div>
              </div>

              <div className="hidden md:block h-8 w-[1px] bg-white/10" />

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[#CDA755]/10 border border-[#CDA755]/20 backdrop-blur-md">
                  <RouteIcon className="h-5 w-5 text-[#CDA755]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#CDA755] font-black">The Corridor</div>
                  <div className="text-xl font-black text-white uppercase">{theater?.name || "One-Way Ride"}</div>
                </div>
              </div>
            </div>

            <p className="mt-12 max-w-2xl text-lg leading-relaxed text-zinc-300 lg:text-2xl font-light">
              {mission.cinematic_pitch || `Ride from ${insertionCity} to ${extractionCity} through the heart of the technical sectors. Fly home directly—no backtracking required.`}
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="relative mx-auto max-w-7xl space-y-32 px-6 pb-48 pt-20">
        <Atmosphere />

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

        {/* ── How It Works ─────────────────────────────────────────────── */}
        <HowA2AWorks />

        {/* ── Editorial Narrative: Origin ────────────────────────────────── */}
        <EditorialSplit
          eyebrow="Mission Staging"
          title={`Origin Deployment: ${insertionCity}`}
          body={`Your one-way mission begins at the ${insertionCode} terminal. We ensure your premium machine is technical-spec prepped, fueled, and staged for immediate deployment upon your arrival.`}
          imageUrl={mission.insertion?.imageUrl || CINEMATIC_BACKGROUNDS.missionStaging}
          videoUrl={editorial?.originDeployment?.publicUrl || "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2FText_overlay_motorcycle_runway_202605101616.mp4?alt=media&token=87c2a541-ceda-4d5e-86b5-f6db566c3f72"}
          detail="Machine prep includes fluid telemetry check, tire pressure optimization for Alpine sectors, and luggage rack synchronization."
          stats={[
            { label: 'Primary Hub', value: insertionCode },
            { label: 'Staging', value: 'Verified' }
          ]}
        />

        {/* ── Editorial Narrative: Destination ───────────────────────────── */}
        <EditorialSplit
          eyebrow="Mission Extraction"
          title={`Destination Hub: ${extractionCity}`}
          body={`Execute your route across the geographical corridor and finish at the ${extractionCode} extraction hub. No highway backtracking required—simply hand over the machine and proceed to your outbound flight.`}
          imageUrl={mission.extraction?.imageUrl || CINEMATIC_BACKGROUNDS.industrialRecovery}
          videoUrl={editorial?.extractionHub?.publicUrl || "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2FText_overlay_mission_complete_202605101641.mp4?alt=media&token=2c1751d7-13a0-44e8-a541-024ea0f577af"}
          reverse={true}
          detail="Our recovery engine handles cross-border fleet rebalancing and long-range transport post-extraction."
          stats={[
            { label: 'Recovery Hub', value: extractionCode },
            { label: 'Logistics', value: 'Managed' }
          ]}
        />

        <MissionTrustLayer mission={mission} />

        <GeographicIntelligence missionSlug={slug} missionData={mission} />

        {/* ── Theater Intel ─────────────────────────────────────────────── */}
        <section className="space-y-16">
          <CinematicSectionHeader
            eyebrow="Corridor Profile"
            title={`${theater?.name || "Unknown"} — Riding Terrain`}
            body={`Detailed metrics for the geographic corridor between ${insertionCity} and ${extractionCity}.`}
          />
          <TheaterIntelGrid theater={theater} mission={mission} />

          {/* Border Transitions & Stopovers */}
          {(mission.border_crossings || mission.recommended_stopovers) && (
            <div className="grid gap-6 md:grid-cols-2 mt-8">
              {mission.border_crossings && (
                <div className="p-6 rounded-[24px] bg-white/5 border border-white/10">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-black mb-4">Border Transitions</h4>
                  <div className="flex flex-wrap gap-2">
                    {mission.border_crossings.map(b => (
                      <span key={b} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 font-bold uppercase">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              {mission.recommended_stopovers && (
                <div className="p-6 rounded-[24px] bg-white/5 border border-white/10">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-black mb-4">Recommended Stopovers</h4>
                  <div className="flex flex-wrap gap-2">
                    {mission.recommended_stopovers.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 font-bold uppercase">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Highlights */}
          {mission.route_highlights?.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3 mt-8">
              {mission.route_highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-[#121212] p-6 hover:border-[#CDA755]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">{h.type}</span>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#CDA755]/30 bg-[#CDA755]/10 text-[10px] font-bold text-[#CDA755]">
                      {i + 1}
                    </div>
                  </div>
                  <h5 className="text-lg font-black text-white uppercase tracking-tight">{h.name}</h5>
                  <p className="text-xs leading-relaxed text-zinc-400">{h.reason}</p>
                </div>
              ))}
            </div>
          ) : mission.highlights?.length > 0 ? (
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

        {/* ── Fleet Staging ─────────────────────────────────────────────── */}
        <EditorialSplit
          eyebrow="Hardware Staging"
          title={`Fleet at ${insertionCity}`}
          body={`Premium motorcycles currently staged and ready at the ${insertionCode} hub. Our inventory is optimized for the ${theater?.name || 'Alpine'} terrain and verified for one-way deployment to ${extractionCode}.`}
          imageUrl={CINEMATIC_BACKGROUNDS.fleetStaging}
          detail="All fleet assets undergo a 48-point technical inspection 12 hours before mission deployment."
        />

        <section className="space-y-16">
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

        {/* ── Route Moments ──────────────────────────────────────────────── */}
        {pois.length > 0 && (
          <section className="space-y-20">
            <CinematicSectionHeader
              eyebrow="Corridor Highlights"
              title="Technical Sectors & Waypoints"
              body="High-authority waypoints along this one-way corridor. Each sector is selected for technical terrain, geographical reward, and verified rider telemetry."
            />
            <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
              {pois.map((poi, idx) => (
                <Link
                  key={poi?.slug || poi?.name}
                  to={withCtx(`/poi/${poi?.slug}`)}
                  className="group relative flex flex-col rounded-[40px] border border-white/5 bg-[#121212] transition-all hover:border-[#CDA755]/30 hover:bg-[#151515] overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-6 left-6 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-[10px] font-black text-[#CDA755] backdrop-blur-md">
                    0{idx + 1}
                  </div>
                  
                  <div className="aspect-[16/10] overflow-hidden bg-black">
                    <SafeImage 
                      src={poi?.imageUrl} 
                      alt={poi?.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                    />
                  </div>

                  <div className="p-8 lg:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-black">
                          {poi?.type || "Technical Sector"}
                        </div>
                        <h3 className="mt-4 text-2xl font-black text-white uppercase tracking-tight leading-tight">
                          {poi?.name || "Unnamed Point"}
                        </h3>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <MapPin className="h-5 w-5 text-[#CDA755]" />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-3">
                       {poi?.elevation_m && (
                         <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                           {poi.elevation_m}M ASL
                         </span>
                       )}
                       <span className="px-3 py-1.5 rounded-full bg-[#CDA755]/10 border border-[#CDA755]/20 text-[9px] font-bold text-[#CDA755] uppercase tracking-widest">
                         Verified Sector
                       </span>
                    </div>

                    <p className="mt-8 text-sm leading-relaxed text-zinc-500 font-medium">
                      {poi?.cinematic_description || "Technical telemetry data synchronized for this waypoint. Access full dossier for seasonal conditions."}
                    </p>

                    <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#CDA755] transition-all group-hover:translate-x-1">
                      View Sector Intel
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Tactical Dossier ───────────────────────────────────────────── */}
        <section className="space-y-16">
          <TacticalDossierTrap hubName={theater?.name || mission.title || "A2A"} />
        </section>

        <RelatedEntityLinks linkGraph={linkGraph} />
        <FaqBlock faqs={faqs} />

        {/* ── Back to Hub ────────────────────────────────────────────────── */}
        <div className="flex justify-center pt-24">
          <Link
            to={withCtx("/airport")}
            className="group inline-flex items-center gap-6 rounded-full border border-white/10 bg-[#121212] px-10 py-5 text-xs font-black uppercase tracking-[0.4em] text-zinc-300 transition-all hover:border-[#CDA755]/40 hover:text-white"
          >
            Explore More Corridors
            <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </main>
    </div>
  );
}
