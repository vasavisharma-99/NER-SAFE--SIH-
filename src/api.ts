import {
  RiskZone,
  WeatherData,
  SensorData,
  CitizenReport,
  PublicAlert,
  PredictionInput,
  PredictionResult
} from './types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchRiskZones(): Promise<{
  zones: RiskZone[];
  total_zones: number;
  high_risk_count: number;
  moderate_risk_count: number;
  low_risk_count: number;
}> {
  const res = await fetch(`${API_BASE}/risk-zones`);
  if (!res.ok) throw new Error('Failed to fetch risk zones');
  return res.json();
}

export async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(`${API_BASE}/weather`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}

export async function fetchSensors(): Promise<{
  sensors: SensorData[];
  data_mode: string;
  note: string;
}> {
  const res = await fetch(`${API_BASE}/sensors`);
  if (!res.ok) throw new Error('Failed to fetch sensors');
  return res.json();
}

export async function predictLandslideRisk(input: PredictionInput): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error('Prediction API failed');
  return res.json();
}

export async function fetchReports(): Promise<{ reports: CitizenReport[]; total: number }> {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function submitHazardReport(report: {
  hazard_type: string;
  description: string;
  latitude: number;
  longitude: number;
  photo_name?: string | null;
}): Promise<{ message: string; report: CitizenReport }> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit report');
  }
  return res.json();
}

export async function updateReportStatus(id: number, status: string): Promise<{ message: string; report: CitizenReport }> {
  const res = await fetch(`${API_BASE}/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update report status');
  return res.json();
}

export async function fetchAlerts(): Promise<{ alerts: PublicAlert[]; total: number }> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function issueWarning(alert: {
  area: string;
  risk_level: string;
  message: string;
}): Promise<{ message: string; alert: PublicAlert }> {
  const res = await fetch(`${API_BASE}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to issue warning');
  }
  return res.json();
}

export async function authorityLogin(email: string, password: string): Promise<{
  authenticated: boolean;
  token?: string;
  user?: { name: string; role: string; email: string; region: string };
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok || !data.authenticated) {
    throw new Error(data.error || 'Login failed');
  }
  return data;
}
