// src/pages/SeeInAction.jsx
import React, { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import ScoreGrid from "../components/ScoreGrid.jsx";
import InsightsPanel from "../components/InsightsPanel.jsx";
import ImprovementsBanner from "../components/ImprovementsBanner.jsx";
import applyFixes, { detectIssues } from "../lib/applyFixes.js";
import { createLocalIndex, askQuestion } from "../lib/localAsk.js";
// --- Metrics (percent) for AI Readiness ---
const isEmpty = (v) => v == null || String(v).trim() === "";
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());

// Alias sets (lowercase) for robust header matching
const EMAIL_SET   = new Set(["email","email_address","contact_email"]);
const PHONE_SET   = new Set(["phone","mobile","contact_phone"]);
const DATE_SET    = new Set(["date","created_at","createdat","created date","created_date"]);
const STATE_SET   = new Set(["state","st","st_code","region","stade_cd"]);
const COMPANY_SET = new Set(["company","company_name","account","account_name"]);

// Case-insensitive real-key resolver for a row
function getRealKey(row, setLower) {
  const lcMap = useMemoizedLcMap(row);
  for (const k of Object.keys(row)) {
    if (setLower.has(k.toLowerCase())) return k;
  }
  // fallback via lc map if needed
  for (const want of setLower) {
    if (lcMap[want]) return lcMap[want];
  }
  return null;
}

// lightweight per-call cache of lowercase -> real key
function useMemoizedLcMap(row) {
  const lc = {};
  Object.keys(row).forEach((k) => (lc[k.toLowerCase()] = k));
  return lc;
}

function resolveKeyFromRows(rows, setLower, fallback) {
  if (!rows.length) return fallback;
  const first = rows[0];
  const found = getRealKey(first, setLower);
  return found ?? fallback;
}

