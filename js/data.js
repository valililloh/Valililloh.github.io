import { isSafeUrl } from './render.js';

const GITHUB_REPOS_URL = 'https://api.github.com/users/valililloh/repos?sort=updated&per_page=100';

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

const hasText = (value) => typeof value === 'string' && value.trim() !== '';

export async function loadProjects() {
  const manual = await fetchJson('data/projects.json');
  const valid = manual.filter((p) => hasText(p.name));
  if (valid.length > 0) return valid;

  // Qo'lda ro'yxat bo'sh bo'lsa, GitHub'dagi ochiq repolarni ko'rsatamiz.
  const repos = await fetchJson(GITHUB_REPOS_URL);
  return repos
    .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== 'valililloh.github.io')
    .map((r) => ({
      name: r.name,
      description: r.description || '',
      tech: r.language ? [r.language] : [],
      url: r.html_url,
    }));
}

export async function loadApps() {
  const apps = await fetchJson('data/apps.json');
  return apps.filter((a) => hasText(a.name));
}

export async function loadChannels() {
  const channels = await fetchJson('data/channels.json');
  return channels.filter((c) => hasText(c.name) && isSafeUrl(c.url));
}

export async function loadLinks() {
  const links = await fetchJson('data/links.json');
  return links.filter((l) => hasText(l.label) && isSafeUrl(l.url));
}
