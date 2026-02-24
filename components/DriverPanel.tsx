import React, { useState, useEffect, useRef } from "react";
import {
    Truck,
    Bell,
    Star,
    CheckCircle2,
    X,
    Navigation,
    Package,
    ToggleLeft,
    ToggleRight,
    TrendingUp,
    Clock,
    MapPin,
    User,
    Phone,
    FileText,
    CreditCard,
    Camera,
    Save,
    Loader2,
    AlertCircle,
    ChevronDown,
    Shield,
    Building2,
    Mail,
    Banknote,
    Car,
    Hash,
    Calendar,
    IndianRupee,
    Zap,
    ShieldAlert,
    Wrench,
    Flame,
    ArrowRight,
    MessageSquare,
    Send,
} from "lucide-react";

import { supabase } from "../services/supabaseClient";
import MapComponent from "./MapComponent";

// ─── Types ─────────────────────────────────────────────
interface DriverProfile {
    full_name: string;
    phone: string;
    email: string;
    date_of_birth: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    vehicle_type: string;
    vehicle_registration: string;
    vehicle_model: string;
    vehicle_year: string;
    license_number: string;
    license_expiry: string;
    bank_account_name: string;
    bank_account_number: string;
    bank_ifsc: string;
    bank_name: string;
    experience_years: string;
    profile_photo_url: string;
    lat?: number;
    lng?: number;
}

interface BookingRequest {
    id: string;
    customer_id?: string;
    customer_name: string;
    customer_phone: string;
    pickup_location: string;
    drop_location: string;
    pickup_lat: number;
    pickup_lng: number;
    drop_lat: number;
    drop_lng: number;
    goods_type: string;
    weight: string;
    offered_price: string;
    status: string;
    vehicle_id?: string;
    vehicle_type?: string;
    messages?: any[];
    created_at: string;
    updated_at?: string;
    distance_km?: string;
    counter_offer?: string;
    driver_response?: string;
}

// Haversine distance in km
const haversineKm = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fmtDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const VEHICLE_TYPES = [
    "Tata Ace",
    "Mahindra Supro",
    "Flatbed Trailer",
    "Lowboy Trailer",
    "Refrigerated Trailer",
    "Container Trailer",
    "Multi-axle Trailer",
    "14ft Truck",
    "17ft Truck",
    "19ft Truck",
    "22ft Truck",
    "32ft Multi-axle",
    "FMCG",
    "Furniture",
    "Electronics",
    "Textile",
    "Construction"
];

