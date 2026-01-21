
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
 * Reconstructed Gadi Dost Logo - Circular, High-Fidelity.
 */
const GadiDostLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative rounded-full bg-white flex flex-col items-center justify-center border-[4px] border-slate-900 overflow-hidden shadow-xl ${className}`}>
    <div className="absolute inset-0 border border-amber-500 rounded-full m-0.5 pointer-events-none" />
    
    <div className="relative z-10 flex items-end justify-center w-full h-[45%] mt-3 gap-0">
      <div className="relative -mr-2 translate-y-1 scale-75 opacity-80">
        <svg width="45" height="30" viewBox="0 0 60 40" fill="none">
          <rect x="5" y="15" width="45" height="15" fill="#f59e0b" stroke="#000" strokeWidth="2"/>
          <rect x="5" y="10" width="20" height="10" fill="#f59e0b" stroke="#000" strokeWidth="2"/>
          <rect x="8" y="12" width="12" height="6" fill="#38bdf8" stroke="#000" strokeWidth="1"/>
          <circle cx="15" cy="30" r="4" fill="#d1d5db" stroke="#000" strokeWidth="2"/>
          <circle cx="40" cy="30" r="4" fill="#d1d5db" stroke="#000" strokeWidth="2"/>
        </svg>
      </div>
      <div className="relative z-20 scale-90">
        <svg width="75" height="50" viewBox="0 0 100 65" fill="none">
          <path d="M10 25 H40 V50 H10 Z" fill="#f59e0b" stroke="#000" strokeWidth="3"/>
          <path d="M40 15 H90 V40 H40 Z" fill="#f59e0b" stroke="#000" strokeWidth="3"/>
          <path d="M15 28 H35 V40 H15 Z" fill="#38bdf8" stroke="#000" strokeWidth="2"/>
          <circle cx="25" cy="50" r="7" fill="#d1d5db" stroke="#000" strokeWidth="2.5"/>
          <circle cx="65" cy="50" r="7" fill="#d1d5db" stroke="#000" strokeWidth="2.5"/>
          <circle cx="82" cy="50" r="7" fill="#d1d5db" stroke="#000" strokeWidth="2.5"/>
        </svg>
      </div>
    </div>

    <div className="relative z-30 w-[115%] bg-slate-900 py-1 flex justify-center -mt-0.5 shadow-md">
      <span className="text-white font-bold text-[10px] tracking-widest uppercase italic">GADI DOST</span>
    </div>
    <div className="relative z-20 w-[80%] bg-amber-500 py-0.5 border-x border-b border-slate-900 flex justify-center -mt-0.5 shadow-sm">
      <span className="text-slate-900 font-bold text-[6px] tracking-[0.2em] uppercase">ON THE MOVE</span>
    </div>

    <div className="flex gap-1.5 mt-1.5 mb-2.5">
      <Star size={7} fill="black" strokeWidth={0} />
      <Star size={7} fill="black" strokeWidth={0} />
      <Star size={7} fill="black" strokeWidth={0} />
    </div>
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
        alert("Registration initiated! If email verification is enabled, please check your inbox.");
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

  const wheelStyles = `
    @keyframes rotate3d {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    .wheel-container {
      perspective: 1200px;
      width: 100%;
      height: 240px;
      transform-style: preserve-3d;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.6s ease;
    }
    .wheel {
      position: relative;
      width: 210px;
      height: 210px;
      transform-style: preserve-3d;
      animation: rotate3d 18s linear infinite;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .wheel.focused {
      animation-play-state: paused;
      transform: rotateY(0deg) !important;
    }
    .rim {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 170px;
      height: 170px;
      margin-left: -85px;
      margin-top: -85px;
      background: #1e293b;
      border: 6px solid #334155;
      border-radius: 50%;
      transform: translateZ(35px);
      box-shadow: inset 0 0 30px rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rim-back { 
      transform: translateZ(-35px) rotateY(180deg); 
    }
    .tire {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 210px;
      height: 210px;
      margin-left: -105px;
      margin-top: -105px;
      border-radius: 50%;
      border: 24px solid #020617;
      box-shadow: 0 0 20px rgba(0,0,0,0.4);
    }
    .spoke {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 2px;
      height: 85px;
      background: #475569;
      transform-origin: top center;
    }
  `;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col lg:flex-row overflow-hidden relative">
      <style>{wheelStyles}</style>
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-amber-500/10 via-transparent to-sky-500/10" />
      </div>

      <div className={`relative z-10 flex flex-col items-center justify-center p-6 lg:w-1/2 lg:p-16 transition-all duration-700 ${isFocused ? 'opacity-40 scale-95 lg:opacity-100 lg:scale-100' : ''}`}>
        <div className="lg:absolute lg:top-12 lg:left-12 flex items-center gap-3 mb-6 lg:mb-0">
          <div className="bg-amber-500 p-2 rounded-lg shadow-lg">
            <Truck size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase italic">{t.appName}</h1>
        </div>

        <div className="wheel-container lg:scale-125 mb-4 lg:mb-12">
          <div className={`wheel ${isFocused ? 'focused' : ''}`}>
            <div className="rim">
              <GadiDostLogo className="w-[85%] h-[85%] border-none shadow-none" />
            </div>
            <div className="rim rim-back">
              <GadiDostLogo className="w-[85%] h-[85%] border-none shadow-none" />
            </div>
            <div className="tire" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div key={deg} className="spoke" style={{ transform: `rotate(${deg}deg) translateZ(10px)` }} />
            ))}
          </div>
        </div>

        <div className="text-center max-w-sm hidden lg:block animate-in slide-in-from-bottom duration-700">
          <h2 className="text-3xl font-bold leading-tight tracking-tight uppercase italic mb-3">
            YOUR <span className="text-amber-500">DIGITAL</span> TRANSPORT PARTNER.
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            The standard for Indian logistics—verified fleets, drivers, and digital bilty.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20 overflow-y-auto">
        <div className="w-full max-w-md py-10">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 lg:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            
            <div className="space-y-6">
              {mode === 'reset-sent' ? (
                <div className="text-center space-y-4 py-8 animate-in zoom-in">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold italic uppercase tracking-tight">Email Sent</h3>
                  <p className="text-slate-400 text-sm font-medium">Please check your inbox for instructions to reset your access key.</p>
                  <button onClick={() => setMode('signin')} className="text-amber-500 font-bold uppercase text-xs tracking-widest underline underline-offset-4">Return to Login</button>
                </div>
              ) : (
                <>
                  <div className="text-center lg:text-left">
                    <h3 className="text-2xl lg:text-3xl font-bold tracking-tight italic uppercase text-white">
                      {mode === 'signin' ? 'LOG IN' : mode === 'signup' ? 'SIGN UP' : 'RESET KEY'}
                    </h3>
                    <p className="text-slate-500 font-semibold text-xs">
                      {mode === 'signin' ? 'Welcome back to your command center.' : mode === 'signup' ? 'Create and update your profile details.' : 'Enter your email to recover access.'}
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
                      <span className="tracking-tight">CONTINUE WITH GOOGLE</span>
                    </button>
                    
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>
                  </div>

                  {mode !== 'forgot-password' && (
                    <div className="flex bg-slate-950/30 p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => setRole('customer')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-bold transition-all uppercase tracking-widest ${
                          role === 'customer' ? 'bg-amber-500 text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        CUSTOMER
                      </button>
                      <button
                        onClick={() => setRole('transporter')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-bold transition-all uppercase tracking-widest ${
                          role === 'transporter' ? 'bg-amber-500 text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        TRANSPORTER
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={14} />
                        <input
                          type="email"
                          required
                          placeholder="partner@gadidost.com"
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          className="w-full bg-slate-950/20 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm focus:border-amber-500/30 outline-none transition-all placeholder:text-slate-800"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    {mode !== 'forgot-password' && (
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Access Pin</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={14} />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full bg-slate-950/20 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm focus:border-amber-500/30 outline-none transition-all placeholder:text-slate-800"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && (
                      <div className="space-y-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-center">Complete Your Profile Details</p>
                        
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Full Name</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={14} />
                            <input
                              type="text"
                              required
                              placeholder="John Doe"
                              className="w-full bg-slate-950/20 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm focus:border-amber-500/30 outline-none transition-all placeholder:text-slate-800"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Phone</label>
                            <div className="relative group">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                              <input
                                type="tel"
                                placeholder="+91..."
                                className="w-full bg-slate-950/20 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm focus:border-amber-500/30 outline-none transition-all"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Business</label>
                            <div className="relative group">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                              <input
                                type="text"
                                placeholder="Co. Name"
                                className="w-full bg-slate-950/20 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm focus:border-amber-500/30 outline-none transition-all"
                                value={formData.businessName}
                                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Address</label>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-4 text-slate-500" size={14} />
                            <textarea
                              placeholder="Full Office Address"
                              rows={2}
                              className="w-full bg-slate-950/20 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-semibold text-sm focus:border-amber-500/30 outline-none transition-all resize-none"
                              value={formData.address}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1">
                      {mode === 'signin' && (
                        <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400">Lost Key?</button>
                      )}
                      {mode === 'forgot-password' && (
                        <button type="button" onClick={() => setMode('signin')} className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400">Back to Login</button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 group"
                    >
                      <span className="italic">{loading ? 'PROCESSING...' : mode === 'signin' ? 'ENTER HIGHWAY' : mode === 'signup' ? 'CREATE PROFILE' : 'SEND RESET LINK'}</span>
                      {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} strokeWidth={3} />}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <p className="text-slate-500 font-semibold text-[11px]">
                      {mode === 'signin' ? "New Transport Partner?" : "Already a member?"}{' '}
                      <button
                        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); resetState(); }}
                        className="text-amber-500 font-bold hover:text-amber-400 underline underline-offset-4 transition-all uppercase italic ml-1"
                      >
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
