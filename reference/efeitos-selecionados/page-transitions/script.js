/**
 * Page Transitions
 * Six transition effects between demo pages — select an effect,
 * then navigate via the fake site buttons.
 */

let currentPage = "home";
let selectedEffect = "circle-portal";
let isAnimating = false;

const preview = document.getElementById("preview");
const stage = document.getElementById("stage");
const pageBadge = document.getElementById("pageBadge");
const cube = document.getElementById("cube");
const pageHome = document.getElementById("pageHome");
const pageGallery = document.getElementById("pageGallery");
const txBtns = document.querySelectorAll(".tx-btn");
const navBtns = document.querySelectorAll(".site-nav__btn");
const portalSparks = document.getElementById("portalSparks");
const portalEmbers = document.getElementById("portalEmbers");
const floodFxEl = document.querySelector(".fx--flood");

/** Mystic portal phase lengths (ms) — keyframes derived in buildPortalKeyframes() */
const PORTAL_PHASES = {
  draw: 900,
  hold: 1500,
  zoomIn: 700,
  atDepth: 180,
  zoomOut: 700,
  close: 400,
};

function portalDuration() {
  const p = PORTAL_PHASES;
  return p.draw + p.hold + p.zoomIn + p.atDepth + p.zoomOut + p.close;
}

function portalSwapAt() {
  const p = PORTAL_PHASES;
  // Swap after zoom-in completes and camera holds — before zoom-out
  return p.draw + p.hold + p.zoomIn + p.atDepth;
}

function portalZoomStartAt() {
  const p = PORTAL_PHASES;
  return p.draw + p.hold;
}

function portalZoomEndAt() {
  const p = PORTAL_PHASES;
  return p.draw + p.hold + p.zoomIn + p.atDepth + p.zoomOut;
}

let portalZoomTimers = [];

function clearPortalZoomTimers() {
  portalZoomTimers.forEach(clearTimeout);
  portalZoomTimers = [];
}

function schedulePortalZoomFreeze() {
  clearPortalZoomTimers();
  portalZoomTimers.push(
    setTimeout(() => preview.classList.add("is-portal-passing"), portalZoomStartAt()),
    setTimeout(() => preview.classList.remove("is-portal-passing"), portalZoomEndAt())
  );
}

/** Transition timing config (ms) */
const TIMING = {
  "glob-wipe":     { duration: 1000, swap: 500 },
  "circle-portal": { duration: portalDuration(), swap: portalSwapAt() },
  "cube-3d":       { duration: 1500, swap: 750 },
  "glitch-swap":   { duration: 600,  swap: 350 },
  "flood":         { duration: 4250, swap: 2500 },
  "flip":          { duration: 900,  swap: 450 },
};

const PAGES = { home: pageHome, gallery: pageGallery };

let floodFx = null;

/* ==========================================================
   FLOOD — canvas liquid fill transition
   Adapted from the Hover Buttons liquid pour effect.
   ========================================================== */
