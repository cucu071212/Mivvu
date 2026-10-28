import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { analyzeIcnSnapshots, type IcnSnapshotQualityReport } from "./icn-snapshot-quality";

const USAGE = `Usage: npm run quality:icn-snapshots -- --candidate-ko FILE --candidate-en FILE [--baseline-ko FILE --baseline-en FILE] [--json]
Offline, read-only comparison. Baselines default to the shipped KO/EN fixtures.
Exit 0: valid inputs (warnings/changes may require review); 1: invalid/unreadable input; 2: usage error.
No publication approval is inferred. No network, credentials, or output-file option.\n`;
export type SnapshotCliResult = { exitCode: number; stdout: string; stderr: string };

export function summarizeIcnSnapshotQuality(report: IcnSnapshotQualityReport): string {
  const lines = [
    `ICN snapshot quality: ${report.valid ? "VALID" : "INVALID"}; review ${report.reviewNeeded ? "needed" : "not triggered by checks"}. No publication approval.`,
  ];
  for (const side of ["baseline", "candidate"] as const) {
    for (const language of ["ko", "en"] as const) {
      const snapshot = report[side][language], c = snapshot.counts;
      const prefix = `${side} ${language.toUpperCase()}`;
      if (!c) {
        lines.push(`${prefix}: INVALID (${snapshot.errors.length} validation errors)`);
        for (const e of snapshot.errors.slice(0, 5)) lines.push(`  ${e.path}: ${e.code} — ${e.message}`);
        if (snapshot.errors.length > 5) lines.push("  More errors in --json output.");
        continue;
      }
      lines.push(`${prefix}: ${c.rawRows} raw → ${c.collapsedListings} listings; ${c.identicalDuplicatesCollapsed} identical duplicates collapsed; ${c.distinctSourceIds} distinct IDs; ${c.conflictingSourceIdGroups} conflicts; API total ${snapshot.metadata?.apiReportedTotalCount} (${snapshot.metadata?.syncIntegrity}).`);
      const missing = Object.entries(snapshot.missingFields!).filter(([, v]) => v.rawRows > 0).map(([field, v]) => `${field}=${v.rawRows}/${v.collapsedListings}`);
      if (missing.length) lines.push(`  Missing (raw/listings): ${missing.join(", ")}`);
      if (snapshot.warnings.length) lines.push(`  Warnings: ${snapshot.warnings.map((w) => w.code).join(", ")}`);
    }
    const a = report[side].alignment;
    if (a) lines.push(`${side} KO/EN: ${a.matchedSourceIds.length} unambiguous pairs; ${a.koreanOnlySourceIds.length} KO-only; ${a.englishOnlySourceIds.length} EN-only; ${a.ambiguousSourceIds.length} ambiguous shared IDs.`);
    else lines.push(`${side} KO/EN: not compared because an input is invalid.`);
  }
  for (const language of ["ko", "en"] as const) {
    const d = report.comparison[language];
    lines.push(d
      ? `${language.toUpperCase()} changes: ${d.added.length} added IDs; ${d.removed.length} removed IDs; ${d.changed.length} changed unambiguous IDs; ${d.ambiguousMatches.length} ambiguous matches (${d.ambiguousMatches.filter((m) => m.contentChanged).length} with content-set changes); ${d.metadataChanges.length} metadata changes.`
      : `${language.toUpperCase()} changes: not compared because an input is invalid.`);
  }
  lines.push(report.coverageNote, "Use --json for every ID, conflicting record, missing-field count, and field-level change.");
  return `${lines.join("\n")}\n`;
}

/** No writes, dotenv loading, sync client imports or network calls. */
export function runIcnSnapshotQualityCli(args: string[], cwd: string): SnapshotCliResult {
  if (args.length === 1 && args[0] === "--help") return { exitCode: 0, stdout: USAGE, stderr: "" };
  const values = new Map<string, string>();
  const pathOptions = ["--baseline-ko", "--baseline-en", "--candidate-ko", "--candidate-en"];
  let json = false;
  const usageError = (): SnapshotCliResult => ({ exitCode: 2, stdout: "", stderr: `Invalid or missing arguments.\n${USAGE}` });
  for (let i = 0; i < args.length; i++) {
    const option = args[i];
    if (option === "--json" && !json) { json = true; continue; }
    if (!pathOptions.includes(option) || values.has(option) || !args[i + 1] || args[i + 1].startsWith("--")) return usageError();
    values.set(option, args[++i]);
  }
  if (!values.has("--candidate-ko") || !values.has("--candidate-en")) return usageError();
  // Runner cwd is the repository root; caller-relative paths retain the caller's cwd.
  const baselineKo = values.get("--baseline-ko") ?? path.resolve("src/data/fixtures/icn-facilities-ko.json");
  const baselineEn = values.get("--baseline-en") ?? path.resolve("src/data/fixtures/icn-facilities-en.json");
  const files = [baselineKo, baselineEn, values.get("--candidate-ko")!, values.get("--candidate-en")!];
  const roles = ["baseline.ko", "baseline.en", "candidate.ko", "candidate.en"];
  const inputs: unknown[] = [];
  const errors: { path: string; code: string; message: string }[] = [];
  files.forEach((file, i) => {
    let contents: string;
    try { contents = readFileSync(path.resolve(cwd, file), "utf8"); }
    catch {
      errors.push({ path: roles[i], code: "INPUT_READ_ERROR", message: "Could not read input file." });
      return;
    }
    try { inputs[i] = JSON.parse(contents); }
    catch { errors.push({ path: roles[i], code: "INVALID_JSON", message: "Input is not valid JSON." }); }
  });
  if (errors.length) {
    const result = { schemaVersion: 1, valid: false, reviewNeeded: true, publicationDecision: "not_assessed", errors };
    return { exitCode: 1, stderr: "", stdout: json ? `${JSON.stringify(result, null, 2)}\n` : `ICN snapshot quality: INVALID. No publication approval.\n${errors.map((e) => `${e.path}: ${e.code} — ${e.message}`).join("\n")}\n` };
  }
  const report = analyzeIcnSnapshots({ ko: inputs[0], en: inputs[1] }, { ko: inputs[2], en: inputs[3] });
  return { exitCode: report.valid ? 0 : 1, stdout: json ? `${JSON.stringify(report, null, 2)}\n` : summarizeIcnSnapshotQuality(report), stderr: "" };
}
