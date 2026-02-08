// Driver Dashboard Component Integration
// Add these methods and properties to your existing driver-dashboard.component.ts

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, BookingRequest } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-driver-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './driver-dashboard.component.html',
    styleUrls: ['./driver-dashboard.component.css']
})
export class DriverDashboardComponent implements OnInit, OnDestroy {

    // ============================================
    // ADD THESE PROPERTIES
    // ============================================

    liveBookings = signal<BookingRequest[]>([]);
    isConnected = signal<boolean>(false);
    currentDriverId: string = '';

    constructor(
        private supabase: SupabaseService,
        private auth: AuthService
    ) { }

    // ============================================
    // LIFECYCLE HOOKS
    // ============================================

    ngOnInit() {
        // Get current driver ID from auth
        this.auth.getCurrentUser().then(user => {
            if (user) {
                this.currentDriverId = user.id;
            }
        });

        // Subscribe to real-time booking requests
        this.supabase.subscribeToBookingRequests();

        // Get the live bookings signal from service
        this.liveBookings = this.supabase.getLiveBookings();

        // Mark as connected
        this.isConnected.set(true);

        console.log('✅ Driver dashboard initialized with real-time bookings');
    }

    ngOnDestroy() {
        // Clean up subscription when component is destroyed
        this.supabase.unsubscribeFromBookings();
        this.isConnected.set(false);

        console.log('🔌 Driver dashboard destroyed, unsubscribed from bookings');
    }

    // ============================================
    // BOOKING ACTION METHODS
    // ============================================

    /**
     * Accept a booking request
     */
    async acceptBooking(booking: BookingRequest) {
        if (!this.currentDriverId) {
            alert('Please log in to accept bookings');
            return;
        }

        try {
            await this.supabase.acceptBooking(booking.id, this.currentDriverId);

            // Show success message
            alert(`✅ Booking accepted!\nCustomer: ${booking.customer_name}\nPickup: ${booking.pickup_location}`);

            console.log('✅ Booking accepted:', booking.id);
        } catch (error) {
            console.error('Error accepting booking:', error);
            alert('❌ Failed to accept booking. Please try again.');
        }
    }

    /**
     * Reject a booking request
     */
    async rejectBooking(booking: BookingRequest) {
        const confirmed = confirm(
            `Are you sure you want to reject this booking?\n\nCustomer: ${booking.customer_name}\nRoute: ${booking.pickup_location} → ${booking.drop_location}`
        );

        if (!confirmed) return;

        try {
            await this.supabase.rejectBooking(booking.id);

            alert('❌ Booking rejected');
            console.log('❌ Booking rejected:', booking.id);
        } catch (error) {
            console.error('Error rejecting booking:', error);
            alert('Failed to reject booking. Please try again.');
        }
    }

    /**
     * Send a counter-offer to the customer
     */
    async sendCounterOffer(booking: BookingRequest) {
        const counterPrice = prompt(
            `Current offered price: ₹${booking.offered_price}\n\nEnter your counter-offer price (numbers only):`,
            booking.offered_price.toString()
        );

        if (!counterPrice) return; // User cancelled

        const price = parseInt(counterPrice);

        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        try {
            await this.supabase.counterOffer(booking.id, price);

            alert(`💬 Counter-offer sent: ₹${price}\n\nWaiting for customer response...`);
            console.log('💬 Counter-offer sent:', booking.id, '₹' + price);
        } catch (error) {
            console.error('Error sending counter-offer:', error);
            alert('Failed to send counter-offer. Please try again.');
        }
    }

    // ============================================
    // HELPER METHODS (Optional)
    // ============================================

    /**
     * Get status badge color class
     */
    getStatusClass(status: string): string {
        const statusMap: { [key: string]: string } = {
            'pending': 'status-pending',
            'accepted': 'status-accepted',
            'rejected': 'status-rejected',
            'bargaining': 'status-bargaining',
            'completed': 'status-completed'
        };
        return statusMap[status] || 'status-pending';
    }

    /**
     * Format timestamp for display
     */
    formatTime(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    }

    /**
     * Calculate estimated distance (placeholder - implement actual calculation)
     */
    calculateDistance(booking: BookingRequest): string {
        // Implement Haversine formula or use Google Maps API
        // For now, return placeholder
        return 'Calculating...';
    }
}

// ============================================
// INTEGRATION CHECKLIST
// ============================================

/*
✅ STEP 1: Add the service methods from supabase-service-additions.ts to your SupabaseService

✅ STEP 2: Copy the properties and methods from this file to your DriverDashboardComponent

✅ STEP 3: Add the HTML template from driver-dashboard-template.html to your component's template

✅ STEP 4: Run the SQL script from setup_realtime_trigger.sql in Supabase SQL Editor

✅ STEP 5: Test the integration:
   - Start customer app: npm run dev (port 5173)
   - Start driver app: ng serve (port 4200)
   - Create a booking from customer app
   - Watch it appear in driver app instantly!

✅ STEP 6: Test driver actions:
   - Click "ACCEPT" → Customer sees "✓ DRIVER ACCEPTED"
   - Click "COUNTER-OFFER" → Customer sees "💬 NEGOTIATING PRICE"
   - Click "REJECT" → Customer sees "✗ DRIVER DECLINED"
*/
