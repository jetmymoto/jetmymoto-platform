import React from "react";
import SafeImage from "@/components/ui/SafeImage";

/**
 * CinematicHero - Universal hero primitive for JetMyMoto and RiderAtlas.
 * Supports split and full-bleed layouts, video/image backgrounds, and both themes.
 */
export default function CinematicHero({
  layout = "split", // "split" | "full"
  theme = "light", // "light" | "dark"
  eyebrow,
  headline,
  subheadline,
  description,
  videoUrl,
  posterUrl,
  heroImage,
  metaLines = [],
  ctas = [],
  children,
}) {
  const isDark = theme === "dark";
  const isSplit = layout === "split";

  const primaryCta = ctas?.find((cta) => cta.primary) || ctas?.[0];
  const secondaryCta = ctas?.find((cta) => !cta.primary) || ctas?.[1];

  const bgColor = isDark ? "bg-[#050505]" : "bg-[#F7F3EA]";
  const textColor = isDark ? "text-zinc-200" : "text-[#1C1B18]";
  const eyebrowColor = isDark ? "text-[#CDA755]" : "text-[#706F6C]";
  const headlineColor = isDark ? "text-white" : "text-[#1C1B18]";
  const subheadlineColor = isDark ? "text-[#CDA755]" : "text-[#C9A14A]";
  const descriptionColor = isDark ? "text-zinc-400" : "text-[#706F6C]";
  const borderColor = isDark ? "border-white/10" : "border-black/5";

  const renderContent = () => (
    <div className={`flex flex-col justify-center ${isSplit ? "flex-1 p-8 lg:p-20" : "relative z-10 w-full max-w-7xl mx-auto px-6 pb-24 pt-32 lg:pb-32"}`}>
      {eyebrow && (
        <div className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold mb-6 flex items-center gap-4 ${eyebrowColor}`}>
          {!isSplit && <div className="h-[1px] w-12 bg-[#CDA755]/50" />}
          {eyebrow}
        </div>
      )}
      
      <h1 className={`font-headline leading-[0.95] tracking-tight uppercase mb-4 ${isSplit ? "text-6xl lg:text-9xl" : "text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] italic font-black"} ${headlineColor}`}>
        {headline}
      </h1>
      
      {subheadline && (
        <p className={`font-serif italic mb-8 ${isSplit ? "text-2xl lg:text-3xl" : "text-xl sm:text-2xl"} ${subheadlineColor}`}>
          {subheadline}
        </p>
      )}
      
      <p className={`text-lg max-w-2xl mb-12 leading-relaxed font-light ${isSplit ? "max-w-md" : "lg:text-2xl text-zinc-300"} ${descriptionColor}`}>
        {description}
      </p>

      {metaLines?.length > 0 && (
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-4 mb-12 border-t pt-10 ${borderColor}`}>
          {metaLines.map((line, i) => {
            const [label, ...rest] = line.split(":");
            const value = rest.join(":") || line;
            const displayLabel = rest.length > 0 ? label : "Status";
            
            return (
              <div key={i} className={i === 3 && isSplit ? "col-span-2" : ""}>
                <div className={`font-mono text-[10px] uppercase tracking-[0.15em] font-medium mb-2 ${eyebrowColor}`}>
                  {displayLabel}
                </div>
                <div className={`font-mono text-xl font-light uppercase flex items-center gap-2 ${textColor}`}>
                  {i === 3 && <span className="w-2 h-2 rounded-full bg-[#CDA755]"></span>}
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
            className={`px-10 py-5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl ${
              isDark 
                ? "bg-[#CDA755] text-[#050505] hover:bg-white" 
                : "bg-[#1C1B18] text-white hover:bg-[#C9A14A]"
            }`}
          >
            {primaryCta.label}
          </button>
        )}
        {secondaryCta && (
          <button
            onClick={secondaryCta.onClick}
            className={`px-10 py-5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all border ${
              isDark
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-black/10 text-[#1C1B18] hover:bg-black/5"
            }`}
          >
            {secondaryCta.label}
          </button>
        )}
      </div>
      
      {children}
    </div>
  );

  const renderVisual = () => (
    <div className={`relative overflow-hidden flex items-center justify-center ${isSplit ? "flex-1 bg-[#E5E1D8] min-h-[500px]" : "absolute inset-0 bg-[#050505]"}`}>
      {videoUrl ? (
        <video
          className={`absolute inset-0 w-full h-full object-cover ${isSplit ? "opacity-80" : "opacity-60"}`}
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
          className={`absolute inset-0 w-full h-full object-cover ${isSplit ? "opacity-80" : "opacity-60"}`} 
          alt={headline}
          showPlaceholder={true}
        />
      )}
      
      {isSplit && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EA] via-transparent to-transparent hidden lg:block" />
      )}

      {!isSplit && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/40 via-transparent to-[#050505]/40" />
        </>
      )}
      
      {isSplit && (
        <div className="absolute bottom-10 right-10 text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-black font-medium">Route Network</div>
          <div className="text-[10px] text-[#706F6C] uppercase tracking-wider">Active route connections verified</div>
        </div>
      )}
    </div>
  );

  return (
    <section className={`relative isolate flex min-h-screen ${isSplit ? "flex-col lg:flex-row pt-20 items-stretch" : "flex-col justify-end"} ${bgColor}`}>
      {!isSplit && renderVisual()}
      {renderContent()}
      {isSplit && renderVisual()}
    </section>
  );
}
