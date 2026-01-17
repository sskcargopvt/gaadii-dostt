
import React from 'react';
import { ExternalLink, FileText, Download, Upload, Plus, Search, Filter, ShieldCheck } from 'lucide-react';

const BiltySection: React.FC<{ t: any }> = ({ t }) => {
  const biltyUrl = 'https://www.biltybook.online/';

  const mockBilties = [
    { id: 'BL-8821', customer: 'Shree Cement Ltd', date: '22 Oct 2023', status: 'Delivered', weight: '22T' },
    { id: 'BL-8835', customer: 'Tata Steel', date: '24 Oct 2023', status: 'In Transit', weight: '15T' },
    { id: 'BL-8842', customer: 'Reliance Ind', date: '25 Oct 2023', status: 'Draft', weight: '18T' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-left duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">{t.bilty}</h2>
          <p className="text-slate-500 dark:text-slate-400">Secure digital document management system.</p>
        </div>
        <div className="flex gap-3">
          <a 
            href={biltyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <ExternalLink size={18} />
            Open Bilty Software
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Plus className="text-amber-500" size={18} />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-medium hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-200">
                <FileText size={16} /> New Digital Bilty
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-medium hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-200">
                <Upload size={16} /> Bulk Import CSV
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-medium hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-200">
                <Download size={16} /> Archive Logs
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900 dark:bg-amber-500/10 p-6 rounded-3xl border border-slate-800 dark:border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Security</span>
            </div>
            <p className="text-white dark:text-amber-200 text-xs leading-relaxed">
              Your documentation is encrypted and synced with <strong>BiltyBook Online</strong> for legal compliance.
            </p>
          </div>

          <div className="bg-emerald-500 rounded-3xl p-6 text-white text-center shadow-lg shadow-emerald-500/20">
            <p className="text-xs uppercase font-black tracking-widest opacity-80 mb-2">Paper Saved</p>
            <p className="text-4xl font-black">12.5k</p>
            <p className="text-xs mt-2">Bilty pages digitized this month</p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by Bilty ID or Customer..." 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl p-3 pl-12 focus:ring-2 focus:ring-amber-500 text-sm" 
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <Filter size={18} /> Filters
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-black">
                  <tr>
                    <th className="px-6 py-4">Bilty ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockBilties.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors group">
                      <td className="px-6 py-4 font-bold text-amber-600">{b.id}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{b.customer}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{b.date}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                          b.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                          b.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-amber-500 transition-colors">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 text-center">
              <button className="text-sm font-bold text-slate-500 hover:text-amber-600 underline transition-colors">
                View All Documentation History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiltySection;
