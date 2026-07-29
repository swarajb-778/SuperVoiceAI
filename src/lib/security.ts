/**
 * Guards for the public, unauthenticated voice endpoints.
 *
 * These routes are reachable by anyone who knows a businessId and they spend the tenant's
 * OpenAI budget, so they need their own controls — RLS cannot help here because the caller
 * has no session.
 */

/** Hostname of a URL or bare host string, lowercased. Returns null if unparseable. */
export function normalizeHost(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  try {
    // Bare hosts ("example.com", "example.com:3000") have no scheme to parse.
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withScheme).hostname || null;
  } catch {
    return null;
  }
}

/** The requesting site, from Origin (sent on all cross-origin POSTs) or Referer as a fallback. */
export function requestOrigin(headers: Headers): string | null {
  return normalizeHost(headers.get('origin')) ?? normalizeHost(headers.get('referer'));
}

/**
 * Whether `origin` may embed a widget whose allowlist is `allowed`.
 *
 * An empty or absent allowlist means "not configured" and stays permissive, so enabling
 * this cannot break tenants who never set one. Entries accept a bare host, a full URL, or
 * a `*.example.com` wildcard covering subdomains.
 */
export function isOriginAllowed(origin: string | null, allowed: string[] | null | undefined): boolean {
  if (!allowed || allowed.length === 0) return true;

  const host = normalizeHost(origin);
  if (!host) return false; // allowlist configured but the caller sent no usable origin

  return allowed.some((entry) => {
    const raw = entry?.trim().toLowerCase();
    if (!raw) return false;

    if (raw.startsWith('*.')) {
      const suffix = raw.slice(1); // "*.example.com" -> ".example.com"
      const bare = raw.slice(2);   // and the apex itself
      return host === bare || host.endsWith(suffix);
    }

    return host === normalizeHost(raw);
  });
}

/** Max new conversations a single business may start per minute before requests are shed. */
export const SESSION_RATE_LIMIT_PER_MINUTE = 20;

/**
 * True when the business has already opened more sessions than the window allows.
 *
 * ponytail: counts rows we already write (`conversations`) instead of introducing a
 * limiter table — the abuse we care about is burning one tenant's OpenAI spend, and that
 * is per-business by definition. Ceiling: this is per-tenant, not per-IP, so it will not
 * stop a distributed attack spread thinly across many businesses. Move to a dedicated
 * store keyed on IP if that shows up.
 */
export function isOverSessionLimit(recentCount: number | null): boolean {
  return (recentCount ?? 0) >= SESSION_RATE_LIMIT_PER_MINUTE;
}
