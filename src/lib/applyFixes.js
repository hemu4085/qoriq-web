// src/lib/applyFixes.js

// --- Helpers ---
const isEmpty = (v) => v == null || String(v).trim() === "";

const normalizeWhitespace = (v) =>
  typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v;

const normalizeTitleCase = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());

// --- State Maps (comprehensive) ---
const FULL_STATE_TO_CODE = {
  "alabama": "AL","alaska": "AK","arizona": "AZ","arkansas": "AR","california": "CA",
  "colorado": "CO","connecticut": "CT","delaware": "DE","florida": "FL","georgia": "GA",
  "hawaii": "HI","idaho": "ID","illinois": "IL","indiana": "IN","iowa": "IA",
  "kansas": "KS","kentucky": "KY","louisiana": "LA","maine": "ME","maryland": "MD",
  "massachusetts": "MA","michigan": "MI","minnesota": "MN","mississippi": "MS","missouri": "MO",
  "montana": "MT","nebraska": "NE","nevada": "NV","new hampshire": "NH","new jersey": "NJ",
  "new mexico": "NM","new york": "NY","north carolina": "NC","north dakota": "ND","ohio": "OH",
  "oklahoma": "OK","oregon": "OR","pennsylvania": "PA","rhode island": "RI","south carolina": "SC",
  "south dakota": "SD","tennessee": "TN","texas": "TX","utah": "UT","vermont": "VT",
  "virginia": "VA","washington": "WA","west virginia": "WV","wisconsin": "WI","wyoming": "WY",
  "district of columbia": "DC","washington dc": "DC","dc": "DC"
};

const NICKNAME_TO_CODE = {
  "cali": "CA","calif": "CA","mass": "MA","jersey": "NJ","okla": "OK","penna": "PA",
  "north car.": "NC","south car.": "SC","n. carolina": "NC","s. carolina": "SC",
  "n. dakota": "ND","s. dakota": "SD","wash dc": "DC","d.c.": "DC"
};

const KNOWN_STATES = new Set(Object.values(FULL_STATE_TO_CODE));

function normalizeState(v) {
  if (isEmpty(v)) return v;
  const raw = String(v).trim().toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ");

  // 1) Already a valid 2-letter code
  if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase();

  // 2) Nicknames
  if (NICKNAME_TO_CODE[raw]) return NICKNAME_TO_CODE[raw];

  // 3) Full names
  if (FULL_STATE_TO_CODE[raw]) return FULL_STATE_TO_CODE[raw];

  return v;
}