export const DriverPanel: React.FC<{ t: any }> = ({ t }) => {
    // ─── Tab ───────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<
        "dashboard" | "profile" | "estimator" | "emergency" | "history"
    >("dashboard");

    const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [driverAvailable, setDriverAvailable] = useState(false);
    const [driverId, setDriverId] = useState<string | null>(null);

    // ─── Geo Tracking ──────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCurrentCoords(newCoords);
            },
            (err) => console.error("Geo Error:", err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Periodically update DB with current location
    useEffect(() => {
        if (!driverId || !currentCoords || !driverAvailable) return;

        const updateLoc = async () => {
            await supabase
                .from("vehicles")
                .update({ lat: currentCoords.lat, lng: currentCoords.lng, updated_at: new Date().toISOString() })
                .eq("driver_id", driverId);
        };

        const interval = setInterval(updateLoc, 10000); // Every 10s
        return () => clearInterval(interval);
    }, [driverId, currentCoords, driverAvailable]);

    // ─── Load Estimator state ─────────────────────────────────
    const [estFrom, setEstFrom] = useState("");
    const [estTo, setEstTo] = useState("");
    const [estDistance, setEstDistance] = useState("");
    const [estWeight, setEstWeight] = useState("");
    const [estVehicle, setEstVehicle] = useState("Tata Ace / LCV");
    const [estGoodsType, setEstGoodsType] = useState("General");
    const [estResult, setEstResult] = useState<null | {
        fare: number;
        fuel: number;
        toll: number;
        labour: number;
        total: number;
    }>(null);
    const [estLoading, setEstLoading] = useState(false);

    // ─── Emergency state ──────────────────────────────────────
    const [sosActive, setSosActive] = useState(false);
    const [sosCountdown, setSosCountdown] = useState(0);
    const [nearbyServices, setNearbyServices] = useState<any[]>([]);

    // ─── Driver state ─────────────────────────────────────
    const [savingAvail, setSavingAvail] = useState(false);
    const [deliveryStage, setDeliveryStage] = useState<string>("idle");
    const [activeRequest, setActiveRequest] = useState<BookingRequest | null>(
        null,
    );

    // Derived active request metrics
    const activeDistKm =
        activeRequest?.pickup_lat && activeRequest?.drop_lat
            ? haversineKm(
                activeRequest.pickup_lat,
                activeRequest.pickup_lng,
                activeRequest.drop_lat,
                activeRequest.drop_lng,
            )
            : null;
    const activeEtaMins = activeDistKm
        ? Math.round((activeDistKm / 40) * 60)
        : null;
    const activeMapsUrl = activeRequest
        ? `https://www.google.com/maps/dir/?api=1&origin=${activeRequest.pickup_lat},${activeRequest.pickup_lng}&destination=${activeRequest.drop_lat},${activeRequest.drop_lng}&travelmode=driving`
        : "";

    const [incomingRequests, setIncomingRequests] = useState<BookingRequest[]>(
        [],
    );
    const [notifications, setNotifications] = useState<
        {
            id: string;
            icon: any;
            color: string;
            title: string;
            desc: string;
            time: string;
            bookingId?: string;
        }[]
    >([]);
    const [earnings, setEarnings] = useState({
        today: 0,
        week: 0,
        month: 0,
        todayCount: 0,
        weekCount: 0,
        monthCount: 0,
    });
    const [loadingEarnings, setLoadingEarnings] = useState(true);
    const [tripHistory, setTripHistory] = useState<BookingRequest[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [highlightedRequestId, setHighlightedRequestId] = useState<string | null>(null);
    const channelRef = useRef<any>(null);

    // ─── Profile state ─────────────────────────────────────
    const [profile, setProfile] = useState<DriverProfile>({
        full_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        vehicle_type: VEHICLE_TYPES[0],
        vehicle_registration: "",
        vehicle_model: "",
        vehicle_year: "",
        license_number: "",
        license_expiry: "",
        bank_account_name: "",
        bank_account_number: "",
        bank_ifsc: "",
        bank_name: "",
        experience_years: "",
        profile_photo_url: "",
        lat: 0,
        lng: 0,
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileExists, setProfileExists] = useState(false);
    // profileConfirmed = true only after a confirmed SAVE with ALL required fields present
    const [profileConfirmed, setProfileConfirmed] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // ─── Chat & Bargain State ──────────────────────────────
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [isBargaining, setIsBargaining] = useState(false);
    const [bargainPrice, setBargainPrice] = useState("");

    // ─── Auto-save state ──────────────────────────────
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const autoSaveTimer = useRef<any>(null);

    // ─── Load driver id ────────────────────────────────────

    useEffect(() => {
        (async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
                console.log("👤 Driver Authenticated:", session.user.id);
                setDriverId(session.user.id);
            } else {
                console.warn("⚠️ No driver session found");
            }
        })();
    }, []);

    // ─── Load profile from DB ──────────────────────────────
    useEffect(() => {
        if (!driverId) return;
        (async () => {
            const { data } = await supabase
                .from("driver_profiles")
                .select("*")
                .eq("driver_id", driverId)
                .single();
            if (data) {
                setProfile((prev) => ({ ...prev, ...data }));
                setProfileExists(true);
                if (data.available !== undefined) setDriverAvailable(data.available);
                if (data.profile_photo_url) setPhotoPreview(data.profile_photo_url);

                // Only bypass onboarding gate if ALL 4 required fields are already in DB
                const allFilled =
                    !!data.full_name?.trim() &&
                    !!data.phone?.trim() &&
                    !!data.vehicle_registration?.trim() &&
                    !!data.license_number?.trim();
                if (allFilled) setProfileConfirmed(true);
            }
        })();
    }, [driverId]);

    // ─── Load earnings ─────────────────────────────────────
    const fetchEarnings = async () => {
        if (!driverId) return;
        setLoadingEarnings(true);
        try {
            const now = new Date();
            const todayStart = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
            ).toISOString();
            const weekStart = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - 7,
            ).toISOString();
            const monthStart = new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
            ).toISOString();

            const { data } = await supabase
                .from("booking_requests")
                .select("offered_price, created_at, status")
                .eq("driver_id", driverId)
                .eq("status", "completed");

            if (data) {
                const calc = (from: string) =>
                    data.filter((r) => r.created_at >= from);
                const sum = (rows: any[]) =>
                    rows.reduce((a, r) => a + Number(r.offered_price || 0), 0);
                setEarnings({
                    today: sum(calc(todayStart)),
                    week: sum(calc(weekStart)),
                    month: sum(calc(monthStart)),
                    todayCount: calc(todayStart).length,
                    weekCount: calc(weekStart).length,
                    monthCount: calc(monthStart).length,
                });
            }
        } catch (_) {
        } finally {
            setLoadingEarnings(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
        const interval = setInterval(fetchEarnings, 30000); // Every 30s
        return () => clearInterval(interval);
    }, [driverId]);

    // ─── Real-time incoming booking requests ───────────────
    useEffect(() => {
        if (!driverId) return;

        // ── Dual subscription: Postgres changes + Broadcast ──────────
        // This guarantees the driver sees new bookings even if broadcast slightly delays.
        const channel = supabase
            .channel("driver_booking_requests", {
                config: { broadcast: { self: false } },
            })
            // 1️⃣ Postgres realtime — fires when a new row is inserted in booking_requests
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "booking_requests",
                },
                (payload: any) => {
                    const booking: BookingRequest = payload.new;
                    if (!booking || !booking.id || booking.status !== 'pending') return;

                    console.log("🔔 Postgres INSERT notification:", booking.id);

                    setIncomingRequests((prev) => {
                        if (prev.find((r) => r.id === booking.id)) return prev;
                        return [booking, ...prev];
                    });
                    addNotification(
                        Bell,
                        "blue",
                        "🚚 New Booking Request!",
                        `${booking.goods_type || 'Goods'} | ${booking.weight || ''} | ₹${booking.offered_price || ''}`,
                        booking.id,
                    );
                },
            )
            // 2️⃣ Broadcast fallback — fires when customer manually sends broadcast
            .on("broadcast", { event: "INSERT" }, (payload: any) => {
                // Support multiple payload shapes (direct row, or wrapped in new/new_row)
                const booking: BookingRequest =
                    payload.payload?.new ||
                    payload.payload?.new_row ||
                    (payload.payload?.id ? payload.payload : null); // direct row shape

                if (!booking || !booking.id) {
                    console.warn("⚠️ Received broadcast but could not parse booking:", payload);
                    return;
                }

                console.log("📨 Broadcast booking received:", booking.id, booking.status);

                // Show ALL incoming requests (no GPS filter in dev mode)
                setIncomingRequests((prev) => {
                    if (prev.find((r) => r.id === booking.id)) return prev;
                    return [booking, ...prev];
                });

                addNotification(
                    Bell,
                    "blue",
                    "🚚 New Booking Request!",
                    `${booking.goods_type || 'Goods'} | ${booking.weight || ''} | ₹${booking.offered_price || ''}`,
                    booking.id,
                );
            })
            // 3️⃣ Search Intent — fires when customer searches for matching trucks
            .on("broadcast", { event: "SEARCH_INTENT" }, (payload: any) => {
                const intent = payload.payload;
                if (!intent) return;
                addNotification(
                    Navigation,
                    "orange",
                    "🔍 Nearby Search Alert!",
                    `${intent.goods_type || 'Goods'} | ${intent.distance_km || 0}km | Scanning fleet...`,
                );
            })
            .subscribe((status) => {
                console.log("Driver realtime channel:", status);
            });

        channelRef.current = channel;

        // Initial fetch of pending requests immediately
        if (driverId) {
            console.log("🚀 Initial fetch for driver:", driverId);
            fetchPendingRequests();
        }

        // Refresh every 5 seconds as safety net
        const interval = setInterval(() => {
            if (driverAvailable) fetchPendingRequests();
        }, 5000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [driverId, driverAvailable]);

    // Active Booking Realtime Listener (Bargaining/Status)
    useEffect(() => {
        if (!activeRequest?.id) return;

        const topic = `booking:${activeRequest.id}`;
        const channel = supabase.channel(topic)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'booking_requests',
                filter: `id=eq.${activeRequest.id}`
            }, (payload) => {
                const updated = payload.new as BookingRequest;
                console.log("💎 Active booking updated in Driver Panel:", updated);
                setActiveRequest(prev => prev ? ({ ...prev, ...updated }) : null);
                if (updated.messages) {
                    setChatHistory(updated.messages);
                }
            })
            .on('broadcast', { event: '*' }, (payload) => {
                const updated = payload.payload;
                if (updated?.id === activeRequest.id) {
                    setActiveRequest(prev => prev ? ({ ...prev, ...updated }) : null);
                    if (updated.messages) {
                        setChatHistory(updated.messages);
                    }
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeRequest?.id]);

    // ─── Real-time incoming mechanic/emergency requests (for Driver Visibility) ───
    useEffect(() => {
        if (!driverId) return;
        const channel = supabase.channel('mechanic_requests_driver_view')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mechanic_requests', filter: 'status=eq.pending' },
                (payload: any) => {
                    const req = payload.new;
                    if (!req) return;
                    addNotification(Wrench, 'orange', '🔧 Nearby Emergency!', `${req.service_type} — ${req.location?.split(',')[0]}`);
                })
            .on('broadcast', { event: 'INSERT' }, (payload: any) => {
                const req = payload.payload?.new || payload.payload;
                if (!req) return;
                addNotification(Wrench, 'orange', '🔧 Nearby Emergency!', `${req.service_type} — ${req.location?.split(',')[0]}`);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [driverId]);

    const fetchPendingRequests = async () => {
        try {
            // Fetch ALL pending requests (no distance filter in dev mode)
            const { data, error } = await supabase
                .from("booking_requests")
                .select("*")
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .limit(10);

            if (error) {
                console.error("❌ Error fetching pending requests:", error);
                return;
            }

            // Always update state (even if empty) to reflect current DB state
            setIncomingRequests(data || []);
            if (data && data.length > 0) {
                console.log("📋 Fetched pending requests:", data.length);
            }
        } catch (err) {
            console.error("Unexpected error fetching requests:", err);
        }
    };

    const fetchTripHistory = async () => {
        if (!driverId) return;
        setLoadingHistory(true);
        try {
            const { data } = await supabase
                .from("booking_requests")
                .select("*")
                .or(`driver_id.eq.${driverId},vehicle_id.eq.${driverId}`)
                .order("created_at", { ascending: false })
                .limit(50);
            if (data) setTripHistory(data);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Load trip history when tab switched or driverId available
    useEffect(() => {
        if (activeTab === "history" && driverId) fetchTripHistory();
    }, [activeTab, driverId]);

    // ─── Real-time Chat & Bargain Subscription ─────────────
    useEffect(() => {
        if (!activeRequest?.id) return;

        const topic = `booking:${activeRequest.id}`;
        const channel = supabase.channel(topic, { config: { broadcast: { self: false } } });

        channel
            .on('broadcast', { event: '*' }, (payload) => {
                const updated = payload.new ?? payload.new_row ?? payload.payload;
                if (!updated) return;

                // Update active request with new status/counter-offer
                if (updated.id === activeRequest.id) {
                    setActiveRequest(prev => prev ? ({
                        ...prev,
                        status: updated.status || prev.status,
                        offered_price: updated.offered_price || prev.offered_price,
                        messages: updated.messages || prev.messages
                    }) : null);

                    if (updated.messages) {
                        setChatHistory(updated.messages);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeRequest?.id]);

    // ─── Notifications helper ──────────────────────────────
    const addNotification = (
        Icon: any,
        color: string,
        title: string,
        desc: string,
        bookingId?: string,
    ) => {
        const entry = {
            id: Date.now().toString(),
            icon: Icon,
            color,
            title,
            desc,
            time: "Just now",
            bookingId,
        };
        setNotifications((prev) => [entry, ...prev].slice(0, 10));
    };

    // ─── Availability toggle (syncs to DB) ────────────────
    const toggleAvailability = async () => {
        setSavingAvail(true);
        const next = !driverAvailable;
        setDriverAvailable(next);
        try {
            if (driverId) {
                await supabase
                    .from("driver_profiles")
                    .upsert(
                        { driver_id: driverId, available: next },
                        { onConflict: "driver_id" },
                    );
                // Also update vehicles table if vehicle registered
                if (profile.vehicle_registration) {
                    await supabase
                        .from("vehicles")
                        .update({ available: next })
                        .eq("driver_id", driverId);
                }
            }
            addNotification(
                next ? ToggleRight : ToggleLeft,
                next ? "emerald" : "slate",
                next ? "You are Online" : "You are Offline",
                next
                    ? "You will now receive delivery requests"
                    : "You will not receive new requests",
            );
        } catch (_) {
        } finally {
            setSavingAvail(false);
        }
    };

    // ─── Accept request ────────────────────────────────────
    const acceptRequest = async (req: BookingRequest) => {
        try {
            await supabase
                .from("booking_requests")
                .update({ status: "accepted", driver_id: driverId })
                .eq("id", req.id);
            setActiveRequest(req);
            setDeliveryStage("pickup");
            setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id));
            addNotification(
                CheckCircle2,
                "emerald",
                "Order Accepted!",
                `Heading to ${req.pickup_location?.split(",")[0]}`,
            );
        } catch (err) {
            console.error("Accept error:", err);
        }
    };

    // ─── Reject request ────────────────────────────────────
    const rejectRequest = async (req: BookingRequest) => {
        try {
            await supabase
                .from("booking_requests")
                .update({ status: "rejected" })
                .eq("id", req.id);
            setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id));
            addNotification(
                X,
                "red",
                "Order Declined",
                `Booking #${req.id.slice(0, 6)} rejected`,
            );
        } catch (_) {
            setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id));
        }
    };

    // ─── Delivery status update ────────────────────────────
    const updateDeliveryStage = async (stage: string) => {
        setDeliveryStage(stage);
        if (!activeRequest) return;
        const statusMap: Record<string, string> = {
            pickup: "picked_up",
            transit: "in_transit",
            delivered: "completed",
        };
        try {
            await supabase
                .from("booking_requests")
                .update({ status: statusMap[stage] || stage })
                .eq("id", activeRequest.id);
            if (stage === "delivered") {
                addNotification(
                    CheckCircle2,
                    "emerald",
                    "Delivery Completed!",
                    `Trip #${activeRequest.id.slice(0, 6)} done`,
                );
                // Update earnings optimistically & refresh
                setEarnings((prev) => ({
                    ...prev,
                    today: prev.today + Number(activeRequest.offered_price || 0),
                    todayCount: prev.todayCount + 1,
                }));
                fetchEarnings();
            }
        } catch (_) { }
    };

    // ─── Chat & Bargaining logic ───────────────────────────
    const sendChatMessage = async () => {
        if (!chatMessage.trim() || !activeRequest?.id) return;

        const newMsg = { sender: 'driver', text: chatMessage, time: new Date().toISOString() };
        const updatedHistory = [...chatHistory, newMsg];

        setChatHistory(updatedHistory);
        setChatMessage("");

        try {
            await supabase
                .from('booking_requests')
                .update({ messages: updatedHistory })
                .eq('id', activeRequest.id);

            // Broadcast on the booking channel
            const topic = `booking:${activeRequest.id}`;
            supabase.channel(topic).send({
                type: 'broadcast',
                event: 'CHAT_MSG',
                payload: { messages: updatedHistory, id: activeRequest.id }
            });
        } catch (err) {
            console.error("Chat Error:", err);
        }
    };

    const handleBargain = async () => {
        if (!bargainPrice || !activeRequest?.id) return;

        try {
            const { data, error } = await supabase
                .from('booking_requests')
                .update({
                    offered_price: bargainPrice,
                    status: 'bargaining'
                })
                .eq('id', activeRequest.id)
                .select()
                .single();

            if (data) {
                setActiveRequest(data);
                setIsBargaining(false);
                addNotification(TrendingUp, "blue", "Counter-offer Sent", `Proposed ₹${bargainPrice}`);

                // Broadcast
                const topic = `booking:${activeRequest.id}`;
                supabase.channel(topic).send({
                    type: 'broadcast',
                    event: 'UPDATE',
                    payload: { ...data, type: 'UPDATE' }
                });
            }
        } catch (err) {
            console.error("Bargain Error:", err);
        }
    };

    // ─── Profile save (manual fallback) ───────────────────
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!driverId) return;
        setProfileLoading(true);
        setProfileError(null);
        setProfileSuccess(false);
        try {
            const payload = {
                ...profile,
                driver_id: driverId,
                available: driverAvailable,
                updated_at: new Date().toISOString(),
            };
            const { error } = await supabase
                .from("driver_profiles")
                .upsert(payload, { onConflict: "driver_id" });
            if (error) throw error;

            // Also register the vehicle
            if (profile.vehicle_registration) {
                await supabase.from("vehicles").upsert(
                    {
                        driver_id: driverId,
                        registration_number: profile.vehicle_registration,
                        type: profile.vehicle_type,
                        model: profile.vehicle_model,
                        year: profile.vehicle_year,
                        available: driverAvailable,
                    },
                    { onConflict: "registration_number" },
                );
            }

            setProfileExists(true);
            setProfileSuccess(true);

            // Confirm profile (open dashboard) only if all required fields are present
            const allFilled =
                !!profile.full_name?.trim() &&
                !!profile.phone?.trim() &&
                !!profile.vehicle_registration?.trim() &&
                !!profile.license_number?.trim();
            if (allFilled) setProfileConfirmed(true);

            addNotification(
                CheckCircle2,
                "emerald",
                "Profile Updated",
                "Your driver profile has been saved successfully",
            );
            setTimeout(() => setProfileSuccess(false), 4000);
        } catch (err: any) {
            setProfileError(
                err.message || "Failed to save profile. Please try again.",
            );
        } finally {
            setProfileLoading(false);
        }
    };

    // ─── Auto-save: debounced 800ms after any field change ──
    useEffect(() => {
        if (!driverId || !profile.full_name) return; // Don't auto-save empty form

        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        setAutoSaveStatus('saving');

        autoSaveTimer.current = setTimeout(async () => {
            try {
                const payload = {
                    ...profile,
                    driver_id: driverId,
                    available: driverAvailable,
                    updated_at: new Date().toISOString(),
                };
                const { error } = await supabase
                    .from('driver_profiles')
                    .upsert(payload, { onConflict: 'driver_id' });

                if (error) throw error;

                if (profile.vehicle_registration) {
                    await supabase.from('vehicles').upsert(
                        {
                            driver_id: driverId,
                            registration_number: profile.vehicle_registration,
                            type: profile.vehicle_type,
                            model: profile.vehicle_model,
                            year: profile.vehicle_year,
                            available: driverAvailable,
                            lat: currentCoords?.lat || 0,
                            lng: currentCoords?.lng || 0,
                            updated_at: new Date().toISOString()
                        },
                        { onConflict: 'registration_number' },
                    );
                }

                setAutoSaveStatus('saved');
                setProfileExists(true);

                // Only confirm (open dashboard) AFTER a successful save with ALL 4 required fields
                const allFilled =
                    !!profile.full_name?.trim() &&
                    !!profile.phone?.trim() &&
                    !!profile.vehicle_registration?.trim() &&
                    !!profile.license_number?.trim();
                if (allFilled) {
                    setProfileConfirmed(true);
                }

                setTimeout(() => setAutoSaveStatus('idle'), 2500);
            } catch (err: any) {
                setAutoSaveStatus('error');
                console.error('Auto-save error:', err);
            }
        }, 800);

        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        };
    }, [profile, driverId]);


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const url = ev.target?.result as string;
            setPhotoPreview(url);
            setProfile((p) => ({ ...p, profile_photo_url: url }));
        };
        reader.readAsDataURL(file);
    };

    const field = (id: keyof DriverProfile) => ({
        value: profile[id],
        onChange: (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => setProfile((p) => ({ ...p, [id]: e.target.value })),
    });

    const inputCls =
        "w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all";

    // A profile is "complete" when core fields are filled
    const isProfileComplete =
        !!profile.full_name &&
        !!profile.phone &&
        !!profile.vehicle_registration &&
        !!profile.license_number;

    // Calculate onboarding progress (0-100)
    const requiredFields = [
        profile.full_name,
        profile.phone,
        profile.vehicle_registration,
        profile.license_number,
    ];
    const completedFields = requiredFields.filter(Boolean).length;
    const onboardingProgress = Math.round((completedFields / requiredFields.length) * 100);

    // ─── Onboarding gate ──────────────────────────────────
    // Gate uses profileConfirmed (= true only after a full save) NOT isProfileComplete
    // This prevents the dashboard from opening just because fields are pre-loaded from DB
    if (!profileConfirmed && !profileLoading && driverId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
                <div className="w-full max-w-3xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-blue-600 shadow-2xl shadow-blue-500/30 mb-5 relative">
                            <Truck size={38} className="text-white" />
                            {/* Auto-save indicator on icon */}
                            {autoSaveStatus === 'saving' && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                                    <Loader2 size={12} className="text-white animate-spin" />
                                </div>
                            )}
                            {autoSaveStatus === 'saved' && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={12} className="text-white" />
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
                            Welcome, Driver!
                        </h1>
                        <p className="text-slate-400 font-bold text-base">
                            Fill in your details — they save automatically as you type.
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-6 max-w-sm mx-auto">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                <span>Profile Completion</span>
                                <span className={onboardingProgress === 100 ? 'text-emerald-400' : 'text-blue-400'}>{onboardingProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${onboardingProgress === 100
                                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                                        : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${onboardingProgress}%` }}
                                />
                            </div>
                            {/* Step markers */}
                            <div className="flex justify-between mt-3">
                                {[
                                    { label: 'Name', done: !!profile.full_name },
                                    { label: 'Phone', done: !!profile.phone },
                                    { label: 'Vehicle', done: !!profile.vehicle_registration },
                                    { label: 'License', done: !!profile.license_number },
                                ].map((step) => (
                                    <div key={step.label} className="flex flex-col items-center gap-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-300 ${step.done
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110'
                                            : 'bg-white/10 text-slate-500'
                                            }`}>
                                            {step.done ? '✓' : '•'}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${step.done ? 'text-emerald-400' : 'text-slate-600'
                                            }`}>{step.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Auto-save status text */}
                        <div className="mt-3 h-5">
                            {autoSaveStatus === 'saving' && (
                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 animate-pulse">Saving...</p>
                            )}
                            {autoSaveStatus === 'saved' && (
                                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400">✓ Saved automatically</p>
                            )}
                            {autoSaveStatus === 'error' && (
                                <p className="text-[11px] font-black uppercase tracking-widest text-red-400">⚠ Save failed — check connection</p>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSaveProfile(e); }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 space-y-8"
                    >
                        {profileError && (
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-400">
                                <AlertCircle size={18} />
                                <span className="text-sm font-bold">{profileError}</span>
                            </div>
                        )}

                        {/* Photo */}
                        <div className="flex items-center gap-5">
                            <div className="relative w-20 h-20 shrink-0">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-2xl object-cover shadow-xl" />
                                ) : (
                                    <div className="w-20 h-20 bg-blue-600/20 border-2 border-dashed border-blue-500/40 rounded-2xl flex items-center justify-center">
                                        <Camera size={28} className="text-blue-400" />
                                    </div>
                                )}
                                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl cursor-pointer shadow-lg hover:bg-blue-500 transition-colors">
                                    <Camera size={14} />
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            </div>
                            <div>
                                <p className="text-white font-black text-lg">Profile Photo</p>
                                <p className="text-slate-400 text-sm font-medium">Upload a clear photo (optional but recommended)</p>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { icon: User, id: "full_name" as keyof DriverProfile, label: "Full Name *", placeholder: "Your legal full name", type: "text" },
                                    { icon: Phone, id: "phone" as keyof DriverProfile, label: "Phone Number *", placeholder: "+91 98765 43210", type: "tel" },
                                    { icon: Mail, id: "email" as keyof DriverProfile, label: "Email Address", placeholder: "driver@email.com", type: "email" },
                                    { icon: Calendar, id: "date_of_birth" as keyof DriverProfile, label: "Date of Birth", placeholder: "", type: "date" },
                                ].map(({ icon: Icon, id, label, placeholder, type }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
                                        <div className="relative">
                                            <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type={type}
                                                placeholder={placeholder}
                                                required={label.includes("*")}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                                                {...field(id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Home Address</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-4 top-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Street, City, State"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                            {...field("address")}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">City</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Delhi"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                            {...field("city")}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pincode</label>
                                    <div className="relative">
                                        <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="110001"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                            {...field("pincode")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Vehicle Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vehicle Type *</label>
                                    <div className="relative">
                                        <Truck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <select
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all appearance-none"
                                            {...field("vehicle_type")}
                                        >
                                            {VEHICLE_TYPES.map(v => <option key={v} value={v} className="bg-slate-900">{v}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {[
                                    { icon: Hash, id: "vehicle_registration" as keyof DriverProfile, label: "Registration Number *", placeholder: "DL 01 AB 1234" },
                                    { icon: Car, id: "vehicle_model" as keyof DriverProfile, label: "Vehicle Model", placeholder: "Tata Ace Gold" },
                                    { icon: Calendar, id: "vehicle_year" as keyof DriverProfile, label: "Manufacturing Year", placeholder: "2022" },
                                ].map(({ icon: Icon, id, label, placeholder }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
                                        <div className="relative">
                                            <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder={placeholder}
                                                required={label.includes("*")}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                                {...field(id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* License Info */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">License & Experience</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { icon: FileText, id: "license_number" as keyof DriverProfile, label: "License Number *", placeholder: "DL-0120110149646", type: "text" },
                                    { icon: Calendar, id: "license_expiry" as keyof DriverProfile, label: "License Expiry *", placeholder: "", type: "date" },
                                    { icon: Star, id: "experience_years" as keyof DriverProfile, label: "Years of Experience", placeholder: "5", type: "number" },
                                ].map(({ icon: Icon, id, label, placeholder, type }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
                                        <div className="relative">
                                            <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type={type}
                                                placeholder={placeholder}
                                                required={label.includes("*")}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                                {...field(id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bank Info */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Bank Account (for Payouts)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { icon: User, id: "bank_account_name" as keyof DriverProfile, label: "Account Holder Name", placeholder: "Full name on bank account" },
                                    { icon: Building2, id: "bank_name" as keyof DriverProfile, label: "Bank Name", placeholder: "State Bank of India" },
                                    { icon: CreditCard, id: "bank_account_number" as keyof DriverProfile, label: "Account Number", placeholder: "1234567890" },
                                    { icon: Hash, id: "bank_ifsc" as keyof DriverProfile, label: "IFSC Code", placeholder: "SBIN0001234" },
                                ].map(({ icon: Icon, id, label, placeholder }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
                                        <div className="relative">
                                            <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder={placeholder}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                                {...field(id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button — only shown if auto-save failed or user wants to manually confirm */}
                        <button
                            type="submit"
                            disabled={profileLoading || !onboardingProgress}
                            className={`w-full py-5 rounded-[24px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-60 shadow-2xl transition-all hover:scale-[1.01] active:scale-95 ${onboardingProgress === 100
                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 text-white'
                                }`}
                        >
                            {profileLoading ? (
                                <><Loader2 size={22} className="animate-spin" /> Saving Profile...</>
                            ) : onboardingProgress === 100 ? (
                                <><CheckCircle2 size={22} /> Enter Dashboard →</>
                            ) : (
                                <><Save size={22} /> Save & Continue ({completedFields}/{requiredFields.length} done)</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ─── Render ────────────────────────────────────────────
    return (

        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Driver Top Bar ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-[32px] p-5 border border-slate-100 dark:border-slate-700 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Driver"
                                className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Truck size={26} />
                            </div>
                        )}
                        <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${driverAvailable ? "bg-emerald-500" : "bg-slate-400"}`}
                        />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Driver Dashboard
                        </p>
                        <h3 className="text-lg font-black">
                            {profile.full_name || "Complete Your Profile"}
                        </h3>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star size={12} fill="currentColor" />{" "}
                            {profile.vehicle_type || "No vehicle registered"}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Availability Toggle
                    </p>
                    <button
                        onClick={toggleAvailability}
                        disabled={savingAvail}
                        className="flex items-center gap-2 disabled:opacity-60"
                    >
                        {savingAvail ? (
                            <Loader2 size={36} className="animate-spin text-slate-400" />
                        ) : driverAvailable ? (
                            <ToggleRight size={44} className="text-emerald-500" />
                        ) : (
                            <ToggleLeft size={44} className="text-slate-400" />
                        )}
                    </button>
                    <span
                        className={`text-xs font-black ${driverAvailable ? "text-emerald-500" : "text-slate-400"}`}
                    >
                        {driverAvailable
                            ? "● ONLINE – Receiving Orders"
                            : "○ OFFLINE – Not Available"}
                    </span>
                </div>
            </div>

            {/* ── Tab Switcher ───────────────────────────────── */}
            <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[24px] border border-slate-200 dark:border-slate-700 gap-1 w-fit">
                <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-tight flex items-center gap-2 transition-all ${activeTab === "dashboard" ? "bg-white dark:bg-slate-700 shadow-xl text-blue-600" : "text-slate-500"}`}
                >
                    <Zap size={13} /> Dashboard
                </button>
                <button
                    onClick={() => setActiveTab("estimator")}
                    className={`px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-tight flex items-center gap-2 transition-all ${activeTab === "estimator" ? "bg-white dark:bg-slate-700 shadow-xl text-emerald-600" : "text-slate-500"}`}
                >
                    <TrendingUp size={13} /> Load Estimator
                </button>
                <button
                    onClick={() => setActiveTab("emergency")}
                    className={`px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-tight flex items-center gap-2 transition-all ${activeTab === "emergency" ? "bg-white dark:bg-slate-700 shadow-xl text-red-600" : "text-slate-500"}`}
                >
                    <ShieldAlert size={13} /> Emergency{" "}
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-tight flex items-center gap-2 transition-all ${activeTab === "history" ? "bg-white dark:bg-slate-700 shadow-xl text-purple-600" : "text-slate-500"}`}
                >
                    <FileText size={13} /> History
                </button>
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-tight flex items-center gap-2 transition-all ${activeTab === "profile" ? "bg-white dark:bg-slate-700 shadow-xl text-blue-600" : "text-slate-500"}`}
                >
                    <User size={13} /> Profile
                </button>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/*              DASHBOARD TAB                     */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ── LEFT: Earnings & Incoming ── */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Earnings Summary Dashboard */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {[
                                {
                                    label: "Today's Earnings",
                                    value: `₹${earnings.today.toLocaleString()}`,
                                    sub: `${earnings.todayCount} Trips`,
                                    color: "blue",
                                    icon: IndianRupee,
                                },
                                {
                                    label: "Weekly Income",
                                    value: `₹${earnings.week.toLocaleString()}`,
                                    sub: `${earnings.weekCount} Trips`,
                                    color: "emerald",
                                    icon: TrendingUp,
                                },
                                {
                                    label: "Completed Payouts",
                                    value: `₹${earnings.month.toLocaleString()}`,
                                    sub: `Verified`,
                                    color: "slate",
                                    icon: CheckCircle2,
                                },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-lg overflow-hidden relative group hover:scale-[1.02] transition-all"
                                >
                                    <div
                                        className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-${stat.color}-500/5 rounded-full blur-2xl`}
                                    />
                                    <div className="flex flex-col items-start gap-0">
                                        <div
                                            className={`w-8 h-8 sm:w-10 sm:h-10 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center mb-3 text-${stat.color}-600 shrink-0`}
                                        >
                                            <stat.icon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                {stat.label}
                                            </p>
                                            <p className="text-lg sm:text-2xl font-black mt-0.5 italic">
                                                {stat.value}
                                            </p>
                                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 mt-0.5 uppercase">
                                                {stat.sub}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Incoming Requests */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                    Incoming Requests{" "}
                                    {incomingRequests.length > 0 && (
                                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[9px] ml-2">
                                            {incomingRequests.length}
                                        </span>
                                    )}
                                </h4>
                                <button
                                    onClick={fetchPendingRequests}
                                    className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                >
                                    <Bell size={11} /> Refresh
                                </button>
                            </div>

                            {!driverAvailable && incomingRequests.length === 0 && (
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-[28px] p-6 text-center">
                                    <ToggleLeft
                                        size={32}
                                        className="text-slate-400 mx-auto mb-2"
                                    />
                                    <p className="font-black text-slate-500 text-sm uppercase">
                                        You are Offline
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                        Toggle availability above to receive orders
                                    </p>
                                </div>
                            )}

                            {!driverAvailable && incomingRequests.length > 0 && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4 flex items-center gap-3">
                                    <Zap size={18} className="text-amber-500 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">
                                        Go Online to Accept these {incomingRequests.length} requests
                                    </p>
                                </div>
                            )}

                            {incomingRequests.length === 0 &&
                                !activeRequest && (
                                    <div className="rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Bell size={22} className="text-blue-500 animate-bounce" />
                                        </div>
                                        <p className="font-black text-slate-500 text-sm uppercase">
                                            Looking for Orders...
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            Requests near you will appear here instantly
                                        </p>
                                        <button
                                            onClick={fetchPendingRequests}
                                            className="mt-6 px-6 py-2 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                                        >
                                            Check for new orders now
                                        </button>
                                    </div>
                                )}

                            {incomingRequests.map((req) => {
                                const distKm =
                                    req.pickup_lat && req.drop_lat
                                        ? haversineKm(
                                            req.pickup_lat,
                                            req.pickup_lng,
                                            req.drop_lat,
                                            req.drop_lng,
                                        )
                                        : null;
                                const etaMins = distKm
                                    ? Math.round((distKm / 40) * 60)
                                    : null;
                                const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${req.pickup_lat},${req.pickup_lng}&destination=${req.drop_lat},${req.drop_lng}&travelmode=driving`;

                                return (
                                    <div
                                        key={req.id}
                                        id={`request-${req.id}`}
                                        className={`relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-6 sm:p-8 text-white shadow-2xl transition-all duration-700 ${highlightedRequestId === req.id ? "ring-4 ring-orange-500 shadow-orange-500/50 scale-[1.02] animate-pulse" : ""}`}
                                    >
                                        {/* Top Status Bar */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Request</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{fmtDate(req.created_at)}</p>
                                        </div>

                                        {/* Header */}
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                                <User size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black tracking-tight">{req.customer_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 bg-slate-700 rounded-md text-[9px] font-bold text-slate-300">#{req.id?.slice(0, 6).toUpperCase()}</span>
                                                    <div className="flex items-center gap-1 text-amber-500">
                                                        <Star size={10} className="fill-amber-500" />
                                                        <span className="text-[10px] font-black">4.9</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Proposed Fare</p>
                                                <p className="text-2xl font-black text-white italic">₹{Number(req.offered_price).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Dynamic Trip Info */}
                                        <div className="grid grid-cols-2 gap-3 mb-8">
                                            <div className="bg-slate-700/30 rounded-2xl p-4 border border-slate-700/50">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Load Details</p>
                                                <p className="text-sm font-black truncate">{req.goods_type} • {req.weight}</p>
                                            </div>
                                            <div className="bg-slate-700/30 rounded-2xl p-4 border border-slate-700/50">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Est. Distance</p>
                                                <p className="text-sm font-black text-blue-400">{distKm ? `${distKm.toFixed(1)} km` : '—'}</p>
                                            </div>
                                        </div>

                                        {/* Route Display */}
                                        <div className="space-y-6 relative ml-3 mb-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-500 before:to-orange-500">
                                            <div className="relative pl-6">
                                                <div className="absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pickup Point</p>
                                                <p className="text-sm font-bold line-clamp-1">{req.pickup_location}</p>
                                            </div>
                                            <div className="relative pl-6">
                                                <div className="absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Dropoff Point</p>
                                                <p className="text-sm font-bold line-clamp-1">{req.drop_location}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => acceptRequest(req)}
                                                className="flex-[2] bg-blue-500 hover:bg-blue-400 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={16} /> Accept Order
                                            </button>
                                            <a
                                                href={mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-slate-700 hover:bg-slate-600 py-4 rounded-2xl flex items-center justify-center transition-all border border-slate-600"
                                            >
                                                <Navigation size={18} />
                                            </a>
                                            <button
                                                onClick={() => rejectRequest(req)}
                                                className="flex-1 bg-slate-700/50 hover:bg-red-500/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-slate-400 hover:text-red-400 border border-slate-700"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Active Delivery Status — Full Details */}
                        {activeRequest && (
                            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden">
                                {/* Header banner */}
                                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2.5 rounded-2xl">
                                            <Package size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">
                                                Active Delivery
                                            </p>
                                            <h4 className="font-black text-lg text-white">
                                                Booking #{activeRequest.id?.slice(0, 8).toUpperCase()}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-orange-200 font-black uppercase">
                                            Fare
                                        </p>
                                        <p className="font-black text-2xl text-white">
                                            ₹{Number(activeRequest.offered_price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-7 space-y-5">
                                    {/* Stage tracker */}
                                    <div className="flex gap-2">
                                        {(
                                            [
                                                ["pickup", "Picked Up", Package],
                                                ["transit", "In Transit", Truck],
                                                ["delivered", "Delivered", CheckCircle2],
                                            ] as [string, string, any][]
                                        ).map(([key, label, Icon]) => {
                                            const order = ["pickup", "transit", "delivered"];
                                            const done =
                                                order.indexOf(deliveryStage) >= order.indexOf(key);
                                            const active = deliveryStage === key;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => updateDeliveryStage(key)}
                                                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-wide transition-all flex flex-col items-center gap-2 ${active ? "bg-orange-500 text-white shadow-lg scale-105" : done ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700" : "bg-slate-100 dark:bg-slate-900 text-slate-400"}`}
                                                >
                                                    <Icon size={18} />
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Customer info */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-700 rounded-xl flex items-center justify-center">
                                                <User
                                                    size={18}
                                                    className="text-blue-600 dark:text-blue-300"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-blue-500 font-black uppercase">
                                                    Customer
                                                </p>
                                                <p className="font-black text-sm">
                                                    {activeRequest.customer_name}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${activeRequest.customer_phone}`}
                                            className="flex items-center gap-2 bg-blue-600 text-white font-black text-xs px-4 py-2.5 rounded-xl hover:bg-blue-500 transition-colors"
                                        >
                                            <Phone size={14} /> {activeRequest.customer_phone}
                                        </a>
                                    </div>

                                    {/* Route Map */}
                                    <div className="rounded-3xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 h-[220px] relative group">
                                        <MapComponent
                                            startPos={{ lat: activeRequest.pickup_lat, lng: activeRequest.pickup_lng }}
                                            endPos={{ lat: activeRequest.drop_lat, lng: activeRequest.drop_lng }}
                                            currentPosition={currentCoords || undefined}
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-lg flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">GPS Tracking Active</span>
                                        </div>
                                    </div>

                                    {/* Route details */}
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 space-y-3">
                                        <div className="flex gap-3 items-start">
                                            <div className="flex flex-col items-center gap-1 pt-1">
                                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                                <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase">
                                                        Pickup
                                                    </p>
                                                    <p className="font-bold text-sm">
                                                        {activeRequest.pickup_location}
                                                    </p>
                                                    {activeRequest.pickup_lat && (
                                                        <p className="text-[10px] text-slate-400">
                                                            {activeRequest.pickup_lat?.toFixed(4)},{" "}
                                                            {activeRequest.pickup_lng?.toFixed(4)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase">
                                                        Drop
                                                    </p>
                                                    <p className="font-bold text-sm">
                                                        {activeRequest.drop_location}
                                                    </p>
                                                    {activeRequest.drop_lat && (
                                                        <p className="text-[10px] text-slate-400">
                                                            {activeRequest.drop_lat?.toFixed(4)},{" "}
                                                            {activeRequest.drop_lng?.toFixed(4)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            {
                                                label: "Goods Type",
                                                value: activeRequest.goods_type || "—",
                                                color: "purple",
                                            },
                                            {
                                                label: "Weight",
                                                value: activeRequest.weight
                                                    ? `${activeRequest.weight} T`
                                                    : "—",
                                                color: "orange",
                                            },
                                            {
                                                label: "Distance",
                                                value: activeDistKm
                                                    ? `${activeDistKm.toFixed(0)} km`
                                                    : "—",
                                                color: "blue",
                                            },
                                            {
                                                label: "Est. ETA",
                                                value: activeEtaMins ? `~${activeEtaMins} min` : "—",
                                                color: "emerald",
                                            },
                                            {
                                                label: "Booked On",
                                                value: fmtDate(activeRequest.created_at),
                                                color: "slate",
                                            },
                                            {
                                                label: "Trip Status",
                                                value:
                                                    deliveryStage === "idle"
                                                        ? "Starting"
                                                        : deliveryStage === "pickup"
                                                            ? "En Route"
                                                            : deliveryStage === "transit"
                                                                ? "In Transit"
                                                                : "Delivered",
                                                color: "amber",
                                            },
                                        ].map(({ label, value, color }) => (
                                            <div
                                                key={label}
                                                className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-2xl p-3`}
                                            >
                                                <p
                                                    className={`text-[9px] text-${color}-600 dark:text-${color}-400 font-black uppercase`}
                                                >
                                                    {label}
                                                </p>
                                                <p className="font-black text-xs mt-1">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Navigate + Complete */}
                                    <div className="flex gap-3 mt-6">
                                        <a
                                            href={activeMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Navigation size={16} /> Navigate
                                        </a>
                                        {deliveryStage === "delivered" && (
                                            <button
                                                onClick={() => {
                                                    setActiveRequest(null);
                                                    setDeliveryStage("idle");
                                                    fetchPendingRequests();
                                                    fetchTripHistory();
                                                }}
                                                className="flex-1 bg-emerald-500 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all"
                                            >
                                                <CheckCircle2 size={16} /> Complete & Next
                                            </button>
                                        )}
                                    </div>

                                    {/* ── Chat & Bargain Area ── */}
                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare size={18} className="text-blue-500" />
                                                <h5 className="font-black text-sm uppercase tracking-tight">Customer Chat & Pricing</h5>
                                            </div>
                                            <button
                                                onClick={() => setIsBargaining(!isBargaining)}
                                                className="text-[10px] font-black uppercase text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 px-3 py-1.5 rounded-lg transition-colors border border-orange-200 dark:border-orange-800"
                                            >
                                                {isBargaining ? 'Cancel Bargain' : 'Bargain Price'}
                                            </button>
                                        </div>

                                        {isBargaining && (
                                            <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/40 animate-in slide-in-from-top-4">
                                                <p className="text-[10px] font-black uppercase text-orange-600 mb-3 tracking-widest">Enter Counter-Offer (₹)</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={bargainPrice}
                                                        onChange={(e) => setBargainPrice(e.target.value)}
                                                        placeholder="e.g. 25000"
                                                        className="flex-1 bg-white dark:bg-slate-900 border-0 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                                    />
                                                    <button
                                                        onClick={handleBargain}
                                                        className="bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg"
                                                    >
                                                        Send
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 h-48 overflow-y-auto space-y-3 no-scrollbar flex flex-col-reverse">
                                            <div className="space-y-3">
                                                {chatHistory.length === 0 ? (
                                                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase py-10">No messages yet. Send a greeting!</p>
                                                ) : (
                                                    chatHistory.map((msg, i) => (
                                                        <div key={i} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-bold ${msg.sender === 'driver' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700'}`}>
                                                                {msg.text}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={chatMessage}
                                                onChange={(e) => setChatMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                                placeholder="Type status or message..."
                                                className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                                            />
                                            <button
                                                onClick={sendChatMessage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-colors"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Route Navigation */}
                        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl p-7 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">
                                    <Navigation className="text-emerald-600" size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Route Navigation & Optimization
                                    </p>
                                    <h4 className="font-black text-lg">
                                        {activeRequest ? "Active Route" : "No Active Route"}
                                    </h4>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] text-emerald-600 font-black uppercase">
                                        Distance
                                    </p>
                                    <p className="text-2xl font-black mt-1">
                                        {activeRequest &&
                                            activeRequest.pickup_lat &&
                                            activeRequest.drop_lat
                                            ? `${haversineKm(activeRequest.pickup_lat, activeRequest.pickup_lng, activeRequest.drop_lat, activeRequest.drop_lng).toFixed(0)}`
                                            : "—"}
                                    </p>
                                    <p className="text-xs text-slate-400 font-bold">km</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] text-blue-600 font-black uppercase">
                                        ETA
                                    </p>
                                    <p className="text-2xl font-black mt-1">
                                        {activeRequest &&
                                            activeRequest.pickup_lat &&
                                            activeRequest.drop_lat
                                            ? `${Math.round((haversineKm(activeRequest.pickup_lat, activeRequest.pickup_lng, activeRequest.drop_lat, activeRequest.drop_lng) / 40) * 60)}`
                                            : "—"}
                                    </p>
                                    <p className="text-xs text-slate-400 font-bold">mins</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 text-center">
                                    <p className="text-[10px] text-orange-600 font-black uppercase">
                                        Status
                                    </p>
                                    <p className="text-sm font-black mt-1">
                                        {deliveryStage === "idle"
                                            ? "Idle"
                                            : deliveryStage === "pickup"
                                                ? "To Pickup"
                                                : deliveryStage === "transit"
                                                    ? "In Transit"
                                                    : "Done"}
                                    </p>
                                </div>
                            </div>
                            {activeRequest && (
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                        {activeRequest.pickup_location}{" "}
                                        <span className="text-slate-400">→</span>{" "}
                                        {activeRequest.drop_location}
                                        <span className="text-emerald-500 font-black ml-2">
                                            GPS Active
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT ── */}
                    <div className="lg:col-span-5 space-y-5">
                        {/* Earnings Dashboard */}
                        <div className="bg-slate-950 rounded-[32px] p-7 text-white shadow-2xl space-y-5 border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-500/20 p-3 rounded-2xl">
                                    <TrendingUp className="text-orange-400" size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Earnings Dashboard
                                    </p>
                                    <h4 className="font-black text-lg">My Earnings</h4>
                                </div>
                            </div>
                            {loadingEarnings ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="animate-spin text-slate-400" size={28} />
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white/5 rounded-2xl p-5 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                                                Today
                                            </p>
                                            <p className="text-3xl font-black text-orange-400">
                                                ₹{earnings.today.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {earnings.todayCount} deliveries completed
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                                            <Clock size={20} className="text-orange-400" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-2xl p-4">
                                            <p className="text-[10px] text-slate-400 font-black uppercase">
                                                This Week
                                            </p>
                                            <p className="text-xl font-black text-emerald-400">
                                                ₹{earnings.week.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                {earnings.weekCount} deliveries
                                            </p>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4">
                                            <p className="text-[10px] text-slate-400 font-black uppercase">
                                                This Month
                                            </p>
                                            <p className="text-xl font-black text-blue-400">
                                                ₹{earnings.month.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                {earnings.monthCount} deliveries
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* In-App Notifications */}
                        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl p-7 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl">
                                        <Bell className="text-purple-600" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            In-App Notifications
                                        </p>
                                        <h4 className="font-black text-base">Live Alerts</h4>
                                    </div>
                                </div>
                                {notifications.length > 0 && (
                                    <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="text-center text-xs text-slate-400 font-medium py-6">
                                        No notifications yet
                                    </p>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div
                                            key={n.id}
                                            onClick={() => {
                                                if (n.bookingId) {
                                                    setActiveTab("dashboard");
                                                    setHighlightedRequestId(n.bookingId);
                                                    setTimeout(() => {
                                                        document.getElementById(`request-${n.bookingId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }, 100);
                                                    setTimeout(() => setHighlightedRequestId(null), 5000);
                                                }
                                            }}
                                            className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform ${i === 0 ? "bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20" : "bg-slate-50 dark:bg-slate-900"} ${highlightedRequestId === n.bookingId ? "ring-2 ring-orange-500" : ""}`}
                                        >
                                            <div
                                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-${n.color}-100 dark:bg-${n.color}-900/30`}
                                            >
                                                <n.icon size={14} className={`text-${n.color}-600`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-800 dark:text-white">
                                                    {n.title}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                                                    {n.desc}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold shrink-0">
                                                {n.time}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    {/* ── RIGHT: Emergency & Notifications ── */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Emergency SOS Shortcut */}
                        <button
                            onClick={() => setActiveTab("emergency")}
                            className="w-full bg-gradient-to-br from-red-600 to-rose-800 p-6 rounded-[32px] text-white shadow-2xl shadow-red-500/20 text-left relative overflow-hidden group active:scale-95 transition-all"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-white/20 p-3 rounded-2xl animate-pulse">
                                    <ShieldAlert size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-200">
                                        SOS Panel
                                    </p>
                                    <h3 className="text-xl font-black">Emergency Help</h3>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-red-100 mb-4 leading-relaxed">
                                Instant access to Highway Police, Ambulance, and Gadi Dost
                                Emergency Team.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-4 py-2 rounded-full">
                                Help is one tap away{" "}
                                <ArrowRight
                                    size={12}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </div>
                        </button>

                        {/* Recent Notifications */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                    Push Notifications
                                </h4>
                                <span className="bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                                    Live
                                </span>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="py-10 text-center opacity-50">
                                        <Bell size={24} className="mx-auto mb-2 text-slate-400" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No recent alerts</p>
                                    </div>
                                ) : (
                                    notifications.map((alert, i) => (
                                        <div
                                            key={alert.id}
                                            onClick={() => {
                                                if (alert.bookingId) {
                                                    setActiveTab("dashboard");
                                                    setHighlightedRequestId(alert.bookingId);
                                                    setTimeout(() => {
                                                        document.getElementById(`request-${alert.bookingId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }, 100);
                                                    setTimeout(() => setHighlightedRequestId(null), 5000);
                                                }
                                            }}
                                            className={`flex gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group ${highlightedRequestId === alert.bookingId ? "ring-2 ring-orange-500" : ""}`}
                                        >
                                            <div
                                                className={`w-10 h-10 bg-${alert.color}-100 dark:bg-${alert.color}-900/30 rounded-xl flex items-center justify-center text-${alert.color}-600 shrink-0 group-hover:scale-110 transition-transform`}
                                            >
                                                <alert.icon size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="text-xs font-black uppercase tracking-tight">
                                                        {alert.title}
                                                    </p>
                                                    <span className="text-[8px] font-bold text-slate-400">
                                                        {alert.time}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                                                    {alert.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">
                                Clear All Notifications
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {
                activeTab === "history" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                {
                                    label: "Total Trips",
                                    value: tripHistory.length,
                                    color: "blue",
                                    sub: "All time",
                                },
                                {
                                    label: "Completed",
                                    value: tripHistory.filter((t) => t.status === "completed")
                                        .length,
                                    color: "emerald",
                                    sub: "Successfully",
                                },
                                {
                                    label: "Total Earned",
                                    value: `₹${tripHistory
                                        .filter((t) => t.status === "completed")
                                        .reduce((a, t) => a + Number(t.offered_price || 0), 0)
                                        .toLocaleString()}`,
                                    color: "orange",
                                    sub: "All completed",
                                },
                                {
                                    label: "Pending/Active",
                                    value: tripHistory.filter((t) =>
                                        ["pending", "accepted", "picked_up", "in_transit"].includes(
                                            t.status,
                                        ),
                                    ).length,
                                    color: "purple",
                                    sub: "Right now",
                                },
                            ].map(({ label, value, color, sub }) => (
                                <div
                                    key={label}
                                    className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-100 dark:border-${color}-800/30 rounded-[24px] p-5`}
                                >
                                    <p
                                        className={`text-[9px] text-${color}-600 dark:text-${color}-400 font-black uppercase tracking-widest`}
                                    >
                                        {label}
                                    </p>
                                    <p
                                        className={`text-2xl font-black text-${color}-700 dark:text-${color}-300 mt-1`}
                                    >
                                        {value}
                                    </p>
                                    <p className={`text-[10px] text-${color}-500 mt-0.5`}>{sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Header + Refresh */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl">
                                    <FileText className="text-purple-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Complete Log
                                    </p>
                                    <h3 className="font-black text-xl">Trip History</h3>
                                </div>
                            </div>
                            <button
                                onClick={fetchTripHistory}
                                className="flex items-center gap-2 text-[11px] font-black uppercase text-purple-500 hover:text-purple-700 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl transition-colors"
                            >
                                <Bell size={12} /> Refresh
                            </button>
                        </div>

                        {loadingHistory ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="animate-spin text-purple-500" size={32} />
                            </div>
                        ) : tripHistory.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText size={28} className="text-slate-400" />
                                </div>
                                <p className="font-black text-slate-500 uppercase text-sm">
                                    No Trip History Yet
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                    Your completed, accepted and past bookings will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tripHistory.map((trip) => {
                                    const distKm =
                                        trip.pickup_lat && trip.drop_lat
                                            ? haversineKm(
                                                trip.pickup_lat,
                                                trip.pickup_lng,
                                                trip.drop_lat,
                                                trip.drop_lng,
                                            )
                                            : null;
                                    const etaMins = distKm ? Math.round((distKm / 40) * 60) : null;
                                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${trip.pickup_lat},${trip.pickup_lng}&destination=${trip.drop_lat},${trip.drop_lng}&travelmode=driving`;
                                    const statusConfig: Record<
                                        string,
                                        { label: string; color: string; bg: string }
                                    > = {
                                        pending: {
                                            label: "Pending",
                                            color: "text-orange-600",
                                            bg: "bg-orange-100 dark:bg-orange-900/20",
                                        },
                                        accepted: {
                                            label: "Accepted",
                                            color: "text-blue-600",
                                            bg: "bg-blue-100 dark:bg-blue-900/20",
                                        },
                                        picked_up: {
                                            label: "Picked Up",
                                            color: "text-amber-600",
                                            bg: "bg-amber-100 dark:bg-amber-900/20",
                                        },
                                        in_transit: {
                                            label: "In Transit",
                                            color: "text-purple-600",
                                            bg: "bg-purple-100 dark:bg-purple-900/20",
                                        },
                                        completed: {
                                            label: "Completed",
                                            color: "text-emerald-600",
                                            bg: "bg-emerald-100 dark:bg-emerald-900/20",
                                        },
                                        rejected: {
                                            label: "Rejected",
                                            color: "text-red-600",
                                            bg: "bg-red-100 dark:bg-red-900/20",
                                        },
                                        cancelled: {
                                            label: "Cancelled",
                                            color: "text-slate-500",
                                            bg: "bg-slate-100 dark:bg-slate-800",
                                        },
                                    };
                                    const st = statusConfig[trip.status] || {
                                        label: trip.status,
                                        color: "text-slate-600",
                                        bg: "bg-slate-100",
                                    };

                                    return (
                                        <div
                                            key={trip.id}
                                            className="bg-white dark:bg-slate-800 rounded-[28px] border border-slate-100 dark:border-slate-700 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                        >
                                            {/* Top stripe by status */}
                                            <div
                                                className={`h-1 w-full ${trip.status === "completed" ? "bg-emerald-500" : trip.status === "rejected" || trip.status === "cancelled" ? "bg-red-400" : trip.status === "in_transit" || trip.status === "picked_up" ? "bg-orange-500" : "bg-blue-500"}`}
                                            />

                                            <div className="p-6 space-y-4">
                                                {/* Row 1: ID + Status + Date */}
                                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                                            Booking ID
                                                        </p>
                                                        <p className="font-black text-base font-mono">
                                                            #{trip.id?.slice(0, 12).toUpperCase()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`${st.bg} ${st.color} text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide`}
                                                        >
                                                            {st.label}
                                                        </span>
                                                        <a
                                                            href={mapsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 p-2 rounded-xl hover:bg-blue-100 transition-colors"
                                                            title="Open in Google Maps"
                                                        >
                                                            <Navigation size={14} />
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Row 2: Customer */}
                                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-2xl p-3">
                                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">
                                                        <User size={14} className="text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-sm">
                                                            {trip.customer_name}
                                                        </p>
                                                        <a
                                                            href={`tel:${trip.customer_phone}`}
                                                            className="text-[11px] text-blue-500 font-bold flex items-center gap-1 hover:text-blue-700"
                                                        >
                                                            <Phone size={10} /> {trip.customer_phone}
                                                        </a>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] text-slate-400 font-black uppercase">
                                                            Booked
                                                        </p>
                                                        <p className="text-[10px] text-slate-600 dark:text-slate-300 font-bold">
                                                            {fmtDate(trip.created_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Row 3: Route */}
                                                <div className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900 rounded-2xl p-3">
                                                    <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                                        <div className="w-px h-5 bg-slate-300 dark:bg-slate-600" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                    </div>
                                                    <div className="flex-1 space-y-2 min-w-0">
                                                        <div>
                                                            <p className="text-[9px] text-slate-400 font-black uppercase">
                                                                Pickup
                                                            </p>
                                                            <p className="font-bold text-xs truncate">
                                                                {trip.pickup_location}
                                                            </p>
                                                            {trip.pickup_lat && (
                                                                <p className="text-[9px] text-slate-400">
                                                                    {trip.pickup_lat.toFixed(4)},{" "}
                                                                    {trip.pickup_lng.toFixed(4)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-slate-400 font-black uppercase">
                                                                Drop
                                                            </p>
                                                            <p className="font-bold text-xs truncate">
                                                                {trip.drop_location}
                                                            </p>
                                                            {trip.drop_lat && (
                                                                <p className="text-[9px] text-slate-400">
                                                                    {trip.drop_lat.toFixed(4)},{" "}
                                                                    {trip.drop_lng.toFixed(4)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 4: Details grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {[
                                                        { label: "Goods", value: trip.goods_type || "—" },
                                                        {
                                                            label: "Weight",
                                                            value: trip.weight ? `${trip.weight} T` : "—",
                                                        },
                                                        {
                                                            label: "Distance",
                                                            value: distKm ? `${distKm.toFixed(0)} km` : "—",
                                                        },
                                                        {
                                                            label: "ETA",
                                                            value: etaMins ? `~${etaMins} min` : "—",
                                                        },
                                                    ].map(({ label, value }) => (
                                                        <div
                                                            key={label}
                                                            className="bg-slate-50 dark:bg-slate-900 rounded-xl p-2.5 text-center"
                                                        >
                                                            <p className="text-[8px] text-slate-400 font-black uppercase">
                                                                {label}
                                                            </p>
                                                            <p className="font-black text-xs mt-0.5">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Row 5: Fare */}
                                                <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl px-5 py-3">
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 font-black uppercase">
                                                            Offered Fare
                                                        </p>
                                                        <p
                                                            className={`font-black text-xl ${trip.status === "completed" ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"}`}
                                                        >
                                                            ₹{Number(trip.offered_price || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {trip.vehicle_id && (
                                                        <div className="text-right">
                                                            <p className="text-[9px] text-slate-400 font-black uppercase">
                                                                Vehicle ID
                                                            </p>
                                                            <p className="font-bold text-xs font-mono text-slate-600 dark:text-slate-300">
                                                                {trip.vehicle_id.slice(0, 8)}…
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )
            }

            {/* History tab is already handled above */}

            {
                activeTab === "profile" && (
                    <form
                        onSubmit={handleSaveProfile}
                        className="space-y-8 animate-in fade-in duration-300"
                    >
                        {profileSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in zoom-in">
                                <CheckCircle2 size={20} />
                                <p className="text-sm font-black uppercase">
                                    Profile Saved Successfully!
                                </p>
                            </div>
                        )}
                        {profileError && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 animate-in zoom-in">
                                <AlertCircle size={20} />
                                <p className="text-sm font-black">{profileError}</p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8">
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="relative w-28 h-28">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                className="w-full h-full rounded-[24px] object-cover shadow-xl"
                                                alt="Profile"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-[24px] flex items-center justify-center">
                                                <User size={48} className="text-slate-400" />
                                            </div>
                                        )}
                                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-500 transition-colors">
                                            <Camera size={16} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handlePhotoChange}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 text-center">
                                        Profile Photo
                                    </p>
                                </div>
                                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                                    {[
                                        {
                                            label: "Status",
                                            value: profileExists ? "Verified" : "Pending",
                                            color: profileExists ? "emerald" : "orange",
                                        },
                                        {
                                            label: "Vehicle",
                                            value: profile.vehicle_registration || "Not Set",
                                            color: "blue",
                                        },
                                        {
                                            label: "Experience",
                                            value: profile.experience_years
                                                ? `${profile.experience_years} yrs`
                                                : "Not Set",
                                            color: "purple",
                                        },
                                    ].map(({ label, value, color }) => (
                                        <div
                                            key={label}
                                            className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-center"
                                        >
                                            <p className="text-[10px] text-slate-400 font-black uppercase">
                                                {label}
                                            </p>
                                            <p className={`font-black text-sm mt-1 text-${color}-600`}>
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Personal Info ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl">
                                    <User className="text-blue-600" size={20} />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-tight">
                                    Personal Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    {
                                        label: "Full Name",
                                        id: "full_name" as keyof DriverProfile,
                                        icon: User,
                                        type: "text",
                                        placeholder: "Rajesh Kumar",
                                    },
                                    {
                                        label: "Phone Number",
                                        id: "phone" as keyof DriverProfile,
                                        icon: Phone,
                                        type: "tel",
                                        placeholder: "+91 98765 43210",
                                    },
                                    {
                                        label: "Email Address",
                                        id: "email" as keyof DriverProfile,
                                        icon: Mail,
                                        type: "email",
                                        placeholder: "driver@example.com",
                                    },
                                    {
                                        label: "Date of Birth",
                                        id: "date_of_birth" as keyof DriverProfile,
                                        icon: Calendar,
                                        type: "date",
                                        placeholder: "",
                                    },
                                    {
                                        label: "Years of Experience",
                                        id: "experience_years" as keyof DriverProfile,
                                        icon: Star,
                                        type: "number",
                                        placeholder: "e.g. 5",
                                    },
                                ].map(({ label, id, icon: Icon, type, placeholder }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <Icon
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                                size={17}
                                            />
                                            <input
                                                type={type}
                                                placeholder={placeholder}
                                                {...field(id)}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Address ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl">
                                    <MapPin className="text-orange-500" size={20} />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-tight">
                                    Address Details
                                </h3>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                    Street Address
                                </label>
                                <div className="relative">
                                    <MapPin
                                        className="absolute left-4 top-4 text-slate-400"
                                        size={17}
                                    />
                                    <textarea
                                        rows={2}
                                        placeholder="House / Flat No., Street, Area..."
                                        {...field("address")}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {[
                                    {
                                        label: "City",
                                        id: "city" as keyof DriverProfile,
                                        placeholder: "Delhi",
                                    },
                                    {
                                        label: "State",
                                        id: "state" as keyof DriverProfile,
                                        placeholder: "Uttar Pradesh",
                                    },
                                    {
                                        label: "Pincode",
                                        id: "pincode" as keyof DriverProfile,
                                        placeholder: "110001",
                                    },
                                ].map(({ label, id, placeholder }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                            {label}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={placeholder}
                                            {...field(id)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-0 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Vehicle Info ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">
                                    <Truck className="text-emerald-600" size={20} />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-tight">
                                    Vehicle Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                        Vehicle Type
                                    </label>
                                    <div className="relative">
                                        <Car
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            size={17}
                                        />
                                        <ChevronDown
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            size={17}
                                        />
                                        <select
                                            {...field("vehicle_type")}
                                            className={`${inputCls} appearance-none cursor-pointer`}
                                        >
                                            {VEHICLE_TYPES.map((v) => (
                                                <option key={v}>{v}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {[
                                    {
                                        label: "Registration Number",
                                        id: "vehicle_registration" as keyof DriverProfile,
                                        icon: Hash,
                                        placeholder: "UP-14 AB 1234",
                                    },
                                    {
                                        label: "Vehicle Model",
                                        id: "vehicle_model" as keyof DriverProfile,
                                        icon: Car,
                                        placeholder: "Tata Ace Gold",
                                    },
                                    {
                                        label: "Manufacturing Year",
                                        id: "vehicle_year" as keyof DriverProfile,
                                        icon: Calendar,
                                        placeholder: "2021",
                                    },
                                ].map(({ label, id, icon: Icon, placeholder }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <Icon
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                                size={17}
                                            />
                                            <input
                                                type="text"
                                                placeholder={placeholder}
                                                {...field(id)}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── License Info ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl">
                                    <Shield className="text-purple-600" size={20} />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-tight">
                                    License & Documents
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    {
                                        label: "Driving License Number",
                                        id: "license_number" as keyof DriverProfile,
                                        icon: FileText,
                                        type: "text",
                                        placeholder: "DL-1420110012345",
                                    },
                                    {
                                        label: "License Expiry Date",
                                        id: "license_expiry" as keyof DriverProfile,
                                        icon: Calendar,
                                        type: "date",
                                        placeholder: "",
                                    },
                                ].map(({ label, id, icon: Icon, type, placeholder }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <Icon
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                                size={17}
                                            />
                                            <input
                                                type={type}
                                                placeholder={placeholder}
                                                {...field(id)}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Bank Details ── */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl">
                                    <Banknote className="text-amber-600" size={20} />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-tight">
                                    Bank Account Details
                                </h3>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex items-center gap-3">
                                <Shield size={16} className="text-amber-500 shrink-0" />
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                    Your bank details are encrypted and used only for payout
                                    processing.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    {
                                        label: "Account Holder Name",
                                        id: "bank_account_name" as keyof DriverProfile,
                                        icon: User,
                                        placeholder: "As per bank records",
                                    },
                                    {
                                        label: "Account Number",
                                        id: "bank_account_number" as keyof DriverProfile,
                                        icon: Hash,
                                        placeholder: "1234 5678 9012 3456",
                                    },
                                    {
                                        label: "IFSC Code",
                                        id: "bank_ifsc" as keyof DriverProfile,
                                        icon: Building2,
                                        placeholder: "SBIN0001234",
                                    },
                                    {
                                        label: "Bank Name",
                                        id: "bank_name" as keyof DriverProfile,
                                        icon: CreditCard,
                                        placeholder: "State Bank of India",
                                    },
                                ].map(({ label, id, icon: Icon, placeholder }) => (
                                    <div key={id} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <Icon
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                                size={17}
                                            />
                                            <input
                                                type="text"
                                                placeholder={placeholder}
                                                {...field(id)}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 uppercase tracking-tight"
                        >
                            {profileLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <Save size={24} strokeWidth={2.5} />
                            )}
                            {profileLoading
                                ? "Saving Profile..."
                                : profileExists
                                    ? "Update Driver Profile"
                                    : "Complete Registration"}
                        </button>
                    </form>
                )
            }

            {/* ═══════════════════════════════════════════════ */}
            {/*            LOAD ESTIMATOR TAB                  */}
            {/* ═══════════════════════════════════════════════ */}
            {
                activeTab === "estimator" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">
                                    <IndianRupee className="text-emerald-600" size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Smart Calculator
                                    </p>
                                    <h3 className="font-black text-xl">Load & Fare Estimator</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* From */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                                        From (Pickup City)
                                    </label>
                                    <div className="relative">
                                        <MapPin
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={16}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Delhi"
                                            value={estFrom}
                                            onChange={(e) => setEstFrom(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                </div>
                                {/* To */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                                        To (Destination City)
                                    </label>
                                    <div className="relative">
                                        <Navigation
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={16}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Mumbai"
                                            value={estTo}
                                            onChange={(e) => setEstTo(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                </div>
                                {/* Distance */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                                        Distance (km)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="1400"
                                        value={estDistance}
                                        onChange={(e) => setEstDistance(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                                {/* Weight */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                                        Load Weight (tonnes)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="5"
                                        value={estWeight}
                                        onChange={(e) => setEstWeight(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                                {/* Vehicle Type */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                                        Vehicle Type
                                    </label>
                                    <div className="relative">
                                        <Truck
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            size={16}
                                        />
                                        <select
                                            value={estVehicle}
                                            onChange={(e) => setEstVehicle(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer"
                                        >
                                            {VEHICLE_TYPES.map((v) => (
                                                <option key={v} className="bg-white dark:bg-slate-900">
                                                    {v}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* Goods Type */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                                        Goods Type
                                    </label>
                                    <div className="relative">
                                        <Package
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            size={16}
                                        />
                                        <select
                                            value={estGoodsType}
                                            onChange={(e) => setEstGoodsType(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer"
                                        >
                                            {[
                                                "General",
                                                "Perishable",
                                                "Fragile / Electronics",
                                                "Heavy Machinery",
                                                "Chemicals / Hazmat",
                                                "Agricultural",
                                                "Textile / Garments",
                                            ].map((g) => (
                                                <option key={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={estLoading || !estDistance}
                                onClick={() => {
                                    setEstLoading(true);
                                    const km = Number(estDistance) || 0;
                                    const wt = Number(estWeight) || 1;
                                    // Base rate per km × weight multiplier × vehicle multiplier
                                    const vehicleMultiplier: Record<string, number> = {
                                        "Tata Ace / LCV": 0.7,
                                        "14ft Container": 1.0,
                                        "19ft Eicher": 1.2,
                                        "22ft Multi-Axle": 1.5,
                                        "32ft MX Trailer": 2.0,
                                        "Mini Truck": 0.85,
                                        "Bike / Two-Wheeler": 0.3,
                                    };
                                    const goodsMultiplier: Record<string, number> = {
                                        General: 1.0,
                                        Perishable: 1.3,
                                        "Fragile / Electronics": 1.5,
                                        "Heavy Machinery": 1.4,
                                        "Chemicals / Hazmat": 1.6,
                                        Agricultural: 0.9,
                                        "Textile / Garments": 1.1,
                                    };
                                    const ratePerKm = 18; // base ₹/km
                                    const vm = vehicleMultiplier[estVehicle] || 1;
                                    const gm = goodsMultiplier[estGoodsType] || 1;
                                    const weightMul = 1 + (wt - 1) * 0.08;
                                    const fare = Math.round(ratePerKm * km * vm * gm * weightMul);
                                    const fuelPerKm =
                                        {
                                            "Tata Ace / LCV": 4,
                                            "14ft Container": 8,
                                            "19ft Eicher": 10,
                                            "22ft Multi-Axle": 13,
                                            "32ft MX Trailer": 18,
                                            "Mini Truck": 5,
                                            "Bike / Two-Wheeler": 2,
                                        }[estVehicle] || 8;
                                    const fuel = Math.round(km * fuelPerKm); // ₹ at ~₹8/km avg
                                    const toll = Math.round(km * 1.2); // ~₹1.2/km national avg
                                    const labour = Math.round(fare * 0.15); // 15% driver charge
                                    setTimeout(() => {
                                        setEstResult({
                                            fare,
                                            fuel,
                                            toll,
                                            labour,
                                            total: fare + toll + labour,
                                        });
                                        setEstLoading(false);
                                    }, 700);
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[28px] font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
                            >
                                {estLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <IndianRupee size={20} />
                                )}
                                {estLoading ? "Calculating..." : "Calculate Fare Estimate"}
                            </button>

                            {/* Result */}
                            {estResult && (
                                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[32px] p-7 text-white space-y-5 shadow-2xl shadow-emerald-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200">
                                                Fare Breakdown
                                            </p>
                                            <h4 className="font-black text-2xl mt-1">
                                                {estFrom || "Origin"} → {estTo || "Destination"}
                                            </h4>
                                        </div>
                                        <div className="bg-white/20 px-4 py-2 rounded-2xl text-right">
                                            <p className="text-[10px] text-emerald-200 font-black uppercase">
                                                Distance
                                            </p>
                                            <p className="font-black text-xl">{estDistance} km</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Base Fare", value: estResult.fare, icon: Truck },
                                            { label: "Est. Fuel", value: estResult.fuel, icon: Zap },
                                            {
                                                label: "Toll Charges",
                                                value: estResult.toll,
                                                icon: Navigation,
                                            },
                                            {
                                                label: "Driver Labour",
                                                value: estResult.labour,
                                                icon: User,
                                            },
                                        ].map(({ label, value, icon: Icon }) => (
                                            <div key={label} className="bg-white/10 rounded-2xl p-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    <p className="text-[9px] font-black uppercase text-emerald-200">
                                                        {label}
                                                    </p>
                                                </div>
                                                <p className="font-black text-lg">
                                                    ₹{value.toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/20 pt-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-emerald-200 font-black uppercase">
                                                Total Estimate (Excl. Fuel)
                                            </p>
                                            <p className="font-black text-4xl mt-1">
                                                ₹{estResult.total.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-emerald-200 font-black uppercase">
                                                Vehicle · Load
                                            </p>
                                            <p className="text-sm font-black">{estVehicle}</p>
                                            <p className="text-sm font-black text-emerald-200">
                                                {estWeight || "1"} T · {estGoodsType}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-emerald-300 text-center font-bold">
                                        ⚡ Estimates are indicative. Final price varies by market
                                        rates, route & season.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {
                activeTab === "emergency" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* SOS BUTTON */}
                        <div className="bg-gradient-to-br from-red-600 to-rose-800 rounded-[36px] p-8 text-white shadow-2xl shadow-red-500/30 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-3 rounded-2xl">
                                    <ShieldAlert size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-200">
                                        Emergency Services
                                    </p>
                                    <h3 className="font-black text-2xl">Driver SOS Panel</h3>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSosActive(true);
                                    let count = 5;
                                    setSosCountdown(count);
                                    const t = setInterval(() => {
                                        count--;
                                        setSosCountdown(count);
                                        if (count <= 0) {
                                            clearInterval(t);
                                            // In production: call emergency API / send location / alert dispatcher
                                            alert(
                                                "🚨 SOS Alert Sent!\n\nYour location has been shared with:\n• Gadi Dost Emergency Team\n• Nearest Police Station\n• Your registered emergency contact\n\nHelp is on the way.",
                                            );
                                            setSosActive(false);
                                        }
                                    }, 1000);
                                }}
                                disabled={sosActive}
                                className={`w-full py-8 rounded-[28px] font-black text-2xl flex flex-col items-center justify-center gap-2 transition-all border-4 ${sosActive ? "border-yellow-400 bg-white/10 animate-pulse" : "border-white/40 bg-white/15 hover:bg-white/25 hover:scale-[1.01]"}`}
                            >
                                <ShieldAlert
                                    size={40}
                                    className={sosActive ? "animate-bounce" : ""}
                                />
                                {sosActive
                                    ? `⚠️ Sending SOS in ${sosCountdown}s... (tap again to cancel)`
                                    : "🆘 TAP TO SEND SOS"}
                                <p className="text-sm font-bold text-red-200 mt-1 normal-case text-center">
                                    Shares your live GPS location with emergency contacts
                                </p>
                            </button>

                            {sosActive && (
                                <button
                                    onClick={() => setSosActive(false)}
                                    className="w-full py-3 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-200 font-black text-sm uppercase tracking-widest"
                                >
                                    Cancel SOS
                                </button>
                            )}
                        </div>

                        {/* Emergency Contacts */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl">
                                    <Phone className="text-red-500" size={20} />
                                </div>
                                <h3 className="font-black text-xl uppercase">
                                    Emergency Contacts
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    {
                                        label: "Police",
                                        number: "100",
                                        color: "blue",
                                        icon: ShieldAlert,
                                        badge: "📞 24/7",
                                    },
                                    {
                                        label: "Ambulance",
                                        number: "108",
                                        color: "red",
                                        icon: Zap,
                                        badge: "📞 National",
                                    },
                                    {
                                        label: "Fire Brigade",
                                        number: "101",
                                        color: "orange",
                                        icon: Flame,
                                        badge: "📞 24/7",
                                    },
                                    {
                                        label: "Highway Help",
                                        number: "1033",
                                        color: "emerald",
                                        icon: Truck,
                                        badge: "📞 NHAI",
                                    },
                                    {
                                        label: "Gadi Dost SOS",
                                        number: "+91 1800-XXX-XXXX",
                                        color: "violet",
                                        icon: Phone,
                                        badge: "📞 Toll Free",
                                    },
                                    {
                                        label: "Road Accident",
                                        number: "1073",
                                        color: "amber",
                                        icon: AlertCircle,
                                        badge: "📞 MORTH",
                                    },
                                ].map(({ label, number, color, icon: Icon, badge }) => (
                                    <a
                                        key={label}
                                        href={`tel:${number}`}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02] bg-${color}-50 dark:bg-${color}-900/10 border-${color}-100 dark:border-${color}-900/20`}
                                    >
                                        <div
                                            className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-2xl flex items-center justify-center`}
                                        >
                                            <Icon size={22} className={`text-${color}-600`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-sm">{label}</p>
                                            <p className={`font-black text-lg text-${color}-600`}>
                                                {number}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-[9px] font-black uppercase text-${color}-500 bg-${color}-100 dark:bg-${color}-900/30 px-2 py-1 rounded-xl`}
                                        >
                                            {badge}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Nearby Services Finder */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl">
                                    <Navigation className="text-blue-500" size={20} />
                                </div>
                                <h3 className="font-black text-xl uppercase">Find Nearby Help</h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    {
                                        label: "Mechanic",
                                        icon: Wrench,
                                        query: "truck+mechanic+near+me",
                                        color: "orange",
                                    },
                                    {
                                        label: "Towing",
                                        icon: Truck,
                                        query: "towing+service+near+me",
                                        color: "blue",
                                    },
                                    {
                                        label: "Petrol Pump",
                                        icon: Zap,
                                        query: "petrol+pump+near+me",
                                        color: "yellow",
                                    },
                                    {
                                        label: "Hospital",
                                        icon: Phone,
                                        query: "hospital+near+me",
                                        color: "red",
                                    },
                                ].map(({ label, icon: Icon, query, color }) => (
                                    <a
                                        key={label}
                                        href={`https://www.google.com/maps/search/${query}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl text-center transition-all hover:scale-105 bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-900/20`}
                                    >
                                        <div
                                            className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-2xl flex items-center justify-center`}
                                        >
                                            <Icon size={22} className={`text-${color}-600`} />
                                        </div>
                                        <p className="font-black text-xs uppercase">{label}</p>
                                        <span className="text-[9px] text-slate-400 font-bold">
                                            Open Maps ↗
                                        </span>
                                    </a>
                                ))}
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-4 flex items-start gap-3">
                                <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                    These links use your device GPS to find the nearest services.
                                    Allow location access when prompted.
                                </p>
                            </div>
                        </div>

                        {/* Breakdown Checklist */}
                        <div className="bg-white dark:bg-slate-800 rounded-[36px] border border-slate-100 dark:border-slate-700 shadow-xl p-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl">
                                    <AlertCircle className="text-amber-500" size={20} />
                                </div>
                                <h3 className="font-black text-xl uppercase">
                                    Breakdown Checklist
                                </h3>
                            </div>
                            <div className="space-y-2.5">
                                {[
                                    "Move vehicle to shoulder / safe area immediately",
                                    "Turn on hazard lights (parking lights)",
                                    "Place warning triangle 50m behind the truck",
                                    "Note down exact location (road name / km marker)",
                                    "Contact Gadi Dost helpline or send SOS above",
                                    "Do not leave goods unattended — stay near vehicle",
                                    "Take photos of breakdown for insurance documentation",
                                    "Wait for authorized mechanic or towing service",
                                ].map((step, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-900/5"
                                    >
                                        <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default DriverPanel;
