# RiderAtlas Frontend Architecture Map

## 1. High-Level Overview

The RiderAtlas frontend is a modern, data-driven web application built with React and Vite. It serves as a logistics and adventure routing system for motorcycle enthusiasts, providing a rich user experience for exploring and planning trips. The platform is designed to be dynamic, with pages and content generated from a set of core data sources.

This document reflects the current SPA shell, canonical route contract, and the JetMyMoto dual-engine rental/logistics UX now active in the frontend.

## 2. Technology Stack

- **Framework:** React
- **Build Tool:** Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS, PostCSS
- **Linting:** ESLint (configuration not present, but likely used)
- **Package Manager:** npm

## 3. Project Structure

The project follows a standard React application structure, with some notable conventions:

- **`src/`**: Contains the main application source code.
- **`src/components/`**: Contains reusable UI components.
- **`src/pages/`**: Contains the top-level page components, which are mapped to routes.
- **`src/features/`**: Contains domain-specific logic, data, and components. This is a key architectural pattern in this project.
- **`src/layouts/`**: Contains layout components that define the overall structure of the pages.
- **`src/lib/` and `src/utils/`**: Contain utility functions and libraries.
- **`scripts/`**: Contains various scripts for data generation, SEO, and other tasks.
- **`public/`**: Contains static assets like images, videos, and the sitemap.
- **`data/`**: Contains raw data files, such as CSVs.

## 4. Data Flow & State Management

The application's data flow is primarily one-way, from data sources to UI components.

**Data Sources:**

- **`src/features/airport/network/airportIndex.js`**: A static index of all airports, containing basic information like code, city, country, and slug.
- **`src/features/routes/data/rideDestinations.js`**: A list of all ride destinations, with details like name, slug, and countries.
- **`src/features/routes/data/generatedRideRoutes.js`**: A large, auto-generated file containing all possible routes between airports and destinations.
- **`src/features/airport/data/staticAirports.js`**: Contains "rich" airport data, including control panel links, recovery options, and other details. This data is merged with the basic airport info from `airportIndex.js`.

**Data Pipeline:**

1.  **Route Generation:** The `scripts/generateRideRoutes.mjs` script combines data from `airportIndex.js` and `rideDestinations.js` to create the `generatedRideRoutes.js` file.
2.  **Route Clustering:** The `src/features/routes/clusterRoutes.js` file contains logic to group routes by airport, creating "adventure networks".
3.  **Route Feeds:** The `src/features/routes/routeFeeds.js` file provides functions to access and filter the route data, with built-in performance limitations.

**State Management:**

- **Local Component State:** Most components manage their own state using React hooks (`useState`, `useEffect`, etc.).
- **URL State:** The application relies heavily on the URL to manage state, with parameters like `:slug`, `:continent`, and `:country` used to fetch and display the correct data.
- **Query State for UX Handoffs:** The app now uses query params for cross-surface UX context, especially for brand context and dual-engine handoff. Examples:
  - `?ctx=jet` for brand context.
  - `?mode=rent` on airport pages to open the Rentals engine directly.
  - `?intent=rent&airport=...&rental=...` on `/moto-airlift` to carry showroom machine context into the existing intake form.
- **React Context:** `AuthContext.jsx` is present, suggesting that React Context is used for managing authentication state.

### Graph-First Frontend Rule

Frontend route and rental surfaces are expected to resolve entities through graph indexes, not broad array scans. Current UI reads primarily from:

- `GRAPH.routes`
- `GRAPH.routesByAirport`
- `GRAPH.routesByDestination`
- `GRAPH.rentals`
- `GRAPH.rentalsByAirport`
- `GRAPH.rentalsByDestination`
- `GRAPH.pois`
- `GRAPH.poisByDestination`

### Graph Shard Contract

- `src/core/network/graphShards.contract.js` is the canonical shard contract for RiderAtlas.
- The public shard runtime surface remains `loadGraphShard(name)`, `readGraphShard(name)`, and `getGraphShardStatus(name)`.
- The contract file defines shard names and loading modes separately; the currently registered runtime shards are exposed through `GRAPH.shardMeta.available` and `GRAPH.shardMeta.contract.registered`.
- Managed shard lifecycle states are `idle`, `loading`, `loaded`, and `error`.
- `getGraphShardStatus(name)` returns `missing` for unregistered shard names.
- `poiDetails` is the reference shard implementation while the broader migration is still additive.
- Overlay shard payloads must preserve the invariant that overlay pages can render above the fold without requiring additional shard loads.

#### AdminMediaManager v2.0 update

- `src/pages/admin/AdminMediaManager.jsx` now ingests a combined graph data set (rentals, airports, routes, destinations) using singular `type` values (`Rental`, `Airport`, `Route`, `Destination`).
- Tab filtering now maps plural tab values (`Rentals`, `Airports`, `Routes`, `Destinations`) to singular `type` values before filtering so record counts work correctly and each tab shows the expected subset.
- Export payload now groups by type with `rentals`, `airports`, `routes`, and `destinations` keys.

### Airport hero patch note

