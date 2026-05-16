import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SafeImage from '@/components/ui/SafeImage';
import { FadeIn } from '@/components/luxury/FadeIn';

/**
 * EditorialSplit component that implements the 50/50 cinematic pacing
 * approved in the Stitch direction.
 * 
 * Refined for peak cinematic storytelling: asymmetry, atmospheric blending,
 * and suspended typography.
 */
export const EditorialSplit = ({ 
  eyebrow, 
  title, 
  body, 
  imageUrl, 
  videoUrl, // Support for cinematic background video
  reverse = false,
  imageAlt = '',
  stats = [],
  detail = '' // Quiet operational realism
}) => {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const imageYOffset = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full py-48 md:py-72 overflow-hidden bg-[#050505]"
    >
      {/* Localized Atmospheric Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-1/2 ${reverse ? 'left-1/4' : 'right-1/4'} -translate-y-1/2 w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(28,45,72,0.08)_0%,transparent_70%)] blur-[100px]`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 md:px-12 z-10">
        <div className={`grid gap-20 md:gap-32 items-start ${reverse ? 'md:grid-cols-[1.1fr_1fr]' : 'md:grid-cols-[1fr_1.1fr]'}`}>
          
          {/* Content Block with Editorial Asymmetry */}
          <motion.div 
            style={{ y: yOffset }}
            className={`${reverse ? 'md:order-2' : ''} pt-12 md:pt-24`}
          >
            <FadeIn>
              {eyebrow && (
                <div className="text-[10px] uppercase tracking-[0.6em] text-[#CDA755] font-black mb-12 flex items-center gap-6">
                  <div className="h-[1px] w-12 bg-[#CDA755]/30" />
                  <span className="opacity-80">{eyebrow}</span>
                </div>
              )}
              
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] italic mb-14 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                {title}
              </h2>

              <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed font-light mb-16 max-w-xl">
                {body}
              </p>

              {detail && (
                <div className="mb-16 flex gap-4 items-start max-w-md">
                   <div className="h-10 w-[1px] bg-[#CDA755]/40 mt-1 shrink-0" />
                   <p className="text-[13px] text-zinc-500 italic leading-relaxed font-medium">
                     {detail}
                   </p>
                </div>
              )}

              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-12 pt-16 border-t border-white/[0.03]">
                  {stats.map((stat, i) => (
                    <div key={i} className="group/stat">
                      <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-black mb-4 group-hover:text-zinc-400 transition-colors">{stat.label}</div>
                      <div className="text-3xl font-black text-white/90 tabular-nums uppercase tracking-tight group-hover:text-[#CDA755] transition-colors">{stat.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </FadeIn>
          </motion.div>

          {/* Cinematic Media Block with Atmospheric Blending */}
          <div className={`relative ${reverse ? 'md:order-1' : ''} group`}>
            <motion.div 
              style={{ y: imageYOffset }}
              className="relative aspect-[3/4] md:aspect-[4/5] lg:aspect-[3/4] rounded-[60px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/[0.03] bg-black"
            >
              {videoUrl ? (
                <video
                  src={videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000 saturate-[0.8] contrast-[1.05]"
                />
              ) : (
                <SafeImage 
                  src={imageUrl} 
                  alt={imageAlt || title}
                  className="w-full h-full object-cover transition-transform duration-[15s] group-hover:scale-110 opacity-70 group-hover:opacity-90 saturate-[0.85] contrast-[1.1]"
                  showPlaceholder={true}
                />
              )}
              
              {/* Atmospheric Edge Blending & Gradient Masks */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,5,5,0.4)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#050505]/60 to-transparent" />
              
              {/* Floating Dust/Atmosphere particles hint */}
              <div className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
                 <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
              </div>
            </motion.div>
            
            {/* Ambient Tonal Shadow/Glow (Cold Alpine Moonlight) */}
            <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,rgba(28,45,72,0.1)_0%,transparent_70%)] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-[2s] -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
};
