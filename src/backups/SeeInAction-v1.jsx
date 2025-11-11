// src/pages/SeeInAction.jsx
import React, { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import Scorecard from "../components/Scorecard.jsx";

// Minimal normalization maps for demo
const STATE_MAP = {
  cali: "CA",
  calif: "CA",
  california: "CA",
  tex: "TX",
  texas: "TX",
  mass: "MA",
  massachusetts: "MA",
};

const KNOWN_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY",
  "LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND",
  "OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
]);

// --- Utilities ---
const isEmpty = (v) => v == null || String(v).trim() === "";

function isValidEmail(v) {
  if (isEmpty(v)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

function normalizeState(v) {
  if (isEmpty(v)) return v;
  const raw = String(v).trim().toLowerCase();
  if (STATE_MAP[raw]) return STATE_MAP[raw];
  const up = raw.toUpperCase();
  if (KNOWN_STATES.has(up)) return up;
  return v;
}

function parseAndNormalizeDate(v) {
  if (isEmpty(v)) return { ok: false, iso: v };
  const s = String(v).trim();
  // Try common formats: mm/dd/yyyy, m/d/yy
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m1) {
    let [_, mm, dd, yy] = m1;
    if (yy.length === 2) yy = `20${yy}`;
    const iso = `${yy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    return { ok: true, iso };
  }
  // Already looks ISO
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) return { ok: true, iso: s };
  // Give up
  return { ok: false, iso: s };
}

function detectIssues(row) {
  // Heuristic required fields (typical CRM demo)
  const email = row.email ?? row.Email ?? row.contact_email ?? row.ContactEmail;
  const state = row.state ?? row.State ?? row.st ?? row.st_code ?? row.stade_cd;
  const date  = row.date ?? row.created_at ?? row.Date ?? row.createdAt;

  const issues = {};
  if (!isValidEmail(email)) issues.email = "Invalid or missing email";
  const st = normalizeState(state);
  if (!state || !KNOWN_STATES.has(String(st).toUpperCase())) {
    issues.state = "State not normalized";
  }
  const p = parseAndNormalizeDate(date);
  if (!p.ok) issues.date = "Date not ISO (YYYY-MM-DD)";

  return issues;
}

function applyFixes(row) {
  // Create a shallow copy and fix typical fields if present
  const out = { ...row };

  // email -> trim + lowercase
  if (out.email) out.email = String(out.email).trim().toLowerCase();
  if (out.Email) out.Email = String(out.Email).trim().toLowerCase();
  if (out.contact_email) out.contact_email = String(out.contact_email).trim().toLowerCase();

  // state -> map/uppercase
  const stateKey = ["state","State","st","st_code","stade_cd"].find((k) => k in out);
  if (stateKey) out[stateKey] = normalizeState(out[stateKey]);

  // date -> ISO
  const dateKey = ["date","created_at","Date","createdAt"].find((k) => k in out);
  if (dateKey) {
    const p = parseAndNormalizeDate(out[dateKey]);
    if (p.ok) out[dateKey] = p.iso;
  }
  return out;
}

// Score computation (simple, transparent demo)
function computeMetrics(rows) {
  if (!rows.length) {
    return { completeness: 0, consistency: 0, validity: 0, uniqueness: 0 };
  }

  // Define canonical keys to check
  const emailKey = ["email","Email","contact_email","ContactEmail"].find((k) => k in rows[0]) ?? "email";
  const stateKey = ["state","State","st","st_code","stade_cd"].find((k) => k in rows[0]) ?? "state";
  const dateKey  = ["date","created_at","Date","createdAt"].find((k) => k in rows[0]) ?? "date";
  const companyKey = ["company","Company","account","Account","org","Org"].find((k)=>k in rows[0]) ?? "company";
  const nameKey = ["name","Name","contact_name","ContactName"].find((k)=>k in rows[0]) ?? "name";

  // Completeness: % non-empty across key fields
  let nonEmpty = 0;
  let totalCells = 0;
  rows.forEach((r) => {
    [emailKey, stateKey, dateKey, companyKey, nameKey].forEach((k) => {
      totalCells += 1;
      if (!isEmpty(r[k])) nonEmpty += 1;
    });
  });
  const completeness = (nonEmpty / totalCells) * 100;

  // Consistency: % rows with normalized state & ISO date shape
  let consistent = 0;
  rows.forEach((r) => {
    const st = r[stateKey];
    const d  = r[dateKey];
    const okState = !isEmpty(st) && KNOWN_STATES.has(String(st).toUpperCase());
    const okDate  = !isEmpty(d) && /^\d{4}-\d{2}-\d{2}$/.test(String(d));
    if (okState && okDate) consistent += 1;
  });
  const consistency = (consistent / rows.length) * 100;

  // Validity: % rows with valid email format
  let valid = 0;
  rows.forEach((r) => {
    const e = r[emailKey];
    if (isValidEmail(e)) valid += 1;
  });
  const validity = (valid / rows.length) * 100;

  // Uniqueness: % unique by email + company
  const seen = new Set();
  let uniqueCount = 0;
  rows.forEach((r) => {
    const e = (r[emailKey] ?? "").toLowerCase().trim();
    const c = String(r[companyKey] ?? "").toLowerCase().trim();
    const key = `${e}||${c}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCount += 1;
    }
  });
  const uniqueness = (uniqueCount / rows.length) * 100;

  return {
    completeness: Math.round(completeness),
    consistency:  Math.round(consistency),
    validity:     Math.round(validity),
    uniqueness:   Math.round(uniqueness),
  };
}

