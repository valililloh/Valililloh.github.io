#!/usr/bin/env python3
"""CTF writeup sahifalarini Markdown'dan yasaydi.

Ishlatish:  python3 tools/build_ctf.py
Manba:      ctf/<musobaqa>/src/<nom>.<uz|ru|en>.md   (README.md faqat arxiv uchun)
Natija:     ctf/<musobaqa>/index.html va har bir writeup uchun <nom>.html

Yangi musobaqa qo'shish: EVENTS ro'yxatiga yangi element qo'shing va src/ papkasiga .md fayllarni qo'ying.
"""
import html
import re
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://kholmirzaev.uz"

UI = {
    "uz": {"home": "Bosh sahifa", "all": "Barcha writeup'lar", "prev": "Oldingi", "next": "Keyingi",
           "solved": "Yechildi, writeup yo'q", "read": "O'qish", "lessons": "Nimani o'rgandim",
           "chal": "Topshiriqlar"},
    "ru": {"home": "На главную", "all": "Все райтапы", "prev": "Назад", "next": "Далее",
           "solved": "Решено, без райтапа", "read": "Читать", "lessons": "Что я понял",
           "chal": "Задания"},
    "en": {"home": "Home", "all": "All writeups", "prev": "Previous", "next": "Next",
           "solved": "Solved, no writeup", "read": "Read", "lessons": "Lessons learned",
           "chal": "Challenges"},
}

EVENTS = [
    {
        "slug": "platypwn-2026",
        "name": "Platypwn 2026",
        "ctftime": "https://ctftime.org/event/3082",
        "date": "13–14.11.2026",
        "flags": 5,
        "intro": {
            "uz": "Birinchi CTF musobaqam. Yakka o'zim, faqat telefon (Termux), VPN uchun Ubuntu VPS va AI yordamida (onlayn jamoalarga ruxsat berilgan) qatnashib, Web, Misc, Crypto va OSINT bo'limlaridan 5 ta flag topdim.",
            "ru": "Мой первый CTF. Я участвовал один, только с телефона (Termux), с Ubuntu VPS для VPN и с помощью AI (разрешено онлайн-командам), и нашёл 5 флагов в категориях Web, Misc, Crypto и OSINT.",
            "en": "My first CTF. I played solo from an Android phone only (Termux), with an Ubuntu VPS for the VPN and AI assistance (allowed for online teams), and solved 5 flags across Web, Misc, Crypto and OSINT.",
        },
        "facts": {
            "uz": [("Tashkilotchi", "Platypwnies (HPI)"), ("Sana", "13–14 noyabr 2026, 18 soat"), ("Format", "Jeopardy"), ("Jamoa", "Kholmirzaev · yakka")],
            "ru": [("Организатор", "Platypwnies (HPI)"), ("Дата", "13–14 ноября 2026, 18 часов"), ("Формат", "Jeopardy"), ("Команда", "Kholmirzaev · соло")],
            "en": [("Organizer", "Platypwnies (HPI)"), ("Dates", "Nov 13–14, 2026, 18 hours"), ("Format", "Jeopardy"), ("Team", "Kholmirzaev · solo")],
        },
        "challenges": [
            {"file": "hold-your-horses", "title": "Hold Your Horses", "cat": "Web"},
            {"file": "bish-bash-bosh", "title": "Bish Bash Bosh", "cat": "Misc"},
            {"file": "diceware-warmup", "title": "Diceware (warmup)", "cat": "Crypto"},
            {"file": "signpost", "title": "Signpost", "cat": "OSINT"},
            {"file": None, "title": "Reverse Image Search", "cat": "OSINT"},
        ],
        "lessons": {
            "uz": [
                "Avval manba kodini o'qing. Web, Misc va Crypto flaglari skaner bilan emas, berilgan kodni diqqat bilan o'qish orqali topildi.",
                "Ma'lumot to'g'ri formatda kelgani uchungina unga ishonmang. Diceware'da ilova foydalanuvchi bergan manzildan kelgan har qanday to'g'ri PIR javobini qabul qilardi.",
                "Terminal skrinshotidan flag ko'chirganda 0 va O bir xil ko'rinadi. Matnni nusxalang, qayta yozmang.",
                "Joylashuvni topishda belgidagi har bir raqam muhim. Yo'l ko'rsatkichidagi balandlik rasm kulbada olinmaganini ko'rsatdi.",
                "Cheklovlarni hurmat qiling. Xaritada daqiqasiga 3 ta urinish berilgan edi, shuning uchun yuborishdan oldin xaritani tekshiring.",
            ],
            "ru": [
                "Сначала читайте исходный код. Флаги Web, Misc и Crypto найдены внимательным чтением кода, а не сканированием.",
                "Не доверяйте данным только потому, что у них правильный формат. В Diceware приложение принимало любой корректный PIR-ответ с адреса, указанного пользователем.",
                "При копировании флага со скриншота терминала 0 и O выглядят одинаково. Копируйте текст, не перепечатывайте.",
                "В геолокации важна каждая цифра на знаке. Высота на указателе показала, что фото сделано не у хижины.",
                "Соблюдайте лимиты. Карта позволяла 3 попытки в минуту, поэтому проверяйте карту перед отправкой.",
            ],
            "en": [
                "Read the source code first. The web, misc and crypto flags were all found by carefully reading the provided code, not by scanning.",
                "Don't trust data just because it has the right format. In Diceware the app accepted any well-formed PIR response from a user-supplied URL.",
                "When copying flags from a terminal screenshot, 0 and O look the same. Copy the text, never retype it.",
                "For geolocation, every number on a sign matters. The altitude on the signpost was the clue that the photo was not taken at the hut.",
                "Respect rate limits. The location picker allowed 3 tries per minute, so check the map before submitting.",
            ],
        },
    }
]