class FloodTransition {
  constructor(container) {
    this.container = container;
    this.canvas = container.querySelector(".flood__canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.fillLevel = 0;
    this.t = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.running = false;
    this.riseMs = 700;
    this.totalMs = 1400;
    this.startTime = 0;
    this.rafId = 0;

    const ro = new ResizeObserver(() => this._resize());
    ro.observe(container);
    this._resize();
  }

  _resize() {
    const { canvas, ctx, container, dpr } = this;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    if (!w || !h) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  start(duration, swapDelay) {
    if (!this.canvas) return;
    this.stop();
    this._resize();
    this.riseMs = swapDelay;
    this.totalMs = duration;
    this.fillLevel = 0;
    this.t = 0;
    this.startTime = performance.now();
    this.running = true;
    this._loop();
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.fillLevel = 0;
    if (this.ctx && this.canvas) {
      const W = this.canvas.width / this.dpr;
      const H = this.canvas.height / this.dpr;
      this.ctx.clearRect(0, 0, W, H);
    }
  }

  _loop() {
    if (!this.running) return;

    const elapsed = performance.now() - this.startTime;
    const drainMs = Math.max(this.totalMs - this.riseMs, 1);
    let draining = false;

    if (elapsed < this.riseMs) {
      const p = elapsed / this.riseMs;
      this.fillLevel = 1 - Math.pow(1 - p, 2.4);
    } else if (elapsed < this.totalMs) {
      draining = true;
      const p = (elapsed - this.riseMs) / drainMs;
      this.fillLevel = Math.pow(1 - p, 1.6);
    } else {
      this.fillLevel = 0;
      this._draw();
      this.running = false;
      return;
    }

    const hasLiquid = this.fillLevel > 0.004;
    if (hasLiquid) {
      const waveSpeed = 0.058 + this.fillLevel * 0.034;
      this.t += draining ? -waveSpeed : waveSpeed;
    }

    this._draw();
    this.rafId = requestAnimationFrame(() => this._loop());
  }

  _draw() {
    const { canvas, ctx, fillLevel, t } = this;
    const dpr = this.dpr;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.clearRect(0, 0, W, H);
    if (fillLevel < 0.004) return;

    const fillY = H * (1 - fillLevel);
    const levelRamp = 0.3 + 0.7 * Math.pow(Math.min(fillLevel / 0.1, 1), 0.9);
    const settleRamp = Math.max(1 - Math.max(fillLevel - 0.9, 0) / 0.1, 0.12);
    const maxAmp = Math.max(H * 0.028, 8);
    const amp = maxAmp * levelRamp * settleRamp;
    const secondary = amp * 0.28 * Math.min(fillLevel / 0.06, 1);
    const steps = Math.max(48, Math.round(W / 7));

    const waveAt = (x) => {
      const travel = t * 3.6;
      const norm = x / W;

      const envelope =
        0.66 +
        0.2 * Math.sin(travel * 0.42 - x * 0.024) +
        0.12 * Math.sin(travel * 0.28 + x * 0.016) +
        0.08 * Math.sin(travel * 0.55 - norm * Math.PI * 5.5);

      const localAmp = amp * envelope;
      const localSec = secondary * (0.7 + 0.3 * Math.sin(travel * 0.48 - x * 0.046));
      const tertiary = amp * 0.16 * Math.sin(travel * 1.05 - x * 0.11);
      const tertiaryGain = 0.55 + 0.45 * Math.sin(travel * 0.18 + x * 0.009);

      return (
        Math.sin(travel - x * 0.078) * localAmp +
        Math.sin(travel * 0.65 - x * 0.034) * localSec +
        tertiary * tertiaryGain
      );
    };

    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, fillY);
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * W;
      ctx.lineTo(x, fillY + waveAt(x));
    }
    ctx.lineTo(W, H);
    ctx.closePath();

    const fillGrad = ctx.createLinearGradient(0, fillY, 0, H);
    fillGrad.addColorStop(0, "rgba(110, 215, 255, 1)");
    fillGrad.addColorStop(0.18, "rgba(55, 168, 245, 1)");
    fillGrad.addColorStop(0.55, "rgba(18, 95, 205, 1)");
    fillGrad.addColorStop(1, "rgba(6, 44, 130, 1)");
    ctx.fillStyle = fillGrad;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * W;
      const y = fillY + waveAt(x);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(190, 240, 255, ${0.35 + fillLevel * 0.25})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/* ==========================================================
   INIT — layout, particles, and event bindings
   ========================================================== */
setCubeDepth();
setPortalSize();
window.addEventListener("resize", () => {
  setCubeDepth();
  setPortalSize();
});
buildPortalParticles();
buildPortalKeyframes();
floodFx = floodFxEl ? new FloodTransition(floodFxEl) : null;
bindEffectButtons();
bindNavButtons();
renderPage(currentPage, true);
preloadPortalImages();

function preloadPortalImages() {
  if (!preview.classList.contains("preview--full")) return;

  [pageHome, pageGallery].forEach((page) => {
    page.querySelectorAll("img").forEach((img) => {
      if (!img.src) return;
      const pre = new Image();
      pre.src = img.src;
      if (pre.decode) {
        pre.decode().catch(() => {});
      }
    });
  });
}

/* --- Cube depth — must equal half stage width to prevent zoom --- */

function setCubeDepth() {
  if (!stage) return;
  const depth = stage.getBoundingClientRect().width / 2;
  preview.style.setProperty("--cube-depth", `${depth}px`);
}

/* ==========================================================
   PORTAL — size, keyframes, and layer swap
   ========================================================== */
function buildPortalKeyframes() {
  const p = PORTAL_PHASES;
  const dur = portalDuration();
  const pct = (ms) => `${((ms / dur) * 100).toFixed(2)}%`;

  const drawEnd = pct(p.draw);
  const drawHide = pct(Math.max(p.draw - 1, 0));
  const holdEnd = pct(p.draw + p.hold);
  const diveEnd = pct(p.draw + p.hold + p.zoomIn);
  const depthEnd = pct(p.draw + p.hold + p.zoomIn + p.atDepth);
  const exitEnd = pct(p.draw + p.hold + p.zoomIn + p.atDepth + p.zoomOut);

  const portalShell = `
    0% { transform: translate3d(0, 0, 2px) scale(1); opacity: 1; }
    ${exitEnd} { transform: translate3d(0, 0, 2px) scale(1); opacity: 1; }
    100% { transform: translate3d(0, 0, 2px) scale(0); opacity: 0; }`;

  const holeLifecycle = `
    0%, ${drawHide} { transform: translate3d(0, 0, 2px) scale(0); opacity: 0; }
    ${drawEnd} { transform: translate3d(0, 0, 2px) scale(1); opacity: 1; }
    ${exitEnd} { transform: translate3d(0, 0, 2px) scale(1); opacity: 1; }
    100% { transform: translate3d(0, 0, 2px) scale(0); opacity: 0; }`;

  const css = `
@keyframes portalRingLifecycle { ${portalShell} }
@keyframes portalHoleFrameLifecycle { ${holeLifecycle} }
@keyframes portalRingDrawSweep {
  0% { --portal-sweep: 0deg; }
  ${drawEnd} { --portal-sweep: 360deg; }
  ${exitEnd} { --portal-sweep: 360deg; }
  100% { --portal-sweep: 360deg; }
}
@keyframes portalGlowReveal {
  0%, ${drawHide} { opacity: 0; visibility: hidden; }
  ${drawEnd} { opacity: 0.85; visibility: visible; }
  ${exitEnd} { opacity: 0.85; visibility: visible; }
  100% { opacity: 0; visibility: hidden; }
}
@keyframes portalCameraPass {
  0%, ${holdEnd} {
    transform: scale3d(1, 1, 1);
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }
  ${diveEnd} {
    transform: scale3d(var(--portal-zoom, 1.65), var(--portal-zoom, 1.65), 1);
    animation-timing-function: linear;
  }
  ${depthEnd} {
    transform: scale3d(var(--portal-zoom, 1.65), var(--portal-zoom, 1.65), 1);
    animation-timing-function: linear;
  }
  ${exitEnd} {
    transform: scale3d(1, 1, 1);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% { transform: scale3d(1, 1, 1); }
}`;

  let el = document.getElementById("portal-keyframes");
  if (!el) {
    el = document.createElement("style");
    el.id = "portal-keyframes";
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function prepPortalTransition(outgoing, incoming) {
  outgoing.classList.add("is-portal-outgoing", "is-portal-back");
  incoming.classList.add("is-portal-incoming", "is-portal-hole");
  outgoing.style.visibility = "visible";
  incoming.style.visibility = "visible";

  const rig = document.querySelector(".portal-camera-rig");
  if (rig) {
    rig.style.transform = "scale3d(1, 1, 1)";
  }

  [outgoing, incoming].forEach((page) => {
    page.style.backfaceVisibility = "hidden";
    page.querySelectorAll("img").forEach((img) => {
      if (!img.complete && img.src) {
        const pre = new Image();
        pre.src = img.src;
        if (img.decode) {
          pre.decode().catch(() => {});
        }
      }
    });
  });
}

function swapPortalLayers(outgoing, incoming) {
  // Swapped flag first — negative animation-delay on the new hole must apply immediately
  preview.classList.add("is-portal-swapped");

  outgoing.classList.remove("is-portal-back");
  outgoing.classList.add("is-portal-hole");
  incoming.classList.remove("is-portal-hole");
  incoming.classList.add("is-portal-back");
  incoming.classList.add("is-active");
  outgoing.classList.remove("is-active");
}

function schedulePortalSwap(outgoing, incoming, targetPage) {
  requestAnimationFrame(() => {
    swapPortalLayers(outgoing, incoming);
    updatePageState(targetPage);
  });
}

function resetPortalFxStyles() {
  const wrap = document.querySelector(".portal-camera-wrap");
  if (wrap) wrap.style.perspective = "";
  document.querySelectorAll(".portal-camera-rig, .fx--portal .portal, .page").forEach((el) => {
    el.style.animation = "";
    el.style.transform = "";
    el.style.opacity = "";
    el.style.clipPath = "";
    el.style.backfaceVisibility = "";
    el.style.willChange = "";
  });
}

function finishPortalTransition(outgoing, incoming, targetPage) {
  clearPortalZoomTimers();
  preview.classList.remove("is-portal-passing");

  outgoing.classList.remove("is-portal-outgoing", "is-portal-back", "is-portal-hole");
  incoming.classList.remove("is-portal-incoming", "is-portal-back", "is-portal-hole");

  pageHome.classList.toggle("is-active", targetPage === "home");
  pageGallery.classList.toggle("is-active", targetPage === "gallery");

  /* One painted frame in final layout before leaving portal mode — avoids home repaint flash */
  preview.classList.add("is-portal-settled");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      preview.classList.remove("is-transitioning", "circle-portal", "is-portal-swapped", "is-portal-settled", "is-portal-passing");
      resetPortalFxStyles();
      resetPageStyles(pageHome, pageGallery);
      isAnimating = false;
      document.body.classList.remove("is-animating");
    });
  });
}

