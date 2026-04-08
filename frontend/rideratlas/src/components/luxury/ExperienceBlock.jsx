import { FadeIn } from "./FadeIn";
import React from "react";

export default function ExperienceBlock({ metrics = [], description }) {
  // Filter out any empty metrics
  const validMetrics = metrics.filter(Boolean);

  return (
    <section className="relative z-20 bg-[#050505] pt-32 pb-40 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {validMetrics.length > 0 && (
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16 md:gap-24 text-sm md:text-base font-serif text-white/60 mb-20 italic">
              {validMetrics.map((metric, index) => (
                <React.Fragment key={index}>
                  <span>{metric}</span>
                  {index < validMetrics.length - 1 && (
                    <span className="text-[#CDA755]/40 text-xs">♦</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </FadeIn>
        )}
        
        {description && (
          <FadeIn delay={0.1}>
            <p className="text-xl md:text-3xl font-serif leading-relaxed text-white/90 font-light">
              {description}
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
