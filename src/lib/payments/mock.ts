/**
 * Mock payment provider for UAT — mimics Yaad's flow shape (signed link → hosted
 * page → callback → verify) entirely within our own app, so the full cycle runs
 * with no external gateway and no credentials. Swap to YaadProvider by setting
 * PAYMENT_PROVIDER=yaad. The "signature" is an HMAC over order|amount so forged
 * callbacks fail verification just like the real thing.
 */
import type { CreateLinkInput, PaymentProvider, VerifyResult } from "./provider";

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Canonical message that the mock signature covers. */
export function mockSignatureMessage(order: string, amountMajor: string): string {
  return `${order}|${amountMajor}`;
}

export async function mockSign(
  secret: string,
  order: string,
  amountMajor: string
): Promise<string> {
  return hmacHex(secret, mockSignatureMessage(order, amountMajor));
}

export class MockProvider implements PaymentProvider {
  readonly name = "mock";

  constructor(
    private baseUrl: string,
    private secret: string
  ) {}

  async createPaymentLink(p: CreateLinkInput): Promise<string> {
    const sig = await mockSign(this.secret, p.order, p.amountMajor);
    const q = new URLSearchParams({
      order: p.order,
      amount: p.amountMajor,
      name: `${p.clientName} ${p.clientLName}`.trim(),
      info: p.info,
      sig,
    });
    return `${this.baseUrl}/mock-pay?${q.toString()}`;
  }

  async verifyCallback(params: URLSearchParams): Promise<VerifyResult> {
    const order = params.get("Order") ?? "";
    const amount = params.get("Amount") ?? "";
    const sign = params.get("Sign") ?? "";
    const ccode = params.get("CCode") ?? "-1";
    const expected = await mockSign(this.secret, order, amount);
    const ok = sign === expected && ccode === "0";
    return { ok, ccode, raw: `mock verify: match=${sign === expected} ccode=${ccode}` };
  }
}
