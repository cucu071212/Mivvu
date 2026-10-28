/** Offline GW-ICN-007 CLI. Uses the installed test runtime, never npx/network. */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp;
try {
  // Isolate the report from Vitest progress output, which can interleave with large
  // worker stdout writes. No user-controlled output file or fixture writer is used.
  temp = mkdtempSync(path.join(os.tmpdir(), "gw-icn-snapshot-report-"));
  const resultFile = path.join(temp, "result.json");
  const child = spawnSync(process.execPath, [
    path.join(root, "node_modules/vitest/vitest.mjs"), "run",
    "src/lib/icn-facilities/snapshot-quality-cli-runner.test.ts", "--reporter=dot",
  ], {
    cwd: root,
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 1024 * 1024,
    env: {
      ...process.env,
      ICN_SNAPSHOT_QUALITY_ARGS: JSON.stringify(process.argv.slice(2)),
      ICN_SNAPSHOT_QUALITY_CWD: process.cwd(),
      ICN_SNAPSHOT_QUALITY_RESULT_FILE: resultFile,
      ICN_SYNC: "0",
      ICN_INVESTIGATE: "0",
    },
  });
  if (child.error || child.status !== 0) throw new Error("Runner failed");
  const result = JSON.parse(readFileSync(resultFile, "utf8"));
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
} catch {
  // Do not dump runner exceptions or environment values into a data report.
  process.stderr.write("Offline snapshot runner failed. Check installed project dependencies and run the focused tests.\n");
  process.exitCode = 1;
} finally {
  if (temp) rmSync(temp, { recursive: true, force: true });
}
