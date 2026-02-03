// Download TfL Route Sequence JSON for tube lines into public/data/tfl so the demo can run offline
// Usage: node scripts/cache-tfl.mjs

import fs from 'node:fs/promises';
import path from 'node:path';

const LINES = [
  'bakerloo','central','circle','district','hammersmith-city',
  'jubilee','metropolitan','northern','piccadilly','victoria','waterloo-city'
];

const OUT_DIR = path.resolve('public/data/tfl/route-sequence');

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function main() {
  await ensureDir(OUT_DIR);

  const index = {
    kind: 'tfl-route-sequence-cache',
    generatedAt: new Date().toISOString(),
    lines: {},
  };

  for (const id of LINES) {
    const url = `https://api.tfl.gov.uk/Line/${encodeURIComponent(id)}/Route/Sequence/all`;
    process.stdout.write(`Fetching ${id}... `);
    const data = await fetchJson(url);
    const file = `${id}.json`;
    await fs.writeFile(path.join(OUT_DIR, file), JSON.stringify(data));
    index.lines[id] = { file, url };
    console.log('ok');
  }

  await fs.writeFile(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`Wrote ${LINES.length} files to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
