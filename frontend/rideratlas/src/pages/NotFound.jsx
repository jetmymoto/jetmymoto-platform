import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="w-24 h-24 text-amber-500 mb-6" />
      <h1 className="text-6xl font-black mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-400 mb-8 uppercase tracking-widest">Sector Not Found</h2>
      <p className="text-slate-500 max-w-md mb-8">
        You have drifted off the navigational grid. This waypoint does not exist.
      </p>
      <Link to="/" className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full transition-all flex items-center gap-2">
        <Home className="w-5 h-5" /> RETURN TO BASE
      </Link>
    </div>
  );
};

export default NotFound;
