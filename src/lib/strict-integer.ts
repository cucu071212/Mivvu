/** Inclusive 24h boarding window (GW-F2) — also caps model-safe minute magnitudes. */
export const MAX_BOARDING_WINDOW_MINUTES = 24 * 60;

const DECIMAL_INT = /^[+-]?[0-9]+$/;

export type StrictIntegerOptions = {
  allowNegative: boolean;
  min?: number;
  max?: number;
};

/**
 * Parses user/dataset minutes without Number() coercion ambiguities (1e2, 0x10, 50.0).
 */
export function parseStrictInteger(
  value: unknown,
  options: StrictIntegerOptions,
): number | undefined {
  const { allowNegative, min, max } = options;
  let parsed: number | undefined;

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) return undefined;
    parsed = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || !DECIMAL_INT.test(trimmed)) return undefined;
    const asNumber = Number(trimmed);
    if (!Number.isSafeInteger(asNumber)) return undefined;
    parsed = asNumber;
  } else {
    return undefined;
  }

  if (!allowNegative && parsed < 0) return undefined;
  if (min !== undefined && parsed < min) return undefined;
  if (max !== undefined && parsed > max) return undefined;
  return parsed;
}

export function isModelSafeMinute(value: number): boolean {
  return (
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= MAX_BOARDING_WINDOW_MINUTES
  );
}

/** Exact integer sum; returns null on overflow or non-safe operands. */
export function safeIntegerSum(values: readonly number[]): number | null {
  let total = 0;
  for (const value of values) {
    if (!Number.isSafeInteger(value)) return null;
    const next = total + value;
    if (!Number.isSafeInteger(next)) return null;
    total = next;
  }
  return total;
}
