import type {
  IcnFacilitiesFixture,
  IcnFacilityBrowseRecord,
} from "@/types/icn-facility-browse";
import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";

export type IcnBrowseListItem = {
  /** Stable key for React lists (`browse-{listingIndex}` of kept row). */
  id: string;
  sourceId: string;
  name: string;
  terminalId: string | null;
  terminalLabel: string | null;
  floor: string | null;
  locationDescription: string | null;
  categoryLabel: string | null;
  hoursText: string | null;
};

export type IcnTerminalFilterOption = {
  value: string;
  /** Full terminal name for accessibility and search. */
  label: string;
  /** Short label for horizontally scrolled filter chips. */
  chipLabel: string;
};

export type IcnBrowseCatalogSnapshot = {
  retrievedDateLabel: string;
  sourceLabel: string;
  coverageNote: string;
  listingCount: number;
};

export type IcnBrowseCatalog = {
  items: IcnBrowseListItem[];
  terminals: IcnTerminalFilterOption[];
  snapshot: IcnBrowseCatalogSnapshot;
};

const TERMINAL_LABELS_KO: Record<string, string> = {
  P01: "제1여객터미널",
  P03: "제2여객터미널",
  /** API uses P02 for concourse-area rows; locations in fixtures reference 탑승동 (see icn-api-verification G01). */
  P02: "탑승동",
  G01: "탑승동",
  G02: "제1교통센터",
  G03: "제2교통센터",
};

const TERMINAL_LABELS_EN: Record<string, string> = {
  P01: "Terminal 1",
  P03: "Terminal 2",
  P02: "Concourse",
  G01: "Concourse",
  G02: "Transportation Center 1",
  G03: "Transportation Center 2",
};

const TERMINAL_CHIP_LABELS: Record<string, { ko: string; en: string }> = {
  P01: { ko: "T1", en: "T1" },
  P03: { ko: "T2", en: "T2" },
  P02: { ko: "탑승동", en: "Concourse" },
  G01: { ko: "탑승동", en: "Concourse" },
  G02: { ko: "교통1", en: "TC1" },
  G03: { ko: "교통2", en: "TC2" },
};

export function icnFacilityContentFingerprint(
  record: Omit<IcnFacilityBrowseRecord, "listingIndex">,
): string {
  return JSON.stringify({
    sourceId: record.sourceId,
    name: record.name,
    categories: record.categories,
    terminalId: record.terminalId,
    floor: record.floor,
    locationDescription: record.locationDescription,
    hoursText: record.hoursText,
    arrivalOrDeparture: record.arrivalOrDeparture,
    dutyFreeFlag: record.dutyFreeFlag,
  });
}

export function formatIcnTerminalLabel(
  terminalId: string | null,
  locale: MivvuPreviewLocale = "ko",
): string | null {
  if (!terminalId) return null;
  const table = locale === "ko" ? TERMINAL_LABELS_KO : TERMINAL_LABELS_EN;
  const known = table[terminalId];
  if (known) return known;
  return locale === "ko" ? `터미널 ${terminalId}` : `Terminal ${terminalId}`;
}

export function formatIcnTerminalChipLabel(
  terminalId: string,
  locale: MivvuPreviewLocale,
): string {
  const chip = TERMINAL_CHIP_LABELS[terminalId];
  if (chip) return locale === "ko" ? chip.ko : chip.en;
  return formatIcnTerminalLabel(terminalId, locale) ?? terminalId;
}

/** Compact terminal token for facility cards (e.g. T1 · 3층). */
export function formatIcnTerminalShortToken(
  terminalId: string | null,
  locale: MivvuPreviewLocale,
): string | null {
  if (!terminalId) return null;
  const chip = TERMINAL_CHIP_LABELS[terminalId];
  if (chip) return locale === "ko" ? chip.ko : chip.en;
  return formatIcnTerminalLabel(terminalId, locale);
}

export function formatIcnFloorLabel(
  floor: string | null,
  locale: MivvuPreviewLocale = "ko",
): string | null {
  if (!floor) return null;
  const trimmed = floor.trim();
  if (!trimmed) return null;
  if (/^F\d+$/i.test(trimmed)) {
    const level = trimmed.slice(1);
    return locale === "ko" ? `${level}층` : `Level ${level}`;
  }
  if (/^\d+F$/i.test(trimmed)) {
    const level = trimmed.slice(0, -1);
    return locale === "ko" ? `${level}층` : `Level ${level}`;
  }
  return trimmed;
}

