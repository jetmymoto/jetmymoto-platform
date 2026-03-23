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
