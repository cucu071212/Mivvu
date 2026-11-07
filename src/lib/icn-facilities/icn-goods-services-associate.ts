import type { IcnFacilitiesFixture, IcnFacilitiesLanguage } from "@/types/icn-facility-browse";
import type {
  IcnCapturedSourceText,
  IcnGoodsServicesCapture,
  IcnGoodsServicesCompanion,
  IcnGoodsServicesDetailProjection,
  IcnGoodsServicesObservation,
  IcnGoodsServicesParagraph,
  IcnGoodsServicesProvenance,
  IcnGoodsServicesUnavailableReason,
} from "@/types/icn-goods-services-companion";
import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import {
  parseIcnFacilityRef,
  resolveIcnFacilityRef,
  type IcnFacilityRefResolution,
  type IcnFacilityReferenceCatalogs,
} from "./icn-facility-reference";
import { icnFacilityContentFingerprint } from "./icn-snapshot-matching";
import { companionTargetDigestsMatch } from "./icn-goods-services-target-digest";
import {
  classifyIcnGoodsServicesCompanionSchema,
  validateIcnGoodsServicesCompanion,
} from "./icn-goods-services-companion-validate";

export const ICN_GOODS_SERVICES_LONG_TEXT_COLLAPSE_THRESHOLD = 280;

const verifiedCompanionBindings = new WeakMap<
  IcnGoodsServicesCompanion,
  { koFixture: IcnFacilitiesFixture; enFixture: IcnFacilitiesFixture }
>();

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
  }
  return value;
}

/** Validate companion once and register a frozen owned copy for fast detail projection on the same fixtures. */
export function bindValidatedGoodsServicesCompanion(
  rawCompanion: unknown,
  koFixture: IcnFacilitiesFixture,
  enFixture: IcnFacilitiesFixture,
): IcnGoodsServicesCompanion | null {
  if (classifyIcnGoodsServicesCompanionSchema(rawCompanion) !== "accepted_v1") {
    return null;
  }
  const validated = validateIcnGoodsServicesCompanion(rawCompanion);
  if (!validated.valid) {
    return null;
  }
  if (!companionTargetDigestsMatch(validated.companion, koFixture, enFixture)) {
    return null;
  }
  const owned = structuredClone(validated.companion);
  const frozen = deepFreeze(owned);
  verifiedCompanionBindings.set(frozen, { koFixture, enFixture });
  return frozen;
}

type SourceFieldKey = "facilityitem" | "goods" | "GOODS";

type AssociationSuccess =
  | { kind: "available"; paragraphs: IcnGoodsServicesParagraph[]; fieldAgreement: "single" | "equal" | "different" }
  | { kind: "empty" };

type AssociationFailure = {
  kind: "unavailable";
  reason: IcnGoodsServicesUnavailableReason;
  subreason?: string;
};

type AssociationResult = AssociationSuccess | AssociationFailure;

function variantKey(observation: IcnGoodsServicesObservation): string {
  return JSON.stringify(observation.fields);
}

function trimmedDisplay(text: string): string {
  return text.trim();
}

function fieldDisplayState(field: IcnGoodsServicesObservation["fields"][SourceFieldKey]): "absent" | "null" | "blank" | "placeholder" | "text" {
  if (!field.present) return "absent";
  if (field.value === null) return "null";
  if (!field.value.trim()) return "blank";
  if (trimmedDisplay(field.value) === "-") return "placeholder";
  return "text";
}

