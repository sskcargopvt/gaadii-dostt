-- FIX CHANNEL ERROR - CORRECTED VERSION
-- Run this in Supabase SQL Editor

-- 1. Enable Realtime for the table
-- We use a simple command. If it errors saying "already exists", that is FINE.
ALTER PUBLICATION supabase_realtime ADD TABLE booking_requests;

-- 2. CRITICAL FIX: Allow public access to booking_requests (for testing)
-- This allows anyone to read the table, which fixes the RLS issue
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public access to booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON booking_requests;
DROP POLICY IF EXISTS "Enable insert access for all users" ON booking_requests;
DROP POLICY IF EXISTS "Enable update access for all users" ON booking_requests;

-- Create OPEN policy for testing (Allows everything)
CREATE POLICY "Enable ALL access for all users"
ON booking_requests
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 3. Fix Realtime Policies
-- This allows anyone to subscribe to the realtime channel
DROP POLICY IF EXISTS "Allow realtime access" ON realtime.messages;

CREATE POLICY "Allow realtime access"
ON realtime.messages
FOR SELECT
TO public
USING (true);

-- 4. Verify Trigger Function Exists
CREATE OR REPLACE FUNCTION broadcast_booking_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    payload := jsonb_build_object('type', TG_OP, 'old', row_to_json(OLD));
  ELSE
    payload := jsonb_build_object('type', TG_OP, 'new', row_to_json(NEW), 'old', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END);
  END IF;
  
  -- Broadcast to 'booking_requests' topic
  PERFORM pg_notify('booking_requests', payload::text);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Re-create Trigger
DROP TRIGGER IF EXISTS booking_requests_broadcast ON booking_requests;
CREATE TRIGGER booking_requests_broadcast
AFTER INSERT OR UPDATE OR DELETE ON booking_requests
FOR EACH ROW EXECUTE FUNCTION broadcast_booking_changes();
