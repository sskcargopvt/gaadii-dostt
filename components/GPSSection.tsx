
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
  BatteryLow,
  Wifi,
  WifiOff,
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

  // Helper to determine if a device is online based on heartbeat
  const isOnline = (lastUpdated: string) => {
    const lastDate = new Date(lastUpdated).getTime();
    const now = new Date().getTime();
    return (now - lastDate) < 300000; // Online if updated in the last 5 minutes
  };

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
        fetchVehicles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- IoT Heartbeat Simulation ---
  useEffect(() => {
    const runningVehicles = vehicles.filter(v => v.ignition && v.status === 'Running');
    if (runningVehicles.length === 0) return;

    const interval = setInterval(async () => {
      const v = runningVehicles[Math.floor(Math.random() * runningVehicles.length)];
      
      const newSpeed = Math.max(20, Math.min(100, v.speed + (Math.random() > 0.5 ? 2 : -2)));
      const newLat = v.lat + (Math.random() - 0.5) * 0.001;
      const newLng = v.lng + (Math.random() - 0.5) * 0.001;
      const newBattery = Math.max(5, v.battery_level - 0.1); // Slowly drain battery

      await supabase.from('vehicles').update({ 
        speed: newSpeed,
        lat: newLat,
        lng: newLng,
        battery_level: newBattery,
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
        battery_level: 100,
        ignition: false,
        lat: 28.5355,
        lng: 77.3910,
        last_updated: new Date().toISOString()
      };

      const { error } = await supabase.from('vehicles').insert([payload]);
      if (!error) {
        setIsAddModalOpen(false);
        setNewVehicle({ registration: '', type: '14ft Container' });
        fetchVehicles();
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
                   {/* ... Analytics content ... */}
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
                ) : vehicles.map((v) => {
                  const online = isOnline(v.last_updated);
                  const lowBattery = v.battery_level < 20;
                  return (
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
                            <div className="flex items-center gap-3 mt-1.5">
                               <div className="flex items-center gap-1">
                                 <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-slate-400'}`} />
                                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{online ? 'Online' : 'Offline'}</p>
                               </div>
                               {lowBattery && (
                                 <div className="flex items-center gap-1 text-red-500 animate-pulse">
                                   <BatteryLow size={10} strokeWidth={3} />
                                   <p className="text-[9px] font-black uppercase tracking-widest">Low Batt</p>
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <button 
                            onClick={(e) => { e.stopPropagation(); toggleIgnition(v); }}
                            className={`p-2 rounded-xl transition-all hover:scale-110 ${v.ignition ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-900'}`}
                          >
                            <Power size={18} strokeWidth={3} />
                          </button>
                        </div>
                      </div>

                      {selectedVehicle?.id === v.id && (
                        <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-2">
                           <div className="text-center">
                              <p className="text-[8px] font-black uppercase opacity-60">Speed</p>
                              <p className="text-xs font-black mt-1 italic">{v.speed} KM/H</p>
                           </div>
                           <div className="text-center border-x border-white/10 px-2">
                              <p className="text-[8px] font-black uppercase opacity-60">Device</p>
                              <div className="flex items-center justify-center gap-1 text-[9px] font-black mt-1 uppercase">
                                 {v.battery_level.toFixed(0)}% <Battery size={10} className={lowBattery ? 'text-red-400' : 'text-emerald-400'} />
                              </div>
                           </div>
                           <div className="text-center">
                              <p className="text-[8px] font-black uppercase opacity-60">Signal</p>
                              <div className="flex items-center justify-center gap-1 text-[9px] font-black mt-1 uppercase">
                                 {online ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-red-400" />}
                                 {online ? 'Strong' : 'Lost'}
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
          {/* Marketplace Content */}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {/* ... Add Vehicle Modal content ... */}
    </div>
  );
};

export default GPSSection;