function setPortalSize() {
  if (!stage) return;
  const w = stage.offsetWidth;
  const h = stage.offsetHeight;
  const minSide = Math.min(w, h);
  const isFullPage = preview.classList.contains("preview--full");
  // Full-page: keep the portal compact (demo-sized), not viewport-filling
  const size = isFullPage
    ? Math.min(380, Math.max(260, minSide * 0.4))
    : minSide * 0.92;
  const pad = Math.ceil(size * 0.065 + 14);
  const zoom = isFullPage ? 1.38 : 1.62;
  // Shrink page content inside the hole so the preview shows more of the destination
  const holeScale = Math.max(0.3, Math.min(0.68, (size / Math.max(w, h)) * 1.55));

  preview.style.setProperty("--portal-size", `${size}px`);
  preview.style.setProperty("--portal-pad", `${pad}px`);
  preview.style.setProperty("--portal-zoom", String(zoom));
  preview.style.setProperty("--portal-hole-scale", String(holeScale));
  preview.style.setProperty("--stage-w", `${w}px`);
  preview.style.setProperty("--stage-h", `${h}px`);
}

function getCubeRotation(page) {
  const y = page === "gallery" ? "-90deg" : "0deg";
  return `translateZ(calc(var(--cube-depth) * -1)) rotateY(${y})`;
}

