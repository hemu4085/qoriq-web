// src/components/InsightsPanel.jsx
import React from "react";

export default function InsightsPanel({ scoresBefore, scoresAfter, fixImpact }) {

  const changes = [
    {
      label: "Completeness",
      before: scoresBefore.Completeness,
      after: scoresAfter.Completeness,
      keyPoints: [
        fixImpact.emailRepaired > 0 && `${fixImpact.emailRepaired} leads were missing usable email addresses and are now contactable`,
        fixImpact.stateStandardized > 0 && `${fixImpact.stateStandardized} records now have standardized regions so reps know where leads actually belong`,
        fixImpact.companyStandardized > 0 && `${fixImpact.companyStandardized} company names cleaned for clearer account identification`,
      ].filter(Boolean),
      businessValue: "→ Reps get **more complete lead profiles**, reducing time spent hunting missing info."
    },
    {
      label: "Consistency",
      before: scoresBefore.Consistency,
      after: scoresAfter.Consistency,
      keyPoints: [
        fixImpact.stateStandardized > 0 && `${fixImpact.stateStandardized} regions converted to standard USPS format (CA, NY, etc.)`,
        fixImpact.dateStandardized > 0 && `${fixImpact.dateStandardized} dates converted to YYYY-MM-DD so lead timelines sort reliably`,
        fixImpact.phoneStandardized > 0 && `${fixImpact.phoneStandardized} phone numbers formatted for auto-dialer readiness`,
      ].filter(Boolean),
      businessValue: "→ Enables **accurate lead routing, territory alignment, and automated sequencing.**"
    },
    {
      label: "Validity",
      before: scoresBefore.Validity,
      after: scoresAfter.Validity,
      keyPoints: [
        fixImpact.emailRepaired > 0 && `Invalid email formats corrected where possible`,
      ].filter(Boolean),
      businessValue: "→ Improves **email deliverability + sequence engagement**, especially for SDR outreach."
    },
    {
      label: "Uniqueness",
      before: scoresBefore.Uniqueness,
      after: scoresAfter.Uniqueness,
      keyPoints: [
        fixImpact.dedupRemoved > 0 && `${fixImpact.dedupRemoved} duplicate records merged into single clean lead profiles`,
      ].filter(Boolean),
      businessValue: "→ Prevents **multiple reps contacting the same lead** and ensures pipeline hygiene."
    }
  ];

  return (
    <div className="rounded-xl bg-[#0A1A33] border border-white/10 p-6 mt-10 text-white">
      <h3 className="text-lg font-semibold mb-2">Why Your Score Changed</h3>

      <p className="text-white/70 text-sm mb-6">
        Qoriq automatically improved your CRM data quality to make it more actionable for Sales.
        Here’s what changed — and how it supports better outreach, routing, and revenue execution.
      </p>

      <div className="space-y-6">
        {changes.map((c) => (
          <div key={c.label} className="border-b border-white/10 pb-4">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>{c.label}</span>
              <span>
                {c.before}% → {c.after}%
                {c.after > c.before && (
                  <span className="text-emerald-400 ml-2">↑ Improved</span>
                )}
                {c.after === c.before && (
                  <span className="text-white/40 ml-2">↔ No change</span>
                )}
              </span>
            </div>

            {c.keyPoints.length > 0 && (
              <ul className="ml-4 text-sm text-white/85 list-disc space-y-1">
                {c.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
              </ul>
            )}

            {/* 🚀 GTM VALUE STATEMENT */}
            <p className="mt-2 text-xs text-emerald-300 font-medium">
              {c.businessValue}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
