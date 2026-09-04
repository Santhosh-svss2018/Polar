import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Battery,
  CheckCircle2,
  Gauge,
  Leaf,
  Play,
  RotateCcw,
  ShieldCheck,
  Sun,
  Thermometer,
  Wind,
  Zap,
  Fuel,
  Sparkles,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../services/api';
import { setEnergy } from '../energyStore';

const WEATHER = {
  clear: { label: 'Clear', icon: '☀️', solar: 1.0, wind: 1.0, load: 1.0, temp: -4 },
  stormy: { label: 'Stormy', icon: '🌧️', solar: 0.62, wind: 1.18, load: 1.1, temp: -8 },
  extreme: { label: 'Extreme', icon: '⚠️', solar: 0.36, wind: 0.76, load: 1.25, temp: -18 },
  blizzard: { label: 'Extreme Blizzard', icon: '❄️', solar: 0.12, wind: 0.48, load: 1.45, temp: -28 },
};

const CURRENT_SCENARIO = {
  solar: { enabled: true, kw: 72, max: 180 },
  wind: { enabled: true, kw: 210, max: 570 },
  battery: { enabled: true, kw: 120, max: 300 },
  diesel: { enabled: false, kw: 0, max: 750 },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function Switch({ checked, onChange, danger = false }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onChange}
      className={`sim-switch ${checked ? (danger ? 'is-on-danger' : 'is-on') : ''}`}
    >
      <span className="sim-switch-thumb" />
    </button>
  );
}

