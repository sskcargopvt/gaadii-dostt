
import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Settings, 
  ShieldCheck, 
  Cpu, 
  ChevronRight, 
  Check, 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Lock, 
  Zap, 
  Navigation,
  Activity,
  Maximize2,
  MoreVertical,
  Fuel,
  Share2,
  Wind,
  Truck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sensor } from '../types';
import { supabase } from '../services/supabaseClient';
import MapComponent from './MapComponent';

const sensors: Sensor[] = [
  { id: '1', name: 'Fuel Sensor', price: '₹4,500', features: ['Real-time level', 'Theft alerts', 'Consumption tracking'], compatibility: 'All Diesel Trucks' },
  { id: '2', name: 'Blinking Sensor', price: '₹1,200', features: ['Indicator sync', 'Hazard warnings'], compatibility: 'Universal' },
  { id: '3', name: 'Door Sensor', price: '₹2,100', features: ['Open/Close logs', 'Mobile notifications'], compatibility: 'Container Trucks' },
  { id: '4', name: 'Temperature Sensor', price: '₹6,800', features: ['Cold storage monitoring', 'High temp alerts'], compatibility: 'Reefer Trucks' },
];

const fleetSummaryData = [
  { name: 'Running', value: 1, color: '#10b981' },
  { name: 'Stopped', value: 2, color: '#ef4444' },
  { name: 'Inactive', value: 0, color: '#6366f1' },
  { name: 'No Data', value: 1, color: '#4b5563' },
  { name: 'Idle', value: 0, color: '#f59e0b' },
];

const GPSSection: React.FC<{ t: any }> = ({ t }) => {
  const [activeMode, setActiveMode] = useState<'marketplace' | 'live'>('live');
  const [activeTab, setActiveTab] = useState<'request' | 'install' | 'premium' | 'sensors'>('request');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'LCV (Mini Truck)',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('gps_requests').insert([{
        vehicle_number: formData.vehicleNumber,
        vehicle_type: formData.vehicleType,
        description: formData.description,
        status: 'pending'
      }]);
      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({ vehicleNumber: '', vehicleType: 'LCV (Mini Truck)', description: '' });
    } catch (err) {
      console.error('Supabase Error:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'request', label: t.gpsRequest, icon: Send },
    { id: 'install', label: t.installGps, icon: Settings },
    { id: 'premium', label: t.buyPremium, icon: ShieldCheck },
    { id: 'sensors', label: t.sensors, icon: Cpu },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{t.gps}</h2>
          <p className="text-slate-500 font-medium">Professional Fleet Management & Tracking</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => setActiveMode('live')}
            className={`px-6 py-2 rounded-[14px] text-sm font-black transition-all ${activeMode === 'live' ? 'bg-[#1a2b3c] dark:bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Live Tracking
          </button>
          <button 
            onClick={() => setActiveMode('marketplace')}
            className={`px-6 py-2 rounded-[14px] text-sm font-black transition-all ${activeMode === 'marketplace' ? 'bg-[#1a2b3c] dark:bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {activeMode === 'live' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[700px]">
          {/* Main Map View */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative flex-1 bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
              <MapComponent 
                startPos={{ lat: 28.5355, lng: 77.3910 }}
                endPos={{ lat: 28.4744, lng: 77.5030 }}
                currentPosition={{ lat: 28.5055, lng: 77.4470 }}
              />
            </div>
            
            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-2xl flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">1 RUNNING</span>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-2xl flex items-center gap-3">
                 <div className="w-2 h-2 bg-red-500 rounded-full" />
                 <span className="text-xs font-black text-red-700 dark:text-red-400">2 STOPPED</span>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-2xl flex items-center gap-3">
                 <div className="w-2 h-2 bg-amber-500 rounded-full" />
                 <span className="text-xs font-black text-amber-700 dark:text-amber-400">0 IDLE</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-3">
                 <div className="w-2 h-2 bg-slate-500 rounded-full" />
                 <span className="text-xs font-black text-slate-700 dark:text-slate-400">1 NO DATA</span>
              </div>
            </div>
          </div>

          {/* Fleet Details Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">Gadi Dost</h3>
                <Settings size={20} className="text-slate-400" />
              </div>

              {/* Status Chart */}
              <div className="h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fleetSummaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {fleetSummaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-slate-400 text-[10px] font-black uppercase">Total</span>
                  <span className="text-3xl font-black">3</span>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Search here..." 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-amber-500" 
                  />
                </div>
                <button className="bg-[#3b82f6] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <Filter size={16} /> Filter
                </button>
              </div>

              {/* Vehicle List */}
              <div className="space-y-4">
                {[
                  { id: "UP14LT2460", dist: "93.05 km", status: 'Running', color: 'emerald' },
                ].map((v, i) => (
                  <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[28px] border border-slate-100 dark:border-slate-800 hover:border-amber-500 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
                           <Truck size={32} className="text-slate-700 dark:text-slate-200" />
                        </div>
                        <div>
                          <h5 className="font-black text-sm tracking-tight">{v.id}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase">{v.status}</span>
                            <div className={`w-2 h-2 rounded-full ${v.status === 'Running' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1">
                        <Navigation size={10} /> {v.dist}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[24px] text-sm font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon size={22} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-[40px] p-10 border border-slate-100 dark:border-slate-700 shadow-sm min-h-[500px]">
            {activeTab === 'request' && (
              <div className="max-w-2xl">
                <h3 className="text-3xl font-black mb-2">Send GPS Request</h3>
                <p className="text-slate-500 mb-10">Connect with India's largest network of verified GPS vendors.</p>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center animate-in zoom-in">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full mb-6">
                      <Check className="text-emerald-600" size={48} />
                    </div>
                    <h4 className="text-2xl font-black">Request Sent Successfully!</h4>
                    <p className="text-slate-500 mt-2">Vendors are reviewing your details and will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Vehicle Number</label>
                        <input 
                          type="text" 
                          placeholder="MH 12 AB 1234" 
                          className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-5 pl-6 focus:ring-2 focus:ring-amber-500 font-bold" 
                          required 
                          value={formData.vehicleNumber}
                          onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Vehicle Type</label>
                        <select 
                          className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-5 px-6 focus:ring-2 focus:ring-amber-500 font-bold"
                          value={formData.vehicleType}
                          onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                        >
                          <option>LCV (Mini Truck)</option>
                          <option>Open Body Truck</option>
                          <option>Container</option>
                          <option>Trailers</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Additional Requirements</label>
                      <textarea 
                        rows={4} 
                        placeholder="Tell vendors what sensors or features you need..." 
                        className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl p-6 focus:ring-2 focus:ring-amber-500 font-bold"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full md:w-auto px-12 py-5 bg-[#1a2b3c] dark:bg-amber-500 text-white rounded-[24px] font-black text-lg hover:scale-[1.02] active:scale-[0.98] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      Submit Request to Cloud
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSSection;
