-- Add new fields to focus_rooms for duration and description
ALTER TABLE focus_rooms ADD COLUMN duration_minutes integer DEFAULT 25;
ALTER TABLE focus_rooms ADD COLUMN description text;
ALTER TABLE focus_rooms ADD COLUMN host_id uuid REFERENCES profiles(id);

-- Add avatar and total_xp to profiles
ALTER TABLE profiles ADD COLUMN avatar_stage integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN total_lifetime_xp integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN username text UNIQUE;

-- Create badges table
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  xp_requirement integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  claimed boolean DEFAULT false,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges"
  ON user_badges FOR UPDATE
  USING (auth.uid() = user_id);

-- Create social_rooms table
CREATE TABLE social_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  host_id uuid REFERENCES profiles(id),
  duration_minutes integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE social_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view social rooms"
  ON social_rooms FOR SELECT
  USING (true);

CREATE POLICY "Users can create social rooms"
  ON social_rooms FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- Create user_interests table
CREATE TABLE user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  interests text[] DEFAULT '{}',
  hobbies text[] DEFAULT '{}',
  goals text[] DEFAULT '{}',
  classes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interests"
  ON user_interests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interests"
  ON user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests"
  ON user_interests FOR UPDATE
  USING (auth.uid() = user_id);

-- Create weekly_summaries table
CREATE TABLE weekly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  summary_text text NOT NULL,
  focus_minutes integer DEFAULT 0,
  xp_gained integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own summaries"
  ON weekly_summaries FOR SELECT
  USING (auth.uid() = user_id);

-- Insert initial badges
INSERT INTO badges (name, description, icon, xp_requirement) VALUES
  ('First Steps', 'Earn your first 20 XP', '🌱', 20),
  ('Rising Star', 'Reach 50 XP', '⭐', 50),
  ('Dedicated', 'Reach 100 XP', '💎', 100),
  ('Power User', 'Reach 250 XP', '🔥', 250),
  ('Master', 'Reach 500 XP', '👑', 500),
  ('Early Bird', 'Complete 5 morning sessions', '🌅', 0),
  ('Night Owl', 'Complete 5 evening sessions', '🦉', 0),
  ('Social Butterfly', 'Join 10 focus rooms', '🦋', 0),
  ('Task Master', 'Complete 50 tasks', '✅', 0),
  ('Week Warrior', 'Maintain a 7-day streak', '⚡', 0);

-- Update handle_new_user function to set username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username, xp, level, streak, avatar_stage, total_lifetime_xp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    0,
    1,
    0,
    0,
    0
  );
  
  INSERT INTO public.pets (owner_id, xp, level, health)
  VALUES (NEW.id, 0, 1, 100);
  
  RETURN NEW;
END;
$$;