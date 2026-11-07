import "server-only";

import type { IcnGoodsServicesCompanion } from "@/types/icn-goods-services-companion";
import {
  loadAndValidateReviewedGoodsServicesCompanion,
} from "./icn-goods-services-adoption";
import {
  loadIcnFacilitiesEnFixture,
  loadIcnFacilitiesKoFixture,
} from "./load-icn-facilities-fixture";
import { validateIcnGoodsServicesCompanion } from "./icn-goods-services-companion-validate";

/**
 * Opt-in for labeled __test-fixtures__ JSON only.
 * Requires ICN_GOODS_SERVICES_DEV_COMPANION=1 and a non-production runtime.
 */
export function icnGoodsServicesDevCompanionLoadAllowed(): boolean {
  if (process.env.ICN_GOODS_SERVICES_DEV_COMPANION !== "1") {
    return false;
  }
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  return true;
}

function loadDevSyntheticCompanion(): IcnGoodsServicesCompanion | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- dev-only optional fixture
  const raw = require("./__test-fixtures__/icn-goods-services-companion-dev.json") as unknown;
  const validated = validateIcnGoodsServicesCompanion(raw);
  return validated.valid ? validated.companion : null;
}

function loadReviewedShippedCompanion(): IcnGoodsServicesCompanion | null {
  const koFixture = loadIcnFacilitiesKoFixture();
  const enFixture = loadIcnFacilitiesEnFixture();
  const loaded = loadAndValidateReviewedGoodsServicesCompanion(koFixture, enFixture);
  return loaded.ok ? loaded.companion : null;
}

/**
 * Default: human-adopted reviewed companion (validated + target-bound).
 * Dev synthetic loads only when {@link icnGoodsServicesDevCompanionLoadAllowed} is true.
 */
export function loadIcnGoodsServicesCompanion(): IcnGoodsServicesCompanion | null {
  if (icnGoodsServicesDevCompanionLoadAllowed()) {
    return loadDevSyntheticCompanion();
  }
  return loadReviewedShippedCompanion();
}
