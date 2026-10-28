import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import { performance } from "node:perf_hooks";
import { expect, it } from "vitest";
import { buildIcnBrowseCatalog } from "./icn-browse-view-model";
import { buildIcnSearchIndex, searchIcnIndex } from "./icn-facility-search";
import { loadIcnFacilitiesFixture } from "./load-icn-facilities-fixture";

// Opt-in offline evidence, not a timing gate. Run this file alone to reduce contention.
it.skipIf(process.env.ICN_SEARCH_EVIDENCE !== "1")("records real-catalog relevance and performance distributions", () => {
  function distribution(samples: number[]) {
    const sorted = [...samples].sort((a, b) => a - b);
    const at = (p: number) => sorted[Math.ceil(p * sorted.length) - 1];
    return { samples: sorted.length, min: sorted[0], p50: at(0.5), p95: at(0.95), max: sorted.at(-1) };
  }
  function time(fn: () => unknown) { const start = performance.now(); fn(); return performance.now() - start; }
  const scenarios = {
    ko: [
      { query: "", terminal: "all", expected: "All 1011 in saved catalog order", reject: [] },
      { query: "ㅎㅈㅅ", terminal: "P03", expected: "Contiguous initials in T2; full-name 화장실 precedes longer matching names; 환전소 can also match", reject: ["ㅅㅈㅎ", "ㅎㅈㅅzz"] },
      { query: "ᄒᄌᄉ", terminal: "P03", expected: "Same results as compatibility initials", reject: [] },
      { query: "248 스타벅스", terminal: "P03", expected: "Name plus numeric location, any token order", reject: ["249 스타벅스"] },
      { query: "스타벅스", terminal: "all", expected: "Exact names before book-cafe name inclusion", reject: ["스타벅스zzz"] },
      { query: "^.*$", terminal: "all", expected: "Regex-shaped literal has no results", reject: [] },
      { query: "Starbucks", terminal: "all", expected: "No hidden English-catalog lookup", reject: [] },
    ],
    en: [
      { query: "", terminal: "all", expected: "All 1011 in saved catalog order", reject: [] },
      { query: "ＳＴＡＲＢＵＣＫＳ", terminal: "all", expected: "Same normalized name matches as Starbucks", reject: [] },
      { query: "248 starbucks", terminal: "P03", expected: "Name plus numeric location, T2 only", reject: ["249 starbucks"] },
      { query: "starbcks", terminal: "P03", expected: "Single deletion in name, zero strong hits, T2 only", reject: ["stabrucsk"] },
      { query: "loune", terminal: "P01", expected: "Five-letter deletion recovery in name, T1 only", reject: ["lounx", "loune 99999"] },
      { query: "termnal", terminal: "all", expected: "No typo recovery of terminal location paragraphs", reject: [] },
      { query: "화장실", terminal: "all", expected: "No hidden Korean-catalog lookup", reject: [] },
      { query: '<img src=x onerror=alert(1)>', terminal: "all", expected: "Literal syntax, no results or executable HTML", reject: [] },
    ],
  };
  const catalogs = {} as Record<string, unknown>;
  for (const locale of ["ko", "en"] as const) {
    const catalog = buildIcnBrowseCatalog(loadIcnFacilitiesFixture(locale), locale);
    expect(catalog.items).toHaveLength(1011);
    for (let n = 0; n < 25; n++) buildIcnSearchIndex(catalog.items, locale);
    const buildMs = distribution(Array.from({ length: 150 }, () => time(() => buildIcnSearchIndex(catalog.items, locale))));
    const index = buildIcnSearchIndex(catalog.items, locale);
    const queries = scenarios[locale].map((scenario) => {
      for (let n = 0; n < 50; n++) searchIcnIndex(index, scenario.query, scenario.terminal);
      const warmMs = distribution(Array.from({ length: 300 }, () => time(() => searchIcnIndex(index, scenario.query, scenario.terminal))));
      const result = searchIcnIndex(index, scenario.query, scenario.terminal);
      return { ...scenario, count: result.length,
        top: result.slice(0, 3).map(({ sourceId, name, terminalId, locationDescription }) => ({ sourceId, name, terminalId, locationDescription })),
        rejectedNearMatches: scenario.reject.map((query) => ({ query, count: searchIcnIndex(index, query, scenario.terminal).length })), warmMs };
    });
    catalogs[locale] = { listings: catalog.items.length, buildMs, queries };
  }
  const sourceFiles = ["src/lib/icn-facilities/icn-facility-search.ts", "src/lib/icn-facilities/icn-browse-view-model.ts",
    "src/lib/icn-facilities/icn-search-evidence.test.ts", "src/data/fixtures/icn-facilities-ko.json", "src/data/fixtures/icn-facilities-en.json"];
  const result = { task: "GW-ICN-008", base: "5bd3121f6aac992ac1b5d59e33c1e68d65c40170",
    environment: { node: process.version, platform: os.platform(), arch: os.arch(), os: os.release(), cpu: os.cpus()[0]?.model },
    method: "Offline Vitest/Node, serial per locale/scenario, performance.now milliseconds. 25 build warmups then 150 index builds; one reusable index, 50 query warmups then 300 individual query timings per scenario. Includes filtering/ranking, excludes catalog creation, React/DOM, network, UI latency; no mobile-speed claims or timing assertions. GC/scheduler outliers retained.",
    sourceSha256: Object.fromEntries(sourceFiles.map((path) => [path, createHash("sha256").update(readFileSync(path)).digest("hex")])), catalogs };
  writeFileSync("docs/handoffs/GW-ICN-008-search-evidence.json", JSON.stringify(result, null, 2) + "\n");
}, 60_000);
