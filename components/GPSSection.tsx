
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
  Truck,
  ShoppingCart,
  CheckCircle2,
  PackageSearch
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
  { id: '5', name: 'Axle Load Sensor', price: '₹8,200', features: ['Weight monitoring', 'Overload prevention'], compatibility: 'Heavy Trailers' },
  { id: '6', name: 'Driver Fatigue Monitor', price: '₹5,500', features: ['AI eye tracking', 'Alert sounds'], compatibility: 'Long Haul Fleets' },
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
  const [sensorSearch, setSensorSearch] = useState('');
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'LCV (Mini Truck)',
    description: ''
  });

  const filteredSensors = useMemo(() => {
    return sensors.filter(s => s.name.toLowerCase().includes(sensorSearch.toLowerCase()));
  }, [sensorSearch]);

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
          <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-1">{t.gps}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Professional Fleet Management & Tracking</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => setActiveMode('live')}
            className={`px-8 py-2.5 rounded-[20px] text-sm font-black transition-all uppercase tracking-tighter ${activeMode === 'live' ? 'bg-slate-950 dark:bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Live Tracking
          </button>
          <button 
            onClick={() => setActiveMode('marketplace')}
            className={`px-8 py-2.5 rounded-[20px] text-sm font-black transition-all uppercase tracking-tighter ${activeMode === 'marketplace' ? 'bg-slate-950 dark:bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
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
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-2xl flex items-center gap-3 border border-emerald-200 dark:border-emerald-800">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">1 RUNNING</span>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-800">
                 <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                 <span className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest">2 STOPPED</span>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-2xl flex items-center gap-3 border border-amber-200 dark:border-amber-800">
                 <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                 <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">0 IDLE</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                 <div className="w-2.5 h-2.5 bg-slate-500 rounded-full" />
                 <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">1 NO DATA</span>
              </div>
            </div>
          </div>

          {/* Fleet Details Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Gadi Dost Fleet</h3>
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
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-black">3</span>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Search by Plate Number..." 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10" 
                  />
                </div>
                <button className="bg-slate-950 text-white px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-colors">
                  <Filter size={16} /> Filter
                </button>
              </div>

              {/* Vehicle List */}
              <div className="space-y-4">
                {[
                  { id: "UP14LT2460", dist: "93.05 km", status: 'Running', color: 'emerald', driver: 'Arun M.' },
                ].map((v, i) => (
                  <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:border-amber-500 transition-all cursor-pointer group shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-700">
                           <Truck size={32} strokeWidth={2.5} className="text-slate-950 dark:text-white" />
                        </div>
                        <div>
                          <h5 className="font-black text-sm tracking-tight">{v.id}</h5>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{v.driver}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{v.status}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1">
                        <Navigation size={10} strokeWidth={3} /> {v.dist}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-5 px-6 py-5 rounded-[28px] text-sm font-black transition-all uppercase tracking-tighter ${
                  activeTab === tab.id 
                    ? 'bg-amber-500 text-white shadow-2xl shadow-amber-500/30 scale-[1.02]' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-100 dark:border-slate-700 shadow-sm'
                }`}
              >
                <tab.icon size={24} strokeWidth={2.5} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-[48px] p-10 lg:p-14 border border-slate-100 dark:border-slate-700 shadow-3xl min-h-[600px]">
            {activeTab === 'request' && (
              <div className="max-w-2xl animate-in fade-in duration-500">
                <h3 className="text-4xl font-black mb-2 uppercase tracking-tighter">New Hardware Request</h3>
                <p className="text-slate-500 font-bold text-lg mb-12 italic">Connect with India's largest network of verified GPS vendors.</p>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center h-80 text-center animate-in zoom-in">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-8 rounded-full mb-8 shadow-2xl shadow-emerald-500/20">
                      <Check className="text-emerald-600" size={64} strokeWidth={3} />
                    </div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter">Request Broadcasted!</h4>
                    <p className="text-slate-500 mt-3 font-bold">5 nearby vendors have been notified. Expect a call in 10 mins.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Vehicle Plate No.</label>
                        <input 
                          type="text" 
                          placeholder="UP 14 AB 0001" 
                          className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[20px] py-5 pl-8 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-black text-lg uppercase transition-all" 
                          required 
                          value={formData.vehicleNumber}
                          onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Chassis Type</label>
                        <select 
                          className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[20px] py-5 px-8 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-black text-lg appearance-none cursor-pointer transition-all"
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
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Job Description</label>
                      <textarea 
                        rows={4} 
                        placeholder="e.g. Need Fuel Sensor + 1 Camera for back monitoring." 
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[24px] p-8 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-bold text-lg transition-all"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full md:w-auto px-16 py-6 bg-slate-950 dark:bg-amber-500 text-white rounded-[24px] font-black text-xl hover:bg-black dark:hover:bg-amber-600 active:scale-95 shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                    >
                      {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={24} strokeWidth={3} /> BROADCAST TO MARKET</>}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'sensors' && (
              <div className="animate-in fade-in duration-500 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter">Sensor Add-ons</h3>
                    <p className="text-slate-500 font-bold">Enhance your fleet intelligence with precision hardware.</p>
                  </div>
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} strokeWidth={2.5} />
                    <input 
                      type="text" 
                      placeholder="Search sensors..." 
                      className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-700 rounded-[28px] py-6 pl-16 pr-8 font-black text-lg focus:border-amber-500 focus:ring-0 transition-all shadow-sm"
                      value={sensorSearch}
                      onChange={(e) => setSensorSearch(e.target.value)}
                    />
                  </div>
                </div>

                {filteredSensors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredSensors.map((sensor) => (
                      <div key={sensor.id} className="bg-white dark:bg-slate-900 rounded-[40px] border-2 border-slate-100 dark:border-slate-800 p-8 shadow-xl hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group">
                        <div className="flex justify-between items-start mb-8">
                          <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-3xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Cpu size={36} strokeWidth={2.5} />
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{sensor.price}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inst. Inclusive</span>
                          </div>
                        </div>
                        
                        <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">{sensor.name}</h4>
                        
                        <div className="space-y-3 mb-8">
                          {sensor.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                              <CheckCircle2 size={16} className="text-amber-500" strokeWidth={3} />
                              {feature}
                            </div>
                          ))}
                        </div>

                        <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            {sensor.compatibility}
                          </div>
                          <button className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-xl">
                            <ShoppingCart size={16} strokeWidth={3} /> ADD TO CART
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 flex flex-col items-center text-center">
                    <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[48px] border-4 border-dashed border-slate-200 dark:border-slate-800 mb-8 text-slate-200">
                      <PackageSearch size={100} strokeWidth={1} />
                    </div>
                    <h4 className="text-3xl font-black text-slate-300 uppercase tracking-tighter">No sensors matched</h4>
                    <p className="text-slate-500 font-bold mt-2">Try searching for 'Fuel', 'Axle', or 'Driver'</p>
                    <button 
                      onClick={() => setSensorSearch('')} 
                      className="mt-8 text-amber-500 font-black uppercase tracking-widest text-sm border-b-4 border-amber-500/20 hover:border-amber-500 transition-all"
                    >
                      Clear Search
                    </button>
                  </div>
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
