# Hold Your Horses (Web)

## The challenge

A horse racing betting site written in Rust (axum). We start with **10 points** and the `/api/state` endpoint shows the flag in the `vip` field once we reach **500 points**. Source code was provided.

## How the game works

- A background loop ticks once per second.
- `timer` 0–29: betting is open. At `timer == 30` one random horse becomes the "favorite" and runs twice as fast.
- Every tick each horse moves forward by a random amount. The race ends when a horse reaches 100.
- A winning bet pays `amount * 2`.

To go from 10 to 500 points we need to win **6 races in a row** (10 → 20 → 40 → 80 → 160 → 320 → 640). Guessing is hopeless with 16 horses.

## The bug

The bet endpoint is protected by a middleware:

```rust
async fn betting_open(State(state): State<SharedState>, request: Request, next: Next) -> ... {
    if state.read().await.timer >= 30 {
        return Err((StatusCode::BAD_REQUEST, "Race already started".to_string()));
    }
    Ok(next.run(request).await)
}
```

The handler takes the bet as `Json<BetRequest>`. In axum the middleware runs as soon as the **request headers** arrive, but the JSON body is only read later, when the handler's extractor runs.

So the check "is betting open?" happens at header time, while the bet itself (which horse, how much) is decided at body time. If we send the headers while betting is open and **hold the body back**, we can wait until the race is almost over and then choose the horse that is clearly winning. The title is the hint: hold your horses (bytes).

## Exploit

1. Poll `GET /api/state` once per second.
2. When `timer` is between 25 and 28, open a raw TCP connection and send only the headers of `POST /api/bet` with a fixed `Content-Length`.
3. Keep watching the race. When the leading horse reaches about 85, send the body: `{"horse": <leader>, "amount": <all points>}`.
4. Since the body length must match `Content-Length` exactly, the JSON is padded with spaces (JSON allows whitespace).
5. Repeat for 6 races, then read the flag from `vip`.

Core idea in Python:

```python
s = socket.create_connection((HOST, PORT))
s.sendall(b"POST /api/bet HTTP/1.1\r\nHost: x\r\n"
          b"Content-Type: application/json\r\n"
          b"Content-Length: 64\r\n\r\n")   # betting is still open here
# ... wait until the leader is close to the finish line ...
body = json.dumps({"horse": leader, "amount": points}).ljust(64).encode()
s.sendall(body)                              # bet decided now
```

All 6 bets won: 10 → 20 → 40 → 80 → 160 → 320 → 640 points, and the `vip` field returned the flag. Requests were kept to about one per second.

## Flag

`PP{h0ld_y0ur_byt3s_n0t_y0ur_h0rs3s::e8KHzo9mPTrc}`

## Takeaway

An authorization or state check in middleware is only valid for the moment it runs. If the decision depends on data that arrives later (the body), the check must happen where that data is used, inside the handler, under the same lock that applies the bet.
