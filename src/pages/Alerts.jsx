import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  Flame,
  Activity,
  Zap,
  Check,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import api from '../services/api';
import { useTelemetry } from '../context/TelemetryContext';

export default function Alerts() {
  const { activeAlerts } = useTelemetry();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const initialAlerts = [
    {
      id: 'ALT-101',
      severity: 'critical',
      title: 'High Consumption Detected - Heater 03',
      equipment: 'Heater Subsystem 03 (Living Quarters)',
      desc: 'Heater 03 is consuming 12.5 kW, which is 140% above normal nominal threshold (4.0 - 6.0 kW). IsolationForest anomaly score: 0.96.',
      value: '12.5 kW (Normal: 5.2 kW)',
      timestamp: '14 minutes ago (15:32 UTC)',
      status: 'Active',
    },
    {
      id: 'ALT-102',
      severity: 'warning',
      title: 'Energy Shortage Predicted',
      equipment: 'Renewable Power Array (Solar + Wind)',
      desc: 'Low renewable generation expected in next 6 hours (+6h: 21.5 kW renewable vs 55 kW peak demand). Battery backup dispatch required.',
      value: 'Deficit: 24 kW Forecast',
      timestamp: '38 minutes ago (15:08 UTC)',
      status: 'Active',
    },
    {
      id: 'ALT-103',
      severity: 'info',
      title: 'Battery Discharge Rate High',
      equipment: 'Station Battery Bank B (150 kWh LiFePO4)',
      desc: 'Battery is discharging at 24.2 kW (faster than nominal 12.0 kW curve). State of Charge remains safe at 74%.',
      value: '-24.2 kW Discharge Rate',
      timestamp: '1 hour ago (14:45 UTC)',
      status: 'Active',
    },
    {
      id: 'ALT-104',
      severity: 'warning',
      title: 'Wind Gust Exceeding 45 km/h',
      equipment: 'Turbine WT-02 (Perimeter Ridge)',
      desc: 'High wind velocity triggering auto-yaw pitch correction. Generation sustained at 15 kW.',
      value: '48.2 km/h Wind Velocity',
      timestamp: '3 hours ago (12:40 UTC)',
      status: 'Resolved',
    },
    {
      id: 'ALT-105',
      severity: 'info',
      title: 'Inverter 01 Efficiency Recalibration',
      equipment: 'Solar Inverter Module 01',
      desc: 'Routine MPPT dynamic tracking adjusted for low polar winter sun angle.',
      value: 'Efficiency: 98.4%',
      timestamp: '5 hours ago (10:15 UTC)',
      status: 'Resolved',
    },
  ];

  const anomalyScatterData = [
    { time: '10:00', load: 4.8, type: 'Normal' },
    { time: '11:00', load: 5.1, type: 'Normal' },
    { time: '12:00', load: 5.4, type: 'Normal' },
    { time: '13:00', load: 5.2, type: 'Normal' },
    { time: '14:00', load: 6.8, type: 'Normal' },
    { time: '14:30', load: 8.5, type: 'Warning' },
    { time: '15:00', load: 11.2, type: 'Anomaly' },
    { time: '15:30', load: 12.5, type: 'Anomaly (Heater 03)' },
  ];

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts();
      if (res && res.alerts && res.alerts.length > 0) {
        setAlerts(res.alerts);
      } else {
        setAlerts(initialAlerts);
      }
    } catch (err) {
      console.warn('Using local alert registry:', err);
      setAlerts(initialAlerts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveAlert = async (id) => {
    setResolvingId(id);
    try {
      await api.resolveAlert(id);
    } catch (e) {
      console.warn('Locally updating alert resolution');
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
    setResolvingId(null);
  };

  // Combine static anomaly alerts with live simulation risk alerts
  const combinedAlerts = [
    ...(activeAlerts || []).map((a) => ({ ...a, isLiveSimulation: true })),
    ...alerts.filter((a) => !(activeAlerts || []).some((la) => la.id === a.id)),
  ];

  const filteredAlerts = combinedAlerts.filter((a) => {
    const matchesSeverity =
      filterSeverity === 'all' ||
      (filterSeverity === 'resolved' && a.status === 'Resolved') ||
      (filterSeverity !== 'resolved' && a.severity === filterSeverity && a.status === 'Active');
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const activeCount = combinedAlerts.filter((a) => a.status === 'Active').length;
  const criticalCount = combinedAlerts.filter((a) => a.severity === 'critical' && a.status === 'Active').length;
  const warningCount = combinedAlerts.filter((a) => a.severity === 'warning' && a.status === 'Active').length;
  const infoCount = combinedAlerts.filter((a) => a.severity === 'info' && a.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1C2F57]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2.5">
            ALERTS & ANOMALY DETECTION
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-medium">
              {activeCount} ACTIVE INCIDENTS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time isolation forest anomaly surveillance, equipment overload warnings, and station alert registry.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#111C3A] hover:bg-[#16244A] border border-[#1E325A] text-xs font-semibold text-cyan-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Severity Counters Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setFilterSeverity('critical')}
          className={`polar-card p-3.5 sm:p-4 border cursor-pointer transition-all ${
            filterSeverity === 'critical' ? 'border-red-500 bg-red-500/10' : 'border-red-500/30 hover:border-red-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-red-400 uppercase">Critical</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{criticalCount}</p>
          <p className="text-[10px] text-red-300 mt-0.5">Immediate action</p>
        </div>

        <div
          onClick={() => setFilterSeverity('warning')}
          className={`polar-card p-3.5 sm:p-4 border cursor-pointer transition-all ${
            filterSeverity === 'warning' ? 'border-amber-500 bg-amber-500/10' : 'border-amber-500/30 hover:border-amber-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-amber-400 uppercase">Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{warningCount}</p>
          <p className="text-[10px] text-amber-300 mt-0.5">Forecast shortage</p>
        </div>

        <div
          onClick={() => setFilterSeverity('info')}
          className={`polar-card p-3.5 sm:p-4 border cursor-pointer transition-all ${
            filterSeverity === 'info' ? 'border-cyan-500 bg-cyan-500/10' : 'border-cyan-500/30 hover:border-cyan-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-cyan-400 uppercase">Info</span>
            <Info className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{infoCount}</p>
          <p className="text-[10px] text-cyan-300 mt-0.5">Notifications</p>
        </div>

        <div
          onClick={() => setFilterSeverity('resolved')}
          className={`polar-card p-3.5 sm:p-4 border cursor-pointer transition-all ${
            filterSeverity === 'resolved' ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-500/30 hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {alerts.filter((a) => a.status === 'Resolved').length}
          </p>
          <p className="text-[10px] text-emerald-300 mt-0.5">Cleared events</p>
        </div>
      </div>

      {/* ANOMALY SPOTLIGHT & ISOLATION FOREST VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Heater 03 Outlier Card */}
        <div className="polar-card p-4 sm:p-5 border border-red-500/40 bg-gradient-to-b from-red-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-white">Active Anomaly Detected</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono font-bold">
              Z: +3.82
            </span>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-[#0C152D] border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target:</span>
              <span className="font-bold text-white text-[11px] sm:text-xs truncate">Heater 03 (Quarters)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Normal Range:</span>
              <span className="font-mono text-emerald-300">4.0 - 6.0 kW</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Measured:</span>
              <span className="font-mono font-bold text-red-400">12.5 kW</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Deviation:</span>
              <span className="font-bold text-red-400 font-mono">+140% Overload</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed">
            IsolationForest classified continuous heating surge as high-confidence thermal relay fault. Recommended inspection of thermostat contactors.
          </p>

          <button
            onClick={() => handleResolveAlert('ALT-101')}
            className="w-full mt-3 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Heater 03 Inspected</span>
          </button>
        </div>

        {/* Anomaly Timeline Scatter Chart */}
        <div className="polar-card p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              Real-Time Subsystem Power Anomaly Tracking (kW)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">IsolationForest Detection</span>
          </div>

          <div className="h-56 sm:h-60 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2F57" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} />
                <YAxis dataKey="load" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} unit=" kW" domain={[0, 15]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1836',
                    borderColor: '#1E325A',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine y={6} stroke="#00E676" strokeDasharray="3 3" label={{ value: 'Normal (6 kW)', fill: '#00E676', fontSize: 9 }} />
                <ReferenceLine y={10} stroke="#FF3D71" strokeDasharray="3 3" label={{ value: 'Critical (>10 kW)', fill: '#FF3D71', fontSize: 9 }} />
                <Scatter name="Heater 03 Telemetry" data={anomalyScatterData} fill="#FF3D71" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="polar-card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar flex-nowrap pb-1 sm:pb-0">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
              filterSeverity === 'all'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-[#111C3A] text-slate-400 hover:text-white border border-[#1E325A]'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
              filterSeverity === 'critical'
                ? 'bg-red-500 text-white font-bold'
                : 'bg-[#111C3A] text-slate-400 hover:text-white border border-[#1E325A]'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
              filterSeverity === 'warning'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-[#111C3A] text-slate-400 hover:text-white border border-[#1E325A]'
            }`}
          >
            Warning ({warningCount})
          </button>
          <button
            onClick={() => setFilterSeverity('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
              filterSeverity === 'info'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-[#111C3A] text-slate-400 hover:text-white border border-[#1E325A]'
            }`}
          >
            Info ({infoCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search alerts or systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#091124] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-xs text-slate-200 outline-none"
          />
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          const isResolved = alert.status === 'Resolved';

          return (
            <div
              key={alert.id}
              className={`polar-card p-4 transition-all ${
                isResolved
                  ? 'opacity-60 border-[#1C2F57]'
                  : isCritical
                  ? 'border-red-500/40 bg-[#121428]'
                  : isWarning
                  ? 'border-amber-500/40 bg-[#181a28]'
                  : 'border-cyan-500/30 bg-[#0F1B38]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl mt-0.5 flex-shrink-0 ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCritical
                        ? 'bg-red-500/20 text-red-400'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    {isResolved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCritical ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{alert.id}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{alert.title}</h4>
                      <span
                        className={`text-[9px] sm:text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                          isResolved
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isCritical
                            ? 'bg-red-500/20 text-red-300'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {alert.status === 'Resolved' ? 'Resolved' : alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-cyan-400 font-medium mt-0.5">{alert.equipment}</p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.desc}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-300">{alert.value}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-[#1C2F57] pt-2 sm:pt-0 pl-11 sm:pl-0">
                  {alert.status === 'Active' ? (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={resolvingId === alert.id}
                      className="px-3.5 py-1.5 rounded-lg bg-[#111C3A] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-[#1E325A] hover:border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{resolvingId === alert.id ? 'Resolving...' : 'Acknowledge / Resolve'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

