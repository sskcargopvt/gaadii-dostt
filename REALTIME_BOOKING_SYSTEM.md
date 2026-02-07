# Real-Time Booking & Bidding System

## Overview
Your customer app now has a **real-time bidding system** that automatically sends booking requests to your admin app and instantly reflects status updates (accept/reject/bargaining) using Supabase real-time subscriptions.

## How It Works

### 1. **Finding Nearby Trucks (50km Radius)**
- Customer enters pickup/drop locations
- System searches for vehicles within 50km radius
- Shows list of available trucks with distance, price, and driver info

### 2. **Sending Booking Requests**

#### Option A: Individual Truck Request
- Click **"DISPATCH"** on any truck card
- Creates a single booking request in `booking_requests` table
- Admin app receives notification instantly via Supabase realtime

#### Option B: Broadcast to All Trucks
- Click **"SEND TO ALL DRIVERS"** button
- Sends booking request to ALL nearby trucks simultaneously
- Each driver in admin app sees the request
- First to accept wins the booking

### 3. **Real-Time Status Updates**

The customer app **automatically listens** for changes from the admin app:

```typescript
// Supabase Realtime Subscription
supabase
  .channel('booking-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'booking_requests',
    filter: `id=eq.${bookingId}`
  }, (payload) => {
    // Instantly update UI when admin accepts/rejects/counters
  })
```

### 4. **Status Indicators**

Customer sees real-time status badges:

| Status | Badge | Meaning |
|--------|-------|---------|
| `pending` | 🔵 ⏳ WAITING FOR DRIVER | Request sent, awaiting response |
| `accepted` | 🟢 ✓ DRIVER ACCEPTED | Driver confirmed the booking |
| `rejected` | 🔴 ✗ DRIVER DECLINED | Driver rejected the request |
| `bargaining` | 🟡 💬 NEGOTIATING PRICE | Driver sent counter-offer |

### 5. **Counter-Offer/Bargaining**

When driver sends a counter-offer from admin app:
- Status changes to `bargaining`
- Counter price displays: "Counter: ₹25,000"
- Customer can accept/reject via chat
- All updates happen in real-time

### 6. **Driver Chat**

- Real-time messaging between customer and driver
- Messages stored in `booking_requests.messages` (JSONB array)
- Both apps see messages instantly
- Used for negotiation, updates, and coordination

## Database Schema Required

### `booking_requests` Table

```sql
CREATE TABLE booking_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT,
  customer_phone TEXT,
  pickup_location TEXT,
  drop_location TEXT,
  pickup_lat FLOAT,
  pickup_lng FLOAT,
  drop_lat FLOAT,
  drop_lng FLOAT,
  goods_type TEXT,
  weight TEXT,
  offered_price TEXT,
  counter_offer TEXT,
  status TEXT, -- 'pending', 'accepted', 'rejected', 'bargaining', 'completed'
  vehicle_id UUID REFERENCES vehicles(id),
  driver_response TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enable Realtime

```sql
-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE booking_requests;
```

## Admin App Integration

Your admin app should:

1. **Listen for new booking requests:**
```javascript
supabase
  .channel('new-bookings')
  .on('postgres_changes', {
    event: 'INSERT',
    table: 'booking_requests'
  }, (payload) => {
    // Show notification to driver
    // Display booking request details
  })
  .subscribe();
```

2. **Update status when driver responds:**
```javascript
// Accept booking
await supabase
  .from('booking_requests')
  .update({ 
    status: 'accepted',
    driver_response: 'Confirmed for pickup at 2 PM'
  })
  .eq('id', bookingId);

// Counter-offer
await supabase
  .from('booking_requests')
  .update({ 
    status: 'bargaining',
    counter_offer: '28000'
  })
  .eq('id', bookingId);

// Reject
await supabase
  .from('booking_requests')
  .update({ status: 'rejected' })
  .eq('id', bookingId);
```

3. **Send messages:**
```javascript
const newMsg = { 
  sender: 'driver', 
  text: 'I can pick up at 3 PM', 
  time: new Date().toISOString() 
};

const { data } = await supabase
  .from('booking_requests')
  .select('messages')
  .eq('id', bookingId)
  .single();

const updated = [...(data.messages || []), newMsg];

await supabase
  .from('booking_requests')
  .update({ messages: updated })
  .eq('id', bookingId);
```

## User Flow Example

1. **Customer searches for trucks** → Finds 5 trucks within 50km
2. **Customer clicks "SEND TO ALL DRIVERS"** → 5 booking requests created
3. **Admin app shows 5 notifications** → Each driver sees the request
4. **Driver 1 sends counter-offer** → Status: `bargaining`, Counter: ₹26,000
5. **Customer sees update instantly** → Badge shows "💬 NEGOTIATING PRICE"
6. **Customer accepts via chat** → "OK, ₹26,000 is fine"
7. **Driver confirms** → Status: `accepted`
8. **Customer sees** → Badge shows "✓ DRIVER ACCEPTED"
9. **Trip begins** → GPS tracking starts

## Testing

1. Open customer app: `http://localhost:5173/booking`
2. Search for trucks
3. Click "SEND TO ALL DRIVERS"
4. Open admin app (connected to same Supabase)
5. Update status from admin app
6. Watch customer app update in real-time! ✨

## Benefits

✅ **Instant notifications** - No polling, pure real-time
✅ **Competitive bidding** - Multiple drivers can respond
✅ **Price negotiation** - Built-in bargaining system
✅ **Live chat** - Direct customer-driver communication
✅ **Scalable** - Supabase handles all real-time infrastructure
✅ **No additional backend** - Everything through Supabase
