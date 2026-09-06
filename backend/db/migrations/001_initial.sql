CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student', created_at TEXT NOT NULL);
CREATE TABLE universities (id TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE students (id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id), university_id TEXT REFERENCES universities(id), student_code TEXT NOT NULL UNIQUE);
CREATE TABLE game_scores (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), game_type TEXT NOT NULL, score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100000), idempotency_key TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(user_id, idempotency_key));
CREATE TABLE security_events (id TEXT PRIMARY KEY, user_id TEXT, event_type TEXT NOT NULL, ip TEXT, metadata TEXT, created_at TEXT NOT NULL);
CREATE INDEX game_scores_leaderboard_idx ON game_scores(game_type, score DESC);
