/**
 * ContinentFilter
 *
 * Deterministic filter bar linked to GRAPH.indexes.missionsByContinent.
 * Derives available continents from the keys present in the index,
 * so it automatically reflects whatever continents have active missions.
 *
 * Props:
 *   continents   {string[]}  keys from GRAPH.indexes.missionsByContinent
 *   selected     {string}    current filter value ("all" | continent id)
 *   onChange     {fn}        called with new value on pill click
 *   counts       {object}    { [continentId]: hardwareValidatedCount } — rendered in badge
 */

function formatContinent(id) {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ContinentFilter({ continents = [], selected = "all", onChange, counts = {} }) {
  const pills = ["all", ...continents];

  if (pills.length <= 1) return null; // Nothing to filter on

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Label */}
      <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-zinc-600 mr-2 shrink-0">
        Region
      </span>

      {pills.map((id) => {
        const isActive = selected === id;
        const count = id === "all" ? null : counts[id];
        const label = id === "all" ? "All Corridors" : formatContinent(id);

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest italic transition-all border ${
              isActive
                ? "border-[#CDA755] bg-[#CDA755]/10 text-[#CDA755]"
                : "border-white/10 bg-transparent text-zinc-500 hover:border-white/25 hover:text-zinc-300"
            }`}
          >
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-[#CDA755]" />
            )}
            {label}
            {count != null && count > 0 && (
              <span
                className={`font-mono text-[9px] tabular-nums px-1.5 py-0.5 rounded ${
                  isActive
                    ? "bg-[#CDA755]/20 text-[#CDA755]"
                    : "bg-white/5 text-zinc-600"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
