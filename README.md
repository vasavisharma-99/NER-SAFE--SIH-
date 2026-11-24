# NER-SAFE — AI Disaster Early Warning & Landslide Monitoring Platform
**Smart India Hackathon (SIH) Working Prototype**

AI-enabled early warning and monitoring platform designed for the fragile hill terrain of India's North Eastern Region (NER) covering Sikkim, Meghalaya, Mizoram, Nagaland, Arunachal Pradesh, Manipur, Tripura, and Assam.

---

## 1. System Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Leaflet GIS with OpenStreetMap, Lucide Icons.
- **Backend**: Python Flask REST API & Unified Node/Express proxy on Port 3000.
- **Machine Learning**: Scikit-learn Random Forest Classifier trained on NER landslide environmental factors (`rainfall_mm`, `soil_moisture`, `slope_angle`, `elevation`, `historical_events`, `vegetation_index`, `ground_movement`).
- **Explainable AI (XAI)**: Transparent feature-contribution severity breakdown showing percentage drivers for high-risk assessments.
- **Database**: SQLite database (`nersafe.db`) storing citizen reports and authority warning alerts.
- **GIS Map**: Color-coded risk zones (GREEN = Low, YELLOW = Moderate, ORANGE = High, RED = Critical) with interactive popups and geotagged citizen hazard reports.

---

## 2. Final Folder Structure

```
NER-SAFE/
├── backend/
│   ├── app.py                     # Python Flask REST API
│   ├── database.py                # SQLite database setup and seeding
│   ├── requirements.txt           # Python dependencies
│   ├── data/
│   │   ├── landslide_data.csv     # Demonstration training dataset
│   │   └── db_records.json        # Fast cache for persistent records
│   ├── ml/
│   │   ├── train_model.py         # Scikit-learn Random Forest training script
│   │   ├── predict.py             # Inference and Explainable AI calculation
│   │   └── model.joblib           # Trained model artifact
│   └── uploads/                   # Optional citizen observation uploads
├── src/
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Main controller and view router
│   ├── api.ts                     # API client functions
│   ├── types.ts                   # TypeScript interfaces
│   ├── index.css                  # Global Tailwind CSS
│   ├── components/
│   │   ├── Navbar.tsx             # Top navigation & system status
│   │   └── RiskMap.tsx            # Interactive Leaflet GIS map with OSM
│   └── pages/
│       ├── PublicHome.tsx         # Citizen view with risk map & warnings
│       ├── ReportHazard.tsx       # Citizen hazard reporting with geolocation
│       ├── AuthorityLogin.tsx     # Officer authentication
│       └── AuthorityDashboard.tsx # Operations console, ML engine & warning dispatch
├── index.html                     # HTML entry point with Leaflet styles
├── metadata.json                  # Application metadata & permissions
├── package.json                   # Node dependencies & run scripts
├── server.ts                      # Full-stack Express server with Vite middleware
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite config
└── README.md                      # Project documentation
```

---

## 3. Demo Credentials

- **Email**: `admin@nersafe.demo`
- **Password**: `admin123`

---

## 4. Exact Commands to Run

### Standalone Python Backend
```bash
# 1. Install Python requirements
pip install -r backend/requirements.txt

# 2. Train the Random Forest ML Model
python3 backend/ml/train_model.py

# 3. Start the Flask API
python3 backend/app.py
```

### Frontend / Unified Full-Stack Dev Server (AI Studio & Local)
```bash
# Install node packages
npm install

# Start the full-stack server on port 3000
npm run dev
```

---

## 5. Demonstration Flow

1. **Public Home**: Open the application to view the regional risk status, live weather summary, simulated IoT sensors, and active warnings.
2. **GIS Heatmap**: Interact with the map to view risk zones in Gangtok, Aizawl, Kohima, Shillong, and Itanagar.
3. **Citizen Report**: Click **"Report Hazard"**, select hazard type (e.g. Landslide), get browser GPS coordinates or pick a quick preset, add a description, and submit.
4. **Authority Console**: Navigate to **"Authority Portal"**, log in with `admin@nersafe.demo` / `admin123`.
5. **Report Inspection**: View the submitted citizen report in the table and verify its status.
6. **ML Prediction**: Open the AI Landslide Risk Prediction panel, adjust environmental inputs (rainfall, slope, soil moisture, ground movement), and run the Random Forest model to view the risk score and explainability factors.
7. **Warning Dispatch**: Use the **"Issue Public Warning"** form to broadcast a new high-risk warning.
8. **Live Verification**: Return to the Public Home page and confirm the newly dispatched warning is immediately visible to citizens.
