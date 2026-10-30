import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import {
  icnGoodsServicesDevCompanionLoadAllowed,
  loadIcnGoodsServicesCompanion,
} from "./load-icn-goods-services-companion";

describe("loadIcnGoodsServicesCompanion isolation", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllEnvs();
  });

  it("returns null with no companion when the dev flag is unset (shipped default path)", () => {
    delete process.env.ICN_GOODS_SERVICES_DEV_COMPANION;
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), false);
    assert.equal(loadIcnGoodsServicesCompanion(), null);
  });

  it("loads labeled synthetic fixture only when flag=1 and runtime is non-production", () => {
    vi.stubEnv("ICN_GOODS_SERVICES_DEV_COMPANION", "1");
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.VERCEL_ENV;
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), true);
    const companion = loadIcnGoodsServicesCompanion();
    assert.ok(companion);
    assert.equal(companion?.schemaVersion, 1);
  });

  it("blocks synthetic companion in production NODE_ENV even when flag=1", () => {
    vi.stubEnv("ICN_GOODS_SERVICES_DEV_COMPANION", "1");
    vi.stubEnv("NODE_ENV", "production");
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), false);
    assert.equal(loadIcnGoodsServicesCompanion(), null);
  });

  it("blocks synthetic companion on Vercel production even when flag=1", () => {
    vi.stubEnv("ICN_GOODS_SERVICES_DEV_COMPANION", "1");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "production");
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), false);
    assert.equal(loadIcnGoodsServicesCompanion(), null);
  });
});
