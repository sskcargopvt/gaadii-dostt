-- Database Trigger for Real-Time Booking Broadcasts
-- This trigger broadcasts booking changes to both global and per-booking topics

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION broadcast_booking_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Prepare the payload with the new/old row data
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

  -- Broadcast to global topic (for driver/admin portal)
  PERFORM pg_notify('booking_requests', payload::text);

  -- Broadcast to per-booking topic (for customer and assigned driver)
  IF TG_OP != 'DELETE' THEN
    PERFORM pg_notify('booking:' || NEW.id::text, payload::text);
  ELSE
    PERFORM pg_notify('booking:' || OLD.id::text, payload::text);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger on booking_requests table
DROP TRIGGER IF EXISTS booking_requests_broadcast ON booking_requests;

CREATE TRIGGER booking_requests_broadcast
AFTER INSERT OR UPDATE OR DELETE ON booking_requests
FOR EACH ROW
EXECUTE FUNCTION broadcast_booking_changes();

-- 3. Enable Realtime for the table (if not already enabled)
-- Run this in Supabase SQL Editor or skip if already enabled
-- ALTER PUBLICATION supabase_realtime ADD TABLE booking_requests;

-- 4. Set up RLS policies for realtime.messages
-- Allow authenticated users to subscribe to booking topics

-- Global topic access (for drivers/admins)
CREATE POLICY "Drivers can subscribe to booking_requests topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic = 'booking_requests' 
  AND (auth.jwt() ->> 'role' = 'driver' OR auth.jwt() ->> 'role' = 'admin')
);

-- Per-booking topic access (for customers and assigned drivers)
CREATE POLICY "Users can subscribe to their booking topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'booking:%'
  AND (
    -- Customer can see their own bookings
    (SELECT customer_id FROM booking_requests WHERE id::text = substring(topic from 9)) = auth.uid()
    OR
    -- Driver can see assigned bookings
    (SELECT driver_id FROM booking_requests WHERE id::text = substring(topic from 9)) = auth.uid()
    OR
    -- Admins can see all
    auth.jwt() ->> 'role' = 'admin'
  )
);

-- 5. Test the trigger (optional)
-- INSERT INTO booking_requests (customer_id, status) VALUES (auth.uid(), 'pending');
-- UPDATE booking_requests SET status = 'accepted' WHERE id = 'some-id';
-- Check your subscribed clients to see if they receive the broadcast!
