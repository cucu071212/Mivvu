/**
 * GW-ICN-019 static prototype (revision 2) — browse, detail, saved.
 */

const MESSAGES = {
  ko: {
    backAirport: "공항 선택",
    backBrowse: "시설 목록",
    title: "인천공항 시설",
    savedTitle: "저장한 시설",
    searchLabel: "시설 검색",
    searchPlaceholder: "시설명, 위치, 카테고리",
    searchHint: "한국어로 검색",
    terminalLabel: "터미널",
    terminalAll: "전체",
    categoryLabel: "유형",
    categoryAll: "전체 유형",
    categoryChoose: "유형 선택",
    clearFilters: "필터 초기화",
    empty: "조건에 맞는 시설이 없습니다. 검색어 또는 필터를 바꿔 보세요.",
    hoursLabel: "운영 시간",
    hoursNoteInline: "목록에 적힌 시간이며, 지금 영업 중인지는 알 수 없습니다.",
    hoursUnknown: "운영시간 확인 필요",
    hoursAmbiguous: "운영시간 확인 필요",
    koOnlyName: "영문 이름이 없어 한국어 이름을 표시합니다",
    koOnlyLocation: "영문 위치가 없어 한국어 위치를 표시합니다",
    listingInfoTitle: "목록 정보",
    listingSource: "출처",
    listingCollected: "수집일",
    countPreview: (shown, preview, full) =>
      `${shown}개 표시 · 미리보기 ${preview}개 · 전체 목록 ${full}개`,
    savedEntry: "저장",
    savedEmpty: "저장한 시설이 없습니다. 시설 상세에서 저장할 수 있습니다.",
    savedLocalNote: "이 기기에만 저장됩니다. 계정이나 다른 기기와 동기화되지 않습니다.",
    save: "저장",
    saved: "저장됨",
    removeSaved: "저장에서 제거",
    saveOk: "저장했습니다.",
    saveRemoved: "저장 목록에서 제거했습니다.",
    saveFail: "저장할 수 없습니다. 브라우저 저장 공간을 확인해 주세요.",
    detailMore: "목록·한계 안내",
    detailFlagsShort: "목록 구분",
    flagAd: "출·도착",
    flagDuty: "면세",
    flagNoteShort:
      "공항 목록에 적힌 구분이며, 이용 가능 여부를 보장하지 않습니다.",
    situationTitle: "내 상황에 맞는지",
    situationKnown: "목록에서 확인된 정보",
    situationUnknown: "확인되지 않음",
    situationNotClaimed: "앱이 알려주지 않는 것",
    notClaimedList: ["지금 영업 중/문 닫음", "도보·경로·대기", "휠체어 경로"],
    missingField: "정보 없음",
    missingListing:
      "현재 목록에서 이 시설을 찾을 수 없습니다. 목록이 바떼었거나 삭제되었을 수 있습니다.",
    ambiguousListing: "한·영 목록 짝이 모호합니다. 목록에서 다시 선택해 주세요.",
    directDetailFallback:
      "이전에 보던 목록이 없습니다. 검색·필터로 찾거나 저장 목록을 확인해 주세요.",
    browseFromFallback: "시설 목록으로",
    prototypeSimulated: "프로토타입 시뮬레이션(실제 목록 행 아님)",
    prototypeDataGap:
      "English listing row missing from prototype data (not proof that English is unavailable in the full app).",
    staleSaved: "저장한 시설이 현재 목록에 없습니다.",
    langKo: "KO",
    langEn: "EN",
    langGroup: "언어 선택",
  },
  en: {
    backAirport: "Airport choice",
    backBrowse: "Facility list",
    title: "Incheon Airport facilities",
    savedTitle: "Saved facilities",
    searchLabel: "Search facilities",
    searchPlaceholder: "Name, location, or category",
    searchHint: "Search in English",
    terminalLabel: "Terminal",
    terminalAll: "All",
    categoryLabel: "Type",
    categoryAll: "All types",
    categoryChoose: "Choose type",
    clearFilters: "Clear filters",
    empty: "No facilities match. Try a different search or filter.",
    hoursLabel: "Hours",
    hoursNoteInline:
      "Hours come from the directory listing. We cannot tell if it is open now.",
    hoursUnknown: "Hours not confirmed",
    hoursAmbiguous: "Hours need confirmation",
    koOnlyName: "Showing the Korean name because English is not in the listing",
    koOnlyLocation:
      "Showing the Korean location because English is not in the listing",
    listingInfoTitle: "About this listing",
    listingSource: "Source",
    listingCollected: "Information collected on",
    countPreview: (shown, preview, full) =>
      `${shown} shown · ${preview} in this preview · ${full} in full airport listing`,
    savedEntry: "Saved",
    savedEmpty: "Nothing saved yet. Save a facility from its detail page.",
    savedLocalNote: "Saved on this device only. No account or cross-device sync.",
    save: "Save",
    saved: "Saved",
    removeSaved: "Remove from saved",
    saveOk: "Saved to this device.",
    saveRemoved: "Removed from saved list.",
    saveFail: "Could not save. Check browser storage settings.",
    detailMore: "Listing notes and limits",
    detailFlagsShort: "Directory labels",
    flagAd: "Arrival/departure",
    flagDuty: "Duty-free",
    flagNoteShort:
      "Labels from the airport directory only. They do not guarantee access.",
    situationTitle: "Fit for your situation",
    situationKnown: "From the listing",
    situationUnknown: "Not confirmed",
    situationNotClaimed: "We do not tell you",
    notClaimedList: ["Open or closed now", "Walk time, route, or queues", "Wheelchair routing"],
    missingField: "Not provided",
    missingListing:
      "This facility is not in the current listing. It may have changed or been removed.",
    ambiguousListing: "The Korean/English pairing is ambiguous. Pick it again from the list.",
    directDetailFallback:
      "There is no previous list to return to. Use search and filters, or check saved facilities.",
    browseFromFallback: "Go to facility list",
    prototypeSimulated: "Prototype simulation (not a real listing row)",
    prototypeDataGap:
      "English listing row missing from prototype data (not proof that English is unavailable in the full app).",
    staleSaved: "This saved facility is missing from the current listing.",
    langKo: "KO",
    langEn: "EN",
    langGroup: "Language",
  },
};