For agents updating raw graph source data (`src/features/airport/network/airportIndex.js` compiled into `buildNetworkGraph.js`), inject `hero` directly into the airport object. Example schema for a single airport:

```js
hero: {
  videoUrl: "https://firebasestorage.googleapis.com/.../your-airport-video.mp4?alt=media",
  posterUrl: "https://firebasestorage.googleapis.com/.../your-fallback-image.jpg?alt=media",
}
```

Once persisted, `AirportTemplate.jsx` will pull unique `hero.videoUrl` by airport code and render a per-hub local video background without affecting other hubs.

## 5. Routing & Page Generation

Routing is handled by `react-router-dom` in `src/App.jsx`. The routes are designed to be dynamic, with pages generated based on URL parameters. The root route (`/`) dynamically switches between brand-specific homepages based on the detected site context.

**Key Routes:**

- `/`: Root route, serving either `RiderAtlasHomepage` or `JetMyMotoHomepage`.
- `/airports`: The global tower, showing all continents.
- `/airports/:continent`: A page for a specific continent, showing countries and airports.
- `/airports/country/:country`: A page for a specific country, showing airports in that country.
- `/airport/:code`: The airport hub / "Arrival OS" page for a specific airport.
- `/route/:slug`: A page for a specific ride route.
- `/destination/:slug`: A destination intelligence page.
- `/poi/:slug`: A POI detail page.
- `/moto-airlift`: The logistics and rental intake page.
- `/hangar`: The retention/member experience.
- `/mission/:id`: Mission detail page.
- `/deploy/:missionId`: Mission planner.
- `/plan/:planId`: Plan summary page.
- `/pool/:poolId`: Pool detail page.
- `/admin/os/*`: Admin operating system.

### Canonical Route Contract

The frontend now treats these as the canonical public route shapes:

- `/airport/:code`
- `/route/:slug`
- `/destination/:slug`

Internal navigation should use `Link` and resolve into these canonical surfaces rather than dead top-level placeholders such as `/routes`, `/destinations`, or `/rentals`.

## 6. Global Layout Shell

The platform now uses a persistent global shell through `src/layouts/BrandLayout.jsx`.

### Responsibilities

- Render `HeaderJetMyMoto` exactly once at the top of the app.
- Render `FooterJetMyMoto` exactly once at the bottom of the app.
- Wrap routed page content in a `main` container with a fixed-header offset.
- Resolve brand identity dynamically at runtime instead of hardcoding a single logo.

### Current Wrapper Shape

```jsx
<div className="min-h-screen flex flex-col">
  <HeaderJetMyMoto />
  <main className="flex-1 pt-20">{children}</main>
  <FooterJetMyMoto />
</div>
```

### Why This Matters

- Prevents double header/footer rendering.
- Keeps the fixed `HeaderJetMyMoto` from covering page content.
- Preserves SPA integrity by centralizing shell behavior outside route transitions.

### Dynamic Header Brand Identity

`HeaderJetMyMoto.jsx` is now the shared global header for both skins. It does **not** hardcode a single brand anymore.

- It derives brand state from runtime site context and SPA route context.
- It renders:
  - `JETMYMOTO` when the resolved shell context is JetMyMoto
  - `RIDERATLAS` otherwise
- Typography, spacing, and amber accent treatment remain identical across both brands.

This allows one persistent shell component to visually switch brand identity without creating a second header component.

### Header Brand Logo Route

The shared brand logo in `HeaderJetMyMoto.jsx` now routes according to the active shell context instead of always linking to the root discovery homepage.

- The header derives `isJetMyMoto` from:
  - `site.id === "jmm"`
  - `location.pathname === "/jetmymoto"`
  - `ctx=jet` in the current query string
- The wrapping `Link` now resolves:
  - `/jetmymoto` when JetMyMoto context is active
  - `/` otherwise
- The inner `<h1>` and dynamic logo ternary remain unchanged, so the visual brand switch and spacing contract stay intact.

This prevents the JetMyMoto logo from incorrectly rendering or routing as RiderAtlas during local SPA navigation, including direct visits to `/jetmymoto`, while preserving the RiderAtlas root-home behavior.

### Header CTA Context Handoff

The dual-engine CTAs in `HeaderJetMyMoto.jsx` now actively inject brand context into the URL through React Router links.

- `Ship Machine` appends `ctx=jet`
- `Find a Bike` appends `ctx=ra`

Implementation rule:

- Existing query params must be preserved.
- Context is appended safely using a helper that checks whether `?` already exists.

Example:

- `/airport/mxp?mode=rent` + Rider CTA becomes `/airport/mxp?mode=rent&ctx=ra`
- `/moto-airlift` + Logistics CTA becomes `/moto-airlift?ctx=jet`

This creates an intentional UX handoff:

- Logistics CTA forces JetMyMoto skin
- Rentals CTA forces RiderAtlas skin

The change is SPA-safe because it is implemented with `Link`, not hard reloads.

### Shell Layering Contract

The global shell header is not only fixed, it is also the highest persistent UI layer for normal page rendering.

