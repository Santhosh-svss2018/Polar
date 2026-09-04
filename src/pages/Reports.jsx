import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useLanguage } from '../context/LanguageContext';
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
  Sparkles,
  Zap
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
  const { t } = useLanguage();
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
      { date: 'Sun (Live)', solar_kwh: 505, wind_kwh: 370, diesel_kwh: 0, load_kwh: 815, resilience: 92 },
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

  const fetchReports = async (selectedPeriod) => {
    try {
      setLoading(true);
      const res = await api.getReports(selectedPeriod);
      if (res && res.daily_records) {
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

  const handlePeriodChange = (newPeriod) => {
    if (newPeriod !== period) {
      setPeriod(newPeriod);
    }
  };

  // Build reactive display records with dynamic live telemetry injection on the latest item
  const getDisplayRecords = () => {
    if (!reportData.daily_records || reportData.daily_records.length === 0) return [];
    
    return reportData.daily_records.map((record, index, arr) => {
      // If this is the last record and represents live data, blend live simulation values
      if (index === arr.length - 1) {
        if (period === 'daily') {
          return {
            ...record,
            solar_kwh: Math.round(simState.solarOutput * 0.15) || record.solar_kwh,
            wind_kwh: Math.round(simState.windOutput * 0.15) || record.wind_kwh,
            diesel_kwh: Math.round(simState.dieselOutput * 0.15) || record.diesel_kwh,
            load_kwh: Math.round(simState.gridLoad * 0.15) || record.load_kwh,
            resilience: simState.resilienceScore || record.resilience,
          };
        } else if (period === 'weekly') {
          return {
            ...record,
            solar_kwh: Math.round(simState.solarOutput * 1.8) || record.solar_kwh,
            wind_kwh: Math.round(simState.windOutput * 1.8) || record.wind_kwh,
            diesel_kwh: Math.round(simState.dieselOutput * 1.8) || record.diesel_kwh,
            load_kwh: Math.round(simState.gridLoad * 1.8) || record.load_kwh,
            resilience: simState.resilienceScore || record.resilience,
          };
        } else if (period === 'monthly') {
          return {
            ...record,
            solar_kwh: 3510 + (Math.round(simState.solarOutput * 4) || 0),
            wind_kwh: 2590 + (Math.round(simState.windOutput * 4) || 0),
            diesel_kwh: (Math.round(simState.dieselOutput * 4) || 0),
            load_kwh: 5720 + (Math.round(simState.gridLoad * 4) || 0),
            resilience: simState.resilienceScore || record.resilience,
          };
        }
      }
      return record;
    });
  };

  const displayRecords = getDisplayRecords();

  const handleExportCSV = () => {
    setExporting(true);
    const headers = ['Date/Period', 'Solar Generation (kWh)', 'Wind Generation (kWh)', 'Diesel Backup (kWh)', 'Total Load (kWh)', 'Resilience Score'];
    const rows = displayRecords.map((r) => [r.date, r.solar_kwh, r.wind_kwh, r.diesel_kwh, r.load_kwh, r.resilience]);
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

  const s = reportData.summary || {
    total_consumption_kwh: 6552,
    total_renewable_kwh: 7224,
    renewable_fraction_pct: 92.4,
    diesel_consumed_liters: 142,
    diesel_conserved_liters: 580,
    avg_resilience_score: 88.2,
  };

  const periodLabel = period === 'daily' ? t('reports.daily') : period === 'monthly' ? t('reports.monthly') : t('reports.weekly');

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#102B3B]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#EFFFFF] flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-[#48D5FF]" />
            {t('reports.title')}
          </h2>
          <p className="text-xs text-[#89A7B7] mt-1">
            {t('reports.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-[#0B1D29] border border-[#102B3B] rounded-lg p-1">
            {['daily', 'weekly', 'monthly'].map((p) => {
              const label = p === 'daily' ? t('reports.daily') : p === 'monthly' ? t('reports.monthly') : t('reports.weekly');
              const isActive = period === p;
              return (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#48D5FF] text-black font-extrabold shadow-md shadow-[#48D5FF]/20'
                      : 'text-[#89A7B7] hover:text-[#EFFFFF] hover:bg-[#102B3B]/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#299BD7]/20 border border-[#299BD7]/40 text-[#48D5FF] text-xs font-bold hover:bg-[#299BD7]/30 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? t('reports.exporting') : t('reports.exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg hover:border-[#48D5FF]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#89A7B7] uppercase">{t('reports.totalRenewable')}</span>
            <Sun className="w-4 h-4 text-[#48D5FF]" />
          </div>
          <p className="text-2xl font-black text-[#EFFFFF] font-mono mt-1">
            {(s.total_renewable_kwh).toLocaleString()}{' '}
            <span className="text-xs font-normal text-[#89A7B7]">kWh</span>
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-[#35D47A] font-semibold">{t('reports.zeroCarbon')}</p>
            <span className="text-[10px] font-mono text-[#89A7B7] capitalize">({period})</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg hover:border-[#35D47A]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#89A7B7] uppercase">{t('reports.renewableFraction')}</span>
            <TrendingUp className="w-4 h-4 text-[#35D47A]" />
          </div>
          <p className="text-2xl font-black text-[#35D47A] font-mono mt-1">
            {s.renewable_fraction_pct ? `${s.renewable_fraction_pct}%` : (simState.dieselOutput > 0 ? '78.4%' : '94.2%')}
          </p>
          <p className="text-[10px] text-[#89A7B7] mt-1">{t('reports.target')}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg hover:border-[#FFA000]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#89A7B7] uppercase">{t('reports.dieselConserved')}</span>
            <Fuel className="w-4 h-4 text-[#FFA000]" />
          </div>
          <p className="text-2xl font-black text-[#FFA000] font-mono mt-1">
            {s.diesel_conserved_liters}{' '}
            <span className="text-xs font-normal text-[#89A7B7]">Liters</span>
          </p>
          <p className="text-[10px] text-[#35D47A] mt-1">{t('reports.co2Saved')}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1D29] border border-[#102B3B] shadow-lg hover:border-[#35D47A]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#89A7B7] uppercase">{t('reports.resilienceScore')}</span>
            <ShieldCheck className="w-4 h-4 text-[#35D47A]" />
          </div>
          <p className="text-2xl font-black text-[#EFFFFF] font-mono mt-1">
            {s.avg_resilience_score || simState.resilienceScore || 92} <span className="text-xs font-bold text-[#89A7B7]">/ 100</span>
          </p>
          <p className="text-[10px] text-[#35D47A] mt-1">{t('reports.safeMargin')}</p>
        </div>
      </div>

      {/* DEDICATED DIGITAL TWIN SIMULATION RUNS & AUDIT LOG */}
      <div className="p-5 rounded-2xl bg-[#0B1D29] border border-[#102B3B] shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#102B3B]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#48D5FF]" />
            <h3 className="text-sm font-extrabold text-[#EFFFFF] uppercase tracking-wider">
              {t('reports.tableTitle')}
            </h3>
          </div>
          <span className="text-xs font-mono text-[#89A7B7]">{t('reports.liveRuns')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#102B3B] text-[#89A7B7] uppercase tracking-wider">
                <th className="py-2.5 px-3">{t('reports.colTime')}</th>
                <th className="py-2.5 px-3">{t('reports.colRun')}</th>
                <th className="py-2.5 px-3">{t('reports.colRenewable')}</th>
                <th className="py-2.5 px-3">{t('reports.colLoad')}</th>
                <th className="py-2.5 px-3">{t('reports.colDiesel')}</th>
                <th className="py-2.5 px-3">{t('reports.colStatus')}</th>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#EFFFFF] flex items-center gap-2 uppercase tracking-wider">
              <FileBarChart2 className="w-4 h-4 text-[#48D5FF]" />
              {t('reports.chartTitle')}
            </h3>
            <p className="text-xs text-[#89A7B7]">
              {t('reports.chartSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#102B3B] text-[#48D5FF] uppercase">
              {periodLabel} view
            </span>
          </div>
        </div>

        <div className="h-72 w-full relative">
          {loading && (
            <div className="absolute inset-0 bg-[#0B1D29]/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <RefreshCw className="w-6 h-6 text-[#48D5FF] animate-spin" />
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart key={period} data={displayRecords} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#102B3B" vertical={false} />
              <XAxis dataKey="date" stroke="#89A7B7" fontSize={11} tickLine={false} />
              <YAxis stroke="#89A7B7" fontSize={11} unit=" kWh" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#06131D',
                  borderColor: '#102B3B',
                  borderRadius: '0.5rem',
                  color: '#EFFFFF',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                }}
              />
              <Legend />
              <Bar dataKey="solar_kwh" name={t('reports.solarKwh')} stackId="a" fill="#FFD12A" radius={[0, 0, 0, 0]} />
              <Bar dataKey="wind_kwh" name={t('reports.windKwh')} stackId="a" fill="#299BD7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="diesel_kwh" name={t('reports.dieselKwh')} stackId="a" fill="#FFA000" radius={[0, 0, 0, 0]} />
              <Bar dataKey="load_kwh" name={t('reports.loadKwh')} fill="#48D5FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
