import type { GateLandmark } from "@/types/airport";
import { DEFAULT_BUFFER_MINUTES } from "@/types/airport";

export const DEFAULT_DEMO_MINUTES_UNTIL_BOARDING = 50;

export const DEFAULT_DEMO_GATE_LANDMARK: GateLandmark = "D1";

export const demoFlightContextDefaults = {
  minutesUntilBoarding: DEFAULT_DEMO_MINUTES_UNTIL_BOARDING,
  bufferMinutes: DEFAULT_BUFFER_MINUTES,
  gateLandmark: DEFAULT_DEMO_GATE_LANDMARK,
};