function getFlipRotation(page) {
  return page === "gallery" ? "rotateY(-180deg)" : "rotateY(0deg)";
}

/* --- Mystic portal particles --- */

function buildPortalParticles() {
  buildPortalSparks();
  buildPortalEmbers();
}

function buildPortalSparks() {
  if (!portalSparks) return;
  portalSparks.innerHTML = "";
  const isFullPage = preview.classList.contains("preview--full");
  const count = isFullPage ? 32 : 72;

  for (let i = 0; i < count; i++) {
    const spark = document.createElement("span");
    spark.className = "portal__spark";
    const angle = (i / count) * 360 + (Math.random() * 4 - 2);
    spark.style.setProperty("--a", `${angle}deg`);
    spark.style.setProperty("--len", `${8 + Math.random() * 22}px`);
    spark.style.setProperty("--w", `${1 + Math.random() * 2}px`);
    spark.style.setProperty("--delay", `${(Math.random() * 0.4).toFixed(2)}s`);
    spark.style.setProperty("--tan", `${Math.random() > 0.5 ? 84 : 96}deg`);
    portalSparks.appendChild(spark);
  }
}

function buildPortalEmbers() {
  if (!portalEmbers) return;
  portalEmbers.innerHTML = "";
  const isFullPage = preview.classList.contains("preview--full");
  const count = isFullPage ? 24 : 64;

  for (let i = 0; i < count; i++) {
    const ember = document.createElement("span");
    ember.className = "portal__ember";
    const angle = Math.random() * 360;
    ember.style.setProperty("--a", `${angle}deg`);
    ember.style.setProperty("--fly", `${12 + Math.random() * 48}px`);
    ember.style.setProperty("--drift", `${Math.random() * 16 - 8}px`);
    ember.style.setProperty("--dur", `${0.5 + Math.random() * 0.75}s`);
    ember.style.setProperty("--delay", `${(Math.random() * 0.9).toFixed(2)}s`);
    ember.style.setProperty("--sz", `${2 + Math.random() * 3}px`);
    portalEmbers.appendChild(ember);
  }
}

