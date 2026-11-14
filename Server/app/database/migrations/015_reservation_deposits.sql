ALTER TYPE ride_status ADD VALUE IF NOT EXISTS 'awaiting_deposit';
ALTER TABLE payment_gateway_transactions ADD COLUMN IF NOT EXISTS request_id uuid REFERENCES ride_requests(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pgtx_one_active_deposit ON payment_gateway_transactions(request_id)
WHERE purpose='deposit' AND status IN ('initializing','pending','unknown','completed');