- `HeaderJetMyMoto` currently uses a shell-level z-index (`z-[120]`).
- Routed content is offset with `pt-20`.
- Any page-level sticky or fixed top rail must render **below** the shell header.
- Top-fixed or top-sticky in-page rails should generally use:
  - `top-20`
  - a z-index lower than the global header

This rule exists because airport, booking, and intelligence pages contain local action rails and sticky subnavs that can otherwise visually cover the shell header.

### Known Top-Rail Surfaces

When debugging header visibility or overlap issues, check these files first:

- `src/features/airport/sections/ArrivalOS.jsx`
- `src/features/airport/MotoAirliftBooking.jsx`
- `src/pages/GlobalTower.jsx`
- `src/pages/HangarPage.jsx`
- `src/pages/AirliftPage.jsx`

## 7. Dual-Engine UX

JetMyMoto now operates a clear dual-engine airport UX:

- **Logistics Engine:** "Bring Your Bike"
- **Rentals Engine:** "Rent A Bike"

### Airport Entry Behavior

- `AirportPage.jsx` resolves `/airport/:code`.
- `?mode=rent` opens the airport directly into the Rentals engine.
- `AirportTemplate.jsx` owns the engine toggle and renders either:
  - `MotoAirliftBookingForm` and logistics support surfaces, or
  - `RentalGrid` and the rental showroom.

This keeps both engines inside one airport hub route while preserving a single SPA shell.

## 8. Component Architecture

The application uses a component-based architecture, with a clear separation of concerns between components, pages, and features.

- **Smart and Dumb Components:** The project seems to follow the smart/dumb component pattern, with page components (`src/pages/`) responsible for fetching data and handling logic, and UI components (`src/components/`) responsible for rendering the UI.
- **Feature-Based Structure:** The `src/features/` directory is a good example of a feature-based structure, where all the code related to a specific feature (e.g., airports, routes) is co-located.
- **Orphan Components:** The analysis revealed a large number of orphan components, suggesting a need for code cleanup.

### Rental Showroom Components

The rental showroom now lives under `src/features/rentals/components/`:

- `RentalGrid.jsx`
  - Stateless with respect to network I/O.
  - Accepts `airportCode`.
  - Reads `GRAPH.rentalsByAirport[airportCode]`.
  - Resolves full rental objects from `GRAPH.rentals`.
  - Applies local filter and sort state for Brand, Type, and Price.
- `RentalCard.jsx`
  - Premium cinematic bike card.
  - Supports `videoUrl` with poster/image fallback.
  - Renders machine metadata, destination tags, and intake CTA.
  - Routes into the existing `/moto-airlift#booking` intake surface with rental context in the query string.

### Rental Video Asset Contract

The live hover-video source for showroom cards is stored in the rental graph data, not hardcoded inside the card component.

- Source file: `src/features/rentals/data/rentals.js`
- Contract: append `videoUrl` directly on the individual rental object passed into `rental({...})`
- Consumer: `RentalCard.jsx` reads `videoUrl` from the resolved rental object and auto-plays the video on hover
- Fallback behavior: if `videoUrl` is absent, the card falls back to its existing non-video image/presentation path

### Current Video-Wired Rental Families

As of March 22, 2026, the following rental families are intentionally wired with live cinematic `videoUrl` values in `src/features/rentals/data/rentals.js`:

- BMW `R 1300 GS` variants, including `R 1300 GS`, `R 1300 GS Adventure`, `R1300 GS`, and `R1300 GSA`
- Harley-Davidson `Road Glide` variants, including `Road Glide` and `CVO Road Glide`
- Ducati `Multistrada` variants currently represented by `Multistrada V4`

### Rental Video Debugging Rule

When a hover video does not render in the showroom, debug in this order:

1. Confirm the rental resolves from `GRAPH.rentals` and is not only present in `GRAPH.rentalsByAirport` or `GRAPH.rentalsByDestination`.
2. Confirm the matching object in `src/features/rentals/data/rentals.js` contains a `videoUrl` field.
3. Confirm the `videoUrl` was appended without changing the surrounding object schema or the `rental(data)` helper shape.
4. Run `node --check src/features/rentals/data/rentals.js` after edits to catch comma or object syntax regressions.
5. If data is correct but video still does not appear, inspect `RentalCard.jsx` hover conditions and network/media loading in the browser.

## 9. Styling

- **Tailwind CSS:** The project uses Tailwind CSS for utility-first styling.
- **PostCSS:** PostCSS is used for processing the CSS, including autoprefixing.
- **CSS Modules:** Some components have their own `.css` files (e.g., `AchievementsBoard.css`), suggesting the use of CSS Modules for component-specific styles.

### Current Shell / Showroom Styling Conventions

- Avoid pure `#000000` for primary showroom/shell backgrounds.
- Prefer dark luxury neutrals such as `#050606`, `#121212`, and `#574C43`.
- Use amber/gold accents such as `#A76330` and `#CDA755` for tactical CTAs.
- Pricing and count surfaces should use `tabular-nums` where alignment matters.
- Sticky and fixed in-page rails must account for the global fixed header by offsetting below the shell.

### Layout Debugging Checklist

If a page appears to "lose" the header, use this order of checks:

