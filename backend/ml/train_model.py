import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

def train():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "..", "data", "landslide_data.csv")
    model_output_path = os.path.join(current_dir, "model.joblib")

    print(f"Loading training data from: {data_path}")
    df = pd.read_csv(data_path)

    features = [
        "rainfall_mm",
        "soil_moisture",
        "slope_angle",
        "elevation",
        "historical_landslide_events",
        "vegetation_index",
        "ground_movement"
    ]

    X = df[features]
    y = df["risk_level"]

    # Initialize Random Forest Classifier
    rf = RandomForestClassifier(
        n_estimators=50,
        max_depth=6,
        random_state=42
    )

    print("Training Random Forest Classifier on NER landslide dataset...")
    rf.fit(X, y)

    # Save model and feature names
    bundle = {
        "model": rf,
        "features": features,
        "classes": list(rf.classes_)
    }
    joblib.dump(bundle, model_output_path)
    print(f"Model successfully trained and saved to: {model_output_path}")
    print(f"Model classes: {rf.classes_}")
    print("Feature Importances:")
    for feat, imp in zip(features, rf.feature_importances_):
        print(f"  - {feat}: {imp:.4f}")

if __name__ == "__main__":
    train()
