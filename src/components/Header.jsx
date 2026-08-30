import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  Thermometer,
  Wind,
  Droplets,
  User,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Header({ setMobileOpen, weatherData, alertCount = 3 }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('polar_user');
    navigate('/login');
  };

  const weather = weatherData || {
    temperature: -24.3,
    wind_speed: 18,
    humidity: 65,
  };

  const recentAlerts = [
    {
      id: 1,
      type: 'critical',
      title: 'High Consumption Detected',
      desc: 'Heater 03 is consuming 12.5 kW (140% above normal)',
      time: '12m ago',
      icon: AlertOctagon,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Energy Shortage Predicted',
      desc: 'Low renewable generation expected in next 6 hours',
      time: '34m ago',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 3,
      type: 'info',
      title: 'Battery Discharge High',
      desc: 'Battery is discharging faster than normal peak rate',
      time: '1h ago',
      icon: Info,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B132B]/90 backdrop-blur-md border-b border-[#1C2F57] px-4 lg:px-8 flex items-center justify-between">
      {/* Left section: Mobile menu toggle + Station title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#152445] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111C3A] border border-[#1E325A]">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-semibold text-slate-200">Bharati Polar Station</span>
            <span className="text-[11px] font-mono text-slate-400">69°24'S, 76°11'E</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-active" />
            AI Active & Resilient
          </div>
        </div>
      </div>

      {/* Right section: Live Weather + Alerts + Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Weather conditions pill */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0F1A38] border border-[#1C2F57] text-xs">
          <div className="flex items-center gap-1 text-cyan-300">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold font-mono">{weather.temperature} °C</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Wind className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono">{weather.wind_speed} km/h</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Droplets className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono">{weather.humidity}%</span>
          </div>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#152445] transition-colors border border-transparent hover:border-[#1E325A]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-[#0B132B] animate-pulse">
                {alertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0D1836] border border-[#1E325A] shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-[#1E325A] flex items-center justify-between bg-[#0F1A38]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-sm text-white">System Notifications</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-medium">
                  {alertCount} Active
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#172547] p-2 space-y-1">
                {recentAlerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={alert.id}
                      className={`p-2.5 rounded-lg border ${alert.bg} transition-colors hover:brightness-110 cursor-pointer`}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/alerts');
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-semibold ${alert.color}`}>{alert.title}</p>
                            <span className="text-[10px] text-slate-400">{alert.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{alert.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 border-t border-[#1E325A] bg-[#0A132C]">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View All Alerts & Anomalies</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-[#152445] transition-colors border border-[#1E325A]/60"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-cyan-600/20">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">System Admin</p>
              <p className="text-[10px] text-cyan-400 font-mono leading-tight">Bharati Station</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0D1836] border border-[#1E325A] shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-[#1E325A] bg-[#0F1A38]">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  System Administrator
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Bharati Polar Station</p>
                <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Role: Master Operator
                </span>
              </div>

              <div className="p-1.5 space-y-0.5 text-xs">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#172547] transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Station Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/data');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#172547] transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Data & Telemetry</span>
                </button>
              </div>

              <div className="p-1.5 border-t border-[#1E325A] bg-[#0A132C]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
