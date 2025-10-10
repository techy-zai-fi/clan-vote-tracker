-- Create enum for voting session status
CREATE TYPE public.voting_session_status AS ENUM ('pending', 'voting', 'completed', 'cancelled');

-- Create voting_sessions table
CREATE TABLE public.voting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  voter_email TEXT NOT NULL,
  voter_regnum TEXT NOT NULL,
  voter_clan TEXT NOT NULL,
  voter_name TEXT,
  status voting_session_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_voter_email FOREIGN KEY (voter_email) REFERENCES public.voter_registry(email)
);

-- Enable Row Level Security
ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public access for voting sessions (authenticated admins will manage these)
CREATE POLICY "Allow public read voting_sessions"
ON public.voting_sessions
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert voting_sessions"
ON public.voting_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update voting_sessions"
ON public.voting_sessions
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete voting_sessions"
ON public.voting_sessions
FOR DELETE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_voting_sessions_station_id ON public.voting_sessions(station_id);
CREATE INDEX idx_voting_sessions_status ON public.voting_sessions(status);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.voting_sessions;