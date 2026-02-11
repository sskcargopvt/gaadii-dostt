// Admin/Driver Portal - Real-Time Booking Requests Listener
// Place this in your admin app to receive all incoming booking requests

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

interface BookingRequest {
    id: string;
    customer_id: string;
    customer_name?: string;
    customer_phone?: string;
    pickup_location: string;
    drop_location: string;
    pickup_lat: number;
    pickup_lng: number;
    drop_lat: number;
    drop_lng: number;
    goods_type: string;
    weight: string;
    offered_price: string;
    counter_offer?: string;
    status: string;
    vehicle_id?: string;
    driver_id?: string;
    driver_response?: string;
    messages?: any[];
    created_at: string;
    updated_at?: string;
}

export default function DriverRequestsList() {
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        const topic = 'booking_requests';
        const channel = supabase.channel(topic, { config: { private: true } });
        channelRef.current = channel;

        channel
            .on('broadcast', { event: '*' }, (payload: any) => {
                console.log('📢 Broadcast received:', payload);

                // Normalize payload (DB trigger sends new row data)
                // Fix: Check payload.payload.type first, then event, then top-level type
                const type = payload.payload?.type || payload.event || payload.type;
                const newRow = payload.new ?? payload.new_row ?? payload.payload?.new ?? payload.payload;
                const oldRow = payload.old ?? payload.old_row ?? payload.payload?.old;

                if (type === 'INSERT' && newRow) {
                    // New booking request
                    setRequests((prev) => [newRow, ...prev]);

                    // Optional: Show notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('New Booking Request!', {
                            body: `${newRow.customer_name || 'Customer'} - ${newRow.pickup_location} → ${newRow.drop_location}`,
                            icon: '/truck-icon.png'
                        });
                    }
                } else if (type === 'UPDATE' && newRow) {
                    // Booking updated (status change, counter-offer, etc.)
                    setRequests((prev) =>
                        prev.map((r) => (r.id === newRow.id ? newRow : r))
                    );
                } else if (type === 'DELETE' && oldRow) {
                    // Booking deleted/cancelled
                    setRequests((prev) => prev.filter((r) => r.id !== oldRow.id));
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Driver subscribed to:', topic);
                    setIsConnected(true);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Channel error for:', topic);
                    setIsConnected(false);
                } else {
                    console.log('Channel status:', status);
                }
            });

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, []);

    // Accept booking
    const handleAccept = async (bookingId: string) => {
        try {
            const { data, error } = await supabase
                .from('booking_requests')
                .update({
                    status: 'accepted',
                    driver_id: (await supabase.auth.getUser()).data.user?.id,
                    driver_response: 'Confirmed! I will pick up on time.',
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId)
                .select()
                .single();

            if (error) throw error;
            console.log('✅ Booking accepted:', data);
        } catch (err) {
            console.error('Error accepting booking:', err);
        }
    };

    // Reject booking
    const handleReject = async (bookingId: string) => {
        try {
            const { data, error } = await supabase
                .from('booking_requests')
                .update({
                    status: 'rejected',
                    driver_response: 'Sorry, not available at this time.',
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId)
                .select()
                .single();

            if (error) throw error;
            console.log('❌ Booking rejected:', data);
        } catch (err) {
            console.error('Error rejecting booking:', err);
        }
    };

    // Send counter-offer
    const handleCounterOffer = async (bookingId: string, counterPrice: string) => {
        try {
            const { data, error } = await supabase
                .from('booking_requests')
                .update({
                    status: 'bargaining',
                    counter_offer: counterPrice,
                    driver_response: `I can do it for ₹${counterPrice}`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId)
                .select()
                .single();

            if (error) throw error;
            console.log('💬 Counter-offer sent:', data);
        } catch (err) {
            console.error('Error sending counter-offer:', err);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black">Incoming Booking Requests</h2>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-bold">
                        {isConnected ? 'Live Feed Active' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <p className="text-sm text-slate-500 mb-6">
                🔔 Connected: Listening to all incoming booking requests in real time.
            </p>

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <p className="text-slate-400 font-bold">No booking requests yet. Waiting for customers...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-orange-500 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-black">{request.customer_name || 'Customer'}</h3>
                                    <p className="text-sm text-slate-500">{request.customer_phone}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-black ${request.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                    request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {request.status.toUpperCase()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold mb-1">PICKUP</p>
                                    <p className="text-sm font-bold">{request.pickup_location}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold mb-1">DROP-OFF</p>
                                    <p className="text-sm font-bold">{request.drop_location}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold mb-1">GOODS</p>
                                    <p className="text-sm font-bold">{request.goods_type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold mb-1">WEIGHT</p>
                                    <p className="text-sm font-bold">{request.weight} tons</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold mb-1">OFFERED PRICE</p>
                                    <p className="text-lg font-black text-orange-600">₹{request.offered_price}</p>
                                </div>
                            </div>

                            {request.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(request.id)}
                                        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black hover:bg-green-600 transition-colors"
                                    >
                                        ✓ ACCEPT
                                    </button>
                                    <button
                                        onClick={() => {
                                            const counter = prompt('Enter counter-offer price (numbers only):');
                                            if (counter) handleCounterOffer(request.id, counter);
                                        }}
                                        className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-black hover:bg-amber-600 transition-colors"
                                    >
                                        💬 COUNTER-OFFER
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black hover:bg-red-600 transition-colors"
                                    >
                                        ✗ REJECT
                                    </button>
                                </div>
                            )}

                            {request.status === 'bargaining' && request.counter_offer && (
                                <div className="bg-amber-50 p-4 rounded-xl">
                                    <p className="text-sm font-bold text-amber-800">
                                        💬 Counter-offer sent: ₹{request.counter_offer}
                                    </p>
                                    <p className="text-xs text-amber-600 mt-1">Waiting for customer response...</p>
                                </div>
                            )}

                            {request.status === 'accepted' && (
                                <div className="bg-green-50 p-4 rounded-xl">
                                    <p className="text-sm font-bold text-green-800">✓ Booking Confirmed!</p>
                                    <p className="text-xs text-green-600 mt-1">{request.driver_response}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
