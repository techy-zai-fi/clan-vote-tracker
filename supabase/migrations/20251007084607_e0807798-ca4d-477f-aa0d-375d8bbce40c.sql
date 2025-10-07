-- Add branding settings to election_settings table
ALTER TABLE public.election_settings 
ADD COLUMN website_logo TEXT,
ADD COLUMN coc_logo TEXT,
ADD COLUMN home_primary_color TEXT DEFAULT '#3B82F6',
ADD COLUMN home_secondary_color TEXT DEFAULT '#F59E0B',
ADD COLUMN home_accent_color TEXT DEFAULT '#8B5CF6',
ADD COLUMN home_bg_start TEXT DEFAULT '#0F172A',
ADD COLUMN home_bg_end TEXT DEFAULT '#1E293B';