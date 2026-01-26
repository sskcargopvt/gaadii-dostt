
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Send, 
  Settings, 
  ShieldCheck, 
  Cpu, 
  Check, 
  MapPin, 
  Search, 
  Navigation,
  Activity,
  Truck,
  ShoppingCart,
  CheckCircle2,
  History,
  Flame,
  Crown,
  Compass,
  ArrowRight,
  Clock,
  Battery,
  Wifi,
  Fuel,
  Plus,
  Loader2,
  Power,
  RotateCcw,
  X,
  AlertTriangle
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Sensor, Vehicle } from '../types';
import MapComponent from './MapComponent';
import { supabase } from '../services/supabaseClient';

const sensors: Sensor[] = [
  { id: '1', name: 'Precision Fuel Sensor', price: '₹4,500', features: ['Capacitive technology', 'Theft instant-alerts', '99.2% accuracy'], compatibility: 'Internal Diesel Tanks' },
  { id: '2', name: 'Indicator Sync Box', price: '₹1,200', features: ['Wireless sync', 'High-speed hazard mode', 'Weatherproof'], compatibility: 'Any 12V/24V System' },
  { id: '3', name: 'Cargo Gate Guard', price: '₹2,100', features: ['Optical beam sensor', 'Tamper detection', 'Mobile logs'], compatibility: 'Closed Containers' },
  { id: '4', name: 'AI Driver Cam', price: '₹12,800', features: ['Sleepiness detection', 'Gaze tracking', 'Lane departure'], compatibility: 'All Cabins' },
  { id: '5', name: 'Tire Pressure DMS', price: '₹8,400', features: ['Real-time PSI logs', 'Overheat warnings'], compatibility: 'Multi-axle Trucks' },
];

