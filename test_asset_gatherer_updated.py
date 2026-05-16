import requests
import json
import time

url = "https://asset-gatherer-778225783812.us-central1.run.app"
payload = {
  "job_id": "mission-001-e2e",
  "coordinates": [12.3054, 46.6187],
  "title": "DOLOMITES PEAK",
  "subtitle": "ITALY",
  "difficulty": "LEGENDARY"
}
headers = {
    "Content-Type": "application/json"
}

print(f"Triggering E2E test at {url}...")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, headers=headers, timeout=600)
    print(f"Status Code: {response.status_code}")
    if response.ok:
        try:
            print("Success! Response JSON:")
            print(json.dumps(response.json(), indent=2))
        except:
            print(f"Success! Response Text: {response.text}")
    else:
        print(f"Failure! Response Text: {response.text}")
except requests.exceptions.Timeout:
    print("Error: Request timed out after 600 seconds.")
except Exception as e:
    print(f"An error occurred: {str(e)}")
