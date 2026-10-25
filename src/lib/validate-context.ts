import {
  DEFAULT_BUFFER_MINUTES,
  DEFAULT_QUEUE_ADJUSTMENT_MINUTES,
} from "@/types/airport";
import {
  MAX_BOARDING_WINDOW_MINUTES,
  parseStrictInteger,
} from "@/lib/strict-integer";
import type {
  ContextValidationError,
  ContextValidationErrorCode,
  FacilityCategory,
  UserContextInput,
  ValidateContext,
} from "@/types/airport";

const categories = ["food", "coffee", "restroom", "charging", "shop"] as const satisfies readonly FacilityCategory[];

/** Only optional fields may use these missing/blank forms as defaults. */
function absent(value: unknown): boolean {
  return value === undefined || value === null ||
    (typeof value === "string" && value.trim() === "");
}

function integer(value: unknown, allowNegative: boolean): number | undefined {
  return parseStrictInteger(value, {
    allowNegative,
    min: allowNegative ? -MAX_BOARDING_WINDOW_MINUTES : 0,
    max: MAX_BOARDING_WINDOW_MINUTES,
  });
}

/** Normalizes boarding-start context; any field error makes the whole context null. */
export const validateContext: ValidateContext = (input) => {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { context: null, errors: [{
      field: "form", code: "missing_required_field", message: "Boarding context must be an object.",
    }] };
  }
  const errors: ContextValidationError[] = [];
  const error = (field: keyof UserContextInput, code: ContextValidationErrorCode, message: string) => {
    errors.push({ field, code, message });
  };

  const gateZone = typeof input.gateZone === "string" ? input.gateZone.trim() : undefined;
  if (input.gateZone === undefined) {
    error("gateZone", "missing_required_field", "Gate zone is required.");
  } else if (gateZone !== "D") {
    error("gateZone", "invalid_gate_zone", "Gate zone must be D (Terminal 2).");
  }

  const minutesUntilBoarding = integer(input.minutesUntilBoarding, false);
  if (input.minutesUntilBoarding === undefined) {
    error("minutesUntilBoarding", "missing_required_field", "Minutes until boarding starts is required.");
  } else if (minutesUntilBoarding === undefined) {
    error("minutesUntilBoarding", "invalid_minutes_until_boarding", "Minutes until boarding starts must be a finite non-negative integer.");
  }

  const bufferMinutes = absent(input.bufferMinutes)
    ? DEFAULT_BUFFER_MINUTES : integer(input.bufferMinutes, false);
  if (bufferMinutes === undefined) {
    error("bufferMinutes", "invalid_buffer_minutes", "Buffer minutes must be a finite non-negative integer.");
  }

  const category = absent(input.category)
    ? undefined : categories.find((candidate) => candidate === input.category);
  if (!absent(input.category) && category === undefined) {
    error("category", "invalid_category", "Category must be a supported facility category or blank.");
  }

  const queueAdjustmentMinutes = absent(input.queueAdjustmentMinutes)
    ? DEFAULT_QUEUE_ADJUSTMENT_MINUTES : integer(input.queueAdjustmentMinutes, true);
  if (queueAdjustmentMinutes === undefined) {
    error("queueAdjustmentMinutes", "invalid_queue_adjustment", "Queue adjustment must be a finite integer; negative adjustments are allowed.");
  }

  const passengerSecurityArea = absent(input.passengerSecurityArea)
    ? "post" : input.passengerSecurityArea;
  if (passengerSecurityArea !== "post") {
    error("passengerSecurityArea", "invalid_passenger_security_area", "Passenger security area must be post-security.");
  }

  if (errors.length > 0 || gateZone !== "D" || minutesUntilBoarding === undefined ||
    bufferMinutes === undefined || queueAdjustmentMinutes === undefined ||
    passengerSecurityArea !== "post") return { context: null, errors };

  return { context: {
    gateZone, minutesUntilBoarding, bufferMinutes, queueAdjustmentMinutes, passengerSecurityArea,
    ...(category !== undefined ? { category } : {}),
  }, errors: [] };
};
