// src/utils/fixes.js

function normIndustry(raw) {
  if (!raw) return raw;
  const s = String(raw).trim().toLowerCase();
  if (["saas","s.a.a.s"].includes(s)) return "SaaS";
  if (["finserv","fin serv","fin services","financial services"].includes(s)) return "FinServ";
  if (["healthcare","healthcare "].includes(s)) return "Healthcare";
  // fallback heuristic
  if (s.includes("saas")) return "SaaS";
  if (s.includes("fin")) return "FinServ";
  if (s.includes("health")) return "Healthcare";
  return "Other";
}

function normRegion(raw) {
  if (!raw) return raw;
  const s = String(raw).trim().toLowerCase();
  if (["ca","calif.","california"].includes(s)) return "CA";
  if (["ny","new york"].includes(s)) return "NY";
  if (["ma","mass","massachusetts"].includes(s)) return "MA";
  if (["tx","texas"].includes(s)) return "TX";
  return raw; // leave as-is if unknown
}

function normStage(raw) {
  if (!raw) return raw;
  const s = String(raw).trim().toLowerCase();
  if (["discovery","discover","discovery "].includes(s)) return "Discovery";
  if (["demo scheduled","dm scheduled","demo"].includes(s)) return "Demo Scheduled";
  if (["proposal","proposal sent"].includes(s)) return "Proposal";
  if (["closed won"].includes(s)) return "Closed Won";
  if (["closed lost"].includes(s)) return "Closed Lost";
  return "Discovery";
}

function cleanEmail(raw) {
  if (!raw) return raw;
  const s = String(raw).trim().toLowerCase();
  // naive validity pass: must contain a single "@"
  if (!s.includes("@")) return null;
  return s;
}

export function applyFixes(rows) {
  return rows.map(r => ({
    ...r,
    industry: normIndustry(r.industry),
    region: normRegion(r.region),
    deal_stage: normStage(r.deal_stage),
    email: cleanEmail(r.email),
    // normalize whitespace on names & company
    first_name: r.first_name ? String(r.first_name).trim() : r.first_name,
    last_name : r.last_name  ? String(r.last_name).trim()  : r.last_name,
    company_name: r.company_name ? String(r.company_name).replace(/\s+/g," ").trim() : r.company_name,
  }));
}
