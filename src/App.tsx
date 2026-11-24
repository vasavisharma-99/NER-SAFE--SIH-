import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PublicHome } from './pages/PublicHome';
import { ReportHazard } from './pages/ReportHazard';
import { AuthorityLogin } from './pages/AuthorityLogin';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import {
  RiskZone,
  WeatherData,
  SensorData,
  CitizenReport,
  PublicAlert
} from './types';
import {
  fetchRiskZones,
  fetchWeather,
  fetchSensors,
  fetchReports,
  fetchAlerts
} from './api';

export default function App() {
  const [currentView, setCurrentView] = useState<'public' | 'report' | 'login' | 'authority'>('public');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nersafe_auth') === 'true';
  });

  const [zones, setZones] = useState<RiskZone[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    try {
      const [zonesRes, weatherRes, sensorsRes, reportsRes, alertsRes] = await Promise.all([
        fetchRiskZones().catch(() => ({ zones: [] })),
        fetchWeather().catch(() => null),
        fetchSensors().catch(() => ({ sensors: [] })),
        fetchReports().catch(() => ({ reports: [] })),
        fetchAlerts().catch(() => ({ alerts: [] }))
      ]);

      if (zonesRes?.zones) setZones(zonesRes.zones);
      if (weatherRes) setWeather(weatherRes);
      if (sensorsRes?.sensors) setSensors(sensorsRes.sensors);
      if (reportsRes?.reports) setReports(reportsRes.reports);
      if (alertsRes?.alerts) setAlerts(alertsRes.alerts);
    } catch (err) {
      console.error('Error loading NER-SAFE data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    // Poll updates every 15 seconds to reflect simulated IoT sensor changes and new alerts
    const interval = setInterval(loadAllData, 15000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  const handleLoginSuccess = (_user: any) => {
    setIsAuthenticated(true);
    localStorage.setItem('nersafe_auth', 'true');
    setCurrentView('authority');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nersafe_auth');
    setCurrentView('public');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'authority' && !isAuthenticated) {
            setCurrentView('login');
          } else {
            setCurrentView(view);
          }
        }}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        activeAlertCount={alerts.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'public' && (
          <PublicHome
            zones={zones}
            weather={weather}
            sensors={sensors}
            reports={reports}
            alerts={alerts}
            onReportClick={() => setCurrentView('report')}
            onAuthorityClick={() => setCurrentView(isAuthenticated ? 'authority' : 'login')}
            isLoading={isLoading}
          />
        )}

        {currentView === 'report' && (
          <ReportHazard
            onBack={() => setCurrentView('public')}
            onSuccess={() => {
              loadAllData();
              setCurrentView('public');
            }}
          />
        )}

        {currentView === 'login' && (
          <AuthorityLogin
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentView('public')}
          />
        )}

        {currentView === 'authority' && (
          <AuthorityDashboard
            zones={zones}
            weather={weather}
            sensors={sensors}
            reports={reports}
            alerts={alerts}
            onRefreshData={loadAllData}
            onAlertCreated={loadAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">NER-SAFE</span>
            <span>•</span>
            <span>Smart India Hackathon Working Prototype</span>
            <span>•</span>
            <span>North Eastern Hill Disaster Early Warning</span>
          </div>
          <div className="text-[11px] text-slate-400">
            States: Sikkim • Assam • Meghalaya • Nagaland • Mizoram • Manipur • Tripura • Arunachal Pradesh
          </div>
        </div>
      </footer>
    </div>
  );
}
