
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Truck,
  MapPin,
  Shield,
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
  Bell,
  UserCheck,
  Link as LinkIcon,
  Sparkles,
  Zap
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
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const t = useMemo(() => translations[lang], [lang]);

  // SEO: Dynamic Document Title & Meta Management
  useEffect(() => {
    const panelKey = activePanel.toLowerCase();
    const panelTitle = t[panelKey as keyof typeof t] || 'Logistics';
    document.title = `${panelTitle} | Gadi Dost - India's Premier Fleet Platform`;
    document.documentElement.lang = lang;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const descriptions: Record<string, string> = {
        dashboard: "Gadi Dost Command Center: Manage logistics business with real-time analytics and fleet connectivity.",
        gps: "Gadi Dost GPS: High-precision fleet tracking sensors for Indian transporters.",
        emergency: "Gadi Dost RSA: 24/7 Highway emergency assistance for trucks across India.",
        booking: "Gadi Dost Booking: Find and book verified trucks and trailers across India.",
        bilty: "Gadi Dost Bilty: Secure digital document management for transport bilty.",
        calculator: "Gadi Dost AI Calculator: Instant load estimation and trip cost forecasting."
      };
      metaDesc.setAttribute('content', descriptions[panelKey] || "Gadi Dost: India's premier logistics tech platform.");
    }
  }, [activePanel, lang, t]);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: metadata.role || 'customer',
          name: metadata.full_name || metadata.name || session.user.email!.split('@')[0],
          phone: metadata.phone,
          businessName: metadata.business_name || metadata.businessName || metadata.shop_name,
          address: metadata.address,
          bilty_linked: metadata.bilty_linked || false,
          bilty_token: metadata.bilty_token
        });
      } else {
        setUser(null);
        setActivePanel(AppPanel.DASHBOARD);
      }
      setInitializing(false);
    });

    // Initial session check
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: metadata.role || 'customer',
          name: metadata.full_name || metadata.name || session.user.email!.split('@')[0],
          phone: metadata.phone,
          businessName: metadata.businessName,
          address: metadata.address,
          bilty_linked: metadata.bilty_linked || false,
          bilty_token: metadata.bilty_token
        });
      }
      setInitializing(false);
    };
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'hi' : 'en');
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navItems = useMemo(() => {
    const items = [
      { id: AppPanel.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
      { id: AppPanel.GPS, label: t.gps, icon: MapPin },
      { id: AppPanel.EMERGENCY, label: t.emergency, icon: Shield },
      { id: AppPanel.BOOKING, label: t.booking, icon: Truck },
      { id: AppPanel.BILTY, label: t.bilty, icon: FileText },
      { id: AppPanel.CALCULATOR, label: t.calculator, icon: Sparkles },
      { id: AppPanel.PROFILE, label: t.profile, icon: Settings },
    ];
    if (user?.role === 'admin') items.push({ id: AppPanel.ADMIN, label: t.admin, icon: Zap });
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
      case AppPanel.BILTY: return <BiltySection t={t} user={user} onUpdate={setUser} />;
      case AppPanel.CALCULATOR: return <CalculatorSection t={t} />;
      case AppPanel.PROFILE: return <ProfileSection t={t} user={user} onUpdate={setUser} onLogout={handleLogout} />;
      case AppPanel.ADMIN: return <AdminSection t={t} user={user} />;
      default: return <DashboardHome onNavigate={setActivePanel} t={t} user={user} onLogout={handleLogout} />;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="font-black text-white uppercase tracking-[0.3em] text-[10px] animate-pulse drop-shadow-lg">Syncing Cloud Network...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthSection t={t} />;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0a0a0f] text-slate-100' : 'bg-[#f8f9ff] text-slate-950'} transition-colors duration-300`}>
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col text-white border-r border-white/10 shadow-2xl z-40 relative" style={{ background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => setActivePanel(AppPanel.DASHBOARD)}>
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl group-hover:bg-white/30 transition-all shadow-lg">
                <Truck size={24} strokeWidth={3} className="text-white" />
              </div>
              <h1 className="font-black text-2xl tracking-tighter uppercase">GADI <span className="text-white drop-shadow-lg">DOST</span></h1>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activePanel === item.id
                      ? 'bg-white text-indigo-600 shadow-xl shadow-black/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <item.icon size={18} strokeWidth={2.5} /> {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8 space-y-4">
            {user.bilty_linked && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex items-center gap-3 mb-2 animate-in">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
                <span className="text-[9px] font-black uppercase text-white tracking-widest">Bilty Book Connected</span>
              </div>
            )}
            <button onClick={toggleLang} className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black uppercase text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm">
              <Languages size={16} /> {lang === 'en' ? 'HINDI VERSION' : 'ENGLISH MODE'}
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black uppercase text-white bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 transition-all backdrop-blur-sm">
              <LogOut size={16} /> SIGN OUT
            </button>
          </div>
        </aside>

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 px-6 lg:px-10 flex items-center justify-between z-30 shadow-sm safe-area-top" role="banner">
            <div className="lg:hidden flex items-center gap-2">
              <div className="p-1.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Truck size={18} strokeWidth={3} className="text-white" />
              </div>
              <h1 className="font-black text-lg uppercase tracking-tighter">GADI <span className="gradient-text">DOST</span></h1>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-lg shadow-cyan-500/50" />
                Network: <span className="text-cyan-500">Live & Encrypted</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={toggleDarkMode} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all" aria-label="Toggle Night Mode">
                {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />
              <div className="flex items-center gap-3 cursor-pointer p-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all" onClick={() => setActivePanel(AppPanel.PROFILE)}>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase tracking-tight leading-none mb-1.5">{user.name}</p>
                  <div className={`inline-block px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-[0.1em] border ${user.role === 'admin'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400'
                      : user.role === 'transporter'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-400'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400'
                    }`}>
                    {user.role}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white border-2 border-indigo-400 shadow-lg group" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <UserIcon size={20} className="group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth no-scrollbar" role="main">
            <div className="max-w-7xl mx-auto pb-32 lg:pb-0">
              {renderContent()}
            </div>
          </main>
        </div>

        {/* Mobile Navigation Interface */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-18 glass-nav border border-white/20 dark:border-white/10 flex items-center justify-around px-2 z-50 rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] safe-area-bottom">
          {[
            { id: AppPanel.DASHBOARD, icon: LayoutDashboard, label: 'Home' },
            { id: AppPanel.GPS, icon: MapPin, label: 'GPS' },
            { id: AppPanel.BOOKING, icon: Truck, label: 'Book' },
            { id: AppPanel.BILTY, icon: FileText, label: 'Bilty' },
            { id: AppPanel.EMERGENCY, icon: Shield, label: 'SOS' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 px-3 py-2 rounded-2xl transition-all active:scale-90 ${activePanel === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                }`}
            >
              <item.icon size={22} strokeWidth={activePanel === item.id ? 3 : 2} />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default App;
