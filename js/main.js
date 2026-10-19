import { initTheme } from './theme.js';
import { fetchJson, loadRepos } from './data.js';
import { el, icon, externalLink, linkCard, projectCard, replaceChildren } from './render.js';
import { isPlaceholder } from './lib/url.js';
import { filterRepos, sortRepos, mapRepo, collectLanguages } from './lib/projects.js';

const LANG = 'uz';
const $ = (id) => document.getElementById(id);
const text = (value) => (value && typeof value === 'object' ? value[LANG] : value);

function renderAbout(profile) {
  const paragraphs = (text(profile.about) || []).filter((p) => !isPlaceholder(p));
  const container = $('about-text');
  replaceChildren(container, paragraphs.map((p) => el('p', { text: p })));
  container.hidden = paragraphs.length === 0;
}

function renderChannels(channels) {
  replaceChildren(
    $('channels-list'),
    channels
      .filter((c) => !isPlaceholder(c.url))
      .map((c) => linkCard({ url: c.url, title: c.name, subtitle: `${c.handle} · ${text(c.description)}`, iconName: c.icon })),
  );
}

function renderSocial(links) {
  replaceChildren(
    $('social-list'),
    links
      .filter((l) => !isPlaceholder(l.url))
      .map((l) => linkCard({ url: l.url, title: l.label, subtitle: l.handle, iconName: l.icon })),
  );
}

function renderContact(profile, links) {
  const email = isPlaceholder(profile.email) ? null : `mailto:${profile.email}`;
  const telegram = isPlaceholder(profile.telegram) ? null : `https://t.me/${profile.telegram.replace(/^@/, '')}`;
  const instagram = links.find((l) => l.id === 'instagram');
  replaceChildren($('contact-list'), [
    telegram ? el('li', {}, [externalLink(telegram, { class: 'btn btn-primary' }, [icon('telegram'), 'Telegram orqali yozish'])]) : null,
    instagram ? el('li', {}, [externalLink(instagram.url, { class: 'btn' }, [icon('instagram'), "Instagram'da yozish"])]) : null,
    email ? el('li', {}, [externalLink(email, { class: 'btn' }, [icon('mail'), profile.email])]) : null,
  ]);
}

async function loadProjects(user) {
  try {
    return sortRepos(filterRepos(await loadRepos(user))).map(mapRepo);
  } catch {
    // API ishlamasa (limit, tarmoq), qo'lda yozilgan ro'yxat ishlatiladi.
    const fallback = await fetchJson('data/projects.json').catch(() => []);
    return Array.isArray(fallback) ? fallback : [];
  }
}

async function renderProjects(user) {
  const status = $('projects-status');
  const projects = await loadProjects(user);
  replaceChildren($('projects-list'), projects.map(projectCard));
  replaceChildren($('skills'), collectLanguages(projects).map((lang) => el('li', { text: lang })));

  if (projects.length) {
    status.hidden = true;
    return;
  }
  replaceChildren(status, [
    "Loyihalarni hozir yuklab bo'lmadi. ",
    externalLink(`https://github.com/${user}?tab=repositories`, { text: "GitHub'da ko'rish" }),
  ]);
}

function initAvatar() {
  const img = $('avatar-img');
  if (!img) return;
  const hide = () => {
    img.hidden = true;
  };
  if (img.complete && img.naturalWidth === 0) hide();
  else img.addEventListener('error', hide, { once: true });
}

async function init() {
  initTheme($('theme-toggle'));
  initAvatar();
  $('year').textContent = String(new Date().getFullYear());

  const [profile, links, channels] = await Promise.all(
    ['data/profile.json', 'data/links.json', 'data/channels.json'].map((url) => fetchJson(url).catch(() => null)),
  );

  if (profile) renderAbout(profile);
  if (channels) renderChannels(channels);
  if (links) renderSocial(links);
  if (profile && links) renderContact(profile, links);
  await renderProjects(profile?.githubUser || 'valililloh');
}

init();
