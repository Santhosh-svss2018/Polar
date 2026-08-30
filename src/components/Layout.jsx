import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../services/api';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [alertCount, setAlertCount] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Auth check
    const user = localStorage.getItem('polar_user');
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch initial quick header data
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
        if (data && data.active_alerts) {
          setAlertCount(data.active_alerts.length);
        }
      } catch (err) {
        console.warn('Using fallback header data:', err.message);
      }
    };

    fetchHeaderData();
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[#070D1B] text-slate-100 flex flex-col">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen transition-all duration-300">
        <Header
          setMobileOpen={setMobileOpen}
          weatherData={weatherData}
          alertCount={alertCount}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
