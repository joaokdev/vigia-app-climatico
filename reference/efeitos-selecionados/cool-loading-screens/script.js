/**
 * Loading Screens
 * Load triggers, progress sync, and replay resets for the five loaders in index.html.
 * Burger, coffee, frog, and candy are CSS-driven; JS handles state and percentages.
 * Gym Bro additionally sequences five barbell reps in sync with the progress bar.
 */

/* ==========================================================
   GYM BRO — 5-rep barbell lift with synced progress bar
   Each rep toggles .rep-lift on the loader; sweat from rep 3.
   ========================================================== */
const GYM_REPS = 5;
const GYM_REP_MS = 900;

async function playGymBro(row, busy) {
  if (busy.get(row)) return;

  const btn = row.querySelector(".load-btn");
  const status = row.querySelector(".loader-status");
  const gym = row.querySelector(".gymbro-loader");
  const fill = row.querySelector(".gymbro-loader__fill");
  const percent = row.querySelector(".gymbro-loader__percent");
  const label = row.querySelector(".gymbro-loader__label");
  const doneText = status?.dataset.done || "gains complete";

  busy.set(row, true);
  row.classList.remove("is-done", "loading");
  row.classList.add("loading");

  if (btn) btn.disabled = true;
  if (gym) gym.classList.remove("rep-lift", "rep-pump", "is-sweaty");
  if (fill) {
    fill.style.width = "0%";
    fill.classList.remove("is-pump");
  }
  if (percent) percent.textContent = "0%";

  for (let rep = 1; rep <= GYM_REPS; rep++) {
    if (!row.classList.contains("loading")) break;

    const repLabel = `rep ${rep} / ${GYM_REPS}`;
    if (label) label.textContent = repLabel;
    if (status) status.textContent = repLabel;

    if (rep >= 3 && gym) gym.classList.add("is-sweaty");

    if (gym) {
      gym.classList.remove("rep-lift", "rep-pump");
      void gym.offsetWidth;
      gym.classList.add("rep-lift");
    }

    await wait(GYM_REP_MS);

    const progress = rep * 20;
    if (fill) fill.style.width = `${progress}%`;
    if (percent) percent.textContent = `${progress}%`;

    if (gym) {
      gym.classList.remove("rep-lift");
      gym.classList.add("rep-pump");
      if (fill) fill.classList.add("is-pump");
    }

    await wait(180);

    if (gym) gym.classList.remove("rep-pump");
    if (fill) fill.classList.remove("is-pump");
  }

  row.classList.remove("loading");
  row.classList.add("is-done");

  if (label) label.textContent = "GAINS COMPLETE";
  if (status) status.textContent = doneText;
  if (percent) percent.textContent = "100%";
  if (fill) fill.style.width = "100%";

  busy.set(row, false);
  if (btn) btn.disabled = false;
}

/* ==========================================================
   CSS-DRIVEN LOADERS — play, percent sync, done state
   Animations live in style.css; JS toggles .loading / .is-done.
   ========================================================== */
const REPLAY_DELAY = 5500;
const GYM_REPLAY_DELAY = 2800;
const COFFEE_FILL_MS = 4200;

/** Stepped percent milestones keyed by data-loader value */
const PERCENT_STEPS = {
  burger: [
    { at: 1000, value: 20 },
    { at: 1700, value: 40 },
    { at: 2400, value: 60 },
    { at: 3100, value: 80 },
    { at: 3800, value: 100 },
  ],
  frog: [
    { at: 850, value: 20 },
    { at: 1550, value: 40 },
    { at: 2250, value: 60 },
    { at: 2950, value: 80 },
    { at: 3650, value: 100 },
  ],
  candy: [
    { at: 500, value: 20 },
    { at: 1200, value: 40 },
    { at: 2200, value: 60 },
    { at: 3800, value: 80 },
    { at: 4600, value: 100 },
  ],
};

const PERCENT_SELECTORS = {
  burger: ".burger-loader__percent",
  frog: ".frog-loader__percent",
  candy: ".candy-loader__percent",
};

const LOADING_LABELS = {
  coffee: "brewing...",
  candy: "unwrapping...",
};

const DONE_LABELS = {
  burger: { label: "served", percent: "100%" },
  frog: { label: "done!", percent: "100%" },
  candy: { label: "sweet!", percent: "100%" },
  coffee: { label: "brewed" },
};

