CREATE TABLE IF NOT EXISTS passenger_drafts (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 client_reference VARCHAR(100) NOT NULL, trip_data JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(user_id,client_reference)
);
CREATE TABLE IF NOT EXISTS passenger_preferences (
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 activity_notifications BOOLEAN NOT NULL DEFAULT TRUE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payment_gateway_transactions ADD COLUMN IF NOT EXISTS client_reference VARCHAR(100);
ALTER TABLE payment_gateway_transactions ADD COLUMN IF NOT EXISTS purpose VARCHAR(20);
ALTER TABLE payment_gateway_transactions ADD COLUMN IF NOT EXISTS callback_secret_hash VARCHAR(64);
ALTER TABLE payment_gateway_transactions ADD COLUMN IF NOT EXISTS terminal_id VARCHAR(30);
ALTER TABLE payment_gateway_transactions ADD COLUMN IF NOT EXISTS session_key VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS pgtx_user_client_reference ON payment_gateway_transactions(user_id,client_reference) WHERE client_reference IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pgtx_sep_reference ON payment_gateway_transactions(gateway,reference_id) WHERE reference_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS transactions_gateway_once ON transactions(reference_id,reference_type) WHERE reference_type='gateway_topup';
CREATE UNIQUE INDEX IF NOT EXISTS passenger_ride_payment_once ON transactions(wallet_id,ride_id) WHERE type='ride_payment';
