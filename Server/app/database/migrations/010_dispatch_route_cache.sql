CREATE TABLE IF NOT EXISTS dispatch_route_cache (
  key text PRIMARY KEY,
  metrics jsonb NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS dispatch_route_cache_expiry ON dispatch_route_cache(expires_at);
