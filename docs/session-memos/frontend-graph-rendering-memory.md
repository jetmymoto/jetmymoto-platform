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
