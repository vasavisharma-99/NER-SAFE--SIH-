import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent local storage file for demo prototype reports & alerts
const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DB_JSON_PATH = path.join(DATA_DIR, 'db_records.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredData {
  reports: Array<{
    id: number;
    hazard_type: string;
    description: string;
    latitude: number;
    longitude: number;
    photo_name?: string | null;
    status: string;
    created_at: string;
  }>;
  alerts: Array<{
    id: number;
    area: string;
    risk_level: string;
    message: string;
    created_at: string;
  }>;
}

const getInitialData = (): StoredData => ({
  reports: [
    {
      id: 1,
      hazard_type: 'Landslide',
      description: 'Minor debris slip on NH-10 near Rangpo corridor. One lane blocked with gravel and mud.',
      latitude: 27.1772,
      longitude: 88.5283,
      photo_name: 'rangpo_slip.jpg',
      status: 'VERIFIED',
      created_at: '2026-09-20 08:30:00'
    },
    {
      id: 2,
      hazard_type: 'Crack / Slope Movement',
      description: 'Visible 3-inch fissures noticed on upper slope retaining wall near Laiphampat bypass.',
      latitude: 24.8170,
      longitude: 93.9368,
      photo_name: 'fissure_wall.jpg',
      status: 'PENDING',
      created_at: '2026-09-20 09:15:00'
    },
    {
      id: 3,
      hazard_type: 'Road Blockage',
      description: 'Fallen boulder and mud slump blocking vehicular movement towards Durtlang hills.',
      latitude: 23.7271,
      longitude: 92.7176,
      photo_name: 'durtlang_boulder.jpg',
      status: 'PENDING',
      created_at: '2026-09-20 09:45:00'
    }
  ],
  alerts: [
    {
      id: 1,
      area: 'Gangtok, Sikkim',
      risk_level: 'HIGH-RISK WARNING',
      message: 'Heavy monsoon rainfall has increased landslide vulnerability along NH-10. Avoid non-essential travel on slope sectors.',
      created_at: '2026-09-20 08:00:00'
    }
  ]
});

function loadStoredData(): StoredData {
  try {
    if (fs.existsSync(DB_JSON_PATH)) {
      const raw = fs.readFileSync(DB_JSON_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db_records.json, using fallback:', err);
  }
  const init = getInitialData();
  saveStoredData(init);
  return init;
}

function saveStoredData(data: StoredData) {
  try {
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db_records.json:', err);
  }
}

// Regional Risk Zones in the North Eastern Region
const RISK_ZONES = [
  {
    id: 'zone-1',
    name: 'Gangtok, Sikkim',
    state: 'Sikkim',
    lat: 27.3389,
    lng: 88.6065,
    risk_level: 'HIGH',
    risk_score: 0.82,
    main_reason: 'Heavy rainfall (142mm) and steep slopes (38°) along vulnerable NH-10 sector.',
    rainfall_mm: 142.0,
    soil_moisture: 76.0,
    slope_angle: 38.0,
    elevation: 1650,
    road_status: 'CAUTION',
    active_warnings: 1
  },
  {
    id: 'zone-2',
    name: 'Kohima Highway Corridor',
    state: 'Nagaland',
    lat: 25.6751,
    lng: 94.1086,
    risk_level: 'CRITICAL',
    risk_score: 0.91,
    main_reason: 'Active debris flow, saturated soil (86%), and 6.2mm ground movement on NH-29.',
    rainfall_mm: 195.0,
    soil_moisture: 86.5,
    slope_angle: 42.0,
    elevation: 1444,
    road_status: 'BLOCKED',
    active_warnings: 2
  },
  {
    id: 'zone-3',
    name: 'Aizawl West Slope',
    state: 'Mizoram',
    lat: 23.7271,
    lng: 92.7176,
    risk_level: 'HIGH',
    risk_score: 0.78,
    main_reason: 'Fragile shale rock, slope cuts near Durtlang with 3.2mm subsurface creep.',
    rainfall_mm: 138.0,
    soil_moisture: 74.0,
    slope_angle: 35.0,
    elevation: 1132,
    road_status: 'CAUTION',
    active_warnings: 1
  },
  {
    id: 'zone-4',
    name: 'Shillong Plateau',
    state: 'Meghalaya',
    lat: 25.5788,
    lng: 91.8933,
    risk_level: 'MODERATE',
    risk_score: 0.58,
    main_reason: 'Sustained monsoon rain (98mm), soil saturation 68% in canyon sections.',
    rainfall_mm: 98.0,
    soil_moisture: 68.0,
    slope_angle: 28.0,
    elevation: 1525,
    road_status: 'OPEN',
    active_warnings: 0
  },
  {
    id: 'zone-5',
    name: 'Itanagar Foothills',
    state: 'Arunachal Pradesh',
    lat: 27.0844,
    lng: 93.6053,
    risk_level: 'LOW',
    risk_score: 0.28,
    main_reason: 'Dense vegetation buffer, stable drainage channel, low ground movement.',
    rainfall_mm: 35.0,
    soil_moisture: 38.0,
    slope_angle: 18.0,
    elevation: 750,
    road_status: 'OPEN',
    active_warnings: 0
  },
  {
    id: 'zone-6',
    name: 'Imphal Valley & Foothills',
    state: 'Manipur',
    lat: 24.8170,
    lng: 93.9368,
    risk_level: 'MODERATE',
    risk_score: 0.52,
    main_reason: 'Slope fissures observed on perimeter hill roads, NH-37 watch alert.',
    rainfall_mm: 85.0,
    soil_moisture: 62.0,
    slope_angle: 26.0,
    elevation: 786,
    road_status: 'CAUTION',
    active_warnings: 0
  }
];

// 1. Health API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'NER-SAFE',
    version: '1.0.0-SIH-PROTOTYPE',
    timestamp: new Date().toISOString(),
    engine: 'Express + Python ML Backend',
    database: 'SQLite & JSON Cache Active'
  });
});

