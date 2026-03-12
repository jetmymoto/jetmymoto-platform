import { Link, useLocation } from "react-router-dom";
import { getSiteConfig } from "@/utils/siteConfig";

const FooterJetMyMoto = () => {
  const site = getSiteConfig();
  const location = useLocation();

  // Preserve brand context (?ctx=jet)
  const ctx = new URLSearchParams(location.search).get("ctx");
  const ctxParam = ctx ? `?ctx=${ctx}` : "";

  return (
    <footer className="bg-black border-t border-white/10 mt-24">
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
              <Link to={`/moto-airlift${ctxParam}`} className="hover:text-white transition">
                Moto Airlift Quotes
              </Link>
            </li>

            <li>
              <Link to={`/airports${ctxParam}`} className="hover:text-white transition">
                Airport Recovery Protocols
              </Link>
            </li>

            <li>
              <Link to={`/admin${ctxParam}`} className="hover:text-white transition">
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
              <Link to={`/airports${ctxParam}`} className="hover:text-white transition">
                Global Airport Tower
              </Link>
            </li>

            <li>
              <Link to={`/airports/europe${ctxParam}`} className="hover:text-white transition">
                European Hubs
              </Link>
            </li>

            <li>
              <Link to={`/airports/north-america${ctxParam}`} className="hover:text-white transition">
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
              <Link to={`/rides${ctxParam}`} className="hover:text-white transition">
                Ride Destination Hubs
              </Link>
            </li>

            <li>
              <Link to={`/route${ctxParam}`} className="hover:text-white transition">
                Route Intelligence
              </Link>
            </li>

            <li>
              <Link to={`/poi${ctxParam}`} className="hover:text-white transition">
                POI Library
              </Link>
            </li>

            <li>
              <Link to={`/mission${ctxParam}`} className="hover:text-white transition">
                Mission Deployments
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} JetMyMoto • Powered by{" "}
        <a
          href={`https://${site.domain}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white"
        >
          Rider Atlas
        </a>
      </div>
    </footer>
  );
};

export default FooterJetMyMoto;