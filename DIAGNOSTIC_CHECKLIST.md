# 🔍 Real-Time Connectivity Diagnostic

## Step 1: Check Database Trigger

**Run this in Supabase SQL Editor:**

```sql
-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'booking_requests_broadcast';
```

**Expected Result:** 1 row showing the trigger

**If empty:** The SQL script wasn't run successfully. Run `FIXED_setup_realtime_trigger.sql` again.

---

## Step 2: Test Customer App

**Open:** http://localhost:5173/booking

**Create a test booking:**
1. Search for trucks
2. Click "DISPATCH" on any truck

**Check browser console (F12):**

**Should see:**
```
✅ Booking created: <uuid>
✅ Subscribed to booking updates: booking:<uuid>
```

**If you DON'T see these messages:**
- Customer app is not creating bookings
- Check for JavaScript errors in console

---

## Step 3: Verify Booking in Database

**Run in Supabase SQL Editor:**

```sql
SELECT id, customer_name, pickup_location, status, created_at
FROM booking_requests
ORDER BY created_at DESC
LIMIT 3;
```

**Expected:** Should see your test booking(s)

**If empty:** Customer app is NOT inserting into database
- Check Supabase credentials
- Check for errors in customer app console

---

## Step 4: Test Trigger Manually

**Run in Supabase SQL Editor:**

```sql
-- Insert a test booking to trigger the broadcast
INSERT INTO booking_requests (
  customer_name,
  customer_phone,
  pickup_location,
  drop_location,
  pickup_lat,
  pickup_lng,
  drop_lat,
  drop_lng,
  goods_type,
  weight,
  offered_price,
  status
) VALUES (
  'TEST CUSTOMER',
  '9999999999',
  'Test Pickup',
  'Test Drop',
  28.6274,
  77.3725,
  28.4744,
  77.5030,
  'Test Goods',
  '100',
  '5000',
  'pending'
) RETURNING id;
```

**After running this:**
- Check driver app console
- Should see: `📢 Booking broadcast received`
- If you see this, the trigger works!
- If you DON'T see this, the driver app is not subscribed correctly

---

## Step 5: Check Driver App Console

**Open:** http://localhost:4200

**Check browser console (F12):**

**Should see ONE of these:**

### ✅ GOOD - Using Broadcast:
```
✅ Subscribed to booking_requests topic (broadcast mode)
```

### ❌ BAD - Still using postgres_changes:
```
✅ Subscribed to real-time booking_requests
```

**If you see the BAD message:**
- You haven't updated the driver app code yet
- The driver app is still using `postgres_changes`
- You MUST change it to `broadcast`

---

## Step 6: Check for Errors

**In driver app console, look for:**

### ❌ Channel Error:
```
❌ Channel error - check RLS policies
```
**Fix:** Make sure you're logged in to driver app

### ❌ No subscription message at all:
**Fix:** Driver app is not calling `subscribeToBookingRequests()`

---

## 🎯 Most Common Issues

### Issue 1: SQL Script Not Run
**Symptom:** Step 1 returns no rows
**Fix:** Run `database/FIXED_setup_realtime_trigger.sql` in Supabase

### Issue 2: Driver App Not Updated
**Symptom:** Driver app console shows "Subscribed to real-time booking_requests" (without "broadcast mode")
**Fix:** Update `subscribeToBookingRequests()` method to use `broadcast` instead of `postgres_changes`

### Issue 3: Not Logged In
**Symptom:** Channel error in driver app
**Fix:** Log in to driver app

### Issue 4: Wrong Supabase Credentials
**Symptom:** Customer app can't create bookings
**Fix:** Check both apps use same Supabase URL and key

---

## 📊 Results Table

Fill this out and tell me the results:

| Step | Expected | Your Result | ✅/❌ |
|------|----------|-------------|-------|
| 1. Trigger exists | 1 row | ? | ? |
| 2. Customer creates booking | "✅ Booking created" | ? | ? |
| 3. Booking in database | 1+ rows | ? | ? |
| 4. Manual trigger test | "📢 Broadcast received" | ? | ? |
| 5. Driver app subscription | "broadcast mode" | ? | ? |
| 6. No errors | No errors | ? | ? |

---

## 🆘 Tell Me:

1. **Which step fails?** (1-6)
2. **What do you see in customer app console?**
3. **What do you see in driver app console?**
4. **Did you update the driver app code?** (Yes/No)
5. **Did you run the SQL script?** (Yes/No)

This will help me pinpoint the exact issue!
