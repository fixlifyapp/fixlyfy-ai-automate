
-- Remove the duplicate generate_client_login_token function and keep only the updated version
DROP FUNCTION IF EXISTS public.generate_client_login_token(p_email text);

-- Create the single, comprehensive version that handles all cases
CREATE OR REPLACE FUNCTION public.generate_client_login_token(p_email text, p_expiry_hours integer DEFAULT 24)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_token TEXT;
  v_client_exists BOOLEAN;
  v_client_id TEXT;
  v_expiry_interval TEXT;
BEGIN
  -- Check if client exists with this email
  SELECT EXISTS(
    SELECT 1 FROM public.clients WHERE email = p_email
  ), id INTO v_client_exists, v_client_id
  FROM public.clients WHERE email = p_email LIMIT 1;
  
  IF NOT v_client_exists THEN
    RAISE EXCEPTION 'No client found with email: %', p_email;
  END IF;
  
  -- Ensure portal user exists, create if it doesn't
  INSERT INTO public.client_portal_users (email, client_id, is_active)
  VALUES (p_email, v_client_id, true)
  ON CONFLICT (email) DO UPDATE SET 
    updated_at = now(),
    is_active = true,
    client_id = EXCLUDED.client_id
  RETURNING id INTO v_user_id;
  
  -- Generate secure token
  v_token := encode(gen_random_bytes(32), 'base64');
  
  -- Create expiry interval string
  v_expiry_interval := p_expiry_hours || ' hours';
  
  -- Store session with custom expiry
  EXECUTE format('INSERT INTO public.client_portal_sessions (user_id, session_token, expires_at) VALUES ($1, $2, now() + interval %L)', v_expiry_interval)
  USING v_user_id, v_token;
  
  RETURN v_token;
END;
$function$;
