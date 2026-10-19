import { isSafeUrl } from './url.js';

const TME_URL = /https:\/\/t\.me\/[A-Za-z0-9_]{3,}/;
const BOT_USERNAME = /@([A-Za-z0-9_]{2,}bot)\b/i;

function isTelegramUrl(value) {
  return isSafeUrl(value) && new URL(value).hostname === 't.me';
}

/** Repo bilan bog'langan Telegram botni topadi: avval homepage, keyin tavsif. */
export function extractBotUrl(repo) {
  if (isTelegramUrl(repo.homepage)) return repo.homepage.trim();
  const description = typeof repo.description === 'string' ? repo.description : '';
  const link = description.match(TME_URL);
  if (link) return link[0];
  const username = description.match(BOT_USERNAME);
  return username ? `https://t.me/${username[1]}` : null;
}

/** Fork va noto'g'ri elementlarni chiqarib tashlaydi. */
export function filterRepos(repos) {
  if (!Array.isArray(repos)) return [];
  return repos.filter((repo) => repo && typeof repo.name === 'string' && !repo.fork);
}

/** Oxirgi push sanasi bo'yicha (yangisi oldinda), yangi massiv qaytaradi. */
export function sortRepos(repos) {
  return [...repos].sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at));
}

/** GitHub API javobini sayt uchun kerakli ko'rinishga o'tkazadi. */
export function mapRepo(repo) {
  const homepage = isSafeUrl(repo.homepage) && !isTelegramUrl(repo.homepage) ? repo.homepage.trim() : null;
  return {
    name: repo.name,
    description: typeof repo.description === 'string' && repo.description.trim() ? repo.description.trim() : null,
    url: repo.html_url,
    homepage,
    bot: extractBotUrl(repo),
    language: repo.language || null,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    stars: Number(repo.stargazers_count) || 0,
    archived: Boolean(repo.archived),
  };
}

/** Loyihalarda ishlatilgan tillar, ko'p uchraydigani oldinda. */
export function collectLanguages(projects) {
  const counts = projects.reduce((acc, { language }) => {
    if (!language) return acc;
    return { ...acc, [language]: (acc[language] || 0) + 1 };
  }, {});
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
}
