
import React, { useState } from 'react';
import {
  Mail, Lock, User, Truck, ArrowRight, ShieldCheck, CheckCircle2,
  AlertCircle, Activity, Loader2, Phone, MapPin, Hash, Car,
  FileText, Calendar, Wrench, Building2, Star, Camera
} from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

/* ── Google Logo ─────────────────────────────────────── */
const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/* ── Logo ─────────────────────────────────────── */
const GadiDostLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative flex flex-col items-center justify-center ${className}`}>
    <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(140, 130) scale(1.2)">
        <path d="M60 40 L100 40 L120 70 L120 100 L10 100 L10 80 L30 80 L30 40 Z" fill="white" />
        <path d="M85 45 L105 45 L115 65 L85 65 Z" fill="#a2d149" />
        <circle cx="95" cy="100" r="12" fill="#a2d149" stroke="white" strokeWidth="4" />
      </g>
      <path d="M80 100 C120 80 180 150 210 120 C230 100 210 80 200 80 C230 80 260 110 210 160 C180 190 120 220 100 230 C120 200 110 140 80 100 Z" fill="#a2d149" />
      <text x="50%" y="250" textAnchor="middle" className="font-black italic">
        <tspan fill="white" style={{ fontSize: '54px', letterSpacing: '-2px' }}>GADI</tspan>
        <tspan fill="#a2d149" style={{ fontSize: '54px', letterSpacing: '-2px' }}>DOST</tspan>
      </text>
    </svg>
  </div>
);

/* ── Shared input class ─────────────────────────────── */
const inp = 'w-full bg-[#001f3f]/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-[#a2d149]/50 transition-colors placeholder:text-slate-600';
const inpPl = 'w-full bg-[#001f3f]/40 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold text-sm outline-none focus:border-[#a2d149]/50 transition-colors placeholder:text-slate-600';
const lbl = 'text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1 block mb-1';

/* ─────────────────────────────────────────────────────
   ROLE TABS CONFIG
───────────────────────────────────────────────────── */
const ROLES = [
  { id: 'customer', label: 'Customer', icon: User, accentColor: '#a2d149', desc: 'Book trucks & track shipments' },
  { id: 'driver', label: 'Driver', icon: Truck, accentColor: '#3b82f6', desc: 'Receive orders & manage trips' },
  { id: 'mechanic', label: 'Mechanic', icon: Wrench, accentColor: '#f97316', desc: 'Offer breakdown & repair services' },
] as const;

const VEHICLE_TYPES = ['Tata Ace / LCV', '14ft Container', '19ft Eicher', '22ft Multi-Axle', '32ft MX Trailer', 'Mini Truck', 'Bike / Two-Wheeler'];
const MECHANIC_SERVICES = ['Tyre Puncture', 'Engine Breakdown', 'Brake Failure', 'Towing', 'Battery Jump-Start', 'Fuel Delivery', 'General Repairs', 'AC Repair'];

/* ═══════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
═══════════════════════════════════════════════════════ */
const AuthSection: React.FC<{ t: any }> = ({ t }) => {
  type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-sent';
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<'customer' | 'driver' | 'mechanic'>('customer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  /* ── Base fields (all roles) ── */
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', phone: '', address: '', city: '', state: '', pincode: ''
  });

  /* ── Driver-specific fields ── */
  const [driverData, setDriverData] = useState({
    vehicle_type: VEHICLE_TYPES[0], vehicle_registration: '', vehicle_model: '', vehicle_year: '',
    license_number: '', license_expiry: '', experience_years: '',
    bank_account_name: '', bank_account_number: '', bank_ifsc: '', bank_name: ''
  });

  /* ── Mechanic-specific fields ── */
  const [mechanicData, setMechanicData] = useState({
    shop_name: '', service_radius_km: '10', selected_services: [] as string[],
    gst_number: '', aadhaar_number: '', upi_id: '', experience_years: ''
  });

  const set = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }));
  const setD = (key: string, val: string) => setDriverData(p => ({ ...p, [key]: val }));
  const setM = (key: string, val: any) => setMechanicData(p => ({ ...p, [key]: val }));

  const toggleService = (s: string) => {
    setMechanicData(p => ({
      ...p,
      selected_services: p.selected_services.includes(s)
        ? p.selected_services.filter(x => x !== s)
        : [...p.selected_services, s]
    }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    set('email', v);
    setEmailError(v && !validateEmail(v) ? 'Enter a valid email address' : null);
  };

  const GOOGLE_CLIENT_ID = '211124590645-5ijm3n3mph718vlu7msa0pfouftnek5p.apps.googleusercontent.com';
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin, queryParams: { access_type: 'offline', prompt: 'consent', client_id: GOOGLE_CLIENT_ID } }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google login failed.');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!validateEmail(formData.email)) { setEmailError('A valid email is required.'); return; }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const metadata: any = {
          role,
          name: formData.name || formData.email.split('@')[0],
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        };
        if (role === 'driver') Object.assign(metadata, driverData);
        if (role === 'mechanic') Object.assign(metadata, mechanicData);

        const { data: authData, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: metadata }
        });
        if (error) throw error;

        // Auto-create driver_profile row for drivers
        if (role === 'driver' && authData.user) {
          await supabase.from('driver_profiles').upsert({
            driver_id: authData.user.id,
            full_name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            ...driverData,
            available: false
          }, { onConflict: 'driver_id' });
        }

        // Auto-create mechanic_profiles row for mechanics
        if (role === 'mechanic' && authData.user) {
          await supabase.from('mechanic_profiles').upsert({
            mechanic_id: authData.user.id,
            full_name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            ...mechanicData,
            available: false
          }, { onConflict: 'mechanic_id' });
        }

        alert('✅ Verification link sent! Please check your email inbox.');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
        if (error) throw error;
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (error) throw error;
        setMode('reset-sent');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const accentColor = ROLES.find(r => r.id === role)?.accentColor || '#a2d149';

  /* ── Input wrapper with icon ── */
  const Field = ({ icon: Icon, label, id, type = 'text', placeholder, value, onChange, required = false }: any) => (
    <div className="space-y-1">
      <label className={lbl}>{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}
          required={required}
          className={inp} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#001f3f] text-white flex flex-col lg:flex-row overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,#a2d14922_0%,transparent_50%)]" />

      {/* ── LEFT PANEL ── */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 lg:w-5/12 lg:p-16">
        <div className="lg:absolute lg:top-12 lg:left-12 flex items-center gap-3 mb-6 lg:mb-0">
          <div className="bg-[#a2d149] p-2 rounded-lg shadow-lg"><Truck size={20} className="text-[#001f3f]" /></div>
          <h1 className="text-xl font-bold tracking-tight uppercase italic">GADI <span className="text-[#a2d149]">DOST</span></h1>
        </div>
        <div className="w-full max-w-lg mb-8 lg:mb-12 animate-in zoom-in duration-700">
          <GadiDostLogo className="w-full h-auto" />
        </div>
        <div className="text-center max-w-sm hidden lg:block animate-in slide-in-from-bottom duration-500">
          <h2 className="text-2xl font-black leading-tight tracking-tight uppercase italic mb-3">
            INDIA'S <span className="text-[#a2d149]">SMARTEST</span> TRANSPORT HUB.
          </h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
            Verified Carriers • Real-time GPS • Digital Documentation
          </p>
          {/* Role benefits */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {ROLES.map(r => (
              <div key={r.id} onClick={() => setRole(r.id)} style={{ borderColor: role === r.id ? r.accentColor : 'transparent' }}
                className="cursor-pointer border-2 rounded-2xl p-3 text-center transition-all bg-white/5 hover:bg-white/10">
                <r.icon size={20} className="mx-auto mb-1" style={{ color: r.accentColor }} />
                <p className="text-[9px] font-black uppercase">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-8 lg:p-12 z-20 overflow-y-auto">
        <div className="w-full max-w-lg py-10">
          <div className="bg-[#002b55]/60 backdrop-blur-2xl border border-white/5 rounded-[40px] p-6 lg:p-10 shadow-2xl relative overflow-hidden">

            {/* Accent top bar — changes color per role */}
            <div className="absolute top-0 left-0 w-full h-[3px] transition-all duration-500"
              style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }} />

            {mode === 'reset-sent' ? (
              <div className="text-center space-y-4 py-8 animate-in zoom-in">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500"><CheckCircle2 size={40} /></div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Email Sent!</h3>
                <p className="text-slate-400 text-sm">Check your inbox for the password reset link.</p>
                <button onClick={() => setMode('signin')} className="text-[#a2d149] font-black uppercase text-[10px] tracking-widest underline underline-offset-4">Back to Login</button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ── Header ── */}
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tight italic uppercase text-white">
                    {mode === 'signin' ? 'AUTHORIZE' : mode === 'signup' ? 'REGISTER' : 'RECOVER'}
                  </h3>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                    {mode === 'signin' ? 'Welcome back to Gadi Dost.' : "Join India's premier logistics network."}
                  </p>
                </div>

                {/* ── Error ── */}
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-in">
                    <AlertCircle size={18} />
                    <p className="text-[10px] font-black uppercase tracking-tight">{errorMsg}</p>
                  </div>
                )}

                {/* ── Google Button ── */}
                <button onClick={handleGoogleLogin} disabled={loading}
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98] border border-slate-200 shadow-sm uppercase tracking-tight">
                  <GoogleLogo /> Connect with Google
                </button>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-white/5" />
                  <span className="flex-shrink mx-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">OR USE EMAIL</span>
                  <div className="flex-grow border-t border-white/5" />
                </div>

                {/* ══ ROLE SELECTOR ══ */}
                <div className="space-y-2">
                  <p className={lbl}>Select Your Role</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(r => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)}
                        style={role === r.id ? { backgroundColor: r.accentColor, color: '#001f3f' } : {}}
                        className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-1.5 transition-all border ${role === r.id ? 'border-transparent shadow-lg scale-[1.04]' : 'border-white/10 text-slate-400 hover:text-slate-200 bg-white/5'}`}>
                        <r.icon size={16} />
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold text-center mt-1">{ROLES.find(r => r.id === role)?.desc}</p>
                </div>

                {/* ── FORM ── */}
                <form onSubmit={handleAuth} className="space-y-4">

                  {/* Email */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className={lbl}>Email Address</label>
                      {emailError && <span className="text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse">{emailError}</span>}
                    </div>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${emailError ? 'text-red-400' : 'text-slate-500'}`} size={16} />
                      <input type="email" required placeholder="your@email.com"
                        className={`${inp} ${emailError ? 'border-red-500/50' : ''}`}
                        value={formData.email} onChange={handleEmailChange} />
                    </div>
                  </div>

                  {/* Password */}
                  {mode !== 'forgot-password' && (
                    <div className="space-y-1">
                      <label className={lbl}>Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input type="password" required placeholder="••••••••" className={inp}
                          value={formData.password} onChange={e => set('password', e.target.value)} />
                      </div>
                    </div>
                  )}

                  {/* ══ SIGNUP EXTRA FIELDS ══ */}
                  {mode === 'signup' && (
                    <div className="space-y-5 pt-5 border-t border-white/5 animate-in slide-in-from-top-4">

                      {/* ── COMMON FIELDS (all roles) ── */}
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 flex items-center gap-2">
                          <User size={11} /> Personal Details
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className={lbl}>Full Name</label>
                            <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                              <input type="text" required placeholder="Full legal name" className={inp} value={formData.name} onChange={e => set('name', e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className={lbl}>Phone</label>
                            <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                              <input type="tel" placeholder="+91 98765 43210" className={inp} value={formData.phone} onChange={e => set('phone', e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className={lbl}>City</label>
                            <div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                              <input type="text" placeholder="Delhi" className={inp} value={formData.city} onChange={e => set('city', e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className={lbl}>State</label>
                            <input type="text" placeholder="Uttar Pradesh" className={inpPl} value={formData.state} onChange={e => set('state', e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <label className={lbl}>Pincode</label>
                            <input type="text" placeholder="110001" className={inpPl} value={formData.pincode} onChange={e => set('pincode', e.target.value)} />
                          </div>
                        </div>
                      </div>

                      {/* ══ DRIVER SPECIFIC ══ */}
                      {role === 'driver' && (
                        <div className="space-y-4 p-4 rounded-3xl border border-blue-500/20 bg-blue-500/5">
                          <p className="text-[9px] font-black uppercase text-blue-400 tracking-[0.2em] flex items-center gap-2"><Truck size={11} /> Vehicle & License Details</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1">
                              <label className={lbl}>Vehicle Type</label>
                              <div className="relative">
                                <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                <select value={driverData.vehicle_type} onChange={e => setD('vehicle_type', e.target.value)}
                                  className={`${inp} appearance-none cursor-pointer`}>
                                  {VEHICLE_TYPES.map(v => <option key={v} className="bg-slate-900">{v}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>Registration No.</label>
                              <div className="relative"><Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="text" placeholder="UP-14 AB 1234" className={inp} value={driverData.vehicle_registration} onChange={e => setD('vehicle_registration', e.target.value)} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>Vehicle Model</label>
                              <input type="text" placeholder="Tata Ace Gold" className={inpPl} value={driverData.vehicle_model} onChange={e => setD('vehicle_model', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>Mfg. Year</label>
                              <input type="text" placeholder="2021" className={inpPl} value={driverData.vehicle_year} onChange={e => setD('vehicle_year', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>Experience (yrs)</label>
                              <div className="relative"><Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="number" placeholder="5" className={inp} value={driverData.experience_years} onChange={e => setD('experience_years', e.target.value)} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>License No.</label>
                              <div className="relative"><FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="text" placeholder="DL-14201100123" className={inp} value={driverData.license_number} onChange={e => setD('license_number', e.target.value)} />
                              </div>
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className={lbl}>License Expiry Date</label>
                              <div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="date" className={inp} value={driverData.license_expiry} onChange={e => setD('license_expiry', e.target.value)} />
                              </div>
                            </div>
                          </div>
                          <p className="text-[9px] font-black uppercase text-blue-400 tracking-[0.2em] flex items-center gap-2 pt-2"><Building2 size={11} /> Bank Details (for payouts)</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1">
                              <label className={lbl}>Account Holder Name</label>
                              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="text" placeholder="As per bank records" className={inp} value={driverData.bank_account_name} onChange={e => setD('bank_account_name', e.target.value)} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>Account No.</label>
                              <input type="text" placeholder="1234 5678 9012" className={inpPl} value={driverData.bank_account_number} onChange={e => setD('bank_account_number', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>IFSC Code</label>
                              <input type="text" placeholder="SBIN0001234" className={inpPl} value={driverData.bank_ifsc} onChange={e => setD('bank_ifsc', e.target.value)} />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className={lbl}>Bank Name</label>
                              <div className="relative"><Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="text" placeholder="State Bank of India" className={inp} value={driverData.bank_name} onChange={e => setD('bank_name', e.target.value)} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ══ MECHANIC SPECIFIC ══ */}
                      {role === 'mechanic' && (
                        <div className="space-y-4 p-4 rounded-3xl border border-orange-500/20 bg-orange-500/5">
                          <p className="text-[9px] font-black uppercase text-orange-400 tracking-[0.2em] flex items-center gap-2"><Wrench size={11} /> Shop & Services</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1">
                              <label className={lbl}>Shop / Business Name</label>
                              <div className="relative"><Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="text" placeholder="Sharma Auto Works" className={inp} value={mechanicData.shop_name} onChange={e => setM('shop_name', e.target.value)} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>Experience (yrs)</label>
                              <div className="relative"><Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="number" placeholder="8" className={inp} value={mechanicData.experience_years} onChange={e => setM('experience_years', e.target.value)} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>Service Radius (km)</label>
                              <input type="number" placeholder="10" className={inpPl} value={mechanicData.service_radius_km} onChange={e => setM('service_radius_km', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>GST Number</label>
                              <input type="text" placeholder="27AAAAA0000A1Z5" className={inpPl} value={mechanicData.gst_number} onChange={e => setM('gst_number', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <label className={lbl}>UPI ID</label>
                              <input type="text" placeholder="shop@upi" className={inpPl} value={mechanicData.upi_id} onChange={e => setM('upi_id', e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className={lbl}>Services Offered (Select all that apply)</label>
                            <div className="grid grid-cols-2 gap-2">
                              {MECHANIC_SERVICES.map(s => (
                                <button key={s} type="button" onClick={() => toggleService(s)}
                                  className={`py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all text-left flex items-center gap-2 ${mechanicData.selected_services.includes(s) ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-orange-500/30'}`}>
                                  {mechanicData.selected_services.includes(s) && <CheckCircle2 size={10} />}
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── CUSTOMER EXTRA (for signup) ── */}
                      {role === 'customer' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className={lbl}>Business / Company Name (Optional)</label>
                            <div className="relative"><Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                              <input type="text" placeholder="ABC Logistics Pvt. Ltd." className={inp} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── SUBMIT ── */}
                  <button type="submit" disabled={loading || !!emailError}
                    style={{ backgroundColor: accentColor, color: '#001f3f' }}
                    className="w-full py-4 rounded-[20px] font-black text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 group shadow-xl uppercase tracking-tight mt-2">
                    {loading
                      ? <Loader2 className="animate-spin" size={20} />
                      : <span className="italic font-black">
                        {mode === 'signin' ? 'ENTER HIGHWAY' : mode === 'signup' ? `REGISTER AS ${role.toUpperCase()}` : 'SEND LINK'}
                      </span>}
                    {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} strokeWidth={3} />}
                  </button>
                </form>

                {/* ── Footer links ── */}
                <div className="text-center pt-1">
                  <p className="text-slate-500 font-bold text-[11px]">
                    {mode === 'signin' ? 'NEW TO GADI DOST?' : 'ALREADY A MEMBER?'}{' '}
                    <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErrorMsg(null); }}
                      className="text-[#a2d149] font-black hover:text-white underline underline-offset-4 transition-all uppercase italic ml-1">
                      {mode === 'signin' ? 'Create Account' : 'Sign In Now'}
                    </button>
                  </p>
                  {mode === 'signin' && (
                    <button onClick={() => setMode('forgot-password')}
                      className="mt-3 text-slate-600 hover:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                      Lost Passcode?
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer badges */}
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-6 opacity-30">
              <ShieldCheck size={20} /><Activity size={20} /><Lock size={20} />
            </div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">AES-256 Military Grade Encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
