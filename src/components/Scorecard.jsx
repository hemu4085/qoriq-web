export default function Scorecard({ score, before }) {
  const grade = score >= 90 ? "A" :
                score >= 85 ? "A-" :
                score >= 80 ? "B+" :
                score >= 75 ? "B" :
                score >= 70 ? "C+" :
                score >= 65 ? "C" : "D";

  const metrics = [
    { label: "Completeness", value: before.completeness },
    { label: "Consistency", value: before.consistency },
    { label: "Uniqueness", value: before.uniqueness },
    { label: "Validity", value: before.validity },
    { label: "Timeliness", value: before.timeliness },
    { label: "Integrity", value: before.integrity },
  ];

  return (
    <div className="bg-[#0B1A33] p-8 rounded-2xl shadow-lg border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-xl font-semibold">AI Readiness Scorecard</h2>
        <span className="text-white bg-white/10 px-4 py-1 rounded-full text-lg font-medium">
          {grade}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-white/80 text-sm mb-1">{m.label}</span>
            <div className="w-full bg-white/10 h-2 rounded">
              <div className="h-2 bg-cyan-400 rounded" style={{ width: `${m.value}%` }}></div>
            </div>
            <span className="text-white text-xs mt-1">{m.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
