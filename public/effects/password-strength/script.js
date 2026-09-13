/**
 * Vault — App shell
 * Password input, strength feedback, entropy display, and visualizer scrubbing.
 * Depends on: GSAP, js/entropy.js, js/crackTime.js, js/tiers.js,
 * js/suggest.js, js/visualizer.js (load order in index.html).
 */

(function () {
  "use strict";

  /* ==========================================================
     DOM REFS
     ========================================================== */
  const input = document.getElementById("password-input");
  const field = document.getElementById("password-field");
  const suggestBtn = document.getElementById("suggest-btn");
  const visibilityBtn = document.getElementById("visibility-btn");
  const eyeIcon = visibilityBtn.querySelector(".visibility-icon--eye");
  const eyeOffIcon = visibilityBtn.querySelector(".visibility-icon--off");
  const strengthCard = document.getElementById("strength-card");
  const strengthFeedback = document.getElementById("strength-feedback");
  const strengthTitle = document.getElementById("strength-title");
  const strengthMessage = document.getElementById("strength-message");
  const entropyValue = document.getElementById("entropy-value");
  const strengthLive = document.getElementById("strength-live");
  const svg = document.getElementById("vault-svg");

  if (!input || !Vault || !Vault.visualizer) return;

  const visualizer = Vault.visualizer.createVisualizer(svg);
  let currentTier = 0;
  let displayedBits = 0;
  let entropyTween = null;
  let typingGlowTimer = null;
  let feedbackTimer = null;

  /* ==========================================================
     VISIBILITY TOGGLE
     ========================================================== */
  function updateVisibilityUI(visible) {
    input.type = visible ? "text" : "password";
    visibilityBtn.setAttribute("aria-pressed", visible ? "true" : "false");
    visibilityBtn.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
    visibilityBtn.classList.toggle("is-toggled", visible);

    if (eyeIcon) eyeIcon.hidden = visible;
    if (eyeOffIcon) eyeOffIcon.hidden = !visible;

    visibilityBtn.classList.add("is-animating");
    window.setTimeout(function () {
      visibilityBtn.classList.remove("is-animating");
    }, 280);
  }

  /* ==========================================================
     ENTROPY COUNTER
     ========================================================== */
  function animateEntropy(toBits) {
    const from = displayedBits;
    const target = Math.max(0, toBits | 0);

    if (entropyTween && typeof gsap !== "undefined") {
      entropyTween.kill();
    }

    if (typeof gsap === "undefined" || Vault.visualizer.prefersReducedMotion()) {
      displayedBits = target;
      entropyValue.textContent = String(target);
      return;
    }

    const state = { v: from };
    entropyTween = gsap.to(state, {
      v: target,
      duration: 0.45,
      ease: "power2.out",
      onUpdate: function () {
        displayedBits = Math.round(state.v);
        entropyValue.textContent = String(displayedBits);
      },
      onComplete: function () {
        displayedBits = target;
        entropyValue.textContent = String(target);
        entropyTween = null;
      },
    });
  }

  /* ==========================================================
     FEEDBACK + VISUALIZER
     ========================================================== */
  function applyFeedback(feedback, options) {
    const opts = options || {};
    const tierChanged = feedback.tier !== currentTier;

    strengthCard.dataset.tier = String(feedback.tier);
    strengthCard.style.setProperty("--tier", feedback.color);

    function commitCopy() {
      strengthTitle.textContent = feedback.title;
      strengthTitle.style.color = feedback.color;
      strengthMessage.textContent = feedback.message;
      strengthFeedback.classList.remove("is-changing");
    }

    if (tierChanged && !opts.instant && !Vault.visualizer.prefersReducedMotion()) {
      strengthFeedback.classList.add("is-changing");
      window.clearTimeout(feedbackTimer);
      feedbackTimer = window.setTimeout(commitCopy, 160);
    } else {
      commitCopy();
    }

    animateEntropy(feedback.bits);

    strengthLive.textContent =
      feedback.title + ". " + feedback.message + " " + feedback.bits + " bits de entropia.";

    if (feedback.tier !== currentTier || opts.forceVisual) {
      currentTier = feedback.tier;
      visualizer.setTier(feedback.tier, {
        duration: opts.duration,
        instant: opts.instant,
      });
    }
  }

  function evaluate(password, options) {
    const { bits } = Vault.entropy.calculateEntropy(password);
    const feedback = Vault.tiers.resolveFeedback(bits);
    applyFeedback(feedback, options);
  }

  function pulseTypingGlow() {
    field.classList.add("is-typing");
    window.clearTimeout(typingGlowTimer);
    typingGlowTimer = window.setTimeout(function () {
      field.classList.remove("is-typing");
    }, 220);
  }

  /* ==========================================================
     EVENTS
     ========================================================== */
  input.addEventListener("focus", function () {
    field.classList.add("is-focused");
  });

  input.addEventListener("blur", function () {
    field.classList.remove("is-focused");
    field.classList.remove("is-typing");
  });

  input.addEventListener("input", function () {
    pulseTypingGlow();
    evaluate(input.value);
  });

  visibilityBtn.addEventListener("click", function () {
    const visible = input.type === "password";
    updateVisibilityUI(visible);
  });

  suggestBtn.addEventListener("click", function () {
    const strong = Vault.suggest.generateStrongPassword();
    input.value = strong;
    field.classList.add("is-focused");
    pulseTypingGlow();
    evaluate(strong, { duration: 1.05, forceVisual: true });
    input.focus();
  });

  /* ==========================================================
     INIT
     ========================================================== */
  evaluate("", { instant: true });
  updateVisibilityUI(false);

  window.addEventListener("beforeunload", function () {
    visualizer.destroy();
  });
})();
