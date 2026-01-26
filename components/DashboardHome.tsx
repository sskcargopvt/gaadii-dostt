
import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ShieldAlert, 
  Truck, 
  FileText, 
  Calculator, 
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Settings,
  User as UserIcon,
  Loader2,
  Activity,
  Zap,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { AppPanel, User } from '../types';
import { supabase } from '../services/supabaseClient';

interface DashboardHomeProps {
  onNavigate: (panel: AppPanel) => void;
  t: any;
  user: User;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, t, user }) => {
  const [fleetStats, setFleetStats] = useState({ total: 0, running: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('vehicles')
      .select('id, ignition')
      .eq('owner_id', session.user.id);

    if (!error && data) {
      setFleetStats({
        total: data.length,
        running: data.filter(v => v.ignition).length
      });
    }
    setLoadingStats(false);
  };

  useEffect(() => {
    fetchStats();
    const channel = supabase
      .channel('dash-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const mainTools = [
    { id: AppPanel.GPS, title: t.gps, icon: Navigation, color: "bg-blue-600", border: "border-blue-500/20" },
    { id: AppPanel.BOOKING, title: t.booking, icon: Truck, color: "bg-amber-600", border: "border-amber-500/20" },
    { id: AppPanel.BILTY, title: t.bilty, icon: FileText, color: "bg-emerald-600", border: "border-emerald-500/20" },
    { id: AppPanel.CALCULATOR, title: t.calculator, icon: Calculator, color: "bg-indigo-600", border: "border-indigo-500/20" },
    { id: AppPanel.PROFILE, title: t.profile, icon: Settings, color: "bg-slate-700", border: "border-slate-500/20" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Identity Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
            <UserIcon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase italic leading-none text-slate-950 dark:text-white">
              {user.name.split(' ')[0]} <span className="text-amber-500">Dost</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Network Active • {user.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Verified Partner</span>
            </div>
          </div>
          <button onClick={() => onNavigate(AppPanel.PROFILE)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 dark:border-white/5">
            <Settings size={18} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* KPI Stats Row (Horizontal & Vertical mix) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div onClick={() => onNavigate(AppPanel.GPS)} className="bg-slate-950 p-5 rounded-[28px] text-white shadow-xl cursor-pointer group relative overflow-hidden">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <TrendingUp size={18} className="text-orange-500" />
            {loadingStats ? <Loader2 size={12} className="animate-spin opacity-40" /> : <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
          </div>
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1 relative z-10">Fleet Pulse</p>
          <p className="text-2xl font-black italic relative z-10">{fleetStats.running}<span className="text-xs text-slate-500 ml-1">/ {fleetStats.total}</span></p>
          <Activity size={60} className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
        </div>

        <div onClick={() => onNavigate(AppPanel.BILTY)} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm cursor-pointer group relative overflow-hidden">
          <Clock size={18} className="text-indigo-500 mb-2" />
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Active Tasks</p>
          <p className="text-2xl font-black dark:text-white">04 <span className="text-xs text-slate-400 font-bold ml-1 uppercase">Pending</span></p>
          <FileText size={60} className="absolute -right-4 -bottom-4 opacity-5 dark:opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm hidden md:block relative overflow-hidden">
          <Zap size={18} className="text-amber-500 mb-2" />
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">System Uptime</p>
          <p className="text-2xl font-black dark:text-white">99.9<span className="text-xs text-slate-400 font-bold ml-1">%</span></p>
          <Smartphone size={60} className="absolute -right-4 -bottom-4 opacity-5 rotate-12" />
        </div>

        <div className="bg-amber-500 p-5 rounded-[28px] shadow-lg shadow-amber-500/20 relative overflow-hidden cursor-pointer group" onClick={() => onNavigate(AppPanel.CALCULATOR)}>
          <Calculator size={18} className="text-slate-900 mb-2" />
          <p className="text-[9px] font-black uppercase text-slate-700 tracking-widest mb-1">Trip Profit</p>
          <p className="text-2xl font-black text-slate-950">₹0.00</p>
          <TrendingUp size={60} className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Matrix */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {mainTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className={`group relative flex flex-col items-center justify-center p-6 rounded-[32px] bg-white dark:bg-slate-900 border ${tool.border} shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl duration-300`}
            >
              <div className={`${tool.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <tool.icon size={28} strokeWidth={2.5} />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{tool.title}</h4>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </button>
          ))}
          {/* Empty spacer or custom card to fill grid nicely */}
          <div className="hidden sm:flex p-6 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-white/5 flex-col items-center justify-center text-center">
            <Smartphone size={24} className="text-slate-200 mb-2" />
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">More Tools<br/>Coming Soon</p>
          </div>
        </div>

        {/* Emergency High-Priority Card */}
        <div className="lg:col-span-1">
          <button
            onClick={() => onNavigate(AppPanel.EMERGENCY)}
            className="w-full h-full bg-slate-900 dark:bg-red-950/20 rounded-[40px] p-8 text-left group relative overflow-hidden shadow-2xl border border-white/5 hover:bg-slate-950 transition-colors"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="bg-red-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-red-600/30 group-hover:rotate-12 transition-transform">
                  <ShieldAlert size={32} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-3">Roadside<br/>Rescue</h3>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest max-w-[160px] leading-relaxed">Verified dispatch within 30 mins</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest border-t border-white/5 pt-4">
                Deploy Help <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            <ShieldAlert size={200} className="absolute -right-12 -bottom-12 opacity-5 dark:opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          </button>
        </div>
      </div>

      {/* Quick Action Footer Strip */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-[24px] p-3 flex items-center justify-between border border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3 ml-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Global Network Online</span>
        </div>
        <div className="flex gap-2">
           <button onClick={() => onNavigate(AppPanel.BOOKING)} className="px-5 py-2 bg-white dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-100 transition-all">Quick Book</button>
           <button onClick={() => onNavigate(AppPanel.GPS)} className="px-5 py-2 bg-amber-500 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-amber-400 transition-all">Track Fleet</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
