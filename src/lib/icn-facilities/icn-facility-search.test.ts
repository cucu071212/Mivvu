import { describe, expect, it } from "vitest";
import { buildIcnSearchIndex, getIcnSearchIndex, isOneLatinEditAway,
  matchesIcnSearchEntry, normalizeIcnSearchText, prepareIcnSearchQuery, rankIcnSearchEntry, searchIcnIndex,
} from "./icn-facility-search";
import { filterIcnBrowseItems, type IcnBrowseListItem } from "./icn-browse-view-model";

// Synthetic listings only: expectations specify search rules, not airport facts.
function item(id: string, name: string, fields: Partial<IcnBrowseListItem> = {}): IcnBrowseListItem {
  return { id, sourceId: id, name, terminalId: "P01", terminalLabel: "Terminal 1",
    floor: null, locationDescription: null, categoryLabel: null, hoursText: null, ...fields };
}
function search(items: IcnBrowseListItem[], query: string, terminal = "all") {
  return filterIcnBrowseItems(items, query, terminal, "en").map((row) => row.id);
}

describe("ICN local search contract", () => {
  it("normalizes canonical Unicode, case, width and whitespace without rewriting source", () => {
    const rows = [item("a", "Café Ａ１２ 화장실", { locationDescription: "Central   hall" })];
    expect(search(rows, "  CAFE\u0301 a12  화장실  ")).toEqual(["a"]);
    expect(search(rows, "central\t hall")).toEqual(["a"]);
    expect(rows[0].name).toBe("Café Ａ１２ 화장실");
  });

  it("requires every literal term across fields in any order", () => {
    const rows = [item("yes", "Blue Lounge", { locationDescription: "East gate 24", categoryLabel: "Rest" }),
      item("no", "Blue Lounge", { locationDescription: "West gate 25" })];
    expect(search(rows, "24 lounge east")).toEqual(["yes"]);
    expect(search(rows, "rest blue")).toEqual(["yes"]);
    expect(search(rows, "lounge east missing")).toEqual([]);
  });

  it("preserves contiguous substring matches including field boundaries", () => {
    const rows = [item("a", "Blue Lounge", { locationDescription: "East gate", categoryLabel: "Rest" })];
    for (const q of ["ue lou", "ounge east", "gate rest", "st terminal", "lounge"]) {
      expect(search(rows, q)).toEqual(["a"]);
    }
  });

  it("uses punctuation and regex/HTML syntax literally, including null fields", () => {
    const rows = [item("literal", "C++ [A].* <b> & Café (East)"), item("plain", "Cafe")];
    for (const q of ["c++", "[a].*", "<b>", "(east)", "&"]) expect(search(rows, q)).toEqual(["literal"]);
    for (const q of [".*", "[", "("]) expect(search(rows, q)).toEqual(["literal"]);
    expect(search(rows, "^.*$")).toEqual([]);
    expect(search(rows, "<img src=x onerror=alert(1)>")).toEqual([]);
    expect(search([item("null", "")], "null")).toEqual([]);
  });

  it("keeps distinct digits and compatibility numeric symbols distinct", () => {
    const rows = [item("01", "Gate01"), item("1", "Gate1"), item("2", "Gate2"), item("symbol", "Gate①²")];
    expect(search(rows, "gate０１")).toEqual(["01"]);
    expect(search(rows, "gate1")).toEqual(["1"]);
    expect(search(rows, "gate2")).toEqual(["2"]);
    expect(search(rows, "gate①")).toEqual(["symbol"]);
  });

  it("matches contiguous Korean initials in compatibility and leading-jamo forms", () => {
    const rows = [item("yes", "화장실"), item("gap", "화물 장비 시설"), item("reverse", "실장화")];
    for (const q of ["ㅎㅈㅅ", "ᄒᄌᄉ", "ㅎᄌㅅ"]) expect(search(rows, q)).toEqual(["yes"]);
    expect(search(rows, "ㅅㅈㅎ")).toEqual(["reverse"]);
    expect(search(rows, "ㅎㅅ")).toEqual([]);
  });

  it("keeps full syllables, Latin, digits and punctuation literal within mixed initial tokens", () => {
    const rows = [item("yes", "화장실A12-동"), item("digit", "화장실A21-동"),
      item("syllable", "황장실A12-동"), item("space", "화장실 A12-동")];
    expect(search(rows, "화ㅈㅅa12-ㄷ")).toEqual(["yes"]);
    // Contiguous mixed-script prefix precedes separated token matches.
    expect(search(rows, "ㅎㅈㅅ A12")).toEqual(["space", "yes", "syllable"]);
    expect(search(rows, "화ㅈㅅa12ㄷ")).toEqual([]);
    expect(search([item("tense", "까페"), item("plain", "카페")], "ㄲㅍ")).toEqual(["tense"]);
  });

  it("does not join initials across fields or silently search another language", () => {
    expect(search([item("a", "화", { locationDescription: "장실" })], "ㅎㅈㅅ")).toEqual([]);
    expect(search([item("a", "Toilet")], "화장실")).toEqual([]);
    expect(search([item("a", "화장실")], "hwajangsil")).toEqual([]);
  });

  it("recovers one insertion, deletion or substitution in a whole long Latin name word", () => {
    const rows = [item("a", "Starbucks Coffee", { locationDescription: "East gate 24" })];
    for (const q of ["starbuckss", "starbcks", "starbucxs", "24 starbcks east"]) expect(search(rows, q)).toEqual(["a"]);
    expect(search(rows, "starbcks missing")).toEqual([]);
    expect(search(rows, "starbcks coffxe")).toEqual([]); // At most one edited query token.
    expect(search(rows, "stabrucsk")).toEqual([]);
  });

  it("does not fuzzy-match short words, digits, embedded alphanumeric words or location paragraphs", () => {
    const rows = [item("a", "Cafe Lounge T1 Gate12 ABCDE1", { locationDescription: "Information counter terminal 2" })];
    for (const q of ["caff", "loune", "t2", "gate13", "abcdf", "informtion", "termnal", "terminal 3"]) {
      // loune has five letters and is a valid one-deletion recovery for lounge.
      expect(search(rows, q)).toEqual(q === "loune" ? ["a"] : []);
    }
    expect(search([item("short", "Cafe")], "cafee")).toEqual([]);
    expect(search([item("digits", "Lounge2")], "loungf")).toEqual([]);
  });

  it("uses zero-results fallback only inside the active terminal", () => {
    const rows = [item("exact", "Starbcks", { terminalId: "P03", terminalLabel: "Terminal 2" }),
      item("typo", "Starbucks"), item("other-field", "Shop", { locationDescription: "starbcks" })];
    expect(search(rows, "starbcks")).toEqual(["exact", "other-field"]);
    expect(search(rows.slice(0, 2), "starbcks", "P01")).toEqual(["typo"]);
    expect(search(rows, "starbcks", "P03")).toEqual(["exact"]);
    expect(search(rows, "starbcks", "unknown")).toEqual([]);
  });

  it("ranks exact name then name prefix/tokens, name substrings, other fields with stable ties", () => {
    const rows = [item("field", "Shop", { locationDescription: "Lounge" }), item("infix", "SkyLounge"),
      item("token", "Blue Lounge"), item("prefix", "Lounge East"), item("exact", "Lounge"), item("tie", "Lounge")];
    expect(search(rows, "lounge")).toEqual(["exact", "tie", "token", "prefix", "infix", "field"]);
    expect(search(rows, "blue lounge")).toEqual(["token"]);
    expect(search(rows, "  ")).toEqual(rows.map((r) => r.id));
    expect(search(rows, "")).toEqual(rows.map((r) => r.id));
  });
});