const STORAGE_KEY = "gw-icn-019-prototype-saved.v1";
const SCROLL_KEY = "gw-icn-019-prototype-scroll.v1";

let DATA = null;

const state = {
  locale: "ko",
  view: "browse",
  query: "",
  terminal: "all",
  category: "all",
  categoryPanelOpen: false,
  detailRef: null,
  demo: "normal",
  toast: null,
  browseScroll: 0,
};

function t() {
  return MESSAGES[state.locale];
}

function largeCategory(categoryLabel) {
  if (!categoryLabel) return null;
  return categoryLabel.split(" · ")[0];
}

function entryCategoryKey(entry) {
  return entry.categoryKey ?? largeCategory(entry.ko?.categoryLabel);
}

function recordForLocale(entry) {
  if (state.locale === "ko") return entry.ko;
  return entry.en ?? null;
}

function terminalForLocale(term) {
  if (state.locale === "ko") return term.chipLabel;
  const enTerm = DATA.terminalsEn?.find((x) => x.value === term.value);
  return enTerm?.chipLabel ?? term.chipLabel;
}

function displayFields(entry) {
  const ko = entry.ko;
  if (state.locale === "en") {
    if (!entry.en) {
      return {
        rec: null,
        name: t().prototypeDataGap,
        location: null,
        nameFromKo: false,
        locationFromKo: false,
        categoryLabel: null,
        prototypeDataGap: true,
      };
    }
    const rec = entry.en;
    let name = rec.name?.trim() ?? "";
    let location = rec.locationDescription?.trim() ?? null;
    let nameFromKo = false;
    let locationFromKo = false;
    if (!name && ko?.name?.trim()) {
      name = ko.name.trim();
      nameFromKo = true;
    }
    if (!location && ko?.locationDescription?.trim()) {
      location = ko.locationDescription.trim();
      locationFromKo = true;
    }
    const categoryLabel = rec.categoryLabel ?? null;
    const categoryFromKo =
      !rec.categoryLabel && nameFromKo && ko?.categoryLabel ? ko.categoryLabel : null;
    return {
      rec,
      name,
      location,
      nameFromKo,
      locationFromKo,
      categoryLabel: categoryLabel ?? categoryFromKo,
      categoryFromKo: Boolean(categoryFromKo),
      prototypeDataGap: false,
    };
  }
  const rec = entry.ko;
  const name = rec?.name?.trim() ?? "";
  const location = rec?.locationDescription?.trim() ?? null;
  return {
    rec,
    name,
    location,
    nameFromKo: false,
    locationFromKo: false,
    categoryLabel: rec?.categoryLabel,
    prototypeDataGap: false,
  };
}

