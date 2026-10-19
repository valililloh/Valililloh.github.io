const TIMEOUT_MS = 5000;
const CACHE_KEY = 'gh-repos-v1';
const CACHE_TTL_MS = 60 * 60 * 1000;

/** JSON yuklaydi, 5 soniyada to'xtatadi. Xato bo'lsa Error tashlaydi. */
export async function fetchJson(url, { timeout = TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS && Array.isArray(cached.repos)) return cached.repos;
  } catch {
    // Kesh buzilgan yoki mavjud emas.
  }
  return null;
}

function writeCache(repos) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    // Kesh ixtiyoriy.
  }
}

/** GitHub repolari: avval sessiya keshi, keyin API (soatiga 60 so'rov limiti tufayli). */
export async function loadRepos(user) {
  const cached = readCache();
  if (cached) return cached;
  const repos = await fetchJson(
    `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`,
  );
  if (!Array.isArray(repos)) throw new Error('GitHub API kutilmagan javob qaytardi');
  writeCache(repos);
  return repos;
}
