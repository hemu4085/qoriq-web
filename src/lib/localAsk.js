// src/lib/localAsk.js

function normalize(v) {
  return String(v ?? "").toLowerCase().trim();
}

// --- 1) Build searchable index ---
export function createLocalIndex(rows) {
  return {
    rows: rows.map((row) => {
      const norm = {};
      Object.entries(row).forEach(([k, v]) => {
        norm[k.toLowerCase()] = normalize(v);
      });
      return { raw: row, norm };
    })
  };
}

// --- 2) Interpret question into signals ---
function parseIntent(q) {
  const question = q.toLowerCase();
  return {
    wants_low_quality: question.includes("why") || question.includes("low"),
    wants_missing_email: question.includes("missing email") || question.includes("no email"),
    wants_region: question.includes("region") || question.includes("state") || question.includes("in "),
  };
}

// --- 3) Main Ask Engine with human language output ---
export function askQuestion(index, question) {
  if (!index || !index.rows || index.rows.length === 0) {
    return [{ type: "error", text: "No data available. Please Apply Fixes first." }];
  }

  const q = question.toLowerCase();
  const intent = parseIntent(q);
  const rows = index.rows;

  // Case 1 — "Why is my data quality low?"
  if (intent.wants_low_quality) {
    let missingEmail = 0,
        badPhone = 0,
        badState = 0,
        badDate = 0;

    rows.forEach(r => {
      const fx = r.raw.__fixes || {};
      if (fx.email) missingEmail++;
      if (fx.phone) badPhone++;
      if (fx.state) badState++;
      if (fx.date)  badDate++;
    });

    return [{
      type: "insight",
      headline: "Why Your AI Readiness Score Improved",
      narrative: "Your data quality improved because several identity fields were repaired, leading to stronger match & routing confidence.",
      bullets: [
        `• ${missingEmail} contact records had missing or invalid **emails** (fixed)`,
        `• ${badState} records had non-standard **region/state** formatting (standardized)`,
        `• ${badPhone} phone numbers were normalized for dialer usage`,
        `• ${badDate} timestamps were aligned to ISO date format`
      ],
      recommendation: "Standardize these fields at ingestion to maintain high ongoing readiness."
    }];
  }

  // Case 2 — "Show missing email"
  if (intent.wants_missing_email) {
    const affected = rows
      .filter(r => r.raw.__fixes?.email)
      .slice(0, 10)
      .map(r => r.raw.company || r.raw.Company || r.raw.name || r.raw.Name || "[Unknown]");

    if (affected.length === 0)
      return [{ type: "text", text: "✅ No contacts are missing email anymore." }];

    return [{
      type: "insight",
      headline: "Contacts Missing Email (Fixed)",
      narrative: "These contacts were missing or invalid email address:",
      bullets: affected,
      recommendation: "Sync with your CRM owner to enforce required email fields."
    }];
  }

  // Default: guide user to meaningful insights
  return [{
    type: "prompt_help",
    examples: [
      "Why is my data quality low?",
      "Show missing email",
      "Which segment has weakest data quality?"
    ]
  }];
}
