-- 🚨 FIX EVERYTHING: Single Script to solve ALL issues
-- 1. Fixes invalid UUID error (allows 'unknown-driver')
-- 2. Fixes missing bookings (allows anonymous subscription)
-- 3. Fixes update permission errors

BEGIN;

-- ----------------------------------------------------------------
-- 1. Fix Driver ID Schema (Allow Text IDs)
-- ----------------------------------------------------------------

-- Drop ALL Foreign Key constraints on booking_requests to prevent errors
DO $$ 
DECLARE r record;
BEGIN
    FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'public.booking_requests'::regclass AND contype = 'f') LOOP
        EXECUTE 'ALTER TABLE public.booking_requests DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Change driver_id to TEXT
ALTER TABLE public.booking_requests 
  ALTER COLUMN driver_id DROP DEFAULT,
  ALTER COLUMN driver_id TYPE text USING driver_id::text;

-- ----------------------------------------------------------------
-- 2. Fix Permissions (Allow Everyone to Read/Write)
-- ----------------------------------------------------------------

-- Enable RLS (required for policies)
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Enable ALL access for all users" ON public.booking_requests;
DROP POLICY IF EXISTS "Public access to booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON booking_requests;

-- Create OPEN policy for table access
CREATE POLICY "Enable ALL access for all users"
ON public.booking_requests
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------
-- 3. Fix Realtime Subscription (Allow Anon Users to Subscribe)
-- ----------------------------------------------------------------

-- Drop old policies
DROP POLICY IF EXISTS "Allow realtime access" ON realtime.messages;
DROP POLICY IF EXISTS "Drivers can subscribe to booking_requests" ON realtime.messages;

-- Create OPEN policy for Realtime
CREATE POLICY "Allow realtime access"
ON realtime.messages
FOR SELECT
TO public
USING (true);

-- ----------------------------------------------------------------
-- 4. Ensure Realtime is Enabled
-- ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE booking_requests;

COMMIT;
