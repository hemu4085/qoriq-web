// src/pages/ask-your-data.jsx  <<< ensure all-lowercase filename

import React, { useEffect, useState } from "react";
import { createLocalIndex, askQuestion } from "../lib/localAsk";

export default function AskYourData() {
  const [index, setIndex] = useState(null);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);

  // ✅ Load cleaned data from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("qoriq_cleaned_data"));
    if (stored && Array.isArray(stored) && stored.length > 0) {
      const idx = createLocalIndex(stored);
      setIndex(idx);
      console.log("✅ Loaded cleaned data → indexed rows:", idx.length);
    } else {
      console.log("⚠️ No stored cleaned data found.");
    }
  }, []);

  const handleAsk = () => {
    if (!index || index.length === 0) {
      setAnswers([
        { type: "error", text: "⚠️ No cleaned data found. Apply Fixes first in See In Action." }
      ]);
      return;
    }
    const result = askQuestion(question, index);
    setAnswers(result);
  };

  return (
    <div className="min-h-screen bg-[#07172B] text-white py-12 px-6 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-2">Ask Your Data</h1>
      <p className="text-white/60 mb-6">
        Ask natural language questions about your cleaned CRM dataset.
      </p>

      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
        className="w-full rounded-lg px-4 py-2 text-black text-sm mb-4"
      />

      <button
        onClick={handleAsk}
        className="bg-[#38BDF8] text-[#07172B] px-5 py-2 rounded-xl font-semibold hover:bg-[#67D2FF]"
      >
        Ask
      </button>

      <div className="mt-8 space-y-6">
        {answers.map((a, i) => {

          if (a.type === "error") return (
            <div key={i} className="text-red-400 text-sm">{a.text}</div>
          );

          if (a.type === "prompt_help") return (
            <div key={i} className="text-white/70 text-sm">
              Try asking:
              <ul className="mt-2 list-disc list-inside">
                {a.examples.map((ex, idx) => <li key={idx}>{ex}</li>)}
              </ul>
            </div>
          );

          if (a.type === "insight") return (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-3">
              <div className="text-lg font-semibold text-white">{a.headline}</div>
              <p className="text-white/70">{a.narrative}</p>

              {a.bullets && (
                <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                  {a.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                </ul>
              )}

              {a.table && (
                <table className="w-full text-sm text-white/80 border-t border-white/10 pt-3">
                  <thead>
                    <tr className="text-left text-white/60">
                      {Object.keys(a.table[0]).map((h) => (
                        <th key={h} className="py-1">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {a.table.map((row, rIdx) => (
                      <tr key={rIdx} className="border-t border-white/5">
                        {Object.values(row).map((v, cIdx) => (
                          <td key={cIdx} className="py-1">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {a.recommendation && (
                <div className="text-white font-medium text-sm border-t border-white/10 pt-3">
                  Recommendation: {a.recommendation}
                </div>
              )}
            </div>
          );

          return null;
        })}
      </div>
    </div>
  );
}
