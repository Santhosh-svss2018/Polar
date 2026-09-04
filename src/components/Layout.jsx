import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../services/api';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [weatherData, setWeatherData] = useState({
    temperature: -18,
    wind_speed: 24,
    humidity: 62,
  });

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
        // Fallback already preset to -18°C, 24 km/h
      }
    };

    fetchHeaderData();
  }, []);

  return (
    <div className="min-h-screen bg-[#06131D] text-[#EFFFFF] flex flex-col">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen transition-all duration-300">
        <Header setMobileOpen={setMobileOpen} weatherData={weatherData} />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full max-w-[1800px] mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
