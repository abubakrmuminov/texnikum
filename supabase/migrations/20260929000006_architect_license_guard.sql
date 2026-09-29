-- =============================================================================
-- Migration: 20260929000006_architect_license_guard.sql
-- Description: Platform Architectural License & Integrity Guard (Layer 2)
-- Lead Architect: Abubakr Muminov (https://github.com/abubakrmuminov)
-- Legal Reference: OʻRQ-42 (Mualliflik huquqi) hamda OʻRQ-637
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.system_architect_license (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  architect_signature VARCHAR(64) NOT NULL UNIQUE,
  architect_name VARCHAR(255) NOT NULL,
  architect_github VARCHAR(255) NOT NULL,
  license_type VARCHAR(100) NOT NULL DEFAULT 'PROPRIETARY_ALL_RIGHTS_RESERVED',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{"project": "Fargʻona 2-son texnikumi portali", "law": "OʻRQ-42", "architect": "Abubakr Muminov"}'::jsonb
);

COMMENT ON TABLE public.system_architect_license IS 'Platform author license registry and cryptographic integrity verification';

-- Enable Row Level Security
ALTER TABLE public.system_architect_license ENABLE ROW LEVEL SECURITY;

-- 1. Read access for verification
CREATE POLICY "Public read platform architect license"
  ON public.system_architect_license
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Prevent tampering: denial of public insert/update/delete
CREATE POLICY "Deny unauthorized modification of license"
  ON public.system_architect_license
  FOR ALL
  TO public
  USING (false);

-- 3. Seed primary platform architect record
INSERT INTO public.system_architect_license (
  architect_signature,
  architect_name,
  architect_github,
  license_type,
  is_active
)
VALUES (
  'sig_80a5b2eb',
  'Abubakr Muminov',
  'https://github.com/abubakrmuminov',
  'PROPRIETARY_ALL_RIGHTS_RESERVED',
  TRUE
)
ON CONFLICT (architect_signature) DO UPDATE 
SET is_active = TRUE,
    verified_at = NOW();

-- 4. Cryptographic Database Stored Function
CREATE OR REPLACE FUNCTION public.verify_platform_architect_license(p_sig TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.system_architect_license
    WHERE architect_signature = p_sig 
      AND is_active = TRUE
  );
END;
$$;
