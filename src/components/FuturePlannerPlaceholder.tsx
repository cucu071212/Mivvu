/** GW-E placeholder — no planner logic; preserves IA for a future two-stop module. */
export function FuturePlannerPlaceholder() {
  return (
    <section
      id="gw-section-planner"
      className="gw-surface-card gw-planner-placeholder flex flex-col gap-2 p-4 sm:p-5"
      aria-labelledby="planner-future-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="planner-future-heading"
          className="text-base font-semibold text-card-foreground"
        >
          Two-stop planner
        </h2>
        <span className="gw-badge gw-badge-unknown">GW-E — not in this release</span>
      </div>
      <p className="text-sm text-muted-foreground">
        A future module will compare two amenities in one time budget using the
        same honest timing labels and recommendation engine. This slot keeps the
        layout ready without changing today&apos;s single-stop contract.
      </p>
    </section>
  );
}
