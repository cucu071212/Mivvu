/** Documented REST host path (typo `Facilites` is official). */
export const ICN_FACILITIES_API_BASE =
  "https://apis.data.go.kr/B551177/FacilitiesInformation/getFacilitesInfo";

/** Successful API-level status per GW-ICN-002 live verification. */
export const ICN_API_SUCCESS_RESULT_CODE = "00";

/** Default page size for full sync (sequential pages; daily quota 1000 on dev keys). */
export const ICN_FACILITIES_DEFAULT_PAGE_SIZE = 100;

/** Upper bound for `numOfRows` per request in this adapter. */
export const ICN_FACILITIES_MAX_PAGE_SIZE = 100;

export const ICN_FACILITIES_DEFAULT_TIMEOUT_MS = 30_000;
