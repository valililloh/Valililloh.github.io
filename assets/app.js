(() => {
  const LANGS = ["uz", "ru", "en"];
  const STORE_KEY = "lang";
  const { SITE, UI, APPS, PROJECTS } = window;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const readStored = () => {
    try { return localStorage.getItem(STORE_KEY); } catch { return null; }
  };
  const writeStored = (v) => {
    try { localStorage.setItem(STORE_KEY, v); } catch { /* storage unavailable */ }
  };

  const detectLang = () => {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(fromUrl)) return fromUrl;
    const stored = readStored();
    if (LANGS.includes(stored)) return stored;
    const nav = (navigator.language || "").slice(0, 2).toLowerCase();
    if (nav === "ru") return "ru";
    if (nav === "en") return "en";
    return "uz";
  };

  const linkBtn = (cls, label, url, ev) => {
    const a = el("a", cls, label);
    if (ev) a.dataset.ev = ev;
    if (url) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.setAttribute("aria-disabled", "true");
    }
    return a;
  };

  const renderApps = (lang, t) => {
    const box = document.getElementById("apps");
    box.replaceChildren(...APPS.map((app) => {
      const card = el("article", "app");
      const top = el("div", "app-top");
      top.append(el("div", app.alt ? "app-icon alt" : "app-icon", app.icon));
      const head = el("div");
      head.append(el("h3", null, app.name[lang]), el("p", "tagline", app.tagline[lang]));
      top.append(head);

      const list = el("ul");
      list.append(...app.features[lang].map((f) => el("li", null, f)));

      const btns = el("div", "btns");
      btns.append(linkBtn("btn btn-main", app.download ? t.download : t.soon, app.download, `dl:${app.id}`));
      if (app.source) btns.append(linkBtn("btn btn-ghost", t.source, app.source, `src:${app.id}`));

      card.append(top, el("p", null, app.about[lang]), list, el("p", "note", app.note[lang]), btns);
      return card;
    }));
  };

  const BADGE = { open: ["badgeOpen", "open"], closed: ["badgeClosed", ""], wip: ["badgeWip", "wip"] };

  const renderProjects = (lang, t) => {
    const box = document.getElementById("projects");
    box.replaceChildren(...PROJECTS.map((p) => {
      const card = el("article", "card");
      const [key, cls] = BADGE[p.status];
      const badges = el("div", "badges");
      badges.append(el("span", `badge ${cls}`.trim(), t[key]));
      if (p.status === "wip") badges.prepend(el("span", "badge", t.badgeClosed));

      const stack = el("div", "stack");
      stack.append(...p.stack.map((s) => el("span", null, s)));

      card.append(badges, el("h3", null, p.name[lang]), el("p", null, p.desc[lang]));
      if (p.links) {
        const links = el("div", "links");
        links.append(...p.links.map((l) => linkBtn(null, `${l.label} ↗`, l.url, `gh:${l.label}`)));
        card.append(links);
      }
      card.append(stack);
      return card;
    }));
  };

  const renderMarquee = (t) => {
    const box = document.getElementById("marquee");
    const nodes = [];
    for (let round = 0; round < 2; round += 1) {
      t.marquee.forEach((item) => {
        nodes.push(document.createTextNode(item));
        nodes.push(el("i", null, "✦"));
      });
    }
    box.replaceChildren(...nodes);
  };

  let current = "uz";

  const apply = (lang) => {
    const t = UI[lang];
    current = lang;
    document.documentElement.lang = lang;
    document.title = t.metaTitle;
    document.querySelector('meta[name="description"]').setAttribute("content", t.metaDesc);
    document.querySelectorAll("[data-t]").forEach((n) => {
      const v = t[n.dataset.t];
      if (v != null) n.textContent = v;
    });
    document.querySelectorAll("[data-tl]").forEach((n) => {
      n.setAttribute("aria-label", t[n.dataset.tl] || "");
      n.title = t[n.dataset.tl] || "";
    });
    document.querySelectorAll("[data-ph]").forEach((n) => {
      n.placeholder = t[n.dataset.ph] || "";
    });
    document.querySelectorAll("[data-lang]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    renderMarquee(t);
    renderApps(lang, t);
    renderProjects(lang, t);
    const st = document.getElementById("status");
    st.textContent = "";
    st.className = "status";
  };

  document.querySelectorAll("[data-lang]").forEach((b) => {
    b.addEventListener("click", () => {
      writeStored(b.dataset.lang);
      apply(b.dataset.lang);
    });
  });

  /* Yorug' / qorong'i rejim: tanlov saqlanadi, tanlanmagan bo'lsa telefon sozlamasiga qaraydi */
  const root = document.documentElement;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const effectiveTheme = () => root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");
  const syncThemeColor = () => {
    const color = effectiveTheme() === "dark" ? "#0c0c10" : "#f6f5f0";
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.removeAttribute("media");
      m.setAttribute("content", color);
    });
  };
  document.getElementById("theme").addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch { /* storage unavailable */ }
    syncThemeColor();
  });
  if (root.getAttribute("data-theme")) syncThemeColor();

  document.getElementById("yr").textContent = String(new Date().getFullYear());
  apply(detectLang());

  /* Tashrif hisobi: vaqt, qancha turgani va IP (serverda). Ism/username yig'ilmaydi.
     O'z tashriflaringizni sanatmaslik uchun bir marta ?notrack=1 bilan oching. */
  const rid = () => Math.random().toString(36).slice(2, 12).padEnd(10, "0");
  const visitorId = () => {
    if (!SITE.apiUrl) return "";
    try {
      if (new URLSearchParams(location.search).get("notrack") === "1") localStorage.setItem("notrack", "1");
      if (localStorage.getItem("notrack") === "1") return "";
      const saved = localStorage.getItem("vid") || "";
      if (/^[a-z0-9]{10}$/.test(saved)) return saved;
      const fresh = rid();
      localStorage.setItem("vid", fresh);
      return fresh;
    } catch { return rid(); }
  };
  const vid = visitorId();

  /* Bosishlar hisobi: data-ev belgili tugma/havolalar (masalan dl:patent, ct:telegram) */
  const sendEvent = (name) => {
    if (!vid) return;
    const payload = JSON.stringify({ name, vid });
    const url = `${SITE.apiUrl}/event`;
    if (navigator.sendBeacon && navigator.sendBeacon(url, payload)) return;
    try { fetch(url, { method: "POST", body: payload, keepalive: true }).catch(() => {}); } catch { /* ignore */ }
  };
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-ev]");
    if (target && target.getAttribute("aria-disabled") !== "true") sendEvent(target.dataset.ev);
  });

  const track = () => {
    if (!vid) return;
    const sid = rid();
    const url = `${SITE.apiUrl}/visit`;
    const body = () => JSON.stringify({ sid, vid, lang: current, ref: document.referrer });
    const ping = () => {
      try { fetch(url, { method: "POST", body: body(), keepalive: true }).catch(() => {}); } catch { /* ignore */ }
    };
    ping();
    const timer = setInterval(() => { if (document.visibilityState === "visible") ping(); }, 15000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && navigator.sendBeacon) navigator.sendBeacon(url, body());
    });
    window.addEventListener("pagehide", () => clearInterval(timer));
  };
  track();

  /* Xabar formasi → site-server → admin panel (+ Telegram) */
  const form = document.getElementById("msgform");
  const status = document.getElementById("status");
  const show = (cls, key) => {
    status.className = `status ${cls}`;
    status.textContent = UI[current][key];
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (data.website) return;
    const payload = {
      name: String(data.name || "").trim(),
      contact: String(data.contact || "").trim(),
      message: String(data.message || "").trim()
    };
    if (!payload.name || !payload.contact || !payload.message) { show("err", "errEmpty"); return; }
    if (!SITE.apiUrl) { show("err", "errOff"); return; }

    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = UI[current].sending;
    try {
      const res = await fetch(`${SITE.apiUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, lang: current, page: location.href })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      show("ok", "ok");
      sendEvent("form:sent");
    } catch {
      show("err", "errSend");
    } finally {
      btn.disabled = false;
      btn.textContent = UI[current].send;
    }
  });
})();
