import React from 'react';
import { ShieldAlert, AlertTriangle, MapPin, User, LogOut, Radio } from 'lucide-react';

interface NavbarProps {
  currentView: 'public' | 'report' | 'login' | 'authority';
  onNavigate: (view: 'public' | 'report' | 'login' | 'authority') => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  activeAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAuthenticated,
  onLogout,
  activeAlertCount
}) => {
  return (
    <header id="ner-safe-navbar" className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div
          onClick={() => onNavigate('public')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-mono">NER-SAFE</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SIH Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              North Eastern Region Landslide & Flood Monitoring
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-400">Monitoring 8 Hill States</span>
          {activeAlertCount > 0 && (
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30">
              {activeAlertCount} Warning{activeAlertCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onNavigate('public')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentView === 'public'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Public Map & Risk
          </button>

          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950/40 transition active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Hazard</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('authority')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentView === 'authority'
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-slate-800 text-blue-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                <span>Authority Console</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Sign out of Authority Portal"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Authority Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