// --- Phone Normalization (10-digit → E.164-like) ---
const normalizePhone = (v) => {
  if (isEmpty(v)) return v;
  const digits = String(v).replace(/\D/g, "");
  if (digits.length === 10) return `+1-${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  return v;
};

// --- Date Normalization ---
function parseAndNormalizeDate(v) {
  if (isEmpty(v)) return { ok: false, iso: v };
  const s = String(v).trim();
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m1) {
    let [_, mm, dd, yy] = m1;
    if (yy.length === 2) yy = `20${yy}`;
    return { ok: true, iso: `${yy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}` };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: true, iso: s };
  return { ok: false, iso: s };
}

// --- Name Parsing ---
const splitName = (full) => {
  if (isEmpty(full)) return { first: "", last: "" };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

// --- Company Normalization ---
const normalizeCompany = (v) => {
  if (isEmpty(v)) return v;
  return normalizeTitleCase(
    normalizeWhitespace(
      v.replace(/[,\.]/g, "").replace(/\b(inc|llc|ltd|corp|co|company)\b/gi, "")
    )
  );
};

// --- Issue Detection (used for BEFORE highlight) ---
// Case/alias-aware field resolver
function getField(row, aliases) {
  // exact match first
  for (const key of aliases) if (key in row) return row[key];
  // case-insensitive fallback
  const lcMap = Object.fromEntries(Object.keys(row).map(k => [k.toLowerCase(), k]));
  for (const key of aliases) {
    const real = lcMap[String(key).toLowerCase()];
    if (real) return row[real];
  }
  return undefined;
}

export function detectIssues(row) {
  // expand aliases to cover common header variants
  const EMAIL_KEYS = ["email","Email","email_address","EmailAddress","contact_email","ContactEmail"];
  const PHONE_KEYS = ["phone","Phone","mobile","Mobile","contact_phone","ContactPhone"];
  const STATE_KEYS = ["state","State","st","ST","st_code","ST_Code","region","Region","stade_cd","STADE_CD"];
  const DATE_KEYS  = ["date","Date","created_at","createdAt","CreatedAt","created date","Created Date"];

  const email = getField(row, EMAIL_KEYS);
  const phone = getField(row, PHONE_KEYS);
  const stateLike = getField(row, STATE_KEYS);
  const date = getField(row, DATE_KEYS);

  const issues = {};

  // email
  if (!isValidEmail(email)) issues.email = true;

  // state/region
  const stNorm = normalizeState(stateLike);
  if (!stateLike || !KNOWN_STATES.has(String(stNorm).toUpperCase())) issues.state = true;

  // date
  const d = parseAndNormalizeDate(date);
  if (!d.ok) issues.date = true;

  // phone (simple: must be 10 digits)
  const digits = phone ? String(phone).replace(/\D/g, "") : "";
  if (digits.length !== 10) issues.phone = true;

  return issues;
}

// --- Main Fix Engine ---
export default function applyFixes(row) {
  const out = { ...row };
  const fixes = {};
  let confidence = 0;

  // 1) Universal Text Clean
  Object.keys(out).forEach((k) => {
    const cleaned = normalizeWhitespace(out[k]);
    if (cleaned !== out[k]) fixes[k] = "whitespace_normalized";
    out[k] = cleaned;
  });

  // 2) Email
  const emailKey = ["email", "Email"].find((k) => k in out);
  if (emailKey) {
    const raw = out[emailKey]?.trim().toLowerCase();
    if (!isValidEmail(raw)) {
      out[emailKey] = "Unknown";
      fixes.email = "missing_or_invalid_replaced";
      confidence += 1;
    } else {
      out[emailKey] = raw;
    }
  }

  // 3) Company
  const companyKey = ["company","Company","account","Account"].find(k => k in out);
  if (companyKey) {
    const cleaned = normalizeCompany(out[companyKey]);
    if (cleaned !== out[companyKey]) {
      fixes.company = "legal_form_normalized";
      out[companyKey] = cleaned;
      confidence += 1;
    }
  }

  // 4) Name Parsing
  const nameKey = ["name","Name","contact_name","ContactName"].find(k => k in out);
  if (nameKey) {
    const { first, last } = splitName(out[nameKey]);
    out.first_name = first;
    out.last_name = last;
    fixes.name = "parsed_into_components";
  }

  // 5) State (NO COLUMN RENAMING)
  const stateKey = ["state","State","st_code","st","region"].find(k => k in out);
  if (stateKey) {
    const previous = out[stateKey];
    const normalized = normalizeState(previous);
    if (normalized !== previous) {
      out[stateKey] = normalized;
      fixes.state = "state_standardized";
      confidence += 1;
    }
  }

  // 6) Phone (normalized + counted for fix impact + consistency narrative)
  const phoneKey = ["phone","Phone","contact_phone","mobile"].find(k => k in out);
  if (phoneKey) {
    const fixed = normalizePhone(out[phoneKey]);
    if (fixed !== out[phoneKey]) {
      out[phoneKey] = fixed;
      fixes.phone = "standardized_to_e164";
      confidence += 1;
    }
  }

  // 7) Date
  const dateKey = ["date","created_at","Date","createdAt"].find(k => k in out);
  if (dateKey) {
    const p = parseAndNormalizeDate(out[dateKey]);
    if (p.ok && p.iso !== out[dateKey]) {
      out[dateKey] = p.iso;
      fixes.date = "date_format_standardized";
      confidence += 1;
    }
  }

// After all other fixes
// Sales Priority Score (0–100) = identity completeness + phone + region validity
let score = 0;
if (!isEmpty(out[emailKey])) score += 30;
if (!isEmpty(out[phoneKey])) score += 25;
if (KNOWN_STATES.has(String(out[stateKey] ?? "").toUpperCase())) score += 25;
if (!isEmpty(out[companyKey])) score += 20;

out.__priorityScore = score;


  return { ...out, __fixes: fixes, __confidenceScore: confidence };
}
