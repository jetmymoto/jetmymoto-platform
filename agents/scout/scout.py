"""JetMyMoto Scout: bounded YouTube discovery into a local review catalogue."""
import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

API = "https://www.googleapis.com/youtube/v3/"
REGIONS = {
    "provence": ["Provence", "Verdon", "Gorges du Verdon", "Route Napoleon", "Route Napoléon"],
    "dolomites": ["Dolomites", "Dolomiti", "Sella", "Gardena", "Pordoi"],
    "alps": ["Alps", "Alpen", "Alpes", "Stelvio", "Stilfserjoch", "Grossglockner"],
}
INTENTS = {
    "guided_candidate": ["guided motorcycle", "guided tour", "motorcycle tour operator", "geführte motorrad"],
    "self_guided_candidate": ["self guided", "self-guided", "gpx", "roadbook", "route guide"],
    "hotel_tip_candidate": ["hotel", "accommodation", "unterkunft", "hébergement"],
}
RIDE_WORDS = ["motorcycle", "motorbike", "motorrad", "moto", "riding", "biker"]
QUERIES = ["motorcycle scenic roads", "motorcycle guided tour",
           "motorcycle self guided route", "motorcycle shorts", "motorcycle friendly hotel"]


def normalized(value):
    return re.sub(r"[^\w]+", " ", value.casefold()).strip()


def contains(text, term):
    return (" " + normalized(term) + " ") in (" " + normalized(text) + " ")


def api_get(resource, params, key):
    url = API + resource + "?" + urlencode({**params, "key": key})
    try:
        with urlopen(url, timeout=30) as response:
            return json.load(response)
    except HTTPError as error:
        # Do not print the request URL: it contains the API key.
        raise RuntimeError(f"YouTube HTTP {error.code}; check API enablement, key and quota.") from None
    except (URLError, TimeoutError):
        raise RuntimeError("YouTube request failed; check connection and retry.") from None


def seconds(duration):
    match = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return None
    h, m, s = (int(v or 0) for v in match.groups())
    return h * 3600 + m * 60 + s


def classify(video, aliases):
    snippet = video.get("snippet", {})
    fields = {k: snippet.get(k, "") for k in ("title", "description")}
    text = " ".join(fields.values())
    evidence = [
        {"field": field, "matched_text": alias}
        for field, value in fields.items() for alias in aliases if contains(value, alias)
    ]
    ride_terms = [word for word in RIDE_WORDS if contains(text, word)]
    # Remove explicit self-guided phrases only when detecting guided offers.
    guided_text = re.sub(r"\\bself[ -]+guided\\b", "", text, flags=re.IGNORECASE)
    tags = [tag for tag, terms in INTENTS.items()
            if any(contains(guided_text if tag == "guided_candidate" else text, term)
                   for term in terms)]
    if ride_terms:
        tags.append("ride_inspiration")
    return {
        "region_evidence": evidence,
        "region_match": "metadata_candidate" if evidence else "unresolved",
        "motorcycle_terms": ride_terms,
        "catalogue_tags": tags,
        "review_priority": "normal" if evidence and ride_terms else "low",
        "editorial_status": "pending_review",
        "verification": {
            "route": "unverified", "operator": "unverified",
            "hotel": "unverified", "availability": "unknown",
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--region", choices=sorted(REGIONS), default="provence")
    parser.add_argument("--alias", action="append", default=[], help="Additional location name; repeatable")
    parser.add_argument("--output", default="scout-catalogue.json")
    parser.add_argument("--max-searches", type=int, choices=range(1, 6), default=5)
    parser.add_argument("--results-per-search", type=int, choices=range(1, 51), default=10)
    parser.add_argument("--dry-run", action="store_true", help="Print queries without API calls")
    args = parser.parse_args()
    aliases = REGIONS[args.region] + args.alias
    queries = [aliases[0] + " " + suffix for suffix in QUERIES][:args.max_searches]
    if args.dry_run:
        print(json.dumps({"region": args.region, "queries": queries,
                          "max_search_requests": len(queries)}, indent=2))
        return
    key = os.environ.get("YOUTUBE_API_KEY")
    if not key:
        parser.error("Set YOUTUBE_API_KEY in your environment; never commit it.")
    output = Path(args.output)
    catalogue = json.loads(output.read_text()) if output.exists() else {"schema_version": 1, "videos": {}}
    if catalogue.get("schema_version") != 1 or not isinstance(catalogue.get("videos"), dict):
        raise ValueError("Unsupported catalogue format")
    discovered = {}
    for query in queries:
        result = api_get("search", {
            "part": "snippet", "q": query, "type": "video",
            "videoEmbeddable": "true", "maxResults": args.results_per_search,
        }, key)
        for item in result.get("items", []):
            video_id = item.get("id", {}).get("videoId")
            if video_id:
                discovered.setdefault(video_id, []).append(query)
    checked = datetime.now(timezone.utc).isoformat()
    ids = list(discovered)
    for offset in range(0, len(ids), 50):
        details = api_get("videos", {
            "part": "snippet,contentDetails,status", "id": ",".join(ids[offset:offset + 50]),
        }, key)
        for video in details.get("items", []):
            if not video.get("status", {}).get("embeddable"):
                continue
            video_id = video["id"]
            snippet = video.get("snippet", {})
            duration = seconds(video.get("contentDetails", {}).get("duration", ""))
            old = catalogue["videos"].get(video_id, {})
            regions = old.get("regions", {})
            prior_review = regions.get(args.region, {}).get("editorial_status", "pending_review")
            region_record = classify(video, aliases)
            region_record["editorial_status"] = prior_review
            region_record["queries"] = discovered[video_id]
            regions[args.region] = region_record
            catalogue["videos"][video_id] = {
                "video_id": video_id, "url": "https://www.youtube.com/watch?v=" + video_id,
                "title": snippet.get("title"), "description": snippet.get("description"),
                "channel_id": snippet.get("channelId"), "channel": snippet.get("channelTitle"),
                "published_at": snippet.get("publishedAt"), "duration_seconds": duration,
                "format": "short_duration_candidate" if duration is not None and duration <= 180 else "video",
                "shorts_confirmed": False, "embeddable_at_check": True,
                "first_seen_at": old.get("first_seen_at", checked),
                "metadata_checked_at": checked, "regions": regions,
            }
    catalogue["last_run_at"] = checked
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(output.name + ".tmp")
    temporary.write_text(json.dumps(catalogue, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(output)
    print(f"Saved {len(catalogue['videos'])} unique videos to {output}")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError, OSError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
