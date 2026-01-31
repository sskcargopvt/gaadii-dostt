
import React, { useState } from 'react';
import { Mail, Lock, User, Truck, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Star, X, Info, Chrome, Phone, Building2, MapPin } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthSectionProps {
  t: any;
}

/**
 * Official Google 'G' Logo SVG
 */
const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * New Gadi Dost Logo Component based on user-provided brand identity
 */
const GadiDostLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative flex flex-col items-center justify-center ${className}`}>
    <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background for visibility in some contexts, but usually transparent */}
      
      {/* Truck Silhouette */}
      <path d="M140 180h80l40 40h40v40H140v-80z" fill="white" className="opacity-0" />
      <g transform="translate(140, 130) scale(1.2)">
        <path d="M60 40 L100 40 L120 70 L120 100 L10 100 L10 80 L30 80 L30 40 Z" fill="white" />
        <path d="M85 45 L105 45 L115 65 L85 65 Z" fill="#a2d149" /> {/* Window highlight */}
        <circle cx="95" cy="100" r="12" fill="#a2d149" stroke="white" strokeWidth="4" /> {/* Wheel */}
      </g>

      {/* Bird Silhouette (Lime Green) */}
      <path d="M80 100 C120 80 180 150 210 120 C230 100 210 80 200 80 C230 80 260 110 210 160 C180 190 120 220 100 230 C120 200 110 140 80 100 Z" fill="#a2d149" />
      <path d="M100 130 C130 110 170 140 190 135" stroke="#a2d149" strokeWidth="3" strokeLinecap="round" />
      <path d="M90 115 C110 100 140 110 160 115" stroke="#a2d149" strokeWidth="2" strokeLinecap="round" />
      
      {/* Typography */}
      <text x="50%" y="250" textAnchor="middle" className="font-black italic">
        <tspan fill="white" style={{ fontSize: '54px', letterSpacing: '-2px' }}>GADI</tspan>
        <tspan fill="#a2d149" style={{ fontSize: '54px', letterSpacing: '-2px' }}>DOST</tspan>
      </text>
    </svg>
  </div>
);

const AuthSection: React.FC<AuthSectionProps> = ({ t }) => {
  type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-sent';
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '',
    phone: '',
    businessName: '',
    address: ''
  });

  const GOOGLE_CLIENT_ID = "211124590645-5ijm3n3mph718vlu7msa0pfouftnek5p.apps.googleusercontent.com";

  const resetState = () => {
    setErrorMsg(null);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            client_id: GOOGLE_CLIENT_ID
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google login failed.');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { 
              role,
              name: formData.name || formData.email.split('@')[0],
              phone: formData.phone,
              businessName: formData.businessName,
              address: formData.address
            }
          }
        });
        if (error) throw error;
        alert("Success! Check your email for a verification link to activate your Gadi Dost account.");
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (error) throw error;
        setMode('reset-sent');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001f3f] text-white flex flex-col lg:flex-row overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,#a2d14922_0%,transparent_50%)]" />

      <div className={`relative z-10 flex flex-col items-center justify-center p-6 lg:w-1/2 lg:p-16 transition-all duration-700 ${isFocused ? 'opacity-40 scale-95 lg:opacity-100 lg:scale-100' : ''}`}>
        <div className="lg:absolute lg:top-12 lg:left-12 flex items-center gap-3 mb-6 lg:mb-0">
          <div className="bg-[#a2d149] p-2 rounded-lg shadow-lg">
            <Truck size={20} className="text-[#001f3f]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase italic">
            GADI <span className="text-[#a2d149]">DOST</span>
          </h1>
        </div>

        <div className="w-full max-w-lg mb-8 lg:mb-12 animate-in zoom-in duration-1000">
          <GadiDostLogo className="w-full h-auto" />
        </div>

        <div className="text-center max-w-sm hidden lg:block animate-in slide-in-from-bottom duration-700">
          <h2 className="text-3xl font-bold leading-tight tracking-tight uppercase italic mb-3">
            YOUR <span className="text-[#a2d149]">ULTIMATE</span> HIGHWAY PARTNER.
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Revolutionizing Indian logistics with speed, safety, and digital transparency.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20 overflow-y-auto">
        <div className="w-full max-w-md py-10">
          <div className="bg-[#002b55]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 lg:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#a2d149]/30 to-transparent" />
            
            <div className="space-y-6">
              {mode === 'reset-sent' ? (
                <div className="text-center space-y-4 py-8 animate-in zoom-in">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500"><CheckCircle2 size={32} /></div>
                  <h3 className="text-2xl font-bold italic uppercase tracking-tight">Email Sent</h3>
                  <button onClick={() => setMode('signin')} className="text-[#a2d149] font-bold uppercase text-xs tracking-widest underline underline-offset-4">Back to Login</button>
                </div>
              ) : (
                <>
                  <div className="text-center lg:text-left">
                    <h3 className="text-2xl lg:text-3xl font-bold tracking-tight italic uppercase text-white">
                      {mode === 'signin' ? 'LOG IN' : mode === 'signup' ? 'SIGN UP' : 'RESET KEY'}
                    </h3>
                    <p className="text-slate-500 font-semibold text-xs">
                      {mode === 'signin' ? 'Access your transport command center.' : 'Register and complete your partner profile.'}
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 animate-in shake">
                      <AlertCircle size={14} />
                      <p className="text-[10px] font-bold uppercase">{errorMsg}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98] border border-slate-200 shadow-sm"
                    >
                      <GoogleLogo />
                      <span className="tracking-tight uppercase">Continue with Google</span>
                    </button>
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-white/10" />
                      <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
                      <div className="flex-grow border-t border-white/10" />
                    </div>
                  </div>

                  <div className="flex bg-slate-950/30 p-1 rounded-xl border border-white/5">
                    <button 
                      onClick={() => setRole('customer')} 
                      className={`flex-1 py-3 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${role === 'customer' ? 'bg-[#a2d149] text-[#001f3f] shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      {role === 'customer' && <CheckCircle2 size={12} />} Customer
                    </button>
                    <button 
                      onClick={() => setRole('transporter')} 
                      className={`flex-1 py-3 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${role === 'transporter' ? 'bg-[#a2d149] text-[#001f3f] shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      {role === 'transporter' && <CheckCircle2 size={12} />} Transporter
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input type="email" required placeholder="name@domain.com" className="w-full bg-[#001f3f]/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm outline-none focus:border-[#a2d149]/50 transition-colors" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                      </div>
                    </div>

                    {mode !== 'forgot-password' && (
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Access Pin</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                          <input type="password" required placeholder="••••••••" className="w-full bg-[#001f3f]/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm outline-none focus:border-[#a2d149]/50 transition-colors" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && (
                      <div className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-[9px] font-black text-[#a2d149] uppercase tracking-widest text-center">Business & Identity Details</p>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Full Name</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input type="text" required placeholder="John Doe" className="w-full bg-[#001f3f]/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm outline-none focus:border-[#a2d149]/50 transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Phone</label>
                            <input type="tel" placeholder="+91..." className="w-full bg-[#001f3f]/40 border border-white/5 rounded-xl py-3.5 px-4 text-white font-semibold text-sm outline-none focus:border-[#a2d149]/50 transition-colors" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Business</label>
                            <input type="text" placeholder="Co. Name" className="w-full bg-[#001f3f]/40 border border-white/5 rounded-xl py-3.5 px-4 text-white font-semibold text-sm outline-none focus:border-[#a2d149]/50 transition-colors" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Office Address</label>
                          <textarea placeholder="Full Registered Address" rows={2} className="w-full bg-[#001f3f]/40 border border-white/5 rounded-xl py-3.5 px-4 text-white font-semibold text-sm outline-none focus:border-[#a2d149]/50 transition-colors resize-none" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                        </div>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-[#a2d149] text-[#001f3f] py-4 rounded-xl font-bold text-sm hover:bg-[#b8e05d] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 group shadow-lg shadow-[#a2d149]/20">
                      <span className="italic uppercase font-black tracking-tight">{loading ? 'Processing...' : mode === 'signin' ? 'Enter Highway' : mode === 'signup' ? 'Create & Save Profile' : 'Send Reset Link'}</span>
                      {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} strokeWidth={3} />}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <p className="text-slate-500 font-semibold text-[11px]">
                      {mode === 'signin' ? "New Partner?" : "Already member?"}{' '}
                      <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); resetState(); }} className="text-[#a2d149] font-bold hover:text-white underline underline-offset-4 transition-all uppercase italic ml-1">
                        {mode === 'signin' ? 'Register Now' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
