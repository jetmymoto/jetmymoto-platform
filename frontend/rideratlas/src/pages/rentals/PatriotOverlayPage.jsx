import React, { useEffect, useReducer } from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { GRAPH, getGraphShardStatus, loadGraphShard, readGraphShard, readGraphSnapshot } from "@/core/network/networkGraph";
import SalesSharkChatWidget from "@/features/rentals/components/SalesSharkChatWidget";
import { generateSuitabilityReview } from "@/features/rentals/utils/suitabilityEngine";
import RelatedEntityLinks from "@/components/seo/RelatedEntityLinks";
import EntityIntroBlock from "@/components/seo/EntityIntroBlock";
import EntityFitSummary from "@/components/seo/EntityFitSummary";
import FaqBlock from "@/components/seo/FaqBlock";
import { getLinksForRentalPage } from "@/utils/seoLinkGraph";
import { getFaqsForRental, getFaqSchema } from "@/utils/seoFaqEngine";
import JsonLd from "@/components/seo/JsonLd";
import { getRentalSchema, getBreadcrumbSchema } from "@/utils/seoSchema";
import SeoHelmet from "@/components/seo/SeoHelmet";

// Force React re-render after async shard load completes.
function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}

function OverlayLoadingSkeleton({ airportCode }) {
  const code = String(airportCode || "").toUpperCase();

  return (
    <>
      <title>Motorcycle Rental at {code} — RiderAtlas</title>
      <meta
        name="description"
        content={`Find and compare motorcycle rentals at ${code}. Reserve your ride with RiderAtlas.`}
      />

      <div className="bg-[#050505] text-[#e5e2e1] font-sans antialiased min-h-screen flex">
        {/* 50/50 Dual-Engine Loading Skeleton */}
        <div className="flex-1 border-r border-white/5 flex flex-col justify-center items-center p-8 bg-[#0a0a0a]">
          <div className="w-8 h-8 border-2 border-[#eac26d] border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-[#c6c6c9] font-light">Loading logistics network...</p>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#050505]">
          <div className="w-8 h-8 border-2 border-[#eac26d] border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-[#c6c6c9] font-light">Loading machine telemetry...</p>
        </div>
      </div>
    </>
  );
}

