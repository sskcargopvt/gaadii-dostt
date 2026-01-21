
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
  LogOut,
  ShieldCheck,
  UserCircle,
  Star,
  Settings
} from 'lucide-react';
import { translations } from './i18n';
import { AppPanel, Language, User } from './types';
import GPSSection from './components/GPSSection';
import EmergencySection from './components/EmergencySection';
import BookingSection from './components/BookingSection';
import CalculatorSection from './components/CalculatorSection';
import BiltySection from './components/BiltySection';
import AdminSection from './components/AdminSection';
import ProfileSection from './components/ProfileSection';
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
    // Persistent auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Sync user metadata (role, name, etc.) from Supabase session
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: metadata.role || 'customer',
          // Extract name from Google metadata (full_name) or custom metadata (name)
          name: metadata.full_name || metadata.name || session.user.email!.split('@')[0],
          phone: metadata.phone,
          businessName: metadata.businessName,
          address: metadata.address
        });

        // FIX: Clean up the URL if it contains the access token hash from Google Login
        if (window.location.hash && window.location.hash.includes('access_token')) {
          // Use replaceState to clear the hash without refreshing the page
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        setUser(null);
        setActivePanel(AppPanel.DASHBOARD);
      }
      setInitializing(false);
    });
    
    // Initial session check
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) setInitializing(false);
    };
    checkInitialSession();

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

  const navItems = useMemo(() => {
    const items = [
      { id: AppPanel.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
      { id: AppPanel.GPS, label: t.gps, icon: Navigation },
      { id: AppPanel.EMERGENCY, label: t.emergency, icon: ShieldAlert },
      { id: AppPanel.BOOKING, label: t.booking, icon: Truck },
      { id: AppPanel.BILTY, label: t.bilty, icon: FileText },
      { id: AppPanel.CALCULATOR, label: t.calculator, icon: Calculator },
      { id: AppPanel.PROFILE, label: t.profile, icon: Settings },
      { id: AppPanel.ADMIN, label: t.admin, icon: Activity },
    ];
    // Restrict Admin Panel to 'admin' role
    return items.filter(item => item.id !== AppPanel.ADMIN || user?.role === 'admin');
  }, [t, user?.role]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    if (!user) return null;
    switch (activePanel) {
      case AppPanel.DASHBOARD: return <DashboardHome onNavigate={setActivePanel} t={t} user={user} />;
      case AppPanel.GPS: return <GPSSection t={t} />;
      case AppPanel.EMERGENCY: return <EmergencySection t={t} />;
      case AppPanel.BOOKING: return <BookingSection t={t} />;
      case AppPanel.BILTY: return <BiltySection t={t} />;
      case AppPanel.CALCULATOR: return <CalculatorSection t={t} />;
      case AppPanel.PROFILE: return <ProfileSection t={t} user={user} onUpdate={setUser} />;
      case AppPanel.ADMIN: return <AdminSection t={t} user={user} />;
      default: return <DashboardHome onNavigate={setActivePanel} t={t} user={user} />;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Authorizing Connection...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthSection t={t} />;

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-slate-900 text-white border-slate-900';
      case 'transporter': return 'bg-amber-500 text-slate-900 border-amber-600';
      default: return 'bg-sky-500 text-white border-sky-600';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-950'} transition-colors duration-300`}>
      <header className="sticky top-0 z-50 w-full backdrop-blur-3xl border-b-[4px] border-slate-900 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-6 h-20 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-900 text-white rounded-lg lg:hidden active:scale-90 transition-transform">
            <Menu size={20} strokeWidth={3} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg shadow-lg transform rotate-2">
              <Truck size={24} strokeWidth={2.5} className="text-slate-900" />
            </div>
            <div className="flex flex-col cursor-pointer" onClick={() => setActivePanel(AppPanel.DASHBOARD)}>
              <h1 className="font-bold text-xl tracking-tight uppercase text-slate-900 dark:text-white leading-none italic">{t.appName}</h1>
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Digital Highway</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="hidden sm:flex p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg transition-all">
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
             <div className="text-right hidden md:block">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border-b mb-0.5 ${getRoleStyle(user.role)}`}>
                  {user.role}
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm leading-none tracking-tight">{user.name}</p>
             </div>
             <button 
                onClick={() => setActivePanel(AppPanel.PROFILE)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border-2 transition-all overflow-hidden ${
                  activePanel === AppPanel.PROFILE 
                    ? 'bg-amber-500 border-slate-900 dark:border-white' 
                    : 'bg-slate-900 dark:bg-white border-transparent'
                }`}
             >
                <UserIcon size={22} className={activePanel === AppPanel.PROFILE ? 'text-slate-900' : 'text-white dark:text-slate-900'} />
             </button>
          </div>

          <button onClick={handleLogout} className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all">
            <LogOut size={18} strokeWidth={3} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-[60] w-64 transform lg:translate-x-0 lg:static transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-slate-900 p-5 flex flex-col shadow-2xl`}>
          <div className="flex items-center justify-between mb-10 lg:hidden">
            <h1 className="font-bold text-white text-xl tracking-tighter uppercase italic">{t.appName}</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/10 text-white rounded-lg"><X size={20} /></button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActivePanel(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-tight transition-all ${
                  activePanel === item.id 
                    ? 'bg-amber-500 text-slate-900 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} strokeWidth={2.5} /> {item.label}
              </button>
            ))}
          </nav>
          
          <button onClick={toggleLang} className="mt-auto w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-bold text-white bg-slate-800 border border-white/5">
            <Languages size={18} className="text-amber-500" />
            {lang === 'en' ? 'हिन्दी - HINDI' : 'ENGLISH VERSION'}
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
