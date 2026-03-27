import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getCanonicalPaths } from "@/utils/navigationTargets";
import { getSiteConfig } from "@/utils/siteConfig";

export default function HeaderJetMyMoto() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const site = getSiteConfig();
  const paths = getCanonicalPaths();
  const mode = new URLSearchParams(location.search).get("mode");
  const brandCtx = new URLSearchParams(location.search).get("ctx");
  const isJetMyMoto =
    site.id === "jmm" ||
    location.pathname === "/jetmymoto" ||
    brandCtx === "jet";
  const withContext = (basePath, brandCtx) => {
    if (!basePath) return "/";
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}ctx=${brandCtx}`;
  };
  const withCurrentContext = (basePath) => {
    return brandCtx ? withContext(basePath, brandCtx) : basePath;
  };

  const closeMenu = () => setOpen(false);

  const navLinks = [
    { label: "Atlas", path: withCurrentContext("/") },
    { label: "Hubs", path: withCurrentContext(paths.airports) },
    { label: "Routes", path: withCurrentContext(paths.route) },
    { label: "Fleets", path: withCurrentContext(paths.rentals) },
  ];

  const isActive = (label) => {
    if (label === "Atlas") {
      return location.pathname === "/";
    }

    if (label === "Hubs") {
      return location.pathname === "/airport" || (location.pathname.startsWith("/airport") && mode !== "rent");
    }

    if (label === "Routes") {
      return ["/route/", "/destination/", "/poi/"].some((prefix) => location.pathname.startsWith(prefix));
    }

    if (label === "Fleets") {
      return location.pathname.startsWith("/airport/") && mode === "rent";
    }

    return false;
  };

  return (
    // Swapped bg-[#050505] for bg-[#121212] to prevent halation and eye strain [2, 3]
    <header className="fixed top-0 left-0 w-full z-[120] bg-[#121212]/90 backdrop-blur-lg border-b border-white/5">
      
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* Brand */}
        <Link to={isJetMyMoto ? "/jetmymoto" : "/"} className="flex items-center" onClick={closeMenu}>
          <h1 className="text-white text-xl md:text-2xl font-semibold tracking-[0.2em]">
            {isJetMyMoto ? (
              <>
                JET<span className="text-amber-500 ml-1">MYMOTO</span>
              </>
            ) : (
              <>
                RIDER<span className="text-amber-500 ml-1">ATLAS</span>
              </>
            )}
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider font-medium">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition-colors duration-300 ${
                isActive(item.label)
                  ? "text-amber-500"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* The Dual-Engine CTAs (50/50 UX Strategy) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Rentals CTA - Luxury Outline Style */}
          <Link
            to={withContext(paths.rentals, "ra")}
            className="border border-white/20 text-white px-5 py-2.5 rounded-sm font-semibold text-xs uppercase tracking-widest hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
          >
            Find a Bike
          </Link>

          {/* Logistics CTA - Solid Tactical Style */}
          <Link
            to={withContext(paths.logistics, "jet")}
            className="bg-amber-600 text-white px-5 py-2.5 rounded-sm font-semibold text-xs uppercase tracking-widest shadow-lg hover:bg-amber-500 transition-all duration-300"
          >
            Ship Machine
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-zinc-300 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#121212] border-t border-white/5 px-8 py-6 space-y-6 text-sm uppercase tracking-wider">

          <div className="flex flex-col gap-4">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className="block text-zinc-400 hover:text-amber-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
            <Link
              to={withContext(paths.rentals, "ra")}
              onClick={closeMenu}
              className="block border border-white/20 text-white px-6 py-3 rounded-sm font-semibold text-center tracking-widest hover:border-amber-500 hover:text-amber-500"
            >
              Find a Bike
            </Link>

            <Link
              to={withContext(paths.logistics, "jet")}
              onClick={closeMenu}
              className="block bg-amber-600 text-white px-6 py-3 rounded-sm font-semibold text-center tracking-widest"
            >
              Ship Machine
            </Link>
          </div>

        </div>
      )}
    </header>
  );
}
