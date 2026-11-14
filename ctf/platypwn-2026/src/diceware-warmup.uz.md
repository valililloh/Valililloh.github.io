# Platypwn CTF 2026 — Diceware (Warmup) Write-up

**Kategoriya:** Cryptography / Web  
**Bosqich:** Warmup (1-flag)  
**Holat:** Yechilgan va CTF platformasida qabul qilingan  
**Flag:** `PP{yOu_4r3_7h3_5rv3r_n0w::ycF1hSK_GsIN}`

## Topshiriq

`crypto.diceware.zip` arxivi berildi. Unda Python/Flask asosidagi parol menejeri, Rust tilida yozilgan PIR (Private Information Retrieval) moduli va wordlist serverining kodlari bor edi. Maqsadimiz `Warmup User` hisobiga kirib, uning ichidagi **warmup flag** yozuvini olish edi.

Bu topshiriqda OSINT rasmi bo‘lmagan: asosiy dalillar ZIP ichidagi manba kodlari va ishga tushirilgan CTF xizmati edi.

## Foydalanilgan vositalar

- **ZIP arxivi va manba kodlari:** `web/app/app.py`, `web/app/diceware.py`, `inspire/src/pir.rs`, `wordlist_server/src/main.rs`
- **Termux** — telefondan terminalga ulanish
- **Ubuntu VPS + WireGuard** — CTF tarmog‘iga ulanish
- **Python 3** — PIR javob serveri va avtomatlashtirilgan sinov
- **HTTP so‘rovlari** — parolni qayta o‘rnatish va login tekshiruvi

## Yechim jarayoni

### 1. Koddan zaif nuqtani topish

`web/app/app.py` ichida `POST /reset_password` endpointi bor edi. U `username` va `wordlist` qiymatlarini qabul qilib, yangi parolni quyidagicha hosil qilardi:

```python
new_password = generate_password(
    CLIENT_USERS,
    str(request.form.get("wordlist", DEFAULT_WORDLIST))
)
```

`FlagUser` uchun parolni qayta o‘rnatish taqiqlangan, ammo `Warmup User` uchun mumkin edi.

`web/app/diceware.py` esa so‘rovda berilgan `wordlist` manziliga **POST** yuborib, kelgan PIR javobini parol so‘ziga aylantirardi. Eng muhim kamchilik: `wordlist` URL foydalanuvchi tomonidan nazorat qilinardi; xizmat esa unga kelgan kriptografik javobga ishonardi.

### 2. PIR javobini boshqarish

Oddiy matn ko‘rinishidagi `pebble` javobi yetarli emas edi. Server to‘g‘ri `Content-Type` va **PIR formatidagi shifrlangan javob** kutardi.

Shu sabab `diceware_pir_solution.py` skripti yaratildi. U kelgan PIR so‘rovidan Paillier ochiq kalitining modulini (`n`) ajratib, `pebble` so‘zini kodlaydigan mos shifrlangan javob tayyorlardi. Javob Rust klienti kutadigan `postcard` formatiga keltirildi.

Skript ikki rejimda ishlardi:

```bash
python3 diceware_pir_solution.py serve --word pebble --port 9000
```

Keyin ikkinchi terminalda CTF'ning o‘sha vaqtdagi xizmati uchun:

```bash
python3 diceware_pir_solution.py solve \
  --base http://10.83.9.64:8081 \
  --callback http://10.82.1.33:9000/ \
  --word pebble
```

**Izoh:** IP manzillar CTF sessiyasiga tegishli edi; keyinchalik o‘zgarishi mumkin.

### 3. Parolni oldindan bilish

`generate_password()` har bir parolni **6 ta so‘zdan** tuzardi. Bizning soxta PIR server har bir wordlist so‘roviga bir xil so‘z — `pebble` — ni qaytaradigan qilib yozildi.

Natijada yangi parol oldindan ma’lum bo‘ldi:

```text
pebble pebble pebble pebble pebble pebble
```

Jarayonda oltita PIR so‘rovi qayta ishlangani kuzatildi. So‘ng skript `Warmup User` nomidan login qilib, akkauntdagi yozuvlarni o‘qidi.

### 4. Flagni olish va tasdiqlash

Login muvaffaqiyatli bo‘lgach, parol menejeridagi **warmup flag** yozuvi ochildi va quyidagi flag topildi:

```text
PP{yOu_4r3_7h3_5rv3r_n0w::ycF1hSK_GsIN}
```

Flag `PP{...}` formatida CTF platformasiga yuborildi. Dastlabki urinishda qabul qilinmagan holat bo‘lgan, ammo keyingi yuborishda platforma **“Nice! Flag accepted!”** deb tasdiqladi.

## Zaiflikning sababi

Bu yerda oddiy parol taxmin qilish usuli ishlatilmadi. Muammo **ishonchsiz `wordlist` URL va autentifikatsiyalanmagan PIR javobi** edi. Ilova kriptografik javobning tuzilishini tekshirardi, lekin u albatta ishonchli wordlist serveridan kelganini kafolatlamasdi. Shuning uchun parol yaratish jarayonidagi so‘zlarni nazorat qilish mumkin bo‘ldi.

## Xulosa

`Diceware` topshirig‘ida birinchi — **Warmup** — flag olindi. Arxivdagi kodni o‘rganish, Python orqali mos PIR javobini yaratish va VPN orqali CTF muhitida sinash yechimga olib keldi.

**Muhim:** bu write-up faqat topilgan birinchi flagga tegishli. `User` va `Admin` flaglari ushbu sinovda topilmagan.
