# Hold Your Horses (Web)

## Topshiriq

Rust (axum) tilida yozilgan ot poygasiga pul tikish sayti. Boshida **10 ochko** beriladi, **500 ochkoga** yetganda `/api/state` endpointi `vip` maydonida flagni ko'rsatadi. Manba kodi berilgan.

## O'yin qanday ishlaydi

- Fondagi sikl har soniyada bir marta ishlaydi.
- `timer` 0–29: pul tikish ochiq. `timer == 30` bo'lganda tasodifiy bitta ot "favorit" bo'ladi va ikki barobar tez yuguradi.
- Har soniyada har bir ot tasodifiy masofaga oldinga siljiydi. Biror ot 100 ga yetganda poyga tugaydi.
- Yutgan tikish `amount * 2` to'laydi.

10 dan 500 ochkoga chiqish uchun **ketma-ket 6 ta poygada** yutish kerak (10 → 20 → 40 → 80 → 160 → 320 → 640). 16 ta ot bo'lgani uchun taxmin qilib bunga erishib bo'lmaydi.

## Zaiflik

Tikish endpointi middleware bilan himoyalangan:

```rust
async fn betting_open(State(state): State<SharedState>, request: Request, next: Next) -> ... {
    if state.read().await.timer >= 30 {
        return Err((StatusCode::BAD_REQUEST, "Race already started".to_string()));
    }
    Ok(next.run(request).await)
}
```

Handler tikishni `Json<BetRequest>` sifatida qabul qiladi. axum'da middleware so'rovning **sarlavhalari (headers)** kelishi bilan ishlaydi, JSON tanasi (body) esa keyinroq, handler'ning extractor'i ishlaganda o'qiladi.

Demak "tikish ochiqmi?" tekshiruvi sarlavhalar kelganda bo'ladi, tikishning o'zi (qaysi ot, qancha) esa tana kelganda hal qilinadi. Agar sarlavhalarni tikish ochiq paytda yuborib, **tanani ushlab tursak**, poyga deyarli tugashini kutib, aniq yutayotgan otni tanlashimiz mumkin. Nomi ham shunga ishora: hold your horses (bytes), ya'ni "baytlaringizni ushlab turing".

## Ekspluatatsiya

1. Har soniyada `GET /api/state` ni so'rab turamiz.
2. `timer` 25 va 28 orasida bo'lganda oddiy TCP ulanish ochib, `POST /api/bet` ning faqat sarlavhalarini aniq `Content-Length` bilan yuboramiz.
3. Poygani kuzatishda davom etamiz. Oldingi ot taxminan 85 ga yetganda tanani yuboramiz: `{"horse": <oldingi ot>, "amount": <barcha ochko>}`.
4. Tana uzunligi `Content-Length` ga aynan teng bo'lishi kerak, shuning uchun JSON bo'sh joylar bilan to'ldiriladi (JSON bo'sh joyga ruxsat beradi).
5. 6 ta poyga uchun takrorlaymiz, keyin `vip` dan flagni o'qiymiz.

Python'dagi asosiy g'oya:

```python
s = socket.create_connection((HOST, PORT))
s.sendall(b"POST /api/bet HTTP/1.1\r\nHost: x\r\n"
          b"Content-Type: application/json\r\n"
          b"Content-Length: 64\r\n\r\n")   # betting is still open here
# ... wait until the leader is close to the finish line ...
body = json.dumps({"horse": leader, "amount": points}).ljust(64).encode()
s.sendall(body)                              # bet decided now
```

6 ta tikishning hammasi yutdi: 10 → 20 → 40 → 80 → 160 → 320 → 640 ochko, `vip` maydoni flagni qaytardi. So'rovlar soniyasiga taxminan bittadan oshirilmadi.

## Flag

`PP{h0ld_y0ur_byt3s_n0t_y0ur_h0rs3s::e8KHzo9mPTrc}`

## Xulosa

Middleware'dagi ruxsat yoki holat tekshiruvi faqat u ishlagan lahzada to'g'ri bo'ladi. Agar qaror keyin keladigan ma'lumotga (tanaga) bog'liq bo'lsa, tekshiruv o'sha ma'lumot ishlatiladigan joyda, ya'ni handler ichida, tikishni qo'llaydigan qulf (lock) ostida bo'lishi kerak.
