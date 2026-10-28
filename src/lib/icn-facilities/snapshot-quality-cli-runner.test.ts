import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { runIcnSnapshotQualityCli } from "./icn-snapshot-quality-cli";

// Like sync-cli.test.ts, use the existing local Vitest TypeScript runtime.
// This harness never imports the sync client/writer; ordinary test runs skip it.
it.skipIf(!process.env.ICN_SNAPSHOT_QUALITY_ARGS || !process.env.ICN_SNAPSHOT_QUALITY_RESULT_FILE)("runs the offline snapshot CLI", () => {
  const args: string[] = JSON.parse(process.env.ICN_SNAPSHOT_QUALITY_ARGS!);
  const result = runIcnSnapshotQualityCli(args, process.env.ICN_SNAPSHOT_QUALITY_CWD ?? process.cwd());
  // The wrapper supplies a fresh private temp directory, never a user-selected output path.
  // Exclusive creation prevents overwriting any existing file.
  writeFileSync(process.env.ICN_SNAPSHOT_QUALITY_RESULT_FILE!, JSON.stringify(result), { flag: "wx", mode: 0o600 });
});
