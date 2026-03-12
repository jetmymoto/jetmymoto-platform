import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { ChevronRight, ArrowRight, Globe, Shield, Lock } from "lucide-react";

const TransportService = {
  headline: "YOUR BIKE, WAITING FOR YOU.",
  subheading: "The easiest way to ride your own machine abroad.",
  steps: [
    {
      id: "BOARD",
      title: "BOARD YOUR BIKE",
      detail:
        "We collect your motorcycle at home or your chosen hub. You hand us the keys; we handle the straps, insurance, and paperwork.",
      ghost: "BOARD",
    },
    {
      id: "FLY",
      title: "FLY IN RELAXED",
      detail:
        "You fly like a normal passenger while your bike is transported securely and waits for you at the basecamp.",
      ghost: "FLY",
    },
    {
      id: "RIDE",
      title: "START ON THE GOOD ROADS",
      detail:
        "Land, check in, and walk straight to your own bike—inspected, parked, and ready at the mission start.",
      ghost: "RIDE",
    },
  ],
  cta: "GET A SHIPPING QUOTE",
};

export default function ServicesSlider() {
  const containerRef = useRef(null);
  const [activePanel, setActivePanel] = useState("intro");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
  });

  const imgScale = useTransform(smoothProgress, [0, 1], [1.02, 1.15]);
  const imgOpacity = useTransform(
    smoothProgress,
    [0, 0.1, 0.9, 1],
    [0.4, 0.65, 0.65, 0.45]
  );

  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const lastPanel = useRef(activePanel);

  useMotionValueEvent(smoothProgress, "change", (v) => {
    let next = "intro";

    if (v >= 0.22 && v < 0.48) next = "step0";
    else if (v >= 0.48 && v < 0.7) next = "step1";
    else if (v >= 0.7 && v < 0.88) next = "step2";
    else if (v >= 0.88) next = "cta";

    if (next !== lastPanel.current) {
      lastPanel.current = next;
      setActivePanel(next);
    }
  });

  const ghostLabel =
    activePanel === "intro"
      ? "RIDE"
      : activePanel === "step0"
      ? TransportService.steps[0].ghost
      : activePanel === "step1"
      ? TransportService.steps[1].ghost
      : activePanel === "step2"
      ? TransportService.steps[2].ghost
      : "GO";

  const panelVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-[#050505]">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        {/* Ghost Word (right side only) */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
          <div className="absolute inset-y-0 right-0 w-1/2 flex items-center overflow-hidden">
            <motion.span
              key={ghostLabel}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 0.03, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 1.1 }}
              className="text-[16vw] whitespace-nowrap font-serif uppercase leading-[0.8] tracking-[-0.04em] text-white"
            >
              {ghostLabel}
            </motion.span>
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 grid lg:grid-cols-2 gap-20 items-center h-full">
          {/* LEFT COLUMN */}
          <div className="relative h-full flex flex-col justify-center pl-12 lg:pl-20">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-64 bg-white/5">
              <motion.div
                style={{ height: progressHeight }}
                className="w-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"
              />
            </div>

            <div className="relative min-h-[420px] max-w-lg">
              <AnimatePresence mode="wait">
                {activePanel === "intro" && (
                  <motion.div {...motionProps(panelVariants)} key="intro">
                    <IntroductionBlock />
                  </motion.div>
                )}

                {activePanel === "step0" && (
                  <motion.div {...motionProps(panelVariants)} key="step0">
                    <FeaturePanel step={TransportService.steps[0]} index={0} />
                  </motion.div>
                )}

                {activePanel === "step1" && (
                  <motion.div {...motionProps(panelVariants)} key="step1">
                    <FeaturePanel step={TransportService.steps[1]} index={1} />
                  </motion.div>
                )}

                {activePanel === "step2" && (
                  <motion.div {...motionProps(panelVariants)} key="step2">
                    <FeaturePanel step={TransportService.steps[2]} index={2} />
                  </motion.div>
                )}

                {activePanel === "cta" && (
                  <motion.div {...motionProps(panelVariants)} key="cta">
                    <CTABlock />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden lg:block relative h-[75vh] w-full overflow-hidden rounded-sm bg-zinc-900 border border-white/5 shadow-2xl">
            <motion.img
              style={{ scale: imgScale, opacity: imgOpacity }}
              src="https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_images%2Fservice%202.jpg?alt=media&token=21bd3812-b203-430a-883d-894556574477"
              className="w-full h-full object-cover grayscale-[10%] brightness-[0.8]"
              alt="Motorcycle Logistics"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
}

const motionProps = (variants) => ({
  variants,
  initial: "initial",
  animate: "animate",
  exit: "exit",
  transition: { duration: 0.4 },
});

const IntroductionBlock = () => (
  <div className="max-w-md">
    <h2 className="text-5xl md:text-7xl font-serif text-white uppercase leading-[0.9] tracking-[-0.02em] mb-8">
      {TransportService.headline}
    </h2>
    <p className="text-xl text-gray-400 font-light leading-relaxed">
      {TransportService.subheading}
      <br />
      <span className="text-xs text-gray-600 font-mono uppercase tracking-[0.3em] mt-6 flex items-center gap-3">
        Scroll to see how <ChevronRight size={12} />
      </span>
    </p>
  </div>
);

const FeaturePanel = ({ step, index }) => (
  <div className="max-w-lg">
    <span className="text-amber-500 font-mono text-[11px] tracking-[0.5em] uppercase font-black mb-6 block">
      Step 0{index + 1}
    </span>
    <h3 className="text-6xl md:text-8xl font-serif text-white uppercase leading-[0.9] tracking-[-0.02em] mb-8">
      {step.title}
    </h3>
    <p className="text-2xl text-gray-400 font-light leading-snug border-l border-amber-500/20 pl-8">
      {step.detail}
    </p>
  </div>
);

const CTABlock = () => (
  <div className="pt-2">
    <button className="group bg-white text-black hover:bg-amber-500 hover:text-white rounded-full px-12 py-6 font-black text-[12px] tracking-[0.4em] uppercase transition-all shadow-2xl flex items-center gap-4 active:scale-95">
      {TransportService.cta}
      <ArrowRight size={18} />
    </button>

    <div className="mt-24 flex flex-wrap gap-10 opacity-20">
      {[Globe, Shield, Lock].map((Icon, i) => (
        <div key={i} className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
          <Icon size={10} />
          {["Worldwide", "Fully Insured", "Secure Handling"][i]}
        </div>
      ))}
    </div>
  </div>
);