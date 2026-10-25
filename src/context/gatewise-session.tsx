"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Facility,
  FacilityValidationError,
  GateLandmark,
  ProductionRecommendation,
  ResolvedFacilityDurations,
  UserContext,
} from "@/types/airport";
import { DEFAULT_BUFFER_MINUTES } from "@/types/airport";
import { productionTravelMinutes } from "@/data/travel-times";
import type { AmenityFilterValue } from "@/components/AmenityFilter";
import type { FacilityDurationOverrideMap } from "@/components/PersonalizedTimeControls";
import {
  buildFacilityFilterQuery,
  buildFlightContextInput,
} from "@/lib/browse-integration";
import { preservedManualMinutesFromValidContext } from "@/lib/preserved-manual-minutes";
import { buildRankedRecommendations } from "@/lib/recommendation-page-integration";
import {
  DEMO_ACTIVITY_MINUTES,
  DEMO_QUEUE_MINUTES,
} from "@/lib/demo-estimate-facilities";
import { resolveFacilityDurations } from "@/lib/resolve-facility-durations";
import { validateContext } from "@/lib/validate-context";
import { validateDurationOverrides } from "@/lib/validate-duration-overrides";
import type { BoardingCountdownState } from "@/lib/boarding-countdown";
import {
  baselineRecoveryRequiredAfterExit,
  minutesInputAfterCountdownExit,
  type CountdownManualExitPayload,
} from "@/lib/countdown-baseline-recovery";

export const DEFAULT_MINUTES_UNTIL_BOARDING = 50;

export const GATE_LANDMARKS: GateLandmark[] = [
  "D1",
  "D4",
  "D7",
  "D9",
  "D15",
  "D16",
];

function contextErrorMessage(
  field: "minutesUntilBoarding" | "bufferMinutes",
  errors: { field: string; message: string }[],
): string | undefined {
  return errors.find((error) => error.field === field)?.message;
}

export type GateWiseSessionValue = {
  facilities: Facility[];
  datasetErrors: FacilityValidationError[];
  datasetValid: boolean;

  minutesInput: string;
  setMinutesInput: (value: string) => void;
  bufferInput: string;
  setBufferInput: (value: string) => void;
  gateLandmark: GateLandmark;
  setGateLandmark: (value: GateLandmark) => void;
  demoEstimatesEnabled: boolean;
  setDemoEstimatesEnabled: (value: boolean) => void;

  scenarioMinutesInput: string;
  setScenarioMinutesInput: (value: string) => void;
  scenarioQueueInput: string;
  setScenarioQueueInput: (value: string) => void;

  filter: AmenityFilterValue;
  setFilter: (value: AmenityFilterValue) => void;

  durationOverrides: FacilityDurationOverrideMap;
  handleDurationOverridesChange: (next: FacilityDurationOverrideMap) => void;
  setPersonalizationDraftsValid: (valid: boolean) => void;

  countdownState: BoardingCountdownState;
  setCountdownState: (next: BoardingCountdownState) => void;
  preservedManualMinutes: number;
  handleBaselineMinutesFromCountdown: (minutes: number) => void;
  handleCountdownExit: (payload: CountdownManualExitPayload) => void;
  handleRestoreManualBaseline: () => void;
  syncPreservedManualFromDrafts: (minutes: string, buffer: string) => void;

  baselineRecoveryRequired: boolean;
  baselineRecoveryMessage: string | null;
  personalizationUsable: boolean;

  contextResult: ReturnType<typeof validateContext>;
  contextValid: boolean;
  minutesError: string | undefined;
  bufferError: string | undefined;
  baselineUsesLiveCountdown: boolean;
  countdownPaused: boolean;
  boardingStartedForStrip: boolean;

  filterQuery: ReturnType<typeof buildFacilityFilterQuery>;
  recommendations: ProductionRecommendation[];
  resolvedDurationsByFacilityId: Map<string, ResolvedFacilityDurations>;
  facilityById: Map<string, Facility>;
  baselineContext: UserContext | null;
};

const GateWiseSessionContext = createContext<GateWiseSessionValue | null>(null);

export type GateWiseSessionProviderProps = {
  facilities: Facility[];
  datasetErrors: FacilityValidationError[];
  children: ReactNode;
};

/**
 * In-memory session for client navigations. Full page refresh resets to safe
 * defaults (no persisted countdown) so stale clock state cannot mislead.
 */