function allEntries() {
  const pool = DATA.browsePool ?? [];
  const samples = DATA.samples ?? [];
  const byId = new Map();
  for (const row of [...pool, ...samples]) {
    if (row?.ko?.id) byId.set(row.ko.id, row);
  }
  if (state.demo === "ko-fallback-demo" && state.locale === "en") {
    byId.set("prototype-ko-fallback", {
      categoryKey: "식・음료",
      simulated: true,
      ko: {
        id: "prototype-ko-fallback",
        sourceId: "prototype-sim",
        name: "프로토타입 한글 전용 이름",
        terminalId: "P01",
        terminalLabel: "제1여객터미널",
        floor: "F3",
        locationDescription: "시뮬레이션 위치",
        categoryLabel: "식・음료 · 스낵/카페/디저트",
        hoursText: "07:00 ~ 21:00",
      },
      en: {
        id: "prototype-ko-fallback",
        sourceId: "prototype-sim",
        name: "",
        terminalId: "P01",
        terminalLabel: "Terminal 1",
        floor: "F3",
        locationDescription: "",
        categoryLabel: "Restaurants · Snack / Cafe / Dessert",
        hoursText: "07:00 ~ 21:00",
      },
      ref: null,
    });
  }
  return [...byId.values()];
}

function filterEntries() {
  const q = state.query.trim().toLowerCase();
  return allEntries().filter((entry) => {
    const fields = displayFields(entry);
    const ko = entry.ko;
    const hay = [
      fields.name,
      fields.location,
      fields.categoryLabel,
      entry.en?.name,
      entry.en?.locationDescription,
      entry.en?.categoryLabel,
      ko?.name,
      ko?.locationDescription,
      ko?.categoryLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (q && !hay.includes(q)) return false;
    const terminalRec = state.locale === "en" ? entry.en : entry.ko;
    if (state.terminal !== "all" && terminalRec?.terminalId !== state.terminal) return false;
    if (state.category !== "all" && entryCategoryKey(entry) !== state.category) return false;
    return true;
  });
}

function categoryOptions() {
  const keys = [...new Set(allEntries().map(entryCategoryKey).filter(Boolean))].sort();
  return keys.map((key) => {
    const sample = allEntries().find((e) => entryCategoryKey(e) === key);
    const label =
      state.locale === "ko"
        ? key
        : largeCategory(sample?.en?.categoryLabel) ?? key;
    return { key, label };
  });
}

function categoryDisplayLabel() {
  if (state.category === "all") return t().categoryAll;
  const opt = categoryOptions().find((o) => o.key === state.category);
  return opt?.label ?? state.category;
}

function parseFlagsFromRef(refJson) {
  try {
    const ref = JSON.parse(refJson);
    const inner = JSON.parse(ref.contentFingerprint);
    return { ad: inner.arrivalOrDeparture, duty: inner.dutyFreeFlag };
  } catch {
    return { ad: null, duty: null };
  }
}

function isAmbiguousEqualHours(hours) {
  return /^\s*(\d{1,2}:\d{2})\s*~\s*\1\s*$/.test(hours ?? "");
}

function formatTerminalLine(rec) {
  if (!rec?.terminalId) return null;
  const term = DATA.terminals.find((x) => x.value === rec.terminalId);
  const label = term ? terminalForLocale(term) : rec.terminalLabel ?? rec.terminalId;
  const floor = rec.floor ? ` · ${rec.floor}` : "";
  return `${label}${floor}`;
}

function readSaved() {
  if (state.demo === "storage-blocked") return { ok: false, items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { ok: true, items: raw ? JSON.parse(raw) : [] };
  } catch {
    return { ok: false, items: [] };
  }
}

function writeSaved(items) {
  if (state.demo === "storage-blocked") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

function refKey(ref) {
  if (!ref) return null;
  try {
    const parsed = JSON.parse(ref);
    return parsed.contentFingerprint?.slice(0, 48) ?? ref.slice(0, 48);
  } catch {
    return ref.slice(0, 48);
  }
}

function findByRef(ref) {
  if (state.demo === "saved-missing" && state.view === "detail") {
    return { status: "missing" };
  }
  const key = refKey(ref);
  const hit = allEntries().find((e) => refKey(e.ref) === key);
  if (hit) return { status: "found", entry: hit };
  return { status: "missing" };
}

function syncHash() {
  const params = new URLSearchParams();
  params.set("view", state.view);
  params.set("lang", state.locale);
  if (state.view === "browse") {
    if (state.query) params.set("q", state.query);
    if (state.terminal !== "all") params.set("terminal", state.terminal);
    if (state.category !== "all") params.set("category", state.category);
  }
  if (state.view === "detail" && state.detailRef) {
    params.set("ref", refKey(state.detailRef));
  }
  if (state.demo !== "normal") params.set("demo", state.demo);
  const hash = `#/${state.view}?${params.toString()}`;
  if (location.hash !== hash) location.hash = hash;
  document.getElementById("route-debug").textContent = hash;
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  state.view = path || "browse";
  state.locale = params.get("lang") === "en" ? "en" : "ko";
  state.query = params.get("q") ?? "";
  state.terminal = params.get("terminal") ?? "all";
  state.category = params.get("category") ?? "all";
  state.demo = params.get("demo") ?? "normal";
  const refParam = params.get("ref");
  if (state.view === "detail" && refParam) {
    const match = allEntries().find((e) => refKey(e.ref) === refParam);
    state.detailRef = match?.ref ?? DATA.samples?.[0]?.ref ?? null;
  }
}

function iconBack() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function iconSearch() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function iconChevron() {
  return `<svg class="mivvu-icn-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function renderLangToggle() {
  return `<div class="mivvu-lang-toggle" role="group" aria-label="${t().langGroup}">
    <button type="button" class="mivvu-lang-toggle-btn ${state.locale === "ko" ? "mivvu-lang-toggle-active" : ""}" data-action="lang" data-lang="ko" aria-label="한국어">${t().langKo}</button>
    <span class="mivvu-lang-toggle-sep" aria-hidden="true">|</span>
    <button type="button" class="mivvu-lang-toggle-btn ${state.locale === "en" ? "mivvu-lang-toggle-active" : ""}" data-action="lang" data-lang="en" aria-label="English">${t().langEn}</button>
  </div>`;
}

function renderToolbar({ showSaved = true }) {
  const saved = readSaved();
  const count = saved.ok ? saved.items.length : 0;
  const backLabel = state.view === "browse" ? t().backAirport : t().backBrowse;
  return `<header class="mivvu-icn-header">
    <div class="mivvu-icn-header-row1">
      <button type="button" class="mivvu-icn-back" data-action="back">${iconBack()}<span class="mivvu-icn-back-label">${backLabel}</span></button>
      <div class="mivvu-wordmark-header-compact">Mivvu</div>
    </div>
    <div class="mivvu-icn-header-row2">
      ${showSaved ? `<button type="button" class="mivvu-icn-saved-link" data-action="saved" ${state.view === "saved" ? 'aria-current="page"' : ""}><span class="mivvu-icn-saved-icon" aria-hidden="true">★</span><span>${t().savedEntry}</span>${count ? `<span class="mivvu-icn-badge-inline">${count}</span>` : ""}</button>` : ""}
      ${renderLangToggle()}
    </div>
  </header>`;
}

function renderListingFooterCompact() {
  const snap = DATA.snapshot;
  const date = state.locale === "ko" ? snap.retrievedDateLabel : snap.retrievedDateLabelEn;
  const source = state.locale === "ko" ? snap.sourceLabel : snap.sourceLabelEn ?? snap.sourceLabel;
  const note = state.locale === "ko" ? snap.coverageNote : snap.coverageNoteEn;
  return `<details class="mivvu-icn-listing-details">
    <summary>${t().listingInfoTitle}</summary>
    <dl class="mivvu-icn-snapshot-list">
      <div><dt>${t().listingSource}</dt><dd>${source}</dd></div>
      <div><dt>${t().listingCollected}</dt><dd>${date}</dd></div>
    </dl>
    <p class="mivvu-icn-snapshot-note">${note}</p>
  </details>`;
}

function renderActiveFilters() {
  const pills = [];
  if (state.query) pills.push({ key: "q", label: `"${state.query}"` });
  if (state.terminal !== "all") {
    const term = DATA.terminals.find((x) => x.value === state.terminal);
    pills.push({ key: "terminal", label: term ? terminalForLocale(term) : state.terminal });
  }
  if (state.category !== "all") pills.push({ key: "category", label: categoryDisplayLabel() });
  if (!pills.length) return "";
  return `<div class="mivvu-icn-active-filters">${pills
    .map(
      (p) =>
        `<span class="mivvu-icn-filter-pill">${p.label}<button type="button" data-action="clear-filter" data-filter="${p.key}" aria-label="${t().clearFilters}">×</button></span>`,
    )
    .join("")}<button type="button" class="mivvu-icn-chip mivvu-icn-chip-compact" data-action="clear-all">${t().clearFilters}</button></div>`;
}

function renderCategorySelector() {
  const m = t();
  const panel = state.categoryPanelOpen
    ? `<div class="mivvu-icn-category-panel" id="category-panel">
        <div class="mivvu-icn-chip-row mivvu-icn-chip-row-wrap" role="group" aria-label="${m.categoryLabel}">
          <button type="button" class="mivvu-icn-chip ${state.category === "all" ? "mivvu-icn-chip-active" : ""}" data-action="category" data-value="all">${m.categoryAll}</button>
          ${categoryOptions()
            .map(
              (opt) =>
                `<button type="button" class="mivvu-icn-chip ${state.category === opt.key ? "mivvu-icn-chip-active" : ""}" data-action="category" data-value="${opt.key}">${opt.label}</button>`,
            )
            .join("")}
        </div>
      </div>`
    : "";
  return `<div class="mivvu-icn-category-disclosure">
    <button type="button" class="mivvu-icn-category-trigger" data-action="toggle-category-panel" aria-expanded="${state.categoryPanelOpen}" aria-controls="category-panel">
      <span class="mivvu-icn-category-trigger-label">${m.categoryLabel}</span>
      <span class="mivvu-icn-category-trigger-value">${categoryDisplayLabel()}</span>
    </button>
    ${panel}
  </div>`;
}

function renderBrowse() {
  const items = filterEntries();
  const m = t();
  const previewTotal = allEntries().length;
  const fullTotal = DATA.snapshot.listingCount;
  const countText = m.countPreview(
    items.length.toLocaleString(state.locale === "ko" ? "ko-KR" : "en-US"),
    previewTotal.toLocaleString(state.locale === "ko" ? "ko-KR" : "en-US"),
    fullTotal.toLocaleString(state.locale === "ko" ? "ko-KR" : "en-US"),
  );

  const terminals = `<div class="mivvu-icn-chip-row mivvu-icn-chip-row-scroll" role="group" aria-label="${m.terminalLabel}">
    <button type="button" class="mivvu-icn-chip ${state.terminal === "all" ? "mivvu-icn-chip-active" : ""}" data-action="terminal" data-value="all">${m.terminalAll}</button>
    ${DATA.terminals
      .map(
        (term) =>
          `<button type="button" class="mivvu-icn-chip ${state.terminal === term.value ? "mivvu-icn-chip-active" : ""}" data-action="terminal" data-value="${term.value}">${terminalForLocale(term)}</button>`,
      )
      .join("")}
  </div>`;

  const list =
    items.length === 0
      ? `<p class="mivvu-entry-empty" role="status">${m.empty}</p>`
      : `<ul class="mivvu-icn-facility-list">${items
          .map((entry) => {
            const { name, location, nameFromKo, locationFromKo, categoryLabel, rec } = displayFields(entry);
            const place = formatTerminalLine(rec);
            const hours = rec?.hoursText;
            const hoursDisplay = !hours
              ? m.hoursUnknown
              : isAmbiguousEqualHours(hours)
                ? m.hoursAmbiguous
                : hours;
            return `<li><button type="button" class="mivvu-icn-facility-link" data-action="open" data-id="${entry.ko.id}">
              <span>
                <h2 class="mivvu-icn-facility-name">${name || m.missingField}</h2>
                ${nameFromKo ? `<p class="mivvu-icn-ko-fallback">${m.koOnlyName}</p>` : ""}
                ${entry.simulated ? `<p class="mivvu-icn-ko-fallback">${m.prototypeSimulated}</p>` : ""}
                ${place ? `<p class="mivvu-icn-facility-meta">${place}</p>` : ""}
                ${location ? `<p class="mivvu-icn-facility-location">${location}</p>` : ""}
                ${locationFromKo ? `<p class="mivvu-icn-ko-fallback">${m.koOnlyLocation}</p>` : ""}
                ${categoryLabel ? `<p class="mivvu-icn-facility-category">${categoryLabel}</p>` : ""}
                <p class="mivvu-icn-facility-hours"><span>${m.hoursLabel}</span> · ${hoursDisplay}</p>
              </span>
              ${iconChevron()}
            </button></li>`;
          })
          .join("")}</ul>`;

  return `${renderToolbar({ showSaved: true })}
    <h1 class="mivvu-icn-browse-title" data-testid="screen-title">${m.title}</h1>
    <div class="mivvu-entry-search-wrap">
      <label class="mivvu-entry-sr-only" for="search-input">${m.searchLabel}</label>
      <div class="mivvu-entry-search">${iconSearch()}
        <input id="search-input" class="mivvu-entry-search-input" type="search" value="${state.query.replace(/"/g, "&quot;")}" placeholder="${m.searchPlaceholder}" autocomplete="off" aria-controls="result-list"/>
      </div>
      <p class="mivvu-icn-search-hint">${m.searchHint}</p>
    </div>
    ${terminals}
    ${renderCategorySelector()}
    ${renderActiveFilters()}
    <p class="mivvu-icn-result-count" aria-live="polite">${countText}</p>
    <div id="result-list">${list}</div>
    ${renderListingFooterCompact()}`;
}

function renderDetailResolved(entry) {
  const { name, location, nameFromKo, locationFromKo, categoryLabel, rec } = displayFields(entry);
  const flags = entry.ref ? parseFlagsFromRef(entry.ref) : { ad: "D", duty: "N" };
  const saved = readSaved();
  const isSaved = saved.ok && saved.items.some((i) => refKey(i.ref) === refKey(entry.ref));
  const hours = rec?.hoursText;
  const hoursValue = !hours
    ? t().hoursUnknown
    : isAmbiguousEqualHours(hours)
      ? t().hoursAmbiguous
      : hours;
  const place = formatTerminalLine(rec);
  const snap = DATA.snapshot;
  const date = state.locale === "ko" ? snap.retrievedDateLabel : snap.retrievedDateLabelEn;
  const source = state.locale === "ko" ? snap.sourceLabel : snap.sourceLabelEn ?? snap.sourceLabel;

  return `${renderToolbar({ showSaved: true })}
    <article class="mivvu-icn-detail-primary">
      <h1 class="mivvu-icn-detail-name" data-testid="screen-title">${name || t().missingField}</h1>
      ${nameFromKo ? `<p class="mivvu-icn-ko-fallback">${t().koOnlyName}</p>` : ""}
      ${entry.simulated ? `<p class="mivvu-icn-ko-fallback">${t().prototypeSimulated}</p>` : ""}
      ${place || location ? `<p class="mivvu-icn-detail-lead">${[place, location].filter(Boolean).join(" · ")}</p>` : `<p class="mivvu-icn-detail-lead">${t().missingField}</p>`}
      ${locationFromKo ? `<p class="mivvu-icn-ko-fallback">${t().koOnlyLocation}</p>` : ""}
      <p class="mivvu-icn-detail-hours"><strong>${t().hoursLabel}</strong> ${hoursValue}</p>
      <p class="mivvu-icn-detail-hours-note">${t().hoursNoteInline}</p>
      <button type="button" class="mivvu-icn-save-btn mivvu-icn-save-btn-inline" data-action="toggle-save" aria-pressed="${isSaved}">${isSaved ? t().saved : t().save}</button>
      ${state.toast ? `<p class="mivvu-icn-toast ${state.toast.error ? "mivvu-icn-toast-error" : ""}" role="status">${state.toast.text}</p>` : ""}
      ${categoryLabel ? `<p class="mivvu-icn-detail-category">${categoryLabel}</p>` : ""}
    </article>
    <details class="mivvu-icn-listing-details">
      <summary>${t().detailMore}</summary>
      <p class="mivvu-icn-detail-subhead">${t().detailFlagsShort}</p>
      <ul class="mivvu-icn-detail-compact-list">
        <li>${t().flagAd}: ${flags.ad ?? t().missingField}</li>
        <li>${t().flagDuty}: ${flags.duty ?? t().missingField}</li>
      </ul>
      <p class="mivvu-icn-detail-muted">${t().flagNoteShort}</p>
      <p class="mivvu-icn-detail-subhead">${t().situationTitle}</p>
      <ul class="mivvu-icn-detail-compact-list">
        <li>${t().situationNotClaimed}: ${t().notClaimedList.join("; ")}</li>
      </ul>
      <dl class="mivvu-icn-snapshot-list">
        <div><dt>${t().listingSource}</dt><dd>${source}</dd></div>
        <div><dt>${t().listingCollected}</dt><dd>${date}</dd></div>
      </dl>
    </details>`;
}

function renderDetail() {
  if (state.demo === "direct-detail") {
    return `${renderToolbar({ showSaved: true })}
      <h1 class="mivvu-icn-browse-title" data-testid="screen-title">${t().missingField}</h1>
      <p class="mivvu-icn-status-banner">${t().directDetailFallback}</p>
      <button type="button" class="mivvu-icn-save-btn" data-action="go-browse">${t().browseFromFallback}</button>`;
  }
  const resolved = findByRef(state.detailRef);
  if (resolved.status === "missing") {
    return `${renderToolbar({ showSaved: true })}
      <h1 class="mivvu-icn-browse-title" data-testid="screen-title">${t().missingField}</h1>
      <p class="mivvu-icn-status-banner">${t().missingListing}</p>
      <button type="button" class="mivvu-icn-save-btn" data-action="go-browse">${t().browseFromFallback}</button>`;
  }
  if (resolved.status === "ambiguous") {
    return `${renderToolbar({ showSaved: true })}
      <p class="mivvu-icn-status-banner">${t().ambiguousListing}</p>
      <button type="button" class="mivvu-icn-save-btn" data-action="go-browse">${t().browseFromFallback}</button>`;
  }
  return renderDetailResolved(resolved.entry);
}

function renderSaved() {
  const saved = readSaved();
  const m = t();
  if (!saved.ok) {
    return `${renderToolbar({ showSaved: true })}
      <h1 class="mivvu-icn-browse-title" data-testid="screen-title">${m.savedTitle}</h1>
      <p class="mivvu-icn-toast-error" role="alert">${m.saveFail}</p>`;
  }

  let items = saved.items;
  if (state.demo === "saved-missing" && items.length === 0 && DATA.samples?.[0]?.ref) {
    items = [{ ref: DATA.samples[0].ref, savedAt: new Date().toISOString(), simulatedStale: true }];
  }

  const rows = items
    .map((item) => {
      const resolved =
        state.demo === "saved-missing" || item.simulatedStale
          ? { status: "missing" }
          : findByRef(item.ref);
      if (resolved.status !== "found") {
        return `<li><div class="mivvu-entry-empty">${m.staleSaved}<button type="button" class="mivvu-icn-chip mivvu-icn-chip-compact" data-action="remove-save" data-ref="${refKey(item.ref)}">${m.removeSaved}</button></div></li>`;
      }
      const { name, nameFromKo, rec } = displayFields(resolved.entry);
      return `<li><button type="button" class="mivvu-icn-facility-link" data-action="open-saved" data-ref="${refKey(item.ref)}">
        <span><h2 class="mivvu-icn-facility-name">${name || m.missingField}</h2>
        ${nameFromKo ? `<p class="mivvu-icn-ko-fallback">${m.koOnlyName}</p>` : ""}
        <p class="mivvu-icn-facility-meta">${formatTerminalLine(rec) ?? ""}</p></span>${iconChevron()}
      </button></li>`;
    })
    .join("");

  return `${renderToolbar({ showSaved: true })}
    <h1 class="mivvu-icn-browse-title" data-testid="screen-title">${m.savedTitle}</h1>
    <p class="mivvu-icn-callout">${m.savedLocalNote}</p>
    ${items.length === 0 ? `<p class="mivvu-entry-empty">${m.savedEmpty}</p>` : `<ul class="mivvu-icn-facility-list">${rows}</ul>`}
    ${renderListingFooterCompact()}`;
}

function render() {
  const root = document.getElementById("app");
  root.hidden = false;
  let inner = "";
  if (state.view === "saved") inner = renderSaved();
  else if (state.view === "detail") inner = renderDetail();
  else inner = renderBrowse();
  root.dataset.screen = state.view;
  root.dataset.locale = state.locale;
  root.dataset.demo = state.demo;
  root.innerHTML = `<div class="mivvu-entry-airport-scroll" id="scroll-root">${inner}</div>`;
  syncHash();
  const scrollEl = document.getElementById("scroll-root");
  if (state.view === "browse" && state.browseScroll) {
    scrollEl.scrollTop = state.browseScroll;
  }
}

function bindEvents() {
  document.getElementById("viewport-select").addEventListener("change", (e) => {
    const w = e.target.value;
    document.getElementById("phone").style.setProperty("--phone-w", `${w}px`);
    document.getElementById("phone").dataset.width = w;
  });
  document.getElementById("demo-select").addEventListener("change", (e) => {
    state.demo = e.target.value;
    if (state.demo === "direct-detail") {
      state.view = "detail";
      state.detailRef = DATA.samples?.[0]?.ref ?? null;
    }
    render();
  });

  window.addEventListener("hashchange", () => {
    parseHash();
    render();
  });

  document.getElementById("app").addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "lang") {
      state.locale = target.dataset.lang;
      render();
      return;
    }
    if (action === "back") {
      if (state.view !== "browse") {
        state.view = "browse";
        state.toast = null;
      }
      render();
      return;
    }
    if (action === "saved") {
      const scrollEl = document.getElementById("scroll-root");
      if (state.view === "browse") state.browseScroll = scrollEl?.scrollTop ?? 0;
      state.view = "saved";
      render();
      return;
    }
    if (action === "toggle-category-panel") {
      state.categoryPanelOpen = !state.categoryPanelOpen;
      render();
      return;
    }
    if (action === "terminal") {
      state.terminal = target.dataset.value;
      render();
      return;
    }
    if (action === "category") {
      state.category = target.dataset.value;
      state.categoryPanelOpen = false;
      render();
      return;
    }
    if (action === "clear-filter") {
      const f = target.dataset.filter;
      if (f === "q") state.query = "";
      if (f === "terminal") state.terminal = "all";
      if (f === "category") state.category = "all";
      render();
      return;
    }
    if (action === "clear-all") {
      state.query = "";
      state.terminal = "all";
      state.category = "all";
      render();
      return;
    }
    if (action === "open") {
      const id = target.dataset.id;
      const entry = allEntries().find((e) => e.ko.id === id);
      const scrollEl = document.getElementById("scroll-root");
      state.browseScroll = scrollEl?.scrollTop ?? 0;
      sessionStorage.setItem(SCROLL_KEY, String(state.browseScroll));
      state.detailRef = entry?.ref ?? null;
      state.view = "detail";
      state.toast = null;
      render();
      return;
    }
    if (action === "open-saved") {
      state.detailRef = allEntries().find((e) => refKey(e.ref) === target.dataset.ref)?.ref ?? null;
      state.view = "detail";
      render();
      return;
    }
    if (action === "go-browse") {
      state.view = "browse";
      render();
      return;
    }
    if (action === "toggle-save") {
      const resolved = findByRef(state.detailRef);
      if (resolved.status !== "found" || !resolved.entry.ref) return;
      const saved = readSaved();
      const key = refKey(resolved.entry.ref);
      let items = saved.ok ? saved.items : [];
      const exists = items.some((i) => refKey(i.ref) === key);
      if (exists) items = items.filter((i) => refKey(i.ref) !== key);
      else items = [...items, { ref: resolved.entry.ref, savedAt: new Date().toISOString() }];
      const ok = writeSaved(items);
      state.toast = ok
        ? { text: exists ? t().saveRemoved : t().saveOk, error: false }
        : { text: t().saveFail, error: true };
      render();
      return;
    }
    if (action === "remove-save") {
      const saved = readSaved();
      const items = saved.items.filter((i) => refKey(i.ref) !== target.dataset.ref);
      writeSaved(items);
      render();
    }
  });

  document.getElementById("app").addEventListener("input", (event) => {
    if (event.target.id === "search-input") {
      state.query = event.target.value;
      render();
      const input = document.getElementById("search-input");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  });
}

async function main() {
  const res = await fetch("./prototype-data.json");
  if (!res.ok) {
    document.getElementById("app").hidden = false;
    document.getElementById("app").innerHTML =
      '<p class="mivvu-entry-empty">Load this folder with a local HTTP server so prototype-data.json can load.</p>';
    return;
  }
  DATA = await res.json();
  bindEvents();
  if (!location.hash) {
    state.view = "browse";
    syncHash();
  } else {
    parseHash();
  }
  const storedScroll = sessionStorage.getItem(SCROLL_KEY);
  if (storedScroll) state.browseScroll = Number(storedScroll);
  render();
}

main();
