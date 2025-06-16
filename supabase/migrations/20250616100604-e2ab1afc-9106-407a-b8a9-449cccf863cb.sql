
-- Create client portal users table
CREATE TABLE public.client_portal_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, email)
);

-- Create client portal sessions table for magic link authentication
CREATE TABLE public.client_portal_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_portal_user_id UUID NOT NULL REFERENCES public.client_portal_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  document_type TEXT, -- 'estimate', 'invoice', or NULL for general access
  document_id UUID, -- reference to estimate or invoice
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client portal activity logs
CREATE TABLE public.client_portal_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_portal_user_id UUID NOT NULL REFERENCES public.client_portal_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'login', 'view_document', 'make_payment', etc.
  resource_type TEXT, -- 'estimate', 'invoice', 'job', etc.
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_client_portal_sessions_token ON public.client_portal_sessions(token);
CREATE INDEX idx_client_portal_sessions_expires ON public.client_portal_sessions(expires_at);
CREATE INDEX idx_client_portal_activity_logs_user ON public.client_portal_activity_logs(client_portal_user_id);
CREATE INDEX idx_client_portal_activity_logs_created ON public.client_portal_activity_logs(created_at);

-- Enable RLS
ALTER TABLE public.client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for client portal users (accessed via session tokens)
CREATE POLICY "Allow access via valid session" ON public.client_portal_users
  FOR ALL USING (true); -- Access controlled at application level

CREATE POLICY "Allow session access" ON public.client_portal_sessions
  FOR ALL USING (true); -- Access controlled at application level

CREATE POLICY "Allow activity log access" ON public.client_portal_activity_logs
  FOR ALL USING (true); -- Access controlled at application level

-- Function to generate client portal access
CREATE OR REPLACE FUNCTION public.generate_client_portal_access(
  p_client_id TEXT,
  p_document_type TEXT DEFAULT NULL,
  p_document_id UUID DEFAULT NULL,
  p_hours_valid INTEGER DEFAULT 72
) RETURNS TEXT
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
  
  -- Generate secure token
  v_token := encode(gen_random_bytes(32), 'base64url');
  
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

-- Function to validate portal session
CREATE OR REPLACE FUNCTION public.validate_client_portal_session(p_token TEXT)
RETURNS TABLE(
  user_id UUID,
  client_id TEXT,
  email TEXT,
  name TEXT,
  document_type TEXT,
  document_id UUID,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update accessed_at and return session info
  UPDATE public.client_portal_sessions 
  SET accessed_at = now()
  WHERE token = p_token 
    AND expires_at > now();
  
  RETURN QUERY
  SELECT 
    cpu.id as user_id,
    cpu.client_id,
    cpu.email,
    cpu.name,
    cps.document_type,
    cps.document_id,
    (cps.expires_at > now()) as is_valid
  FROM public.client_portal_sessions cps
  JOIN public.client_portal_users cpu ON cpu.id = cps.client_portal_user_id
  WHERE cps.token = p_token;
END;
$function$;

-- Function to log portal activity
CREATE OR REPLACE FUNCTION public.log_client_portal_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.client_portal_activity_logs (
    client_portal_user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  );
END;
$function$;

-- Update triggers for updated_at
CREATE TRIGGER update_client_portal_users_updated_at
  BEFORE UPDATE ON public.client_portal_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
