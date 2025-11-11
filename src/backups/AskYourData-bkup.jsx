// src/pages/AskYourData.jsx
import React, { useState, useMemo } from "react";
import { createLocalIndex, askQuestion } from "../lib/localAsk.js";

export default function AskYourData({ rows }) {
  const [localIndex, setLocalIndex] = useState(() => rows?.length ? createLocalIndex(rows) : null);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);

  const hasData = rows && rows.length > 0;

  function handleAsk() {
    if (!localIndex) {
      setAnswers([{ type: "error", text: "⚠️ No cleaned data. Please apply fixes first on See In Action page." }]);
      return;
    }
    const result = askQuestion(question, localIndex);
    setAnswers(result);
  }

  return (
    <div className="min-h-screen bg-[#07172B] text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Ask Your Data</h1>

      {!hasData && (
        <p className="text-white/60">
          ⚠️ No cleaned dataset loaded. Go to <b>See In Action</b> and apply fixes first.
        </p>
      )}

      {hasData && (
        <>
          <p className="text-white/70 text-sm mb-4">
            Ask natural-language questions directly over your cleaned dataset.
          </p>

          <input
            type="text"
            placeholder="e.g., Why is my score low?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full text-black rounded-lg px-3 py-2 text-sm mb-3"
          />

          <button
            onClick={handleAsk}
            className="bg-[#38BDF8] text-[#07172B] px-4 py-2 rounded-xl font-semibold hover:bg-[#67D2FF]"
          >
            Ask
          </button>

          <div className="mt-8 space-y-6">
            {answers.map((a, i) => (
              <div key={i}>

                {a.type === "error" && (
                  <div className="text-red-300 text-sm">{a.text}</div>
                )}

                {a.type === "prompt_help" && (
                  <div className="text-white/70 text-sm">
                    Try asking:
                    <ul className="list-disc list-inside mt-2">
                      {a.examples.map((ex, j) => <li key={j}>{ex}</li>)}
                    </ul>
                  </div>
                )}

                {a.type === "insight" && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
                    <div className="text-lg font-semibold text-white">{a.headline}</div>
                    <p className="text-white/70 text-sm">{a.narrative}</p>

                    {a.bullets && (
                      <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                        {a.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                      </ul>
                    )}

                    {a.recommendation && (
                      <div className="text-white font-medium text-sm border-t border-white/10 pt-3">
                        Recommendation: {a.recommendation}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
