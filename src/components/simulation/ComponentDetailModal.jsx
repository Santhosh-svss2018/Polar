import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, Sparkles, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ComponentDetailModal({ component, onClose, onOptimize }) {
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);

  if (!component) return null;

  const handleOptimizeClick = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);
      if (onOptimize) {
        onOptimize(component.id);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#06131D] border border-[#48D5FF]/40 shadow-2xl shadow-black p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#102B3B]">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: component.accent || '#48D5FF' }}
              />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#89A7B7]">
                {component.category} DIAGNOSTICS
              </span>
            </div>
            <h3 className="text-xl font-black text-[#EFFFFF] mt-1 tracking-wide">
              {component.name}
            </h3>
            <p className="text-xs text-[#48D5FF] mt-0.5">{component.subtitle}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#89A7B7] hover:text-white hover:bg-[#0B1D29] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subsystem Status Pill */}
        <div className="p-3 rounded-xl bg-[#0B1D29] border border-[#102B3B] flex items-center justify-between">
          <span className="text-xs text-[#89A7B7] font-semibold uppercase">Operational State</span>
          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded"
            style={{
              backgroundColor: `${component.accent || '#48D5FF'}20`,
              color: component.accent || '#48D5FF',
            }}
          >
            {component.status}
          </span>
        </div>

        {/* Detailed Metrics Table */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-[#89A7B7] uppercase tracking-wider">
            Live Telemetry & Diagnostics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {component.metrics?.map((m, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#0E2432]/60 border border-[#102B3B] flex items-center justify-between text-xs"
              >
                <span className="text-[#89A7B7] font-medium">{m.label}</span>
                <span
                  className="font-mono font-bold"
                  style={{ color: m.color || '#EFFFFF' }}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Feedback */}
        {optimized && (
          <div className="p-3 rounded-lg bg-[#35D47A]/15 border border-[#35D47A]/40 text-[#35D47A] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>AI Subsystem MPPT & load vector re-indexed to maximum efficiency (+4.2% yield).</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#102B3B] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0B1D29] hover:bg-[#0E2432] border border-[#102B3B] text-xs font-bold text-[#89A7B7] hover:text-white transition-colors cursor-pointer"
          >
            CLOSE
          </button>
          <button
            onClick={handleOptimizeClick}
            disabled={optimizing}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#299BD7] to-[#48D5FF] hover:from-[#48D5FF] hover:to-[#35D47A] text-black font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-[#48D5FF]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
            <span>{optimizing ? 'OPTIMIZING VECTOR...' : 'OPTIMIZE SOURCE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
