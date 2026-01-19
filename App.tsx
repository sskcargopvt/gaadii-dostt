
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Navigation, 
  ShieldAlert, 
  FileText, 
  Calculator, 
  LayoutDashboard, 
  Menu, 
  X, 
  Languages, 
  Moon, 
  Sun,
  User as UserIcon,
  Activity,
  LogOut
} from 'lucide-react';
import { translations } from './i18n';
import { AppPanel, Language, User } from './types';
import GPSSection from './components/GPSSection';
import EmergencySection from './components/EmergencySection';
import BookingSection from './components/BookingSection';
import CalculatorSection from './components/CalculatorSection';
import BiltySection from './components/BiltySection';
import AdminSection from './components/AdminSection';
import DashboardHome from './components/DashboardHome';
import AuthSection from './components/AuthSection';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [activePanel, setActivePanel] = useState<AppPanel>(AppPanel.DASHBOARD);
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    // Check current session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata.role || 'customer',
          name: session.user.user_metadata.name || session.user.email!.split('@')[0]
        });
      }
      setInitializing(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata.role || 'customer',
          name: session.user.user_metadata.name || session.user.email!.split('@')[0]
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'hi' : 'en');
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Enforce role-based menu filtering
  const navItems = useMemo(() => {
    const items = [
      { id: AppPanel.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
      { id: AppPanel.GPS, label: t.gps, icon: Navigation },
      { id: AppPanel.EMERGENCY, label: t.emergency, icon: ShieldAlert },
      { id: AppPanel.BOOKING, label: t.booking, icon: Truck },
      { id: AppPanel.BILTY, label: t.bilty, icon: FileText },
      { id: AppPanel.CALCULATOR, label: t.calculator, icon: Calculator },
      { id: AppPanel.ADMIN, label: t.admin, icon: Activity },
    ];

    // Strictly restrict Admin Panel
    return items.filter(item => {
      if (item.id === AppPanel.ADMIN) return user?.role === 'admin';
      return true;
    });
  }, [t, user?.role]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setActivePanel(AppPanel.DASHBOARD);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activePanel) {
      case AppPanel.DASHBOARD: return <DashboardHome onNavigate={setActivePanel} t={t} user={user!} />;
      case AppPanel.GPS: return <GPSSection t={t} />;
      case AppPanel.EMERGENCY: return <EmergencySection t={t} />;
      case AppPanel.BOOKING: return <BookingSection t={t} />;
      case AppPanel.BILTY: return <BiltySection t={t} />;
      case AppPanel.CALCULATOR: return <CalculatorSection t={t} />;
      case AppPanel.ADMIN: return <AdminSection t={t} />;
      default: return <DashboardHome onNavigate={setActivePanel} t={t} user={user!} />;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthSection onLogin={handleLogin} t={t} />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-950'} transition-colors duration-300`}>
      <header className="sticky top-0 z-50 w-full backdrop-blur-3xl border-b-4 border-slate-950 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-6 h-24 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-slate-950 text-white rounded-2xl lg:hidden active:scale-90 transition-transform shadow-xl"
            aria-label="Open Menu"
          >
            <Menu size={24} strokeWidth={3} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-2xl shadow-2xl shadow-orange-500/30 transform rotate-3">
              <Truck size={32} strokeWidth={2.5} className="text-white" />
            </div>
            <h1 className="font-black text-3xl tracking-tighter uppercase text-slate-950 dark:text-white leading-none">{t.appName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl transition-all hover:bg-slate-950 hover:text-white group"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600 group-hover:text-white" />}
          </button>
          
          <div className="hidden sm:flex items-center gap-4 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
             <div className="text-right">
                <p className="text-[11px] font-black uppercase tracking-widest text-orange-500 leading-none mb-1">
                  {user.role}
                </p>
                <p className="font-black text-slate-950 dark:text-white text-xl leading-none tracking-tight">
                  {user.name}!
                </p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-slate-950 dark:bg-white flex items-center justify-center shadow-2xl border-2 border-white/10">
               <UserIcon size={28} strokeWidth={2.5} className="text-white dark:text-slate-950" />
             </div>
          </div>

          <button 
            onClick={handleLogout}
            className="p-3 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95 ml-2"
            aria-label="Sign Out"
          >
            <LogOut size={20} strokeWidth={3} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-[60] w-80 transform lg:translate-x-0 lg:static transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-slate-950 p-8 flex flex-col shadow-2xl`}>
          <div className="flex items-center justify-between mb-16 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2.5 rounded-xl">
                <Truck size={28} strokeWidth={3} className="text-white" />
              </div>
              <span className="font-black text-white text-3xl tracking-tighter uppercase">{t.appName}</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-white/10 text-white rounded-2xl hover:bg-red-600 transition-colors"><X size={24} strokeWidth={3} /></button>
          </div>

          <nav className="flex-1 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePanel(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-5 px-5 py-4.5 rounded-[20px] text-lg font-black uppercase tracking-tight transition-all duration-300 ${
                  activePanel === item.id 
                    ? 'bg-orange-500 text-white shadow-2xl shadow-orange-500/40 scale-[1.05] z-10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={28} strokeWidth={3} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-6">
            <button 
              onClick={toggleLang}
              className="w-full flex items-center gap-5 px-5 py-5 rounded-[20px] text-md font-black text-white hover:bg-white/10 transition-all border-2 border-white/5"
            >
              <Languages size={24} strokeWidth={3} className="text-orange-500" />
              {lang === 'en' ? 'HINDI VERSION' : 'ENGLISH VERSION'}
            </button>
          </div>
        </aside>

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[55] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-16 pb-32 lg:pb-16 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <nav className="fixed bottom-6 left-6 right-6 bg-slate-950 border border-white/10 rounded-[32px] shadow-2xl lg:hidden flex justify-around z-40 safe-area-bottom px-4 py-4">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activePanel === item.id ? 'scale-110' : 'opacity-40 hover:opacity-100'
            }`}
          >
            <div className={`p-4 rounded-[20px] transition-all ${activePanel === item.id ? 'bg-orange-500 text-white shadow-2xl shadow-orange-500/40' : 'text-white'}`}>
              <item.icon size={26} strokeWidth={3} />
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
