import os
import json
from datetime import datetime
from google.cloud import storage

def archive_to_gcs():
    input_path = "output/rental_offers_matched_latest.json"
    if not os.path.exists(input_path):
        print(f"❌ Archive failed: {input_path} missing!")
        return

    bucket_name = "jetmymoto-rental-archive"
    gcp_project_id = "movie-chat-factory"
    
    # Path format: snapshots/YYYY/MM/DD/rental_offers_matched_latest.json
    now = datetime.utcnow()
    gcs_path = f"snapshots/{now.year}/{now.month:02d}/{now.day:02d}/rental_offers_matched_latest.json"

    print(f"📦 Archiving snapshot to GCS: gs://{bucket_name}/{gcs_path}")

    try:
        storage_client = storage.Client(project=gcp_project_id)
        bucket = storage_client.bucket(bucket_name)
        
        # Check if bucket exists, if not, handle gracefully (or assume it exists based on requirements)
        blob = bucket.blob(gcs_path)
        
        with open(input_path, "rb") as f:
            blob.upload_from_file(f, content_type='application/json')
            
        print(f"✅ Successfully archived to Cloud Storage.")
    except Exception as e:
        print(f"❌ GCS Archival Error: {e}")

if __name__ == "__main__":
    archive_to_gcs()
