-- Create voting_rules table to control which voters can vote for which candidates
CREATE TABLE IF NOT EXISTS public.voting_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_batch batch_type NOT NULL,
  voter_section text,
  can_vote_for_batch batch_type NOT NULL,
  can_vote_for_section text,
  same_clan_only boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voting_rules ENABLE ROW LEVEL SECURITY;

-- Allow public read access to voting rules
CREATE POLICY "Allow public read voting_rules" 
ON public.voting_rules 
FOR SELECT 
USING (true);

-- Allow public update for admin functionality
CREATE POLICY "Allow public update voting_rules" 
ON public.voting_rules 
FOR UPDATE 
USING (true);

-- Allow public insert for admin functionality
CREATE POLICY "Allow public insert voting_rules" 
ON public.voting_rules 
FOR INSERT 
WITH CHECK (true);

-- Allow public delete for admin functionality
CREATE POLICY "Allow public delete voting_rules" 
ON public.voting_rules 
FOR DELETE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_voting_rules_updated_at
BEFORE UPDATE ON public.voting_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rule: voters can only vote for candidates in their own clan
INSERT INTO public.voting_rules (voter_batch, can_vote_for_batch, same_clan_only, is_active)
VALUES ('MBA', 'MBA', true, true)
ON CONFLICT DO NOTHING;