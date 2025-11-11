// src/components/ImprovementsBanner.jsx
import { useEffect, useState } from "react";

export default function ImprovementsBanner({ scoresBefore, scoresAfter }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // reveal after slight delay (smooth entrance)
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Estimate overall lift (simple average letter conversion)
  const letterToPoints = (g) => ({ A: 4, B: 3, C: 2, D: 1 }[g[0]] ?? 0);

  const dims = Object.keys(scoresBefore);
  const beforeAvg = dims.reduce((s, d) => s + letterToPoints(scoresBefore[d]), 0) / dims.length;
  const afterAvg = dims.reduce((s, d) => s + letterToPoints(scoresAfter[d]), 0) / dims.length;
  const lift = ((afterAvg - beforeAvg) * 25).toFixed(0); // approx → % feeling metric

  return (
    <div
      className={`transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } bg-white/10 border border-white/15 rounded-2xl p-5 mt-6`}
    >
      <div className="text-center text-white font-semibold text-lg mb-4">
        AI Readiness Improved
        {" "}
        <span className="text-[#38BDF8]">+{lift}%</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        {dims.map((dim) => (
          <div key={dim} className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl">
            <span className="text-white/80">{dim}</span>
            <span className="font-semibold">
              {scoresBefore[dim]} → <span className="text-[#38BDF8]">{scoresAfter[dim]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
