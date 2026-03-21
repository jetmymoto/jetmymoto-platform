// src/App.jsx

if (import.meta.env.DEV) {
  console.log("HOST:", window.location.hostname);
}

import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

import BrandLayout from "./layouts/BrandLayout";
import { getSiteConfig } from "./utils/siteConfig";

// CORE PAGES
import GlobalTower from "./pages/GlobalTower";
import AirportsCountryPage from "./pages/AirportsCountryPage";
import AirportPage from "./pages/AirportPage";

// ROUTE / DESTINATION
import RideRoutePage from "@/pages/routes/RideRoutePage";
import RideDestinationPage from "@/pages/destination/RideDestinationPage";
import PoiPage from "@/pages/poi/PoiPage";

// HOME
import HomePage from "./pages/HomePage";
import HomePage_JetMyMoto from "./pages/HomePage_JetMyMoto";

// MISSION FLOW
import MissionDetailsPage from "./pages/MissionDetailsPage";
import MissionPlannerPage from "./pages/MissionPlannerPage";
import PlanSummaryPage from "./pages/PlanSummaryPage";

// RETENTION
import HangarPage from "./pages/HangarPage";

// POOL SYSTEM
import PoolPage from "./pages/PoolPage";

// ADMIN
import AdminOS from "./pages/admin/AdminOS";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPostersPage from "./pages/AdminPostersPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";

// BOOKING ENGINE (NOW PART OF AIRPORT SYSTEM)
import MotoAirliftBooking from "./features/airport/MotoAirliftBooking";


function DebugLocation() {
  const location = useLocation();
  if (import.meta.env.DEV) {
    console.log("ROUTER LOCATION:", location);
  }
  return null;
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

      <BrandLayout>

        <Routes>

          {/* ROOT — DOMAIN SWITCH */}
          <Route
            path="/"
            element={site?.id === "jmm" ? <HomePage_JetMyMoto /> : <HomePage />}
          />

          {/* EXPLICIT DEV ROUTE FOR JETMYMOTO */}
          <Route
            path="/jetmymoto"
            element={<HomePage_JetMyMoto />}
          />

          {/* PRIMARY NETWORK ARCHITECTURE */}

          <Route path="/airports" element={<GlobalTower />} />
          <Route path="/airports/:continent" element={<GlobalTower />} />
          <Route path="/airports/country/:country" element={<AirportsCountryPage />} />

          {/* AIRPORT HUB */}
          <Route path="/airport/:code" element={<AirportPage />} />

          {/* BOOKING ENGINE (STANDALONE ACCESS) */}
          <Route path="/moto-airlift" element={<MotoAirliftBooking />} />
          <Route path="/moto-airlift/:any" element={<Navigate to="/moto-airlift" replace />} />

          {/* ROUTES */}
          <Route
            path="/route/:routeSlug"
            element={<RideRoutePage />}
          />

          {/* DESTINATIONS */}
          <Route
            path="/destination/:destinationSlug"
            element={<RideDestinationPage />}
          />

          {/* POI */}
          <Route
            path="/poi/:slug"
            element={<PoiPage />}
          />

          {/* MISSIONS */}
          <Route
            path="/mission/:id"
            element={<MissionDetailsPage />}
          />

          {/* DEPLOYMENT */}
          <Route
            path="/deploy/:missionId"
            element={<MissionPlannerPage />}
          />

          {/* SUMMARY */}
          <Route
            path="/plan/:planId"
            element={<PlanSummaryPage />}
          />

          {/* RETENTION */}
          <Route
            path="/hangar"
            element={<HangarPage />}
          />

          {/* POOL SYSTEM */}
          <Route
            path="/pool/:poolId"
            element={<PoolPage />}
          />

          {/* ADMIN */}
          <Route
            path="/admin/os/*"
            element={<AdminOS />}
          />

          <Route
            path="/admin"
            element={<Navigate to="/admin/os" />}
          />

          <Route
            path="/admin/posters"
            element={<AdminPostersPage />}
          />

          <Route
            path="/admin/bookings"
            element={<AdminBookingsPage />}
          />

        </Routes>

      </BrandLayout>

    </Router>
  );
}

