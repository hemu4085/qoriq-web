export function computeReadinessScores(data) {
  const totalRows = data.length;

  const completeness = (1 - data.filter(r => !r.email || !r.first_name || !r.last_name).length / totalRows) * 100;
  const consistency = (1 - data.filter(r => ["SaaS","saas","SAAS"].includes(r.industry) === false).length / totalRows) * 100;
  const timeliness = (1 - data.filter(r => !r.last_touch_date).length / totalRows) * 100;
  const validity = (1 - data.filter(r => !r.email?.includes("@")).length / totalRows) * 100;
  const uniqueness = 90; // MVP static placeholder
  const integrity = 85;  // MVP static placeholder

  return {
    score: Math.round((completeness + consistency + timeliness + validity + uniqueness + integrity) / 6),
    completeness: Math.round(completeness),
    consistency: Math.round(consistency),
    timeliness: Math.round(timeliness),
    validity: Math.round(validity),
    uniqueness,
    integrity,
  };
}
