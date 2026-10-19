import { isSafeUrl } from './lib/url.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS_URL = 'assets/icons/icons.svg';

/** DOM element yaratadi. Matn faqat textContent orqali qo'yiladi (innerHTML ishlatilmaydi). */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value === true ? '' : String(value));
  });
  children.filter(Boolean).forEach((child) => node.append(child));
  return node;
}

export function icon(name, className = 'icon') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `${ICONS_URL}#${name}`);
  svg.append(use);
  return svg;
}

/** Tashqi havola. Xavfli URL bo'lsa null qaytaradi. */
export function externalLink(url, attrs = {}, children = []) {
  if (!isSafeUrl(url)) return null;
  const isMail = url.startsWith('mailto:');
  return el(
    'a',
    { href: url, ...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' }), ...attrs },
    children,
  );
}

export function linkCard({ url, title, subtitle, iconName }) {
  const link = externalLink(url, { class: 'link-card' }, [
    el('span', { class: 'icon-box' }, [icon(iconName)]),
    el('span', { class: 'link-card-body' }, [
      el('span', { class: 'link-card-title', text: title }),
      subtitle ? el('span', { class: 'link-card-sub', text: subtitle }) : null,
    ]),
    icon('arrow', 'icon arrow'),
  ]);
  return link ? el('li', {}, [link]) : null;
}

export function projectCard(project) {
  const meta = [
    project.language ? el('span', { text: project.language }) : null,
    project.stars > 0 ? el('span', { 'aria-label': `${project.stars} yulduz` }, [icon('star'), String(project.stars)]) : null,
    project.archived ? el('span', { class: 'badge', text: 'Arxivlangan' }) : null,
  ].filter(Boolean);

  const actions = [
    project.bot ? externalLink(project.bot, { class: 'btn btn-primary' }, [icon('bot'), 'Botni ochish']) : null,
    project.homepage ? externalLink(project.homepage, { class: 'btn' }, [icon('globe'), 'Sayt']) : null,
    externalLink(project.url, { class: 'btn' }, [icon('github'), 'Kod']),
  ];

  return el('li', {}, [
    el('article', { class: 'card' }, [
      el('h3', { class: 'card-title' }, [externalLink(project.url, { text: project.name })]),
      project.description
        ? el('p', { class: 'card-text', text: project.description })
        : el('p', { class: 'card-text is-empty', text: "Tavsif hali qo'shilmagan." }),
      meta.length ? el('div', { class: 'card-meta' }, meta) : null,
      el('div', { class: 'card-actions' }, actions),
    ]),
  ]);
}

export function replaceChildren(container, nodes) {
  container.replaceChildren(...nodes.filter(Boolean));
}
