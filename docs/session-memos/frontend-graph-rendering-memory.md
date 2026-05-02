# Frontend Graph Rendering Memory

- Topic: JetMyMoto / RiderAtlas graph-driven SPA rendering redesign
- Last updated: `2026-03-26 21:09:37 UTC`
- Status: architecture defined, implementation not yet applied

## Objective

- Redesign and optimize the frontend rendering system without breaking:
- One SPA
- Two runtime brand skins
- One unified routing tree
- Read-only precompiled `GRAPH`
- No heavy client-side computation

## Hard Invariants

- All public rendering must be graph-driven.
- The frontend must never become a data processing layer.
- All relationship and ranking derivation must happen at build time.
- `GRAPH` is immutable at runtime.
- Logistics and rentals must both remain visible on decision pages.

## Confirmed Existing Files

- Router shell: `frontend/rideratlas/src/App.jsx`
- Core graph merge: `frontend/rideratlas/src/core/network/networkGraph.js`
- Core network builder: `frontend/rideratlas/src/core/network/buildNetworkGraph.js`
- Rental graph builder: `frontend/rideratlas/src/core/network/buildRentalGraph.js`
- Brand resolver: `frontend/rideratlas/src/utils/siteConfig.js`
- Global layer: `frontend/rideratlas/src/pages/GlobalTower.jsx`
- Airport layer: `frontend/rideratlas/src/features/airport/AirportTemplate.jsx`
- Route layer: `frontend/rideratlas/src/pages/routes/RideRoutePage.jsx`
- Destination layer: `frontend/rideratlas/src/pages/destination/RideDestinationPage.jsx`
- Patriot prototype: `frontend/rideratlas/src/components/seo/PatriotPseoTemplate.jsx`

## Required GRAPH Shape

- Top-level entities:
- `airports`
- `routes`
- `rentals`
- `operators`
- `destinations`
- `pois`
- `clusters`
- `patriotOverlays`

- Required indexes:
- `airportsBySlug`
- `airportsByCountry`
- `airportsByContinent`
- `airportsByRegion`
- `airportsByDestination`
- `routesByAirport`
- `routesByDestination`
- `routesByCountry`
- `routesByContinent`
- `rentalsByAirport`
- `rentalsByDestination`
- `rentalsByOperator`
- `rentalsByCategory`
- `rentalsByCountry`
- `rentalsByContinent`
- `destinationsByRegion`
- `destinationsByCountry`
- `destinationsByContinent`
- `poisByDestination`
- `poisByRoute`
- `operatorsByAirport`
- `operatorsByCountry`
- `patriotOverlaysByAirport`
- `patriotOverlaysByRoute`
- `patriotOverlaysByDestination`
- `patriotOverlaysByRental`

## Canonical Public Routes

- `/`
- `/jetmymoto`
- `/airport`
- `/airport/continent/:continent`
- `/airport/country/:country`
- `/airport/:code`
- `/route/:slug`
- `/destination/:slug`
- `/poi/:slug`
- `/rental/:slug`
- `/deploy/:airportCode/:routeSlug/:rentalSlug`
- `/moto-airlift`

## Current Anti-Patterns To Remove

- Raw `Object.values(...).filter(...)` scans where indexes should exist
- Route-country and route-continent derivation in the UI
- Airport lookup fallback scans in page render
- Cluster scans inside airport rendering
- pSEO page assembly in frontend instead of build output
- Cheapest/best rental selection at render time

## Rendering Rules

- Pure by default: all section and primitive components
- Stateful only at route-shell level:
- query param reading
- local UI mode toggles
- scroll/focus control
- no data derivation state

- Re-render only on:
- pathname change
- search param change
- brand change
- local UI interaction state

## Next Implementation Pass

- Refactor graph builders to emit the full index contract.
- Replace runtime scans in `GlobalTower`.
- Replace runtime scans in `AirportPage` and `AirportsCountryPage`.
- Move airport derived metadata into graph build output.
- Make `RideRoutePage` consume precomputed mission-match fields.
- Replace Patriot template with graph-native overlay route rendering.

## Working Rule For Future Sessions

- Update this file at the end of each architecture session.
- Append only durable decisions, not transient experimentation.
- If a code change breaks an invariant listed above, update this memo before continuing implementation.

## Shortcut 33

- `33` is the repo-local shortcut for this topic.
- When `33` appears in a prompt, the agent should:
- read this file first
- read `everything-claude-code/docs/22.md`
- treat the frontend graph-driven SPA architecture thread as the active context
- continue with strict focus on:
- one SPA
- dual brand runtime skins
- one routing tree
- read-only precompiled `GRAPH`
- no heavy client-side computation

- Intent of `33`:
- restore session context quickly
- reduce repeated token usage
- keep future sessions architecture-aware without restating the full spec
- **Log execution:** After each executed prompt under the "33" context, update this file by appending a timestamp and a short summary of the executed commands.

## Execution Log
- `2026-03-31 16:17:34 UTC` - Context restored via shortcut 33. Ready for further instructions.
- `2026-03-31 21:20:39 UTC` - Context restored via shortcut 33. Ready for further instructions.
- `2026-04-01 10:00:00 UTC` - Executed Luxury UI/UX Audit and full cinematic refactor of `RideRoutePage.jsx`. Transitioned UI from "Tactical Data" to "Luxury Editorial" using Serif typography, curated fleet logic (Max 3), and Framer Motion animations. Verified build stability.
- `2026-04-04 21:25:45 UTC` - Context restored via shortcut 33. Fixed rental cards missing the right model images by rewriting deterministic image fallback generation to use the '13clean' dataset instead of the broken '14cinematic' path.
\n- Sat Apr  4 23:11:17 UTC 2026: Successfully prototyped background removal for 5 images from '13clean_export/' using 'rembg' and 'sharp'. Results stored in '16studio_prototypes_local/'.
\n- Sat Apr  4 23:12:01 UTC 2026: Attempted Imagen 3 Generative AI prototype, but failed due to 'aiplatform.endpoints.predict' IAM permission denied on the GCP project. This reinforces Option 1 (Background Removal) as the most viable path forward.
- 2026-05-02 16:06:58 UTC - Executed Wave 4D — Executive Luxury Rewrite for RA033 Mission Dossier. Transformed tactical/military tone into executive concierge briefing. Updated RA033.json fixture and mission-dossier-template.html. Regenerated and uploaded PDF to GCS.
