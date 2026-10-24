"use client";

import type { FacilityCategory } from "@/types/airport";

export type AmenityFilterValue = {
  text: string;
  category: FacilityCategory | "";
};

export type AmenityFilterProps = {
  value: AmenityFilterValue;
  onChange: (next: AmenityFilterValue) => void;
  resultCount: number;
};

const CATEGORIES: { value: FacilityCategory | ""; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "food", label: "Food" },
  { value: "coffee", label: "Coffee" },
  { value: "shop", label: "Shop" },
  { value: "restroom", label: "Restroom" },
  { value: "charging", label: "Charging" },
];

export function AmenityFilter({
  value,
  onChange,
  resultCount,
}: AmenityFilterProps) {
  return (
    <section
      className="gw-surface-card flex flex-col gap-4 p-4"
      aria-labelledby="filter-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="filter-heading" className="text-base font-semibold text-card-foreground">
          Find amenities
        </h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {resultCount} {resultCount === 1 ? "place" : "places"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
          Search by name
          <input
            type="search"
            className="gw-input gw-focus-ring"
            placeholder="e.g. Peet's, Retail Street"
            value={value.text}
            onChange={(event) =>
              onChange({ ...value, text: event.target.value })
            }
            autoComplete="off"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
          Category
          <select
            className="gw-input gw-focus-ring"
            value={value.category}
            onChange={(event) =>
              onChange({
                ...value,
                category: event.target.value as FacilityCategory | "",
              })
            }
          >
            {CATEGORIES.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
