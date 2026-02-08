/**
 * FIXED VERSION - Replace subscribeToBookingRequests() method
 * 
 * File: gadi-driver-pannel/src/services/supabase.service.ts
 * Location: Around line 115 (in the SupabaseService class)
 * 
 * FIND THIS METHOD and REPLACE IT COMPLETELY:
 */

subscribeToBookingRequests() {
    if (this.bookingChannel) return;

    // ✅ CHANGED: Use broadcast instead of postgres_changes
    const topic = 'booking_requests';
    this.bookingChannel = this.supabase.channel(topic, {
        config: { private: true, broadcast: { self: false } }
    });

    this.bookingChannel
        // ✅ CHANGED: Listen to 'broadcast' events instead of 'postgres_changes'
        .on('broadcast', { event: '*' }, (payload: any) => {
            console.log('📢 Booking broadcast received:', payload);

            // ✅ CHANGED: Normalize payload from DB trigger
            const type = payload.type || payload.event;
            const newRow = payload.new ?? payload.new_row ?? payload.payload;
            const oldRow = payload.old ?? payload.old_row;

            if (type === 'INSERT' && newRow) {
                // New booking request from customer
                const newBooking: BookingRequest = this.mapToBookingRequest(newRow);
                this.liveBookings.update(bookings => [newBooking, ...bookings]);
                this.showNotification(
                    'New Booking Request!',
                    `${newBooking.customer_name} - ${newBooking.pickup_location}`
                );
                console.log('✅ New booking added:', newBooking.id);
            }
            else if (type === 'UPDATE' && newRow) {
                // Booking updated (customer responded, etc.)
                this.liveBookings.update(bookings =>
                    bookings.map(b => b.id === newRow.id ? { ...b, ...this.mapToBookingRequest(newRow) } : b)
                );
                console.log('🔄 Booking updated:', newRow.id);
            }
            else if (type === 'DELETE' && oldRow) {
                // Booking deleted/cancelled
                this.liveBookings.update(bookings =>
                    bookings.filter(b => b.id !== oldRow.id)
                );
                console.log('🗑️ Booking deleted:', oldRow.id);
            }
        })
        .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Subscribed to booking_requests topic (broadcast mode)');
            } else if (status === 'CHANNEL_ERROR') {
                console.error('❌ Channel error - check RLS policies and authentication');
            } else {
                console.log('📡 Channel status:', status);
            }
        });
}

/**
 * WHAT CHANGED:
 * 
 * 1. Channel creation:
 *    OLD: this.supabase.channel('public:booking_requests')
 *    NEW: this.supabase.channel(topic, { config: { private: true, broadcast: { self: false } } })
 * 
 * 2. Event listener:
 *    OLD: .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, ...)
 *    NEW: .on('broadcast', { event: '*' }, ...)
 * 
 * 3. Payload handling:
 *    OLD: const eventType = payload.eventType; const newRow = payload.new;
 *    NEW: const type = payload.type || payload.event; const newRow = payload.new ?? payload.new_row ?? payload.payload;
 * 
 * 4. Event type checking:
 *    OLD: if (eventType === 'INSERT' && newRow)
 *    NEW: if (type === 'INSERT' && newRow)
 */
