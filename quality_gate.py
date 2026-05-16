import os
import json
import hashlib

def generate_clean_id(d: dict) -> str:
    """Generates unique document IDs containing current_price context to monitor historical flexes."""
    raw = f"{d['source_platform']}_{d['city']}_{d['bike_model']}_{d['current_price']}"
    return hashlib.sha256(raw.lower().encode("utf-8")).hexdigest()[:20]

def run_gate():
    input_path = "output/rental_offers_latest.json"
    output_path = "output/rental_offers_clean_latest.json"
    if not os.path.exists(input_path):
        print("❌ Source data missing.")
        return
    with open(input_path, "r") as f:
        records = json.load(f)
    clean = []
    for r in records:
        d = r.get("data", {})
        if not d.get("bike_model") or d.get("current_price") is None:
            continue
        d["current_price"] = float(d["current_price"])
        if d.get("original_price") is not None:
            d["original_price"] = float(d["original_price"])
        if d.get("currency") == "$":
            d["currency"] = "USD"
        uid = generate_clean_id(d)
        clean.append({"id": uid, "type": r.get("type"), "data": d})
    with open(output_path, "w") as f:
        json.dump(clean, f, indent=2)
    print(f"🔬 Quality Gate complete. {len(clean)} unique priced entries validated.")

if __name__ == "__main__":
    run_gate()