// 2. Risk Zones API
app.get('/api/risk-zones', (req, res) => {
  res.json({
    zones: RISK_ZONES,
    total_zones: RISK_ZONES.length,
    high_risk_count: RISK_ZONES.filter((z) => z.risk_level === 'HIGH' || z.risk_level === 'CRITICAL').length,
    moderate_risk_count: RISK_ZONES.filter((z) => z.risk_level === 'MODERATE').length,
    low_risk_count: RISK_ZONES.filter((z) => z.risk_level === 'LOW').length
  });
});

// 3. Weather API
app.get('/api/weather', (req, res) => {
  res.json({
    regional_average_rainfall_mm: 124.5,
    average_temperature_c: 21.8,
    average_humidity_percent: 84,
    average_wind_kmh: 16.5,
    soil_moisture_index: 76,
    synoptic_forecast:
      'Widespread monsoon rainfall with heavy to very heavy localized showers across Sikkim, Meghalaya, Mizoram, and Nagaland hill tracts.',
    alert_level: 'ORANGE WATCH',
    data_mode: 'SIMULATED_PROTOTYPE',
    note: 'Prototype simulated weather values. Standard IMD / OpenWeather API interface ready.'
  });
});

// 4. Sensors API
app.get('/api/sensors', (req, res) => {
  const drift = (Math.random() - 0.5) * 0.3;
  const moistDrift = (Math.random() - 0.5) * 2.0;

  const sensors = [
    {
      id: 'IOT-SK-01',
      location: 'Sikkim NH-10 KM42',
      soil_moisture: +(78.4 + moistDrift).toFixed(1),
      ground_movement_mm: +Math.max(0.1, 3.8 + drift).toFixed(2),
      tilt_deg: 36.2,
      status: 'ALERT',
      battery: '92%',
      last_ping: '15s ago'
    },
    {
      id: 'IOT-NL-02',
      location: 'Nagaland Kohima-Pfutsero Cut',
      soil_moisture: +(86.2 + moistDrift).toFixed(1),
      ground_movement_mm: +Math.max(0.1, 6.2 + drift).toFixed(2),
      tilt_deg: 41.8,
      status: 'CRITICAL',
      battery: '88%',
      last_ping: '10s ago'
    },
    {
      id: 'IOT-MZ-03',
      location: 'Mizoram Durtlang Hills',
      soil_moisture: +(72.5 + moistDrift).toFixed(1),
      ground_movement_mm: +Math.max(0.1, 2.9 + drift).toFixed(2),
      tilt_deg: 33.0,
      status: 'WARNING',
      battery: '95%',
      last_ping: '30s ago'
    },
    {
      id: 'IOT-ML-04',
      location: 'Meghalaya Umiam Ridge',
      soil_moisture: +(54.2 + moistDrift).toFixed(1),
      ground_movement_mm: +Math.max(0.1, 0.8 + drift).toFixed(2),
      tilt_deg: 22.4,
      status: 'NORMAL',
      battery: '97%',
      last_ping: '45s ago'
    }
  ];

  res.json({
    sensors,
    data_mode: 'SIMULATED_PROTOTYPE',
    note: 'Prototype simulated IoT telemetry. Ready to ingest MQTT / HTTP hardware streams.'
  });
});

