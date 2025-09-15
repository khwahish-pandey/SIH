import pandas as pd
import numpy as np
import random
from datetime import datetime
import joblib
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import mean_absolute_error, accuracy_score, classification_report, roc_auc_score
import os
import csv
import json
from contextlib import asynccontextmanager
from scipy.sparse import hstack

# --- PART 1: LARGE-SCALE DATA SIMULATION ---
def simulate_realistic_data(network_map, num_trains=500, records_per_train=5):
    """
    Generates a large, realistic dataset based on the real network map,
    using real train numbers from the provided trains.json.
    """
    print(f"Generating simulated data for {num_trains} trains...")
    
    stations = list(network_map.keys())
    if not stations:
        print("[Error] Network map is empty. Cannot generate data.")
        return pd.DataFrame()

    print("  -> Loading trains.json to use real train numbers...")
    try:
        with open('trains.json', 'r', encoding='utf-8') as f:
            trains_data = json.load(f)
        sr_swr_train_numbers = [
            train['properties'].get('number')
            for train in trains_data['features']
            if train['properties'].get('zone') in ['SR', 'SWR'] and train['properties'].get('number')
        ]
        if not sr_swr_train_numbers:
            raise FileNotFoundError 
        print(f"  -> Found {len(sr_swr_train_numbers)} SR/SWR trains to use for simulation.")
    except (FileNotFoundError, KeyError):
        print("  -> [Warning] trains.json not found or invalid. Using generic train IDs.")
        sr_swr_train_numbers = [f"SR_SWR_{1000 + i}" for i in range(num_trains)]

    train_types = ["Express", "Passenger", "Goods", "Superfast"]
    weather_conditions = ["Clear", "Rain", "Fog", "Storm", "Extreme Heat"]
    
    all_journeys = []
    
    for i in range(num_trains):
        train_number = random.choice(sr_swr_train_numbers)
        train_type = random.choice(train_types)
        
        start_station = random.choice(stations)
        current_station = start_station
        journey_len = random.randint(5, 25)
        journey = [start_station]
        for _ in range(journey_len):
            possible_next = network_map.get(current_station)
            if not possible_next: break
            current_station = random.choice(possible_next)
            journey.append(current_station)
        
        base_traffic = random.randint(2, 8)
        
        for section in journey:
            for _ in range(records_per_train):
                day_of_week = random.choice(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
                hour_of_day = random.randint(0, 23)
                weather = random.choice(weather_conditions)
                
                base_delay = 0
                if 7 <= hour_of_day <= 10 or 17 <= hour_of_day <= 20: base_delay += random.uniform(5, 20)
                if train_type == "Goods": base_delay += random.uniform(10, 30)
                weather_impact = {"Clear": 1.0, "Rain": 1.3, "Fog": 1.9, "Storm": 2.8, "Extreme Heat": 1.4}
                base_delay *= weather_impact.get(weather, 1)

                is_incident = 0
                trains_in_section_hour = base_traffic + random.randint(-2, 2)
                if random.random() < 0.02:
                    is_incident = 1
                    base_delay += random.uniform(180, 300)
                    trains_in_section_hour = 1

                delay_minutes = max(0, base_delay + random.normalvariate(0, 5))
                
                noisy_traffic = trains_in_section_hour + random.choice([-1, 0, 1])
                if noisy_traffic > 7: congestion = "High"
                elif noisy_traffic > 3: congestion = "Medium"
                else: congestion = "Low"
                
                all_journeys.append({
                    "train_number": train_number, "train_type": train_type, "track_section": section,
                    "day_of_week": day_of_week, "hour_of_day": hour_of_day,
                    "weather_condition": weather, "is_incident": is_incident,
                    "delay_minutes": round(delay_minutes, 2),
                    "trains_in_section_hour": trains_in_section_hour,
                    "congestion_level": congestion
                })

    df = pd.DataFrame(all_journeys)
    df.to_csv("simulated_train_data.csv", index=False)
    print(f"Simulated data with {len(df)} records saved to 'simulated_train_data.csv'")
    return df

# --- PART 2: MODEL TRAINING & EVALUATION ---
def train_all_models():
    try:
        with open("network_map.json", "r") as f: network_map = json.load(f)
    except FileNotFoundError:
        print("\n--- CRITICAL ERROR --- \n'network_map.json' not found. Please run '1_build_map_from_kaggle.py' first.")
        return

    df = simulate_realistic_data(network_map)
    if df.empty: return

    print("\n--- Starting Supervised Model Training & Evaluation ---")
    
    features = ['train_type', 'track_section', 'day_of_week', 'hour_of_day', 'weather_condition', 'trains_in_section_hour']
    categorical_features = ['train_type', 'track_section', 'day_of_week', 'weather_condition']
    X = df[features]

    encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=True).fit(X[categorical_features])
    X_encoded_sparse = encoder.transform(X[categorical_features])
    
    X_numerical = X.drop(columns=categorical_features).values
    X_processed = hstack([X_numerical, X_encoded_sparse])

    print("\n--- Training Delay Prediction Model ---")
    X_train, X_test, y_train, y_test = train_test_split(X_processed, df['delay_minutes'], test_size=0.2, random_state=42)
    lgbm = lgb.LGBMRegressor(random_state=42).fit(X_train, y_train)
    print(f"  -> Delay Model MAE: {mean_absolute_error(y_test, lgbm.predict(X_test)):.2f} minutes")
    joblib.dump(lgbm, "delay_predictor_model.pkl")
    joblib.dump(encoder, "data_encoder.pkl")
    print("  -> Delay model and encoder saved.")

    print("\n--- Training Congestion Prediction Model ---")
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_processed, df['congestion_level'], test_size=0.2, random_state=42)
    rf = RandomForestClassifier(random_state=42, n_jobs=-1).fit(X_train_c, y_train_c)
    print(f"  -> Congestion Model Accuracy: {accuracy_score(y_test_c, rf.predict(X_test_c)):.2%}")
    joblib.dump(rf, "congestion_model.pkl")
    print("  -> Congestion model saved.")

    print("\n--- Training Anomaly Detection Model ---")
    features_anomaly = ['delay_minutes', 'trains_in_section_hour']
    scaler = StandardScaler().fit(df[features_anomaly])
    X_anomaly_scaled = scaler.transform(df[features_anomaly])
    if_anomaly = IsolationForest(random_state=42).fit(X_anomaly_scaled)
    if len(df['is_incident'].unique()) > 1:
        scores = if_anomaly.decision_function(X_anomaly_scaled)
        print(f"  -> Anomaly Model AUC: {roc_auc_score(df['is_incident'], scores * -1):.2f}")
    joblib.dump(if_anomaly, "anomaly_model.pkl")
    joblib.dump(scaler, "anomaly_scaler.pkl")
    print("  -> Anomaly model and scaler saved.")
    print("\n--- Models Trained & Evaluated Successfully ---")

