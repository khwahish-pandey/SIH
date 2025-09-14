import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import joblib
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, classification_report, roc_auc_score
import os
import csv

# --- PART 1: DATA SIMULATION (ENHANCED & MORE REALISTIC) ---
def simulate_railway_data(records=20000):
    """
    Generates a more realistic dataset to fix issues with model evaluation.
    """
    print(f"Generating {records} enhanced simulated data records...")
    
    train_types = ["Express", "Passenger", "Goods"]
    track_sections = [f"Section_{chr(65+i)}" for i in range(10)]
    weather_conditions = ["Clear", "Rain", "Fog", "Storm"]
    
    data = []
    start_date = datetime(2023, 1, 1)
    
    hourly_train_counts = {}

    for i in range(records):
        train_id = f"TRN{1000 + i}"
        train_type = random.choice(train_types)
        track_section = random.choice(track_sections)
        scheduled_departure = start_date + timedelta(hours=random.randint(0, 8760), minutes=random.randint(0, 59))
        day_of_week = scheduled_departure.strftime("%A")
        hour_of_day = scheduled_departure.hour
        
        time_key = (track_section, scheduled_departure.date(), hour_of_day)
        hourly_train_counts[time_key] = hourly_train_counts.get(time_key, 0) + 1
        
        is_incident = 0
        base_delay = 0
        
        # ANOMALY FIX: Make incidents much more severe and distinct from normal delays.
        if random.random() < 0.05:
            is_incident = 1
            # Incidents cause multi-hour delays.
            base_delay += random.uniform(180, 300)

        if 7 <= hour_of_day <= 10 or 17 <= hour_of_day <= 20:
            base_delay += random.uniform(5, 15)
        
        if day_of_week in ["Saturday", "Sunday"]:
            base_delay *= 0.6

        if train_type == "Goods":
            base_delay += random.uniform(10, 25)
        elif train_type == "Passenger":
            base_delay += random.uniform(2, 8)
        
        weather = random.choice(weather_conditions)
        weather_impact = {"Clear": 1.0, "Rain": 1.2, "Fog": 1.8, "Storm": 2.5}
        base_delay *= weather_impact.get(weather, 1)

        delay_minutes = max(0, base_delay + random.normalvariate(0, 5))
        
        data.append({
            "train_id": train_id,
            "train_type": train_type,
            "track_section": track_section,
            "day_of_week": day_of_week,
            "hour_of_day": hour_of_day,
            "weather_condition": weather,
            "is_incident": is_incident,
            "delay_minutes": round(delay_minutes, 2)
        })

    df = pd.DataFrame(data)
    
    def get_train_count(row):
        key_date = start_date.date() + timedelta(days=random.randint(0, 364))
        key = (row['track_section'], key_date, row['hour_of_day'])
        count = hourly_train_counts.get(key, random.randint(1,10))
        # ANOMALY FIX: An incident implies the track is blocked, only 1 train is present.
        if row['is_incident'] == 1:
            return 1
        return count

    df['trains_in_section_hour'] = df.apply(get_train_count, axis=1)

    def get_congestion(count):
        # CONGESTION FIX: Add noise to make the task more realistic
        noisy_count = count + random.choice([-1, 0, 1])
        if noisy_count > 8: return "High"
        elif noisy_count > 4: return "Medium"
        else: return "Low"
    df['congestion_level'] = df['trains_in_section_hour'].apply(get_congestion)

    df.to_csv("simulated_railway_data.csv", index=False)
    print("Simulated data saved to 'simulated_railway_data.csv'")
    return df

