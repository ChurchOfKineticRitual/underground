// Compute approximate adjacent-station distances for the Victoria line using TfL Route Sequence stop points.
// Usage: node scripts/victoria_distances.mjs

const LINE_ID = 'victoria';

function haversineM(a, b) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

const seq = await fetchJson(`https://api.tfl.gov.uk/Line/${encodeURIComponent(LINE_ID)}/Route/Sequence/all`);
const sequences = seq.stopPointSequences || [];
const longest = sequences.reduce((best, cur) =>
  (!best || (cur.stopPoint?.length || 0) > (best.stopPoint?.length || 0)) ? cur : best
, null);

const sps = (longest?.stopPoint || [])
  .filter(sp => Number.isFinite(sp.lat) && Number.isFinite(sp.lon))
  .map(sp => ({ id: sp.id, name: sp.name, lat: sp.lat, lon: sp.lon }));

let total = 0;
const rows = [];
for (let i = 0; i < sps.length - 1; i++) {
  const a = sps[i];
  const b = sps[i + 1];
  const d = haversineM(a, b);
  total += d;
  rows.push({ from: a.name, to: b.name, meters: d });
}

const fmtKm = m => (m / 1000).toFixed(2);
console.log(`Victoria line (TfL route sequence): ${sps.length} stops, ${rows.length} inter-station segments`);
console.log(`Total (straight-line) ≈ ${fmtKm(total)} km`);
console.log('');

for (const r of rows) {
  console.log(`${r.from} → ${r.to}: ${r.meters.toFixed(0)} m (${fmtKm(r.meters)} km)`);
}
