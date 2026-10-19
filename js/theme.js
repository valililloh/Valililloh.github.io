const STORAGE_KEY = 'theme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return darkQuery.matches ? 'dark' : 'light';
}

function updateButton(button) {
  const isDark = currentTheme() === 'dark';
  button.setAttribute('aria-label', isDark ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish");
}

export function initTheme(button) {
  if (!button) return;
  updateButton(button);
  darkQuery.addEventListener('change', () => updateButton(button));
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Saqlab bo'lmasa ham mavzu shu sahifada almashadi.
    }
    updateButton(button);
  });
}
