# Real-Time Booking System Setup Guide

## ✅ What's Been Implemented

Your customer app now uses **broadcast-based realtime** that works with your DB trigger setup.

### Customer App (This App)
- ✅ Subscribes to `booking:<bookingId>` topic for real-time updates
- ✅ Receives instant notifications when driver accepts/rejects/counters
- ✅ Shows live status badges (pending/accepted/rejected/bargaining)
- ✅ Displays counter-offers from drivers
- ✅ Real-time chat with drivers

### Files Created
1. **`database/booking_broadcast_trigger.sql`** - DB trigger to broadcast changes
2. **`admin-components/DriverRequestsList.tsx`** - Admin portal component
3. **This guide** - Setup instructions

---

## 🚀 Setup Steps

### Step 1: Run the Database Trigger Script

Open your Supabase SQL Editor and run the entire content of:
```
database/booking_broadcast_trigger.sql
```

This will:
- Create the `broadcast_booking_changes()` function
- Set up triggers on `booking_requests` table
- Configure RLS policies for realtime access
- Enable broadcasts to both global (`booking_requests`) and per-booking (`booking:<id>`) topics

### Step 2: Verify Database Columns

Ensure your `booking_requests` table has these columns:

```sql
-- Check existing columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'booking_requests';

-- Add missing columns if needed
ALTER TABLE booking_requests 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS counter_offer TEXT,
ADD COLUMN IF NOT EXISTS driver_response TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
```

### Step 3: Test the Customer App

1. Open: `http://localhost:5173/booking`
2. Search for trucks (within 50km)
3. Click **"DISPATCH"** on any truck
4. Watch the console for: `✅ Subscribed to booking updates: booking:<id>`

### Step 4: Set Up Your Admin App

Copy `admin-components/DriverRequestsList.tsx` to your admin app and use it:

```tsx
import DriverRequestsList from './components/DriverRequestsList';

function AdminDashboard() {
  return (
    <div>
      <h1>Driver Portal</h1>
      <DriverRequestsList />
    </div>
  );
}
```

### Step 5: Test End-to-End

**From Customer App:**
1. Create a booking request
2. Watch console: Should see "✅ Subscribed to booking updates"

**From Admin App:**
1. Should see new request appear instantly
2. Click "ACCEPT" or "COUNTER-OFFER"

**Back to Customer App:**
3. Status badge should update in real-time!
4. No page refresh needed

---

## 📡 How It Works

### Topic Structure

| Topic | Purpose | Who Subscribes |
|-------|---------|----------------|
| `booking_requests` | Global feed of all bookings | Admin/Driver portal |
| `booking:<id>` | Specific booking updates | Customer + assigned driver |

### Data Flow

```
Customer creates booking
    ↓
INSERT into booking_requests
    ↓
DB Trigger fires
    ↓
Broadcasts to:
  - booking_requests (global)
  - booking:<id> (per-booking)
    ↓
Admin app receives on 'booking_requests'
Driver updates status
    ↓
UPDATE booking_requests
    ↓
DB Trigger fires again
    ↓
Customer receives on 'booking:<id>'
    ↓
UI updates instantly! ✨
```

### Payload Structure

The DB trigger sends:

```javascript
{
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  new: { /* full row data */ },
  new_row: { /* same as new */ },
  old: { /* previous row data (UPDATE/DELETE only) */ }
}
```

Your app normalizes this:
```typescript
const updated = payload.new ?? payload.new_row ?? payload.payload;
```

---

## 🔐 Authentication & RLS

### Required Setup

1. **Users must be authenticated** before subscribing
2. **JWT must contain role claim** (`role: 'driver'` or `role: 'admin'`)
3. **RLS policies** allow:
   - Drivers to read `booking_requests` topic
   - Customers to read their own `booking:<id>` topics
   - Admins to read everything

### Check Your Auth

```javascript
// Verify user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
console.log('Role:', user?.user_metadata?.role);
```

If not authenticated, the subscription will fail silently.

---

## 🧪 Testing & Debugging

### Test the Trigger

```sql
-- Insert a test booking
INSERT INTO booking_requests (
  customer_id, 
  pickup_location, 
  drop_location, 
  status
) VALUES (
  auth.uid(), 
  'Test Pickup', 
  'Test Drop', 
  'pending'
);

-- Update it
UPDATE booking_requests 
SET status = 'accepted' 
WHERE id = '<your-test-id>';
```

Watch your console - you should see broadcasts!

### Common Issues

**❌ Not receiving broadcasts?**
- Check: User is authenticated (`supabase.auth.getUser()`)
- Check: Channel status is `SUBSCRIBED` (not `CHANNEL_ERROR`)
- Check: RLS policies allow SELECT on `realtime.messages`
- Check: DB trigger exists (`SELECT * FROM pg_trigger WHERE tgname = 'booking_requests_broadcast'`)

**❌ Payload is empty?**
- Check: Trigger function uses `row_to_json(NEW)`
- Check: Your normalization code handles all payload formats
- Add: `console.log('Raw payload:', payload)` to debug

**❌ Admin app not seeing requests?**
- Check: Subscribed to `booking_requests` (not `booking:<id>`)
- Check: User has `role: 'driver'` or `role: 'admin'` in JWT
- Check: RLS policy allows driver role to read global topic

---

## 📱 Admin App Functions

### Accept Booking
```typescript
await supabase
  .from('booking_requests')
  .update({ 
    status: 'accepted',
    driver_id: currentUserId,
    driver_response: 'Confirmed!'
  })
  .eq('id', bookingId);
```

### Send Counter-Offer
```typescript
await supabase
  .from('booking_requests')
  .update({ 
    status: 'bargaining',
    counter_offer: '26000',
    driver_response: 'I can do it for ₹26,000'
  })
  .eq('id', bookingId);
```

### Reject Booking
```typescript
await supabase
  .from('booking_requests')
  .update({ 
    status: 'rejected',
    driver_response: 'Not available'
  })
  .eq('id', bookingId);
```

Customer app will receive these updates **instantly**!

---

## 🎯 Next Steps

1. ✅ Run `database/booking_broadcast_trigger.sql` in Supabase
2. ✅ Add missing columns to `booking_requests`
3. ✅ Test customer app booking flow
4. ✅ Integrate `DriverRequestsList.tsx` in admin app
5. ✅ Test end-to-end: customer → driver → customer

---

## 💡 Tips

- **Desktop notifications**: Admin component requests notification permission
- **Sound alerts**: Add audio when new request arrives
- **Auto-refresh**: No polling needed - pure real-time!
- **Scalable**: Supabase handles all the infrastructure
- **Offline resilience**: Subscriptions auto-reconnect

---

## 📞 Support

If you encounter issues:
1. Check browser console for subscription status
2. Verify DB trigger exists and is enabled
3. Test with SQL directly before testing via app
4. Ensure RLS policies are correct

Your real-time booking system is ready! 🚀
