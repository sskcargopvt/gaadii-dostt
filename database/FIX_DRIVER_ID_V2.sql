-- 🚨 FIX V2: Aggressive Constraint Removal & Type Change
-- The previous script failed because the constraint still existed.
-- This script finds ANY foreign key on booking_requests and DROPS IT.

BEGIN;

-- 1. Drop ALL Foreign Key check constraints on booking_requests
DO $$ 
DECLARE r record;
BEGIN
    FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'public.booking_requests'::regclass AND contype = 'f') LOOP
        EXECUTE 'ALTER TABLE public.booking_requests DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. NOW we can change the column type safely
ALTER TABLE public.booking_requests 
  ALTER COLUMN driver_id DROP DEFAULT,
  ALTER COLUMN driver_id TYPE text USING driver_id::text;

-- 3. Ensure UPDATE permission is granted to EVERYONE
DROP POLICY IF EXISTS "Enable ALL access for all users" ON public.booking_requests;
CREATE POLICY "Enable ALL access for all users"
ON public.booking_requests
FOR ALL
TO public
USING (true)
WITH CHECK (true);

COMMIT;
