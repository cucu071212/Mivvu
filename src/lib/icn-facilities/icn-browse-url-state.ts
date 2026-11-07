import {
  ICN_BROWSE_CATEGORY_ALL,
  type IcnBrowseCategoryTaxonomy,
} from "./icn-browse-category-taxonomy";
import type { IcnBrowseHubFilters } from "./icn-browse-hub-filters";

/** Stable `/icn` query keys (GW-ICN-017). Locale is not stored here. */
export const ICN_BROWSE_URL_PARAM_QUERY = "q" as const;
export const ICN_BROWSE_URL_PARAM_TERMINAL = "terminal" as const;
export const ICN_BROWSE_URL_PARAM_TYPE = "type" as const;
export const ICN_BROWSE_URL_PARAM_SUBTYPE = "subtype" as const;

export const ICN_BROWSE_URL_PARAM_KEYS = [
  ICN_BROWSE_URL_PARAM_QUERY,
  ICN_BROWSE_URL_PARAM_TERMINAL,
  ICN_BROWSE_URL_PARAM_TYPE,
  ICN_BROWSE_URL_PARAM_SUBTYPE,
] as const;

export type IcnBrowseUrlValidationContext = {
  terminalValues: ReadonlySet<string>;
  taxonomy: IcnBrowseCategoryTaxonomy;
};

export type IcnBrowseUrlParseResult = {
  filters: IcnBrowseHubFilters;
  /** True when any browse param key appears in the input (even if values normalize away). */
  hadExplicitBrowseParams: boolean;
};

function firstParam(params: URLSearchParams, key: string): string | null {
  for (const value of params.getAll(key)) {
    const trimmed = value.trim();
    if (trimmed !== "") {
      return trimmed;
    }
  }
  return null;
}

export function icnBrowseUrlHasExplicitBrowseParams(
  search: string | URLSearchParams,
): boolean {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return ICN_BROWSE_URL_PARAM_KEYS.some((key) => params.has(key));
}

function resolveTerminal(raw: string | null, terminals: ReadonlySet<string>): string {
  if (!raw) return ICN_BROWSE_CATEGORY_ALL;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === ICN_BROWSE_CATEGORY_ALL) return ICN_BROWSE_CATEGORY_ALL;
  return terminals.has(trimmed) ? trimmed : ICN_BROWSE_CATEGORY_ALL;
}

function resolveType(raw: string | null, taxonomy: IcnBrowseCategoryTaxonomy): string {
  if (!raw) return ICN_BROWSE_CATEGORY_ALL;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === ICN_BROWSE_CATEGORY_ALL) return ICN_BROWSE_CATEGORY_ALL;
  const known = taxonomy.topLevel.some((row) => row.key === trimmed);
  return known ? trimmed : ICN_BROWSE_CATEGORY_ALL;
}

function resolveSubtype(
  typeKey: string,
  raw: string | null,
  taxonomy: IcnBrowseCategoryTaxonomy,
): string {
  if (typeKey === ICN_BROWSE_CATEGORY_ALL) return ICN_BROWSE_CATEGORY_ALL;
  if (!raw) return ICN_BROWSE_CATEGORY_ALL;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === ICN_BROWSE_CATEGORY_ALL) return ICN_BROWSE_CATEGORY_ALL;
  const top = taxonomy.topLevel.find((row) => row.key === typeKey);
  if (!top) return ICN_BROWSE_CATEGORY_ALL;
  const known = top.subcategories.some((row) => row.key === trimmed);
  return known ? trimmed : ICN_BROWSE_CATEGORY_ALL;
}

/** Parse and validate URL search into hub filters (defaults for invalid segments). */
export function parseIcnBrowseUrlState(
  search: string | URLSearchParams,
  context: IcnBrowseUrlValidationContext,
): IcnBrowseUrlParseResult {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const hadExplicitBrowseParams = icnBrowseUrlHasExplicitBrowseParams(params);
  const queryRaw = firstParam(params, ICN_BROWSE_URL_PARAM_QUERY);
  const query = queryRaw ?? "";
  const terminalFilter = resolveTerminal(
    firstParam(params, ICN_BROWSE_URL_PARAM_TERMINAL),
    context.terminalValues,
  );
  const categoryLarge = resolveType(firstParam(params, ICN_BROWSE_URL_PARAM_TYPE), context.taxonomy);
  const categoryMedium = resolveSubtype(
    categoryLarge,
    firstParam(params, ICN_BROWSE_URL_PARAM_SUBTYPE),
    context.taxonomy,
  );
  return {
    filters: { query, terminalFilter, categoryLarge, categoryMedium },
    hadExplicitBrowseParams,
  };
}

/** Serialize hub filters; omit default/empty browse values. */
export function serializeIcnBrowseUrlSearchParams(
  filters: IcnBrowseHubFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  const q = filters.query.trim();
  if (q) params.set(ICN_BROWSE_URL_PARAM_QUERY, q);
  if (
    filters.terminalFilter
    && filters.terminalFilter !== ICN_BROWSE_CATEGORY_ALL
  ) {
    params.set(ICN_BROWSE_URL_PARAM_TERMINAL, filters.terminalFilter);
  }
  if (
    filters.categoryLarge
    && filters.categoryLarge !== ICN_BROWSE_CATEGORY_ALL
  ) {
    params.set(ICN_BROWSE_URL_PARAM_TYPE, filters.categoryLarge);
    if (
      filters.categoryMedium
      && filters.categoryMedium !== ICN_BROWSE_CATEGORY_ALL
    ) {
      params.set(ICN_BROWSE_URL_PARAM_SUBTYPE, filters.categoryMedium);
    }
  }
  return params;
}

export function buildIcnBrowseUrlSearchString(filters: IcnBrowseHubFilters): string {
  const params = serializeIcnBrowseUrlSearchParams(filters);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/** Compare normalized search strings for loop-free history updates. */
export function icnBrowseUrlSearchStringsEquivalent(
  a: string,
  b: string,
): boolean {
  const left = a.startsWith("?") ? a.slice(1) : a;
  const right = b.startsWith("?") ? b.slice(1) : b;
  if (left === right) return true;
  const paramsA = new URLSearchParams(left);
  const paramsB = new URLSearchParams(right);
  return paramsA.toString() === paramsB.toString();
}
