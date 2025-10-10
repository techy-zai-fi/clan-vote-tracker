-- Enable realtime for votes table to track live vote counts
ALTER TABLE public.votes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- Enable realtime for election_settings to track stats updates
ALTER TABLE public.election_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.election_settings;

-- Enable realtime for candidates table
ALTER TABLE public.candidates REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;