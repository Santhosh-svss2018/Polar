import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, ShieldAlert, CheckCircle2, ArrowRight, Bell, Sparkles, X } from 'lucide-react';

export default function DangerZoneModal({ alert, onClose, onMitigate }) {
  const navigate = useNavigate();
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0B1D29] border-2 border-[#FF6257] p-6 shadow-2xl shadow-[#FF6257]/30 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-[#102B3B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF6257]/20 text-[#FF6257] border border-[#FF6257]/40 animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-[#FF6257] tracking-widest uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF6257] animate-ping" />
                CRITICAL DANGER ZONE DETECTED
              </span>
              <h3 className="text-base font-black text-[#EFFFFF] tracking-wide">
                {alert.equipment || 'MICROGRID SUBSYSTEM'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#89A7B7] hover:text-white hover:bg-[#102B3B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Threat Description Card */}
        <div className="p-4 rounded-xl bg-[#06131D] border border-[#FF6257]/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#FF6257]">{alert.title}</span>
            <span className="text-xs font-mono font-black text-[#EFFFFF] px-2 py-0.5 rounded bg-[#FF6257]/20 border border-[#FF6257]/40">
              {alert.value}
            </span>
          </div>
          <p className="text-xs text-[#89A7B7] leading-relaxed">
            {alert.desc}
          </p>
        </div>

        {/* Automatic Storage in Notifications confirmation */}
        <div className="p-3 rounded-xl bg-[#35D47A]/10 border border-[#35D47A]/30 flex items-center justify-between text-xs text-[#35D47A]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#35D47A]" />
            <span className="font-semibold">Stored automatically in System Notifications & Alerts DB</span>
          </div>
          <CheckCircle2 className="w-4 h-4" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate('/alerts');
            }}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#102B3B] hover:bg-[#1C2F57] text-[#48D5FF] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#48D5FF]/30"
          >
            <span>VIEW ALL IN NOTIFICATIONS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (onMitigate) onMitigate();
              onClose();
            }}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6257] to-[#FFA000] hover:from-[#FF483B] hover:to-[#FFB700] text-black text-xs font-black tracking-wide transition-all shadow-lg shadow-[#FF6257]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-black" />
            <span>ACKNOWLEDGE & ENGAGE DEFENSE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
