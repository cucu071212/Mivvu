import type { IcnApiFacilityRow } from "../../types/icn-facility-browse";

/**
 * Normalizes `response.body.items` from IIAC facilities API.
 * Live payloads use numeric keys; portal docs sometimes show `item[]`.
 */
export function parseIcnApiItems(raw: unknown): IcnApiFacilityRow[] {
  if (raw == null) return [];

  if (typeof raw !== "object") {
    throw new Error("Unexpected items shape: not an object");
  }

  const container = raw as Record<string, unknown>;

  if (Array.isArray(container.item)) {
    return container.item as IcnApiFacilityRow[];
  }

  if (container.item && typeof container.item === "object") {
    return [container.item as IcnApiFacilityRow];
  }

  const values = Object.values(container);
  if (values.every((v) => v && typeof v === "object")) {
    return values as IcnApiFacilityRow[];
  }

  throw new Error("Unexpected items shape: unrecognized container");
}
