/**
 * Real ICN goods/services catalog capture (GW-ICN-015-ENRICH-DATA).
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   ICN_GOODS_SERVICES_CAPTURE=1 node scripts/capture-icn-goods-services.mjs
 *
 * Optional: ICN_GOODS_SERVICES_CAPTURE_DIR=/private/tmp/GW-ICN-015-evidence/...
 * Requires DATA_GO_KR_SERVICE_KEY (never commit). Max 30 HTTP attempts.
 */
import { spawnSync } from "node:child_process";
import process from "node:process";

const env = { ...process.env, ICN_GOODS_SERVICES_CAPTURE: "1" };

const result = spawnSync(
  "npx",
  ["vitest", "run", "src/lib/icn-facilities/goods-services-capture-cli.test.ts"],
  { stdio: "inherit", env },
);

process.exit(result.status ?? 1);
