import { Suspense, lazy } from "react";
import { Routes, Route } from 'react-router-dom';

const AirportPage = lazy(() => import("../features/airport/pages/AirportPage"));
const MissionDetailPage = lazy(() => import("../features/missions/pages/MissionDetailPage"));
const RentalHealthPage = lazy(() => import("../features/rentals/pages/RentalHealthPage"));
const GraphHealthPage = lazy(() => import("../core/graph/health/GraphHealthPage"));
const MediaHealthPage = lazy(() => import("../core/graph/health/MediaHealthPage"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
      <div className="text-[#CDA755] text-[10px] uppercase tracking-[0.4em] animate-pulse">
        Loading RiderAtlas
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<div className="p-8 text-white font-bold bg-[#0B0B0C] min-h-screen">RiderAtlas Clean Core</div>} />
        <Route path="/health" element={<div className="p-8 text-green-600 font-bold bg-[#0B0B0C] min-h-screen">System online</div>} />
        <Route path="/health/rentals" element={<RentalHealthPage />} />
        <Route path="/health/graph" element={<GraphHealthPage />} />
        <Route path="/health/media" element={<MediaHealthPage />} />
        <Route path="/airport/:code" element={<AirportPage />} />
        <Route path="/mission/:slug" element={<MissionDetailPage />} />
      </Routes>
    </Suspense>
  )
}
