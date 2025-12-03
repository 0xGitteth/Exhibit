ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete INTEGER NOT NULL DEFAULT 0;

-- Set existing users as completed to keep demo accounts accessible
UPDATE users SET onboarding_complete = 1 WHERE onboarding_complete IS NULL OR onboarding_complete = 0;
