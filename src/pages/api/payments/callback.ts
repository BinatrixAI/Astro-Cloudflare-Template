import type { APIRoute } from "astro";
import { getPurchase, updatePurchaseStatus, logEvent } from "@/lib/db";
import { getProvider } from "@/lib/payments";

export const prerender = false;

/** True if the callback's major-unit Amount matches the stored minor-unit price. */
function amountMatches(cbAmount: string | null, storedMinor: number): boolean {
  if (!cbAmount) return false;
  const n = Math.round(parseFloat(cbAmount) * 100);
  return Number.isFinite(n) && n === storedMinor;
}

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const env = locals.runtime.env;
  const params = url.searchParams;

  const order = params.get("Order") || params.get("Fild1") || "";
  const ccode = params.get("CCode");
  const allParams = Object.fromEntries(params.entries());

  if (!order) {
    console.error(JSON.stringify({ evt: "callback.no_order", ccode }));
    return redirect("/checkout/failed?reason=missing_order");
  }

  await logEvent(env.DB, order, "callback_received", `CCode=${ccode}`, allParams);

  const purchase = await getPurchase(env.DB, order);
  if (!purchase) {
    console.error(JSON.stringify({ evt: "callback.unknown_order", order }));
    return redirect("/checkout/failed?reason=unknown_order");
  }

  // Never trust the raw redirect — verify authenticity via the provider,
  // and independently confirm the amount matches our server-side price.
  const provider = getProvider(env);
  const verify = await provider.verifyCallback(params);
  const amountOk = amountMatches(params.get("Amount"), purchase.amount);

  if (verify.ok && ccode === "0" && amountOk) {
    const changed = await updatePurchaseStatus(env.DB, order, "paid", {
      yaad_txn_id: params.get("Id"),
      yaad_acode: params.get("ACode"),
      yaad_hesh: params.get("Hesh"),
    });
    if (changed > 0) {
      await logEvent(env.DB, order, "verified_paid", `Verified. Yaad Id=${params.get("Id")}`);
      console.log(JSON.stringify({ evt: "callback.paid", order, id: params.get("Id") }));
    } else {
      // Already paid — idempotent replay.
      await logEvent(env.DB, order, "callback_received", "Duplicate paid callback ignored");
      console.log(JSON.stringify({ evt: "callback.duplicate", order }));
    }
    return redirect(`/checkout/success?order=${encodeURIComponent(order)}`);
  }

  const reason = !verify.ok
    ? `verify_failed ccode=${verify.ccode}`
    : !amountOk
      ? "amount_mismatch"
      : `declined ccode=${ccode}`;
  await updatePurchaseStatus(env.DB, order, "failed");
  await logEvent(env.DB, order, "verify_failed", reason, { verifyRaw: verify.raw });
  console.error(JSON.stringify({ evt: "callback.failed", order, reason }));
  return redirect(`/checkout/failed?order=${encodeURIComponent(order)}`);
};
