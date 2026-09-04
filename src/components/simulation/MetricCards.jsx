import React from 'react';
import { Sun, Wind, BatteryCharging, Zap, Fuel, AlertOctagon } from 'lucide-react';

export default function MetricCards({ state }) {
  const s = state || {
    solarOutput: 284,
    solarRisk: false,
    solarChange: '+8.4%',
    windOutput: 412,
    windRisk: false,
    windChange: '+12.1%',
    batterySOC: 78,
    batteryRisk: false,
    batteryChange: '+4.2%',
    gridLoad: 621,
    gridRisk: false,
    gridStatus: 'NORMAL',
    dieselOutput: 0,
    dieselFuelPercent: 84,
    dieselStatus: 'STANDBY',
    dieselRisk: false,
  };

  const cards = [
    {
      id: 'solar',
      label: 'SOLAR OUTPUT',
      value: `${s.solarOutput} kW`,
      indicator: s.solarRisk ? 'DANGER ZONE' : (s.solarChange || '+8.4%'),
      icon: Sun,
      color: s.solarRisk ? '#FF6257' : '#FFD12A',
      bgColor: s.solarRisk ? 'bg-[#FF6257]/15' : 'bg-[#FFD12A]/10',
      borderColor: s.solarRisk ? 'border-[#FF6257] animate-pulse' : 'border-[#FFD12A]/30',
      textColor: s.solarRisk ? 'text-[#FF6257]' : 'text-[#FFD12A]',
    },
    {
      id: 'wind',
      label: 'WIND OUTPUT',
      value: `${s.windOutput} kW`,
      indicator: s.windRisk ? 'DANGER ZONE' : (s.windChange || '+12.1%'),
      icon: Wind,
      color: s.windRisk ? '#FF6257' : '#299BD7',
      bgColor: s.windRisk ? 'bg-[#FF6257]/15' : 'bg-[#299BD7]/10',
      borderColor: s.windRisk ? 'border-[#FF6257] animate-pulse' : 'border-[#299BD7]/30',
      textColor: s.windRisk ? 'text-[#FF6257]' : 'text-[#299BD7]',
    },
    {
      id: 'battery',
      label: 'BATTERY SOC',
      value: `${s.batterySOC}%`,
      indicator: s.batteryRisk ? '<30% DANGER' : (s.batteryChange || '+4.2%'),
      icon: BatteryCharging,
      color: s.batteryRisk ? '#FF6257' : '#35D47A',
      bgColor: s.batteryRisk ? 'bg-[#FF6257]/15' : 'bg-[#35D47A]/10',
      borderColor: s.batteryRisk ? 'border-[#FF6257] animate-pulse' : 'border-[#35D47A]/30',
      textColor: s.batteryRisk ? 'text-[#FF6257]' : 'text-[#35D47A]',
    },
    {
      id: 'grid',
      label: 'GRID LOAD',
      value: `${s.gridLoad} kW`,
      indicator: s.gridRisk ? 'OVERLOAD STRAIN' : (s.gridStatus || 'NORMAL'),
      icon: Zap,
      color: s.gridRisk ? '#FF6257' : '#35D47A',
      bgColor: s.gridRisk ? 'bg-[#FF6257]/15' : 'bg-[#35D47A]/10',
      borderColor: s.gridRisk ? 'border-[#FF6257]/60' : 'border-[#35D47A]/30',
      textColor: s.gridRisk ? 'text-[#FF6257]' : 'text-[#35D47A]',
    },
    {
      id: 'diesel',
      label: 'DIESEL BACKUP & LEVEL',
      value: `${s.dieselOutput} kW`,
      indicator: `FUEL: ${s.dieselFuelPercent || 84}%`,
      icon: Fuel,
      color: s.dieselRisk ? '#FF6257' : s.dieselOutput > 0 ? '#FFA000' : '#E5A93C',
      bgColor: s.dieselRisk ? 'bg-[#FF6257]/15' : s.dieselOutput > 0 ? 'bg-[#FFA000]/15' : 'bg-[#E5A93C]/10',
      borderColor: s.dieselRisk ? 'border-[#FF6257] animate-pulse' : s.dieselOutput > 0 ? 'border-[#FFA000]/60' : 'border-[#102B3B]',
      textColor: s.dieselRisk ? 'text-[#FF6257]' : s.dieselOutput > 0 ? 'text-[#FFA000]' : 'text-[#E5A93C]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-3.5 sm:p-4 rounded-xl bg-[#0B1D29] border ${card.borderColor} shadow-lg shadow-black/40 relative overflow-hidden transition-all duration-200 hover:translate-y-[-1px]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#89A7B7] uppercase">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-mono font-black text-[#EFFFFF]">
                {card.value}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-[#102B3B] flex items-center justify-between text-[10px]">
              <span className="text-[#89A7B7]">Telemetry</span>
              <span className={`font-mono font-bold ${card.textColor}`}>
                {card.indicator}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
