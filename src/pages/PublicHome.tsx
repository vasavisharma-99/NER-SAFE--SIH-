import React from 'react';
import {
  AlertTriangle,
  CloudRain,
  Activity,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  Layers
} from 'lucide-react';
import { RiskZone, WeatherData, SensorData, CitizenReport, PublicAlert } from '../types';
import { RiskMap } from '../components/RiskMap';

interface PublicHomeProps {
  zones: RiskZone[];
  weather: WeatherData | null;
  sensors: SensorData[];
  reports: CitizenReport[];
  alerts: PublicAlert[];
  onReportClick: () => void;
  onAuthorityClick: () => void;
  isLoading: boolean;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  zones,
  weather,
  sensors,
  reports,
  alerts,
  onReportClick,
  onAuthorityClick,
  isLoading
}) => {
  const [selectedZone, setSelectedZone] = React.useState<RiskZone | null>(null);

  const highRiskCount = zones.filter((z) => z.risk_level === 'HIGH' || z.risk_level === 'CRITICAL').length;
  const blockedRoadCount = zones.filter((z) => z.road_status === 'BLOCKED').length;

  return (
    <div id="ner-safe-public-home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Smart India Hackathon • Working Disaster Warning Prototype</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              NER-SAFE
            </h1>
            <p className="text-lg font-medium text-emerald-300">
              Know the risk. Act before disaster.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              AI-enabled landslide early warning, ground displacement monitoring, and community hazard reporting for the fragile terrain of India's North Eastern Region.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onReportClick}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/50 transition transform hover:-translate-y-0.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Local Hazard</span>
            </button>
            <button
              type="button"
              onClick={onAuthorityClick}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              <span>Authority Portal</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Prototype Honesty Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>REAL: React 19 Frontend + SQLite DB + Trained Random Forest Model + Leaflet GIS</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>SIMULATED: IoT Sensor telemetry & weather forecast (IMD interface ready)</span>
          </div>
        </div>
      </div>

      {/* Active Public Warnings Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">Active Disaster Warnings</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
              {alerts.length} Issued
            </span>
          </div>
          <span className="text-xs text-slate-400">Official State & Regional Dispatches</span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No critical warnings issued at this moment. Regional monitoring ongoing.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 p-5 shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-500 text-white tracking-wide uppercase">
                      {alert.risk_level}
                    </span>
                    <span className="text-sm font-bold text-slate-200">{alert.area}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {alert.created_at}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 font-sans">
                  "{alert.message}"
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-rose-400 font-semibold">Immediate Community Action Advised</span>
                  <span>Issued via NER-SAFE Command</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regional Risk & Environmental Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* High Risk Zones */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical / High Zones</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{highRiskCount}</span>
            <span className="text-xs text-slate-400">of {zones.length} sectors</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Sikkim, Nagaland & Mizoram hill tracts under red watch.
          </p>
        </div>

        {/* Avg Rainfall */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">24h Avg Rainfall</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-400 font-mono">
              {weather ? `${weather.regional_average_rainfall_mm}` : '124.5'}
            </span>
            <span className="text-xs text-slate-400">mm</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Regional saturation index: <b className="text-slate-200">{weather?.soil_moisture_index || 76}%</b>
          </p>
        </div>

        {/* Citizen Reports Count */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Citizen Field Reports</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">{reports.length}</span>
            <span className="text-xs text-slate-400">verified & pending</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Direct geotagged community reports in database.
          </p>
        </div>

        {/* Road Closures */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Road Blockages</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">{blockedRoadCount}</span>
            <span className="text-xs text-slate-400">corridors blocked</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            NH-29 Kohima bypass currently obstructed by debris.
          </p>
        </div>
      </div>

      {/* Main Interactive GIS Risk Map */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>North Eastern Region GIS Risk Heatmap</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive OpenStreetMap GIS layer displaying ML risk vulnerability zones and citizen hazard markers.
            </p>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Click any risk circle to inspect slope parameters & road status</span>
          </div>
        </div>

        <RiskMap
          zones={zones}
          reports={reports}
          selectedZoneId={selectedZone?.id}
          onSelectZone={(zone) => setSelectedZone(zone)}
          heightClass="h-[520px]"
          showFilters={true}
        />
      </div>

      {/* Selected Zone Deep Dive (if clicked) */}
      {selectedZone && (
        <div className="rounded-2xl bg-slate-900 border border-blue-500/40 p-5 shadow-xl animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Selected Sector Analysis
              </span>
              <h3 className="text-xl font-black text-white">{selectedZone.name} ({selectedZone.state})</h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  selectedZone.risk_level === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : selectedZone.risk_level === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : selectedZone.risk_level === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {selectedZone.risk_level} RISK (Score: {selectedZone.risk_score.toFixed(2)})
              </span>
              <button
                type="button"
                onClick={() => setSelectedZone(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {selectedZone.main_reason}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400">Rainfall (24h)</div>
              <div className="text-base font-bold text-white font-mono mt-1">{selectedZone.rainfall_mm} mm</div>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400">Soil Moisture</div>
              <div className="text-base font-bold text-white font-mono mt-1">{selectedZone.soil_moisture}%</div>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400">Slope Gradient</div>
              <div className="text-base font-bold text-white font-mono mt-1">{selectedZone.slope_angle}°</div>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400">Corridor Status</div>
              <div
                className={`text-base font-bold font-mono mt-1 ${
                  selectedZone.road_status === 'BLOCKED'
                    ? 'text-rose-400'
                    : selectedZone.road_status === 'CAUTION'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {selectedZone.road_status}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Real-Time IoT Telemetry Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Hill Slope IoT Sensor Stations</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Simulated Telemetry
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Hardware stream emulator (soil moisture + ground displacement)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">{sensor.id}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    sensor.status === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : sensor.status === 'ALERT'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : sensor.status === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {sensor.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 truncate">{sensor.location}</h4>
              <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-800/60 font-mono">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Moisture</span>
                  <span className="font-bold text-blue-400">{sensor.soil_moisture}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Displacement</span>
                  <span className="font-bold text-amber-400">{sensor.ground_movement_mm} mm</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Slope: {sensor.tilt_deg}°</span>
                <span>Ping: {sensor.last_ping}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Road Connectivity Status Overview */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Key Regional Arterial Highways (NER Corridor Watch)</span>
          </h3>
          <span className="text-xs text-slate-400">Public Transit Advisory</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
            >
              <div>
                <div className="font-bold text-slate-200">{zone.name}</div>
                <div className="text-[11px] text-slate-400">Elev: {zone.elevation}m • Slope: {zone.slope_angle}°</div>
              </div>
              <span
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  zone.road_status === 'BLOCKED'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : zone.road_status === 'CAUTION'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {zone.road_status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
