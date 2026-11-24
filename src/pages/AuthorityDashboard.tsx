import React, { useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  Activity,
  Compass,
  Radio,
  Cpu,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import {
  RiskZone,
  WeatherData,
  SensorData,
  CitizenReport,
  PublicAlert,
  PredictionInput,
  PredictionResult
} from '../types';
import { RiskMap } from '../components/RiskMap';
import { predictLandslideRisk, issueWarning, updateReportStatus } from '../api';

interface AuthorityDashboardProps {
  zones: RiskZone[];
  weather: WeatherData | null;
  sensors: SensorData[];
  reports: CitizenReport[];
  alerts: PublicAlert[];
  onRefreshData: () => void;
  onAlertCreated: () => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  zones,
  weather,
  sensors,
  reports,
  alerts,
  onRefreshData,
  onAlertCreated
}) => {
  // ML Model State
  const [mlInputs, setMlInputs] = useState<PredictionInput>({
    rainfall_mm: 142,
    soil_moisture: 76,
    slope_angle: 34,
    elevation: 1200,
    historical_landslide_events: 4,
    vegetation_index: 0.38,
    ground_movement: 3.7
  });

  const [mlResult, setMlResult] = useState<PredictionResult | null>({
    risk_score: 0.82,
    risk_category: 'HIGH',
    explainability_type: 'Feature-Contribution Severity Prototype',
    contributing_factors: [
      { factor: 'Heavy Rainfall Accumulation (142mm)', percentage: 32, impact: 'High' },
      { factor: 'High Soil Moisture Saturation (76%)', percentage: 25, impact: 'High' },
      { factor: 'Steep Hill Slope Angle (34°)', percentage: 21, impact: 'High' },
      { factor: 'Ground Displacement (3.7mm)', percentage: 12, impact: 'Medium' },
      { factor: 'Historical Incidents (4 prior events)', percentage: 10, impact: 'Medium' }
    ],
    inputs_received: {
      rainfall_mm: 142,
      soil_moisture: 76,
      slope_angle: 34,
      elevation: 1200,
      historical_landslide_events: 4,
      vegetation_index: 0.38,
      ground_movement: 3.7
    }
  });

  const [isPredicting, setIsPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  // Warning Creation State
  const [warningArea, setWarningArea] = useState('Gangtok, Sikkim (NH-10 Corridor)');
  const [warningRiskLevel, setWarningRiskLevel] = useState('HIGH-RISK WARNING');
  const [warningMessage, setWarningMessage] = useState(
    'Heavy rainfall (142mm) and active 3.7mm ground creep have elevated landslide probability. Avoid vulnerable slope road cuts.'
  );
  const [isIssuingWarning, setIsIssuingWarning] = useState(false);
  const [warningSuccess, setWarningSuccess] = useState(false);

  // Status update
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);

  const highRiskCount = zones.filter((z) => z.risk_level === 'HIGH' || z.risk_level === 'CRITICAL').length;

  const handleRunPrediction = async () => {
    try {
      setIsPredicting(true);
      setPredictError(null);
      const res = await predictLandslideRisk(mlInputs);
      setMlResult(res);
      setIsPredicting(false);
    } catch (err: any) {
      setIsPredicting(false);
      setPredictError(err.message || 'Prediction failed');
    }
  };

  const handleLoadScenario = (scenario: 'high' | 'moderate' | 'low') => {
    if (scenario === 'high') {
      setMlInputs({
        rainfall_mm: 168,
        soil_moisture: 82,
        slope_angle: 42,
        elevation: 1650,
        historical_landslide_events: 5,
        vegetation_index: 0.28,
        ground_movement: 6.2
      });
      setWarningArea('Kohima-Pfutsero Corridor, Nagaland');
      setWarningRiskLevel('HIGH-RISK WARNING');
      setWarningMessage('Critical ground movement (6.2mm) & slope saturation. Vehicular movement halted on outer hill bends.');
    } else if (scenario === 'moderate') {
      setMlInputs({
        rainfall_mm: 92,
        soil_moisture: 64,
        slope_angle: 28,
        elevation: 1100,
        historical_landslide_events: 2,
        vegetation_index: 0.52,
        ground_movement: 1.4
      });
      setWarningArea('Aizawl West Slope, Mizoram');
      setWarningRiskLevel('MODERATE ADVISORY');
      setWarningMessage('Precipitation approaching threshold. Light vehicles advised to exercise caution near Durtlang cuts.');
    } else {
      setMlInputs({
        rainfall_mm: 32,
        soil_moisture: 35,
        slope_angle: 16,
        elevation: 650,
        historical_landslide_events: 0,
        vegetation_index: 0.74,
        ground_movement: 0.1
      });
      setWarningArea('Itanagar Foothills, Arunachal Pradesh');
      setWarningRiskLevel('NORMAL MONITORING');
      setWarningMessage('Normal conditions observed. Slope equilibrium stable with no recorded displacement.');
    }
  };

  const handleIssueWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningArea || !warningMessage) return;

    try {
      setIsIssuingWarning(true);
      await issueWarning({
        area: warningArea,
        risk_level: warningRiskLevel,
        message: warningMessage
      });
      setIsIssuingWarning(false);
      setWarningSuccess(true);
      onAlertCreated();
      setTimeout(() => setWarningSuccess(false), 4000);
    } catch (err: any) {
      setIsIssuingWarning(false);
      alert('Failed to issue warning: ' + err.message);
    }
  };

  const handleVerifyReport = async (id: number) => {
    try {
      setUpdatingReportId(id);
      await updateReportStatus(id, 'VERIFIED');
      onRefreshData();
      setUpdatingReportId(null);
    } catch (err) {
      setUpdatingReportId(null);
    }
  };

  return (
    <div id="ner-safe-authority-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              OFFICIAL COMMAND CONSOLE
            </span>
            <span className="text-xs text-slate-400">Authenticated: admin@nersafe.demo</span>
          </div>
          <h1 className="text-2xl font-black text-white font-mono mt-1">
            North Eastern Region Disaster Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300">
            Real-time geospatial analytics, trained Random Forest risk inference, and inter-agency warning dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshData}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Sync Live Feeds</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* High Risk Zone count */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk Sectors</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">{highRiskCount}</span>
            <span className="text-xs text-slate-400">of {zones.length} sectors</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Trigger threshold exceeded</span>
          </div>
        </div>

        {/* Citizen Field Reports Count */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Citizen Reports</span>
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">{reports.length}</span>
            <span className="text-xs text-slate-400">logged in DB</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{reports.filter(r => r.status === 'PENDING').length} pending verification</span>
          </div>
        </div>

        {/* Current Rainfall */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Rainfall</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-400 font-mono">
              {weather?.regional_average_rainfall_mm ?? 124.5}
            </span>
            <span className="text-xs text-slate-400">mm (24h)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            {weather?.alert_level ?? 'ORANGE WATCH'} • Hill zones
          </div>
        </div>

        {/* Current Soil Moisture */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Soil Moisture</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {weather?.soil_moisture_index ?? 76}%
            </span>
            <span className="text-xs text-slate-400">saturation</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400">
            Subsurface pore pressure high
          </div>
        </div>
      </div>

      {/* Large GIS Risk Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Regional GIS Risk Map & Incident Distribution</span>
          </h2>
          <span className="text-xs text-slate-400">Leaflet OpenStreetMap Layer</span>
        </div>
        <RiskMap
          zones={zones}
          reports={reports}
          heightClass="h-[460px]"
          showFilters={true}
        />
      </div>

      {/* ML Prediction & Explainable AI Engine Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Scikit-Learn Random Forest Classifier</span>
            </div>
            <h2 className="text-xl font-black text-white font-mono mt-1">
              AI Landslide Risk Prediction & Explainability Engine
            </h2>
            <p className="text-xs text-slate-300">
              Trained on historical North Eastern terrain datasets. Adjust environmental inputs to simulate risk scenarios.
            </p>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-slate-400 mr-1">Demo Scenarios:</span>
            <button
              type="button"
              onClick={() => handleLoadScenario('high')}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-semibold transition"
            >
              Monsoon Storm (High)
            </button>
            <button
              type="button"
              onClick={() => handleLoadScenario('moderate')}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 font-semibold transition"
            >
              Moderate Rain
            </button>
            <button
              type="button"
              onClick={() => handleLoadScenario('low')}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-semibold transition"
            >
              Dry Baseline (Low)
            </button>
          </div>
        </div>

        {predictError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {predictError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Features Form (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Input Environmental & Topographical Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rainfall */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Rainfall (mm)</span>
                  <span className="font-mono text-blue-400 font-bold">{mlInputs.rainfall_mm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="1"
                  value={mlInputs.rainfall_mm}
                  onChange={(e) => setMlInputs({ ...mlInputs, rainfall_mm: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <span className="text-[10px] text-slate-400 block">Typical threshold: &gt;110mm triggers mud flow</span>
              </div>

              {/* Soil Moisture */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Soil Moisture (%)</span>
                  <span className="font-mono text-emerald-400 font-bold">{mlInputs.soil_moisture}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={mlInputs.soil_moisture}
                  onChange={(e) => setMlInputs({ ...mlInputs, soil_moisture: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block">Pore saturation beyond 75% critical</span>
              </div>

              {/* Slope Angle */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Slope Angle (°)</span>
                  <span className="font-mono text-amber-400 font-bold">{mlInputs.slope_angle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="65"
                  step="1"
                  value={mlInputs.slope_angle}
                  onChange={(e) => setMlInputs({ ...mlInputs, slope_angle: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-slate-400 block">Slopes &gt;30° have acute slip potential</span>
              </div>

              {/* Ground Movement */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Ground Movement (mm)</span>
                  <span className="font-mono text-rose-400 font-bold">{mlInputs.ground_movement} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={mlInputs.ground_movement}
                  onChange={(e) => setMlInputs({ ...mlInputs, ground_movement: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500"
                />
                <span className="text-[10px] text-slate-400 block">Extensometer subsurface creep telemetry</span>
              </div>

              {/* Elevation */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Elevation (meters)</span>
                  <span className="font-mono text-slate-300 font-bold">{mlInputs.elevation} m</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="50"
                  value={mlInputs.elevation}
                  onChange={(e) => setMlInputs({ ...mlInputs, elevation: parseFloat(e.target.value) })}
                  className="w-full accent-blue-400"
                />
              </div>

              {/* Historical Incidents */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Historical Landslides</span>
                  <span className="font-mono text-slate-300 font-bold">{mlInputs.historical_landslide_events} events</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={mlInputs.historical_landslide_events}
                  onChange={(e) => setMlInputs({ ...mlInputs, historical_landslide_events: parseInt(e.target.value, 10) })}
                  className="w-full accent-blue-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunPrediction}
              disabled={isPredicting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-950/50 transition active:scale-[0.99]"
            >
              {isPredicting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Random Forest Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute ML Model Prediction</span>
                </>
              )}
            </button>
          </div>

          {/* ML Output & Explainability Panel (5 columns) */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Prediction & Explainability
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Model: RF-50-Tree
              </span>
            </div>

            {mlResult ? (
              <div className="space-y-4">
                {/* Result Score & Category */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Predicted Risk Score</span>
                    <div className="text-3xl font-black text-white font-mono mt-0.5">
                      {mlResult.risk_score.toFixed(2)}
                      <span className="text-xs text-slate-400 font-sans font-normal ml-1">/ 1.00</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Risk Category</span>
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase inline-block ${
                        mlResult.risk_category === 'HIGH'
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                          : mlResult.risk_category === 'MODERATE'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {mlResult.risk_category} RISK
                    </span>
                  </div>
                </div>

                {/* Explainable AI Factors */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Contributing Factors (Why this score?)</span>
                    <span className="text-[10px] text-slate-400 italic">Feature Severity Contribution</span>
                  </div>

                  <div className="space-y-2">
                    {mlResult.contributing_factors.map((cf) => (
                      <div key={cf.factor} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300 font-medium">{cf.factor}</span>
                          <span className="font-mono font-bold text-white">{cf.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              cf.impact === 'High'
                                ? 'bg-rose-500'
                                : cf.impact === 'Medium'
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${cf.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transparent Explainability Prototype Disclaimer */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-300">Explainability Prototype Notice:</span> This transparent heuristic breakdown maps input parameter severity relative to North Eastern hill failure thresholds to explain the model classification.
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Run prediction above to inspect ML results.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Citizen Hazard Reports Management Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Incoming Citizen & Field Hazard Reports</span>
            </h2>
            <p className="text-xs text-slate-400">
              Submitted live via Public Portal. Reports are persisted in SQLite and rendered on the GIS map.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{reports.length} Reports Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Hazard Type</th>
                <th className="p-3">Location Coords</th>
                <th className="p-3">Description</th>
                <th className="p-3">Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-slate-400">#{rep.id}</td>
                  <td className="p-3 font-bold text-white whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {rep.hazard_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300 whitespace-nowrap">
                    {rep.latitude.toFixed(4)}, {rep.longitude.toFixed(4)}
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs truncate" title={rep.description}>
                    {rep.description}
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {rep.created_at}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        rep.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {rep.status === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => handleVerifyReport(rep.id)}
                        disabled={updatingReportId === rep.id}
                        className="text-[11px] px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-200 border border-blue-500/40 transition"
                      >
                        {updatingReportId === rep.id ? 'Updating...' : 'Verify Hazard'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Public Warning Dispatch Form */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-rose-500/30 p-6 shadow-2xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>State Alert Broadcast System</span>
          </div>
          <h2 className="text-xl font-black text-white font-mono mt-1">
            Issue Public Early Warning
          </h2>
          <p className="text-xs text-slate-300">
            Dispatches immediate high-risk alerts to the public home page and community notification feeds.
          </p>
        </div>

        {warningSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-sm block">Warning Broadcast Issued Successfully!</span>
              <span>The alert has been saved to SQLite and is now live on the Public Home page.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleIssueWarning} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Target Sector / Corridor <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={warningArea}
                onChange={(e) => setWarningArea(e.target.value)}
                placeholder="e.g. Gangtok, Sikkim (NH-10)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Risk Classification Level <span className="text-rose-400">*</span>
              </label>
              <select
                value={warningRiskLevel}
                onChange={(e) => setWarningRiskLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="HIGH-RISK WARNING">HIGH-RISK WARNING (Urgent)</option>
                <option value="CRITICAL LANDSLIDE ALERT">CRITICAL LANDSLIDE ALERT (Evacuate)</option>
                <option value="FLASH FLOOD WATCH">FLASH FLOOD WATCH (Valley Drainage)</option>
                <option value="ROAD CLOSURE ADVISORY">ROAD CLOSURE ADVISORY (NH Cut)</option>
                <option value="MODERATE ADVISORY">MODERATE ADVISORY (Caution)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Public Warning Message <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              placeholder="Provide concrete instructions (e.g. 'Heavy rainfall has increased landslide risk. Avoid vulnerable hill roads between KM 35 and KM 48')..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Instant synchronization with citizen GIS view.
            </span>
            <button
              type="submit"
              disabled={isIssuingWarning}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isIssuingWarning ? 'Broadcasting Warning...' : 'SEND WARNING'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
