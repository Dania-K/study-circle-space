-- Fix RLS policies for focus_rooms to allow creation

-- Allow authenticated users to create focus rooms
CREATE POLICY "Authenticated users can create rooms"
ON public.focus_rooms
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_id);

-- Add columns for profile editing if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'school') THEN
    ALTER TABLE public.profiles ADD COLUMN school TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'grade') THEN
    ALTER TABLE public.profiles ADD COLUMN grade TEXT;
  END IF;
END $$;