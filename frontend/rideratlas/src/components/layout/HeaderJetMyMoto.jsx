import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getCanonicalPaths } from "@/utils/navigationTargets";
import { getSiteConfig } from "@/utils/siteConfig";

export default function HeaderJetMyMoto({ isJetMyMoto: forcedIsJetMyMoto = null }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const site = getSiteConfig();
  const paths = getCanonicalPaths(location.search);
  const mode = new URLSearchParams(location.search).get("mode");
  const brandCtx = new URLSearchParams(location.search).get("ctx");
  const isJetContext =
    site.id === "jmm" ||
    location.pathname === "/jetmymoto" ||
    location.pathname.startsWith("/moto-airlift") ||
    location.pathname.startsWith("/pool/") ||
    brandCtx === "jet";
  const isJetMyMoto = forcedIsJetMyMoto ?? isJetContext;
  const withContext = (basePath, brandCtx) => {
    if (!basePath) return "/";
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}ctx=${brandCtx}`;
  };
  const withCurrentContext = (basePath) => {
    const shouldEnforceContext = isJetMyMoto && site.id !== "jmm";
    if (shouldEnforceContext) {
      return withContext(basePath, "jet");
    }
    return brandCtx ? withContext(basePath, brandCtx) : basePath;
  };

  const closeMenu = () => setOpen(false);
  const surfaceClass = isJetMyMoto
    ? "bg-[rgba(16,16,16,0.97)] border-white/5"
    : "bg-[rgba(16,16,16,0.97)] border-white/5";
  const brandTextClass = isJetMyMoto ? "text-[#574C43]" : "text-white";
  const navIdleClass = isJetMyMoto ? "text-[#574C43]/70 hover:text-[#CDA755]" : "text-zinc-400 hover:text-white";
  const mobileToggleClass = isJetMyMoto ? "text-[#574C43]/70 hover:text-[#CDA755]" : "text-zinc-300 hover:text-white";
  const menuSurfaceClass = isJetMyMoto ? "bg-[#121212] border-white/5" : "bg-[#121212] border-white/5";
  const subtleBorderClass = isJetMyMoto ? "border-[#574C43]/10" : "border-white/5";
  const rentalsCtaClass = isJetMyMoto
    ? "border border-[#574C43]/15 text-[#574C43] px-5 py-2.5 rounded-sm font-semibold text-xs uppercase tracking-widest hover:border-[#CDA755] hover:text-[#CDA755] transition-all duration-300"
    : "border border-white/20 text-white px-5 py-2.5 rounded-sm font-semibold text-xs uppercase tracking-widest hover:border-amber-500 hover:text-amber-500 transition-all duration-300";
  const logisticsCtaClass = isJetMyMoto
    ? "bg-[#CDA755] text-[#574C43] px-5 py-2.5 rounded-sm font-semibold text-xs uppercase tracking-widest shadow-lg hover:bg-[#A76330] hover:text-white transition-all duration-300"
    : "bg-amber-600 text-white px-5 py-2.5 rounded-sm font-semibold text-xs uppercase tracking-widest shadow-lg hover:bg-amber-500 transition-all duration-300";

  const navLinks = [
    { label: isJetMyMoto ? "Home" : "Atlas", path: isJetMyMoto ? "/jetmymoto" : "/" },
    { label: "Airports", path: withCurrentContext(paths.airports) },
    { label: "Rides", path: withCurrentContext(paths.route) },
    { label: "Showroom", path: withCurrentContext(paths.rentals) },
  ];

  const isActive = (label) => {
    if (label === "Atlas" || label === "Home") {
      return location.pathname === "/" || location.pathname === "/jetmymoto";
    }

    if (label === "Airports") {
      return location.pathname === "/airport" || (location.pathname.startsWith("/airport") && mode !== "rent");
    }

    if (label === "Rides") {
      return ["/route/", "/destination/", "/poi/"].some((prefix) => location.pathname.startsWith(prefix));
    }

    if (label === "Showroom") {
      return location.pathname.startsWith("/airport/") && mode === "rent";
    }

    return false;
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-[120] transition-colors duration-700 border-b ${surfaceClass}`}>
      
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* Brand */}
        <Link to={isJetMyMoto ? "/jetmymoto" : "/"} className="flex items-center" onClick={closeMenu}>
          <span className={`${brandTextClass} text-xl md:text-2xl font-semibold tracking-[0.2em] transition-colors duration-700`}>
            {isJetMyMoto ? (
              <>
                JET<span className="text-[#CDA755] ml-1">MYMOTO</span>
              </>
            ) : (
              <>
                RIDER<span className="text-[#CDA755] ml-1">ATLAS</span>
              </>
            )}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider font-medium">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition-colors duration-300 ${
                isActive(item.label)
                  ? "text-[#CDA755]"
                  : navIdleClass
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* The Dual-Engine CTAs (50/50 UX Strategy) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Agent CTA - Solid Tactical Style */}
          <Link
            to="/jetmymoto"
            className={logisticsCtaClass}
          >
            Agent
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden transition-colors ${mobileToggleClass}`}
          aria-label="Toggle Menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {open && (
        <div className={`md:hidden border-t px-8 py-6 space-y-6 text-sm uppercase tracking-wider transition-colors duration-700 ${menuSurfaceClass}`}>

          <div className="flex flex-col gap-4">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`block transition-colors ${isJetMyMoto ? "text-[#574C43]/75 hover:text-[#CDA755]" : "text-zinc-400 hover:text-amber-500"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className={`flex flex-col gap-3 pt-4 border-t ${subtleBorderClass}`}>
            <Link
              to="/jetmymoto"
              onClick={closeMenu}
              className={`block w-full px-6 py-3 rounded-sm font-semibold text-center tracking-widest ${isJetMyMoto ? "bg-[#CDA755] text-[#574C43] hover:bg-[#A76330] hover:text-white" : "bg-amber-600 text-white"}`}
            >
              Agent
            </Link>
          </div>

        </div>
      )}
    </header>
  );
}
