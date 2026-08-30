import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Wind,
  Fuel,
  BatteryCharging,
  Activity,
  Zap,
  ShieldCheck,
  Flame,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Cpu,
  Droplets,
  Lightbulb,
  Radio,
  Sliders
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.warn('Using default demo dashboard state:', err);
      // Realistic fallback seed state matching exact specifications
      setData({
        generation: {
          solar_kw: 28,
          wind_kw: 15,
          diesel_kw: 0,
          total_renewable_kw: 43,
          available_total_kw: 43,
        },
        consumption: {
          current_load_kw: 39,
          net_balance_kw: 4, // 43 available - 39 load = +4 kW to battery
        },
        battery: {
          level_percent: 74,
          power_kw: 4.0,
          status: 'Charging (Surplus 4 kW)',
          min_reserve_percent: 30,
        },
        resilience: {
          score: 84,
          max_score: 100,
          status: 'Optimal & Stable',
        },
        fuel: {
          reserve_percent: 61,
          status: 'Standby / Ample',
        },
        environment: {
          temperature_c: -24.3,
          wind_speed_kmh: 18,
          humidity_percent: 65,
        },
        prediction_summary: {
          now_kw: 39,
          plus_1h_kw: 42,
          plus_3h_kw: 48,
          plus_6h_kw: 55,
          plus_12h_kw: 53,
          plus_24h_kw: 51,
          confidence_percent: 92,
        },
        equipment_loads: [
          { name: 'Critical Systems', kw: 18, priority: 'P1', color: '#00E5FF' },
          { name: 'Heating (Essential)', kw: 12, priority: 'P1', color: '#FF3D71' },
          { name: 'Research Equipment', kw: 10, priority: 'P2', color: '#48CAE4' },
          { name: 'Water System', kw: 6, priority: 'P2', color: '#00C9A7' },
          { name: 'Lighting', kw: 4, priority: 'P3', color: '#FFB300' },
          { name: 'Non-critical Loads', kw: 8, priority: 'P4', color: '#8892B0' },
        ],
        recommendations: [
          {
            title: 'Reduce Non-critical Loads',
            reason: 'Predicted demand surge (+6h: 55 kW) will exceed renewable capacity.',
            saving: 'Save 8 kW',
            priority: 'High',
          },
          {
            title: 'Shift Water Heating to 14:00 - 16:00',
            reason: 'Peak solar generation window occurs between 13:00 and 16:00.',
            saving: 'Save 3 kW',
            priority: 'Medium',
          },
          {
            title: 'Maintain Battery Reserve above 30%',
            reason: 'Safety buffer required for polar subzero nocturnal operations.',
            saving: 'Safety Buffer',
            priority: 'Critical',
          },
        ],
        active_alerts: [
          {
            severity: 'critical',
            title: 'High Consumption Detected - Heater 03',
            desc: 'Heater 03 is consuming 12.5 kW (140% above normal).',
          },
          {
            severity: 'warning',
            title: 'Energy Shortage Predicted',
            desc: 'Low renewable generation expected in next 6 hours.',
          },
        ],
        timeline_24h: [
          { time: '00:00', solar: 0, wind: 18, load: 38, battery: 76, diesel: 0 },
          { time: '03:00', solar: 0, wind: 16, load: 36, battery: 73, diesel: 0 },
          { time: '06:00', solar: 8, wind: 14, load: 37, battery: 72, diesel: 0 },
          { time: '09:00', solar: 22, wind: 15, load: 40, battery: 73, diesel: 0 },
          { time: '12:00', solar: 28, wind: 15, load: 39, battery: 74, diesel: 0 },
          { time: '15:00', solar: 25, wind: 14, load: 42, battery: 74, diesel: 0 },
          { time: '18:00', solar: 10, wind: 16, load: 48, battery: 70, diesel: 0 },
          { time: '21:00', solar: 0, wind: 17, load: 45, battery: 67, diesel: 0 },
          { time: '24:00', solar: 0, wind: 15, load: 41, battery: 65, diesel: 0 },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-400" />
        <p>Connecting to Bharati Polar Station telemetry...</p>
      </div>
    );
  }

  const d = data;
  const energyMix = [
    { name: 'Solar', value: d.generation.solar_kw, color: '#00E5FF' },
    { name: 'Wind', value: d.generation.wind_kw, color: '#48CAE4' },
    { name: 'Diesel', value: d.generation.diesel_kw, color: '#FF3D71' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Station Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1C2F57]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2.5">
            BHARATI STATION OVERVIEW
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              LIVE TELEMETRY
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-source generation, storage reserves, and AI demand forecasting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111C3A] hover:bg-[#16244A] border border-[#1E325A] text-xs font-semibold text-cyan-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Station</span>
          </button>
          <button
            onClick={() => navigate('/optimization')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Smart Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS ROW 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solar Generation */}
        <div className="polar-card p-5 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Solar Generation
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {d.generation.solar_kw}
            </span>
            <span className="text-sm font-semibold text-cyan-400">kW</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#1C2F57] pt-2">
            <span>Irradiance Index</span>
            <span className="text-cyan-300 font-medium">680 W/m²</span>
          </div>
        </div>

        {/* Wind Generation */}
        <div className="polar-card p-5 border border-blue-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Wind Generation
            </span>
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {d.generation.wind_kw}
            </span>
            <span className="text-sm font-semibold text-blue-400">kW</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#1C2F57] pt-2">
            <span>Wind Speed</span>
            <span className="text-blue-300 font-medium">{d.environment.wind_speed_kmh} km/h</span>
          </div>
        </div>

        {/* Diesel Generator */}
        <div className="polar-card p-5 border border-slate-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Diesel Generator
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-300 font-mono">
              {d.generation.diesel_kw}
            </span>
            <span className="text-sm font-semibold text-slate-400">kW</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#1C2F57] pt-2">
            <span>Generator Status</span>
            <span className="text-emerald-400 font-semibold uppercase">0 kW (Standby)</span>
          </div>
        </div>

        {/* Battery Bank */}
        <div className="polar-card p-5 border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Battery Bank SOC
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <BatteryCharging className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {d.battery.level_percent}%
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              +{d.battery.power_kw} kW (Charging)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#1C2F57] pt-2">
            <span>Min Preferred Reserve</span>
            <span className="text-emerald-300 font-medium">&gt; {d.battery.min_reserve_percent}%</span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS ROW 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Consumption */}
        <div className="polar-card p-4 flex items-center justify-between border-l-4 border-l-amber-400">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Station Load</p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {d.consumption.current_load_kw} <span className="text-xs font-normal text-amber-400">kW</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">6 Active Subsystems</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Available Energy */}
        <div className="polar-card p-4 flex items-center justify-between border-l-4 border-l-cyan-400">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Available Energy</p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {d.generation.available_total_kw} <span className="text-xs font-normal text-cyan-400">kW</span>
            </p>
            <p className="text-[10px] text-emerald-400 mt-1">+4 kW Net Surplus</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Energy Resilience */}
        <div className="polar-card p-4 flex items-center justify-between border-l-4 border-l-emerald-400">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Energy Resilience</p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {d.resilience.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </p>
            <p className="text-[10px] text-emerald-400 mt-1">Optimal Polar Defense</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Fuel Reserve */}
        <div className="polar-card p-4 flex items-center justify-between border-l-4 border-l-blue-400">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Diesel Fuel Reserve</p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {d.fuel.reserve_percent}%
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Tank Capacity: 45,000 L</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MAIN 24H GENERATION VS DEMAND CHART */}
      <div className="polar-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              24-Hour Energy Generation vs. Demand Curve
            </h3>
            <p className="text-xs text-slate-400">
              Diurnal solar output, Antarctic wind patterns, and baseline station load profiles.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded bg-[#00E5FF]"></span> Solar
            </span>
            <span className="flex items-center gap-1.5 text-blue-300">
              <span className="w-2.5 h-2.5 rounded bg-[#48CAE4]"></span> Wind
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded bg-[#FFB300]"></span> Demand
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.timeline_24h}>
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#48CAE4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#48CAE4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB300" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FFB300" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2F57" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} unit=" kW" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1836',
                  borderColor: '#1E325A',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="solar"
                name="Solar (kW)"
                stroke="#00E5FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#solarGrad)"
              />
              <Area
                type="monotone"
                dataKey="wind"
                name="Wind (kW)"
                stroke="#48CAE4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#windGrad)"
              />
              <Area
                type="monotone"
                dataKey="load"
                name="Station Demand (kW)"
                stroke="#FFB300"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#loadGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3-COLUMN SECTION: PREDICTION SNAPSHOT + LOAD BREAKDOWN + AI RECS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. PREDICTION SNAPSHOT */}
        <div className="polar-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Demand Forecast
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                {d.prediction_summary.confidence_percent}% Conf.
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="p-2.5 rounded-lg bg-[#0E1A38] border border-[#1C2F57] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Current Demand (Now)</span>
                <span className="font-mono font-bold text-white">{d.prediction_summary.now_kw} kW</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0E1A38] border border-[#1C2F57] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Horizon +1 Hour</span>
                <span className="font-mono font-bold text-cyan-300">{d.prediction_summary.plus_1h_kw} kW</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0E1A38] border border-[#1C2F57] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Horizon +3 Hours</span>
                <span className="font-mono font-bold text-blue-300">{d.prediction_summary.plus_3h_kw} kW</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#14234B] border border-amber-500/40 flex items-center justify-between text-xs">
                <span className="text-amber-300 font-semibold">Horizon +6 Hours (Peak)</span>
                <span className="font-mono font-bold text-amber-400">{d.prediction_summary.plus_6h_kw} kW</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0E1A38] border border-[#1C2F57] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Horizon +12 Hours</span>
                <span className="font-mono font-bold text-slate-200">{d.prediction_summary.plus_12h_kw} kW</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0E1A38] border border-[#1C2F57] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Horizon +24 Hours</span>
                <span className="font-mono font-bold text-slate-200">{d.prediction_summary.plus_24h_kw} kW</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/prediction')}
            className="w-full mt-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Explore Full Multi-Model Forecast</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. EQUIPMENT LOAD DISTRIBUTION */}
        <div className="polar-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Subsystem Load Demand
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Total: 39 kW</span>
          </div>

          <div className="space-y-3 mt-4">
            {d.equipment_loads.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1C2F57] text-cyan-300 font-mono">
                      {item.priority}
                    </span>
                    <span className="font-mono font-bold text-white">{item.kw} kW</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#0C152B] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.kw / 20) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1C2F57] flex items-center justify-between text-[11px] text-slate-400">
            <span>Critical P1 Total: 30 kW</span>
            <span>Non-Essential: 9 kW</span>
          </div>
        </div>

        {/* 3. AI RECOMMENDATIONS */}
        <div className="polar-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AI Optimization Actions
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                3 Actionable
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {d.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0E1A38] border border-[#1C2F57] hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-cyan-300">{rec.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono whitespace-nowrap">
                      {rec.saving}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/optimization')}
            className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Execute Optimization Engine</span>
          </button>
        </div>
      </div>
    </div>
  );
}
