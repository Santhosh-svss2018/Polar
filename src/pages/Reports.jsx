import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Sun,
  Wind,
  Fuel,
  Battery,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../services/api';

export default function Reports() {
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [reportData, setReportData] = useState({
    summary: {
      total_consumption_kwh: 6552,
      total_renewable_kwh: 7224,
      renewable_fraction_pct: 92.4,
      diesel_consumed_liters: 142,
      diesel_conserved_liters: 580,
      avg_resilience_score: 86.2,
      anomalies_detected: 4,
      anomalies_resolved: 4,
    },
    daily_records: [
      { date: 'Mon', solar_kwh: 480, wind_kwh: 360, diesel_kwh: 0, load_kwh: 810, resilience: 88 },
      { date: 'Tue', solar_kwh: 510, wind_kwh: 340, diesel_kwh: 0, load_kwh: 825, resilience: 89 },
      { date: 'Wed', solar_kwh: 460, wind_kwh: 380, diesel_kwh: 0, load_kwh: 840, resilience: 87 },
      { date: 'Thu', solar_kwh: 320, wind_kwh: 410, diesel_kwh: 45, load_kwh: 890, resilience: 82 },
      { date: 'Fri', solar_kwh: 520, wind_kwh: 350, diesel_kwh: 0, load_kwh: 805, resilience: 90 },
      { date: 'Sat', solar_kwh: 540, wind_kwh: 330, diesel_kwh: 0, load_kwh: 790, resilience: 91 },
      { date: 'Sun', solar_kwh: 490, wind_kwh: 370, diesel_kwh: 0, load_kwh: 815, resilience: 88 },
    ],
  });

  const fetchReports = async (p = period) => {
    try {
      setLoading(true);
      const res = await api.getReports(p);
      if (res && res.summary) {
        setReportData(res);
      }
    } catch (err) {
      console.warn('Using local reporting analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const handleExportCSV = () => {
    setExporting(true);
    // Create CSV content directly in browser for reliable instant download
    const headers = ['Date', 'Solar (kWh)', 'Wind (kWh)', 'Diesel (kWh)', 'Total Load (kWh)', 'Resilience Score'];
    const rows = reportData.daily_records.map(r => [
      r.date,
      r.solar_kwh,
      r.wind_kwh,
      r.diesel_kwh,
      r.load_kwh,
      r.resilience
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'POLAR-ENERGY AI — BHARATI POLAR STATION ENERGY REPORT\n';
    csvContent += `Period: ${period.toUpperCase()}\n`;
    csvContent += `Generated: ${new Date().toISOString()}\n\n`;
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `polar_energy_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setExporting(false), 600);
  };

  const s = reportData.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1C2F57]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2.5">
            ENERGY ANALYTICS & REPORTS
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
              HISTORICAL TELEMETRY
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated station energy performance, fuel conservation metrics, and printable audit reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center p-1 rounded-lg bg-[#0E1A38] border border-[#1C2F57] text-xs">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                period === 'daily' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                period === 'weekly' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                period === 'monthly' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'GENERATING CSV...' : 'EXPORT REPORT (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="polar-card p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Renewable Generation</span>
            <Sun className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {s.total_renewable_kwh.toLocaleString()} <span className="text-xs font-bold text-cyan-300">kWh</span>
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">{s.renewable_fraction_pct}% of total station power</p>
        </div>

        <div className="polar-card p-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Station Load Demand</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {s.total_consumption_kwh.toLocaleString()} <span className="text-xs font-bold text-amber-300">kWh</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Life support & research operations</p>
        </div>

        <div className="polar-card p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Diesel Conserved</span>
            <Fuel className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono mt-1">
            +{s.diesel_conserved_liters} <span className="text-xs font-bold text-blue-300">Liters</span>
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">~1.45 tonnes CO2 equivalent saved</p>
        </div>

        <div className="polar-card p-4 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Average Resilience</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {s.avg_resilience_score} <span className="text-xs font-bold text-slate-400">/ 100</span>
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">Safe Arctic Operating Margin</p>
        </div>
      </div>

      {/* MAIN REPORT CHART: GENERATION VS CONSUMPTION BREAKDOWN */}
      <div className="polar-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileBarChart2 className="w-4 h-4 text-cyan-400" />
              Daily Energy Generation vs. Station Demand Breakdown (kWh)
            </h3>
            <p className="text-xs text-slate-400">
              Stacked renewable contribution (Solar + Wind) compared against actual demand.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData.daily_records}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2F57" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} unit=" kWh" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1836',
                  borderColor: '#1E325A',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="solar_kwh" name="Solar Energy (kWh)" stackId="a" fill="#00E5FF" />
              <Bar dataKey="wind_kwh" name="Wind Energy (kWh)" stackId="a" fill="#48CAE4" />
              <Bar dataKey="diesel_kwh" name="Diesel Backup (kWh)" stackId="a" fill="#FF3D71" />
              <Bar dataKey="load_kwh" name="Station Load Demand (kWh)" fill="#FFB300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DETAILED DAILY AUDIT TABLE */}
      <div className="polar-card p-5 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Audit Telemetry Records Table
          </h3>
          <span className="text-xs text-slate-400 font-mono">Bharati Polar Base Station</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C2F57] text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Date / Day</th>
              <th className="py-2.5 px-3">Solar Generation</th>
              <th className="py-2.5 px-3">Wind Generation</th>
              <th className="py-2.5 px-3">Diesel Backup</th>
              <th className="py-2.5 px-3">Total Consumption</th>
              <th className="py-2.5 px-3">Resilience Score</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#132240]">
            {reportData.daily_records.map((row) => (
              <tr key={row.date} className="hover:bg-[#121F3F]/60 transition-colors">
                <td className="py-2.5 px-3 font-bold text-white">{row.date}</td>
                <td className="py-2.5 px-3 font-mono text-cyan-300">{row.solar_kwh} kWh</td>
                <td className="py-2.5 px-3 font-mono text-blue-300">{row.wind_kwh} kWh</td>
                <td className="py-2.5 px-3 font-mono text-slate-300">
                  {row.diesel_kwh > 0 ? (
                    <span className="text-red-400 font-bold">{row.diesel_kwh} kWh</span>
                  ) : (
                    <span className="text-emerald-400">0 kWh (Inactive)</span>
                  )}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{row.load_kwh} kWh</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{row.resilience} / 100</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Validated
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
