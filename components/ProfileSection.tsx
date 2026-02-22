
import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, Mail, Phone, Building2, MapPin, ShieldCheck, Save, Loader2,
  CheckCircle2, AlertCircle, LogOut, Truck, FileText, CreditCard, Camera, Hash,
  Car, Calendar, Star, Edit3, Eye, Banknote, ChevronRight
} from 'lucide-react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface ProfileSectionProps {
  t: any;
  user: User;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
}

const VEHICLE_TYPES = [
  'Tata Ace / LCV', '14ft Container', '19ft Eicher', '22ft Multi-Axle',
  '32ft MX Trailer', 'Mini Truck', 'Bike / Two-Wheeler',
];

const inp = 'w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all';
const lbl = 'text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-1.5';

/* ── Stat card ─────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className={`bg-white dark:bg-slate-800 rounded-[24px] p-5 border border-slate-100 dark:border-slate-700 shadow-lg`}>
    <div className={`w-9 h-9 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-3 text-${color}-600`}>
      <Icon size={17} />
    </div>
    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
    <p className="text-xl font-black mt-1">{value || '—'}</p>
  </div>
);

/* ── Info row ───────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={14} className="text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
      <p className="font-bold text-sm mt-0.5 truncate">{value || <span className="text-slate-400 italic">Not provided</span>}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   DRIVER PROFILE SUB-COMPONENT
══════════════════════════════════════════════════════════════════ */
const DriverProfileView: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [tab, setTab] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [dp, setDp] = useState({
    full_name: '', phone: '', email: '', date_of_birth: '',
    address: '', city: '', state: '', pincode: '',
    vehicle_type: VEHICLE_TYPES[0], vehicle_registration: '', vehicle_model: '', vehicle_year: '',
    license_number: '', license_expiry: '', experience_years: '',
    bank_account_name: '', bank_account_number: '', bank_ifsc: '', bank_name: '',
    profile_photo_url: '',
  });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('driver_id', session.user.id)
        .single();
      if (data) {
        setDp({ ...dp, ...data });
        if (data.profile_photo_url) setPhotoPreview(data.profile_photo_url);
      }
    })();
  }, []);

  const set = (key: string, val: string) => setDp(p => ({ ...p, [key]: val }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPhotoPreview(url);
      setDp(p => ({ ...p, profile_photo_url: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(false);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }
    try {
      const { error: err } = await supabase.from('driver_profiles').upsert(
        { ...dp, driver_id: session.user.id, updated_at: new Date().toISOString() },
        { onConflict: 'driver_id' }
      );
      if (err) throw err;
      if (dp.vehicle_registration) {
        await supabase.from('vehicles').upsert({
          driver_id: session.user.id,
          registration_number: dp.vehicle_registration,
          type: dp.vehicle_type, model: dp.vehicle_model, year: dp.vehicle_year,
        }, { onConflict: 'registration_number' });
      }
      setSuccess(true);
      setTab('view');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const F = ({ icon: Icon, label, fkey, type = 'text', placeholder = '' }: any) => (
    <div className="space-y-1.5">
      <label className={lbl}>{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          placeholder={placeholder}
          value={dp[fkey as keyof typeof dp]}
          onChange={e => set(fkey, e.target.value)}
          className={inp}
        />
      </div>
    </div>
  );

  const completeness = [
    dp.full_name, dp.phone, dp.vehicle_registration, dp.license_number,
    dp.bank_account_number, dp.profile_photo_url,
  ].filter(Boolean).length;
  const completePct = Math.round((completeness / 6) * 100);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight uppercase italic mb-1">Driver Profile</h2>
          <p className="text-slate-500 font-semibold text-sm">Manage your complete driver identity and vehicle details.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab(tab === 'view' ? 'edit' : 'view')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30"
          >
            {tab === 'view' ? <><Edit3 size={15} /> Edit Profile</> : <><Eye size={15} /> View Profile</>}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100 dark:border-red-500/20 hover:bg-red-100 transition-all"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 mb-6 animate-in zoom-in">
          <CheckCircle2 size={20} /> <p className="font-bold text-sm">Profile updated successfully!</p>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 mb-6">
          <AlertCircle size={20} /> <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {/* ── VIEW TAB ── */}
      {tab === 'view' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Avatar + stats */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl text-center relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-t-[32px]" />
              <div className="relative w-24 h-24 mx-auto mb-3 mt-8">
                {photoPreview ? (
                  <img src={photoPreview} alt="Driver" className="w-24 h-24 rounded-[20px] object-cover shadow-xl border-4 border-white dark:border-slate-800" />
                ) : (
                  <div className="w-24 h-24 bg-blue-600 rounded-[20px] flex items-center justify-center text-white border-4 border-white dark:border-slate-800 shadow-xl">
                    <Truck size={40} />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-white dark:border-slate-800 shadow-lg">
                  <ShieldCheck size={14} />
                </div>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mt-2">{dp.full_name || 'Driver Name'}</h3>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Certified Driver</p>
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Profile Completion</p>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
                    style={{ width: `${completePct}%` }}
                  />
                </div>
                <p className="text-sm font-black mt-2">{completePct}% Complete</p>
                {completePct < 100 && (
                  <button
                    onClick={() => setTab('edit')}
                    className="mt-3 text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center justify-center gap-1 hover:text-indigo-700 transition-colors"
                  >
                    Complete Now <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Experience" value={dp.experience_years ? `${dp.experience_years} yrs` : null} icon={Star} color="amber" />
              <StatCard label="Vehicle Type" value={dp.vehicle_type} icon={Truck} color="blue" />
              <StatCard label="Reg. No." value={dp.vehicle_registration} icon={Hash} color="slate" />
              <StatCard label="License" value={dp.license_number ? dp.license_number.slice(0, 8) + '…' : null} icon={FileText} color="purple" />
            </div>
          </div>

          {/* Right: Detail sections */}
          <div className="lg:col-span-2 space-y-5">
            {/* Personal */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Personal Information</h4>
              <InfoRow icon={UserIcon} label="Full Name" value={dp.full_name} />
              <InfoRow icon={Mail} label="Email" value={dp.email} />
              <InfoRow icon={Phone} label="Phone" value={dp.phone} />
              <InfoRow icon={Calendar} label="Date of Birth" value={dp.date_of_birth} />
              <InfoRow icon={MapPin} label="Address" value={[dp.address, dp.city, dp.state, dp.pincode].filter(Boolean).join(', ')} />
            </div>

            {/* Vehicle */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Vehicle Details</h4>
              <InfoRow icon={Truck} label="Vehicle Type" value={dp.vehicle_type} />
              <InfoRow icon={Hash} label="Registration Number" value={dp.vehicle_registration} />
              <InfoRow icon={Car} label="Model" value={dp.vehicle_model} />
              <InfoRow icon={Calendar} label="Year of Manufacture" value={dp.vehicle_year} />
            </div>

            {/* License */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">License & Compliance</h4>
              <InfoRow icon={FileText} label="License Number" value={dp.license_number} />
              <InfoRow icon={Calendar} label="License Expiry" value={dp.license_expiry} />
              <InfoRow icon={Star} label="Experience (Years)" value={dp.experience_years} />
            </div>

            {/* Bank */}
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Bank Account Details</h4>
              <InfoRow icon={UserIcon} label="Account Holder" value={dp.bank_account_name} />
              <InfoRow icon={Building2} label="Bank Name" value={dp.bank_name} />
              <InfoRow icon={CreditCard} label="Account Number" value={dp.bank_account_number ? '•••• •••• ' + dp.bank_account_number.slice(-4) : null} />
              <InfoRow icon={Hash} label="IFSC Code" value={dp.bank_ifsc} />
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT TAB ── */}
      {tab === 'edit' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Photo */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-2xl object-cover shadow-xl" />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                    <Camera size={28} className="text-blue-400" />
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl cursor-pointer shadow-lg hover:bg-blue-500 transition-colors">
                  <Camera size={14} />
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>
              <div>
                <p className="font-black text-base">Profile Photo</p>
                <p className="text-slate-400 text-sm font-medium mt-1">Upload a clear face photo. Preferred: JPG/PNG under 2MB.</p>
              </div>
            </div>
          </div>

          {/* Personal */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-5">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <F icon={UserIcon} label="Full Name *" fkey="full_name" placeholder="Your legal full name" />
              <F icon={Phone} label="Phone Number *" fkey="phone" type="tel" placeholder="+91 98765 43210" />
              <F icon={Mail} label="Email Address" fkey="email" type="email" placeholder="driver@email.com" />
              <F icon={Calendar} label="Date of Birth" fkey="date_of_birth" type="date" />
              <div className="space-y-1.5 md:col-span-2">
                <label className={lbl}>Home Address</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Street, City, State"
                    value={dp.address}
                    onChange={e => set('address', e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
              <F icon={MapPin} label="City" fkey="city" placeholder="Delhi" />
              <F icon={Hash} label="Pincode" fkey="pincode" placeholder="110001" />
            </div>
          </div>

          {/* Vehicle */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-5">Vehicle Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className={lbl}>Vehicle Type *</label>
                <div className="relative">
                  <Truck size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select required className={inp} value={dp.vehicle_type} onChange={e => set('vehicle_type', e.target.value)}>
                    {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <F icon={Hash} label="Registration Number *" fkey="vehicle_registration" placeholder="DL 01 AB 1234" />
              <F icon={Car} label="Vehicle Model" fkey="vehicle_model" placeholder="Tata Ace Gold" />
              <F icon={Calendar} label="Manufacturing Year" fkey="vehicle_year" placeholder="2022" />
            </div>
          </div>

          {/* License */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-5">License & Experience</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <F icon={FileText} label="License Number *" fkey="license_number" placeholder="DL-0120110149646" />
              <F icon={Calendar} label="License Expiry" fkey="license_expiry" type="date" />
              <F icon={Star} label="Years of Experience" fkey="experience_years" type="number" placeholder="5" />
            </div>
          </div>

          {/* Bank */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-5">Bank Account</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <F icon={UserIcon} label="Account Holder Name" fkey="bank_account_name" placeholder="Full name on bank account" />
              <F icon={Building2} label="Bank Name" fkey="bank_name" placeholder="State Bank of India" />
              <F icon={CreditCard} label="Account Number" fkey="bank_account_number" placeholder="1234567890" />
              <F icon={Hash} label="IFSC Code" fkey="bank_ifsc" placeholder="SBIN0001234" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-60 shadow-2xl shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-95"
          >
            {loading ? <><Loader2 size={22} className="animate-spin" /> Saving...</> : <><Save size={22} /> Save All Changes</>}
          </button>
        </form>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN PROFILE SECTION
══════════════════════════════════════════════════════════════════ */
const ProfileSection: React.FC<ProfileSectionProps> = ({ t, user, onUpdate, onLogout }) => {

  // Drivers get the full driver profile view
  if (user.role === 'driver') {
    return <DriverProfileView user={user} onLogout={onLogout} />;
  }

  // ── Customer / other roles ──────────────────────────────────────
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
      const { error } = await supabase.auth.updateUser({
        data: { name: formData.name, phone: formData.phone, businessName: formData.businessName, address: formData.address }
      });
      if (error) throw error;
      onUpdate({ ...user, name: formData.name, phone: formData.phone, businessName: formData.businessName, address: formData.address });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
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
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500">
                <AlertCircle size={20} />
                <p className="text-sm font-bold uppercase italic">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Full Legal Name', icon: UserIcon, key: 'name', type: 'text', placeholder: 'Enter full name' },
                { label: 'Primary Phone', icon: Phone, key: 'phone', type: 'tel', placeholder: '+91 00000 00000' },
                { label: 'Business Identity', icon: Building2, key: 'businessName', type: 'text', placeholder: 'Registered Logistics Co.' },
              ].map(({ label, icon: Icon, key, type, placeholder }) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{label}</label>
                  <div className="relative group">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input
                      type={type}
                      value={(formData as any)[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Email (Locked)</label>
                <div className="relative opacity-50">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={formData.email} disabled className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none cursor-not-allowed" />
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
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full office location for billing..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none shadow-inner"
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
