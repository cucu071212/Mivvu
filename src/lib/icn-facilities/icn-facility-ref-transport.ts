/**
 * URL transport boundary for GW-ICN-012 serialized references.
 * Encode exactly once when placing a ref in a path segment; parse receives the
 * framework-decoded segment (or one explicit decode if the caller still has encoding).
 */

/** Encode serialized JSON for a single dynamic `[ref]` path segment (one encodeURIComponent). */
export function encodeIcnFacilityRefForUrlPath(serializedRef: string): string {
  return encodeURIComponent(serializedRef);
}

/**
 * Prepare a path segment value for `parseIcnFacilityRef`.
 * Next.js App Router supplies decoded dynamic params; pass through unchanged.
 * If the segment still contains percent-escapes, decode once (manual/direct URL entry).
 */
export function decodeIcnFacilityRefPathSegment(pathSegment: string): string {
  if (pathSegment.includes("%")) {
    try {
      return decodeURIComponent(pathSegment);
    } catch {
      return pathSegment;
    }
  }
  return pathSegment;
}

/** Build the canonical browse detail href from serialized ref JSON. */
export function buildIcnFacilityDetailHref(serializedRef: string): string {
  return `/icn/f/${encodeIcnFacilityRefForUrlPath(serializedRef)}`;
}
