import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Sliders,
  AlertTriangle,
  FlaskConical,
  FileBarChart2,
  Database,
  Settings,
  LogOut,
  Zap,
  Radio,
  Snowflake
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Prediction', path: '/prediction', icon: TrendingUp },
    { name: 'Optimization', path: '/optimization', icon: Sliders },
    { name: 'Alerts & Anomalies', path: '/alerts', icon: AlertTriangle, badge: '3' },
    { name: 'Simulation', path: '/simulation', icon: FlaskConical },
    { name: 'Reports', path: '/reports', icon: FileBarChart2 },
    { name: 'Data Management', path: '/data', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('polar_user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0B132B] border-r border-[#1C2F57] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-[#1C2F57]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-black">
                <Zap className="w-6 h-6 text-black fill-current" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
                  POLAR-ENERGY <span className="text-cyan-400 font-black">AI</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                  POLAR SMART ENERGY MANAGEMENT
                </p>
              </div>
            </div>

            {/* Station indicator tag */}
            <div className="mt-3.5 px-2.5 py-1.5 rounded-md bg-[#111C3A] border border-[#1E325A] flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                Bharati Station
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-active" />
                Online
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#121E3E]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-cyan-400/80" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / Quick Info & Logout */}
        <div className="p-3 border-t border-[#1C2F57] space-y-2">
          <div className="p-3 rounded-lg bg-[#0F1A38] border border-[#1C2F57] text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Grid Frequency</span>
              <span className="text-cyan-300 font-mono">50.02 Hz</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>AI Loop Rate</span>
              <span className="text-emerald-400 font-mono">1.0s / Nom</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
