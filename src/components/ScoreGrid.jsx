// src/components/ScoreGrid.jsx
import React, { useEffect, useState } from "react";

export default function ScoreGrid({ metrics, prevMetrics }) {
  const [animated, setAnimated] = useState({
    Completeness: 0,
    Consistency: 0,
    Validity: 0,
    Uniqueness: 0,
  });

  const [highlight, setHighlight] = useState({});

  useEffect(() => {
    const duration = 700;
    const steps = 30;
    const interval = duration / steps;

    const timers = Object.entries(metrics).map(([key, target]) => {
      let step = 0;
      const increment = target / steps;

      return setInterval(() => {
        step++;
        setAnimated((prev) => ({
          ...prev,
          [key]: Math.round(Math.min(target, prev[key] + increment)),
        }));
        if (step >= steps) clearInterval(this);
      }, interval);
    });

    return () => timers.forEach(clearInterval);
  }, [metrics]);

  useEffect(() => {
    if (!prevMetrics) return;
    const changed = {};
    for (const key in metrics) {
      changed[key] = metrics[key] > (prevMetrics[key] ?? 0);
    }
    setHighlight(changed);

    const timeout = setTimeout(() => setHighlight({}), 1200);
    return () => clearTimeout(timeout);
  }, [metrics, prevMetrics]);

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Object.entries(animated).map(([label, pct]) => {
        const improved = highlight[label];

        return (
          <div
            key={label}
            className={`rounded-xl border border-white/20 p-4 text-center transition-all duration-300
              ${improved ? "bg-emerald-500/30 ring-2 ring-emerald-400 shadow-lg" : "bg-white/10"}
            `}
          >
            <div className="text-xs text-white/60 uppercase tracking-wide">
              {label}
            </div>
            <div className="text-2xl font-semibold text-white leading-tight">
              {pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
