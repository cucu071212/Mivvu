export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          SFO Terminal 2 · D Gates
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          GateWise
        </h1>
        <p className="text-lg text-muted-foreground">
          Your airport. Your gate. Your time. Design system preview — facility
          UI ships in later tasks.
        </p>
      </header>

      <section
        className="gw-surface-card flex flex-col gap-4 p-5"
        aria-label="Design system token preview"
      >
        <h2 className="text-sm font-semibold text-card-foreground">
          Status chips (model display)
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="gw-status-chip gw-status-feasible">Feasible</span>
          <span className="gw-status-chip gw-status-tight">Tight</span>
          <span className="gw-status-chip gw-status-over">Over budget</span>
          <span className="gw-status-chip gw-status-unknown">Unknown</span>
          <span className="gw-status-chip gw-status-ineligible">
            Ineligible
          </span>
        </div>

        <h2 className="text-sm font-semibold text-card-foreground">
          Source badges
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="gw-badge gw-badge-verified">Official source</span>
          <span className="gw-badge gw-badge-demo">Demo estimate</span>
          <span className="gw-badge gw-badge-unknown">Unverified</span>
        </div>

        <button type="button" className="gw-btn-primary gw-focus-ring w-fit">
          Primary control
        </button>
      </section>
    </main>
  );
}
