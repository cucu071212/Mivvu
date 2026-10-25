"use client";

import type { FacilityCategory, TerminalCode, Zone } from "@/types/airport";
import {
  BOARDING_AREA_CODES,
  TERMINAL_DISPLAY_LABELS,
} from "@/lib/facility-present";

export type AmenityFilterValue = {
  text: string;
  category: FacilityCategory | "";
  terminalCode: TerminalCode | "";
  boardingArea: Zone | "";
};

export type AmenityFilterProps = {
  value: AmenityFilterValue;
  onChange: (next: AmenityFilterValue) => void;
  /** Browse directory match count (Explore). */
  directoryCount: number;
  /** Total browse-eligible facilities in dataset (for “X of Y” copy). */
  browseTotal: number;
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

const TERMINAL_OPTIONS: { value: TerminalCode | ""; label: string }[] = [
  { value: "", label: "All terminals" },
  ...(
    Object.entries(TERMINAL_DISPLAY_LABELS) as [TerminalCode, string][]
  ).map(([code, label]) => ({ value: code, label })),
];

export function AmenityFilter({
  value,
  onChange,
  directoryCount,
  browseTotal,
  disabled = false,
}: AmenityFilterProps) {
  return (
    <section
      className="gw-surface-card gw-premium-card flex flex-col gap-4 p-4 sm:p-5"
      aria-labelledby="filter-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2
          id="filter-heading"
          className="text-lg font-semibold text-card-foreground"
        >
          Find facilities
        </h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {directoryCount} of {browseTotal}{" "}
          {browseTotal === 1 ? "facility" : "facilities"}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
          Search by facility name
          <input
            type="search"
            className="gw-input gw-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Name only — e.g. Peet's, Bun Mee, Napa"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
            Terminal
            <select
              className="gw-input gw-focus-ring min-h-11 disabled:cursor-not-allowed disabled:opacity-60"
              value={value.terminalCode}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...value,
                  terminalCode: event.target.value as TerminalCode | "",
                })
              }
            >
              {TERMINAL_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-card-foreground">
            Boarding area
            <select
              className="gw-input gw-focus-ring min-h-11 disabled:cursor-not-allowed disabled:opacity-60"
              value={value.boardingArea}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...value,
                  boardingArea: event.target.value as Zone | "",
                })
              }
            >
              <option value="">All areas</option>
              {BOARDING_AREA_CODES.map((code) => (
                <option key={code} value={code}>
                  {code} Gates
                </option>
              ))}
            </select>
          </label>
        </div>

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
