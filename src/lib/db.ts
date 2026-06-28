/** D1 helpers for purchases + payment_events. */

export type PurchaseStatus = "pending" | "paid" | "failed" | "refunded";

export interface PurchaseRow {
  id: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  status: PurchaseStatus;
  payer_name: string | null;
  payer_lname: string | null;
  payer_email: string | null;
  payer_phone: string | null;
  payer_user_id: string | null;
  yaad_txn_id: string | null;
  yaad_acode: string | null;
  yaad_hesh: string | null;
  items_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentEventRow {
  id: number;
  order_id: string;
  type: string;
  message: string | null;
  raw_json: string | null;
  created_at: string;
}

export interface NewPurchase {
  id: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  payer_name: string;
  payer_lname: string;
  payer_email: string;
  payer_phone: string;
  payer_user_id?: string | null;
  items_json?: string | null;
}

export async function insertPurchase(db: D1Database, p: NewPurchase): Promise<void> {
  await db
    .prepare(
      `INSERT INTO purchases
        (id, product_id, product_name, amount, currency, status,
         payer_name, payer_lname, payer_email, payer_phone, payer_user_id, items_json)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      p.id,
      p.product_id,
      p.product_name,
      p.amount,
      p.currency,
      p.payer_name,
      p.payer_lname,
      p.payer_email,
      p.payer_phone,
      p.payer_user_id ?? null,
      p.items_json ?? null
    )
    .run();
}

export async function getPurchase(
  db: D1Database,
  id: string
): Promise<PurchaseRow | null> {
  return await db
    .prepare(`SELECT * FROM purchases WHERE id = ?`)
    .bind(id)
    .first<PurchaseRow>();
}

export interface PaidUpdate {
  yaad_txn_id?: string | null;
  yaad_acode?: string | null;
  yaad_hesh?: string | null;
}

/**
 * Transition a purchase to a terminal status. For `paid`, the WHERE clause only
 * matches a `pending` row, making the callback idempotent (a replayed callback
 * updates zero rows). Returns the number of rows changed.
 */
export async function updatePurchaseStatus(
  db: D1Database,
  id: string,
  status: PurchaseStatus,
  yaad?: PaidUpdate
): Promise<number> {
  const guard = status === "paid" ? `AND status = 'pending'` : ``;
  const res = await db
    .prepare(
      `UPDATE purchases
         SET status = ?, yaad_txn_id = COALESCE(?, yaad_txn_id),
             yaad_acode = COALESCE(?, yaad_acode), yaad_hesh = COALESCE(?, yaad_hesh),
             updated_at = datetime('now')
       WHERE id = ? ${guard}`
    )
    .bind(
      status,
      yaad?.yaad_txn_id ?? null,
      yaad?.yaad_acode ?? null,
      yaad?.yaad_hesh ?? null,
      id
    )
    .run();
  return res.meta.changes ?? 0;
}

export async function logEvent(
  db: D1Database,
  orderId: string,
  type: string,
  message?: string,
  raw?: unknown
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO payment_events (order_id, type, message, raw_json) VALUES (?, ?, ?, ?)`
    )
    .bind(orderId, type, message ?? null, raw == null ? null : JSON.stringify(raw))
    .run();
}

export async function listPurchases(
  db: D1Database,
  limit = 100
): Promise<PurchaseRow[]> {
  const res = await db
    .prepare(`SELECT * FROM purchases ORDER BY created_at DESC LIMIT ?`)
    .bind(limit)
    .all<PurchaseRow>();
  return res.results ?? [];
}

export async function listEvents(
  db: D1Database,
  limit = 100
): Promise<PaymentEventRow[]> {
  const res = await db
    .prepare(`SELECT * FROM payment_events ORDER BY created_at DESC LIMIT ?`)
    .bind(limit)
    .all<PaymentEventRow>();
  return res.results ?? [];
}
