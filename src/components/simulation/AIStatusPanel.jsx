import React from 'react';
import { Sparkles, Sun, Wind, BatteryCharging, Fuel, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AIStatusPanel({ simulationState }) {
  const s = simulationState || {
    solarOutput: 284,
    windOutput: 412,
    batteryPower: 146,
    dieselOutput: 0,
    gridLoad: 621,
    aiStatus: 'OPTIMAL',
    aiMessage: 'Renewable generation is currently sufficient to meet demand. Battery storage is charging and diesel backup remains offline.',
    efficiency: '94.2%',
    forecast: 'Stable',
    co2Saved: '1.82 t',
  };

  const totalGen = Math.max(1, s.solarOutput + s.windOutput + Math.max(0, s.batteryPower) + s.dieselOutput);

  const solarPct = Math.round((s.solarOutput / totalGen) * 100);
  const windPct = Math.round((s.windOutput / totalGen) * 100);
  const battPct = Math.round((Math.max(0, s.batteryPower) / totalGen) * 100);
  const dieselPct = Math.round((s.dieselOutput / totalGen) * 100);

  const statusColor = s.aiStatus === 'OPTIMAL' ? '#35D47A' : s.aiStatus === 'WARNING' ? '#FFD12A' : '#FF6257';

  return (
    <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#102B3B]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#48D5FF]" />
          <h3 className="text-xs font-black tracking-wider text-[#EFFFFF] uppercase">
            AI ENERGY OPTIMIZATION
          </h3>
        </div>
        <span
          className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded flex items-center gap-1"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            border: `1px solid ${statusColor}40`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
          {s.aiStatus || 'OPTIMAL'}
        </span>
      </div>

      {/* AI Advisory Message */}
      <div className="p-3 rounded-lg bg-[#06131D] border border-[#102B3B] text-[11px] leading-relaxed text-[#89A7B7]">
        <p className="text-[#EFFFFF] font-medium">{s.aiMessage}</p>
      </div>

      {/* AI Source Allocation Breakdown */}
      <div className="space-y-2.5">
        <h4 className="text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider">
          AI Source Allocation
        </h4>

        {/* Solar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#89A7B7] flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#FFD12A]" />
              SOLAR
            </span>
            <span className="font-mono text-[11px] font-bold text-[#EFFFFF]">
              {s.solarOutput} kW <span className="text-[#FFD12A]">({solarPct}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#06131D] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFD12A] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, solarPct)}%` }}
            />
          </div>
        </div>

        {/* Wind */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#89A7B7] flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-[#299BD7]" />
              WIND
            </span>
            <span className="font-mono text-[11px] font-bold text-[#EFFFFF]">
              {s.windOutput} kW <span className="text-[#299BD7]">({windPct}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#06131D] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#299BD7] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, windPct)}%` }}
            />
          </div>
        </div>

        {/* Battery */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#89A7B7] flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-[#35D47A]" />
              BATTERY
            </span>
            <span className="font-mono text-[11px] font-bold text-[#EFFFFF]">
              {Math.max(0, s.batteryPower)} kW <span className="text-[#35D47A]">({battPct}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#06131D] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#35D47A] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, battPct)}%` }}
            />
          </div>
        </div>

        {/* Diesel - Warm Amber Gold */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#89A7B7] flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-[#FFA000]" />
              DIESEL BACKUP
            </span>
            <span className="font-mono text-[11px] font-bold text-[#EFFFFF]">
              {s.dieselOutput} kW <span className="text-[#FFA000]">({dieselPct}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#06131D] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFA000] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, dieselPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Summary Mini-Stat Blocks */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#102B3B]">
        <div className="p-2 rounded-lg bg-[#06131D] border border-[#102B3B] text-center">
          <p className="text-[9px] font-bold text-[#89A7B7] uppercase">FORECAST</p>
          <p className="text-xs font-mono font-extrabold text-[#48D5FF] mt-0.5">{s.forecast || 'Stable'}</p>
        </div>
        <div className="p-2 rounded-lg bg-[#06131D] border border-[#102B3B] text-center">
          <p className="text-[9px] font-bold text-[#89A7B7] uppercase">EFFICIENCY</p>
          <p className="text-xs font-mono font-extrabold text-[#35D47A] mt-0.5">{s.efficiency || '94.2%'}</p>
        </div>
        <div className="p-2 rounded-lg bg-[#06131D] border border-[#102B3B] text-center">
          <p className="text-[9px] font-bold text-[#89A7B7] uppercase">CO₂ SAVED</p>
          <p className="text-xs font-mono font-extrabold text-[#35D47A] mt-0.5">{s.co2Saved || '1.82 t'}</p>
        </div>
      </div>
    </div>
  );
}
