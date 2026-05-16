import React, { useState, useEffect } from "react";

/**
 * SafeImage component that handles broken images gracefully.
 * Prevents rendering broken images or empty white boxes.
 */
export default function SafeImage({ 
  src, 
  alt, 
  className, 
  fallback = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1400&q=20&blur=10", // Dark abstract fallback
  showPlaceholder = false 
}) {
  const [imgSrc, setImgSrc] = useState(src || (showPlaceholder ? fallback : null));
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setError(false);
      setIsLoaded(false);
    } else if (showPlaceholder) {
      setImgSrc(fallback);
      setError(false);
      setIsLoaded(true);
    } else {
      setImgSrc(null);
    }
  }, [src, fallback, showPlaceholder]);

  if (!imgSrc && !showPlaceholder) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imgSrc || fallback}
        alt={alt || ""}
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
            setError(true);
            setIsLoaded(true);
          }
        }}
        loading="lazy"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#050505] animate-pulse" />
      )}
    </div>
  );
}
