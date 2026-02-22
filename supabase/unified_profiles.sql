-- ─────────────────────────────────────────────────────────────────────────────
-- UNIFIED USER PROFILES SCHEMA
-- This script creates a central profiles table and role-specific extensions.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. CENTRAL PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name    TEXT,
  email        TEXT,
  phone        TEXT,
  role         TEXT CHECK (role IN ('customer', 'driver', 'mechanic', 'admin')),
  address      TEXT,
  city         TEXT,
  state        TEXT,
  pincode      TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. CUSTOMER PROFILES EXTENSION
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id            UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. ENSURE DRIVER & MECHANIC TABLES ALIGN (IF THEY ALREADY EXIST)
-- Note: driver_profiles and mechanic_profiles likely already exist from previous steps.
-- We ensure they reference public.profiles(id) for consistency.

-- 4. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can manage their own
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Customer Profiles: Users can manage their own
CREATE POLICY "Customers can manage own profile extension" ON public.customer_profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. TRIGGER FOR AUTOMATIC PROFILE CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone, address, city, state, pincode)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'pincode'
  );

  -- If customer, also create entry in customer_profiles
  IF (NEW.raw_user_meta_data->>'role' = 'customer') THEN
    INSERT INTO public.customer_profiles (id, business_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'business_name');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. UPDATED_AT HELPER (IF NOT ALREADY CREATED)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_customer_profiles_updated_at BEFORE UPDATE ON public.customer_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
