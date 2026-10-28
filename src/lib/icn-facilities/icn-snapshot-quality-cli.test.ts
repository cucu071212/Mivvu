import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, describe, it } from "vitest";
import { runIcnSnapshotQualityCli } from "./icn-snapshot-quality-cli";

const ko = path.resolve("src/data/fixtures/icn-facilities-ko.json");
const en = path.resolve("src/data/fixtures/icn-facilities-en.json");
const args = ["--candidate-ko", ko, "--candidate-en", en];
const dir = mkdtempSync(path.join(os.tmpdir(), "gw-icn-007-cli-test-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("offline snapshot CLI", () => {
  it("emits parseable deterministic JSON and never writes to its four input files", () => {
    const baselineKo = path.join(dir, "baseline-ko.json"), baselineEn = path.join(dir, "baseline-en.json");
    const candidateKo = path.join(dir, "candidate-ko.json"), candidateEn = path.join(dir, "candidate-en.json");
    for (const [target, source] of [[baselineKo, ko], [baselineEn, en], [candidateKo, ko], [candidateEn, en]]) writeFileSync(target, readFileSync(source));
    const files = [baselineKo, baselineEn, candidateKo, candidateEn, ko, en];
    const before = files.map((p) => readFileSync(p));
    const invocation = ["--baseline-ko", baselineKo, "--baseline-en", baselineEn, "--candidate-ko", candidateKo, "--candidate-en", candidateEn, "--json"];
    const result = runIcnSnapshotQualityCli(invocation, dir);
    assert.equal(result.exitCode, 0);
    assert.equal(result.stderr, "");
    const report = JSON.parse(result.stdout);
    assert.equal(report.valid, true);
    assert.equal(report.candidate.ko.counts.rawRows, 1028);
    assert.equal(report.candidate.en.metadata.apiReportedTotalCount, 1175);
    assert.equal(report.reviewNeeded, true);
    assert.equal(report.publicationDecision, "not_assessed");
    assert.deepEqual(runIcnSnapshotQualityCli(invocation, dir), result);
    files.forEach((p, i) => assert.deepEqual(readFileSync(p), before[i]));
  });

  it("prints a concise summary retaining warnings, missing data, coverage and change counts", () => {
    const result = runIcnSnapshotQualityCli(args, process.cwd());
    assert.equal(result.exitCode, 0);
    for (const phrase of [/VALID/, /1028 raw/, /1011 listings/, /1175/, /api_total_mismatch/, /hoursText=84/, /categories.large=164/, /0 added/, /0 removed/, /0 changed/, /No publication approval/]) assert.match(result.stdout, phrase);
    assert.ok(result.stdout.split("\n").length < 35);
  });

  it.each(["null", "{broken json", JSON.stringify({ meta: {}, facilities: [] })])("returns exit 1 for invalid input %s with JSON diagnostics", (contents) => {
    const file = path.join(dir, "invalid.json");
    writeFileSync(file, contents);
    const result = runIcnSnapshotQualityCli(["--candidate-ko", file, "--candidate-en", en, "--json"], process.cwd());
    assert.equal(result.exitCode, 1);
    assert.equal(JSON.parse(result.stdout).valid, false);
    assert.equal(readFileSync(file, "utf8"), contents);
  });

  it("returns a bounded read diagnostic without echoing file contents or internal exception text", () => {
    const result = runIcnSnapshotQualityCli(["--candidate-ko", path.join(dir, "absent.json"), "--candidate-en", en, "--json"], process.cwd());
    assert.equal(result.exitCode, 1);
    assert.equal(JSON.parse(result.stdout).errors[0].code, "INPUT_READ_ERROR");
    assert.doesNotMatch(result.stdout, /ENOENT|stack|absent.json/);
  });

  it.each([[], ["--candidate-ko", ko], [...args, "--output", ko], [...args, "--json", "--json"], [...args, "--baseline-ko"], [...args, "--unexpected"]].map((invocation) => [invocation]))("rejects invalid/unsupported arguments %j", (invocation) => {
    const result = runIcnSnapshotQualityCli(invocation, process.cwd());
    assert.equal(result.exitCode, 2);
    assert.match(result.stderr, /Usage:/);
  });

  it("provides help without files or credentials", () => {
    const result = runIcnSnapshotQualityCli(["--help"], dir);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, /--candidate-ko/);
  });

  it("exposes JSON via the documented Node entry point without runner chatter", () => {
    const result = spawnSync(process.execPath, ["scripts/check-icn-snapshots.mjs", ...args, "--json"], {
      encoding: "utf8", timeout: 30_000, env: { ...process.env, DATA_GO_KR_SERVICE_KEY: "", ICN_SYNC: "0", ICN_INVESTIGATE: "0" },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).candidate.ko.counts.collapsedListings, 1011);
    assert.equal(result.stderr, "");
  });
});