# --- PART 3: API SERVICE ---
PREDICTIONS_CSV_FILE = "api_predictions.csv"
TRACK_NETWORK_MAP = {}
models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    global TRACK_NETWORK_MAP
    print("[API] Loading models and network map...")
    try:
        with open("network_map.json", 'r') as f: TRACK_NETWORK_MAP = json.load(f)
        
        print("  -> Loading train number to type map from trains.json...")
        with open('trains.json', 'r', encoding='utf-8') as f:
            trains_data = json.load(f)
        train_map = {
            train['properties']['number']: train['properties'].get('type', 'Express')
            for train in trains_data['features'] if 'number' in train['properties']
        }
        models['train_map'] = train_map
        
        print("  -> Loading and cleaning schedules.json for efficiency calculations...")
        schedules_df = pd.read_json('schedules.json')
        schedules_df['train_number'] = schedules_df['train_number'].astype(str)
        
        def time_to_minutes(row, column):
            time_str = row[column]
            day = row['day']
            if time_str == 'None' or pd.isna(day):
                return np.nan
            try:
                parts = time_str.split(':')
                return ((day - 1) * 1440) + (int(parts[0]) * 60) + int(parts[1])
            except (ValueError, AttributeError):
                return np.nan

        schedules_df['arrival_minutes'] = schedules_df.apply(time_to_minutes, column='arrival', axis=1)
        schedules_df['departure_minutes'] = schedules_df.apply(time_to_minutes, column='departure', axis=1)

        schedules_df['departure_minutes'] = schedules_df.groupby('train_number')['departure_minutes'].transform(lambda x: x.ffill())
        schedules_df['arrival_minutes'] = schedules_df.groupby('train_number')['arrival_minutes'].transform(lambda x: x.bfill())
        
        schedules_df['arrival_minutes'].fillna(schedules_df['departure_minutes'], inplace=True)
        schedules_df['departure_minutes'].fillna(schedules_df['arrival_minutes'], inplace=True)
        
        schedules_df.dropna(subset=['arrival_minutes', 'departure_minutes'], inplace=True)
        models['schedules_df'] = schedules_df
        print(f"  -> Loaded details for {len(train_map)} trains and {len(schedules_df)} valid schedule entries.")

        models['delay'] = joblib.load("delay_predictor_model.pkl")
        models['encoder'] = joblib.load("data_encoder.pkl")
        models['congestion'] = joblib.load("congestion_model.pkl")
        models['anomaly'] = joblib.load("anomaly_model.pkl")
        models['scaler'] = joblib.load("anomaly_scaler.pkl")
        print("[API] All assets loaded successfully.")
    except FileNotFoundError as e:
        print(f"[API CRITICAL] Asset file not found: {e.filename}. Run training script first.")
    yield
    print("[API] Application shutdown.")

