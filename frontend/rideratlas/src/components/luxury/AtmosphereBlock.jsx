import { motion } from "framer-motion";
import { FadeIn } from "./FadeIn";

export default function AtmosphereBlock({ text }) {
  if (!text) return null;

  return (
    <section className="bg-[#050505] py-32 md:py-48 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="text-xl md:text-3xl lg:text-4xl font-serif text-white/90 leading-relaxed text-center italic">
            {text}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