export default function SeeInAction() {
  const [rawRows, setRawRows] = useState([]);
  const [fixedRows, setFixedRows] = useState([]);
  const [showFixed, setShowFixed] = useState(false);

  const fileRef = useRef(null);

  const issuesMap = useMemo(() => {
    const m = new Map();
    rawRows.forEach((row, idx) => {
      m.set(idx, detectIssues(row));
    });
    return m;
  }, [rawRows]);

  const before = useMemo(() => computeMetrics(rawRows), [rawRows]);
  const after  = useMemo(() => computeMetrics(showFixed ? fixedRows : rawRows), [fixedRows, rawRows, showFixed]);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const rows = res.data.map((r) => Object.fromEntries(
          Object.entries(r).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
        ));
        setRawRows(rows.slice(0, 200));     // cap preview to 200
        setFixedRows([]);                    // reset fixes
        setShowFixed(false);
      },
    });
  }

  function doFixes() {
    const cleaned = rawRows
      .map(applyFixes)
      // de-dup by email+company after normalization
      .filter((row, idx, arr) => {
        const email = (row.email ?? row.Email ?? "").toLowerCase().trim();
        const company = String(row.company ?? row.Company ?? "").toLowerCase().trim();
        const key = `${email}||${company}`;
        const first = arr.findIndex((r) => {
          const e = (r.email ?? r.Email ?? "").toLowerCase().trim();
          const c = String(r.company ?? r.Company ?? "").toLowerCase().trim();
          return `${e}||${c}` === key;
        });
        return first === idx;
      });

    setFixedRows(cleaned);
    setShowFixed(true);
  }

  // Headers for table (union of keys in preview)
  const headers = useMemo(() => {
    const set = new Set();
    (showFixed ? fixedRows : rawRows).forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [rawRows, fixedRows, showFixed]);

  const previewRows = useMemo(() => (showFixed ? fixedRows : rawRows), [rawRows, fixedRows, showFixed]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07172B] to-[#0B2240] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-sm bg-black/10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0EA5E9]/20 ring-1 ring-white/10 grid place-items-center shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="2" />
                <circle cx="17" cy="7" r="2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
                <path d="M9 7h6M7 9v6M17 9v6M9 17h6" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">Qoriq</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-white/80 hover:text-white">Home</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Scorecard row (matches landing) */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">See in Action</h1>
            <p className="text-white/75 text-sm">
              Upload your CRM CSV and watch <span className="font-semibold">AI Readiness</span> improve
              as we normalize states, standardize dates, and clean emails. Compare{" "}
              <span className="font-semibold">Before</span> vs <span className="font-semibold">After</span>.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer rounded-xl border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/10">
                <input type="file" accept=".csv" className="hidden" ref={fileRef} onChange={handleFile} />
                Upload CSV
              </label>
              <button
                disabled={!rawRows.length}
                onClick={doFixes}
                className="rounded-xl bg-white text-[#0B2240] px-3 py-2 text-sm font-semibold shadow hover:bg-[#E6F2FF] disabled:opacity-50"
              >
                Apply AI Fixes
              </button>
              <button
                disabled={!fixedRows.length}
                onClick={() => setShowFixed((s) => !s)}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
              >
                {showFixed ? "Show Before (Original)" : "Show After (Fixed)"}
              </button>
            </div>
          </div>

          <Scorecard before={before} after={after} animate />
        </div>

        {/* Data Preview */}
        {previewRows.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 ring-1 ring-white/10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="text-sm text-white/80">
                Preview • {showFixed ? "After Fixes" : "Original"} • showing up to 200 rows
              </div>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-400" /> Row has issues
                </span>
                <span>Yellow = needs attention</span>
              </div>
            </div>

            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-[#0B2240] text-white/80">
                  <tr>
                    <th className="px-3 py-2 text-left w-6"></th>
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left border-b border-white/10">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 200).map((row, i) => {
                    const issues = showFixed ? {} : (issuesMap.get(i) ?? {});
                    const hasIssues = Object.keys(issues).length > 0;

                    return (
                      <tr key={i} className="odd:bg-white/[0.03]">
                        <td className="px-3">
                          {hasIssues && <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />}
                        </td>
                        {headers.map((h) => {
                          const cellIssue =
                            !showFixed &&
                            ((h.toLowerCase().includes("email") && issues.email) ||
                             (h.toLowerCase().includes("state") && issues.state) ||
                             (h.toLowerCase().includes("date")  && issues.date));
                          return (
                            <td
                              key={h}
                              className={`px-3 py-2 border-b border-white/10 align-top ${
                                cellIssue ? "bg-yellow-400/20 ring-1 ring-yellow-300/30" : ""
                              }`}
                            >
                              {String(row[h] ?? "")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sync & Ask (placeholder CTA) */}
        {previewRows.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-xl bg-[#38BDF8] text-[#07172B] px-4 py-2 text-sm font-semibold shadow hover:bg-[#67D2FF]">
              Sync to Bedrock KB
            </button>
            <button className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10">
              Ask Your Data (RAG Q&A)
            </button>
            <span className="text-xs text-white/60">Demo placeholders — wire these to your backend when ready.</span>
          </div>
        )}
      </main>
    </div>
  );
}
