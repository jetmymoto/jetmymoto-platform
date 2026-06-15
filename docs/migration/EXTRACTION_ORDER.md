# EXTRACTION ORDER — RiderAtlas v2

This document defines the sequential extraction of the "Clean Core" to ensure maximum stability.

---

## Phase 0: Repo Scaffold
*   Initialize `rideratlas-clean-core`.
*   Setup TypeScript, Tailwind, and Vite config.
*   Migrate `src/styles/tokens.css` and `src/styles/globals.css`.
*   Migrate `src/core/firebase/config.ts`.

## Phase 1: Core Graph + Infrastructure (Tier A)
*   Extract `networkGraph.js` and `navigationTargets.js`.
*   Migrate all Graph Shards (`src/core/network/graph*Shard.js`).
*   Migrate `trackEvent.js` for analytics continuity.
*   **Validation:** Verify that `GRAPH.airports` and `GRAPH.routes` can be queried in the new repo.

## Phase 2: Airport Route Shell
*   Extract `AirportPage.jsx` into a clean shell.
*   Setup the new `features/airport` directory structure.
*   Create the `GatewayShell.tsx` component (refactored from `AirportGatewayLayout`).

## Phase 3: Media Director Core (Tier B)
*   Extract `mediaIntelligence.js` and `canonicalMedia.js`.
*   Migrate and split `airportMediaResolver.js` into Guards, Scoring, and Resolvers.
*   **Validation:** Run scoring unit tests for known airport assets.

## Phase 4: High-Value Sections (Atomic)
*   Migrate `GatewayHero.jsx` (KEEP EXACTLY).
*   Migrate `GatewayRouteCinemaRail.jsx` (KEEP EXACTLY).
*   Migrate `RiderBikeModelCard.jsx` (KEEP EXACTLY).
*   **Validation:** Render the Hero and Cinema sections with mocked graph data.

## Phase 5: Conversion Modules
*   Extract Logistics, Proof, and Offers sections from the old monolithic layout.
*   Migrate `AirportConciergeForm` into a unified Lead Service.

## Phase 6: Rental Rail Hydration
*   Migrate `liveRentalService.js`.
*   Migrate `CompactRentalMissionRail.jsx`.
*   Integrate live feed into the Gateway Shell.

## Phase 7: Commercial Rebuild
*   **REBUILD** Rental Detail Page.
*   **REBUILD** Checkout flow with a robust state machine.

## Phase 8: Final Polish & Audit
*   Audit for any leftover legacy CSS.
*   Final SEO check (Meta tags, Sitemap).
*   Performance benchmark (Core Web Vitals).
