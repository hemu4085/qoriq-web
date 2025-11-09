// src/pages/SeeInAction.jsx
import React, { useState } from "react";
import Papa from "papaparse";

export default function SeeInAction() {
  const [data, setData] = useState(null);
  const [fixedData, setFixedData] = useState(null);
  const [view, setView] = useState("before"); // before | after
  const [scores, setScores] = useState(null);
  const [scoresAfter, setScoresAfter] = useState(null);

  function computeScores(rows) {
    const total = rows.length;
    if (total === 0) return null;

    const keys = Object.keys(rows[0]);

    // Completeness
    const completeness = keys.reduce((acc, k) => {
      const filled = rows.filter((r) => r[k] && r[k].trim() !== "").length;
      return acc + filled / total;
    }, 0) / keys.length * 100;

    // Consistency (weak heuristic but visible change)
    const consistency = keys.reduce((acc, k) => {
      const vals = rows.map((r) => r[k]);
      const patternMatch = vals.filter((v) => (v && v.trim() !== "")).length;
      return acc + patternMatch / total;
    }, 0) / keys.length * 100;

    // Validity (numbers/dates/strings)
    const validity = keys.reduce((acc, k) => {
      const vals = rows.map((r) => r[k]);
      const validVals = vals.filter((v) => {
        if (!v) return false;
        if (!isNaN(Date.parse(v))) return true;
        if (!isNaN(v)) return true;
        return true;
      }).length;
      return acc + validVals / total;
    }, 0) / keys.length * 100;

    // Uniqueness (lead_id key)
    const unique = new Set(rows.map((r) => r.lead_id)).size;
    const uniqueness = (unique / total) * 100;

    const final = (completeness + consistency + validity + uniqueness) / 4;

    function grade(s) {
      if (s >= 97) return "A+";
      if (s >= 93) return "A";
      if (s >= 90) return "A-";
      if (s >= 87) return "B+";
      if (s >= 83) return "B";
      if (s >= 80) return "B-";
      if (s >= 70) return "C";
      return "D";
    }

    return { completeness, consistency, validity, uniqueness, final, grade: grade(final) };
  }

  function applyFixes() {
    if (!data) return;

    let rows = JSON.parse(JSON.stringify(data));

    rows = rows.map((r) => {
      const cleaned = {};
      for (const k in r) {
        let v = r[k] || "";
        v = typeof v === "string" ? v.trim() : v;
        if (v === "") v = "Unknown";
        cleaned[k] = v;
      }
      return cleaned;
    });

    // Remove duplicate lead_id
    const seen = new Set();
    rows = rows.filter((r) => {
      if (seen.has(r.lead_id)) return false;
      seen.add(r.lead_id);
      return true;
    });

    setFixedData(rows);
    setView("after");
    setScoresAfter(computeScores(rows));
  }

  function handleUpload(evt) {
    const file = evt.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data.slice(0, 200);
        setData(rows);
        setScores(computeScores(rows));
      }
    });
  }

  const displayData = view === "after" && fixedData ? fixedData : data;
  const displayScores = view === "after" && scoresAfter ? scoresAfter : scores;

  return (
    <div className="min-h-screen bg-[#07172B] text-white px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">See Your Data in Action</h1>

      <input type="file" accept=".csv" onChange={handleUpload} className="mb-6" />

      {displayScores && (
        <div className="bg-white/5 border border-white/10 p-5 rounded-xl mb-8">
          <div className="flex justify-between text-sm text-white/70 mb-4">
            <span>AI Readiness Score</span>
            <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-emerald-300 text-sm">
              {displayScores.grade}
            </span>
          </div>

          {[
            ["Completeness", displayScores.completeness],
            ["Consistency", displayScores.consistency],
            ["Validity", displayScores.validity],
            ["Uniqueness", displayScores.uniqueness],
          ].map(([label, val]) => (
            <div key={label} className="mb-3">
              <div className="flex justify-between text-xs text-white/60">
                <span>{label}</span><span>{val.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded">
                <div className="h-2 bg-[#38BDF8] rounded" style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {data && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView("before")}
            className={`px-4 py-2 rounded-lg text-sm ${view === "before" ? "bg-white text-[#07172B]" : "bg-white/10"}`}
          >
            Before Fixes
          </button>
          <button
            onClick={() => setView("after")}
            disabled={!fixedData}
            className={`px-4 py-2 rounded-lg text-sm ${view === "after" ? "bg-white text-[#07172B]" : "bg-white/10"} disabled:opacity-40`}
          >
            After Fixes
          </button>
          <button
            onClick={applyFixes}
            className="ml-auto px-4 py-2 rounded-lg bg-[#38BDF8] text-[#07172B] text-sm font-semibold shadow hover:bg-[#67D2FF]"
          >
            Apply AI Fixes
          </button>
        </div>
      )}

      {displayData && (
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl overflow-auto max-h-[420px]">
          <table className="text-sm min-w-full">
            <thead>
              <tr>
                {Object.keys(displayData[0]).map((k) => (
                  <th key={k} className="text-left p-2 text-white/60">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, i) => (
                <tr key={i} className="border-b border-white/10">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="p-2 text-white/90">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
