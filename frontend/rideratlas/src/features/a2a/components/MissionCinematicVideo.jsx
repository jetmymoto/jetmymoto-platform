import React, { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/core/analytics/trackEvent";

/**
 * MissionCinematicVideo
 * Handles A/B variant selection and conversion tracking for mission cinematic videos.
 */
export default function MissionCinematicVideo({ mission }) {
  const videoRef = useRef(null);
  const [tracked3s, setTracked3s] = useState(false);
  const [variant, setVariant] = useState(null);

  // Variant Mapping - In a real production system, this would be fetched from a 
  // backend / config that handles randomization and stickiness.
  useEffect(() => {
    if (!mission) return;

    // Fixed mapping for the variants we generated
    const variantId = mission.variant_id || "v1";
    const videoUrl = mission.videoUrl;

    // For the Alpine Return, we specifically want to support the 6 variants we made
    // If we're on a different mission, we might fall back.
    const isAlpine = mission.slug === "ath-to-muc-alpine-return";
    
    if (isAlpine) {
        // Logic to randomly assign a variant if not already set (e.g. for testing)
        // In this implementation, we'll assume the mission object already has the url.
        // If we want to force variant rotation:
        const variantPool = ["v1", "v2", "v3", "v4", "v5", "v6"];
        const randomVariant = variantPool[Math.floor(Math.random() * variantPool.length)];
        
        // Construct variant URL (assuming consistent naming convention)
        const baseUrl = videoUrl.split("-hero.mp4")[0];
        const variantUrl = `${baseUrl}-${randomVariant}-hero.mp4${videoUrl.split("-hero.mp4")[1] || ""}`;
        
        setVariant({
            id: randomVariant,
            url: variantUrl
        });
    } else {
        setVariant({
            id: variantId,
            url: videoUrl
        });
    }
  }, [mission]);

  // Track Impression
  useEffect(() => {
    if (variant) {
      trackEvent("video_impression", {
        mission_slug: mission.slug,
        variant_id: variant.id
      });
    }
  }, [variant, mission.slug]);

  // Track Playback Progress
  const handleTimeUpdate = () => {
    if (!videoRef.current || tracked3s) return;

    if (videoRef.current.currentTime >= 3) {
      trackEvent("video_3s_watch", {
        mission_slug: mission.slug,
        variant_id: variant?.id
      });
      setTracked3s(true);
    }
  };

  const handleVideoClick = () => {
    trackEvent("video_click", {
      mission_slug: mission.slug,
      variant_id: variant?.id
    });
  };

  if (!variant?.url) return null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black shadow-2xl">
      <video
        ref={videoRef}
        src={variant.url}
        autoPlay
        muted
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onClick={handleVideoClick}
        className="h-full w-full object-cover opacity-90 transition-opacity duration-1000"
        onLoadedData={(e) => e.target.classList.remove('opacity-0')}
      />
      
      {/* Post-Processing Overlays (React-side) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(5,5,5,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-transparent to-transparent h-[15%]" />
      
      {/* Variant Debug Badge (Dev only) */}
      {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-[10px] text-zinc-500 font-mono uppercase">
              VAR: {variant.id}
          </div>
      )}
    </div>
  );
}
