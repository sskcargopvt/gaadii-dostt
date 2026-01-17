
import React, { useState } from 'react';
import { Calculator, Info, Zap, Map, Fuel, DollarSign, BrainCircuit } from 'lucide-react';
import { getLoadEstimation } from '../services/geminiService';

const CalculatorSection: React.FC<{ t: any }> = ({ t }) => {
  const [material, setMaterial] = useState('');
  const [weight, setWeight] = useState<number | string>('');
  const [distance, setDistance] = useState<number | string>('');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material || !weight || !distance) return;
    
    setLoading(true);
    try {
      const result = await getLoadEstimation(material, Number(weight), Number(distance));
      setEstimate(result);
    } catch (error) {
      console.error("Calculation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold">{t.calculator}</h2>
        <p className="text-slate-500">Smart AI-powered logistics cost estimator.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm h-fit">
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Material Type</label>
                <input 
                  type="text" 
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. Cement, Steel Bars, Textiles" 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-amber-500" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.weight}</label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="10" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-amber-500" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Distance (KM)</label>
                  <input 
                    type="number" 
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="500" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-amber-500" 
                    required 
                  />
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-slate-900 dark:bg-amber-500 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <BrainCircuit size={20} />
                  Generate AI Estimate
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800 flex gap-4">
            <Info className="text-amber-500 flex-shrink-0" size={20} />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Estimates are calculated using real-time market data and fuel price benchmarks. Final rates may vary based on vehicle availability.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-12 h-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
               <div className="flex gap-2">
                 <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                 <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                 <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
               </div>
               <p className="font-medium text-slate-500 italic">Gemini is processing market trends...</p>
            </div>
          ) : estimate ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700">
              <div className="bg-amber-500 rounded-3xl p-8 text-white shadow-xl shadow-amber-500/20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-amber-100 text-sm font-bold uppercase tracking-wider">Estimated Total Cost</p>
                    <h3 className="text-5xl font-black">₹{estimate.estimatedCost.toLocaleString()}</h3>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    <DollarSign size={24} />
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/20">
                  <Zap size={16} className="text-amber-200" />
                  <p className="text-sm font-medium">Recommended: <span className="font-bold underline">{estimate.truckType}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                  <Fuel className="text-blue-500 mb-2" />
                  <p className="text-slate-500 text-xs font-bold uppercase">Fuel Expense</p>
                  <p className="text-xl font-bold">₹{estimate.fuelEstimate.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                  <Map className="text-emerald-500 mb-2" />
                  <p className="text-slate-500 text-xs font-bold uppercase">Toll Expense</p>
                  <p className="text-xl font-bold">₹{estimate.tollEstimate.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-3xl text-white">
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                   <BrainCircuit size={18} className="text-amber-500" />
                   AI Analysis
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {estimate.reasoning}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Calculator size={64} className="text-slate-300 mb-6" />
              <h4 className="text-xl font-bold text-slate-400">No Calculation Ready</h4>
              <p className="text-slate-500 max-w-xs">Fill the estimator form to see a detailed breakdown of your trip costs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorSection;
