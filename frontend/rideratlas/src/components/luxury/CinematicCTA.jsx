import { FadeIn } from "./FadeIn";
import { Link } from "react-router-dom";
import { withBrandContext } from "@/utils/navigationTargets";

export default function CinematicCTA({ title, actionText, linkTo, onClick }) {
  return (
    <section className="bg-[#050505] py-40 px-6 flex flex-col items-center text-center">
      <FadeIn>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-16 tracking-tight">
          {title}
        </h2>
        <Link
          to={withBrandContext(linkTo)}
          onClick={onClick}
          className="inline-flex items-center justify-center border border-[#CDA755]/40 bg-transparent px-12 py-5 text-[10px] font-medium tracking-[0.3em] uppercase text-white transition-all duration-700 hover:border-[#CDA755] hover:bg-[#CDA755]/5"
        >
          {actionText}
        </Link>
      </FadeIn>
    </section>
  );
}
