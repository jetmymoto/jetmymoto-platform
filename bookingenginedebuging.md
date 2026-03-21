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
