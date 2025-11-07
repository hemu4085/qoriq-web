// src/App.jsx
import "./index.css";
import React, { useState } from "react";

export default function App() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ ok: false, msg: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ ok: false, msg: "" });

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "ae8da509-c71a-4441-be44-be001cebb458");
    formData.append("subject", "Qoriq — Demo Request");
    formData.append("from_name", "Qoriq Website");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ ok: true, msg: "Thanks! I’ll reach out within 24 hours." });
        e.currentTarget.reset();
      } else {
        setStatus({ ok: false, msg: data.message });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07172B] to-[#0B2240] text-white">

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 backdrop-blur-sm bg-black/10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight">Qoriq</span>
          </div>

          <nav className="hidden md:flex gap-6 text-sm text-white/75">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-white text-[#0B2240] px-4 py-2 text-sm font-semibold shadow hover:bg-[#E6F2FF]"
          >
            Request a Demo
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-32 grid lg:grid-cols-2 gap-14">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl leading-tight">
            Solve Your Data. <span className="text-[#38BDF8]">Solve Your AI.</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/75 text-lg">
            Qoriq transforms raw enterprise data into AI-ready, validated, and trusted data for production LLM & RAG workloads.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl bg-[#38BDF8] text-[#07172B] px-5 py-3 text-sm font-semibold shadow hover:bg-[#67D2FF]"
            >
              Request a Demo
            </button>
            <a
              href="#how"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Watch 90s Overview
            </a>
          </div>
        </div>

        {/* Scorecard */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
          <div className="rounded-xl bg-[#0A1C34] p-5 space-y-4">
            <div className="flex justify-between text-sm text-white/70">
              <span>Data Quality Score</span>
              <span className="rounded-full bg-emerald-300/20 px-2 py-1 text-emerald-300 text-xs ring-1 ring-emerald-300/30">A-</span>
            </div>
            {[
              { k: "Completeness", v: 91 },
              { k: "Consistency", v: 88 },
              { k: "Validity", v: 89 },
              { k: "Uniqueness", v: 95 },
            ].map((m) => (
              <div key={m.k}>
                <div className="flex justify-between text-xs text-white/70">
                  <span>{m.k}</span> <span>{m.v}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-md mt-1">
                  <div className="h-2 bg-[#38BDF8] rounded-md" style={{ width: `${m.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Built for AI in Production</h2>
          <p className="text-white/70 mt-4 max-w-2xl mx-auto">
            Qoriq ensures your enterprise data is **clean, standardized, complete, and trustworthy** — before it touches your model.
          </p>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-28 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-white/70 mt-4 max-w-2xl mx-auto">Connect → Profile → Fix → Validate → Deploy to LLMs</p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-28 border-t border-white/10 text-center">
        <h2 className="text-3xl font-bold">Pricing</h2>
        <p className="text-white/60 mt-4">Simple. Transparent. Scales with you.</p>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 border-t border-white/10 text-center">
        <h2 className="text-3xl font-bold">FAQ</h2>
      </section>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-6 z-50">
          <div className="bg-[#0B2240] rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">Request a Demo</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <input type="checkbox" name="botcheck" className="hidden" tabIndex="-1" readOnly />

              <input type="text" name="name" placeholder="Your name" required className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded" />
              <input type="email" name="email" placeholder="Your email" required className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded" />
              <textarea name="message" rows="3" placeholder="Tell me about your data challenge..." className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded" />

              <button type="submit" className="w-full bg-white text-[#0B2240] py-2 rounded font-semibold">
                {loading ? "Sending…" : "Send Request"}
              </button>

              {status.msg && (
                <p className={`text-sm text-center ${status.ok ? "text-emerald-300" : "text-rose-300"}`}>{status.msg}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
