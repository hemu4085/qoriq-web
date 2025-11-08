// src/utils/sampleData.js
function rng(seed) {
  // tiny deterministic PRNG so the dataset is stable across reloads
  let t = seed >>> 0;
  return () => (t = (t * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}

const rand = rng(42);

const FIRST = ["John","Sara","Mike","Priya","Chen","Luis","Aisha","David","Emily","Ravi","Liam","Noah","Olivia","Emma","Sophia"];
const LAST  = ["Smith","Patel","Lee","Garcia","Brown","Khan","Williams","Singh","Johnson","Gupta","Martinez","Lopez","Davis"];
const COMP  = ["Acme Corp","ACME Corporation","Globex","Globex LLC","Innotech","Inno-Tech","Apex Systems","APEX SYSTEMS","DataSoft","Datasoft Inc","BlueWave","Blue Wave Technologies"];
const INDS  = ["SaaS","saas","FinServ","Fin Services","Healthcare","Healthcare "];
const REG   = ["CA","Calif.","California","NY","New York","Mass","MA","Massachusetts","TX","Texas"];
const STAGE = ["Discovery","Discover","DISCOVERY","Demo Scheduled","Demo","DM scheduled","Proposal","Proposal Sent","Closed Won","Closed Lost"];
const EMAIL_DOMAINS = ["gmail.com","outlook.com","company.com","bizmail.com"];

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function maybeNull(val, p=0.12) {
  return rand() < p ? null : val;
}

function randomDateWithin(daysBackMin=5, daysBackMax=90) {
  const days = Math.floor(daysBackMin + rand()*(daysBackMax - daysBackMin + 1));
  const d = new Date(Date.now() - days*24*3600*1000);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function makeRow(i) {
  const first = maybeNull(pick(FIRST), 0.08);
  const last  = maybeNull(pick(LAST), 0.12);
  const email = maybeNull(
    `${(first || "").toLowerCase()}.${(last || "").toLowerCase()}@${pick(EMAIL_DOMAINS)}`,
    0.10
  );

  const notesChoices = [
    "Asked about pricing, unsure about timeline.",
    "Strong interest, requested proposal.",
    "Budget constraints, follow up next quarter.",
    "Meeting scheduled with CFO.",
    null
  ];

  return {
    lead_id: `L${String(i+1).padStart(3,"0")}`,
    first_name: first,
    last_name: last,
    company_name: pick(COMP),
    email,
    industry: pick(INDS),
    region: pick(REG),
    deal_stage: pick(STAGE),
    last_touch_date: maybeNull(randomDateWithin(), 0.18),
    last_contacted_by: maybeNull(pick([...FIRST, ...LAST]), 0.10),
    deal_value: maybeNull(Math.floor(15000 + rand()*765000), 0.08),
    notes: pick(notesChoices),
  };
}

const data = Array.from({ length: 50 }, (_, i) => makeRow(i));

export default data;