1. Confirm the route is rendered inside `BrandLayout.jsx`.
2. Confirm `main` still includes the shell offset (`pt-20`).
3. Check whether the page introduces a local `fixed top-0` or `sticky top-0` rail.
4. Compare that rail's z-index to `HeaderJetMyMoto`.
5. Move local rails to `top-20` and keep their z-index below the shell header.
6. Rebuild and re-test the affected route, especially airport and booking flows.

## 10. Scripts & Build Process

- **Vite:** The project uses Vite for development and building.
- **npm Scripts:** The `package.json` file likely contains scripts for starting the development server, building the project, and running other tasks.
- **Custom Scripts:** The `scripts/` directory contains custom scripts for various tasks, including:
  - `generateRideRoutes.mjs`: Generates the main route data file.
  - `generateSitemap.mjs`: Generates the `sitemap.xml` file for SEO.
  - Various data import/export scripts.
- **Build Health:** The analysis identified some minor build health issues, such as inconsistencies in the use of ESM and CommonJS, and invalid imports in the sitemap script.

## 11. Brand Architecture & Multi-Skin Deployment

The platform implements a **"One SPA, Two Brand Skins"** architecture, allowing a single codebase to serve two distinct brands: **RiderAtlas** (focused on discovery and routing) and **JetMyMoto** (focused on logistics and rentals).

### Brand Switching Logic
- Brand detection happens at runtime via the `getSiteConfig` utility.
- The `App.jsx` router and `BrandLayout` component use this context to dynamically render the appropriate skin and components.
- The global header and footer also consume this same context, so shell identity changes immediately when `ctx` changes in the URL.

### File & Component Naming Convention
To prevent logic leakage and maintain strict architectural separation between brands, high-level entry points follow a strict naming convention:
- **RiderAtlas Entry Points:** `Rideratlashomepage.jsx` (Component: `RiderAtlasHomepage`)
- **JetMyMoto Entry Points:** `jetmymotohomepage.jsx` (Component: `JetMyMotoHomepage`)

This convention enforces brand isolation and prevents developers or AI agents from accidentally bleeding logic across the two distinct user experiences.

## 12. Recent Frontend Stabilization Changes

The following architectural changes have been applied in the current frontend state:

- Moved the universal header/footer responsibility into `BrandLayout.jsx`.
- Added global top padding in the layout shell so routed pages clear the fixed header.
- Removed the redundant local footer from `AirportTemplate.jsx`.
- Normalized sticky/fixed in-page rails to sit below the global header:
  - `GlobalTower.jsx`
  - `HangarPage.jsx`
  - `features/airport/sections/ArrivalOS.jsx`
- Corrected route usage and canonicalized internal navigation around:
  - `/airport/:code`
  - `/route/:slug`
  - `/destination/:slug`
- Added a graph-backed navigation-target helper for shared shell links and CTA fallbacks.
- Reworked route and destination pages to resolve route and POI data through graph indexes.
- Added the rental showroom and cinematic rental cards under the rentals feature.
- Added graph-backed live `videoUrl` assets for BMW R 1300 GS, Harley-Davidson Road Glide, and Ducati Multistrada rental families in `src/features/rentals/data/rentals.js`.
- Wired rental CTA handoff into the existing `/moto-airlift#booking` intake flow through query-state context instead of creating a separate booking pipeline.
- Fixed a header-layering regression where local airport/booking rails could visually cover the global shell header.
- Raised the shell header z-index and normalized page-level top rails below it.
- Added dynamic brand-logo switching inside the shared header using `getSiteConfig()`.
- Added CTA-driven brand-context handoff in the shared header:
  - logistics CTA injects `ctx=jet`
  - rentals CTA injects `ctx=ra`

### Frontend UI & Routing Debugging Fixes (March 2026)

Applied comprehensive debugging fixes to ensure perfect routing, CTA wiring, grid rendering, and accessibility compliance:

**Optional Chaining Guards (Phase 3):**
- Added safe optional chaining (`?.`) to all GRAPH data lookups to prevent "Cannot read property of undefined" errors
- Fixed unsafe lookups in:
  - `GlobalTower.jsx`: `GRAPH.airportsBySlug[slug]` → `GRAPH.airportsBySlug?.[slug]`
  - `RideRoutePage.jsx`: `GRAPH.rentals[rentalId]` → `GRAPH.rentals?.[rentalId]`
  - `AirportsCountryPage.jsx`: `GRAPH.routesByAirport[code]` & `GRAPH.routes[slug]` → added `?.` to both

**Color Accessibility Compliance (Phase 4):**
- Replaced all pure black (`#000000`) backgrounds with compliant deep gray (`#050505`) to prevent halation effect for users with astigmatism
- Updated components:
  - `Rideratlashomepage.jsx`: Hero section and all content sections
  - `jetmymotohomepage.jsx`: Dual deployment strategy section
  - `AirportTemplate.jsx`: Main container and footer
  - `MotoAirliftBookingForm.jsx`: Booking section
  - `AirportSections.jsx`: Recovery, Pivot, and CityExtension sections
  - `App.jsx`: Lazy loading fallback component
- All changes maintain WCAG AA contrast compliance with amber accent colors