function usableParagraphsFromVariant(
  observation: IcnGoodsServicesObservation,
): { paragraphs: IcnGoodsServicesParagraph[]; fieldAgreement: "single" | "equal" | "different" } | null {
  const order: SourceFieldKey[] = ["facilityitem", "goods", "GOODS"];
  const usable: { key: SourceFieldKey; text: string }[] = [];
  for (const key of order) {
    const state = fieldDisplayState(observation.fields[key]);
    if (state === "text") {
      usable.push({
        key,
        text: trimmedDisplay(observation.fields[key].present ? (observation.fields[key].value as string) : ""),
      });
    }
  }
  if (usable.length === 0) return null;
  const texts = usable.map((entry) => entry.text);
  const allEqual = texts.every((text) => text === texts[0]);
  if (allEqual) {
    return {
      paragraphs: [{ text: texts[0], sourceFields: usable.map((entry) => entry.key) }],
      fieldAgreement: usable.length === 1 ? "single" : "equal",
    };
  }
  const groupedTexts: string[] = [];
  const fieldsByText = new Map<string, SourceFieldKey[]>();
  for (const entry of usable) {
    if (!fieldsByText.has(entry.text)) {
      fieldsByText.set(entry.text, []);
      groupedTexts.push(entry.text);
    }
    fieldsByText.get(entry.text)!.push(entry.key);
  }
  return {
    paragraphs: groupedTexts.map((text) => ({
      text,
      sourceFields: fieldsByText.get(text)!,
    })),
    fieldAgreement: "different",
  };
}

function provenanceFromCapture(
  companion: IcnGoodsServicesCompanion,
  capture: IcnGoodsServicesCapture,
): IcnGoodsServicesProvenance {
  return {
    datasetId: companion.source.datasetId,
    apiOperation: companion.source.apiOperation,
    captureStartedAt: capture.startedAt,
    captureCompletedAt: capture.completedAt,
  };
}

function distinctFingerprintsForSourceId(
  observations: IcnGoodsServicesObservation[],
  sourceId: string,
): Set<string> {
  const set = new Set<string>();
  for (const obs of observations) {
    const parsed = JSON.parse(obs.coreFingerprint) as { sourceId: string };
    if (parsed.sourceId === sourceId) set.add(obs.coreFingerprint);
  }
  return set;
}

function crossLocaleGateFailure(
  companion: IcnGoodsServicesCompanion,
  originFingerprint: string,
  targetFingerprint: string,
  sourceId: string,
): AssociationFailure | null {
  const originLang = (JSON.parse(originFingerprint) as { language: IcnFacilitiesLanguage }).language;
  const targetLang = (JSON.parse(targetFingerprint) as { language: IcnFacilitiesLanguage }).language;
  const originCapture = companion.captures[originLang];
  const targetCapture = companion.captures[targetLang];
  if (!originCapture) {
    return { kind: "unavailable", reason: "cross_locale_association_unverified", subreason: "capture_absent_origin" };
  }
  if (!targetCapture) {
    return { kind: "unavailable", reason: "cross_locale_association_unverified", subreason: "capture_absent_target" };
  }
  if (!originCapture.observations.some((o) => o.coreFingerprint === originFingerprint)) {
    return {
      kind: "unavailable",
      reason: "cross_locale_association_unverified",
      subreason: "origin_fingerprint_missing_in_capture",
    };
  }
  if (!targetCapture.observations.some((o) => o.coreFingerprint === targetFingerprint)) {
    return {
      kind: "unavailable",
      reason: "cross_locale_association_unverified",
      subreason: "target_fingerprint_missing_in_capture",
    };
  }
  if (distinctFingerprintsForSourceId(originCapture.observations, sourceId).size > 1) {
    return {
      kind: "unavailable",
      reason: "cross_locale_association_unverified",
      subreason: "source_id_multiple_cores_origin",
    };
  }
  if (distinctFingerprintsForSourceId(targetCapture.observations, sourceId).size > 1) {
    return {
      kind: "unavailable",
      reason: "cross_locale_association_unverified",
      subreason: "source_id_multiple_cores_target",
    };
  }
  const originVariants = new Set(
    originCapture.observations.filter((o) => o.coreFingerprint === originFingerprint).map(variantKey),
  );
  if (originVariants.size > 1) {
    return {
      kind: "unavailable",
      reason: "cross_locale_association_unverified",
      subreason: "origin_description_variants_ambiguous",
    };
  }
  const targetVariants = new Set(
    targetCapture.observations.filter((o) => o.coreFingerprint === targetFingerprint).map(variantKey),
  );
  if (targetVariants.size > 1) {
    return {
      kind: "unavailable",
      reason: "cross_locale_association_unverified",
      subreason: "target_description_variants_ambiguous",
    };
  }
  return null;
}

