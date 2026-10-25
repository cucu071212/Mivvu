import Image from "next/image";
import type { Facility } from "@/types/airport";
import { resolveFacilityVisual } from "@/lib/facility-visual";

export type FacilityVisualMediaProps = {
  facility: Facility;
  variant: "card" | "detail";
  className?: string;
};

export function FacilityVisualMedia({
  facility,
  variant,
  className = "",
}: FacilityVisualMediaProps) {
  const visual = resolveFacilityVisual(facility);
  if (!visual) {
    return null;
  }

  const frameClass =
    variant === "detail"
      ? "gw-facility-visual gw-facility-visual-detail"
      : "gw-facility-visual gw-facility-visual-card";

  return (
    <figure className={`${frameClass} ${className}`.trim()}>
      <Image
        src={visual.src}
        alt={visual.alt}
        width={visual.width}
        height={visual.height}
        className="gw-facility-visual-img"
        loading="lazy"
        sizes={
          variant === "detail"
            ? "(max-width: 640px) 100vw, 32rem"
            : "(max-width: 640px) 100vw, 20rem"
        }
      />
      {visual.caption ? (
        <figcaption className="gw-facility-visual-caption text-xs text-muted-foreground">
          {visual.caption}
        </figcaption>
      ) : null}
      {visual.attribution ? (
        <figcaption className="gw-facility-visual-caption text-xs text-muted-foreground">
          {visual.attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
