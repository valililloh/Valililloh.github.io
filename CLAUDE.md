# Valililloh portfolio

Kholmirzaev (valililloh) ning shaxsiy portfolio sayti. GitHub Pages'da joylashadi,
`kholmirzaev.uz` domeniga ulangan.

## Sayt bo'limlari
- **Bosh sahifa (hero):** ism, qisqa tanishtiruv, asosiy havolalar.
- **Men haqimda:** kimligi, nima bilan shug'ullanishi, ko'nikmalari.
- **Loyihalar:** GitHub'dagi loyihalar (nomi, tavsifi, texnologiyalar, havola).
  Ro'yxat GitHub API orqali (`https://api.github.com/users/valililloh/repos`) yoki
  qo'lda yoziladigan JSON fayldan olinadi.
- **Telegram kanallar:** kanal nomi, qisqa tavsif, havola.
- **Ijtimoiy tarmoqlar:** Instagram, Telegram, GitHub va boshqalar.
- **Aloqa:** bog'lanish usullari.

Barcha matnlar (uz/ru/en), ilovalar va loyihalar `assets/content.js` da. Yangi havola,
ilova yoki loyiha ma'lumotini o'ylab topmang: foydalanuvchidan so'rang.
Til tanlash: `?lang=uz|ru|en`, keyin saqlangan tanlov, keyin brauzer tili.

## Texnologiyalar
- Statik sayt: HTML, CSS, oddiy JavaScript. Build bosqichi yo'q, GitHub Pages
  repo ildizidan to'g'ridan-to'g'ri tarqatadi (`.nojekyll` Jekyll'ni o'chiradi).
- Mobilga moslashgan (mobile-first), yorug' va qorong'i rejim.
- Tez yuklanishi kerak: katta kutubxonalarsiz, rasmlar optimallashtirilgan.
- Matnlar o'zbek tilida (keyinchalik ingliz tilini qo'shish mumkin).

## Domen
Domen tasdiqlangach, repo ildiziga `CNAME` fayli qo'shiladi (ichida faqat domen nomi)
va GitHub Settings -> Pages'da custom domain + "Enforce HTTPS" yoqiladi.

## Ishlash tartibi
- Yangi bo'lim: `/plan` -> yozish -> `/code-review` -> `/verify`
- UI uchun `frontend-patterns` va `coding-standards` skilllariga amal qiling.
