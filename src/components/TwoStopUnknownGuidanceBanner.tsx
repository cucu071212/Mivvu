import Link from "next/link";
import type { TwoStopUnknownGuidanceItem } from "@/lib/two-stop-unknown-guidance";

export function TwoStopUnknownGuidanceBanner({
  items,
}: {
  items: readonly TwoStopUnknownGuidanceItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div
      className="rounded-md border border-border bg-muted/30 p-4"
      role="region"
      aria-labelledby="two-stop-unknown-guidance-heading"
    >
      <h3
        id="two-stop-unknown-guidance-heading"
        className="text-sm font-semibold text-card-foreground"
      >
        Why timing is Unknown
      </h3>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.category}>
            <span>{item.message}</span>
            {item.actionHref && item.actionLabel ? (
              <>
                {" "}
                <Link
                  href={item.actionHref}
                  className="font-medium text-primary underline"
                >
                  {item.actionLabel}
                </Link>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
