/* JumpMint — 3D ribbon hero
 * Loaded lazily by site.js after three.js. One canvas, modest geometry,
 * capped pixel density, renders only while visible.
 */
(function () {
  "use strict";
  const host = document.getElementById("hero-scene");
  if (!host || !window.THREE) return;
  const THREE = window.THREE;
  const canvas = host.querySelector("canvas");
  const btnReplay = document.getElementById("replay-jump");
  const btnPause = document.getElementById("pause-motion");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const small = window.matchMedia("(max-width: 860px)").matches || !finePointer;

  const MINT = new THREE.Color("#69f4b5").convertSRGBToLinear(); // vertex colours are linear
  const MINT_DEEP = new THREE.Color("#1f8f63").convertSRGBToLinear();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    host.dataset.state = "error";
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  // No tone mapping: keeps the brand mint accurate.

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  camera.position.set(0, 0.35, 7.4);
  camera.lookAt(0, 0.05, 0);

  // ---------- Lighting: restrained, one key, a mint rim ----------
  scene.add(new THREE.HemisphereLight(0xe6fff2, 0x061210, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(3.5, 5, 4.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x69f4b5, 1.1);
  rim.position.set(-4, 1.5, -3.5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9fd8c4, 0.35);
  fill.position.set(-3, -1, 4);
  scene.add(fill);

  // ---------- Folded ribbon geometry ----------
  function buildRibbon() {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.5, -1.1, 0.0),
      new THREE.Vector3(-1.0, -0.2, 0.3),
      new THREE.Vector3(-0.4, 0.75, 0.2),
      new THREE.Vector3(0.35, 1.1, -0.1),
      new THREE.Vector3(1.0, 0.7, -0.3),
      new THREE.Vector3(1.2, -0.1, -0.1),
      new THREE.Vector3(0.8, -0.75, 0.3),
      new THREE.Vector3(0.1, -0.9, 0.5)
    ], false, "centripetal");

    const SEG = small ? 110 : 180;
    // Rounded-rectangle cross-section: gives the ribbon bevelled edges.
    const HW = 0.34, HT = 0.08, R = 0.065, CS = small ? 3 : 4;
    const prof = [];
    const corners = [[HW - R, HT - R, 0], [-(HW - R), HT - R, 90], [-(HW - R), -(HT - R), 180], [HW - R, -(HT - R), 270]];
    corners.forEach(([cx, cy, a0]) => {
      for (let k = 0; k <= CS; k++) {
        const a = THREE.MathUtils.degToRad(a0 + (k / CS) * 90);
        prof.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
      }
    });
    const P = prof.length;

    // Parallel-transport frames (stable, no Frenet flips)
    const T = [], N = [];
    for (let i = 0; i <= SEG; i++) T.push(path.getTangentAt(i / SEG).normalize());
    const t0 = T[0];
    const seed = Math.abs(t0.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
    N.push(seed.clone().sub(t0.clone().multiplyScalar(seed.dot(t0))).normalize());
    const q = new THREE.Quaternion();
    for (let i = 1; i <= SEG; i++) {
      q.setFromUnitVectors(T[i - 1], T[i]);
      N.push(N[i - 1].clone().applyQuaternion(q).normalize());
    }

    const smooth = (x) => { x = THREE.MathUtils.clamp(x, 0, 1); return x * x * (3 - 2 * x); };
    const positions = [], colors = [], index = [];
    const c = new THREE.Color();
    const rings = [];

    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;
      const p = path.getPointAt(t);
      const B = new THREE.Vector3().crossVectors(T[i], N[i]).normalize();
      // A half twist through the middle is the "fold": the darker underside shows.
      const twist = Math.PI * smooth((t - 0.38) / 0.36);
      const u = B.clone().multiplyScalar(Math.cos(twist)).addScaledVector(N[i], -Math.sin(twist));
      const v = B.clone().multiplyScalar(Math.sin(twist)).addScaledVector(N[i], Math.cos(twist));
      const taper = 0.5 + 0.5 * smooth(t / 0.14) * smooth((1 - t) / 0.14);
      const ring = [];
      for (let j = 0; j < P; j++) {
        const [x, y] = prof[j];
        const pos = p.clone().addScaledVector(u, x * taper).addScaledVector(v, y);
        positions.push(pos.x, pos.y, pos.z);
        c.copy(MINT_DEEP).lerp(MINT, (y / HT + 1) / 2);
        colors.push(c.r, c.g, c.b);
        ring.push(pos);
      }
      rings.push({ p, ring });
    }
    for (let i = 0; i < SEG; i++) {
      for (let j = 0; j < P; j++) {
        const a = i * P + j, b = i * P + ((j + 1) % P), cc = (i + 1) * P + ((j + 1) % P), d = (i + 1) * P + j;
        index.push(a, b, d, b, cc, d);
      }
    }
    // End caps with their own vertices, so their edges stay crisp.
    [rings[0], rings[SEG]].forEach((r, which) => {
      const base = positions.length / 3;
      positions.push(r.p.x, r.p.y, r.p.z);
      colors.push(MINT.r, MINT.g, MINT.b);
      r.ring.forEach((pt) => { positions.push(pt.x, pt.y, pt.z); colors.push(MINT.r, MINT.g, MINT.b); });
      for (let j = 0; j < P; j++) {
        const a = base + 1 + j, b = base + 1 + ((j + 1) % P);
        if (which === 0) index.push(base, b, a); else index.push(base, a, b);
      }
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.setIndex(index);
    g.computeVertexNormals();
    g.computeBoundingBox();
    const center = new THREE.Vector3();
    g.boundingBox.getCenter(center);
    g.translate(-center.x, -center.y, -center.z);
    g.computeBoundingBox();
    return g;
  }

  const geo = buildRibbon();
  const H = geo.boundingBox.max.y - geo.boundingBox.min.y;
  const matOpts = { vertexColors: true, roughness: 0.3, metalness: 0.05, side: THREE.DoubleSide, emissive: 0x0b3a2a, emissiveIntensity: 0.35 };
  const mat = small
    ? new THREE.MeshStandardMaterial(matOpts)
    : new THREE.MeshPhysicalMaterial(Object.assign({ clearcoat: 0.6, clearcoatRoughness: 0.28 }, matOpts));
  const mesh = new THREE.Mesh(geo, mat);

  // rig (height) > squash (scale, pivot at the base) > spin (rotation) > mesh
  const BASE_Y = 0.2;
  const rig = new THREE.Group();
  const squash = new THREE.Group();
  const spin = new THREE.Group();
  squash.position.y = -H / 2;
  spin.position.y = H / 2;
  spin.rotation.set(0.08, -0.25, 0);
  spin.add(mesh); squash.add(spin); rig.add(squash); scene.add(rig);

  // ---------- Soft ground shadow (blob texture, no shadow maps) ----------
  const sc = document.createElement("canvas");
  sc.width = sc.height = 128;
  const sctx = sc.getContext("2d");
  const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  // dark core with a faint mint floor glow, so the shadow reads on a dark page
  grad.addColorStop(0, "rgba(0,0,0,0.85)");
  grad.addColorStop(0.35, "rgba(0,0,0,0.45)");
  grad.addColorStop(0.6, "rgba(105,244,181,0.10)");
  grad.addColorStop(1, "rgba(105,244,181,0)");
  sctx.fillStyle = grad; sctx.fillRect(0, 0, 128, 128);
  const shadowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false, opacity: 0.8 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.6), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = BASE_Y - H / 2 - 0.04;
  scene.add(shadow);

  // ---------- Intro: rise, crouch, jump, land, rebound (~2.1 s) ----------
  const INTRO = 2.1;
  const ease = {
    outCubic: (k) => 1 - Math.pow(1 - k, 3),
    inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
  };
  const seg = (e, a, b) => THREE.MathUtils.clamp((e - a) / (b - a), 0, 1);
  const lerp = THREE.MathUtils.lerp;

  function introPose(e) {
    let y = 0, sy = 1, grow = 1, turn = 0;
    if (e < 0.55) { // rise out of the ground
      const k = ease.outCubic(seg(e, 0, 0.55));
      grow = lerp(0.25, 1, k); y = lerp(-0.7, 0, k);
    } else if (e < 0.72) { // crouch before the jump
      sy = 1 - 0.12 * Math.sin(seg(e, 0.55, 0.72) * Math.PI / 2);
    } else if (e < 1.28) { // airborne
      const k = seg(e, 0.72, 1.28);
      y = 0.85 * 4 * k * (1 - k);
      sy = k < 0.2 ? lerp(0.88, 1.1, k / 0.2) : k < 0.5 ? lerp(1.1, 1, (k - 0.2) / 0.3) : lerp(1, 1.05, (k - 0.5) / 0.5);
      turn = 0.55 * ease.inOut(k);
    } else if (e < 1.42) { // land and squash
      const k = seg(e, 1.28, 1.42);
      sy = lerp(1.05, 0.82, Math.sin(k * Math.PI / 2));
      turn = 0.55;
    } else { // rebound and settle
      const tau = e - 1.42;
      sy = 1 - 0.18 * Math.exp(-7 * tau) * Math.cos(16 * tau);
      turn = 0.55 * (1 - ease.inOut(seg(e, 1.42, INTRO)));
    }
    return { y, sy, grow, turn };
  }

  // ---------- State ----------
  let introStart = reduceMotion ? -Infinity : performance.now();
  let paused = false;
  let visible = true;
  let idleTime = 0;
  let last = performance.now();
  let raf = 0;
  let firstFrame = true;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

  if (reduceMotion) btnPause.hidden = true; // nothing moves continuously

  function introActive(now) { return now - introStart < INTRO * 1000; }
  function tiltSettling() { return Math.abs(tilt.x - tilt.tx) > 0.0005 || Math.abs(tilt.y - tilt.ty) > 0.0005; }
  function wantsLoop(now) { return visible && (introActive(now) || (!paused && !reduceMotion) || tiltSettling()); }

  function tick(now) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    const e = (now - introStart) / 1000;
    const pose = e < INTRO ? introPose(Math.max(0, e)) : { y: 0, sy: 1, grow: 1, turn: 0 };

    if (!paused && !reduceMotion && e >= INTRO) idleTime += dt;
    const bob = reduceMotion ? 0 : 0.05 * Math.sin(idleTime * 1.6) * Math.min(1, idleTime);
    const sway = reduceMotion ? 0 : 0.16 * Math.sin(idleTime * 0.55);

    const k = 1 - Math.pow(0.001, dt); // frame-rate independent smoothing
    tilt.x += (tilt.tx - tilt.x) * k;
    tilt.y += (tilt.ty - tilt.y) * k;

    rig.position.y = BASE_Y + pose.y + bob;
    const sxz = 1 / Math.sqrt(pose.sy);
    squash.scale.set(sxz * pose.grow, pose.sy * pose.grow, sxz * pose.grow);
    spin.rotation.y = -0.25 + pose.turn + sway + tilt.y;
    spin.rotation.x = 0.08 + tilt.x;

    const height = Math.max(0, pose.y + bob);
    const s = (1 - 0.3 * Math.min(1, height / 0.85)) * pose.grow;
    shadow.scale.set(s, s, 1);
    shadowMat.opacity = 0.8 * (1 - 0.45 * Math.min(1, height / 0.85)) * pose.grow;

    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; host.dataset.state = "ready"; }
    if (wantsLoop(now)) raf = requestAnimationFrame(tick);
  }
  function kick() {
    if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  // ---------- Sizing ----------
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole sculpture (and its jump) in frame on narrow boxes
    camera.position.z = camera.aspect < 1 ? 7.4 / Math.max(camera.aspect, 0.6) : 7.4;
    camera.updateProjectionMatrix();
    kick();
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
  else window.addEventListener("resize", resize);
  resize();

  // ---------- Pointer tilt (desktop only; no touch handlers, so scrolling is untouched) ----------
  if (finePointer && !reduceMotion) {
    window.addEventListener("pointermove", (ev) => {
      if (ev.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      const nx = THREE.MathUtils.clamp((ev.clientX - (r.left + r.width / 2)) / (r.width), -1, 1);
      const ny = THREE.MathUtils.clamp((ev.clientY - (r.top + r.height / 2)) / (r.height), -1, 1);
      tilt.ty = nx * 0.45;
      tilt.tx = ny * 0.18;
      kick();
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { tilt.tx = 0; tilt.ty = 0; kick(); });
  }

  // ---------- Controls ----------
  btnReplay.addEventListener("click", () => {
    introStart = performance.now();
    kick();
  });
  btnPause.addEventListener("click", () => {
    paused = !paused;
    btnPause.setAttribute("aria-pressed", String(paused));
    btnPause.querySelector("span").textContent = paused ? "Play motion" : "Pause motion";
    btnPause.querySelector("svg").innerHTML = paused
      ? '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/>'
      : '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';
    kick();
  });

  // ---------- Only render when on screen and the tab is visible ----------
  let onScreen = true;
  function updateVisible() {
    visible = onScreen && !document.hidden;
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (visible) kick();
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; updateVisible(); }).observe(host);
  }
  document.addEventListener("visibilitychange", updateVisible);

  canvas.addEventListener("webglcontextlost", (ev) => {
    ev.preventDefault();
    if (raf) cancelAnimationFrame(raf);
    raf = 0; visible = false;
    host.dataset.state = "error";
  });

  kick();
})();
