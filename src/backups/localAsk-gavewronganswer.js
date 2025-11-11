// src/lib/localAsk.js

// Normalize string values
function normalize(v) {
  return String(v ?? "").toLowerCase().trim();
}

/**
 * ✅ 1) Build lightweight search index
 * We store both:
 *   raw  → original row
 *   norm → lowercase normalized fields
 */
export function createLocalIndex(rows) {
  return rows.map((row) => {
    const norm = {};
    Object.entries(row).forEach(([k, v]) => {
      norm[k.toLowerCase()] = normalize(v);
    });
    return { raw: row, norm };
  });
}

/**
 * ✅ 2) Natural-Language Question → Structured Insight Response
 * NOTE:
 *   index is now an ARRAY (not index.rows).
 *   So we operate directly on `data`.
 */
export function askQuestion(question, index) {
  const data = index; // index is already an array

  const q = (question || "").toLowerCase().trim();

  if (!data || !Array.isArray(data) || data.length === 0) {
    return [
      { type: "error", text: "⚠️ No cleaned data found. Please Apply Fixes first in See In Action." }
    ];
  }

  //
  // --- A) SHOW MISSING EMAILS ---
  //
  if (q.includes("missing email") || q.includes("no email") || q.includes("show email")) {
    const missing = data.filter(r => !r.norm.email);
    return [
      {
        type: "insight",
        headline: "Contacts Missing Email",
        narrative: `These contacts do not have valid email addresses. This weakens identity match and personalization scoring.`,
        bullets: missing.slice(0, 25).map(r => {
          const fn = r.raw.first_name || "";
          const ln = r.raw.last_name || "";
          const comp = r.raw.company || r.raw.company_name || "";
          return `• ${fn} ${ln} — ${comp}`;
        }),
        recommendation: "Require email at lead creation to maintain AI readiness."
      }
    ];
  }

  //
  // --- B) WHY IS MY DATA QUALITY LOW? ---
  //
  if (q.includes("why") || q.includes("low") || q.includes("improve") || q.includes("score")) {
    const missingEmailCount = data.filter(r => !r.norm.email).length;
    const inconsistentStateCount = data.filter(r =>
      !/^[A-Z]{2}$/.test(r.norm.region || r.norm.state || "")
    ).length;
    const missingPhoneCount = data.filter(r => !r.norm.phone && !r.norm.mobile).length;

    return [
      {
        type: "insight",
        headline: "Why Your Data Quality Is Low",
        narrative: `Your AI Readiness Score is being reduced by missing and inconsistent core identity fields.`,
        bullets: [
          `• ${missingEmailCount} records missing/invalid **emails**`,
          `• ${inconsistentStateCount} records with inconsistent **state/region** formatting`,
          `• ${missingPhoneCount} contacts missing/dial-unready **phone numbers**`
        ],
        recommendation:
          "Enable auto-normalization at ingestion and enforce required fields to maintain readiness."
      }
    ];
  }

  //
  // --- C) INDUSTRY SEGMENT QUALITY COMPARISON ---
  //
  if (q.includes("industry") || q.includes("segment")) {
    const byIndustry = {};

    data.forEach((r) => {
      const ind = r.norm.industry || "unknown";
      if (!byIndustry[ind]) byIndustry[ind] = { total: 0, missingEmail: 0 };
      byIndustry[ind].total++;
      if (!r.norm.email) byIndustry[ind].missingEmail++;
    });

    const rows = Object.entries(byIndustry)
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
        narrative: `Different market segments maintain very different CRM hygiene levels — which affects personalization, RAG lookup precision, and scoring models.`,
        table: rows,
        recommendation: `Focus cleanup and enrichment efforts first on the lowest-quality segments (bottom of table).`
      }
    ];
  }

  //
  // --- D) DEFAULT GUIDANCE ---
  //
  return [
    {
      type: "prompt_help",
      examples: [
        "show missing email",
        "why is my data quality low?",
        "which industry has weakest data quality?"
      ]
    }
  ];
}
