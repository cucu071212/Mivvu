import assert from "node:assert/strict";
import { inspect } from "node:util";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { fetchIcnFacilitiesPage } from "./icn-facilities-client";

// Deliberately synthetic; never load a real environment file or use real fetch.
const serviceKey = "synthetic-sec01-key+/=ONLY";
const authenticatedUrl = `https://synthetic-user:synthetic-password@fixture.invalid/api?serviceKey=${encodeURIComponent(serviceKey)}`;
const untrustedText = `${serviceKey} ${authenticatedUrl}`;
const options = { lang: "K" as const, pageNo: 1, numOfRows: 2, serviceKey };
const successBody = {
  response: {
    header: { resultCode: "00", resultMsg: "NORMAL SERVICE." },
    body: {
      pageNo: 1,
      numOfRows: 2,
      totalCount: 2,
      items: {
        "0": { sn: "1", facilitynm: "A" },
        "1": { sn: "2", facilitynm: "B" },
      },
    },
  },
};

let logCalls: unknown[][];

beforeEach(() => {
  logCalls = [];
  for (const method of ["log", "error", "warn", "info", "debug", "dir", "trace"] as const) {
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      logCalls.push(args);
    });
  }
  vi.stubGlobal("fetch", vi.fn(() => {
    throw new Error("Real fetch is forbidden in this regression suite");
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function assertNoCredentials(value: unknown): void {
  const rendered = inspect(value, { depth: null, showHidden: true, customInspect: false });
  for (const secret of [serviceKey, encodeURIComponent(serviceKey), authenticatedUrl,
    "synthetic-user", "synthetic-password", "fixture.invalid"]) {
    assert.ok(!rendered.includes(secret), "Observable error/log properties must omit credentials and request URLs");
  }
}

async function safeRejection(operation: () => Promise<unknown>): Promise<Error & {
  code?: string;
  httpStatus?: number;
}> {
  const error: unknown = await operation().then(
    () => assert.fail("Expected a controlled client error"),
    error => error,
  );
  assert.ok(error instanceof Error);
  assertNoCredentials(error);
  assertNoCredentials(Object.getOwnPropertyDescriptors(error));
  assertNoCredentials(String(error));
  assertNoCredentials(JSON.stringify(error));
  assert.equal(Object.hasOwn(error, "cause"), false);
  assert.ok(Reflect.ownKeys(error).every(key =>
    ["stack", "message", "name", "code", "httpStatus"].includes(String(key))));
  assert.equal(logCalls.length, 0, "The client must not log the original error or upstream content");
  // Also exercise what an application logger sees when it logs the returned error.
  console.error(error, error.message, error.stack, { ...error });
  assertNoCredentials(logCalls);
  return error;
}

describe("fetchIcnFacilitiesPage", () => {
  it.each(["K", "E"] as const)("preserves a successful %s page and request parameters", async lang => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(successBody)));
    const page = await fetchIcnFacilitiesPage({
      ...options,
      lang,
      facilitynm: "A & B",
      fetchImpl,
    });
    assert.deepEqual(page, {
      header: successBody.response.header,
      body: { pageNo: 1, numOfRows: 2, totalCount: 2 },
      items: Object.values(successBody.response.body.items),
    });
    assert.equal(fetchImpl.mock.calls.length, 1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    assert.equal(url.searchParams.get("serviceKey"), serviceKey);
    assert.equal(url.searchParams.get("lang"), lang);
    assert.equal(url.searchParams.get("facilitynm"), "A & B");
    assert.equal(init.method, "GET");
    assert.ok(init.signal instanceof AbortSignal);
    assert.equal(logCalls.length, 0);
  });

  it("discards a fetch error's credential-bearing message, cause, stack, and extra properties", async () => {
    const original = Object.assign(new Error(untrustedText, {
      cause: { requestUrl: authenticatedUrl, serviceKey },
    }), { requestUrl: authenticatedUrl, serviceKey });
    original.stack = untrustedText;
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options,
      fetchImpl: async () => { throw original; },
    }));
    assert.notEqual(error, original);
    assert.equal(error.code, "NETWORK_FAILURE");
  });

  it("does not stringify arbitrary fetch rejection values", async () => {
    const toString = vi.fn(() => untrustedText);
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options,
      fetchImpl: async () => { throw { toString }; },
    }));
    assert.equal(toString.mock.calls.length, 0);
    assert.equal(error.code, "NETWORK_FAILURE");
  });

  for (const stage of ["fetch", "body"] as const) {
    it(`preserves timeout distinction when the request signal expires during ${stage}`, async () => {
      const controller = new AbortController();
      vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
      const fail = () => {
        controller.abort(new DOMException("The local deadline expired", "TimeoutError"));
        throw new Error(untrustedText);
      };
      const response = new Response("unused");
      vi.spyOn(response, "text").mockImplementation(async () => fail());
      const error = await safeRejection(() => fetchIcnFacilitiesPage({
        ...options,
        fetchImpl: async () => stage === "fetch" ? fail() : response,
      }));
      assert.equal(error.code, "TIMEOUT");
      assert.match(error.message, /timed out/i);
    });
  }

  it("does not trust a remote rejection's timeout name over the local signal", async () => {
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options,
      fetchImpl: async () => { throw new DOMException(untrustedText, "TimeoutError"); },
    }));
    assert.equal(error.code, "NETWORK_FAILURE");
  });

  it("sanitizes errors raised while reading the response body", async () => {
    const response = new Response("unused");
    vi.spyOn(response, "text").mockRejectedValue(new Error(untrustedText));
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options, fetchImpl: async () => response,
    }));
    assert.equal(error.code, "NETWORK_FAILURE");
  });

  it.each([
    ["gateway message", {
      OpenAPI_ServiceResponse: { cmmMsgHeader: { errMsg: untrustedText } },
    }],
    ["gateway message object", {
      OpenAPI_ServiceResponse: { cmmMsgHeader: { errMsg: { requestUrl: authenticatedUrl } } },
    }],
    ["API result message", {
      response: { header: { resultCode: "03", resultMsg: untrustedText } },
    }],
    ["API result code", {
      response: { header: { resultCode: untrustedText, resultMsg: "failed" } },
    }],
    ["invalid response schema", { unexpected: untrustedText }],
  ])("sanitizes a 200 response containing %s", async (label, body) => {
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options, fetchImpl: async () => new Response(JSON.stringify(body)),
    }));
    assert.equal(error.code, "API_FAILURE");
  });

  it("maps gateway key errors to a controlled API failure", async () => {
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options,
      fetchImpl: async () => new Response(JSON.stringify({
          OpenAPI_ServiceResponse: {
            cmmMsgHeader: { errMsg: "SERVICE_KEY_IS_NOT_REGISTERED_ERROR" },
          },
      })),
    }));
    assert.equal(error.code, "API_FAILURE");
    assert.ok(!error.message.includes("SERVICE_KEY_IS_NOT_REGISTERED_ERROR"));
  });

  it.each([
    [403, JSON.stringify({ OpenAPI_ServiceResponse: { cmmMsgHeader: { errMsg: untrustedText } } })],
    [500, untrustedText],
    [502, "null"],
  ])("preserves HTTP %s without copying its body or status text", async (status, body) => {
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options,
      fetchImpl: async () => new Response(body, { status, statusText: untrustedText }),
    }));
    assert.equal(error.code, "HTTP_FAILURE");
    assert.equal(error.httpStatus, status);
  });

  it("hides credential-bearing JSON parse diagnostics", async () => {
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options, fetchImpl: async () => new Response(untrustedText),
    }));
    assert.equal(error.code, "INVALID_RESPONSE");
  });

  it("keeps missing-key configuration errors controlled and avoids fetch", async () => {
    const fetchImpl = vi.fn();
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options, serviceKey: " ", fetchImpl,
    }));
    assert.equal(error.code, "MISSING_SERVICE_KEY");
    assert.equal(fetchImpl.mock.calls.length, 0);
  });

  it.each([
    { pageNo: 0 },
    { numOfRows: 0 },
    { numOfRows: 101 },
    { timeoutMs: -1 },
  ])("keeps invalid request errors controlled: %j", async overrides => {
    const fetchImpl = vi.fn();
    const error = await safeRejection(() => fetchIcnFacilitiesPage({
      ...options, ...overrides, fetchImpl,
    }));
    assert.equal(error.code, "INVALID_REQUEST");
    assert.equal(fetchImpl.mock.calls.length, 0);
  });
});