describe("independently usable search stages", () => {
  it("normalizes nulls and width without broad numeric/diacritic compatibility folding", () => {
    expect(normalizeIcnSearchText(null)).toBe("");
    expect(normalizeIcnSearchText(undefined)).toBe("");
    expect(normalizeIcnSearchText("  Ａ０１　CAFE\u0301 ᄒᄌᄉ  ")).toBe("a01 café ㅎㅈㅅ");
    expect(normalizeIcnSearchText("① ² 01 1")).toBe("① ² 01 1");
    expect(normalizeIcnSearchText("café")).not.toBe(normalizeIcnSearchText("cafe"));
  });

  it("separates indexing, matching and ranking without mutating items", () => {
    const rows = [item("a", "Lounge", { locationDescription: "East" }), item("b", "Shop")];
    const before = JSON.stringify(rows);
    const index = buildIcnSearchIndex(rows, "en");
    const query = prepareIcnSearchQuery(" LOUNGE east ");
    expect(matchesIcnSearchEntry(index.entries[0], query)).toBe(true);
    expect(matchesIcnSearchEntry(index.entries[1], query)).toBe(false);
    expect(rankIcnSearchEntry(index.entries[0], prepareIcnSearchQuery("lounge"))).toBe(0);
    expect(searchIcnIndex(index, "")).toEqual(rows);
    expect(searchIcnIndex(index, "")[0]).toBe(rows[0]);
    expect(JSON.stringify(rows)).toBe(before);
  });

  it("reuses indexes by immutable catalog identity and locale, replacing them for new snapshots", () => {
    const rows = [item("a", "Alpha")];
    const first = getIcnSearchIndex(rows, "en");
    expect(getIcnSearchIndex(rows, "en")).toBe(first);
    expect(getIcnSearchIndex(rows, "ko")).not.toBe(first);
    expect(getIcnSearchIndex([...rows], "en")).not.toBe(first);
    expect(getIcnSearchIndex(rows, "en")).toBe(first);
  });

  it("bounds edit distance independently, including accented Latin and ends of words", () => {
    for (const [q, word] of [["xcoffee", "coffee"], ["coffxee", "coffee"], ["coffeex", "coffee"],
      ["offee", "coffee"], ["cofee", "coffee"], ["coffe", "coffee"], ["xoffee", "coffee"],
      ["coffxe", "coffee"], ["coffex", "coffee"], ["caféterix", "caféteria"]]) {
      expect(isOneLatinEditAway(q, word), `${q} / ${word}`).toBe(true);
    }
    for (const [q, word] of [["coffee", "coffee"], ["coff", "coffee"], ["cofefe", "coffee"],
      ["cofxxe", "coffee"], ["cafe1", "cafe2"], ["lounge", "lounge2"], ["café", "cafés"]]) {
      expect(isOneLatinEditAway(q, word), `${q} / ${word}`).toBe(false);
    }
  });
});


describe("relevance boundaries observed in the saved catalogs", () => {
  it("prefers a whole initial-name match over a longer name containing the same initials", () => {
    const rows = [item("long", "은행 환전소(입국장)"), item("exact", "화장실"), item("prefix", "화장실 안내")];
    expect(search(rows, "ㅎㅈㅅ")).toEqual(["exact", "prefix", "long"]);
    expect(search(rows, "화ㅈㅅ")).toEqual(["exact", "prefix"]);
  });

  it("does not recover terminal words even when embedded in facility names", () => {
    const rows = [item("name", "Culinary Square(Terminal 1)"),
      item("concourse", "Shop Concourse", { terminalLabel: "Concourse" }),
      item("transport", "Transportation Center Shop", { terminalLabel: "Transportation Center 1" })];
    for (const q of ["termnal", "concoursf", "transportatioon", "centxr"]) expect(search(rows, q)).toEqual([]);
    expect(search(rows, "culinry")).toEqual(["name"]);
    expect(search(rows, "terminal")).toEqual(["name"]);
  });
});