function computeMetrics(rows) {
  if (!rows.length) return { Completeness: 0, Consistency: 0, Validity: 0, Uniqueness: 0 };

  const emailKey   = resolveKeyFromRows(rows, EMAIL_SET, "email");
  const stateKey   = resolveKeyFromRows(rows, STATE_SET, "state");
  const dateKey    = resolveKeyFromRows(rows, DATE_SET, "date");
  const companyKey = resolveKeyFromRows(rows, COMPANY_SET, "company");

  let filled = 0, total = 0;
  rows.forEach((r) => [emailKey, stateKey, dateKey, companyKey].forEach(k => { total++; if (!isEmpty(r[k])) filled++; }));
  const completeness = (filled / total) * 100;

  const consistency = rows.filter(r =>
    /^[A-Z]{2}$/.test(String(r[stateKey] ?? "")) &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(r[dateKey] ?? ""))
  ).length / rows.length * 100;

  const validity = rows.filter(r => isValidEmail(r[emailKey])).length / rows.length * 100;

  const seen = new Set();
  const uniqueCount = rows.filter(r => {
    const key = `${(r[emailKey] ?? "").toLowerCase()}||${(r[companyKey] ?? "").toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).length;
  const uniqueness = (uniqueCount / rows.length) * 100;

  return {
    Completeness: Math.round(completeness),
    Consistency:  Math.round(consistency),
    Validity:     Math.round(validity),
    Uniqueness:   Math.round(uniqueness),
  };
}

// --- Fix Impact aggregation ---
function computeFixImpact(fixedRows, dedupRemoved) {
  let impact = {
    emailRepaired: 0,
    stateStandardized: 0,
    dateStandardized: 0,
    phoneStandardized: 0,
    companyStandardized: 0,
    nameParsed: 0,
    textNormalizedCells: 0,
    dedupRemoved
  };

  for (const r of fixedRows) {
    const fx = r.__fixes || {};
    if (fx.email)   impact.emailRepaired++;
    if (fx.state)   impact.stateStandardized++;
    if (fx.date)    impact.dateStandardized++;
    if (fx.phone)   impact.phoneStandardized++;
    if (fx.company) impact.companyStandardized++;
    if (fx.name)    impact.nameParsed++;

    for (const k of Object.keys(fx)) {
      if (fx[k] === "whitespace_normalized") impact.textNormalizedCells++;
    }
  }
  return impact;
}

// Column classifier (uses exact alias sets; case-insensitive)
function classifyField(header) {
  const key = String(header).trim().toLowerCase();
  if (EMAIL_SET.has(key))   return { type: "email" };
  if (PHONE_SET.has(key))   return { type: "phone" };
  if (DATE_SET.has(key))    return { type: "date" };
  if (STATE_SET.has(key))   return { type: "state" };
  if (COMPANY_SET.has(key)) return { type: "company" };
  return { type: "other" };
}

// Build BEFORE issues map to cover all 4 dimensions, alias-aware
function buildIssuesMap(rows) {
  const m = new Map();
  if (!rows.length) return m;

  const emailKey   = resolveKeyFromRows(rows, EMAIL_SET, "email");
  const stateKey   = resolveKeyFromRows(rows, STATE_SET, "state");
  const dateKey    = resolveKeyFromRows(rows, DATE_SET, "date");
  const companyKey = resolveKeyFromRows(rows, COMPANY_SET, "company");

  // Uniqueness: find duplicates by email+company
  const keyToIndices = new Map();
  rows.forEach((r, idx) => {
    const k = `${(r[emailKey] ?? "").toLowerCase()}||${(r[companyKey] ?? "").toLowerCase()}`;
    if (!keyToIndices.has(k)) keyToIndices.set(k, []);
    keyToIndices.get(k).push(idx);
  });
  const duplicateIndexSet = new Set();
  for (const arr of keyToIndices.values()) {
    if (arr.length > 1) arr.forEach((i) => duplicateIndexSet.add(i));
  }

  rows.forEach((row, idx) => {
    // Start with detectIssues (validity/consistency/phone)
    const base = detectIssues(row) || {};

    // Completeness empties
    const issues = {
      ...base,
      missing_email:   isEmpty(row[emailKey]),
      missing_state:   isEmpty(row[stateKey]),
      missing_date:    isEmpty(row[dateKey]),
      missing_company: isEmpty(row[companyKey]),
      duplicate:       duplicateIndexSet.has(idx),
    };

    // Consistency rule for state BEFORE: flag if not 2-letter USPS
    const stVal = row[stateKey];
    const alreadyUSPS = /^[A-Za-z]{2}$/.test(String(stVal || "")) && String(stVal).toUpperCase() === String(stVal).toUpperCase();
    if (!alreadyUSPS) issues.state = true; // (keeps true if detectIssues already set it)

    m.set(idx, issues);
  });
  return m;
}

export default function SeeInAction() {
  const [rawRows, setRawRows] = useState([]);
  const [fixedRows, setFixedRows] = useState([]);
  const [dedupRemoved, setDedupRemoved] = useState(0);
  const [showFixed, setShowFixed] = useState(false);
  const fileRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [localIndex, setLocalIndex] = useState(null);

  const issuesMap = useMemo(() => buildIssuesMap(rawRows), [rawRows]);

  const before = useMemo(() => computeMetrics(rawRows), [rawRows]);
  const after  = useMemo(() => computeMetrics(fixedRows), [fixedRows]);
  const fixImpact = useMemo(() => computeFixImpact(fixedRows, dedupRemoved), [fixedRows, dedupRemoved]);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const rows = res.data.map((r) =>
          Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim(), typeof v === "string" ? v.trim() : v]))
        );
        setRawRows(rows.slice(0, 200));
        setFixedRows([]);
        setDedupRemoved(0);
        setShowFixed(false);
      },
    });
  }

  function doFixes() {
    const cleaned = rawRows.map(applyFixes);

    // De-dup by email+company AFTER cleanup; annotate surviving row
    const seen = new Map(); // key -> index of canonical kept row
    let removed = 0;

    const deduped = [];
    cleaned.forEach((r) => {
      const emailKey = getRealKey(r, EMAIL_SET) || "email";
      const companyKey = getRealKey(r, COMPANY_SET) || "company";
      const key = `${(r[emailKey] ?? "").toLowerCase()}||${(r[companyKey] ?? "").toLowerCase()}`;

      if (!seen.has(key)) {
        seen.set(key, deduped.length);
        deduped.push({ ...r });
      } else {
        removed += 1;
        const canonicalIdx = seen.get(key);
        const canonical = deduped[canonicalIdx];
        canonical.__fixes = { ...(canonical.__fixes || {}), duplicate_merged: (canonical.__fixes?.duplicate_merged || 0) + 1 };
      }
    });

    setFixedRows(deduped);
    setLocalIndex(createLocalIndex(deduped));
    setDedupRemoved(removed);
    setShowFixed(true);
  }

  const previewRows = showFixed ? fixedRows : rawRows;
  const headers = useMemo(() => [...new Set(previewRows.flatMap(Object.keys))], [previewRows]);

  return (
    <div className="min-h-screen bg-[#07172B] text-white">
      <main className="mx-auto max-w-7xl px-4 py-10 space-y-10">

        {/* Controls */}
        <div className="flex gap-3">
          <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-white/20 px-3 py-2">Upload CSV</button>
          <input type="file" className="hidden" ref={fileRef} onChange={handleFile} accept=".csv" />
          <button disabled={!rawRows.length} onClick={doFixes} className="rounded-xl bg-white text-[#07172B] px-4 py-2 font-semibold disabled:opacity-50">Apply Fixes</button>
          {fixedRows.length > 0 && <button onClick={() => setShowFixed(s => !s)} className="rounded-xl border border-white/20 px-4 py-2">{showFixed ? "Show Before" : "Show After"}</button>}
        </div>

        {/* Scores */}
        {rawRows.length > 0 && (
          <>
            <div>
              <div className="text-sm text-white/70 mb-1">AI Readiness Score Before Fixes</div>
              <ScoreGrid metrics={before} />
            </div>
            {showFixed && (
              <>
                <div>
                  <div className="text-sm text-white/70 mb-1">AI Readiness Score After Fixes</div>
                  <ScoreGrid metrics={after} prevMetrics={before} />
                </div>
                <ImprovementsBanner scoresBefore={before} scoresAfter={after} />

                <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
                  <div className="font-semibold text-white mb-2">Fix Impact (Summary)</div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div>• Email repaired: {fixImpact.emailRepaired}</div>
                    <div>• State standardized: {fixImpact.stateStandardized}</div>
                    <div>• Date standardized: {fixImpact.dateStandardized}</div>
                    <div>• Phone normalized: {fixImpact.phoneStandardized}</div>
                    <div>• Company normalized: {fixImpact.companyStandardized}</div>
                    <div>• Name parsed: {fixImpact.nameParsed}</div>
                    <div>• Duplicates removed: {fixImpact.dedupRemoved}</div>
                    <div>• Text cleaned (cells): {fixImpact.textNormalizedCells}</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Table & Insights */}
        {previewRows.length > 0 && (
          <>
            <div className="rounded-xl border border-white/10 overflow-auto max-h-[450px] text-sm">
              <table className="min-w-full">
                <thead className="bg-[#0B2240] text-white/80 sticky top-0">
                  <tr>
                    <th className="w-6"></th>
                    {headers.map(h => <th key={h} className="px-3 py-2 text-left border-b border-white/10">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 200).map((row, i) => {
                    const issues = showFixed ? {} : (issuesMap.get(i) ?? {});
                    const isFixedRow = showFixed && row.__fixes && Object.keys(row.__fixes).length > 0;
                    const hasIssues = !showFixed && Object.keys(issues).length > 0;

                    return (
                      <tr key={i} className="odd:bg-white/5">
                        <td className="px-3">
                          {hasIssues && <span className="h-2 w-2 bg-rose-400 rounded-full inline-block" />}
                          {isFixedRow && <span className="h-2 w-2 bg-emerald-400 rounded-full inline-block" />}
                        </td>
                        {headers.map((h) => {
                          const { type } = classifyField(h);

                          // BEFORE: highlight any field that contributes an issue
                          const beforeNeedsFix =
                            !showFixed && (
                              (type === "email"   && (issues.email || issues.missing_email || issues.duplicate)) ||
                              (type === "state"   && (issues.state || issues.missing_state)) ||
                              (type === "date"    && (issues.date  || issues.missing_date)) ||
                              (type === "phone"   && (issues.phone)) ||
                              (type === "company" && (issues.missing_company || issues.duplicate))
                            );

                          // AFTER: highlight only if this exact field was fixed
                          const afterWasFixed =
                            showFixed && row.__fixes && (
                              (type === "email"   && row.__fixes.email) ||
                              (type === "state"   && row.__fixes.state) ||
                              (type === "date"    && row.__fixes.date)  ||
                              (type === "phone"   && row.__fixes.phone) ||
                              (type === "company" && (row.__fixes.company || row.__fixes.duplicate_merged))
                            );

                          return (
                            <td
                              key={h}
                              className={`px-3 py-2 border-b border-white/10 align-top
                                ${beforeNeedsFix ? "bg-orange-300/20" : ""}
                                ${afterWasFixed ? "bg-emerald-300/20" : ""}
                              `}
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

            {showFixed && <InsightsPanel scoresBefore={before} scoresAfter={after} fixImpact={fixImpact} />}
          </>
        )}

      </main>
    </div>
  );
}
