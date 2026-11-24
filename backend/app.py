import os
import sys
import random
from datetime import datetime

# Ensure local backend modules can be imported
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, request, jsonify
from flask_cors import CORS

from database import get_db_connection, init_db
from ml.predict import predict_risk

app = Flask(__name__)
CORS(app)

# Ensure database is initialized on startup
init_db()

# Simulated Risk Zones in the North Eastern Region
RISK_ZONES = [
    {
        "id": "zone-1",
        "name": "Gangtok, Sikkim",
        "state": "Sikkim",
        "lat": 27.3389,
        "lng": 88.6065,
        "risk_level": "HIGH",
        "risk_score": 0.82,
        "main_reason": "Heavy rainfall (142mm) and steep slopes (38°) along vulnerable NH-10 sector.",
        "rainfall_mm": 142.0,
        "soil_moisture": 76.0,
        "slope_angle": 38.0,
        "elevation": 1650,
        "road_status": "CAUTION",
        "active_warnings": 1
    },
    {
        "id": "zone-2",
        "name": "Kohima Highway Corridor",
        "state": "Nagaland",
        "lat": 25.6751,
        "lng": 94.1086,
        "risk_level": "CRITICAL",
        "risk_score": 0.91,
        "main_reason": "Active debris flow, saturated soil (86%), and 6.2mm ground movement on NH-29.",
        "rainfall_mm": 195.0,
        "soil_moisture": 86.5,
        "slope_angle": 42.0,
        "elevation": 1444,
        "road_status": "BLOCKED",
        "active_warnings": 2
    },
    {
        "id": "zone-3",
        "name": "Aizawl West Slope",
        "state": "Mizoram",
        "lat": 23.7271,
        "lng": 92.7176,
        "risk_level": "HIGH",
        "risk_score": 0.78,
        "main_reason": "Fragile shale rock, slope cuts near Durtlang with 3.2mm subsurface creep.",
        "rainfall_mm": 138.0,
        "soil_moisture": 74.0,
        "slope_angle": 35.0,
        "elevation": 1132,
        "road_status": "CAUTION",
        "active_warnings": 1
    },
    {
        "id": "zone-4",
        "name": "Shillong Plateau",
        "state": "Meghalaya",
        "lat": 25.5788,
        "lng": 91.8933,
        "risk_level": "MODERATE",
        "risk_score": 0.58,
        "main_reason": "Sustained monsoon rain (98mm), soil saturation 68% in canyon sections.",
        "rainfall_mm": 98.0,
        "soil_moisture": 68.0,
        "slope_angle": 28.0,
        "elevation": 1525,
        "road_status": "OPEN",
        "active_warnings": 0
    },
    {
        "id": "zone-5",
        "name": "Itanagar Foothills",
        "state": "Arunachal Pradesh",
        "lat": 27.0844,
        "lng": 93.6053,
        "risk_level": "LOW",
        "risk_score": 0.28,
        "main_reason": "Dense vegetation buffer, stable drainage channel, low ground movement.",
        "rainfall_mm": 35.0,
        "soil_moisture": 38.0,
        "slope_angle": 18.0,
        "elevation": 750,
        "road_status": "OPEN",
        "active_warnings": 0
    },
    {
        "id": "zone-6",
        "name": "Imphal Valley & Foothills",
        "state": "Manipur",
        "lat": 24.8170,
        "lng": 93.9368,
        "risk_level": "MODERATE",
        "risk_score": 0.52,
        "main_reason": "Slope fissures observed on perimeter hill roads, NH-37 watch alert.",
        "rainfall_mm": 85.0,
        "soil_moisture": 62.0,
        "slope_angle": 26.0,
        "elevation": 786,
        "road_status": "CAUTION",
        "active_warnings": 0
    }
]

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "system": "NER-SAFE Backend & ML Engine",
        "version": "1.0.0-SIH-PROTOTYPE",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "SQLite Connected",
        "model_type": "Scikit-Learn Random Forest Classifier"
    })

@app.route("/api/risk-zones", methods=["GET"])
def get_risk_zones():
    return jsonify({
        "zones": RISK_ZONES,
        "total_zones": len(RISK_ZONES),
        "high_risk_count": sum(1 for z in RISK_ZONES if z["risk_level"] in ["HIGH", "CRITICAL"]),
        "moderate_risk_count": sum(1 for z in RISK_ZONES if z["risk_level"] == "MODERATE"),
        "low_risk_count": sum(1 for z in RISK_ZONES if z["risk_level"] == "LOW"),
    })

@app.route("/api/weather", methods=["GET"])
def get_weather():
    # Simulated weather values for the prototype with clear disclaimer
    return jsonify({
        "regional_average_rainfall_mm": 124.5,
        "average_temperature_c": 21.8,
        "average_humidity_percent": 84,
        "average_wind_kmh": 16.5,
        "soil_moisture_index": 76,
        "synoptic_forecast": "Widespread monsoon rainfall with heavy to very heavy localized showers across Sikkim, Meghalaya, Mizoram, and Nagaland hill tracts.",
        "alert_level": "ORANGE WATCH",
        "data_mode": "SIMULATED_PROTOTYPE",
        "note": "Prototype simulated weather values. Standard IMD / OpenWeather API interface ready."
    })

