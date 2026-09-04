import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  Sliders,
  AlertTriangle,
  FlaskConical,
  FileBarChart2,
  Database,
  Users,
  Settings,
  LogOut,
  Zap,
  Snowflake
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Prediction', path: '/prediction', icon: TrendingUp },
    { name: 'Optimization', path: '/optimization', icon: Sliders },
    { name: 'Alerts & Anomalies', path: '/alerts', icon: AlertTriangle, badge: '3' },
    { name: 'Simulation', path: '/simulation', icon: FlaskConical },
    { name: 'Reports', path: '/reports', icon: FileBarChart2 },
    { name: 'Data Management', path: '/data', icon: Database },
  ];

  // Add Operator Management in hamburger/sidebar ONLY during Administrative login
  if (isAdmin) {
    navItems.push({
      name: 'Operator Management',
      path: '/admin/operators',
      icon: Users,
      badge: 'Admin'
    });
  }

  // Settings
  navItems.push({ name: 'Settings', path: '/settings', icon: Settings });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#06131D] border-r border-[#102B3B] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Top Header in Sidebar */}
        <div>
          <div className="p-4 border-b border-[#102B3B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#299BD7] to-[#48D5FF] flex items-center justify-center shadow-lg shadow-[#48D5FF]/20 text-black">
                <Zap className="w-6 h-6 text-black fill-current" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-wider text-[#EFFFFF] flex items-center gap-1.5">
                  POLAR-ENERGY <span className="text-[#48D5FF] font-black">AI</span>
                </h1>
                <p className="text-[9px] text-[#89A7B7] font-bold tracking-wider uppercase">
                  POLAR SMART ENERGY MANAGEMENT
                </p>
              </div>
            </div>

            {/* Station indicator tag */}
            <div className="mt-3 px-2.5 py-1 rounded-md bg-[#0B1D29] border border-[#102B3B] flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#48D5FF] font-medium text-[11px]">
                <Snowflake className="w-3.5 h-3.5 text-[#48D5FF]" />
                Bharati Station
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#35D47A] font-semibold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35D47A] pulse-active" />
                Online
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0B1D29] text-[#48D5FF] border-l-4 border-l-[#48D5FF] border border-[#102B3B] shadow-sm shadow-[#48D5FF]/10'
                        : 'text-[#89A7B7] hover:text-[#EFFFFF] hover:bg-[#0B1D29]/60 border-l-4 border-l-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                        item.badge === 'Admin'
                          ? 'bg-[#48D5FF]/20 text-[#48D5FF] border border-[#48D5FF]/30'
                          : 'bg-[#FF6257]/20 text-[#FF6257] border border-[#FF6257]/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: System Health + Logout */}
        <div className="p-3 border-t border-[#102B3B] space-y-2 bg-[#06131D]">
          <div className="p-3 rounded-lg bg-[#0B1D29] border border-[#102B3B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35D47A] pulse-active" />
              <span className="text-xs font-bold text-[#89A7B7]">SYSTEM HEALTH</span>
            </div>
            <span className="font-mono font-extrabold text-[#35D47A] text-xs">98.7%</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#89A7B7] hover:text-[#FF6257] hover:bg-[#FF6257]/10 transition-colors border border-transparent hover:border-[#FF6257]/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#FF6257]" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
