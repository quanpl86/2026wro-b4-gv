-- Game Mastery Schema for WRO 2026
-- Run this in the Supabase SQL Editor

-- GAME SESSIONS: Tracks each mission attempt
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    robot_profile_id UUID, -- Optional link to robot profile
    player_name TEXT DEFAULT 'Judge',
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    total_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'aborted'
    meta_data JSONB DEFAULT '{}'::jsonb -- For storing path length, battery usage etc.
);

-- GAME SCORES: Detailed scoring events within a session
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id),
    station_id TEXT, -- e.g. 'trang_an'
    event_type TEXT NOT NULL, -- 'quiz_pass', 'discovery_bonus', 'speed_bonus'
    points INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_sessions_score ON game_sessions (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_session ON game_scores (session_id);

-- RLS Policies (Open for now/Judge only)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read/write for all" ON game_sessions;
DROP POLICY IF EXISTS "Enable read/write for all" ON game_scores;

CREATE POLICY "Enable read/write for all" ON game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all" ON game_scores FOR ALL USING (true) WITH CHECK (true);
