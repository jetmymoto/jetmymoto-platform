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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs tracking-wide uppercase text-[#CDA755] mb-2">
            One-Way Routes
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900">
            Routes from {code}
          </h2>
          <p className="mt-3 text-sm text-zinc-500 max-w-2xl leading-relaxed">
            One-way motorcycle corridors. Fly in, ride the route, drop the bike at
            the destination hub. No round-trip. No backtracking.
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
                className="group bg-[#F7F6F3] rounded-2xl p-6 transition-all duration-300 hover:bg-white hover:shadow-md border border-transparent hover:border-zinc-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-zinc-400 mb-3">
                      <Plane className="h-3 w-3 text-[#CDA755]" />
                      {isInsertion ? "Depart from here" : "Arrive here"}
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-[#CDA755] transition-colors">
                      {m.title}
                    </h3>
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-zinc-300 group-hover:text-[#CDA755] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>

                <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
                  <span className="font-semibold text-zinc-800">
                    {m.insertion_airport}
                  </span>
                  <span className="text-zinc-300">→</span>
                  <span className="text-zinc-500">
                    {m.theaterData?.name || m.theater}
                  </span>
                  <span className="text-zinc-300">→</span>
                  <span className="font-semibold text-zinc-800">
                    {m.extraction_airport}
                  </span>
                </div>

                {m.distance_km ? (
                  <p className="mt-3 text-xs text-zinc-400">
                    ~{m.distance_km} km · {m.duration_days || "Multi-day"} days
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
