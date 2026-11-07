/**
 * @vitest-environment jsdom
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY } from "@/lib/mivvu-entry-routes";
import {
  abandonIcnBrowseDetailSessionIfPending,
  armBrowseOriginIntentForRef,
  consumeBrowseOriginIntent,
  consumeHubRestoreFilters,
  detailOpenedFromBrowse,
  readIcnBrowseDetailSession,
  registerActiveDetailVisit,
  safeIcnSessionGetItem,
  saveIcnBrowseDetailNavigation,
  scheduleHubRestoreFromDetail,
  clearIcnBrowseSessionContext,
  suspendDetailVisitAuthorizationOnCachedDeparture,
  resumeBrowseOriginAfterBfcache,
} from "./icn-browse-session";

describe("icn-browse-session", () => {
  afterEach(() => {
    clearIcnBrowseSessionContext();
  });

  it("scopes browse-origin to matching ref, visit token, and live registration", () => {
    saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "encoded-ref" });
    assert.equal(detailOpenedFromBrowse("encoded-ref"), false);
    const session = readIcnBrowseDetailSession();
    assert.ok(session?.visitToken);
    armBrowseOriginIntentForRef("encoded-ref");
    const unregister = registerActiveDetailVisit(session.visitToken);
    assert.equal(detailOpenedFromBrowse("encoded-ref"), true);
    assert.equal(detailOpenedFromBrowse("other-ref"), false);
    assert.equal(consumeHubRestoreFilters(), null);
    assert.ok(scheduleHubRestoreFromDetail());
    assert.equal(detailOpenedFromBrowse("encoded-ref"), false);
    assert.deepEqual(consumeHubRestoreFilters(), {
      query: "ARABICA",
      terminalFilter: "P03",
      categoryLarge: "all",
      categoryMedium: "all",
    });
    assert.equal(readIcnBrowseDetailSession(), null);
    unregister();
  });

  it("abandons pending navigation when detail is left without scheduling restore", async () => {
    saveIcnBrowseDetailNavigation({ query: "x", terminalFilter: "all", refPathSegment: "r1" });
    const session = readIcnBrowseDetailSession();
    assert.ok(session?.visitToken);
    armBrowseOriginIntentForRef("r1");
    const unregister = registerActiveDetailVisit(session.visitToken);
    unregister();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    assert.equal(readIcnBrowseDetailSession(), null);
    abandonIcnBrowseDetailSessionIfPending();
    assert.equal(readIcnBrowseDetailSession(), null);
  });

  it("does not abandon after scheduling hub restore", () => {
    saveIcnBrowseDetailNavigation({ query: "x", terminalFilter: "all", refPathSegment: "r1" });
    scheduleHubRestoreFromDetail();
    abandonIcnBrowseDetailSessionIfPending();
    assert.equal(readIcnBrowseDetailSession()?.restoreOnNextHubVisit, true);
  });

  it("suspends authorization on persisted departure without clearing restore payload", () => {
    saveIcnBrowseDetailNavigation({ query: "x", terminalFilter: "all", refPathSegment: "r1" });
    armBrowseOriginIntentForRef("r1");
    registerActiveDetailVisit(readIcnBrowseDetailSession()!.visitToken!);
    suspendDetailVisitAuthorizationOnCachedDeparture();
    assert.equal(detailOpenedFromBrowse("r1"), false);
    assert.ok(readIcnBrowseDetailSession());
  });

  it("does not grant BFCache resume to a document that never claimed browse origin", () => {
    saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "r1" });
    assert.equal(resumeBrowseOriginAfterBfcache("r1"), false);
    assert.equal(detailOpenedFromBrowse("r1"), false);
  });

  it("grants BFCache resume when this document previously claimed the visit token", () => {
    saveIcnBrowseDetailNavigation({ query: "ARABICA", terminalFilter: "P03", refPathSegment: "r1" });
    armBrowseOriginIntentForRef("r1");
    const token = readIcnBrowseDetailSession()!.visitToken!;
    consumeBrowseOriginIntent("r1");
    registerActiveDetailVisit(token);
    suspendDetailVisitAuthorizationOnCachedDeparture();
    assert.ok(resumeBrowseOriginAfterBfcache("r1"));
    assert.equal(detailOpenedFromBrowse("r1"), true);
  });

  it("returns null from safe reads when storage getter throws", () => {
    const original = Object.getOwnPropertyDescriptor(window, "sessionStorage");
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
    try {
      assert.equal(safeIcnSessionGetItem(MIVVU_ICN_BROWSE_CONTEXT_SESSION_KEY), null);
      assert.equal(readIcnBrowseDetailSession(), null);
    } finally {
      if (original) Object.defineProperty(window, "sessionStorage", original);
      else delete (window as { sessionStorage?: Storage }).sessionStorage;
    }
  });
});
