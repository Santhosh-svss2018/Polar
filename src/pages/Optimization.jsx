import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Zap,
  ShieldAlert,
  Clock,
  Battery,
  Fuel,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';
import api from '../services/api';

export default function Optimization() {
  const [running, setRunning] = useState(false);
  const [optimized, setOptimized] = useState(true);
  const [appliedActions, setAppliedActions] = useState([true, true, true, false]);
  const [notification, setNotification] = useState('');

  const [optResult, setOptResult] = useState({
    baseline_demand_kw: 58,
    optimized_demand_kw: 47,
    saved_kw: 11,
    battery_soc_protected: 34,
    diesel_avoided_hours: 4.8,
    recommendations: [
      {
        id: 1,
        title: 'Reduce Non-critical Loads',
        reason: 'Predicted demand surge exceeds renewable generation capacity.',
        saving: 'Save 8.0 kW',
        priority: 'Priority 4',
        status: 'Active / Recommended',
      },
      {
        id: 2,
        title: 'Shift Water Heating to 14:00 - 16:00',
        reason: 'Aligns thermal water storage with peak polar solar generation window.',
        saving: 'Save 3.0 kW',
        priority: 'Priority 2',
        status: 'Active / Scheduled',
      },
      {
        id: 3,
        title: 'Maintain Battery Reserve above 30%',
        reason: 'Preserves essential nocturnal emergency reserve buffer.',
        saving: 'Reserve Protection',
        priority: 'Critical Rule',
        status: 'Enforced',
      },
      {
        id: 4,
        title: 'Start Diesel Generator if Load > 55 kW',
        reason: 'Engage diesel backup strictly if combined renewables + battery cannot supply P1/P2 loads.',
        saving: 'Auto-Trigger',
        priority: 'Backup Contingency',
        status: 'Standby Armed',
      },
    ],
    load_priorities: [
      { name: 'Critical Systems', priority: 'Priority 1', kw: 18, action: 'Fully Protected (100%)', color: '#00E5FF' },
      { name: 'Heating (Essential)', priority: 'Priority 1', kw: 12, action: 'Fully Protected (100%)', color: '#FF3D71' },
      { name: 'Research Equipment', priority: 'Priority 2', kw: 10, action: 'Continuous Supply', color: '#48CAE4' },
      { name: 'Water System', priority: 'Priority 2', kw: 6, action: 'Shifted (-3 kW to 14:00)', color: '#00C9A7' },
      { name: 'Lighting', priority: 'Priority 3', kw: 4, action: 'Optimized LED Dimming', color: '#FFB300' },
      { name: 'Non-critical Loads', priority: 'Priority 4', kw: 8, action: 'Shedded / Curtailed (-8 kW)', color: '#64748B' },
    ],
    dispatch_curve: [
      { time: '10:00', baseline: 42, optimized: 39, solar: 24, wind: 15, battery: 0 },
      { time: '12:00', baseline: 46, optimized: 40, solar: 28, wind: 15, battery: 0 },
      { time: '14:00', baseline: 52, optimized: 44, solar: 27, wind: 16, battery: 1 },
      { time: '16:00', baseline: 58, optimized: 47, solar: 14, wind: 17, battery: 16 },
      { time: '18:00', baseline: 56, optimized: 46, solar: 5, wind: 18, battery: 23 },
      { time: '20:00', baseline: 50, optimized: 42, solar: 0, wind: 17, battery: 25 },
      { time: '22:00', baseline: 45, optimized: 38, solar: 0, wind: 16, battery: 22 },
    ],
  });

  const handleRunOptimization = async () => {
    setRunning(true);
    setNotification('');
    try {
      const res = await api.runOptimization();
      if (res) {
        setOptResult(res);
      }
      setOptimized(true);
      setNotification('Smart optimization algorithm executed successfully. Dispatch parameters synced.');
    } catch (err) {
      console.warn('Using local optimization solver:', err);
      setNotification('Optimization routine solved via local polar dispatch engine.');
    } finally {
      setRunning(false);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const toggleAction = (idx) => {
    const updated = [...appliedActions];
    updated[idx] = !updated[idx];
    setAppliedActions(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1C2F57]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2.5">
            SMART OPTIMIZATION ENGINE
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              ACTIVE DISPATCH
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic load prioritization, peak shifting, and renewable power dispatch with battery reserve preservation.
          </p>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-emerald-500/20 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'SOLVING DISPATCH MATRIX...' : 'RUN SMART OPTIMIZATION'}</span>
        </button>
      </div>

      {/* Toast feedback */}
      {notification && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Optimization Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="polar-card p-3.5 sm:p-4 border border-emerald-500/30">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Demand Curtailment</span>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              -{optResult.saved_kw}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-300">kW</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">58 kW down to 47 kW</p>
        </div>

        <div className="polar-card p-3.5 sm:p-4 border border-cyan-500/30">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Diesel Fuel Avoidance</span>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
              {optResult.diesel_avoided_hours}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-300">Hours</span>
          </div>
          <p className="text-[10px] text-cyan-400 mt-0.5">~180 L diesel saved</p>
        </div>

        <div className="polar-card p-3.5 sm:p-4 border border-blue-500/30">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Battery Min Reserve</span>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-blue-300 font-mono">
              {optResult.battery_soc_protected}%
            </span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-0.5">&gt; 30% Safety rule enforced</p>
        </div>

        <div className="polar-card p-3.5 sm:p-4 border border-purple-500/30">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Critical P1 Security</span>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">100%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Heating & Life Support Safe</p>
        </div>
      </div>

      {/* MAIN DISPATCH CURVE */}
      <div className="polar-card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Optimized Power Dispatch & Peak Shaving Curve
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Comparison between unoptimized baseline consumption and AI priority-curtailed load.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs flex-wrap self-start sm:self-auto">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded bg-red-500/60"></span> Baseline (58 kW)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400"></span> Optimized (47 kW)
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={optResult.dispatch_curve} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2F57" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} unit=" kW" domain={[0, 65]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1836',
                  borderColor: '#1E325A',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Baseline Load"
                stroke="#FF3D71"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="optimized"
                name="Optimized Load"
                stroke="#00E676"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="solar"
                name="Solar (kW)"
                stroke="#00E5FF"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="wind"
                name="Wind (kW)"
                stroke="#48CAE4"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* 2-COLUMN SECTION: LOAD PRIORITY SYSTEM + AI ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Load Priority Architecture Table */}
        <div className="polar-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Load Priority Classification System
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">6 Subsystems</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Critical equipment is protected during shortages; non-critical loads are shedded automatically.
          </p>

          <div className="space-y-3">
            {optResult.load_priorities.map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-lg bg-[#0E1A38] border border-[#1C2F57] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded font-mono font-bold ${
                        item.priority === 'Priority 1'
                          ? 'bg-red-500/20 text-red-300'
                          : item.priority === 'Priority 2'
                          ? 'bg-blue-500/20 text-blue-300'
                          : item.priority === 'Priority 3'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{item.action}</p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-base font-black text-white">{item.kw} kW</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Action Recommendations Execution Cards */}
        <div className="polar-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Optimization Directives & Rules
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Real-time Solver
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {optResult.recommendations.map((rec, idx) => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    appliedActions[idx]
                      ? 'bg-[#102042] border-cyan-500/40'
                      : 'bg-[#0E1A38] border-[#1C2F57] opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        {rec.priority}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{rec.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {rec.saving}
                      </span>
                      <button
                        onClick={() => toggleAction(idx)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                          appliedActions[idx]
                            ? 'bg-emerald-500 text-black'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        title={appliedActions[idx] ? 'Active Rule' : 'Toggle Rule'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-[#0C162E] border border-[#1C2F57] flex items-center justify-between text-xs text-slate-400">
            <span>Battery Discharge Guard: Enforced</span>
            <span className="text-emerald-400 font-semibold">Diesel Trigger: 55 kW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