export function formatIcnTerminalFloorLine(
  terminalId: string | null,
  floor: string | null,
  locale: MivvuPreviewLocale = "ko",
): string | null {
  const terminal = formatIcnTerminalShortToken(terminalId, locale);
  const level = formatIcnFloorLabel(floor, locale);
  if (terminal && level) return `${terminal} · ${level}`;
  return terminal ?? level;
}

function formatCategoryLabel(record: IcnFacilityBrowseRecord): string | null {
  const parts = [record.categories.large, record.categories.medium, record.categories.small]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  if (parts.length === 0) return null;
  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.includes(part)) unique.push(part);
  }
  return unique.join(" · ");
}

function collapseDuplicateListings(records: IcnFacilityBrowseRecord[]): IcnFacilityBrowseRecord[] {
  const kept = new Map<string, IcnFacilityBrowseRecord>();
  const sorted = [...records].sort((a, b) => a.listingIndex - b.listingIndex);

  for (const record of sorted) {
    const key = `${record.sourceId}::${icnFacilityContentFingerprint(record)}`;
    if (!kept.has(key)) {
      kept.set(key, record);
    }
  }

  return [...kept.values()].sort((a, b) => a.listingIndex - b.listingIndex);
}

function toListItem(
  record: IcnFacilityBrowseRecord,
  locale: MivvuPreviewLocale,
): IcnBrowseListItem {
  return {
    id: `browse-${record.listingIndex}`,
    sourceId: record.sourceId,
    name: record.name,
    terminalId: record.terminalId,
    terminalLabel: formatIcnTerminalLabel(record.terminalId, locale),
    floor: record.floor,
    locationDescription: record.locationDescription,
    categoryLabel: formatCategoryLabel(record),
    hoursText: record.hoursText,
  };
}

function buildTerminalOptions(
  items: IcnBrowseListItem[],
  locale: MivvuPreviewLocale,
): IcnTerminalFilterOption[] {
  const ids = new Set<string>();
  for (const item of items) {
    if (item.terminalId) ids.add(item.terminalId);
  }
  return [...ids]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      value,
      label: formatIcnTerminalLabel(value, locale) ?? value,
      chipLabel: formatIcnTerminalChipLabel(value, locale),
    }));
}

function formatRetrievedDate(iso: string, locale: MivvuPreviewLocale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const SNAPSHOT_COPY: Record<
  MivvuPreviewLocale,
  { sourceLabel: string; coverageNote: string }
> = {
  ko: {
    sourceLabel: "인천국제공항공사 공공데이터 (여객터미널 시설정보)",
    coverageNote:
      "저장된 목록 스냅샷입니다. 실시간 개장 여부, 대기시간, 좌표, 도보 시간은 포함되지 않으며 공항 전체를 모두 담고 있지 않을 수 있습니다.",
  },
  en: {
    sourceLabel: "Incheon Airport public data (terminal facilities listing)",
    coverageNote:
      "Saved listing snapshot only. Not live open/closed status, wait times, maps, or walking times. May not include every facility at the airport.",
  },
};

export function buildIcnBrowseCatalog(
  fixture: IcnFacilitiesFixture,
  locale: MivvuPreviewLocale,
): IcnBrowseCatalog {
  const collapsed = collapseDuplicateListings(fixture.facilities);
  const items = collapsed.map((record) => toListItem(record, locale));

  return {
    items,
    terminals: buildTerminalOptions(items, locale),
    snapshot: {
      retrievedDateLabel: formatRetrievedDate(fixture.meta.retrievedAt, locale),
      sourceLabel: SNAPSHOT_COPY[locale].sourceLabel,
      coverageNote: SNAPSHOT_COPY[locale].coverageNote,
      listingCount: items.length,
    },
  };
}

function normalizeSearchText(value: string, locale: MivvuPreviewLocale): string {
  const tag = locale === "ko" ? "ko-KR" : "en-US";
  return value.trim().toLocaleLowerCase(tag);
}

function itemSearchBlob(item: IcnBrowseListItem, locale: MivvuPreviewLocale): string {
  return normalizeSearchText(
    [item.name, item.locationDescription, item.categoryLabel, item.terminalLabel]
      .filter(Boolean)
      .join(" "),
    locale,
  );
}

export function filterIcnBrowseItems(
  items: IcnBrowseListItem[],
  query: string,
  terminalFilter: string,
  locale: MivvuPreviewLocale = "ko",
): IcnBrowseListItem[] {
  const normalizedQuery = normalizeSearchText(query, locale);
  const terminal = terminalFilter === "all" ? null : terminalFilter;

  return items.filter((item) => {
    if (terminal && item.terminalId !== terminal) return false;
    if (!normalizedQuery) return true;
    return itemSearchBlob(item, locale).includes(normalizedQuery);
  });
}
