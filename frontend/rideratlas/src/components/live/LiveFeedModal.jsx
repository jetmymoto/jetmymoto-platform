import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LiveFeedModal({ item, onClose }) {
  const navigate = useNavigate();

 // Inside LiveFeedModal.jsx
const hero = item.video_id 
  ? `https://www.youtube.com/embed/${item.video_id}?autoplay=1&rel=0` 
  : getPublicUrl(item.poster?.landscape); // Use the same helper!

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl"
      >
        <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3">
          {/* MEDIA */}
          <div className="lg:col-span-2 relative bg-black">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10
                         p-2 bg-black/70 text-white rounded-full"
            >
              <ChevronLeft size={24} />
            </button>

            {item.video_id ? (
              <iframe
                src={hero}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <img
                src={hero}
                className="w-full h-full object-cover"
                alt=""
              />
            )}
          </div>

          {/* INTEL */}
          <div className="p-8 flex flex-col justify-between border-l border-white/10">
            <div>
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">
                Operational Intel
              </span>

              <h2 className="text-3xl font-black uppercase italic text-white mt-2">
                {item.mission_id?.replace(/-/g, " ")}
              </h2>

              <div className="mt-6 space-y-3 text-sm text-gray-400">
                {item.notebooklm?.summary_bullets?.slice(0, 3)?.map((b, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-amber-500 font-mono">0{i + 1}</span>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate(`/mission/${item.mission_id}`)}
              className="mt-8 py-4 bg-amber-500 text-black
                         font-black uppercase tracking-widest text-xs"
            >
              Access Full Dossier
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
