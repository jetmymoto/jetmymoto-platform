import React, { useEffect, useMemo, useReducer, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Compass,
  CreditCard,
  Gauge,
  MapPin,
  Play,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import {
  getGraphShardStatus,
  loadGraphShard,
  readGraphSnapshot,
  readGraphShard,
} from "@/core/network/networkGraph";
import RelatedEntityLinks from "@/components/seo/RelatedEntityLinks";
import EntityIntroBlock from "@/components/seo/EntityIntroBlock";
import EntityFitSummary from "@/components/seo/EntityFitSummary";
import FaqBlock from "@/components/seo/FaqBlock";
import { getLinksForRentalPage } from "@/utils/seoLinkGraph";
import { getFaqsForRental, getFaqSchema } from "@/utils/seoFaqEngine";
import JsonLd from "@/components/seo/JsonLd";
import { getRentalSchema, getBreadcrumbSchema } from "@/utils/seoSchema";
import {
  formatRentalPrice,
  getRentalBrand,
  getRentalCategoryLabel,
  getRentalModelName,
  getRentalPosterUrl
} from "@/features/rentals/utils/rentalFormatters";
import { withBrandContext } from "@/utils/navigationTargets";
import { useAssetLibrary } from "@/hooks/useAssetLibrary";

const DEFAULT_SUITABILITY = {
  adventure: {
    Touring: 96,
    Technical: 88,
    "Two-Up": 84
  },
  touring: {
    Touring: 98,
    Technical: 72,
    "Two-Up": 95
  },
  cruiser: {
    Touring: 86,
    Technical: 58,
    "Two-Up": 93
  },
  classic: {
    Touring: 80,
    Technical: 60,
    "Two-Up": 74
  },
  scrambler: {
    Touring: 84,
    Technical: 82,
    "Two-Up": 68
  },
  "sport-touring": {
    Touring: 94,
    Technical: 79,
    "Two-Up": 81
  }
};

const DEFAULT_DEPOSITS = {
  adventure: 2500,
  touring: 2200,
  cruiser: 1800,
  classic: 1500,
  scrambler: 1700,
  "sport-touring": 2400
};

function normalizeScoreValue(value) {
  if (typeof value === "number") {
    return `${Math.round(value)}`;
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "N/A";
}

function titleizeToken(token) {
  if (!token) return "";
  if (/^\d/.test(token)) return token.toUpperCase();
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function formatDestinationLabel(slug) {
  return String(slug || "")
    .split("-")
    .map(titleizeToken)
    .join(" ");
}

function formatCurrency(value, currency = "EUR") {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "On Request";
  }

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function getDepositValue(rental) {
  if (typeof rental?.deposit === "number") {
    return rental.deposit;
  }

  return DEFAULT_DEPOSITS[String(rental?.category || "").toLowerCase()] || 2000;
}

function getInsuranceLabel(rental) {
  if (typeof rental?.insuranceIncluded === "string" && rental.insuranceIncluded.trim()) {
    return rental.insuranceIncluded;
  }

  if (rental?.insuranceIncluded === false || rental?.insurance_included === false) {
    return "Insurance Optional";
  }

  return "Insurance Included";
}

function buildSpecs(rental) {
  const categoryKey = String(rental?.category || "").toLowerCase();
  const fallbackSuitability = DEFAULT_SUITABILITY[categoryKey] || DEFAULT_SUITABILITY.adventure;
  const rawSuitability = rental?.suitability_score || fallbackSuitability;
  const suitabilityEntries = Object.entries(rawSuitability)
    .slice(0, 3)
    .map(([label, value]) => ({
      label,
      value: normalizeScoreValue(value),
      hint: "Suitability Index"
    }));

  return [
    ...suitabilityEntries,
    {
      label: "Category",
      value: getRentalCategoryLabel(rental),
      hint: "Platform Class"
    }
  ];
}

function buildRequestPath(rental, machineLabel, operatorName, missionContext = {}) {
  const params = new URLSearchParams({
    intent: "rent",
    airport: String(rental?.airportCode || rental?.airport || ""),
    rental: String(rental?.id || ""),
    machine: machineLabel,
    operator: operatorName
  });

  if (missionContext.insertionCode) params.set("insertion", missionContext.insertionCode);
  if (missionContext.extractionCode) params.set("extraction", missionContext.extractionCode);
  if (missionContext.missionSlug) params.set("mission", missionContext.missionSlug);

  return `/checkout/rental/${rental?.id || rental?.slug || ""}?${params.toString()}`;
}

function buildOneWayLandingPath(rental, missionSlug = "") {
  const params = new URLSearchParams();
  if (rental?.id) params.set("rental", rental.id);
  if (rental?.airportCode || rental?.airport) {
    params.set("hub", String(rental.airportCode || rental.airport).toUpperCase());
  }
  if (missionSlug) params.set("mission", missionSlug);

  const query = params.toString();
  return query ? `/one-way-rentals?${query}` : "/one-way-rentals";
}

function FallbackState({ slug, isLoading = false }) {
  const location = useLocation();
  const withCtx = (path) => withBrandContext(path, location.search);

  return (
    <div className="min-h-screen bg-[#050606] text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center px-6 py-20">
        <div className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96)_0%,rgba(5,6,6,0.96)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
          <div className="border-b border-white/10 px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-[#CDA755] sm:px-8">
            {isLoading ? "Fleet Briefing Syncing" : "Fleet Briefing Offline"}
          </div>

          <div className="space-y-6 px-6 py-10 sm:px-8 sm:py-12">
            <h1 className="text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-5xl">
              {isLoading ? "Loading Rental Briefing" : "Rental Not Indexed"}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
              {isLoading ? (
                <>
                  Pulling the rental shard for{" "}
                  <span className="font-semibold text-white/88">{slug || "unknown"}</span>.
                  The machine briefing will render as soon as fleet data hydrates.
                </>
              ) : (
                <>
                  The graph engine does not currently expose a rental for slug{" "}
                  <span className="font-semibold text-white/88">{slug || "unknown"}</span>.
                  If this machine was recently added, the fallback will clear automatically once the
                  rental graph hydrates.
                </>
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to={withCtx("/airport")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-[#CDA755]/40 hover:text-[#CDA755]"
              >
                Explore Hubs
                <ChevronRight size={14} />
              </Link>
              <Link
                to={withCtx("/moto-airlift#booking")}
                className="inline-flex items-center gap-2 rounded-full border border-[#A76330]/60 bg-[#A76330]/12 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#F3E5C7] transition-colors hover:border-[#CDA755] hover:bg-[#CDA755] hover:text-[#050606]"
              >
                Open Booking Intake
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RentalDetailPage() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const [videoFailed, setVideoFailed] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const graph = readGraphSnapshot();
  const withCtx = (path) => withBrandContext(path, location.search);

  useEffect(() => {
    const cleanups = ["rentals", "a2a"].map((name) => {
      const status = getGraphShardStatus(name);

      if (status === "idle") {
        loadGraphShard(name)
          .then(forceUpdate)
          .catch(() => {});
        return () => {};
      }

      if (status === "loading") {
        const interval = setInterval(() => {
          if (getGraphShardStatus(name) === "loaded") {
            clearInterval(interval);
            forceUpdate();
          }
        }, 50);

        return () => clearInterval(interval);
      }

      return () => {};
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  const rentalShard = readGraphShard("rentals");
  const a2aShard = readGraphShard("a2a");
  const rentalStatus = getGraphShardStatus("rentals");

  if (!rentalShard) {
    return <FallbackState slug={slug} isLoading={rentalStatus !== "loaded"} />;
  }

  const rentalsMap = rentalShard?.rentals ?? {};
  const operators = rentalShard?.operators ?? {};

  const rental =
    rentalsMap?.[slug] ||
    Object.values(rentalsMap).find((candidate) => candidate?.slug === slug) ||
    null;

  if (!rental) {
    return (
      <FallbackState
        slug={slug}
        isLoading={getGraphShardStatus("rentals") !== "loaded"}
      />
    );
  }

  const operator = operators?.[rental.operatorId || rental.operator];
  const airport = graph.entities.airports?.[rental.airportCode || rental.airport];
  const missionEntities = graph?.entities?.missions ?? graph?.missions ?? {};
  const destinations = (rental.compatibleDestinations || rental.compatible_destinations || []).map((destinationSlug) => ({
    slug: destinationSlug,
    destination:
      graph.entities.destinations?.[destinationSlug] || {
        slug: destinationSlug,
        name: formatDestinationLabel(destinationSlug)
      }
  }));

  const brand = getRentalBrand(rental);
  const modelName = getRentalModelName(rental);
  const categoryLabel = getRentalCategoryLabel(rental);
  const formattedPrice = formatRentalPrice(rental);
  const posterUrl = getRentalPosterUrl(rental);
  const specs = buildSpecs(rental);
  const machineLabel = `${brand} ${modelName}`.trim();

  const fullGraph = { ...graph, ...rentalShard };
  const linkGraph = getLinksForRentalPage(rental, fullGraph, location.pathname);
  const rentalSchema = getRentalSchema(rental, operator, airport);
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Rentals", url: "/airport" },
    { name: airport?.code || rental.airportCode, url: `/airport/${airport?.code || rental.airportCode}` },
    { name: machineLabel, url: `/rental/${rental.slug}` }
  ]);

  const faqs = getFaqsForRental(rental, operator, airport);
  const faqSchema = getFaqSchema(faqs);

  const operatorName = operator?.name || rental.operatorId || rental.operator || "Verified Operator";
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const activeMissionSlug = searchParams.get("mission") || "";
  const missionContext = useMemo(
    () => ({
      insertionCode: searchParams.get("insertion") || "",
      extractionCode: searchParams.get("extraction") || "",
      missionSlug: activeMissionSlug,
    }),
    [searchParams, activeMissionSlug]
  );
  const requestPath = buildRequestPath(rental, machineLabel, operatorName, missionContext);
  const videoUrl = rental?.videoUrl || rental?.video?.url || null;
  const shouldRenderVideo = Boolean(videoUrl) && !videoFailed;
  const oneWayEnabled = Boolean(
    rental?.one_way_enabled ||
      (Array.isArray(rental?.dropoff_airports) && rental.dropoff_airports.length > 0)
  );
  const corridorMissionSlugs = useMemo(() => {
    const corridorIndex = a2aShard?.corridorsByRental ?? {};
    const base = corridorIndex[rental.id] ?? corridorIndex[rental.slug] ?? [];
    const unique = [...new Set(base)].filter(Boolean);

    if (activeMissionSlug && unique.includes(activeMissionSlug)) {
      return [activeMissionSlug, ...unique.filter((slug) => slug !== activeMissionSlug)];
    }

    return unique;
  }, [a2aShard, rental.id, rental.slug, activeMissionSlug]);
  const eligibleMissions = useMemo(() => {
    return corridorMissionSlugs
      .map((missionSlug) => missionEntities[missionSlug])
      .filter(Boolean);
  }, [corridorMissionSlugs, missionEntities]);
  const primaryOneWayMission = eligibleMissions[0] ?? null;
  const oneWayLandingPath = buildOneWayLandingPath(rental, primaryOneWayMission?.slug || activeMissionSlug);

  // ── Asset Library (VAF) Integration ──
  const assetIdForLibrary = `${brand.toLowerCase()}-${modelName.toLowerCase().replace(/\s+/g, "")}`;
  const { currentImage, caption: assetCaption, alt: assetAlt } = useAssetLibrary(
    "rental",
    assetIdForLibrary,
    getRentalPosterUrl(rental)
  );

  const finalPosterUrl = currentImage;
  const finalDescription = assetCaption || `Precision-matched for premium arrivals through ${airport?.name || rental.airportCode || rental.airport}. This machine is indexed directly from the rental graph and staged for fast handoff into the existing Moto Airlift intake flow.`;

  const insuranceLabel = getInsuranceLabel(rental);
  const depositLabel =
    typeof rental?.deposit === "string" && rental.deposit.trim()
      ? rental.deposit
      : `${formatCurrency(
          getDepositValue(rental),
          String(rental?.currency || "EUR").toUpperCase()
        )} Hold`;

  return (
    <div className="min-h-screen bg-[#050606] pb-36 text-white">
      <JsonLd schema={rentalSchema} />
      <JsonLd schema={breadcrumbs} />

      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[#050606]" />

        {shouldRenderVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={finalPosterUrl}
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoUrl} />
          </video>
        ) : (
          <img
            src={finalPosterUrl}
            alt={assetAlt || machineLabel}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,6,0.18)_0%,rgba(5,6,6,0.44)_32%,rgba(5,6,6,0.92)_80%,#050606_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.18),transparent_24%),radial-gradient(circle_at_left_center,rgba(167,99,48,0.14),transparent_28%)]" />

        <div className="relative mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-end px-6 pb-12 pt-14 sm:pb-16 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#CDA755]/35 bg-[#121212]/72 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CDA755] backdrop-blur-md">
              <Sparkles size={13} />
              Rental Briefing
            </span>
            <span className="rounded-full border border-white/10 bg-[#121212]/62 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/74 backdrop-blur-md">
              {categoryLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#121212]/62 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/74 backdrop-blur-md">
              <Play size={12} className="text-[#CDA755]" />
              {shouldRenderVideo ? "Cinematic Feed" : "Showroom Still"}
            </span>
          </div>

          <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <div className="max-w-4xl">
              <div className="text-[11px] uppercase tracking-[0.32em] text-white/54">
                {operatorName} • {airport?.city || rental.airportCode || rental.airport} Deployment
              </div>
              <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-8xl">
                {brand}
                <span className="block text-[#F7F0DF]">{modelName}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/64 sm:text-base">
                {finalDescription}
              </p>
            </div>

            <div className="justify-self-start rounded-[28px] border border-white/10 bg-[#050606]/42 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-md sm:p-6 lg:justify-self-end">
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#CDA755]">
                Daily Rate
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-black tracking-[-0.05em] text-white tabular-nums sm:text-5xl">
                  {formattedPrice}
                </span>
                <span className="pb-1 text-[11px] uppercase tracking-[0.22em] text-white/52">
                  / Day
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/52">
                <Gauge size={13} className="text-[#CDA755]" />
                Verified fleet pricing
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10 lg:px-8">
        <div className="mb-10 w-full text-left">
          <EntityIntroBlock entityType="rental" entityData={rental} graphData={{ airport, operator }} />
          <EntityFitSummary entityType="rental" entityData={rental} graphData={{ airport, operator }} />
        </div>

        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96)_0%,rgba(12,12,12,0.92)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[#CDA755]">
                Tactical Specs Dashboard
              </div>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                Watch Complication Readout
              </h2>
            </div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/46">
              Data derived from the indexed rental object
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-[24px] border border-white/10 bg-[#121212] px-5 py-5"
              >
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/46">
                  {spec.label}
                </div>
                <div className="mt-4 text-3xl font-black uppercase tracking-[-0.04em] text-white tabular-nums">
                  {spec.value}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#CDA755]">
                  {spec.hint}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96)_0%,rgba(5,6,6,0.94)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#CDA755]">
              Mission Fit
            </div>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
              Certified For These Theaters
            </h2>
          </div>

          <div className="grid gap-4">
            {destinations.length > 0 ? (
              destinations.map(({ slug: destinationSlug, destination }) => (
                <Link
                  key={destinationSlug}
                  to={withCtx(`/destination/${destinationSlug}`)}
                  className="group flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-[#121212] px-5 py-4 transition-all duration-300 hover:border-[#CDA755]/40 hover:bg-[#121212]/90"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.26em] text-white/46">
                      Compatible Destination
                    </div>
                    <div className="mt-2 text-lg font-black uppercase tracking-[-0.03em] text-white">
                      {destination?.name || formatDestinationLabel(destinationSlug)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#CDA755]">
                    Open Theater
                    <ChevronRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-[#121212] px-5 py-8 text-sm leading-7 text-white/58">
                No certified destinations are attached to this machine yet. The page will populate
                automatically as soon as compatible destination slugs are indexed in the graph.
              </div>
            )}
          </div>
        </section>

        {(oneWayEnabled || eligibleMissions.length > 0) && (
          <section className="rounded-[32px] border border-[#CDA755]/15 bg-[linear-gradient(180deg,rgba(28,24,14,0.98)_0%,rgba(10,10,10,0.96)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#CDA755]">
                  One-Way Deployment Path
                </div>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                  This Machine Is Not a Dead End
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
                  This rental is one-way capable. If you landed here from an A2A mission or the one-way corridor grid, continue straight into the eligible corridor briefing or secure the machine directly.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <Link
                  to={withCtx(oneWayLandingPath)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-[#CDA755]/40 hover:text-[#CDA755]"
                >
                  Browse One-Way Corridors
                  <ChevronRight size={14} />
                </Link>
                {primaryOneWayMission ? (
                  <Link
                    to={withCtx(`/a2a/${primaryOneWayMission.slug}`)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#CDA755]/40 bg-[#CDA755]/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#CDA755] transition-colors hover:bg-[#CDA755] hover:text-[#050606]"
                  >
                    {activeMissionSlug === primaryOneWayMission.slug ? "Return To Active Corridor" : "Open Best-Match Corridor"}
                    <ArrowRight size={14} />
                  </Link>
                ) : null}
              </div>
            </div>

            {eligibleMissions.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {eligibleMissions.slice(0, 3).map((mission) => (
                  <Link
                    key={mission.slug}
                    to={withCtx(`/a2a/${mission.slug}`)}
                    className="group rounded-[24px] border border-white/10 bg-[#121212] p-5 transition-all duration-300 hover:border-[#CDA755]/40 hover:bg-[#151515]"
                  >
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/46">
                      Eligible Corridor
                    </div>
                    <div className="mt-3 flex items-center gap-2 font-mono text-xl font-black text-white tabular-nums">
                      <span>{mission.insertion_airport}</span>
                      <ArrowRight size={14} className="text-[#CDA755]" />
                      <span>{mission.extraction_airport}</span>
                    </div>
                    <div className="mt-3 text-lg font-black uppercase tracking-[-0.03em] text-white">
                      {mission.title}
                    </div>
                    <div className="mt-3 text-sm leading-6 text-white/58">
                      {mission.cinematic_pitch || "One-way corridor ready for fleet rebalancing deployment."}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#CDA755]">
                      Open Corridor Briefing
                      <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-[#121212] px-5 py-6 text-sm leading-7 text-white/58">
                The rental is flagged as one-way capable, but no corridor index is attached yet. Use the one-way landing page to browse currently active fleet-rebalancing routes from this hub.
              </div>
            )}
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96)_0%,rgba(5,6,6,0.94)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#CDA755]">
              Hub & Operator Briefing
            </div>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
              Trust Layer
            </h2>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-[#121212] p-5">
                <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#050606] text-[#CDA755]">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/46">
                    Deployment Hub
                  </div>
                  <div className="mt-2 text-xl font-black uppercase tracking-[-0.03em] text-white">
                    Staged At {rental.airportCode || rental.airport}
                  </div>
                  <div className="mt-1 text-sm text-white/58">
                    {airport?.name || airport?.city || "Verified airport hub"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-[#121212] p-5">
                <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full border border-[#A76330]/30 bg-[#A76330]/12 text-[#CDA755]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/46">
                    Operator
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="text-xl font-black uppercase tracking-[-0.03em] text-white">
                      {operatorName}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#A76330]/40 bg-[#A76330]/12 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#CDA755]">
                      <ShieldCheck size={12} />
                      Verified Partner
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96)_0%,rgba(5,6,6,0.94)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#CDA755]">
              Contract Flags
            </div>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">
              Checkout Intel
            </h2>

            <div className="mt-8 grid gap-4">
              <div className="rounded-[24px] border border-white/10 bg-[#121212] p-5">
                <div className="flex items-center gap-3 text-[#CDA755]">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/46">
                    Protection Status
                  </span>
                </div>
                <div className="mt-4 text-xl font-black uppercase tracking-[-0.03em] text-white">
                  {insuranceLabel}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#121212] p-5">
                <div className="flex items-center gap-3 text-[#CDA755]">
                  <CreditCard size={16} />
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/46">
                    Deposit
                  </span>
                </div>
                <div className="mt-4 text-xl font-black uppercase tracking-[-0.03em] text-white tabular-nums">
                  {depositLabel}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#121212] p-5">
                <div className="flex items-center gap-3 text-[#CDA755]">
                  <Compass size={16} />
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/46">
                    Dispatch Profile
                  </span>
                </div>
                <div className="mt-4 text-xl font-black uppercase tracking-[-0.03em] text-white">
                  {categoryLabel}
                </div>
              </div>
            </div>
          </div>
        </section>

        <RelatedEntityLinks linkGraph={linkGraph} />
        <FaqBlock faqs={faqs} />
      </main>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-[#050606]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#CDA755]">
              {primaryOneWayMission ? "Ready For One-Way Deployment" : "Ready For Booking Handoff"}
            </div>
            <div className="mt-2 truncate text-sm font-semibold uppercase tracking-[0.18em] text-white sm:text-base">
              {machineLabel} • {rental.airportCode || rental.airport} Hub
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {primaryOneWayMission ? (
              <Link
                to={withCtx(`/a2a/${primaryOneWayMission.slug}`)}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.24em] text-white transition-all duration-300 hover:border-[#CDA755]/40 hover:text-[#CDA755]"
              >
                {activeMissionSlug === primaryOneWayMission.slug ? "Return To Corridor" : "View One-Way Corridor"}
                <ArrowRight size={16} />
              </Link>
            ) : null}

            <Link
              to={withCtx(requestPath)}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-[#A76330]/80 bg-[#A76330] px-6 py-4 text-sm font-black uppercase tracking-[0.24em] text-[#F7F0DF] shadow-[0_0_30px_rgba(167,99,48,0.32)] transition-all duration-300 hover:border-[#CDA755] hover:bg-[#CDA755] hover:text-[#050606]"
            >
              Reserve This Machine
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
