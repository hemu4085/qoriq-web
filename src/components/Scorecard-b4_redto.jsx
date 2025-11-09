import React from "react";
import { letterGrade } from "../utils/scoring";

export default function Scorecard({ s }) {
  const avg = Math.round(
    (s.completeness.after +
     s.consistency.after +
     s.uniqueness.after +
     s.validity.after +
     s.timeliness.after +
     s.integrity.after) / 6
  );

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">AI Readiness Scorecard</h2>
        <div className="px-4 py-1 bg-[#0D3A2F] text-[#4DFFB4] rounded-full text-sm font-bold">
          {letterGrade(avg)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {Object.entries(s).map(([key, v]) => (
          <div key={key} className="bg-white/5 p-5 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold capitalize">
                {key}
              </span>
              <span className="font-semibold">{v.after}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full mb-2">
              <div style={{ width: `${v.after}%` }} className="h-full bg-[#4DC9FF] rounded-full"></div>
            </div>
            <p className="text-sm text-white/60">
              Before: {v.before}% → After: {v.after}%
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <h3 className="font-semibold mb-2">Top Issues</h3>
          <ul className="text-white/70 text-sm list-disc ml-5 space-y-1">
            <li>State codes mis-matched (CA/Cal/Calif)</li>
            <li>Missing contact emails</li>
            <li>Date format inconsistencies</li>
          </ul>
        </div>
        <div className="bg-white/5 p-5 rounded-xl border border-white/10">
          <h3 className="font-semibold mb-2">AI Fix Suggestions</h3>
          <ul className="text-white/70 text-sm list-disc ml-5 space-y-1">
            <li>Normalize state codes via USPS mapping</li>
            <li>Deduplicate by email + company</li>
            <li>Standardize dates to ISO 8601</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