THEME_JS = "try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}"


def lang_js(event_title):
    """Til tanlash: ?lang=, keyin saqlangan tanlov, keyin brauzer tili (asosiy sayt bilan bir xil)."""
    labels = {l: {k: UI[l][k] for k in ("home", "all", "prev", "next")} for l in UI}
    import json
    return """<script>
(()=>{const L=%s,langs=['uz','ru','en'];let l=new URLSearchParams(location.search).get('lang');
if(!langs.includes(l)){try{l=localStorage.getItem('lang')}catch(e){}}
if(!langs.includes(l)){l=(navigator.language||'').slice(0,2);if(!langs.includes(l))l='uz'}
const apply=(x,save)=>{document.documentElement.lang=x;
document.querySelectorAll('[data-l]').forEach(e=>e.hidden=e.dataset.l!==x);
document.querySelectorAll('[data-k]').forEach(e=>e.textContent=L[x][e.dataset.k]);
document.querySelectorAll('[data-lang]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.lang===x)));
document.querySelectorAll('a[data-keep]').forEach(e=>{const u=new URL(e.getAttribute('href'),location.href);u.searchParams.set('lang',x);e.href=u.pathname+u.search+u.hash});
if(save){try{localStorage.setItem('lang',x)}catch(e){}}};
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.lang,true)));
apply(l,false);const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear()})();
</script>""" % json.dumps(labels, ensure_ascii=False)


def page(title, desc, canonical, body, lang_attr="uz"):
    e = html.escape
    return f"""<!doctype html>
<html lang="{lang_attr}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)} | kholmirzaev.uz</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Manrope:wght@400;500;700&display=swap" rel="stylesheet">
<script>{THEME_JS}</script>
<link rel="stylesheet" href="/assets/style.css">
<link rel="stylesheet" href="/assets/writeup.css">
</head>
<body>
<nav><div class="wrap"><a href="/" class="logo" data-keep>kholmirzaev<span>.uz</span></a><div class="nav-right"><div class="lang" role="group" aria-label="Language"><button type="button" data-lang="uz">UZ</button><button type="button" data-lang="ru">RU</button><button type="button" data-lang="en">EN</button></div></div></div></nav>
<main class="story">
{body}
</main>
<footer><div class="wrap"><span>© <span id="year"></span> Valililloh Kholmirzaev</span><a href="/" data-keep>kholmirzaev.uz</a></div></footer>
{lang_js(title)}
</body>
</html>
"""


def by_lang(fn):
    return "".join(f'<div data-l="{l}"{"" if l == "uz" else " hidden"}>{fn(l)}</div>' for l in ("uz", "ru", "en"))


