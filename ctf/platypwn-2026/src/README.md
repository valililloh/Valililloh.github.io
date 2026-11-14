# Platypwn 2026 — Writeups

**Event:** [Platypwn 2026](https://ctftime.org/event/3082) by Platypwnies (Cybersecurity Klub @ HPI)
**Dates:** 2026-11-13 17:00 UTC — 2026-11-14 11:00 UTC (18 hours, Jeopardy)
**Team:** Kholmirzaev (solo, Open Competition — Online)
**Setup:** Android phone only (Termux), a Ubuntu VPS for the WireGuard VPN and tooling, and AI assistance (allowed for online teams).

This was my first CTF. I solved **5 flags** across Web, Misc, Crypto and OSINT.

| Challenge | Category | Writeup |
|---|---|---|
| Hold Your Horses | Web | [hold-your-horses.md](hold-your-horses.md) |
| Bish Bash Bosh | Misc | [bish-bash-bosh.md](bish-bash-bosh.md) |
| Diceware (warmup flag) | Crypto | [diceware-warmup.md](diceware-warmup.md) (in Uzbek) |
| Signpost | OSINT | [signpost.md](signpost.md) |
| Reverse Image Search | OSINT | solved (no writeup) |

## Lessons learned

- Read the source code first. The web, misc and crypto flags were all found by carefully reading the provided code, not by scanning.
- Don't trust data just because it has the right format. In Diceware the app accepted any well-formed PIR response from a user-supplied URL.
- When copying flags from a terminal screenshot, `0` and `O` look the same. Copy the text, never retype it.
- For geolocation, every number on a sign matters. The altitude on the signpost was the clue that the photo was not taken at the hut.
- Respect rate limits. The location picker allowed 3 tries per minute, so check the map before submitting.
