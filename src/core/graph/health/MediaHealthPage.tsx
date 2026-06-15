import { useEffect, useState } from "react";
import { resolveAirportHero } from "../../../features/media/resolvers/airport";

const TARGETS = ["MUC", "MXP", "ALC", "OSL", "DBV"];

export default function MediaHealthPage() {
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    async function checkMedia() {
      const res: Record<string, string> = {};
      for (const code of TARGETS) {
        try {
          const hero = await resolveAirportHero(code);
          const hasManifestImage = hero.images.length > 0 && !hero.images[0].includes("unsplash");
          res[code] = hasManifestImage ? "MANIFEST_BASED" : "FALLBACK";
        } catch (e) {
          res[code] = "ERROR";
        }
      }
      if (mounted) setResults(res);
    }

    checkMedia();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-8 bg-[var(--atlas-ink)] min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-[var(--atlas-gold)]">Media Director Readiness</h1>
      
      <div className="grid grid-cols-1 gap-4 max-w-lg mb-8">
        {TARGETS.map(code => (
          <div key={code} className="p-4 border border-[var(--atlas-gold)]/20 bg-[var(--atlas-charcoal)] flex justify-between">
            <div className="font-bold">{code}</div>
            <div className={`font-bold text-xs uppercase tracking-widest ${results[code] === "MANIFEST_BASED" ? "text-green-500" : "text-yellow-500"}`}>
              {results[code] || "LOADING..."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
