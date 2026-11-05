/** Canonical Mivvu first-entry paths (integrated app entry). */
export const MIVVU_ENTRY_PATH = "/" as const;

/** ICN facility browse directory (static fixtures). */
export const MIVVU_ICN_BROWSE_PATH = "/icn" as const;

/** ICN facility detail (GW-ICN-013). `[ref]` is a URI-encoded serialized GW-ICN-012 reference. */
export const MIVVU_ICN_FACILITY_DETAIL_PATH_PREFIX = "/icn/f/" as const;

/** ICN saved facilities list (GW-ICN-016). */
export const MIVVU_ICN_SAVED_FACILITIES_PATH = "/icn/saved" as const;

/** Versioned local saved-list payload (`localStorage`). */
export const MIVVU_ICN_SAVED_FACILITIES_STORAGE_KEY = "mivvu.icn.savedFacilities.v1" as const;

/** Saved-list → detail origin intent (one-shot, consumed on detail mount). */
export const MIVVU_ICN_SAVED_DETAIL_ORIGIN_INTENT_KEY = "mivvu.icn.savedDetailOriginIntent.v1" as const;

/** Active saved-origin detail visit token. */
export const MIVVU_ICN_ACTIVE_SAVED_DETAIL_VISIT_KEY = "mivvu.icn.activeSavedDetailVisit.v1" as const;

/** Saved-origin detail payload (ref segment only). */
export const MIVVU_ICN_SAVED_DETAIL_CONTEXT_SESSION_KEY = "mivvu.icn.savedDetailContext.v1" as const;

/** Minimal browse filters for return-from-detail (not GW-ICN-017 URL sync). */
export const MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY = "mivvu.icn.browseContext.v1" as const;

/** Active detail visit token; must match session payload for browse-origin UI. */
export const MIVVU_ICN_ACTIVE_DETAIL_VISIT_KEY = "mivvu.icn.activeDetailVisit.v1" as const;

/** One-shot browse-card → detail intent (consumed on detail mount). */
export const MIVVU_ICN_BROWSE_ORIGIN_INTENT_KEY = "mivvu.icn.browseOriginIntent.v1" as const;

/**
 * GW-ICN-017 shareable browse query keys on `/icn` (see icn-browse-url-state.ts).
 * Not used on detail or saved routes; locale stays in localStorage.
 */
export const ICN_BROWSE_URL_PARAM_QUERY = "q" as const;
export const ICN_BROWSE_URL_PARAM_TERMINAL = "terminal" as const;
export const ICN_BROWSE_URL_PARAM_TYPE = "type" as const;
export const ICN_BROWSE_URL_PARAM_SUBTYPE = "subtype" as const;

/** Legacy preview URLs — kept for bookmarks; pages redirect to canonical routes. */
export const MIVVU_PREVIEW_ENTRY_PATH = "/preview/mivvu-entry" as const;
export const MIVVU_PREVIEW_ICN_BROWSE_PATH = "/preview/mivvu-entry/icn" as const;
