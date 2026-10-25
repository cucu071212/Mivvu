type TwoStopItineraryStripProps = {
  firstStopName: string;
  secondStopName: string;
  idPrefix: string;
};

export function TwoStopItineraryStrip({
  firstStopName,
  secondStopName,
  idPrefix,
}: TwoStopItineraryStripProps) {
  const steps = [
    { key: "gate", label: "Gate" },
    { key: "a", label: firstStopName },
    { key: "b", label: secondStopName },
    { key: "gate-return", label: "Gate" },
  ];

  return (
    <ol
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1"
      aria-labelledby={`${idPrefix}-itinerary-heading`}
    >
      {steps.map((step, index) => (
        <li key={step.key} className="flex items-center gap-1 sm:gap-1">
          <span
            className={`rounded-md border px-2 py-1 text-xs font-medium sm:text-sm ${
              step.key === "gate" || step.key === "gate-return"
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-border bg-card text-card-foreground"
            }`}
          >
            {step.label}
          </span>
          {index < steps.length - 1 ? (
            <span className="text-muted-foreground sm:px-0.5" aria-hidden="true">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
