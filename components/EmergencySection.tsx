
import React, { useState, useEffect } from 'react';
import { Truck, Fuel, Wrench, CircleDashed, Phone, MessageSquare, MapPin, Navigation, Receipt, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase } from '../services/supabaseClient.ts';

const EmergencySection: React.FC<{ t: any }> = ({ t }) => {
  const [step, setStep] = useState<'selection' | 'tracking' | 'bill'>('selection');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [eta, setEta] = useState(15);
  const [loading, setLoading] = useState(false);

  const emergencyTypes = [
    { id: 'tow', label: t.towTruck, icon: Truck, color: "bg-orange-500" },
    { id: 'fuel', label: t.fuelDelivery, icon: Fuel, color: "bg-blue-500" },
    { id: 'mechanic', label: t.mechanic, icon: Wrench, color: "bg-red-500" },
    { id: 'tire', label: t.tirePuncture, icon: CircleDashed, color: "bg-slate-700" },
    { id: 'battery', label: t.batteryJump, icon: Navigation, color: "bg-yellow-500" },
    { id: 'other', label: t.other, icon: MessageSquare, color: "bg-purple-500" },
  ];

  useEffect(() => {
    let interval: any;
    if (step === 'tracking' && eta > 0) {
      interval = setInterval(() => setEta(prev => prev - 1), 10000);
    } else if (eta === 0 && step === 'tracking') {
      setStep('bill');
    }
    return () => clearInterval(interval);
  }, [step, eta]);

  const handleRequest = async (type: string) => {
    setLoading(true);
    setSelectedType(type);
    
    try {
      // Log emergency to Supabase
      await supabase
        .from('emergency_requests')
        .insert([{
          type: type,
          status: 'assigned',
          eta: 15,
          location: 'Auto-detected via Browser'
        }]);
    } catch (err) {
      console.error('Logging failed:', err);
    } finally {
      setLoading(false);
      setStep('tracking');
      setEta(15);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-500">{t.emergency}</h2>
          <p className="text-slate-500 dark:text-slate-400">Roadside assistance and logistics support.</p>
        </div>
        {step === 'selection' && (
          <div className="hidden sm:flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-full font-bold">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            24/7 Cloud Support Active
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
        {step === 'selection' ? (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-center mb-8">{t.selectEmergency}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {emergencyTypes.map((item) => (
                <button
                  key={item.id}
                  disabled={loading}
                  onClick={() => handleRequest(item.id)}
                  className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group border-2 border-transparent hover:border-red-500 disabled:opacity-50"
                >
                  <div className={`${item.color} p-5 rounded-2xl text-white shadow-lg shadow-${item.color.split('-')[1]}-200/50`}>
                    <item.icon size={32} />
                  </div>
                  <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
              <p className="text-slate-500 mb-4 font-medium">For critical life-threatening situations:</p>
              <button className="flex items-center gap-3 mx-auto bg-slate-900 dark:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform">
                <Phone size={24} />
                Call Help Center: 1800-GADI-DOST
              </button>
            </div>
          </div>
        ) : step === 'tracking' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Technician Assigned</h3>
                    <p className="text-slate-500">Auto-dispatched from nearest hub.</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Service</span>
                    <span className="font-bold uppercase text-red-500">{selectedType} Assistance</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Provider</span>
                    <span className="font-bold">Balaji Auto Works (4.9 ★)</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600 dark:text-red-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-black uppercase tracking-widest">ETA</span>
                    <span className="text-3xl font-black">{eta} Mins</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200">
                    <Phone size={20} /> Call Technician
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 py-4 rounded-2xl font-bold">
                    <MessageSquare size={20} /> Chat Support
                  </button>
                </div>
              </div>

              <div className="w-full md:w-[450px] h-[350px] bg-slate-100 dark:bg-slate-900 rounded-3xl relative overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="absolute inset-0 opacity-40 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i14!2i9375!3i6000!2m3!1e0!2sm!3i420120488!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2!23i1301875')] bg-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white border-4 border-white shadow-2xl animate-bounce">
                      <Wrench size={24} />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black shadow-lg">MOVING</div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Route</p>
                  <p className="text-sm font-bold truncate">Old Mumbai-Pune Hwy, Sector 15</p>
                </div>
              </div>
            </div>
            <button onClick={() => setStep('selection')} className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors">Cancel Request</button>
          </div>
        ) : (
          <div className="text-center py-10 max-w-lg mx-auto space-y-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-3xl font-black mb-2">Service Completed!</h3>
              <p className="text-slate-500">Your vehicle is ready to hit the road again.</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-left">
              <h4 className="font-bold flex items-center gap-2 mb-6">
                <Receipt className="text-slate-400" size={18} />
                Service Summary
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Assistance Fee</span>
                  <span className="font-bold">₹500.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{selectedType} Labor</span>
                  <span className="font-bold">₹1,250.00</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-black text-lg">Total Amount</span>
                  <span className="text-2xl font-black text-red-600">₹1,750.00</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setStep('selection')} className="bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black">
                Pay with UPI
              </button>
              <button onClick={() => setStep('selection')} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 py-4 rounded-2xl font-bold">
                Cash Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySection;
