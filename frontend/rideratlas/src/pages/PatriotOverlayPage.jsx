import React, { useEffect, useReducer } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  getGraphShardStatus,
  loadGraphShard,
  readGraphShard,
} from "@/core/network/networkGraph";
import { buildOverlayPath } from "@/core/patriot/overlayTemplates.js";
import TrustInfrastructure from "@/components/home/TrustInfrastructure";

// Force React re-render after async shard load completes.
// No useState needed — useReducer with increment is side-effect free.
function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}

function getOverlaySafe(id) {
  const shard = readGraphShard("overlays");
  return shard?.patriotOverlays?.[id] || shard?.[id] || null;
}

function getOverlaySource(id) {
  const shard = readGraphShard("overlays");

  if (shard?.patriotOverlays?.[id] || shard?.[id]) {
    return "shard";
  }

  return "missing";
}

function getOverlayIdForPath(airportCode, rentalSlug) {
  const shard = readGraphShard("overlays");
  const path = buildOverlayPath({ airportCode, slug: rentalSlug });
  return shard?.overlayIndexes?.overlayIdByPath?.[path] || null;
}

export default function PatriotOverlayPage() {
  const { airportCode, rentalSlug } = useParams();
  const forceUpdate = useForceUpdate();
  const overlayShardStatus = getGraphShardStatus("overlays");
  const overlayId = getOverlayIdForPath(airportCode, rentalSlug);
  const overlay = overlayId ? getOverlaySafe(overlayId) : null;
  const overlaySource = overlayId ? getOverlaySource(overlayId) : "missing";

  useEffect(() => {
    if (overlayShardStatus !== "loaded") {
      loadGraphShard("overlays")
        .then(forceUpdate)
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.warn("Overlay shard load failed:", error);
          }
        });
    }

  }, [forceUpdate, overlayShardStatus]);

  useEffect(() => {
    if (!overlayId) {
      return;
    }

    if (import.meta.env.DEV) {
      console.log("Overlay source:", overlaySource);
    }
  }, [overlayId, overlaySource]);

  if (!overlay) {
    // Direct visits may resolve the path before the async overlays shard arrives.
    if (overlayShardStatus !== "loaded") {
      return <OverlayLoadingSkeleton airportCode={airportCode} />;
    }

    return <Navigate to="/404" replace />;
  }

  if (overlay.overlayType === "intent-airport") {
    return <IntentOverlayRenderer overlay={overlay} />;
  }

  return <RentalOverlayRenderer overlay={overlay} />;
}

// ── Intent overlay renderer (🔴7: separate branch) ──

