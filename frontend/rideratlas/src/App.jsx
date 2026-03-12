// src/App.jsx
console.log("HOST:", window.location.hostname);
import React from "react";
import BrandLayout from "./layouts/BrandLayout";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { getSiteConfig } from "./utils/siteConfig";
import GlobalTower from "./pages/GlobalTower";
import ContinentPage from "./pages/airports/ContinentPage";
import AirportsCountryPage from "./pages/AirportsCountryPage";
import RideRoutePage from "@/pages/routes/RideRoutePage";
import RideDestinationPage from "@/pages/destination/RideDestinationPage";
import PoiPage from "@/pages/poi/PoiPage";

// HOME
import HomePage from "./pages/HomePage";
import HomePage_JetMyMoto from "./pages/HomePage_JetMyMoto";

// CORE FUNNEL

import AirportPage from "./pages/AirportPage";
import MissionDetailsPage from "./pages/MissionDetailsPage";
import MissionPlannerPage from "./pages/MissionPlannerPage";
import PlanSummaryPage from "./pages/PlanSummaryPage";

// RETENTION
import HangarPage from "./pages/HangarPage";

import AdminOS from "./pages/admin/AdminOS";

// ADMIN
import AdminDashboard from "./pages/AdminDashboard";
import AdminPostersPage from "./pages/AdminPostersPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";

// BOOKING
import MotoAirliftBooking from "./features/booking/MotoAirliftBooking";


function DebugLocation() {
  const location = useLocation();
  console.log("ROUTER LOCATION:", location);
  return null;
}

export default function App() {
  const site = getSiteConfig();

  console.log("SITE ID:", site?.id);
  console.log("SITE DETECTED:", site);

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

            {/* 🚀 PRIMARY ARCHITECTURE 🚀 */}

            <Route path="/airports" element={<GlobalTower />} />
            <Route path="/airports/country/:country" element={<AirportsCountryPage />} />
            <Route path="/airports/:continent" element={<ContinentPage />} />
            <Route path="/airport/:slug-motorcycle-shipping" element={<AirportPage />} />
            <Route path="/moto-airlift" element={<MotoAirliftBooking />} />
            <Route path="/moto-airlift/:airportCode" element={<MotoAirliftBooking />} />

            <Route
              path="/route/:routeSlug"
              element={<RideRoutePage />}
            />

            <Route
              path="/destination/:destinationSlug"
              element={<RideDestinationPage />}
            />

            <Route path="/poi/:slug" element={<PoiPage />} />

            {/* --- SECONDARY --- */}
            
            {/* 🎬 MISSIONS */}
            <Route path="/mission/:id" element={<MissionDetailsPage />} />

            {/* 🛡️ DEPLOYMENT */}
            <Route path="/deploy/:missionId" element={<MissionPlannerPage />} />

            {/* 💰 SUMMARY */}
            <Route path="/plan/:planId" element={<PlanSummaryPage />} />

            {/* 🏛️ RETENTION */}
            <Route path="/hangar" element={<HangarPage />} />

            {/* 🧠 ADMIN */}
            <Route path="/admin/os/*" element={<AdminOS />} />
            <Route path="/admin" element={<Navigate to="/admin/os" />} />
            <Route path="/admin/posters" element={<AdminPostersPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />

          </Routes>
        </BrandLayout>
      </Router>
  );
}