function ComponentControl({ type, title, icon: Icon, tone, component, onToggle, onKwChange, unit = 'kW' }) {
  const pct = Math.round((component.kw / component.max) * 100);
  return (
    <div className={`sim-control sim-control-${tone} ${!component.enabled ? 'is-disabled' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="sim-control-icon"><Icon className="w-4 h-4" /></div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-white truncate">{title}</p>
            <p className="text-[10px] text-slate-500">{component.enabled ? `${component.kw} ${unit} active` : 'Offline'}</p>
          </div>
        </div>
        <Switch checked={component.enabled} onChange={onToggle} danger={type === 'diesel'} />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Output capacity</span>
          <span className="font-mono text-xs font-bold text-slate-200">{component.kw} <span className="text-slate-500">/ {component.max} kW</span></span>
        </div>
        <input
          aria-label={`${title} output in kilowatts`}
          type="range"
          min="0"
          max={component.max}
          step="1"
          value={component.kw}
          onChange={(e) => onKwChange(Number(e.target.value))}
          className={`sim-range sim-range-${tone}`}
        />
        <div className="h-1 rounded-full bg-[#081127] overflow-hidden mt-2">
          <div className="h-full rounded-full sim-progress" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function Solar3D({ active }) {
  return (
    <div className={`asset-v3 asset-v3-solar ${active ? 'asset-active' : 'asset-off'}`}>
      <div className="asset-v3-pedestal" />
      <div className="solar-tracker">
        <div className="solar-panel-v3">
          {Array.from({ length: 24 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="solar-frame" />
      </div>
      <div className="asset-v3-glow" />
      <div className="asset-label-v3">SOLAR ARRAY</div>
    </div>
  );
}

function Wind3D({ active }) {
  return (
    <div className={`asset-v3 asset-v3-wind ${active ? 'asset-active' : 'asset-off'}`}>
      <div className="wind-pylon-v3" />
      <div className="wind-nacelle-v3"><span /></div>
      <div className="wind-rotor-v3"><i /><i /><i /></div>
      <div className="asset-v3-glow" />
      <div className="asset-label-v3">WIND TURBINE</div>
    </div>
  );
}

function Battery3D({ active }) {
  return (
    <div className={`asset-v3 asset-v3-battery ${active ? 'asset-active' : 'asset-off'}`}>
      <div className="battery-pod-v3">
        <div className="battery-cap-v3" />
        <div className="battery-screen-v3"><span /><b>88%</b></div>
        <div className="battery-cells-v3"><i /><i /><i /><i /><i /><i /></div>
        <div className="battery-side-v3" />
      </div>
      <div className="asset-v3-glow" />
      <div className="asset-label-v3">BATTERY BANK</div>
    </div>
  );
}

function Diesel3D({ active }) {
  return (
    <div className={`asset-v3 asset-v3-diesel ${active ? 'asset-active-danger' : 'asset-off'}`}>
      <div className="diesel-pod-v3">
        <div className="diesel-top-v3" />
        <div className="diesel-panel-v3"><span /><span /><span /></div>
        <div className="diesel-grille-v3">{Array.from({ length: 5 }).map((_, i) => <i key={i} />)}</div>
        <div className="diesel-stack-v3" />
      </div>
      <div className="asset-v3-glow" />
      <div className="asset-label-v3">DIESEL BACKUP</div>
    </div>
  );
}

function StationHub({ station, critical }) {
  return (
    <div className={`station-hub-v3 ${critical ? 'station-hub-critical' : ''}`}>
      <div className="hub-aura-v3" />
      <div className="hub-ring-v3 ring-a" />
      <div className="hub-ring-v3 ring-b" />
      <div className="hub-ring-v3 ring-c" />
      <div className="hub-core-v3">
        <div className="hub-core-inner"><Zap className="w-7 h-7" /></div>
        <span className="hub-core-label">AI</span>
      </div>
      <div className="hub-dome-v3">
        <div className="dome-top-v3" />
        <div className="dome-window-v3"><span /><span /><span /><span /></div>
        <div className="dome-door-v3" />
      </div>
      <div className="hub-platform-v3"><span /><span /><span /><span /></div>
      <div className="station-name-v3">{station.replace(' Polar Station', '')}</div>
      <div className={`station-status-v3 ${critical ? 'critical' : ''}`}><span /> {critical ? 'CRITICAL LOAD' : 'AI CONTROL ACTIVE'}</div>
    </div>
  );
}

function Connection({ className = '', active = true }) {
  return <div className={`energy-link-v3 ${className} ${active ? 'flow-on' : 'flow-off'}`}><span /><i /><b /></div>;
}

export default function Simulation() {
  const storedUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('polar_user') || '{}'); } catch { return {}; }
  }, []);
  const station = storedUser.station || 'Bharati Polar Station';

  const [components, setComponents] = useState(CURRENT_SCENARIO);
  const [weather, setWeather] = useState('blizzard');
  const [speed, setSpeed] = useState(1);
  const [running, setRunning] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [criticalMessage, setCriticalMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);
  const criticalTimerRef = React.useRef(null);

  const calculate = (nextComponents = components, nextWeather = weather) => {
    const w = WEATHER[nextWeather];
    const solar = nextComponents.solar.enabled ? nextComponents.solar.kw * w.solar : 0;
    const wind = nextComponents.wind.enabled ? nextComponents.wind.kw * w.wind : 0;
    const battery = nextComponents.battery.enabled ? nextComponents.battery.kw * 0.74 : 0;
    const diesel = nextComponents.diesel.enabled ? nextComponents.diesel.kw : 0;
    const renewable = solar + wind;
    const baseDemand = 39;
    const weatherDemand = baseDemand * w.load;
    const demand = weatherDemand + (w.temp < -10 ? Math.abs(w.temp + 10) * 0.55 : 0);
    const supply = renewable + battery + diesel;
    const deficit = Math.max(0, demand - supply);
    const reserve = clamp(78 - Math.max(0, demand - renewable) * 1.2 + (nextComponents.battery.enabled ? 10 : -18), 5, 96);
    const dieselNeed = deficit > 0 && !nextComponents.diesel.enabled ? deficit : 0;
    const risk = deficit >= 18 || reserve < 22 ? 'CRITICAL' : deficit >= 7 || reserve < 35 ? 'HIGH' : 'STABLE';

    const points = Array.from({ length: 13 }, (_, i) => {
      const wave = Math.sin((i / 12) * Math.PI * 2 - 0.7) * 3.5;
      const futureWeatherFactor = 1 + (i / 12) * (nextWeather === 'blizzard' ? 0.08 : 0.025);
      const expected = Math.max(0, demand * futureWeatherFactor + wave);
      const renewableFuture = Math.max(0, renewable * (1 - i * 0.012));
      const batteryFuture = Math.max(0, battery - i * Math.max(0.35, deficit * 0.035));
      const dieselFuture = nextComponents.diesel.enabled ? diesel : Math.max(0, dieselNeed * Math.min(1, i / 4));
      return {
        time: i === 0 ? 'NOW' : `+${i * 2}h`,
        current_demand: Math.round(expected),
        expected_demand: Math.round(expected + 3 + i * 0.18),
        renewable: Math.round(renewableFuture),
        battery: Math.round(batteryFuture),
        diesel: Math.round(dieselFuture),
      };
    });

    return {
      available: Math.round(supply),
      demand: Math.round(demand),
      renewable: Math.round(renewable),
      battery: Math.round(battery),
      diesel: Math.round(diesel),
      deficit: Math.round(deficit),
      reserve: Math.round(reserve),
      risk,
      points,
      weather: w,
    };
  };

  useEffect(() => {
    const result = calculate(CURRENT_SCENARIO, 'blizzard');
    setSimResults(result);
    setLastUpdated(Date.now());
    return () => {
      if (criticalTimerRef.current) window.clearTimeout(criticalTimerRef.current);
    };
  }, []);

  // Automated simulation clock: higher speed refreshes the forecast faster.
  useEffect(() => {
    if (!running) return undefined;
    const interval = window.setInterval(() => {
      const result = calculate(components, weather);
      const phase = (Date.now() / 1000) * speed;
      const liveShift = Math.sin(phase) * (speed * 0.45);
      const livePoints = result.points.map((point, index) => ({
        ...point,
        current_demand: Math.max(0, Math.round(point.current_demand + liveShift * (index === 0 ? 1 : 0.35))),
      }));
      setSimResults({ ...result, points: livePoints });
      setLastUpdated(Date.now());
    }, Math.max(450, 1800 / speed));
    return () => window.clearInterval(interval);
  }, [running, speed, components, weather]);

  const updateSimulation = (nextComponents, nextWeather = weather) => {
    const result = calculate(nextComponents, nextWeather);
    setSimResults(result);
    setLastUpdated(Date.now());
    if (result.risk === 'CRITICAL') {
      const message = `Critical condition detected: demand is ${result.demand} kW while available supply is only ${result.available} kW. AI recommends protecting the battery reserve and reducing non-critical loads.`;
      setCriticalMessage(message);
      setToastVisible(true);
      if (criticalTimerRef.current) window.clearTimeout(criticalTimerRef.current);
      criticalTimerRef.current = window.setTimeout(() => {
        setToastVisible(false);
      }, 3000);
    } else {
      setCriticalMessage('');
      setToastVisible(false);
      if (criticalTimerRef.current) window.clearTimeout(criticalTimerRef.current);
    }
  };

  const updateComponent = (key, patch) => {
    const next = { ...components, [key]: { ...components[key], ...patch } };
    setComponents(next);
    updateSimulation(next);
    setEnergy({ [key]: patch.kw !== undefined ? patch.kw : next[key].kw });
  };

  const handleWeather = (value) => {
    setWeather(value);
    updateSimulation(components, value);
  };

  const handleReset = () => {
    setComponents(CURRENT_SCENARIO);
    setWeather('blizzard');
    setSpeed(1);
    setRunning(false);
    setToastVisible(false);
    setCriticalMessage('');
    if (criticalTimerRef.current) window.clearTimeout(criticalTimerRef.current);
    updateSimulation(CURRENT_SCENARIO, 'blizzard');
  };

  const handleRun = async () => {
    setRunning(true);
    const current = calculate();
    setSimResults(current);
    setLastUpdated(Date.now());
    setEnergy({ solar: components.solar.enabled ? components.solar.kw : 0, wind: components.wind.enabled ? components.wind.kw : 0, diesel: components.diesel.enabled ? components.diesel.kw : 0, battery: components.battery.enabled ? components.battery.kw : 0, load: current.demand });
    try {
      const res = await api.runSimulation({
        solar_delta_pct: Math.round(((components.solar.kw / components.solar.max) - 0.7) * 100),
        wind_delta_pct: Math.round(((components.wind.kw / components.wind.max) - 0.5) * 100),
        temp_delta_c: current.weather.temp,
        load_delta_pct: Math.round((current.demand / 39 - 1) * 100),
      });
      if (res?.chart_data) {
        setSimResults((prev) => ({ ...prev, api: res }));
      }
    } catch (e) {
      // The local engine continues to provide the live simulation when the API is unavailable.
    }
  };

  const handleStop = () => {
    setRunning(false);
    setLastUpdated(Date.now());
  };
  const optimizeAdvice = useMemo(() => {
    if (!simResults) return [];
    const advice = [];
    if (components.solar.enabled && weather !== 'blizzard') advice.push({ icon: Sun, title: 'Use solar first', text: 'Prioritize available solar generation before drawing battery energy.' });
    if (components.wind.enabled) advice.push({ icon: Wind, title: 'Harvest wind continuously', text: 'Keep the wind turbine online to reduce battery discharge and diesel dependence.' });
    if (simResults.reserve < 35) advice.push({ icon: Battery, title: 'Protect battery reserve', text: 'Hold the battery above a safe reserve and curtail flexible loads before deeper discharge.' });
    if (components.diesel.enabled) advice.push({ icon: Fuel, title: 'Delay diesel start', text: 'Use renewable output and battery reserve first; dispatch diesel only when the critical deficit persists.' });
    advice.push({ icon: Leaf, title: 'Save renewable surplus', text: 'When supply exceeds demand, charge the battery and preserve stored energy for the next weather deterioration.' });
    return advice.slice(0, 4);
  }, [simResults, components, weather]);

  if (!simResults) return null;

  const critical = simResults.risk === 'CRITICAL';

  return (
    <div className="simulation-page space-y-5">
      {toastVisible && criticalMessage && (
        <div className="critical-toast" role="alert">
          <div className="critical-toast-icon"><AlertTriangle className="w-5 h-5" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-red-300">AI Critical Condition</p>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{criticalMessage}</p>
          </div>
          <button onClick={() => setToastVisible(false)} className="text-slate-400 hover:text-white">×</button>
        </div>
      )}

      <div className={`sim-condition-box sim-condition-top ${critical ? 'critical' : simResults.risk === 'HIGH' ? 'high' : ''}`}>
        {critical ? <AlertTriangle className="w-6 h-6 text-red-300" /> : <CheckCircle2 className="w-6 h-6 text-emerald-300" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black uppercase tracking-widest">Current Condition · {simResults.risk}</p>
          <p className="text-xs text-slate-300 mt-1">{critical ? criticalMessage : `Station is operating with ${simResults.available} kW available against ${simResults.demand} kW predicted demand. AI is balancing renewable power and battery reserve.`}</p>
        </div>
        <div className="condition-number"><span>Reserve</span><b>{simResults.reserve}%</b></div>
      </div>

      <div className="sim-page-header">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white">LIVE STATION SIMULATION</h2>
            <span className="sim-live-badge"><span /> LIVE AI MODEL</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Interactive energy-flow simulation for <span className="text-cyan-300 font-semibold">{station}</span>. Toggle assets and change their kW output to see demand forecasts update immediately.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={handleReset} className="sim-action-btn"><RotateCcw className="w-3.5 h-3.5" /> Reset</button>
          <button onClick={handleStop} className="sim-stop-btn" disabled={!running}><span className="sim-stop-dot" /> STOP</button>
          <button onClick={handleRun} className="sim-run-btn"><Play className={`w-3.5 h-3.5 fill-current ${running ? 'animate-pulse' : ''}`} /> {running ? 'SIMULATION RUNNING' : 'RUN AI SIMULATION'}</button>
        </div>
      </div>

      <div className="sim-workspace">
        <section className="sim-scene-card polar-card">
          <div className="sim-scene-top">
            <div>
              <p className="sim-kicker">ENERGY MICROGRID / 3D VIEW</p>
              <h3 className="text-base font-black text-white mt-0.5">{station}</h3>
            </div>
            <div className={`sim-condition-pill ${critical ? 'critical' : simResults.risk === 'HIGH' ? 'high' : ''}`}>
              <span /> {simResults.risk === 'STABLE' ? 'NORMAL' : simResults.risk}
            </div>
          </div>

          <div className="station-scene station-scene-v3">
            <div className="scene-stars" />
            <div className="scene-snow" />
            <div className="scene-grid" />
            <div className="scene-glow" />
            <div className="scene-orbit" />
            <div className="scene-platform-v3"><div /><div /><div /><div /></div>
            <Connection className="link-solar" active={components.solar.enabled} />
            <Connection className="link-wind" active={components.wind.enabled} />
            <Connection className="link-battery" active={components.battery.enabled} />
            <Connection className="link-diesel" active={components.diesel.enabled} />
            <Solar3D active={components.solar.enabled} />
            <Wind3D active={components.wind.enabled} />
            <Battery3D active={components.battery.enabled} />
            <Diesel3D active={components.diesel.enabled} />
            <StationHub station={station} critical={critical} />
            <div className="scene-caption"><span className="scene-dot" /> Power flow is simulated in real time</div>
          </div>

          <div className="sim-flow-strip">
            <div><Sun className="text-cyan-300 w-4 h-4" /><span>Solar</span><b>{simResults.weather.label === 'Clear' ? simResults.renewable : Math.round((components.solar.enabled ? components.solar.kw * simResults.weather.solar : 0))} kW</b></div>
            <div><Wind className="text-blue-300 w-4 h-4" /><span>Wind</span><b>{Math.round(components.wind.enabled ? components.wind.kw * simResults.weather.wind : 0)} kW</b></div>
            <div><Battery className="text-emerald-300 w-4 h-4" /><span>Battery</span><b>{simResults.battery} kW</b></div>
            <div><Fuel className="text-amber-300 w-4 h-4" /><span>Diesel</span><b>{simResults.diesel} kW</b></div>
          </div>
        </section>

        <aside className="sim-graph-card polar-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="sim-kicker">AI FORECAST ENGINE</p>
              <h3 className="text-base font-black text-white mt-0.5">Current & Future Demand</h3>
            </div>
            <div className="forecast-pulse"><Activity className="w-4 h-4" /></div>
          </div>

          <div className="forecast-metrics">
            <div><span>Current demand</span><b>{simResults.demand}<small> kW</small></b></div>
            <div><span>Expected peak</span><b>{Math.max(...simResults.points.map(p => p.expected_demand))}<small> kW</small></b></div>
            <div><span>Available supply</span><b className={simResults.available < simResults.demand ? 'text-red-300' : 'text-emerald-300'}>{simResults.available}<small> kW</small></b></div>
          </div>

          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simResults.points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2F57" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 9 }} />
                <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 9 }} unit="kW" />
                <Tooltip contentStyle={{ backgroundColor: '#0B1630', borderColor: '#24406F', borderRadius: 10, color: '#fff', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                <Line type="monotone" dataKey="current_demand" name="Current demand" stroke="#FFB300" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={450} />
                <Line type="monotone" dataKey="expected_demand" name="Expected demand" stroke="#FF3D71" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive animationDuration={550} />
                <Line type="monotone" dataKey="renewable" name="Renewable" stroke="#00E5FF" strokeWidth={2} dot={false} isAnimationActive animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="graph-live-line"><span className={running ? '' : 'is-paused'} /> {running ? `Live data running · ${speed}x simulation · weather-aware` : 'Simulation paused · change controls, then press RUN AI SIMULATION'} </div>
        </aside>
      </div>

      <div className="sim-controls-layout">
        <section className="polar-card sim-controls-card">
          <div className="sim-section-heading">
            <div><p className="sim-kicker">COMPONENT CONTROL</p><h3 className="text-base font-black text-white">Generation & Storage Controls</h3></div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Toggle + kW slider</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ComponentControl type="solar" title="Solar Array" icon={Sun} tone="cyan" component={components.solar} onToggle={() => updateComponent('solar', { enabled: !components.solar.enabled })} onKwChange={(kw) => updateComponent('solar', { kw })} />
            <ComponentControl type="wind" title="Wind Turbine" icon={Wind} tone="blue" component={components.wind} onToggle={() => updateComponent('wind', { enabled: !components.wind.enabled })} onKwChange={(kw) => updateComponent('wind', { kw })} />
            <ComponentControl type="battery" title="Battery Storage" icon={Battery} tone="green" component={components.battery} onToggle={() => updateComponent('battery', { enabled: !components.battery.enabled })} onKwChange={(kw) => updateComponent('battery', { kw })} />
            <ComponentControl type="diesel" title="Diesel Generator" icon={Fuel} tone="amber" component={components.diesel} onToggle={() => updateComponent('diesel', { enabled: !components.diesel.enabled })} onKwChange={(kw) => updateComponent('diesel', { kw })} />
          </div>
        </section>

        <aside className="polar-card sim-side-controls">
          <div className="sim-section-heading"><div><p className="sim-kicker">ENVIRONMENT</p><h3 className="text-base font-black text-white">Weather Condition</h3></div><Thermometer className="w-4 h-4 text-cyan-300" /></div>
          <div className="weather-column">
            {Object.entries(WEATHER).map(([key, value]) => (
              <button key={key} onClick={() => handleWeather(key)} className={`weather-option ${weather === key ? 'selected' : ''}`}>
                <span className="weather-emoji">{value.icon}</span><span><b>{value.label}</b><small>{value.temp}°C · solar ×{value.solar.toFixed(2)}</small></span><span className="weather-radio" />
              </button>
            ))}
          </div>
          <div className="speed-box">
            <div className="flex items-center justify-between mb-2"><span className="sim-kicker">SIMULATION SPEED</span><Gauge className="w-3.5 h-3.5 text-cyan-300" /></div>
            <div className="speed-buttons">{[1, 2, 3, 4].map((v) => <button key={v} onClick={() => setSpeed(v)} className={speed === v ? 'active' : ''}>{v}x</button>)}</div>
          </div>
        </aside>
      </div>

      <section className="ai-optimize-card polar-card">
        <div className="ai-optimize-header">
          <div className="ai-orb"><Sparkles className="w-5 h-5" /></div>
          <div className="flex-1"><p className="sim-kicker text-cyan-300">AI OPTIMISE</p><h3 className="text-lg font-black text-white">Best Energy Use Strategy for the Next 24 Hours</h3><p className="text-xs text-slate-400 mt-1">AI balances renewable generation, battery reserve and critical station demand to minimize diesel use.</p></div>
          <div className="ai-score"><span>AI efficiency</span><b>{clamp(Math.round(100 - simResults.deficit * 1.8 + simResults.renewable * 0.25), 54, 98)}%</b></div>
        </div>
        <div className="ai-advice-grid">
          {optimizeAdvice.map((item, index) => { const Icon = item.icon; return <div className="ai-advice" key={item.title}><div className="ai-advice-number">0{index + 1}</div><Icon className="w-4 h-4 text-cyan-300 mt-0.5" /><div><b>{item.title}</b><p>{item.text}</p></div></div>; })}
        </div>
        <div className="ai-defense-bar">
          <div><ShieldCheck className="w-4 h-4 text-emerald-300" /><span>Critical-load protection</span><b>{simResults.deficit === 0 ? 'SECURED' : 'AI PRIORITY ACTIVE'}</b></div>
          <div><Leaf className="w-4 h-4 text-emerald-300" /><span>Renewable utilization</span><b>{clamp(Math.round((simResults.renewable / Math.max(1, simResults.demand)) * 100), 0, 100)}%</b></div>
          <div><Fuel className="w-4 h-4 text-amber-300" /><span>Diesel dependency</span><b>{components.diesel.enabled ? 'AVAILABLE / LAST RESORT' : 'OFF'}</b></div>
        </div>
      </section>

    </div>
  );
}