export function GateWiseSessionProvider({
  facilities,
  datasetErrors,
  children,
}: GateWiseSessionProviderProps) {
  const [minutesInput, setMinutesInput] = useState(
    String(DEFAULT_MINUTES_UNTIL_BOARDING),
  );
  const [bufferInput, setBufferInput] = useState(String(DEFAULT_BUFFER_MINUTES));
  const [gateLandmark, setGateLandmark] = useState<GateLandmark>("D1");
  const [demoEstimatesEnabled, setDemoEstimatesEnabled] = useState(false);
  const [scenarioMinutesInput, setScenarioMinutesInput] = useState(
    String(DEFAULT_MINUTES_UNTIL_BOARDING),
  );
  const [scenarioQueueInput, setScenarioQueueInput] = useState("0");
  const [filter, setFilter] = useState<AmenityFilterValue>({
    text: "",
    category: "",
    terminalCode: "",
    boardingArea: "",
  });
  const [durationOverrides, setDurationOverrides] =
    useState<FacilityDurationOverrideMap>({});
  const [countdownState, setCountdownState] = useState<BoardingCountdownState>({
    mode: "manual",
    minutesUntilBoarding: DEFAULT_MINUTES_UNTIL_BOARDING,
  });
  const [preservedManualMinutes, setPreservedManualMinutes] = useState(
    DEFAULT_MINUTES_UNTIL_BOARDING,
  );
  const [personalizationDraftsValid, setPersonalizationDraftsValid] =
    useState(true);
  const [overrideCommitRejected, setOverrideCommitRejected] = useState(false);
  const [baselineRecoveryRequired, setBaselineRecoveryRequired] =
    useState(false);
  const [baselineRecoveryMessage, setBaselineRecoveryMessage] = useState<
    string | null
  >(null);

  const baselineUsesLiveCountdown = countdownState.mode === "countdown";
  const countdownPaused =
    countdownState.mode === "countdown" && countdownState.runState === "paused";
  const boardingStartedForStrip =
    baselineUsesLiveCountdown && minutesInput.trim() === "0";

  const syncPreservedManualFromDrafts = useCallback(
    (minutesDraft: string, bufferDraft: string) => {
      if (countdownState.mode !== "manual") {
        return;
      }
      const accepted = preservedManualMinutesFromValidContext(
        minutesDraft,
        bufferDraft,
      );
      if (accepted === undefined) {
        return;
      }
      setPreservedManualMinutes(accepted);
      setCountdownState({ mode: "manual", minutesUntilBoarding: accepted });
    },
    [countdownState.mode],
  );

  const handleBaselineMinutesFromCountdown = useCallback((minutes: number) => {
    setMinutesInput(String(minutes));
  }, []);

  const handleCountdownExit = useCallback(
    (payload: CountdownManualExitPayload) => {
      const minutes =
        payload.reason === "user_clear"
          ? payload.preservedManualMinutes
          : payload.lastBaselineMinutes;
      setCountdownState({ mode: "manual", minutesUntilBoarding: minutes });
      setMinutesInput(minutesInputAfterCountdownExit(payload));
      if (baselineRecoveryRequiredAfterExit(payload.reason)) {
        setBaselineRecoveryRequired(true);
        setBaselineRecoveryMessage(
          payload.message ??
            "Countdown stopped. Recommendations stay paused until you restore your last manual minutes.",
        );
        return;
      }
      setBaselineRecoveryRequired(false);
      setBaselineRecoveryMessage(null);
    },
    [],
  );

  const handleRestoreManualBaseline = useCallback(() => {
    setBaselineRecoveryRequired(false);
    setBaselineRecoveryMessage(null);
    setMinutesInput(String(preservedManualMinutes));
    setCountdownState({
      mode: "manual",
      minutesUntilBoarding: preservedManualMinutes,
    });
  }, [preservedManualMinutes]);

  const facilityIds = useMemo(
    () => facilities.map((facility) => facility.id),
    [facilities],
  );

  const handleDurationOverridesChange = useCallback(
    (next: FacilityDurationOverrideMap) => {
      const { overrides, errors } = validateDurationOverrides(next, facilityIds);
      if (errors.length > 0) {
        setOverrideCommitRejected(true);
        return;
      }
      setOverrideCommitRejected(false);
      setDurationOverrides(overrides);
    },
    [facilityIds],
  );

  const personalizationUsable =
    personalizationDraftsValid && !overrideCommitRejected;

  const datasetValid = datasetErrors.length === 0;

  const contextResult = useMemo(
    () => validateContext(buildFlightContextInput(minutesInput, bufferInput)),
    [minutesInput, bufferInput],
  );

  const contextValid = contextResult.context !== null;
  const minutesError = contextErrorMessage(
    "minutesUntilBoarding",
    contextResult.errors,
  );
  const bufferError = contextErrorMessage("bufferMinutes", contextResult.errors);

  const filterQuery = useMemo(
    () =>
      buildFacilityFilterQuery(
        filter.text,
        filter.category,
        filter.terminalCode,
        filter.boardingArea,
      ),
    [filter],
  );

  const recommendations = useMemo(() => {
    if (
      !datasetValid ||
      !contextValid ||
      !contextResult.context ||
      !personalizationUsable ||
      baselineRecoveryRequired
    ) {
      return [];
    }
    return buildRankedRecommendations({
      context: contextResult.context,
      facilities,
      filter: filterQuery,
      travelTimes: productionTravelMinutes,
      useDemoTimeEstimates: demoEstimatesEnabled,
      durationOverrides,
    });
  }, [
    datasetValid,
    contextValid,
    contextResult.context,
    facilities,
    filterQuery,
    demoEstimatesEnabled,
    durationOverrides,
    personalizationUsable,
    baselineRecoveryRequired,
  ]);

  const resolvedDurationsByFacilityId = useMemo(() => {
    const map = new Map<string, ResolvedFacilityDurations>();
    for (const facility of facilities) {
      map.set(
        facility.id,
        resolveFacilityDurations(facility, {
          overrides: durationOverrides,
          useDemoTimeEstimates: demoEstimatesEnabled,
          demoQueueMinutes: DEMO_QUEUE_MINUTES,
          demoActivityMinutes: DEMO_ACTIVITY_MINUTES,
        }),
      );
    }
    return map;
  }, [facilities, durationOverrides, demoEstimatesEnabled]);

  const facilityById = useMemo(
    () => new Map(facilities.map((facility) => [facility.id, facility])),
    [facilities],
  );

  const value = useMemo<GateWiseSessionValue>(
    () => ({
      facilities,
      datasetErrors,
      datasetValid,
      minutesInput,
      setMinutesInput,
      bufferInput,
      setBufferInput,
      gateLandmark,
      setGateLandmark,
      demoEstimatesEnabled,
      setDemoEstimatesEnabled,
      scenarioMinutesInput,
      setScenarioMinutesInput,
      scenarioQueueInput,
      setScenarioQueueInput,
      filter,
      setFilter,
      durationOverrides,
      handleDurationOverridesChange,
      setPersonalizationDraftsValid,
      countdownState,
      setCountdownState,
      preservedManualMinutes,
      handleBaselineMinutesFromCountdown,
      handleCountdownExit,
      handleRestoreManualBaseline,
      syncPreservedManualFromDrafts,
      baselineRecoveryRequired,
      baselineRecoveryMessage,
      personalizationUsable,
      contextResult,
      contextValid,
      minutesError,
      bufferError,
      baselineUsesLiveCountdown,
      countdownPaused,
      boardingStartedForStrip,
      filterQuery,
      recommendations,
      resolvedDurationsByFacilityId,
      facilityById,
      baselineContext: contextResult.context,
    }),
    [
      facilities,
      datasetErrors,
      datasetValid,
      minutesInput,
      bufferInput,
      gateLandmark,
      demoEstimatesEnabled,
      scenarioMinutesInput,
      scenarioQueueInput,
      filter,
      durationOverrides,
      handleDurationOverridesChange,
      countdownState,
      preservedManualMinutes,
      handleBaselineMinutesFromCountdown,
      handleCountdownExit,
      handleRestoreManualBaseline,
      syncPreservedManualFromDrafts,
      baselineRecoveryRequired,
      baselineRecoveryMessage,
      personalizationUsable,
      contextResult,
      contextValid,
      minutesError,
      bufferError,
      baselineUsesLiveCountdown,
      countdownPaused,
      boardingStartedForStrip,
      filterQuery,
      recommendations,
      resolvedDurationsByFacilityId,
      facilityById,
    ],
  );

  return (
    <GateWiseSessionContext.Provider value={value}>
      {children}
    </GateWiseSessionContext.Provider>
  );
}

export function useGateWiseSession(): GateWiseSessionValue {
  const value = useContext(GateWiseSessionContext);
  if (!value) {
    throw new Error("useGateWiseSession must be used within GateWiseSessionProvider");
  }
  return value;
}
