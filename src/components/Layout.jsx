import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  TrendingUp,
  Sliders,
  Menu,
  AlertTriangle
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../services/api';
import { useTelemetry } from '../context/TelemetryContext';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { activeAlerts } = useTelemetry();
  const [weatherData, setWeatherData] = useState({
    temperature: -18,
    wind_speed: 24,
    humidity: 62,
  });

  const criticalAlertCount = activeAlerts?.filter(a => a.severity === 'critical').length || 0;

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const data = await api.getDashboard();
        if (data && data.environment) {
          setWeatherData({
            temperature: data.environment.temperature_c,
            wind_speed: data.environment.wind_speed_kmh,
            humidity: data.environment.humidity_percent,
          });
        }
      } catch (err) {
        // Fallback preset
      }
    };

    fetchHeaderData();
  }, []);

  const bottomNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Simulation', path: '/simulation', icon: FlaskConical },
    { name: 'Forecast', path: '/prediction', icon: TrendingUp },
    { name: 'Optimize', path: '/optimization', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#06131D] text-[#EFFFFF] flex flex-col selection:bg-[#48D5FF] selection:text-black">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen transition-all duration-300">
        <Header setMobileOpen={setMobileOpen} weatherData={weatherData} />

        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 pb-24 lg:pb-8 w-full max-w-[1800px] mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile/tablet < 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#06131D]/95 backdrop-blur-xl border-t border-[#102B3B] pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center py-1 group relative transition-transform duration-150 active:scale-95"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                    isActive
                      ? 'bg-[#48D5FF]/15 text-[#48D5FF] shadow-sm shadow-[#48D5FF]/20 scale-110'
                      : 'text-[#89A7B7] hover:text-[#EFFFFF]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight mt-0.5 transition-colors ${
                    isActive ? 'text-[#48D5FF]' : 'text-[#89A7B7]'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute -top-1 w-8 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#48D5FF] to-transparent shadow-[0_0_8px_#48D5FF]" />
                )}
              </NavLink>
            );
          })}

          {/* More / Menu Drawer Trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center py-1 group relative transition-transform duration-150 active:scale-95 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <div className="p-1.5 rounded-xl text-[#89A7B7] group-hover:text-[#EFFFFF] flex items-center justify-center relative">
              <Menu className="w-5 h-5" />
              {criticalAlertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FF6257] border-2 border-[#06131D] animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight text-[#89A7B7] mt-0.5">
              Menu
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}

