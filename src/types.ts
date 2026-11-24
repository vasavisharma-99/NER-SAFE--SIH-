export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RoadStatus = 'OPEN' | 'CAUTION' | 'BLOCKED';
export type HazardType = 'Landslide' | 'Flash Flood' | 'Road Blockage' | 'Crack / Slope Movement' | 'Other';
export type ReportStatus = 'PENDING' | 'VERIFIED' | 'RESOLVED' | 'REJECTED';

export interface RiskZone {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  risk_level: RiskLevel;
  risk_score: number;
  main_reason: string;
  rainfall_mm: number;
  soil_moisture: number;
  slope_angle: number;
  elevation: number;
  road_status: RoadStatus;
  active_warnings: number;
}

export interface WeatherData {
  regional_average_rainfall_mm: number;
  average_temperature_c: number;
  average_humidity_percent: number;
  average_wind_kmh: number;
  soil_moisture_index: number;
  synoptic_forecast: string;
  alert_level: string;
  data_mode: string;
  note: string;
}

export interface SensorData {
  id: string;
  location: string;
  soil_moisture: number;
  ground_movement_mm: number;
  tilt_deg: number;
  status: 'NORMAL' | 'WARNING' | 'ALERT' | 'CRITICAL';
  battery: string;
  last_ping: string;
}

export interface CitizenReport {
  id: number;
  hazard_type: HazardType;
  description: string;
  latitude: number;
  longitude: number;
  photo_name?: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface PublicAlert {
  id: number;
  area: string;
  risk_level: string;
  message: string;
  created_at: string;
}

export interface ExplainabilityFactor {
  factor: string;
  percentage: number;
  impact: 'High' | 'Medium' | 'Low';
}

export interface PredictionInput {
  rainfall_mm: number;
  soil_moisture: number;
  slope_angle: number;
  elevation: number;
  historical_landslide_events: number;
  vegetation_index: number;
  ground_movement: number;
}

export interface PredictionResult {
  risk_score: number;
  risk_category: 'LOW' | 'MODERATE' | 'HIGH';
  explainability_type: string;
  contributing_factors: ExplainabilityFactor[];
  inputs_received: PredictionInput;
}
