// src/pages/SeeInAction.jsx
import React, { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import ScoreGrid from "../components/ScoreGrid.jsx";
import InsightsPanel from "../components/InsightsPanel.jsx";
import ImprovementsBanner from "../components/ImprovementsBanner.jsx";

// --- Scoring Helper: Convert raw metrics → letter grades ---
function toGrade(pct) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  return "D";
}

// --- Data Quality Checks + Fixes (same as your version, unchanged) ---
const STATE_MAP = { cali: "CA", calif: "CA", california: "CA", tex: "TX", texas: "TX", mass: "MA", massachusetts: "MA" };
const KNOWN_STATES = new Set(["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"]);
const isEmpty = (v) => v == null || String(v).trim() === "";
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());

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
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m1) {
    let [_, mm, dd, yy] = m1;
    if (yy.length === 2) yy = `20${yy}`;
    return { ok: true, iso: `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}` };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: true, iso: s };
  return { ok: false, iso: s };
}

function detectIssues(row) {
  const email = row.email ?? row.Email;
  const state = row.state ?? row.State;
  const date = row.date ?? row.created_at;

  const issues = {};
  if (!isValidEmail(email)) issues.email = true;
  const st = normalizeState(state);
  if (!state || !KNOWN_STATES.has(String(st).toUpperCase())) issues.state = true;
  if (!parseAndNormalizeDate(date).ok) issues.date = true;
  return issues;
}

function applyFixes(row) {
  const out = { ...row };
  if (out.email) out.email = out.email.trim().toLowerCase();
  if (out.Email) out.Email = out.Email.trim().toLowerCase();
  const sKey = ["state","State"].find((k) => k in out);
  if (sKey) out[sKey] = normalizeState(out[sKey]);
  const dKey = ["date","created_at"].find((k) => k in out);
  if (dKey) {
    const p = parseAndNormalizeDate(out[dKey]);
    if (p.ok) out[dKey] = p.iso;
  }
  return out;
}

