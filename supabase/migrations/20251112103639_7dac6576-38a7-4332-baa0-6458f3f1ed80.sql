-- Fix security linter warnings: Add search_path to functions

-- Fix generate_complaint_code function
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
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 9) AS BIGINT)), 0) + 1
  INTO seq
  FROM complaints
  WHERE code LIKE 'BR-' || year || '-%';
  
  code := 'BR-' || year || '-' || LPAD(seq::TEXT, 6, '0');
  RETURN code;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix set_complaint_defaults function
CREATE OR REPLACE FUNCTION public.set_complaint_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  sla_record RECORD;
BEGIN
  -- Generate code if not set
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_complaint_code();
  END IF;
  
  -- Set SLA deadlines based on priority
  SELECT * INTO sla_record FROM sla_policies WHERE priority = NEW.priority;
  
  IF FOUND THEN
    NEW.sla_due_first_response_at := NEW.created_at + (sla_record.time_to_first_response_minutes || ' minutes')::INTERVAL;
    NEW.sla_due_resolution_at := NEW.created_at + (sla_record.time_to_resolution_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix check_sla_breach function
CREATE OR REPLACE FUNCTION public.check_sla_breach()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check if first response SLA is breached
  IF NEW.first_response_at IS NULL AND now() > NEW.sla_due_first_response_at THEN
    NEW.is_sla_breached := TRUE;
  END IF;
  
  -- Check if resolution SLA is breached
  IF NEW.status NOT IN ('RESOLVED', 'CLOSED') AND now() > NEW.sla_due_resolution_at THEN
    NEW.is_sla_breached := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$;