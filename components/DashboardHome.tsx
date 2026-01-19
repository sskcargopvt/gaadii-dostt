
import React from 'react';
import { 
  Navigation, 
  ShieldAlert, 
  Truck, 
  FileText, 
  Calculator, 
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { AppPanel, User } from '../types';

interface DashboardHomeProps {
  onNavigate: (panel: AppPanel) => void;
  t: any;
  user: User;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, t, user }) => {
  const cards = [
    { id: AppPanel.GPS, title: t.gps, icon: Navigation, color: "from-blue-700 to-indigo-600", desc: "Track fleet and monitor vehicle sensors." },
    { id: AppPanel.EMERGENCY, title: t.emergency, icon: ShieldAlert, color: "from-red-700 to-orange-600", desc: "Instant roadside dispatch within 30 mins." },
    { id: AppPanel.BOOKING, title: t.booking, icon: Truck, color: "from-orange-600 to-amber-500", desc: "Real-time truck load marketplace." },
    { id: AppPanel.BILTY, title: t.bilty, icon: FileText, color: "from-emerald-700 to-teal-600", desc: "Secure digital document control center." },
    { id: AppPanel.CALCULATOR, title: t.calculator, icon: Calculator, color: "from-purple-700 to-indigo-600", desc: "AI-powered trip cost estimations." },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-6xl font-black tracking-tighter text-slate-950 dark:text-white uppercase leading-none mb-2">{t.welcomeUser.replace('{name}', user.name)}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-2xl font-bold tracking-tight">{t.tagline}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-slate-950 text-white p-10 rounded-[48px] shadow-2xl flex items-center gap-8 group hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="bg-orange-500 p-6 rounded-[32px] shadow-2xl shadow-orange-500/20">
              <TrendingUp className="text-white" size={42} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm text-orange-500 font-black uppercase tracking-[0.2em] mb-2">Fleet Status</p>
              <p className="text-5xl font-black">12 / 15 <span className="text-lg opacity-40 font-medium ml-2">RUNNING</span></p>
            </div>
            <ChevronRight className="ml-auto text-orange-500 group-hover:translate-x-2 transition-transform" size={32} strokeWidth={3} />
          </div>
          <div className="bg-white dark:bg-slate-900 text-slate-950 dark:text-white p-10 rounded-[48px] shadow-2xl border-4 border-slate-950 dark:border-slate-800 flex items-center gap-8 group hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="bg-slate-950 dark:bg-slate-800 p-6 rounded-[32px] shadow-2xl">
              <Clock className="text-white" size={42} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Pending Jobs</p>
              <p className="text-5xl font-black text-slate-950 dark:text-white">04 <span className="text-lg opacity-40 font-medium ml-2">TASKS</span></p>
            </div>
            <ChevronRight className="ml-auto text-slate-300 group-hover:translate-x-2 transition-transform" size={32} strokeWidth={3} />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="group relative bg-white dark:bg-slate-900 p-10 rounded-[56px] shadow-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-slate-950 dark:hover:border-orange-500 transition-all text-left overflow-hidden hover:-translate-y-3 duration-500"
          >
            <div className={`bg-gradient-to-br ${card.color} w-24 h-24 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
              <card.icon size={48} strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black mb-4 text-slate-950 dark:text-white tracking-tight leading-none group-hover:text-orange-600 transition-colors uppercase">{card.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg mb-8 leading-snug h-14 line-clamp-2">{card.desc}</p>
            <div className="flex items-center text-slate-950 dark:text-orange-500 font-black text-xs uppercase tracking-widest border-t-2 border-slate-50 dark:border-slate-800 pt-6">
              Access Tool <ChevronRight size={20} strokeWidth={3} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        ))}
         <button
            onClick={() => onNavigate(AppPanel.EMERGENCY)}
            className="group relative bg-slate-950 p-12 rounded-[64px] shadow-2xl border-none text-white text-left overflow-hidden hover:-translate-y-2 duration-300 md:col-span-2 lg:col-span-3"
          >
            <div className="relative z-10">
              <div className="bg-orange-500 w-24 h-24 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl shadow-orange-500/40 group-hover:scale-110 transition-transform">
                <ShieldAlert size={48} strokeWidth={3} />
              </div>
              <h3 className="text-6xl font-black mb-6 tracking-tighter leading-none uppercase">Need Highway Rescue?</h3>
              <p className="text-slate-400 text-2xl font-bold max-w-3xl mb-12 leading-relaxed">Instantly request verified highway mechanics, fuel delivery, or 20-ton tow trucks with one-tap emergency dispatch.</p>
              <div className="inline-flex items-center bg-orange-500 text-white px-12 py-6 rounded-[32px] font-black text-2xl shadow-2xl shadow-orange-500/40 hover:bg-orange-600 transition-all active:scale-95">
                START EMERGENCY RESCUE <ArrowRight size={32} strokeWidth={3} className="ml-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            <ShieldAlert size={400} className="absolute -right-20 -bottom-20 opacity-5 rotate-12 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          </button>
      </div>
    </div>
  );
};

export default DashboardHome;
