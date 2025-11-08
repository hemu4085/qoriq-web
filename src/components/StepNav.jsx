export default function StepNav({ current }) {
  const steps = ["Upload", "Normalize", "Score", "Fix", "Ask"];

  return (
    <div className="flex justify-center gap-6 my-8 text-sm text-white/70">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full ${
              current === index
                ? "bg-cyan-400 text-[#0B1A33] font-semibold"
                : "bg-white/10 text-white/70"
            }`}
          >
            {step}
          </div>

          {index < steps.length - 1 && (
            <span className="text-white/30">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
