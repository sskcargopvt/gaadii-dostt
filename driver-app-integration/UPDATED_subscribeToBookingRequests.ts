// UPDATED subscribeToBookingRequests method for driver app
// Replace the existing subscribeToBookingRequests() method in your supabase.service.ts

subscribeToBookingRequests() {
    if (this.bookingChannel) return;

    // Use broadcast channel to match the DB trigger
    const topic = 'booking_requests';
    this.bookingChannel = this.supabase.channel(topic, {
        config: { private: true }
    });

    this.bookingChannel
        .on('broadcast', { event: '*' }, (payload: any) => {
            console.log('📢 Booking broadcast received:', payload);

            // Normalize payload from DB trigger
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
            } else if (type === 'UPDATE' && newRow) {
                // Booking updated
                this.liveBookings.update(bookings =>
                    bookings.map(b => b.id === newRow.id ? { ...b, ...this.mapToBookingRequest(newRow) } : b)
                );
                console.log('🔄 Booking updated:', newRow.id);
            } else if (type === 'DELETE' && oldRow) {
                // Booking deleted
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
                console.error('❌ Channel error - check RLS policies');
            } else {
                console.log('📡 Channel status:', status);
            }
        });
}
