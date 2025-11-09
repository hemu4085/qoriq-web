export function calculateScores(before, after) {
  function pct(value) {
    return Math.round(value * 100);
  }

  function scoreCompleteness(rows) {
    const total = rows.length * Object.keys(rows[0]).length;
    const missing = rows.flatMap(Object.values).filter(v => !v || v.trim() === "").length;
    return 1 - missing / total;
  }

  function scoreUniqueness(rows) {
    const emails = rows.map(r => r.email);
    const unique = new Set(emails).size;
    return unique / emails.length;
  }

  function scoreStateConsistency(rows) {
    return rows.filter(r => ["CA", "TX", "NY", "FL"].includes(r.state)).length / rows.length;
  }

  function scoreDateValidity(rows) {
    return rows.filter(r => !isNaN(new Date(r.last_contacted))).length / rows.length;
  }

  function scoreTimeliness(rows) {
    const now = new Date();
    return rows.filter(r => (now - new Date(r.last_contacted)) / (1000*60*60*24) < 180).length / rows.length;
  }

  function scoreIntegrity(rows) {
    return rows.filter(r => r.company && r.email).length / rows.length;
  }

  return {
    completeness: {
      before: pct(scoreCompleteness(before)),
      after: pct(scoreCompleteness(after)),
    },
    consistency: {
      before: pct(scoreStateConsistency(before)),
      after: pct(scoreStateConsistency(after)),
    },
    uniqueness: {
      before: pct(scoreUniqueness(before)),
      after: pct(scoreUniqueness(after)),
    },
    validity: {
      before: pct(scoreDateValidity(before)),
      after: pct(scoreDateValidity(after)),
    },
    timeliness: {
      before: pct(scoreTimeliness(before)),
      after: pct(scoreTimeliness(after)),
    },
    integrity: {
      before: pct(scoreIntegrity(before)),
      after: pct(scoreIntegrity(after)),
    },
  };
}

export function letterGrade(avg) {
  if (avg >= 93) return "A";
  if (avg >= 90) return "A-";
  if (avg >= 87) return "B+";
  if (avg >= 83) return "B";
  if (avg >= 80) return "B-";
  if (avg >= 75) return "C+";
  return "C";
}
