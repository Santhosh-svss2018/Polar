import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Menu,
  Thermometer,
  Wind,
  Droplets,
  User,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Languages,
  Check
} from 'lucide-react';

export default function Header({ setMobileOpen, weatherData }) {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { language, setLanguage, t, availableLanguages, currentLangMeta } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const profileRef = useRef(null);
  const langRef = useRef(null);

  // Dynamic live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const weather = weatherData || {
    temperature: -18,
    wind_speed: 24,
    humidity: 62,
  };

  const roleDisplay = isAdmin ? t('header.admin') : t('header.operator');
  const usernameDisplay = user?.username || (isAdmin ? 'admin' : 'operator');

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#06131D]/95 backdrop-blur-md border-b border-[#102B3B] px-3 sm:px-4 lg:px-6 flex items-center justify-between">
      {/* LEFT: Branding */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0B1D29] active:bg-[#102B3B] transition-colors flex-shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 text-[#48D5FF]" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#299BD7] to-[#48D5FF] flex items-center justify-center shadow-lg shadow-[#48D5FF]/20 text-black flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-current" />
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-xs sm:text-base tracking-wider text-white truncate">
                {t('header.title')} <span className="text-[#48D5FF] font-black">AI</span>
              </h1>
            </div>
            <p className="text-[8px] sm:text-[10px] text-[#89A7B7] font-semibold tracking-wider sm:tracking-widest uppercase truncate hidden xs:block">
              {t('header.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* CENTER: Simulation Subtitle / Live Twin Banner (hidden on mobile) */}
      <div className="hidden md:flex flex-col items-center justify-center text-center px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#35D47A] pulse-active" />
          <span className="text-xs font-black tracking-widest text-[#EFFFFF] uppercase">
            {t('header.simulation')}
          </span>
        </div>
        <p className="text-[10px] text-[#48D5FF] font-mono tracking-wider">
          {t('header.digitalTwin')}
        </p>
      </div>

      {/* RIGHT: System Mode + Weather + Language Selector + Clock + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* System Mode Autonomous Pill */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0B1D29] border border-[#102B3B] text-xs">
          <span className="text-[10px] text-[#89A7B7] uppercase font-bold">{t('header.systemMode')}</span>
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#35D47A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35D47A] pulse-active" />
            {t('header.autonomous')}
          </span>
        </div>

        {/* Weather Conditions (hidden on very small screens, visible on sm+) */}
        <div className="hidden sm:flex items-center gap-2.5 px-2.5 sm:px-3 py-1 rounded-lg bg-[#0B1D29] border border-[#102B3B] text-xs">
          <div className="flex items-center gap-1 text-[#48D5FF]">
            <Thermometer className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">{weather.temperature}°C</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-[#299BD7]">
            <Wind className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">{weather.wind_speed} km/h</span>
          </div>
        </div>

        {/* Quick Language Switcher Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#0B1D29] hover:bg-[#0E2432] active:bg-[#102B3B] transition-colors border border-[#102B3B] text-xs cursor-pointer min-h-[36px]"
            title="Change Interface Language"
            aria-label="Select language"
          >
            <span className="text-base leading-none">{currentLangMeta?.flag || '🌐'}</span>
            <span className="hidden md:inline font-mono font-bold text-[#EFFFFF] text-[11px]">
              {language.toUpperCase()}
            </span>
            <ChevronDown className="w-3 h-3 text-[#89A7B7]" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-2xl shadow-black/95 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-1">
              <div className="px-3 py-1.5 border-b border-[#102B3B] text-[10px] font-bold uppercase tracking-wider text-[#89A7B7] flex items-center gap-1.5">
                <Languages className="w-3 h-3 text-[#48D5FF]" />
                {t('header.chooseLanguage')}
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                      language === lang.code
                        ? 'bg-[#102B3B] text-[#48D5FF] font-bold'
                        : 'text-[#89A7B7] hover:text-[#EFFFFF] hover:bg-[#0E2432]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.native}</span>
                    </div>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-[#48D5FF]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Clock (hidden on mobile, visible on lg+) */}
        <div className="hidden lg:flex flex-col text-right px-2.5 py-1 rounded-lg bg-[#0B1D29] border border-[#102B3B]">
          <span className="text-xs font-mono font-bold text-[#EFFFFF]">{currentTime || '18:42'}</span>
          <span className="text-[9px] text-[#89A7B7] font-semibold uppercase tracking-wider">{t('header.localTime')}</span>
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:pr-2 rounded-xl bg-[#0B1D29] hover:bg-[#0E2432] active:bg-[#102B3B] transition-colors border border-[#102B3B] cursor-pointer min-h-[36px]"
            aria-label="User profile menu"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-[#299BD7] to-[#48D5FF] flex items-center justify-center text-black font-bold text-xs shadow-md shadow-[#48D5FF]/20 flex-shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#EFFFFF] leading-tight">{roleDisplay}</p>
              <p className="text-[10px] text-[#48D5FF] font-mono leading-tight">{usernameDisplay}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#89A7B7]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-2xl shadow-black/95 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-[#102B3B] bg-[#0E2432]">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Shield className="w-3.5 h-3.5 text-[#48D5FF]" />
                  <span>{roleDisplay}</span>
                </div>
                <p className="text-[11px] font-mono text-[#89A7B7] mt-0.5 truncate">{usernameDisplay}</p>
                <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded bg-[#35D47A]/20 text-[#35D47A] font-mono font-bold">
                  Status: {t('header.active').toUpperCase()}
                </span>
              </div>

              <div className="p-1.5 space-y-0.5 text-xs">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/operators');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#EFFFFF] hover:bg-[#0E2432] text-left transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#48D5FF]" />
                    <span>{t('nav.operators')}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#89A7B7] hover:text-[#EFFFFF] hover:bg-[#0E2432] text-left transition-colors cursor-pointer"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#48D5FF]" />
                  <span>{t('nav.settings')}</span>
                </button>
              </div>

              <div className="p-1.5 border-t border-[#102B3B] bg-[#06131D]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#FF6257] hover:bg-[#FF6257]/10 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

