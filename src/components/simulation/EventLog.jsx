import React from 'react';
import { Activity, Clock } from 'lucide-react';

export default function EventLog({ events }) {
  const defaultEvents = [
    { id: 1, time: '18:42', text: 'AI optimization cycle completed', status: 'success' },
    { id: 2, time: '18:41', text: 'Wind generation increased by 8%', status: 'info' },
    { id: 3, time: '18:40', text: 'Battery charging initiated', status: 'success' },
    { id: 4, time: '18:38', text: 'Grid load stabilized at 621 kW', status: 'info' },
    { id: 5, time: '18:35', text: 'Diesel generator switched to standby', status: 'success' },
  ];

  const list = events && events.length > 0 ? events : defaultEvents;

  const dotColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-[#35D47A]';
      case 'warning':
        return 'bg-[#FFD12A]';
      case 'critical':
        return 'bg-[#FF6257]';
      case 'info':
      default:
        return 'bg-[#48D5FF]';
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#102B3B]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#48D5FF]" />
          <h3 className="text-xs font-black tracking-wider text-[#EFFFFF] uppercase">
            LIVE EVENT LOG
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#89A7B7]">
          {list.length} EVENTS
        </span>
      </div>

      {/* Events List */}
      <div className="max-h-52 overflow-y-auto space-y-2 pr-1 divide-y divide-[#102B3B]/50">
        {list.map((item) => (
          <div key={item.id} className="pt-2 first:pt-0 flex items-start gap-2.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${dotColor(item.status)}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#89A7B7]">{item.time}</span>
              </div>
              <p className="text-[#EFFFFF] text-[11px] font-medium leading-tight mt-0.5">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
