import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicMediaUrl } from "./mediaUrl";
import { logHeroLoad } from "./mediaPreload";

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string; // e.g. "16/9", "3/4"
  objectFit?: "cover" | "contain";
}

export default function SmartImage({ 
  src, 
  alt, 
  className = "", 
  priority = false, 
  aspectRatio = "aspect-video",
  objectFit = "cover"
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const publicUrl = getPublicMediaUrl(src);

  useEffect(() => {
    if (!publicUrl) {
      setError(true);
    } else {
      setIsLoaded(false);
      setError(false);
    }
  }, [publicUrl]);

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className} bg-[#0B0B0C]`}>
      {/* Blurred Poster Placeholder Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1C1A17] via-[#0B0B0C] to-[#0B0B0C] opacity-80" />

      {/* Dark Skeleton Pulse */}
      <AnimatePresence>
        {!isLoaded && !error && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/[0.02] animate-pulse z-10 backdrop-blur-3xl"
          />
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02] text-white/20 text-[10px] uppercase tracking-widest">
          Asset Unavailable
        </div>
      )}

      {/* Actual Image */}
      {publicUrl && !error && (
        <img
          src={publicUrl}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => {
            setIsLoaded(true);
            if (priority) logHeroLoad();
          }}
          onError={() => setError(true)}
          className={`
            relative z-20 w-full h-full 
            transition-all duration-1000 ease-out
            ${objectFit === "cover" ? "object-cover" : "object-contain"}
            ${isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-110 blur-xl"}
          `}
        />
      )}
    </div>
  );
}
