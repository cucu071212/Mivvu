import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import type { IcnBrowseListItem } from "./icn-browse-view-model";

const INITIALS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const LATIN_WORD = /^\p{Script=Latin}{5,}$/u;

/** Targeted width folding, not NFKC: ①, ² and 1/2 remain distinct. */
export function normalizeIcnSearchText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/[\uFF01-\uFF5E]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\u1100-\u1112]/g, (char) => INITIALS[char.charCodeAt(0) - 0x1100])
    .replace(/\s+/g, " ")
    .trim();
}

function initialsOf(text: string): string {
  return text.replace(/[가-힣]/g, (char) => INITIALS[Math.floor((char.charCodeAt(0) - 0xac00) / 588)]);
}

type SearchField = Readonly<{ text: string; initials: string }>;
export type IcnSearchEntry = Readonly<{
  item: IcnBrowseListItem;
  ordinal: number;
  fields: readonly SearchField[];
  nameWords: readonly string[];
  latinNameWords: readonly string[];
}>;
export type IcnSearchIndex = Readonly<{
  locale: MivvuPreviewLocale;
  entries: readonly IcnSearchEntry[];
}>;
export type IcnSearchQuery = Readonly<{
  text: string;
  tokens: readonly Readonly<{ text: string; hasInitials: boolean }>[];
}>;

export function prepareIcnSearchQuery(query: string): IcnSearchQuery {
  const text = normalizeIcnSearchText(query);
  return {
    text,
    tokens: text ? text.split(" ").map((token) => ({
      text: token,
      hasInitials: [...token].some((char) => INITIALS.includes(char)),
    })) : [],
  };
}

/** Pure client-safe index; caller supplies one locale's immutable catalog only. */
export function buildIcnSearchIndex(
  items: readonly IcnBrowseListItem[],
  locale: MivvuPreviewLocale,
): IcnSearchIndex {
  return {
    locale,
    entries: items.map((item, ordinal) => {
      const fields = [item.name, item.locationDescription, item.categoryLabel, item.terminalLabel]
        .map((value) => {
          const text = normalizeIcnSearchText(value);
          return { text, initials: initialsOf(text) };
        });
      // Unicode word boundaries prevent taking Latin fragments out of Lounge2 or 한Lounge.
      const nameWords = fields[0].text.match(/[\p{L}\p{M}\p{N}_]+/gu) ?? [];
      const terminalWords = new Set([
        "terminal", "concourse",
        ...(fields[3].text.match(/[\p{L}\p{M}\p{N}_]+/gu) ?? []),
        normalizeIcnSearchText(item.terminalId),
      ]);
      return {
        item, ordinal, fields, nameWords,
        latinNameWords: nameWords.filter((word) => LATIN_WORD.test(word) && !terminalWords.has(word)),
      };
    }),
  };
}

function matchesAt(field: SearchField, text: string, start: number): boolean {
  if (start + text.length > field.text.length) return false;
  for (let offset = 0; offset < text.length; offset++) {
    const char = text[offset];
    if (char !== field.text[start + offset] &&
        !(INITIALS.includes(char) && char === field.initials[start + offset])) return false;
  }
  return true;
}

function fieldMatches(field: SearchField, token: IcnSearchQuery["tokens"][number]): boolean {
  if (field.text.includes(token.text)) return true;
  if (!token.hasInitials) return false;
  // Each initial consumes exactly one character. Never skip syllables, spaces or punctuation.
  for (let start = 0; start <= field.text.length - token.text.length; start++) {
    if (matchesAt(field, token.text, start)) return true;
  }
  return false;
}

/** Lower is better; the ordinal is a separate, explicit tie-breaker. */
export function rankIcnSearchEntry(entry: IcnSearchEntry, query: IcnSearchQuery): number {
  const name = entry.fields[0];
  if (name.text === query.text) return 0;
  const prefix = matchesAt(name, query.text, 0);
  if (prefix && name.text.length === query.text.length) return 1; // Whole mixed/initial name.
  if (prefix || query.tokens.every((token) => entry.nameWords.includes(token.text))) return 2;
  if (query.tokens.some((token) => fieldMatches(name, token))) return 3;
  return 4;
}

export function matchesIcnSearchEntry(entry: IcnSearchEntry, query: IcnSearchQuery): boolean {
  return query.tokens.every((token) => entry.fields.some((field) => fieldMatches(field, token)));
}

/** Exactly one insertion, deletion or substitution; no transpositions. Linear and bounded. */
export function isOneLatinEditAway(query: string, word: string): boolean {
  if (!LATIN_WORD.test(query) || !LATIN_WORD.test(word)) return false;
  const left = [...query];
  const right = [...word];
  if (Math.abs(left.length - right.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (left.length >= right.length) i++;
    if (right.length >= left.length) j++;
  }
  return edits + Number(i < left.length || j < right.length) === 1;
}

function matchesWithOneTypo(entry: IcnSearchEntry, query: IcnSearchQuery): boolean {
  let recovered = false;
  for (const token of query.tokens) {
    if (entry.fields.some((field) => fieldMatches(field, token))) continue;
    if (recovered || !entry.latinNameWords.some((word) => isOneLatinEditAway(token.text, word))) return false;
    recovered = true;
  }
  return recovered;
}

export function searchIcnIndex(index: IcnSearchIndex, query: string, terminalFilter = "all"): IcnBrowseListItem[] {
  const prepared = prepareIcnSearchQuery(query);
  const eligible = index.entries.filter((entry) => terminalFilter === "all" || entry.item.terminalId === terminalFilter);
  if (!prepared.tokens.length) return eligible.map((entry) => entry.item);
  const strong = eligible.filter((entry) => matchesIcnSearchEntry(entry, prepared));
  const matches = strong.length ? strong : eligible.filter((entry) => matchesWithOneTypo(entry, prepared));
  return matches.map((entry) => ({ entry, rank: rankIcnSearchEntry(entry, prepared) }))
    .sort((a, b) => a.rank - b.rank || a.entry.ordinal - b.entry.ordinal)
    .map(({ entry }) => entry.item);
}

// Catalog arrays are immutable snapshots. A new array creates a fresh index; unreachable
// catalogs can be collected. Locale switches reuse the earlier locale's index as well.
const cachedIndexes = new WeakMap<readonly IcnBrowseListItem[], Map<MivvuPreviewLocale, IcnSearchIndex>>();
export function getIcnSearchIndex(items: readonly IcnBrowseListItem[], locale: MivvuPreviewLocale): IcnSearchIndex {
  let byLocale = cachedIndexes.get(items);
  if (!byLocale) { byLocale = new Map(); cachedIndexes.set(items, byLocale); }
  let index = byLocale.get(locale);
  if (!index) { index = buildIcnSearchIndex(items, locale); byLocale.set(locale, index); }
  return index;
}
