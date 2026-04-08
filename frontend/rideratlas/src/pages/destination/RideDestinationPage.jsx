import { useEffect, useMemo, useReducer, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import RelatedEntityLinks from "@/components/seo/RelatedEntityLinks";
import EntityIntroBlock from "@/components/seo/EntityIntroBlock";
import EntityFitSummary from "@/components/seo/EntityFitSummary";
import FaqBlock from "@/components/seo/FaqBlock";
import { getLinksForDestinationPage } from "@/utils/seoLinkGraph";
import { getFaqsForDestination, getFaqSchema } from "@/utils/seoFaqEngine";
import JsonLd from "@/components/seo/JsonLd";
import SeoHelmet from "@/components/seo/SeoHelmet";
import { getDestinationSchema, getBreadcrumbSchema } from "@/utils/seoSchema";
import {
  GRAPH,
  readGraphShard,
  getGraphShardStatus,
  loadGraphShard,
} from "@/core/network/networkGraph";
import { CINEMATIC_BACKGROUNDS } from "@/utils/cinematicBackgrounds";
import { withBrandContext } from "@/utils/navigationTargets";
import { useAssetLibrary } from "@/hooks/useAssetLibrary";

// pSEO Manifest
import GENERATED_MANIFEST from "../../../public/data/generated_pages/entity_page_manifest.json";

// Luxury Components
import { FadeIn } from "@/components/luxury/FadeIn";
import CinematicHero from "@/components/luxury/CinematicHero";
import AtmosphereBlock from "@/components/luxury/AtmosphereBlock";
import VisualGallery from "@/components/luxury/VisualGallery";
import RoutesFromHere from "@/components/luxury/RoutesFromHere";
import CuratedExperiences from "@/components/luxury/CuratedExperiences";
import CinematicCTA from "@/components/luxury/CinematicCTA";

// Helpers
function getRouteRecord(routeRef) {
  if (!routeRef) return null;
  if (typeof routeRef === "string") return GRAPH?.routes?.[routeRef] || null;
  if (typeof routeRef === "object") {
    const slug = routeRef.slug || routeRef.id;
    return GRAPH?.routes?.[slug] || routeRef;
  }
  return null;
}

function getRouteAirportCode(route) {
  const airportCode =
    route?.originAirportCode ||
    route?.airport?.code ||
    route?.airportCode ||
    route?.hub?.code ||
    route?.origin?.code ||
    route?.entryAirport?.code ||
    route?.entry_airport?.code ||
    "";
  return String(airportCode || "").toUpperCase();
}
export default function RideDestinationPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [premiumData, setPremiumData] = useState(null);

  const destination = premiumData?.entity || GRAPH?.destinations?.[slug] || null;
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Check for premium pSEO data
  useEffect(() => {
    const premiumMatch = GENERATED_MANIFEST.pages.find(p => p.type === 'destination' && p.slug === slug)
    if (premiumMatch) {
       fetch(`/data/generated_pages/destination/${slug}.json`)
         .then(res => res.json())
         .then(data => setPremiumData(data))
         .catch(err => console.error("Failed to load premium destination data:", err))
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

  const rentalShard = readGraphShard("rentals");

  const routes = useMemo(() => {
    return (GRAPH?.routesByDestination?.[slug] || [])
      .map(getRouteRecord)
      .filter(Boolean);
  }, [slug]);

  const regionalPois = useMemo(() => {
    return (GRAPH?.poisByDestination?.[slug] || [])
      .map((id) => GRAPH?.pois?.[id])
      .filter(Boolean);
  }, [slug]);

  const primaryAirportCode = useMemo(() => {
    return routes.map(getRouteAirportCode).find(Boolean) || "";
  }, [routes]);

  const fullGraph = { ...GRAPH, ...rentalShard };
  const linkGraph = getLinksForDestinationPage(destination, fullGraph, location.pathname);
  const destinationSchema = getDestinationSchema(destination);
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Destinations", url: "/airport" },
    { name: destination?.name || destination?.slug, url: `/destination/${destination?.slug}` }
  ]);

  const airports = [GRAPH?.airports?.[primaryAirportCode]].filter(Boolean);
  const faqs = getFaqsForDestination(destination, routes, airports);
  const faqSchema = getFaqSchema(faqs);

  const { currentImage, caption: assetCaption, alt: assetAlt } = useAssetLibrary(
    "destination",
    destination?.id || destination?.slug,
    destination?.imageUrl || destination?.posterUrl || CINEMATIC_BACKGROUNDS.bridgeLogistics
  );

  if (!slug || !destination) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-zinc-200">
        <FadeIn className="text-center px-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755]">Destination Intelligence</div>
          <h1 className="mt-4 text-3xl font-serif text-white">Theater Not Found</h1>
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

  const heroImage = currentImage;
  const subtitle =
    [destination.region, destination.country, destination.continent]
      .filter(Boolean)
      .join(" • ") || "Intelligence Sector";

  // Data for new layers
  const atmosphereText = destination.atmosphere || destination.cinematic_pitch || destination.description || "Jagged peaks rise above winding passes. Light shifts quickly here—morning mist, golden ridgelines, sudden silence.";
  
  const galleryItems = regionalPois.slice(0, 5).map(poi => ({
    id: poi.slug || poi.id,
    imageUrl: poi.imageUrl,
    title: poi.name
  }));

  const experienceItems = regionalPois.slice(5, 8).map(poi => ({
    id: poi.slug || poi.id,
    name: poi.name,
    imageUrl: poi.imageUrl,
    type: poi.type || "Stop"
  }));

  const airportBasePath = primaryAirportCode ? `/airport/${primaryAirportCode.toLowerCase()}` : "/airport";
  const discoverPath = `${airportBasePath}?mode=rent`;

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-[#CDA755] selection:text-black">
      <SeoHelmet
        title={`Motorcycle Journeys in ${destination.name} | JetMyMoto`}
        description={`Explore epic motorcycle routes, legendary destinations, and premium rentals across ${destination.name}.`}
        canonicalUrl={`https://jetmymoto.com/destination/${destination.slug}`}
      />
      <JsonLd schema={destinationSchema} />
      <JsonLd schema={breadcrumbs} />
      <JsonLd schema={faqSchema} />

      {/* 1. CINEMATIC HERO */}
      <CinematicHero 
        eyebrow="Destination"
        title={destination.name}
        subtitle={subtitle}
        imageUrl={heroImage}
        altText={assetAlt || destination.name}
        ultraWide={true}
      />

      {/* 2. ATMOSPHERE BLOCK */}
      <AtmosphereBlock text={atmosphereText} />

      {/* 3. VISUAL GALLERY */}
      <VisualGallery items={galleryItems} />

      {/* 4. ROUTES FROM HERE */}
      <RoutesFromHere routes={routes} />

      {/* 5. CURATED EXPERIENCES */}
      <CuratedExperiences experiences={experienceItems} />

      {/* 6. CINEMATIC CTA */}
      <CinematicCTA 
        title="Begin Your Journey"
        actionText="Explore Routes"
        linkTo={discoverPath}
      />

      {/* SEO / INTELLIGENCE */}
      <section className="bg-[#050505] border-t border-white/5 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto opacity-60 hover:opacity-100 transition-opacity duration-700">
           <EntityIntroBlock entityType="destination" entityData={destination} graphData={{}} />
           <EntityFitSummary entityType="destination" entityData={destination} graphData={{}} />
           <RelatedEntityLinks linkGraph={linkGraph} />
           <FaqBlock faqs={faqs} />
        </div>
      </section>
    </div>
  );
}