app = FastAPI(title="Railway Efficiency & Prediction API", lifespan=lifespan)

class TrainInfo(BaseModel):
    train_number: str = "12613"
    track_section: str = "SBC"
    day_of_week: str = "Monday"
    hour_of_day: int = 10
    weather_condition: str = "Clear"
    trains_in_section_hour: int = 5

class RouteRequest(BaseModel):
    route: List[str] = Field(..., example=["SBC", "KGI", "MYS"]); train_info: TrainInfo

class DepartureRequest(BaseModel):
    conflicting_train_1: TrainInfo; conflicting_train_2: TrainInfo; next_section: str

def get_full_prediction(info: TrainInfo):
    train_type = models.get('train_map', {}).get(info.train_number, "Express")
    prediction_input = {**info.model_dump(), 'train_type': train_type}
    input_df = pd.DataFrame([prediction_input])
    
    cat_features = ['train_type', 'track_section', 'day_of_week', 'weather_condition']
    num_features = ['hour_of_day', 'trains_in_section_hour']
    try:
        encoded_cats_sparse = models['encoder'].transform(input_df[cat_features])
        numerical_vals = input_df[num_features].values
        processed_sparse = hstack([numerical_vals, encoded_cats_sparse])

        predicted_delay = round(models['delay'].predict(processed_sparse)[0], 2)
        predicted_congestion = models['congestion'].predict(processed_sparse)[0]
        
        anomaly_features = pd.DataFrame([[predicted_delay, info.trains_in_section_hour]], columns=['delay_minutes', 'trains_in_section_hour'])
        anomaly_scaled = models['scaler'].transform(anomaly_features)
        
        is_anomaly = bool(models['anomaly'].predict(anomaly_scaled)[0] == -1)
        
        return {"predicted_delay_minutes": predicted_delay, "predicted_congestion_level": predicted_congestion, "is_anomaly": is_anomaly, "train_type_used": train_type}
    except Exception as e:
        print(f"[Prediction Error] Could not process input: {e}")
        return {"predicted_delay_minutes": -1, "predicted_congestion_level": "Unknown", "is_anomaly": False, "train_type_used": "Unknown"}

