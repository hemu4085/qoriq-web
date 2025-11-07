import './index.css'
import React from "react";
import logo from '/logo.svg';

export default function QoriqLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07172B] to-[#0B2240] text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Qoriq logo" className="h-9 w-9 rounded-xl" />
              <div className="text-xl font-semibold tracking-tight">Qoriq</div>
              <div className="ml-2 hidden rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80 ring-1 ring-white/15 sm:block">
                AI-First Data Readiness
              </div>
            </div>
            <nav className="hidden items-center gap-6 text-sm/6 text-white/80 md:flex">
              <a className="hover:text-white" href="#features">Features</a>
              <a className="hover:text-white" href="#how">How it works</a>
              <a className="hover:text-white" href="#pricing">Pricing</a>
              <a className="hover:text-white" href="#faq">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <button className="hidden rounded-xl border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/10 md:block">Sign in</button>
              <a
                href="mailto:hemuit4085@gmail.com"
                className="rounded-xl bg-white text-[#0B2240] px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#E6F2FF]"
              >
                Book Demo
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_10%,black,transparent)]">
          <div className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#0EA5E9]/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:pb-24 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Solve Your Data. <span className="text-[#38BDF8]">Solve Your AI.</span>
              </h1>
              <p className="mt-4 max-w-xl text-white/80">
                Qoriq is the AI-first data readiness layer: profile, normalize, and score data quality; fix issues with AI; and ship production-grade LLM/RAG workloads with confidence.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:hemuit4085@gmail.com"
                  className="rounded-2xl bg-[#38BDF8] px-5 py-3 text-sm font-semibold text-[#081728] shadow-lg hover:bg-[#67D2FF]"
                >
                  Request a demo
                </a>
                <button className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">
                  Watch 90s overview
                </button>
                <div className="text-xs text-white/60">No AWS required in demo mode</div>
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  ✓ Data Quality Scoring
                </div>
                <div className="flex items-center gap-1">
                  ✓ Fix Studio
                </div>
                <div className="flex items-center gap-1">
                  ✓ RAG Q&A
                </div>
              </div>
            </div>

            {/* Mockup Card */}
            {/* *** Unchanged mockup section stays exactly as-is *** */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl ring-1 ring-white/10">
              <div className="rounded-xl bg-[#07172B] p-4">
                <div className="mb-4 flex items-center justify-between text-xs text-white/60">
                  <span>AI Readiness Scorecard</span>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-300/20">A-</span>
                </div>

                {/* ... your scorecard content remains unchanged ... */}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      {/* (UNCHANGED — your existing code continues exactly as before) */}

      {/* How It Works */}
      {/* (UNCHANGED) */}

      {/* Pricing */}
      {/* (UNCHANGED) */}

      {/* FAQ */}
      {/* (UNCHANGED) */}

      {/* Bottom CTA */}
      <section className="text-center py-24 bg-[#0B2240] border-t border-white/10">
        <h2 className="text-3xl font-bold mb-4">Ready to Fix Your Data?</h2>
        <p className="mb-8 text-white/75 max-w-md mx-auto">
          Get a guided walkthrough using your real CRM data, no AWS setup required.
        </p>
        <a
          href="mailto:hemuit4085@gmail.com"
          className="inline-block rounded-2xl bg-[#38BDF8] px-6 py-3 text-sm font-semibold text-[#081728] shadow-lg hover:bg-[#67D2FF]"
        >
          Book a Demo
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/10 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Qoriq logo" className="h-8 w-8 rounded-xl" />
              <div className="text-sm font-semibold">Qoriq</div>
              <span className="text-xs text-white/50">© {new Date().getFullYear()} Qoriq, Inc.</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-white/70">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
              <a href="mailto:hemuit4085@gmail.com">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
