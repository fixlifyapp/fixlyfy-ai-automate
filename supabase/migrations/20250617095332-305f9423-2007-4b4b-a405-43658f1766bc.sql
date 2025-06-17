
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.validate_client_portal_session(text);

-- Create the corrected validate_client_portal_session function
CREATE OR REPLACE FUNCTION public.validate_client_portal_session(p_token text)
RETURNS TABLE(
  user_id uuid,
  client_id text,
  email text,
  name text,
  document_type text,
  document_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cpu.id as user_id,
    cpu.client_id,
    cpu.email,
    cpu.name,
    cps.document_type,
    cps.document_id
  FROM public.client_portal_sessions cps
  JOIN public.client_portal_users cpu ON cps.client_portal_user_id = cpu.id
  WHERE cps.token = p_token 
    AND cps.expires_at > now();
END;
$function$;

-- Fix the generate_client_portal_access function to use correct column name 'token'
CREATE OR REPLACE FUNCTION public.generate_client_portal_access(
  p_client_id text, 
  p_document_type text DEFAULT NULL::text, 
  p_document_id uuid DEFAULT NULL::uuid, 
  p_hours_valid integer DEFAULT 72
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_token TEXT;
  v_client_record RECORD;
  v_portal_user_id UUID;
BEGIN
  -- Get client information
  SELECT * INTO v_client_record FROM public.clients WHERE id = p_client_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client not found';
  END IF;
  
  -- Create or get portal user
  INSERT INTO public.client_portal_users (client_id, email, name)
  VALUES (p_client_id, v_client_record.email, v_client_record.name)
  ON CONFLICT (client_id, email) 
  DO UPDATE SET 
    name = EXCLUDED.name,
    updated_at = now()
  RETURNING id INTO v_portal_user_id;
  
  -- Generate secure token using the correct function
  v_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Clean up expired sessions for this user
  DELETE FROM public.client_portal_sessions 
  WHERE client_portal_user_id = v_portal_user_id 
    AND expires_at < now();
  
  -- Create new session using correct column name 'token'
  INSERT INTO public.client_portal_sessions (
    client_portal_user_id,
    token,
    document_type,
    document_id,
    expires_at
  ) VALUES (
    v_portal_user_id,
    v_token,
    p_document_type,
    p_document_id,
    now() + (p_hours_valid || ' hours')::interval
  );
  
  RETURN v_token;
END;
$function$;
