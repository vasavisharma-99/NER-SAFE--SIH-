import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Camera,
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  Navigation,
  Loader2,
  FileCheck
} from 'lucide-react';
import { HazardType } from '../types';
import { submitHazardReport } from '../api';

interface ReportHazardProps {
  onBack: () => void;
  onSuccess: () => void;
}

const HAZARD_OPTIONS: { type: HazardType; description: string }[] = [
  { type: 'Landslide', description: 'Active mudslide, rockfall, or mass slope failure' },
  { type: 'Flash Flood', description: 'Rapid hill stream rise, culvert overflow, or valley inundation' },
  { type: 'Road Blockage', description: 'Boulder on carriageway, mud accumulation, or road collapse' },
  { type: 'Crack / Slope Movement', description: 'Visible fissures in retaining wall, ground subsidence, or road cracks' },
  { type: 'Other', description: 'Other dangerous geological or hydrological events' }
];

const PRESET_NER_LOCATIONS = [
  { label: 'Sikkim (NH-10 Rangpo)', lat: 27.1772, lng: 88.5283 },
  { label: 'Nagaland (Kohima Bypass)', lat: 25.6751, lng: 94.1086 },
  { label: 'Mizoram (Durtlang Hill)', lat: 23.7650, lng: 92.7300 },
  { label: 'Meghalaya (Shillong Peak Rd)', lat: 25.5385, lng: 91.8490 },
  { label: 'Arunachal (Doimukh Hill)', lat: 27.1350, lng: 93.7500 }
];

export const ReportHazard: React.FC<ReportHazardProps> = ({ onBack, onSuccess }) => {
  const [hazardType, setHazardType] = useState<HazardType>('Landslide');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<string>('27.1772');
  const [longitude, setLongitude] = useState<string>('88.5283');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your current browser.');
      return;
    }
    setIsLocating(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg('Could not retrieve browser coordinates: ' + err.message + '. You can type coordinates or select a preset location below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApplyPreset = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setErrorMsg(null);
  };

  const handleSimulatedPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMsg('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please provide a brief description of the observed hazard.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitHazardReport({
        hazard_type: hazardType,
        description: description.trim(),
        latitude: latNum,
        longitude: lngNum,
        photo_name: photoName || 'citizen_observation.jpg'
      });
      setIsSubmitting(false);
      setSuccessNotice(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <div id="ner-safe-report-page" className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Regional Map</span>
        </button>
        <span className="text-xs text-slate-400">Citizen & Field Incident Log</span>
      </div>

      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Public Hazard Submission • No Login Required</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Report Geo-Hazard or Blockage
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Your real-time field observation reaches state emergency operations centers immediately and alerts nearby travelers on the GIS network.
          </p>
        </div>

        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">Hazard Report Dispatched to State Database!</div>
              <div className="text-xs text-emerald-400/80">Saved to SQLite & visible to Authority Command Console. Returning to map...</div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hazard Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Hazard Type <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HAZARD_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setHazardType(opt.type)}
                  className={`p-3 rounded-xl border text-left transition ${
                    hazardType === opt.type
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span className={hazardType === opt.type ? 'text-amber-400' : 'text-slate-200'}>
                      {opt.type}
                    </span>
                    {hazardType === opt.type && (
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Location Coordinates & Browser Geolocation */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Incident Coordinates</span>
                  <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400">Use GPS or click quick North East hill sector presets</p>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition self-start sm:self-auto"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Getting GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 27.1772"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 88.5283"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Presets for Demo */}
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1.5">
                Quick NER Presets (1-Click Test):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_NER_LOCATIONS.map((loc) => (
                  <button
                    key={loc.label}
                    type="button"
                    onClick={() => handleApplyPreset(loc.lat, loc.lng)}
                    className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Incident Description & Status <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, lane obstruction, slope cracking, or debris volume (e.g. 'Active rockfall on road bend, mud slurry covering 10 meters, light vehicles halted')..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
            />
          </div>

          {/* Optional Photo Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Photo / Evidence Attachment</span>
              <span className="text-[10px] font-normal text-slate-500 uppercase">Optional</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-center transition bg-slate-950/40">
              <input
                type="file"
                accept="image/*"
                onChange={handleSimulatedPhoto}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                {photoName ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <FileCheck className="w-4 h-4" />
                    <span>Attached: {photoName}</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-slate-500" />
                    <span className="text-xs text-slate-300 font-medium">
                      Drag and drop image or click to browse
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Supports JPG, PNG, WebP up to 10MB
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || successNotice}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/50 transition active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Disaster Operations Center...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Submit Hazard Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
