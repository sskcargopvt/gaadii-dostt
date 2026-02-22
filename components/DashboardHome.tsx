
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
  LogOut,
  Wrench,
  Sparkles
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
    { id: AppPanel.GPS, title: t.gps, icon: Navigation, gradient: "from-blue-500 via-blue-600 to-cyan-500", glow: "shadow-blue-500/50" },
    { id: AppPanel.EMERGENCY, title: "Mechanics", icon: Wrench, gradient: "from-red-500 via-red-600 to-orange-500", glow: "shadow-red-500/50" },
    { id: AppPanel.BOOKING, title: t.booking, icon: Truck, gradient: "from-[#a2d149] via-[#8bc34a] to-[#9ccc65]", glow: "shadow-[#a2d149]/50" },
    { id: AppPanel.BILTY, title: t.bilty, icon: FileText, gradient: "from-emerald-500 via-emerald-600 to-teal-500", glow: "shadow-emerald-500/50" },
    { id: AppPanel.CALCULATOR, title: t.calculator, icon: Calculator, gradient: "from-indigo-500 via-purple-600 to-pink-500", glow: "shadow-indigo-500/50" },
    { id: AppPanel.PROFILE, title: t.profile, icon: Settings, gradient: "from-slate-600 via-slate-700 to-slate-800", glow: "shadow-slate-500/50" },
  ];

  return (
    <div className="space-y-6 animate-in duration-500">
      {/* 3D Welcome Header with Glassmorphism */}
      <section className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#a2d149]/20 via-blue-500/20 to-purple-500/20 rounded-[32px] blur-xl group-hover:blur-2xl transition-all duration-500" />
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[32px] border border-white/20 dark:border-white/10 shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a2d149] to-[#7cb342] rounded-2xl blur-md group-hover/avatar:blur-lg transition-all" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a2d149] to-[#7cb342] flex items-center justify-center text-[#001f3f] shadow-2xl shadow-[#a2d149]/50 transform group-hover/avatar:scale-110 group-hover/avatar:rotate-3 transition-all duration-300">
                  <UserIcon size={28} strokeWidth={2.5} className="drop-shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#a2d149] to-slate-900 dark:from-white dark:via-[#a2d149] dark:to-white">
                  {user.name.split(' ')[0]} <span className="text-[#a2d149]">Dost</span>
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1">
                    <Sparkles size={10} className="text-emerald-500 animate-pulse" />
                    Status: Operational
                  </span>
                  <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <span className="text-[10px] font-black text-[#a2d149] uppercase tracking-widest leading-none">{user.role} Account</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onLogout} className="relative group/btn w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 active:scale-90 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <LogOut size={20} className="relative z-10" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bilty Book Card */}
      <section>
        <div onClick={() => onNavigate(AppPanel.BILTY)} className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-[32px] blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
          <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[32px] border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 min-h-[160px] flex items-center justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 flex items-center gap-6">
              <div className="relative group/icon">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl blur-md opacity-50 group-hover:blur-lg transition-all" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 transform group-hover:rotate-12 transition-transform duration-300">
                  <FileText size={40} className="text-white drop-shadow-lg" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                  {t.bilty}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] leading-none">
                    Digital Receipt Management
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 hidden md:flex items-center gap-3 bg-emerald-500/10 dark:bg-emerald-500/20 px-6 py-4 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest">Connect Bilty Book</span>
              <ArrowRight size={16} className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={3} />
            </div>

            <FileText size={180} className="absolute -right-12 -bottom-12 opacity-5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-500 text-emerald-500" />
          </div>
        </div>
      </section>

      {/* 3D Service Icons with Shining Effects */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-5 flex items-center gap-2">
          <Sparkles size={12} className="text-[#a2d149] animate-pulse" />
          Business Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mainTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="relative group"
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} rounded-[28px] blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500`} />

              {/* Card */}
              <div className="relative flex flex-col items-center justify-center p-6 rounded-[28px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl transform hover:scale-110 hover:-translate-y-2 active:scale-95 transition-all duration-300">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-[28px]" />

                {/* 3D Icon Container */}
                <div className="relative mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} rounded-2xl blur-md ${tool.glow}`} />
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${tool.gradient} rounded-2xl flex items-center justify-center text-white shadow-2xl ${tool.glow} transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
                    <tool.icon size={28} strokeWidth={2.5} className="drop-shadow-2xl" />
                    {/* Shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl" />
                  </div>
                </div>

                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white relative z-10">{tool.title}</h3>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3D Emergency Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highway Rescue - 3D */}
        <button
          onClick={() => onNavigate(AppPanel.EMERGENCY)}
          className="relative group w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-600 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-70 transition-all" />
          <div className="relative w-full bg-gradient-to-br from-[#001f3f] via-slate-900 to-[#001f3f] rounded-[40px] p-8 text-left overflow-hidden shadow-2xl transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 border border-white/10 h-full min-h-[280px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-600/20 to-transparent rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl blur-lg" />
                  <div className="relative bg-gradient-to-br from-red-600 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-red-600/50 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                    <ShieldAlert size={36} strokeWidth={3} className="drop-shadow-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-red-400 to-white italic tracking-tighter uppercase leading-none mb-3">HIGHWAY<br />RESCUE</h2>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">24/7 Roadside Assistance & Recovery</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest pt-4 border-t border-white/5">
                EMERGENCY SOS <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            <ShieldAlert size={220} className="absolute -right-12 -bottom-12 opacity-5 rotate-12 pointer-events-none" />
          </div>
        </button>

        {/* Mechanic Services - 3D */}
        <button
          onClick={() => onNavigate(AppPanel.EMERGENCY)}
          className="relative group w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 rounded-[40px] blur-2xl opacity-60 group-hover:opacity-80 transition-all" />
          <div className="relative bg-gradient-to-br from-red-600 via-orange-600 to-red-700 rounded-[40px] p-8 border border-red-400/30 flex flex-col justify-between overflow-hidden shadow-2xl shadow-red-600/40 text-left transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 h-full min-h-[280px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg" />
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white shadow-2xl border border-white/40 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Wrench size={32} strokeWidth={2.5} className="drop-shadow-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2 text-white leading-none drop-shadow-lg">MECHANIC<br />SERVICES</h2>
              <p className="text-red-100 text-[11px] font-black uppercase tracking-widest leading-relaxed">10 Professional Services • On-Site Repairs</p>
            </div>
            <div className="relative z-10 mt-8 flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest pt-4 border-t border-white/20">
              BOOK NOW <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </div>
            <Wrench size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12 pointer-events-none" />
          </div>
        </button>
      </section>

      {/* 3D Footer */}
      <footer className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-[24px] blur-lg group-hover:blur-xl transition-all" />
        <div className="relative bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-[24px] p-4 flex items-center justify-between border border-white/30 dark:border-white/10 shadow-xl">
          <div className="flex items-center gap-3 ml-2">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md animate-pulse" />
              <div className="relative w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
            <span className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-[0.2em]">Secure Cloud Sync Active</span>
          </div>
          <button onClick={() => onNavigate(AppPanel.GPS)} className="relative group/track">
            <div className="absolute inset-0 bg-gradient-to-r from-[#a2d149] to-[#7cb342] rounded-xl blur-md group-hover/track:blur-lg transition-all" />
            <div className="relative px-6 py-3 bg-gradient-to-r from-[#a2d149] to-[#7cb342] text-[#001f3f] rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#a2d149]/30 transform hover:scale-105 active:scale-95 transition-all">
              Live Tracking
            </div>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default DashboardHome;
