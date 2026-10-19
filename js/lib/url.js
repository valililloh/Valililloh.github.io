const SAFE_PROTOCOLS = new Set(['https:', 'mailto:']);

/** Faqat https: va mailto: havolalarini o'tkazadi (javascript:, data: va h.k. rad etiladi). */
export function isSafeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    return SAFE_PROTOCOLS.has(new URL(value.trim()).protocol);
  } catch {
    return false;
  }
}

/** Hali to'ldirilmagan qiymat: bo'sh yoki "TODO" bilan boshlanadi. */
export function isPlaceholder(value) {
  if (typeof value !== 'string') return true;
  const trimmed = value.trim();
  return trimmed === '' || /^todo/i.test(trimmed);
}
