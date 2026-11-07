let historySyncSuppressDepth = 0;

/** Skip hub-driven history writes (e.g. leaving `/icn` for airport selection). */
export function suppressIcnBrowseUrlHistorySync(): void {
  historySyncSuppressDepth += 1;
}

export function releaseIcnBrowseUrlHistorySync(): void {
  historySyncSuppressDepth = Math.max(0, historySyncSuppressDepth - 1);
}

export function isIcnBrowseUrlHistorySyncSuppressed(): boolean {
  return historySyncSuppressDepth > 0;
}

export function resetIcnBrowseUrlHistorySyncGuardForTests(): void {
  historySyncSuppressDepth = 0;
}
