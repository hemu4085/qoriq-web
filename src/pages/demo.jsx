// src/pages/demo.jsx
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import applyFixes from "../lib/applyFixes.js";

// Import the CSV as a URL so we can fetch/parse it in the browser
import sampleFileUrl from "../data/sample_crm_demo.csv?url";

export default function Demo() {
  const [status, setStatus] = useState("loading");
  const [rawCount, setRawCount] = useState(0);
  const [cleanCount, setCleanCount] = useState(0);
  const [dedupRemoved, setDedupRemoved] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAndPrepare() {
      try {
        setStatus("loading");

        // 1) Fetch CSV text
        const resp = await fetch(sampleFileUrl);
        if (!resp.ok) throw new Error(`Failed to fetch sample CSV: ${resp.status}`);
        const csvText = await resp.text();

        // 2) Parse CSV
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim(),
        });

        const rows = (parsed.data || []).map((r) =>
          Object.fromEntries(
            Object.entries(r).map(([k, v]) => [k.trim(), typeof v === "string" ? v.trim() : v])
          )
        );

        setRawCount(rows.length);

        // 3) Apply fixes (normalization, email fill, phone formatting, state ISO, etc.)
        const cleaned = rows.map(applyFixes);

        // 4) Deduplicate by email+company AFTER cleanup
        const seen = new Map(); // key -> index kept
        let removed = 0;
        const deduped = [];
        cleaned.forEach((r) => {
          const emailKey = Object.keys(r).find((k) => k.toLowerCase() === "email") || "email";
          const companyKey =
            Object.keys(r).find((k) => ["company", "company_name", "account", "account_name"].includes(k.toLowerCase())) ||
            "company";

          const key = `${(r[emailKey] ?? "").toLowerCase()}||${(r[companyKey] ?? "").toLowerCase()}`;
          if (!seen.has(key)) {
            seen.set(key, deduped.length);
            deduped.push({ ...r });
          } else {
            removed += 1;
            const idx = seen.get(key);
            const canonical = deduped[idx];
            canonical.__fixes = {
              ...(canonical.__fixes || {}),
              duplicate_merged: (canonical.__fixes?.duplicate_merged || 0) + 1,
            };
          }
        });

        setDedupRemoved(removed);
        setCleanCount(deduped.length);

        // 5) Save for Ask Your Data page
        localStorage.setItem("qoriq_cleaned_data", JSON.stringify(deduped));

        setStatus("ready");
      } catch (e) {
        console.error(e);
        setError(e.message || String(e));
        setStatus("error");
      }
    }

    loadAndPrepare();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#07172B] text-white flex items-center justify-center">
        <div className="text-white/80">Loading demo dataset…</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#07172B] text-white flex items-center justify-center">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="font-semibold text-red-300 mb-2">Failed to load demo</div>
          <div className="text-sm text-white/80">{error}</div>
        </div>
      </div>
    );
  }

  // ready
  return (
    <div className="min-h-screen bg-[#07172B] text-white">
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Qoriq Demo Dataset</h1>
          <p className="text-white/70 text-sm">
            A small embedded dataset is auto-loaded, cleaned, de-duplicated, and saved for your{" "}
            <span className="font-semibold">Ask Your Data</span> and{" "}
            <span className="font-semibold">See In Action</span> pages.
          </p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>Raw rows: <span className="font-semibold text-white">{rawCount}</span></div>
            <div>Clean rows: <span className="font-semibold text-white">{cleanCount}</span></div>
            <div>Duplicates merged: <span className="font-semibold text-white">{dedupRemoved}</span></div>
            <div>Saved key: <code className="text-xs">qoriq_cleaned_data</code></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/see-in-action"
            className="rounded-xl bg-white text-[#07172B] px-4 py-2 text-sm font-semibold shadow hover:bg-[#E6F2FF]"
          >
            Open Fix Studio (See In Action)
          </a>

          <a
            href="/ask-your-data"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Open Ask Your Data
          </a>

          <a
            href="/"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to Landing
          </a>
        </div>

        <p className="text-white/60 text-xs">
          Tip: You can refresh this page anytime to re-load the embedded dataset.
        </p>
      </main>
    </div>
  );
}
