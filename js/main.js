import { loadProjects, loadChannels, loadLinks } from './data.js';
import { projectCard, channelCard, linkItem, renderList, renderError } from './render.js';

const ERROR_TEXT = "Ma'lumotni yuklab bo'lmadi. Keyinroq urinib ko'ring.";

function currentTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit) return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setupThemeToggle() {
  const button = document.querySelector('.theme-toggle');
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Saqlab bo'lmasa ham rejim joriy sahifada ishlaydi.
    }
  });
}

async function fill(name, load, renderItem) {
  const container = document.querySelector(`[data-list="${name}"]`);
  try {
    renderList(container, await load(), renderItem);
  } catch (error) {
    console.error(`${name} yuklanmadi:`, error);
    renderError(container, ERROR_TEXT);
  }
}

document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
setupThemeToggle();
fill('projects', loadProjects, projectCard);
fill('channels', loadChannels, channelCard);
fill('links', loadLinks, linkItem);