# --- PART 2: SUPERVISED MODEL TRAINING & EVALUATION ---
def train_all_models():
    """
    Loads simulated data, trains all three supervised models, and evaluates their performance.
    """
    print("--- Starting Supervised Model Training & Evaluation ---")
    df = pd.read_csv("simulated_railway_data.csv")
    
    # --- 1. Delay Model (LGBM) ---
    print("\n--- Training Delay Prediction Model ---")
    features_delay = ['train_type', 'track_section', 'day_of_week', 'hour_of_day', 'weather_condition', 'trains_in_section_hour']
    target_delay = 'delay_minutes'
    X_delay = df[features_delay]
    y_delay = df[target_delay]

    categorical_features = ['train_type', 'track_section', 'day_of_week', 'weather_condition']
    encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    X_encoded_cats = encoder.fit_transform(X_delay[categorical_features])
    X_encoded_df = pd.DataFrame(X_encoded_cats, columns=encoder.get_feature_names_out())
    X_processed_delay = pd.concat([X_delay.reset_index(drop=True)[['hour_of_day', 'trains_in_section_hour']], X_encoded_df], axis=1)
    
    X_train, X_test, y_train, y_test = train_test_split(X_processed_delay, y_delay, test_size=0.2, random_state=42)
    lgbm = lgb.LGBMRegressor(objective='regression_l1', n_estimators=1000, learning_rate=0.05, num_leaves=31, random_state=42)
    lgbm.fit(X_train, y_train, eval_set=[(X_test, y_test)], callbacks=[lgb.early_stopping(100, verbose=False)])
    
    # Evaluate Delay Model
    y_pred_delay = lgbm.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred_delay)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred_delay))
    print(f"  -> Delay Model MAE: {mae:.2f} minutes (average error)")
    print(f"  -> Delay Model RMSE: {rmse:.2f} minutes")

    joblib.dump(lgbm, "delay_predictor_model.pkl")
    joblib.dump(encoder, "data_encoder.pkl")
    print("  -> Delay model and encoder saved.")

    # --- 2. Congestion Model (Random Forest) ---
    print("\n--- Training Congestion Prediction Model ---")
    features_congestion = ['hour_of_day', 'day_of_week', 'track_section', 'trains_in_section_hour']
    target_congestion = 'congestion_level'
    X_congestion = df[features_congestion]
    y_congestion = df[target_congestion]
    X_congestion_encoded = pd.get_dummies(X_congestion, columns=['day_of_week', 'track_section'])
    
    X_train_cong, X_test_cong, y_train_cong, y_test_cong = train_test_split(X_congestion_encoded, y_congestion, test_size=0.2, random_state=42)
    
    rf_congestion = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_congestion.fit(X_train_cong, y_train_cong)
    
    # Evaluate Congestion Model
    y_pred_cong = rf_congestion.predict(X_test_cong)
    accuracy = accuracy_score(y_test_cong, y_pred_cong)
    report = classification_report(y_test_cong, y_pred_cong)
    print(f"  -> Congestion Model Accuracy: {accuracy:.2%}")
    print("  -> Classification Report:\n", report)
    
    joblib.dump(rf_congestion, "congestion_model.pkl")
    joblib.dump(list(X_train_cong.columns), "congestion_model_columns.pkl")
    print("  -> Congestion model saved.")

    # --- 3. Anomaly Model (Isolation Forest) ---
    print("\n--- Training Anomaly Detection Model ---")
    
    features_anomaly = ['delay_minutes', 'trains_in_section_hour']
    X_anomaly = df[features_anomaly]
    
    # Scale features to have equal weight, which is crucial for distance-based algorithms.
    scaler = StandardScaler()
    X_anomaly_scaled = scaler.fit_transform(X_anomaly)

    if_anomaly = IsolationForest(contamination=0.05, random_state=42)
    if_anomaly.fit(X_anomaly_scaled)

    # Evaluate Anomaly Model
    # The `decision_function` gives higher scores for normal points (inliers) and lower scores for anomalies.
    # We label incidents as 1 and normal as 0. roc_auc_score expects higher scores for the positive class (1).
    # Therefore, we must invert the scores from the decision_function.
    y_true = df['is_incident'] 
    anomaly_scores = if_anomaly.decision_function(X_anomaly_scaled)
    auc_score = roc_auc_score(y_true, anomaly_scores * -1) # Multiply by -1 to align scores with labels
    print(f"  -> Anomaly Model AUC (vs Incidents): {auc_score:.2f} (higher is better)")
    
    joblib.dump(if_anomaly, "anomaly_model.pkl")
    joblib.dump(scaler, "anomaly_scaler.pkl") # Save the scaler too!
    print("  -> Anomaly model and scaler saved.")
    print("\n--- Supervised Models Trained & Evaluated Successfully ---")

# --- PART 3: API SERVICE ---
PREDICTIONS_CSV_FILE = "api_predictions.csv"

TRACK_NETWORK_MAP = {
    "Section_A": ["Section_B", "Section_C"], "Section_B": ["Section_D", "Section_E"],
    "Section_C": ["Section_F"], "Section_D": ["Section_G"],
    "Section_E": ["Section_G", "Section_H"], "Section_F": ["Section_H"],
    "Section_G": ["Section_I"], "Section_H": ["Section_J"],
    "Section_I": [], "Section_J": []
}

app = FastAPI(title="Railway Operations Prediction API")

# Load all models and necessary files
try:
    model_delay = joblib.load("delay_predictor_model.pkl")
    encoder_delay = joblib.load("data_encoder.pkl")
    model_congestion = joblib.load("congestion_model.pkl")
    model_congestion_columns = joblib.load("congestion_model_columns.pkl")
    model_anomaly = joblib.load("anomaly_model.pkl")
    scaler_anomaly = joblib.load("anomaly_scaler.pkl") # Load the new scaler
    print("[API] All models loaded successfully.")
