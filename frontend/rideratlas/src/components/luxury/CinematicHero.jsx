import { motion } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CinematicHero({ 
  eyebrow, 
  title, 
  subtitle, 
  imageUrl, 
  altText,
  ultraWide = false,
  ctaText,
  ctaLink
}) {
  return (
    <section className={`relative w-full flex flex-col items-center justify-center overflow-hidden ${ultraWide ? 'aspect-[21/9] min-h-[500px]' : 'h-screen min-h-[700px]'}`}>
      <div className="absolute inset-0 bg-[#050505]">
        {imageUrl && (
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src={imageUrl}
            alt={altText || title}
            className="h-full w-full object-cover contrast-[1.10] saturate-[.85] sepia-[.15] brightness-[0.95] opacity-60 transition-opacity duration-1000"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
      </div>

      <FadeIn className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.4em] text-[#CDA755] mb-10 font-black">
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-6xl text-5xl md:text-8xl lg:text-[7rem] font-serif tracking-tight text-white leading-[1.05] uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-8 text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/60 font-bold max-w-xl">
            {subtitle}
          </p>
        )}

        {ctaText && ctaLink && (
          <Link 
            to={ctaLink}
            className="mt-16 group flex items-center gap-3 border border-[#CDA755]/30 bg-[#CDA755]/5 px-10 py-4 text-[10px] uppercase tracking-[0.3em] text-white transition-all hover:bg-[#CDA755]/15 hover:border-[#CDA755]/60 hover:scale-[1.02]"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4 text-[#CDA755] transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </FadeIn>
    </section>
  );
}