const GPSSection: React.FC<{ t: any }> = ({ t }) => {
  const [activeMode, setActiveMode] = useState<'live' | 'marketplace'>('live');
  const [liveSubTab, setLiveSubTab] = useState<'tracking' | 'activity'>('tracking');
  const [activeTab, setActiveTab] = useState<'request' | 'sensors'>('request');
  
  // Fleet State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [loadingFleet, setLoadingFleet] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ registration: '', type: '14ft Container' });
  const [addingVehicle, setAddingVehicle] = useState(false);

  const selectedVehicle = useMemo(() => 
    vehicles.find(v => v.id === selectedVehicleId) || null
  , [vehicles, selectedVehicleId]);

  // --- Backend Sync Functions ---

  const fetchVehicles = async () => {
    setLoadingFleet(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVehicles(data);
    }
    setLoadingFleet(false);
  };

  useEffect(() => {
    fetchVehicles();

    // Setup Real-time listener for current user's vehicles
    const channel = supabase
      .channel('public:vehicles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'vehicles'
      }, (payload) => {
        // Optimistic refresh
        fetchVehicles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- IoT Heartbeat Simulation ---
  // This effect simulates a GPS device pinging the server every 5 seconds for moving vehicles
  useEffect(() => {
    const runningVehicles = vehicles.filter(v => v.ignition && v.status === 'Running');
    if (runningVehicles.length === 0) return;

    const interval = setInterval(async () => {
      // Pick one running vehicle to update (simulate one device ping)
      const v = runningVehicles[Math.floor(Math.random() * runningVehicles.length)];
      
      // Update its speed slightly and move its coordinates a tiny bit
      const newSpeed = Math.max(20, Math.min(100, v.speed + (Math.random() > 0.5 ? 2 : -2)));
      const newLat = v.lat + (Math.random() - 0.5) * 0.001;
      const newLng = v.lng + (Math.random() - 0.5) * 0.001;

      await supabase.from('vehicles').update({ 
        speed: newSpeed,
        lat: newLat,
        lng: newLng,
        last_updated: new Date().toISOString()
      }).eq('id', v.id);
    }, 5000);

    return () => clearInterval(interval);
  }, [vehicles]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.registration) return;
    setAddingVehicle(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const payload = {
        registration_number: newVehicle.registration.toUpperCase(),
        type: newVehicle.type,
        owner_id: session.user.id,
        status: 'Stopped',
        speed: 0,
        fuel_level: 100,
        ignition: false,
        lat: 28.5355, // Delhi default
        lng: 77.3910,
        last_updated: new Date().toISOString()
      };

      const { error } = await supabase.from('vehicles').insert([payload]);
      if (!error) {
        setIsAddModalOpen(false);
        setNewVehicle({ registration: '', type: '14ft Container' });
        fetchVehicles();
      } else {
        console.error("Add vehicle error:", error);
      }
    }
    setAddingVehicle(false);
  };

  const toggleIgnition = async (vehicle: Vehicle) => {
    const nextIgnition = !vehicle.ignition;
    const nextStatus = nextIgnition ? 'Running' : 'Stopped';
    const nextSpeed = nextIgnition ? 45 : 0;
    
    await supabase.from('vehicles').update({ 
      ignition: nextIgnition,
      status: nextStatus,
      speed: nextSpeed,
      last_updated: new Date().toISOString()
    }).eq('id', vehicle.id);
  };

  const mockAnalyticsData = [
    { month: 'Oct', km: 11200, fuel: 3100 },
    { month: 'Nov', km: 14800, fuel: 4200 },
    { month: 'Dec', km: 13500, fuel: 3700 },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none mb-2 text-slate-900 dark:text-white">Fleet Command</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Real-time Telemetry & Device Sync</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-[24px] shadow-xl border border-slate-100 dark:border-white/5">
          <button 
            onClick={() => setActiveMode('live')}
            className={`px-8 py-3 rounded-[20px] text-[11px] font-black transition-all uppercase tracking-widest flex items-center gap-2 ${activeMode === 'live' ? 'bg-slate-950 dark:bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Compass size={16} /> Live tracking
          </button>
          <button 
            onClick={() => setActiveMode('marketplace')}
            className={`px-8 py-3 rounded-[20px] text-[11px] font-black transition-all uppercase tracking-widest flex items-center gap-2 ${activeMode === 'marketplace' ? 'bg-slate-950 dark:bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShoppingCart size={16} /> Hardware Store
          </button>
        </div>
      </div>

      {activeMode === 'live' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-auto lg:min-h-[600px]">
          {/* Main Map Content */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm overflow-x-auto no-scrollbar">
                {[
                  {id: 'tracking', icon: Navigation, label: 'Real-time'},
                  {id: 'activity', icon: Activity, label: '3-Month Analytics'}
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setLiveSubTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${liveSubTab === tab.id ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <tab.icon size={14} strokeWidth={3} /> {tab.label}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-5 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">New Vehicle</span>
              </button>
            </div>

            <div className="relative flex-1 min-h-[500px] bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl">
              {vehicles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-900/50">
                   <div className="bg-slate-100 dark:bg-slate-800 p-10 rounded-full mb-8 text-slate-300 dark:text-slate-700">
                     <Truck size={80} strokeWidth={1} />
                   </div>
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Registry Empty</h3>
                   <p className="text-slate-500 font-bold text-sm max-w-xs mb-8 leading-relaxed">Connect your first IoT device to start monitoring live engine data and locations.</p>
                   <button onClick={() => setIsAddModalOpen(true)} className="bg-amber-500 text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-amber-500/20 hover:scale-105 transition-transform">Add Vehicle</button>
                </div>
              ) : liveSubTab === 'tracking' ? (
                <>
                  <MapComponent 
                    startPos={{ lat: 28.5355, lng: 77.3910 }}
                    endPos={{ lat: 28.4744, lng: 77.5030 }}
                    currentPosition={selectedVehicle ? { lat: selectedVehicle.lat, lng: selectedVehicle.lng } : undefined}
                  />
                  {selectedVehicle && (
                    <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
                      <div className="bg-slate-950/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${selectedVehicle.ignition ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
                        <div>
                          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Engine</p>
                          <p className="text-xs font-black text-white uppercase">{selectedVehicle.ignition ? 'Ignition ON' : 'Stopped'}</p>
                        </div>
                      </div>
                      <div className="bg-slate-950/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4">
                        <Flame className="text-amber-500" size={16} />
                        <div>
                          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Speed</p>
                          <p className="text-lg font-black text-white italic leading-none">{selectedVehicle.speed} <span className="text-[10px] not-italic opacity-50 uppercase">km/h</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full p-8 lg:p-12 bg-slate-950 text-white space-y-10 overflow-y-auto custom-scrollbar">
                   <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-4xl font-black uppercase italic tracking-tighter">Utilization Index</h4>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Data aggregation for {selectedVehicle?.registration_number || 'Global Fleet'}</p>
                      </div>
                      <div className="bg-white/5 p-4 px-8 rounded-3xl border border-white/5 text-right shadow-inner">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Score</p>
                        <p className="text-4xl font-black text-amber-500">92.8<span className="text-sm font-medium ml-1">%</span></p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Uptime', val: '99.8%', icon: Wifi, color: 'text-emerald-500' },
                        { label: 'Overspeed', val: '12 Incidents', icon: AlertTriangle, color: 'text-red-500' },
                        { label: 'Distance', val: '4,850 KM', icon: MapPin, color: 'text-blue-500' },
                        { label: 'Idle Hours', val: '14.2H', icon: Clock, color: 'text-amber-500' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[32px] hover:bg-white/10 transition-colors group">
                          <stat.icon className={`${stat.color} mb-4 transition-transform group-hover:scale-110`} size={24} />
                          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                          <p className="text-xl font-black uppercase">{stat.val}</p>
                        </div>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white/5 rounded-[40px] p-10 border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Distance Trends (3 Months)</p>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockAnalyticsData}>
                              <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{background: '#020617', border: 'none', borderRadius: '16px'}} />
                              <Bar dataKey="km" fill="#f59e0b" radius={[12, 12, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-[40px] p-10 border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Fuel Efficiency Logs</p>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockAnalyticsData}>
                              <Tooltip contentStyle={{background: '#020617', border: 'none', borderRadius: '16px'}} />
                              <Area type="monotone" dataKey="fuel" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Fleet Sidebar */}
          <div className="xl:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-white dark:bg-slate-800 rounded-[40px] p-8 border border-slate-100 dark:border-white/5 shadow-2xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">My Registry</h3>
                {loadingFleet ? (
                  <Loader2 size={16} className="animate-spin text-amber-500" />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/30 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Live Sync</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 mb-8">
                {vehicles.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[32px] flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 mb-4">
                      <Wifi size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Devices</p>
                  </div>
                ) : vehicles.map((v) => (
                  <div 
                    key={v.id} 
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer group shadow-sm ${
                      selectedVehicle?.id === v.id 
                        ? 'bg-slate-950 dark:bg-amber-500 text-white border-slate-950 dark:border-amber-400' 
                        : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${selectedVehicle?.id === v.id ? 'bg-white/10' : 'bg-white dark:bg-slate-800 shadow-inner'}`}>
                          <Truck size={24} strokeWidth={2.5} className={selectedVehicle?.id === v.id ? 'text-white' : 'text-slate-400'} />
                        </div>
                        <div>
                          <h5 className="font-black text-sm tracking-tight">{v.registration_number}</h5>
                          <div className="flex items-center gap-2 mt-1">
                             <div className={`w-1.5 h-1.5 rounded-full ${v.ignition ? 'bg-emerald-400 animate-pulse shadow-[0_0_5px_#34d399]' : 'bg-slate-400'}`} />
                             <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{v.ignition ? 'Running' : 'Stopped'}</p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleIgnition(v); }}
                        className={`p-2 rounded-xl transition-all hover:scale-110 ${v.ignition ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-900'}`}
                      >
                        <Power size={18} strokeWidth={3} />
                      </button>
                    </div>

                    {selectedVehicle?.id === v.id && (
                      <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-2">
                         <div className="text-center">
                            <p className="text-[8px] font-black uppercase opacity-60">Speed</p>
                            <p className="text-xs font-black mt-1 italic">{v.speed} KM/H</p>
                         </div>
                         <div className="text-center border-x border-white/10 px-2">
                            <p className="text-[8px] font-black uppercase opacity-60">Fuel</p>
                            <p className="text-xs font-black mt-1">{v.fuel_level}%</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[8px] font-black uppercase opacity-60">Status</p>
                            <div className="flex items-center justify-center gap-1 text-xs font-black mt-1 uppercase">
                               LIVE
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats Summary */}
              <div className="p-8 bg-slate-950 dark:bg-white/5 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                   <div className="flex justify-between items-center mb-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Fleet Active Time</p>
                      <button onClick={fetchVehicles} className="text-slate-500 hover:text-white transition-colors"><RotateCcw size={16} /></button>
                   </div>
                   <div className="flex items-end gap-3 mb-6">
                      <p className="text-5xl font-black">{vehicles.length > 0 ? Math.round((vehicles.filter(v => v.ignition).length / vehicles.length) * 100) : 0}<span className="text-xl text-slate-500 ml-1 font-medium">%</span></p>
                      <p className="text-[10px] font-bold text-emerald-500 mb-2 uppercase tracking-wide">{vehicles.filter(v => v.ignition).length} Active Now</p>
                   </div>
                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-1000 ease-out shadow-[0_0_10px_#f59e0b]" 
                        style={{width: `${vehicles.length > 0 ? (vehicles.filter(v => v.ignition).length / vehicles.length) * 100 : 0}%`}} 
                      />
                   </div>
                 </div>
                 <Activity size={180} className="absolute -right-10 -bottom-10 opacity-5 rotate-12 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3 space-y-4">
            {[
              { id: 'request', label: 'Bulk Orders', icon: Send, desc: 'Enterprise wholesale pricing.' },
              { id: 'sensors', label: 'IoT Sensors', icon: Cpu, desc: 'Advanced fuel & cargo logs.' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full p-8 rounded-[40px] text-left transition-all border-2 group ${
                  activeTab === tab.id 
                    ? 'bg-amber-500 border-amber-600 shadow-2xl shadow-amber-500/20 text-slate-900' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-amber-500'
                }`}
              >
                <div className={`p-4 rounded-2xl w-fit mb-6 transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-amber-500 group-hover:text-white'}`}>
                  <tab.icon size={24} strokeWidth={3} />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight leading-none mb-2">{tab.label}</h4>
                <p className={`text-xs font-bold leading-snug ${activeTab === tab.id ? 'opacity-80' : 'text-slate-400'}`}>{tab.desc}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-9 bg-white dark:bg-slate-800 rounded-[56px] p-10 lg:p-16 border border-slate-100 dark:border-white/5 shadow-3xl">
            {activeTab === 'request' ? (
              <div className="max-w-2xl animate-in fade-in">
                <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">Enterprise Hub</h3>
                <p className="text-slate-500 font-bold mb-12 text-lg">Digitize your fleet with verified hardware. Large fleet owners get priority installation.</p>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Truck Count</label>
                       <input type="number" placeholder="Min. 5 units" className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl font-black text-2xl border-0 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Hardware Tier</label>
                       <select className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl font-black text-lg border-0 focus:ring-4 focus:ring-amber-500/10 appearance-none outline-none cursor-pointer">
                         <option>Core GPS (Basic)</option>
                         <option>Advanced Telemetry</option>
                         <option>AI-Vision Safety</option>
                       </select>
                    </div>
                  </div>
                  <button className="px-14 py-6 bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-900 rounded-3xl font-black text-xl hover:scale-105 transition-transform flex items-center justify-center gap-4 shadow-2xl uppercase italic">
                    <Send size={24} strokeWidth={3} /> Send Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                {sensors.map((s) => (
                  <div key={s.id} className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-white/5 p-10 hover:border-amber-500 transition-all shadow-xl group flex flex-col">
                     <h4 className="text-3xl font-black mb-6 tracking-tight italic uppercase">{s.name}</h4>
                     <div className="space-y-3 mb-12 flex-1">
                       {s.features.map((f, i) => (
                         <div key={i} className="flex items-center gap-4 text-sm font-bold text-slate-500">
                           <div className="w-2 h-2 rounded-full bg-amber-500" /> {f}
                         </div>
                       ))}
                     </div>
                     <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-white/5">
                        <span className="text-3xl font-black text-slate-900 dark:text-white italic">{s.price}</span>
                        <button className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-110 transition-transform">Add to Fleet</button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => !addingVehicle && setIsAddModalOpen(false)} />
           <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[60px] p-10 lg:p-16 shadow-3xl border border-white/5 animate-in zoom-in duration-300 overflow-hidden">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-white transition-colors">
                <X size={28} strokeWidth={3} />
              </button>
              
              <div className="bg-amber-500 w-24 h-24 rounded-[32px] flex items-center justify-center text-slate-950 mb-10 shadow-[0_20px_40px_rgba(245,158,11,0.2)]">
                <Truck size={48} strokeWidth={2.5} />
              </div>

              <h3 className="text-5xl font-black uppercase tracking-tighter italic mb-2 leading-none">Registry</h3>
              <p className="text-slate-500 font-bold mb-12 uppercase text-xs tracking-widest">Connect your hardware to the Gadi network.</p>

              <form onSubmit={handleAddVehicle} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Vehicle Number</label>
                   <input 
                     required
                     value={newVehicle.registration}
                     onChange={e => setNewVehicle({...newVehicle, registration: e.target.value})}
                     placeholder="HR 55 AB 1234" 
                     className="w-full bg-slate-50 dark:bg-slate-950 p-7 rounded-[32px] font-black text-2xl border-4 border-transparent focus:border-amber-500/50 outline-none uppercase transition-all shadow-inner" 
                    />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-3">Configuration</label>
                   <select 
                    value={newVehicle.type}
                    onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 p-7 rounded-[32px] font-black text-xl border-4 border-transparent focus:border-amber-500/50 outline-none appearance-none cursor-pointer shadow-inner"
                   >
                     <option>14ft Container</option>
                     <option>22ft Multi-Axle</option>
                     <option>32ft MX Trailer</option>
                     <option>Tata Ace / LCV</option>
                   </select>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[32px] border border-blue-100 dark:border-blue-800 flex items-center gap-5 text-blue-600">
                  <ShieldCheck size={28} strokeWidth={2.5} />
                  <p className="text-[10px] font-bold uppercase leading-tight tracking-wide">Vehicle identity will be cross-referenced with Vahan database instantly.</p>
                </div>

                <button 
                  type="submit" 
                  disabled={addingVehicle}
                  className="w-full bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 py-7 rounded-[32px] font-black text-xl uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 italic"
                >
                  {addingVehicle ? <Loader2 className="animate-spin" /> : <>Register Vehicle <ArrowRight size={24} strokeWidth={3} /></>}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default GPSSection;
