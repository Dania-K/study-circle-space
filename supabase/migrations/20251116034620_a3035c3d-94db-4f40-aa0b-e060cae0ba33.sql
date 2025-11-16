-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  health INTEGER DEFAULT 100 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(owner_id)
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pet"
  ON public.pets FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pet"
  ON public.pets FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own pet"
  ON public.pets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Create focus_rooms table
CREATE TABLE public.focus_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  timer_end_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  in_session BOOLEAN DEFAULT false
);

ALTER TABLE public.focus_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms"
  ON public.focus_rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update rooms"
  ON public.focus_rooms FOR UPDATE
  USING (true);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.focus_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_time TIMESTAMPTZ,
  task_text TEXT NOT NULL,
  mood TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  subtasks JSONB DEFAULT '[]'::jsonb,
  completed_subtasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions in their rooms"
  ON public.sessions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.focus_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, xp, level, streak)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    0,
    1,
    0
  );
  
  INSERT INTO public.pets (owner_id, xp, level, health)
  VALUES (NEW.id, 0, 1, 100);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();