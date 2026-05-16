import React from 'react';
import { FadeIn } from '@/components/luxury/FadeIn';

/**
 * High-authority section header with larger typography scales
 * approved in the Stitch direction.
 */
export const CinematicSectionHeader = ({ eyebrow, title, body, centered = false }) => {
  return (
    <div className={`max-w-5xl ${centered ? 'mx-auto text-center' : ''} mb-20`}>
      <FadeIn>
        {eyebrow && (
          <div className={`text-[11px] uppercase tracking-[0.5em] text-[#CDA755] font-black mb-10 flex items-center gap-4 ${centered ? 'justify-center' : ''}`}>
             <div className="h-[1px] w-8 bg-[#CDA755]/50" />
             {eyebrow}
             {centered && <div className="h-[1px] w-8 bg-[#CDA755]/50" />}
          </div>
        )}
        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] italic mb-10">
          {title}
        </h2>
        {body && (
          <p className={`text-xl md:text-3xl text-zinc-400 font-light leading-relaxed max-w-3xl ${centered ? 'mx-auto' : ''}`}>
            {body}
          </p>
        )}
      </FadeIn>
    </div>
  );
};
