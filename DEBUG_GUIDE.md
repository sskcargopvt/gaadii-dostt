# 🔧 Debugging: No Requests Reaching Driver App

## Step-by-Step Debugging

### ✅ Step 1: Verify Database Setup

Run `database/VERIFY_SETUP.sql` in Supabase SQL Editor.

**Expected Results:**
1. Trigger exists: ✅ 1 row
2. Function exists: ✅ 1 row  
3. Columns exist: ✅ 6 rows
4. RLS policies: ✅ 2 rows
5. Test insert: ✅ Returns booking ID
6. Publication: ✅ 1 row

**If any fail:** Re-run `database/FIXED_setup_realtime_trigger.sql`

---

### ✅ Step 2: Check Customer App Console

**Open customer app:** http://localhost:5173/booking

**Create a booking and check browser console:**

**Expected logs:**
```
✅ Booking created: <uuid>
✅ Subscribed to booking updates: booking:<uuid>
```

**If you don't see these:**
- Customer app is not creating bookings correctly
- Check for errors in console

---

### ✅ Step 3: Verify Booking in Database

**Run in Supabase SQL Editor:**
```sql
SELECT 
  id,
  customer_name,
  pickup_location,
  drop_location,
  status,
  created_at
FROM booking_requests
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** Should see your test bookings

**If empty:** Customer app is not inserting into database

---

### ✅ Step 4: Check Driver App Setup

**Questions:**

1. **Did you update the driver app code?**
   - File: `gadi-driver-pannel/src/services/supabase.service.ts`
   - Changed `postgres_changes` to `broadcast`?
   - ❌ NO → This is the problem! See fix below
   - ✅ YES → Continue to next step

2. **Is driver app running?**
   ```bash
   cd path/to/gadi-driver-pannel
   ng serve
   ```
   - Should be on http://localhost:4200

3. **Are you logged in to driver app?**
   - Real-time subscriptions require authentication

---

### ✅ Step 5: Check Driver App Console

**Open driver app:** http://localhost:4200

**Check browser console for:**

**Expected logs:**
```
✅ Subscribed to booking_requests topic (broadcast mode)
```

**OR (if using old code):**
```
✅ Subscribed to real-time booking_requests
```

**If you see:**
```
❌ Channel error
```
**Problem:** RLS policies not allowing subscription
**Fix:** Re-run RLS policy section from SQL script

**If you see nothing:**
- Driver app is not calling `subscribeToBookingRequests()`
- Check if component is calling it in `ngOnInit()`

---

### ✅ Step 6: Test the Trigger Manually

**Run in Supabase SQL Editor:**
```sql
-- Update an existing booking to trigger broadcast
UPDATE booking_requests
SET status = 'test_update'
WHERE id = (
  SELECT id FROM booking_requests 
  ORDER BY created_at DESC 
  LIMIT 1
);
```

**Check driver app console:**
- Should see: `📢 Booking broadcast received: {...}`

**If nothing appears:**
- Trigger is not firing OR
- Driver app is not subscribed correctly

---

## 🚨 Most Common Issues

### Issue 1: Driver App Still Using `postgres_changes`

**Symptom:** No broadcasts received

**Fix:** Update `src/services/supabase.service.ts` in driver app

**Find (around line 115):**
```typescript
this.bookingChannel = this.supabase.channel('public:booking_requests')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, (payload) => {
```

**Replace with:**
```typescript
const topic = 'booking_requests';
this.bookingChannel = this.supabase.channel(topic, { config: { private: true } })
  .on('broadcast', { event: '*' }, (payload: any) => {
    console.log('📢 Booking broadcast received:', payload);
    
    const type = payload.type || payload.event;
    const newRow = payload.new ?? payload.new_row ?? payload.payload;
    const oldRow = payload.old ?? payload.old_row;

    if (type === 'INSERT' && newRow) {
```

**Then restart driver app:**
```bash
# Stop the server (Ctrl+C)
ng serve
```

---

### Issue 2: Driver App Not Calling Subscribe

**Check:** `src/components/driver-dashboard.component.ts`

**In `ngOnInit()` should have:**
```typescript
ngOnInit() {
  // ... other code ...
  this.supabase.subscribeToBookingRequests();
  // OR
  this.supabase.subscribeToBookings();
}
```

---

### Issue 3: Not Authenticated

**Symptom:** Channel error or no subscription

**Fix:** Make sure you're logged in to driver app

---

### Issue 4: Wrong Supabase Credentials

**Check:** `src/services/supabase.service.ts` in driver app

**Should have:**
```typescript
const SUPABASE_URL = 'https://tstboympleybwbdwicik.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdGJveW1wbGV5YndiZHdpY2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDg0OTcsImV4cCI6MjA4NDIyNDQ5N30.JQZFd3z4yrVeUHG66Pe_FGFnupoG6JfguEP8auY-qUE';
```

**Must match customer app credentials!**

---

## 🎯 Quick Test

**Run this complete test:**

1. **Customer app (localhost:5173):**
   - Create booking
   - Console: `✅ Booking created: abc-123`

2. **Supabase Dashboard:**
   - Go to Table Editor → booking_requests
   - Should see new row

3. **Driver app (localhost:4200):**
   - Console: `📢 Booking broadcast received`
   - UI: New booking card appears

**If step 1 works but step 3 doesn't:**
- Problem is in driver app subscription
- Update to use `broadcast` mode

**If step 1 doesn't work:**
- Problem is in customer app
- Check BookingSection.tsx `handleBook` function

---

## 📞 Next Steps

**Please run `VERIFY_SETUP.sql` and tell me:**

1. How many rows returned for each query?
2. Any errors?
3. What do you see in driver app console?
4. Did you update driver app to use `broadcast`?

This will help me pinpoint the exact issue!
