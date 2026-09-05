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
  SlidersHorizontal,
  Languages,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function Settings() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
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
          if (res.diesel_auto_start_threshold) setDieselAutoStartThreshold(res.diesel_auto_start_threshold);
          if (res.critical_alerts !== undefined) setCriticalAlerts(res.critical_alerts);
          if (res.warning_alerts !== undefined) setWarningAlerts(res.warning_alerts);
          if (res.system_notifications !== undefined) setSystemNotifications(res.system_notifications);
          if (res.forecast_horizon) setForecastHorizon(res.forecast_horizon);
          if (res.model_algorithm) setModelAlgorithm(res.model_algorithm);
          if (res.language && res.language !== language) {
            setLanguage(res.language);
          }
        }
      } catch (err) {
        console.warn('Using local settings cache:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
  };

  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
      language: language,
    };

    try {
      await api.saveSettings(payload);
      localStorage.setItem('polar_settings_db', JSON.stringify(payload));
      localStorage.setItem('polar_language', language);
      setSaveSuccess(true);
    } catch (err) {
      localStorage.setItem('polar_settings_db', JSON.stringify(payload));
      localStorage.setItem('polar_language', language);
      setSaveSuccess(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#102B3B]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#EFFFFF] flex items-center gap-2.5 flex-wrap">
            <SettingsIcon className="w-6 h-6 text-[#48D5FF] flex-shrink-0" />
            <span>{t('settings.title')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#48D5FF]/20 text-[#48D5FF] border border-[#48D5FF]/30 font-medium">
              {t('settings.configurable')}
            </span>
          </h2>
          <p className="text-xs text-[#89A7B7] mt-1">
            {t('settings.subtitle')}
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#299BD7] to-[#48D5FF] hover:from-[#299BD7]/90 hover:to-[#48D5FF]/90 text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-[#48D5FF]/20 cursor-pointer min-h-[40px]"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? t('settings.saving') : t('settings.saveBtn')}</span>
        </button>
      </div>

      {/* Success notification */}
      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-[#35D47A]/15 border border-[#35D47A]/30 text-[#35D47A] text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#35D47A] flex-shrink-0" />
          <span>{t('settings.saveSuccess')}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. LANGUAGE & REGIONAL PREFERENCES (New Feature) */}
        <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#102B3B]">
            <h3 className="text-sm font-extrabold text-[#EFFFFF] flex items-center gap-2 uppercase tracking-wider">
              <Languages className="w-4 h-4 text-[#48D5FF]" />
              {t('settings.langTitle')}
            </h3>
            <span className="text-[11px] text-[#48D5FF] font-mono">
              Active: {availableLanguages.find((l) => l.code === language)?.name} ({language.toUpperCase()})
            </span>
          </div>

          <p className="text-xs text-[#89A7B7]">
            {t('settings.langSubtitle')}
          </p>

          {/* Language Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
            {availableLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`relative p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#102B3B] border-[#48D5FF] shadow-lg shadow-[#48D5FF]/10 text-[#EFFFFF]'
                      : 'bg-[#06131D]/80 border-[#102B3B] hover:border-[#48D5FF]/40 text-[#89A7B7] hover:text-[#EFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{lang.flag}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#48D5FF] text-black flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#EFFFFF] leading-tight">{lang.native}</p>
                    <p className="text-[10px] text-[#89A7B7] leading-tight mt-0.5">{lang.name}</p>
                    <p className="text-[9px] text-[#48D5FF]/70 truncate mt-1 font-mono">{lang.region}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Station Identification */}
        <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-[#EFFFFF] flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-[#102B3B]">
            <Globe className="w-4 h-4 text-[#48D5FF]" />
            {t('settings.stationTitle')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#89A7B7] uppercase tracking-wider mb-1.5">
                {t('settings.stationName')}
              </label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#89A7B7] uppercase tracking-wider mb-1.5">
                {t('settings.location')}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none font-medium transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 3. Battery & Dispatch Safety Thresholds */}
        <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-[#EFFFFF] flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-[#102B3B]">
            <Battery className="w-4 h-4 text-[#35D47A]" />
            {t('settings.storageTitle')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#89A7B7] uppercase tracking-wider mb-1.5">
                {t('settings.batteryMinReserve')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={batteryMinReserve}
                  onChange={(e) => setBatteryMinReserve(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none font-mono transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#89A7B7]">%</span>
              </div>
              <p className="text-[10px] text-[#89A7B7] mt-1">{t('settings.batteryFloor')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#89A7B7] uppercase tracking-wider mb-1.5">
                {t('settings.criticalLoadThreshold')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={criticalLoadThreshold}
                  onChange={(e) => setCriticalLoadThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none font-mono transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#89A7B7]">kW</span>
              </div>
              <p className="text-[10px] text-[#89A7B7] mt-1">{t('settings.overloadTrigger')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#89A7B7] uppercase tracking-wider mb-1.5">
                {t('settings.dieselAutoStart')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={dieselAutoStartThreshold}
                  onChange={(e) => setDieselAutoStartThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none font-mono transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#89A7B7]">kW</span>
              </div>
              <p className="text-[10px] text-[#89A7B7] mt-1">{t('settings.dieselDeficit')}</p>
            </div>
          </div>
        </div>

        {/* 4. AI Model & Forecast Horizon */}
        <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-[#EFFFFF] flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-[#102B3B]">
            <Cpu className="w-4 h-4 text-purple-400" />
            {t('settings.mlTitle')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#89A7B7] uppercase tracking-wider mb-1.5">
                {t('settings.forecastHorizon')}
              </label>
              <select
                value={forecastHorizon}
                onChange={(e) => setForecastHorizon(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none transition-colors"
              >
                <option value="12h">12 Hours Ahead (Short-Term)</option>
                <option value="24h">24 Hours Ahead (Standard Polar Cycle)</option>
                <option value="48h">48 Hours Ahead (Storm Preparations)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#89A7B7] uppercase tracking-wider mb-1.5">
                {t('settings.modelAlgorithm')}
              </label>
              <select
                value={modelAlgorithm}
                onChange={(e) => setModelAlgorithm(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#06131D] border border-[#102B3B] focus:border-[#48D5FF] rounded-lg text-xs text-[#EFFFFF] outline-none transition-colors"
              >
                <option value="RandomForestRegressor">RandomForestRegressor (Ensemble n=100)</option>
                <option value="GradientBoostingRegressor">GradientBoostingRegressor (Boosting)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Alert Notification Channels */}
        <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-[#EFFFFF] flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-[#102B3B]">
            <Bell className="w-4 h-4 text-[#FFA000]" />
            {t('settings.alertsTitle')}
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#06131D] border border-[#102B3B] cursor-pointer hover:border-[#48D5FF]/30 transition-colors">
              <div>
                <p className="text-xs font-bold text-[#EFFFFF]">{t('settings.criticalAlerts')}</p>
                <p className="text-[11px] text-[#89A7B7]">{t('settings.criticalAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={criticalAlerts}
                onChange={(e) => setCriticalAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#48D5FF] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#06131D] border border-[#102B3B] cursor-pointer hover:border-[#48D5FF]/30 transition-colors">
              <div>
                <p className="text-xs font-bold text-[#EFFFFF]">{t('settings.warningAlerts')}</p>
                <p className="text-[11px] text-[#89A7B7]">{t('settings.warningAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={warningAlerts}
                onChange={(e) => setWarningAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#48D5FF] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#06131D] border border-[#102B3B] cursor-pointer hover:border-[#48D5FF]/30 transition-colors">
              <div>
                <p className="text-xs font-bold text-[#EFFFFF]">{t('settings.systemNotifications')}</p>
                <p className="text-[11px] text-[#89A7B7]">{t('settings.systemNotificationsDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={systemNotifications}
                onChange={(e) => setSystemNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#48D5FF] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#299BD7] to-[#48D5FF] hover:from-[#299BD7]/90 hover:to-[#48D5FF]/90 text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-[#48D5FF]/20 cursor-pointer min-h-[42px]"
          >
            {saving ? t('settings.saving') : t('settings.saveBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
