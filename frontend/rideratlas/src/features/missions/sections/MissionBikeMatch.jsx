import React from "react";
import SafeImage from "@/components/ui/SafeImage";

export default function MissionBikeMatch({ bikeMatch }) {
  if (!bikeMatch) return null;

  return (
    <section className="bg-white py-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 lg:flex-row">
        <div className="lg:w-1/2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#785a0c]">
            Fleet Recommendation
          </p>
          <h2 className="mt-6 font-headline text-4xl font-bold leading-tight text-[#050505] md:text-5xl uppercase tracking-tighter">
            {bikeMatch.headline}
          </h2>
          <h3 className="mt-4 text-3xl font-black text-[#CDA755] uppercase tracking-tight">
            {bikeMatch.model}
          </h3>
          <p className="mt-8 text-lg leading-relaxed text-[#5a5a55]">
            {bikeMatch.reason}
          </p>
          
          <div className="mt-12 flex items-center gap-6">
            <div className="h-px w-12 bg-[#CDA755]/30" />
            <span className="text-[10px] uppercase tracking-widest text-[#050505]/40 font-bold">
              Verified Fleet Availability
            </span>
            <div className="h-px flex-1 bg-[#050505]/10" />
          </div>
        </div>
        
        <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] bg-[#f6f3ee] lg:w-1/2 shadow-2xl">
          <SafeImage
            src={bikeMatch.imageUrl || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200"}
            alt={bikeMatch.model}
            className="h-full w-full object-cover"
            showPlaceholder={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
