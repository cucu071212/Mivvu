/** Counts IIAC facilities HTTP attempts for bounded acquisition tasks. */
export class IcnFacilitiesRequestBudget {
  private attempts = 0;

  constructor(private readonly maxAttempts: number) {}

  get used(): number {
    return this.attempts;
  }

  get remaining(): number {
    return Math.max(0, this.maxAttempts - this.attempts);
  }

  assertCanAttempt(): void {
    if (this.attempts >= this.maxAttempts) {
      throw new Error(`Request budget exhausted (${this.maxAttempts} attempts)`);
    }
  }

  /** Record one HTTP attempt (including failures). */
  recordAttempt(): void {
    this.attempts += 1;
  }
}

export function estimateUnfilteredCatalogCaptureRequests(
  apiReportedTotalCount: number,
  pageSize: number,
): { pagesPerLanguage: number; requestsPerLanguage: number; totalBothLanguages: number } {
  const safePageSize = Math.max(1, Math.min(pageSize, apiReportedTotalCount || pageSize));
  const pagesPerLanguage = Math.max(1, Math.ceil(apiReportedTotalCount / safePageSize));
  return {
    pagesPerLanguage,
    requestsPerLanguage: pagesPerLanguage,
    totalBothLanguages: pagesPerLanguage * 2,
  };
}
