-- VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'booking_requests_broadcast';
-- Expected: Should return 1 row

-- 2. Check if trigger function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'broadcast_booking_changes';
-- Expected: Should return 1 row showing 'FUNCTION'

-- 3. Check if required columns exist
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'booking_requests'
  AND column_name IN ('customer_id', 'driver_id', 'counter_offer', 'driver_response', 'messages', 'updated_at');
-- Expected: Should return 6 rows

-- 4. Check RLS policies
SELECT 
  policyname,
  tablename,
  cmd
FROM pg_policies
WHERE tablename = 'messages' AND schemaname = 'realtime';
-- Expected: Should return 2 rows (one for drivers, one for users)

-- 5. Test the trigger manually
-- Insert a test booking
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
  'Test Customer',
  '1234567890',
  'Test Pickup Location',
  'Test Drop Location',
  28.6274,
  77.3725,
  28.4744,
  77.5030,
  'Test Goods',
  '100kg',
  '5000',
  'pending'
) RETURNING id, customer_name, status;
-- Expected: Should return the inserted row
-- The trigger should fire automatically

-- 6. Check if table is in realtime publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'booking_requests';
-- Expected: Should return 1 row