def build_event(ev):
    base = ROOT / "ctf" / ev["slug"]
    src = base / "src"
    e = html.escape
    url = f"{SITE}/ctf/{ev['slug']}/"
    written = [c for c in ev["challenges"] if c["file"]]

    # ---------- Umumiy sahifa ----------
    def facts(l):
        cells = "".join(f'<div class="fact"><span>{e(k)}</span><b>{e(v)}</b></div>' for k, v in ev["facts"][l])
        return f'<p>{e(ev["intro"][l])}</p><div class="facts">{cells}<div class="fact"><span>Flag</span><b>{ev["flags"]}</b></div></div>'

    def chal_list(l):
        items = []
        for c in ev["challenges"]:
            if c["file"]:
                items.append(f'<a href="{c["file"]}.html" data-keep><b>{e(c["title"])}</b><small>{e(c["cat"])}</small><i>{e(UI[l]["read"])} →</i></a>')
            else:
                items.append(f'<div class="c"><b>{e(c["title"])}</b><small>{e(c["cat"])}</small><i>{e(UI[l]["solved"])}</i></div>')
        return f'<h2>{e(UI[l]["chal"])}</h2><div class="chal">{"".join(items)}</div>'

    def lessons(l):
        lis = "".join(f"<li>{e(x)}</li>" for x in ev["lessons"][l])
        return f'<h2>{e(UI[l]["lessons"])}</h2><ol class="lessons">{lis}</ol>'

    body = f"""<div class="story-nav"><a href="/#ctf" data-keep>← <span data-k="home">{UI['uz']['home']}</span></a><small>CTF · {e(ev['date'])}</small></div>
<div class="story-hero"><div class="eyebrow">CTF · WRITEUP · <a href="{ev['ctftime']}" target="_blank" rel="noopener">CTFtime ↗</a></div><h1>{e(ev['name'])}</h1>{by_lang(facts)}</div>
<section class="story-section">{by_lang(chal_list)}</section>
<section class="story-section">{by_lang(lessons)}</section>"""
    desc = ev["intro"]["en"]
    (base / "index.html").write_text(page(f"{ev['name']} CTF writeups", desc, url, body), encoding="utf-8")

    # ---------- Har bir writeup ----------
    for i, c in enumerate(written):
        def render(l, c=c):
            """Har bir til uchun src/<nom>.<til>.md; tarjima bo'lmasa bor tildagisi ko'rsatiladi."""
            path = next(p for p in (src / f"{c['file']}.{x}.md" for x in (l, "en", "uz", "ru")) if p.exists())
            html_ = markdown.markdown(path.read_text(encoding="utf-8"), extensions=["fenced_code", "tables", "sane_lists"])
            html_ = re.sub(r'href="([a-z0-9-]+)\.md"', r'href="\1.html"', html_)
            html_ = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', html_)
            return f'<article class="md" lang="{path.suffixes[0][1:]}">{html_}</article>'
        title = c["title"]  # sahifa sarlavhasi qisqa nom bilan; .md dagi H1 yashiriladi
        content = by_lang(render)
        prev_c = written[i - 1] if i > 0 else None
        next_c = written[i + 1] if i + 1 < len(written) else None
        pager = '<div class="pager">'
        pager += (f'<a href="{prev_c["file"]}.html" data-keep>← <span data-k="prev">{UI["uz"]["prev"]}</span>: {e(prev_c["title"])}</a>' if prev_c else "<span></span>")
        pager += (f'<a href="{next_c["file"]}.html" data-keep><span data-k="next">{UI["uz"]["next"]}</span>: {e(next_c["title"])} →</a>' if next_c else "")
        pager += "</div>"
        body = f"""<div class="story-nav"><a href="./" data-keep>← <span data-k="all">{UI['uz']['all']}</span></a><small>{e(ev['name'])} · {e(c['cat'])}</small></div>
<div class="story-hero"><div class="eyebrow">{e(ev['name'])} · {e(c['cat'])}</div><h1>{e(title)}</h1></div>
{content}
{pager}"""
        desc = f"{ev['name']} CTF writeup: {c['title']} ({c['cat']})."
        (base / f"{c['file']}.html").write_text(page(f"{title} — {ev['name']}", desc, f"{url}{c['file']}.html", body), encoding="utf-8")
    return [url] + [f"{url}{c['file']}.html" for c in written]


if __name__ == "__main__":
    urls = []
    for ev in EVENTS:
        urls += build_event(ev)
    print("\n".join(urls))
