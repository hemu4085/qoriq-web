// src/pages/SeeInAction.jsx
import React, { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import ScoreCard from "../components/ScoreCard.jsx";

// --- Helpers ---------------------------------------------------------------

// Detect obvious issues in a row; returns an array of { col, reason }
function detectIssues(row) {
  const issues = [];
  for (const [col, valRaw] of Object.entries(row)) {
    if (col === "_issues") continue;
    const val = (valRaw ?? "").toString().trim();

    // Empty / missing
    if (val === "" || val === "null" || val === "undefined") {
      issues.push({ col, reason: "Missing value" });
      continue;
    }

    // Email validity (very light check)
    if (col.toLowerCase().includes("email")) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) issues.push({ col, reason: "Invalid email format" });
    }

    // State normalization (example: cali -> CA)
    if (["state", "st", "st_cd", "state_cd", "state_code"].includes(col.toLowerCase())) {
      const s = val.toUpperCase();
      if (!["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"].includes(s)) {
        issues.push({ col, reason: "Non-standard state / mapping needed" });
      }
    }

    // Date light-check (accept YYYY-MM-DD or MM/DD/YY or MM/DD/YYYY)
    if (col.toLowerCase().includes("date")) {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(val) || /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(val);
      if (!ok) issues.push({ col, reason: "Non-standard date format" });
    }
  }
  return issues;
}

// Apply AI-like fixes (deterministic for demo)
function applyFixes(rows) {
  const mapState = (v) => {
    const s = (v ?? "").toString().trim().toLowerCase();
    if (["cali", "calif", "cal", "california"].includes(s)) return "CA";
    if (s.length === 2) return s.toUpperCase();
    return v;
  };

  const normalizeDate = (v) => {
    const s = (v ?? "").toString().trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
      const [m, d, y] = s.split("/").map((x) => x.padStart(2, "0"));
      const yy = y.length === 2 ? `20${y}` : y;
      return `${yy}-${m}-${d}`;
    }
    return s;
  };

  return rows.map((row) => {
    const fixed = { ...row };
    for (const col of Object.keys(row)) {
      const lower = col.toLowerCase();
      const val = row[col];

      if (lower.includes("state")) fixed[col] = mapState(val);
      if (lower.includes("date")) fixed[col] = normalizeDate(val);
      if (lower.includes("email")) {
        const s = (val ?? "").toString().trim();
        if (s === "" || s === "null" || !s.includes("@")) fixed[col] = "user@example.com";
      }
    }
    fixed._issues = detectIssues(fixed);
    return fixed;
  });
}

// Overall score (quick composite from metrics)
function computeOverallScore(metrics) {
  const vals = Object.values(metrics);
  if (!vals.length) return 0;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg);
}

// Metrics per dimension
function computeMetrics(data) {
  if (!data.length) {
    return { Completeness: 0, Consistency: 0, Validity: 0, Uniqueness: 0 };
  }

  const cols = Object.keys(data[0]).filter((x) => x !== "_issues");
  const totalCells = data.length * cols.length;

  // Completeness: % non-empty
  let empty = 0;
  for (const row of data) {
    for (const col of cols) {
      const v = (row[col] ?? "").toString().trim();
      if (v === "" || v === "null" || v === "undefined") empty++;
    }
  }
  const completeness = Math.max(0, Math.min(100, Math.round(100 - (empty / totalCells) * 100)));

  // Validity: penalize rows with email/date/state issues (very light heuristic)
  let invalidHits = 0;
  for (const row of data) {
    const issues = row._issues || [];
    invalidHits += issues.filter((i) =>
      /email|date|state|format|mapping/i.test(i.reason)
    ).length;
  }
  // normalize by number of rows * 3 (email/date/state-ish)
  const denom = Math.max(1, data.length * 3);
  const validity = Math.max(0, Math.min(100, Math.round(100 - (invalidHits / denom) * 100)));

  // Consistency: favor datasets where repeated string patterns appear (toy heuristic)
  // We’ll approximate via how close validity is to completeness, nudging up a bit.
  const consistency = Math.max(0, Math.min(100, Math.round((completeness + validity) / 2 + 5)));

  // Uniqueness: use first non-empty column as an identifier proxy
  const idCol = cols.find((c) => data.some((r) => (r[c] ?? "").toString().trim() !== "")) || cols[0];
  const uniq = new Set(data.map((r) => (r[idCol] ?? "").toString().trim())).size;
  const uniqueness = Math.max(0, Math.min(100, Math.round((uniq / data.length) * 100)));

  return {
    Completeness: completeness,
    Consistency: consistency,
    Validity: validity,
    Uniqueness: uniqueness,
  };
}

function gradeFromScore(s) {
  return s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";
}

// --- Component -------------------------------------------------------------

