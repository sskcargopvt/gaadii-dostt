
import React, { useState } from 'react';
import { Mail, Lock, User, Truck, ArrowRight, ShieldCheck, CheckCircle2, MailCheck, AlertCircle } from 'lucide-react';
import { UserRole, User as UserType } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthSectionProps {
  onLogin: (user: UserType) => void;
  t: any;
}

const AuthSection: React.FC<AuthSectionProps> = ({ onLogin, t }) => {
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
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: role,
              name: formData.name
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          onLogin({
            id: data.user.id,
            email: data.user.email!,
            role: role,
            name: formData.name
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        if (data.user) {
          onLogin({
            id: data.user.id,
            email: data.user.email!,
            role: data.user.user_metadata.role || 'customer',
            name: data.user.user_metadata.name || data.user.email!.split('@')[0]
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
      if (error) throw error;
      setMode('reset-sent');
    } catch (err: any) {
      setErrorMsg(err.message);
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
            <form onSubmit={handlePasswordResetRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className={`w-full bg-white dark:bg-slate-900 border-2 rounded-2xl py-5 pl-12 pr-4 transition-all text-lg font-bold text-slate-950 dark:text-white ${
                      emailError
                        ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                    }`}
                    value={formData.email}
                    onChange={handleEmailChange}
                  />
                </div>
                {emailError && (
                  <p className="text-red-600 text-xs mt-2 ml-1 font-black uppercase tracking-wider" role="alert">{emailError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 dark:bg-orange-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-black dark:hover:bg-orange-600 transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Reset Link <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" /></>}
              </button>
            </form>
            <div className="text-center">
              <button onClick={() => setMode('signin')} className="font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest text-sm border-b-2 border-orange-200 hover:border-orange-600 transition-all">← Back to Sign In</button>
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
                We've sent a recovery link to <span className="font-black text-slate-950 dark:text-white underline decoration-orange-500 decoration-4">{formData.email}</span>.
              </p>
            </div>
            <button
              onClick={() => { setMode('signin'); resetFormState(); }}
              className="w-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white py-5 rounded-2xl font-black text-xl hover:bg-black dark:hover:bg-slate-100 transition-all shadow-2xl flex items-center justify-center gap-3"
            >
              Return to Login
            </button>
          </div>
        );
      case 'signin':
      case 'signup':
      default:
        return (
          <div className="space-y-10">
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-8 scale-110">
                 <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
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
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 border border-red-100 dark:border-red-900/30">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{errorMsg}</p>
              </div>
            )}

            <div className="flex bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setRole('customer')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[14px] text-sm font-black transition-all ${
                  role === 'customer' 
                    ? 'bg-slate-950 text-white shadow-2xl scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <User size={18} strokeWidth={2.5} /> CUSTOMER
              </button>
              <button
                onClick={() => setRole('transporter')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[14px] text-sm font-black transition-all ${
                  role === 'transporter' 
                    ? 'bg-slate-950 text-white shadow-2xl scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Truck size={18} strokeWidth={2.5} /> TRANSPORTER
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl py-5 pl-12 pr-4 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-lg font-bold text-slate-950 dark:text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className={`w-full bg-white dark:bg-slate-900 border-2 rounded-2xl py-5 pl-12 pr-4 transition-all text-lg font-bold text-slate-950 dark:text-white ${
                      emailError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                    }`}
                    value={formData.email}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl py-5 pl-12 pr-4 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-lg font-bold text-slate-950 dark:text-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {mode === 'signin' && (
                <div className="text-right">
                  <button type="button" onClick={() => { setMode('forgot-password'); setEmailError(null); }} className="text-sm font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest underline decoration-2 underline-offset-4">Forgot Password?</button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 dark:bg-orange-500 text-white py-6 rounded-2xl font-black text-xl hover:bg-black dark:hover:bg-orange-600 transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <> {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" /></>}
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-lg font-bold text-slate-500">
                {mode === 'signin' ? "Don't have an account?" : "Already joined?"}{' '}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); resetFormState(); }}
                  className="font-black text-orange-600 hover:text-orange-700 underline decoration-4 underline-offset-8"
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
      {/* High Contrast Professional Side Panel */}
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
             <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-xl">
               <ShieldCheck size={32} strokeWidth={2.5} />
             </div>
             <div>
               <p className="text-white font-black text-xl">Highway Verified</p>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Secured Logistics Network</p>
             </div>
           </div>
           <div className="flex items-center gap-6 group">
             <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-xl">
               <CheckCircle2 size={32} strokeWidth={2.5} />
             </div>
             <div>
               <p className="text-white font-black text-xl">Digital Proof</p>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Instant POD & Bilty Sync</p>
             </div>
           </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Brighter, Crisp Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-white dark:bg-slate-950">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
