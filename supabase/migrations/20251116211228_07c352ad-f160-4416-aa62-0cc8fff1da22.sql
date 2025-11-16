-- Enable RLS on badges table
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Create policy for badges - everyone can view them
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (true);