import React from 'react';
import { Layers, Sparkles, AlertTriangle, AlertOctagon, Fuel, ShieldCheck } from 'lucide-react';

export default function EnergySimulation3D({ simulationState, onSelectComponent, selectedComponent }) {
  const s = simulationState || {
    solarOutput: 284,
    solarRisk: false,
    windOutput: 412,
    windRisk: false,
    batterySOC: 78,
    batteryPower: 146,
    batteryHealth: 96,
    batteryRisk: false,
    gridLoad: 621,
    gridRisk: false,
    dieselOutput: 0,
    dieselFuelPercent: 84,
    dieselBurnRateLph: 0.0,
    dieselRisk: false,
    windSpeed: 24,
    solarEfficiency: 91,
    irradiance: 82,
    scenarioMode: 'clear',
  };

  // Real-time blade animation speed calculation based on wind speed
  const bladeDuration = s.windSpeed > 0 ? (30 / Math.max(6, s.windSpeed)) * 1.8 : 99999;
  const bladeDuration2 = s.windSpeed > 0 ? (30 / Math.max(6, s.windSpeed)) * 1.6 : 99999;
  const bladeDuration3 = s.windSpeed > 0 ? (30 / Math.max(6, s.windSpeed)) * 2.0 : 99999;

  // Real-time battery fill width (max 20px in isometric rect)
  const battFillWidth1 = Math.max(2, Math.round((s.batterySOC / 100) * 20));
  const battFillWidth2 = Math.max(2, Math.round((s.batterySOC / 100) * 16));

  // Industrial Warm Amber/Gold palette for Diesel (non-danger)
  const dieselColor = s.dieselRisk ? '#FF6257' : s.dieselOutput > 0 ? '#FFA000' : '#E5A93C';
  const dieselBgColor = s.dieselRisk ? '#4A1215' : s.dieselOutput > 0 ? '#3D2A0E' : '#221A0C';

  // Interactive component specifications
  const components = {
    solar: {
      id: 'solar',
      name: 'SOLAR ARRAY',
      subtitle: 'Photovoltaic Polar Bifacial Modules',
      category: 'Generation',
      output: `${s.solarOutput} kW`,
      efficiency: `${s.solarEfficiency}%`,
      temperature: s.solarRisk ? '-32°C (Extreme Frost)' : '-14°C',
      panelHealth: s.solarRisk ? '72% (Obscured / Cold Stress)' : '98%',
      predictedOutput: `${Math.round(s.solarOutput * 1.08)} kW`,
      accent: s.solarRisk ? '#FF6257' : '#FFD12A',
      status: s.solarRisk ? 'CRITICAL RISK: Generation Deficit' : 'Nominal Active Generation',
      metrics: [
        { label: 'Current Output', value: `${s.solarOutput} kW`, color: s.solarRisk ? '#FF6257' : '#FFD12A' },
        { label: 'Irradiance Efficiency', value: `${s.solarEfficiency}%`, color: s.solarRisk ? '#FF6257' : '#48D5FF' },
        { label: 'Array Temperature', value: s.solarRisk ? '-32°C' : '-14°C', color: '#89A7B7' },
        { label: 'Albedo Harvest', value: s.solarRisk ? '0.0% (Storm Loss)' : '+18.4%', color: s.solarRisk ? '#FF6257' : '#35D47A' },
        { label: 'Risk State', value: s.solarRisk ? 'DANGER ZONE' : 'OPTIMAL', color: s.solarRisk ? '#FF6257' : '#35D47A' },
      ],
    },
    wind: {
      id: 'wind',
      name: 'WIND FARM',
      subtitle: '3x Arctic-Grade Wind Turbines',
      category: 'Generation',
      output: `${s.windOutput} kW`,
      windSpeed: `${s.windSpeed} km/h`,
      efficiency: s.windRisk ? '54%' : '94%',
      bladePitch: s.windRisk ? '42.0° (Feathered Auto-Defense)' : '14.2°',
      accent: s.windRisk ? '#FF6257' : '#299BD7',
      status: s.windRisk ? 'DANGER ZONE: Velocity Anomaly (Stall / Storm Gust Strain)' : 'High Velocity Nominal Generation',
      metrics: [
        { label: 'Current Output', value: `${s.windOutput} kW`, color: s.windRisk ? '#FF6257' : '#299BD7' },
        { label: 'Wind Velocity', value: `${s.windSpeed} km/h`, color: s.windRisk ? '#FF6257' : '#48D5FF' },
        { label: 'Turbine WT-01 (Ridge)', value: `${Math.round(s.windOutput * 0.35)} kW`, color: '#299BD7' },
        { label: 'Turbine WT-02 (Central)', value: `${Math.round(s.windOutput * 0.38)} kW`, color: '#299BD7' },
        { label: 'Turbine WT-03 (Coast)', value: `${Math.round(s.windOutput * 0.27)} kW`, color: '#299BD7' },
        { label: 'Risk State', value: s.windRisk ? 'DANGER ZONE' : 'OPTIMAL', color: s.windRisk ? '#FF6257' : '#35D47A' },
      ],
    },
    hub: {
      id: 'hub',
      name: 'CENTRAL POWER HUB',
      subtitle: 'Microgrid Inverter & Supervisory Bus',
      category: 'Distribution',
      currentLoad: `${s.gridLoad} kW`,
      busVoltage: '415 V AC',
      frequency: s.gridRisk ? '49.82 Hz (Strain)' : '50.02 Hz',
      priority: 'HIGH',
      accent: s.gridRisk ? '#FF6257' : '#48D5FF',
      status: s.gridRisk ? 'HIGH LOAD DEFENSE ACTIVE' : 'Synchronized & Stable',
      metrics: [
        { label: 'Total Grid Flow', value: `${s.gridLoad} kW`, color: s.gridRisk ? '#FF6257' : '#48D5FF' },
        { label: 'Bus Frequency', value: s.gridRisk ? '49.82 Hz' : '50.02 Hz', color: s.gridRisk ? '#FFA000' : '#35D47A' },
        { label: 'Voltage Stability', value: '415.2 V (±0.4%)', color: '#35D47A' },
        { label: 'Phase Balance', value: '99.8%', color: '#35D47A' },
        { label: 'Transformer Temp', value: s.gridRisk ? '+48°C (Cooling Max)' : '+34°C (Nominal)', color: s.gridRisk ? '#FF6257' : '#FFA000' },
      ],
    },
    battery: {
      id: 'battery',
      name: 'BATTERY STORAGE',
      subtitle: '1.2 MWh Arctic LiFePO4 ESS',
      category: 'Storage',
      soc: `${s.batterySOC}%`,
      chargeRate: `${s.batteryPower >= 0 ? `+${s.batteryPower}` : s.batteryPower} kW`,
      health: `${s.batteryHealth}%`,
      cellTemp: s.batteryRisk ? '+11.2°C (Heater Active)' : '+18.5°C',
      accent: s.batteryRisk ? '#FF6257' : '#A987FF',
      status: s.batteryRisk ? 'CRITICAL DANGER: Below 30% Safety Reserve' : s.batteryPower >= 0 ? 'Charging (Surplus Energy)' : 'Discharging to Support Load',
      metrics: [
        { label: 'State of Charge (SOC)', value: `${s.batterySOC}%`, color: s.batteryRisk ? '#FF6257' : '#A987FF' },
        { label: 'Power Flow', value: `${s.batteryPower >= 0 ? `+${s.batteryPower}` : s.batteryPower} kW`, color: s.batteryPower >= 0 ? '#35D47A' : '#FFA000' },
        { label: 'Battery Cell Health', value: `${s.batteryHealth}%`, color: '#35D47A' },
        { label: 'Reserve State', value: s.batteryRisk ? '<30% DANGER ZONE' : '>30% Buffer Safe', color: s.batteryRisk ? '#FF6257' : '#35D47A' },
      ],
    },
    diesel: {
      id: 'diesel',
      name: 'DIESEL BACKUP GENERATOR',
      subtitle: '2x 500 kW Caterpillar Industrial Gensets',
      category: 'Backup',
      output: `${s.dieselOutput} kW`,
      fuel: `${s.dieselFuelPercent || 84}%`,
      status: s.dieselOutput > 0 ? 'ACTIVE POWER DISPATCH (Nominal Support)' : 'STANDBY READY (Zero Fuel Burn)',
      accent: '#FFA000',
      metrics: [
        { label: 'Current Output', value: `${s.dieselOutput} kW`, color: '#FFA000' },
        { label: 'Fuel Tank Reserve', value: `${s.dieselFuelPercent || 84}% (${(s.dieselFuelLiters || 37800).toLocaleString()} L)`, color: '#FFA000' },
        { label: 'Fuel Burn Rate', value: `${s.dieselBurnRateLph || 0.0} L/h`, color: '#FFA000' },
        { label: 'Remaining Hours', value: `~${s.dieselRemainingHours || 440} Hours`, color: '#35D47A' },
      ],
    },
    research: {
      id: 'research',
      name: 'RESEARCH STATION',
      subtitle: 'Main Science & Atmosphere Labs',
      category: 'Load',
      load: `${Math.round(s.gridLoad * 0.29)} kW`,
      priority: 'HIGH',
      accent: '#48D5FF',
      status: 'P1 Mission Critical',
      metrics: [
        { label: 'Subsystem Load', value: `${Math.round(s.gridLoad * 0.29)} kW`, color: '#48D5FF' },
        { label: 'Clean Energy Feed', value: s.solarRisk ? 'Battery & Diesel Backup' : '100% Renewable', color: '#35D47A' },
        { label: 'Atmosphere Spectrometer', value: `${Math.round(s.gridLoad * 0.07)} kW`, color: '#89A7B7' },
        { label: 'Subzero Ice Core Freezers', value: `${Math.round(s.gridLoad * 0.10)} kW`, color: '#89A7B7' },
        { label: 'Life Support & Habitat', value: `${Math.round(s.gridLoad * 0.12)} kW`, color: '#FFA000' },
      ],
    },
    communication: {
      id: 'communication',
      name: 'COMMUNICATION HUB',
      subtitle: 'Deep Space Satellite Uplink & RADAR',
      category: 'Load',
      load: `${Math.round(s.gridLoad * 0.15)} kW`,
      priority: 'CRITICAL',
      accent: '#48D5FF',
      status: 'P0 Uninterruptible Power',
      metrics: [
        { label: 'Subsystem Load', value: `${Math.round(s.gridLoad * 0.15)} kW`, color: '#48D5FF' },
        { label: 'Satellite Dish De-Icer', value: `${Math.round(s.gridLoad * 0.08)} kW`, color: '#FFA000' },
        { label: 'RF Telemetry Array', value: `${Math.round(s.gridLoad * 0.05)} kW`, color: '#89A7B7' },
        { label: 'Emergency Beacon Bus', value: `${Math.round(s.gridLoad * 0.02)} kW`, color: '#35D47A' },
      ],
    },
    storage: {
      id: 'storage',
      name: 'STORAGE FACILITY',
      subtitle: 'Cold-Chain Provisions & Workshop',
      category: 'Load',
      load: `${Math.round(s.gridLoad * 0.11)} kW`,
      priority: 'NORMAL',
      accent: '#48D5FF',
      status: 'P2 Flexible Curtailable Load',
      metrics: [
        { label: 'Subsystem Load', value: `${Math.round(s.gridLoad * 0.11)} kW`, color: '#48D5FF' },
        { label: 'Workshop Machine Tools', value: `${Math.round(s.gridLoad * 0.06)} kW`, color: '#89A7B7' },
        { label: 'Provisions Cryo-Lock', value: `${Math.round(s.gridLoad * 0.03)} kW`, color: '#89A7B7' },
        { label: 'Perimeter Lighting', value: `${Math.round(s.gridLoad * 0.02)} kW`, color: '#FFA000' },
      ],
    },
  };

  const handleComponentClick = (key) => {
    if (onSelectComponent && components[key]) {
      onSelectComponent(components[key]);
    }
  };

  const isSel = (id) => selectedComponent?.id === id;

  return (
    <div className="relative rounded-2xl bg-[#06131D] border border-[#102B3B] p-3 sm:p-5 shadow-2xl overflow-hidden flex flex-col justify-between">
      {/* Simulation Header Banner */}
      <div className="flex items-center justify-between z-20 pb-3 border-b border-[#102B3B]/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#48D5FF]/10 text-[#48D5FF]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold tracking-wider text-[#EFFFFF]">
                ARCTIC ENERGY MICROGRID 3D DIGITAL TWIN
              </h3>
              {s.solarRisk || s.batteryRisk || s.windRisk ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6257]/20 text-[#FF6257] border border-[#FF6257]/40 font-mono font-black flex items-center gap-1 animate-pulse">
                  <AlertOctagon className="w-3 h-3" />
                  DANGER ZONE ACTIVE
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#35D47A]/20 text-[#35D47A] font-mono font-bold">
                  ALL SYSTEMS NOMINAL (SAFE)
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#89A7B7]">
              Real-time threat monitoring: Subsystem highlights in <span className="text-[#FF6257] font-bold">RED</span> when entering danger zone.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#89A7B7] font-mono">
          <span className={`flex items-center gap-1 ${s.windRisk ? 'text-[#FF6257] font-bold animate-pulse' : 'text-[#299BD7]'}`}>
            <span className={`w-2 h-2 rounded-full ${s.windRisk ? 'bg-[#FF6257]' : 'bg-[#299BD7]'}`} />
            Wind {s.windRisk ? '(DANGER ZONE)' : `(${s.windOutput} kW)`}
          </span>
          <span className={`flex items-center gap-1 ${s.solarRisk ? 'text-[#FF6257] font-bold' : 'text-[#FFD12A]'}`}>
            <span className={`w-2 h-2 rounded-full ${s.solarRisk ? 'bg-[#FF6257]' : 'bg-[#FFD12A]'}`} />
            Solar {s.solarRisk ? '(DANGER)' : `(${s.solarOutput} kW)`}
          </span>
          <span className="flex items-center gap-1 text-[#FFA000]">
            <span className="w-2 h-2 rounded-full bg-[#FFA000]" />
            Diesel ({s.dieselOutput > 0 ? `${s.dieselOutput} kW` : 'Standby'})
          </span>
        </div>
      </div>

      {/* 3D Isometric Microgrid Scene Viewport */}
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] my-2 select-none overflow-hidden rounded-xl bg-gradient-to-b from-[#06131D] via-[#081825] to-[#0A1F2F] flex items-center justify-center">
        {/* Subtle Arctic Horizon Glow & Distant Mountain Silhouettes */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 600">
            <defs>
              <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#299BD7" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#48D5FF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#06131D" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="1000" height="600" fill="url(#horizonGlow)" />
            <path
              d="M0,240 L120,180 L250,220 L380,160 L520,210 L680,150 L820,200 L1000,160 L1000,600 L0,600 Z"
              fill="#081A28"
              opacity="0.6"
            />
            <path
              d="M0,280 L180,220 L340,260 L490,200 L640,250 L800,190 L1000,240 L1000,600 L0,600 Z"
              fill="#0B2132"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* 3D Isometric SVG Container */}
        <svg
          className="w-full h-full z-10"
          viewBox="0 0 960 560"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="isoGrid" width="60" height="34.64" patternUnits="userSpaceOnUse">
              <path
                d="M 30,0 L 60,17.32 L 30,34.64 L 0,17.32 Z"
                fill="none"
                stroke="#102B3B"
                strokeWidth="0.8"
                opacity="0.4"
              />
            </pattern>

            <style>{`
              @keyframes flowYellow {
                from { stroke-dashoffset: 40; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes flowBlue {
                from { stroke-dashoffset: 40; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes flowGreen {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: 40; }
              }
              @keyframes flowAmber {
                from { stroke-dashoffset: 40; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes flowCyan {
                from { stroke-dashoffset: 40; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes spinBladesDynamic {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes pulseDangerRed {
                0% { opacity: 0.4; }
                50% { opacity: 0.95; }
                100% { opacity: 0.4; }
              }
              .powerline-yellow {
                stroke-dasharray: 6 6;
                animation: flowYellow 1s linear infinite;
              }
              .powerline-blue {
                stroke-dasharray: 6 6;
                animation: flowBlue 1s linear infinite;
              }
              .powerline-green {
                stroke-dasharray: 6 6;
                animation: flowGreen 1s linear infinite;
              }
              .powerline-amber {
                stroke-dasharray: 6 6;
                animation: flowAmber 1.2s linear infinite;
              }
              .powerline-cyan {
                stroke-dasharray: 6 6;
                animation: flowCyan 0.9s linear infinite;
              }
              .danger-pulse-anim {
                animation: pulseDangerRed 1.2s infinite;
              }
            `}</style>
          </defs>

          {/* ISOMETRIC GROUND BASE */}
          <polygon
            points="480,90 920,330 480,550 40,330"
            fill="#081A28"
            stroke="#102B3B"
            strokeWidth="2"
          />
          <polygon
            points="480,90 920,330 480,550 40,330"
            fill="url(#isoGrid)"
          />

          {/* ========================================================= */}
          {/* POWER FLOW TRANSMISSION LINES */}
          {/* ========================================================= */}

          {/* Line 1: Solar Farm (230, 220) -> Central Power Hub (460, 305) */}
          <path
            d="M 230,220 L 460,305"
            fill="none"
            stroke="#3A3815"
            strokeWidth="4"
          />
          <path
            d="M 230,220 L 460,305"
            fill="none"
            stroke={s.solarRisk ? '#FF6257' : '#FFD12A'}
            strokeWidth="2.5"
            className={s.solarOutput > 0 ? (s.solarRisk ? 'powerline-red' : 'powerline-yellow') : ''}
            opacity={s.solarOutput > 0 ? 1 : 0.2}
          />

          {/* Line 2: Wind Farm (430, 170) -> Central Power Hub (475, 290) */}
          <path
            d="M 430,170 L 475,290"
            fill="none"
            stroke="#122C44"
            strokeWidth="4"
          />
          <path
            d="M 430,170 L 475,290"
            fill="none"
            stroke={s.windRisk ? '#FF6257' : '#299BD7'}
            strokeWidth="2.5"
            className={s.windOutput > 0 ? (s.windRisk ? 'powerline-red' : 'powerline-blue') : ''}
            opacity={s.windOutput > 0 ? 1 : 0.2}
          />

          {/* Line 3: Battery Storage (730, 270) -> Central Power Hub (505, 310) */}
          <path
            d="M 730,270 L 505,310"
            fill="none"
            stroke="#163A26"
            strokeWidth="4"
          />
          <path
            d="M 730,270 L 505,310"
            fill="none"
            stroke={s.batteryRisk ? '#FF6257' : '#35D47A'}
            strokeWidth="2.5"
            className={s.batteryRisk ? 'powerline-red' : 'powerline-green'}
          />

          {/* Line 4: Diesel Generator (240, 400) -> Central Power Hub (465, 335) - WARM AMBER PALETTE */}
          <path
            d="M 240,400 L 465,335"
            fill="none"
            stroke="#3B2A10"
            strokeWidth="4"
          />
          <path
            d="M 240,400 L 465,335"
            fill="none"
            stroke={dieselColor}
            strokeWidth="2.5"
            className={s.dieselOutput > 0 ? 'powerline-amber' : ''}
            strokeDasharray={s.dieselOutput > 0 ? '6 6' : '0'}
            opacity={s.dieselOutput > 0 ? 1 : 0.3}
          />

          {/* Line 5: Central Power Hub (495, 335) -> Load Buildings (670, 420) */}
          <path
            d="M 495,335 L 670,420"
            fill="none"
            stroke="#113647"
            strokeWidth="4"
          />
          <path
            d="M 495,335 L 670,420"
            fill="none"
            stroke="#48D5FF"
            strokeWidth="2.5"
            className="powerline-cyan"
          />

          {/* ========================================================= */}
          {/* 1. SOLAR FARM (Upper-Left) - TURNS RED ON DANGER ZONE */}
          {/* ========================================================= */}
          <g
            onClick={() => handleComponentClick('solar')}
            className="cursor-pointer group"
            transform="translate(140, 140)"
          >
            <polygon
              points="90,10 180,60 90,110 0,60"
              fill={s.solarRisk ? '#4A1215' : isSel('solar') ? '#FFD12A' : '#0B1D29'}
              fillOpacity={s.solarRisk ? '0.6' : isSel('solar') ? '0.35' : '0.8'}
              stroke={s.solarRisk ? '#FF6257' : '#FFD12A'}
              strokeWidth={s.solarRisk ? '2.5' : isSel('solar') ? '2.5' : '1'}
              className={s.solarRisk ? 'danger-pulse-anim' : 'transition-all duration-200'}
            />

            {/* Panels */}
            <g transform="translate(30, 30)">
              <polygon
                points="0,15 25,0 55,15 30,30"
                fill={s.solarRisk ? '#8B1E28' : s.solarOutput > 0 ? '#0D385E' : '#06192B'}
                stroke={s.solarRisk ? '#FF6257' : '#48D5FF'}
                strokeWidth="1.2"
              />
              <polygon points="5,15 25,3 50,15 30,27" fill={s.solarRisk ? '#5A141A' : '#051D33'} />
              <line x1="15" y1="9" x2="40" y2="21" stroke={s.solarRisk ? '#FF6257' : '#FFD12A'} strokeWidth="0.8" opacity={0.9} />
            </g>

            <g transform="translate(60, 15)">
              <polygon
                points="0,15 25,0 55,15 30,30"
                fill={s.solarRisk ? '#8B1E28' : s.solarOutput > 0 ? '#0D385E' : '#06192B'}
                stroke={s.solarRisk ? '#FF6257' : '#48D5FF'}
                strokeWidth="1.2"
              />
              <polygon points="5,15 25,3 50,15 30,27" fill={s.solarRisk ? '#5A141A' : '#051D33'} />
              <line x1="15" y1="9" x2="40" y2="21" stroke={s.solarRisk ? '#FF6257' : '#FFD12A'} strokeWidth="0.8" opacity={0.9} />
            </g>

            <g transform="translate(75, 40)">
              <polygon
                points="0,15 25,0 55,15 30,30"
                fill={s.solarRisk ? '#8B1E28' : s.solarOutput > 0 ? '#0D385E' : '#06192B'}
                stroke={s.solarRisk ? '#FF6257' : '#48D5FF'}
                strokeWidth="1.2"
              />
              <polygon points="5,15 25,3 50,15 30,27" fill={s.solarRisk ? '#5A141A' : '#051D33'} />
              <line x1="15" y1="9" x2="40" y2="21" stroke={s.solarRisk ? '#FF6257' : '#FFD12A'} strokeWidth="0.8" opacity={0.9} />
            </g>

            {/* Label Card */}
            <g transform="translate(15, -15)">
              <rect
                width="135"
                height="34"
                rx="6"
                fill="#06131D"
                stroke={s.solarRisk ? '#FF6257' : '#FFD12A'}
                strokeWidth="1.2"
                opacity="0.95"
              />
              <text x="8" y="14" fill={s.solarRisk ? '#FF6257' : '#FFD12A'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.solarRisk ? '⚠️ SOLAR DANGER' : 'SOLAR ARRAY'}
              </text>
              <text x="8" y="27" fill="#EFFFFF" fontSize="11" fontWeight="900" fontFamily="monospace">
                {s.solarOutput} kW
              </text>
              <text x="75" y="27" fill={s.solarRisk ? '#FF6257' : '#89A7B7'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.solarRisk ? 'DEFICIT' : `Eff: ${s.solarEfficiency}%`}
              </text>
            </g>
          </g>

          {/* ========================================================= */}
          {/* 2. WIND FARM (Upper-Middle/Left) - TURNS RED ON DANGER ZONE */}
          {/* ========================================================= */}
          <g
            onClick={() => handleComponentClick('wind')}
            className="cursor-pointer group"
            transform="translate(340, 80)"
          >
            {/* Turbine 1 */}
            <g transform="translate(30, 30)">
              <line x1="0" y1="50" x2="0" y2="0" stroke={s.windRisk ? '#FF6257' : '#89A7B7'} strokeWidth={s.windRisk ? '4' : '3'} />
              <circle cx="0" cy="0" r="3" fill={s.windRisk ? '#FF6257' : '#299BD7'} />
              <g
                style={{
                  transformOrigin: '0px 0px',
                  animation: `spinBladesDynamic ${bladeDuration}s linear infinite`,
                }}
              >
                <line x1="0" y1="0" x2="0" y2="-24" stroke={s.windRisk ? '#FF6257' : '#EFFFFF'} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="0" x2="20.7" y2="12" stroke={s.windRisk ? '#FF6257' : '#EFFFFF'} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-20.7" y2="12" stroke={s.windRisk ? '#FF6257' : '#EFFFFF'} strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>

            {/* Turbine 2 */}
            <g transform="translate(80, 10)">
              <line x1="0" y1="65" x2="0" y2="0" stroke={s.windRisk ? '#FF6257' : '#EFFFFF'} strokeWidth={s.windRisk ? '4.5' : '3.5'} />
              <circle cx="0" cy="0" r="4" fill={s.windRisk ? '#FF6257' : '#48D5FF'} />
              <g
                style={{
                  transformOrigin: '0px 0px',
                  animation: `spinBladesDynamic ${bladeDuration2}s linear infinite`,
                }}
              >
                <line x1="0" y1="0" x2="0" y2="-30" stroke={s.windRisk ? '#FF6257' : '#48D5FF'} strokeWidth="2.5" strokeLinecap="round" />
                <line x1="0" y1="0" x2="26" y2="15" stroke={s.windRisk ? '#FF6257' : '#48D5FF'} strokeWidth="2.5" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-26" y2="15" stroke={s.windRisk ? '#FF6257' : '#48D5FF'} strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </g>

            {/* Turbine 3 */}
            <g transform="translate(130, 35)">
              <line x1="0" y1="50" x2="0" y2="0" stroke={s.windRisk ? '#FF6257' : '#89A7B7'} strokeWidth={s.windRisk ? '4' : '3'} />
              <circle cx="0" cy="0" r="3" fill={s.windRisk ? '#FF6257' : '#299BD7'} />
              <g
                style={{
                  transformOrigin: '0px 0px',
                  animation: `spinBladesDynamic ${bladeDuration3}s linear infinite`,
                }}
              >
                <line x1="0" y1="0" x2="0" y2="-24" stroke={s.windRisk ? '#FF6257' : '#EFFFFF'} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="0" x2="20.7" y2="12" stroke={s.windRisk ? '#FF6257' : '#EFFFFF'} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-20.7" y2="12" stroke={s.windRisk ? '#FF6257' : '#EFFFFF'} strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>

            {/* Label Card */}
            <g transform="translate(35, -20)">
              <rect
                width="145"
                height="34"
                rx="6"
                fill="#06131D"
                stroke={s.windRisk ? '#FF6257' : '#299BD7'}
                strokeWidth="1.2"
                opacity="0.95"
              />
              <text x="8" y="14" fill={s.windRisk ? '#FF6257' : '#299BD7'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.windRisk ? '⚠️ TURBINE DANGER' : 'WIND FARM'}
              </text>
              <text x="8" y="27" fill="#EFFFFF" fontSize="11" fontWeight="900" fontFamily="monospace">
                {s.windOutput} kW
              </text>
              <text x="80" y="27" fill={s.windRisk ? '#FF6257' : '#89A7B7'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.windSpeed} km/h
              </text>
            </g>
          </g>

          {/* ========================================================= */}
          {/* 3. CENTRAL POWER HUB (Center) */}
          {/* ========================================================= */}
          <g
            onClick={() => handleComponentClick('hub')}
            className="cursor-pointer group"
            transform="translate(420, 240)"
          >
            <polygon
              points="60,0 120,35 60,70 0,35"
              fill={s.gridRisk ? '#4A1215' : isSel('hub') ? '#48D5FF' : '#0B1D29'}
              fillOpacity={s.gridRisk ? '0.6' : isSel('hub') ? '0.4' : '0.9'}
              stroke={s.gridRisk ? '#FF6257' : '#48D5FF'}
              strokeWidth={s.gridRisk ? '2.5' : isSel('hub') ? '2.5' : '1.5'}
            />

            <polygon points="0,35 60,70 60,25 0,-10" fill="#0C2538" stroke="#102B3B" strokeWidth="1" />
            <polygon points="60,70 120,35 120,-10 60,25" fill="#0E2F46" stroke="#102B3B" strokeWidth="1" />
            <polygon points="60,25 120,-10 60,-45 0,-10" fill="#133C57" stroke="#48D5FF" strokeWidth="1.5" />

            <polygon points="12,25 28,34 28,15 12,6" fill={s.gridRisk ? '#FF6257' : '#48D5FF'} opacity="0.8" />
            <polygon points="34,37 50,46 50,27 34,18" fill={s.gridRisk ? '#FF6257' : '#48D5FF'} opacity="0.8" />
            <polygon points="70,46 86,37 86,18 70,27" fill={s.gridRisk ? '#FFA000' : '#35D47A'} opacity="0.8" />
            <polygon points="92,34 108,25 108,6 92,15" fill={s.gridRisk ? '#FFA000' : '#35D47A'} opacity="0.8" />

            <line x1="60" y1="-45" x2="60" y2="-75" stroke={s.gridRisk ? '#FF6257' : '#48D5FF'} strokeWidth="3" />
            <circle cx="60" cy="-75" r="4" fill={s.gridRisk ? '#FF6257' : '#35D47A'} className="pulse-active" />

            {/* Label Card */}
            <g transform="translate(-10, 80)">
              <rect width="145" height="34" rx="6" fill="#06131D" stroke={s.gridRisk ? '#FF6257' : '#48D5FF'} strokeWidth="1.2" opacity="0.95" />
              <text x="8" y="14" fill={s.gridRisk ? '#FF6257' : '#48D5FF'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.gridRisk ? '⚠️ CENTRAL BUS STRAIN' : 'CENTRAL POWER HUB'}
              </text>
              <text x="8" y="27" fill="#EFFFFF" fontSize="11" fontWeight="900" fontFamily="monospace">Load: {s.gridLoad} kW</text>
              <text x="95" y="27" fill={s.gridRisk ? '#FF6257' : '#35D47A'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.gridRisk ? 'OVERLOAD' : 'PRIORITY: P1'}
              </text>
            </g>
          </g>

          {/* ========================================================= */}
          {/* 4. BATTERY STORAGE (Right side) - TURNS RED ON <30% DANGER */}
          {/* ========================================================= */}
          <g
            onClick={() => handleComponentClick('battery')}
            className="cursor-pointer group"
            transform="translate(680, 200)"
          >
            <polygon
              points="55,0 110,32 55,64 0,32"
              fill={s.batteryRisk ? '#5A141A' : isSel('battery') ? '#A987FF' : '#0B1D29'}
              fillOpacity={s.batteryRisk ? '0.6' : isSel('battery') ? '0.4' : '0.8'}
              stroke={s.batteryRisk ? '#FF6257' : '#A987FF'}
              strokeWidth={s.batteryRisk ? '2.5' : isSel('battery') ? '2' : '1'}
              className={s.batteryRisk ? 'danger-pulse-anim' : ''}
            />

            {/* Module 1 */}
            <g transform="translate(10, 0)">
              <polygon points="0,25 35,45 35,15 0,-5" fill={s.batteryRisk ? '#4A1215' : '#1C1838'} stroke={s.batteryRisk ? '#FF6257' : '#A987FF'} strokeWidth="0.8" />
              <polygon points="35,45 70,25 70,-5 35,15" fill={s.batteryRisk ? '#5C161A' : '#241E47'} stroke={s.batteryRisk ? '#FF6257' : '#A987FF'} strokeWidth="0.8" />
              <polygon points="35,15 70,-5 35,-25 0,-5" fill={s.batteryRisk ? '#6E1B20' : '#2F275C'} stroke={s.batteryRisk ? '#FF6257' : '#A987FF'} strokeWidth="1" />
              <rect x="8" y="12" width={battFillWidth1} height="4" rx="2" fill={s.batteryRisk ? '#FF6257' : '#35D47A'} />
              <rect x="42" y="12" width={battFillWidth1} height="4" rx="2" fill={s.batteryRisk ? '#FF6257' : '#35D47A'} />
            </g>

            {/* Module 2 */}
            <g transform="translate(45, -20)">
              <polygon points="0,25 30,42 30,15 0,-2" fill={s.batteryRisk ? '#4A1215' : '#1C1838'} opacity="0.9" />
              <polygon points="30,42 60,25 60,-2 30,15" fill={s.batteryRisk ? '#5C161A' : '#241E47'} opacity="0.9" />
              <polygon points="30,15 60,-2 30,-19 0,-2" fill={s.batteryRisk ? '#6E1B20' : '#2F275C'} stroke={s.batteryRisk ? '#FF6257' : '#A987FF'} strokeWidth="0.8" />
              <rect x="6" y="12" width={battFillWidth2} height="3" rx="1.5" fill={s.batteryRisk ? '#FF6257' : '#35D47A'} />
            </g>

            {/* Label Card */}
            <g transform="translate(0, 70)">
              <rect
                width="145"
                height="34"
                rx="6"
                fill="#06131D"
                stroke={s.batteryRisk ? '#FF6257' : '#A987FF'}
                strokeWidth="1.2"
                opacity="0.95"
              />
              <text x="8" y="14" fill={s.batteryRisk ? '#FF6257' : '#A987FF'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.batteryRisk ? '⚠️ BATTERY DANGER' : 'BATTERY STORAGE'}
              </text>
              <text x="8" y="27" fill={s.batteryRisk ? '#FF6257' : '#35D47A'} fontSize="11" fontWeight="900" fontFamily="monospace">
                SOC: {s.batterySOC}%
              </text>
              <text x="75" y="27" fill={s.batteryPower >= 0 ? '#48D5FF' : '#FFA000'} fontSize="9" fontFamily="sans-serif">
                {s.batteryPower >= 0 ? `+${s.batteryPower}` : s.batteryPower} kW
              </text>
            </g>
          </g>

          {/* ========================================================= */}
          {/* 5. DIESEL BACKUP (Lower-Left) - WARM INDUSTRIAL GOLD/AMBER */}
          {/* ========================================================= */}
          <g
            onClick={() => handleComponentClick('diesel')}
            className="cursor-pointer group"
            transform="translate(160, 340)"
          >
            <polygon
              points="45,0 90,26 45,52 0,26"
              fill={isSel('diesel') ? '#FFA000' : '#0B1D29'}
              fillOpacity={isSel('diesel') ? '0.4' : '0.8'}
              stroke={dieselColor}
              strokeWidth={isSel('diesel') ? '2' : '1'}
            />

            <polygon points="0,26 45,52 45,22 0,-4" fill={dieselBgColor} stroke={dieselColor} strokeWidth="0.8" />
            <polygon points="45,52 90,26 90,-4 45,22" fill={dieselBgColor} stroke={dieselColor} strokeWidth="0.8" />
            <polygon points="45,22 90,-4 45,-30 0,-4" fill={dieselBgColor} stroke={dieselColor} strokeWidth="1" />

            {/* Exhaust Stack */}
            <line x1="30" y1="-15" x2="30" y2="-35" stroke="#89A7B7" strokeWidth="3" />
            {s.dieselOutput > 0 && (
              <circle cx="30" cy="-38" r="4" fill="#FFA000" className="pulse-active" />
            )}

            {/* Label Card with Diesel Level & Non-Danger Amber Theme */}
            <g transform="translate(-15, 60)">
              <rect width="145" height="36" rx="6" fill="#06131D" stroke={dieselColor} strokeWidth="1.2" opacity="0.95" />
              <text x="8" y="14" fill={dieselColor} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.dieselRisk ? '⚠️ DIESEL FUEL LOW' : 'DIESEL BACKUP'}
              </text>
              <text x="8" y="27" fill="#EFFFFF" fontSize="11" fontWeight="900" fontFamily="monospace">
                {s.dieselOutput} kW
              </text>
              <text x="65" y="27" fill={s.dieselOutput > 0 ? '#FFA000' : '#35D47A'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                {s.dieselOutput > 0 ? 'GENSET ACTIVE' : `STANDBY (${s.dieselFuelPercent || 84}%)`}
              </text>
            </g>
          </g>

          {/* ========================================================= */}
          {/* 6. LOAD BUILDINGS (Lower-Right) */}
          {/* ========================================================= */}
          <g transform="translate(620, 340)">
            {/* Building 1: Research Station */}
            <g
              onClick={() => handleComponentClick('research')}
              className="cursor-pointer group"
              transform="translate(0, 0)"
            >
              <polygon points="0,20 35,40 35,15 0,-5" fill="#0C2333" stroke="#48D5FF" strokeWidth="0.8" />
              <polygon points="35,40 70,20 70,-5 35,15" fill="#0E2D42" stroke="#48D5FF" strokeWidth="0.8" />
              <polygon points="35,15 70,-5 35,-25 0,-5" fill="#133C57" stroke="#48D5FF" strokeWidth="1" />
              <polygon points="8,15 20,22 20,10 8,3" fill="#48D5FF" opacity="0.8" />
              <polygon points="45,22 58,15 58,3 45,10" fill="#FFA000" opacity="0.8" />

              <g transform="translate(-25, 45)">
                <rect width="125" height="26" rx="4" fill="#06131D" stroke="#48D5FF" strokeWidth="1" opacity="0.95" />
                <text x="6" y="12" fill="#48D5FF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">RESEARCH STATION</text>
                <text x="6" y="21" fill="#EFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace">{Math.round(s.gridLoad * 0.29)} kW • HIGH</text>
              </g>
            </g>

            {/* Building 2: Communication Hub */}
            <g
              onClick={() => handleComponentClick('communication')}
              className="cursor-pointer group"
              transform="translate(100, -30)"
            >
              <polygon points="0,15 25,30 25,10 0,-5" fill="#0C2333" stroke="#48D5FF" strokeWidth="0.8" />
              <polygon points="25,30 50,15 50,-5 25,10" fill="#0E2D42" stroke="#48D5FF" strokeWidth="0.8" />
              <polygon points="25,10 50,-5 25,-20 0,-5" fill="#133C57" stroke="#48D5FF" strokeWidth="1" />
              <line x1="25" y1="-20" x2="25" y2="-36" stroke="#48D5FF" strokeWidth="2" />
              <circle cx="25" cy="-36" r="3" fill="#35D47A" />

              <g transform="translate(-20, 36)">
                <rect width="130" height="26" rx="4" fill="#06131D" stroke="#48D5FF" strokeWidth="1" opacity="0.95" />
                <text x="6" y="12" fill="#48D5FF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">COMMUNICATION HUB</text>
                <text x="6" y="21" fill="#EFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace">{Math.round(s.gridLoad * 0.15)} kW • CRITICAL</text>
              </g>
            </g>

            {/* Building 3: Storage Facility */}
            <g
              onClick={() => handleComponentClick('storage')}
              className="cursor-pointer group"
              transform="translate(110, 50)"
            >
              <polygon points="0,15 30,32 30,10 0,-7" fill="#0C2333" stroke="#48D5FF" strokeWidth="0.8" />
              <polygon points="30,32 60,15 60,-7 30,10" fill="#0E2D42" stroke="#48D5FF" strokeWidth="0.8" />
              <polygon points="30,10 60,-7 30,-24 0,-7" fill="#133C57" stroke="#48D5FF" strokeWidth="1" />

              <g transform="translate(-15, 38)">
                <rect width="120" height="26" rx="4" fill="#06131D" stroke="#48D5FF" strokeWidth="1" opacity="0.95" />
                <text x="6" y="12" fill="#48D5FF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">STORAGE FACILITY</text>
                <text x="6" y="21" fill="#EFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace">{Math.round(s.gridLoad * 0.11)} kW • NORMAL</text>
              </g>
            </g>
          </g>
        </svg>

        {/* Floating Danger Alert Banner in 3D scene */}
        {(s.solarRisk || s.batteryRisk || s.windRisk) && (
          <div className="absolute top-3 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF6257]/20 border border-[#FF6257]/60 text-xs text-[#FF6257] backdrop-blur-md animate-bounce shadow-xl">
            <AlertOctagon className="w-4 h-4" />
            <span className="font-extrabold">
              {s.windRisk ? 'WIND TURBINE DANGER ZONE (Velocity Anomaly - Stored in Notifications)' : s.solarRisk ? 'SOLAR DANGER: Total Deficit -> Panels turned RED' : 'BATTERY CRITICAL DANGER ZONE (<30%)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
