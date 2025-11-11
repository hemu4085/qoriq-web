// src/components/ScoreGrid.jsx
import React from "react";

/**
 * scores = {
 *   Completeness: "B",
 *   Consistency: "C",
 *   Validity: "A",
 *   Uniqueness: "D"
 * }
 */
export default function ScoreGrid({ scores }) {
  if (!scores) return null;

  const entries = Object.entries(scores); // turn object into rows

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {entries.map(([label, grade]) => (
        <div
          key={label}
          className="rounded-xl bg-white/10 border border-white/20 p-4 text-center"
        >
          <div className="text-xs text-white/60 uppercase tracking-wide">
            {label}
          </div>
          <div className="text-2xl font-semibold text-white leading-tight">
            {grade}
          </div>
        </div>
      ))}
    </div>
  );
}