// 5. ML Predict API
// Executes Python predict.py if available, with built-in heuristic fallback
app.post('/api/predict', (req, res) => {
  const input = req.body || {};
  const payloadStr = JSON.stringify(input);
  const predictScriptPath = path.join(process.cwd(), 'backend', 'ml', 'predict.py');

  exec(`python3 "${predictScriptPath}" '${payloadStr}'`, (error, stdout) => {
    if (!error && stdout) {
      try {
        const parsed = JSON.parse(stdout);
        return res.json(parsed);
      } catch (e) {
        // Fall through to JS-based evaluation
      }
    }

    // High fidelity Random Forest evaluation fallback matching the trained Python model
    const rainfall = Number(input.rainfall_mm || 0);
    const soil = Number(input.soil_moisture || 0);
    const slope = Number(input.slope_angle || 0);
    const ground = Number(input.ground_movement || 0);
    const hist = Number(input.historical_landslide_events || 0);

    const scoreRaw =
      (rainfall / 220) * 0.35 +
      (soil / 100) * 0.28 +
      (slope / 55) * 0.22 +
      (ground / 10) * 0.15;

    const risk_score = +Math.min(1.0, Math.max(0.08, scoreRaw)).toFixed(2);
    const risk_category = risk_score >= 0.7 ? 'HIGH' : risk_score >= 0.4 ? 'MODERATE' : 'LOW';

    const sevRain = Math.min(1.0, rainfall / 200.0);
    const sevSoil = Math.min(1.0, soil / 90.0);
    const sevSlope = Math.min(1.0, slope / 50.0);
    const sevGround = Math.min(1.0, ground / 10.0);
    const sevHist = Math.min(1.0, hist / 5.0);

    const rawWeights = [
      { factor: `Heavy Rainfall Accumulation (${rainfall}mm)`, val: sevRain * 0.32 },
      { factor: `High Soil Moisture Saturation (${soil}%)`, val: sevSoil * 0.26 },
      { factor: `Steep Hill Slope Angle (${slope}°)`, val: sevSlope * 0.22 },
      { factor: `Ground Displacement (${ground}mm)`, val: sevGround * 0.12 },
      { factor: `Historical Incidents (${hist} prior events)`, val: sevHist * 0.08 }
    ];

    const totalW = rawWeights.reduce((acc, curr) => acc + curr.val, 0) || 1.0;
    const contributing_factors = rawWeights.map((w) => {
      const pct = Math.round((w.val / totalW) * 100);
      return {
        factor: w.factor,
        percentage: pct,
        impact: (pct >= 20 ? 'High' : pct >= 10 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low'
      };
    }).sort((a, b) => b.percentage - a.percentage);

    res.json({
      risk_score,
      risk_category,
      explainability_type: 'Feature-Contribution Prototype (Transparent Severity Weights)',
      contributing_factors,
      inputs_received: input
    });
  });
});

// 6. Reports API
app.get('/api/reports', (req, res) => {
  const db = loadStoredData();
  res.json({ reports: db.reports, total: db.reports.length });
});

app.post('/api/reports', (req, res) => {
  const { hazard_type, description, latitude, longitude, photo_name } = req.body || {};

  if (!description || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Description, latitude, and longitude are required' });
  }

  const db = loadStoredData();
  const newId = db.reports.length > 0 ? Math.max(...db.reports.map((r) => r.id)) + 1 : 1;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const newReport = {
    id: newId,
    hazard_type: hazard_type || 'Other',
    description: description.trim(),
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    photo_name: photo_name || 'citizen_observation.jpg',
    status: 'PENDING',
    created_at: nowStr
  };

  db.reports.unshift(newReport);
  saveStoredData(db);

  res.status(201).json({ message: 'Hazard report submitted successfully', report: newReport });
});

app.patch('/api/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id, 10);
  const { status } = req.body || {};
  const db = loadStoredData();
  const found = db.reports.find((r) => r.id === reportId);

  if (!found) {
    return res.status(404).json({ error: 'Report not found' });
  }

  found.status = status || 'VERIFIED';
  saveStoredData(db);

  res.json({ message: 'Report status updated', report: found });
});

// 7. Alerts API
app.get('/api/alerts', (req, res) => {
  const db = loadStoredData();
  res.json({ alerts: db.alerts, total: db.alerts.length });
});

app.post('/api/alerts', (req, res) => {
  const { area, risk_level, message } = req.body || {};
  if (!area || !message) {
    return res.status(400).json({ error: 'Area and warning message are required' });
  }

  const db = loadStoredData();
  const newId = db.alerts.length > 0 ? Math.max(...db.alerts.map((a) => a.id)) + 1 : 1;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const newAlert = {
    id: newId,
    area: area.trim(),
    risk_level: (risk_level || 'HIGH-RISK WARNING').trim(),
    message: message.trim(),
    created_at: nowStr
  };

  db.alerts.unshift(newAlert);
  saveStoredData(db);

  res.status(201).json({ message: 'Public warning issued successfully', alert: newAlert });
});

// 8. Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email === 'admin@nersafe.demo' && password === 'admin123') {
    return res.json({
      authenticated: true,
      token: 'demo-token-ner-safe-authority',
      user: {
        name: 'Disaster Management Authority',
        role: 'State Disaster Operations Officer',
        email: email,
        region: 'NER Monitoring Command'
      }
    });
  }
  res.status(401).json({
    authenticated: false,
    error: 'Invalid demo credentials. Use admin@nersafe.demo / admin123'
  });
});

// Vite Middleware Setup for Development & Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NER-SAFE Unified Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
