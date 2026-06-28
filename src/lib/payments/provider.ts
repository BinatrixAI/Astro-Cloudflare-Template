/** Payment provider abstraction — lets the app run a mock provider for UAT and
 *  the real Yaad Sarig / Hyp provider in production behind one interface. */

export interface CreateLinkInput {
  /** Our order id (echoed back in the callback). */
  order: string;
  /** Amount in MAJOR units as a string, e.g. "70.00". */
  amountMajor: string;
  /** ISO currency code, e.g. "ILS". */
  currency: string;
  /** Human description of the order. */
  info: string;
  /** Short item label (used for line-item description). */
  itemName: string;
  clientName: string;
  clientLName: string;
  email: string;
  cell: string;
  userId?: string;
  lang?: "HEB" | "ENG";
}

export interface VerifyResult {
  ok: boolean;
  ccode: string;
  raw: string;
}

export interface PaymentProvider {
  readonly name: string;
  /** Build the hosted-payment-page URL the buyer is redirected to. */
  createPaymentLink(input: CreateLinkInput): Promise<string>;
  /** Verify a callback's authenticity. Must NOT trust the raw redirect alone. */
  verifyCallback(params: URLSearchParams): Promise<VerifyResult>;
}
