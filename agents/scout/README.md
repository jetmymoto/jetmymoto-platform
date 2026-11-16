# Scout v0.1 — JetMyMoto YouTube discovery

Status: implementation prototype; not executed or deployed.
Uses Python 3.10+ standard library. No framework, LLM key or pip dependencies.

## Mission
Discover motorcycle videos and organise evidence-backed candidates into regional
catalogues for two experiments: partner guided tours and self-guided ride products.
Hotel tips and ride inspiration support either offer. A video is not a sellable
product or evidence of a partnership.

## Run
1. Create/select a Google Cloud project and enable YouTube Data API v3.
2. Create a restricted server-side API key and set YOUTUBE_API_KEY in your runtime
   environment. Do not put it in source control, browser code or command history.
3. Preview the searches (no key required):
   python agents/scout/scout.py --region provence --dry-run
4. Collect candidates:
   python agents/scout/scout.py --region provence --output /tmp/scout-catalogue.json
5. Collect another region into the same file:
   python agents/scout/scout.py --region dolomites --output /tmp/scout-catalogue.json

Regions: provence, dolomites, alps. Add local place aliases using repeated --alias.
The pilot defaults to five searches, ten results each, no pagination.
--max-searches (1–5) and --results-per-search (1–50) bound request volume.
Check current Google quota documentation rather than assuming a fixed daily allowance.

## Output and interpretation
One record per video ID, with separate classifications for each searched region.
Includes creator attribution, original URL, publication time, duration, discovery
queries, timestamps, exact matched region terms and pending editorial status.
Existing editorial decisions survive collection reruns.

Tags are independent keyword signals: guided_candidate, self_guided_candidate,
hotel_tip_candidate and ride_inspiration. They are not verified commercial offers.
Region matches are metadata candidates, not confirmed filming locations.
No match becomes unresolved; unsupported geographic precision is never invented.
A duration of up to 180 seconds is only a short-duration candidate, not confirmed
YouTube Shorts. Both short and longer videos can enter the catalogue.
The script retrieves metadata only; it does not watch videos or retrieve transcripts.

## Editorial workflow
Review the original video and location evidence. Reject irrelevant content;
confirm region and exact road manually; verify operators, hotels and product
details separately. Then mark the regional editorial_status approved or rejected.
This prototype writes JSON only. It does not publish, send messages, book, charge
money or modify Firestore. Run one collector per output file at a time.

## Integration next
- Import reviewed records into a Firestore staging collection, with admin-only writes.
- Build approval UI and regional catalogue embeds.
- Recheck embeddability before public display; handle removed/private videos.
- Implement refresh/delete behaviour for stored API data under current YouTube policies
  before production persistence. Timestamps here support that future lifecycle.
- Add multilingual query configuration, better semantic classification and authorized
  transcript sources after the pilot.
- Track guided-tour and self-guided enquiry clicks separately. Neither offer is
  claimed bookable until its supplier/product is verified.

## Limits and validation
Live collection needs an enabled API and valid key. No live run, Python execution
or tests were possible in the authoring session because the executor was unavailable.
Before integration run:
  python -m unittest discover -s agents/scout -p 'test_*.py'
  python agents/scout/scout.py --dry-run
  then one small real API collection.

No automatic schedule is installed. Do not commit collected catalogues.
Shorts classification, full-content understanding, production resilience and
automatic hotel/route verification are outside v0.1.

## Official references
- https://developers.google.com/youtube/v3/docs/search/list
- https://developers.google.com/youtube/v3/docs/videos/list
- https://developers.google.com/youtube/v3/guides/authentication
- https://developers.google.com/youtube/terms/developer-policies
