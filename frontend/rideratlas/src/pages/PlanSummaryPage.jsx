import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PlanSummaryPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full border border-white/10 p-8 bg-zinc-950">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
          Rider Atlas // Plan Summary
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
          Mission Deployment
        </h1>

        <p className="text-zinc-400 text-sm mb-6">
          Plan ID:
          <span className="font-mono text-white ml-2">{planId}</span>
        </p>

        <div className="space-y-3 text-sm text-zinc-300">
          <div>• Mission blueprint loaded</div>
          <div>• Deployment parameters pending</div>
          <div>• Pricing & checkout next</div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-3 text-xs uppercase tracking-widest border border-white/10 hover:border-white transition"
          >
            Back to Missions
          </button>

          <button
            disabled
            className="px-5 py-3 text-xs uppercase tracking-widest bg-amber-500 text-black font-bold opacity-60 cursor-not-allowed"
          >
            Checkout (Next)
          </button>
        </div>
      </div>
    </div>
  );
}
