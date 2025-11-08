import React, { useState } from "react";
import StepNav from "../components/StepNav.jsx";
import Scorecard from "../components/Scorecard.jsx";
import { computeReadinessScores } from "../utils/scoring.js";
import sampleData from "../utils/sampleData.js";
import { applyFixes } from "../utils/fixes.js";

export default function SeeInAction() {
  const [data, setData] = useState(sampleData);
  const [step, setStep] = useState(0);

  const before = computeReadinessScores(data);
  const [after, setAfter] = useState(before);

  return (
    <div className="min-h-screen bg-[#0B1A33] text-white px-8 py-12">
      
      {/* Step Navigation */}
      <StepNav current={step} />

      {/* Step 1: Upload */}
      {step === 0 && (
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Upload Your Data</h1>
          <p className="text-white/70 mb-8">
            Use your CRM export or try the Qoriq sample dataset.
          </p>
          <button
            className="px-6 py-3 bg-cyan-400 text-[#0B1A33] font-semibold rounded-lg"
            onClick={() => setStep(1)}
          >
            Use Sample Data
          </button>
        </div>
      )}

      {/* Step 2: Normalize */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl mb-6">Data Preview</h2>
          <div className="overflow-auto max-h-80 border border-white/10 rounded-lg p-4">
            <pre>{JSON.stringify(data.slice(0, 10), null, 2)}</pre>
          </div>

          <div className="text-right mt-6">
            <button
              className="px-6 py-3 bg-cyan-400 text-[#0B1A33] rounded-lg"
              onClick={() => setStep(2)}
            >
              Next → Score
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Score (Before Fixes) */}
      {step === 2 && (
        <div>
          <Scorecard score={before.score} before={before} />

          <div className="text-right mt-6">
            <button
              className="px-6 py-3 bg-cyan-400 text-[#0B1A33] rounded-lg"
              onClick={() => setStep(3)}
            >
              Next → Fix
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Fix */}
      {step === 3 && (
        <div className="text-center">
          <h2 className="text-2xl mb-4">Apply AI Fix Recommendations</h2>
          <p className="text-white/70 mb-6">Standardizing industries, regions, and stale dates.</p>

          <button
            className="px-8 py-3 bg-cyan-400 text-[#0B1A33] font-semibold rounded-lg"
            onClick={() => {
              const cleaned = applyFixes(data);
              setData(cleaned);
              setAfter(computeReadinessScores(cleaned));
              setStep(4);
            }}
          >
            Apply All Fixes
          </button>
        </div>
      )}

      {/* Step 5: Score (After Fixes) + Ask */}
      {step === 4 && (
        <div>
          <Scorecard score={after.score} before={after} />

          <div className="mt-6">
            <h2 className="text-xl mb-3">Ask Your Data (Sales IQ)</h2>
            <div className="p-4 bg-white/10 rounded-lg">
              <p className="text-white/70">Which deals are blocked and why?</p>
              <p className="mt-3 text-cyan-300">
                Deal L143 (BlueWave, $480K) is likely to stall — No contact in 42 days. 
                Pricing hesitation noted in notes. Recommend re-engaging CFO persona with ROI proof case.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
