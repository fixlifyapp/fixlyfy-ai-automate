
-- Create a table for user phone numbers
CREATE TABLE IF NOT EXISTS public.user_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  twilio_sid TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  capabilities JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.user_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create policies for user_phone_numbers
CREATE POLICY "Users can view their own phone numbers" 
  ON public.user_phone_numbers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone numbers" 
  ON public.user_phone_numbers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers" 
  ON public.user_phone_numbers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone numbers" 
  ON public.user_phone_numbers 
  FOR DELETE 
  USING (auth.uid() = user_id);
