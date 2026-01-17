
import React, { useState } from 'react';
import { Send, Settings, ShieldCheck, Cpu, ChevronRight, Check, MapPin, Clock } from 'lucide-react';
import { Sensor } from '../types';

const sensors: Sensor[] = [
  { id: '1', name: 'Fuel Sensor', price: '₹4,500', features: ['Real-time level', 'Theft alerts', 'Consumption tracking'], compatibility: 'All Diesel Trucks' },
  { id: '2', name: 'Blinking Sensor', price: '₹1,200', features: ['Indicator sync', 'Hazard warnings'], compatibility: 'Universal' },
  { id: '3', name: 'Door Sensor', price: '₹2,100', features: ['Open/Close logs', 'Mobile notifications'], compatibility: 'Container Trucks' },
  { id: '4', name: 'Temperature Sensor', price: '₹6,800', features: ['Cold storage monitoring', 'High temp alerts'], compatibility: 'Reefer Trucks' },
];

const GPSSection: React.FC<{ t: any }> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'request' | 'install' | 'premium' | 'sensors'>('request');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const tabs = [
    { id: 'request', label: t.gpsRequest, icon: Send },
    { id: 'install', label: t.installGps, icon: Settings },
    { id: 'premium', label: t.buyPremium, icon: ShieldCheck },
    { id: 'sensors', label: t.sensors, icon: Cpu },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold">{t.gps}</h2>
        <p className="text-slate-500">Advanced fleet tracking and sensor ecosystem.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-amber-500 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon size={18} />
            <span className="font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm min-h-[400px]">
        {activeTab === 'request' && (
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-6">Send GPS Request to Vendors</h3>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Check className="text-green-600" size={48} />
                </div>
                <h4 className="text-xl font-bold">Request Sent!</h4>
                <p className="text-slate-500">Nearby vendors will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Number</label>
                    <input type="text" placeholder="MH 12 AB 1234" className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-xl p-4 focus:ring-2 focus:ring-amber-500" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Type</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-xl p-4 focus:ring-2 focus:ring-amber-500">
                      <option>LCV (Mini Truck)</option>
                      <option>Open Body Truck</option>
                      <option>Container</option>
                      <option>Trailers</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <textarea rows={3} placeholder="Any specific requirements..." className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-xl p-4 focus:ring-2 focus:ring-amber-500" />
                </div>
                <button type="submit" className="w-full md:w-auto px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-colors shadow-lg">
                  Submit Request
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'sensors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Sensors Marketplace</h3>
              <p className="text-sm text-slate-500">Live monitoring for your fleet</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sensors.map((s) => (
                <div key={s.id} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-amber-500 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold">{s.name}</h4>
                      <p className="text-amber-500 font-bold text-lg">{s.price}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm">
                      <Cpu className="text-slate-400 group-hover:text-amber-500" size={24} />
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {s.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <ChevronRight size={14} className="text-amber-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-400">Comp: {s.compatibility}</span>
                    <button className="text-amber-600 font-bold hover:underline">One-click Request</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'premium' && (
          <div className="text-center max-w-xl mx-auto py-12">
            <div className="bg-amber-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
              <ShieldCheck size={48} />
            </div>
            <h3 className="text-3xl font-bold mb-4">GPS Premium Dashboard</h3>
            <p className="text-slate-500 mb-8">Unlock live tracking, route history, geo-fencing, and over-speed alerts for your entire fleet.</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-slate-500">Live Uptime</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                <p className="text-2xl font-bold">30 Days</p>
                <p className="text-xs text-slate-500">Route History</p>
              </div>
            </div>
            <button className="w-full px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-amber-600">
              Upgrade Now @ ₹1,999 / year
            </button>
          </div>
        )}

        {activeTab === 'install' && (
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">Schedule Installation</h3>
            <p className="text-slate-500 mb-8">Certified technicians will visit your location.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center gap-4">
                <MapPin className="text-amber-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Your Location</p>
                  <p className="font-bold">Nashik Highway, Pune</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center gap-4">
                <Clock className="text-amber-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Earliest Slot</p>
                  <p className="font-bold">Today, 2:00 PM</p>
                </div>
              </div>
            </div>
            <button className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold">
              Schedule Technician
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPSSection;
