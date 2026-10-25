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
  disabled?: boolean;
};

const CATEGORIES: { value: FacilityCategory | ""; label: string }[] = [
  { value: "", label: "All" },
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
  disabled = false,
}: AmenityFilterProps) {
  return (
    <section
      className="gw-surface-card flex flex-col gap-4 p-4 sm:p-5"
      aria-labelledby="filter-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2
          id="filter-heading"
          className="text-lg font-semibold text-card-foreground"
        >
          Find amenities
        </h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {resultCount} {resultCount === 1 ? "place" : "places"}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
          Search by facility name
          <input
            type="search"
            className="gw-input gw-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Name only — e.g. Peet's, Napa, Brookstone"
            value={value.text}
            onChange={(event) =>
              onChange({ ...value, text: event.target.value })
            }
            autoComplete="off"
            disabled={disabled}
            aria-disabled={disabled}
          />
          <span className="text-xs font-normal text-muted-foreground">
            Does not search location descriptions or gate landmarks.
          </span>
        </label>

        <div className="flex flex-col gap-2">
          <span
            id="filter-category-label"
            className="text-sm font-medium text-card-foreground"
          >
            Category
          </span>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-labelledby="filter-category-label"
          >
            {CATEGORIES.map((option) => {
              const selected = value.category === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  className={`gw-focus-ring min-h-11 rounded-full border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? "border-[var(--gw-primary)] bg-[var(--gw-primary)] text-[var(--gw-on-primary)]"
                      : "border-border bg-card text-card-foreground hover:border-primary"
                  }`}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() =>
                    onChange({ ...value, category: option.value })
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
