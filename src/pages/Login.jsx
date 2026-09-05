import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, KeyRound, User, Snowflake, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [station, setStation] = useState('Bharati Polar Station');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username.trim(), password, station);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This operator account is currently disabled. Contact the administrator.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError(err.response?.data?.detail || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06131D] flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#48D5FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-[#299BD7]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md p-5 sm:p-8 relative z-10 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-2xl shadow-black/80">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#299BD7] to-[#48D5FF] shadow-lg shadow-[#48D5FF]/20 mb-3 sm:mb-4 text-black">
            <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-black fill-current" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#EFFFFF] tracking-wider">
            POLAR ENERGY <span className="text-[#48D5FF]">AI</span>
          </h1>
          <p className="text-[10px] sm:text-[11px] font-extrabold text-[#48D5FF] mt-1 uppercase tracking-widest">
            AUTONOMOUS MICROGRID CONTROL SYSTEM
          </p>
          <p className="text-[11px] sm:text-xs text-[#89A7B7] mt-1">
            Remote Energy System • Live Digital Twin
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-[#FF6257]/15 border border-[#FF6257]/30 text-[#FF6257] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Station Selection */}
          <div>
            <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1.5">
              POLAR RESEARCH FACILITY
            </label>
            <div className="relative">
              <Snowflake className="w-4 h-4 text-[#48D5FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none transition-colors cursor-pointer"
              >
                <option value="Bharati Polar Station">Bharati Polar Station (Active Primary)</option>
                <option value="Maitri Polar Station">Maitri Polar Station (Backup Telemetry)</option>
                <option value="Dakshin Gangotri">Dakshin Gangotri (Historical Node)</option>
              </select>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1.5">
              OPERATOR USERNAME
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#89A7B7] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter operator username"
                className="w-full pl-10 pr-4 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none font-mono transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#89A7B7] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-[#299BD7] to-[#48D5FF] hover:from-[#48D5FF] hover:to-[#35D47A] text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#48D5FF]/20 transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>AUTHENTICATING ACCESS...</span>
            ) : (
              <>
                <span>LOGIN TO POLAR ENERGY AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-6 pt-4 border-t border-[#102B3B] text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#35D47A]">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Fast-Telemetry Authenticated Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