**CTA & Routing Verification (Phase 1):**
- Confirmed all homepage CTAs route correctly via React Router `<Link>` components
- Verified dual-engine CTAs ("Ship My Bike" / "Find a Bike") use canonical paths
- Ensured header navigation and footer links preserve brand context (`?ctx=jet`)
- No SPA-breaking `<a href>` tags found in internal navigation

**Grid Component Rendering (Phase 2):**
- Verified `DeploymentGrid` and `RentalGrid` components properly consume GRAPH indexes
- Confirmed airport code normalization and empty state handling
- Validated `tabular-nums` font utility applied to data metrics for perfect alignment
- Ensured mode toggle (bring/rent) in `AirportTemplate` works correctly

**SPA Hydration & State Persistence (Phase 5):**
- Confirmed `BrandLayout` persists across navigation without re-mounting
- Verified query parameters (`?mode=rent`, `?ctx=jet`) preserved through route changes
- Ensured smooth page transitions with consistent framer-motion patterns
- No layout flashing detected during SPA navigation

**Header Visibility / Shell Layering Fix (Phase 6):**
- Root cause: page-level rails used higher z-index values than the global fixed header
- Fix applied:
  - `HeaderJetMyMoto.jsx` raised to shell-level `z-[120]`
  - local top rails normalized below shell using `top-20`
- Updated surfaces:
  - `features/airport/sections/ArrivalOS.jsx`
  - `features/airport/MotoAirliftBooking.jsx`
  - `pages/GlobalTower.jsx`
  - `pages/HangarPage.jsx`
  - `pages/AirliftPage.jsx`
- Result: airport rental pages such as `/airport/mxp?mode=rent` now keep the global header visible

**Architecture Sentinel Compliance:**
- ✅ One SPA. Two brand skins. One routing tree
- ✅ Pure stateless rendering layer (GRAPH read-only)
- ✅ Canonical route paths adhered to
- ✅ Optional chaining guards implemented
- ✅ Accessibility compliance (no pure black backgrounds)
- ✅ React Router SPA integrity maintained
- ✅ Core graph engine protected (no modifications)

---

## Booking Engine Debug Mirror

The following trace is mirrored from the root-level `bookingenginedebuging.md` so booking-engine operational knowledge also lives inside the frontend architecture reference. Existing architecture content above remains canonical and unchanged.

# JetMyMoto Booking Engine Refactor & Debugging Trace

## Status: STABILIZED (Phase 2 Complete)
**Date:** Friday, March 20, 2026
**Engineer:** Senior Backend Architect (Gemini CLI)

---

## 1. THE PROBLEM (Root Cause Analysis)
The booking system was experiencing frequent failures and 500 errors during the route resolution phase. Through a surgical audit and emulator testing, we identified several critical flaws:

1.  **Security/Trust Violation:** The backend was blindly trusting `pickupLat/Lng` sent by the frontend.
2.  **Information Leakage:** Internal errors (stack traces) were being exposed to the client on 500 errors.
3.  **Fragile Validation:** `contact: z.any()` was a ticking bomb that could break the email service if malformed data was passed.
4.  **Mutating Globals:** The backend was directly mutating `req.body`, which is an anti-pattern that leads to side-effect bugs.
5.  **API Hangs:** Geocoding requests lacked timeouts, meaning a slow external API could hang the entire Firebase function.

---

## 2. THE FIX (Step-by-Step Implementation)

### Step 1: Remove Trust in Client Coordinates & Prevent Mutation
We now clone the incoming request into a `cleanedInput` object and strip coordinate data immediately.
```javascript
const cleanedInput = { ...req.body };
delete cleanedInput.pickupLat;
delete cleanedInput.pickupLng;
```

### Step 2: Harden the Geocoding Engine (Phase 2)
We refactored `geocodeCity()` to include a mandatory 3-second timeout using `AbortController`.
```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3000);
// ... fetch with signal: controller.signal
```

### Step 3: Strict Contact Validation
Replaced `z.any()` with a strict union that ensures we get a valid email or a structured contact object.
```javascript
contact: z.union([
  z.string().email(),
  z.object({
    email: z.string().email(),
    name: z.string().optional(),
    phone: z.string().optional()
  })
])
```

### Step 4: Security Hardening (Error Masking)
Internal server errors (500) no longer leak technical details to the user. They are logged to the console for developers but return a generic message to the client.
```javascript
return res.status(500).json({
  success: false,
  error: "Internal server error"
});
```

### Step 5: Logic Re-ordering & Safe Guards
Moved the Zod `.parse()` call to the very top and added checks to ensure `distanceKm` and `totalUnits` are valid numbers before passing them to the pricing engine.

---

## 3. HOW TO DEBUG IN THE FUTURE
If the booking engine fails again, follow these exact steps used during this session:

1.  **Start the Local Emulator:**
    `cd functions && npm run serve`
