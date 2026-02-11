-- Test if trigger is working
-- Run this, then check if you see a notification

INSERT INTO booking_requests (
  customer_name,
  customer_phone,
  pickup_location,
  drop_location,
  goods_type,
  weight,
  offered_price,
  status,
  pickup_lat,
  pickup_lng,
  drop_lat,
  drop_lng
) VALUES (
  'Test Customer',
  '9999999999',
  'Test Pickup',
  'Test Drop',
  'FMCG',
  '10',
  25000,
  'pending',
  28.6274,
  77.3725,
  28.4744,
  77.5030
);

-- Check if it was inserted
SELECT * FROM booking_requests ORDER BY created_at DESC LIMIT 1;