function resetPortalParticles() {
  if (!portalSparks || !portalEmbers) return;

  [portalSparks, portalEmbers].forEach((layer) => {
    layer.querySelectorAll("span").forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
  });
}

/* ==========================================================
   CUBE & FLIP — prep 3D rotation before animate
   ========================================================== */
function prepCubeTransition(type, targetPage) {
  cube.classList.remove("is-to-gallery", "is-to-home", "is-flip-to-gallery", "is-flip-to-home");

  if (type === "cube-3d") {
    setCubeDepth();
    cube.style.transform = getCubeRotation(currentPage);
    void cube.offsetWidth;
    cube.classList.add(
      currentPage === "home" && targetPage === "gallery" ? "is-to-gallery" : "is-to-home"
    );
    return;
  }

  if (type === "flip") {
    cube.style.transform = getFlipRotation(currentPage);
    void cube.offsetWidth;
    cube.classList.add(
      currentPage === "home" && targetPage === "gallery" ? "is-flip-to-gallery" : "is-flip-to-home"
    );
  }
}

/* ==========================================================
   EFFECT SELECTION — pick transition (does not navigate)
   ========================================================== */
function bindEffectButtons() {
  txBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.transition;
      if (!type || isAnimating) return;
      selectEffect(type);
    });
  });
}

function selectEffect(type) {
  selectedEffect = type;
  txBtns.forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.transition === type);
  });
  updateCodeSnippet();
}

function updateCodeSnippet() {
  const effectEl = document.getElementById("codeSelectedEffect");
  const pageEl = document.getElementById("codeCurrentPage");
  if (effectEl) effectEl.textContent = `"${selectedEffect}"`;
  if (pageEl) pageEl.textContent = `"${currentPage}"`;
}

/* ==========================================================
   SITE NAV — triggers the active transition
   ========================================================== */
function bindNavButtons() {
  navBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = btn.dataset.nav;
      if (!target || isAnimating || target === currentPage) return;
      navigateTo(target);
    });
  });
}

