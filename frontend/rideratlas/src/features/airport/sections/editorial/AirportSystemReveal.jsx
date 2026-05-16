import React from "react";
import SafeImage from "@/components/ui/SafeImage";

export default function AirportSystemReveal({ copy }) {
  const media = copy?.media;
  const backgroundImage = media?.backgroundImage;
  const fallbackGradient = media?.fallbackGradient || "linear-gradient(to bottom, #111111, #000000)";

  return (
    <section className="flex flex-col lg:flex-row min-h-[700px] bg-[#111111] text-white">
      <div 
        className="w-full lg:w-[65%] relative overflow-hidden"
        style={{ background: fallbackGradient }}
      >
        {backgroundImage && (
          <SafeImage 
            src={backgroundImage} 
            className="absolute inset-0 w-full h-full opacity-70 z-0" 
            alt={media?.backgroundAlt || "Riding theater corridor"}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent z-10"></div>
        <div className="absolute bottom-20 left-10 lg:left-20 max-w-2xl z-20">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4 text-[#C9A14A] font-medium">Cinematic Journey</div>
          <h3 className="font-serif text-6xl lg:text-8xl leading-[0.95] tracking-tight mb-8">
            {copy?.heading || "The High Alpine Corridor"}
          </h3>
          <p className="text-xl text-white/80 leading-relaxed italic font-light">
            {copy?.subline || "A high-altitude masterpiece connecting the Balkans to the heart of the Alps."}
          </p>
        </div>
      </div>
      <div className="w-full lg:w-[35%] p-16 lg:p-24 flex flex-col justify-center border-l border-white/5">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-12 text-[#706F6C] font-medium">Route Details</div>
        <div className="space-y-12">
          <div className="grid grid-cols-2 gap-10">
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.15em] mb-2 text-[#706F6C] font-medium">
                {copy?.elevationLabel || "Total Elevation"}
              </div>
              <div className="font-mono text-3xl font-light">
                {copy?.elevationValue || "18,750m"}
              </div>
            </div>
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.15em] mb-2 text-[#706F6C] font-medium">Rhythm</div>
              <div className="font-mono text-3xl font-light italic">
                {copy?.rhythm || "Flowing"}
              </div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[8px] uppercase tracking-[0.15em] mb-4 text-[#706F6C] font-medium">Recommended Travel Machine</div>
            <div className="flex flex-wrap gap-3">
              {(copy?.recommendedMachines || ["BMW R1300GS", "Multistrada V4"]).map((machine) => (
                <span key={machine} className="text-[10px] font-mono border border-white/20 px-3 py-1 rounded-full uppercase">
                  {machine}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/60 leading-relaxed font-light">
            {copy?.description || "This route requires high-altitude proficiency. Best enjoyed during the late summer window when the passes are fully clear."}
          </p>
          <button className="w-full py-5 bg-[#C9A14A] text-white font-mono text-[10px] font-bold uppercase tracking-widest mt-6 shadow-lg hover:bg-white hover:text-black transition-all">
            Download Travel Briefing
          </button>
        </div>
      </div>
    </section>
  );
}
