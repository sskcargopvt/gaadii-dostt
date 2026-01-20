import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Package, 
  Weight, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Clock, 
  Upload, 
  CheckCircle2, 
  FileText, 
  Truck, 
  Move,
  Navigation,
  Calendar,
  ChevronDown,
  Info,
  X,
  Target
} from 'lucide-react';
import MapComponent from './MapComponent';

const routeCheckpoints = [
  "Noida Sector 62",
  "Noida-Greater Noida Expressway",
  "Pari Chowk",
  "Greater Noida Industrial Area"
];

const getCurrentCheckpoint = (progress: number) => {
  if (progress < 25) return routeCheckpoints[0];
  if (progress < 50) return routeCheckpoints[1];
  if (progress < 99) return routeCheckpoints[2];
  return routeCheckpoints[3];
};

const BookingSection: React.FC<{ t: any }> = ({ t }) => {
  const [view, setView] = useState<'marketplace' | 'active'>('marketplace');
  const [searching, setSearching] = useState(false);
  const [foundTrucks, setFoundTrucks] = useState<any[]>([]);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [podUploaded, setPodUploaded] = useState(false);

  // Form State
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [goodsType, setGoodsType] = useState('FMCG');
  const [weight, setWeight] = useState<string>('');
  const [vehicleType, setVehicleType] = useState('14ft Container');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  // Coordinates
  const [pickupCoords, setPickupCoords] = useState({ lat: 28.6274, lng: 77.3725 }); 
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 28.4744, lng: 77.5030 }); 
  const [truckPosition, setTruckPosition] = useState({ lat: 28.6274, lng: 77.3725 });
  const [tripProgress, setTripProgress] = useState(0);

  // Suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<'pickup' | 'dropoff' | null>(null);

  const autocompleteService = useRef<any>(null);
  const geocoder = useRef<any>(null);

  useEffect(() => {
    if ((window as any).google && !autocompleteService.current) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      geocoder.current = new (window as any).google.maps.Geocoder();
    }
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickupCoords(coords);
        if (geocoder.current) {
          geocoder.current.geocode({ location: coords }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              setPickupAddress(results[0].formatted_address);
            }
          });
        }
      });
    }
  };

  const handleAddressSearch = (val: string, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') setPickupAddress(val);
    else setDropoffAddress(val);

    if (val.length > 3 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        { input: val, componentRestrictions: { country: 'in' } },
        (predictions: any) => {
          if (type === 'pickup') setPickupSuggestions(predictions || []);
          else setDropoffSuggestions(predictions || []);
          setShowSuggestions(type);
        }
      );
    } else {
      setShowSuggestions(null);
    }
  };

  const selectSuggestion = (suggestion: any, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') setPickupAddress(suggestion.description);
    else setDropoffAddress(suggestion.description);
    setShowSuggestions(null);

    // Get Lat Lng
    if (geocoder.current) {
      geocoder.current.geocode({ placeId: suggestion.place_id }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          if (type === 'pickup') setPickupCoords({ lat: loc.lat(), lng: loc.lng() });
          else setDropoffCoords({ lat: loc.lat(), lng: loc.lng() });
        }
      });
    }
  };

  useEffect(() => {
    let interval: number | undefined;
    if (view === 'active' && activeBooking) {
      setTruckPosition(pickupCoords);
      setTripProgress(0);
      const journeyDuration = 30000;
      const updateInterval = 1000;
      const steps = journeyDuration / updateInterval;
      let currentStep = 0;
      interval = window.setInterval(() => {
        currentStep++;
        const progress = Math.min(currentStep / steps, 1);
        setTripProgress(progress * 100);
        const newLat = pickupCoords.lat + (dropoffCoords.lat - pickupCoords.lat) * progress;
        const newLng = pickupCoords.lng + (dropoffCoords.lng - pickupCoords.lng) * progress;
        setTruckPosition({ lat: newLat, lng: newLng });
        if (progress >= 1 && interval) clearInterval(interval);
      }, updateInterval);
    }
    return () => interval && clearInterval(interval);
  }, [view, activeBooking, pickupCoords, dropoffCoords]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => {
      setFoundTrucks([
        { id: 1, driver: "Arun Kumar", rating: 4.9, truck: "Tata Prima 4028", dist: "1.2 km away", price: "₹24,500" },
        { id: 2, driver: "Suresh Patil", rating: 4.7, truck: "Ashok Leyland 2823", dist: "3.5 km away", price: "₹23,800" },
        { id: 3, driver: "Vikram Raj", rating: 4.5, truck: "Eicher Pro 6028", dist: "4.8 km away", price: "₹25,100" },
      ]);
      setSearching(false);
    }, 2500);
  };

  const handleBook = (truck: any) => {
    setActiveBooking(truck);
    setView('active');
  };
  
  const handleMapPositionChange = (positions: { start: { lat: number; lng: number }; end: { lat: number; lng: number } }) => {
    setPickupCoords(positions.start);
    setDropoffCoords(positions.end);
    // Optionally reverse geocode again here to update input text
  };

  const currentCheckpoint = tripProgress < 100 ? getCurrentCheckpoint(tripProgress) : routeCheckpoints[3];

  // Calculate remaining distance for UI display based on trip progress
  const remainingKm = (1 - (tripProgress / 100)) * 12.5;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight uppercase">{t.booking}</h2>
          <p className="text-slate-500 font-bold">Instantly connect with India's largest verified fleet.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[24px] w-fit border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setView('marketplace')}
            className={`px-8 py-3 rounded-[18px] text-sm font-black transition-all uppercase tracking-tighter ${view === 'marketplace' ? 'bg-white dark:bg-slate-700 shadow-xl text-orange-600' : 'text-slate-500'}`}
          >
            New Booking
          </button>
          <button 
            onClick={() => setView('active')}
            className={`px-8 py-3 rounded-[18px] text-sm font-black transition-all uppercase tracking-tighter ${view === 'active' ? 'bg-white dark:bg-slate-700 shadow-xl text-orange-600' : 'text-slate-500'}`}
          >
            My Trips
          </button>
        </div>
      </div>

      {view === 'marketplace' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 p-10 rounded-[48px] border-4 border-slate-950 dark:border-slate-700 shadow-2xl space-y-8 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-xl shadow-orange-500/20">
                    <Package size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Shipment Details</h3>
                </div>
                <button type="button" onClick={detectLocation} className="flex items-center gap-2 text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-500 hover:text-orange-500 transition-colors">
                  <Target size={14} /> Detect Location
                </button>
              </div>

              <div className="space-y-6">
                {/* Pickup with Suggestions */}
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Pickup Address</label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search pickup location..." 
                      className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-5 pl-12 pr-4 focus:ring-4 focus:ring-orange-500/10 font-bold" 
                      value={pickupAddress}
                      onChange={(e) => handleAddressSearch(e.target.value, 'pickup')}
                    />
                  </div>
                  {showSuggestions === 'pickup' && pickupSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                      {pickupSuggestions.map((s) => (
                        <button key={s.place_id} onClick={() => selectSuggestion(s, 'pickup')} className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b last:border-0 border-slate-100 dark:border-slate-700 flex items-center gap-3">
                          <MapPin size={16} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropoff with Suggestions */}
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Drop-off Address</label>
                  <div className="relative mt-2">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search delivery location..." 
                      className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-5 pl-12 pr-4 focus:ring-4 focus:ring-orange-500/10 font-bold" 
                      value={dropoffAddress}
                      onChange={(e) => handleAddressSearch(e.target.value, 'dropoff')}
                    />
                  </div>
                  {showSuggestions === 'dropoff' && dropoffSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                      {dropoffSuggestions.map((s) => (
                        <button key={s.place_id} onClick={() => selectSuggestion(s, 'dropoff')} className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b last:border-0 border-slate-100 dark:border-slate-700 flex items-center gap-3">
                          <MapPin size={16} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Goods Type</label>
                    <div className="relative">
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 font-bold appearance-none cursor-pointer"
                        value={goodsType}
                        onChange={(e) => setGoodsType(e.target.value)}
                      >
                        <option>FMCG</option>
                        <option>Electronics</option>
                        <option>Construction</option>
                        <option>Textiles</option>
                        <option>Industrial Equipment</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Approx Weight (Tons)</label>
                    <div className="relative">
                      <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number" 
                        placeholder="e.g. 15" 
                        className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-5 pl-12 focus:ring-4 focus:ring-orange-500/10 font-bold" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Vehicle Category</label>
                    <div className="relative">
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 font-bold appearance-none cursor-pointer"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                      >
                        <option>Tata Ace / LCV</option>
                        <option>14ft Container</option>
                        <option>19ft Eicher</option>
                        <option>22ft Multi-Axle</option>
                        <option>32ft MX Trailer</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Date of Dispatch</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="date" 
                        className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-5 pl-12 focus:ring-4 focus:ring-orange-500/10 font-bold" 
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-950 dark:bg-orange-500 text-white py-6 rounded-[28px] font-black text-xl hover:bg-black dark:hover:bg-orange-600 shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                disabled={searching}
              >
                {searching ? (
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>FIND VERIFIED TRUCKS <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>
            </form>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-[32px] flex gap-4">
              <Info className="text-blue-500 shrink-0" size={24} />
              <div>
                <h5 className="font-black text-blue-900 dark:text-blue-300 text-sm">Real-time GPS Guaranteed</h5>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">All trucks in our network are equipped with mandatory dual-band GPS sensors and verified documentation.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
             <div className="relative group">
                <MapComponent
                  isDraggable={true}
                  startPos={pickupCoords}
                  endPos={dropoffCoords}
                  onPositionsChange={handleMapPositionChange}
                />
                <div className="absolute top-6 left-6 bg-slate-950/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-3 border border-white/10 pointer-events-none">
                  <Move size={16} className="text-orange-500" />
                  DRAG MARKERS TO REFINE ROUTE
                </div>
             </div>

            {searching && (
              <div className="bg-white dark:bg-slate-900 rounded-[48px] p-24 flex flex-col items-center justify-center text-center space-y-8 border-4 border-dashed border-slate-200 dark:border-slate-800 animate-pulse">
                <div className="relative">
                  <div className="w-48 h-48 border-4 border-orange-500/20 rounded-full animate-[ping_3s_infinite]" />
                  <div className="absolute inset-0 m-auto w-32 h-32 border-8 border-orange-500/40 rounded-full animate-spin border-t-orange-500" />
                  <Truck className="absolute inset-0 m-auto text-orange-600" size={56} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-4xl font-black uppercase tracking-tighter">Scanning Cloud Network</h4>
                  <p className="text-slate-500 text-xl font-bold mt-2 italic">Checking 50,000+ trucks in NCR-UP corridor...</p>
                </div>
              </div>
            )}

            {!searching && foundTrucks.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right duration-700">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 mb-2">3 TRUCKS READY FOR DISPATCH</h4>
                {foundTrucks.map((truck) => (
                  <div key={truck.id} className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-xl hover:border-orange-500 transition-all flex flex-col sm:flex-row items-center justify-between gap-8 group">
                    <div className="flex gap-8 w-full">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-lg">
                        <Truck size={48} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-2xl font-black tracking-tight">{truck.truck}</h4>
                           <div className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                             <ShieldCheck size={12} /> Verified
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-slate-600 dark:text-slate-400">{truck.driver}</span>
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 px-3 py-1 rounded-xl text-sm font-black">
                            {truck.rating} <Star size={14} fill="currentColor" />
                          </div>
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{truck.dist}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3">
                      <p className="text-4xl font-black text-orange-600">{truck.price}</p>
                      <button onClick={() => handleBook(truck)} className="bg-slate-950 dark:bg-white dark:text-slate-950 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.05] transition-transform shadow-2xl flex items-center gap-3">
                        DISPATCH NOW <ArrowRight size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[56px] p-12 border border-slate-100 dark:border-slate-700 shadow-3xl">
          {!activeBooking ? (
            <div className="text-center py-24">
              <div className="bg-slate-50 dark:bg-slate-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-dashed border-slate-200 dark:border-slate-800">
                <Clock size={64} className="text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-400 uppercase tracking-tighter">No Active Trips</h3>
              <p className="text-slate-500 font-bold max-w-sm mx-auto mt-4">Book a verified truck from the marketplace to track your cargo in real-time.</p>
              <button onClick={() => setView('marketplace')} className="mt-8 px-10 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-orange-500/30 hover:scale-105 transition-transform">Start Searching</button>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-12 animate-in zoom-in duration-700">
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="flex-1 space-y-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-emerald-500 font-black uppercase text-xs tracking-[0.3em]">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-[pulse_1s_infinite]" />
                      {tripProgress < 100 ? 'GPS ACTIVE: IN TRANSIT' : 'TRIP COMPLETED'}
                    </div>
                    <h3 className="text-6xl font-black tracking-tighter leading-none">{activeBooking.truck}</h3>
                    <div className="flex items-center gap-4 text-slate-500 font-bold">
                       <span className="flex items-center gap-2"><UserIcon size={18} className="text-orange-500" /> {activeBooking.driver}</span>
                       <span className="text-slate-300">|</span>
                       <span>ID: GD-98211</span>
                    </div>
                  </div>

                  <div className="relative pl-10 space-y-16">
                    <div className="absolute left-[15px] top-3 bottom-3 w-1 bg-gradient-to-b from-orange-500 via-blue-500 to-emerald-500 rounded-full" />
                    
                    <div className="relative">
                      <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-orange-500 border-4 border-white dark:border-slate-800 shadow-xl" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-2">Pickup Point</p>
                      <p className="text-xl font-black">{pickupAddress.split(',')[0]}</p>
                      <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{pickupAddress}</p>
                    </div>
                    
                    {tripProgress < 100 ? (
                      <div className="relative">
                        <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-blue-500 border-4 border-white dark:border-slate-800 shadow-xl animate-bounce" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 leading-none mb-2">Live Location</p>
                        <p className="text-xl font-black">{currentCheckpoint}</p>
                        <p className="text-sm font-black text-blue-600 mt-2 flex items-center gap-2">
                           <Navigation size={14} className="animate-pulse" /> {remainingKm.toFixed(1)} KM UNTIL DROP
                        </p>
                      </div>
                    ) : (
                       <div className="relative">
                        <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800 shadow-xl" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 leading-none mb-2">Current Location</p>
                        <p className="text-xl font-black">Destination Reached</p>
                        <p className="text-xs text-emerald-600 font-bold mt-1">Proof of Delivery Pending</p>
                      </div>
                    )}

                    <div className="relative">
                       <div className={`absolute -left-12 top-0 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 shadow-xl ${tripProgress === 100 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-2">Delivery Point</p>
                      <p className="text-xl font-black">{dropoffAddress.split(',')[0]}</p>
                      <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-96 space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border-4 border-slate-950 dark:border-slate-800 shadow-2xl">
                    <h4 className="font-black text-xl mb-6 flex items-center gap-3"><FileText size={24} className="text-orange-500" /> Digital POD</h4>
                    {podUploaded ? (
                      <div className="text-center py-6 animate-in zoom-in">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                           <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                        <p className="font-black text-lg uppercase tracking-tight">Receipt Verified</p>
                        <p className="text-[10px] uppercase text-slate-400 font-black mt-1">Synced to Cloud Bilty</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-sm text-slate-500 font-bold leading-relaxed">Capture the signed LR/Bilty once the truck reaches the destination to release payment.</p>
                        <button 
                          onClick={() => setPodUploaded(true)}
                          disabled={tripProgress < 100}
                          className="w-full bg-white dark:bg-slate-800 border-4 border-dashed border-slate-200 dark:border-slate-700 p-12 rounded-[32px] flex flex-col items-center gap-4 hover:border-orange-500 transition-all group disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-50 dark:hover:bg-orange-950/20"
                        >
                          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <Upload size={32} />
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest text-slate-500 group-hover:text-orange-600">Scan POD</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                     <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
                        <Navigation size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Next Hub</p>
                        <p className="text-sm font-black">{currentCheckpoint}</p>
                     </div>
                  </div>

                  <button onClick={() => setActiveBooking(null)} className="w-full py-4 text-slate-400 text-sm font-black uppercase tracking-widest hover:text-red-600 transition-colors border-2 border-transparent hover:border-red-600/20 rounded-2xl">Abort Booking</button>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t-2 border-slate-50 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-2xl uppercase tracking-tighter">Live Google Maps Fleet Track</h4>
                  <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Navigation size={12} className="animate-pulse" /> Precision: 5 Meters
                  </div>
                </div>
                <MapComponent
                  startPos={pickupCoords}
                  endPos={dropoffCoords}
                  currentPosition={truckPosition}
                  isDraggable={false}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Internal icon fix for missing User import
const UserIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default BookingSection;