@app.route("/api/sensors", methods=["GET"])
def get_sensors():
    # Dynamic simulated sensor telemetry
    drift = random.uniform(-0.15, 0.15)
    moist_drift = random.uniform(-1.0, 1.0)
    sensors = [
        {
            "id": "IOT-SK-01",
            "location": "Sikkim NH-10 KM42",
            "soil_moisture": round(78.4 + moist_drift, 1),
            "ground_movement_mm": round(max(0.1, 3.8 + drift), 2),
            "tilt_deg": 36.2,
            "status": "ALERT",
            "battery": "92%",
            "last_ping": "15s ago"
        },
        {
            "id": "IOT-NL-02",
            "location": "Nagaland Kohima-Pfutsero Cut",
            "soil_moisture": round(86.2 + moist_drift, 1),
            "ground_movement_mm": round(max(0.1, 6.2 + drift), 2),
            "tilt_deg": 41.8,
            "status": "CRITICAL",
            "battery": "88%",
            "last_ping": "10s ago"
        },
        {
            "id": "IOT-MZ-03",
            "location": "Mizoram Durtlang Hills",
            "soil_moisture": round(72.5 + moist_drift, 1),
            "ground_movement_mm": round(max(0.1, 2.9 + drift), 2),
            "tilt_deg": 33.0,
            "status": "WARNING",
            "battery": "95%",
            "last_ping": "30s ago"
        },
        {
            "id": "IOT-ML-04",
            "location": "Meghalaya Umiam Ridge",
            "soil_moisture": round(54.2 + moist_drift, 1),
            "ground_movement_mm": round(max(0.1, 0.8 + drift), 2),
            "tilt_deg": 22.4,
            "status": "NORMAL",
            "battery": "97%",
            "last_ping": "45s ago"
        }
    ]
    return jsonify({
        "sensors": sensors,
        "data_mode": "SIMULATED_PROTOTYPE",
        "note": "Prototype simulated IoT telemetry. Ready to ingest MQTT / HTTP hardware streams."
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    result = predict_risk(data)
    return jsonify(result)

@app.route("/api/reports", methods=["GET"])
def get_reports():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports ORDER BY id DESC")
    rows = cursor.fetchall()
    reports = [dict(row) for row in rows]
    conn.close()
    return jsonify({"reports": reports, "total": len(reports)})

@app.route("/api/reports", methods=["POST"])
def create_report():
    data = request.get_json() or {}
    hazard_type = data.get("hazard_type", "Other")
    description = data.get("description", "")
    try:
        latitude = float(data.get("latitude", 0))
        longitude = float(data.get("longitude", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Valid latitude and longitude required"}), 400

    photo_name = data.get("photo_name", None)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reports (hazard_type, description, latitude, longitude, photo_name, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
    """, (hazard_type, description, latitude, longitude, photo_name, now))
    report_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    new_report = dict(cursor.fetchone())
    conn.close()

    return jsonify({"message": "Hazard report submitted successfully", "report": new_report}), 201

@app.route("/api/reports/<int:report_id>", methods=["PATCH"])
def update_report_status(report_id):
    data = request.get_json() or {}
    new_status = data.get("status", "VERIFIED")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE reports SET status = ? WHERE id = ?", (new_status, report_id))
    conn.commit()
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Report not found"}), 404

    return jsonify({"message": "Report status updated", "report": dict(row)})

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY id DESC")
    rows = cursor.fetchall()
    alerts = [dict(row) for row in rows]
    conn.close()
    return jsonify({"alerts": alerts, "total": len(alerts)})

@app.route("/api/alerts", methods=["POST"])
def create_alert():
    data = request.get_json() or {}
    area = data.get("area", "").strip()
    risk_level = data.get("risk_level", "HIGH-RISK WARNING").strip()
    message = data.get("message", "").strip()

    if not area or not message:
        return jsonify({"error": "Area and warning message are required"}), 400

    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO alerts (area, risk_level, message, created_at)
        VALUES (?, ?, ?, ?)
    """, (area, risk_level, message, now))
    alert_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    new_alert = dict(cursor.fetchone())
    conn.close()

    return jsonify({"message": "Public warning issued successfully", "alert": new_alert}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    # Demo credentials from specification: admin@nersafe.demo / admin123
    if email == "admin@nersafe.demo" and password == "admin123":
        return jsonify({
            "authenticated": True,
            "token": "demo-token-ner-safe-authority",
            "user": {
                "name": "Disaster Management Authority",
                "role": "State Disaster Operations Officer",
                "email": email,
                "region": "NER Monitoring Command"
            }
        })
    else:
        return jsonify({
            "authenticated": False,
            "error": "Invalid demo credentials. Use admin@nersafe.demo / admin123"
        }), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
