import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

export default function EnergyMix({ simulationState }) {
  const s = simulationState || {
    solarOutput: 284,
    solarRisk: false,
    windOutput: 412,
    batteryPower: 146,
    dieselOutput: 0,
  };

  const total = Math.max(1, s.solarOutput + s.windOutput + Math.max(0, s.batteryPower) + s.dieselOutput);

  const data = [
    { name: 'Solar', value: s.solarOutput, color: s.solarRisk ? '#FF6257' : '#FFD12A' },
    { name: 'Wind', value: s.windOutput, color: '#299BD7' },
    { name: 'Battery', value: Math.max(0, s.batteryPower), color: '#35D47A' },
    { name: 'Diesel', value: s.dieselOutput, color: '#FFA000' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#102B3B]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#48D5FF]" />
          <h3 className="text-xs font-black tracking-wider text-[#EFFFFF] uppercase">
            LIVE ENERGY MIX
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#89A7B7]">
          4 ACTIVE VECTORS
        </span>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative h-44 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#06131D',
                borderColor: '#102B3B',
                borderRadius: '0.5rem',
                fontSize: '11px',
                color: '#EFFFFF',
              }}
              formatter={(value) => [`${value} kW (${Math.round((value / total) * 100)}%)`, '']}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#06131D" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-base font-black font-mono text-[#EFFFFF]">
            {total} <span className="text-[10px] text-[#48D5FF]">kW</span>
          </span>
          <span className="text-[8px] font-bold tracking-widest text-[#89A7B7] uppercase">
            GENERATION
          </span>
        </div>
      </div>

      {/* Legend Below Donut */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#102B3B]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#89A7B7]">
            <span className={`w-2 h-2 rounded-full ${s.solarRisk ? 'bg-[#FF6257]' : 'bg-[#FFD12A]'}`} /> Solar
          </span>
          <span className={`font-mono font-bold ${s.solarRisk ? 'text-[#FF6257]' : 'text-[#FFD12A]'}`}>
            {Math.round((s.solarOutput / total) * 100)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#89A7B7]">
            <span className="w-2 h-2 rounded-full bg-[#299BD7]" /> Wind
          </span>
          <span className="font-mono font-bold text-[#299BD7]">
            {Math.round((s.windOutput / total) * 100)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#89A7B7]">
            <span className="w-2 h-2 rounded-full bg-[#35D47A]" /> Battery
          </span>
          <span className="font-mono font-bold text-[#35D47A]">
            {Math.round((Math.max(0, s.batteryPower) / total) * 100)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#89A7B7]">
            <span className="w-2 h-2 rounded-full bg-[#FFA000]" /> Diesel
          </span>
          <span className="font-mono font-bold text-[#FFA000]">
            {Math.round((s.dieselOutput / total) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
