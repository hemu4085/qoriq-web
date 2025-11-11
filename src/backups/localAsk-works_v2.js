// src/lib/localAsk.js

// ----------------------------
// Helpers
// ----------------------------
function normalize(v) {
  return String(v ?? "").toLowerCase().trim();
}

// Detect correct field name from dataset (handles variations)
function detectKey(rows, candidates, fallback) {
  if (!rows || !rows.length) return fallback;
  const sample = rows[0];
  const cols = Object.keys(sample).map(k => k.toLowerCase());

  for (const c of candidates) {
    const idx = cols.indexOf(c.toLowerCase());
    if (idx !== -1) return Object.keys(sample)[idx];
  }
  return fallback;
}

// ----------------------------
// 1) Build Search Index
// ----------------------------
export function createLocalIndex(rows) {
  return rows.map(row => {
    const norm = {};
    for (const [k, v] of Object.entries(row)) {
      norm[k.toLowerCase()] = normalize(v);
    }
    return { raw: row, norm };
  });
}

// ----------------------------
// 2) Interpret & Answer Queries
// ----------------------------
export function askQuestion(question, index) {
  const q = (question || "").toLowerCase().trim();

  if (!index || !Array.isArray(index) || index.length === 0) {
    return [
      { type: "error", text: "⚠️ No cleaned data found. Please Apply Fixes first in See In Action." }
    ];
  }

  // Resolve key names dynamically
  const rawRows = index.map(i => i.raw);
  const emailKey  = detectKey(rawRows, ["email","email_address","contact_email"], "email");
  const regionKey = detectKey(rawRows, ["region","state","st","location","territory"], "region");
  const phoneKey  = detectKey(rawRows, ["phone","mobile","contact_phone","work_phone"], "phone");
  const industryKey = detectKey(rawRows, ["industry","segment","vertical"], "industry");

  // ----------------------------
  // Show Missing Email
  // ----------------------------
  if (q.includes("missing email") || q.includes("no email")) {
    const missing = index.filter(r =>
      !r.norm[emailKey] || r.norm[emailKey] === "unknown" || r.norm[emailKey] === "n/a"
    );

    return [
      {
        type: "insight",
        headline: "Contacts Missing Email",
        narrative: `These contacts do not have usable email addresses, reducing routing & personalization capability.`,
        bullets: missing.slice(0, 25).map(r => {
          const fn = r.raw.first_name || "";
          const ln = r.raw.last_name || "";
          const comp = r.raw.company_name || r.raw.company || "";
          return `• ${fn} ${ln} — ${comp}`;
        }),
        recommendation: "Require email at record creation to maintain AI readiness."
      }
    ];
  }

  // ----------------------------
  // Why is my score low?
  // ----------------------------
  if (q.includes("why") || q.includes("score") || q.includes("low") || q.includes("improve")) {
    const missingEmailCount = index.filter(r =>
      !r.norm[emailKey] ||
      r.norm[emailKey] === "unknown" ||
      r.norm[emailKey] === "n/a"
    ).length;

    const inconsistentRegionCount = index.filter(r =>
      r.norm[regionKey] && r.norm[regionKey].length > 2
    ).length;

    const missingPhoneCount = index.filter(r =>
      !r.norm[phoneKey] ||
      r.norm[phoneKey].replace(/[^0-9]/g, "").length < 10
    ).length;

    return [
      {
        type: "insight",
        headline: "Why Your Data Quality Is Low",
        narrative: "Your AI Readiness Score is being held back by inconsistent or incomplete contact identity fields.",
        bullets: [
          `• **${missingEmailCount}** contacts missing/invalid **emails**`,
          `• **${inconsistentRegionCount}** contacts with inconsistent **region formatting**`,
          `• **${missingPhoneCount}** contacts missing/dial-unready **phone numbers**`
        ],
        recommendation: "Enable auto-normalization at ingestion + enforce key identity fields in CRM."
      }
    ];
  }

  // ----------------------------
  // Industry Data Quality Comparison
  // ----------------------------
  if (q.includes("industry") || q.includes("segment")) {
    const groups = {};

    index.forEach(r => {
      const ind = r.norm[industryKey] || "unknown";
      if (!groups[ind]) groups[ind] = { total: 0, missingEmail: 0 };
      groups[ind].total++;
      if (!r.norm[emailKey]) groups[ind].missingEmail++;
    });

    const table = Object.entries(groups)
      .map(([industry, d]) => ({
        industry,
        quality: 100 - Math.round((d.missingEmail / d.total) * 100),
        count: d.total
      }))
      .sort((a, b) => a.quality - b.quality);

    return [
      {
        type: "insight",
        headline: "Industry Data Quality Comparison",
        narrative: "Some industry segments consistently maintain cleaner CRM data than others. Lower-quality segments create leakage in targeting, scoring & personalization.",
        table,
        recommendation: "Focus enrichment efforts first on the lowest-quality segments (top of table)."
      }
    ];
  }

  // ----------------------------
  // Default Guidance
  // ----------------------------
  return [
    {
      type: "prompt_help",
      examples: [
        "Why is my data quality low?",
        "Show missing email",
        "Which industry segment has the weakest data quality?"
      ]
    }
  ];
}
