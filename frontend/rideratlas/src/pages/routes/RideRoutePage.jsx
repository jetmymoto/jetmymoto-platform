import { useReducer, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import SeoHelmet from "../../components/seo/SeoHelmet";
import RelatedEntityLinks from "@/components/seo/RelatedEntityLinks";
import EntityIntroBlock from "@/components/seo/EntityIntroBlock";
import EntityFitSummary from "@/components/seo/EntityFitSummary";
import FaqBlock from "@/components/seo/FaqBlock";
import { getLinksForRoutePage } from "@/utils/seoLinkGraph";
import { getFaqsForRoute, getFaqSchema } from "@/utils/seoFaqEngine";
import JsonLd from "@/components/seo/JsonLd";
import { getRouteSchema, getBreadcrumbSchema } from "@/utils/seoSchema";
import {
  GRAPH,
  readGraphShard,
  getGraphShardStatus,
  loadGraphShard,
} from "@/core/network/networkGraph";
import { CINEMATIC_BACKGROUNDS } from "@/utils/cinematicBackgrounds";
import { trackEvent } from "@/core/analytics/trackEvent";
import { withBrandContext } from "@/utils/navigationTargets";
import { useAssetLibrary } from "@/hooks/useAssetLibrary";

// pSEO Manifest
import GENERATED_MANIFEST from "../../../public/data/generated_pages/entity_page_manifest.json";

// Luxury Components
import { FadeIn } from "@/components/luxury/FadeIn";
import CinematicHero from "@/components/luxury/CinematicHero";
import ExperienceBlock from "@/components/luxury/ExperienceBlock";
import VisualStrip from "@/components/luxury/VisualStrip";
import CuratedFleet from "@/components/luxury/CuratedFleet";
import CinematicCTA from "@/components/luxury/CinematicCTA";

// Helpers
function getRouteDistance(route) {
  const dist = route?.distanceKm ?? route?.distance_km ?? route?.distance ?? route?.length_km;
  if (!dist) return null;
  return `${Math.round(parseFloat(dist))} km`; 
}

function getRouteDifficulty(route) {
  return route?.difficulty ?? route?.roadProfile?.difficulty ?? route?.difficultyLevel ?? route?.profile ?? "Intermediate";
}

function getRouteDuration(route) {
  const dur = route?.estimated_duration ?? route?.estimatedDuration ?? route?.duration ?? route?.duration_days ?? route?.rideTime;
  if (!dur) return null;
  return dur; 
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
  const routePoiRefs = route?.poiSlugs || route?.pois || route?.waypoints || route?.poi_refs || [];
  if (Array.isArray(routePoiRefs) && routePoiRefs.length > 0) {
    return routePoiRefs
      .map((poiRef) => {
        if (typeof poiRef === "string") return GRAPH?.pois?.[poiRef] || null;
        return GRAPH?.pois?.[poiRef?.slug || poiRef?.id] || poiRef || null;
      })
      .filter(Boolean)
      .slice(0, 3); 
  }
  const destinationSlug = route?.destination?.slug?.toLowerCase?.();
  return (GRAPH?.poisByDestination?.[destinationSlug] || [])
    .map((poiSlug) => GRAPH?.pois?.[poiSlug])
    .filter(Boolean)
    .slice(0, 3); 
}
export default function RideRoutePage() {
  const { slug } = useParams();
  const location = useLocation();
  const [premiumData, setPremiumData] = useState(null);
  const route = premiumData?.entity || GRAPH?.routes?.[slug];
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Check for premium pSEO data
  useEffect(() => {
    const premiumMatch = GENERATED_MANIFEST.pages.find(p => p.type === 'route' && p.slug === slug)
    if (premiumMatch) {
       fetch(`/data/generated_pages/route/${slug}.json`)
         .then(res => res.json())
         .then(data => setPremiumData(data))
         .catch(err => console.error("Failed to load premium route data:", err))
    }
  }, [slug])

  // Non-blocking shard load
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
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-zinc-200">
        <FadeIn className="text-center px-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-mono">Route Briefing</div>
          <h1 className="mt-4 text-3xl font-serif text-white">Route Not Found</h1>
          <p className="mt-3 text-sm text-zinc-500 font-mono max-w-md">
            The route <span className="text-zinc-300">/{slug}</span> is not recognized in the network graph.
          </p>
          <Link
            to={withBrandContext("/airport")}
            className="mt-8 inline-block border border-[#CDA755]/50 px-8 py-3 text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-[#CDA755]/10 hover:border-[#CDA755]"
          >
            Return To Global Hubs
          </Link>
        </FadeIn>
      </div>
    );
  }

  const airportCode = route?.airport?.code?.toUpperCase?.() || "";
  const airportCity = route?.airport?.city || "";
  const destinationName = route?.destination?.name || "";
  const routeName = route?.name || route?.title || (airportCity && destinationName ? `${airportCity} to ${destinationName}` : "");
  
  const routeDistance = getRouteDistance(route);
  const routeDifficulty = getRouteDifficulty(route);
  const routeDuration = getRouteDuration(route);
  const pois = getPoiRecords(route);

  const rentalShard = readGraphShard("rentals");
  const rentalsMap = rentalShard?.rentals ?? {};
  const rentalsByAirport = rentalShard?.rentalIndexes?.rentalsByAirport ?? {};

  const rentals = (rentalsByAirport?.[airportCode] || [])
    .map((rentalId) => rentalsMap?.[rentalId])
    .filter(Boolean);

  const routeParam = encodeURIComponent(route?.slug || slug || "");
  const airportBasePath = airportCode ? `/airport/${airportCode.toLowerCase()}` : "/airport";
  const routeToAirportRentPath = `${airportBasePath}?mode=rent${routeParam ? `&route=${routeParam}` : ""}`;

  const canonicalUrl = `https://jetmymoto.com/route/${route?.slug || slug}`;
  const displayRouteName = routeName.replace(/^The\s+/i, "") || slug;
  const heroSubtitle = airportCity && destinationName ? `${airportCity} — ${destinationName}` : (airportCity || destinationName || "Route Briefing");
  
  const fullGraph = { ...GRAPH, ...rentalShard };
  const linkGraph = getLinksForRoutePage(route, fullGraph, location.pathname);
  const routeSchema = getRouteSchema(route);
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Routes", url: "/airport" },
    { name: displayRouteName, url: `/route/${route.slug}` }
  ]);

  const originAirport = GRAPH?.airports?.[airportCode];
  const destination = route?.destination;
  const faqs = getFaqsForRoute(route, originAirport, destination);
  const faqSchema = getFaqSchema(faqs);

  const { currentImage, caption: assetCaption, alt: assetAlt } = useAssetLibrary(
    "route",
    route.id || route.slug,
    getRouteHeroImage(route)
  );

  const finalHeroImage = currentImage;
  const finalDescription = assetCaption || route?.description || `A masterline journey ascending from the tarmac of ${airportCity} directly into the heart of ${destinationName}.`;

  const visualItems = pois.map(poi => ({
    id: poi.slug || poi.id,
    imageUrl: poi.imageUrl,
    title: poi.name,
    eyebrow: "Waypoint"
  }));

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-[#CDA755] selection:text-black">
      <SeoHelmet
        title={`${displayRouteName} | Motorcycle Route | JetMyMoto`}
        description={finalDescription}
        canonicalUrl={canonicalUrl}
      />
      <JsonLd schema={routeSchema} />
      <JsonLd schema={breadcrumbs} />
      <JsonLd schema={faqSchema} />

      {/* 1. HERO BLOCK */}
      <CinematicHero 
        eyebrow="Route Briefing"
        title={displayRouteName}
        subtitle={heroSubtitle}
        imageUrl={finalHeroImage}
        altText={assetAlt || routeName}
      />

      {/* 2. EXPERIENCE (EMOTIONAL) */}
      <ExperienceBlock 
        metrics={[routeDistance, routeDuration, routeDifficulty]}
        description={finalDescription}
      />

      {/* 3. VISUAL STRIP (POIs / Waypoints) */}
      <VisualStrip items={visualItems} />

      {/* 4. CURATED FLEET */}
      <CuratedFleet 
        rentals={rentals}
        routeParam={routeParam}
        airportBasePath={airportBasePath}
        airportCode={airportCode}
        routeSlug={route?.slug || slug}
      />

      {/* 5. CTA BLOCK */}
      <CinematicCTA 
        title="The road is waiting."
        actionText="Begin the Ride"
        linkTo={routeToAirportRentPath}
        onClick={() => trackLeadEvent({ routeSlug: route?.slug || slug, airportCode, source: "route_page_footer" })}
      />

      {/* SEO / INTELLIGENCE */}
      <section className="bg-[#050505] border-t border-white/5 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto opacity-60 hover:opacity-100 transition-opacity duration-700">
           <EntityIntroBlock entityType="route" entityData={route} graphData={{}} />
           <EntityFitSummary entityType="route" entityData={route} graphData={{}} />
           <RelatedEntityLinks linkGraph={linkGraph} />
           <FaqBlock faqs={faqs} />
        </div>
      </section>
    </div>
  );
}
