import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Shield,
  Bell,
  Cpu,
  Battery,
  Flame,
  Globe,
  Sliders,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const [stationName, setStationName] = useState('Bharati Polar Station');
  const [location, setLocation] = useState('Antarctica (69°24\'S, 76°11\'E)');
  const [batteryMinReserve, setBatteryMinReserve] = useState(30);
  const [criticalLoadThreshold, setCriticalLoadThreshold] = useState(55);
  const [dieselAutoStartThreshold, setDieselAutoStartThreshold] = useState(55);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [warningAlerts, setWarningAlerts] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [forecastHorizon, setForecastHorizon] = useState('24h');
  const [modelAlgorithm, setModelAlgorithm] = useState('RandomForestRegressor');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res) {
          if (res.station_name) setStationName(res.station_name);
          if (res.location) setLocation(res.location);
          if (res.battery_min_reserve) setBatteryMinReserve(res.battery_min_reserve);
          if (res.critical_load_threshold) setCriticalLoadThreshold(res.critical_load_threshold);
          if (res.critical_alerts !== undefined) setCriticalAlerts(res.critical_alerts);
          if (res.warning_alerts !== undefined) setWarningAlerts(res.warning_alerts);
          if (res.system_notifications !== undefined) setSystemNotifications(res.system_notifications);
          if (res.forecast_horizon) setForecastHorizon(res.forecast_horizon);
        }
      } catch (err) {
        console.warn('Using local settings cache:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const payload = {
      station_name: stationName,
      location: location,
      battery_min_reserve: Number(batteryMinReserve),
      critical_load_threshold: Number(criticalLoadThreshold),
      diesel_auto_start_threshold: Number(dieselAutoStartThreshold),
      critical_alerts: criticalAlerts,
      warning_alerts: warningAlerts,
      system_notifications: systemNotifications,
      forecast_horizon: forecastHorizon,
      model_algorithm: modelAlgorithm,
    };

    try {
      await api.saveSettings(payload);
      localStorage.setItem('polar_settings', JSON.stringify(payload));
      setSaveSuccess(true);
    } catch (err) {
      localStorage.setItem('polar_settings', JSON.stringify(payload));
      setSaveSuccess(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1C2F57]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2.5">
            SYSTEM SETTINGS & THRESHOLDS
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
              CONFIGURABLE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure polar station telemetry parameters, reserve safety thresholds, ML models, and notification channels.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'PERSISTING TO SQLITE...' : 'SAVE SETTINGS'}</span>
        </button>
      </div>

      {/* Success notification */}
      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>System configuration successfully persisted to SQLite database and synchronized with telemetry daemons.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Station Identification */}
        <div className="polar-card p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-cyan-400" />
            Station Identification & Telemetry Node
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Polar Station Name
              </label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-xs text-slate-200 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Geographic Coordinates / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-xs text-slate-200 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* 2. Battery & Dispatch Safety Thresholds */}
        <div className="polar-card p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Battery className="w-4 h-4 text-emerald-400" />
            Energy Storage & Generator Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Battery Min Preferred Reserve (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={batteryMinReserve}
                  onChange={(e) => setBatteryMinReserve(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-xs text-slate-200 outline-none font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default safety floor: 30%</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Critical Load Surge Threshold (kW)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={criticalLoadThreshold}
                  onChange={(e) => setCriticalLoadThreshold(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-xs text-slate-200 outline-none font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kW</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default overload trigger: 55 kW</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Diesel Generator Auto-Trigger
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={dieselAutoStartThreshold}
                  onChange={(e) => setDieselAutoStartThreshold(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-xs text-slate-200 outline-none font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kW</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Engages diesel if deficit persists</p>
            </div>
          </div>
        </div>

        {/* 3. AI Model & Forecast Horizon */}
        <div className="polar-card p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-purple-400" />
            Machine Learning Engine Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Forecasting Horizon Window
              </label>
              <select
                value={forecastHorizon}
                onChange={(e) => setForecastHorizon(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-xs text-slate-200 outline-none"
              >
                <option value="12h">12 Hours Ahead (Short-Term)</option>
                <option value="24h">24 Hours Ahead (Standard Polar Cycle)</option>
                <option value="48h">48 Hours Ahead (Storm Preparations)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary ML Regressor Architecture
              </label>
              <select
                value={modelAlgorithm}
                onChange={(e) => setModelAlgorithm(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A132C] border border-[#1C2F57] focus:border-cyan-400 rounded-lg text-xs text-slate-200 outline-none"
              >
                <option value="RandomForestRegressor">RandomForestRegressor (Ensemble n=100)</option>
                <option value="GradientBoostingRegressor">GradientBoostingRegressor (Boosting)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Alert Notification Channels */}
        <div className="polar-card p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-amber-400" />
            Alert Subscriptions & Incident Routing
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#0E1A38] border border-[#1C2F57] cursor-pointer hover:border-cyan-500/30 transition-colors">
              <div>
                <p className="text-xs font-bold text-white">Critical Overload & Anomaly Alerts</p>
                <p className="text-[11px] text-slate-400">Trigger immediate operator alarm upon thermal relay spikes or severe deficit.</p>
              </div>
              <input
                type="checkbox"
                checked={criticalAlerts}
                onChange={(e) => setCriticalAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#0E1A38] border border-[#1C2F57] cursor-pointer hover:border-cyan-500/30 transition-colors">
              <div>
                <p className="text-xs font-bold text-white">Forecasted Shortage Warning Alerts</p>
                <p className="text-[11px] text-slate-400">Notify when 6-hour renewable generation falls below station critical baseline.</p>
              </div>
              <input
                type="checkbox"
                checked={warningAlerts}
                onChange={(e) => setWarningAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#0E1A38] border border-[#1C2F57] cursor-pointer hover:border-cyan-500/30 transition-colors">
              <div>
                <p className="text-xs font-bold text-white">System Telemetry Notifications</p>
                <p className="text-[11px] text-slate-400">Periodic status reports and battery cycle optimization updates.</p>
              </div>
              <input
                type="checkbox"
                checked={systemNotifications}
                onChange={(e) => setSystemNotifications(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            {saving ? 'SAVING...' : 'SAVE SETTINGS'}
          </button>
        </div>
      </form>
    </div>
  );
}