function playCssLoader(row, busy) {
  return new Promise((resolve) => {
    if (busy.get(row)) {
      resolve();
      return;
    }

    const loader = row.dataset.loader;
    const duration = parseInt(row.dataset.duration, 10) || 3000;
    const btn = row.querySelector(".load-btn");
    const status = row.querySelector(".loader-status");
    const doneText = status?.dataset.done || "done";

    busy.set(row, true);
    row.classList.remove("is-done");

    forceReflow(row);
    row.classList.add("loading");

    if (btn) btn.disabled = true;

    if (LOADING_LABELS[loader]) {
      const label = row.querySelector(`.${loader}-loader__label`);
      if (label) label.textContent = LOADING_LABELS[loader];
    }

    if (loader === "coffee") {
      animateCoffeePercent(row);
    }

    if (PERCENT_STEPS[loader]) {
      animateStepPercent(row, PERCENT_SELECTORS[loader], PERCENT_STEPS[loader]);
    }

    window.setTimeout(() => {
      row.classList.remove("loading");
      row.classList.add("is-done");

      if (status) status.textContent = doneText;

      const done = DONE_LABELS[loader];
      if (done) {
        const label = row.querySelector(`.${loader}-loader__label`);
        const percent = row.querySelector(`.${loader}-loader__percent`);
        if (done.label && label) label.textContent = done.label;
        if (done.percent && percent) percent.textContent = done.percent;
      }

      if (loader === "coffee") {
        const label = row.querySelector(".coffee-loader__label");
        setCoffeePercents(row, 100);
        if (label) label.textContent = DONE_LABELS.coffee.label;
      }

      busy.set(row, false);

      if (btn) btn.disabled = false;

      resolve();
    }, duration);
  });
}

/* ==========================================================
   RESET & REPLAY — return a row to idle after cooldown
   ========================================================== */
const RESET_LABELS = {
  burger: { label: "stacking...", percent: "0%" },
  frog: { label: "hop hop...", percent: "0%" },
  candy: { label: "unwrap me", percent: "0%" },
  coffee: { label: "idle" },
};

function resetRow(row, busy) {
  row.classList.remove("loading", "is-done");

  const status = row.querySelector(".loader-status");
  const btn = row.querySelector(".load-btn");

  if (status) {
    status.textContent = status.dataset.default || "ready";
  }

  if (btn) {
    btn.disabled = false;
  }

  busy.set(row, false);
  clearPercentTimers(row);

  const loader = row.dataset.loader;
  const reset = RESET_LABELS[loader];

  if (reset) {
    const label = row.querySelector(`.${loader}-loader__label`);
    const percent = row.querySelector(`.${loader}-loader__percent`);
    if (reset.label && label) label.textContent = reset.label;
    if (reset.percent && percent) percent.textContent = reset.percent;
  }

  if (loader === "coffee") {
    setCoffeePercents(row, 0);
  }

  if (loader === "gymbro") {
    const gym = row.querySelector(".gymbro-loader");
    const fill = row.querySelector(".gymbro-loader__fill");
    const percent = row.querySelector(".gymbro-loader__percent");
    const label = row.querySelector(".gymbro-loader__label");

    if (gym) gym.classList.remove("rep-lift", "rep-pump", "is-sweaty");
    if (fill) {
      fill.style.width = "0%";
      fill.classList.remove("is-pump");
    }
    if (percent) percent.textContent = "0%";
    if (label) label.textContent = "ready";
  }
}

function scheduleReplay(row, busy) {
  const delay = row.dataset.loader === "gymbro" ? GYM_REPLAY_DELAY : REPLAY_DELAY;

  window.setTimeout(() => {
    if (busy.get(row)) return;
    resetRow(row, busy);
  }, delay);
}

/* ==========================================================
   PERCENT HELPERS — stepped milestones and coffee fill sync
   ========================================================== */
function animateStepPercent(row, selector, steps) {
  const percent = row.querySelector(selector);
  if (!percent) return;

  clearPercentTimers(row);
  percent.textContent = "0%";

  const timers = steps.map(({ at, value }) =>
    window.setTimeout(() => {
      if (row.classList.contains("loading")) {
        percent.textContent = `${value}%`;
      }
    }, at)
  );

  row._percentTimers = timers;
}

function clearPercentTimers(row) {
  if (!row._percentTimers) return;
  row._percentTimers.forEach((id) => window.clearTimeout(id));
  row._percentTimers = [];
}

function setCoffeePercents(row, value) {
  row.querySelectorAll(".coffee-loader__percent").forEach((el) => {
    el.textContent = `${value}%`;
  });
}

/** Coffee counter tracks fillCup CSS — same ease-out curve (4.2s) */
function animateCoffeePercent(row) {
  const start = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 2.6);
  }

  function tick(now) {
    if (!row.classList.contains("loading")) return;

    const t = Math.min((now - start) / COFFEE_FILL_MS, 1);
    setCoffeePercents(row, Math.round(easeOut(t) * 100));

    if (t < 1) {
      requestAnimationFrame(tick);
    }
  }

  setCoffeePercents(row, 0);
  requestAnimationFrame(tick);
}

/** Toggle .loading off briefly so CSS animations restart cleanly */
function forceReflow(row) {
  row.classList.remove("loading");
  void row.offsetWidth;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/* ==========================================================
   INIT — wire load buttons and replay
   ========================================================== */
(function () {
  "use strict";

  const rows = [...document.querySelectorAll(".loader-row")];
  const busy = new Map();

  rows.forEach((row) => {
    busy.set(row, false);

    const btn = row.querySelector('[data-action="load"]');
    if (!btn) return;

    btn.addEventListener("click", async () => {
      if (busy.get(row)) return;

      resetRow(row, busy);

      if (row.dataset.loader === "gymbro") {
        await playGymBro(row, busy);
      } else {
        await playCssLoader(row, busy);
      }

      scheduleReplay(row, busy);
    });
  });
})();
