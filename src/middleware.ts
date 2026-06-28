import { defineMiddleware } from "astro:middleware";

/** Constant-time-ish string compare to avoid trivial timing leaks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Build a fresh Response per call — a Response body can only be consumed once,
// so a shared module-level instance fails on the second request.
function unauthorized(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"' },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.url.pathname.startsWith("/admin")) {
    return next();
  }

  const env = context.locals.runtime.env;
  const expectedUser = env.ADMIN_USER;
  const expectedPass = env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    return new Response("Admin credentials are not configured", { status: 503 });
  }

  const header = context.request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    let decoded = "";
    try {
      decoded = atob(encoded);
    } catch {
      return unauthorized();
    }
    const idx = decoded.indexOf(":");
    const user = idx >= 0 ? decoded.slice(0, idx) : decoded;
    const pass = idx >= 0 ? decoded.slice(idx + 1) : "";
    if (safeEqual(user, expectedUser) && safeEqual(pass, expectedPass)) {
      return next();
    }
  }
  return unauthorized();
});
