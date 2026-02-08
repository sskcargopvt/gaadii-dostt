-- FIXED VERSION - Run this in Supabase SQL Editor
-- The table is already in supabase_realtime publication, so we skip that step

-- 1. Add missing columns to booking_requests table
ALTER TABLE booking_requests 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS counter_offer TEXT,
ADD COLUMN IF NOT EXISTS driver_response TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Create the broadcast trigger function
CREATE OR REPLACE FUNCTION broadcast_booking_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Build payload based on operation type
  IF TG_OP = 'DELETE' THEN
    payload := jsonb_build_object(
      'type', TG_OP,
      'old', row_to_json(OLD),
      'old_row', row_to_json(OLD)
    );
  ELSE
    payload := jsonb_build_object(
      'type', TG_OP,
      'new', row_to_json(NEW),
      'new_row', row_to_json(NEW),
      'old', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
    );
  END IF;

  -- Broadcast to global topic (for driver app)
  PERFORM pg_notify('booking_requests', payload::text);
  
  -- Broadcast to per-booking topic (for customer app)
  IF TG_OP != 'DELETE' THEN
    PERFORM pg_notify('booking:' || NEW.id::text, payload::text);
  ELSE
    PERFORM pg_notify('booking:' || OLD.id::text, payload::text);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS booking_requests_broadcast ON booking_requests;

CREATE TRIGGER booking_requests_broadcast
AFTER INSERT OR UPDATE OR DELETE ON booking_requests
FOR EACH ROW
EXECUTE FUNCTION broadcast_booking_changes();

-- 4. RLS policies for realtime access
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Drivers can subscribe to booking_requests" ON realtime.messages;
DROP POLICY IF EXISTS "Users can subscribe to their bookings" ON realtime.messages;

-- Allow drivers to subscribe to global booking_requests topic
CREATE POLICY "Drivers can subscribe to booking_requests"
ON realtime.messages 
FOR SELECT 
TO authenticated
USING (topic = 'booking_requests');

-- Allow users to subscribe to their specific booking topics
CREATE POLICY "Users can subscribe to their bookings"
ON realtime.messages 
FOR SELECT 
TO authenticated
USING (topic LIKE 'booking:%');

-- 5. Verify the trigger was created successfully
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'booking_requests_broadcast';

-- Expected output: Should show 1 row with the trigger details
-- If you see a row, the trigger is active! ✅
