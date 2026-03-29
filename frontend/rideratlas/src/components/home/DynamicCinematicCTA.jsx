import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function DynamicCinematicCTA() {
  const location = useLocation();
  const path = location.pathname;

  let ctaText = "Start Your Journey";
  let ctaLink = "/routes";

  if (path.includes("/routes")) {
    ctaText = "Continue Exploring Routes";
    ctaLink = "/routes";
  } else if (path.includes("/moto-airlift")) {
    ctaText = "Ship Your Bike Now";
    ctaLink = "/moto-airlift";
  }

  // Fallback default video and poster
  const videoUrl =
    "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2F_Cont.%20EuropePageH1video.mp4?alt=media&token=d27e77c5-f34f-4486-a78d-a88f46296c02";
  const posterUrl =
    "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Fimages%20for%20ai%20scan%2FIMG-20251019-WA0017.jpg?alt=media&token=c297ab60-a072-40cd-a51e-bdb9c36ced24";

  return (
    <section className="relative w-full min-h-[400px] md:min-h-[480px] overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={posterUrl}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Seamless transition from section above */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-t from-transparent to-[#050505] z-10 pointer-events-none" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-serif text-[clamp(1.8rem,4vw,3rem)] leading-tight text-white max-w-2xl"
        >
          Stop dreaming about the perfect ride.
          <br />
          <span className="text-[#CDA755]">Start living it.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6"
        >
          <Link
            to={ctaLink}
            className="inline-block bg-[#CDA755] text-[#050505] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(205,167,85,0.3)] hover:scale-105 hover:shadow-[0_0_40px_rgba(205,167,85,0.5)] transition-all duration-300"
          >
            {ctaText}
          </Link>
        </motion.div>
      </div>

      {/* Seamless transition into footer */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#050505] z-10 pointer-events-none" />
    </section>
  );
}
