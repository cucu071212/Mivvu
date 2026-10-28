import type { IcnFacilitiesFixture } from "@/types/icn-facility-browse";
import type { MivvuPreviewLocale } from "@/lib/mivvu-preview-locale";
import fixtureKo from "@/data/fixtures/icn-facilities-ko.json";
import fixtureEn from "@/data/fixtures/icn-facilities-en.json";

/** Read-only ICN development fixture for the requested preview language (no live API). */
export function loadIcnFacilitiesFixture(locale: MivvuPreviewLocale): IcnFacilitiesFixture {
  return (locale === "en" ? fixtureEn : fixtureKo) as IcnFacilitiesFixture;
}

export function loadIcnFacilitiesKoFixture(): IcnFacilitiesFixture {
  return loadIcnFacilitiesFixture("ko");
}

export function loadIcnFacilitiesEnFixture(): IcnFacilitiesFixture {
  return loadIcnFacilitiesFixture("en");
}
