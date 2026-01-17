
import React from 'react';
import { 
  Navigation, 
  ShieldAlert, 
  Truck, 
  FileText, 
  Calculator, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { AppPanel } from '../types';

interface DashboardHomeProps {
  onNavigate: (panel: AppPanel) => void;
  t: any;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, t }) => {
  const cards = [
    { id: AppPanel.GPS, title: t.gps, icon: Navigation, color: "bg-blue-500", desc: "Track, monitor and upgrade sensors." },
    { id: AppPanel.EMERGENCY, title: t.emergency, icon: ShieldAlert, color: "bg-red-500", desc: "Immediate roadside assistance 24/7." },
    { id: AppPanel.BOOKING, title: t.booking, icon: Truck, color: "bg-amber-500", desc: "Live Uber-like truck bookings." },
    { id: AppPanel.BILTY, title: t.bilty, icon: FileText, color: "bg-emerald-500", desc: "Manage digital bilty and documents." },
    { id: AppPanel.CALCULATOR, title: t.calculator, icon: Calculator, color: "bg-purple-500", desc: "Cost and load estimations." },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.welcome}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t.tagline}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Active Trucks</p>
              <p className="text-xl font-bold">12 / 15</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <Clock className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pending Trips</p>
              <p className="text-xl font-bold">4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="group relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-amber-500 transition-all text-left overflow-hidden"
          >
            <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
              <card.icon size={30} />
            </div>
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6">{card.desc}</p>
            <div className="flex items-center text-amber-600 dark:text-amber-400 font-semibold text-sm">
              Open Panel <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute -right-4 -bottom-4 text-slate-100 dark:text-slate-700/30 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform">
              <card.icon size={120} />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-amber-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-bold mb-4">Urgent Help Needed?</h2>
          <p className="text-amber-50 mb-6 text-lg">Quickly request roadside assistance, mechanics or towing services with one click.</p>
          <button 
            onClick={() => onNavigate(AppPanel.EMERGENCY)}
            className="bg-white text-amber-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-amber-50 transition-colors shadow-lg"
          >
            {t.emergencyBtn}
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center opacity-20">
          <ShieldAlert size={200} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
