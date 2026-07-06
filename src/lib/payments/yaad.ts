/**
 * Yaad Sarig / Hyp ("Hyp Pay") classic API provider.
 *
 * Design notes (verified against developers.hyp.co.il):
 *  - Single endpoint, all operations driven by the `action` query param.
 *  - Signing and verifying are SERVER ROUND-TRIPS (no local crypto) — Workers-friendly.
 *  - ALWAYS send UTF8=True + UTF8out=True so Hebrew + callback values are UTF-8.
 *  - The SIGN response body is a raw query string; append it VERBATIM to build the
 *    payment URL. Re-encoding/reordering it breaks the signature.
 *  - MUST send Sign=True on SIGN: it tells Hyp to put a `Sign` signature in the
 *    completion redirect. Without it, What=VERIFY has nothing to check and returns a
 *    non-zero CCode — i.e. every real payment would be rejected on the callback.
 *  - The success/return URL is configured on the terminal in the Hyp dashboard and
 *    should point at `<PUBLIC_BASE_URL>/api/payments/callback`.
 */
import type { CreateLinkInput, PaymentProvider, VerifyResult } from "./provider";

export const YAAD_ENDPOINT = "https://pay.hyp.co.il/p/";

export interface YaadCreds {
  YAAD_MASOF: string;
  YAAD_PASSP: string;
  YAAD_KEY: string;
}

/** Map an ISO currency code to Yaad's `Coin` value. */
export function currencyToCoin(currency: string): number {
  switch (currency.toUpperCase()) {
    case "ILS":
      return 1;
    case "USD":
      return 2;
    case "EUR":
      return 3;
    case "GBP":
      return 4;
    default:
      return 1;
  }
}

export class YaadProvider implements PaymentProvider {
  readonly name = "yaad";

  constructor(private creds: YaadCreds) {}

  async createPaymentLink(p: CreateLinkInput): Promise<string> {
    const params = new URLSearchParams({
      action: "APISign",
      What: "SIGN",
      KEY: this.creds.YAAD_KEY,
      PassP: this.creds.YAAD_PASSP,
      Masof: this.creds.YAAD_MASOF,
      Amount: p.amountMajor,
      Sign: "True", // REQUIRED — makes Hyp put the redirect signature that What=VERIFY checks
      Coin: String(currencyToCoin(p.currency)),
      Order: p.order,
      Info: p.info,
      ClientName: p.clientName,
      ClientLName: p.clientLName,
      email: p.email,
      cell: p.cell,
      Tash: "1",
      UTF8: "True",
      UTF8out: "True",
      MoreData: "True",
      Pritim: "True",
      heshDesc: `Item1~${p.itemName}~1~${p.amountMajor}`,
      tmp: "1",
      PageLang: p.lang ?? "HEB",
      Fild1: p.order,
    });
    if (p.userId) params.set("UserId", p.userId);

    const res = await fetch(`${YAAD_ENDPOINT}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Yaad SIGN request failed: HTTP ${res.status}`);
    }
    const body = (await res.text()).trim();
    if (!body.includes("signature=") || !body.includes("action=pay")) {
      throw new Error(`Yaad SIGN returned unexpected response: ${body.slice(0, 200)}`);
    }
    // Append VERBATIM — do not re-encode or reorder.
    return `${YAAD_ENDPOINT}?${body}`;
  }

  async verifyCallback(callbackParams: URLSearchParams): Promise<VerifyResult> {
    const params = new URLSearchParams(callbackParams.toString());
    params.set("action", "APISign");
    params.set("What", "VERIFY");
    params.set("KEY", this.creds.YAAD_KEY);
    params.set("PassP", this.creds.YAAD_PASSP);
    params.set("Masof", this.creds.YAAD_MASOF);

    const res = await fetch(`${YAAD_ENDPOINT}?${params.toString()}`);
    const raw = (await res.text()).trim();
    if (!res.ok) {
      return { ok: false, ccode: "-1", raw };
    }
    const parsed = new URLSearchParams(raw);
    const ccode = parsed.get("CCode") ?? "-1";
    return { ok: ccode === "0", ccode, raw };
  }
}