function associateLanguage(params: {
  companion: IcnGoodsServicesCompanion;
  language: IcnFacilitiesLanguage;
  targetFingerprint: string;
  crossLocale: boolean;
  originFingerprint: string;
  sourceId: string;
}): AssociationResult {
  const capture = params.companion.captures[params.language];
  if (!capture) {
    return { kind: "unavailable", reason: "not_captured", subreason: "capture_absent_requested" };
  }
  if (params.crossLocale) {
    const gate = crossLocaleGateFailure(
      params.companion,
      params.originFingerprint,
      params.targetFingerprint,
      params.sourceId,
    );
    if (gate) return gate;
  }
  const matching = capture.observations.filter((o) => o.coreFingerprint === params.targetFingerprint);
  if (matching.length === 0) {
    return { kind: "unavailable", reason: "no_exact_observation" };
  }
  const variants = new Set(matching.map(variantKey));
  if (variants.size > 1) {
    return { kind: "unavailable", reason: "source_variants_ambiguous" };
  }
  const built = usableParagraphsFromVariant(matching[0]);
  if (!built) return { kind: "empty" };
  return { kind: "available", paragraphs: built.paragraphs, fieldAgreement: built.fieldAgreement };
}

function hidden(
  reason: IcnGoodsServicesUnavailableReason,
  requested: IcnFacilitiesLanguage,
  subreason?: string,
): IcnGoodsServicesDetailProjection {
  return {
    sectionVisible: false,
    internal: { unavailable: { reason, requestedLanguage: requested, gateOrPrecheckSubreason: subreason } },
  };
}

