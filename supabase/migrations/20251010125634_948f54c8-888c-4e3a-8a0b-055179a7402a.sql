-- Add voter_batch and voter_year columns to voting_sessions table
ALTER TABLE public.voting_sessions
ADD COLUMN voter_batch text,
ADD COLUMN voter_year integer;