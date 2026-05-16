# Frontend Deep-Tree Audit Report

**Auditor**: Senior Frontend Architect & Performance Auditor  
**Date**: 2026-04-08  
**Scope**: `/frontend/rideratlas/src/` — Full compliance audit  

---

## Executive Summary

| Category | Status | Critical | High | Medium | Low |
|----------|--------|----------|------|--------|-----|
| 1. Navigation & Routing | **FAIL** | 0 | 9 | 2 | 0 |
| 2. Data Safety & 3-State | **FAIL** | 9 | 7 | 4 | 0 |
| 3. UI & Accessibility | **PARTIAL** | 0 | 3 | 8 | 0 |
| 4. Geospatial Data Sync | **FAIL** | 5 | 1 | 2 | 0 |
| **TOTALS** | | **14** | **20** | **16** | **0** |

**Overall Verdict: FAIL — 14 critical issues block release readiness.**

---

## 1. NAVIGATION & ROUTING INTEGRITY

### Status: FAIL

### 1.1 Hardcoded Paths Without Brand Context (HIGH)

| # | File | Line | Violation | Fix |
|---|------|------|-----------|-----|
| N-1 | [features/rentals/components/SalesSharkChatWidget.jsx](src/features/rentals/components/SalesSharkChatWidget.jsx#L544) | 544 | `<Link to="/airport">` — bare path | Wrap with `withBrandContext("/airport", location.search)` |
| N-2 | [components/RouteDiscoverySection.jsx](src/components/RouteDiscoverySection.jsx#L619) | 619 | `<Link to="/moto-airlift">` — bare path | Use `withBrandContext("/moto-airlift", location.search)` |
| N-3 | [components/RouteDiscoverySection.jsx](src/components/RouteDiscoverySection.jsx#L801) | 801 | `to="/routes"` — fallback path | Use `withBrandContext("/routes", location.search)` |
| N-4 | [components/TheAviationHero.jsx](src/components/TheAviationHero.jsx#L41) | 41 | `to="/moto-airlift"` — bare path | Wrap with `withBrandContext()` |
| N-5 | [components/layout/HeaderJetMyMoto.jsx](src/components/layout/HeaderJetMyMoto.jsx#L118) | 118 | `to="/jetmymoto"` — mobile menu | Wrap with `withBrandContext()` |
| N-6 | [components/layout/HeaderJetMyMoto.jsx](src/components/layout/HeaderJetMyMoto.jsx#L155) | 155 | `to="/jetmymoto"` — mobile menu | Wrap with `withBrandContext()` |
| N-7 | [components/layout/FooterJetMyMoto.jsx](src/components/layout/FooterJetMyMoto.jsx#L91) | 91 | Hardcoded `/airport/continent/europe` | Use `getCanonicalAirportContinentPath("europe")` |
| N-8 | [components/layout/FooterJetMyMoto.jsx](src/components/layout/FooterJetMyMoto.jsx#L96) | 96 | Hardcoded `/airport/continent/north-america` | Use `getCanonicalAirportContinentPath("north-america")` |
| N-9 | [components/RouteDiscoverySection.jsx](src/components/RouteDiscoverySection.jsx#L379) | 379 | `ctaHref` built without `withBrandContext()` | Wrap computed href in `withBrandContext()` |

### 1.2 `useNavigate()` Without Brand Context (HIGH)

| # | File | Line | Violation | Fix |
|---|------|------|-----------|-----|
| N-10 | [components/ui/BookingSuccess.jsx](src/components/ui/BookingSuccess.jsx#L75) | 75 | `` navigate(`/pool/${poolId}`) `` | `navigate(withBrandContext(`/pool/${poolId}`, location.search))` |
| N-11 | [pages/MissionPlannerPage.jsx](src/pages/MissionPlannerPage.jsx#L55) | 55 | `` navigate(`/plan/${ref.id}`) `` | `navigate(withBrandContext(`/plan/${ref.id}`, location.search))` |

### 1.3 Placeholder Links (MEDIUM)

| # | File | Lines | Note |
|---|------|-------|------|
| N-12 | [components/seo/PatriotPseoTemplate.jsx](src/components/seo/PatriotPseoTemplate.jsx#L71) | 71-74, 260-261 | Six `<Link to="#">` placeholder links — replace with real targets or remove |

### 1.4 Compliant Patterns (24 links verified)

Footer, Header navigation menus, luxury components (`CuratedFleet`, `RouteStrip`, `RoutesFromHere`, `DestinationsFromHere`, `CinematicCTA`), network components (`RoutesGrid`, `RegionsGrid`, `CountryAirportGrid`), and page components (`NotFound`, `RideRoutePage`, `HangarPage`, `MissionDetailsPage`, `PlanSummaryPage`) all correctly use `withBrandContext()` or `getCanonicalPaths()`.

---

## 2. DATA SAFETY & "3-STATE" GUARD AUDIT

### Status: FAIL

### 2.1 Missing Optional Chaining — Crash Paths (CRITICAL)

| # | File | Line | Unsafe Access | Fix |
|---|------|------|---------------|-----|
| D-1 | [features/airport/sections/AirportControlPanel.jsx](src/features/airport/sections/AirportControlPanel.jsx#L12) | 12 | `GRAPH.routes[r]` | `GRAPH.routes?.[r]` |
| D-2 | [components/home/DeploymentGrid.jsx](src/components/home/DeploymentGrid.jsx#L83) | 83 | `GRAPH.missionsByInsertion[code].length` (line 81 is safe, 83 is not) | `GRAPH.missionsByInsertion?.[code]?.length` |
| D-3 | [pages/GlobalTower.jsx](src/pages/GlobalTower.jsx#L263) | 263 | `GRAPH.airports[code]` | `GRAPH.airports?.[code]` |
| D-4 | [pages/GlobalTower.jsx](src/pages/GlobalTower.jsx#L271) | 271 | `GRAPH.clusters[id]` | `GRAPH.clusters?.[id]` |
| D-5 | [pages/AirportsCountryPage.jsx](src/pages/AirportsCountryPage.jsx#L60) | 60 | `GRAPH.airports[code]` | `GRAPH.airports?.[code]` |
| D-6 | [pages/AirportsCountryPage.jsx](src/pages/AirportsCountryPage.jsx#L84) | 84 | `GRAPH.routes[s]` | `GRAPH.routes?.[s]` |
| D-7 | [core/network/graphHealthCheck.js](src/core/network/graphHealthCheck.js#L22) | 22 | `graph.airports[code]` | `graph.airports?.[code]` |
| D-8 | [core/network/graphHealthCheck.js](src/core/network/graphHealthCheck.js#L29) | 29 | `graph.routesByAirport[code]` | `graph.routesByAirport?.[code]` |
| D-9 | [core/network/graphHealthCheck.js](src/core/network/graphHealthCheck.js#L39) | 39 | `graph.destinations[slug]` | `graph.destinations?.[slug]` |

### 2.2 Missing 3-State Handling (HIGH)

| # | File | Missing State | Impact |
|---|------|---------------|--------|
| D-10 | [pages/routes/RideRoutePage.jsx](src/pages/routes/RideRoutePage.jsx) | LOADING — no skeleton while premium JSON fetches | Blank flash on route pages |
| D-11 | [pages/destination/RideDestinationPage.jsx](src/pages/destination/RideDestinationPage.jsx) | LOADING — no skeleton while premium JSON fetches | Blank flash on destination pages |
| D-12 | [pages/a2a/A2AMissionPage.jsx](src/pages/a2a/A2AMissionPage.jsx#L277) | LOADING — no skeleton during rental shard load | Content pops in without transition |
| D-13 | [pages/OneWayRentalsPage.jsx](src/pages/OneWayRentalsPage.jsx) | EMPTY — no "No corridors found" message | Silent blank when inventory empty |
| D-14 | [pages/GlobalTower.jsx](src/pages/GlobalTower.jsx#L230) | LOADING — text-only "Loading..." with no skeleton | Layout shift when data arrives |
| D-15 | [components/network/RoutesGrid.jsx](src/components/network/RoutesGrid.jsx#L8) | EMPTY — `return null` when no routes | Should show "No routes available" |

### 2.3 Silent Fetch Failures (MEDIUM)

| # | File | Line | Issue |
|---|------|------|-------|
| D-16 | [pages/AirportPage.jsx](src/pages/AirportPage.jsx#L26) | 26-31 | `.catch(console.error)` — no user-facing error UI |
| D-17 | [pages/routes/RideRoutePage.jsx](src/pages/routes/RideRoutePage.jsx#L99) | 99-103 | `.catch(console.error)` — no user-facing error UI |
| D-18 | [pages/destination/RideDestinationPage.jsx](src/pages/destination/RideDestinationPage.jsx#L70) | 70-74 | `.catch(console.error)` — no user-facing error UI |

### 2.4 Inline Heavy Computation (MEDIUM)

| # | File | Line | Issue |
|---|------|------|-------|
| D-19 | [pages/OneWayRentalsPage.jsx](src/pages/OneWayRentalsPage.jsx#L58) | 58+ | Nested loop doing price aggregation inline — extract to memoized utility |

### 2.5 Compliant Patterns

- **RentalGrid.jsx** — Proper empty state when `!isShardLoading && totalMachines === 0`
- **PoiPage.jsx** — Skeleton loading via `<PoiSkeleton />`
- **AirportTemplate.jsx** — `<RentalGridLoadingSkeleton />` during fleet loading

---

## 3. TACTICAL UI & ACCESSIBILITY COMPLIANCE

### Status: PARTIAL PASS

### 3.1 Pure Black (#000000) Violations (HIGH)

| # | File | Line | Violation | Fix |
|---|------|------|-----------|-----|
| U-1 | [pages/GlobalTower.jsx](src/pages/GlobalTower.jsx#L393) | 393 | `border-black` class | Replace with `border-[#050505]` |
| U-2 | [features/a2a/components/MissionCinematicVideo.jsx](src/features/a2a/components/MissionCinematicVideo.jsx#L82) | 82 | `bg-black` class | Replace with `bg-[#050505]` |
| U-3 | [features/a2a/components/MissionCinematicVideo.jsx](src/features/a2a/components/MissionCinematicVideo.jsx#L102) | 102 | `bg-black/60` class | Replace with `bg-[#050505]/60` |

> **Note:** `text-black` on amber/gold buttons (CTA surfaces) is COMPLIANT — used only on light-colored backgrounds for contrast.

### 3.2 Layout Shift — Images Missing Width/Height Attributes (MEDIUM)

| # | File | Line | Element | Mitigated By |
|---|------|------|---------|--------------|
| U-4 | [components/luxury/CinematicHero.jsx](src/components/luxury/CinematicHero.jsx#L15) | 15 | `<motion.img>` | Container has `aspect-[21/9]` or `h-screen` |
| U-5 | [components/luxury/AirportHero.jsx](src/components/luxury/AirportHero.jsx#L15) | 15 | `<motion.img>` | Container has `h-[85vh]` |
| U-6 | [components/luxury/VisualStrip.jsx](src/components/luxury/VisualStrip.jsx#L12) | 12-14 | `<img>` | Container has `aspect-[4/5]` |
| U-7 | [components/luxury/RoutesFromHere.jsx](src/components/luxury/RoutesFromHere.jsx#L30) | 30-33 | `<img>` | Container has `aspect-[16/9]` |
| U-8 | [components/FinalCTA.jsx](src/components/FinalCTA.jsx#L13) | 13 | `<img>` | No explicit containment |
| U-9 | [components/luxury/CuratedFleet.jsx](src/components/luxury/CuratedFleet.jsx#L50) | 50-54 | `<img>` | Container has `aspect-[4/3]` |

### 3.3 Layout Shift — Videos Missing Width/Height Attributes (MEDIUM)

| # | File | Line | Element | Mitigated By |
|---|------|------|---------|--------------|
| U-10 | [components/MissionCard.jsx](src/components/MissionCard.jsx#L34) | 34-42 | `<video>` | Container CSS sizing |
| U-11 | [components/oneway/OneWayHero.jsx](src/components/oneway/OneWayHero.jsx#L31) | 31-37 | `<video>` | Container has `min-h-[92vh]` |

> **Assessment**: Most images/videos are contained within aspect-ratio or fixed-height parents. The risk is LOW for most except U-8 (`FinalCTA.jsx`) which lacks explicit containment.

### 3.4 Tabular Numbers — PASS

All price and distance metrics correctly use `tabular-nums`:
- `RentalCard.jsx` (4 instances), `PriceGapBadge.jsx`, `OperatorSelector.jsx`, `TheTelemetryLedger.jsx` (4 instances), `OneWayBottomCTA.jsx`, `OneWayHero.jsx`, `DecisionFork.jsx` (2 instances), `CorridorCard.jsx` (2 instances).
- Centralized token: `brand/tokens.js` line 69 — `TABULAR: "tabular-nums"`.

### 3.5 Hero Dimensions — PASS

All hero sections have explicit sizing:
- `CinematicHero.jsx` — `h-screen min-h-[700px]` or `aspect-[21/9] min-h-[500px]`
- `AirportHero.jsx` — `h-[85vh] min-h-[600px]`
- `JetHero.jsx` — `h-screen min-h-[700px]`
- `JetMyMotoHero.jsx` — `min-h-[92vh]`
- `OneWayHero.jsx` — `min-h-[92vh]`

### 3.6 Design System Compliance — PASS

`tailwind.config.mjs` correctly defines:
- `jet.dark: "#050505"` (no pure black)
- `index.css` CSS variable: `--deep-black: #050505`
- Typography: Inter (sans), Fraunces (serif/headline), JetBrains Mono (mono)

---

## 4. GEOSPATIAL DATA SYNC

### Status: FAIL

### 4.1 Telemetry Parity Failures (CRITICAL)

| # | Issue | Impact |
|---|-------|--------|
| G-1 | **Frontend/Backend coordinate source split** — Frontend uses `airportCoords.js` (strings); Backend uses `airportCoords.json` (numeric) + `EXTRA_AIRPORT_COORDS` hardcoded overrides | Map markers and Hero video markers may render at different locations |
| G-2 | **8 airports exist only in backend overrides** — BEG, BGO, DBV, SFO, SLC, TIA, YQB, YUL have coordinates in `functions/src/video/fetchMissionBySlug.js` but NOT in `src/features/airport/data/airportCoords.js` | Frontend map shows these 8 airports at wrong/fallback positions |
| G-3 | **`airportIndex.js` has NO coordinate fields** — Airport objects lack `lat`/`lng`; coordinates require a separate `AIRPORT_COORDS` lookup | Fragile indirection causes silent failures in any component assuming `airport.lat` exists |
| G-4 | **SEO schema emits null coordinates** — `generateAirportSchema.js:28-29` reads `airport.lat` / `airport.lng` which are always undefined | All airport pages have broken GeoCoordinates in structured data |
| G-5 | **Inconsistent fallback coordinates** — `AirportHero.jsx` falls back to `[45.63, 8.72]` (Milan Malpensa) while `PlannerMap.jsx` falls back to `[11.39, 47.27]` (Innsbruck area) — ~400km apart | Any airport with missing coordinates renders at an unpredictable fallback location |

### 4.2 Coordinate Format Inconsistency (HIGH)

| Source | Format | Example |
|--------|--------|---------|
| `airportCoords.js` (frontend) | String `{ lat: "45.63", long: "8.73" }` | Requires `Number()` conversion |
| `a2aMissions.js` (frontend) | GeoJSON `[lng, lat]` | Note the reversed order |
| `fetchMissionBySlug.js` (backend) | Numeric `{ lat: 44.81, lng: 20.31 }` | Direct numeric |
| `generateAirportSchema.js` (SEO) | Expects `airport.lat` / `airport.lng` | Always undefined |

### 4.3 Map Component Audit

| Component | Source | Status |
|-----------|--------|--------|
| `PlannerMap.jsx` | Firebase POIs + Mapbox Directions API | OK — live API data |
| `DeploymentGrid.jsx` | `AIRPORT_COORDS[code]` fallback chain | WARN — falls back to `"--"` string |
| `GlobalTower.jsx` | `AIRPORT_COORDS[code]` fallback chain | WARN — same pattern |
| `AirportHero.jsx` | `airport.latitude` with Milan fallback | FAIL — always hits fallback |

---

## 5. REMEDIATION PROMPTS

Each prompt below is a self-contained instruction for a junior agent.

---

### RP-1: Fix All Hardcoded Navigation Paths

**Priority**: HIGH  
**Files**: `SalesSharkChatWidget.jsx`, `RouteDiscoverySection.jsx`, `TheAviationHero.jsx`, `HeaderJetMyMoto.jsx`, `FooterJetMyMoto.jsx`  

```
TASK: Add withBrandContext() to all hardcoded <Link to="..."> paths.

1. In each file, add this import if missing:
   import { withBrandContext } from "../../utils/navigationTargets";
   
2. Get location:
   const location = useLocation();   // from react-router-dom
   
3. Replace every bare `to="/path"` with:
   to={withBrandContext("/path", location.search)}

4. For FooterJetMyMoto.jsx continent paths, also use:
   import { getCanonicalAirportContinentPath } from "../../utils/navigationTargets";
   Replace "/airport/continent/europe" → getCanonicalAirportContinentPath("europe")

Affected lines:
- SalesSharkChatWidget.jsx:544
- RouteDiscoverySection.jsx:379, 619, 801
- TheAviationHero.jsx:41
- HeaderJetMyMoto.jsx:118, 155
- FooterJetMyMoto.jsx:91, 96
```

---

### RP-2: Fix useNavigate Brand Context Leaks

**Priority**: HIGH  
**Files**: `BookingSuccess.jsx`, `MissionPlannerPage.jsx`  

```
TASK: Wrap navigate() calls with withBrandContext().

BookingSuccess.jsx:75
  BEFORE: navigate(`/pool/${poolId}`);
  AFTER:  navigate(withBrandContext(`/pool/${poolId}`, location.search));

MissionPlannerPage.jsx:55
  BEFORE: navigate(`/plan/${ref.id}`);
  AFTER:  navigate(withBrandContext(`/plan/${ref.id}`, location.search));

Add imports: import { withBrandContext } from "../utils/navigationTargets";
Add hook:   const location = useLocation();
```

---

### RP-3: Add Optional Chaining to All GRAPH Lookups

**Priority**: CRITICAL  
**Files**: `AirportControlPanel.jsx`, `DeploymentGrid.jsx`, `GlobalTower.jsx`, `AirportsCountryPage.jsx`, `graphHealthCheck.js`  

```
TASK: Add ?. to every GRAPH bracket access.

Find-and-replace patterns:
  GRAPH.routes[    → GRAPH.routes?.[
  GRAPH.airports[  → GRAPH.airports?.[
  GRAPH.clusters[  → GRAPH.clusters?.[
  GRAPH.destinations[ → GRAPH.destinations?.[
  GRAPH.routesByAirport[ → GRAPH.routesByAirport?.[
  GRAPH.missionsByInsertion[ → GRAPH.missionsByInsertion?.[
  graph.airports[  → graph.airports?.[
  graph.routesByAirport[ → graph.routesByAirport?.[
  graph.destinations[ → graph.destinations?.[

Verify each file compiles and the .filter(Boolean) pattern still works after change.
```

---

### RP-4: Add Loading Skeletons to Data-Dependent Pages

**Priority**: HIGH  
**Files**: `RideRoutePage.jsx`, `RideDestinationPage.jsx`, `A2AMissionPage.jsx`, `GlobalTower.jsx`  

```
TASK: Each page that fetches premium JSON must show a skeleton during load.

Pattern to apply:
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    fetch(url).then(r => r.json())
      .then(data => { setPremium(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [slug]);

  if (loading) return <PageSkeleton />;

Create a shared <PageSkeleton /> in components/ui/ with pulse animation
matching the jet-dark (#050505) background.

For GlobalTower.jsx:230, replace the text "Loading..." with <PageSkeleton />.
```

---

### RP-5: Add Empty State Messages

**Priority**: HIGH  
**Files**: `RoutesGrid.jsx`, `OneWayRentalsPage.jsx`  

```
TASK: Replace silent null returns with graceful empty states.

RoutesGrid.jsx:8
  BEFORE: if (!routes.length) return null;
  AFTER:  if (!routes.length) return (
    <div className="text-center py-16 text-zinc-500">
      No verified routes found for this region.
    </div>
  );

OneWayRentalsPage.jsx — when inventoryAvailable === false:
  Add: <div className="text-center py-16 text-zinc-500">
    No one-way corridors currently available. Check back soon.
  </div>
```

---

### RP-6: Fix Pure Black Color Violations

**Priority**: HIGH  
**Files**: `GlobalTower.jsx`, `MissionCinematicVideo.jsx`  

```
TASK: Replace all pure black Tailwind classes with jet-dark.

GlobalTower.jsx:393
  BEFORE: border-black
  AFTER:  border-[#050505]

MissionCinematicVideo.jsx:82
  BEFORE: bg-black
  AFTER:  bg-[#050505]

MissionCinematicVideo.jsx:102
  BEFORE: bg-black/60
  AFTER:  bg-[#050505]/60
```

---

### RP-7: Unify Coordinate Sources

**Priority**: CRITICAL  
**Files**: `airportCoords.js`, `airportIndex.js`, `generateAirportSchema.js`, `AirportHero.jsx`, `PlannerMap.jsx`  

```
TASK: Create a single source of truth for airport coordinates.

1. Merge EXTRA_AIRPORT_COORDS from functions/src/video/fetchMissionBySlug.js 
   into src/features/airport/data/airportCoords.js (add BEG, BGO, DBV, SFO, SLC, TIA, YQB, YUL).

2. Convert all string coordinates in airportCoords.js to numeric:
   BEFORE: MXP: { lat: "45.63", long: "8.73" }
   AFTER:  MXP: { lat: 45.63, lng: 8.73 }
   (Also normalize "long" → "lng" for consistency with backend)

3. Fix generateAirportSchema.js:28-29:
   import { AIRPORT_COORDS } from "../data/airportCoords";
   const coords = AIRPORT_COORDS[airport.code];
   latitude: coords?.lat || null,
   longitude: coords?.lng || null,

4. Fix AirportHero.jsx:8-9 — remove hardcoded Milan fallback:
   const coords = AIRPORT_COORDS[airport.code];
   const lat = coords?.lat ?? null;
   const lon = coords?.lng ?? null;
   // If null, hide the coordinate display instead of showing wrong location

5. Fix PlannerMap.jsx:161 — use a meaningful global center or user's location:
   center: [12.4964, 41.9028]  // Rome as geographic center of coverage area
```

---

### RP-8: Add Width/Height to Images and Videos

**Priority**: MEDIUM  
**Files**: `CinematicHero.jsx`, `AirportHero.jsx`, `VisualStrip.jsx`, `RoutesFromHere.jsx`, `FinalCTA.jsx`, `CuratedFleet.jsx`, `MissionCard.jsx`, `OneWayHero.jsx`  

```
TASK: Add width and height attributes to all <img> and <video> tags.

Even when CSS controls sizing, explicit attributes prevent CLS before CSS loads.

Pattern for images in aspect-ratio containers:
  <img src={url} alt={alt} width={800} height={600} className="w-full h-full object-cover" />

Pattern for full-bleed heroes:
  <img src={url} alt={alt} width={1920} height={1080} className="w-full h-full object-cover" />

Pattern for videos:
  <video width={1920} height={1080} ...props />
```

---

## Appendix: Files Audited

```
src/App.jsx
src/utils/navigationTargets.js
src/utils/siteConfig.js
src/layouts/BrandLayout.jsx
src/components/layout/HeaderJetMyMoto.jsx
src/components/layout/FooterJetMyMoto.jsx
src/components/RouteDiscoverySection.jsx
src/components/TheAviationHero.jsx
src/components/ui/BookingSuccess.jsx
src/components/home/DeploymentGrid.jsx
src/components/network/RoutesGrid.jsx
src/components/luxury/CinematicHero.jsx
src/components/luxury/AirportHero.jsx
src/components/luxury/CuratedFleet.jsx
src/components/luxury/RouteStrip.jsx
src/components/luxury/RoutesFromHere.jsx
src/components/luxury/DestinationsFromHere.jsx
src/components/luxury/VisualStrip.jsx
src/components/luxury/CinematicCTA.jsx
src/components/MissionCard.jsx
src/components/FinalCTA.jsx
src/components/oneway/OneWayHero.jsx
src/components/seo/PatriotPseoTemplate.jsx
src/components/intelligence/LivePoolsPanel.jsx
src/core/network/networkGraph.js
src/core/network/graphShards.contract.js
src/core/network/graphHealthCheck.js
src/features/airport/AirportTemplate.jsx
src/features/airport/sections/AirportControlPanel.jsx
src/features/airport/sections/ArrivalOS.jsx
src/features/airport/network/airportIndex.js
src/features/airport/data/airportCoords.js
src/features/airport/seo/generateAirportSchema.js
src/features/rentals/components/RentalGrid.jsx
src/features/rentals/components/RentalCard.jsx
src/features/rentals/components/SalesSharkChatWidget.jsx
src/features/rentals/components/OperatorSelector.jsx
src/features/rentals/components/PriceGapBadge.jsx
src/features/a2a/components/MissionCinematicVideo.jsx
src/features/network/geoDistance.js
src/features/routes/data/a2aMissions.js
src/pages/AirportPage.jsx
src/pages/AirportsCountryPage.jsx
src/pages/GlobalTower.jsx
src/pages/OneWayRentalsPage.jsx
src/pages/MissionPlannerPage.jsx
src/pages/NotFound.jsx
src/pages/HangarPage.jsx
src/pages/MissionDetailsPage.jsx
src/pages/PlanSummaryPage.jsx
src/pages/routes/RideRoutePage.jsx
src/pages/destination/RideDestinationPage.jsx
src/pages/a2a/A2AMissionPage.jsx
src/pages/poi/PoiPage.jsx
src/brand/tokens.js
src/index.css
tailwind.config.mjs
```

---

*End of audit report. Generated by deep-tree scan of `/frontend/rideratlas/src/`.*
