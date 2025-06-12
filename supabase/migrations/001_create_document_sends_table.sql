
-- Create table for tracking document sends
CREATE TABLE public.document_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL CHECK (document_type IN ('estimate', 'invoice')),
  document_number TEXT NOT NULL,
  send_method TEXT NOT NULL CHECK (send_method IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'delivered', 'read')),
  message TEXT,
  job_id TEXT,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.document_sends ENABLE ROW LEVEL SECURITY;

-- Create policies for document_sends
CREATE POLICY "Users can view their own document sends" 
  ON public.document_sends 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document sends" 
  ON public.document_sends 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_document_sends_document_number ON public.document_sends(document_number);
CREATE INDEX idx_document_sends_job_id ON public.document_sends(job_id);
CREATE INDEX idx_document_sends_created_at ON public.document_sends(created_at DESC);