except FileNotFoundError:
    model_delay = model_congestion = encoder_delay = model_anomaly = model_congestion_columns = scaler_anomaly = None

class TrainInfo(BaseModel):
    train_type: str
    track_section: str
    day_of_week: str
    hour_of_day: int
    weather_condition: str
    trains_in_section_hour: int

def log_prediction_to_csv(info: TrainInfo, predictions: dict):
    """Appends a prediction record to a CSV file."""
    log_data = {**info.model_dump(), **predictions}
    fieldnames = list(info.model_dump().keys()) + list(predictions.keys())
    
    file_exists = os.path.isfile(PREDICTIONS_CSV_FILE)
    
    with open(PREDICTIONS_CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow(log_data)

def get_full_prediction(info: TrainInfo):
    input_df = pd.DataFrame([info.model_dump()])
    
    # Predict Delay
    categorical_features = ['train_type', 'track_section', 'day_of_week', 'weather_condition']
    numerical_features = ['hour_of_day', 'trains_in_section_hour']
    input_encoded_cats = encoder_delay.transform(input_df[categorical_features])
    input_encoded_df = pd.DataFrame(input_encoded_cats, columns=encoder_delay.get_feature_names_out())
    input_processed_delay = pd.concat([input_df[numerical_features].reset_index(drop=True), input_encoded_df], axis=1)
    predicted_delay = round(model_delay.predict(input_processed_delay)[0], 2)

    # Predict Congestion
    input_congestion = pd.get_dummies(input_df[['hour_of_day', 'day_of_week', 'track_section', 'trains_in_section_hour']])
    input_congestion = input_congestion.reindex(columns=model_congestion_columns, fill_value=0)
    predicted_congestion = model_congestion.predict(input_congestion)[0]

    # Predict Anomaly Score
    input_anomaly_df = pd.DataFrame([[predicted_delay, info.trains_in_section_hour]],
                                    columns=['delay_minutes', 'trains_in_section_hour'])
    
    # Use the loaded scaler to transform the input for prediction
    input_anomaly_scaled = scaler_anomaly.transform(input_anomaly_df)
    anomaly_score = model_anomaly.decision_function(input_anomaly_scaled)[0]
    is_anomaly = model_anomaly.predict(input_anomaly_scaled)[0] == -1

    return {
        "predicted_delay_minutes": predicted_delay,
        "predicted_congestion_level": predicted_congestion,
        "anomaly_score": round(anomaly_score, 4),
        "is_anomaly": bool(is_anomaly),
    }

@app.get("/")
def read_root(): return {"message": "Welcome!", "docs": "/docs"}

@app.post("/predict/all")
def predict_all(info: TrainInfo):
    if not all([model_delay, model_congestion, model_anomaly, scaler_anomaly]): return {"error": "Models not loaded."}
    predictions = get_full_prediction(info)
    action = "PROCEED"
    rerouting_possible = False
    if predictions["predicted_congestion_level"] == "High" or predictions["predicted_delay_minutes"] > 30: action = "MONITOR"
    if predictions["is_anomaly"] and predictions["anomaly_score"] < -0.1: action = "FLAG FOR REVIEW"
    if predictions["predicted_congestion_level"] == "High" and predictions["predicted_delay_minutes"] > 45:
        action = "HOLD / REROUTE"
        if info.track_section in TRACK_NETWORK_MAP and TRACK_NETWORK_MAP[info.track_section]:
            rerouting_possible = True
    predictions["recommended_action"] = action
    predictions["rerouting_possible"] = rerouting_possible

    # Log the complete prediction to CSV
    log_prediction_to_csv(info, predictions)

    return predictions

@app.post("/propose_reroute")
def propose_reroute(info: TrainInfo):
    current_section = info.track_section
    alternative_sections = TRACK_NETWORK_MAP.get(current_section, [])
    if not alternative_sections: return {"message": "No alternative routes available."}
    results = []
    for next_section in alternative_sections:
        what_if_info = info.model_copy()
        what_if_info.track_section = next_section
        predictions = get_full_prediction(what_if_info)
        predictions["route"] = f"{current_section} -> {next_section}"
        results.append(predictions)
    best_route = min(results, key=lambda x: x["predicted_delay_minutes"])
    return {"original_section": current_section, "best_alternative_route": best_route, "all_options_considered": results}

# --- Entry point to run everything ---
if __name__ == "__main__":
    simulate_railway_data()
    train_all_models()
    
    print("\n--- SETUP COMPLETE ---")
    print("To run the API server, execute this command:")
    print("uvicorn train_and_serve:app --reload")

