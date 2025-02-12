-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Players table
CREATE TABLE players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    speed INTEGER CHECK (speed >= 1 AND speed <= 99),
    throwing INTEGER CHECK (throwing >= 1 AND throwing <= 99),
    awareness INTEGER CHECK (awareness >= 1 AND awareness <= 99),
    catching INTEGER CHECK (catching >= 1 AND catching <= 99),
    defense INTEGER CHECK (defense >= 1 AND defense <= 99),
    endurance INTEGER CHECK (endurance >= 1 AND endurance <= 99),
    spirit INTEGER CHECK (spirit >= 0 AND spirit <= 4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Contests table
CREATE TABLE contests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    proposed_stats JSONB NOT NULL,
    contest_notes TEXT,
    contest_status TEXT CHECK (contest_status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_contests_player_id ON contests(player_id);
CREATE INDEX idx_contests_status ON contests(contest_status);

-- Add RLS policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to players"
    ON players FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access to contests"
    ON contests FOR SELECT
    TO public
    USING (true); 