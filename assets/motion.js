/* JumpMint — site motion: hero intro, scroll reveals, progress, parallax,
 * magnetic buttons, card tilt, counters, nav indicator and the motion switch.
 * Loaded after site.js so the Games & Apps and Watch content already exists.
 * Everything is visible without this file; it only adds movement. */
(function () {
  "use strict";
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------- Motion switch (remembered per browser) ----------
  const KEY = "jumpmint-motion";
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  let motionOn = !reduceMotion && stored() !== "off";

  const toggle = $("#motion-toggle");
  const heroPause = $("#pause-motion");
  function heroPaused() { return heroPause && heroPause.getAttribute("aria-pressed") === "true"; }
  function applyMotion(syncHero) {
    root.classList.toggle("motion-off", !motionOn);
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(motionOn));
      toggle.querySelector("span").textContent = motionOn ? "Motion on" : "Motion off";
    }
    // Keep the 3D ribbon's own pause button in step with the site switch.
    if (syncHero && heroPause && heroPaused() === motionOn) heroPause.click();
  }
  if (reduceMotion) {
    if (toggle) toggle.hidden = true;
  } else {
    if (toggle) toggle.addEventListener("click", () => {
      motionOn = !motionOn;
      store(motionOn ? "on" : "off");
      applyMotion(true);
    });
    // Pausing the ribbon from its own button pauses the rest of the site too.
    if (heroPause) heroPause.addEventListener("click", () => {
      setTimeout(() => {
        if (heroPaused() === motionOn) { motionOn = !heroPaused(); store(motionOn ? "on" : "off"); applyMotion(false); }
      }, 0);
    });
    // The ribbon loads later; pause it on arrival if motion is off.
    const scene = $("#hero-scene");
    if (scene && "MutationObserver" in window) {
      new MutationObserver(() => {
        if (scene.dataset.state === "ready" && !motionOn && !heroPaused()) heroPause.click();
      }).observe(scene, { attributes: true, attributeFilter: ["data-state"] });
    }
  }
  applyMotion(false);

  // Everything below is decorative; skip it when the visitor asks for less motion.
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  root.classList.add("js-motion");
  const live = () => motionOn;

  // ---------- Hero headline: split into words that rise in ----------
  const title = $("#hero-title");
  if (title) {
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.replaceChildren(...text.split(/\s+/).flatMap((word, i, all) => {
      const mask = document.createElement("span");
      mask.className = "w";
      mask.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.textContent = word;
      inner.style.setProperty("--i", i);
      mask.append(inner);
      return i < all.length - 1 ? [mask, " "] : [mask];
    }));
  }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("intro")));

  // ---------- Scroll reveals, staggered within each group ----------
  const groups = new Map();
  $$(".reveal").forEach((n) => {
    const parent = n.parentElement;
    const i = groups.get(parent) || 0;
    groups.set(parent, i + 1);
    n.style.setProperty("--d", (i * 90) + "ms");
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
      // Headings wipe in from a full clip, which the observer can't see, so
      // they are revealed through their container instead.
      e.target.querySelectorAll("h2").forEach((h) => h.classList.add("in"));
      e.target.querySelectorAll("[data-count]").forEach(countUp);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$(".reveal:not(#about-title), .about-grid").forEach((n) => io.observe(n));

  // ---------- Counters ----------
  function countUp(dd) {
    const target = Number(dd.dataset.count);
    if (!live() || !Number.isFinite(target)) return;
    const start = performance.now(), dur = 1400;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      dd.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 4))));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- Scroll progress, parallax and nav indicator ----------
  const bar = $("#scroll-progress");
  const sceneEl = $("#hero-scene");
  const heroCopy = $(".hero-copy");
  const links = $$(".nav-links a[href^='#']");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const indicator = $("#nav-indicator");
  let ticking = false;

  function frame() {
    ticking = false;
    const y = window.scrollY;
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    if (bar) bar.style.transform = "scaleX(" + Math.min(1, y / max) + ")";

    if (live() && y < window.innerHeight * 1.2) {
      if (sceneEl) sceneEl.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
      if (heroCopy) {
        heroCopy.style.transform = "translate3d(0," + (y * -0.06).toFixed(1) + "px,0)";
        heroCopy.style.opacity = String(Math.max(0.25, 1 - y / (window.innerHeight * 0.9)));
      }
    } else if (!live()) {
      if (sceneEl) sceneEl.style.transform = "";
      if (heroCopy) { heroCopy.style.transform = ""; heroCopy.style.opacity = ""; }
    }

    // Highlight the section whose top has passed a third of the screen.
    let active = null;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.35) active = links[i]; });
    if (y + window.innerHeight >= root.scrollHeight - 4 && sections.length) active = links[links.length - 1];
    links.forEach((a) => a.classList.toggle("active", a === active));
    if (indicator) {
      if (active) {
        const r = active.getBoundingClientRect(), pr = active.closest(".nav-main").getBoundingClientRect();
        indicator.style.width = r.width + "px";
        indicator.style.transform = "translateX(" + (r.left - pr.left) + "px)";
        indicator.style.opacity = "1";
      } else indicator.style.opacity = "0";
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();

  // ---------- Pointer effects (mouse only) ----------
  if (!finePointer) return;

  // Magnetic buttons: pulled a little toward the cursor.
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (ev) => {
      if (!live() || ev.pointerType !== "mouse") return;
      const r = b.getBoundingClientRect();
      b.style.setProperty("--mx", ((ev.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
      b.style.setProperty("--my", ((ev.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px");
    });
    b.addEventListener("pointerleave", () => { b.style.removeProperty("--mx"); b.style.removeProperty("--my"); });
  });

  // App cards tilt toward the cursor, with a soft light that follows it.
  $$(".app").forEach((card) => {
    card.addEventListener("pointermove", (ev) => {
      if (!live() || ev.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const nx = (ev.clientX - r.left) / r.width, ny = (ev.clientY - r.top) / r.height;
      card.style.setProperty("--rx", ((0.5 - ny) * 4).toFixed(2) + "deg");
      card.style.setProperty("--ry", ((nx - 0.5) * 5).toFixed(2) + "deg");
      card.style.setProperty("--gx", (nx * 100).toFixed(1) + "%");
      card.style.setProperty("--gy", (ny * 100).toFixed(1) + "%");
      card.classList.add("lit");
    });
    card.addEventListener("pointerleave", () => {
      ["--rx", "--ry"].forEach((p) => card.style.removeProperty(p));
      card.classList.remove("lit");
    });
  });

  // Hero glow follows the cursor.
  const hero = $(".hero");
  if (hero) hero.addEventListener("pointermove", (ev) => {
    if (!live()) return;
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--hx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
    hero.style.setProperty("--hy", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
  });
})();
