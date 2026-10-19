const EMPTY_TEXT = "Tez orada qo'shiladi.";

export function isSafeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function link(href, text, className) {
  const a = el('a', className, text);
  a.href = href;
  if (href.startsWith('https:')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return a;
}

const strings = (value) => (Array.isArray(value) ? value.map(String) : []);

export function projectCard(project) {
  const card = el('article', 'card');
  const title = el('h3', 'card__title', project.name);
  if (project.status) title.append(' ', el('span', 'badge', project.status));
  card.append(title);
  card.append(el('p', 'card__text', project.description || ''));

  const tech = strings(project.tech);
  if (tech.length > 0) {
    const tags = el('ul', 'tags');
    tags.append(...tech.map((t) => el('li', '', t)));
    card.append(tags);
  }
  if (isSafeUrl(project.url)) card.append(link(project.url, "Ko'rish →"));
  return card;
}

export function appCard(app) {
  const card = el('article', 'card card--wide');
  card.append(el('h3', 'card__title', app.name));
  if (app.subtitle) card.append(el('p', 'card__subtitle muted', app.subtitle));
  card.append(el('p', 'card__text', app.summary || ''));

  const details = el('details', 'details');
  details.append(el('summary', '', 'Batafsil'));
  if (app.description) details.append(el('p', '', app.description));
  const features = strings(app.features);
  if (features.length > 0) {
    details.append(el('p', 'details__label', 'Imkoniyatlar:'));
    const list = el('ul', 'features');
    list.append(...features.map((f) => el('li', '', f)));
    details.append(list);
  }
  if (app.note) details.append(el('p', 'muted', app.note));
  card.append(details);

  if (isSafeUrl(app.url)) card.append(link(app.url, 'Yuklab olish →', 'btn btn--primary'));
  return card;
}

export function channelCard(channel) {
  const card = el('article', 'card');
  card.append(el('h3', 'card__title', channel.name));
  card.append(el('p', 'card__text', channel.description || ''));
  if (isSafeUrl(channel.url)) card.append(link(channel.url, "Kanalga o'tish →"));
  return card;
}

export function linkItem(item) {
  const li = el('li');
  li.append(link(item.url, item.label, 'btn'));
  return li;
}

export function renderList(container, items, renderItem) {
  const nodes = items.length > 0
    ? items.map(renderItem)
    : [el(container.tagName === 'UL' ? 'li' : 'p', 'muted', EMPTY_TEXT)];
  container.replaceChildren(...nodes);
}

export function renderError(container, message) {
  const tag = container.tagName === 'UL' ? 'li' : 'p';
  container.replaceChildren(el(tag, 'muted', message));
}
