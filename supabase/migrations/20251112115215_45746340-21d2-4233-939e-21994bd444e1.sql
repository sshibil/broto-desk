-- Fix ambiguous column reference in generate_complaint_code function
CREATE OR REPLACE FUNCTION public.generate_complaint_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year TEXT := TO_CHAR(now(), 'YYYY');
  seq BIGINT;
  code TEXT;
BEGIN
  -- Explicitly qualify code column with table name to avoid ambiguity
  SELECT COALESCE(MAX(CAST(SUBSTRING(complaints.code FROM 9) AS BIGINT)), 0) + 1
  INTO seq
  FROM complaints
  WHERE complaints.code LIKE 'BR-' || year || '-%';
  
  code := 'BR-' || year || '-' || LPAD(seq::TEXT, 6, '0');
  RETURN code;
END;
$$;