import json
import pandas as pd

def create_network_map_from_kaggle_data():
    """
    Reads the trains.json and schedules.json files to build and save the network_map.json
    for Southern (SR) and South Western (SWR) railway zones.
    """
    print("--- Starting Network Map Build from Kaggle Data ---")

    # --- Step 1: Load all datasets ---
    try:
        print("  -> Loading trains.json...")
        with open('trains.json', 'r', encoding='utf-8') as f:
            trains_data = json.load(f)

        print("  -> Loading schedules.json...")
        # schedules.json is very large, so we process it efficiently
        schedules_df = pd.read_json('schedules.json')

        print("  -> Loading stations.json...")
        with open('stations.json', 'r', encoding='utf-8') as f:
            stations_data = json.load(f)

    except FileNotFoundError as e:
        print(f"\n[CRITICAL ERROR] File not found: {e.filename}. Please ensure all three JSON files are in the same directory.")
        return

    # --- Step 2: Identify all trains in the Southern (SR) and South Western (SWR) zones ---
    print("\n--- Filtering for Southern (SR) and South Western (SWR) trains ---")
    sr_swr_train_numbers = set()
    for train in trains_data['features']:
        zone = train['properties'].get('zone')
        if zone in ['SR', 'SWR']:
            sr_swr_train_numbers.add(train['properties'].get('number'))
    
    print(f"  -> Found {len(sr_swr_train_numbers)} unique trains in SR and SWR zones.")
    if not sr_swr_train_numbers:
        print("[Warning] No trains found for SR or SWR zones. The map will be empty.")
        return

    # --- Step 3: Filter schedules to only include our target trains ---
    print("\n--- Filtering schedules for target trains ---")
    schedules_df['train_number'] = schedules_df['train_number'].astype(str)
    filtered_schedules = schedules_df[schedules_df['train_number'].isin(sr_swr_train_numbers)].copy()
    print(f"  -> Found {len(filtered_schedules)} schedule entries for our target trains.")

    # --- Step 4: Reconstruct routes and build the network map ---
    print("\n--- Building network map from schedules ---")
    network_map = {}
    
    # Clean up arrival times for proper sorting
    # Replace 'None' with a very early time to ensure start stations come first
    filtered_schedules['arrival_clean'] = filtered_schedules['arrival'].replace({'None': '00:00:00'})
    
    # Group by train number and sort each train's route chronologically
    grouped = filtered_schedules.sort_values(by=['day', 'arrival_clean']).groupby('train_number')
    
    processed_trains = 0
    for train_number, schedule in grouped:
        stations = schedule['station_code'].tolist()
        for i in range(len(stations) - 1):
            current_station = stations[i]
            next_station = stations[i+1]
            if current_station and next_station:
                if current_station not in network_map:
                    network_map[current_station] = []
                if next_station not in network_map[current_station]:
                    network_map[current_station].append(next_station)
        processed_trains += 1

    print(f"  -> Processed {processed_trains} train routes.")

    if not network_map:
        print("\n--- CRITICAL ERROR: FAILED TO BUILD NETWORK MAP ---")
        return

    # --- Step 5: Save the final map ---
    print(f"\n--- Network map built successfully with {len(network_map)} stations. ---")
    with open("network_map.json", "w") as f:
        json.dump(network_map, f, indent=2, sort_keys=True)
    print("  -> Network map saved to network_map.json")
    print("\n--- MAP BUILD COMPLETE ---")


if __name__ == "__main__":
    create_network_map_from_kaggle_data()
