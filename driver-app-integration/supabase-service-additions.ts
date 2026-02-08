// Real-Time Booking Integration for Driver App
// Add these methods to your existing SupabaseService class in src/services/supabase.service.ts

// ============================================
// STEP 1: Add these properties to the class
// ============================================

private bookingChannel: any;
private liveBookings = signal<BookingRequest[]>([]);

// ============================================
// STEP 2: Add these methods to the class
// ============================================

/**
 * Subscribe to real-time booking requests from customers
 * Call this in ngOnInit of driver-dashboard component
 */
subscribeToBookingRequests() {
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
                this.liveBookings.update(bookings => [newRow, ...bookings]);
                this.showNotification(
                    'New Booking Request!',
                    `${newRow.customer_name} - ${newRow.pickup_location}`
                );
                console.log('✅ New booking added:', newRow.id);
            } else if (type === 'UPDATE' && newRow) {
                // Booking updated (customer responded to counter-offer, etc.)
                this.liveBookings.update(bookings =>
                    bookings.map(b => b.id === newRow.id ? newRow : b)
                );
                console.log('🔄 Booking updated:', newRow.id);
            } else if (type === 'DELETE' && oldRow) {
                // Booking cancelled/deleted
                this.liveBookings.update(bookings =>
                    bookings.filter(b => b.id !== oldRow.id)
                );
                console.log('🗑️ Booking deleted:', oldRow.id);
            }
        })
        .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Subscribed to booking_requests topic');
            } else if (status === 'CHANNEL_ERROR') {
                console.error('❌ Channel error - check RLS policies');
            } else {
                console.log('📡 Channel status:', status);
            }
        });
}

/**
 * Unsubscribe from booking requests
 * Call this in ngOnDestroy of driver-dashboard component
 */
unsubscribeFromBookings() {
    if (this.bookingChannel) {
        this.supabase.removeChannel(this.bookingChannel);
        console.log('🔌 Unsubscribed from booking_requests');
    }
}

/**
 * Get the live bookings signal (readonly)
 * Use this in your component to display bookings
 */
getLiveBookings() {
    return this.liveBookings.asReadonly();
}

/**
 * Accept a booking request
 * @param bookingId - ID of the booking to accept
 * @param driverId - Current driver's user ID
 */
async acceptBooking(bookingId: string, driverId: string) {
    try {
        const { data, error } = await this.supabase
            .from('booking_requests')
            .update({
                status: 'accepted',
                driver_id: driverId,
                driver_response: 'Confirmed! I will pick up on time.',
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Booking accepted:', data.id);
        return data;
    } catch (error) {
        console.error('Error accepting booking:', error);
        throw error;
    }
}

/**
 * Reject a booking request
 * @param bookingId - ID of the booking to reject
 */
async rejectBooking(bookingId: string) {
    try {
        const { data, error } = await this.supabase
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

        console.log('❌ Booking rejected:', data.id);
        return data;
    } catch (error) {
        console.error('Error rejecting booking:', error);
        throw error;
    }
}

/**
 * Send a counter-offer to the customer
 * @param bookingId - ID of the booking
 * @param counterPrice - Counter-offer price
 */
async counterOffer(bookingId: string, counterPrice: number) {
    try {
        const { data, error } = await this.supabase
            .from('booking_requests')
            .update({
                status: 'bargaining',
                counter_offer: counterPrice.toString(),
                driver_response: `I can do it for ₹${counterPrice}`,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;

        console.log('💬 Counter-offer sent:', data.id, '₹' + counterPrice);
        return data;
    } catch (error) {
        console.error('Error sending counter-offer:', error);
        throw error;
    }
}

/**
 * Show browser notification for new bookings
 * Requests permission if not already granted
 */
private showNotification(title: string, body: string) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/assets/truck-icon.png',
                badge: '/assets/badge-icon.png'
            });
        } else if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body });
                }
            });
        }
    }
}

// ============================================
// USAGE EXAMPLE IN COMPONENT:
// ============================================

/*
export class DriverDashboardComponent implements OnInit, OnDestroy {
  liveBookings = signal<BookingRequest[]>([]);

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.supabase.subscribeToBookingRequests();
    this.liveBookings = this.supabase.getLiveBookings();
  }

  ngOnDestroy() {
    this.supabase.unsubscribeFromBookings();
  }

  async handleAccept(booking: BookingRequest) {
    const driverId = 'get-from-auth-service';
    await this.supabase.acceptBooking(booking.id, driverId);
  }

  async handleReject(booking: BookingRequest) {
    await this.supabase.rejectBooking(booking.id);
  }

  async handleCounterOffer(booking: BookingRequest) {
    const price = prompt('Enter counter-offer:');
    if (price) {
      await this.supabase.counterOffer(booking.id, parseInt(price));
    }
  }
}
*/
