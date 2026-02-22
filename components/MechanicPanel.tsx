
import React, { useState, useEffect } from 'react';
import {
    Wrench, Bell, CheckCircle2, X, Star, MapPin, Navigation,
    ToggleLeft, ToggleRight, TrendingUp, Clock, Phone, User,
    Loader2, AlertCircle, ShieldCheck, Banknote, Building2,
    Zap, Truck, Settings, Package, IndianRupee, FileText,
    ChevronRight, Activity, Hash
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

/* ── Types ───────────────────────────────────────── */
interface ServiceRequest {
    id: string;
    customer_name: string;
    customer_phone: string;
    location: string;
    service_type: string;
    vehicle_type: string;
    issue_description: string;
    offered_price: string;
    status: string;
    created_at: string;
}

const SERVICE_BADGES: Record<string, { icon: any; color: string }> = {
    'Tyre Puncture': { icon: Settings, color: 'orange' },
    'Engine Breakdown': { icon: Wrench, color: 'red' },
    'Brake Failure': { icon: AlertCircle, color: 'red' },
    'Towing': { icon: Truck, color: 'blue' },
    'Battery Jump-Start': { icon: Zap, color: 'yellow' },
    'Fuel Delivery': { icon: Package, color: 'green' },
    'General Repairs': { icon: Wrench, color: 'slate' },
    'AC Repair': { icon: Settings, color: 'sky' },
};

/* ════════════════════════════════════════════════════
   MECHANIC PANEL COMPONENT
════════════════════════════════════════════════════ */
const MechanicPanel: React.FC<{ t: any }> = ({ t }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');
    const [available, setAvailable] = useState(false);
    const [savingAvail, setSavingAvail] = useState(false);
    const [mechanicId, setMechanicId] = useState<string | null>(null);
    const [incomingRequests, setIncomingRequests] = useState<ServiceRequest[]>([]);
    const [activeJob, setActiveJob] = useState<ServiceRequest | null>(null);
    const [jobStage, setJobStage] = useState<'idle' | 'travelling' | 'working' | 'done'>('idle');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, todayCount: 0, weekCount: 0, monthCount: 0 });
    const [loadingEarnings, setLoadingEarnings] = useState(true);

    /* ── Profile state ── */
    const [profile, setProfile] = useState({
        full_name: '', phone: '', email: '', shop_name: '', address: '',
        city: '', state: '', pincode: '', experience_years: '',
        service_radius_km: '10', gst_number: '', aadhaar_number: '',
        upi_id: '', bank_account_number: '', bank_ifsc: '', bank_name: '',
        selected_services: [] as string[]
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    const SERVICE_TYPES = ['Tyre Puncture', 'Engine Breakdown', 'Brake Failure', 'Towing', 'Battery Jump-Start', 'Fuel Delivery', 'General Repairs', 'AC Repair'];

    /* ── Load mechanic id ── */
    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) setMechanicId(session.user.id);
        })();
    }, []);

    /* ── Load profile ── */
    useEffect(() => {
        if (!mechanicId) return;
        (async () => {
            const { data } = await supabase.from('mechanic_profiles').select('*').eq('mechanic_id', mechanicId).single();
            if (data) {
                setProfile(p => ({ ...p, ...data }));
                if (data.available !== undefined) setAvailable(data.available);
            }
        })();
    }, [mechanicId]);

    /* ── Load earnings ── */
    useEffect(() => {
        if (!mechanicId) return;
        (async () => {
            setLoadingEarnings(true);
            try {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const { data } = await supabase
                    .from('mechanic_requests')
                    .select('offered_price, created_at')
                    .eq('mechanic_id', mechanicId)
                    .eq('status', 'completed');
                if (data) {
                    const calc = (from: string) => data.filter(r => r.created_at >= from);
                    const sum = (rows: any[]) => rows.reduce((a, r) => a + Number(r.offered_price || 0), 0);
                    setEarnings({
                        today: sum(calc(todayStart)), week: sum(calc(weekStart)), month: sum(calc(monthStart)),
                        todayCount: calc(todayStart).length, weekCount: calc(weekStart).length, monthCount: calc(monthStart).length
                    });
                }
            } finally { setLoadingEarnings(false); }
        })();
    }, [mechanicId]);

    /* ── Real-time incoming requests ── */
    useEffect(() => {
        if (!mechanicId) return;
        const channel = supabase.channel('mechanic_requests')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mechanic_requests', filter: 'status=eq.pending' },
                (payload: any) => {
                    const req: ServiceRequest = payload.new;
                    if (!req) return;
                    setIncomingRequests(prev => prev.find(r => r.id === req.id) ? prev : [req, ...prev]);
                    addNotif(Bell, 'orange', '🔧 New Service Request!', `${req.service_type} — ${req.location?.split(',')[0]}`);
                })
            .on('broadcast', { event: 'INSERT' }, (payload: any) => {
                const req: ServiceRequest = payload.payload?.new || payload.payload;
                if (!req) return;
                setIncomingRequests(prev => prev.find(r => r.id === req.id) ? prev : [req, ...prev]);
            })
            .subscribe();
        fetchPendingRequests();
        const interval = setInterval(fetchPendingRequests, 20000);
        return () => { supabase.removeChannel(channel); clearInterval(interval); };
    }, [mechanicId]);

    const fetchPendingRequests = async () => {
        const { data } = await supabase.from('mechanic_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(8);
        if (data) setIncomingRequests(data);
    };

    const addNotif = (Icon: any, color: string, title: string, desc: string) => {
        setNotifications(prev => [{ id: Date.now().toString(), icon: Icon, color, title, desc, time: 'Just now' }, ...prev].slice(0, 10));
    };

    const toggleAvailability = async () => {
        setSavingAvail(true);
        const next = !available;
        setAvailable(next);
        if (mechanicId) {
            await supabase.from('mechanic_profiles').upsert({ mechanic_id: mechanicId, available: next }, { onConflict: 'mechanic_id' });
        }
        addNotif(next ? ToggleRight : ToggleLeft, next ? 'emerald' : 'slate', next ? 'You are Online' : 'You are Offline', next ? 'Ready to receive service requests' : 'Not receiving new requests');
        setSavingAvail(false);
    };

    const acceptRequest = async (req: ServiceRequest) => {
        await supabase.from('mechanic_requests').update({ status: 'accepted', mechanic_id: mechanicId }).eq('id', req.id);
        setActiveJob(req);
        setJobStage('travelling');
        setIncomingRequests(prev => prev.filter(r => r.id !== req.id));
        addNotif(CheckCircle2, 'emerald', 'Job Accepted!', `Heading to ${req.location?.split(',')[0]}`);
    };

    const rejectRequest = async (req: ServiceRequest) => {
        await supabase.from('mechanic_requests').update({ status: 'rejected' }).eq('id', req.id);
        setIncomingRequests(prev => prev.filter(r => r.id !== req.id));
        addNotif(X, 'red', 'Request Declined', `Service #${req.id.slice(0, 6)} rejected`);
    };

    const updateJobStage = async (stage: 'travelling' | 'working' | 'done') => {
        setJobStage(stage);
        if (!activeJob) return;
        const statusMap = { travelling: 'accepted', working: 'in_progress', done: 'completed' };
        await supabase.from('mechanic_requests').update({ status: statusMap[stage] }).eq('id', activeJob.id);
        if (stage === 'done') {
            addNotif(CheckCircle2, 'emerald', 'Job Complete!', `₹${Number(activeJob.offered_price).toLocaleString()} earned`);
            setEarnings(prev => ({ ...prev, today: prev.today + Number(activeJob.offered_price || 0), todayCount: prev.todayCount + 1 }));
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mechanicId) return;
        setProfileLoading(true); setProfileError(null); setProfileSuccess(false);
        try {
            const { error } = await supabase.from('mechanic_profiles').upsert(
                { ...profile, mechanic_id: mechanicId, available, updated_at: new Date().toISOString() },
                { onConflict: 'mechanic_id' }
            );
            if (error) throw error;
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 4000);
        } catch (err: any) { setProfileError(err.message || 'Failed to save.'); }
        finally { setProfileLoading(false); }
    };

    const inp = 'w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all';
    const lbl = 'text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-1.5';

    /* ── RENDER ── */
    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Top Bar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-[32px] p-5 border border-slate-100 dark:border-slate-700 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Wrench size={26} />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${available ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mechanic Dashboard</p>
                        <h3 className="text-lg font-black">{profile.full_name || profile.shop_name || 'Complete Your Profile'}</h3>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star size={12} fill="currentColor" /> {profile.shop_name || 'No shop registered'}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Availability</p>
                    <button onClick={toggleAvailability} disabled={savingAvail} className="flex items-center gap-2 disabled:opacity-60">
                        {savingAvail ? <Loader2 size={36} className="animate-spin text-slate-400" />
                            : available ? <ToggleRight size={44} className="text-emerald-500" />
                                : <ToggleLeft size={44} className="text-slate-400" />}
                    </button>
                    <span className={`text-xs font-black ${available ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {available ? '● ONLINE – Ready for Jobs' : '○ OFFLINE – Not Available'}
                    </span>
                </div>
            </div>

            {/* ── Tab Switcher ── */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[24px] border border-slate-200 dark:border-slate-700 w-fit">
                <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2.5 rounded-[18px] text-xs font-black uppercase tracking-tight flex items-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-xl text-orange-500' : 'text-slate-500'}`}>
                    <Wrench size={14} /> Live Dashboard
                </button>
                <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-[18px] text-xs font-black uppercase tracking-tight flex items-center gap-2 transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-700 shadow-xl text-orange-500' : 'text-slate-500'}`}>
                    <User size={14} /> My Profile
                </button>
            </div>

            {/* ══ DASHBOARD TAB ══ */}
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Incoming Requests */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                    Service Requests {incomingRequests.length > 0 && <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[9px] ml-2">{incomingRequests.length}</span>}
                                </h4>
                                <button onClick={fetchPendingRequests} className="text-[10px] font-black uppercase text-orange-500 hover:text-orange-700 flex items-center gap-1"><Bell size={11} /> Refresh</button>
                            </div>

                            {!available && (
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-[28px] p-6 text-center">
                                    <ToggleLeft size={32} className="text-slate-400 mx-auto mb-2" />
                                    <p className="font-black text-slate-500 text-sm uppercase">You are Offline</p>
                                    <p className="text-xs text-slate-400 mt-1">Toggle availability to receive service requests</p>
                                </div>
                            )}

                            {available && incomingRequests.length === 0 && !activeJob && (
                                <div className="rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3"><Wrench size={22} className="text-orange-500" /></div>
                                    <p className="font-black text-slate-500 text-sm uppercase">Waiting for Jobs...</p>
                                    <p className="text-xs text-slate-400 mt-1">You'll be notified when a nearby breakdown request arrives</p>
                                </div>
                            )}

                            {available && incomingRequests.map(req => {
                                const badge = SERVICE_BADGES[req.service_type] || { icon: Wrench, color: 'orange' };
                                return (
                                    <div key={req.id} className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-orange-600 to-rose-700 p-7 text-white shadow-2xl shadow-orange-500/20">
                                        <div className="absolute top-4 right-4 flex gap-1">
                                            <div className="w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping absolute" />
                                            <div className="w-2.5 h-2.5 bg-yellow-300 rounded-full" />
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-white/20 p-2 rounded-xl"><badge.icon size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-200">Breakdown Alert</p>
                                                <p className="font-black text-base">{req.service_type} — {req.customer_name}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-2.5 mb-4">
                                            <div className="flex gap-2">
                                                <MapPin size={14} className="text-yellow-300 shrink-0 mt-0.5" />
                                                <div><p className="text-[9px] text-orange-200 font-black uppercase">Location</p><p className="font-black text-sm">{req.location}</p></div>
                                            </div>
                                            <div className="h-px bg-white/10" />
                                            <div className="flex gap-2">
                                                <Phone size={14} className="text-emerald-300 shrink-0 mt-0.5" />
                                                <div><p className="text-[9px] text-orange-200 font-black uppercase">Customer</p><p className="font-black text-sm">{req.customer_name} · {req.customer_phone}</p></div>
                                            </div>
                                            {req.issue_description && (
                                                <>
                                                    <div className="h-px bg-white/10" />
                                                    <p className="text-xs font-bold text-orange-200 italic">"{req.issue_description}"</p>
                                                </>
                                            )}
                                            <div className="h-px bg-white/10" />
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <div><p className="text-[9px] text-orange-200">Vehicle</p><p className="font-black text-xs">{req.vehicle_type}</p></div>
                                                <div><p className="text-[9px] text-orange-200">Earnings</p><p className="font-black text-xs text-emerald-300">₹{Number(req.offered_price).toLocaleString()}</p></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => acceptRequest(req)} className="flex-1 bg-emerald-500 hover:bg-emerald-400 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl">
                                                <CheckCircle2 size={16} /> Accept
                                            </button>
                                            <button onClick={() => rejectRequest(req)} className="flex-1 bg-white/15 hover:bg-white/25 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                                <X size={16} /> Decline
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Active Job */}
                        {activeJob && (
                            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl p-7 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl"><Wrench className="text-orange-500" size={22} /></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Job</p>
                                        <h4 className="font-black text-lg">{activeJob.service_type}</h4>
                                    </div>
                                    <span className="ml-auto text-emerald-600 font-black text-lg">₹{Number(activeJob.offered_price).toLocaleString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    {([['travelling', 'En Route', Navigation], ['working', 'Repairing', Wrench], ['done', 'Done', CheckCircle2]] as [string, string, any][]).map(([key, label, Icon]) => {
                                        const order = ['travelling', 'working', 'done'];
                                        const done = order.indexOf(jobStage) >= order.indexOf(key);
                                        const isActive = jobStage === key;
                                        return (
                                            <button key={key} onClick={() => updateJobStage(key as any)}
                                                className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all flex flex-col items-center gap-2 ${isActive ? 'bg-orange-500 text-white shadow-lg scale-105' : done ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                                                <Icon size={18} />{label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4"><p className="text-[10px] text-slate-400 font-black uppercase">Location</p><p className="font-bold text-sm mt-0.5 truncate">{activeJob.location}</p></div>
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4"><p className="text-[10px] text-slate-400 font-black uppercase">Customer</p><p className="font-black text-sm mt-0.5">{activeJob.customer_phone}</p></div>
                                </div>
                                {jobStage === 'done' && (
                                    <button onClick={() => { setActiveJob(null); setJobStage('idle'); fetchPendingRequests(); }}
                                        className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all">
                                        <CheckCircle2 size={18} /> Complete Job & Get Next
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-5 space-y-5">
                        {/* Earnings */}
                        <div className="bg-slate-950 rounded-[32px] p-7 text-white shadow-2xl space-y-5 border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-500/20 p-3 rounded-2xl"><TrendingUp className="text-orange-400" size={22} /></div>
                                <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Earnings Dashboard</p><h4 className="font-black text-lg">My Earnings</h4></div>
                            </div>
                            {loadingEarnings ? (
                                <div className="flex items-center justify-center py-6"><Loader2 className="animate-spin text-slate-400" size={28} /></div>
                            ) : (
                                <>
                                    <div className="bg-white/5 rounded-2xl p-5 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase">Today</p>
                                            <p className="text-3xl font-black text-orange-400">₹{earnings.today.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 mt-1">{earnings.todayCount} jobs completed</p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center"><Clock size={20} className="text-orange-400" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-2xl p-4"><p className="text-[10px] text-slate-400 font-black uppercase">This Week</p><p className="text-xl font-black text-emerald-400">₹{earnings.week.toLocaleString()}</p><p className="text-[10px] text-slate-500 mt-1">{earnings.weekCount} jobs</p></div>
                                        <div className="bg-white/5 rounded-2xl p-4"><p className="text-[10px] text-slate-400 font-black uppercase">This Month</p><p className="text-xl font-black text-blue-400">₹{earnings.month.toLocaleString()}</p><p className="text-[10px] text-slate-500 mt-1">{earnings.monthCount} jobs</p></div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl p-7 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl"><Bell className="text-orange-500" size={18} /></div>
                                    <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</p><h4 className="font-black text-base">Live Alerts</h4></div>
                                </div>
                                {notifications.length > 0 && <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">{notifications.length}</span>}
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {notifications.length === 0
                                    ? <p className="text-center text-xs text-slate-400 font-medium py-6">No notifications yet</p>
                                    : notifications.map((n, i) => (
                                        <div key={n.id} className={`flex items-start gap-3 p-3 rounded-2xl ${i === 0 ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20' : 'bg-slate-50 dark:bg-slate-900'}`}>
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-${n.color}-100 dark:bg-${n.color}-900/30`}><n.icon size={14} className={`text-${n.color}-600`} /></div>
                                            <div className="flex-1 min-w-0"><p className="text-xs font-black text-slate-800 dark:text-white">{n.title}</p><p className="text-[10px] text-slate-500 mt-0.5 truncate">{n.desc}</p></div>
                                            <span className="text-[10px] text-slate-400 font-bold shrink-0">{n.time}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ PROFILE TAB ══ */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-7 animate-in fade-in duration-300">
                    {profileSuccess && <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600"><CheckCircle2 size={20} /><p className="text-sm font-black uppercase">Profile Saved!</p></div>}
                    {profileError && <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500"><AlertCircle size={20} /><p className="text-sm font-black">{profileError}</p></div>}

                    {/* Personal */}
                    <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-5">
                        <div className="flex items-center gap-3 mb-1"><div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl"><User className="text-orange-500" size={20} /></div><h3 className="font-black text-lg uppercase">Personal Information</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Full Name', id: 'full_name', icon: User, placeholder: 'Ramesh Sharma' },
                                { label: 'Phone', id: 'phone', icon: Phone, placeholder: '+91 98765 43210' },
                                { label: 'Shop / Business Name', id: 'shop_name', icon: Building2, placeholder: 'Sharma Auto Works' },
                                { label: 'Experience (years)', id: 'experience_years', icon: Star, placeholder: '8' },
                            ].map(({ label, id, icon: Icon, placeholder }) => (
                                <div key={id} className="space-y-1">
                                    <label className={lbl}>{label}</label>
                                    <div className="relative"><Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input type="text" placeholder={placeholder} value={(profile as any)[id] || ''} onChange={e => setProfile(p => ({ ...p, [id]: e.target.value }))} className={inp} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'City', id: 'city', placeholder: 'Kanpur' },
                                { label: 'State', id: 'state', placeholder: 'Uttar Pradesh' },
                                { label: 'Pincode', id: 'pincode', placeholder: '208001' },
                            ].map(({ label, id, placeholder }) => (
                                <div key={id} className="space-y-1">
                                    <label className={lbl}>{label}</label>
                                    <input type="text" placeholder={placeholder} value={(profile as any)[id] || ''} onChange={e => setProfile(p => ({ ...p, [id]: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Services Offered */}
                    <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-5">
                        <div className="flex items-center gap-3 mb-1"><div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl"><Wrench className="text-red-500" size={20} /></div><h3 className="font-black text-lg uppercase">Services Offered</h3></div>
                        <div className="space-y-1">
                            <label className={lbl}>Service Radius</label>
                            <div className="flex items-center gap-3">
                                <input type="range" min="1" max="50" value={profile.service_radius_km || '10'}
                                    onChange={e => setProfile(p => ({ ...p, service_radius_km: e.target.value }))}
                                    className="flex-1 accent-orange-500" />
                                <span className="font-black text-orange-500 text-sm w-16">{profile.service_radius_km} km</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {SERVICE_TYPES.map(s => {
                                const selected = profile.selected_services?.includes(s);
                                return (
                                    <button key={s} type="button" onClick={() => setProfile(p => ({
                                        ...p, selected_services: selected ? p.selected_services.filter(x => x !== s) : [...(p.selected_services || []), s]
                                    }))}
                                        className={`py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wide transition-all flex items-center gap-2 ${selected ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-orange-50'}`}>
                                        {selected && <CheckCircle2 size={12} />} {s}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bank & Payment */}
                    <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-5">
                        <div className="flex items-center gap-3 mb-1"><div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl"><Banknote className="text-amber-600" size={20} /></div><h3 className="font-black text-lg uppercase">Payment Details</h3></div>
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex items-center gap-3">
                            <ShieldCheck size={16} className="text-amber-500 shrink-0" />
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Your bank details are encrypted and used only for payment settlement.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'UPI ID', id: 'upi_id', icon: Hash, placeholder: 'mechanic@upi' },
                                { label: 'GST Number', id: 'gst_number', icon: FileText, placeholder: '27AAAAA0000A1Z5' },
                                { label: 'Account Number', id: 'bank_account_number', icon: Banknote, placeholder: '1234 5678 9012' },
                                { label: 'IFSC Code', id: 'bank_ifsc', icon: Building2, placeholder: 'SBIN0001234' },
                            ].map(({ label, id, icon: Icon, placeholder }) => (
                                <div key={id} className="space-y-1">
                                    <label className={lbl}>{label}</label>
                                    <div className="relative"><Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input type="text" placeholder={placeholder} value={(profile as any)[id] || ''} onChange={e => setProfile(p => ({ ...p, [id]: e.target.value }))} className={inp} />
                                    </div>
                                </div>
                            ))}
                            <div className="col-span-full space-y-1">
                                <label className={lbl}>Bank Name</label>
                                <div className="relative"><Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                    <input type="text" placeholder="State Bank of India" value={profile.bank_name || ''} onChange={e => setProfile(p => ({ ...p, bank_name: e.target.value }))} className={inp} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={profileLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 uppercase tracking-tight">
                        {profileLoading ? <Loader2 className="animate-spin" size={24} /> : <><Wrench size={24} /> Save Mechanic Profile</>}
                    </button>
                </form>
            )}
        </div>
    );
};

export default MechanicPanel;
