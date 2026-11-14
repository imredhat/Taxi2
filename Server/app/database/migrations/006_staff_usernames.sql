-- Staff accounts may sign in with a username without requiring a fabricated phone.
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (LOWER(username)) WHERE username IS NOT NULL;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='users_username_format' AND conrelid='users'::regclass) THEN
  ALTER TABLE users ADD CONSTRAINT users_username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z][a-zA-Z0-9_]{2,63}$');
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='users_login_identity_required' AND conrelid='users'::regclass) THEN
  ALTER TABLE users ADD CONSTRAINT users_login_identity_required CHECK (phone IS NOT NULL OR (role IN ('admin','super_admin','support') AND username IS NOT NULL));
 END IF;
END $$;
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
