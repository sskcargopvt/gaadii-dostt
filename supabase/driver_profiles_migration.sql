-- ─────────────────────────────────────────────────────────────────────────────
-- DRIVER PROFILES TABLE
-- Run this in your Supabase SQL Editor to enable the Driver Panel features.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal info
  full_name            TEXT,
  phone                TEXT,
  email                TEXT,
  date_of_birth        DATE,
  address              TEXT,
  city                 TEXT,
  state                TEXT,
  pincode              TEXT,
  experience_years     TEXT,
  profile_photo_url    TEXT,

  -- Vehicle info
  vehicle_type         TEXT,
  vehicle_registration TEXT,
  vehicle_model        TEXT,
  vehicle_year         TEXT,

  -- License
  license_number       TEXT,
  license_expiry       DATE,

  -- Bank details
  bank_account_name    TEXT,
  bank_account_number  TEXT,
  bank_ifsc            TEXT,
  bank_name            TEXT,

  -- Status
  available            BOOLEAN DEFAULT false,
  rating               NUMERIC(3,2) DEFAULT 5.0,
  verified             BOOLEAN DEFAULT false,

  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),

  UNIQUE (driver_id)
);

-- ── Index for fast lookups ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_driver_profiles_driver_id ON public.driver_profiles (driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_available ON public.driver_profiles (available);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_city      ON public.driver_profiles (city);

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

-- Drivers can read/write their own profile
CREATE POLICY "Driver can manage own profile"
  ON public.driver_profiles
  FOR ALL
  USING  (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

-- Admins (role = 'admin') can read all profiles
-- Uses auth.jwt() instead of querying auth.users (avoids permission denied error)
CREATE POLICY "Admins can read all driver profiles"
  ON public.driver_profiles
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── Trigger: auto-update updated_at ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_driver_profiles_updated_at ON public.driver_profiles;
CREATE TRIGGER set_driver_profiles_updated_at
  BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Add driver_id column to booking_requests if missing ────────────────────
-- (so drivers can be assigned to trips)
ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);

-- ── Enable realtime on booking_requests (safe / idempotent) ────────────────
-- Only adds the table if it is not already a member of the publication.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'booking_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;
  END IF;
END $$;
