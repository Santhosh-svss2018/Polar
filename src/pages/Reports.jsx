import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
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
  Clock,
  Layers,
  Sparkles
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
  const { simState } = useTelemetry();
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
      avg_resilience_score: 88.2,
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
      { date: 'Sun (Live)', solar_kwh: Math.round(simState.solarOutput * 1.8), wind_kwh: Math.round(simState.windOutput * 1.8), diesel_kwh: Math.round(simState.dieselOutput * 1.8), load_kwh: Math.round(simState.gridLoad * 1.8), resilience: simState.resilienceScore || 90 },
    ],
  });

  const [simLog] = useState([
    {
      id: 1,
      time: '18:40',
      title: 'Real-Time Telemetry Snapshot',
      renewablePct: 100,
      dieselUsed: '0 L',
      loadKw: 621,
      status: 'Optimal (All Safe)',
    },
    {
      id: 2,
      time: '18:25',
      title: 'Wind & Solar Vector Dispatch',
      renewablePct: 91,
      dieselUsed: '12 L',
      loadKw: 710,
      status: 'Nominal Buffer',
    },
    {
      id: 3,
      time: '18:10',
      title: 'Station Load Balance Cycle',
      renewablePct: 96,
      dieselUsed: '0 L',
      loadKw: 580,
      status: 'Optimal (All Safe)',
    },
  ]);

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
    const headers = ['Date/Period', 'Solar Generation (kWh)', 'Wind Generation (kWh)', 'Diesel Backup (kWh)', 'Total Load (kWh)', 'Resilience Score'];
    const rows = reportData.daily_records.map((r) => [r.date, r.solar_kwh, r.wind_kwh, r.diesel_kwh, r.load_kwh, r.resilience]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PolarEnergyAI_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setExporting(false), 500);
  };

  const s = reportData.summary;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#102B3B]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#EFFFFF] flex items-center gap-2">
            ENERGY ANALYTICS & SIMULATION REPORTS
          </h2>
          <p className="text-xs text-[#89A7B7] mt-1">
            Historical generation metrics, simulation outcomes, and fuel audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-[#0B1D29] border border-[#102B3B] rounded-lg p-1">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  period === p ? 'bg-[#48D5FF] text-black font-bold' : 'text-[#89A7B7] hover:text-[#EFFFFF]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#299BD7]/20 border border-[#299BD7]/40 text-[#48D5FF] text-xs font-bold hover:bg-[#299BD7]/30 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#89A7B7] uppercase">Total Renewable Generated</span>
            <Sun className="w-4 h-4 text-[#48D5FF]" />
          </div>
          <p className="text-2xl font-black text-[#EFFFFF] font-mono mt-1">
            {(s.total_renewable_kwh + Math.round(simState.solarOutput * 2 + simState.windOutput * 2)).toLocaleString()}{' '}
            <span className="text-xs font-normal text-[#89A7B7]">kWh</span>
          </p>
          <p className="text-[10px] text-[#35D47A] mt-1 font-semibold">100% Zero-Carbon Harvested</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#89A7B7] uppercase">Renewable Fraction</span>
            <TrendingUp className="w-4 h-4 text-[#35D47A]" />
          </div>
          <p className="text-2xl font-black text-[#35D47A] font-mono mt-1">
            {simState.dieselOutput > 0 ? '78.4%' : '94.2%'}
          </p>
          <p className="text-[10px] text-[#89A7B7] mt-1">Target: &gt;90% Renewable</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#89A7B7] uppercase">Diesel Fuel Conserved</span>
            <Fuel className="w-4 h-4 text-[#FFA000]" />
          </div>
          <p className="text-2xl font-black text-[#FFA000] font-mono mt-1">
            {s.diesel_conserved_liters}{' '}
            <span className="text-xs font-normal text-[#89A7B7]">Liters</span>
          </p>
          <p className="text-[10px] text-[#35D47A] mt-1">~1.45 tonnes CO2 equivalent saved</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#89A7B7] uppercase">Resilience Score</span>
            <ShieldCheck className="w-4 h-4 text-[#35D47A]" />
          </div>
          <p className="text-2xl font-black text-[#EFFFFF] font-mono mt-1">
            {simState.resilienceScore || 92} <span className="text-xs font-bold text-[#89A7B7]">/ 100</span>
          </p>
          <p className="text-[10px] text-[#35D47A] mt-1">Safe Arctic Operating Margin</p>
        </div>
      </div>

      {/* DEDICATED DIGITAL TWIN SIMULATION RUNS & AUDIT LOG */}
      <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#102B3B]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#48D5FF]" />
            <h3 className="text-sm font-extrabold text-[#EFFFFF] uppercase tracking-wider">
              DIGITAL TWIN SIMULATION RUNS & AUDIT LOG
            </h3>
          </div>
          <span className="text-xs font-mono text-[#89A7B7]">Live Synchronized Runs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#102B3B] text-[#89A7B7] uppercase tracking-wider">
                <th className="py-2.5 px-3">Execution Time</th>
                <th className="py-2.5 px-3">Telemetry Run</th>
                <th className="py-2.5 px-3">Renewable Share</th>
                <th className="py-2.5 px-3">Station Load</th>
                <th className="py-2.5 px-3">Diesel Used</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102B3B]/60">
              {simLog.map((item) => (
                <tr key={item.id} className="hover:bg-[#06131D]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#89A7B7] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#48D5FF]" />
                    {item.time}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#EFFFFF]">{item.title}</td>
                  <td className="py-2.5 px-3 font-mono text-[#35D47A] font-bold">{item.renewablePct}%</td>
                  <td className="py-2.5 px-3 font-mono text-[#48D5FF]">{item.loadKw} kW</td>
                  <td className="py-2.5 px-3 font-mono text-[#FFA000]">{item.dieselUsed}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#35D47A]/20 text-[#35D47A] border border-[#35D47A]/40">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MAIN REPORT CHART: GENERATION VS CONSUMPTION BREAKDOWN */}
      <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#EFFFFF] flex items-center gap-2 uppercase tracking-wider">
            <FileBarChart2 className="w-4 h-4 text-[#48D5FF]" />
            Energy Generation vs. Station Demand Breakdown (kWh)
          </h3>
          <p className="text-xs text-[#89A7B7]">
            Stacked renewable contribution (Solar + Wind) compared against actual demand.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData.daily_records}>
              <CartesianGrid strokeDasharray="3 3" stroke="#102B3B" vertical={false} />
              <XAxis dataKey="date" stroke="#89A7B7" fontSize={11} />
              <YAxis stroke="#89A7B7" fontSize={11} unit=" kWh" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#06131D',
                  borderColor: '#102B3B',
                  borderRadius: '0.5rem',
                  color: '#EFFFFF',
                }}
              />
              <Legend />
              <Bar dataKey="solar_kwh" name="Solar Energy (kWh)" stackId="a" fill="#FFD12A" />
              <Bar dataKey="wind_kwh" name="Wind Energy (kWh)" stackId="a" fill="#299BD7" />
              <Bar dataKey="diesel_kwh" name="Diesel Backup (kWh)" stackId="a" fill="#FFA000" />
              <Bar dataKey="load_kwh" name="Station Load Demand (kWh)" fill="#48D5FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
