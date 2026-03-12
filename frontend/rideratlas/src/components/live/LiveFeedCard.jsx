import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

/* ---------------- CONFIG ---------------- */
const ASSETS_BUCKET = "movie-chat-factory-assets";
const FALLBACK_POSTER = "https://storage.googleapis.com/movie-chat-factory-assets/system/default_poster_bg.jpg";

/* ---------------- HELPERS ---------------- */

// YouTube thumbnail fallback chain
const ytThumb = (videoId) => {
  if (!videoId) return null;
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];
};

const getPublicUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("gs://")) {
    return path.replace(`gs://${ASSETS_BUCKET}/`, `https://storage.googleapis.com/${ASSETS_BUCKET}/`);
  }
  return path;
};

/* ---------------- CARD ---------------- */

export default function LiveFeedCard({ item, onClick }) {
  const imageCandidates = useMemo(() => {
    const poster = getPublicUrl(item?.poster?.landscape) || getPublicUrl(item?.poster?.portrait);
    const ytCandidates = ytThumb(item?.video_id) || [];
    return [poster, ...ytCandidates, FALLBACK_POSTER].filter(Boolean);
  }, [item]);

  const [imgIndex, setImgIndex] = useState(0);
  const imgSrc = imageCandidates[imgIndex];

  const handleImgError = () => {
    if (imgIndex < imageCandidates.length - 1) {
      setImgIndex((i) => i + 1);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex-none w-[85vw] md:w-[30vw] aspect-[16/10] relative group cursor-pointer snap-center overflow-hidden rounded-sm border border-white/5 bg-zinc-900"
    >
      <img
        src={imgSrc}
        onError={handleImgError}
        alt="Field intelligence"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-amber-500 uppercase tracking-widest">
            {item?.verified ? "Verified Proof" : "Field Signal"}
          </span>
          <Eye size={16} className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white leading-tight mb-2 uppercase group-hover:text-amber-500 transition-colors">
            {item?.mission_id?.replace(/-/g, " ") || "Untitled Mission"}
          </h4>
          <p className="text-gray-400 text-xs line-clamp-2 font-light">
            {item?.notebooklm?.summary_1line || "Manual verification complete."}
          </p>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,118,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />
    </motion.div>
  );
}
