
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
  Smartphone,
  LogOut
} from 'lucide-react';
import { AppPanel, User } from '../types';
import { supabase } from '../services/supabaseClient';

interface DashboardHomeProps {
  onNavigate: (panel: AppPanel) => void;
  t: any;
  user: User;
  onLogout: () => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, t, user, onLogout }) => {
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
      .channel('dash-updates-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const mainTools = [
    { id: AppPanel.GPS, title: t.gps, icon: Navigation, color: "bg-blue-600", border: "border-blue-500/10" },
    { id: AppPanel.BOOKING, title: t.booking, icon: Truck, color: "bg-[#a2d149]", border: "border-[#a2d149]/10", iconColor: "text-[#001f3f]" },
    { id: AppPanel.BILTY, title: t.bilty, icon: FileText, color: "bg-emerald-600", border: "border-emerald-500/10" },
    { id: AppPanel.CALCULATOR, title: t.calculator, icon: Calculator, color: "bg-indigo-600", border: "border-indigo-500/10" },
    { id: AppPanel.PROFILE, title: t.profile, icon: Settings, color: "bg-slate-700", border: "border-slate-500/10" },
  ];

  return (
    <div className="space-y-6 animate-in duration-500">
      {/* Dynamic SEO Welcome Header */}
      <section className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#a2d149] flex items-center justify-center text-[#001f3f] shadow-lg shadow-[#a2d149]/20">
              <UserIcon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-slate-950 dark:text-white">
                {user.name.split(' ')[0]} <span className="text-[#a2d149]">Dost</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: Operational</span>
                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <span className="text-[10px] font-black text-[#a2d149] uppercase tracking-widest leading-none">{user.role} Account</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onLogout} className="w-11 h-11 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center border border-red-100 dark:border-red-500/20 text-red-500 active:scale-90 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats Layer */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => onNavigate(AppPanel.GPS)} className="bg-slate-950 p-6 rounded-[32px] text-white shadow-xl cursor-pointer group relative overflow-hidden active:scale-95 transition-all">
          <TrendingUp size={20} className="text-orange-500 mb-4 relative z-10" />
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 relative z-10">Fleet Pulse</p>
          <p className="text-3xl font-black italic relative z-10 leading-none">{fleetStats.running}<span className="text-sm text-slate-500 ml-1 font-medium italic">/ {fleetStats.total}</span></p>
          <Activity size={80} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
        </div>

        <div onClick={() => onNavigate(AppPanel.BILTY)} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm cursor-pointer active:scale-95 transition-all relative overflow-hidden">
          <Clock size={20} className="text-indigo-500 mb-4" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">In-Transit</p>
          <p className="text-3xl font-black dark:text-white leading-none">0</p>
          <FileText size={80} className="absolute -right-6 -bottom-6 opacity-5 rotate-12" />
        </div>

        <div className="bg-[#a2d149] p-6 rounded-[32px] shadow-lg shadow-[#a2d149]/20 cursor-pointer active:scale-95 transition-all relative overflow-hidden" onClick={() => onNavigate(AppPanel.CALCULATOR)}>
          <Calculator size={20} className="text-[#001f3f] mb-4" />
          <p className="text-[10px] font-black uppercase text-slate-700 tracking-widest mb-1">Ledger Balance</p>
          <p className="text-3xl font-black text-[#001f3f] leading-none">₹0.0</p>
          <TrendingUp size={80} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hidden lg:block relative overflow-hidden">
          <Zap size={20} className="text-[#a2d149] mb-4" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Network Reliability</p>
          <p className="text-3xl font-black dark:text-white leading-none">100.0%</p>
        </div>
      </section>

      {/* Main Service Matrix */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-5">Business Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {mainTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="flex flex-col items-center justify-center p-5 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 shadow-sm active:scale-95 transition-all"
            >
              <div className={`${tool.color} w-14 h-14 rounded-2xl flex items-center justify-center ${tool.iconColor || 'text-white'} mb-3 shadow-md`}>
                <tool.icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{tool.title}</h3>
            </button>
          ))}
        </div>
      </section>

      {/* SOS / Rescue Highlight */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate(AppPanel.EMERGENCY)}
          className="w-full bg-[#001f3f] rounded-[40px] p-8 text-left relative overflow-hidden shadow-2xl active:scale-[0.98] transition-all"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="bg-red-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-red-600/30">
                <ShieldAlert size={32} strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-3">HIGHWAY<br/>RESCUE</h2>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">24/7 Roadside Assistance & Recovery</p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest pt-4 border-t border-white/5">
              EMERGENCY SOS <ArrowRight size={14} strokeWidth={3} />
            </div>
          </div>
          <ShieldAlert size={200} className="absolute -right-12 -bottom-12 opacity-5 rotate-12 pointer-events-none" />
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-white/5 flex flex-col justify-between active:scale-[0.98] transition-all overflow-hidden relative">
          <div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <Activity size={24} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">System Analytics</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Enterprise-grade fleet audit tools active.</p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[#a2d149] font-black text-[10px] uppercase tracking-widest pt-4 border-t border-slate-50 dark:border-white/5">
            GENERATE REPORT <ArrowRight size={14} />
          </div>
        </div>
      </section>

      {/* Cloud Status Footer */}
      <footer className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-[24px] p-3 flex items-center justify-between border border-white/20 dark:border-white/5">
        <div className="flex items-center gap-3 ml-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Secure Cloud Sync Active</span>
        </div>
        <button onClick={() => onNavigate(AppPanel.GPS)} className="px-5 py-2.5 bg-[#a2d149] text-[#001f3f] rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all">Live Tracking</button>
      </footer>
    </div>
  );
};

export default DashboardHome;
