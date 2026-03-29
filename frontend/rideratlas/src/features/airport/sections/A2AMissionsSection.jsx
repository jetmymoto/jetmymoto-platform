import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Plane } from "lucide-react";
import { GRAPH } from "@/core/network/networkGraph";
import { withBrandContext } from "@/utils/navigationTargets";

export default function A2AMissionsSection({ airportCode }) {
  const location = useLocation();
  const withCtx = (path) => withBrandContext(path, location.search);
  const code = (airportCode || "").toUpperCase();

  const insertionSlugs = GRAPH?.missionsByInsertion?.[code] || [];
  const extractionSlugs = GRAPH?.missionsByExtraction?.[code] || [];
  const allSlugs = [...new Set([...insertionSlugs, ...extractionSlugs])];

  if (allSlugs.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-8 border-l-2 border-amber-500 pl-6">
        <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
          A2A Missions™
        </div>
        <h2 className="mt-2 text-3xl font-serif italic text-white uppercase font-black lg:text-4xl">
          Airport-to-Airport Missions from {code}
        </h2>
        <p className="mt-3 text-sm text-zinc-400 max-w-2xl leading-7">
          One-way motorcycle corridors. Fly in, ride the route, drop the bike at
          the extraction hub. No round-trip. No backtracking.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allSlugs.map((slug) => {
          const m = GRAPH?.missions?.[slug];
          if (!m) return null;

          const isInsertion = insertionSlugs.includes(slug);

          return (
            <Link
              key={slug}
              to={withCtx(`/a2a/${slug}`)}
              className="group rounded-[28px] border border-white/10 bg-[#121212] p-6 transition-colors hover:border-[#CDA755]/30 hover:bg-[#151515]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    <Plane className="h-3 w-3 text-[#CDA755]" />
                    {isInsertion ? "Depart from here" : "Arrive here"}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {m.title}
                  </h3>
                </div>
                <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#CDA755] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm text-zinc-400">
                <span className="font-mono font-bold text-white">
                  {m.insertion_airport}
                </span>
                <span className="text-zinc-600">→</span>
                <span className="text-zinc-300">
                  {m.theaterData?.name || m.theater}
                </span>
                <span className="text-zinc-600">→</span>
                <span className="font-mono font-bold text-white">
                  {m.extraction_airport}
                </span>
              </div>

              {m.distance_km ? (
                <div className="mt-3 text-xs text-zinc-500">
                  ~{m.distance_km} km • {m.duration_days || "Multi-day"} days
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
