// src/App.jsx

if (import.meta.env.DEV) {
  console.log("HOST:", window.location.hostname);
}

import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import BrandLayout from "./layouts/BrandLayout";
import AdminLayout from "./layouts/AdminLayout";
import { getSiteConfig } from "./utils/siteConfig";

// CORE PAGES (Kept synchronous for fast LCP)
import GlobalTower from "./pages/GlobalTower";
import AirportsCountryPage from "./pages/AirportsCountryPage";
import AirportPage from "./pages/AirportPage";
import RideRoutePage from "@/pages/routes/RideRoutePage";
import RideDestinationPage from "@/pages/destination/RideDestinationPage";
import RiderAtlasHomepage from "./pages/Rideratlashomepage";
import JetMyMotoHomepage from "./pages/jetmymotohomepage";
import NotFound from "./pages/NotFound";

// LAZY LOADED PAGES
const MissionDetailsPage = React.lazy(() => import("./pages/MissionDetailsPage"));
const MissionPlannerPage = React.lazy(() => import("./pages/MissionPlannerPage"));
const PlanSummaryPage = React.lazy(() => import("./pages/PlanSummaryPage"));
const HangarPage = React.lazy(() => import("./pages/HangarPage"));
const PoolPage = React.lazy(() => import("./pages/PoolPage"));
const MotoAirliftBooking = React.lazy(() => import("./features/airport/MotoAirliftBooking"));
const RentalDetailPage = React.lazy(() => import("./pages/rentals/RentalDetailPage"));
const PoiPage = React.lazy(() => import("./pages/poi/PoiPage"));

// LAZY LOADED ADMIN
const AdminOS = React.lazy(() => import("./pages/admin/AdminOS"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminPostersPage = React.lazy(() => import("./pages/AdminPostersPage"));
const AdminBookingsPage = React.lazy(() => import("./pages/admin/AdminBookingsPage"));
const AdminCommandCenter = React.lazy(() => import("./pages/admin/AdminCommandCenter"));
const AdminMediaManager = React.lazy(() => import("./pages/admin/AdminMediaManager"));
const AdminRentalManager = React.lazy(() => import("./pages/admin/AdminRentalManager"));
const AdminSectionPlaceholder = React.lazy(() => import("./pages/admin/AdminSectionPlaceholder"));

function DebugLocation() {
  const location = useLocation();
  if (import.meta.env.DEV) {
    console.log("ROUTER LOCATION:", location);
  }
  return null;
}

const LazyFallback = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <div className="animate-pulse w-8 h-8 rounded-full bg-amber-500/50" />
  </div>
);

function AppRoutes({ site }) {
  return (
    <Routes>
      <Route path="/" element={site?.id === "jmm" ? <JetMyMotoHomepage /> : <RiderAtlasHomepage />} />
      <Route path="/jetmymoto" element={<JetMyMotoHomepage />} />

      <Route path="/airports" element={<GlobalTower />} />
      <Route path="/airports/:continent" element={<GlobalTower />} />
      <Route path="/airports/country/:country" element={<AirportsCountryPage />} />
      <Route path="/airport/:code" element={<AirportPage />} />

      <Route path="/moto-airlift" element={<MotoAirliftBooking />} />
      <Route path="/moto-airlift/:any" element={<Navigate to="/moto-airlift" replace />} />

      <Route path="/rental/:slug" element={<RentalDetailPage />} />
      <Route path="/route/:slug" element={<RideRoutePage />} />
      <Route path="/destination/:slug" element={<RideDestinationPage />} />
      <Route path="/poi/:slug" element={<PoiPage />} />

      <Route path="/mission/:id" element={<MissionDetailsPage />} />
      <Route path="/deploy/:missionId" element={<MissionPlannerPage />} />
      <Route path="/plan/:planId" element={<PlanSummaryPage />} />
      <Route path="/hangar" element={<HangarPage />} />
      <Route path="/pool/:poolId" element={<PoolPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminCommandCenter />} />
        <Route
          path="rentals"
          element={<AdminRentalManager />}
        />
        <Route path="media" element={<AdminMediaManager />} />
        <Route
          path="routes"
          element={
            <AdminSectionPlaceholder
              title="Riding Theaters & Routes"
              description="Visualize canonical route records, compare candidate route exports against graph schema, and stage only validated route data for agent commits."
            />
          }
        />
        <Route
          path="airports"
          element={
            <AdminSectionPlaceholder
              title="Logistics Hubs"
              description="Review airport-hub infrastructure, arrival OS coverage, and data gaps before dispatching agents to expand static airport intelligence."
            />
          }
        />
        <Route
          path="pools"
          element={
            <AdminSectionPlaceholder
              title="Transport Pools"
              description="Monitor pooled transport entities and reserve this surface for future validation workflows around shared logistics capacity."
            />
          }
        />
        <Route path="posters" element={<AdminPostersPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="os/*" element={<AdminOS />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppShell({ site }) {
  const location = useLocation();
  const isAdminRoute =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  const content = (
    <Suspense fallback={<LazyFallback />}>
      <AppRoutes site={site} />
    </Suspense>
  );

  if (isAdminRoute) {
    return content;
  }

  return <BrandLayout>{content}</BrandLayout>;
}

export default function App() {
  const site = getSiteConfig();

  if (import.meta.env.DEV) {
    console.log("SITE ID:", site?.id);
    console.log("SITE DETECTED:", site);
  }

  return (
    <Router>
      <DebugLocation />
      <AppShell site={site} />
    </Router>
  );
}
