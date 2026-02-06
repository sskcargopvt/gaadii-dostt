
import React, { useState } from 'react';
import { 
  ExternalLink, 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Link as LinkIcon, 
  Link2, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  Zap,
  Globe,
  ArrowRight,
  ShieldAlert,
  Info,
  X
} from 'lucide-react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface BiltySectionProps {
  t: any;
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const BiltySection: React.FC<BiltySectionProps> = ({ t, user, onUpdate }) => {
  const biltyUrl = 'https://www.biltybook.online/';
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [launchingSSO, setLaunchingSSO] = useState(false);

  const mockBilties = [
    { id: 'BL-8821', customer: 'Shree Cement Ltd', date: '22 Oct 2023', status: 'Delivered', weight: '22T' },
    { id: 'BL-8835', customer: 'Tata Steel', date: '24 Oct 2023', status: 'In Transit', weight: '15T' },
    { id: 'BL-8842', customer: 'Reliance Ind', date: '25 Oct 2023', status: 'Draft', weight: '18T' },
  ];

  const handleLinkBilty = async () => {
    setIsLinking(true);
    // Simulate SSO OIDC Handshake delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          bilty_linked: true,
          bilty_token: `GD_SSO_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
      });
      if (error) throw error;
      
      onUpdate({ ...user, bilty_linked: true });
    } catch (e) {
      console.error("Link failed", e);
    } finally {
      setIsLinking(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  const handleLaunchSSO = async () => {
    setLaunchingSSO(true);
    // Simulate generation of Magic Link / Session Token
    await new Promise(resolve => setTimeout(resolve, 1200));
    window.open(biltyUrl, '_blank');
    setLaunchingSSO(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-2">{t.bilty}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Cloud Enterprise Document Management</p>
        </div>
        <div className="flex items-center gap-3">
           {user.bilty_linked && (
             <button 
              onClick={handleManualSync}
              disabled={isSyncing}
              className="p-3.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-slate-500"
              title="Sync Cloud Data"
            >
              <RefreshCw size={20} className={isSyncing ? 'animate-spin text-amber-500' : ''} />
            </button>
           )}
          <button 
            onClick={user.bilty_linked ? handleLaunchSSO : handleLinkBilty}
            disabled={isLinking || launchingSSO}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 ${
              user.bilty_linked 
                ? 'bg-[#a2d149] text-[#001f3f] shadow-[#a2d149]/20' 
                : 'bg-[#001f3f] text-white shadow-[#001f3f]/20'
            }`}
          >
            {isLinking || launchingSSO ? (
              <Loader2 size={18} className="animate-spin" />
            ) : user.bilty_linked ? (
              <Globe size={18} />
            ) : (
              <LinkIcon size={18} />
            )}
            {user.bilty_linked ? 'OPEN SECURE PORTAL' : 'CONNECT BILTY BOOK'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Integration Command Center */}
        <div className="xl:col-span-8 space-y-6">
          {!user.bilty_linked ? (
            <section className="bg-white dark:bg-slate-900 rounded-[48px] p-10 lg:p-16 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 max-w-xl">
                  <div className="bg-[#a2d149]/10 text-[#a2d149] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-8 border border-[#a2d149]/20">
                    Integration Ready
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6">
                    UNIFY YOUR <br/><span className="text-[#a2d149]">LOGISTICS LOGS</span>
                  </h3>
                  <p className="text-slate-500 font-bold text-lg mb-10 leading-relaxed">
                    Connect your account to <span className="text-slate-900 dark:text-white underline decoration-[#a2d149] decoration-4">Bilty Book Online</span> to instantly sync digital receipts, bills, and legal documentation.
                  </p>
                  <ul className="space-y-4 mb-12">
                    {[
                      { icon: Zap, text: "Seamless Single Sign-On (SSO)" },
                      { icon: Globe, text: "Real-time Cloud Synchronization" },
                      { icon: ShieldCheck, text: "Compliant Legal Archiving" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#a2d149]">
                          <item.icon size={16} />
                        </div>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={handleLinkBilty}
                    disabled={isLinking}
                    className="flex items-center gap-4 bg-[#001f3f] text-[#a2d149] px-10 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    {isLinking ? <Loader2 size={24} className="animate-spin" /> : <>START SSO HANDSHAKE <ArrowRight size={24} /></>}
                  </button>
               </div>
               <Link2 size={400} className="absolute -right-20 -bottom-20 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-[2s]" />
            </section>
          ) : (
            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-emerald-500 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
                    <CheckCircle2 size={20} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Cloud Status</p>
                    <p className="text-3xl font-black italic">CONNECTED</p>
                    <Globe size={100} className="absolute -right-6 -bottom-6 opacity-10 group-hover:rotate-45 transition-transform duration-1000" />
                 </div>
                 <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] p-8 shadow-sm">
                    <FileText size={20} className="text-[#a2d149] mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Synced Logs</p>
                    <p className="text-3xl font-black leading-none">1,248</p>
                 </div>
                 <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] p-8 shadow-sm">
                    <RefreshCw size={20} className="text-blue-500 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Handshake</p>
                    <p className="text-3xl font-black leading-none italic">2m <span className="text-sm font-medium not-italic opacity-40">AGO</span></p>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search shared cloud database..." 
                      className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4.5 pl-12 pr-4 focus:ring-4 focus:ring-[#a2d149]/10 text-sm font-bold" 
                    />
                  </div>
                  <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">
                    <Filter size={18} /> Filters
                  </button>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-[10px] uppercase font-black text-slate-400">
                      <tr>
                        <th className="px-8 py-5">Cloud ID</th>
                        <th className="px-8 py-5">Consignor</th>
                        <th className="px-8 py-5">Timestamp</th>
                        <th className="px-8 py-5">Network Status</th>
                        <th className="px-8 py-5">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {mockBilties.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5 font-black text-[#a2d149] italic">{b.id}</td>
                          <td className="px-8 py-5 text-sm font-black">{b.customer}</td>
                          <td className="px-8 py-5 text-xs font-bold text-slate-500">{b.date}</td>
                          <td className="px-8 py-5">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                              b.status === 'Delivered' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : b.status === 'In Transit' 
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-slate-400 hover:text-[#a2d149] transition-all shadow-sm">
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-950 text-center">
                  <button onClick={handleLaunchSSO} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#a2d149] transition-colors">
                    VIEW COMPLETE HISTORICAL ARCHIVE →
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl">
            <h3 className="font-black text-lg uppercase italic mb-6 flex items-center gap-2">
              <Plus className="text-[#a2d149]" size={20} />
              Quick Dispatch
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 text-xs font-black uppercase tracking-widest hover:bg-[#a2d149] hover:text-[#001f3f] transition-all group border border-transparent">
                <span className="flex items-center gap-3"><FileText size={18} /> New Digital Bilty</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 text-xs font-black uppercase tracking-widest hover:bg-[#a2d149] hover:text-[#001f3f] transition-all group border border-transparent">
                <span className="flex items-center gap-3"><Upload size={18} /> Legacy Import</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 text-xs font-black uppercase tracking-widest hover:bg-[#a2d149] hover:text-[#001f3f] transition-all group border border-transparent">
                <span className="flex items-center gap-3"><Globe size={18} /> Regional Audit</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="bg-[#001f3f] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 text-[#a2d149] mb-4">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Vault Security</span>
                </div>
                <h4 className="text-xl font-black uppercase italic leading-tight mb-4">SSO PORTAL <br/>ACTIVE</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  Your session is protected by end-to-end 256-bit encryption through our secure integration bridge.
                </p>
                {user.bilty_linked && (
                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                     <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Bridge Token</p>
                        <p className="text-[10px] font-black italic">{user.bilty_token?.substr(0, 14)}...</p>
                     </div>
                     <ShieldCheck size={32} className="text-emerald-500" />
                  </div>
                )}
             </div>
             <ShieldAlert size={150} className="absolute -right-8 -bottom-8 opacity-5 rotate-12 pointer-events-none" />
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[32px] flex items-start gap-4">
             <Info size={20} className="text-blue-500 shrink-0 mt-1" />
             <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide leading-relaxed">
               Digital bilties are legally valid under Section 4 of the Information Technology Act, 2000.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiltySection;
