-- Add hero section text fields to election_settings
ALTER TABLE public.election_settings
ADD COLUMN hero_title TEXT DEFAULT 'IIMBG Clash of Clans Elections 2025',
ADD COLUMN hero_subtitle TEXT DEFAULT 'Choose Your Champions, Shape Your Clan''s Destiny',
ADD COLUMN hero_description TEXT DEFAULT 'The ultimate battle for clan supremacy begins now. Cast your vote and determine who will lead your clan to glory in the arena of honor and competition.',
ADD COLUMN hero_cta_text TEXT DEFAULT 'Enter the Arena',
ADD COLUMN stats_label_1 TEXT DEFAULT 'Active Warriors',
ADD COLUMN stats_value_1 TEXT DEFAULT '1000+',
ADD COLUMN stats_label_2 TEXT DEFAULT 'Battle Clans',
ADD COLUMN stats_value_2 TEXT DEFAULT '6',
ADD COLUMN stats_label_3 TEXT DEFAULT 'Epic Positions',
ADD COLUMN stats_value_3 TEXT DEFAULT '12',
ADD COLUMN stats_label_4 TEXT DEFAULT 'Victory Points',
ADD COLUMN stats_value_4 TEXT DEFAULT '∞';