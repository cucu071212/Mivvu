import { describe, expect, it } from "vitest";
import type { Facility, FilterFacilities } from "@/types/airport";
import { filterFacilities } from "./filter-facilities";

function facility(
  id: string,
  name: string,
  category: Facility["category"],
): Facility {
  return {
    id,
    name,
    category,
    zone: "D",
    securityZone: "post",
    waitMinutes: null,
    activityMinutes: null,
    locationConfidence: "demo_estimate",
    timeConfidence: "unknown",
  };
}

// Synthetic fixtures; expectations are hand-ordered, not computed with the sorter.
const facilities: readonly Facility[] = [
  facility("zulu", "Zulu Market", "shop"),
  facility("coffee-lower", "alpha coffee", "coffee"),
  facility("beta", "Beta Kitchen", "food"),
  facility("coffee-title", "Alpha Coffee", "coffee"),
  facility("coffee-shop", "ALPHA COFFEE", "shop"),
];
const filter: FilterFacilities = filterFacilities;

describe("filterFacilities", () => {
  it.each([{}, { text: "" }, { text: " \t\n " }])(
    "sorts all facilities for an empty query %j and preserves base-equal ties",
    (query) => {
      expect(filter(facilities, query).map((item) => item.id)).toEqual([
        "coffee-lower",
        "coffee-title",
        "coffee-shop",
        "beta",
        "zulu",
      ]);
    },
  );

  it("trims text and matches case-insensitive substrings within names", () => {
    expect(filter(facilities, { text: "  Ha CoF  " }).map((item) => item.id))
      .toEqual(["coffee-lower", "coffee-title", "coffee-shop"]);
  });

  it("searches only the name, not IDs or location descriptions", () => {
    const rows = [{
      ...facility("secret-coffee", "Beta Kitchen", "food"),
      locationDescription: "Coffee counter near D7",
    }];
    expect(filter(rows, { text: "coffee" })).toEqual([]);
  });

  it("filters category and still sorts the matching facilities", () => {
    expect(filter(facilities, { category: "shop" }).map((item) => item.id))
      .toEqual(["coffee-shop", "zulu"]);
  });

  it("matches the requested zone without admitting an out-of-scope runtime row", () => {
    // Deliberately invalid runtime data to detect an omitted zone predicate.
    // E is never a production Zone or part of the real facility dataset.
    const outside = {
      ...facility("outside", "Outside Cafe", "coffee"),
      zone: "E",
    } as unknown as Facility;
    expect(filter([...facilities, outside], { zone: "D" }).map((item) => item.id))
      .toEqual(["coffee-lower", "coffee-title", "coffee-shop", "beta", "zulu"]);
  });

  it("combines text, category and zone with AND", () => {
    expect(filter(facilities, { text: "COFFEE", category: "shop", zone: "D" })
      .map((item) => item.id)).toEqual(["coffee-shop"]);
    expect(filter(facilities, { text: "coffee", category: "food", zone: "D" }))
      .toEqual([]);
  });

  it("uses en-US base alphabetical order, including accented names", () => {
    const rows = [
      facility("zebra", "Zebra", "shop"),
      facility("eclair", "Éclair", "food"),
      facility("eagle", "Eagle", "shop"),
      facility("apple", "apple", "food"),
    ];
    expect(filter(rows, {}).map((item) => item.id))
      .toEqual(["apple", "eagle", "eclair", "zebra"]);
  });

  it("returns no matches for an absent name or category", () => {
    expect(filter(facilities, { text: "missing" })).toEqual([]);
    expect(filter(facilities, { category: "charging" })).toEqual([]);
  });

  it("handles an empty input array", () => {
    expect(filter([], {})).toEqual([]);
    expect(filter([], { text: "coffee", category: "coffee", zone: "D" }))
      .toEqual([]);
  });

  it("does not mutate frozen inputs or query and returns deterministic results", () => {
    const rows = Object.freeze(facilities.map((item) => Object.freeze({ ...item })));
    const query = Object.freeze({ text: "coffee" });
    const result = filter(rows, query);
    expect(result.map((item) => item.id))
      .toEqual(["coffee-lower", "coffee-title", "coffee-shop"]);
    expect(filter(rows, query)).toEqual(result);
    expect(result).not.toBe(rows);
    expect(result[0]).toBe(rows[1]);
    expect(rows.map((item) => item.id))
      .toEqual(["zulu", "coffee-lower", "beta", "coffee-title", "coffee-shop"]);
    expect(query).toEqual({ text: "coffee" });
  });
});
