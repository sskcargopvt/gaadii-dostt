
import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Building2, MapPin, ShieldCheck, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface ProfileSectionProps {
  t: any;
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ t, user, onUpdate }) => {
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
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight uppercase italic mb-2">{t.profile}</h2>
        <p className="text-slate-500 font-semibold">Manage your personal and business identity on Gadi Dost.</p>
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
            <h3 className="text-2xl font-bold italic uppercase">{user.name}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 mb-6">{user.role}</p>
            
            <div className="pt-6 border-t border-slate-50 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Verified Account
              </div>
            </div>
          </div>

          <div className="bg-amber-500 text-slate-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
            <h4 className="text-lg font-black uppercase italic mb-2 relative z-10">Trust Score</h4>
            <p className="text-4xl font-black relative z-10">9.8/10</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mt-2 relative z-10">Excellent highway partner</p>
            <Building2 className="absolute -right-4 -bottom-4 opacity-10 rotate-12" size={120} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-[40px] p-8 lg:p-12 border border-slate-100 dark:border-slate-700 shadow-2xl space-y-8">
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in zoom-in">
                <CheckCircle2 size={20} />
                <p className="text-sm font-bold uppercase italic">Profile Updated Successfully!</p>
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
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Email Address (Locked)</label>
                <div className="relative group opacity-60 cursor-not-allowed">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Business Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="Company Logistics Pvt Ltd"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Office Address</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                <textarea 
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street address, Hub, City, Pincode"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-700">
              <button 
                type="submit"
                disabled={loading}
                className="w-full lg:w-auto px-12 py-5 bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:bg-black dark:hover:bg-amber-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 shadow-2xl"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} strokeWidth={3} />}
                <span className="italic uppercase">Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
