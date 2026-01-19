
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
  Cell
} from 'recharts';
import { supabase } from '../services/supabaseClient';

const data = [
  { name: 'Mon', revenue: 45000, bookings: 12 },
  { name: 'Tue', revenue: 52000, bookings: 19 },
  { name: 'Wed', revenue: 38000, bookings: 15 },
  { name: 'Thu', revenue: 65000, bookings: 22 },
  { name: 'Fri', revenue: 48000, bookings: 18 },
  { name: 'Sat', revenue: 72000, bookings: 28 },
  { name: 'Sun', revenue: 55000, bookings: 20 },
];

const AdminSection: React.FC<{ t: any }> = ({ t }) => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndSupabase = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserRole(session?.user?.user_metadata?.role || null);

      try {
        const { error } = await supabase.from('gps_requests').select('id').limit(1);
        if (error && error.message.includes('fetch')) {
          setDbStatus('error');
        } else {
          setDbStatus('connected');
        }
      } catch (e) {
        setDbStatus('error');
      }
    };
    checkAuthAndSupabase();
  }, []);

  if (userRole !== 'admin') {
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
            <h2 className="text-3xl font-bold">{t.admin}</h2>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              dbStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {dbStatus === 'connected' ? <CheckCircle2 size={12} /> : <Cloud size={12} />}
              Supabase {dbStatus}
            </div>
          </div>
          <p className="text-slate-500">System control and business intelligence dashboard.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <Settings size={18} /> Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Users", value: "2,481", icon: Users, trend: "+12%", color: "blue" },
          { label: "Verified Drivers", value: "852", icon: ShieldCheck, trend: "+5%", color: "green" },
          { label: "Live Trips", value: "142", icon: Truck, trend: "Stable", color: "amber" },
          { label: "Revenue (M)", value: "₹4.8", icon: BarChart3, trend: "+18%", color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`bg-${stat.color}-100 dark:bg-${stat.color}-900/30 p-3 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-bold mb-8">Revenue Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#1e293b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">Recent Cloud Events</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search logs..." className="bg-slate-50 dark:bg-slate-900 border-0 rounded-xl py-2 pl-10 text-xs focus:ring-2 focus:ring-amber-500" />
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
                  {[
                    { id: "#TR-990", partner: "Express Logistics", type: "Heavy Load", comm: "₹1,200", status: "Processed" },
                    { id: "#EM-442", partner: "Roadside Rescue", type: "Emergency", comm: "₹450", status: "Pending" },
                    { id: "#TR-991", partner: "V-Trans", type: "GPS Install", comm: "₹600", status: "Processed" },
                    { id: "#TR-992", partner: "National Carriers", type: "Truck Booking", comm: "₹2,100", status: "Processed" },
                  ].map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 font-bold">{log.id}</td>
                      <td className="px-6 py-4">{log.partner}</td>
                      <td className="px-6 py-4">{log.type}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">{log.comm}</td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${log.status === 'Processed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {log.status}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-3xl text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="text-amber-500" size={20} />
              System Health
            </h3>
            <div className="space-y-6">
              {[
                { label: "Cloud Sync", val: 100 },
                { label: "Server Load", val: 42 },
                { label: "API Latency", val: 12 },
                { label: "GPS Sync Rate", val: 99 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-bold">{item.val}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{width: `${item.val}%`}} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl text-xs font-bold uppercase tracking-widest">
              Detailed Diagnostics
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold mb-4">Partner Distribution</h3>
            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data}>
                   <Line type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={3} dot={{fill: '#f59e0b', r: 4}} />
                   <Tooltip />
                 </LineChart>
               </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500 mt-4">Growth in weekly partnership onboardings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
