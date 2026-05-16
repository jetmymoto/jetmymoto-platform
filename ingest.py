import os, json
from datetime import datetime, timedelta
from google.cloud import firestore
def upload_matched_offers():
    input_path = "output/rental_offers_matched_latest.json"
    if not os.path.exists(input_path): print("❌ File missing!"); return
    with open(input_path, "r") as f: matched_records = json.load(f)
    gcp_project_id = "movie-chat-factory"
    print(f"📡 Sycing Data Directly to Project: {gcp_project_id}")
    db = firestore.Client(project=gcp_project_id)
    batch = db.batch()
    timestamp_today = datetime.now().strftime("%Y-%m-%d")
    snapshot_ref = db.collection("daily_snapshots").document(timestamp_today)
    batch.set(snapshot_ref, {"snapshot_date": timestamp_today, "raw_payload": matched_records})
    inserted_count = 0
    for record in matched_records:
        doc_id = record["id"]
        payload = record["data"]
        payload["listing_type"] = record["type"]
        payload["status"] = "active"
        payload["updated_at"] = firestore.SERVER_TIMESTAMP
        payload["expires_at"] = datetime.utcnow() + timedelta(days=7)
        doc_ref = db.collection("rental_offers").document(doc_id)
        batch.set(doc_ref, payload, merge=True)
        inserted_count += 1
        if inserted_count >= 400:
            batch.commit(); batch = db.batch(); inserted_count = 0
    batch.commit()
    print("🎉 Success! Matched data pushed directly to movie-chat-factory.")
if __name__ == "__main__": upload_matched_offers()
