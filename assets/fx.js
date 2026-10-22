/* Animatsiyalar: kirish ekrani, sarlavha harflari, aylantirishga bog'langan sahnalar,
   "yulduzli tun" uslubidagi fon va 3D halqa. Kutubxonasiz. */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const smooth = (a, b, v) => clamp((v - a) / (b - a));

  /* ---------- 1. Kirish ekrani "KH." ---------- */
  const loader = $("loader");
  let seen = false;
  try { seen = sessionStorage.getItem("introSeen") === "1"; sessionStorage.setItem("introSeen", "1"); } catch { /* ignore */ }
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add("out");
    setTimeout(() => loader.remove(), 1000);
    riseHero();
  };
  if (reduce) { if (loader) loader.remove(); } else setTimeout(hideLoader, seen ? 350 : 1500);

  /* ---------- 2. Sarlavha harflari pastdan ko'tariladi ---------- */
  const splitHero = () => {
    document.querySelectorAll(".ht").forEach((h) => {
      const text = h.textContent;
      h.setAttribute("aria-label", text);
      h.replaceChildren(...[...text].map((ch, i) => {
        const s = document.createElement("span");
        s.className = "c";
        s.setAttribute("aria-hidden", "true");
        s.textContent = ch === " " ? " " : ch;
        s.style.transitionDelay = `${i * 35}ms`;
        if (!reduce && loader && loader.isConnected) s.style.setProperty("--y", "110%");
        return s;
      }));
    });
  };
  const riseHero = () => document.querySelectorAll(".ht .c").forEach((c) => c.style.setProperty("--y", "0%"));

  /* Katta sarlavhalar ekran kengligiga sig'diriladi (tildan qat'i nazar) */
  const fitText = () => {
    document.querySelectorAll(".ht, .talk-title, .about-title").forEach((n) => {
      n.style.fontSize = "";
      const max = parseFloat(getComputedStyle(n).fontSize);
      const ps = getComputedStyle(n.parentElement);
      const avail = n.parentElement.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight) - (n.classList.contains("about-title") ? 32 : 0);
      const need = n.scrollWidth;
      if (need > avail && avail > 0) n.style.fontSize = `${Math.floor(max * (avail / need) * 0.98)}px`;
    });
    /* telefonda portret sarlavhaning ikkinchi qatoriga chiqib turishi uchun */
    const ht = document.querySelector(".ht-a");
    if (ht) document.querySelector(".hero-title").style.setProperty("--tt", `${Math.round(ht.offsetHeight * 1.3)}px`);
  };

  /* ---------- 3. Ko'rinishga kirganda paydo bo'lish ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  const armReveals = () => {
    if (reduce || !io) return;
    document.querySelectorAll(".rv").forEach((n) => {
      if (n.getBoundingClientRect().top > innerHeight) { n.classList.add("pre"); io.observe(n); }
    });
  };

  /* ---------- 4. 3D halqa geometriyasi ---------- */
  const ring = $("ring");
  const layoutRing = () => {
    if (!ring) return;
    const cards = [...ring.children];
    const n = cards.length || 1;
    const cw = Math.round(Math.min(210, innerWidth * 0.42));
    const ch = Math.round(cw * 1.32);
    const radius = Math.round((cw / 2) / Math.tan(Math.PI / n) * 1.18);
    ring.style.setProperty("--cw", `${cw}px`);
    ring.style.setProperty("--chh", `${ch}px`);
    cards.forEach((c, i) => { c.style.transform = `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`; });
  };

  /* ---------- 5. Aylantirishga bog'langan sahnalar ---------- */
  const sections = {
    hero: document.querySelector(".hero"),
    about: $("about"), card: $("aboutCard"),
    path: $("path"), ghost: $("ghost"),
    ringZone: $("ringZone"),
    talk: document.querySelector(".talk-title")
  };
  const progress = (elm) => {
    const r = elm.getBoundingClientRect();
    const dist = r.height - innerHeight;
    return dist > 0 ? clamp(-r.top / dist) : clamp(1 - r.top / innerHeight);
  };
  let drift = 0;
  const update = () => {
    const vh = innerHeight;
    if (sections.hero) {
      const r = sections.hero.getBoundingClientRect();
      sections.hero.style.setProperty("--hp", clamp(-r.top / r.height).toFixed(3));
    }
    if (sections.about && sections.card) {
      const p = progress(sections.about);
      sections.card.style.setProperty("--s", (0.42 + 0.58 * ease(smooth(0, 0.55, p))).toFixed(4));
      sections.card.style.setProperty("--o", ease(smooth(0.5, 0.82, p)).toFixed(3));
    }
    if (sections.path) {
      const p = progress(sections.path);
      const track = sections.path.querySelector(".roles-track");
      if (track) track.style.setProperty("--rx", `${(-p * Math.max(0, track.scrollWidth / 2)).toFixed(1)}px`);
      if (sections.ghost) sections.ghost.style.setProperty("--gx", `${(-p * Math.max(0, sections.ghost.scrollWidth - innerWidth)).toFixed(1)}px`);
      sections.path.querySelectorAll(".timeline li").forEach((li, i) => {
        li.style.setProperty("--to", ease(smooth(0.12 + i * 0.16, 0.26 + i * 0.16, p)).toFixed(3));
      });
    }
    if (sections.ringZone && ring) {
      const p = progress(sections.ringZone);
      ring.style.setProperty("--rot", `${(-p * 300 - drift).toFixed(2)}deg`);
    }
    document.querySelectorAll(".app").forEach((a) => {
      const r = a.getBoundingClientRect();
      a.style.setProperty("--r", (1 - ease(smooth(vh, vh * 0.55, r.top))).toFixed(3));
    });
    if (sections.talk) {
      const r = sections.talk.getBoundingClientRect();
      sections.talk.style.setProperty("--tp", ease(smooth(vh, vh * 0.45, r.top)).toFixed(3));
    }
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  };
  if (!reduce) {
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => { layoutRing(); fitText(); onScroll(); });
    /* halqa sekin o'z-o'zidan ham aylanadi, faqat ekranda bo'lsa */
    let ringVisible = false;
    if (io && sections.ringZone) new IntersectionObserver(([e]) => { ringVisible = e.isIntersecting; }).observe(sections.ringZone);
    const spin = () => { if (ringVisible) { drift += 0.06; onScroll(); } requestAnimationFrame(spin); };
    requestAnimationFrame(spin);
  }

  /* ---------- 6. "Yulduzli tun" uslubidagi oq-qora fon ---------- */
  const canvas = $("swirl");
  const startSwirl = () => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, parts = [], stars = [], city = [], running = false;

    const rand = (a, b) => a + Math.random() * (b - a);
    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, w, h);
      const m = Math.min(w, h);
      stars = [
        { x: w * 0.78, y: h * 0.18, r: m * 0.11, k: 1.0 },
        { x: w * 0.22, y: h * 0.26, r: m * 0.08, k: -0.8 },
        { x: w * 0.52, y: h * 0.42, r: m * 0.16, k: 1.3 },
        { x: w * 0.9, y: h * 0.55, r: m * 0.06, k: -0.6 },
        { x: w * 0.1, y: h * 0.58, r: m * 0.07, k: 0.7 }
      ];
      const count = Math.round(clamp((w * h) / 1400, 300, 1100));
      parts = Array.from({ length: count }, () => ({ x: rand(0, w), y: rand(0, h * 0.82), life: rand(40, 160) }));
      /* minorali shahar silueti */
      city = [];
      let x = -10;
      while (x < w + 10) {
        const bw = rand(14, 46);
        const bh = rand(h * 0.06, h * 0.16);
        const spire = Math.random() < 0.28 ? rand(h * 0.08, h * 0.22) : 0;
        city.push({ x, w: bw, h: bh, spire });
        x += bw + rand(-4, 6);
      }
    };
    const field = (x, y) => {
      let vx = 0.55 + Math.sin(y * 0.012) * 0.35, vy = Math.sin(x * 0.01 + y * 0.004) * 0.25;
      stars.forEach((s) => {
        const dx = x - s.x, dy = y - s.y;
        const d2 = dx * dx + dy * dy + 60;
        const f = (s.k * s.r * s.r) / d2;
        vx += -dy * f * 0.035; vy += dx * f * 0.035;
      });
      const len = Math.hypot(vx, vy) || 1;
      return [vx / len, vy / len];
    };
    const drawCity = () => {
      ctx.fillStyle = "#050505";
      const base = h;
      city.forEach((b) => {
        ctx.fillRect(b.x, base - b.h, b.w, b.h);
        if (b.spire) {
          ctx.beginPath();
          ctx.moveTo(b.x + b.w * 0.2, base - b.h);
          ctx.lineTo(b.x + b.w / 2, base - b.h - b.spire);
          ctx.lineTo(b.x + b.w * 0.8, base - b.h);
          ctx.fill();
        }
      });
      /* derazalardagi kichik chiroqlar */
      ctx.fillStyle = "rgba(242,240,235,.35)";
      city.forEach((b, i) => { if (i % 3 === 0) ctx.fillRect(b.x + b.w * 0.4, base - b.h * 0.6, 2, 3); });
    };
    const frame = (steps) => {
      ctx.fillStyle = "rgba(10,10,10,0.045)";
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = "rgba(242,240,235,0.32)";
      for (let k = 0; k < steps; k += 1) {
        ctx.beginPath();
        parts.forEach((p) => {
          const [vx, vy] = field(p.x, p.y);
          const nx = p.x + vx * 1.8, ny = p.y + vy * 1.8;
          ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny);
          p.x = nx; p.y = ny; p.life -= 1;
          if (p.life < 0 || p.x < -5 || p.x > w + 5 || p.y < -5 || p.y > h * 0.86) {
            p.x = rand(-5, w * 0.3); p.y = rand(0, h * 0.82); p.life = rand(60, 180);
            if (Math.random() < 0.6) p.x = rand(0, w);
          }
        });
        ctx.stroke();
      }
      /* yulduzlar atrofidagi yorug'lik */
      stars.forEach((s) => {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 0.5);
        g.addColorStop(0, "rgba(255,255,255,0.10)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.5, 0, Math.PI * 2); ctx.fill();
      });
      drawCity();
    };
    const loop = () => { if (!running) return; frame(1); requestAnimationFrame(loop); };
    setup();
    if (reduce) { for (let i = 0; i < 160; i += 1) frame(1); return; }
    for (let i = 0; i < 60; i += 1) frame(1);
    new IntersectionObserver(([e]) => {
      const was = running;
      running = e.isIntersecting;
      if (running && !was) requestAnimationFrame(loop);
    }).observe(canvas);
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { setup(); for (let i = 0; i < 60; i += 1) frame(1); }, 200); });
  };

  /* ---------- Ishga tushirish ---------- */
  const init = () => {
    splitHero();
    fitText();
    layoutRing();
    armReveals();
    update();
  };
  init();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitText);
  startSwirl();
  if (loader && !loader.isConnected) riseHero();
  /* til almashganda matnlar qayta chiziladi */
  document.addEventListener("site:rendered", () => {
    init();
    riseHero();
  });
})();