export function projectIcnGoodsServicesForDetail(params: {
  rawCompanion: unknown;
  koFixture: IcnFacilitiesFixture;
  enFixture: IcnFacilitiesFixture;
  referenceCatalogs: IcnFacilityReferenceCatalogs;
  serializedRef: unknown;
  previewLocale: MivvuPreviewLocale;
  resolution: IcnFacilityRefResolution;
  koSourceLabel: string;
}): IcnGoodsServicesDetailProjection {
  const requestedLanguage: IcnFacilitiesLanguage = params.previewLocale === "ko" ? "K" : "E";
  if (params.resolution.status !== "found") {
    return { sectionVisible: false };
  }

  let companion: IcnGoodsServicesCompanion;
  const raw = params.rawCompanion;
  const binding =
    raw !== null && typeof raw === "object"
      ? verifiedCompanionBindings.get(raw as IcnGoodsServicesCompanion)
      : undefined;
  if (binding && binding.koFixture === params.koFixture && binding.enFixture === params.enFixture) {
    const boundCompanion = raw as IcnGoodsServicesCompanion;
    if (!companionTargetDigestsMatch(boundCompanion, params.koFixture, params.enFixture)) {
      return hidden("artifact_mismatch", requestedLanguage);
    }
    companion = boundCompanion;
  } else if (params.rawCompanion === null || params.rawCompanion === undefined) {
    return hidden("not_captured", requestedLanguage);
  } else {
    const schemaOutcome = classifyIcnGoodsServicesCompanionSchema(params.rawCompanion);
    if (schemaOutcome === "unsupported_version") {
      return hidden("unsupported_version", requestedLanguage);
    }
    if (schemaOutcome !== "accepted_v1") {
      return hidden("invalid_artifact", requestedLanguage);
    }

    const validated = validateIcnGoodsServicesCompanion(params.rawCompanion);
    if (!validated.valid) {
      return hidden("invalid_artifact", requestedLanguage);
    }
    companion = validated.companion;
    if (!companionTargetDigestsMatch(companion, params.koFixture, params.enFixture)) {
      return hidden("artifact_mismatch", requestedLanguage);
    }
  }

  const parsedRef = parseIcnFacilityRef(params.serializedRef);
  if (parsedRef.status !== "valid") {
    return hidden("invalid_artifact", requestedLanguage);
  }
  const originFingerprint = parsedRef.ref.contentFingerprint;
  const originLang = (JSON.parse(originFingerprint) as { language: IcnFacilitiesLanguage }).language;
  const targetFingerprint = icnFacilityContentFingerprint(params.resolution.record);
  const sourceId = params.resolution.record.sourceId;
  const crossLocale = originLang !== requestedLanguage;

  const primary = associateLanguage({
    companion,
    language: requestedLanguage,
    targetFingerprint,
    crossLocale,
    originFingerprint,
    sourceId,
  });

  if (primary.kind === "unavailable") {
    return hidden(primary.reason, requestedLanguage, primary.subreason);
  }

  if (primary.kind === "available") {
    const capture = companion.captures[requestedLanguage]!;
    const fullText = primary.paragraphs.map((p) => p.text).join("\n");
    return {
      sectionVisible: true,
      available: {
        paragraphs: primary.paragraphs,
        fieldAgreement: primary.fieldAgreement,
        language: requestedLanguage,
        fallbackUsed: false,
        provenance: provenanceFromCapture(companion, capture),
        longTextCollapsedByDefault: fullText.length > ICN_GOODS_SERVICES_LONG_TEXT_COLLAPSE_THRESHOLD,
      },
      internal: { englishOutcome: requestedLanguage === "E" ? "available" : undefined },
    };
  }

  if (params.previewLocale === "en" && parsedRef.ref.pairedContentFingerprint) {
    const resolutionK = resolveIcnFacilityRef(params.serializedRef, params.referenceCatalogs, "K");
    if (resolutionK.status !== "found") {
      return hidden("empty", requestedLanguage);
    }
    const koFingerprint = icnFacilityContentFingerprint(resolutionK.record);
    const koAssoc = associateLanguage({
      companion,
      language: "K",
      targetFingerprint: koFingerprint,
      crossLocale: true,
      originFingerprint,
      sourceId,
    });
    if (koAssoc.kind === "available") {
      const capture = companion.captures.K!;
      const fullText = koAssoc.paragraphs.map((p) => p.text).join("\n");
      return {
        sectionVisible: true,
        available: {
          paragraphs: koAssoc.paragraphs,
          fieldAgreement: koAssoc.fieldAgreement,
          language: "K",
          fallbackUsed: true,
          sourceLabel: params.koSourceLabel,
          provenance: provenanceFromCapture(companion, capture),
          longTextCollapsedByDefault: fullText.length > ICN_GOODS_SERVICES_LONG_TEXT_COLLAPSE_THRESHOLD,
        },
        internal: {
          englishOutcome: "empty",
          koreanFallbackAttempted: true,
          koreanFallbackEligible: true,
        },
      };
    }
    return {
      sectionVisible: false,
      internal: {
        unavailable: { reason: "empty", requestedLanguage: "E" },
        englishOutcome: "empty",
        koreanFallbackAttempted: true,
        koreanFallbackEligible: false,
      },
    };
  }

  return hidden("empty", requestedLanguage);
}

export function captureGoodsServicesFieldsFromRawRow(row: Record<string, unknown>): IcnGoodsServicesObservation["fields"] {
  const read = (key: string): IcnCapturedSourceText => {
    if (!Object.hasOwn(row, key)) return { present: false };
    const value = row[key];
    if (value === null) return { present: true, value: null };
    if (typeof value === "string") return { present: true, value };
    return { present: true, value: null };
  };
  return {
    facilityitem: read("facilityitem"),
    goods: read("goods"),
    GOODS: read("GOODS"),
  };
}