2.  **Submit a Direct Test Payload:**
    Use `curl` to bypass the UI and test the API contract directly:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"pickupCity":"Zagreb","destinationCity":"Paris","bikes":{"small":1,"medium":0,"large":0},"contact":"test@example.com"}' http://localhost:5001/movie-chat-factory/us-central1/createMotoQuote
    ```
3.  **Check the logs:**
    Look for `ERR: ZOD VALIDATION ERRORS` or `🔥 FUNCTION CRASH` in the terminal.

---

## 4. ARCHITECTURAL SUCCESS CRITERIA MET
- [x] **Zero Trust:** Frontend cannot influence coordinates or price.
- [x] **Information Security:** No internal stack traces leaked to clients.
- [x] **Network Resilience:** External API calls (geocoding) now have timeouts.
- [x] **Type Safety:** Contact information is validated and normalized before use.
- [x] **Immutability:** Request body is cloned, not mutated.
- [x] **Backward Compatible:** Supports both legacy `quantity` fields and new `bikes` structures.

---

## 5. PHASE 2A: SHARED TRANSPORT POOL MVP
**Implementation:**
- **Firestore Integration:** Added `pools` collection to track shared transport routes and participants.
- **Backend Function:** Created `createTransportPool` to validate existing bookings, generate `POOL-<timestamp>` IDs, and initialize pool documents with target participants and required deposits (€500).
- **Frontend Refinement:** 
  - Refactored `BookingSuccess.jsx` to introduce premium value framing and conversion-optimized flow (per bike cost -> deposit -> de-emphasized total).
  - **Trust & Accuracy Refinement:** Updated pre-deposit status from "Mission Initiated" to "Mission Ready" and "Reserved" to "Awaiting Confirmation" to prevent over-promising before the deposit is secured. 
  - **Phase 2A Mock Pool Flow:** Implemented instant pool creation using `localStorage` to allow immediate frontend testing and UX feedback without backend dependencies. `PoolPage.jsx` now fallbacks to local data if the Firestore document is missing.
  - **Pool Growth Engine:** Redesigned `PoolPage.jsx` from a static state view into a viral growth loop.
    - **Psychology Copy Shift:** Reframed from "Reduce your cost" to "Share This Transport". Replaced optimization language with standard cost-splitting mechanics ("Each rider pays individually", "3 spots available") to lower friction and align with familiar shared-economy behaviors.
    - Added "Total Transport Cost" and "Estimated Share Per Rider" blocks exposing the shared price (≈ €1k if full).
    - Upgraded Expiry block to show hour-based countdown with consequence micro-copy.
    - Added 1-click WhatsApp viral share with prefilled marketing copy.
  - Streamlined CTA section: "Secure Slot with €500 Deposit" and "Invite Riders & Pay Less".
  - Removed excess system logs and fluff micro-copy for sharper trust anchors.
  - Implemented `PoolPage.jsx` as a read-only shareable public dashboard displaying real-time capacities, origin/destination data, and pool expiry. Note: Stripe payments are NOT integrated yet for pools.
  - Fixed fallback geocoding natively in the frontend to resolve 500 errors when users bypass Google Maps Autocomplete. 
- **API Strategy:** Explicitly bound the frontend to the production endpoint (`API_URL`) for testing stability.

---

## 6. PHASE 2B: DUAL-ENGINE RENTAL INTAKE SCHEMA FIX
**Date:** Sunday, March 22, 2026
**Status:** Backend contract updated, ready for deploy

### What Broke
After the Rental Showroom CTA was wired into the existing booking flow, the frontend began sending additional rental-context fields with the `createMotoQuote` payload:

- `requestMode`
- `selectedRentalId`
- `selectedRentalAirport`
- `selectedRentalOperator`
- `selectedRentalMachine`

The frontend behavior was correct, but the backend validator in `functions/src/createMotoQuote.js` was still operating on the older logistics-only contract. Because the function uses strict Zod parsing, these new fields were rejected immediately, which produced:

- HTTP `400 Bad Request`
- client error: `Invalid request data`

### Root Cause
This was not a transport, pricing, or email failure. The request was failing before quote generation because the schema and the frontend payload had drifted apart.

The exact failure mode:
1. Rental CTA prefilled the booking form with rental context.
2. `MotoAirliftBookingForm.jsx` submitted the new rental fields at the root of the payload.
3. `createMotoQuote` parsed the request against an outdated Zod schema.
4. Zod rejected the unknown fields and returned a `400`.

### The Fix Applied
We updated the backend schema in `functions/src/createMotoQuote.js` instead of weakening validation or hiding the data in notes.

New optional allowed fields:

```javascript
requestMode: z.enum(["logistics", "rental"]).nullable().optional(),
selectedRentalId: z.string().max(120).nullable().optional(),
selectedRentalAirport: z.string().max(12).nullable().optional(),
selectedRentalOperator: z.string().max(160).nullable().optional(),
selectedRentalMachine: z.string().max(160).nullable().optional(),
```

We also persisted these fields into the booking document and exposed rental context inside the internal ops email when `requestMode === "rental"`.

### Why This Approach Was Chosen
- Keeps backend validation strict
- Preserves the existing logistics flow unchanged
- Supports the new RiderAtlas rental intake flow without frontend hacks
- Makes rental requests visible to operations in structured fields, not buried in freeform notes

### Current Contract
The booking engine now supports two valid intents:

- `requestMode: "logistics"`
- `requestMode: "rental"`

If `requestMode` is omitted, the legacy logistics flow still works.

### Files Updated
- `frontend/rideratlas/src/features/booking/MotoAirliftBookingForm.jsx`
  - Sends rental context for showroom-originated requests
- `functions/src/createMotoQuote.js`
  - Accepts and stores the rental fields in the validated backend schema

### How To Debug This Failure Again
If the booking form suddenly starts returning `400 Invalid request data` after a frontend intake change:

1. Inspect the frontend console payload log and identify any newly added root fields.
2. Open `functions/src/createMotoQuote.js` and compare the payload keys against the Zod schema.
3. If the frontend introduced new structured fields, add them explicitly to the schema instead of disabling validation.
4. Run a syntax check:
   ```bash
   node --check functions/src/createMotoQuote.js
   ```
5. Test locally against the emulator with both flows:
   - a standard logistics quote
   - a rental intake request containing the five rental fields above

### Deployment Note
Updating the source file alone does not fix production. The Cloud Function must be redeployed before the live endpoint stops returning `400` for rental-originated booking requests.

---

## 7. PHASE 2C: AGENTIC ADMIN / CRM VALIDATION LAYER
**Date:** Sunday, March 22, 2026
**Status:** Frontend admin stack upgraded and build-verified

### What Changed
The booking engine is no longer treated as a simple form-to-function flow. The admin side now includes graph-aware validation surfaces so brokers and AI agents can inspect and verify payloads before dispatch.

New admin surfaces implemented:

- `/admin`
  - New `AdminLayout.jsx` shell and `AdminCommandCenter.jsx`
  - Live graph telemetry for airports, routes, rentals, and operators
  - Tactical quick-links launchpad for JetMyMoto and RiderAtlas ops routes
- `/admin/rentals`
  - New `AdminRentalManager.jsx`
  - Split-pane injector for validating AI-generated fleet/operator JSON
  - Relational audit against `GRAPH.operators` with orphan detection
- `/admin/bookings`
  - `BookingManager.jsx` upgraded into an Agentic Quote Injector
  - Split-pane CRM showing live mock lead pipeline on the left
  - QuoteDispatch JSON validation sandbox on the right
  - Rental quote audit against `GRAPH.rentals[rentalId]`

### Booking / CRM Validation Rules Now Enforced
On `/admin/bookings`, the injected quote payload is checked for:

- `bookingRef`
- `estimatedPrice`
- `currency`
- `status`

If the payload represents a rental dispatch:

- `requestMode === "rental"` requires `rentalId`
- `rentalId` must resolve to a real machine in `GRAPH.rentals`

Failure mode now surfaced in the UI:

```text
ORPHAN DETECTED: The machine requested in this quote does not exist in the active graph.
```

Successful validation surfaces:

```text
QUOTE VERIFIED: Payload aligns with graph inventory. Ready for dispatch.
```

### Fleet Injector Validation Rules
On `/admin/rentals`, pasted JSON arrays are validated for:

- JSON syntax correctness
- root array shape
- object row shape
- rental-to-operator relationships

Critical orphan state surfaced in the UI:

```text
ORPHAN DETECTED: Operator '{id}' does not exist in the graph.
```

Successful validation surfaces:

```text
PAYLOAD VERIFIED: Relational integrity intact. Ready for codebase injection.
```

### Why This Matters
This shifts the admin model from manual CRM/CMS behavior to an agentic validation workflow:

- AI generates structured payloads
- Admin pastes payloads into the sandbox
- UI validates schema and graph relationships
- only then does a coding agent commit the data into source files

This reduces the chance of:

- dispatching quotes for non-existent rental machines
- injecting rental rows pointing to missing operators
- shipping malformed JSON into the codebase

### Build / Deployment Health Note
While implementing the admin upgrades, Vite production builds were repeatedly terminating during chunk rendering. The root cause was excessive bundle pressure from always loading the massive POI index into the global graph.

Fix applied:

- removed the heavyweight POI dataset from the always-loaded network graph
- moved POI detail loading behind the `/poi/:slug` route via dynamic import
- kept the admin stack and public SPA buildable under the current environment limits

Result:

- `npm run build` completes successfully again from `frontend/rideratlas`
- admin command center, rental injector, and booking injector compile cleanly

### Files Added / Updated
- `frontend/rideratlas/src/layouts/AdminLayout.jsx`
- `frontend/rideratlas/src/pages/admin/AdminCommandCenter.jsx`
- `frontend/rideratlas/src/pages/admin/AdminRentalManager.jsx`
- `frontend/rideratlas/src/pages/admin/BookingManager.jsx`
- `frontend/rideratlas/src/pages/admin/AdminBookingsPage.jsx`
- `frontend/rideratlas/src/App.jsx`
- `frontend/rideratlas/src/core/network/buildNetworkGraph.js`
- `frontend/rideratlas/src/pages/poi/PoiPage.jsx`

### Operational Debug Guidance
If an admin injector starts rejecting a payload unexpectedly:

1. Confirm the JSON is valid and not wrapped in markdown fences.
2. Confirm the payload root shape:
   - `/admin/rentals` expects a JSON array
   - `/admin/bookings` expects a single JSON object
3. For rental dispatches, verify `rentalId` exists in `GRAPH.rentals`.
4. For fleet expansion payloads, verify every `rental.operator` resolves either:
   - in the existing graph, or
   - in the same pasted payload as an operator row
5. If build failures reappear, inspect whether another oversized static dataset has been pulled into the global graph path.

---

## 8. PHASE 2D: DESTINATION INTELLIGENCE PAGE REDESIGN
**Date:** Sunday, March 22, 2026
**Status:** Frontend destination layer redesigned and build-verified

### What Changed
`RideDestinationPage.jsx` was rebuilt as a graph-first SEO discovery page for `/destination/:slug`.

The older implementation depended on `useDestination`, hardcoded hero media, and legacy airport/POI rendering. The new implementation removes that dependency and reads directly from the graph layer:

- `GRAPH.destinations[slug]`
- `GRAPH.routesByDestination[slug]`
- `GRAPH.rentalsByDestination[slug]`

This keeps the page aligned with the network-first architecture already used by route, airport, and rental surfaces.

### Current Rendering Contract
The destination page now resolves its data in this order:

1. `slug` from `useParams()`
2. destination node from `GRAPH.destinations[slug]`
3. route refs from `GRAPH.routesByDestination[slug]`
4. rental refs from `GRAPH.rentalsByDestination[slug]`
5. primary deployment hub from the first valid airport code found on the connected route objects

If the destination slug is missing from the graph:

- the page does not crash
- a controlled fallback state is rendered
- the user is sent back toward `/airports`

### Destination Page Layer Stack
The page now renders in four production layers:

1. Cinematic Briefing
   - destination-driven hero image using `destination.imageUrl || destination.posterUrl`
   - fallback cinematic media if destination imagery is absent
   - luxury-tactical overlay using `#050505` instead of pure black
