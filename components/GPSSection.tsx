
import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Activity,
  Truck,
  ShoppingCart,
  Plus,
  Loader2,
  Power,
  Battery,
  BatteryLow,
  Wifi,
  WifiOff,
  RotateCcw,
  Compass,
  LayoutDashboard,
  Users,
  Shield,
  Cpu,
  BarChart3,
  Download,
  Filter,
  ChevronRight,
  Circle,
  PlayCircle,
  StopCircle,
  AlertTriangle,
  Clock,
  Calendar,
  TrendingUp,
  MapPinned,
  Settings,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  FileText,
  Zap,
  Fuel
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Vehicle } from '../types';
import MapComponent from './MapComponent';
import { supabase } from '../services/supabaseClient';

interface Driver {
  id: string;
  name: string;
  phone: string;
  dl_number: string;
  address: string;
  created_at: string;
}

interface Device {
  id: string;
  vehicle_no: string;
  unique_id: string;
  phone_no: string;
  vehicle_type: string;
  installation_date: string;
  creation_time: string;
  validity: string;
  last_updated: string;
}

interface Geofence {
  id: string;
  name: string;
  location: string;
  vehicles: string[];
  created_at: string;
}

const GPSSection: React.FC<{ t: any }> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'geofence' | 'drivers' | 'devices' | 'reports'>('dashboard');

  // Fleet State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [loadingFleet, setLoadingFleet] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ registration: '', type: '14ft Container' });
  const [addingVehicle, setAddingVehicle] = useState(false);

  // Drivers State
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', dl_number: '', address: '' });

  // Devices State
  const [devices, setDevices] = useState<Device[]>([]);

  // Geofence State
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isAddGeofenceModalOpen, setIsAddGeofenceModalOpen] = useState(false);
  const [newGeofence, setNewGeofence] = useState({ name: '', location: '' });

  // Filter States
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchDrivers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDrivers(data);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();

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
      const newBattery = Math.max(5, v.battery_level - 0.1);

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

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const payload = {
        ...newDriver,
        owner_id: session.user.id,
      };

      const { error } = await supabase.from('drivers').insert([payload]);
      if (!error) {
        setIsAddDriverModalOpen(false);
        setNewDriver({ name: '', phone: '', dl_number: '', address: '' });
        fetchDrivers();
      }
    }
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

  // Vehicle Statistics
  const vehicleStats = useMemo(() => {
    const total = vehicles.length;
    const running = vehicles.filter(v => v.status === 'Running').length;
    const idle = vehicles.filter(v => v.status === 'Idle').length;
    const stopped = vehicles.filter(v => v.status === 'Stopped').length;
    const noNetwork = vehicles.filter(v => !isOnline(v.last_updated)).length;

    return { total, running, idle, stopped, noNetwork };
  }, [vehicles]);

  // Chart Data
  const pieData = [
    { name: 'Running', value: vehicleStats.running, color: '#10b981' },
    { name: 'Idle', value: vehicleStats.idle, color: '#f59e0b' },
    { name: 'Stopped', value: vehicleStats.stopped, color: '#ef4444' },
    { name: 'No Network', value: vehicleStats.noNetwork, color: '#6b7280' },
  ];

  const kmsData = [
    { date: '01 Feb', kms: 85 },
    { date: '02 Feb', kms: 92 },
    { date: '03 Feb', kms: 78 },
    { date: '04 Feb', kms: 95 },
    { date: '05 Feb', kms: 88 },
    { date: '06 Feb', kms: 100 },
    { date: '07 Feb', kms: 90 },
  ];

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    if (vehicleFilter !== 'all') {
      filtered = filtered.filter(v => {
        if (vehicleFilter === 'running') return v.status === 'Running';
        if (vehicleFilter === 'idle') return v.status === 'Idle';
        if (vehicleFilter === 'stopped') return v.status === 'Stopped';
        return true;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [vehicles, vehicleFilter, searchQuery]);

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vehicle Management Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Vehicle Management</h3>
            <Truck className="text-indigo-600" size={24} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-3xl font-black">{vehicleStats.total}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Vehicles</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold">Running: {vehicleStats.running}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs font-bold">Idle: {vehicleStats.idle}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs font-bold">Stopped: {vehicleStats.stopped}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span className="text-xs font-bold">No Network: {vehicleStats.noNetwork}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Notifications</h3>
            <span className="text-xs font-bold text-slate-500">(0)</span>
          </div>
          <div className="flex items-center justify-center h-40 text-slate-400">
            <p className="text-xs font-bold uppercase">No new notifications</p>
          </div>
        </div>

        {/* Total KMs Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Total Kms</h3>
            <TrendingUp className="text-indigo-600" size={24} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={kmsData}>
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '10px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
              <Tooltip />
              <Line type="monotone" dataKey="kms" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device List and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device List */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight">Device List</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold">
                VEHICLE NO
              </button>
              <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">
                DEVICE IMEI
              </button>
              <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">
                TIME STAMP
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-black uppercase text-slate-600 dark:text-slate-400">
              <div>Vehicle No</div>
              <div>Device IMEI</div>
              <div>Time Stamp</div>
              <div>Battery Voltage</div>
              <div>Installation Date</div>
              <div>Actions</div>
            </div>
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="grid grid-cols-6 gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{vehicle.registration_number}</div>
                <div className="text-slate-600 dark:text-slate-400">866551053608875</div>
                <div className="text-slate-600 dark:text-slate-400">{new Date(vehicle.last_updated).toLocaleString()}</div>
                <div className="text-slate-600 dark:text-slate-400">{vehicle.battery_level.toFixed(0)}V</div>
                <div className="text-slate-600 dark:text-slate-400">2025-07-31</div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                    <Eye size={14} className="text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {filteredVehicles.length} of {vehicles.length} entries</span>
          </div>
        </div>

        {/* Map View */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black uppercase tracking-tight">Map View</h3>
          </div>
          <div className="h-96 rounded-2xl overflow-hidden">
            <MapComponent
              startPos={{ lat: 28.5355, lng: 77.3910 }}
              endPos={{ lat: 28.4744, lng: 77.5030 }}
              currentPosition={selectedVehicle ? { lat: selectedVehicle.lat, lng: selectedVehicle.lng } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Vehicle List Tab
  const renderVehicleList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex items-center gap-3">
        {[
          { id: 'all', label: 'All', icon: Circle, count: vehicles.length },
          { id: 'running', label: 'Running', icon: PlayCircle, count: vehicleStats.running, color: 'emerald' },
          { id: 'idle', label: 'Idle', icon: Clock, count: vehicleStats.idle, color: 'amber' },
          { id: 'stopped', label: 'Stopped', icon: StopCircle, count: vehicleStats.stopped, color: 'red' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setVehicleFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${vehicleFilter === filter.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
              }`}
          >
            <filter.icon size={16} />
            {filter.label}: {filter.count}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Cards */}
        <div className="space-y-4">
          {filteredVehicles.map((vehicle) => {
            const online = isOnline(vehicle.last_updated);
            const lowBattery = vehicle.battery_level < 20;

            return (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedVehicle?.id === vehicle.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:border-indigo-300'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${selectedVehicle?.id === vehicle.id ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                      <Truck size={24} className={selectedVehicle?.id === vehicle.id ? 'text-white' : 'text-indigo-600'} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{vehicle.registration_number}</h4>
                      <p className={`text-xs font-bold mt-1 ${selectedVehicle?.id === vehicle.id ? 'text-white/70' : 'text-slate-500'}`}>
                        {vehicle.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className="text-xs font-bold">{online ? 'Online' : 'Offline'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className={`text-xs font-bold mb-1 ${selectedVehicle?.id === vehicle.id ? 'text-white/70' : 'text-slate-500'}`}>Speed</p>
                    <p className="text-lg font-black">{vehicle.speed} km/h</p>
                  </div>
                  <div>
                    <p className={`text-xs font-bold mb-1 ${selectedVehicle?.id === vehicle.id ? 'text-white/70' : 'text-slate-500'}`}>Fuel</p>
                    <p className="text-lg font-black">{vehicle.fuel_level}%</p>
                  </div>
                  <div>
                    <p className={`text-xs font-bold mb-1 ${selectedVehicle?.id === vehicle.id ? 'text-white/70' : 'text-slate-500'}`}>Battery</p>
                    <p className="text-lg font-black">{vehicle.battery_level.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span className="text-xs font-bold">Last seen: {new Date(vehicle.last_updated).toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleIgnition(vehicle); }}
                    className={`p-2 rounded-lg transition-all ${vehicle.ignition
                        ? 'bg-emerald-500 text-white'
                        : selectedVehicle?.id === vehicle.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                  >
                    <Power size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map View */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black uppercase tracking-tight">Map View</h3>
            <select className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold">
              <option>Select POI</option>
            </select>
          </div>
          <div className="h-[600px] rounded-2xl overflow-hidden">
            <MapComponent
              startPos={{ lat: 28.5355, lng: 77.3910 }}
              endPos={{ lat: 28.4744, lng: 77.5030 }}
              currentPosition={selectedVehicle ? { lat: selectedVehicle.lat, lng: selectedVehicle.lng } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Geofence Tab
  const renderGeofence = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black uppercase tracking-tight">Geofence Management</h3>
        <button
          onClick={() => setIsAddGeofenceModalOpen(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm flex items-center gap-2"
        >
          <Plus size={18} /> Generate Grid Geofence
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geofence Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Enter a location</label>
              <input
                type="text"
                placeholder="Search location..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Enter Geofence Name</label>
              <input
                type="text"
                placeholder="Geofence name..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Select a vehicle to view its linked geofences</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Select vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registration_number}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                Link Geofence
              </button>
              <button className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">
                Delete Geofence
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <div className="h-96 rounded-2xl overflow-hidden">
            <MapComponent
              startPos={{ lat: 28.5355, lng: 77.3910 }}
              endPos={{ lat: 28.4744, lng: 77.5030 }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Driver Management Tab
  const renderDrivers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black uppercase tracking-tight">Driver Management</h3>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => setIsAddDriverModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add New Driver
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search drivers..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Mobile No.</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">DL Number</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Address</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={48} className="opacity-20" />
                      <p className="text-sm font-bold">No drivers added yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-4 text-sm font-bold">{driver.name}</td>
                    <td className="px-4 py-4 text-sm">{driver.phone}</td>
                    <td className="px-4 py-4 text-sm">{driver.dl_number}</td>
                    <td className="px-4 py-4 text-sm">{driver.address}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                          <Edit size={14} />
                        </button>
                        <button className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {drivers.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {drivers.length} of {drivers.length} entries</span>
          </div>
        )}
      </div>
    </div>
  );

  // Render Device Management Tab
  const renderDevices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black uppercase tracking-tight">Device Management / Device Details</h3>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold">
            <option>Filter by User</option>
          </select>
          <button className="p-2.5 bg-indigo-600 text-white rounded-xl">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Vehicle No</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Unique Id</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">P.Phone No</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Vehicle Type</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Installation Date</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Creation Time</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Validity</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Last Updated</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-4 py-4 text-sm font-bold text-indigo-600">{vehicle.registration_number}</td>
                  <td className="px-4 py-4 text-sm">866551053608875</td>
                  <td className="px-4 py-4 text-sm">5754230017244</td>
                  <td className="px-4 py-4 text-sm">{vehicle.type}</td>
                  <td className="px-4 py-4 text-sm">2025-07-31</td>
                  <td className="px-4 py-4 text-sm">{new Date(vehicle.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-sm text-emerald-600">2025-07-31</td>
                  <td className="px-4 py-4 text-sm">{new Date(vehicle.last_updated).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">
                      More Action
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {vehicles.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {vehicles.length} of {vehicles.length} entries</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded">10</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render Reports Tab
  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black uppercase tracking-tight">Reports & Analytics</h3>
        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black uppercase text-slate-600 dark:text-slate-400">Total Distance</h4>
            <Navigation className="text-indigo-600" size={24} />
          </div>
          <p className="text-3xl font-black">12,450 km</p>
          <p className="text-xs text-emerald-600 font-bold mt-2">+12% from last month</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black uppercase text-slate-600 dark:text-slate-400">Fuel Consumed</h4>
            <Fuel className="text-indigo-600" size={24} />
          </div>
          <p className="text-3xl font-black">3,240 L</p>
          <p className="text-xs text-red-600 font-bold mt-2">-5% from last month</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black uppercase text-slate-600 dark:text-slate-400">Active Hours</h4>
            <Clock className="text-indigo-600" size={24} />
          </div>
          <p className="text-3xl font-black">840 hrs</p>
          <p className="text-xs text-emerald-600 font-bold mt-2">+8% from last month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
        <h4 className="text-lg font-black uppercase mb-4">Monthly Performance</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={kmsData}>
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="kms" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">GPS Marketplace</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Complete Fleet Management System</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'vehicles', label: 'Vehicle List', icon: Truck },
          { id: 'geofence', label: 'Geofence', icon: MapPinned },
          { id: 'drivers', label: 'Driver Management', icon: Users },
          { id: 'devices', label: 'Device Management', icon: Cpu },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-indigo-300'
              }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'vehicles' && renderVehicleList()}
        {activeTab === 'geofence' && renderGeofence()}
        {activeTab === 'drivers' && renderDrivers()}
        {activeTab === 'devices' && renderDevices()}
        {activeTab === 'reports' && renderReports()}
      </div>

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black uppercase">Add New Vehicle</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Registration Number</label>
                <input
                  type="text"
                  value={newVehicle.registration}
                  onChange={(e) => setNewVehicle({ ...newVehicle, registration: e.target.value })}
                  placeholder="e.g., UP16T3677"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Vehicle Type</label>
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>14ft Container</option>
                  <option>17ft Container</option>
                  <option>19ft Container</option>
                  <option>20ft Container</option>
                  <option>22ft Container</option>
                  <option>24ft Container</option>
                  <option>32ft Multi-Axle</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingVehicle}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addingVehicle ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  {addingVehicle ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black uppercase">Add New Driver</h3>
              <button onClick={() => setIsAddDriverModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  placeholder="Driver name"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  placeholder="Phone number"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">DL Number</label>
                <input
                  type="text"
                  value={newDriver.dl_number}
                  onChange={(e) => setNewDriver({ ...newDriver, dl_number: e.target.value })}
                  placeholder="Driving license number"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Address</label>
                <textarea
                  value={newDriver.address}
                  onChange={(e) => setNewDriver({ ...newDriver, address: e.target.value })}
                  placeholder="Full address"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSSection;
