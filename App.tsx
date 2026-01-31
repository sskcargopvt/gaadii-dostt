
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Settings,
  Bell
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

/**
 * Custom Tooltip Component
 * Handles Desktop Hover and Mobile Long-press
 */
const NavTooltip: React.FC<{ 
  label: string; 
  children: React.ReactNode; 
  position?: 'right' | 'top' 
}> = ({ label, children, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleTouchStart = () => {
    timerRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 500); // Long press threshold
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setTimeout(() => setIsVisible(false), 1500); // Hide after a short delay on mobile
  };

  const positionClasses = {
    right: 'left-full ml-4 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2'
  };

  return (
    <div 
      className="relative flex items-center group w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[100] px-3 py-1.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-2xl border border-white/10 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in duration-200 ${positionClasses[position]}`}>
          {label}
          <div className={`absolute w-2 h-2 bg-slate-950 border-white/10 rotate-45 ${
            position === 'right' ? '-left-1 top-1/2 -translate-y-1/2 border-l border-b' : '-bottom-1 left-1/2 -translate-x-1/2 border-r border-b'
          }`} />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [activePanel, setActivePanel] = useState<AppPanel>(AppPanel.DASHBOARD);
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const t = useMemo(() => translations[lang], [lang]);

  // SEO: Update HTML Document Title and Metadata dynamically
  useEffect(() => {
    const panelTitle = t[activePanel as keyof typeof t] || 'Logistics';
    document.title = `${panelTitle} | Gadi Dost - Indian Transport Platform`;
    document.documentElement.lang = lang;
    
    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `Gadi Dost ${panelTitle}: The leading digital solution for Indian fleet management, truck booking, and highway safety.`);
    }
  }, [activePanel, lang, t]);

  // URL cleanup for Google Auth tokens on localhost
  useEffect(() => {
    const cleanHash = () => {
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('id_token'))) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: metadata.role || 'customer',
          name: metadata.full_name || metadata.name || session.user.email!.split('@')[0],
          phone: metadata.phone,
          businessName: metadata.businessName,
          address: metadata.address
        });
        cleanHash();
      } else {
        setUser(null);
        setActivePanel(AppPanel.DASHBOARD);
      }
      setInitializing(false);
    });
    
    cleanHash();
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
    ];
    if (user?.role === 'admin') {
      items.push({ id: AppPanel.ADMIN, label: t.admin, icon: Activity });
    }
    return items;
  }, [t, user?.role]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    if (!user) return null;
    switch (activePanel) {
      case AppPanel.DASHBOARD: return <DashboardHome onNavigate={setActivePanel} t={t} user={user} onLogout={handleLogout} />;
      case AppPanel.GPS: return <GPSSection t={t} />;
      case AppPanel.EMERGENCY: return <EmergencySection t={t} />;
      case AppPanel.BOOKING: return <BookingSection t={t} />;
      case AppPanel.BILTY: return <BiltySection t={t} />;
      case AppPanel.CALCULATOR: return <CalculatorSection t={t} />;
      case AppPanel.PROFILE: return <ProfileSection t={t} user={user} onUpdate={setUser} onLogout={handleLogout} />;
      case AppPanel.ADMIN: return <AdminSection t={t} user={user} />;
      default: return <DashboardHome onNavigate={setActivePanel} t={t} user={user} onLogout={handleLogout} />;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001f3f]" aria-busy="true">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[#a2d149]/20 border-t-[#a2d149] rounded-full animate-spin" />
          <p className="font-black text-[#a2d149] uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Secure Network...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthSection t={t} />;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-950'} transition-colors duration-300`}>
      <div className="flex flex-1 overflow-hidden relative text-slate-950 dark:text-white">
        {/* Desktop Sidebar Landmarks */}
        <aside className="hidden lg:flex w-72 flex-col bg-[#001f3f] text-white border-r border-white/5 shadow-2xl z-40 relative" role="navigation" aria-label="Main Navigation">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => setActivePanel(AppPanel.DASHBOARD)} aria-label="Gadi Dost Home">
              <div className="bg-[#a2d149] p-2.5 rounded-xl shadow-lg shadow-[#a2d149]/20 group-hover:rotate-12 transition-transform">
                <Truck size={24} strokeWidth={3} className="text-[#001f3f]" />
              </div>
              <h1 className="font-black text-2xl tracking-tighter uppercase italic">GADI <span className="text-[#a2d149]">DOST</span></h1>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavTooltip key={item.id} label={item.label} position="right">
                  <button
                    onClick={() => setActivePanel(item.id)}
                    aria-current={activePanel === item.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      activePanel === item.id 
                        ? 'bg-[#a2d149] text-[#001f3f] shadow-xl shadow-[#a2d149]/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} strokeWidth={2.5} aria-hidden="true" /> {item.label}
                  </button>
                </NavTooltip>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8 space-y-4">
            <button onClick={toggleLang} className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-[10px] font-black uppercase text-[#a2d149] bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
              <Languages size={16} /> {lang === 'en' ? 'हिन्दी VERSION' : 'ENGLISH MODE'}
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-[10px] font-black uppercase text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/20 transition-all">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Area Landmark */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 px-6 lg:px-10 flex items-center justify-between z-30 shadow-sm" role="banner">
            <div className="lg:hidden flex items-center gap-3">
               <div className="bg-[#a2d149] p-1.5 rounded-lg">
                <Truck size={18} strokeWidth={3} className="text-[#001f3f]" />
              </div>
              <h1 className="font-black text-lg uppercase italic">GADI <span className="text-[#a2d149]">DOST</span></h1>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Network Status: <span className="text-emerald-500 ml-1">Operational</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={toggleDarkMode} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all" aria-label="Toggle Dark Mode">
                {darkMode ? <Sun size={18} className="text-[#a2d149]" /> : <Moon size={18} className="text-slate-600" />}
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-2" />
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActivePanel(AppPanel.PROFILE)} aria-label="View Profile">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase tracking-tight leading-none mb-1.5">{user.name}</p>
                  <div className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    user.role === 'admin' ? 'bg-red-500 text-white' : 
                    user.role === 'transporter' ? 'bg-[#a2d149] text-[#001f3f] shadow-sm' : 
                    'bg-indigo-600 text-white shadow-sm'
                  }`}>
                    {user.role}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#001f3f] flex items-center justify-center text-white border-2 border-[#a2d149] shadow-lg group">
                  <UserIcon size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth" role="main">
            <div className="max-w-7xl mx-auto pb-24 lg:pb-0">
              {renderContent()}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-2 z-50 safe-area-bottom" aria-label="Mobile Bottom Navigation">
           {[
             { id: AppPanel.DASHBOARD, icon: LayoutDashboard, label: 'Dash' },
             { id: AppPanel.GPS, icon: Navigation, label: 'GPS' },
             { id: AppPanel.BOOKING, icon: Truck, label: 'Book' },
             { id: AppPanel.BILTY, icon: FileText, label: 'Bilty' },
             { id: AppPanel.EMERGENCY, icon: ShieldAlert, label: 'RSA' },
           ].map((item) => (
             <NavTooltip key={item.id} label={translations[lang][item.id as keyof typeof translations['en']]} position="top">
               <button
                 onClick={() => setActivePanel(item.id)}
                 aria-label={item.label}
                 aria-current={activePanel === item.id ? 'page' : undefined}
                 className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${
                   activePanel === item.id 
                    ? 'text-[#a2d149] bg-[#a2d149]/10' 
                    : 'text-slate-400'
                 }`}
               >
                 <item.icon size={22} strokeWidth={activePanel === item.id ? 3 : 2} aria-hidden="true" />
                 <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
               </button>
             </NavTooltip>
           ))}
        </nav>
      </div>
    </div>
  );
};

export default App;
