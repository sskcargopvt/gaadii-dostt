-- 🚨 FIX: "invalid input syntax for type uuid"
-- The Driver App sends 'unknown-driver' string if not logged in.
-- But the database expects a UUID.
-- This script changes the column to TEXT so it works!

BEGIN;

-- 1. Remove the Foreign Key Constraint (to allow non-user IDs)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_requests_driver_id_fkey') THEN
    ALTER TABLE public.booking_requests DROP CONSTRAINT booking_requests_driver_id_fkey;
  END IF;
END $$;

-- 2. Change column type from UUID to TEXT
ALTER TABLE public.booking_requests 
  ALTER COLUMN driver_id DROP DEFAULT,
  ALTER COLUMN driver_id TYPE text;

-- 3. Ensure UPDATE permission is granted to EVERYONE
DROP POLICY IF EXISTS "Enable ALL access for all users" ON public.booking_requests;
CREATE POLICY "Enable ALL access for all users"
ON public.booking_requests
FOR ALL
TO public
USING (true)
WITH CHECK (true);

COMMIT;
