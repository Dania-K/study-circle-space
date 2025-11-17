-- Allow room hosts to delete their own rooms
CREATE POLICY "Hosts can delete their own rooms"
ON public.focus_rooms
FOR DELETE
USING (auth.uid() = host_id);