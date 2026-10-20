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

  const linkBtn = (cls, label, url) => {
    const a = el("a", cls, label);
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
      btns.append(linkBtn("btn btn-main", app.download ? t.download : t.soon, app.download));
      if (app.source) btns.append(linkBtn("btn btn-ghost", t.source, app.source));

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
        links.append(...p.links.map((l) => linkBtn(null, `${l.label} ↗`, l.url)));
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

  document.getElementById("yr").textContent = String(new Date().getFullYear());
  apply(detectLang());

  /* Xabar formasi → n8n webhook → Telegram */
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
    if (!SITE.webhookUrl) { show("err", "errOff"); return; }

    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = UI[current].sending;
    try {
      const res = await fetch(SITE.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, lang: current, page: location.href })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      show("ok", "ok");
    } catch {
      show("err", "errSend");
    } finally {
      btn.disabled = false;
      btn.textContent = UI[current].send;
    }
  });
})();
