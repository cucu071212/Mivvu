/**
 * Locale-stable boarding start label for SSR/client hydration (always en-US).
 */
export function formatBoardingStartLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Invalid boarding time";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  }).format(date);
}
