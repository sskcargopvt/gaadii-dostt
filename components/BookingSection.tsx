
import React, { useState } from 'react';
import { Search, MapPin, Package, Weight, ArrowRight, ShieldCheck, Star, Clock, Upload, CheckCircle2, FileText, Truck } from 'lucide-react';

const BookingSection: React.FC<{ t: any }> = ({ t }) => {
  const [view, setView] = useState<'marketplace' | 'active'>('marketplace');
  const [searching, setSearching] = useState(false);
  const [foundTrucks, setFoundTrucks] = useState<any[]>([]);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [podUploaded, setPodUploaded] = useState(false);

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
    }, 1500);
  };

  const handleBook = (truck: any) => {
    setActiveBooking(truck);
    setView('active');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">{t.booking}</h2>
          <p className="text-slate-500 dark:text-slate-400">On-demand GPS fleet marketplace.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setView('marketplace')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'marketplace' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-slate-500'}`}
          >
            Find Trucks
          </button>
          <button 
            onClick={() => setView('active')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-slate-500'}`}
          >
            Active Trips
          </button>
        </div>
      </div>

      {view === 'marketplace' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100 dark:shadow-none space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600">
                  <Package size={20} />
                </div>
                <h3 className="text-xl font-bold">New Shipment</h3>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                  <input type="text" placeholder={t.pickup} className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 focus:ring-2 focus:ring-amber-500 text-sm" required />
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <input type="text" placeholder={t.dropoff} className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 focus:ring-2 focus:ring-amber-500 text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder={t.loadType} className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 focus:ring-2 focus:ring-amber-500 text-sm" />
                  </div>
                  <div className="relative">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="number" placeholder={t.weight} className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 focus:ring-2 focus:ring-amber-500 text-sm" />
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-amber-600 shadow-lg shadow-amber-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                disabled={searching}
              >
                {searching ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Search Trucks</>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {searching ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-6 h-full border border-slate-100 dark:border-slate-700">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-amber-500/20 rounded-full animate-ping" />
                  <Truck className="absolute inset-0 m-auto text-amber-500" size={48} />
                </div>
                <div>
                  <h4 className="text-2xl font-black">Scanning GPS Fleet</h4>
                  <p className="text-slate-500">Checking availability within 20km of your pickup location.</p>
                </div>
              </div>
            ) : foundTrucks.length > 0 ? (
              foundTrucks.map((truck) => (
                <div key={truck.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-amber-500 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group">
                  <div className="flex gap-5 w-full">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/10 group-hover:text-amber-600 transition-colors">
                      <Truck size={40} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold">{truck.truck}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-semibold">{truck.driver}</span>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-black">
                          {truck.rating} <Star size={10} fill="currentColor" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><MapPin size={12}/> {truck.dist}</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={12}/> Verified Fleet</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2">
                    <p className="text-3xl font-black text-amber-600">{truck.price}</p>
                    <button onClick={() => handleBook(truck)} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                      Book Now <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center h-full text-slate-400">
                <Search size={64} strokeWidth={1} className="mb-4" />
                <h4 className="text-xl font-bold">Marketplace Ready</h4>
                <p className="max-w-xs text-sm">Enter shipment details to connect with thousands of GPS-verified truck owners.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 border border-slate-100 dark:border-slate-700">
          {!activeBooking ? (
            <div className="text-center py-20">
              <Clock size={64} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-2xl font-bold text-slate-400">No Active Trips</h3>
              <p className="text-slate-500">Your current bookings will appear here for live tracking and POD.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600 font-bold uppercase text-xs tracking-widest">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      In Transit
                    </div>
                    <h3 className="text-4xl font-black">{activeBooking.truck}</h3>
                    <p className="text-slate-500">Driver: {activeBooking.driver} • Booking ID: GD-98211</p>
                  </div>

                  <div className="relative pl-8 space-y-12">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-700" />
                    <div className="relative">
                      <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-amber-500 border-4 border-white dark:border-slate-800 shadow-sm" />
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Pickup</p>
                      <p className="font-bold">Nhava Sheva Port, Mumbai</p>
                      <p className="text-xs text-slate-400">Completed: Oct 24, 09:15 AM</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-800 shadow-sm animate-pulse" />
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Current</p>
                      <p className="font-bold">Lonavala Highway Exit</p>
                      <p className="text-xs text-blue-500 font-bold">142 KM to destination</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-sm" />
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Dropoff</p>
                      <p className="font-bold">Wakad Industrial Estate, Pune</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold mb-4 flex items-center gap-2"><FileText size={18} /> Digital POD</h4>
                    {podUploaded ? (
                      <div className="text-center py-4 text-green-600">
                        <CheckCircle2 size={40} className="mx-auto mb-2" />
                        <p className="font-black text-sm">POD UPLOADED</p>
                        <p className="text-[10px] uppercase text-slate-400">Verified by GPS Stamp</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500">Capture or upload the signed receipt once the load is delivered.</p>
                        <button 
                          onClick={() => setPodUploaded(true)}
                          className="w-full bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 rounded-2xl flex flex-col items-center gap-2 hover:border-amber-500 transition-colors group"
                        >
                          <Upload className="text-slate-400 group-hover:text-amber-500" />
                          <span className="text-xs font-bold text-slate-500">Upload POD</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <button className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold hover:bg-amber-600 shadow-lg">Live Video Feed</button>
                  <button onClick={() => setActiveBooking(null)} className="w-full text-slate-400 text-sm font-bold hover:text-red-500">Cancel Booking</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSection;
