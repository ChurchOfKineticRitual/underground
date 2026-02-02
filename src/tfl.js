// Minimal TfL fetch helpers (public endpoints, no auth)

export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`TfL HTTP ${res.status} for ${url}: ${text.slice(0, 160)}`);
  }
  return res.json();
}

export async function fetchTubeLines() {
  return fetchJson('https://api.tfl.gov.uk/Line/Mode/tube');
}

export async function fetchRouteSequence(lineId) {
  return fetchJson(`https://api.tfl.gov.uk/Line/${encodeURIComponent(lineId)}/Route/Sequence/all`);
}
