import { Link, useLocation } from "react-router-dom";
import { getSiteConfig } from "@/utils/siteConfig";
import { getCanonicalPaths } from "@/utils/navigationTargets";

const FooterJetMyMoto = () => {
  const site = getSiteConfig();
  const location = useLocation();
  const paths = getCanonicalPaths();
  const isJetMyMoto =
    site.id === "jmm" ||
    location.pathname === "/jetmymoto" ||
    new URLSearchParams(location.search).get("ctx") === "jet";

  // Preserve brand context (?ctx=jet)
  const ctx = new URLSearchParams(location.search).get("ctx");
  const withCtx = (path) => {
    if (!ctx) return path;
    return `${path}${path.includes("?") ? "&" : "?"}ctx=${ctx}`;
  };

  return (
    <footer className="bg-[#050505] border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 text-slate-400 text-sm">

        {/* BRAND */}
        <div>
          <div className="text-xl font-black text-white tracking-tight">
            JET<span className="text-slate-300">MY</span>MOTO
          </div>

          <p className="mt-4 text-xs leading-relaxed">
            Private motorcycle airlift and international transport for riders,
            collectors, expeditions, and manufacturers.
          </p>
        </div>

        {/* LOGISTICS ENGINE */}
        <div>
          <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-4">
            Logistics Engine
          </h4>

          <ul className="space-y-2">
            <li>
              <Link to={withCtx(paths.logistics)} className="hover:text-white transition">
                Moto Airlift Quotes
              </Link>
            </li>

            <li>
              <Link to={withCtx(paths.airports)} className="hover:text-white transition">
                Airport Recovery Protocols
              </Link>
            </li>

            <li>
              <Link to={withCtx("/admin")} className="hover:text-white transition">
                Flight Crew / CRM
              </Link>
            </li>
          </ul>
        </div>

        {/* GLOBAL NETWORK */}
        <div>
          <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-4">
            Global Network
          </h4>

          <ul className="space-y-2">
            <li>
              <Link to={withCtx(paths.airports)} className="hover:text-white transition">
                Global Airport Tower
              </Link>
            </li>

            <li>
              <Link to={withCtx("/airport/continent/europe")} className="hover:text-white transition">
                European Hubs
              </Link>
            </li>

            <li>
              <Link to={withCtx("/airport/continent/north-america")} className="hover:text-white transition">
                North American Hubs
              </Link>
            </li>
          </ul>
        </div>

        {/* RIDE INTELLIGENCE */}
        <div>
          <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-4">
            Ride Intelligence
          </h4>

          <ul className="space-y-2">
            <li>
              <Link to={withCtx(paths.destination)} className="hover:text-white transition">
                Ride Destination Hubs
              </Link>
            </li>

            <li>
              <Link to={withCtx(paths.route)} className="hover:text-white transition">
                Route Intelligence
              </Link>
            </li>

            <li>
              <Link to={withCtx(paths.poi)} className="hover:text-white transition">
                POI Library
              </Link>
            </li>

            <li>
              <Link to={withCtx(paths.mission)} className="hover:text-white transition">
                Mission Deployments
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright & Brand */}
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} JetMyMoto • Powered by{" "}
        <Link to={isJetMyMoto ? "/jetmymoto" : "/"} className="hover:text-white">
          {isJetMyMoto ? "JetMyMoto" : "Rider Atlas"}
        </Link>
      </div>
    </footer>
  );
};

export default FooterJetMyMoto;
