import os
import json
import math

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates the direct earth surface distance in miles between two coordinate sets."""
    # Earth radius in miles
    R = 3958.8
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def run_airport_matching():
    offers_file = "output/rental_offers_scored_latest.json"
    airports_file = "output/airports.json"
    operators_file = "output/operator_locations.json"
    output_file = "output/rental_offers_matched_latest.json"

    if not all(os.path.exists(f) for f in [offers_file, airports_file, operators_file]):
        print("❌ Error: Verification source data files are missing for Phase 4 step matching.")
        return

    # Load data layers
    with open(offers_file, "r") as f: scored_offers = json.load(f)
    with open(airports_file, "r") as f: airport_registry = json.load(f)
    with open(operators_file, "r") as f: operator_registry = json.load(f)

    print(f"🛫 Running Matching Engine over {len(scored_offers)} offers against global airport registries...")
    
    matched_dataset = []

    for offer in scored_offers:
        d = offer["data"]
        op_platform = d["source_platform"]
        op_city = d["city"]

        # Find provider geographic coordinates reference points
        op_coords = next((o for o in operator_registry if o["source_platform"] == op_platform and o["city"].lower() == op_city.lower()), None)
        
        # Default fallback if no provider coordinates match yet
        bike_lat = op_coords["lat"] if op_coords else 0.0
        bike_lng = op_coords["lng"] if op_coords else 0.0

        associated_airports = []
        highest_confidence = 0
        
        # Scrape loop over registered airport spatial map nodes
        for airport in airport_registry:
            # First, filter loosely by country/region boundary metrics
            if airport["country"].lower() != d["country"].lower():
                continue

            # Compute actual geographic mile distance
            distance_miles = calculate_haversine_distance(bike_lat, bike_lng, airport["lat"], airport["lng"])

            # Proximity-Based Confidence Scoring (Within 15 miles = Perfect Match)
            if distance_miles <= 15:
                confidence = int(100 - (distance_miles * 2)) # Shorter distance = higher score
                associated_airports.append(airport["airport_code"])
                if confidence > highest_confidence:
                    highest_confidence = confidence
            # Extended matching boundary (Within 45 miles = Multi-Airport Hub coverage)
            elif distance_miles <= 45:
                confidence = int(75 - (distance_miles * 0.8))
                associated_airports.append(airport["airport_code"])
                if confidence > highest_confidence:
                    highest_confidence = confidence

        # Inject clean Phase 4 geospatial parameters
        d["bike_coordinates"] = {"lat": bike_lat, "lng": bike_lng}
        d["associated_airports"] = associated_airports
        d["airport_match_confidence"] = highest_confidence if associated_airports else 0
        
        matched_dataset.append(offer)

    with open(output_file, "w") as f:
        json.dump(matched_dataset, f, indent=2)

    print(f"🎉 Airport Matching complete! Output saved to: {output_file}")

if __name__ == "__main__":
    run_airport_matching()
