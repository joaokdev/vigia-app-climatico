/**
 * Split Panel Auth
 * Panel switch between sign-in and register forms, light sweep on
 * transition, and demo submit success state for index.html.
 */

(function () {
  "use strict";

  /* ==========================================================
     DOM REFS
     ========================================================== */
  const authContainer = document.getElementById("authContainer");
  const showRegister  = document.getElementById("showRegister");
  const showLogin     = document.getElementById("showLogin");
  const lightSweep    = document.getElementById("lightSweep");
  const loginForm     = document.getElementById("loginForm");
  const registerForm  = document.getElementById("registerForm");

  if (!authContainer || !showRegister || !showLogin || !lightSweep) return;

  /* ==========================================================
     PANEL SWITCH
     Toggles .active on the container — CSS handles the rest.
     ========================================================== */
  const SWITCH_DURATION = 900; // matches --dur-switch in style.css
  let isAnimating = false;

  function triggerSweep() {
    lightSweep.classList.remove("is-active");
    void lightSweep.offsetWidth;
    lightSweep.classList.add("is-active");
  }

  function switchToRegister() {
    if (isAnimating || authContainer.classList.contains("active")) return;
    isAnimating = true;
    triggerSweep();
    authContainer.classList.add("active");
    setTimeout(() => { isAnimating = false; }, SWITCH_DURATION);
  }

  function switchToLogin() {
    if (isAnimating || !authContainer.classList.contains("active")) return;
    isAnimating = true;
    triggerSweep();
    authContainer.classList.remove("active");
    setTimeout(() => { isAnimating = false; }, SWITCH_DURATION);
  }

  showRegister.addEventListener("click", switchToRegister);
  showLogin.addEventListener("click", switchToLogin);

  [showRegister, showLogin].forEach((btn) => {
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  /* ==========================================================
     FORM SUBMIT — demo success state
     Replace handleFormSubmit with your own auth logic.
     ========================================================== */
  function showButtonSuccess(form) {
    const btn = form.querySelector(".btn--primary");
    if (!btn || btn.classList.contains("is-success")) return;

    btn.classList.add("is-success");

    setTimeout(() => {
      btn.classList.remove("is-success");
    }, 2200);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    showButtonSuccess(e.target);
  }

  if (loginForm) loginForm.addEventListener("submit", handleFormSubmit);
  if (registerForm) registerForm.addEventListener("submit", handleFormSubmit);

  /* Demo links — prevent navigation */
  document.querySelectorAll(".form-link").forEach((link) => {
    link.addEventListener("click", (e) => e.preventDefault());
  });

  document.querySelectorAll(".btn--social").forEach((btn) => {
    btn.addEventListener("click", (e) => e.preventDefault());
  });
})();
