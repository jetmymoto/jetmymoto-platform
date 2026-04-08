
// src/App.jsx

if (import.meta.env.DEV) {
  console.log("HOST:", window.location.hostname);
}

import { lazy, Suspense, useEffect, useState } from "react";
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
import {
  getCanonicalAirportContinentPath,
  getCanonicalAirportCountryPath,
  getCanonicalAirportPath,
} from "@/utils/navigationTargets";

import RiderAtlasHomepage from "./pages/Rideratlashomepage";
import JetMyMotoHomepage from "./pages/jetmymotohomepage";
import NotFound from "./pages/NotFound";
import TactileHardwarePrototypePage from "./pages/TactileHardwarePrototypePage";
import PatriotPseoTemplate from "./components/seo/PatriotPseoTemplate";

// LAZY LOADED PAGES
const GlobalTower = lazy(() => import("./pages/GlobalTower"));
const AirportsCountryPage = lazy(() => import("./pages/AirportsCountryPage"));
const AirportPage = lazy(() => import("./pages/AirportPage"));
const RideRoutePage = lazy(() => import("@/pages/routes/RideRoutePage"));
const RideDestinationPage = lazy(() => import("@/pages/destination/RideDestinationPage"));
const PatriotOverlayPage = lazy(() => import("./pages/rentals/PatriotOverlayPage"));
const MotoAirliftBooking = lazy(() => import("./features/airport/MotoAirliftBooking"));
const MissionDetailsPage = lazy(() => import("./pages/MissionDetailsPage"));
const RentalCheckoutPage = lazy(() => import("./pages/rentals/RentalCheckoutPage"));
const MissionPlannerPage = lazy(() => import("./pages/MissionPlannerPage"));
const PlanSummaryPage = lazy(() => import("./pages/PlanSummaryPage"));
const HangarPage = lazy(() => import("./pages/HangarPage"));
const PoolPage = lazy(() => import("./pages/PoolPage"));
const RentalDetailPage = lazy(() => import("./pages/rentals/RentalDetailPage"));
const ModelDeploymentPage = lazy(() => import("./pages/rentals/ModelDeploymentPage"));
const PoiPage = lazy(() => import("./pages/poi/PoiPage"));
const A2AMissionPage = lazy(() => import("./pages/a2a/A2AMissionPage"));
const OneWayRentalsPage = lazy(() => import("./pages/OneWayRentalsPage"));
const OperatorPage = lazy(() => import("./pages/OperatorPage"));

// LAZY LOADED ADMIN
const AdminOS = lazy(() => import("./pages/admin/AdminOS"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPostersPage = lazy(() => import("./pages/AdminPostersPage"));
const AdminBookingsPage = lazy(() => import("./pages/admin/AdminBookingsPage"));
const AdminCommandCenter = lazy(() => import("./pages/admin/AdminCommandCenter"));
const AdminMediaManager = lazy(() => import("./pages/admin/AdminMediaManager"));
const AdminRentalManager = lazy(() => import("./pages/admin/AdminRentalManager"));
const AdminSectionPlaceholder = lazy(() => import("./pages/admin/AdminSectionPlaceholder"));

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

const LEGACY_AIRPORTS_PATH = "/airports";

function resolveLegacyAirportTarget(pathname) {
  const suffix = pathname
    .slice(LEGACY_AIRPORTS_PATH.length)
    .replace(/^\/+|\/+$/g, "");

  if (!suffix) {
    return "/airport";
  }

  const segments = suffix.split("/").filter(Boolean);
  const [scope, value] = segments;

  if (scope === "country") {
    return getCanonicalAirportCountryPath(value);
  }

  if (scope === "continent") {
    return getCanonicalAirportContinentPath(value);
  }

  const matchedAirportCode = segments.find((segment) => /^[a-z]{3}$/i.test(segment));

  if (matchedAirportCode) {
    return getCanonicalAirportPath(matchedAirportCode);
  }

  return getCanonicalAirportContinentPath(scope);
}

function LegacyAirportMaps() {
  const location = useLocation();
  const target = resolveLegacyAirportTarget(location.pathname);

  return <Navigate to={`${target}${location.search}`} replace />;
}

function AppRoutes({ site }) {
  return (
    <Routes>
      <Route path="/" element={site?.id === "jmm" ? <JetMyMotoHomepage /> : <RiderAtlasHomepage />} />
      <Route path="/jetmymoto" element={<JetMyMotoHomepage />} />
      <Route path="/prototype/tactile-hardware" element={<TactileHardwarePrototypePage />} />
      <Route path="/pseo-test" element={<PatriotPseoTemplate />} />

      <Route path="/airport" element={<GlobalTower />} />
      <Route path="/airport/continent/:continent" element={<GlobalTower />} />
      <Route path="/airport/country/:country" element={<AirportsCountryPage />} />
      <Route path="/airport/:code" element={<AirportPage />} />
      <Route path={LEGACY_AIRPORTS_PATH} element={<LegacyAirportMaps />} />
      <Route path={`${LEGACY_AIRPORTS_PATH}/*`} element={<LegacyAirportMaps />} />

      <Route path="/moto-airlift" element={<MotoAirliftBooking />} />
      <Route path="/moto-airlift/:any" element={<Navigate to="/moto-airlift" replace />} />

      <Route path="/rental/:slug" element={<RentalDetailPage />} />
      <Route path="/checkout/rental/:rentalId" element={<RentalCheckoutPage />} />
      <Route path="/rentals/:airportCode/:bikeSlug" element={<PatriotOverlayPage />} />
      <Route path="/deploy/:airportCode/:modelSlug" element={<ModelDeploymentPage />} />
      <Route path="/route/:slug" element={<RideRoutePage />} />
      <Route path="/destination/:slug" element={<RideDestinationPage />} />
      <Route path="/poi/:slug" element={<PoiPage />} />
      <Route path="/operators/:id" element={<OperatorPage />} />
      <Route path="/a2a/:slug" element={<A2AMissionPage />} />
      <Route path="/one-way-rentals" element={<OneWayRentalsPage />} />

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