function computeMetrics(rows) {
  if (!rows.length) return { completeness: 0, consistency: 0, validity: 0, uniqueness: 0 };

  const emailKey = ["email","Email"].find((k) => k in rows[0]) ?? "email";
  const stateKey = ["state","State"].find((k) => k in rows[0]) ?? "state";
  const dateKey  = ["date","created_at"].find((k) => k in rows[0]) ?? "date";
  const companyKey = ["company","Company"].find((k)=>k in rows[0]) ?? "company";

  // Completeness
  let filled = 0, total = 0;
  rows.forEach((r) => [emailKey,stateKey,dateKey,companyKey].forEach(k => { total++; if (!isEmpty(r[k])) filled++; }));
  const completeness = (filled / total) * 100;

  // Consistency
  const consistency = rows.filter(r =>
    KNOWN_STATES.has(String(r[stateKey] ?? "").toUpperCase()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(r[dateKey] ?? ""))
  ).length / rows.length * 100;

  // Validity
  const validity = rows.filter(r => isValidEmail(r[emailKey])).length / rows.length * 100;

  // Uniqueness
  const seen = new Set();
  const uniqueCount = rows.filter(r => {
    const key = `${(r[emailKey] ?? "").toLowerCase()}||${(r[companyKey] ?? "").toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).length;
  const uniqueness = (uniqueCount / rows.length) * 100;

  return {
    completeness: Math.round(completeness),
    consistency: Math.round(consistency),
    validity: Math.round(validity),
    uniqueness: Math.round(uniqueness),
  };
}

export default function SeeInAction() {
  const [rawRows, setRawRows] = useState([]);
  const [fixedRows, setFixedRows] = useState([]);
  const [showFixed, setShowFixed] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const fileRef = useRef(null);

  const issuesMap = useMemo(() => {
    const m = new Map();
    rawRows.forEach((row, idx) => m.set(idx, detectIssues(row)));
    return m;
  }, [rawRows]);

  const before = useMemo(() => computeMetrics(rawRows), [rawRows]);
  const after = useMemo(() => computeMetrics(showFixed ? fixedRows : rawRows), [fixedRows, rawRows, showFixed]);

  const beforeGrades = {
    Completeness: toGrade(before.completeness),
    Consistency: toGrade(before.consistency),
    Validity: toGrade(before.validity),
    Uniqueness: toGrade(before.uniqueness),
  };

  const afterGrades = {
    Completeness: toGrade(after.completeness),
    Consistency: toGrade(after.consistency),
    Validity: toGrade(after.validity),
    Uniqueness: toGrade(after.uniqueness),
  };

  function handleFile(e) {
  const f = e.target.files?.[0];
  if (!f) return;

  Papa.parse(f, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    complete: (res) => {
      // Show what we received directly on screen
      setDebugInfo(res.data.slice(0, 5)); // ✅ show first 5 rows visibly

      // If rows are valid, apply our cleaning
      if (res.data && res.data.length > 0) {
        const rows = res.data.map((r) =>
          Object.fromEntries(
            Object.entries(r).map(([k, v]) => [
              k.trim(),
              typeof v === "string" ? v.trim() : v,
            ])
          )
        );
        setRawRows(rows.slice(0, 200));
        setFixedRows([]);
        setShowFixed(false);
      }
    },
  });
}



  function doFixes() {
    const cleaned = rawRows.map(applyFixes);
    setFixedRows(cleaned);
    setShowFixed(true);
  }

  const previewRows = showFixed ? fixedRows : rawRows;
  const headers = [...new Set(previewRows.flatMap(r => Object.keys(r)))];

  function exportCSV() {
    const rows = showFixed ? fixedRows : rawRows;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map(r => headers.map(h => r[h] ?? "").join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qoriq_cleaned_data.csv";
    a.click();
  }

  return (
    <div className="min-h-screen bg-[#07172B] text-white">
      <main className="mx-auto max-w-7xl px-4 py-10 space-y-10">
        <div className="bg-red-600 text-white p-3 rounded-xl text-center">
     ✅ This is the REAL SeeInAction.jsx being rendered
</div>

        {debugInfo && (
          <div className="bg-black/20 border border-white/20 text-white p-4 rounded-xl text-xs whitespace-pre-wrap">
            <strong>Parsed Sample (first 5 rows):</strong>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        {/* HEADER */}
        <h1 className="text-2xl font-semibold">See In Action</h1>

{/* UPLOAD + ACTIONS */}
<div className="flex flex-wrap items-center gap-3">

  {/* Upload CSV */}
  <button
    className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
    onClick={() => fileRef.current?.click()}
  >
    Upload CSV
  </button>

  {/* Hidden file input (wired to handleFile) */}
  <input
    type="file"
    accept=".csv"
    ref={fileRef}
    onChange={(e) => {
      console.log("🔥 FILE CHANGE EVENT FIRED ✅");
      handleFile(e);
    }}
    className="hidden"
  />

  {/* Apply fixes */}
  <button
    disabled={!rawRows.length}
    onClick={doFixes}
    className="rounded-xl bg-white text-[#07172B] px-4 py-2 text-sm font-semibold shadow hover:bg-[#E6F2FF] disabled:opacity-50"
  >
    Apply AI Fixes
  </button>

  {/* Toggle before/after (only after we have fixedRows) */}
  {fixedRows.length > 0 && (
    <button
      onClick={() => setShowFixed((s) => !s)}
      className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
    >
      {showFixed ? "Show Before" : "Show After"}
    </button>
  )}

</div>


        {/* SCORECARDS (Before / After) */}
        {rawRows.length > 0 && (
          <>
            <div>
              <div className="text-sm text-white/70 mb-1">Before Fixes</div>
              <ScoreGrid scores={beforeGrades} />
            </div>

            {showFixed && (
              <>
                <div>
                  <div className="text-sm text-white/70 mb-1">After Fixes</div>
                  <ScoreGrid scores={afterGrades} />
                <ImprovementsBanner scoresBefore={beforeGrades} scoresAfter={afterGrades} />
                </div>

                {/* INSIGHTS PANEL */}
                <InsightsPanel scoresBefore={beforeGrades} scoresAfter={afterGrades} issues={issuesMap} />
              </>
            )}
          </>
        )}

        {/* DATA TABLE */}
        {previewRows.length > 0 && (
          <div className="rounded-xl border border-white/10 overflow-auto max-h-[500px] text-sm">
            <table className="min-w-full">
              <thead className="bg-[#0B2240] text-white/80 sticky top-0">
                <tr>
                  {headers.map(h => (
                    <th key={h} className="px-3 py-2 text-left border-b border-white/10">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => {
                  const issues = showFixed ? {} : issuesMap.get(i) ?? {};
                  return (
                    <tr key={i} className="odd:bg-white/5">
                      {headers.map(h => {
                        const highlight =
                          (!showFixed && ((h.toLowerCase().includes("email") && issues.email) ||
                                          (h.toLowerCase().includes("state") && issues.state) ||
                                          (h.toLowerCase().includes("date") && issues.date)));
                        return (
                          <td key={h} className={`px-3 py-2 border-b border-white/10 ${highlight ? "bg-yellow-400/30 ring-1 ring-yellow-300/40" : ""}`}>
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
        )}

        {/* EXPORT + SYNC + ASK */}
        {fixedRows.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-white/15">
            <button onClick={exportCSV} className="bg-[#38BDF8] text-[#07172B] px-4 py-2 rounded-xl font-semibold hover:bg-[#67D2FF]">
              Export Cleaned CSV
            </button>

            <button
              onClick={() => alert("✅ Synced to Qoriq Cloud Workspace (stub).")}
              className="border border-white/25 px-4 py-2 rounded-xl hover:bg-white/10"
            >
              Sync to Qoriq Cloud
            </button>

            <button
              onClick={() => document.getElementById("ask-your-data-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-white text-[#07172B] px-4 py-2 rounded-xl font-semibold hover:bg-gray-100"
            >
              Ask Your Data
            </button>
          </div>
        )}

        {/* Placeholder Ask section */}
        <div id="ask-your-data-section" className="pt-20 text-center text-white/60 text-sm">
          (RAG Q&A UI goes here)
        </div>

      </main>
    </div>
  );
}
