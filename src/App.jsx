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
        setStatus({ ok: true, msg: "Thanks — I'll personally reach out within 24 hours." });
        e.currentTarget.reset();
      } else {
        setStatus({ ok: false, msg: data.message || "Something went wrong. Try again." });
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

          {/* LOGO + TEXT */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" className="h-8 w-auto" alt="Qoriq Logo" />
            <span className="text-lg font-semibold tracking-tight">Qoriq</span>
          </div>

          <nav className="hidden md:flex gap-6 text-sm text-white/75">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#process" className="hover:text-white">How it Works</a>
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
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 grid lg:grid-cols-2 gap-14" id="hero">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl leading-tight">
            Solve Your Data. <span className="text-[#38BDF8]">Solve Your AI.</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/75 text-lg">
            Qoriq is an AI-first data readiness platform that transforms raw enterprise data into
            validated, structured, AI-ready data — built for production LLM & RAG workloads.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl bg-[#38BDF8] text-[#07172B] px-5 py-3 text-sm font-semibold shadow hover:bg-[#67D2FF]"
            >
              Request a Demo
            </button>
            <a
              href="#process"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Watch 90s Overview
            </a>
          </div>
        </div>

        {/* SCORECARD UI MOCKUP */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
          <div className="rounded-xl bg-[#0A1C34] p-5 space-y-4">
            <div className="flex justify-between text-sm text-white/70">
              <span>Data Quality Score</span>
              <span className="rounded-full bg-emerald-300/20 px-2 py-1 text-emerald-300 text-xs ring-1 ring-emerald-300/30">A-</span>
            </div>

            {[{ k: "Completeness", v: 91 }, { k: "Consistency", v: 88 }, { k: "Validity", v: 89 }, { k: "Uniqueness", v: 95 }].map(m => (
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

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-6 z-50">
          <div className="bg-[#0B2240] rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Request a Demo</h2>
                <p className="text-white/70 text-sm mt-1">
                  Tell me a bit about your data & AI use case.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">

              {/* Honeypot (spam protection) */}
              <input type="checkbox" name="botcheck" className="hidden" tabIndex="-1" autoComplete="off" />

              <input type="text" name="name" placeholder="Your name" required className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm" />
              <input type="email" name="email" placeholder="Your email" required className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm" />
              <input type="text" name="company" placeholder="Company (optional)" className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm" />
              <textarea name="message" rows="3" placeholder="What problem are you solving?" className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm" />

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-white text-[#0B2240] py-2 text-sm font-semibold hover:bg-[#E6F2FF] disabled:opacity-60">
                {loading ? "Sending…" : "Send Request"}
              </button>

              {status.msg && (
                <div className={`text-xs mt-2 px-3 py-2 rounded-lg border ${
                  status.ok
                    ? "bg-emerald-400/10 text-emerald-200 border-emerald-300/30"
                    : "bg-rose-400/10 text-rose-200 border-rose-300/30"
                }`}>
                  {status.msg}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
