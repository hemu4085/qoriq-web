// src/App.jsx
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
    // Web3Forms config
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
        setStatus({
          ok: true,
          msg: "Thanks — I'll personally reach out within 24 hours.",
        });
        e.currentTarget.reset();
      } else {
        setStatus({
          ok: false,
          msg: data.message || "Something went wrong. Try again.",
        });
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
      <header className="sticky top-0 z-40 bg-black/10 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0EA5E9]/20 ring-1 ring-white/10 grid place-items-center shadow-sm">
              {/* Icon (brain/nodes) */}
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="7" cy="7" r="2" />
                <circle cx="17" cy="7" r="2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
                <path d="M9 7h6M7 9v6M17 9v6M9 17h6" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">Qoriq</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest bg-white/10 px-2 py-1 rounded-full ring-1 ring-white/15 text-white/80">
              AI-First Data Readiness
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/75">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
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
<section className="relative overflow-hidden">
  {/* glow */}
  <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_10%,black,transparent)]">
    <div className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#0EA5E9]/20 blur-3xl" />
  </div>

  <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:pb-24 sm:pt-24 grid items-center gap-12 lg:grid-cols-2">
    <div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Solve Your Data. <span className="text-[#38BDF8]">Solve Your AI.</span>
      </h1>
      <p className="mt-4 max-w-xl text-white/80 text-lg">
        Qoriq is an AI-first data readiness platform that transforms raw
        enterprise data into AI-ready, validated, and trusted data for
        production LLM &amp; RAG workloads.
      </p>

      {/* ✅ BUTTON ROW FIXED — correct closing tags */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => (window.location.href = "/see-in-action")}
          className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
        >
          See In Action
        </button>

        <button
          onClick={() => (window.location.href = "/ask-your-data")}
          className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
        >
          Ask Your Data
        </button>

        <button
          onClick={() => (window.location.href = "/demo")}
          className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
        >
          Demo (Instant Sample Data)
        </button>
      </div>
      {/* ✅ Closing div was missing above */}
      
      {/* quick badges */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/60">
        <Badge icon="check">Data Quality Scoring</Badge>
        <Badge icon="plus">Fix Studio</Badge>
        <Badge icon="menu">RAG Q&amp;A</Badge>
      </div>
    </div>

    {/* Scorecard mockup (unchanged) */}
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl ring-1 ring-white/10">
      <div className="rounded-xl bg-[#07172B] p-4">
        <div className="mb-4 flex items-center justify-between text-xs text-white/70">
          <span>AI Readiness Scorecard</span>
          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300 ring-1 ring-emerald-300/20">
            A-
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { k: "Completeness", b: 72, a: 91 },
            { k: "Consistency", b: 68, a: 88 },
            { k: "Uniqueness", b: 83, a: 95 },
            { k: "Validity", b: 74, a: 89 },
            { k: "Timeliness", b: 69, a: 84 },
            { k: "Integrity", b: 77, a: 93 },
          ].map((m) => (
            <div key={m.k} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>{m.k}</span>
                <span>{m.a}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[#38BDF8]"
                  style={{ width: `${m.a}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] text-white/50">
                Before: {m.b}% → After: {m.a}%
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 text-xs text-white/70 sm:grid-cols-2">
          <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
            <div className="mb-1 font-semibold text-white/80">Top Issues</div>
            <ul className="list-disc space-y-1 pl-4">
              <li>State codes mis-matched (CA/Cal/Calif)</li>
              <li>Missing contact emails (12%)</li>
              <li>Date format inconsistencies</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
            <div className="mb-1 font-semibold text-white/80">AI Fix Suggestions</div>
            <ul className="list-disc space-y-1 pl-4">
              <li>Normalize states via USPS mapping</li>
              <li>Deduplicate by email + company</li>
              <li>Standardize dates to ISO 8601</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* FEATURES: Make data AI-ready, fast */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Make data <span className="text-[#67D2FF]">AI-ready</span>, fast
          </h2>
          <p className="mt-3 text-white/75">
            From raw CSVs and CRM exports to production-grade LLM/RAG pipelines
            — with measurable data quality gains at every step.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Profile & Score",
              desc: "Automatic profiling and DQ scoring across completeness, consistency, validity, timeliness, integrity, and uniqueness.",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M4 4h16v16H4z" />
                  <path d="M8 8h3v8H8zM13 11h3v5h-3z" />
                </svg>
              ),
            },
            {
              title: "Fix Studio",
              desc: "Guided, auditable fixes with AI suggestions, before/after diffs, and one-click apply/rollback.",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
                </svg>
              ),
            },
            {
              title: "Sync to Bedrock",
              desc: "Push clean, normalized data into AWS Bedrock Knowledge Bases and vector stores.",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v10M7 12h10" />
                </svg>
              ),
            },
            {
              title: "RAG Q&A",
              desc: "Ask natural-language questions about your accounts, deals, and risks with instant traceability.",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M4 5h16v10H4z" />
                  <path d="M8 19h8" />
                </svg>
              ),
            },
            {
              title: "AI Sales Coach",
              desc: "Deal risks, next-best actions, and tailored recommendations to unblock revenue.",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M12 6v12M6 12h12" />
                </svg>
              ),
            },
            {
              title: "Audit & Governance",
              desc: "Lineage, change logs, and policy checks to keep your data compliant and trustworthy.",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M5 11l7-7 7 7v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
                </svg>
              ),
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-white/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">From raw to AI-ready in minutes</h2>
            <p className="mt-3 max-w-xl text-white/75">
              Run locally in demo mode or connect to your AWS account. Either way, you get fast, verifiable improvements and clean data pipelines.
            </p>
            <ol className="mt-6 space-y-4">
              {[
                { n: 1, t: "Upload", d: "CSV, HubSpot, Salesforce — bring your source of truth." },
                { n: 2, t: "Normalize", d: "Standardize formats, map lookups, and unify entities." },
                { n: 3, t: "Score", d: "Measure DQ with letter grades & dimension scores." },
                { n: 4, t: "Fix", d: "Apply AI suggestions; preview before/after diffs." },
                { n: 5, t: "Sync & Ask", d: "Sync to Bedrock KBs and use RAG Q&A for instant answers." },
              ].map((s) => (
                <li key={s.n} className="flex gap-4">
                  <div className="mt-1 h-7 w-7 shrink-0 rounded-xl bg-[#38BDF8] text-center text-sm font-bold text-[#061426] grid place-items-center shadow">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-semibold">{s.t}</div>
                    <div className="text-sm text-white/70">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setOpen(true)}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0B2240] shadow hover:bg-[#E6F2FF]"
              >
                Get started
              </button>
              <a
                href="#pricing"
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Book a walkthrough
              </a>
            </div>
          </div>

          {/* Fix Studio preview block */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/10 shadow-2xl">
            <div className="rounded-xl bg-[#08182F] p-4">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Fix Studio — Preview</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 ring-1 ring-white/15">
                  Demo
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-xs text-white/60">Before</div>
                  <div className="mt-2 rounded-md bg-black/20 p-3 text-sm">
                    stade_cd = "cali"
                  </div>
                  <div className="mt-2 rounded-md bg-black/20 p-3 text-sm">
                    email = null
                  </div>
                  <div className="mt-2 rounded-md bg-black/20 p-3 text-sm">
                    date = "06/03/24"
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-xs text-white/60">After</div>
                  <div className="mt-2 rounded-md bg-black/20 p-3 text-sm">
                    state = "CA"
                  </div>
                  <div className="mt-2 rounded-md bg-black/20 p-3 text-sm">
                    email = "user@acme.com"
                  </div>
                  <div className="mt-2 rounded-md bg-black/20 p-3 text-sm">
                    date_iso = "2024-06-03"
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-emerald-400/10 p-3 text-sm text-emerald-200 ring-1 ring-emerald-300/20">
                +18 pts average DQ improvement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-white/75">
            Start in demo mode. Upgrade when you’re ready to connect AWS and scale.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "$0",
              sub: "Demo mode",
              items: ["Upload CSV", "DQ Scorecard", "Fix Studio (local)", "RAG Q&A (local)"],
              cta: "Get started",
              highlight: false,
            },
            {
              name: "Growth",
              price: "$134",
              sub: "/month",
              items: ["HubSpot + Salesforce", "Bedrock KB sync", "Team workspace", "Audit & lineage"],
              cta: "Choose Growth",
              highlight: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              sub: "",
              items: ["SSO + RBAC", "Private VPC", "Support SLA", "Custom connectors"],
              cta: "Talk to us",
              highlight: false,
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 ring-1 ring-white/10 bg-white/5 shadow border ${
                tier.highlight
                  ? "border-[#38BDF8]/40 shadow-[#38BDF8]/20"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <div className="text-3xl font-bold">
                  {tier.price}
                  <span className="text-base font-medium text-white/70">
                    {tier.sub}
                  </span>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {tier.items.map((it) => (
                  <li key={it} className="flex items-start gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-4 w-4 flex-none"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="m5 12 4 4L19 6" strokeWidth="2" />
                    </svg>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setOpen(true)}
                className={`mt-6 w-full rounded-xl px-4 py-2 text-sm font-semibold ${
                  tier.highlight
                    ? "bg-white text-[#0B2240] hover:bg-[#E6F2FF]"
                    : "border border-white/15 text-white/90 hover:bg-white/10"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="text-3xl font-bold text-center">FAQ</h2>
        <div className="mx-auto mt-8 space-y-3">
          {[
            {
              q: "Is there a free plan?",
              a: "Yes — Starter lets you try Qoriq locally with sample data and no cloud setup.",
            },
            {
              q: "Do I need AWS?",
              a: "Only if you want to sync to Bedrock KBs or run managed RAG in production.",
            },
            { q: "Can I invite teammates?", a: "Yes — Growth adds workspaces and shared projects." },
            {
              q: "How is data quality scored?",
              a: "We compute dimension-level scores (completeness, consistency, validity, timeliness, integrity, uniqueness) and a weighted overall grade.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <summary className="cursor-pointer list-none select-none text-base font-semibold marker:hidden">
                <span className="mr-2 inline-block rounded-md bg-white/10 px-1.5 py-0.5 text-xs ring-1 ring-white/15">
                  ?
                </span>
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-white/80">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black/10 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#0EA5E9]/20 ring-1 ring-white/10 grid place-items-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="7" cy="7" r="2" />
                  <circle cx="17" cy="7" r="2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                  <path d="M9 7h6M7 9v6M17 9v6M9 17h6" />
                </svg>
              </div>
              <div className="text-sm font-semibold">Qoriq</div>
              <span className="text-xs text-white/50">
                © {new Date().getFullYear()} Qoriq, Inc.
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-white/70">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(true);
                }}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL (Web3Forms) */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-6 z-50">
          <div className="bg-[#0B2240] rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Request a Demo</h2>
                <p className="text-white/70 text-sm mt-1">
                  Tell me a bit about your data &amp; AI use case.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Honeypot field (spam protection) */}
              <input
                type="checkbox"
                name="botcheck"
                className="hidden"
                tabIndex="-1"
                autoComplete="off"
              />

              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm"
              />

              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm"
              />

              <input
                type="text"
                name="company"
                placeholder="Company (optional)"
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm"
              />

              <textarea
                name="message"
                rows="3"
                placeholder="What problem are you solving? Where is the data today?"
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-white text-[#0B2240] py-2 text-sm font-semibold hover:bg-[#E6F2FF] disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Request"}
              </button>

              {status.msg && (
                <div
                  className={`text-xs mt-2 px-3 py-2 rounded-lg border ${
                    status.ok
                      ? "bg-emerald-400/10 text-emerald-200 border-emerald-300/30"
                      : "bg-rose-400/10 text-rose-200 border-rose-300/30"
                  }`}
                >
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

/** Small badge component used in hero */
function Badge({ icon, children }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/15">
      {icon === "check" && (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
          <path d="m5 12 4 4L19 6" strokeWidth="2" />
        </svg>
      )}
      {icon === "plus" && (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
          <path d="M12 6v12M6 12h12" />
        </svg>
      )}
      {icon === "menu" && (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      )}
      <span className="text-xs text-white/70">{children}</span>
    </div>
  );
}
