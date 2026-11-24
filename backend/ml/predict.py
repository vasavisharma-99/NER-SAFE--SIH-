import os
import sys
import json
import warnings
warnings.filterwarnings('ignore')
import joblib
import pandas as pd
import numpy as np

def calculate_explainability(inputs):
    """
    Transparent feature contribution / heuristic explanation based on input severity
    and domain weights for landslide mechanics in the North Eastern Region.
    Clearly labeled as an explainability prototype.
    """
    rainfall = float(inputs.get("rainfall_mm", 0))
    soil_moisture = float(inputs.get("soil_moisture", 0))
    slope = float(inputs.get("slope_angle", 0))
    elevation = float(inputs.get("elevation", 0))
    historical = float(inputs.get("historical_landslide_events", 0))
    veg_index = float(inputs.get("vegetation_index", 0.5))
    ground_movement = float(inputs.get("ground_movement", 0))

    # Calculate severity scores (0 to 1 scale) for each parameter
    sev_rainfall = min(1.0, max(0.0, rainfall / 200.0))
    sev_soil = min(1.0, max(0.0, soil_moisture / 90.0))
    sev_slope = min(1.0, max(0.0, slope / 50.0))
    sev_ground = min(1.0, max(0.0, ground_movement / 10.0))
    sev_history = min(1.0, max(0.0, historical / 5.0))
    # Inverted vegetation: lower vegetation (e.g. barren/cleared slope) increases risk
    sev_vegetation = min(1.0, max(0.0, (0.8 - veg_index) / 0.7))

    # Domain weights
    w_rainfall = 0.30
    w_soil = 0.25
    w_slope = 0.20
    w_ground = 0.15
    w_history = 0.05
    w_veg = 0.05

    raw_scores = {
        "Heavy Rainfall Accumulation": sev_rainfall * w_rainfall,
        "High Soil Moisture Saturation": sev_soil * w_soil,
        "Steep Hill Slope Angle": sev_slope * w_slope,
        "Ground Displacement / Movement": sev_ground * w_ground,
        "Historical Incident Recurrence": sev_history * w_history,
        "Low Vegetation / Barren Cover": sev_vegetation * w_veg
    }

    total_raw = sum(raw_scores.values())
    if total_raw == 0:
        total_raw = 1.0

    contributions = []
    for factor, score in raw_scores.items():
        pct = round((score / total_raw) * 100)
        contributions.append({
            "factor": factor,
            "percentage": pct,
            "impact": "High" if pct >= 20 else ("Medium" if pct >= 10 else "Low")
        })

    # Sort descending
    contributions.sort(key=lambda x: x["percentage"], reverse=True)
    return contributions

def predict_risk(input_data):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "model.joblib")

    rainfall = float(input_data.get("rainfall_mm", 0))
    soil_moisture = float(input_data.get("soil_moisture", 0))
    slope = float(input_data.get("slope_angle", 0))
    elevation = float(input_data.get("elevation", 0))
    historical = float(input_data.get("historical_landslide_events", 0))
    veg_index = float(input_data.get("vegetation_index", 0.5))
    ground_movement = float(input_data.get("ground_movement", 0))

    feature_vector = [[
        rainfall,
        soil_moisture,
        slope,
        elevation,
        historical,
        veg_index,
        ground_movement
    ]]

    if os.path.exists(model_path):
        try:
            bundle = joblib.load(model_path)
            rf = bundle["model"]
            feature_cols = bundle.get("features", [
                "rainfall_mm", "soil_moisture", "slope_angle", "elevation",
                "historical_landslide_events", "vegetation_index", "ground_movement"
            ])
            df_features = pd.DataFrame([[
                rainfall, soil_moisture, slope, elevation, historical, veg_index, ground_movement
            ]], columns=feature_cols)

            classes = list(rf.classes_)
            prediction = rf.predict(df_features)[0]
            probs = rf.predict_proba(df_features)[0]

            # High risk probability or class-weighted score
            class_prob_map = dict(zip(classes, probs))
            high_p = class_prob_map.get("HIGH", 0.0)
            mod_p = class_prob_map.get("MODERATE", 0.0)
            low_p = class_prob_map.get("LOW", 0.0)

            risk_score = round(high_p * 1.0 + mod_p * 0.55 + low_p * 0.15, 2)
            risk_category = prediction
        except Exception as e:
            # Fallback heuristic calculation if model loading error occurs
            risk_score, risk_category = heuristic_fallback(rainfall, soil_moisture, slope, ground_movement)
    else:
        risk_score, risk_category = heuristic_fallback(rainfall, soil_moisture, slope, ground_movement)

    # Ensure risk category matches score thresholds for consistency
    if risk_score >= 0.70:
        risk_category = "HIGH"
    elif risk_score >= 0.40:
        risk_category = "MODERATE"
    else:
        risk_category = "LOW"

    factors = calculate_explainability(input_data)

    return {
        "risk_score": risk_score,
        "risk_category": risk_category,
        "explainability_type": "Feature-Contribution Prototype",
        "contributing_factors": factors,
        "inputs_received": input_data
    }

def heuristic_fallback(rainfall, soil_moisture, slope, ground_movement):
    score = (
        (rainfall / 250.0) * 0.35 +
        (soil_moisture / 100.0) * 0.30 +
        (slope / 60.0) * 0.20 +
        (ground_movement / 10.0) * 0.15
    )
    score = min(1.0, max(0.05, round(score, 2)))
    if score >= 0.70:
        category = "HIGH"
    elif score >= 0.40:
        category = "MODERATE"
    else:
        category = "LOW"
    return score, category

if __name__ == "__main__":
    if len(sys.argv) > 1:
        raw_json = sys.argv[1]
        try:
            data = json.loads(raw_json)
        except Exception:
            data = {}
    else:
        # Example test
        data = {
            "rainfall_mm": 142,
            "soil_moisture": 76,
            "slope_angle": 34,
            "elevation": 1200,
            "historical_landslide_events": 4,
            "vegetation_index": 0.38,
            "ground_movement": 3.7
        }

    result = predict_risk(data)
    print(json.dumps(result, indent=2))
