
import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Building2, MapPin, ShieldCheck, Save, Loader2, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface ProfileSectionProps {
  t: any;
  user: User;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ t, user, onUpdate, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    businessName: user.businessName || '',
    address: user.address || ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          name: formData.name,
          phone: formData.phone,
          businessName: formData.businessName,
          address: formData.address
        }
      });

      if (error) throw error;

      const updatedUser: User = {
        ...user,
        name: formData.name,
        phone: formData.phone,
        businessName: formData.businessName,
        address: formData.address
      };

      onUpdate(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight uppercase italic mb-2">{t.profile}</h2>
          <p className="text-slate-500 font-semibold">Manage your personal and business identity on Gadi Dost.</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-50 dark:bg-red-500/10 text-red-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 border border-red-100 dark:border-red-500/20 hover:bg-red-100 transition-all shadow-sm"
        >
          <LogOut size={16} strokeWidth={3} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-xl text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden">
                <UserIcon size={64} />
              </div>
              <div className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 p-2 rounded-full border-4 border-white dark:border-slate-800 shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-bold italic uppercase leading-none">{user.name}</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 mb-6">{user.role}</p>
            
            <div className="pt-6 border-t border-slate-50 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Verified Cloud Partner
              </div>
            </div>
          </div>

          <div className="bg-amber-500 text-slate-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
            <h4 className="text-lg font-black uppercase italic mb-2 relative z-10">Trust Score</h4>
            <p className="text-5xl font-black relative z-10 italic">9.8<span className="text-xl opacity-60 ml-1">/ 10</span></p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-3 relative z-10">Premier Network Access</p>
            <Building2 className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" size={120} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-[40px] p-8 lg:p-12 border border-slate-100 dark:border-slate-700 shadow-2xl space-y-8">
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in zoom-in">
                <CheckCircle2 size={20} />
                <p className="text-sm font-bold uppercase italic">Identity Updated Successfully!</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 animate-in shake">
                <AlertCircle size={20} />
                <p className="text-sm font-bold uppercase italic">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Full Legal Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Email Identifier (Locked)</label>
                <div className="relative group opacity-50 cursor-not-allowed">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Primary Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Business Identity</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="Registered Logistics Co."
                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Head Office Address</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                <textarea 
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Full office location for billing..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none shadow-inner"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
              <button 
                type="submit"
                disabled={loading}
                className="w-full lg:w-auto px-16 py-5 bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-900 rounded-[24px] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl italic uppercase"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={22} strokeWidth={3} />}
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
