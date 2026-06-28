import type { APIRoute } from "astro";
import { cartCheckoutSchema } from "@/lib/validation";
import { getPriceableItem } from "@/lib/catalog";
import { formatAmount } from "@/lib/products";
import { insertPurchase, logEvent } from "@/lib/db";
import { getProvider } from "@/lib/payments";

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = cartCheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: "Validation failed", issues: parsed.error.flatten() }, 400);
  }
  const input = parsed.data;

  // Server-controlled pricing: resolve every line from the catalog, clamp qty,
  // and recompute the total. The client total is never trusted.
  let total = 0;
  let currency = "ILS";
  const lines: { id: string; name: string; qty: number; unitPrice: number; lineTotal: number }[] = [];
  for (const item of input.items) {
    const priceable = getPriceableItem(item.id);
    if (!priceable) {
      return json({ error: `Unknown item: ${item.id}` }, 404);
    }
    const qty = Math.min(item.qty, priceable.maxQty);
    const lineTotal = qty * priceable.unitPrice;
    total += lineTotal;
    currency = priceable.currency;
    lines.push({ id: priceable.id, name: priceable.name, qty, unitPrice: priceable.unitPrice, lineTotal });
  }
  if (total <= 0) {
    return json({ error: "Cart total must be greater than zero" }, 400);
  }

  const order = `BN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ticketCount = lines.reduce((n, l) => n + l.qty, 0);
  const summary =
    lines.length === 1 && lines[0].qty === 1
      ? lines[0].name
      : `${lines[0].name.split(" — ")[0]} — ${ticketCount} item${ticketCount === 1 ? "" : "s"}`;

  try {
    await insertPurchase(env.DB, {
      id: order,
      product_id: lines[0].id,
      product_name: summary,
      amount: total,
      currency,
      payer_name: input.name,
      payer_lname: input.lname,
      payer_email: input.email,
      payer_phone: input.phone,
      payer_user_id: input.userId || null,
      items_json: JSON.stringify(lines),
    });

    const provider = getProvider(env);
    await logEvent(env.DB, order, "link_created", `Checkout (${provider.name}) · ${ticketCount} item(s)`, {
      provider: provider.name,
      total,
      currency,
      lines,
    });

    const url = await provider.createPaymentLink({
      order,
      amountMajor: formatAmount(total),
      currency,
      info: summary,
      itemName: summary,
      clientName: input.name,
      clientLName: input.lname,
      email: input.email,
      cell: input.phone,
      userId: input.userId || undefined,
    });

    console.log(
      JSON.stringify({ evt: "checkout.link_created", order, provider: provider.name, total, currency })
    );
    return json({ url, order });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ evt: "checkout.error", order, message }));
    try {
      await logEvent(env.DB, order, "verify_failed", `Link generation failed: ${message}`);
    } catch {
      /* best-effort logging */
    }
    return json({ error: "Could not create payment link" }, 502);
  }
};
