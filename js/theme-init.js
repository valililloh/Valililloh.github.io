// Sahifa chizilishidan oldin saqlangan mavzuni qo'yadi (rang miltillamasligi uchun).
(function () {
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
  } catch (e) {
    // localStorage mavjud emas: tizim mavzusi ishlatiladi.
  }
})();