export default function PatriotOverlayPage() {
  const { airportCode, bikeSlug } = useParams();
  const forceUpdate = useForceUpdate();
  const rentalShardStatus = getGraphShardStatus("rentals");

  useEffect(() => {
    if (rentalShardStatus !== "loaded") {
      loadGraphShard("rentals")
        .then(() => forceUpdate())
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.warn("Rental shard load failed:", error);
          }
        });
    }
  }, [forceUpdate, rentalShardStatus]);

  const location = useLocation();
  const rentalShard = readGraphShard("rentals");
  const graphSnapshot = readGraphSnapshot();
  const fullGraph = { ...graphSnapshot, ...rentalShard };

  // Object.values() safely against GRAPH?.rentals
  const machine = Object.values(fullGraph?.rentals || {}).find((r) => r?.slug === bikeSlug);

  // ZLS & Safe Loading Guard
  if (!machine) {
    if (rentalShardStatus !== "loaded") {
      return <OverlayLoadingSkeleton airportCode={airportCode} />;
    }
    // Definitively confirmed the shard is loaded and the rental actually does not exist.
    return <Navigate to="/404" replace />;
  }

  const code = String(airportCode || "").toUpperCase();
  const machineName = machine.name || machine.machineLabel || `${machine.brand || ""} ${machine.model || ""}`.trim() || "Motorcycle";

  const operator = fullGraph.operators?.[machine.operatorId || machine.operator];
  const airport = fullGraph.airports?.[code] || fullGraph.entities?.airports?.[code];

  const linkGraph = getLinksForRentalPage(machine, fullGraph, location.pathname);
  const rentalSchema = getRentalSchema(machine, operator, airport);
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Rentals", url: "/airport" },
    { name: code, url: `/airport/${code}` },
    { name: machineName, url: `/rentals/${code}/${machine.slug}` }
  ]);

  const faqs = getFaqsForRental(machine, operator, airport);
  const faqSchema = getFaqSchema(faqs);

  const seoTitle = `${machineName} Rental at ${code} — JetMyMoto`;
  const seoDescription = `Rent the ${machineName} at ${code}. Secure your machine or explore global shipping logistics with JetMyMoto.`;
  const canonicalUrl = `https://jetmymoto.com/rentals/${code.toLowerCase()}/${machine.slug}`;

  return (
    <>
      <SeoHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
      />

      <JsonLd schema={rentalSchema} />
      <JsonLd schema={breadcrumbs} />

      <div className="bg-[#050505] text-[#e5e2e1] font-sans antialiased min-h-screen flex flex-col md:flex-row w-full">
        {/* Left Side: Logistics (Ship Your Machine) */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 p-12 flex flex-col justify-center items-center text-center bg-[#0a0a0a] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white uppercase">
              Ship Your Machine
            </h2>
            <p className="text-lg md:text-xl text-[#c6c6c9] font-light mb-10 leading-relaxed">
              Prefer to ride your own hardware? Deploy it globally via our Moto-Airlift logistics network directly to {code}.
            </p>
            <Link
              to="/moto-airlift"
              className="inline-block bg-white/5 backdrop-blur-xl border border-white/10 text-white px-10 py-5 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-lg"
            >
              Explore Moto-Airlift
            </Link>
          </div>
        </div>

        {/* Right Side: Specific Rental Machine */}
        <div className="flex-1 p-12 flex flex-col justify-center items-center relative overflow-hidden bg-[#050505]">
          {machine.heroImageUrl && (
            <div className="absolute inset-0 z-0 opacity-20 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/80 to-[#050505] z-10" />
              <img
                src={machine.heroImageUrl}
                alt={machineName}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          <div className="relative z-10 w-full max-w-xl flex flex-col">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-[#eac26d]/10 border border-[#eac26d]/20 rounded-sm">
                <span className="w-2 h-2 bg-[#eac26d] rounded-full animate-pulse" />
                <span className="font-label text-xs uppercase tracking-[0.2em] text-[#eac26d]">
                  Tactical Rental Hardware
                </span>
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white mb-2 uppercase">
                {machineName}
              </h1>
              <p className="text-xl text-[#c6c6c9] font-light tracking-wide mb-6">
                Available at {code}
              </p>
            </div>
            
            <div className="mb-10 w-full text-left">
              <EntityIntroBlock entityType="rental" entityData={machine} graphData={{ airport, operator }} />
              <EntityFitSummary entityType="rental" entityData={machine} graphData={{ airport, operator }} />
            </div>

            {/* SEO Dominance: 3-Sentence Suitability Review */}
            <div className="mb-10 text-center">
              <p className="text-[#c6c6c9] leading-relaxed italic border-l-2 border-[#eac26d] pl-4 text-left font-light max-w-md mx-auto">
                {generateSuitabilityReview({ 
                  machineName, 
                  category: machine.category, 
                  airportCode: code 
                })}
              </p>
            </div>

            <div className="bg-[#131313]/80 backdrop-blur-md border border-white/10 p-8 rounded-sm mb-10 shadow-2xl">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-[#c6c6c9] uppercase tracking-wider text-xs font-bold mb-1">Class</div>
                  <div className="text-white text-lg capitalize">{machine.category || "Adventure"}</div>
                </div>
                {machine.pricePerDay && (
                  <div>
                    <div className="text-[#c6c6c9] uppercase tracking-wider text-xs font-bold mb-1">Daily Rate</div>
                    <div className="text-[#eac26d] font-headline font-bold text-2xl">
                      €{machine.pricePerDay} <span className="text-sm text-[#c6c6c9] font-normal">/ day</span>
                    </div>
                  </div>
                )}
              </div>
              
              <Link
                to={`/rentals/${airportCode}/${machine.slug}/checkout`}
                className="flex justify-center items-center w-full bg-[#eac26d] text-[#402d00] px-8 py-5 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:shadow-[0_0_20px_rgba(234,194,109,0.3)] transition-all active:scale-95"
              >
                Proceed to Checkout
              </Link>
            </div>

            <div className="mt-10 w-full border-t border-white/5 pt-10">
              <RelatedEntityLinks linkGraph={linkGraph} />
            </div>

            <FaqBlock faqs={faqs} />

            <div className="mt-auto">
              {/* Sales Shark Contextual AI */}
              <SalesSharkChatWidget rental={machine} airport={{ code: code }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
