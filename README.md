# valililloh.github.io

Shaxsiy portfolio sayti. Statik HTML/CSS/JS, build bosqichi yo'q.

## Ma'lumotlarni to'ldirish

Ro'yxatlar `data/` papkasidagi JSON fayllardan olinadi. Bo'sh ro'yxat saytda
"Tez orada qo'shiladi" bo'lib ko'rinadi. Havolalar faqat `https:`, `mailto:` yoki `tel:` bo'lishi kerak.

- `data/projects.json` — bo'sh bo'lsa, GitHub'dagi ochiq repolar avtomatik chiqadi.
  ```json
  [{ "name": "vocab-bot", "description": "...", "tech": ["Python", "aiogram"], "url": "https://github.com/valililloh/vocab-bot" }]
  ```
- `data/channels.json`
  ```json
  [{ "name": "Kanal nomi", "description": "...", "url": "https://t.me/..." }]
  ```
- `data/links.json` — aloqa va ijtimoiy tarmoqlar.
  ```json
  [{ "label": "Telegram", "url": "https://t.me/..." }]
  ```

Ism, tanishtiruv va "Men haqimda" matni `index.html` ichida.

## Lokal ishga tushirish

`fetch` `file://` orqali ishlamaydi, shuning uchun server kerak:

```sh
python3 -m http.server 8000
```
