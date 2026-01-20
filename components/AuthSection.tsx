
import React, { useState } from 'react';
import { Mail, Lock, User, Truck, ArrowRight, ShieldCheck, CheckCircle2, MailCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthSectionProps {
  t: any;
}

const AuthSection: React.FC<AuthSectionProps> = ({ t }) => {
  type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-sent';
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            // We pass the intended role in metadata if possible, 
            // though standard OAuth users default to customer
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
      setLoading(false);
    }
  };

  const resetFormState = () => {
    setFormData({ email: '', password: '', name: '' });
    setEmailError(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { role, name: formData.name }
          }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    switch (mode) {
      case 'forgot-password':
        return (
          <div className="space-y-8 animate-in fade-in">
            <div className="text-center lg:text-left">
              <h3 className="text-4xl font-black text-slate-950 dark:text-white mb-3 tracking-tight">Reset Password</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Enter your email to receive a secure recovery link.</p>
            </div>
            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 border border-red-100 dark:border-red-900/30">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{errorMsg}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className={`w-full bg-white dark:bg-slate-900 border-2 rounded-2xl py-5 pl-12 pr-4 transition-all text-lg font-bold ${
                      emailError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-orange-500'
                    }`}
                    value={formData.email}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 dark:bg-orange-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Send Reset Link <ArrowRight size={22} />
              </button>
            </form>
            <div className="text-center">
              <button onClick={() => setMode('signin')} className="font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest text-sm border-b-2 border-orange-200 transition-all">← Back to Sign In</button>
            </div>
          </div>
        );
      case 'reset-sent':
        return (
          <div className="text-center space-y-8 animate-in fade-in zoom-in">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-xl">
              <MailCheck size={48} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-slate-950 dark:text-white mb-3 tracking-tighter">Check your inbox</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xl font-medium max-w-sm mx-auto">
                We've sent a recovery link to <span className="font-black text-slate-950 underline decoration-orange-500">{formData.email}</span>.
              </p>
            </div>
            <button
              onClick={() => { setMode('signin'); resetFormState(); }}
              className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-2xl"
            >
              Return to Login
            </button>
          </div>
        );
      case 'signin':
      case 'signup':
      default:
        return (
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-8 scale-110">
                 <div className="bg-orange-500 p-2.5 rounded-xl">
                   <Truck className="text-white" size={32} strokeWidth={2.5} />
                 </div>
                 <span className="text-4xl font-black text-slate-950 uppercase tracking-tighter">{t.appName}</span>
              </div>
              <h3 className="text-5xl font-black text-slate-950 dark:text-white mb-3 tracking-tighter">
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xl font-medium">
                {mode === 'signin' ? 'Manage your fleet like a pro.' : 'Join 50,000+ Indian transporters today.'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 border border-red-100">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{errorMsg}</p>
              </div>
            )}

            {/* Social Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-4 group active:scale-[0.98] shadow-sm"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 11h11v2H12z" />
                <path fill="#4285F4" d="M23 12c0-0.7-0.1-1.3-0.2-2H12v4h6.3c-0.3 1.5-1.1 2.8-2.3 3.7l3.7 2.8c2.2-2 3.5-5 3.5-8.5z" />
                <path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.7-2.8c-1 0.7-2.4 1.2-3.7 1.2-2.9 0-5.3-2-6.2-4.6l-3.8 2.9C3.8 20.3 7.6 23 12 23z" />
                <path fill="#FBBC05" d="M5.8 14.1c-0.2-0.7-0.3-1.4-0.3-2.1s0.1-1.4 0.3-2.1l-3.8-2.9C1.1 8.8 1 10.4 1 12s0.1 3.2 1 4.7l3.8-2.9z" />
                <path fill="#EA4335" d="M12 4.8c1.6 0 3.1 0.6 4.2 1.6l3.1-3.1C17.4 1.3 14.9 0 12 0 7.6 0 3.8 2.7 2 6.4l3.8 2.9c0.9-2.6 3.3-4.5 6.2-4.5z" />
              </svg>
              CONTINUE WITH GOOGLE
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase"><span className="bg-white dark:bg-slate-950 px-4 text-slate-400">Or use email instead</span></div>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setRole('customer')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[14px] text-sm font-black transition-all ${
                  role === 'customer' ? 'bg-slate-950 text-white shadow-2xl scale-[1.02]' : 'text-slate-500'
                }`}
              >
                <User size={18} /> CUSTOMER
              </button>
              <button
                onClick={() => setRole('transporter')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[14px] text-sm font-black transition-all ${
                  role === 'transporter' ? 'bg-slate-950 text-white shadow-2xl scale-[1.02]' : 'text-slate-500'
                }`}
              >
                <Truck size={18} /> TRANSPORTER
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold"
                    value={formData.email}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {mode === 'signin' && (
                <div className="text-right">
                  <button type="button" onClick={() => { setMode('forgot-password'); setEmailError(null); }} className="text-sm font-black text-orange-600 uppercase tracking-widest underline underline-offset-4">Forgot Password?</button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 dark:bg-orange-500 text-white py-6 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <> {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /></>}
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-lg font-bold text-slate-500">
                {mode === 'signin' ? "Don't have an account?" : "Already joined?"}{' '}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); resetFormState(); }}
                  className="font-black text-orange-600 underline decoration-4 underline-offset-8"
                >
                  {mode === 'signin' ? 'Sign Up Free' : 'Sign In Now'}
                </button>
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      <div className="hidden lg:flex lg:w-5/12 bg-slate-950 p-20 flex-col justify-between relative overflow-hidden shadow-2xl z-10 border-r border-white/5">
        <div className="relative z-20">
          <div className="flex items-center gap-4 text-white mb-16">
            <div className="bg-orange-500 p-3.5 rounded-2xl shadow-2xl shadow-orange-500/40">
              <Truck size={42} strokeWidth={2.5} className="text-white" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase">{t.appName}</h1>
          </div>
          <h2 className="text-7xl font-black text-white leading-[1] mb-10 tracking-tight">
            The New Standard <br /> for Indian Transport.
          </h2>
          <p className="text-slate-400 text-2xl font-medium max-w-lg leading-relaxed">
            Revolutionizing logistics with AI-powered load estimation, real-time GPS tracking, and instant SOS dispatch.
          </p>
        </div>
        
        <div className="relative z-20 space-y-6">
           <div className="flex items-center gap-6 group">
             <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-xl">
               <ShieldCheck size={32} strokeWidth={2.5} />
             </div>
             <div><p className="text-white font-black text-xl">Highway Verified</p><p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Secured Logistics Network</p></div>
           </div>
           <div className="flex items-center gap-6 group">
             <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-xl">
               <CheckCircle2 size={32} strokeWidth={2.5} />
             </div>
             <div><p className="text-white font-black text-xl">Digital Proof</p><p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Instant POD & Bilty Sync</p></div>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-white dark:bg-slate-950">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
