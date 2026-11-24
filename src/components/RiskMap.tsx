import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RiskZone, CitizenReport, RiskLevel } from '../types';

interface RiskMapProps {
  zones: RiskZone[];
  reports: CitizenReport[];
  selectedZoneId?: string | null;
  onSelectZone?: (zone: RiskZone) => void;
  heightClass?: string;
  showFilters?: boolean;
}

const RISK_COLOR_MAP: Record<RiskLevel, { hex: string; bg: string; text: string; label: string }> = {
  LOW: { hex: '#10b981', bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Low Risk' },
  MODERATE: { hex: '#eab308', bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Moderate' },
  HIGH: { hex: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'High Risk' },
  CRITICAL: { hex: '#ef4444', bg: 'bg-rose-500/20', text: 'text-rose-400', label: 'Critical' }
};

export const RiskMap: React.FC<RiskMapProps> = ({
  zones,
  reports,
  selectedZoneId,
  onSelectZone,
  heightClass = 'h-[520px]',
  showFilters = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const zoneLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const reportLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = React.useState<'ALL' | 'CRITICAL_HIGH' | 'REPORTS'>('ALL');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on Northeast India
    const map = L.map(mapContainerRef.current, {
      center: [25.8, 92.8],
      zoom: 7,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap standard tile provider with custom dark styling attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors | NER-SAFE GIS'
    }).addTo(map);

    zoneLayerGroupRef.current = L.layerGroup().addTo(map);
    reportLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers when zones, reports, or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const zoneGroup = zoneLayerGroupRef.current;
    const reportGroup = reportLayerGroupRef.current;
    if (!map || !zoneGroup || !reportGroup) return;

    zoneGroup.clearLayers();
    reportGroup.clearLayers();

    // 1. Render Risk Zones
    if (activeFilter !== 'REPORTS') {
      zones.forEach((zone) => {
        if (activeFilter === 'CRITICAL_HIGH' && zone.risk_level !== 'HIGH' && zone.risk_level !== 'CRITICAL') {
          return;
        }

        const colorCfg = RISK_COLOR_MAP[zone.risk_level] || RISK_COLOR_MAP.LOW;
        const radius = zone.risk_level === 'CRITICAL' ? 32000 : zone.risk_level === 'HIGH' ? 24000 : 18000;

        // Visual risk influence area (circle)
        const circle = L.circle([zone.lat, zone.lng], {
          radius: radius,
          color: colorCfg.hex,
          fillColor: colorCfg.hex,
          fillOpacity: 0.22,
          weight: 2,
          dashArray: zone.risk_level === 'CRITICAL' ? '4, 4' : undefined
        });

        // Pulsing custom HTML marker
        const isSelected = selectedZoneId === zone.id;
        const customIcon = L.divIcon({
          className: 'custom-risk-marker',
          html: `
            <div className="relative flex items-center justify-center cursor-pointer group">
              <div className="absolute w-8 h-8 rounded-full animate-ping opacity-40" style="background-color: ${colorCfg.hex};"></div>
              <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg font-bold text-[10px] text-white" style="background-color: ${colorCfg.hex};">
                ${zone.risk_score.toFixed(2)}
              </div>
              <div className="absolute -top-7 whitespace-nowrap bg-slate-900/90 text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-700 shadow-md">
                ${zone.name}
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([zone.lat, zone.lng], { icon: customIcon });

        const popupContent = `
          <div className="p-3 text-slate-900 max-w-[280px] font-sans">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">${zone.state}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded" style="background-color: ${colorCfg.hex}22; color: ${colorCfg.hex};">
                ${zone.risk_level} (${(zone.risk_score * 100).toFixed(0)}%)
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 leading-tight mb-2">${zone.name}</h4>
            <p className="text-xs text-slate-700 mb-3">${zone.main_reason}</p>
            <div className="grid grid-cols-2 gap-1 text-[11px] bg-slate-100 p-2 rounded mb-2 text-slate-800">
              <div>Rainfall: <b>${zone.rainfall_mm} mm</b></div>
              <div>Soil Sat: <b>${zone.soil_moisture}%</b></div>
              <div>Slope: <b>${zone.slope_angle}°</b></div>
              <div>Road: <b className="${zone.road_status === 'BLOCKED' ? 'text-red-600' : zone.road_status === 'CAUTION' ? 'text-amber-600' : 'text-emerald-600'}">${zone.road_status}</b></div>
            </div>
            <div className="text-[10px] text-slate-500 italic">SIH GIS Early Warning Layer • Live Telemetry</div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 300 });

        marker.on('click', () => {
          if (onSelectZone) onSelectZone(zone);
        });

        circle.addTo(zoneGroup);
        marker.addTo(zoneGroup);

        if (isSelected) {
          marker.openPopup();
        }
      });
    }

    // 2. Render Citizen Reports
    if (activeFilter !== 'CRITICAL_HIGH') {
      reports.forEach((rep) => {
        const hazardIcon = L.divIcon({
          className: 'citizen-report-pin',
          html: `
            <div className="relative flex items-center justify-center cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-slate-950 font-black text-[10px] shadow-lg">
                !
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const repMarker = L.marker([rep.latitude, rep.longitude], { icon: hazardIcon });
        const repPopup = `
          <div className="p-3 text-slate-900 max-w-[260px] font-sans">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Citizen Report #${rep.id}</span>
              <span className="text-[10px] font-bold ${rep.status === 'VERIFIED' ? 'text-emerald-600' : 'text-slate-600'}">${rep.status}</span>
            </div>
            <h5 className="text-sm font-bold text-slate-900 mb-1">${rep.hazard_type}</h5>
            <p className="text-xs text-slate-700 mb-2">${rep.description}</p>
            <div className="text-[10px] text-slate-500">
              Coords: ${rep.latitude.toFixed(4)}, ${rep.longitude.toFixed(4)}<br/>
              Reported: ${rep.created_at}
            </div>
          </div>
        `;
        repMarker.bindPopup(repPopup, { maxWidth: 280 });
        repMarker.addTo(reportGroup);
      });
    }
  }, [zones, reports, activeFilter, selectedZoneId, onSelectZone]);

  const flyToRegion = (lat: number, lng: number, zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  return (
    <div id="ner-safe-map-wrapper" className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
      {/* Map Header / Filter Bar */}
      {showFilters && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 mr-1">GIS View:</span>
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Risk Zones ({zones.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('CRITICAL_HIGH')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeFilter === 'CRITICAL_HIGH'
                ? 'bg-rose-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            High & Critical
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('REPORTS')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeFilter === 'REPORTS'
                ? 'bg-amber-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Citizen Reports ({reports.length})
          </button>
        </div>
      )}

      {/* Quick Regional Jump Shortcuts */}
      <div className="absolute top-3 right-3 z-[1000] hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[11px] text-slate-300">
        <span className="text-slate-500 font-medium">Quick Jump:</span>
        <button
          type="button"
          onClick={() => flyToRegion(27.3389, 88.6065, 9)}
          className="px-2 py-0.5 hover:text-white hover:bg-slate-800 rounded transition"
        >
          Sikkim
        </button>
        <button
          type="button"
          onClick={() => flyToRegion(25.5788, 91.8933, 9)}
          className="px-2 py-0.5 hover:text-white hover:bg-slate-800 rounded transition"
        >
          Meghalaya
        </button>
        <button
          type="button"
          onClick={() => flyToRegion(23.7271, 92.7176, 9)}
          className="px-2 py-0.5 hover:text-white hover:bg-slate-800 rounded transition"
        >
          Mizoram
        </button>
        <button
          type="button"
          onClick={() => flyToRegion(25.6751, 94.1086, 9)}
          className="px-2 py-0.5 hover:text-white hover:bg-slate-800 rounded transition"
        >
          Nagaland
        </button>
        <button
          type="button"
          onClick={() => flyToRegion(25.8, 92.8, 7)}
          className="px-2 py-0.5 text-blue-400 hover:bg-slate-800 rounded transition"
        >
          Reset
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg text-[11px]">
        <div className="font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
          <span>Risk Vulnerability Scale</span>
          <span className="text-[9px] text-slate-400 ml-3">OSM Leaflet</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">LOW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-300">MODERATE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
            <span className="text-slate-300">HIGH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-slate-300">CRITICAL</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">!</span>
            <span className="text-slate-300">Report</span>
          </div>
        </div>
      </div>
    </div>
  );
};
