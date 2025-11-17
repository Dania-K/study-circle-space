-- Add pet_type column to pets table
ALTER TABLE public.pets ADD COLUMN pet_type text DEFAULT 'chick';