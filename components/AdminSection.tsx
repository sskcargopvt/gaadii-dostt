
import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Activity,
  BarChart3,
  Settings,
  Truck,
  Bell,
  Search,
  Database,
  Cloud,
  CheckCircle2,
  Lock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  ComposedChart,
  Legend
} from 'recharts';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface AdminSectionProps {
  t: any;
  user: User;
}

const data = [
  { name: 'Mon', revenue: 0, bookings: 0 },
  { name: 'Tue', revenue: 0, bookings: 0 },
  { name: 'Wed', revenue: 0, bookings: 0 },
  { name: 'Thu', revenue: 0, bookings: 0 },
  { name: 'Fri', revenue: 0, bookings: 0 },
  { name: 'Sat', revenue: 0, bookings: 0 },
  { name: 'Sun', revenue: 0, bookings: 0 },
];

const AdminSection: React.FC<AdminSectionProps> = ({ t, user }) => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { error } = await supabase.from('vehicles').select('id').limit(1);
        if (error && error.message.includes('fetch')) {
          setDbStatus('error');
        } else {
          setDbStatus('connected');
        }
      } catch (e) {
        setDbStatus('error');
      }
    };
    checkSupabase();
  }, []);

  if (user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10 animate-in fade-in zoom-in">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mb-8 shadow-2xl">
          <Lock size={48} strokeWidth={3} />
        </div>
        <h2 className="text-4xl font-black text-slate-950 dark:text-white mb-4 tracking-tighter uppercase">Access Denied</h2>
        <p className="text-slate-500 text-xl font-medium max-w-md">
          Administrative controls are strictly restricted to authorized personnel. Your attempt has been logged.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold italic uppercase tracking-tighter">{t.admin}</h2>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${dbStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
              {dbStatus === 'connected' ? <CheckCircle2 size={12} /> : <Cloud size={12} />}
              Supabase {dbStatus}
            </div>
          </div>
          <p className="text-slate-500 font-bold">System control and business intelligence dashboard.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 px-6 py-3 rounded-2xl font-black uppercase italic tracking-widest text-[10px] flex items-center gap-2">
            <Settings size={18} /> Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Users", value: "0", icon: Users, trend: "0%", color: "blue" },
          { label: "Verified Drivers", value: "0", icon: ShieldCheck, trend: "0%", color: "green" },
          { label: "Live Trips", value: "0", icon: Truck, trend: "Stable", color: "amber" },
          { label: "Revenue (M)", value: "₹0.0", icon: BarChart3, trend: "0%", color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                  stat.color === 'green' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                    stat.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                }`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black mt-1 italic leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Business Velocity</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Revenue vs. Booking Density</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-950 dark:bg-white" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Bookings</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    label={{ value: 'Bookings', angle: 90, position: 'insideRight', offset: 10, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#0f172a', color: '#fff' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                    cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Revenue"
                    radius={[8, 8, 0, 0]}
                    barSize={32}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#f59e0b" />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#020617"
                    strokeWidth={4}
                    dot={{ fill: '#020617', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase italic tracking-tight">Cloud Audit Logs</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Filter logs..." className="bg-slate-50 dark:bg-slate-900 border-0 rounded-xl py-2 pl-10 text-[10px] font-bold uppercase focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-black text-slate-400">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Commission</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Empty or initial logs only */}
                </tbody>
              </table>
              <div className="p-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                No active audit logs detected in the current session.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-950 p-6 md:p-10 rounded-[48px] text-white relative overflow-hidden">
            <h3 className="text-xl font-black italic uppercase tracking-tight mb-8 flex items-center gap-3">
              <Activity className="text-amber-500" size={24} />
              Health Matrix
            </h3>
            <div className="space-y-8">
              {[
                { label: "Cloud Sync", val: 100 },
                { label: "Server Load", val: 0 },
                { label: "API Latency", val: 0 },
                { label: "GPS Sync Rate", val: 100 },
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-amber-500">{item.val}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full shadow-[0_0_8px_#f59e0b]" style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 italic">
              Detailed Diagnostics
            </button>
            <Activity className="absolute -right-12 -bottom-12 opacity-5 rotate-12" size={250} />
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm group">
            <h3 className="font-black italic uppercase tracking-tight text-sm mb-6">Dispatch Momentum</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={4} dot={{ fill: '#f59e0b', r: 5 }} activeDot={{ r: 8 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', background: '#020617', color: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-center text-slate-400 mt-6 group-hover:text-amber-500 transition-colors">Growth in weekly partnership onboarding</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
