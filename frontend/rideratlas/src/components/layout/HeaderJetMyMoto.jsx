import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function HeaderJetMyMoto() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setOpen(false);

  const navLinks = [
    { label: "Atlas", path: "/" },
    { label: "Airports", path: "/airports" },
    { label: "Regions", path: "/rides" },
    { label: "Routes", path: "/routes" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/5">
      
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <h1 className="text-white text-xl md:text-2xl font-semibold tracking-[0.2em]">
            JET<span className="text-gold-accent ml-1">MYMOTO</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-sm uppercase tracking-wider">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition ${
                location.pathname.startsWith(item.path)
                  ? "text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex">
          <Link
            to="/moto-airlift"
            className="bg-gold-accent text-black px-6 py-2.5 rounded-md font-semibold text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition"
          >
            Ship Motorcycle
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
          aria-label="Toggle Menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black border-t border-white/10 px-8 py-6 space-y-6 text-sm uppercase tracking-wider">

          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className="block text-white/70 hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          <Link
            to="/moto-airlift"
            onClick={closeMenu}
            className="block bg-gold-accent text-black px-6 py-3 rounded-md font-semibold text-center mt-4"
          >
            Ship Motorcycle
          </Link>

        </div>
      )}
    </header>
  );
}