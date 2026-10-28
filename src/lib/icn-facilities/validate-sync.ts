export function findDuplicateSourceIds(sourceIds: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of sourceIds) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

type CompleteSyncInput = {
  apiReportedTotalCount: number;
  records: ReadonlyArray<{ sourceId: string }>;
};

export function assertCompleteSync(input: CompleteSyncInput): void {
  const { apiReportedTotalCount, records } = input;

  if (!Number.isFinite(apiReportedTotalCount) || apiReportedTotalCount < 0) {
    throw new Error("Invalid apiReportedTotalCount for sync validation");
  }

  if (records.length !== apiReportedTotalCount) {
    throw new Error(
      `Incomplete sync: fetched ${records.length} records but API totalCount is ${apiReportedTotalCount}`,
    );
  }
}

export function evaluateSyncIntegrity(
  apiReportedTotalCount: number,
  fetchedCount: number,
): "complete" | "api_total_mismatch" {
  if (fetchedCount === apiReportedTotalCount) return "complete";
  return "api_total_mismatch";
}
