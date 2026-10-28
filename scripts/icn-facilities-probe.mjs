/**
 * Read-only probe for IIAC terminal facilities API (data.go.kr B551177).
 * Requires DATA_GO_KR_SERVICE_KEY in environment (never commit the key).
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   node scripts/icn-facilities-probe.mjs [--lang E] [--rows 5] [--page 1] [--facilitynm "화장실"]
 */
import process from "node:process";

const BASE =
  "https://apis.data.go.kr/B551177/FacilitiesInformation/getFacilitesInfo";

function parseArgs(argv) {
  const opts = { lang: "E", rows: 5, page: 1, facilitynm: "" };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--lang" && argv[i + 1]) opts.lang = argv[++i];
    else if (arg === "--rows" && argv[i + 1]) opts.rows = Number(argv[++i]);
    else if (arg === "--page" && argv[i + 1]) opts.page = Number(argv[++i]);
    else if (arg === "--facilitynm" && argv[i + 1]) opts.facilitynm = argv[++i];
  }
  return opts;
}

function normalizeItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw.item)) return raw.item;
  if (raw.item) return [raw.item];
  if (typeof raw === "object") return Object.values(raw);
  return [];
}

function redactRecord(item) {
  if (!item || typeof item !== "object") return item;
  const copy = { ...item };
  if (copy.tel) copy.tel = "[REDACTED_PHONE]";
  return copy;
}

const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY?.trim();
if (!serviceKey) {
  console.error(
    "Missing DATA_GO_KR_SERVICE_KEY. Add it to a gitignored file (e.g. .env.local) and export before running.",
  );
  process.exit(2);
}

const { lang, rows, page, facilitynm } = parseArgs(process.argv);
const url = new URL(BASE);
url.searchParams.set("serviceKey", serviceKey);
url.searchParams.set("type", "json");
url.searchParams.set("numOfRows", String(rows));
url.searchParams.set("pageNo", String(page));
url.searchParams.set("lang", lang);
if (facilitynm) url.searchParams.set("facilitynm", facilitynm);

const safeUrl = new URL(url);
safeUrl.searchParams.set("serviceKey", "[REDACTED]");

let response;
try {
  response = await fetch(url, { method: "GET" });
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: String(error), request: safeUrl.href }));
  process.exit(1);
}

const bodyText = await response.text();
let body;
try {
  body = JSON.parse(bodyText);
} catch {
  body = { raw: bodyText.slice(0, 500) };
}

const gwHeader = body?.OpenAPI_ServiceResponse?.cmmMsgHeader;
if (gwHeader?.errMsg) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        httpStatus: response.status,
        request: safeUrl.href,
        errMsg: gwHeader.errMsg,
        returnReasonCode: gwHeader.returnReasonCode,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const header = body?.response?.header;
const responseBody = body?.response?.body;
const list = normalizeItems(responseBody?.items);

if (header?.resultCode && header.resultCode !== "00") {
  console.log(
    JSON.stringify(
      {
        ok: false,
        httpStatus: response.status,
        request: safeUrl.href,
        resultCode: header.resultCode,
        resultMsg: header.resultMsg,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      httpStatus: response.status,
      request: safeUrl.href,
      resultCode: header?.resultCode ?? null,
      resultMsg: header?.resultMsg ?? null,
      pagination: {
        pageNo: responseBody?.pageNo ?? null,
        numOfRows: responseBody?.numOfRows ?? null,
        totalCount: responseBody?.totalCount ?? null,
      },
      recordCount: list.length,
      samples: list.slice(0, 3).map(redactRecord),
    },
    null,
    2,
  ),
);
