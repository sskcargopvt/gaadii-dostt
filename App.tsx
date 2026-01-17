
import React, { useState, useEffect } from 'react';
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

  const t = translations[lang];

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
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Truck size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-amber-600 dark:text-amber-500">{t.appName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleLang}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium"
          >
            <Languages size={16} />
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <User size={20} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col`}>
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <h2 className="font-bold text-lg">{t.appName}</h2>
            <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePanel(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activePanel === item.id 
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Logged in as</p>
            <p className="text-sm font-semibold">Rajesh Transport Co.</p>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-2 py-3 lg:hidden flex justify-around safe-area-bottom z-30">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activePanel === item.id ? 'text-amber-500' : 'text-slate-400'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
