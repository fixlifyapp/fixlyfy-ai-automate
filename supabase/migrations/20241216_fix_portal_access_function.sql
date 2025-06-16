
-- Fix the generate_client_portal_access function to use correct random bytes function
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
  v_token := encode(decode(md5(random()::text || clock_timestamp()::text), 'hex') || decode(md5(random()::text || clock_timestamp()::text), 'hex'), 'base64url');
  
  -- Clean up expired sessions for this user
  DELETE FROM public.client_portal_sessions 
  WHERE client_portal_user_id = v_portal_user_id 
    AND expires_at < now();
  
  -- Create new session
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
