# CLEAN CORE AUDIT — RiderAtlas v2 Extraction

**Date:** June 14, 2026  
**Subject:** Technical Audit of `jetmymoto-platform` for v2 Migration  
**Status:** COMPLETE

---

## SECTION 1 — Repository Health

| Metric | Count |
| :--- | :--- |
| **Total React components** | 100 |
| **Total pages** | 38 |
| **Total CSS files** | 21 |
| **Total routes** | ~40 |
| **Total Firestore collections used** | 15 |

### Repository Hotspots

*   **Largest files:** 
    *   `src/features/poi/poiIndex.json` (17MB) — Massive static data file.
    *   `src/features/poi/poiFiltered.json` (4.7MB)
*   **Most imported internal files:**
    *   `@/utils/navigationTargets` (46 imports) — Critical routing logic.
    *   `@/core/network/networkGraph` (33 imports) — Core data layer.
    *   `@/lib/firebase` (18 imports) — Database entry point.
*   **Most modified files (last 100 commits):**
    *   `src/pages/routes/RideRoutePage.jsx`
    *   `src/features/airport/AirportTemplate.jsx`
    *   `src/pages/AirportPage.jsx`
    *   `src/core/network/networkGraph.js`

---

## SECTION 2 — Airport System Audit

The Airport System has undergone multiple iterations (V1, V2, and the current V3 Gateway Engine).

| Component | Status | Rationale |
| :--- | :--- | :--- |
| **AirportPage** | **REFACTOR** | Main entry point; needs cleaner logic for pSEO manifest hydration. |
| **AirportGatewayLayout** | **REFACTOR** | The V3 engine is powerful but monolithic (1100+ lines). Split into atomic sections. |
| **GatewayHero** | **KEEP** | Clean implementation of the primary conversion surface. |
| **RouteCinema** | **KEEP** | High visual value; specialized for V3 theater visualization. |
| **Offers** | **REFACTOR** | Currently hardcoded defaults in the Layout; move to a service/config. |
| **Proof** | **KEEP** | Simple and effective "Verified" signal. |
| **Logistics** | **KEEP** | Core value prop for "Ship Your Own Bike". |
| **Rental Grid** | **REWRITE** | V3 uses `CompactRentalMissionRail`. Legacy `RentalGrid.jsx` should be deleted. |
| **Concierge Form** | **REWRITE** | Unify `inquiryModal` and `guideModal` into a single lead service. |

---

## SECTION 3 — Media Director Audit

The Media Director is the "Visual Decision Engine" of the platform.

| Resolver | Production Ready? | Technical Debt | Dependencies |
| :--- | :--- | :--- | :--- |
| **airportMediaResolver** | YES (V3) | High. Monolithic scoring and hardcoded geo-shards. | `mediaIntelligence`, `canonicalMedia` |
| **globalTowerResolver** | YES | Low. Uses a static manifest for Global Tower surfaces. | `globalTowerMediaManifest` |
| **hero-v2 / v3** | YES | Low. Handled via roles in the main resolvers. | `mediaIntelligence` |
| **fleet resolver** | YES | Medium. Fuzzy matching for bike models needs hardening. | `mediaIntelligence` |
| **theater resolver** | YES | Low. Shared collection assets are well-tagged. | `mediaIntelligence` |
| **collection resolver**| YES | Medium. Distributed across `globalTowerSelectors.js`. | `collectionService` |

---

## SECTION 4 — Rental Architecture Audit

| Subsystem | Status | Rationale |
| :--- | :--- | :--- |
| **Rental Data Flow** | **KEEP** | Firestore -> Service -> Hook -> UI is the right pattern. |
| **Firestore collections**| **KEEP** | `rental_offers` and `live_feed` are clean and indexed. |
| **Rental Services** | **REFACTOR** | `liveRentalService` needs better error handling for mismatched IDs. |
| **Rental Cards** | **KEEP** | `RiderBikeModelCard` is high-fidelity and reusable. |
| **Rental Detail Pages** | **REWRITE** | Needs better performance and modern "Deployment" UI. |
| **Checkout Pages** | **REWRITE** | Critical path; should be moved to a more robust state machine. |

