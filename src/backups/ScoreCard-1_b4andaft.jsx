// src/components/ScoreCard.jsx
export default function ScoreCard({ metrics, finalScore }) {
  const letter =
    finalScore >= 90 ? "A" :
    finalScore >= 80 ? "B" :
    finalScore >= 70 ? "C" :
    finalScore >= 60 ? "D" : "F";

  return (
    <div className="border border-white/10 bg-white/5 rounded-xl p-6 mt-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Readiness Score</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ring-1 ${
          letter === "A" ? "bg-emerald-300/20 text-emerald-300 ring-emerald-300/40" :
          letter === "B" ? "bg-blue-300/20 text-blue-300 ring-blue-300/40" :
          letter === "C" ? "bg-yellow-300/20 text-yellow-300 ring-yellow-300/40" :
          "bg-red-300/20 text-red-300 ring-red-300/40"
        }`}>
          {letter}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {Object.entries(metrics).map(([label, value]) => (
          <div key={label}>
            <div className="flex justify-between text-sm text-white/75">
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-md mt-1">
              <div
                className="h-2 bg-[#38BDF8] rounded-md transition-all duration-700"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
