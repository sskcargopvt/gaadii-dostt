
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Navigation, 
  ShieldAlert, 
  FileText, 
  Calculator, 
  LayoutDashboard, 
  Settings, 
  Menu, 
  X, 
  Languages, 
  Moon, 
  Sun,
  User,
  Activity
} from 'lucide-react';
import { translations } from './i18n.ts';
import { AppPanel, Language } from './types.ts';
import GPSSection from './components/GPSSection.tsx';
import EmergencySection from './components/EmergencySection.tsx';
import BookingSection from './components/BookingSection.tsx';
import CalculatorSection from './components/CalculatorSection.tsx';
import BiltySection from './components/BiltySection.tsx';
import AdminSection from './components/AdminSection.tsx';
import DashboardHome from './components/DashboardHome.tsx';

const App: React.FC = () => {
  const [activePanel, setActivePanel] = useState<AppPanel>(AppPanel.DASHBOARD);
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'hi' : 'en');
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navItems = [
    { id: AppPanel.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
    { id: AppPanel.GPS, label: t.gps, icon: Navigation },
    { id: AppPanel.EMERGENCY, label: t.emergency, icon: ShieldAlert },
    { id: AppPanel.BOOKING, label: t.booking, icon: Truck },
    { id: AppPanel.BILTY, label: t.bilty, icon: FileText },
    { id: AppPanel.CALCULATOR, label: t.calculator, icon: Calculator },
    { id: AppPanel.ADMIN, label: t.admin, icon: Activity },
  ];

  const renderContent = () => {
    switch (activePanel) {
      case AppPanel.DASHBOARD: return <DashboardHome onNavigate={setActivePanel} t={t} />;
      case AppPanel.GPS: return <GPSSection t={t} />;
      case AppPanel.EMERGENCY: return <EmergencySection t={t} />;
      case AppPanel.BOOKING: return <BookingSection t={t} />;
      case AppPanel.BILTY: return <BiltySection t={t} />;
      case AppPanel.CALCULATOR: return <CalculatorSection t={t} />;
      case AppPanel.ADMIN: return <AdminSection t={t} />;
      default: return <DashboardHome onNavigate={setActivePanel} t={t} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden active:scale-90 transition-transform"
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-1.5 rounded-lg shadow-sm shadow-amber-500/20">
              <Truck size={18} className="text-white" />
            </div>
            <h1 className="font-extrabold text-lg tracking-tight text-amber-600 dark:text-amber-500">{t.appName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={toggleLang}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            <Languages size={14} />
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-600/50 flex items-center justify-center overflow-hidden">
            <User size={16} className="text-slate-500" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-[60] w-64 transform lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col shadow-2xl lg:shadow-none`}>
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 p-1.5 rounded-lg">
                <Truck size={18} className="text-white" />
              </div>
              <span className="font-black text-amber-600">{t.appName}</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20} /></button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePanel(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activePanel === item.id 
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={18} className={activePanel === item.id ? 'text-amber-500' : 'text-slate-400'} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Partner Profile</p>
            <p className="text-sm font-bold truncate">Rajesh Transport Co.</p>
            <p className="text-[10px] text-slate-500">ID: GD-88219</p>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-1 pb-[env(safe-area-inset-bottom,12px)] pt-3 lg:hidden flex justify-around z-40">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`flex flex-col items-center gap-1.5 px-3 py-1 rounded-xl transition-all duration-300 ${
              activePanel === item.id ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activePanel === item.id ? 'bg-amber-50 dark:bg-amber-500/10' : ''}`}>
              <item.icon size={20} strokeWidth={activePanel === item.id ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tight ${activePanel === item.id ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
