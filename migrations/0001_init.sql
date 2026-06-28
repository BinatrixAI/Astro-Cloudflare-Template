-- Payment records + audit log for the Yaad Sarig / Hyp integration.
-- Apply locally:  npm run db:migrate:local
-- Apply remote:   npm run db:migrate

CREATE TABLE IF NOT EXISTS purchases (
  id            TEXT PRIMARY KEY,            -- Order id (our reference, echoed by Yaad)
  product_id    TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  amount        INTEGER NOT NULL,            -- minor units (agorot/cents), server-controlled
  currency      TEXT NOT NULL DEFAULT 'ILS',
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed | refunded
  payer_name    TEXT,
  payer_lname   TEXT,
  payer_email   TEXT,
  payer_phone   TEXT,
  payer_user_id TEXT,
  yaad_txn_id   TEXT,                         -- Yaad transaction Id (set after verify)
  yaad_acode    TEXT,                         -- acquirer auth code
  yaad_hesh     TEXT,                         -- invoice/receipt identifier
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_purchases_status     ON purchases (status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases (created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_email      ON purchases (payer_email);
-- Idempotency: a given Yaad transaction maps to one row. NULLs (pending rows)
-- are treated as distinct in SQLite, so multiple pending rows are allowed.
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_yaad_txn ON purchases (yaad_txn_id);

CREATE TABLE IF NOT EXISTS payment_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   TEXT NOT NULL,                   -- FK -> purchases.id
  type       TEXT NOT NULL,                   -- link_created | callback_received | verified_paid | verify_failed | refund
  message    TEXT,
  raw_json   TEXT,                            -- raw params / payload snapshot
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_order_id   ON payment_events (order_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON payment_events (created_at);
