-- ============================================================================
-- Fix record_product_interaction Function
-- ============================================================================
-- The previous migration created a function with wrong signature.
-- This drops both versions and recreates with correct signature + search_path.

-- Drop wrong signature from migration 032
DROP FUNCTION IF EXISTS record_product_interaction(VARCHAR, VARCHAR, UUID, VARCHAR, JSONB);

-- Drop original signature to recreate with search_path
DROP FUNCTION IF EXISTS record_product_interaction(TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT);

-- Recreate with exact signature from migration 025 + SET search_path
CREATE OR REPLACE FUNCTION record_product_interaction(
  p_product_id TEXT,
  p_interaction_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_variant_id TEXT DEFAULT NULL,
  p_source_page TEXT DEFAULT NULL,
  p_referrer_product_id TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO product_interactions (
    product_id,
    interaction_type,
    user_id,
    session_id,
    variant_id,
    source_page,
    referrer_product_id
  ) VALUES (
    p_product_id,
    p_interaction_type,
    p_user_id,
    p_session_id,
    p_variant_id,
    p_source_page,
    p_referrer_product_id
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
