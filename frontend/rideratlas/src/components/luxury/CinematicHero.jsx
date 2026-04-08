import { motion } from "framer-motion";
import { FadeIn } from "./FadeIn";

export default function CinematicHero({ 
  eyebrow, 
  title, 
  subtitle, 
  imageUrl, 
  altText,
  ultraWide = false 
}) {
  return (
    <section className={`relative w-full flex flex-col items-center justify-center overflow-hidden ${ultraWide ? 'aspect-[21/9] min-h-[500px]' : 'h-screen min-h-[700px]'}`}>
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src={imageUrl}
          alt={altText || title}
          className="h-full w-full object-cover contrast-[1.10] saturate-[.85] sepia-[.15] brightness-[0.95] contrast-[1.10] saturate-[.85] sepia-[.15] brightness-[0.95]"
        />
        <div className="absolute inset-0 bg-[#050505]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/20" />
      </div>

      <FadeIn className="relative z-10 flex flex-col items-center text-center px-6 mt-20">
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] mb-8 font-medium">
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-6xl text-5xl md:text-7xl lg:text-[6rem] font-serif tracking-tight text-white leading-[1.1]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-8 text-xs md:text-sm uppercase tracking-[0.25em] text-white/80 font-light">
            {subtitle}
          </p>
        )}
      </FadeIn>
    </section>
  );
}
