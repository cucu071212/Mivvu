import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import {
  icnGoodsServicesDevCompanionLoadAllowed,
  loadIcnGoodsServicesCompanion,
} from "./load-icn-goods-services-companion";
import { REVIEWED_ICN_GOODS_SERVICES_COMPANION_SHA256 } from "./icn-goods-services-adoption";

describe("loadIcnGoodsServicesCompanion isolation", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllEnvs();
  });

  it("loads reviewed companion when the dev flag is unset (default real-data path)", () => {
    delete process.env.ICN_GOODS_SERVICES_DEV_COMPANION;
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), false);
    const companion = loadIcnGoodsServicesCompanion();
    assert.ok(companion);
    assert.equal(companion?.schemaVersion, 1);
    assert.equal(companion?.captures.K?.syncIntegrity, "api_total_mismatch");
  });

  it("loads labeled synthetic fixture only when flag=1 and runtime is non-production", () => {
    vi.stubEnv("ICN_GOODS_SERVICES_DEV_COMPANION", "1");
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.VERCEL_ENV;
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), true);
    const companion = loadIcnGoodsServicesCompanion();
    assert.ok(companion);
    assert.equal(companion?.schemaVersion, 1);
    assert.equal(companion?.captures.K?.recordCount, 1);
  });

  it("loads reviewed companion in production NODE_ENV even when dev flag=1", () => {
    vi.stubEnv("ICN_GOODS_SERVICES_DEV_COMPANION", "1");
    vi.stubEnv("NODE_ENV", "production");
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), false);
    const companion = loadIcnGoodsServicesCompanion();
    assert.ok(companion);
    assert.equal(companion?.captures.K?.recordCount, 1027);
  });

  it("loads reviewed companion on Vercel production even when dev flag=1", () => {
    vi.stubEnv("ICN_GOODS_SERVICES_DEV_COMPANION", "1");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "production");
    assert.equal(icnGoodsServicesDevCompanionLoadAllowed(), false);
    const companion = loadIcnGoodsServicesCompanion();
    assert.ok(companion);
    assert.notEqual(companion?.captures.K?.recordCount, 1);
  });
});

describe("loadIcnGoodsServicesCompanion reviewed artifact identity", () => {
  it("binds to the human-adopted SHA-256 (see adoption tests for byte check)", () => {
    assert.match(REVIEWED_ICN_GOODS_SERVICES_COMPANION_SHA256, /^[a-f0-9]{64}$/);
  });
});
