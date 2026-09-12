/**
 * Day Night Window Toggle
 * Window-as-toggle for light / dark appearance. Stars, birds,
 * shooting stars, proximity wind, and localStorage preference.
 * Tweak CONFIG at the top for density and timing.
 */

(function () {
  "use strict";

  /* ==========================================================
     CONFIG — easy to tweak for your project
     ========================================================== */
  const CONFIG = {
    starCount: 55,
    twinkleRatio: 0.45,
    storageKey: "codecandy-day-night-window",
    cloudNear: 24,
    cloudFar: 40,
    cloudSpawnChance: 0.3,
    starNear: 22,
    starFar: 36,
    cloudDriftBoost: 3,
    starTwinkleBoost: 3,
    firstAmbientDelay: 2000,
    flockMinDelay: 4000,
    flockMaxDelay: 8000,
    flockMinBirds: 5,
    flockMaxBirds: 9,
    shootingStarMinDelay: 4000,
    shootingStarMaxDelay: 8000,
  };

  const THEME_COLORS = {
    day: "#ede8df",
    night: "#07070f",
  };

  /* ==========================================================
     DOM REFS
     ========================================================== */
  const toggle = document.getElementById("windowToggle");
  const starsLayer = document.getElementById("starsLayer");
  const birdsLayer = document.getElementById("birdsLayer");
  const shootingStarsLayer = document.getElementById("shootingStarsLayer");
  const themeColor = document.getElementById("themeColor");
  const modeIcon = document.getElementById("modeIcon");
  const modeText = document.getElementById("modeText");
  const modeHint = document.getElementById("modeHint");
  const clouds = toggle ? [...toggle.querySelectorAll(".cloud")] : [];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let stars = [];
  const cloudWindy = clouds.map(() => false);
  let starWindy = [];
  let flockTimer = null;
  let shootingStarTimer = null;

  if (!toggle || !starsLayer) return;

  const MODE_COPY = {
    day: {
      icon: "\u2600\uFE0E",
      text: "Light mode",
      hint: "Tap to switch",
      label: "Light mode. Tap window to switch to dark mode.",
    },
    night: {
      icon: "\u263E\uFE0E",
      text: "Dark mode",
      hint: "Tap to switch",
      label: "Dark mode. Tap window to switch to light mode.",
    },
  };

  /* ==========================================================
     STAR FIELD — generated once on load
     ========================================================== */
  function createStars() {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < CONFIG.starCount; i += 1) {
      const star = document.createElement("span");
      star.className = "star";

      const size = Math.random() < 0.15 ? 2.5 : Math.random() < 0.4 ? 2 : 1.5;
      const top = 4 + Math.random() * 72;
      const left = 4 + Math.random() * 92;
      const opacity = 0.35 + Math.random() * 0.65;
      const delay = Math.random() * 2.5;

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${top}%`;
      star.style.left = `${left}%`;
      star.style.setProperty("--star-opacity", opacity.toFixed(2));
      star.style.transitionDelay = `${delay * 0.15}s`;

      if (Math.random() < CONFIG.twinkleRatio) {
        star.classList.add("star--twinkle");
        star.style.setProperty("--twinkle-duration", `${2 + Math.random() * 3}s`);
        star.style.setProperty("--twinkle-delay", `${Math.random() * 4}s`);
      }

      fragment.appendChild(star);
    }

    starsLayer.appendChild(fragment);
    stars = [...starsLayer.querySelectorAll(".star")];
    starWindy = stars.map(() => false);
  }

  /* ==========================================================
     DAY FLOCKS — occasional birds across the sky
     ========================================================== */
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(randomBetween(min, max + 1));
  }

  function isNightMode() {
    return toggle.classList.contains("is-night");
  }

  function clearFlockTimer() {
    if (!flockTimer) return;
    window.clearTimeout(flockTimer);
    flockTimer = null;
  }

  function clearBirds() {
    clearFlockTimer();

    if (birdsLayer) {
      birdsLayer.replaceChildren();
    }
  }

  function scheduleNextFlock(delayOverride) {
    clearFlockTimer();

    if (!birdsLayer || isNightMode() || prefersReducedMotion.matches) return;

    const delay = delayOverride ?? randomBetween(CONFIG.flockMinDelay, CONFIG.flockMaxDelay);
    flockTimer = window.setTimeout(() => {
      createBirdFlock();
      scheduleNextFlock();
    }, delay);
  }

  function createBirdFlock() {
    if (!birdsLayer || isNightMode() || prefersReducedMotion.matches) return;

    const flock = document.createElement("span");
    const birdCount = randomInt(CONFIG.flockMinBirds, CONFIG.flockMaxBirds);
    const direction = Math.random() < 0.5 ? 1 : -1;
    const travel = toggle.getBoundingClientRect().width + 240;
    const top = randomBetween(16, 45);

    flock.className = "bird-flock";
    flock.style.setProperty("--flock-end", `${direction * travel}px`);
    flock.style.setProperty("--flock-top", `${top.toFixed(1)}%`);
    flock.style.setProperty("--flock-duration", `${randomBetween(10, 15).toFixed(1)}s`);
    flock.style.setProperty("--flock-drift", `${randomBetween(-30, 14).toFixed(1)}px`);
    flock.style.setProperty("--flock-scale", randomBetween(0.72, 1.08).toFixed(2));
    flock.style.setProperty("--flock-opacity", randomBetween(0.5, 0.76).toFixed(2));

    if (direction < 0) {
      flock.classList.add("bird-flock--reverse");
      flock.style.setProperty("--flock-drift", `${randomBetween(-18, 26).toFixed(1)}px`);
    }

    for (let i = 0; i < birdCount; i += 1) {
      const bird = document.createElement("span");
      const row = i % 2 === 0 ? -1 : 1;
      const spread = i * randomBetween(10, 15);

      bird.className = "bird";
      bird.style.setProperty("--bird-x", `${spread}px`);
      bird.style.setProperty("--bird-y", `${36 + row * randomBetween(4, 22) + i * 0.6}px`);
      bird.style.setProperty("--bird-scale", randomBetween(0.58, 1).toFixed(2));
      bird.style.setProperty("--bird-opacity", randomBetween(0.48, 0.78).toFixed(2));
      bird.style.setProperty("--wing-speed", `${randomBetween(0.42, 0.72).toFixed(2)}s`);
      bird.style.setProperty("--wing-delay", `${randomBetween(-0.5, 0).toFixed(2)}s`);
      flock.appendChild(bird);
    }

    flock.addEventListener("animationend", () => flock.remove(), { once: true });
    birdsLayer.appendChild(flock);
  }

  /* ==========================================================
     SHOOTING STARS — occasional night streaks
     ========================================================== */
  function clearShootingStarTimer() {
    if (!shootingStarTimer) return;
    window.clearTimeout(shootingStarTimer);
    shootingStarTimer = null;
  }

  function clearShootingStars() {
    clearShootingStarTimer();

    if (shootingStarsLayer) {
      shootingStarsLayer.replaceChildren();
    }
  }

  function scheduleNextShootingStar(delayOverride) {
    clearShootingStarTimer();

    if (!shootingStarsLayer || !isNightMode() || prefersReducedMotion.matches) return;

    const delay = delayOverride ?? randomBetween(CONFIG.shootingStarMinDelay, CONFIG.shootingStarMaxDelay);
    shootingStarTimer = window.setTimeout(() => {
      createShootingStar();
      scheduleNextShootingStar();
    }, delay);
  }

  function createShootingStar() {
    if (!shootingStarsLayer || !isNightMode() || prefersReducedMotion.matches) return;

    const shootingStar = document.createElement("span");
    const travelX = randomBetween(150, 230);
    const travelY = randomBetween(-128, -62);

    shootingStar.className = "shooting-star";
    shootingStar.style.setProperty("--shooting-star-top", `${randomBetween(38, 72).toFixed(1)}%`);
    shootingStar.style.setProperty("--shooting-star-left", `${randomBetween(2, 42).toFixed(1)}%`);
    shootingStar.style.setProperty("--shooting-star-length", `${randomBetween(58, 104).toFixed(1)}px`);
    shootingStar.style.setProperty("--shooting-star-angle", `${randomBetween(-34, -22).toFixed(1)}deg`);
    shootingStar.style.setProperty("--shooting-star-duration", `${randomBetween(0.9, 1.35).toFixed(2)}s`);
    shootingStar.style.setProperty("--shooting-star-opacity", randomBetween(0.58, 0.9).toFixed(2));
    shootingStar.style.setProperty("--shooting-star-scale", randomBetween(0.75, 1.08).toFixed(2));
    shootingStar.style.setProperty("--shooting-star-travel-x", `${travelX.toFixed(1)}px`);
    shootingStar.style.setProperty("--shooting-star-travel-y", `${travelY.toFixed(1)}px`);

    shootingStar.addEventListener("animationend", () => shootingStar.remove(), { once: true });
    shootingStarsLayer.appendChild(shootingStar);
  }

  /* ==========================================================
     PROXIMITY — slight speed boost near clouds / stars
     ========================================================== */
  function distanceToRect(x, y, rect) {
    const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
    const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
    return Math.hypot(dx, dy);
  }

  /* Base .cloud box is only the bar — puffs live in ::before/::after above it */
  function cloudHitRect(cloud) {
    const rect = cloud.getBoundingClientRect();
    const padSide = Math.max(rect.width * 0.32, 22);
    const padTop = Math.max(rect.width * 0.36, 32);
    return {
      left: rect.left - padSide,
      right: rect.right + padSide,
      top: rect.top - padTop,
      bottom: rect.bottom + 10,
    };
  }

  function starHitRect(star) {
    const rect = star.getBoundingClientRect();
    const pad = 18;
    return {
      left: rect.left - pad,
      right: rect.right + pad,
      top: rect.top - pad,
      bottom: rect.bottom + pad,
    };
  }

  function setPlaybackRate(el, animationName, rate) {
    el.getAnimations().forEach((anim) => {
      if (anim.animationName === animationName) {
        anim.playbackRate = rate;
      }
    });
  }

  function setWindy(el, windyState, index, isWindy, animationName, boostRate) {
    if (windyState[index] === isWindy) return;
    windyState[index] = isWindy;
    setPlaybackRate(el, animationName, isWindy ? boostRate : 1);
  }

  function onTogglePointerMove(event) {
    const { clientX, clientY } = event;

    clouds.forEach((cloud, index) => {
      const dist = distanceToRect(clientX, clientY, cloudHitRect(cloud));
      const limit = cloudWindy[index] ? CONFIG.cloudFar : CONFIG.cloudNear;
      setWindy(cloud, cloudWindy, index, dist < limit, "cloudDrift", CONFIG.cloudDriftBoost);
    });

    if (toggle.classList.contains("is-night")) {
      stars.forEach((star, index) => {
        if (!star.classList.contains("star--twinkle")) return;
        const dist = distanceToRect(clientX, clientY, starHitRect(star));
        const limit = starWindy[index] ? CONFIG.starFar : CONFIG.starNear;
        setWindy(star, starWindy, index, dist < limit, "twinkle", CONFIG.starTwinkleBoost);
      });
    }
  }

  function onTogglePointerLeave() {
    clouds.forEach((cloud, index) => {
      setWindy(cloud, cloudWindy, index, false, "cloudDrift", CONFIG.cloudDriftBoost);
    });
    stars.forEach((star, index) => {
      if (!star.classList.contains("star--twinkle")) return;
      setWindy(star, starWindy, index, false, "twinkle", CONFIG.starTwinkleBoost);
    });
  }

  function setCloudPassVisibility(cloud) {
    cloud.classList.toggle("is-dormant", Math.random() >= CONFIG.cloudSpawnChance);
  }

  function onCloudAnimationIteration(event) {
    if (event.animationName !== "cloudDrift") return;
    setCloudPassVisibility(event.currentTarget);
  }

  /* ==========================================================
     TOGGLE STATE — day / night + status copy
     ========================================================== */
  function setNightMode(isNight, { animate = true } = {}) {
    const copy = isNight ? MODE_COPY.night : MODE_COPY.day;

    toggle.classList.toggle("is-night", isNight);
    toggle.setAttribute("aria-pressed", String(isNight));
    toggle.setAttribute("aria-label", copy.label);
    document.body.classList.toggle("is-night", isNight);

    if (modeIcon) modeIcon.textContent = copy.icon;
    if (modeText) modeText.textContent = copy.text;
    if (modeHint) modeHint.textContent = copy.hint;

    if (themeColor) {
      themeColor.setAttribute("content", isNight ? THEME_COLORS.night : THEME_COLORS.day);
    }

    if (isNight) {
      clearBirds();
      scheduleNextShootingStar(CONFIG.firstAmbientDelay);
    } else {
      clearShootingStars();
      scheduleNextFlock(CONFIG.firstAmbientDelay);
    }

    if (!animate) {
      toggle.style.setProperty("transition", "none");
      requestAnimationFrame(() => {
        toggle.style.removeProperty("transition");
      });
    }
  }

  function toggleMode() {
    const isNight = !toggle.classList.contains("is-night");
    setNightMode(isNight);

    try {
      localStorage.setItem(CONFIG.storageKey, isNight ? "night" : "day");
    } catch {
      /* storage unavailable — ignore */
    }
  }

  /* ==========================================================
     PREFERENCE — restore saved day / night
     ========================================================== */
  function loadSavedState() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved === "night") {
        setNightMode(true, { animate: false });
      }
    } catch {
      /* ignore */
    }
  }

  /* ==========================================================
     INIT — wire events and start ambient loops
     ========================================================== */
  toggle.addEventListener("click", toggleMode);
  toggle.addEventListener("mousemove", onTogglePointerMove);
  toggle.addEventListener("mouseleave", onTogglePointerLeave);

  clouds.forEach((cloud) => {
    cloud.addEventListener("animationiteration", onCloudAnimationIteration);
  });

  toggle.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggleMode();
    }
  });

  createStars();
  loadSavedState();
  scheduleNextFlock(CONFIG.firstAmbientDelay);
})();