2. Contextual Fleet
   - rental inventory pulled from `GRAPH.rentalsByDestination`
   - rental records expanded from IDs into full `GRAPH.rentals` objects
   - existing `RentalCard` reused so pricing, CTA wiring, and visual language stay consistent
3. Tactical Route Intelligence
   - route cards link to `/route/:slug`
   - route distance, difficulty, and hub data are surfaced with fallbacks
4. Dual-Engine Deployment Handoff
   - `Ship Your Machine` routes to `/moto-airlift?airport={IATA}`
   - `Rent Locally` routes to `/airport/{iata-lowercase}?mode=rent`

### Debugging Rules For Agents
If a destination page looks empty or under-populated, inspect the graph relations before touching the component:

1. Confirm the slug exists in `GRAPH.destinations`.
2. Confirm `GRAPH.routesByDestination[slug]` contains route refs for that destination.
3. Confirm those route refs resolve to actual route objects in `GRAPH.routes`.
4. Confirm `GRAPH.rentalsByDestination[slug]` contains rental refs.
5. Confirm those rental refs resolve to actual rental objects in `GRAPH.rentals`.
6. Confirm at least one connected route exposes a valid airport code if the deployment CTA block looks disabled.

In practice, most destination-layer failures will be graph-linking issues, not rendering issues.

