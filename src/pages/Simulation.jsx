import React, { useState, useMemo } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import MetricCards from '../components/simulation/MetricCards';
import EnergySimulation3D from '../components/simulation/EnergySimulation3D';
import ComponentDetailModal from '../components/simulation/ComponentDetailModal';
import DangerZoneModal from '../components/simulation/DangerZoneModal';
import AIStatusPanel from '../components/simulation/AIStatusPanel';
import EnergyMix from '../components/simulation/EnergyMix';
import SimulationControls from '../components/simulation/SimulationControls';
import EventLog from '../components/simulation/EventLog';
import AnalyticsCharts from '../components/simulation/AnalyticsCharts';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Fuel,
  Sun,
  Wind,
  CheckCircle2,
  Sparkles,
  Zap,
  Flame,
  Activity,
  Bell
} from 'lucide-react';

export default function Simulation() {
  const {
    simState,
    activeAlerts,
    dangerPopup,
    dismissDangerPopup,
    updateSimulationState,
  } = useTelemetry();

  const [selectedComponent, setSelectedComponent] = useState(null);

  const [events, setEvents] = useState([
    { id: 1, time: '18:42', text: 'AI optimization cycle completed: Vector balanced', status: 'success' },
    { id: 2, time: '18:41', text: 'Wind generation increased by 8% (24 km/h breeze)', status: 'info' },
    { id: 3, time: '18:40', text: 'Battery charging initiated (+146 kW surplus)', status: 'success' },
    { id: 4, time: '18:38', text: 'Grid load stabilized at 621 kW across 3 hubs', status: 'info' },
    { id: 5, time: '18:35', text: 'Diesel generator switched to standby (Zero fuel burn)', status: 'success' },
  ]);

  // Dynamic 24-hour generation data derived in real-time
  const dynamicTimeline = useMemo(() => {
    const s = simState.solarOutput;
    const w = simState.windOutput;
    const d = simState.gridLoad;
    return [
      { time: '00:00', solar: 0, wind: Math.round(w * 0.9), battery: 120, diesel: simState.dieselOutput, demand: Math.round(d * 0.8) },
      { time: '03:00', solar: 0, wind: Math.round(w * 0.95), battery: 110, diesel: simState.dieselOutput, demand: Math.round(d * 0.82) },
      { time: '06:00', solar: Math.round(s * 0.3), wind: Math.round(w * 0.92), battery: 100, diesel: 0, demand: Math.round(d * 0.9) },
      { time: '09:00', solar: Math.round(s * 0.75), wind: Math.round(w * 0.98), battery: 60, diesel: 0, demand: Math.round(d * 0.98) },
      { time: '12:00', solar: s, wind: w, battery: Math.max(0, simState.batteryPower), diesel: simState.dieselOutput, demand: d },
      { time: '15:00', solar: Math.round(s * 0.85), wind: Math.round(w * 1.05), battery: 150, diesel: 0, demand: Math.round(d * 1.02) },
      { time: '18:00', solar: Math.round(s * 0.3), wind: Math.round(w * 1.1), battery: 90, diesel: 0, demand: Math.round(d * 1.04) },
      { time: '21:00', solar: 0, wind: Math.round(w * 1.02), battery: 80, diesel: 0, demand: Math.round(d * 0.95) },
      { time: '24:00', solar: 0, wind: Math.round(w * 0.95), battery: 110, diesel: simState.dieselOutput, demand: Math.round(d * 0.84) },
    ];
  }, [simState.solarOutput, simState.windOutput, simState.gridLoad, simState.batteryPower, simState.dieselOutput]);

  // Dynamic Battery SOC trajectory derived in real-time
  const dynamicBatterySOC = useMemo(() => {
    const soc = simState.batterySOC;
    return [
      { time: '00:00', soc: Math.min(100, Math.max(20, soc - 6)) },
      { time: '03:00', soc: Math.min(100, Math.max(20, soc - 8)) },
      { time: '06:00', soc: Math.min(100, Math.max(20, soc - 10)) },
      { time: '09:00', soc: Math.min(100, Math.max(20, soc - 4)) },
      { time: '12:00', soc: soc }, // NOW reference point
      { time: '15:00', soc: Math.min(100, Math.max(20, soc + 4)) },
      { time: '18:00', soc: Math.min(100, Math.max(20, soc + 2)) },
      { time: '21:00', soc: Math.min(100, Math.max(20, soc - 2)) },
      { time: '24:00', soc: Math.min(100, Math.max(20, soc - 4)) },
    ];
  }, [simState.batterySOC]);

  return (
    <div className="space-y-4">
      {/* 1. TOP METRIC CARDS ROW */}
      <MetricCards state={simState} />

      {/* ACTIVE DANGER / RISK ALERT BANNER */}
      {(simState.solarRisk || simState.batteryRisk || simState.windRisk || simState.dieselOutput > 0) && (
        <div className="p-3.5 rounded-xl bg-[#FF6257]/15 border border-[#FF6257]/40 text-[#FF6257] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 flex-shrink-0 animate-ping text-[#FF6257]" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                DANGER ZONE THREAT ACTIVE:
              </span>
              <p className="text-xs text-[#EFFFFF] mt-0.5">
                {simState.windRisk && '💨 Wind Turbine in Danger Zone (Stall/Gust Anomaly). '}
                {simState.solarRisk && '☀️ Solar harvest collapsed -> Panels turned RED. '}
                {simState.batteryRisk && '🔋 Battery critically depleted below 30% threshold. '}
                {simState.dieselOutput > 0 && `⛽ Diesel Generator online at ${simState.dieselOutput} kW (${simState.dieselBurnRateLph} L/h).`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-[#FF6257]/20 border border-[#FF6257]/40 self-start sm:self-center flex items-center gap-1 text-[#FF6257]">
            <Bell className="w-3 h-3" />
            STORED IN NOTIFICATIONS
          </span>
        </div>
      )}

      {/* DIESEL FUEL LEVEL & REAL-TIME SPECS BANNER (WARM AMBER PALETTE) */}
      <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#102B3B]">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-[#FFA000]" />
            <h4 className="text-xs font-black tracking-wider text-[#EFFFFF] uppercase">
              DIESEL GENERATOR & FUEL RESERVE TELEMETRY
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#89A7B7]">
            Tank: {(simState.dieselFuelLiters || 37800).toLocaleString()} L / {(simState.dieselCapacityLiters || 45000).toLocaleString()} L
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
          {/* Fuel Level Gauge Bar */}
          <div className="sm:col-span-2 p-3 rounded-lg bg-[#06131D] border border-[#102B3B] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#89A7B7] font-semibold">Fuel Tank Level Gauge</span>
              <span className="font-mono font-black text-[#EFFFFF]">{simState.dieselFuelPercent || 84}% Available</span>
            </div>
            <div className="w-full h-3 bg-[#102B3B] rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  (simState.dieselFuelPercent || 84) < 20
                    ? 'bg-[#FF6257]'
                    : (simState.dieselFuelPercent || 84) < 50
                    ? 'bg-[#FFD12A]'
                    : 'bg-gradient-to-r from-[#299BD7] to-[#FFA000]'
                }`}
                style={{ width: `${simState.dieselFuelPercent || 84}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#89A7B7] mt-1 font-mono">
              <span>0% Empty</span>
              <span>Reserve: {(simState.dieselFuelLiters || 37800).toLocaleString()} L</span>
              <span>100% Full</span>
            </div>
          </div>

          {/* Burn Rate */}
          <div className="p-3 rounded-lg bg-[#06131D] border border-[#102B3B] text-center flex flex-col justify-center">
            <span className="text-[10px] font-bold text-[#89A7B7] uppercase">Fuel Burn Rate</span>
            <span className="text-xl font-black font-mono text-[#FFA000] mt-1">
              {simState.dieselBurnRateLph || 0.0} <span className="text-xs font-normal text-[#89A7B7]">L/h</span>
            </span>
            <span className="text-[9px] text-[#89A7B7] mt-0.5">
              {simState.dieselOutput > 0 ? 'Active Genset Dispatch' : '0.0 L/h Standby'}
            </span>
          </div>

          {/* Remaining Hours */}
          <div className="p-3 rounded-lg bg-[#06131D] border border-[#102B3B] text-center flex flex-col justify-center">
            <span className="text-[10px] font-bold text-[#89A7B7] uppercase">Remaining Run Hours</span>
            <span className="text-xl font-black font-mono text-[#35D47A] mt-1">
              ~{simState.dieselRemainingHours || 440} <span className="text-xs font-normal text-[#89A7B7]">Hrs</span>
            </span>
            <span className="text-[9px] text-[#89A7B7] mt-0.5">Continuous Autonomous Life</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px] gap-4 items-start">
        {/* LEFT COLUMN: 3D Visualization + Analytics Charts */}
        <div className="space-y-4 min-w-0">
          <EnergySimulation3D
            simulationState={simState}
            onSelectComponent={(comp) => setSelectedComponent(comp)}
            selectedComponent={selectedComponent}
          />
          <AnalyticsCharts
            timelineData={dynamicTimeline}
            batteryData={dynamicBatterySOC}
          />
        </div>

        {/* RIGHT COLUMN: AI Status + Energy Mix + Real-Time Controls + Event Log */}
        <div className="space-y-4">
          <AIStatusPanel simulationState={simState} />
          <EnergyMix simulationState={simState} />
          <SimulationControls
            state={simState}
            onChange={updateSimulationState}
          />
          <EventLog events={events} />
        </div>
      </div>

      {/* COMPONENT DETAIL MODAL */}
      <ComponentDetailModal
        component={selectedComponent}
        onClose={() => setSelectedComponent(null)}
        onOptimize={(id) => {
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          setEvents((prev) => [
            {
              id: Date.now(),
              time: timeStr,
              text: `MPPT Vector optimized for ${id.toUpperCase()}: Subsystem yield maximized (+4.2%)`,
              status: 'success',
            },
            ...prev,
          ]);
        }}
      />

      {/* DANGER ZONE POPUP MODAL (Triggered automatically whenever Turbine/Solar/Battery enters danger) */}
      <DangerZoneModal
        alert={dangerPopup}
        onClose={dismissDangerPopup}
        onMitigate={() => {
          updateSimulationState({
            batteryStrategy: 'Balanced',
            emergencyDiesel: true,
          });
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          setEvents((prev) => [
            {
              id: Date.now(),
              time: timeStr,
              text: 'Autonomous Defense Protocol engaged: Turbine pitch regulated & Diesel buffer dispatched',
              status: 'success',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}
