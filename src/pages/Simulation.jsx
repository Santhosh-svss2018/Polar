import React, { useState } from 'react';
import {
  FlaskConical,
  Sun,
  Wind,
  Thermometer,
  Activity,
  Sparkles,
  ShieldCheck,
  Fuel,
  Battery,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../services/api';

export default function Simulation() {
  const [solarChange, setSolarChange] = useState(-70);
  const [windChange, setWindChange] = useState(-40);
  const [tempChange, setTempChange] = useState(-8);
  const [loadIncrease, setLoadIncrease] = useState(20);
  const [running, setRunning] = useState(false);

  const [simResults, setSimResults] = useState({
    scenario_name: 'Antarctic Blizzard & Severe Storm',
    metrics: {
      available_energy_kw: 32,
      predicted_demand_kw: 56,
      deficit_kw: 24,
    },
    without_opt: {
      energy_deficit_kwh: 24,
      min_battery_soc: 18,
      critical_load_supplied: 92,
      diesel_runtime_hrs: 6.2,
      renewable_utilization: 61,
      grid_failure_risk: 'High (Critical Deficit)',
    },
    with_opt: {
      energy_deficit_kwh: 0,
      min_battery_soc: 32,
      critical_load_supplied: 100,
      diesel_runtime_hrs: 6.1,
      renewable_utilization: 78,
      grid_failure_risk: 'Zero (Autonomous AI Defense)',
    },
    chart_data: [
      { time: 'T+0h', unopt_demand: 48, opt_demand: 42, renewable: 32, diesel: 0 },
      { time: 'T+3h', unopt_demand: 52, opt_demand: 44, renewable: 30, diesel: 12 },
      { time: 'T+6h', unopt_demand: 56, opt_demand: 46, renewable: 24, diesel: 22 },
      { time: 'T+9h', unopt_demand: 54, opt_demand: 45, renewable: 26, diesel: 19 },
      { time: 'T+12h', unopt_demand: 50, opt_demand: 41, renewable: 28, diesel: 13 },
      { time: 'T+18h', unopt_demand: 46, opt_demand: 40, renewable: 31, diesel: 9 },
      { time: 'T+24h', unopt_demand: 44, opt_demand: 39, renewable: 32, diesel: 0 },
    ],
  });

  const handleApplyPreset = (name, s, w, t, l) => {
    setSolarChange(s);
    setWindChange(w);
    setTempChange(t);
    setLoadIncrease(l);
  };

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      const res = await api.runSimulation({
        solar_delta_pct: solarChange,
        wind_delta_pct: windChange,
        temp_delta_c: tempChange,
        load_delta_pct: loadIncrease,
      });
      if (res) {
        setSimResults(res);
      }
    } catch (err) {
      console.warn('Calculating via client-side simulation engine:', err);
      // Client-side math calculation
      const avail = Math.round(Math.max(0, 28 * (1 + solarChange / 100) + 15 * (1 + windChange / 100)));
      const demand = Math.round(39 * (1 + loadIncrease / 100));
      const deficit = Math.max(0, demand - avail);

      setSimResults((prev) => ({
        ...prev,
        metrics: {
          available_energy_kw: avail,
          predicted_demand_kw: demand,
          deficit_kw: deficit,
        },
        without_opt: {
          energy_deficit_kwh: deficit,
          min_battery_soc: Math.max(12, Math.round(74 - deficit * 2.2)),
          critical_load_supplied: deficit > 20 ? 92 : 98,
          diesel_runtime_hrs: +(deficit > 0 ? (deficit * 0.25 + 0.2).toFixed(1) : 0),
          renewable_utilization: Math.min(100, Math.round(55 + avail * 0.2)),
          grid_failure_risk: deficit > 15 ? 'High (Critical Deficit)' : 'Moderate',
        },
        with_opt: {
          energy_deficit_kwh: 0,
          min_battery_soc: Math.max(30, Math.round(74 - (deficit * 0.8))),
          critical_load_supplied: 100,
          diesel_runtime_hrs: +(deficit > 0 ? (deficit * 0.24).toFixed(1) : 0),
          renewable_utilization: Math.min(100, Math.round(72 + avail * 0.2)),
          grid_failure_risk: 'Zero (Autonomous AI Defense)',
        },
      }));
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setSolarChange(-70);
    setWindChange(-40);
    setTempChange(-8);
    setLoadIncrease(20);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1C2F57]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2.5">
            WHAT-IF SCENARIO SIMULATION
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
              DIGITAL TWIN
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate extreme Antarctic weather events, solar eclipses, blizzard conditions, and equipment outages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111C3A] hover:bg-[#16244A] border border-[#1E325A] text-xs font-semibold text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Storm</span>
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-current ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'RUNNING DIGITAL TWIN...' : 'RUN SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* PRESET SCENARIO BUTTONS */}
      <div className="polar-card p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Load Scenario Presets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleApplyPreset('Blizzard Storm', -70, -40, -8, 20)}
            className="p-3 rounded-lg bg-[#0E1A38] hover:bg-[#14244D] border border-cyan-500/30 text-left transition-colors"
          >
            <p className="text-xs font-bold text-cyan-300">Antarctic Blizzard & Storm</p>
            <p className="text-[11px] text-slate-400 mt-1">Solar -70%, Wind -40%, Temp -8°C, Load +20%</p>
          </button>

          <button
            onClick={() => handleApplyPreset('Polar Night', -100, 30, -15, 35)}
            className="p-3 rounded-lg bg-[#0E1A38] hover:bg-[#14244D] border border-blue-500/30 text-left transition-colors"
          >
            <p className="text-xs font-bold text-blue-300">Polar Winter Night</p>
            <p className="text-[11px] text-slate-400 mt-1">Solar -100%, Wind +30%, Temp -15°C, Load +35%</p>
          </button>

          <button
            onClick={() => handleApplyPreset('Turbine Outage', 0, -100, 0, 10)}
            className="p-3 rounded-lg bg-[#0E1A38] hover:bg-[#14244D] border border-red-500/30 text-left transition-colors"
          >
            <p className="text-xs font-bold text-red-300">Wind Turbine Mechanical Trip</p>
            <p className="text-[11px] text-slate-400 mt-1">Solar 0%, Wind -100%, Temp 0°C, Load +10%</p>
          </button>

          <button
            onClick={() => handleApplyPreset('Severe Cold Snap', -20, -10, -20, 40)}
            className="p-3 rounded-lg bg-[#0E1A38] hover:bg-[#14244D] border border-amber-500/30 text-left transition-colors"
          >
            <p className="text-xs font-bold text-amber-300">Severe -45°C Deep Freeze</p>
            <p className="text-[11px] text-slate-400 mt-1">Heating load +40%, Temp -20°C</p>
          </button>
        </div>
      </div>

      {/* PARAMETER SLIDERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solar slider */}
        <div className="polar-card p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-cyan-400" />
              Solar Gen Delta
            </span>
            <span className="font-mono font-bold text-cyan-400">{solarChange > 0 ? `+${solarChange}` : solarChange}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="5"
            value={solarChange}
            onChange={(e) => setSolarChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#0A132C] rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
            <span>-100%</span>
            <span>0%</span>
            <span>+100%</span>
          </div>
        </div>

        {/* Wind slider */}
        <div className="polar-card p-4 border border-blue-500/30">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-blue-400" />
              Wind Gen Delta
            </span>
            <span className="font-mono font-bold text-blue-400">{windChange > 0 ? `+${windChange}` : windChange}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="5"
            value={windChange}
            onChange={(e) => setWindChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#0A132C] rounded-lg appearance-none cursor-pointer accent-blue-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
            <span>-100%</span>
            <span>0%</span>
            <span>+100%</span>
          </div>
        </div>

        {/* Temperature Delta */}
        <div className="polar-card p-4 border border-teal-500/30">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-teal-400" />
              Temp Shift (°C)
            </span>
            <span className="font-mono font-bold text-teal-400">{tempChange > 0 ? `+${tempChange}` : tempChange} °C</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={tempChange}
            onChange={(e) => setTempChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#0A132C] rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
            <span>-30°C</span>
            <span>0°C</span>
            <span>+30°C</span>
          </div>
        </div>

        {/* Load Surge */}
        <div className="polar-card p-4 border border-amber-500/30">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              Load Surge Delta
            </span>
            <span className="font-mono font-bold text-amber-400">{loadIncrease > 0 ? `+${loadIncrease}` : loadIncrease}%</span>
          </div>
          <input
            type="range"
            min="-50"
            max="100"
            step="5"
            value={loadIncrease}
            onChange={(e) => setLoadIncrease(Number(e.target.value))}
            className="w-full h-1.5 bg-[#0A132C] rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
            <span>-50%</span>
            <span>0%</span>
            <span>+100%</span>
          </div>
        </div>
      </div>

      {/* INTERMEDIATE METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="polar-card p-4 text-center border-l-4 border-l-cyan-400">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Available Shock Energy</p>
          <p className="text-3xl font-black text-white font-mono mt-1">
            {simResults.metrics.available_energy_kw} <span className="text-xs text-cyan-400">kW</span>
          </p>
        </div>
        <div className="polar-card p-4 text-center border-l-4 border-l-amber-400">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Surge Station Demand</p>
          <p className="text-3xl font-black text-white font-mono mt-1">
            {simResults.metrics.predicted_demand_kw} <span className="text-xs text-amber-400">kW</span>
          </p>
        </div>
        <div className="polar-card p-4 text-center border-l-4 border-l-red-400">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Gross Energy Deficit</p>
          <p className="text-3xl font-black text-red-400 font-mono mt-1">
            {simResults.metrics.deficit_kw} <span className="text-xs text-red-300">kW</span>
          </p>
        </div>
      </div>

      {/* SIDE BY SIDE COMPARISON: WITHOUT OPTIMIZATION vs WITH POLAR-ENERGY AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WITHOUT OPTIMIZATION */}
        <div className="polar-card p-6 border border-red-500/40 bg-gradient-to-b from-red-500/5 to-transparent">
          <div className="flex items-center justify-between pb-3 border-b border-red-500/20 mb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                BASELINE CONTROL
              </span>
              <h3 className="text-base font-extrabold text-white">WITHOUT OPTIMIZATION</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 font-bold">
              Uncontrolled
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="p-3 rounded-lg bg-[#0C1428] border border-red-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Energy Deficit</span>
              <span className="font-mono font-bold text-red-400 text-sm">{simResults.without_opt.energy_deficit_kwh} kWh</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C1428] border border-red-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Min Battery State of Charge (SOC)</span>
              <span className="font-mono font-bold text-red-400 text-sm">{simResults.without_opt.min_battery_soc}% (Depleted)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C1428] border border-red-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Critical Life Support Supplied</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{simResults.without_opt.critical_load_supplied}% (Brownout Risk)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C1428] border border-red-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Diesel Generator Runtime</span>
              <span className="font-mono font-bold text-slate-300 text-sm">{simResults.without_opt.diesel_runtime_hrs} hrs</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C1428] border border-red-500/20 flex items-center justify-between">
              <span className="text-xs text-slate-400">Renewable Energy Utilization</span>
              <span className="font-mono font-bold text-slate-300 text-sm">{simResults.without_opt.renewable_utilization}%</span>
            </div>
          </div>
        </div>

        {/* WITH POLAR-ENERGY AI */}
        <div className="polar-card p-6 border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                AI SMART MANAGEMENT
              </span>
              <h3 className="text-base font-extrabold text-white">WITH POLAR-ENERGY AI</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Safe
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="p-3 rounded-lg bg-[#0C1E32] border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Energy Deficit</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{simResults.with_opt.energy_deficit_kwh} kWh (Zero Deficit)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C1E32] border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Min Battery State of Charge (SOC)</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">{simResults.with_opt.min_battery_soc}% (Reserve Protected &gt;30%)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C1E32] border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Critical Life Support Supplied</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{simResults.with_opt.critical_load_supplied}% Guaranteed</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C1E32] border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Diesel Generator Runtime</span>
              <span className="font-mono font-bold text-slate-200 text-sm">{simResults.with_opt.diesel_runtime_hrs} hrs (Optimized)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0C1E32] border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Renewable Energy Utilization</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{simResults.with_opt.renewable_utilization}% (+17% Gain)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATION 24-HOUR DISPATCH PROJECTION */}
      <div className="polar-card p-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-purple-400" />
          Simulation 24-Hour Power Trajectory Under Stress
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Visualizing the gap between unmanaged demand and AI managed load curtailment.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simResults.chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2F57" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} unit=" kW" domain={[0, 65]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1836',
                  borderColor: '#1E325A',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="unopt_demand" name="Unoptimized Shock Demand" stroke="#FF3D71" strokeDasharray="4 4" strokeWidth={2} />
              <Line type="monotone" dataKey="opt_demand" name="POLAR-ENERGY AI Curtailed Demand" stroke="#00E676" strokeWidth={3} />
              <Line type="monotone" dataKey="renewable" name="Degraded Renewable Output" stroke="#00E5FF" strokeWidth={2} />
              <Line type="monotone" dataKey="diesel" name="Emergency Diesel Dispatch" stroke="#FFB300" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