export default function SeeInAction() {
  const fileRef = useRef(null);
  const [rawRows, setRawRows] = useState([]);
  const [fixedRows, setFixedRows] = useState([]);
  const [useFixed, setUseFixed] = useState(false);

  const [metrics, setMetrics] = useState({
    Completeness: 0,
    Consistency: 0,
    Validity: 0,
    Uniqueness: 0,
  });

  const score = useMemo(() => computeOverallScore(metrics), [metrics]);
  const grade = gradeFromScore(score);

  // Parse CSV and annotate issues
  function handleCSV(contents) {
    Papa.parse(contents, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = (res.data || []).map((r) => {
          const _issues = detectIssues(r);
          return { ...r, _issues };
        });
        setRawRows(rows);
        setFixedRows(applyFixes(rows));
        setUseFixed(false);

        // metrics from RAW initially
        setMetrics(computeMetrics(rows));
      },
    });
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleCSV(ev.target.result);
    reader.readAsText(f);
  }

  function handleApplyFixes() {
    // Show fixed and recompute metrics on fixed data
    const fixed = fixedRows.length ? fixedRows : applyFixes(rawRows);
    setFixedRows(fixed);
    setUseFixed(true);
    setMetrics(computeMetrics(fixed));
  }

  const preview = useMemo(() => {
    const rows = useFixed ? fixedRows : rawRows;
    return rows.slice(0, 200);
  }, [rawRows, fixedRows, useFixed]);

  const columns = useMemo(() => {
    const rows = preview;
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter((c) => c !== "_issues");
  }, [preview]);

  // UI helpers
  const hasRows = rawRows.length > 0;
  const showFixedToggle = hasRows;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07172B] to-[#0B2240] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-sm bg-black/10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <span className="text-lg font-semibold tracking-tight">Qoriq — See In Action</span>
          </div>

          <div className="flex items-center gap-3">
            {showFixedToggle && (
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-md ${!useFixed ? "bg-white/10" : "bg-transparent"} border border-white/10`}>
                  Before
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={useFixed}
                    onChange={(e) => setUseFixed(e.target.checked)}
                  />
                  <div className="h-6 w-11 rounded-full bg-white/20 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#38BDF8] peer-checked:after:translate-x-[20px]" />
                </label>
                <span className={`px-2 py-1 rounded-md ${useFixed ? "bg-white/10" : "bg-transparent"} border border-white/10`}>
                  After
                </span>
              </div>
            )}

            <button
              className="rounded-xl bg-white text-[#0B2240] px-4 py-2 text-sm font-semibold shadow hover:bg-[#E6F2FF]"
              onClick={() => fileRef.current?.click()}
            >
              Upload CSV
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onFile}
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {!hasRows ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/80 text-sm">
            <div className="text-base font-semibold text-white">Start with your sample data</div>
            <p className="mt-2">Upload a CSV (or use your CRM export). We’ll detect issues, show a preview with highlights, compute your AI Readiness Score, and let you preview auto-fixes before applying.</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Red dot: row has issues</li>
              <li>Yellow cell: needs attention</li>
              <li>Toggle “Before / After” to compare</li>
            </ul>
          </div>
        ) : (
          <>
            {/* Scorecard (uses current dataset: raw or fixed) */}
            <ScoreCard
              metrics={metrics}
              finalScore={score}
            />

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleApplyFixes}
                className="rounded-xl bg-[#38BDF8] text-[#07172B] px-4 py-2 text-sm font-semibold shadow hover:bg-[#67D2FF]"
              >
                Apply AI Fixes
              </button>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Simple CSV download of current view (raw or fixed)
                  const rows = useFixed ? fixedRows : rawRows;
                  if (!rows.length) return;
                  const cols = Object.keys(rows[0]).filter((c) => c !== "_issues");
                  const csv = Papa.unparse(rows.map(({ _issues, ...rest }) => rest), { columns: cols });
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = useFixed ? "qoriq_cleaned.csv" : "qoriq_original.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Download {useFixed ? "Cleaned CSV" : "Original CSV"}
              </a>
            </div>

            {/* Data Preview */}
            <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-white/5 px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-white/80">
                  Data Preview — showing up to 200 rows ({useFixed ? "After" : "Before"})
                </div>
                <div className="flex items-center gap-3 text-xs text-white/70">
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                    Row has issues
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-yellow-300/40 ring-1 ring-yellow-300/30" />
                    Needs attention
                  </div>
                </div>
              </div>

              <div className="overflow-auto max-h-[520px]">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-[#0B1F3A] text-white/80">
                    <tr>
                      <th className="px-3 py-2 text-left w-10"> </th>
                      {columns.map((c) => (
                        <th key={c} className="px-3 py-2 text-left font-semibold">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => {
                      const rowIssues = row._issues || [];
                      const hasIssue = rowIssues.length > 0;
                      const issueCols = new Set(rowIssues.map((i) => i.col));

                      return (
                        <tr key={idx} className="odd:bg-white/0 even:bg-white/[0.03]">
                          <td className="px-3 py-2 align-top">
                            {hasIssue && <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400 mt-1" />}
                          </td>
                          {columns.map((c) => {
                            const v = (row[c] ?? "").toString();
                            const isBad = issueCols.has(c);
                            return (
                              <td
                                key={c}
                                className={`px-3 py-2 whitespace-pre-wrap align-top ${
                                  isBad ? "bg-yellow-300/20 ring-1 ring-yellow-300/30" : ""
                                }`}
                                title={
                                  isBad
                                    ? (rowIssues.find((i) => i.col === c)?.reason || "Needs attention")
                                    : ""
                                }
                              >
                                {v}
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
          </>
        )}
      </main>
    </div>
  );
}
