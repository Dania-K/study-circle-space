-- Create user_classes table for "My Classes" feature
CREATE TABLE IF NOT EXISTS public.user_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  teacher_name TEXT,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_classes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own classes"
  ON public.user_classes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes"
  ON public.user_classes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes"
  ON public.user_classes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes"
  ON public.user_classes FOR DELETE
  USING (auth.uid() = user_id);