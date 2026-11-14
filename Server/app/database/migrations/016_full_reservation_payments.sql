CREATE UNIQUE INDEX IF NOT EXISTS pgtx_one_active_reservation_payment ON payment_gateway_transactions(request_id)
WHERE purpose IN ('deposit','full') AND status IN ('initializing','pending','unknown','completed');
DROP INDEX IF EXISTS pgtx_one_active_deposit;