def log_prediction_to_csv(info: TrainInfo, predictions: dict):
    log_data = {**info.model_dump(), **predictions}
    fieldnames, file_exists = list(log_data.keys()), os.path.isfile(PREDICTIONS_CSV_FILE)
    with open(PREDICTIONS_CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists: writer.writeheader()
        writer.writerow(log_data)

@app.post("/predict/all", summary="Get comprehensive prediction for a single train section")
def predict_all(info: TrainInfo):
    if not models: return {"error": "Models not loaded."}
    predictions = get_full_prediction(info)
    speed_action = "MAINTAIN_SPEED"
    if predictions['predicted_delay_minutes'] > 15 and predictions['predicted_congestion_level'] == 'Low':
        speed_action = "INCREASE_SPEED"
    elif predictions['predicted_congestion_level'] == 'High':
        speed_action = "DECREASE_SPEED"
    predictions['recommended_speed_action'] = speed_action
    log_prediction_to_csv(info, predictions)
    return predictions

@app.post("/propose_reroute", summary="Get best alternative route to avoid congestion/delay")
def propose_reroute(info: TrainInfo):
    if not TRACK_NETWORK_MAP: return {"error": "Network map not loaded."}
    current_section = info.track_section
    alt_sections = TRACK_NETWORK_MAP.get(current_section, [])
    if not alt_sections: return {"message": "No alternative routes available."}
    results = []
    original_pred = get_full_prediction(info)
    original_pred['route'] = f"{current_section} (Original)"
    results.append(original_pred)
    for next_section in alt_sections:
        what_if_info = info.model_copy(update={"track_section": next_section})
        predictions = get_full_prediction(what_if_info)
        predictions['route'] = f"{current_section} -> {next_section}"
        results.append(predictions)
    best_route = min(results, key=lambda x: x["predicted_delay_minutes"])
    return {"original_route_prediction": results[0], "best_alternative_route": best_route, "all_options_considered": results}

@app.post("/compare_efficiency", summary="Compare scheduled time vs. AI predicted time for a route")
def compare_efficiency(req: RouteRequest):
    if 'schedules_df' not in models: return {"error": "Schedules not loaded."}
    
    total_predicted_delay = 0
    current_info = req.train_info.model_copy()
    for section in req.route:
        current_info.track_section = section
        total_predicted_delay += get_full_prediction(current_info)['predicted_delay_minutes']
    
    schedules = models['schedules_df']
    train_schedule = schedules[schedules['train_number'] == req.train_info.train_number].sort_values('departure_minutes').reset_index()

    # --- ROBUST ROUTE VALIDATION ---
    all_stations_in_schedule = set(train_schedule['station_code'])
    if not set(req.route).issubset(all_stations_in_schedule):
        missing_stations = list(set(req.route) - all_stations_in_schedule)
        return {"error": f"The following stations are not part of train {req.train_info.train_number}'s schedule: {missing_stations}"}

    station_indices = {station: i for i, station in enumerate(train_schedule['station_code'])}
    route_indices = [station_indices.get(station) for station in req.route]

    if not all(route_indices[i] < route_indices[i+1] for i in range(len(route_indices) - 1)):
        return {"error": "Invalid route. Stations are not in the correct chronological order for this train's schedule."}

    # --- CALCULATION WITH VALIDATED DATA ---
    start_station_info = train_schedule.iloc[route_indices[0]]
    end_station_info = train_schedule.iloc[route_indices[-1]]

    start_time_mins = start_station_info['departure_minutes']
    end_time_mins = end_station_info['arrival_minutes']

    if pd.isna(start_time_mins) or pd.isna(end_time_mins):
        return {"error": "Incomplete schedule data for this specific route segment after cleaning."}

    scheduled_duration = end_time_mins - start_time_mins
    
    if scheduled_duration <= 0:
        return {"error": "Invalid route segment. Start and end stations might be the same or have data issues."}

    predicted_duration = scheduled_duration + total_predicted_delay
    efficiency_score = round((scheduled_duration / predicted_duration) * 100, 2) if predicted_duration > 0 else 0

    return {
        "route": req.route,
        "railway_scheduled_time_minutes": scheduled_duration,
        "ai_predicted_travel_time_minutes": round(predicted_duration, 2),
        "ai_predicted_delay_minutes": round(total_predicted_delay, 2),
        "efficiency_score": efficiency_score,
        "insight": f"The AI predicts this journey will take ~{round(predicted_duration)} minutes, compared to the {scheduled_duration} minutes scheduled by the railway."
    }

@app.post("/optimize_departure", summary="Recommend which of two trains should depart first")
def optimize_departure(req: DepartureRequest):
    info1_first = req.conflicting_train_1.model_copy(update={'track_section': req.next_section})
    delay1_first = get_full_prediction(info1_first)['predicted_delay_minutes']
    info2_second = req.conflicting_train_2.model_copy(update={'track_section': req.next_section, 'trains_in_section_hour': req.conflicting_train_1.trains_in_section_hour + 1})
    total_delay1 = delay1_first + get_full_prediction(info2_second)['predicted_delay_minutes']
    
    info2_first = req.conflicting_train_2.model_copy(update={'track_section': req.next_section})
    delay2_first = get_full_prediction(info2_first)['predicted_delay_minutes']
    info1_second = req.conflicting_train_1.model_copy(update={'track_section': req.next_section, 'trains_in_section_hour': req.conflicting_train_2.trains_in_section_hour + 1})
    total_delay2 = delay2_first + get_full_prediction(info1_second)['predicted_delay_minutes']
    
    train1_type = models.get('train_map', {}).get(req.conflicting_train_1.train_number)
    train2_type = models.get('train_map', {}).get(req.conflicting_train_2.train_number)
    
    if total_delay1 <= total_delay2:
        return {"recommendation": f"Train 1 ({train1_type}) should depart first.", "combined_delay": round(total_delay1, 2)}
    else:
        return {"recommendation": f"Train 2 ({train2_type}) should depart first.", "combined_delay": round(total_delay2, 2)}

if __name__ == "__main__":
    train_all_models()
    print("\n--- SETUP COMPLETE ---")
    print("To run the API server, execute this command:")
    print("uvicorn train_and_serve:app --reload")


