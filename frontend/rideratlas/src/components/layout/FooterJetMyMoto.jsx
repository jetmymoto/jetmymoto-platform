import { Link, useLocation } from "react-router-dom";
import { getSiteConfig } from "@/utils/siteConfig";
import { getCanonicalPaths, withBrandContext } from "@/utils/navigationTargets";

const FooterJetMyMoto = ({ isJetMyMoto: forcedIsJetMyMoto = null }) => {
  const site = getSiteConfig();
  const location = useLocation();
  const paths = getCanonicalPaths(location.search);

  const isJetContext =
    site.id === "jmm" ||
    location.pathname === "/jetmymoto" ||
    location.pathname.startsWith("/moto-airlift") ||
    location.pathname.startsWith("/pool/") ||
    new URLSearchParams(location.search).get("ctx") === "jet";

  const isJetMyMoto = forcedIsJetMyMoto ?? isJetContext;

  const ctx = new URLSearchParams(location.search).get("ctx");
  const withCtx = (path) => withBrandContext(path, ctx ? `?ctx=${ctx}` : "");

  const linkClass = "hover:text-[#CDA755] transition-all duration-300 hover:translate-x-1";

  return (
    <footer className="mt-0 border-t border-white/10 bg-[#050505] text-white">

      {/* 🤝 TRUST MICRO LAYER */}
      <div className="py-6 text-center text-white/40 text-xs tracking-[0.3em] uppercase">
        Trusted by global logistics partners & premium fleet providers
      </div>

      {/* 🧭 NAV GRID */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm text-white/60">

        {/* BRAND */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[20px] p-6">
          <div className="text-xl font-black tracking-tight text-white">
            JET<span className="text-[#CDA755]">MY</span>MOTO
          </div>

          <p className="mt-4 text-xs leading-relaxed">
            Private motorcycle airlift and international transport for riders,
            collectors, expeditions, and manufacturers.
          </p>
        </div>

        {/* LOGISTICS */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[20px] p-6">
          <h4 className="font-bold uppercase text-xs tracking-widest mb-4 text-white">
            Logistics Engine
          </h4>

          <ul className="space-y-2">
            <li>
              <Link to={withCtx(paths.logistics)} className={linkClass}>
                Moto Airlift Quotes
              </Link>
            </li>
            <li>
              <Link to={withCtx(paths.airports)} className={linkClass}>
                Airport Recovery Protocols
              </Link>
            </li>
            <li>
              <Link to={withCtx("/admin")} className={linkClass}>
                Flight Crew / CRM
              </Link>
            </li>
          </ul>
        </div>

        {/* NETWORK */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[20px] p-6">
          <h4 className="font-bold uppercase text-xs tracking-widest mb-4 text-white">
            Global Network
          </h4>

          <ul className="space-y-2">
            <li>
              <Link to={withCtx(paths.airports)} className={linkClass}>
                Global Airport Tower
              </Link>
            </li>
            <li>
              <Link to={withCtx("/airport/continent/europe")} className={linkClass}>
                European Hubs
              </Link>
            </li>
            <li>
              <Link to={withCtx("/airport/continent/north-america")} className={linkClass}>
                North American Hubs
              </Link>
            </li>
          </ul>
        </div>

        {/* INTELLIGENCE */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[20px] p-6">
          <h4 className="font-bold uppercase text-xs tracking-widest mb-4 text-white">
            Ride Intelligence
          </h4>

          <ul className="space-y-2">
            <li>
              <Link to={withCtx(paths.destination)} className={linkClass}>
                Ride Destination Hubs
              </Link>
            </li>
            <li>
              <Link to={withCtx(paths.route)} className={linkClass}>
                Route Intelligence
              </Link>
            </li>
            <li>
              <Link to={withCtx(paths.poi)} className={linkClass}>
                POI Library
              </Link>
            </li>
            <li>
              <Link to={withCtx(paths.mission)} className={linkClass}>
                Mission Deployments
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 🧬 BOTTOM */}
      <div className="border-t border-white/5 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} JetMyMoto • Powered by{" "}
        <Link to={withCtx("/jetmymoto")} className="hover:text-[#CDA755]">
          JetMyMoto
        </Link>

        <div className="mt-2 text-[10px] text-white/30">
          Built for riders who move across continents.
        </div>
      </div>
    </footer>
  );
};

export default FooterJetMyMoto;
