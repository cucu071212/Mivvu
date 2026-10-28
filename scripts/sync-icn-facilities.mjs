/**
 * Full ICN facilities sync → development fixture (GW-ICN-004).
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   node scripts/sync-icn-facilities.mjs [--lang K] [--allow-total-mismatch]
 *
 * Requires DATA_GO_KR_SERVICE_KEY (never commit).
 */
import { spawnSync } from "node:child_process";
import process from "node:process";

const env = { ...process.env, ICN_SYNC: "1" };

for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg === "--lang" && process.argv[i + 1]) {
    env.ICN_SYNC_LANG = process.argv[++i];
  } else if (arg === "--allow-total-mismatch") {
    env.ICN_SYNC_ALLOW_MISMATCH = "1";
  }
}

const result = spawnSync(
  "npx",
  ["vitest", "run", "src/lib/icn-facilities/sync-cli.test.ts"],
  { stdio: "inherit", env },
);

process.exit(result.status ?? 1);
