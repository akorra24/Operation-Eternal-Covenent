-- Add all missing columns to the public.meals table
-- This migration adds: weight, sugar, sodium, contains, instructions, and archived

ALTER TABLE public.meals
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS sugar NUMERIC,
ADD COLUMN IF NOT EXISTS sodium NUMERIC,
ADD COLUMN IF NOT EXISTS contains TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

-- Add produced_by column to the public.settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS produced_by TEXT DEFAULT '1025 PCH, Hermosa Beach, 90254';

-- Create index for faster queries on archived column
CREATE INDEX IF NOT EXISTS idx_meals_archived ON public.meals(archived);