### Route Shape Tolerance
The destination page now intentionally tolerates mixed route object shapes because the graph has evolved over time.

The page will attempt to read:

- route name from `name`, `title`, `route_name`, or slug
- route distance from `distance_km`, `distanceKm`, `distance`, or `length_km`
- route difficulty from `difficulty`, `roadProfile.difficulty`, `difficultyLevel`, or `profile`
- airport code from `airport.code`, `airportCode`, `hub.code`, `origin.code`, `entryAirport.code`, or `entry_airport.code`

This means agents should prefer normalizing graph data upstream, but the page should remain resilient while old and new route records coexist.

### Media Fallback Rule
Many destination nodes are still data-light and do not yet ship with custom hero assets.

Current fallback behavior:

- use `destination.imageUrl`
- else use `destination.posterUrl`
- else use cinematic fallback media from `CINEMATIC_BACKGROUNDS`

If a destination looks visually generic, the likely issue is missing destination media in the graph seed, not a rendering bug.

### Styling / UX Constraints
Important visual rules now enforced on the destination layer:

- no pure `#000000` backgrounds
- main page background uses `#050505`
- cards use `#121212` with `border-white/10`
- amber / gold accents use `#A76330` and `#CDA755`
- numeric route and inventory readouts use `tabular-nums`

If future edits reintroduce `black`, `bg-black`, or `from-black`, treat that as a regression against the current design system.

### Files Updated
- `frontend/rideratlas/src/pages/destination/RideDestinationPage.jsx`

### Operational Debug Guidance
When debugging this page, use this order:

1. Check the destination slug.
2. Inspect the destination node.
3. Inspect `routesByDestination[slug]`.
4. Inspect `rentalsByDestination[slug]`.
5. Verify connected routes expose an airport code.
6. Only after graph validation should you inspect JSX layout behavior.

This page is now designed so the graph is the source of truth and the UI is a thin rendering layer on top of it.
