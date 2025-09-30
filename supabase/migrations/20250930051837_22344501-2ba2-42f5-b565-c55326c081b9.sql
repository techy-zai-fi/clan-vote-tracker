-- Create enums only if they don't exist
DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other', 'Prefer not to say');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE batch_type AS ENUM ('MBA', 'HHM', 'DBM', 'IPM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Voter Registry table
CREATE TABLE IF NOT EXISTS voter_registry (
  email TEXT PRIMARY KEY,
  reg_num TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender gender_type NOT NULL,
  clan TEXT NOT NULL,
  batch batch_type NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clans table
CREATE TABLE IF NOT EXISTS clans (
  id TEXT PRIMARY KEY CHECK (LENGTH(id) = 2),
  name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  quote TEXT,
  bg_image TEXT,
  display_order INTEGER DEFAULT 0
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  gender gender_type NOT NULL,
  clan_id TEXT NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  batch batch_type NOT NULL,
  year INTEGER NOT NULL,
  photo_url TEXT,
  manifesto TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_clan_batch ON candidates(clan_id, batch);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_email TEXT NOT NULL,
  voter_regnum TEXT NOT NULL,
  clan_id TEXT NOT NULL REFERENCES clans(id),
  batch batch_type NOT NULL,
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  device_hash TEXT,
  user_agent TEXT,
  UNIQUE(voter_email, clan_id, batch)
);

CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_email);
CREATE INDEX IF NOT EXISTS idx_votes_clan ON votes(clan_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);

-- Election Settings table
CREATE TABLE IF NOT EXISTS election_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  is_live BOOLEAN DEFAULT false,
  allow_vote_changes BOOLEAN DEFAULT false,
  show_live_stats BOOLEAN DEFAULT false,
  allow_adhoc_voters BOOLEAN DEFAULT true,
  frozen BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_label TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_date ON audit_log(created_at DESC);

-- Admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE voter_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read voter_registry" ON voter_registry;
DROP POLICY IF EXISTS "Allow public insert voter_registry" ON voter_registry;
DROP POLICY IF EXISTS "Allow public update voter_registry" ON voter_registry;
DROP POLICY IF EXISTS "Allow public read clans" ON clans;
DROP POLICY IF EXISTS "Allow public all candidates" ON candidates;
DROP POLICY IF EXISTS "Allow public all votes" ON votes;
DROP POLICY IF EXISTS "Allow public read settings" ON election_settings;
DROP POLICY IF EXISTS "Allow public update settings" ON election_settings;
DROP POLICY IF EXISTS "Allow public all audit" ON audit_log;
DROP POLICY IF EXISTS "Allow public read admin_credentials" ON admin_credentials;

-- Create RLS Policies: Allow public access (kiosk mode)
CREATE POLICY "Allow public read voter_registry" ON voter_registry FOR SELECT USING (true);
CREATE POLICY "Allow public insert voter_registry" ON voter_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update voter_registry" ON voter_registry FOR UPDATE USING (true);
CREATE POLICY "Allow public read clans" ON clans FOR SELECT USING (true);
CREATE POLICY "Allow public all candidates" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow public all votes" ON votes FOR ALL USING (true);
CREATE POLICY "Allow public read settings" ON election_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON election_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public all audit" ON audit_log FOR ALL USING (true);
CREATE POLICY "Allow public read admin_credentials" ON admin_credentials FOR SELECT USING (true);

-- Insert default settings if not exists
INSERT INTO election_settings (id, is_live, allow_vote_changes, show_live_stats, allow_adhoc_voters, frozen)
VALUES (1, false, false, false, true, false)
ON CONFLICT (id) DO NOTHING;

-- Insert default admin password if not exists
INSERT INTO admin_credentials (id, password_hash)
VALUES (1, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (id) DO NOTHING;

-- Seed the 6 clans if not exists
INSERT INTO clans (id, name, quote, display_order) VALUES
('BD', 'Bodhi', 'Wisdom and Enlightenment', 1),
('AS', 'Ashwa', 'Speed and Strength', 2),
('DR', 'Dronagiri', 'Healing and Compassion', 3),
('GA', 'Garuda', 'Vision and Freedom', 4),
('MA', 'Mahanadi', 'Flow and Adaptability', 5),
('VI', 'Vipasha', 'Liberation and Purity', 6)
ON CONFLICT (id) DO NOTHING;

-- Create update function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers if not exists
DROP TRIGGER IF EXISTS update_voter_registry_updated_at ON voter_registry;
CREATE TRIGGER update_voter_registry_updated_at
  BEFORE UPDATE ON voter_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_election_settings_updated_at ON election_settings;
CREATE TRIGGER update_election_settings_updated_at
  BEFORE UPDATE ON election_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();