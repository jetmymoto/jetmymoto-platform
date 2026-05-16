import React from "react";
import SafeImage from "@/components/ui/SafeImage";

export default function AirportHero({
  eyebrow,
  headline,
  subheadline,
  description,
  heroImage,
  metaLines = [],
  videoUrl,
  posterUrl,
  ctas = [],
}) {
  const primaryCta = ctas?.find((cta) => cta.primary) || ctas?.[0];
  const secondaryCta = ctas?.find((cta) => !cta.primary) || ctas?.[1];

  return (
    <section className="min-h-screen flex flex-col lg:flex-row pt-20 items-stretch bg-[#F7F3EA]">
      {/* Left Content Area */}
      <div className="flex-1 p-8 lg:p-20 flex flex-col justify-center">
        {eyebrow && (
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#706F6C] font-medium mb-4">
            {eyebrow}
          </div>
        )}
        
        <h1 className="font-serif text-6xl lg:text-9xl leading-[0.95] tracking-[-0.02em] mb-4 text-[#1C1B18] uppercase">
          {headline}
        </h1>
        
        {subheadline && (
          <p className="text-[#C9A14A] font-serif text-2xl lg:text-3xl italic mb-8">
            {subheadline}
          </p>
        )}
        
        <p className="text-[#706F6C] text-lg max-w-md mb-12 leading-relaxed font-light">
          {description || "Begin your journey directly from the tarmac. Experience seamless airport collection and access to Europe's most storied riding network."}
        </p>

        {metaLines?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-4 mb-12 border-t border-black/5 pt-10">
            {metaLines.map((line, i) => {
              const [label, ...rest] = line.split(":");
              const value = rest.join(":") || line;
              const displayLabel = rest.length > 0 ? label : "Status";
              
              return (
                <div key={i} className={i === 3 ? "col-span-2" : ""}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#706F6C] font-medium mb-2">
                    {displayLabel}
                  </div>
                  <div className="font-mono text-xl font-light uppercase flex items-center gap-2">
                    {i === 3 && <span className="w-2 h-2 rounded-full bg-[#C9A14A]"></span>}
                    {value.trim()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {primaryCta && (
            <button
              onClick={primaryCta.onClick}
              className="bg-[#1C1B18] text-white px-10 py-5 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#C9A14A] transition-colors shadow-xl"
            >
              {primaryCta.label}
            </button>
          )}
          {secondaryCta && (
            <button
              onClick={secondaryCta.onClick}
              className="border border-black/10 text-[#1C1B18] px-10 py-5 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
            >
              {secondaryCta.label}
            </button>
          )}
        </div>
      </div>

      {/* Right Visual Area */}
      <div className="flex-1 relative bg-[#E5E1D8] min-h-[500px] overflow-hidden flex items-center justify-center">
        {videoUrl ? (
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src={videoUrl}
            poster={posterUrl || heroImage}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <SafeImage 
            src={heroImage || "https://images.unsplash.com/photo-1542296332-2b4473faf563?auto=format&fit=crop&q=80&w=1600"} 
            className="absolute inset-0 w-full h-full object-cover opacity-80" 
            alt="Luxury Aviation Hub"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EA] via-transparent to-transparent hidden lg:block" />
        
        <svg className="relative z-10 w-full h-full max-w-xl opacity-60" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="4" fill="#C9A14A" />
          <path 
            className="stroke-[#C9A14A] stroke-[1px] transition-all duration-1000" 
            style={{ strokeDasharray: 1000, strokeDashoffset: 0 }}
            d="M200,200 L350,100" 
          />
          <path 
            className="stroke-[#C9A14A] stroke-[1px] transition-all duration-1000" 
            style={{ strokeDasharray: 1000, strokeDashoffset: 0 }}
            d="M200,200 L50,150" 
          />
          <path 
            className="stroke-[#C9A14A] stroke-[1px] transition-all duration-1000" 
            style={{ strokeDasharray: 1000, strokeDashoffset: 0 }}
            d="M200,200 L180,350" 
          />
          <text x="210" y="205" fill="#1C1B18" className="font-mono text-[10px] font-bold uppercase">
            {headline} HUB
          </text>
        </svg>

        <div className="absolute bottom-10 right-10 text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-black font-medium">Route Network</div>
          <div className="text-[10px] text-[#706F6C] uppercase tracking-wider">Active route connections verified</div>
        </div>
      </div>
    </section>
  );
}
