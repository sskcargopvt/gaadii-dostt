# Quick Fix: Driver App Not Receiving Bookings

## Problem
The driver app is using `postgres_changes` subscription, but the database trigger we created uses `pg_notify` which requires `broadcast` subscription.

## Solution

### Option 1: Update Driver App Code (Recommended)

**File to update:** `src/services/supabase.service.ts` in your driver app

**Find this method:**
```typescript
subscribeToBookingRequests() {
  if (this.bookingChannel) return;

  this.bookingChannel = this.supabase.channel('public:booking_requests')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, (payload) => {
      // ... existing code
    })
    .subscribe();
}
```

**Replace with:**
```typescript
subscribeToBookingRequests() {
  if (this.bookingChannel) return;

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
        const newBooking: BookingRequest = this.mapToBookingRequest(newRow);
        this.liveBookings.update(bookings => [newBooking, ...bookings]);
        this.showNotification(
          'New Booking Request!', 
          `${newBooking.customer_name} - ${newBooking.pickup_location}`
        );
        console.log('✅ New booking added:', newBooking.id);
      } else if (type === 'UPDATE' && newRow) {
        this.liveBookings.update(bookings =>
          bookings.map(b => b.id === newRow.id ? { ...b, ...this.mapToBookingRequest(newRow) } : b)
        );
        console.log('🔄 Booking updated:', newRow.id);
      } else if (type === 'DELETE' && oldRow) {
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
```

### Option 2: Alternative Database Trigger (If you can't change driver app)

If you cannot modify the driver app code, you can use a different trigger approach:

**Run this in Supabase SQL Editor instead:**

```sql
-- Alternative: Use postgres_changes compatible approach
-- This enables realtime for the table directly

-- 1. Enable realtime on the table (if not already)
ALTER TABLE booking_requests REPLICA IDENTITY FULL;

-- 2. Make sure RLS allows reading
CREATE POLICY IF NOT EXISTS "Allow authenticated to read bookings"
ON booking_requests FOR SELECT TO authenticated
USING (true);

-- 3. Verify table is in publication
-- (This should already be done based on your earlier error)
```

## Testing

### After making the change:

1. **Restart driver app:**
   ```bash
   cd path/to/gadi-driver-pannel
   ng serve
   ```

2. **Check driver app console:**
   - Should see: `✅ Subscribed to booking_requests topic (broadcast mode)`

3. **Create booking from customer app:**
   - Go to customer app (localhost:5173)
   - Search for trucks
   - Click "DISPATCH" or "SEND TO ALL DRIVERS"

4. **Check driver app:**
   - Should see: `📢 Booking broadcast received: {...}`
   - Should see: `✅ New booking added: <booking-id>`
   - New booking card should appear in UI

## Troubleshooting

### Driver app shows "Channel error"
- **Cause:** RLS policies not allowing subscription
- **Fix:** Run the RLS policy SQL from `FIXED_setup_realtime_trigger.sql`

### No broadcasts received
- **Cause:** Trigger not created or not firing
- **Fix:** Verify trigger exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'booking_requests_broadcast';
  ```

### "postgres_changes" still not working
- **Cause:** Table not properly configured for realtime
- **Fix:** Use Option 1 (update to broadcast mode) - this is more reliable

## Recommended Approach

**Use Option 1** - Update the driver app to use `broadcast` mode. This is:
- ✅ More reliable
- ✅ Works with the DB trigger we created
- ✅ Matches the customer app implementation
- ✅ Better performance (direct pg_notify)

The updated code is in: `driver-app-integration/UPDATED_subscribeToBookingRequests.ts`
