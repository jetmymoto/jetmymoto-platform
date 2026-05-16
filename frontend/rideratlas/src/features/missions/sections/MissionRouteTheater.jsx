import React from "react";
import SafeImage from "@/components/ui/SafeImage";

export default function MissionRouteTheater({ mission, pageData }) {
  const { intelligence } = mission;

  return (
    <section className="bg-[#f6f3ee] py-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-20 lg:grid-cols-2">
        {/* Intelligence / Why this ride */}
        <div className="flex flex-col justify-center order-2 lg:order-1">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#785a0c]">
            Mission Intelligence
          </p>
          <h2 className="mt-6 font-headline text-4xl font-bold leading-tight text-[#050505] md:text-5xl uppercase tracking-tighter">
            Mission Profile
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-[#5a5a55]">
            {pageData.whyThisRide}
          </p>
          
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <IntelPoint 
              title="Terrain Profile" 
              text={intelligence?.terrain || "Optimized for technical carving and elevation gain."} 
            />
            <IntelPoint 
              title="Riding Rhythm" 
              text={intelligence?.rhythm || "Mixed technical sectors with high-speed flow segments."} 
            />
            <IntelPoint 
              title="Elevation Logic" 
              text={intelligence?.elevation || "High-altitude pass sequence with significant vertical gain."} 
            />
            <IntelPoint 
              title="Best Season" 
              text={intelligence?.season || "Late June through September for optimal pass access."} 
            />
            <IntelPoint 
              title="Rider Profile" 
              text={intelligence?.rider || "Experienced alpine riders with technical cornering proficiency."} 
            />
            <IntelPoint 
              title="Recommended Bike" 
              text={intelligence?.bike || "Large-displacement adventure or sport-touring machines."} 
            />
          </div>
        </div>

        {/* Cinematic Image instead of Map Placeholder */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-[#e5e1da] shadow-2xl order-1 lg:order-2">
          <SafeImage 
            src={mission.theaterImage || mission.imageUrl} 
            alt="Theater of Operations"
            className="absolute inset-0 h-full w-full object-cover"
            showPlaceholder={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/40 to-transparent" />
          <div className="absolute bottom-8 left-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Theater of Operations</div>
            <div className="text-2xl font-bold text-white uppercase">{mission.cluster} CLUSTER</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntelPoint({ title, text }) {
  return (
    <div className="border-l-2 border-[#CDA755]/30 pl-4 py-2">
      <h4 className="text-[10px] font-black text-[#785a0c] uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-sm text-[#5a5a55] leading-snug">{text}</p>
    </div>
  );
}