---

## SECTION 5 — Graph System Audit

The Graph System is the most stable and critical part of the core.

| Node / Shard | Criticality | Status |
| :--- | :--- | :--- |
| **GRAPH.airports** | **CRITICAL** | Primary lookup for all hub pages. |
| **GRAPH.routes** | **CRITICAL** | Core inventory of riding theater knowledge. |
| **GRAPH.destinations**| **CRITICAL** | Secondary lookup for route end-points. |
| **GRAPH.clusters** | **OPTIONAL** | Used for grouping; can be computed dynamically. |
| **GRAPH.theaters** | **CRITICAL** | High-level grouping of nodes. |
| **graph shards** | **CRITICAL** | Vital for performance (lazy loading large JSON). |

---

## SECTION 6 — CSS Audit

*   **Duplicate CSS:** High redundancy between `riderCards.css` and `riderBikeModelCard.css`.
*   **Legacy CSS:** `atmosphere.css` and `TelemetryPanel.css` are remnants of older prototypes.
*   **MXP-specific CSS:** `mxpGatewayV3.css` contains highly specific overrides that prevent clean generalization.
*   **Global Theme:** `index.css` is the source of truth but is cluttered with Tailwind base and custom utilities.

**Primary Bug Source:** Conflict between legacy CSS transitions and Framer Motion animations in new components.

---

## SECTION 7 — Dead Code

| Category | Est. Deletion | Examples |
| :--- | :--- | :--- |
| **Unused Pages** | 12 files | `AirliftPage`, `PlannerEnrichPage`, `HangarPage` (Legacy versions). |
| **Unused Components**| 25 files | `JetHero`, `MatchmakingDeck`, `MotorcycleRiderHologram`. |
| **Deprecated Pilots** | 5 files | `PatriotPseoTemplate`, `TactileHardwarePrototypePage`. |
| **Legacy Exp.** | 3 folders | `src/archive`, `src/dev/prototypes`. |

**Candidate for deletion:** ~35% of the total codebase.

---

## SECTION 8 — V2 Recommendation

| Category | Subsystems |
| :--- | :--- |
| **KEEP EXACTLY** | `GatewayHero`, `RouteCinema`, `RiderBikeModelCard`, `GRAPH` logic. |
| **MIGRATE + REFACTOR** | `AirportGatewayLayout` (split), `MediaDirector` (decouple scoring). |
| **REBUILD FROM SCRATCH**| `RentalCheckout`, `AdminOS`, `DossierLeadCapture`. |
| **DELETE** | All files in `src/archive`, all `Jet*` components, legacy `RentalGrid`. |

---

## SECTION 9 — Dependency Graph

```text
Airport Page (Entry)
 ├─ AirportGatewayLayout (V3 Engine)
 │   ├─ GatewayHero (Visual Anchor)
 │   ├─ Media Resolver (Decision Logic)
 │   │   └─ Media Intelligence (Data Layer)
 │   ├─ Route Cinema (Inventory Visualizer)
 │   │   └─ GRAPH.routes (Core Data)
 │   └─ Rental System (Commercial Layer)
 │       ├─ LiveRentalService (Live Feed)
 │       └─ CompactRentalMissionRail (UI)
 └─ Concierge Form (Conversion Layer)
```

---

## SECTION 10 — Risk Assessment

1.  **Media Director only migration:** LOW RISK. Resolvers are mostly self-contained.
2.  **Airport System only migration:** MEDIUM RISK. High dependency on Media Director and GRAPH.
3.  **Rental System only migration:** HIGH RISK. Depends on Firestore state and complex matching logic.
4.  **Graph only migration:** CRITICAL. Breaking the Graph breaks every page.

### Recommended Extraction Order:
1.  **Core Utilities & Libs** (`firebase`, `navigationTargets`).
2.  **Graph System** (Shards and lookup logic).
3.  **Media Director** (Resolvers and Intelligence).
4.  **Shared UI Components** (Atomic cards and layouts).
5.  **Airport Gateway Engine** (Modularized V3).
6.  **Rental & Checkout** (Clean rebuild).

---

**End of Audit.**
