# Platypwn CTF 2026 — Diceware (Warmup) Write-up

**Category:** Cryptography / Web  
**Stage:** Warmup (flag 1)  
**Status:** Solved and accepted on the CTF platform  
**Flag:** `PP{yOu_4r3_7h3_5rv3r_n0w::ycF1hSK_GsIN}`

## The challenge

We were given the `crypto.diceware.zip` archive. It contained a Python/Flask password manager, a PIR (Private Information Retrieval) module written in Rust, and the code of a wordlist server. The goal was to log in to the `Warmup User` account and get the **warmup flag** entry stored in it.

This challenge had no OSINT image: the main evidence was the source code in the ZIP and the running CTF service.

## Tools used

- **ZIP archive and source code:** `web/app/app.py`, `web/app/diceware.py`, `inspire/src/pir.rs`, `wordlist_server/src/main.rs`
- **Termux** — terminal access from the phone
- **Ubuntu VPS + WireGuard** — connection to the CTF network
- **Python 3** — PIR response server and automated testing
- **HTTP requests** — password reset and login check

## Solution

### 1. Finding the weak spot in the code

`web/app/app.py` had a `POST /reset_password` endpoint. It took `username` and `wordlist` values and generated a new password like this:

```python
new_password = generate_password(
    CLIENT_USERS,
    str(request.form.get("wordlist", DEFAULT_WORDLIST))
)
```

Resetting the password was forbidden for `FlagUser`, but allowed for `Warmup User`.

`web/app/diceware.py` sent a **POST** to the `wordlist` URL from the request and turned the PIR response it got back into password words. The key flaw: the `wordlist` URL was controlled by the user, and the service trusted the cryptographic response that came back from it.

### 2. Controlling the PIR response

A plain-text `pebble` response was not enough. The server expected the right `Content-Type` and an **encrypted response in PIR format**.

So I wrote the `diceware_pir_solution.py` script. It extracted the Paillier public key modulus (`n`) from the incoming PIR query and built a matching encrypted response that encodes the word `pebble`. The response was serialized in the `postcard` format that the Rust client expects.

The script had two modes:

```bash
python3 diceware_pir_solution.py serve --word pebble --port 9000
```

Then, in a second terminal, against the CTF service as it was at that time:

```bash
python3 diceware_pir_solution.py solve \
  --base http://10.83.9.64:8081 \
  --callback http://10.82.1.33:9000/ \
  --word pebble
```

**Note:** the IP addresses belonged to the CTF session and may change later.

### 3. Knowing the password in advance

`generate_password()` built every password from **6 words**. Our fake PIR server returned the same word, `pebble`, for every wordlist request.

So the new password was known in advance:

```text
pebble pebble pebble pebble pebble pebble
```

Six PIR requests were processed during the run. Then the script logged in as `Warmup User` and read the entries in the account.

### 4. Getting and confirming the flag

After a successful login, the **warmup flag** entry in the password manager opened and showed this flag:

```text
PP{yOu_4r3_7h3_5rv3r_n0w::ycF1hSK_GsIN}
```

The flag was submitted to the CTF platform in `PP{...}` format. The first attempt was not accepted, but on the next submission the platform confirmed it with **"Nice! Flag accepted!"**.

## Why it was vulnerable

No password guessing was used here. The problem was the **untrusted `wordlist` URL and the unauthenticated PIR response**. The app checked the structure of the cryptographic response, but did not make sure it came from a trusted wordlist server. That made it possible to control the words used to generate the password.

## Summary

In the `Diceware` challenge the first flag, **Warmup**, was solved. Studying the code from the archive, building a matching PIR response in Python and testing through the VPN in the CTF environment led to the solution.

**Important:** this writeup covers only the first flag. The `User` and `Admin` flags were not found during this attempt.
