# Driver App Integration Guide

## 🎯 Quick Start

This guide will help you integrate real-time booking functionality into your Angular driver app.

## 📁 Files Created

All integration files are in: `driver-app-integration/`

1. **Database Setup**
   - `../database/setup_realtime_trigger.sql` - Run this in Supabase SQL Editor

2. **Service Integration**
   - `supabase-service-additions.ts` - Add to your `src/services/supabase.service.ts`

3. **Component Integration**
   - `driver-dashboard-component.ts` - Add to your `src/components/driver-dashboard.component.ts`
   - `driver-dashboard-template.html` - Add to your `src/components/driver-dashboard.component.html`

## 🚀 Integration Steps

### Step 1: Database Setup (5 minutes)

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/tstboympleybwbdwicik/sql
2. Copy entire content from `../database/setup_realtime_trigger.sql`
3. Paste and click "Run"
4. Verify: You should see "Success" message
5. Check trigger exists: Query should return 1 row showing the trigger

### Step 2: Update Supabase Service (10 minutes)

**File**: `gadi-driver-pannel/src/services/supabase.service.ts`

1. Open the file in your driver app
2. Find the `SupabaseService` class
3. Add these properties after the existing properties:

```typescript
private bookingChannel: any;
private liveBookings = signal<BookingRequest[]>([]);
```

4. Copy all methods from `supabase-service-additions.ts`
5. Paste them into the `SupabaseService` class (before the closing brace)

**Methods added:**
- `subscribeToBookingRequests()`
- `unsubscribeFromBookings()`
- `getLiveBookings()`
- `acceptBooking()`
- `rejectBooking()`
- `counterOffer()`
- `showNotification()` (private)

### Step 3: Update Driver Dashboard Component (15 minutes)

**File**: `gadi-driver-pannel/src/components/driver-dashboard.component.ts`

1. Add these imports at the top:

```typescript
import { signal } from '@angular/core';
import { BookingRequest } from '../services/supabase.service';
```

2. Add these properties to the component class:

```typescript
liveBookings = signal<BookingRequest[]>([]);
isConnected = signal<boolean>(false);
currentDriverId: string = '';
```

3. Update `ngOnInit()`:

```typescript
ngOnInit() {
  // Existing code...
  
  // Add this:
  this.auth.getCurrentUser().then(user => {
    if (user) this.currentDriverId = user.id;
  });
  
  this.supabase.subscribeToBookingRequests();
  this.liveBookings = this.supabase.getLiveBookings();
  this.isConnected.set(true);
}
```

4. Add `ngOnDestroy()`:

```typescript
ngOnDestroy() {
  this.supabase.unsubscribeFromBookings();
  this.isConnected.set(false);
}
```

5. Copy the three action methods from `driver-dashboard-component.ts`:
   - `acceptBooking()`
   - `rejectBooking()`
   - `sendCounterOffer()`

### Step 4: Update Driver Dashboard Template (20 minutes)

**File**: `gadi-driver-pannel/src/components/driver-dashboard.component.html`

1. Open your existing template
2. Find a good place to add the booking requests section (e.g., after the header)
3. Copy the entire content from `driver-dashboard-template.html`
4. Paste it into your template

**Note**: The template includes inline styles. You can either:
- Keep them inline (easiest)
- Move to component CSS file
- Move to global styles

### Step 5: Test the Integration (10 minutes)

#### Start Both Apps:

**Customer App:**
```bash
cd c:\Users\HP\Desktop\foreign fx\gaadii-dostt
npm run dev
# Opens on http://localhost:5173
```

**Driver App:**
```bash
cd path\to\gadi-driver-pannel
ng serve
# Opens on http://localhost:4200
```

#### Test Flow:

1. **Customer App** (localhost:5173):
   - Go to `/booking`
   - Search for trucks
   - Click "DISPATCH" on any truck
   - Check console: Should see "✅ Subscribed to booking:<id>"

2. **Driver App** (localhost:4200):
   - Login as driver
   - Go to dashboard
   - Check console: Should see "✅ Subscribed to booking_requests topic"
   - **New booking should appear instantly!** 📢

3. **Driver Actions**:
   - Click "ACCEPT" → Customer sees "✓ DRIVER ACCEPTED" in real-time
   - Click "COUNTER-OFFER" → Enter price → Customer sees "💬 NEGOTIATING PRICE"
   - Click "REJECT" → Customer sees "✗ DRIVER DECLINED"

