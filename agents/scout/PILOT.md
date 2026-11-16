# Scout pilot handoff

## Available now
- /scout: regional review desk with JSON import/export, search, status filter,
  approval/rejection/reset, location evidence and region reassignment.
- /rides/provence: regional catalogue preview showing only approved records,
  plus guided/self-guided interest draft controls.
- Python discovery: agents/scout/scout.py.
- Existing routes, bookingRef format and production hosting are unchanged.

The frontend is a private prototype: records and review decisions are saved in
the current browser's localStorage. Import merges records while preserving
existing regional decisions. Export JSON to back up reviews or feed them into
future shared storage. No shared database, publishing or real enquiry submission
is implemented. Interest drafts live only in page state until exported.
Demo records are labelled, contain no real footage and are never supplier evidence.
No API credentials are accepted or stored by the frontend.

## Live discovery prerequisite
No YOUTUBE_API_KEY was configured in the Codespace during implementation.
Enable YouTube Data API v3 in your selected Google Cloud project, create an
appropriately restricted server-side key, and configure it as a Codespaces secret
named YOUTUBE_API_KEY for this repository. Start/restart the Codespace as required
for its secrets to enter the shell environment. Never paste the key into chat,
frontend source, committed files, command history or logs.

From the repository root:
python -m unittest discover -s agents/scout -p 'test_*.py'
python agents/scout/scout.py --region provence --max-searches 5 --results-per-search 10 --output /tmp/scout-catalogue.json

Download the resulting JSON from Codespace Files, then import it at /scout.
Review the original videos and evidence; approve useful candidates; inspect the
regional catalogue. Hotel candidates are discovery leads, not verified hotel
recommendations. No prices or availability are inferred.

## Validation performed
- Python tests passed, including location uncertainty and independent offer tags.
- Discovery dry-run printed five Provence queries.
- Frontend production build passed; existing bundle-size warnings remain.
- Browser checked demo loading, approval visibility, rejection exclusion,
  region reassignment and both interest draft options.
- Live API collection could not run without credentials.
- No production deployment performed.

## Next integration
Connect authenticated editorial storage and server-side YouTube collection.
Add data refresh/deletion under YouTube policies before production persistence.
Connect enquiries to an approved backend; track real guided/self-guided interest
separately. Replace demo records with real reviewed regional discoveries.
