import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../context/TelemetryContext';
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
  Sliders,
  AlertTriangle,
  Layers
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { simState, activeAlerts } = useTelemetry();
  const [refreshing, setRefreshing] = useState(false);

  // Derive real-time values from TelemetryContext
  const solarKw = simState.solarOutput;
  const windKw = simState.windOutput;
  const dieselKw = simState.dieselOutput;
  const totalRenewableKw = solarKw + windKw;
  const loadKw = simState.gridLoad;
  const netBalanceKw = totalRenewableKw - loadKw;
  const batterySoc = simState.batterySOC;
  const batteryPowerKw = simState.batteryPower;
  const dieselFuelPct = simState.dieselFuelPercent || 84;
  const dieselFuelLiters = simState.dieselFuelLiters || 37800;
  const resilienceScore = simState.resilienceScore || 88;

  const energyMix = [
    { name: 'Solar', value: Math.max(1, solarKw), color: simState.solarRisk ? '#FF6257' : '#FFD12A' },
    { name: 'Wind', value: Math.max(1, windKw), color: simState.windRisk ? '#FF6257' : '#299BD7' },
    { name: 'Diesel', value: dieselKw > 0 ? dieselKw : 0, color: '#FFA000' },
  ];

  const timelineData = [
    { time: '00:00', solar: 0, wind: Math.round(windKw * 0.9), load: Math.round(loadKw * 0.8), battery: 76, diesel: dieselKw },
    { time: '03:00', solar: 0, wind: Math.round(windKw * 0.95), load: Math.round(loadKw * 0.82), battery: 73, diesel: dieselKw },
    { time: '06:00', solar: Math.round(solarKw * 0.3), wind: Math.round(windKw * 0.92), load: Math.round(loadKw * 0.9), battery: 72, diesel: 0 },
    { time: '09:00', solar: Math.round(solarKw * 0.75), wind: Math.round(windKw * 0.98), load: Math.round(loadKw * 0.98), battery: 73, diesel: 0 },
    { time: '12:00', solar: solarKw, wind: windKw, load: loadKw, battery: batterySoc, diesel: dieselKw },
    { time: '15:00', solar: Math.round(solarKw * 0.85), wind: Math.round(windKw * 1.05), load: Math.round(loadKw * 1.02), battery: 74, diesel: 0 },
    { time: '18:00', solar: Math.round(solarKw * 0.3), wind: Math.round(windKw * 1.1), load: Math.round(loadKw * 1.04), battery: 70, diesel: 0 },
    { time: '21:00', solar: 0, wind: Math.round(windKw * 1.02), load: Math.round(loadKw * 0.95), battery: 67, diesel: 0 },
    { time: '24:00', solar: 0, wind: Math.round(windKw * 0.95), load: Math.round(loadKw * 0.84), battery: 65, diesel: dieselKw },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Station Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#102B3B]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#EFFFFF] flex items-center gap-2.5">
            BHARATI STATION OVERVIEW
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#35D47A]/20 text-[#35D47A] border border-[#35D47A]/30 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35D47A] pulse-active" />
              Live Telemetry Synchronized
            </span>
          </h2>
          <p className="text-xs text-[#89A7B7] mt-1">
            Real-time digital twin overview synchronized with active 3D Simulation engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/simulation')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#48D5FF]/15 text-[#48D5FF] border border-[#48D5FF]/30 text-xs font-bold hover:bg-[#48D5FF]/25 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Open 3D Simulation</span>
          </button>
        </div>
      </div>

      {/* 5 Core Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. Solar Generation */}
        <div className={`p-4 rounded-xl bg-[#0B1D29] border ${simState.solarRisk ? 'border-[#FF6257] animate-pulse' : 'border-[#102B3B]'} shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#89A7B7] uppercase">Solar Harvest</span>
            <div className={`p-1.5 rounded-lg ${simState.solarRisk ? 'bg-[#FF6257]/20 text-[#FF6257]' : 'bg-[#FFD12A]/10 text-[#FFD12A]'}`}>
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-[#EFFFFF]">
            {solarKw} <span className="text-xs text-[#89A7B7] font-sans font-normal">kW</span>
          </div>
          <div className="mt-2 text-[10px] font-semibold flex items-center justify-between">
            <span className="text-[#89A7B7]">State:</span>
            <span className={simState.solarRisk ? 'text-[#FF6257] font-bold' : 'text-[#35D47A]'}>
              {simState.solarRisk ? 'DEFICIT RISK' : `${simState.solarEfficiency}% Eff`}
            </span>
          </div>
        </div>

        {/* 2. Wind Generation */}
        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#89A7B7] uppercase">Wind Generation</span>
            <div className="p-1.5 rounded-lg bg-[#299BD7]/10 text-[#299BD7]">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-[#EFFFFF]">
            {windKw} <span className="text-xs text-[#89A7B7] font-sans font-normal">kW</span>
          </div>
          <div className="mt-2 text-[10px] font-semibold flex items-center justify-between">
            <span className="text-[#89A7B7]">Speed:</span>
            <span className="text-[#299BD7] font-bold font-mono">{simState.windSpeed} km/h</span>
          </div>
        </div>

        {/* 3. Battery Storage */}
        <div className={`p-4 rounded-xl bg-[#0B1D29] border ${simState.batteryRisk ? 'border-[#FF6257] animate-pulse' : 'border-[#102B3B]'} shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#89A7B7] uppercase">Battery Reserve</span>
            <div className={`p-1.5 rounded-lg ${simState.batteryRisk ? 'bg-[#FF6257]/20 text-[#FF6257]' : 'bg-[#35D47A]/10 text-[#35D47A]'}`}>
              <BatteryCharging className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-[#EFFFFF]">
            {batterySoc}%
          </div>
          <div className="mt-2 text-[10px] font-semibold flex items-center justify-between">
            <span className="text-[#89A7B7]">Flow:</span>
            <span className={batteryPowerKw >= 0 ? 'text-[#35D47A] font-bold' : 'text-[#FFD12A] font-bold'}>
              {batteryPowerKw >= 0 ? `+${batteryPowerKw} kW` : `${batteryPowerKw} kW`}
            </span>
          </div>
        </div>

        {/* 4. Total Station Load */}
        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#89A7B7] uppercase">Station Demand</span>
            <div className="p-1.5 rounded-lg bg-[#48D5FF]/10 text-[#48D5FF]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-[#EFFFFF]">
            {loadKw} <span className="text-xs text-[#89A7B7] font-sans font-normal">kW</span>
          </div>
          <div className="mt-2 text-[10px] font-semibold flex items-center justify-between">
            <span className="text-[#89A7B7]">Net Balance:</span>
            <span className={netBalanceKw >= 0 ? 'text-[#35D47A] font-bold' : 'text-[#FF6257] font-bold'}>
              {netBalanceKw >= 0 ? `+${netBalanceKw} kW` : `${netBalanceKw} kW`}
            </span>
          </div>
        </div>

        {/* 5. Diesel Level & Output */}
        <div className={`p-4 rounded-xl bg-[#0B1D29] border ${dieselKw > 0 ? 'border-[#FFA000]/60' : 'border-[#102B3B]'} shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#89A7B7] uppercase">Diesel Reserve</span>
            <div className={`p-1.5 rounded-lg ${dieselKw > 0 ? 'bg-[#FFA000]/20 text-[#FFA000]' : 'bg-[#E5A93C]/10 text-[#E5A93C]'}`}>
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-[#EFFFFF]">
            {dieselFuelPct}%
          </div>
          <div className="mt-2 text-[10px] font-semibold flex items-center justify-between">
            <span className="text-[#89A7B7]">Genset:</span>
            <span className={dieselKw > 0 ? 'text-[#FFA000] font-bold' : 'text-[#35D47A]'}>
              {dieselKw > 0 ? `${dieselKw} kW ACTIVE` : '0 kW (STANDBY)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24h Generation vs Load Timeline */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#EFFFFF] uppercase tracking-wider">
                24-HOUR GENERATION & LOAD DISPATCH
              </h3>
              <p className="text-xs text-[#89A7B7] mt-0.5">
                Live microgrid power generation curves synced with current simulation state
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#FFD12A]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FFD12A]" /> Solar
              </span>
              <span className="flex items-center gap-1.5 text-[#299BD7]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#299BD7]" /> Wind
              </span>
              <span className="flex items-center gap-1.5 text-[#48D5FF]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#48D5FF]" /> Demand
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="solGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD12A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FFD12A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#299BD7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#299BD7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#48D5FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#48D5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#102B3B" />
                <XAxis dataKey="time" stroke="#89A7B7" fontSize={11} />
                <YAxis stroke="#89A7B7" fontSize={11} unit=" kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#06131D', borderColor: '#102B3B', borderRadius: '8px', color: '#EFFFFF' }}
                />
                <Area type="monotone" dataKey="solar" stroke="#FFD12A" fill="url(#solGrad)" strokeWidth={2} name="Solar (kW)" />
                <Area type="monotone" dataKey="wind" stroke="#299BD7" fill="url(#windGrad)" strokeWidth={2} name="Wind (kW)" />
                <Area type="monotone" dataKey="load" stroke="#48D5FF" fill="url(#loadGrad)" strokeWidth={2} name="Demand (kW)" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Live Energy Mix Donut + Diesel Tank Gauge */}
        <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#EFFFFF] uppercase tracking-wider">
              REAL-TIME GENERATION MIX
            </h3>
            <p className="text-xs text-[#89A7B7] mt-0.5">
              Current source contribution breakdown
            </p>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {energyMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#06131D', borderColor: '#102B3B', borderRadius: '8px', color: '#EFFFFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-mono font-black text-[#EFFFFF]">{totalRenewableKw + dieselKw} kW</span>
              <span className="text-[9px] text-[#89A7B7] uppercase font-bold">Total Power</span>
            </div>
          </div>

          {/* Diesel Tank Gauge */}
          <div className="p-3 rounded-xl bg-[#06131D] border border-[#102B3B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#89A7B7] font-semibold">
                <Fuel className="w-3.5 h-3.5 text-[#FF6257]" />
                Diesel Reserve Tank
              </span>
              <span className="font-mono font-bold text-[#EFFFFF]">{dieselFuelPct}% ({dieselFuelLiters.toLocaleString()} L)</span>
            </div>
            <div className="w-full h-2.5 bg-[#102B3B] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  dieselFuelPct < 30 ? 'bg-[#FF6257]' : dieselFuelPct < 60 ? 'bg-[#FFD12A]' : 'bg-[#35D47A]'
                }`}
                style={{ width: `${dieselFuelPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live System Alerts List Synchronized */}
      <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#102B3B]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#48D5FF]" />
            <h3 className="text-sm font-extrabold text-[#EFFFFF] uppercase tracking-wider">
              LIVE SYSTEM ALERTS & TELEMETRY LOGS
            </h3>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-bold text-[#48D5FF] hover:underline cursor-pointer"
          >
            View All in Alerts & Anomalies →
          </button>
        </div>

        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                alert.severity === 'critical'
                  ? 'bg-[#FF6257]/15 border-[#FF6257]/40 text-[#FF6257]'
                  : alert.severity === 'warning'
                  ? 'bg-[#FFD12A]/15 border-[#FFD12A]/40 text-[#FFD12A]'
                  : 'bg-[#06131D] border-[#102B3B] text-[#EFFFFF]'
              }`}
            >
              <div className="flex items-center gap-3">
                {alert.severity === 'critical' ? (
                  <AlertOctagon className="w-4 h-4 text-[#FF6257] flex-shrink-0" />
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-[#FFD12A] flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#35D47A] flex-shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold">{alert.title}</span>
                  <p className="text-[11px] text-[#89A7B7] mt-0.5">{alert.desc}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold">{alert.value}</span>
                <p className="text-[10px] text-[#89A7B7]">{alert.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
