// src/lib/localAsk.js

function norm(v) {
  return String(v ?? "").toLowerCase().trim();
}

export function createLocalIndex(rows) {
  return {
    rows: rows.map((row) => {
      const norm = {};
      Object.entries(row).forEach(([k, v]) => {
        norm[k.toLowerCase()] = (v ?? "").toString().toLowerCase().trim();
      });
      return { raw: row, norm };
    })
  };
}



// --- Parse Query Intent ---
function parseQuery(q) {
  q = q.toLowerCase();

  return {
    wantMissingEmail:  /missing email|no email/.test(q),
    wantMissingPhone:  /missing phone|no phone/.test(q),
    wantDuplicates:    /duplicate/.test(q),
    wantRegion:        /region|state|in\s+[a-z]{2}\b/.test(q),
    regionValue:       (q.match(/\bin\s+([a-z]{2})\b/i)?.[1] || "").toUpperCase(),
    wantIndustryBreakdown: /industry|segment|vertical|compare/.test(q),
    wantRootCause: /why|low score|improve|fix|bad quality|root cause/.test(q)
  };
}


// --- Main Ask Function ---
export function askQuestion(index, question) {
  if (!index) return [{ type: "error", text: "No data indexed yet." }];
  const intent = parseQuery(question);
  const rows = index.map(r => r.raw); // raw rows
  const normRows = index.map(r => r.norm);

  // 1) INDUSTRY COMPARISON
  if (intent.wantIndustryBreakdown) {
    const byIndustry = {};
    rows.forEach((r) => {
      const ind = r.industry || r.Industry || "Unknown";
      if (!byIndustry[ind]) byIndustry[ind] = { total: 0, issues: 0 };
      byIndustry[ind].total++;
      if (r.__fixes && Object.keys(r.__fixes).length > 0) byIndustry[ind].issues++;
    });

    const result = Object.entries(byIndustry).map(([industry, st]) => ({
      industry,
      quality: 100 - Math.round((st.issues / st.total) * 100),
      count: st.total
    })).sort((a, b) => a.quality - b.quality);

    return [{
      type: "insight",
      headline: "Industry Data Quality Comparison",
      narrative: `Some customer segments show stronger CRM hygiene than others. Lower quality segments reduce AI recommendation accuracy.`,
      table: result,
      recommendation: "Focus cleanup/enrichment efforts on the lowest quality industries first."
    }];
  }

  // 2) ROOT CAUSE
  if (intent.wantRootCause) {
    let missingEmail = 0, invalidPhone = 0, badState = 0, badDate = 0;

    rows.forEach(r => {
      if (r.__fixes?.email) missingEmail++;
      if (r.__fixes?.phone) invalidPhone++;
      if (r.__fixes?.state) badState++;
      if (r.__fixes?.date) badDate++;
    });

    return [{
      type: "insight",
      headline: "Why Your AI Readiness Score Changed",
      narrative: `Your score increased by resolving incomplete or inconsistent identity and contact fields.`,
      bullets: [
        `• ${missingEmail} records had missing/invalid **emails**`,
        `• ${invalidPhone} records had unformatted **phone numbers**`,
        `• ${badState} records had inconsistent **state/region** formatting`,
        `• ${badDate} records contained unstandardized **dates**`
      ],
      recommendation: `Continue automated cleanup at ingestion to maintain high readiness.`
    }];
  }

  // --- SALES PRIORITIZATION ---
if (q.includes("who") && q.includes("call")) {
  const ranked = index
    .map(r => r.raw)
    .filter(r => r.__priorityScore >= 50)   // only meaningful prospects
    .sort((a,b) => (b.__priorityScore ?? 0) - (a.__priorityScore ?? 0))
    .slice(0, 10); // top 10

  return [{
    type: "insight",
    headline: "Recommended Call Priority List",
    narrative: `These contacts now have complete identity & routing data, increasing likelihood of successful outreach.`,
    table: ranked.map(r => ({
      company: r.company || r.Company,
      email: r.email,
      phone: r.phone,
      state: r.state || r.region,
      score: r.__priorityScore
    })),
    recommendation: "Assign these accounts to SDR call queue next."
  }];
}


  // 3) RECORD-LEVEL FILTERS
  let filtered = rows;

  if (intent.wantMissingEmail)
    filtered = filtered.filter(r => !r.email || r.email === "Unknown");

  if (intent.wantMissingPhone)
    filtered = filtered.filter(r => !r.phone);

  if (intent.wantDuplicates)
    filtered = filtered.filter(r => r.__fixes?.duplicate_merged);

  if (intent.regionValue)
    filtered = filtered.filter(r => norm(r.state) === intent.regionValue.toLowerCase());

  if (filtered.length > 0 && filtered.length < 50) {
    return [{
      type: "insight",
      headline: `Found ${filtered.length} matching records`,
      narrative: `These records match the condition you asked about.`,
      table: filtered.map(r => ({
        company: r.company || r.Company,
        email: r.email,
        state: r.state || r.region,
        phone: r.phone,
      }))
    }];
  }

  // 4) FALLBACK
  return [{
    type: "prompt_help",
    examples: [
      "Which industry segments have the weakest data?",
      "Why did the AI Readiness Score change?",
      "Show records missing email",
      "Show customers in CA missing phone"
    ]
  }];
}
