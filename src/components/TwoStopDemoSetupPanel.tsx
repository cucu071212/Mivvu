import Link from "next/link";

export type TwoStopDemoSetupPanelProps = {
  demoQueueActivityEnabled: boolean;
  illustrativeTravelEnabled: boolean;
};

export function TwoStopDemoSetupPanel({
  demoQueueActivityEnabled,
  illustrativeTravelEnabled,
}: TwoStopDemoSetupPanelProps) {
  return (
    <section
      className="gw-surface-card flex flex-col gap-3 p-4 sm:p-5"
      aria-labelledby="two-stop-demo-setup-heading"
    >
      <h2 id="two-stop-demo-setup-heading" className="text-base font-semibold">
        Complete demo setup
      </h2>
      <p className="text-sm text-muted-foreground">
        Illustrative minutes are never turned on automatically. Status reflects your
        current session only.
      </p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-md border border-border/80 bg-muted/20 px-3 py-2">
          <dt className="text-muted-foreground">
            Flight demo queue/activity estimates
          </dt>
          <dd className="font-medium text-card-foreground">
            {demoQueueActivityEnabled ? "Enabled" : "Disabled"}
          </dd>
          {!demoQueueActivityEnabled ? (
            <dd className="mt-2">
              <Link
                href="/flight"
                className="gw-focus-ring text-sm font-medium text-primary underline"
              >
                Enable on Flight
              </Link>
            </dd>
          ) : null}
        </div>
        <div className="rounded-md border border-border/80 bg-muted/20 px-3 py-2">
          <dt className="text-muted-foreground">Illustrative D-Gates travel</dt>
          <dd className="font-medium text-card-foreground">
            {illustrativeTravelEnabled ? "Enabled" : "Disabled"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
