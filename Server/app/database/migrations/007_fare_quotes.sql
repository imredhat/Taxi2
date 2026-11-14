ALTER TABLE road_condition_pricing ADD COLUMN IF NOT EXISTS origin_city VARCHAR(100);
ALTER TABLE road_condition_pricing ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100);
ALTER TABLE toll_rules ADD COLUMN IF NOT EXISTS origin_city VARCHAR(100);
ALTER TABLE toll_rules ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100);
CREATE TABLE IF NOT EXISTS passenger_fare_quotes (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 request_hash VARCHAR(64) NOT NULL, result JSONB NOT NULL,expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS passenger_fare_quotes_user ON passenger_fare_quotes(user_id,expires_at);
