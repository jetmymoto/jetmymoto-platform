# MIGRATION MANIFEST V1 — RiderAtlas Clean Core

**Source Repo:** `jetmymoto-platform`  
**Target Repo:** `rideratlas-clean-core`  
**Date:** June 14, 2026

## 1. Core Logic & Infrastructure (Tier A)

| Subsystem | Source Path | Target Path | Category | Phase | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Network Graph** | `src/core/network/networkGraph.js` | `src/core/graph/networkGraph.ts` | **COPY_AND_REFACTOR** | 1 | High |
| **Graph Shards** | `src/core/network/graph*Shard.js` | `src/core/graph/shards/` | **COPY_AND_REFACTOR** | 1 | High |
| **Firebase Config**| `src/lib/firebase.js` | `src/core/firebase/config.ts` | **KEEP_EXACTLY** | 0 | Low |
| **Analytics** | `src/core/analytics/trackEvent.js` | `src/core/analytics/index.ts` | **KEEP_EXACTLY** | 1 | Low |
| **Nav Targets** | `src/utils/navigationTargets.js`| `src/core/routing/navigation.ts`| **KEEP_EXACTLY** | 1 | Low |

## 2. Media Director (Tier B)

| Subsystem | Source Path | Target Path | Category | Phase | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Media Intelligence**| `src/services/mediaIntelligence.js`| `src/features/media/intelligence.ts`| **COPY_AND_REFACTOR** | 3 | Med |
| **Airport Resolver** | `src/services/airportMediaResolver.js`| `src/features/media/resolvers/airport.ts`| **COPY_AND_REFACTOR** | 3 | Med |
| **Tower Resolver** | `src/features/discovery/globalTowerResolver.js`| `src/features/media/resolvers/tower.ts`| **COPY_AND_REFACTOR** | 3 | Low |
| **Canonical Media** | `src/services/canonicalMedia.js`| `src/features/media/canonical.ts`| **KEEP_EXACTLY** | 3 | Low |

## 3. Airport Gateway (V3 Engine)

| Subsystem | Source Path | Target Path | Category | Phase | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gateway Layout** | `src/features/airport/gateways/shared/AirportGatewayLayout.jsx` | `src/features/airport/shell/GatewayShell.tsx` | **COPY_AND_REFACTOR** | 2 | High |
| **Gateway Hero** | `src/features/airport/gateways/shared/GatewayHero.jsx` | `src/features/airport/sections/Hero.tsx` | **KEEP_EXACTLY** | 4 | Low |
| **Route Cinema** | `src/features/airport/gateways/shared/GatewayRouteCinemaRail.jsx` | `src/features/airport/sections/RouteCinema.tsx` | **KEEP_EXACTLY** | 4 | Low |
| **Proof Section** | `src/features/airport/gateways/shared/GatewayProofSection.jsx` | `src/features/airport/sections/Proof.tsx` | **KEEP_EXACTLY** | 5 | Low |
| **Logistics** | `src/features/airport/gateways/shared/AirportGatewayLayout.jsx` (extract) | `src/features/airport/sections/Logistics.tsx` | **COPY_AND_REFACTOR** | 5 | Low |

## 4. Rental Architecture

| Subsystem | Source Path | Target Path | Category | Phase | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rental Service** | `src/services/liveRentalService.js` | `src/features/rentals/services/liveFeed.ts` | **COPY_AND_REFACTOR** | 6 | Med |
| **Bike Model Card** | `src/features/shared/cards/RiderBikeModelCard.jsx` | `src/shared/components/cards/BikeCard.tsx` | **KEEP_EXACTLY** | 4 | Low |
| **Compact Rail** | `src/features/airport/gateways/shared/CompactRentalMissionRail.jsx` | `src/features/rentals/components/RentalRail.tsx` | **COPY_AND_REFACTOR** | 6 | Low |
| **Rental Detail** | `src/pages/rentals/RentalDetailPage.jsx`| `src/features/rentals/pages/DetailPage.tsx`| **REBUILD_FROM_SCRATCH**| 7 | High |
| **Rental Checkout** | `src/pages/rentals/RentalCheckoutPage.jsx`| `src/features/rentals/pages/CheckoutPage.tsx`| **REBUILD_FROM_SCRATCH**| 7 | High |

## 5. Visuals & Styling

| Subsystem | Source Path | Target Path | Category | Phase | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Index CSS** | `src/index.css` | `src/styles/globals.css` | **COPY_AND_REFACTOR** | 0 | Low |
| **Rider Cards CSS** | `src/features/shared/cards/riderCards.css` | `src/styles/components/cards.css` | **COPY_AND_REFACTOR** | 0 | Low |
| **Theme Tokens** | `src/index.css` (extract) | `src/styles/tokens.css` | **COPY_AND_REFACTOR** | 0 | Low |

---

## 6. Deletion / Exclusion List

*   `src/archive/**` — **DELETE**
*   `src/components/Jet*` — **DELETE**
*   `src/pages/dev/prototypes/**` — **DELETE**
*   `src/features/airport/gateways/mxp/mxpGatewayV3.css` — **DELETE**
*   `src/features/rentals/components/RentalGrid.jsx` — **DELETE**
*   `src/pages/AdminOS.jsx` — **REBUILD_FROM_SCRATCH**
