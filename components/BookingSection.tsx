
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
  Target,
  Send,
  MessageSquare,
  Bell,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  User as UserIcon, CreditCard, History, Bike, IndianRupee, Activity, Zap, Phone
} from 'lucide-react';
import MapComponent from './MapComponent';
import { supabase } from '../services/supabaseClient';
import { DriverPanel } from './DriverPanel';
import MechanicPanel from './MechanicPanel';
import { User } from '../types';

// Helper function to calculate distance between two coordinates in km (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

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

const VEHICLE_TYPES = [
  'Tata Ace',
  'Mahindra Supro',
  'Flatbed Trailer',
  'Lowboy Trailer',
  'Refrigerated Trailer',
  'Container Trailer',
  'Multi-axle Trailer',
  '14ft Truck',
  '17ft Truck',
  '19ft Truck',
  '22ft Truck',
  '32ft Multi-axle'
];

const BookingSection: React.FC<{ t: any; user?: User }> = ({ t, user }) => {
  // Role-gate: drivers and mechanics see their own panels
  if (user?.role === 'driver') return <DriverPanel t={t} />;
  if (user?.role === 'mechanic') return <MechanicPanel t={t} />;

  const [view, setView] = useState<'marketplace' | 'active'>('marketplace');
  const [searching, setSearching] = useState(false);
  const [foundTrucks, setFoundTrucks] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [podUploaded, setPodUploaded] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]); // Track all sent requests
  const [bookingStatus, setBookingStatus] = useState<string>(''); // 'pending', 'accepted', 'rejected', 'bargaining'

  // Panel toggle
  const [panel, setPanel] = useState<'driver' | 'mechanic'>('driver');

  // Driver demo state
  const [driverAvailable, setDriverAvailable] = useState(true);
  const [deliveryStage, setDeliveryStage] = useState<string>('idle');
  const [requestAccepted, setRequestAccepted] = useState(false);

  // Form State
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [goodsType, setGoodsType] = useState('FMCG');
  const [weight, setWeight] = useState<string>('');
  const [vehicleType, setVehicleType] = useState('Tata Ace');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  // Coordinates
  const [pickupCoords, setPickupCoords] = useState({ lat: 28.6274, lng: 77.3725 });
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 28.4744, lng: 77.5030 });
  const [truckPosition, setTruckPosition] = useState({ lat: 28.6274, lng: 77.3725 });
  const [tripProgress, setTripProgress] = useState(0);
  const [distance, setDistance] = useState<number>(0);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'tons'>('kg');
  const [customItem, setCustomItem] = useState('');
  const [estPrice, setEstPrice] = useState(0);
  const [userOfferedPrice, setUserOfferedPrice] = useState<string>('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  // Price Estimation
  useEffect(() => {
    let base = 500;
    let ratePerKm = 40;
    if (vehicleType.includes('Tata Ace')) { base = 400; ratePerKm = 30; }
    else if (vehicleType.includes('Trailer')) { base = 5000; ratePerKm = 150; }

    const calculated = Math.round(base + (distance * ratePerKm));
    setEstPrice(calculated);
    if (!isEditingPrice) setUserOfferedPrice(String(calculated));
  }, [distance, vehicleType, isEditingPrice]);
  const [driverProfile, setDriverProfile] = useState<any>(null);

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
    const dist = calculateDistance(pickupCoords.lat, pickupCoords.lng, dropoffCoords.lat, dropoffCoords.lng);
    setDistance(dist);
  }, [pickupCoords, dropoffCoords]);

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
        if (progress >= 1 && interval) {
          clearInterval(interval);
        }
      }, updateInterval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [view, activeBooking, pickupCoords, dropoffCoords]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setHasSearched(true);
    setFoundTrucks([]);

    // 1. Get current pickup coordinates (already in pickupCoords state)

    try {
      // 2. Fetch all active vehicles from Supabase
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*');

      if (error) {
        console.error("Error fetching vehicles:", error);
        setSearching(false);
        return;
      }

      if (vehicles) {
        // 3. Filter vehicles within 100km radius and MATCHING vehicle type, then sort by distance
        const nearbyTrucks = vehicles
          .map((vehicle: any) => {
            const dist = calculateDistance(
              pickupCoords.lat,
              pickupCoords.lng,
              vehicle.lat || 0,
              vehicle.lng || 0
            );
            return { ...vehicle, distNum: dist };
          })
          .filter((v: any) => {
            const requestedTypeLower = vehicleType?.trim().toLowerCase();
            const vehicleTypeLower = v.type?.trim().toLowerCase();

            const distMatch = v.distNum <= 100;
            const availMatch = v.available === true;
            const coordMatch = v.lat !== 0 && v.lng !== 0;

            // Strict match unless "Any Available Truck" is selected
            let typeMatch = false;
            if (requestedTypeLower === 'any available truck') {
              typeMatch = true; // matches any vehicle
            } else {
              typeMatch = vehicleTypeLower === requestedTypeLower;
            }

            // Detailed logging for filtering
            if (!typeMatch || !distMatch || !availMatch || !coordMatch) {
              console.log(`❌ Filtering out ${v.registration_number} (${v.type}):`);
              if (!typeMatch) console.log(`   - Type mismatch: Requested "${vehicleType}", Vehicle "${v.type}"`);
              if (!distMatch) console.log(`   - Distance too far: ${v.distNum.toFixed(1)} km`);
              if (!availMatch) console.log(`   - Not available: ${v.available}`);
              if (!coordMatch) console.log(`   - Invalid coordinates: ${v.lat},${v.lng}`);
            } else {
              console.log(`✅ Matched ${v.registration_number} (${v.type}) | Dist: ${v.distNum.toFixed(1)}km`);
            }

            return typeMatch && distMatch && availMatch && coordMatch;
          })
          .sort((a: any, b: any) => a.distNum - b.distNum)
          .map((vehicle: any) => {
            return {
              id: vehicle.id,
              driver: `Driver ${vehicle.registration_number.slice(-4)}`, // Placeholder
              rating: (4.0 + Math.random()).toFixed(1),
              truck: `${vehicle.type} (${vehicle.registration_number})`,
              dist: `${vehicle.distNum.toFixed(1)} km away`,
              price: `₹${(Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000).toLocaleString()}`, // Random price for demo
              lat: vehicle.lat,
              lng: vehicle.lng
            };
          })
          .slice(0, 10); // Limit to top 10 closest matches

        // Artificial delay for "Scanning" effect
        setTimeout(() => {
          console.log(`🔍 Search results for ${vehicleType}:`, nearbyTrucks.length, "trucks found.");
          setFoundTrucks(nearbyTrucks);
          setSearching(false);

          // 📢 Proactive Broadcast: Inform matching drivers within 100km about this search
          const searchChannel = supabase.channel('driver_booking_requests');
          searchChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              searchChannel.send({
                type: 'broadcast',
                event: 'SEARCH_INTENT',
                payload: {
                  id: `intent-${Date.now()}`,
                  pickup_location: pickupAddress,
                  pickup_lat: pickupCoords.lat,
                  pickup_lng: pickupCoords.lng,
                  goods_type: goodsType === 'Other' ? customItem : goodsType,
                  weight: `${weight} ${weightUnit}`,
                  vehicle_type: vehicleType,
                  distance_km: distance.toFixed(1)
                }
              });
              setTimeout(() => supabase.removeChannel(searchChannel), 2000);
            }
          });
        }, 2500);
      } else {
        setSearching(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setSearching(false);
    }
  };

  // Real-time subscription for booking status updates via broadcast
  // Subscribes to booking:<bookingId> for real-time updates on this booking
  // UI tooltip: "Real-time updates enabled — you'll see driver responses and counter-offers instantly."
  useEffect(() => {
    if (!activeBooking?.bookingId) return;

    const bookingId = activeBooking.bookingId;
    const topic = `booking:${bookingId}`;

    // 1. Listen for Broadcasts (Chat/Bargain)
    const broadcastChannel = supabase.channel(topic);
    broadcastChannel
      .on('broadcast', { event: '*' }, (payload) => {
        console.log('Booking broadcast received:', payload);
        const updated = payload.new ?? payload.new_row ?? payload.payload;
        if (!updated) return;

        if (updated.id === bookingId) {
          setActiveBooking((prev: any) => prev ? ({
            ...prev,
            status: updated.status || prev.status,
            offered_price: updated.offered_price || prev.offered_price,
            driver_id: updated.driver_id || prev.driver_id
          }) : null);

          if (updated.messages) {
            setChatHistory(updated.messages);
          }
        }
      })
      .subscribe();

    // 2. Listen for Postgres Changes (Status Updates)
    const dbChannel = supabase.channel(`db-booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'booking_requests',
          filter: `id=eq.${bookingId}`
        },
        (payload) => {
          console.log('✅ DB update received via postgres_changes:', payload.new);
          const updated = payload.new;
          setActiveBooking((prev: any) => prev ? ({
            ...prev,
            status: updated.status || prev.status,
            offered_price: updated.offered_price || prev.offered_price,
            driver_id: updated.driver_id || prev.driver_id
          }) : null);

          if (updated.messages) {
            setChatHistory(updated.messages);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(dbChannel);
    };
  }, [activeBooking?.bookingId]);

  // Fetch driver details when accepted
  useEffect(() => {
    if (!activeBooking?.driver_id) return;
    (async () => {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('driver_id', activeBooking.driver_id)
        .single();
      if (data) setDriverProfile(data);
    })();
  }, [activeBooking?.driver_id]);

  const handleBook = async (truck: any) => {
    try {
      // 1. Get Session for User Details
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      const priceValue = truck.price.replace(/[^\d]/g, '');

      // 2. Insert into Supabase
      const newBookingData = {
        customer_id: user?.id || 'demo-user',
        customer_name: user?.user_metadata?.name || 'Guest User',
        customer_phone: user?.phone || '9999999999',
        pickup_location: pickupAddress,
        drop_location: dropoffAddress,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        drop_lat: dropoffCoords.lat,
        drop_lng: dropoffCoords.lng,
        goods_type: goodsType === 'Other' ? customItem : goodsType,
        weight: `${weight} ${weightUnit}`,
        offered_price: userOfferedPrice || priceValue,
        status: 'pending',
        vehicle_id: truck.id,
        vehicle_type: truck.type || vehicleType,
        distance_km: distance.toFixed(1),
        messages: [],
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('booking_requests')
        .insert([newBookingData])
        .select()
        .single();

      let finalData = data;
      if (error) {
        console.warn("⚠️ DB Insert Failed (RLS or missing table). Falling back to P2P Broadcast only:", error.message);
        finalData = { ...newBookingData, id: `demo-${Date.now()}` };
      } else {
        console.log('✅ Booking created in DB:', data.id);
      }

      // 3. Broadcast to driver panel — use a single channel and wait for SUBSCRIBED
      const broadcastChannel = supabase.channel('driver_booking_requests');

      let broadcastSent = false;
      broadcastChannel.subscribe(async (status) => {
        console.log('📡 Broadcast channel status:', status);
        if (status === 'SUBSCRIBED' && !broadcastSent) {
          broadcastSent = true;

          const result = await broadcastChannel.send({
            type: 'broadcast',
            event: 'INSERT',
            payload: finalData  // Send the full booking row directly
          });

          console.log('📢 Broadcast result:', result);
          // Keep channel alive for 8 seconds to ensure delivery
          setTimeout(() => supabase.removeChannel(broadcastChannel), 8000);
        }
      });

      // 4. Set Active State
      setActiveBooking({ ...truck, bookingId: finalData.id, status: 'pending', offered_price: userOfferedPrice || priceValue });
      setBookingStatus('pending');
      setView('active');
    } catch (err) {
      console.error("Critical Booking Error:", err);
      setActiveBooking(truck);
      setView('active');
    }
  };

  // Custom Global Broadcast (for when no specific trucks are found)
  const sendGlobalBroadcast = async () => {
    setSearching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      const newBooking = {
        customer_id: user?.id,
        customer_name: user?.user_metadata?.name || 'Guest User',
        customer_phone: user?.phone || '9999999999',
        pickup_location: pickupAddress,
        drop_location: dropoffAddress,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        drop_lat: dropoffCoords.lat,
        drop_lng: dropoffCoords.lng,
        goods_type: goodsType,
        weight: weight || '0',
        offered_price: userOfferedPrice || String(estPrice),
        status: 'pending',
        vehicle_id: null, // Broadcast to everyone
        vehicle_type: vehicleType,
        messages: [],
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('booking_requests')
        .insert([newBooking])
        .select()
        .single();

      let finalData = data;
      if (error) {
        console.warn("⚠️ Global DB Insert Failed. Falling back to P2P Broadcast:", error.message);
        finalData = { ...newBooking, id: `global-demo-${Date.now()}` };
      } else {
        console.log('✅ Global Booking created:', data.id);
      }

      // Broadcast to Driver Panel channel
      const broadcastChannel = supabase.channel('driver_booking_requests');
      broadcastChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await broadcastChannel.send({
            type: 'broadcast',
            event: 'INSERT',
            payload: { type: 'INSERT', new: finalData, new_row: finalData }
          });
          setTimeout(() => supabase.removeChannel(broadcastChannel), 3000);
        }
      });

      setActiveBooking({
        bookingId: finalData.id,
        status: 'pending',
        offered_price: userOfferedPrice || String(estPrice),
        truck: `${vehicleType} (Broadcasting...)`,
        rating: '—',
        dist: 'Waiting for response'
      });
      setBookingStatus('pending');
      setView('active');
    } catch (err) {
      console.error("Global Broadcast Error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Send request to ALL nearby trucks (broadcast to driver app)
  const sendRequestToAllTrucks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      // Create requests for all found trucks
      const requests = foundTrucks.map(truck => ({
        customer_id: user?.id, // Link to authenticated user
        customer_name: user?.user_metadata?.name || 'Guest User',
        customer_phone: user?.phone || '9999999999',
        pickup_location: pickupAddress,
        drop_location: dropoffAddress,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        drop_lat: dropoffCoords.lat,
        drop_lng: dropoffCoords.lng,
        goods_type: goodsType,
        weight: weight || '0',
        offered_price: userOfferedPrice || truck.price.replace(/[^\d]/g, ''),
        status: 'pending',
        vehicle_id: truck.id,
        messages: [], // Initialize empty messages array
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('booking_requests')
        .insert(requests)
        .select();

      let finalData = data || [];
      if (error) {
        console.warn("⚠️ Broadcast DB Insert Failed. Falling back to P2P Broadcast:", error.message);
        finalData = requests.map((req, i) => ({ ...req, id: `broadcast-demo-${Date.now()}-${i}` }));
      } else {
        console.log(`✅ Broadcast ${data?.length || 0} booking requests to drivers`);
      }

      // Broadcast all bookings to Driver Panel on the correct channel
      const broadcastChannel = supabase.channel('driver_booking_requests');
      broadcastChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          for (const booking of finalData) {
            await broadcastChannel.send({
              type: 'broadcast',
              event: 'INSERT',
              payload: { type: 'INSERT', new: booking, new_row: booking }
            });
          }
          console.log('📢 All booking broadcasts sent to Driver Panel');
          setTimeout(() => supabase.removeChannel(broadcastChannel), 3000);
        }
      });

      setPendingRequests(data || []);
      alert(`📢 Sent booking request to ${foundTrucks.length} nearby drivers!\n\nThey will receive instant notifications.`);
    } catch (err) {
      console.error('Broadcast Error:', err);
      alert('❌ Failed to send requests. Please try again.');
    }
  };

  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const sendMessage = async () => {
    if (!chatMessage.trim() || !activeBooking?.bookingId) return;

    const newMsg = { sender: 'customer', text: chatMessage, time: new Date().toISOString() };
    const updated = [...chatHistory, newMsg];

    setChatHistory(updated); // Optimistic update
    setChatMessage("");

    try {
      // Fetch current to append securely
      const { data } = await supabase
        .from('booking_requests')
        .select('messages')
        .eq('id', activeBooking.bookingId)
        .single();

      const currentMessages = data?.messages || [];
      const toSave = [...currentMessages, newMsg];

      await supabase
        .from('booking_requests')
        .update({ messages: toSave })
        .eq('id', activeBooking.bookingId);

    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  const [isBargaining, setIsBargaining] = useState(false);
  const [bargainPrice, setBargainPrice] = useState("");

  const handleBargainConfirm = async () => {
    if (!bargainPrice || !activeBooking?.bookingId) return;

    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .update({
          offered_price: bargainPrice,
          status: 'bargaining'
        })
        .eq('id', activeBooking.bookingId)
        .select()
        .single();

      if (data) {
        setActiveBooking((prev: any) => ({ ...prev, offered_price: data.offered_price, status: data.status }));
        setIsBargaining(false);
        setBargainPrice("");

        // Broadcast update
        const topic = `booking:${activeBooking.bookingId}`;
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

  const acceptBargain = async () => {
    if (!activeBooking?.bookingId) return;

    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .update({ status: 'accepted' })
        .eq('id', activeBooking.bookingId)
        .select()
        .single();

      if (data) {
        setActiveBooking((prev: any) => ({ ...prev, status: 'accepted' }));

        // Broadcast update
        const topic = `booking:${activeBooking.bookingId}`;
        supabase.channel(topic).send({
          type: 'broadcast',
          event: 'UPDATE',
          payload: { ...data, type: 'UPDATE' }
        });
      }
    } catch (err) {
      console.error("Accept Bargain Error:", err);
    }
  };

  const handleMapPositionChange = (positions: { start: { lat: number; lng: number }; end: { lat: number; lng: number } }) => {
    setPickupCoords(positions.start);
    setDropoffCoords(positions.end);
    // Optionally reverse geocode again here to update input text
  };

  const currentCheckpoint = tripProgress < 100 ? getCurrentCheckpoint(tripProgress) : routeCheckpoints[3];

  // Calculate remaining distance for UI display based on trip progress
  const remainingKm = (1 - (tripProgress / 100)) * 12.5;

  const inputCls = "w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/40 outline-none transition-all";

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* ─── Hero / Header ─── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
            Book a <span className="text-orange-500">Vehicle</span>
          </h2>
          <p className="text-slate-500 font-bold text-lg flex items-center gap-2">
            <ShieldCheck size={18} className="text-orange-500" /> India's most reliable transport network
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setView('marketplace')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${view === 'marketplace' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            New Booking
          </button>
          <button
            onClick={() => activeBooking && setView('active')}
            disabled={!activeBooking}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${view === 'active' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 cursor-not-allowed'}`}
          >
            Track Order
          </button>
        </div>
      </div>

      {/* ─── Main Booking Tool ─── */}
      {view === 'marketplace' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left: Booking Form */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-[40px] p-8 lg:p-10 border border-slate-100 dark:border-slate-700 shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl" />

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
                  <MapPin size={12} className="text-orange-500" /> Route Details
                </h3>

                {/* Pickup */}
                <div className="relative group">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1.5 block">Pickup Location</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter pickup address"
                      value={pickupAddress}
                      onChange={(e) => handleAddressSearch(e.target.value, 'pickup')}
                      className={inputCls}
                    />
                    <button onClick={detectLocation} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 hover:scale-110 transition-transform">
                      <Target size={18} />
                    </button>
                  </div>
                  {showSuggestions === 'pickup' && (
                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                      {pickupSuggestions.map((s) => (
                        <button key={s.place_id} onClick={() => selectSuggestion(s, 'pickup')} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-start gap-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                          <MapPin size={16} className="text-slate-400 shrink-0 mt-1" />
                          <span className="text-sm font-bold truncate">{s.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropoff */}
                <div className="relative group">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1.5 block">Drop-off Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                    <input
                      type="text"
                      placeholder="Where are you sending to?"
                      value={dropoffAddress}
                      onChange={(e) => handleAddressSearch(e.target.value, 'dropoff')}
                      className={inputCls}
                    />
                  </div>
                  {showSuggestions === 'dropoff' && (
                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                      {dropoffSuggestions.map((s) => (
                        <button key={s.place_id} onClick={() => selectSuggestion(s, 'dropoff')} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-start gap-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                          <MapPin size={16} className="text-slate-400 shrink-0 mt-1" />
                          <span className="text-sm font-bold truncate">{s.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Goods Type</label>
                    <select value={goodsType} onChange={(e) => setGoodsType(e.target.value)} className={inputCls}>
                      <option value="FMCG">FMCG</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Textile">Textile</option>
                      <option value="Construction">Construction</option>
                      <option value="Other">Other (Specify)</option>
                    </select>
                  </div>
                  {goodsType === 'Other' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Item Name</label>
                      <input
                        type="text"
                        value={customItem}
                        onChange={(e) => setCustomItem(e.target.value)}
                        placeholder="Enter item name"
                        className={inputCls}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Vehicle Type</label>
                    <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputCls}>
                      <option value="Any Available Truck">🚀 Any Available Truck</option>
                      <optgroup label="Mini Trucks">
                        <option value="Tata Ace">Tata Ace (750kg)</option>
                        <option value="Mahindra Supro">Mahindra Supro (1 ton)</option>
                      </optgroup>
                      <optgroup label="Standard Trucks">
                        <option value="14ft Truck">14ft Truck (Eicher)</option>
                        <option value="17ft Truck">17ft Truck</option>
                        <option value="19ft Truck">19ft Truck</option>
                        <option value="22ft Truck">22ft Truck</option>
                        <option value="32ft Multi-axle">32ft Multi-axle</option>
                      </optgroup>
                      <optgroup label="Trailers & Heavy">
                        <option value="Flatbed Trailer">Flatbed Trailer</option>
                        <option value="Lowboy Trailer">Lowboy Trailer</option>
                        <option value="Refrigerated Trailer">Refrigerated Trailer</option>
                        <option value="Container Trailer">Container Trailer</option>
                        <option value="Multi-axle Trailer">Multi-axle Trailer</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Est. Weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g. 500"
                        className={inputCls}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <button
                          onClick={() => setWeightUnit('kg')}
                          className={`px-3 py-1.5 text-[10px] font-black transition-colors ${weightUnit === 'kg' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}
                        >
                          KG
                        </button>
                        <button
                          onClick={() => setWeightUnit('tons')}
                          className={`px-3 py-1.5 text-[10px] font-black transition-colors ${weightUnit === 'tons' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}
                        >
                          TON
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-4 flex items-center justify-between border border-orange-100 dark:border-orange-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center text-orange-500">
                      <Navigation size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Total Distance</p>
                      <p className="text-xl font-black italic">{distance.toFixed(1)} KM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Estimated Duration</p>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">~{Math.round(distance * 3)} mins</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Calculated Estimate</p>
                    <p className="font-black text-sm">₹{estPrice.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Your Offered Price (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="number"
                        value={userOfferedPrice}
                        onChange={(e) => {
                          setUserOfferedPrice(e.target.value);
                          setIsEditingPrice(true);
                        }}
                        className={`${inputCls} !pl-10`}
                        placeholder="e.g. 5000"
                      />
                      {isEditingPrice && (
                        <button
                          onClick={() => setIsEditingPrice(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-orange-500 hover:text-orange-600"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Find Trucks Button */}
              <button
                onClick={handleSearch}
                disabled={searching || !pickupAddress || !dropoffAddress}
                className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-[24px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                {searching ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting to Fleet...
                  </div>
                ) : (
                  <><Search size={22} strokeWidth={3} /> Search Available Trucks</>
                )}
              </button>
            </div>
          </div>

          {/* Right: Map / Marketplace Results */}
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-2xl h-[500px] xl:h-[600px] relative group">
              <MapComponent
                startPos={pickupCoords}
                endPos={dropoffCoords}
                onPositionsChange={handleMapPositionChange}
                isDraggable={true}
              />

              {/* Marketplace Overlay */}
              {foundTrucks.length > 0 && !searching && (
                <div className="absolute inset-x-4 bottom-4 z-10 flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                  {foundTrucks.map((truck) => (
                    <div key={truck.id} className="min-w-[320px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[32px] p-6 shadow-2xl border border-white/20 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center text-orange-500">
                            <Truck size={24} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">{truck.truck}</h4>
                            <div className="flex items-center gap-2">
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                              <span className="text-[10px] font-black text-slate-500">{truck.rating} • {truck.dist}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xl font-black text-orange-500">{truck.price}</p>
                      </div>
                      <button
                        onClick={() => handleBook(truck)}
                        className="w-full py-3.5 bg-slate-900 dark:bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg active:scale-95"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Scanning Effect Overlay */}
              {searching && (
                <div className="absolute inset-0 z-20 bg-orange-500/10 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-10">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 border-8 border-orange-500 rounded-full animate-ping opacity-20" />
                    <div className="absolute inset-0 w-32 h-32 border-8 border-orange-500 rounded-full flex items-center justify-center">
                      <Search size={48} className="text-orange-500 animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">Assigning Nearest Fleet</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-bold max-w-xs">Scanning 150+ verified drivers within a 5km radius of your location...</p>
                </div>
              )}

              {/* No Results Fallback */}
              {!searching && hasSearched && foundTrucks.length === 0 && (
                <div className="absolute inset-0 z-20 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-10">
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                    <Truck size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">No Specific Trucks Nearby</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-xs mb-8">
                    We couldn't find a direct match for <strong>{vehicleType}</strong> within 100km right now.
                  </p>
                  <button
                    onClick={sendGlobalBroadcast}
                    className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-500/30 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3"
                  >
                    <Zap size={16} /> Broadcast to Fleet Network
                  </button>
                  <button
                    onClick={() => { setHasSearched(false); setFoundTrucks([]); }}
                    className="mt-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tracking View ─── */}
      {view === 'active' && activeBooking && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in zoom-in duration-500">
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-[40px] p-8 border border-slate-100 dark:border-slate-700 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase italic italic tracking-tighter">Live Tracking</h3>
                  <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.3em]">Order #{activeBooking.bookingId?.slice(-6)}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse ${activeBooking.status === 'pending' ? 'bg-orange-500/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  {activeBooking.status === 'pending' ? 'Broadcasting to drivers' : 'On the move'}
                </div>
              </div>

              <div className="space-y-6 relative ml-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-slate-100 dark:before:bg-slate-700">
                <div className="relative pl-8">
                  <div className="absolute left-[-4px] top-1.5 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Pickup</p>
                  <p className="text-sm font-bold truncate">{pickupAddress}</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-[-4px] top-1.5 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-500" />
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Dropoff</p>
                  <p className="text-sm font-bold truncate">{dropoffAddress}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-700 space-y-4">
                {activeBooking.status === 'pending' ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                      <Zap size={24} className="text-orange-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-tighter">Waiting for driver response</p>
                    <p className="text-[10px] font-bold text-slate-400 px-10">We've sent your request to 10+ nearby fleet partners.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden">
                      {driverProfile?.profile_photo_url ? (
                        <img src={driverProfile.profile_photo_url} alt="Driver" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} className="text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-black text-sm uppercase tracking-tight truncate">{driverProfile?.full_name || 'Assigned Driver'}</h5>
                      <div className="flex items-center gap-2">
                        <Star size={10} className="text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-black text-slate-500">Verified Gold Partner</span>
                      </div>
                    </div>
                    {driverProfile?.phone && (
                      <a
                        href={`tel:${driverProfile.phone}`}
                        className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      >
                        <Phone size={18} />
                      </a>
                    )}
                    <button className="bg-blue-500 text-white p-3 rounded-xl shadow-lg hover:scale-110 transition-transform">
                      <MessageSquare size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Chat & Pricing Tool ── */}
              <div className="pt-8 border-t border-slate-50 dark:border-slate-700 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-orange-500" />
                    <h5 className="font-black text-xs uppercase tracking-tight">Booking Details</h5>
                  </div>
                  {activeBooking.status === 'bargaining' && (
                    <button
                      onClick={acceptBargain}
                      className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg"
                    >
                      Accept Price
                    </button>
                  )}
                  <button
                    onClick={() => setIsBargaining(!isBargaining)}
                    className="text-[10px] font-black uppercase text-orange-500 border border-orange-200 dark:border-orange-800 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    Bargain
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Current Fare</p>
                    <p className="text-2xl font-black text-orange-500 italic">₹{Number(activeBooking.offered_price || 0).toLocaleString()}</p>
                  </div>

                  {isBargaining && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 space-y-3">
                      <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">New Counter-Offer</p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={bargainPrice}
                          onChange={(e) => setBargainPrice(e.target.value)}
                          placeholder="Enter your price"
                          className="flex-1 bg-white dark:bg-slate-800 border-0 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                        <button
                          onClick={handleBargainConfirm}
                          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat History */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-4 h-48 overflow-y-auto no-scrollbar flex flex-col-reverse">
                  <div className="space-y-3">
                    {chatHistory.length === 0 ? (
                      <p className="text-center text-[10px] text-slate-400 font-black uppercase py-10 opacity-50">No messages yet. Send a greeting!</p>
                    ) : (
                      chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3.5 rounded-[22px] text-xs font-bold ${msg.sender === 'customer' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Message driver..."
                    className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl py-4 pl-5 pr-14 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8">
            <div className="bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-2xl h-[500px] xl:h-[600px] relative">
              <MapComponent
                startPos={pickupCoords}
                endPos={dropoffCoords}
                currentPosition={truckPosition}
              />
              <div className="absolute top-6 left-6 right-6">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-[28px] shadow-2xl border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                      <Navigation size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 leading-none">Status</p>
                      <p className="text-sm font-black uppercase tracking-tight">{currentCheckpoint}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 leading-none">Arrival</p>
                    <p className="text-sm font-black text-orange-500 uppercase italic">~{Math.round(remainingKm * 3)} mins away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Features Informational Section (Requested) ─── */}
      <div className="pt-20 border-t border-slate-100 dark:border-slate-800 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight">
            Seamless <span className="text-orange-500">Logistics</span> for Everyone
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
            Instantly connect with India's largest verified fleet and enjoy a stress-free delivery experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            [MapPin, 'orange', 'Easy Booking & Scheduling', 'Easy booking allows users to instantly or pre-schedule parcel deliveries by entering pickup and drop locations within the app.'],
            [Truck, 'blue', 'Multiple Vehicle Options', 'Users can choose different vehicle types, such as bikes or mini trucks, based on parcel size and delivery needs.'],
            [Activity, 'emerald', 'Real-Time Parcel Tracking', 'Real-time parcel tracking lets users monitor their delivery live on the map from pickup to final drop.'],
            [CreditCard, 'purple', 'Secure Online Payments', 'Secure online payments enable users to pay safely using UPI, cards, or digital wallets within the app.'],
            [History, 'cyan', 'Order History & Invoices', 'Order history allows users to view previous deliveries and download invoices for record-keeping.'],
            [Zap, 'rose', 'Notification Alerts', 'Notification alerts provide real-time updates about booking confirmation, driver assignment, and delivery status.'],
          ].map(([Icon, color, title, desc]: any, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-[40px] border-4 border-slate-50 dark:border-slate-700 shadow-2xl p-10 space-y-6 hover:border-orange-500/50 transition-all group relative overflow-hidden">
              <div className={`absolute -right-8 -top-8 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl group-hover:bg-${color}-500/10 transition-colors`} />
              <div className={`w-16 h-16 rounded-[20px] bg-${color}-100 dark:bg-${color}-900/40 flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform`}>
                <Icon size={32} className={`text-${color}-600 dark:text-${color}-400`} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Banner */}
        <div className="bg-slate-950 rounded-[40px] p-12 text-white border border-slate-800 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-3xl font-black italic uppercase mb-4 leading-tight">India's Most Trusted <br /><span className="text-orange-500">Transport Network</span></h3>
              <p className="text-slate-400 font-medium text-lg">Join thousands of businesses and individuals moving goods across India with GADI DOST.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center px-6 border-r border-slate-800 last:border-0">
                <p className="text-4xl font-black text-orange-500">50K+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Verified Drivers</p>
              </div>
              <div className="text-center px-6 border-r border-slate-800 last:border-0">
                <p className="text-4xl font-black text-blue-500">100+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Cities</p>
              </div>
              <div className="text-center px-6 last:border-0">
                <p className="text-4xl font-black text-emerald-500">4.9/5</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSection;