function navigateTo(page) {
  if (page === currentPage || isAnimating) return;
  runTransition(selectedEffect, page);
}

/* ==========================================================
   CORE — runTransition drives every effect
   ========================================================== */
function getDuration(type) {
  return TIMING[type]?.duration ?? 900;
}

function getSwapDelay(type) {
  return TIMING[type]?.swap ?? 450;
}

function runTransition(type, targetPage) {
  if (isAnimating || targetPage === currentPage) return;

  isAnimating = true;
  document.body.classList.add("is-animating");

  const outgoing = PAGES[currentPage];
  const incoming = PAGES[targetPage];

  if (type === "cube-3d" || type === "flip") {
    prepCubeTransition(type, targetPage);
  }

  if (type === "glitch-swap") {
    outgoing.classList.add("is-glitching");
  }

  if (type === "cube-3d") {
    preview.style.setProperty("--cube-dur", `${getDuration(type)}ms`);
  }

  if (type === "circle-portal") {
    setPortalSize();
    preview.style.setProperty("--portal-dur", `${getDuration(type)}ms`);
    preview.style.setProperty("--portal-swap", String(getSwapDelay(type)));
    resetPortalParticles();
    prepPortalTransition(outgoing, incoming);
    schedulePortalZoomFreeze();
  }

  preview.classList.add("is-transitioning", type);

  if (type === "flood" && floodFx) {
    floodFx.start(getDuration(type), getSwapDelay(type));
  }

  setTimeout(() => {
    if (type === "circle-portal") {
      schedulePortalSwap(outgoing, incoming, targetPage);
    } else {
      renderPage(targetPage, false);
    }
  }, getSwapDelay(type));

  setTimeout(() => {
    if (type === "circle-portal") {
      finishPortalTransition(outgoing, incoming, targetPage);
      return;
    }

    preview.classList.remove("is-transitioning", type);

    if (type === "flood" && floodFx) {
      floodFx.stop();
    }

    if (type === "glitch-swap") {
      outgoing.classList.remove("is-glitching");
    }

    if (type === "cube-3d" || type === "flip") {
      cube.classList.remove("is-to-gallery", "is-to-home", "is-flip-to-gallery", "is-flip-to-home");
      cube.style.transform = "";
    }

    resetPageStyles(outgoing, incoming);

    isAnimating = false;
    document.body.classList.remove("is-animating");
  }, getDuration(type));
}

/* ==========================================================
   PAGE STATE — render, reset, and code snippet sync
   ========================================================== */
function updatePageState(page) {
  currentPage = page;
  preview.dataset.page = page;
  if (pageBadge) {
    pageBadge.textContent = page === "home" ? "Home" : "Gallery";
  }

  navBtns.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.nav === page);
  });

  updateCodeSnippet();
}

function resetPageStyles(...pages) {
  pages.forEach((page) => {
    if (!page) return;
    page.style.transform = "";
    page.style.visibility = "";
    page.style.filter = "";
    page.style.clipPath = "";
    page.style.maskImage = "";
    page.style.webkitMaskImage = "";
    page.style.animation = "";
    page.style.width = "";
    page.style.height = "";
    page.style.left = "";
    page.style.top = "";
    page.style.margin = "";
    page.style.borderRadius = "";
    page.style.inset = "";
    page.classList.remove(
      "is-glitching",
      "is-portal-incoming", "is-portal-outgoing", "is-portal-back", "is-portal-hole"
    );
  });
}

function renderPage(page, animate = false) {
  updatePageState(page);

  pageHome.classList.toggle("is-active", page === "home");
  pageGallery.classList.toggle("is-active", page === "gallery");

  if (animate) {
    const activeBody = PAGES[page].querySelector(".page__body");
    if (activeBody) {
      activeBody.classList.remove("page__body--enter");
      void activeBody.offsetWidth;
      activeBody.classList.add("page__body--enter");
    }
  }
}
