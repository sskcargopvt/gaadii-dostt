import React, { useEffect } from 'react';
import { Globe, ExternalLink, FileText, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface BiltySectionProps {
  t: any;
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const BiltySection: React.FC<BiltySectionProps> = ({ t, user, onUpdate }) => {
  const biltyUrl = 'https://www.biltybook.online';

  // Automatically open Bilty Book when section loads
  useEffect(() => {
    // Optional: Auto-open on mount (commented out by default)
    // window.open(biltyUrl, '_blank');
  }, []);

  const handleOpenBiltyBook = () => {
    window.open(biltyUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 animate-in slide-in-from-left duration-500">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[32px] md:rounded-[48px] p-8 md:p-12 lg:p-20 shadow-2xl relative overflow-hidden group">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-white/30 shadow-xl">
                <FileText size={48} className="text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none mb-4 text-white">
              {t.bilty}
            </h2>
            <p className="text-white/90 text-lg md:text-xl font-bold mb-8 md:mb-12 max-w-2xl mx-auto">
              Professional Digital Bilty Management System
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                <Zap size={32} className="text-white mb-3 mx-auto" />
                <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wider">Fast & Efficient</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                <ShieldCheck size={32} className="text-white mb-3 mx-auto" />
                <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wider">Secure Platform</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
                <Globe size={32} className="text-white mb-3 mx-auto" />
                <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wider">Cloud Based</p>
              </div>
            </div>

            {/* Main CTA Button */}
            <button
              onClick={handleOpenBiltyBook}
              className="group/btn inline-flex items-center gap-3 md:gap-4 bg-white text-indigo-600 px-8 py-4 md:px-12 md:py-6 rounded-3xl font-black text-sm md:text-lg uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-white/20 w-full md:w-auto justify-center"
            >
              <Globe size={24} className="group-hover/btn:rotate-12 transition-transform" />
              Open Bilty Book
              <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
            </button>

            {/* Secondary Info */}
            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-2 text-white/80 text-xs md:text-sm text-center">
              <ExternalLink size={16} className="hidden md:block" />
              <span className="font-bold break-all">Opens in new tab: {biltyUrl}</span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 border-8 border-white/10 rounded-full group-hover:scale-110 transition-transform duration-1000 hidden md:block"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 border-8 border-white/10 rounded-full group-hover:scale-110 transition-transform duration-1000 hidden md:block"></div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-black uppercase mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              What is Bilty Book?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Bilty Book is India's leading digital platform for managing transport documents, bilties, and logistics paperwork efficiently and securely.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-black uppercase mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Quick Access
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Click the button above to instantly access Bilty Book Online and manage all your transport documentation in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiltySection;
