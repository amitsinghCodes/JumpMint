/* JumpMint — page content, reveals, and lazy 3D loading */
(function () {
  "use strict";
  const cfg = window.JUMPMINT_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- helpers ----------
  const $ = (sel) => document.querySelector(sel);
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    children.flat().forEach((c) => c != null && node.append(c));
    return node;
  }
  // Only real http(s) or mailto links count. Anything else is treated as missing.
  function safeUrl(u) {
    if (typeof u !== "string" || !u.trim()) return "";
    try {
      const url = new URL(u.trim(), location.href);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
    } catch (e) { return ""; }
  }
  function get(obj, path) { return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj); }

  // ---------- brand text & logo ----------
  document.querySelectorAll("[data-cfg]").forEach((node) => {
    const v = get(cfg, node.dataset.cfg);
    if (typeof v === "string" && v.trim()) node.textContent = v;
  });
  const logo = cfg.brand && cfg.brand.logo;
  if (logo) {
    const img = new Image();
    img.onload = () => {
      const link = $("#brand-link");
      link.replaceChildren(el("img", { src: logo, alt: (cfg.brand.name || "JumpMint") }));
      $("#scene-fallback-img").src = logo;
    };
    img.src = logo;
  }
  $("#year").textContent = new Date().getFullYear();

  // ---------- nav border on scroll ----------
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Games & Apps ----------
  const STATUS = {
    released: "Available on Google Play",
    testing: "In testing",
    development: "In development"
  };
  const PLAY_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M4 3.5v17a1 1 0 0 0 1.5.86l14.2-8.5a1 1 0 0 0 0-1.72L5.5 2.64A1 1 0 0 0 4 3.5z"/></svg>';

  function renderApps() {
    const list = $("#apps-list");
    const apps = (cfg.apps || []).filter((a) => a && a.name);
    list.replaceChildren();
    if (!apps.length) {
      list.append(el("div", { class: "empty-state reveal" },
        el("strong", { text: "First release in development" }),
        "The first JumpMint game is being built right now. It will appear here when it's ready to play."));
      return;
    }
    apps.forEach((app) => {
      const shots = (app.screenshots || []).filter(Boolean);
      const media = el("div", { class: "app-media" });
      if (shots.length) {
        media.append(el("img", { src: shots[0], alt: app.name + " screenshot 1", loading: "lazy" }));
      } else {
        media.append(el("div", { class: "media-empty" },
          el("span", { "aria-hidden": "true", text: app.name.trim().charAt(0) }),
          el("span", { text: "Screenshots coming soon" })));
      }
      const mediaCol = el("div", {}, media);
      if (shots.length > 1) {
        // Every screenshot gets a thumbnail button that swaps it into the large frame.
        const thumbs = el("div", { class: "app-thumbs" });
        shots.forEach((s, i) => {
          const b = el("button", {
            type: "button", class: "thumb",
            "aria-label": "Show " + app.name + " screenshot " + (i + 1),
            "aria-pressed": String(i === 0)
          }, el("img", { src: s, alt: "", loading: "lazy" }));
          b.addEventListener("click", () => {
            thumbs.querySelectorAll(".thumb").forEach((t) => t.setAttribute("aria-pressed", String(t === b)));
            showShot(media, s, app.name + " screenshot " + (i + 1));
          });
          thumbs.append(b);
        });
        mediaCol.append(thumbs);
      }

      const status = STATUS[app.status] ? app.status : "development";
      const body = el("div", { class: "app-body" },
        el("span", { class: "status", "data-status": status, text: STATUS[status] }),
        el("h3", { text: app.name }),
        app.description ? el("p", { text: app.description }) : null);

      const stats = (app.stats || []).filter((st) => st && Number.isFinite(st.value) && st.label);
      if (stats.length) {
        body.append(el("dl", { class: "stats" }, stats.map((st) =>
          el("div", { class: "stat" },
            el("dt", { text: st.label }),
            el("dd", { "data-count": String(st.value), text: String(st.value) })))));
      }

      const playUrl = safeUrl(app.playStoreUrl);
      if (playUrl) {
        const a = el("a", { class: "btn btn-primary", href: playUrl, target: "_blank", rel: "noopener" });
        a.innerHTML = PLAY_ICON;
        a.append(" Get it on Google Play");
        a.setAttribute("aria-label", "Get " + app.name + " on Google Play (opens in a new tab)");
        body.append(a);
      } else if (status !== "released") {
        body.append(el("span", { class: "status-note", text: "Google Play link coming at launch." }));
      }
      list.append(el("article", { class: "app reveal" }, mediaCol, body));
    });
  }

  // Crossfade a new screenshot over the current one.
  function showShot(media, src, alt) {
    const current = media.querySelector("img:last-of-type");
    if (current && current.getAttribute("src") === src) return;
    const img = el("img", { src: src, alt: alt, class: "shot-in" });
    const done = () => {
      media.querySelectorAll("img").forEach((n) => n !== img && n.remove());
      img.classList.remove("shot-in");
    };
    img.addEventListener("animationend", done, { once: true });
    media.append(img);
    if (reduceMotion || document.documentElement.classList.contains("motion-off")) done();
  }

  // ---------- Watch ----------
  function youtubeId(url) {
    const m = String(url || "").match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : "";
  }
  function renderWatch() {
    const box = $("#watch-content");
    const yt = cfg.youtube || {};
    const channel = safeUrl(yt.channelUrl);
    const videos = (yt.videos || []).map((v) => ({ title: (v && v.title) || "JumpMint video", id: youtubeId(v && v.url) })).filter((v) => v.id);
    box.replaceChildren();

    if (videos.length) {
      const grid = el("div", { class: "videos" });
      videos.forEach((v) => {
        const frame = el("div", { class: "video-frame" });
        const btn = el("button", { class: "video-play", type: "button", "aria-label": "Play video: " + v.title });
        btn.append(el("img", { src: "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg", alt: "", loading: "lazy" }));
        const icon = el("span", { class: "play-icon" });
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="#091715" aria-hidden="true"><path d="M6 4v16l14-8z"/></svg>';
        btn.append(icon);
        // The YouTube player loads only after the visitor presses play.
        btn.addEventListener("click", () => {
          const iframe = el("iframe", {
            src: "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0",
            title: v.title,
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: ""
          });
          frame.replaceChildren(iframe);
          iframe.focus();
        });
        frame.append(btn);
        grid.append(el("figure", { class: "video reveal" }, frame, el("figcaption", { text: v.title })));
      });
      box.append(grid);
    } else {
      box.append(el("div", { class: "empty-state reveal" },
        el("strong", { text: channel ? "Videos coming soon" : "Channel launching soon" }),
        channel ? "New gameplay videos will show up here." : "The JumpMint gaming channel is getting ready. First videos coming soon."));
    }
    if (channel) {
      const wrap = el("div", { class: "reveal", style: "margin-top:1.5rem" });
      wrap.append(el("a", { class: "btn btn-secondary", href: channel, target: "_blank", rel: "noopener", text: "Visit the channel on YouTube" }));
      box.append(wrap);
    }
  }

  // ---------- Footer ----------
  function renderFooter() {
    const ul = $("#footer-links");
    const labels = { youtube: "YouTube", instagram: "Instagram", x: "X", discord: "Discord", github: "GitHub" };
    const email = (cfg.contactEmail || "").trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ul.prepend(el("li", {}, el("a", { href: "mailto:" + email, text: email })));
    }
    Object.entries(cfg.social || {}).forEach(([k, v]) => {
      const url = safeUrl(v);
      if (url) ul.append(el("li", {}, el("a", { href: url, target: "_blank", rel: "noopener", text: labels[k] || k })));
    });
  }

  renderApps();
  renderWatch();
  renderFooter();

  // Scroll reveals, hero intro and the rest of the motion live in assets/motion.js.

  // ---------- Lazy 3D hero ----------
  const scene = $("#hero-scene");
  function webglAvailable() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.append(s);
    });
  }
  function fail() { scene.dataset.state = "error"; }

  const THREE_SOURCES = [
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    "https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js"
  ];
  async function load3D() {
    if (!webglAvailable()) return fail();
    for (const src of THREE_SOURCES) {
      try { await loadScript(src); if (window.THREE) break; } catch (e) { /* try next */ }
    }
    if (!window.THREE) return fail();
    try { await loadScript("assets/hero3d.js"); } catch (e) { fail(); }
  }

  let started = false;
  function startWhenIdle() {
    if (started) return; started = true;
    const go = () => load3D();
    if ("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 1200 }); else setTimeout(go, 200);
  }
  // Start once the page has loaded and the hero scene is near the viewport.
  function arm() {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) { io.disconnect(); startWhenIdle(); }
      }, { rootMargin: "300px" });
      io.observe(scene);
    } else startWhenIdle();
  }
  if (document.readyState === "complete") arm(); else window.addEventListener("load", arm);
})();
