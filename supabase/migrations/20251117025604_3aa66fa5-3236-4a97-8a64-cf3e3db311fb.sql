-- Add grade and school columns to community_posts and community_comments for caching user info

ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS school TEXT;

ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS school TEXT;