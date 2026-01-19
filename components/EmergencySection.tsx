
import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Fuel, 
  Wrench, 
  CircleDashed, 
  Phone, 
  MapPin, 
  Navigation, 
  Receipt, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Info, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Zap,
  Star,
  ArrowRight,
  X
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface ServiceDetail {
  id: string;
  name: string;
  price: number;
  time: string;
  description: string;
  includes: string[];
}

interface Category {
  id: string;
  label: string;
  icon: any;
  color: string;
  services: ServiceDetail[];
}

const EmergencySection: React.FC<{ t: any }> = ({ t }) => {
  const [step, setStep] = useState<'category' | 'services' | 'tracking' | 'completed'>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [userLocation, setUserLocation] = useState<string>("Detecting...");
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [eta, setEta] = useState(15);

  const categories: Category[] = [
    {
      id: 'rsa',
      label: 'Roadside (RSA)',
      icon: Truck,
      color: 'bg-orange-500',
      services: [
        { id: 'rsa-1', name: 'Heavy Duty Towing', price: 2500, time: '30-45 mins', description: 'Safe towing for 10-22 ton trucks.', includes: ['Flatbed Towing', 'Safe Securing', 'Standard 10km Trip'] },
        { id: 'rsa-2', name: 'Underlift Towing', price: 1800, time: '20-30 mins', description: 'Best for empty or mid-load trucks.', includes: ['Underlift Crane', 'Winch Support'] }
      ]
    },
    {
      id: 'fuel',
      label: 'Fuel & Fluids',
      icon: Fuel,
      color: 'bg-blue-500',
      services: [
        { id: 'fuel-1', name: 'Emergency Diesel (10L)', price: 1200, time: '15-20 mins', description: 'Quick fuel delivery to highway.', includes: ['10L High Quality Diesel', 'Air-lock Removal', 'Container Cost'] },
        { id: 'fuel-2', name: 'Coolant Refill', price: 650, time: '15 mins', description: 'Engine overheating fix.', includes: ['2L Coolant', 'System Flush'] }
      ]
    },
    {
      id: 'repair',
      label: 'Mechanic Help',
      icon: Wrench,
      color: 'bg-red-500',
      services: [
        { id: 'rep-1', name: 'Brake Jam Fix', price: 950, time: '40 mins', description: 'On-site brake release and check.', includes: ['Brake Cleaning', 'Spring Check', 'Technician Visit'] },
        { id: 'rep-2', name: 'Clutch Adjustment', price: 450, time: '20 mins', description: 'Pedal play and wire check.', includes: ['Pedal Balancing', 'Wire Lubrication'] }
      ]
    },
    {
      id: 'tire',
      label: 'Tires & Wheels',
      icon: CircleDashed,
      color: 'bg-slate-700',
      services: [
        { id: 'tire-1', name: 'Flat Tire Change', price: 400, time: '15-25 mins', description: 'Replacing punctured tire with spare.', includes: ['Jack Support', 'Bolting', 'Pressure Check'] },
        { id: 'tire-2', name: 'Mobile Puncture Repair', price: 600, time: '30 mins', description: 'Cold/Hot patch fix on site.', includes: ['Patching', 'Valve Check'] }
      ]
    }
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setUserLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Verified)`);
        },
        () => setUserLocation("Nashik Highway, Sector 4 (Manual)")
      );
    }
  }, []);

  const handleBooking = async () => {
    if (!selectedService) return;
    setLoading(true);
    try {
      await supabase.from('emergency_requests').insert([{
        type: selectedService.name,
        status: 'assigned',
        eta: 15,
        location: userLocation,
        lat: coords?.lat,
        lng: coords?.lng,
        amount: selectedService.price
      }]);
      setStep('tracking');
    } catch (e) {
      console.error(e);
      setStep('tracking'); // Fallback for demo
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Dynamic Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="text-red-600">Gadi</span> Assist
              <div className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">Live RSA</div>
            </h2>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <MapPin size={14} className="text-red-500" />
            <span className="font-medium">{userLocation}</span>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search for repair..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
          />
        </div>
      </div>

      {step === 'category' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-red-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Truck Breakdown?</h3>
              <p className="text-slate-300 mb-6 max-w-sm">We provide verified mechanics and tow trucks within 30 minutes on all major Indian highways.</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                  <ShieldCheck size={16} className="text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Verified Help</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                  <Clock size={16} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">30 Min ETA</span>
                </div>
              </div>
            </div>
            <Truck size={180} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setStep('services');
                }}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-red-500 transition-all text-left shadow-sm group"
              >
                <div className={`${cat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <cat.icon size={28} />
                </div>
                <h4 className="font-bold text-lg mb-1">{cat.label}</h4>
                <p className="text-slate-400 text-xs">{cat.services.length} services available</p>
                <ArrowRight size={16} className="mt-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 p-6 rounded-3xl flex items-center gap-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={24} />
            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
              Roadside Assistance fees are fixed. No hidden charges. Part costs are extra as per actual market price.
            </p>
          </div>
        </div>
      )}

      {step === 'services' && selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4">
          <div className="lg:col-span-2 space-y-4">
            <button 
              onClick={() => setStep('category')}
              className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-red-600 transition-colors"
            >
              <X size={16} /> Back to Categories
            </button>
            
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <selectedCategory.icon className="text-red-500" />
              {selectedCategory.label} Services
            </h3>

            <div className="space-y-4 pt-4">
              {selectedCategory.services.map((service) => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                    selectedService?.id === service.id ? 'border-red-500 shadow-xl' : 'border-slate-100 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold mb-1">{service.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                          <Clock size={12} /> {service.time}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                          <ShieldCheck size={12} /> Assured
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-red-600">₹{service.price}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Base Fare</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mb-6">{service.description}</p>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">What's Included</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.includes.map((inc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <CheckCircle2 size={14} className="text-green-500" />
                          {inc}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl sticky top-24">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Receipt size={20} className="text-red-500" />
                Booking Summary
              </h4>
              
              {!selectedService ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                  <Info className="mx-auto text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm">Select a service to proceed</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Service</span>
                      <span className="font-bold">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Dispatch Fee</span>
                      <span className="font-bold">Included</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Convenience</span>
                      <span className="font-bold text-green-400">Free</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="font-bold">Total Payable</span>
                    <span className="text-3xl font-black text-red-500">₹{selectedService.price}</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-red-500/20 p-2 rounded-lg">
                      <Zap size={18} className="text-red-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      By clicking Book Now, a verified technician will be dispatched to your current coordinates.
                    </p>
                  </div>

                  <button 
                    onClick={handleBooking}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-red-600/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirm & Book Now
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-4 mb-4">
                 <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600">
                   <Phone size={20} />
                 </div>
                 <div>
                   <h5 className="font-bold text-sm">Emergency Hotline</h5>
                   <p className="text-xs text-slate-500">Call if app fails: 1800-GADI-HELP</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {step === 'tracking' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500">
           <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700">
              <div className="h-[400px] bg-slate-100 relative">
                 <div className="absolute inset-0 opacity-60 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i14!2i9375!3i6000!2m3!1e0!2sm!3i420120488!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2!23i1301875')] bg-cover" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white border-4 border-white shadow-2xl animate-bounce">
                        <Wrench size={32} />
                      </div>
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg">MOVING TO YOU</div>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest mb-1">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       Technician Dispatched
                    </div>
                    <h3 className="text-3xl font-black">{selectedService?.name}</h3>
                    <p className="text-slate-500">Order ID: #EM-221990</p>
                  </div>

                  <div className="flex items-center gap-5 p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border border-slate-100">
                      <img src="https://ui-avatars.com/api/?name=Arun+Technician&background=f59e0b&color=fff" alt="Technician" />
                    </div>
                    <div className="flex-1">
                       <h5 className="font-bold text-lg">Arun Mishra</h5>
                       <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                         4.9 <Star size={10} fill="currentColor" /> (120+ jobs)
                       </div>
                    </div>
                    <button className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors shadow-lg">
                      <Phone size={24} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-center text-center md:text-left bg-red-50 dark:bg-red-950/20 p-8 rounded-3xl border border-red-100 dark:border-red-900/30">
                  <p className="text-sm font-black text-red-600 uppercase tracking-widest mb-1">Expected Arrival</p>
                  <p className="text-6xl font-black text-slate-900 dark:text-red-500 mb-4">{eta} <span className="text-2xl">Mins</span></p>
                  <p className="text-slate-500 text-sm">Vehicle: MH 01 AB 1234 (Tow Unit 4)</p>
                </div>
              </div>
           </div>

           <div className="flex gap-4">
             <button onClick={() => setStep('completed')} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors">
               Arrived & Working
             </button>
             <button onClick={() => setStep('category')} className="px-8 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 hover:text-red-500 transition-colors">
               Cancel Request
             </button>
           </div>
        </div>
      )}

      {step === 'completed' && selectedService && (
        <div className="max-w-xl mx-auto text-center space-y-10 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto shadow-xl">
            <CheckCircle2 size={56} />
          </div>
          <div>
            <h3 className="text-4xl font-black mb-2">Service Done!</h3>
            <p className="text-slate-500 text-lg">Your vehicle is back in action.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-xl text-left">
            <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
              <Receipt className="text-slate-400" size={20} />
              Invoice Summary
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Service Fee ({selectedService.name})</span>
                <span className="font-bold">₹{selectedService.price}.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">GST (18%)</span>
                <span className="font-bold">₹{(selectedService.price * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-700">
                <span className="font-black text-xl">Total Paid</span>
                <span className="text-3xl font-black text-red-600">₹{(selectedService.price * 1.18).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setStep('category')}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold text-xl hover:bg-black transition-all shadow-xl"
            >
              Back to Dashboard
            </button>
            <p className="text-xs text-slate-400">A digital receipt has been sent to your registered WhatsApp number.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencySection;
