import React from 'react';
import { Sliders, RotateCcw, Zap, Sun, Wind, Fuel, Radio, Sparkles } from 'lucide-react';

export default function SimulationControls({ state, onChange }) {
  const irradiance = state?.irradiance ?? 82;
  const windSpeed = state?.windSpeed ?? 24;
  const demand = state?.gridLoad ?? 621;
  const weather = state?.weather ?? 'Clear';
  const batteryStrategy = state?.batteryStrategy ?? 'Balanced';
  const emergencyDiesel = state?.emergencyDiesel ?? false;

  const handleIrradianceChange = (val) => {
    onChange({ irradiance: val });
  };

  const handleWindSpeedChange = (val) => {
    onChange({ windSpeed: val });
  };

  const handleDemandChange = (val) => {
    onChange({ gridLoad: val });
  };

  const handleWeatherChange = (val) => {
    onChange({ weather: val });
  };

  const handleBatteryStrategyChange = (val) => {
    onChange({ batteryStrategy: val });
  };

  const handleDieselToggle = (val) => {
    onChange({ emergencyDiesel: val });
  };

  const handleReset = () => {
    onChange({
      irradiance: 82,
      windSpeed: 24,
      gridLoad: 621,
      weather: 'Clear',
      batteryStrategy: 'Balanced',
      emergencyDiesel: false,
    });
  };

  return (
    <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#102B3B]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#48D5FF]" />
          <h3 className="text-xs font-black tracking-wider text-[#EFFFFF] uppercase">
            REAL-TIME SIMULATION CONTROLS
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] font-mono text-[#35D47A] px-1.5 py-0.5 rounded bg-[#35D47A]/15 border border-[#35D47A]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35D47A] pulse-active" />
            LIVE SYNC
          </span>
          <button
            onClick={handleReset}
            className="text-[10px] font-semibold text-[#89A7B7] hover:text-[#48D5FF] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Control Sliders - Instant Real-Time Reaction */}
      <div className="space-y-3.5">
        {/* 1. Solar Irradiance */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#89A7B7] flex items-center gap-1.5 font-medium">
              <Sun className="w-3.5 h-3.5 text-[#FFD12A]" />
              SOLAR IRRADIANCE
            </span>
            <span className="font-mono font-bold text-[#FFD12A]">{irradiance}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={irradiance}
            onChange={(e) => handleIrradianceChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#06131D] rounded-lg appearance-none cursor-pointer accent-[#FFD12A]"
          />
          <div className="flex justify-between text-[9px] text-[#89A7B7] mt-1 font-mono">
            <span>0% (Polar Night)</span>
            <span>50%</span>
            <span>100% (Peak Sun)</span>
          </div>
        </div>

        {/* 2. Wind Speed */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#89A7B7] flex items-center gap-1.5 font-medium">
              <Wind className="w-3.5 h-3.5 text-[#299BD7]" />
              WIND SPEED
            </span>
            <span className="font-mono font-bold text-[#299BD7]">{windSpeed} km/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={windSpeed}
            onChange={(e) => handleWindSpeedChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#06131D] rounded-lg appearance-none cursor-pointer accent-[#299BD7]"
          />
          <div className="flex justify-between text-[9px] text-[#89A7B7] mt-1 font-mono">
            <span>0 km/h (Calm)</span>
            <span>30 km/h</span>
            <span>60 km/h (Gale)</span>
          </div>
        </div>

        {/* 3. Load Demand */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#89A7B7] flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-[#35D47A]" />
              LOAD DEMAND
            </span>
            <span className="font-mono font-bold text-[#35D47A]">{demand} kW</span>
          </div>
          <input
            type="range"
            min="300"
            max="1000"
            step="10"
            value={demand}
            onChange={(e) => handleDemandChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#06131D] rounded-lg appearance-none cursor-pointer accent-[#35D47A]"
          />
          <div className="flex justify-between text-[9px] text-[#89A7B7] mt-1 font-mono">
            <span>300 kW (Low)</span>
            <span>620 kW (Nominal)</span>
            <span>1000 kW (Surge)</span>
          </div>
        </div>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Weather Condition */}
        <div>
          <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
            WEATHER ATMOSPHERE
          </label>
          <select
            value={weather}
            onChange={(e) => handleWeatherChange(e.target.value)}
            className="w-full px-2.5 py-2 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none cursor-pointer"
          >
            <option value="Clear">Clear Subzero</option>
            <option value="Cloudy">Overcast / Cloud</option>
            <option value="Snow">Antarctic Snowfall</option>
            <option value="Storm">Blizzard Storm</option>
          </select>
        </div>

        {/* Battery Strategy */}
        <div>
          <label className="block text-[10px] font-bold text-[#89A7B7] uppercase tracking-wider mb-1">
            BATTERY STRATEGY
          </label>
          <select
            value={batteryStrategy}
            onChange={(e) => handleBatteryStrategyChange(e.target.value)}
            className="w-full px-2.5 py-2 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none cursor-pointer"
          >
            <option value="Balanced">Balanced Dispatch</option>
            <option value="Grid Support">Grid Support</option>
            <option value="Maximum Renewable">Max Renewable</option>
            <option value="Emergency Reserve">Reserve Buffer</option>
          </select>
        </div>
      </div>

      {/* Emergency Diesel Toggle */}
      <div className="p-3 rounded-lg bg-[#06131D] border border-[#102B3B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Fuel className="w-4 h-4 text-[#FF6257]" />
          <div>
            <span className="text-xs font-bold text-[#EFFFFF]">EMERGENCY DIESEL FORCE-START</span>
            <p className="text-[10px] text-[#89A7B7]">
              {emergencyDiesel ? 'Manual Genset Override Online' : 'Auto Standby Mode (Triggered on Deficit)'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleDieselToggle(!emergencyDiesel)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            emergencyDiesel ? 'bg-[#FF6257]' : 'bg-[#102B3B]'
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
              emergencyDiesel ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      <div className="p-2 rounded-lg bg-[#06131D]/80 border border-[#102B3B] flex items-center gap-2 text-[10px] text-[#89A7B7]">
        <Sparkles className="w-3.5 h-3.5 text-[#48D5FF] flex-shrink-0" />
        <span>Real-time digital twin: All 3D graphics, power flows, and analytics update instantaneously with any input modification.</span>
      </div>
    </div>
  );
}
