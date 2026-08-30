import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, KeyRound, User, Snowflake, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('polar123');
  const [station, setStation] = useState('Bharati Polar Station');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend call
      const res = await api.login(username, password, station);
      localStorage.setItem('polar_user', JSON.stringify({
        token: res.token || 'demo-token-polar-2026',
        username: res.username || username,
        station: res.station || station,
        role: 'System Administrator'
      }));
      navigate('/dashboard');
    } catch (err) {
      // Fallback for demo if backend is initializing
      if (username === 'admin' && password === 'polar123') {
        localStorage.setItem('polar_user', JSON.stringify({
          token: 'demo-token-polar-2026',
          username: 'admin',
          station: station,
          role: 'System Administrator'
        }));
        navigate('/dashboard');
      } else {
        setError(err.response?.data?.detail || 'Invalid station credentials. Please use admin / polar123.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1B] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md polar-card p-8 relative z-10 border border-[#1E325A] shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 mb-4 text-black">
            <Zap className="w-8 h-8 text-black fill-current" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">
            POLAR-ENERGY <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs font-semibold text-cyan-300 mt-1 uppercase tracking-widest">
            POLAR SMART ENERGY MANAGEMENT SYSTEM
          </p>
          <p className="text-xs text-slate-400 mt-1 italic">
            AI-Powered. Resilient. Sustainable.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Station Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Polar Research Station
            </label>
            <div className="relative">
              <Snowflake className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-sm text-slate-200 outline-none transition-colors cursor-pointer"
              >
                <option value="Bharati Polar Station">Bharati Polar Station (Active Primary)</option>
                <option value="Maitri Polar Station">Maitri Polar Station (Backup Telemetry)</option>
                <option value="Dakshin Gangotri">Dakshin Gangotri (Historical Node)</option>
              </select>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Operator Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-sm text-slate-200 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Station Security Key / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="polar123"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-sm text-slate-200 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>ACCESS ENERGY DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-6 pt-4 border-t border-[#1C2F57] text-center">
          <p className="text-[11px] text-slate-400">
            Demo Credentials:{' '}
            <span className="font-mono text-cyan-300 font-semibold">admin</span> /{' '}
            <span className="font-mono text-cyan-300 font-semibold">polar123</span>
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Bharati Station Telemetry Online (69°24'S, 76°11'E)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
