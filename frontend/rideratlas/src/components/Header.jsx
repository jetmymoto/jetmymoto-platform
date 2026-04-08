import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import { withBrandContext } from "@/utils/navigationTargets";
import {
  Disc,
  Plane,
  Warehouse,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login Failed', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isAirportsActive =
    location.pathname === '/airport' ||
    location.pathname.startsWith('/airport');

  const isHangarActive = location.pathname.startsWith('/hangar');
  const withCtx = (path) => withBrandContext(path, location.search);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* IDENTITY */}
        <Link to={withCtx("/")} className="group flex items-center gap-4">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-all duration-500 group-hover:bg-amber-500 group-hover:text-black group-hover:ring-amber-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Disc className="h-5 w-5 animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white leading-none">
              {location.pathname === '/jetmymoto' ? (
                <>JETMY<span className="text-amber-500">MOTO</span></>
              ) : (
                <>RIDER<span className="text-amber-500">ATLAS</span></>
              )}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 group-hover:text-white transition-colors mt-1">
              Global Platform
            </span>
          </div>
        </Link>

        {/* PRIMARY NAV */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-md shadow-2xl">
          <NavLink
            to={withCtx("/jetmymoto")}
            icon={<Disc size={14} />}
            label="JetMyMoto"
            active={location.pathname === '/jetmymoto'}
          />
          <NavLink
            to={withCtx("/airport")}
            icon={<Plane size={14} />}
            label="Airports"
            active={isAirportsActive}
          />
          <NavLink
            to={withCtx("/hangar")}
            icon={<Warehouse size={14} />}
            label="Hangar"
            active={isHangarActive}
          />
        </nav>

        {/* AUTH */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4 group">
              <div className="text-right hidden xl:block">
                <div className="text-[9px] uppercase text-emerald-500 font-black tracking-widest flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </div>
                <div className="text-xs font-bold text-white tracking-wide">
                  {user.displayName?.split(' ')[0]}
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <button
                onClick={() => signOut(auth)}
                className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                title="Disconnect"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="relative group overflow-hidden rounded-full bg-white/5 border border-white/10 px-6 py-2.5 transition-all duration-300 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
            >
              <div className="flex items-center gap-2 relative z-10">
                <LogIn size={16} className="text-amber-500 group-hover:text-white transition-colors duration-300" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  {isLoggingIn ? 'Syncing…' : 'Initialize'}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button className="lg:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#050505] border-b border-white/10 p-6 flex flex-col gap-2 lg:hidden animate-in slide-in-from-top-5 shadow-2xl">
          <MobileLink to={withCtx("/jetmymoto")} label="JetMyMoto" onClick={() => setMenuOpen(false)} />
          <MobileLink to={withCtx("/airport")} label="Airports" onClick={() => setMenuOpen(false)} />
          <MobileLink to={withCtx("/hangar")} label="Hangar" onClick={() => setMenuOpen(false)} />

          <div className="h-px w-full bg-white/10 my-4" />

          {user ? (
            <button
              onClick={() => {
                signOut(auth);
                setMenuOpen(false);
              }}
              className="flex items-center justify-between w-full p-4 rounded bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest"
            >
              <span>Disconnect</span>
              <LogOut size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                handleLogin();
                setMenuOpen(false);
              }}
              className="flex items-center justify-between w-full p-4 rounded bg-amber-500 text-black font-black uppercase tracking-widest"
            >
              <span>Initialize Session</span>
              <LogIn size={16} />
            </button>
          )}
        </div>
      )}
    </header>
  );
};

/* ---------- Subcomponents ---------- */

const NavLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`
      flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 group
      ${active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}
    `}
  >
    <span className={`transition-colors duration-300 ${active ? 'text-amber-500' : 'group-hover:text-amber-500'}`}>
      {icon}
    </span>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </Link>
);

const MobileLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center justify-between p-4 rounded-lg text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
  >
    <span>{label}</span>
    <ChevronRight size={14} />
  </Link>
);

export default Header;
