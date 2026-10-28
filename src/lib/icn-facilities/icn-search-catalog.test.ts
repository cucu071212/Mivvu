import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildIcnBrowseCatalog, filterIcnBrowseItems } from "./icn-browse-view-model";
import { loadIcnFacilitiesFixture } from "./load-icn-facilities-fixture";

const hashes = {
  ko: "0bcde726d1800a1896cba3b73277689f2ab303c6f33aef15cee8ad74f4dfd2f4",
  en: "31e9ddbe9d47ebd86b9a4692f7d2cbebacf043d21d6fef0f40a4729fca69614a",
};

for (const locale of ["ko", "en"] as const) {
  describe(`${locale} shipped catalog regression`, () => {
    const fixture = loadIcnFacilitiesFixture(locale);
    const catalog = buildIcnBrowseCatalog(fixture, locale);
    it("preserves saved fixture bytes and empty-query membership/order in every terminal", () => {
      const bytes = readFileSync(`src/data/fixtures/icn-facilities-${locale}.json`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(hashes[locale]);
      expect(catalog.items).toHaveLength(1011);
      for (const terminal of ["all", ...catalog.terminals.map((t) => t.value), "unknown"]) {
        const expected = catalog.items.filter((item) => terminal === "all" || item.terminalId === terminal);
        expect(filterIcnBrowseItems(catalog.items, "", terminal, locale)).toEqual(expected);
        expect(filterIcnBrowseItems(catalog.items, " \t\n　", terminal, locale)).toEqual(expected);
      }
    });

    it("retains old contiguous-substring results sampled from every listing and field boundary", () => {
      const tag = locale === "ko" ? "ko-KR" : "en-US";
      const blobs = catalog.items.map((item) => [item.name, item.locationDescription, item.categoryLabel, item.terminalLabel]
        .filter(Boolean).join(" ").trim().toLocaleLowerCase(tag));
      const queries = new Set<string>();
      for (const item of catalog.items) {
        for (const field of [item.name, item.locationDescription, item.categoryLabel, item.terminalLabel]) {
          if (field) {
            queries.add(field);
            queries.add(field.slice(0, 3));
            queries.add(field.slice(-4));
          }
        }
        if (item.locationDescription) queries.add(item.name.slice(-3) + " " + item.locationDescription.slice(0, 3));
      }
      for (const query of queries) {
        const oldQuery = query.trim().toLocaleLowerCase(tag);
        const resultIds = new Set(filterIcnBrowseItems(catalog.items, query, "all", locale).map((item) => item.id));
        for (let i = 0; i < catalog.items.length; i++) {
          if (blobs[i].includes(oldQuery)) expect(resultIds.has(catalog.items[i].id), `${locale}: ${query} / ${catalog.items[i].id}`).toBe(true);
        }
      }
    });

    it("isolates all strong and recovered results to the selected terminal", () => {
      for (const terminal of catalog.terminals) {
        for (const query of ["ㅎㅈㅅ", "lounge", "starbcks", "248", " ＳＴＡＲＢＵＣＫＳ "]) {
          const results = filterIcnBrowseItems(catalog.items, query, terminal.value, locale);
          expect(results.every((item) => item.terminalId === terminal.value)).toBe(true);
        }
      }
    });
  });
}
