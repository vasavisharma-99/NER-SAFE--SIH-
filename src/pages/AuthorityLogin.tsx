import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { authorityLogin } from '../api';

interface AuthorityLoginProps {
  onLoginSuccess: (user: any) => void;
  onBack: () => void;
}

export const AuthorityLogin: React.FC<AuthorityLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('admin@nersafe.demo');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const data = await authorityLogin(email, password);
      setIsLoading(false);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Login failed. Please verify demo credentials.');
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('admin@nersafe.demo');
    setPassword('admin123');
    setErrorMsg(null);
  };

  return (
    <div id="ner-safe-login-page" className="max-w-md mx-auto px-4 py-12">
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public View</span>
        </button>
      </div>

      <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white font-mono">Authority Portal</h2>
          <p className="text-xs text-slate-400">
            State Disaster Management Authority & Early Warning Command
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 space-y-2">
          <div className="flex items-center justify-between font-bold text-blue-200">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span>SIH Demo Credentials</span>
            </span>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[10px] px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/30 transition"
            >
              Auto-Fill
            </button>
          </div>
          <div className="font-mono text-[11px] space-y-0.5 text-slate-300">
            <div>Email: <span className="text-white font-semibold">admin@nersafe.demo</span></div>
            <div>Password: <span className="text-white font-semibold">admin123</span></div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Officer Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Access Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950/50 transition active:scale-[0.99]"
          >
            <span>{isLoading ? 'Authenticating...' : 'Enter Authority Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
