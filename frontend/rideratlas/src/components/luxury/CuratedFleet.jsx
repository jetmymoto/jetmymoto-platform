import { FadeIn } from "./FadeIn";
import { Link } from "react-router-dom";
import { withBrandContext } from "@/utils/navigationTargets";
import { trackEvent } from "@/core/analytics/trackEvent";
import { useAssetLibrary } from "@/hooks/useAssetLibrary";
import { getRentalBrand, getRentalModelName } from "@/features/rentals/utils/rentalFormatters";

function CuratedFleetCard({ rental, routeParam, airportBasePath, airportCode, routeSlug, delay = 0 }) {
  const brand = getRentalBrand(rental);
  const model = getRentalModelName(rental);
  const bikeName = `${brand} ${model}`.trim();
  const imageUrl = rental?.imageUrl || rental?.posterUrl;

  const assetId = `${brand.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, "")}`;
  const { currentImage } = useAssetLibrary("rental", assetId, imageUrl);
  
  // Clean link generation avoiding undefined strings
  const rentalLinkParam = encodeURIComponent(rental?.id || rental?.slug || "");
  const routeLinkParam = routeParam ? `&route=${routeParam}` : "";
  const base = airportBasePath || "/airport";
  const link = `${base}?mode=rent&rental=${rentalLinkParam}${routeLinkParam}`;

  let reason = 'Absolute precision. Tailored for the extraordinary.';
  const cat = (rental?.category || "").toLowerCase();
  if (cat === 'adventure') reason = 'Commanding presence. Unyielding on high passes.';
  else if (cat === 'touring' || cat === 'sport-touring') reason = 'Refined endurance. Effortless continental sweeps.';
  else if (cat === 'scrambler') reason = 'Raw agility. Connected to the road.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col items-center"
    >
      <Link 
        to={withBrandContext(link)} 
        onClick={() => {
          trackEvent("lead_rental_booking", {
            route_slug: routeSlug || "",
            airport_code: airportCode || "",
            rental_id: rental?.id || "none",
            source: "curated_fleet",
          });
        }}
        className="relative block w-full aspect-[4/3] overflow-hidden bg-[#0A0A0A]"
      >
        {currentImage && (
          <img
            src={currentImage}
            alt={bikeName}
            className="h-full w-full object-cover contrast-[1.10] saturate-[.85] sepia-[.15] brightness-[0.95] transition-transform duration-1000 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-[#050505]/20 transition-colors duration-500 group-hover:bg-transparent" />
      </Link>
      <div className="mt-8 flex flex-col items-center text-center px-4 max-w-[300px]">
        <h3 className="text-xl font-serif text-white tracking-wide">{bikeName}</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 font-light">
          {reason}
        </p>
        <Link
          to={withBrandContext(link)}
          onClick={() => {
             trackEvent("lead_rental_booking", {
              route_slug: routeSlug || "",
              airport_code: airportCode || "",
              rental_id: rental?.id || "none",
              source: "curated_fleet",
            });
          }}
          className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#CDA755] transition-colors hover:text-white font-medium"
        >
          Reserve Machine
        </Link>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";

export default function CuratedFleet({ rentals = [], routeParam, airportBasePath, airportCode, routeSlug }) {
  if (!rentals || rentals.length === 0) return null;

  // Hard limit to 3 items
  const limitedRentals = rentals.slice(0, 3);

  return (
    <section className="bg-[#050505] py-40 md:py-56 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto">
        <FadeIn className="text-center mb-32">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-medium">The Curated Fleet</span>
          <h2 className="mt-8 text-4xl md:text-5xl font-serif text-white tracking-tight">Select Your Machine</h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-16 md:gap-24 lg:gap-24">
          {limitedRentals.map((rental, idx) => (
            <CuratedFleetCard 
              key={rental.id || rental.slug} 
              rental={rental} 
              routeParam={routeParam}
              airportBasePath={airportBasePath}
              airportCode={airportCode}
              routeSlug={routeSlug}
              delay={idx * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
