// src/components/Scorecard.jsx
import React, { useEffect, useState } from "react";

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function letterFromScore(avg) {
  const n = avg;
  if (n >= 97) return "A+";
  if (n >= 93) return "A";
  if (n >= 90) return "A-";
  if (n >= 87) return "B+";
  if (n >= 83) return "B";
  if (n >= 80) return "B-";
  if (n >= 77) return "C+";
  if (n >= 73) return "C";
  if (n >= 70) return "C-";
  if (n >= 67) return "D+";
  if (n >= 63) return "D";
  if (n >= 60) return "D-";
  return "F";
}

export default function Scorecard({
  before = { completeness: 0, consistency: 0, validity: 0, uniqueness: 0 },
  after  = { completeness: 0, consistency: 0, validity: 0, uniqueness: 0 },
  animate = true,
}) {
  // Smoothly animate "after" values so investors see movement
  const [anim, setAnim] = useState({ ...after });

  useEffect(() => {
    if (!animate) {
      setAnim(after);
      return;
    }
    const start = performance.now();
    const dur = 750;
    const init = { ...anim };

    const tick = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const mix = (a, b) => a + (b - a) * k;
      setAnim({
        completeness: mix(init.completeness ?? 0, after.completeness ?? 0),
        consistency:  mix(init.consistency ?? 0,  after.consistency ?? 0),
        validity:     mix(init.validity ?? 0,     after.validity ?? 0),
        uniqueness:   mix(init.uniqueness ?? 0,   after.uniqueness ?? 0),
      });
      if (k < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [after.completeness, after.consistency, after.validity, after.uniqueness]);

  const a = {
    completeness: clamp(anim.completeness),
    consistency:  clamp(anim.consistency),
    validity:     clamp(anim.validity),
    uniqueness:   clamp(anim.uniqueness),
  };

  const b = {
    completeness: clamp(before.completeness),
    consistency:  clamp(before.consistency),
    validity:     clamp(before.validity),
    uniqueness:   clamp(before.uniqueness),
  };

  const avgAfter  = clamp((a.completeness + a.consistency + a.validity + a.uniqueness) / 4);
  const grade     = letterFromScore(avgAfter);

  const metrics = [
    { key: "Completeness", k: "completeness" },
    { key: "Consistency",  k: "consistency"  },
    { key: "Validity",     k: "validity"     },
    { key: "Uniqueness",   k: "uniqueness"   },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl ring-1 ring-white/10">
      <div className="rounded-xl bg-[#07172B] p-4">
        <div className="mb-4 flex items-center justify-between text-xs text-white/60">
          <span>AI Readiness Scorecard</span>
          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-300/20">
            {grade}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.k} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>{m.key}</span>
                <span>{a[m.k]}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[#38BDF8] transition-all duration-500"
                  style={{ width: `${a[m.k]}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] text-white/50">
                Before: {b[m.k]}% → After: {a[m.k]}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
