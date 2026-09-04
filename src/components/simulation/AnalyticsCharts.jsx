import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { TrendingUp, BatteryCharging } from 'lucide-react';

export default function AnalyticsCharts({ timelineData, batteryData }) {
  const defaultTimeline = [
    { time: '00:00', solar: 0, wind: 380, battery: 120, diesel: 0, demand: 500 },
    { time: '03:00', solar: 0, wind: 410, battery: 110, diesel: 0, demand: 520 },
    { time: '06:00', solar: 80, wind: 390, battery: 100, diesel: 0, demand: 570 },
    { time: '09:00', solar: 220, wind: 400, battery: 60, diesel: 0, demand: 610 },
    { time: '12:00', solar: 284, wind: 412, battery: 146, diesel: 0, demand: 621 },
    { time: '15:00', solar: 240, wind: 430, battery: 150, diesel: 0, demand: 630 },
    { time: '18:00', solar: 90, wind: 450, battery: 90, diesel: 0, demand: 640 },
    { time: '21:00', solar: 0, wind: 420, battery: 80, diesel: 0, demand: 590 },
    { time: '24:00', solar: 0, wind: 390, battery: 110, diesel: 0, demand: 510 },
  ];

  const defaultBattery = [
    { time: '00:00', soc: 72 },
    { time: '03:00', soc: 70 },
    { time: '06:00', soc: 68 },
    { time: '09:00', soc: 72 },
    { time: '12:00', soc: 78 }, // NOW
    { time: '15:00', soc: 82 },
    { time: '18:00', soc: 80 },
    { time: '21:00', soc: 76 },
    { time: '24:00', soc: 74 },
  ];

  const genData = timelineData && timelineData.length > 0 ? timelineData : defaultTimeline;
  const socData = batteryData && batteryData.length > 0 ? batteryData : defaultBattery;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* CHART 1: 24-HOUR POWER GENERATION */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0B1D29] border border-[#102B3B] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#102B3B]">
          <div>
            <h3 className="text-xs font-black tracking-wider text-[#EFFFFF] flex items-center gap-1.5 uppercase">
              <TrendingUp className="w-4 h-4 text-[#48D5FF]" />
              24-HOUR POWER GENERATION
            </h3>
            <p className="text-[10px] text-[#89A7B7]">
              Continuous multi-source generation vs grid demand
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-[#FFD12A]">● Solar</span>
            <span className="text-[#299BD7]">● Wind</span>
            <span className="text-[#35D47A]">● Batt</span>
            <span className="text-[#FF6257]">● Demand</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={genData}>
              <defs>
                <linearGradient id="solarG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD12A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFD12A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="windG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#299BD7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#299BD7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#102B3B" vertical={false} />
              <XAxis dataKey="time" stroke="#89A7B7" tick={{ fill: '#89A7B7', fontSize: 10 }} />
              <YAxis stroke="#89A7B7" tick={{ fill: '#89A7B7', fontSize: 10 }} unit=" kW" domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#06131D',
                  borderColor: '#102B3B',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  color: '#EFFFFF',
                }}
              />
              <Area type="monotone" dataKey="solar" name="Solar" stroke="#FFD12A" fill="url(#solarG)" strokeWidth={2} />
              <Area type="monotone" dataKey="wind" name="Wind" stroke="#299BD7" fill="url(#windG)" strokeWidth={2} />
              <Line type="monotone" dataKey="demand" name="Demand" stroke="#FF6257" strokeWidth={2} strokeDasharray="3 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: BATTERY STATE OF CHARGE */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0B1D29] border border-[#102B3B] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#102B3B]">
          <div>
            <h3 className="text-xs font-black tracking-wider text-[#EFFFFF] flex items-center gap-1.5 uppercase">
              <BatteryCharging className="w-4 h-4 text-[#35D47A]" />
              BATTERY STATE OF CHARGE (SOC)
            </h3>
            <p className="text-[10px] text-[#89A7B7]">
              Reserve buffer maintained above 30% safety threshold
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-[#35D47A] font-bold">● SOC %</span>
            <span className="text-[#48D5FF] font-bold">| NOW (12:00)</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={socData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#102B3B" vertical={false} />
              <XAxis dataKey="time" stroke="#89A7B7" tick={{ fill: '#89A7B7', fontSize: 10 }} />
              <YAxis stroke="#89A7B7" tick={{ fill: '#89A7B7', fontSize: 10 }} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#06131D',
                  borderColor: '#102B3B',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  color: '#EFFFFF',
                }}
              />
              <ReferenceLine x="12:00" stroke="#48D5FF" strokeDasharray="3 3" label={{ value: 'NOW', fill: '#48D5FF', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine y={30} stroke="#FF6257" strokeDasharray="4 4" label={{ value: 'MIN 30%', fill: '#FF6257', fontSize: 9, position: 'insideBottomRight' }} />
              <Line type="monotone" dataKey="soc" name="SOC %" stroke="#35D47A" strokeWidth={3} dot={{ r: 3, fill: '#35D47A' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
