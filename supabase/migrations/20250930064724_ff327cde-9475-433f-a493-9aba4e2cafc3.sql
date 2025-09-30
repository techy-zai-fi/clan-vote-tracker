-- Add color columns to clans table
ALTER TABLE public.clans 
ADD COLUMN main_color TEXT DEFAULT '#3B82F6',
ADD COLUMN sub_color TEXT DEFAULT '#1E40AF';