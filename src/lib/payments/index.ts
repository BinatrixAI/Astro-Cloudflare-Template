import type { PaymentProvider } from "./provider";
import { YaadProvider } from "./yaad";
import { MockProvider } from "./mock";

export type { CreateLinkInput, VerifyResult, PaymentProvider } from "./provider";
export { mockSign } from "./mock";

/**
 * Select the active payment provider from env. Defaults to `mock` (safe for UAT)
 * when PAYMENT_PROVIDER is unset. The mock path never reads YAAD_* secrets.
 */
export function getProvider(env: ENV): PaymentProvider {
  const which = (env.PAYMENT_PROVIDER || "mock").toLowerCase();
  if (which === "yaad") {
    return new YaadProvider({
      YAAD_MASOF: env.YAAD_MASOF,
      YAAD_PASSP: env.YAAD_PASSP,
      YAAD_KEY: env.YAAD_KEY,
    });
  }
  return new MockProvider(env.PUBLIC_BASE_URL, env.MOCK_SECRET);
}
