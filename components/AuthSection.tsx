
import React, { useState } from 'react';
import { Mail, Lock, User, Truck, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserRole, User as UserType } from '../types';

interface AuthSectionProps {
  onLogin: (user: UserType) => void;
  t: any;
}

const AuthSection: React.FC<AuthSectionProps> = ({ onLogin, t }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin({
        email: formData.email,
        role: role,
        name: formData.name || formData.email.split('@')[0]
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-amber-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Truck size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">{t.appName}</h1>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Connecting India's <br /> Logistics Ecosystem.
          </h2>
          <p className="text-amber-100 text-lg max-w-md">
            The all-in-one platform for fleet owners and load providers to manage trips, documents, and emergencies.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl">
            <ShieldCheck className="text-amber-200 mb-3" size={24} />
            <p className="text-white font-bold">100% Verified</p>
            <p className="text-amber-100 text-xs">All partners are GPS verified</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl">
            <CheckCircle2 className="text-amber-200 mb-3" size={24} />
            <p className="text-white font-bold">Safe Payments</p>
            <p className="text-amber-100 text-xs">Secure digital escrow system</p>
          </div>
        </div>

        {/* Decorative Truck Background */}
        <Truck size={400} className="absolute -right-20 -bottom-20 text-white/10 rotate-[-15deg] pointer-events-none" />
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
               <Truck className="text-amber-500" size={32} />
               <span className="text-2xl font-black text-amber-500">{t.appName}</span>
            </div>
            <h3 className="text-3xl font-black mb-2">
              {mode === 'signin' ? 'Welcome Back!' : 'Join the Fleet'}
            </h3>
            <p className="text-slate-500">
              {mode === 'signin' ? 'Manage your transport business seamlessly.' : 'Start your logistics journey with Gadi Dost today.'}
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
            <button
              onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                role === 'customer' 
                  ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={16} /> Customer
            </button>
            <button
              onClick={() => setRole('transporter')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                role === 'transporter' 
                  ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Truck size={16} /> Transporter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {mode === 'signin' && (
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-amber-600 hover:underline">Forgot Password?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="font-bold text-amber-600 hover:underline"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] text-center text-slate-400 uppercase font-black tracking-widest">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
