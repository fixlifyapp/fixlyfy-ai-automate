
-- Drop client portal tables and functions
DROP TABLE IF EXISTS public.secure_document_access CASCADE;
DROP FUNCTION IF EXISTS public.generate_secure_document_access(text, uuid, text, integer);
DROP FUNCTION IF EXISTS public.validate_document_access(text);