function IntentOverlayRenderer({ overlay }) {
  const airportCity = overlay.renderData?.airportCity || overlay.sourceRefs.airportCode;
  const code = overlay.renderData?.airportCode || overlay.sourceRefs.airportCode;
  const matchedBikes = overlay.renderData?.matchedBikes || overlay.content.matchedBikes || [];

  return (
    <>
      <title>{overlay.seo.title}</title>
      <meta name="description" content={overlay.seo.description} />
      <link rel="canonical" href={overlay.seo.canonicalPath} />

      <div className="bg-[#050505] text-[#e5e2e1] font-sans antialiased selection:bg-[#eac26d] selection:text-[#402d00] min-h-screen">
        {/* ── Hero ── */}
        <section className="relative min-h-[60vh] w-full overflow-hidden flex flex-col items-center justify-center text-center px-8 pb-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/60 to-[#050505] z-10" />
            {overlay.media.heroImageUrl && (
              <img
                className="w-full h-full object-cover"
                alt={overlay.headline}
                src={overlay.media.heroImageUrl}
                loading="eager"
              />
            )}
          </div>

          <div className="relative z-20 max-w-5xl pt-24 mb-12 flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-[#eac26d]/10 border border-[#eac26d]/20 rounded-sm mx-auto">
              <span className="w-2 h-2 bg-[#eac26d] rounded-full animate-pulse" />
              <span className="font-label text-xs uppercase tracking-[0.2em] text-[#eac26d]">
                {matchedBikes.length} Matching Motorcycles
              </span>
            </div>

            <h1 className="font-headline text-4xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-white">
              {overlay?.headline || `Premium Motorcycle Rentals & Transport in ${airportCity} (${code})`}
            </h1>

            <p className="text-lg md:text-2xl text-[#c6c6c9] max-w-3xl mx-auto mb-10 font-light">
              {overlay.subheadline}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={overlay.conversion.bookingPath}
                className="bg-[#eac26d] text-[#402d00] px-8 py-4 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:shadow-[0_0_20px_rgba(234,194,109,0.3)] transition-all active:scale-95"
              >
                {overlay.conversion.primaryCta}
              </Link>
              <Link
                to={overlay.conversion.inquiryPath}
                className="bg-white/5 backdrop-blur-xl text-white border border-white/10 px-8 py-4 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-white/10 transition-all active:scale-95"
              >
                {overlay.conversion.secondaryCta}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Trust Bar ── */}
        <div className="border-b border-white/5 bg-[#050505]">
          <TrustInfrastructure layout="marquee" />
        </div>

        {/* ── Briefing ── */}
        <section className="py-20 px-8 bg-[#131313]">
          <div className="max-w-4xl mx-auto">
            {overlay?.content?.cinematicPitch && (
              <div className="mb-12 p-8 border border-[#eac26d]/20 bg-[#eac26d]/5 rounded-sm">
                <h3 className="font-headline text-lg text-[#eac26d] font-bold uppercase tracking-widest mb-4">Suitability Review</h3>
                <p className="text-xl md:text-2xl text-white leading-relaxed font-light italic">
                  "{overlay.content.cinematicPitch}"
                </p>
              </div>
            )}
            <p className="text-lg md:text-xl text-[#e5e2e1] leading-relaxed font-light">
              {overlay.content.intro}
            </p>
          </div>
        </section>

        {/* ── Matched Bikes Grid ── */}
        {matchedBikes.length > 0 && (
          <section className="py-20 px-8 bg-[#1c1b1b] border-t border-white/5">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-10 text-white">
                Available Motorcycles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedBikes.map((bike) => {
                  const heroImg = bike.heroImageUrl || null;

                  return (
                    <div
                      key={bike.rentalSlug}
                      className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                    >
                      {heroImg && (
                        <img
                          src={heroImg}
                          alt={bike.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="p-5">
                        <h3 className="font-headline text-lg font-semibold text-white mb-1">
                          {bike.title}
                        </h3>
                        <p className="text-sm text-[#c6c6c9] mb-2 capitalize">{bike.category}</p>
                        {bike.pricePerDay && (
                          <p className="text-[#eac26d] font-headline font-bold">
                            €{bike.pricePerDay}
                            <span className="text-sm text-[#c6c6c9] font-normal ml-1">/ day</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {overlay.content.faq?.length > 0 && (
          <section className="py-20 px-8 bg-[#131313] border-t border-white/5">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-10 text-white">
                Frequently Asked
              </h2>
              <div className="space-y-8">
                {overlay.content.faq.map((item, i) => (
                  <div key={i} className="border-b border-white/10 pb-6">
                    <h3 className="font-headline text-xl font-semibold text-[#eac26d] mb-3">
                      {item.question}
                    </h3>
                    <p className="text-[#c6c6c9] leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Bottom CTA ── */}
        <section className="py-20 px-8 bg-[#050505] border-t border-white/5 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to ride?
            </h2>
            <p className="text-lg text-[#c6c6c9] mb-10">
              Compare motorcycles at {airportCity} ({code}) and reserve your ride today.
            </p>
            <Link
              to={overlay.conversion.bookingPath}
              className="inline-block bg-[#eac26d] text-[#402d00] px-12 py-5 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:shadow-[0_0_20px_rgba(234,194,109,0.3)] transition-all active:scale-95"
            >
              {overlay.conversion.primaryCta}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

// ── Rental overlay renderer (existing implementation) ──

function RentalOverlayRenderer({ overlay }) {
  const bikeName = overlay.renderData?.bikeName || "Motorcycle";
  const category = overlay.renderData?.category || overlay.renderData?.categoryLabel || "";
  const pricePerDay = overlay.renderData?.price ?? overlay.renderData?.pricePerDay ?? null;
  const currency = overlay.renderData?.currency || "EUR";
  const airportCity = overlay.renderData?.airportCity || overlay.sourceRefs.airportCode;
  const code = overlay.renderData?.airportCode || overlay.sourceRefs.airportCode;

  return (
    <>
      <title>{overlay.seo.title}</title>
      <meta name="description" content={overlay.seo.description} />
      <link rel="canonical" href={overlay.seo.canonicalPath} />

      <div className="bg-[#050505] text-[#e5e2e1] font-sans antialiased selection:bg-[#eac26d] selection:text-[#402d00] min-h-screen">
        {/* ── Hero ── */}
        <section className="relative min-h-[70vh] w-full overflow-hidden flex flex-col items-center justify-center text-center px-8 pb-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/60 to-[#050505] z-10" />
            {overlay.media.heroImageUrl && (
              <img
                className="w-full h-full object-cover"
                alt={`${bikeName} at ${airportCity}`}
                src={overlay.media.heroImageUrl}
                loading="eager"
              />
            )}
          </div>

          <div className="relative z-20 max-w-5xl pt-24 mb-12 flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-[#eac26d]/10 border border-[#eac26d]/20 rounded-sm mx-auto">
              <span className="w-2 h-2 bg-[#eac26d] rounded-full animate-pulse" />
              <span className="font-label text-xs uppercase tracking-[0.2em] text-[#eac26d]">
                {category}
              </span>
            </div>

            <h1 className="font-headline text-4xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-white">
              {overlay?.headline || `Rent a ${bikeName} in ${airportCity} | Premium Motorcycle Hire`}
            </h1>

            <p className="text-lg md:text-2xl text-[#c6c6c9] max-w-3xl mx-auto mb-10 font-light">
              {overlay.subheadline}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={overlay.conversion.bookingPath}
                className="bg-[#eac26d] text-[#402d00] px-8 py-4 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:shadow-[0_0_20px_rgba(234,194,109,0.3)] transition-all active:scale-95"
              >
                {overlay.conversion.primaryCta}
              </Link>
              <Link
                to={overlay.conversion.inquiryPath}
                className="bg-white/5 backdrop-blur-xl text-white border border-white/10 px-8 py-4 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-white/10 transition-all active:scale-95"
              >
                {overlay.conversion.secondaryCta}
              </Link>
            </div>
          </div>

          {/* Hero stat badges */}
          <div className="relative z-20 flex flex-wrap justify-center gap-4 md:gap-8 w-full max-w-4xl mx-auto">
            {pricePerDay && (
              <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 border-l-2 border-[#eac26d] flex-1 min-w-[180px] text-left">
                <p className="font-label text-[10px] uppercase tracking-widest text-[#c6c6c9] mb-1">
                  From
                </p>
                <p className="font-headline text-xl md:text-3xl font-bold text-white">
                  {currency === "EUR" ? "€" : `${currency} `}{pricePerDay}
                  <span className="text-sm text-[#c6c6c9] font-normal ml-1">/ day</span>
                </p>
              </div>
            )}
            <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 border-l-2 border-[#c6c6c9] flex-1 min-w-[180px] text-left">
              <p className="font-label text-[10px] uppercase tracking-widest text-[#c6c6c9] mb-1">
                Airport
              </p>
              <p className="font-headline text-xl md:text-3xl font-bold text-white">
                {code}
              </p>
            </div>
            {overlay.scoring.composite > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 border-l-2 border-[#eac26d] flex-1 min-w-[180px] text-left">
                <p className="font-label text-[10px] uppercase tracking-widest text-[#c6c6c9] mb-1">
                  Match Score
                </p>
                <p className="font-headline text-xl md:text-3xl font-bold text-[#eac26d]">
                  {(overlay.scoring.composite * 10).toFixed(1)}
                  <span className="text-sm text-[#c6c6c9] font-normal ml-1">/ 10</span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Trust Bar ── */}
        <div className="border-b border-white/5 bg-[#050505]">
          <TrustInfrastructure layout="marquee" />
        </div>

        {/* ── Intro + Why This Bike ── */}
        <section className="py-20 px-8 bg-[#131313]">
          <div className="max-w-4xl mx-auto">
            {overlay?.content?.cinematicPitch && (
              <div className="mb-12 p-8 border border-[#eac26d]/20 bg-[#eac26d]/5 rounded-sm">
                <h3 className="font-headline text-lg text-[#eac26d] font-bold uppercase tracking-widest mb-4">Suitability Review</h3>
                <p className="text-xl md:text-2xl text-white leading-relaxed font-light italic">
                  "{overlay.content.cinematicPitch}"
                </p>
              </div>
            )}
            <p className="text-lg md:text-xl text-[#e5e2e1] leading-relaxed font-light mb-16">
              {overlay.content.intro}
            </p>

            {overlay.content.whyThisBike && (
              <div className="border-t border-white/10 pt-12">
                <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-white">
                  Why the {bikeName}?
                </h2>
                <p className="text-lg text-[#c6c6c9] leading-relaxed font-light">
                  {overlay.content.whyThisBike}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Why This Airport ── */}
        {overlay.content.whyThisAirport && (
          <section className="py-20 px-8 bg-[#1c1b1b] border-t border-white/5">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-white">
                Why {airportCity} ({code})?
              </h2>
              <p className="text-lg text-[#c6c6c9] leading-relaxed font-light">
                {overlay.content.whyThisAirport}
              </p>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {overlay.content.faq?.length > 0 && (
          <section className="py-20 px-8 bg-[#131313] border-t border-white/5">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-10 text-white">
                Frequently Asked
              </h2>
              <div className="space-y-8">
                {overlay.content.faq.map((item, i) => (
                  <div key={i} className="border-b border-white/10 pb-6">
                    <h3 className="font-headline text-xl font-semibold text-[#eac26d] mb-3">
                      {item.question}
                    </h3>
                    <p className="text-[#c6c6c9] leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Related Overlays ── */}
        {overlay.relationships.relatedOverlayIds?.length > 0 && (
          <section className="py-20 px-8 bg-[#1c1b1b] border-t border-white/5">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-headline text-3xl font-bold mb-10 text-white">
                Similar Motorcycles at {airportCity}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {overlay.relationships.relatedOverlayIds.map((relId) => {
                  const rel = getOverlaySafe(relId);
                  if (!rel || rel.publish?.status !== "published") return null;
                  const relName = rel.renderData?.bikeName || rel.headline;
                  const relPrice = rel.renderData?.price ?? rel.renderData?.pricePerDay ?? null;
                  const relCurrency = rel.renderData?.currency || "EUR";
                  const relHero = rel.renderData?.imageUrl || rel.renderData?.heroImageUrl || rel.media?.heroImageUrl || null;

                  return (
                    <Link
                      key={relId}
                      to={rel.seo.canonicalPath}
                      className="group bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#eac26d]/30 transition-all"
                    >
                      {relHero && (
                        <img
                          src={relHero}
                          alt={relName}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}
                      <div className="p-5">
                        <h3 className="font-headline text-lg font-semibold text-white mb-1">
                          {relName}
                        </h3>
                        {relPrice && (
                          <p className="text-[#eac26d] font-headline font-bold">
                            {relCurrency === "EUR" ? "€" : `${relCurrency} `}{relPrice}
                            <span className="text-sm text-[#c6c6c9] font-normal ml-1">/ day</span>
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Bottom CTA ── */}
        <section className="py-20 px-8 bg-[#050505] border-t border-white/5 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to ride?
            </h2>
            <p className="text-lg text-[#c6c6c9] mb-10">
              Book the {bikeName} at {airportCity} ({code}) and start your journey.
            </p>
            <Link
              to={overlay.conversion.bookingPath}
              className="inline-block bg-[#eac26d] text-[#402d00] px-12 py-5 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:shadow-[0_0_20px_rgba(234,194,109,0.3)] transition-all active:scale-95"
            >
              {overlay.conversion.primaryCta}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

// ── SEO-safe loading skeleton ──
// Renders real text content (H1, description) so crawlers never index a blank page.
// Shown only during the brief window between sync index resolution and async shard load.
function OverlayLoadingSkeleton({ airportCode }) {
  const code = String(airportCode || "").toUpperCase();

  return (
    <>
      <title>Motorcycle Rental at {code} — RiderAtlas</title>
      <meta
        name="description"
        content={`Find and compare motorcycle rentals at ${code}. Reserve your ride with RiderAtlas.`}
      />

      <div className="bg-[#050505] text-[#e5e2e1] font-sans antialiased min-h-screen">
        <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Motorcycle Rental at {code}
          </h1>
          <p className="text-lg text-[#c6c6c9] max-w-2xl mx-auto mb-10">
            Loading rental details for {code}. Compare motorcycles, check prices,
            and reserve your ride.
          </p>
          <div className="w-8 h-8 border-2 border-[#eac26d] border-t-transparent rounded-full animate-spin" />
        </section>
      </div>
    </>
  );
}