4. **Verify Real-Time Updates**:
   - All changes should appear **without page refresh**
   - Check browser console for broadcast messages
   - Desktop notifications should appear for new bookings

## 🐛 Troubleshooting

### Issue: Driver app not receiving bookings

**Check:**
1. Console shows "✅ Subscribed to booking_requests topic"
2. User is authenticated (logged in)
3. Database trigger exists: Run verification query from SQL script
4. RLS policies allow access: Check Supabase dashboard

**Fix:**
```sql
-- Verify trigger
SELECT * FROM pg_trigger WHERE tgname = 'booking_requests_broadcast';

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'realtime';
```

### Issue: Customer not seeing driver responses

**Check:**
1. Customer console shows "✅ Subscribed to booking:<id>"
2. Driver actions complete without errors
3. Database row actually updated

**Fix:**
- Check Network tab for Supabase requests
- Verify `updated_at` column changes in database
- Check customer subscription is active

### Issue: "Channel error" in console

**Cause**: RLS policies not allowing subscription

**Fix:**
```sql
-- Re-run RLS policy creation from setup_realtime_trigger.sql
CREATE POLICY IF NOT EXISTS "Drivers can subscribe to booking_requests"
ON realtime.messages FOR SELECT TO authenticated
USING (topic = 'booking_requests');
```

### Issue: Notifications not showing

**Cause**: Permission not granted

**Fix:**
- Browser will prompt for notification permission
- If blocked, go to browser settings → Site permissions → Notifications
- Allow notifications for localhost:4200

## 📊 Architecture Overview

```
Customer App (React)                    Driver App (Angular)
     |                                        |
     | Creates booking                        |
     ↓                                        |
Supabase booking_requests table              |
     |                                        |
     | DB Trigger fires                       |
     ↓                                        ↓
Broadcasts to topics:              Subscribed to:
- booking_requests (global) ----→  booking_requests ✅
- booking:<id> (per-booking) ←---- booking:<id>
     ↑                                        |
     |                                        |
     | Driver updates status                  |
     ←----------------------------------------
```

## 🎨 Customization

### Change Colors

Edit the CSS in `driver-dashboard-template.html`:

```css
/* Pending bookings */
.booking-card.pending {
  border-color: #3b82f6; /* Change to your brand color */
}

/* Accept button */
.btn-accept {
  background: #22c55e; /* Change to your success color */
}
```

### Add Sound Alerts

In `supabase.service.ts`, update `showNotification()`:

```typescript
private showNotification(title: string, body: string) {
  // Play sound
  const audio = new Audio('/assets/notification.mp3');
  audio.play();
  
  // Show notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}
```

### Filter by Distance

Add distance calculation in service:

```typescript
subscribeToBookingRequests() {
  // ... existing code ...
  
  if (type === 'INSERT' && newRow) {
    // Calculate distance
    const distance = this.calculateDistance(
      driverLat, driverLng,
      newRow.pickup_lat, newRow.pickup_lng
    );
    
    // Only add if within 50km
    if (distance <= 50) {
      this.liveBookings.update(bookings => [newRow, ...bookings]);
    }
  }
}
```

## ✅ Checklist

- [ ] Run `setup_realtime_trigger.sql` in Supabase
- [ ] Add service methods to `supabase.service.ts`
- [ ] Update `driver-dashboard.component.ts` with properties and methods
- [ ] Add template HTML to `driver-dashboard.component.html`
- [ ] Test customer → driver flow
- [ ] Test driver → customer flow
- [ ] Verify desktop notifications work
- [ ] Check real-time updates (no refresh needed)
- [ ] Test on mobile (if applicable)
- [ ] Deploy to production

## 🚀 Deployment

When deploying to production:

1. **Environment Variables**: Store Supabase credentials in environment files
2. **HTTPS Required**: Real-time subscriptions require HTTPS in production
3. **Notification Permissions**: Users must grant permission on first visit
4. **Monitor Performance**: Check Supabase dashboard for connection metrics

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify Supabase dashboard shows active connections
3. Test SQL trigger manually with INSERT/UPDATE queries
4. Check RLS policies in Supabase dashboard

---

**Integration complete!** 🎉

Your customer and driver apps are now connected in real-time via Supabase broadcasts.
