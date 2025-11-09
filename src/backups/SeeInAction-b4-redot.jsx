import React, { useState } from "react";
import Papa from "papaparse";

export default function SeeInAction() {
  const [rows, setRows] = useState([]);
  const [fixedRows, setFixedRows] = useState([]);
  const [viewMode, setViewMode] = useState("before");
  const [score, setScore] = useState("B");
  const [scoreImproved, setScoreImproved] = useState(false);

  // Simple score calculation
  function computeScore(data) {
    const total = data.length;
    const invalid = data.filter((r) => !r.email || r.email.includes(" ")).length;
    const pct = ((total - invalid) / total) * 100;

    if (pct > 92) return "A";
    if (pct > 85) return "A-";
    if (pct > 78) return "B+";
    return "B";
  }

  // Detect issues
  function markIssues(data) {
    return data.map((row) => {
      return {
        ...row,
        _issues: {
          email: !row.email || row.email.includes(" "),
          state: row.state?.length !== 2,
        },
      };
    });
  }

  // Fix Issues
  function applyFixes() {
    const newData = rows.map((row) => ({
      ...row,
      email: row.email?.replace(/\s+/g, "").toLowerCase(),
      state: row.state?.slice(0, 2).toUpperCase(),
    }));

    const improvedScore = computeScore(newData);
    setScoreImproved(true);
    setScore(improvedScore);
    setFixedRows(markIssues(newData));
    setViewMode("after");

    setTimeout(() => setScoreImproved(false), 700);
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (res) => {
        const data = res.data.slice(0, 200);
        setRows(markIssues(data));
        setFixedRows([]);
        setViewMode("before");
        setScore(computeScore(data));
      },
    });
  }

  const display = viewMode === "before" ? rows : fixedRows.length ? fixedRows : rows;

  return (
    <div className="min-h-screen bg-[#07172B] text-white px-6 py-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <h1 className="text-3xl font-bold">See Your Data in Action</h1>
      <p className="text-white/60 mt-1">Transform raw CRM data into AI-ready intelligence.</p>

      {/* Upload */}
      <div className="mt-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="block w-full text-sm text-white border border-white/30 rounded p-2 bg-white/5 cursor-pointer"
        />
      </div>

      {/* Score Display */}
      <div className="mt-6 flex items-center gap-3">
        <span className="text-lg text-white/80">AI Readiness Score:</span>
        <span
          className={`text-3xl font-bold ${
            scoreImproved ? "score-pop" : ""
          }`}
        >
          {score}
        </span>
      </div>

      {/* Buttons */}
      {rows.length > 0 && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setViewMode("before")}
            className={`px-4 py-2 rounded ${viewMode === "before" ? "bg-white/20" : "bg-white/5"}`}
          >
            Before
          </button>

          <button
            onClick={() => setViewMode("after")}
            className={`px-4 py-2 rounded ${viewMode === "after" ? "bg-white/20" : "bg-white/5"}`}
          >
            After
          </button>

          <button
            onClick={applyFixes}
            className="px-5 py-2 rounded bg-[#38BDF8] text-[#07172B] font-semibold hover:bg-[#67D2FF]"
          >
            Apply AI Fixes
          </button>
        </div>
      )}

      {/* Data Preview Table */}
      {rows.length > 0 && (
        <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  {Object.keys(display[0]).filter(k => k !== "_issues").map((key) => (
                    <th key={key} className="p-2 text-left font-semibold">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {display.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Object.entries(row).map(([k, v], j) => 
                      k !== "_issues" && (
                        <td
                          key={j}
                          className={`p-2 ${
                            viewMode === "before" && row._issues?.[k]
                              ? "bg-yellow-400/30 text-yellow-200 font-semibold"
                              : viewMode === "after" && row._issues?.[k]
                              ? "highlight-fade"
                              : ""
                          }`}
                        >
                          {String(v)}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
