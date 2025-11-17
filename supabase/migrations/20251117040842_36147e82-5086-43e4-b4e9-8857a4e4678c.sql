-- Drop the restrictive delete policy
DROP POLICY IF EXISTS "Hosts can delete their own rooms" ON public.focus_rooms;

-- Create a permissive delete policy
CREATE POLICY "Anyone can delete rooms" 
ON public.focus_rooms 
FOR DELETE 
USING (true);