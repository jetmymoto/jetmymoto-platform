# JetMyMoto Rental Intelligence Engine — Technical Drop-Off Brief

## PROJECT PURPOSE

JetMyMoto is evolving into an airport-native motorcycle rental intelligence and aggregation platform.

The system automatically:

1. discovers motorcycle rental sources
2. extracts structured rental offers
3. validates and normalizes data
4. scores deal quality
5. maps offers to airport logistics hubs
6. stores enriched analytics in Firestore
7. prepares downstream outputs for the frontend.

The system is intentionally backend-first. Frontend should NEVER become the source of truth. Firestore + generated JSON outputs are the source of truth.

---

# ARCHITECTURAL PIVOT & REVERSE ENGINEERING (MAY 2026)

### 1.Redesign Rollback
The 'Section Library' redesign pilot for the Airport Hub has been cancelled and reversed. The user identified the redesign as unnecessary.

*   **Restored Component**: `AirportTemplate.jsx` has been restored to its original, highly-stable state.
*   **Restored Page**: `AirportPage.jsx` has been reverted to use the original `AirportTemplate` architecture.
*   **Reasoning**: Strategic decision to maintain the existing stable frontend UX while focusing on backend intelligence.

### 2. Section Library (DEPRECATED FOR AIRPORT)
While the primitives exist in `src/sections/`, they are currently not in use by the primary airport routing layer. They remain available for future campaign-specific landing pages if required.

---

# CURRENT PIPELINE STATUS

## Fully Operational Phases

### Phase 1 — Multi-URL Crawler
* **Status**: COMPLETE
* **Outputs**: `output/rental_offers_latest.json`

### Phase 1.5 — Quality Gate
* **Status**: COMPLETE
* **Outputs**: `output/rental_offers_clean_latest.json`

### Phase 2 — Firestore Ingestion
* **Status**: COMPLETE
* **Firestore collections**: `rental_offers`, `daily_snapshots`

### Phase 3 — Deterministic Deal Scoring
* **Status**: COMPLETE
* **Main file**: `scripts/rental-crawler/deal_scorer.py`

### Phase 4 — Airport Matching Engine
* **Status**: COMPLETE
* **Outputs**: `output/rental_offers_matched_latest.json`

---

# RECENT UPDATES

## Task
Reverse engineering Airport Hub page and restoring stable architecture.

## Files Changed
* `src/features/airport/AirportTemplate.jsx` (Restored original code)
* `src/pages/AirportPage.jsx` (Restored usage of `AirportTemplate`)
* `AGENT_TOUCHPOINT.md` (Updated status to reflect rollback)

## Status
Stable — Redesign cancelled.

## Next Recommended Action
1.  **Maintenance**: Ensure `AirportTemplate` remains compatible with any minor Firestore schema changes.
2.  **SEO Check**: Verify that `AirportPage.jsx` still correctly handles premium pSEO data via the restored architecture.
3.  **Clean up**: Remove `src/features/airport/AirportHubPage.jsx` and related pilot components if no longer needed.
