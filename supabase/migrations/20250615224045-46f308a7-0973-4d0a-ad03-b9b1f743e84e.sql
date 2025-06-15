
-- Remove existing client portal tables and functions
DROP TABLE IF EXISTS public.client_portal_sessions CASCADE;
DROP TABLE IF EXISTS public.client_portal_users CASCADE;
DROP FUNCTION IF EXISTS public.generate_client_login_token(text, integer);
DROP FUNCTION IF EXISTS public.generate_client_login_token(text);
DROP FUNCTION IF EXISTS public.verify_client_login_token(text);
DROP FUNCTION IF EXISTS public.validate_client_session(text);

-- Create a simple secure document access table
CREATE TABLE public.secure_document_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL CHECK (document_type IN ('estimate', 'invoice')),
  document_id UUID NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  client_email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for performance
CREATE INDEX idx_secure_document_access_token ON public.secure_document_access(access_token);
CREATE INDEX idx_secure_document_access_expires ON public.secure_document_access(expires_at);

-- Enable RLS
ALTER TABLE public.secure_document_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (documents are accessed via token, no user authentication needed)
CREATE POLICY "Allow access via valid token" ON public.secure_document_access
  FOR SELECT USING (expires_at > now());

-- Create function to generate secure document access
CREATE OR REPLACE FUNCTION public.generate_secure_document_access(
  p_document_type TEXT,
  p_document_id UUID,
  p_client_email TEXT,
  p_hours_valid INTEGER DEFAULT 24
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate secure token
  v_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Clean up expired tokens for this document
  DELETE FROM public.secure_document_access 
  WHERE document_id = p_document_id 
    AND document_type = p_document_type 
    AND expires_at < now();
  
  -- Insert new access record
  INSERT INTO public.secure_document_access (
    document_type,
    document_id,
    access_token,
    client_email,
    expires_at
  ) VALUES (
    p_document_type,
    p_document_id,
    v_token,
    p_client_email,
    now() + (p_hours_valid || ' hours')::interval
  );
  
  RETURN v_token;
END;
$function$;

-- Create function to validate document access
CREATE OR REPLACE FUNCTION public.validate_document_access(p_token TEXT)
RETURNS TABLE(
  document_type TEXT,
  document_id UUID,
  client_email TEXT,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update accessed_at and return document info
  UPDATE public.secure_document_access 
  SET accessed_at = now()
  WHERE access_token = p_token 
    AND expires_at > now();
  
  RETURN QUERY
  SELECT 
    sda.document_type,
    sda.document_id,
    sda.client_email,
    (sda.expires_at > now()) as is_valid
  FROM public.secure_document_access sda
  WHERE sda.access_token = p_token;
END;
$function$;
