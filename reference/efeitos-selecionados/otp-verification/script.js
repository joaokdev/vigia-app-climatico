/**
 * OTP Verification
 * Four-digit OTP card: slot sync, circuit choreography on a correct
 * code, error shake on a wrong one, resend timer, and success reveal.
 * Demo accept code is DEMO_CODE below (default "8402").
 */

(() => {
  "use strict";

  /* ==========================================================
     CONFIG — demo code and circuit layout
     ========================================================== */
  const DEMO_CODE = "8402";
  const PHASE_OFFSETS = [0, 0.75, 0.25, 0.5]; // DOM order: top-left, bottom-left, top-right, bottom-right.
  const WIRE_EDGES = [
    [0, 1], // top-left → top-right
    [1, 2], // top-right → bottom-right
    [2, 3], // bottom-right → bottom-left
    [3, 0], // bottom-left → top-left
  ];

  /* ==========================================================
     DOM REFS
     ========================================================== */
  const card = document.querySelector("#verification-card");
  const form = document.querySelector("#otp-form");
  const input = document.querySelector("#otp-input");
  const scene = document.querySelector("#otp-scene");
  const plane = document.querySelector("#circuit-plane");
  const nodes = [...document.querySelectorAll(".otp-node")];
  const digits = [...document.querySelectorAll(".digit")];
  const wires = [...document.querySelectorAll(".wire")];
  const demoNote = document.querySelector("#demo-note");
  const feedback = document.querySelector("#otp-feedback");
  const resendButton = document.querySelector("#resend-button");
  const resendTime = document.querySelector("#resend-time");
  const successView = document.querySelector("#success-view");
  const continueButton = document.querySelector("#continue-button");
  const collapseCore = document.querySelector("#collapse-core");
  const title = document.querySelector("#card-title");
  const subtitle = document.querySelector("#card-subtitle");
  const liveRegion = document.querySelector("#status-live");

  if (!card || !form || !input || nodes.length !== 4 || wires.length !== 4) {
    return;
  }

  /* ==========================================================
     STATE
     ========================================================== */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const activeAnimations = new Set();
  const originalCopy = {
    title: "Verify your number",
    subtitleHTML:
      'Enter the 4-digit code we sent to <span class="phone-number" aria-hidden="true">+44 7700 •• 0142</span><span class="sr-only">your phone number ending in 0142</span>',
  };

  let geometry = null;
  let appState = "idle";
  let runToken = 0;
  let runController = null;
  let activeFrame = 0;
  let previousCode = "";
  let resendSeconds = 24;
  let resendTimer = 0;
  let lastSceneWidth = 0;

  /* ==========================================================
     UTILITIES — math + owned Web Animations
     Every hero run owns its timers, frame loop, and WAAPI
     so replay / abort stays clean.
     ========================================================== */
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smoothstep = (edge0, edge1, value) => {
    const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return x * x * (3 - 2 * x);
  };

  function makeAbortError() {
    return new DOMException("Animation interrupted", "AbortError");
  }

  function guardRun(token, signal) {
    if (token !== runToken || signal?.aborted) {
      throw makeAbortError();
    }
  }

  function sleep(milliseconds, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(makeAbortError());
        return;
      }

      const finish = () => {
        signal?.removeEventListener("abort", handleAbort);
        resolve();
      };
      const timer = window.setTimeout(finish, milliseconds);
      const handleAbort = () => {
        window.clearTimeout(timer);
        reject(makeAbortError());
      };

      signal?.addEventListener("abort", handleAbort, { once: true });
    });
  }

  function applyFinalFrame(element, frame) {
    Object.entries(frame).forEach(([property, value]) => {
      if (!["offset", "easing", "composite"].includes(property)) {
        element.style[property] = value;
      }
    });
  }

  function animateOwned(element, keyframes, options = {}, signal, persist = true) {
    const finalFrame = keyframes[keyframes.length - 1];

    if (!element.animate) {
      if (persist) applyFinalFrame(element, finalFrame);
      return sleep((options.delay || 0) + (options.duration || 0), signal);
    }

    if (signal?.aborted) {
      return Promise.reject(makeAbortError());
    }

    const animation = element.animate(keyframes, {
      fill: "both",
      ...options,
    });

    activeAnimations.add(animation);

    return new Promise((resolve, reject) => {
      let settled = false;

      const cleanUp = () => {
        activeAnimations.delete(animation);
        signal?.removeEventListener("abort", handleAbort);
      };

      const handleAbort = () => {
        if (settled) return;
        settled = true;
        animation.cancel();
        cleanUp();
        reject(makeAbortError());
      };

      signal?.addEventListener("abort", handleAbort, { once: true });

      animation.finished.then(
        () => {
          if (settled) return;
          settled = true;
          if (persist) applyFinalFrame(element, finalFrame);
          animation.cancel();
          cleanUp();
          resolve();
        },
        () => {
          if (settled) return;
          settled = true;
          cleanUp();
          if (signal?.aborted) reject(makeAbortError());
          else resolve();
        },
      );
    });
  }

  function animateTransient(element, keyframes, options = {}) {
    if (!element.animate || reduceMotion.matches) return;
    const animation = element.animate(keyframes, options);
    activeAnimations.add(animation);
    animation.finished
      .catch(() => {})
      .finally(() => {
        activeAnimations.delete(animation);
        animation.cancel();
      });
  }

  function cancelOwnedMotion() {
    if (runController && !runController.signal.aborted) {
      runController.abort();
    }

    if (activeFrame) {
      cancelAnimationFrame(activeFrame);
      activeFrame = 0;
    }

    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
  }

  /* ==========================================================
     GEOMETRY + LAYOUT
     Measured once per idle layout; the animation loop does
     not re-read layout.
     ========================================================== */
  function transformNode({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1 }) {
    return `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
  }

  function measureGeometry() {
    const width = scene.clientWidth;
    const height = scene.clientHeight;
    const slotSize = nodes[0].offsetWidth;
    const gap = width <= 360 ? 8 : width <= 480 ? 12 : 14;
    const rowStep = slotSize + gap;
    const idleY = -height / 2 + slotSize / 2 + (width <= 400 ? 18 : 22);
    const availableRadius = Math.min(
      84,
      (width - slotSize) / 2 - 18,
      (height - slotSize) / 2 - 22,
    );
    const radius = clamp(availableRadius, 62, 84);

    geometry = {
      width,
      height,
      slotSize,
      gap,
      radius,
      row: nodes.map((_, index) => ({
        x: (index - 1.5) * rowStep,
        y: idleY,
      })),
      vertices: [
        { x: -radius, y: -radius },
        { x: radius, y: -radius },
        { x: radius, y: radius },
        { x: -radius, y: radius },
      ],
    };

    lastSceneWidth = width;
    return geometry;
  }

  function wireTransform(edgeIndex, scale = 1) {
    const [fromIndex, toIndex] = WIRE_EDGES[edgeIndex];
    const from = geometry.vertices[fromIndex];
    const to = geometry.vertices[toIndex];
    const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
    return `translate3d(${from.x.toFixed(2)}px, ${from.y.toFixed(2)}px, -3px) rotateZ(${angle.toFixed(3)}deg) scaleX(${scale})`;
  }

  function collapsedWireTransform(edgeIndex) {
    const [fromIndex, toIndex] = WIRE_EDGES[edgeIndex];
    const from = geometry.vertices[fromIndex];
    const to = geometry.vertices[toIndex];
    const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
    return `translate3d(0px, 0px, -3px) rotateZ(${angle.toFixed(3)}deg) scaleX(0)`;
  }

  function layoutWires(scale = 0) {
    WIRE_EDGES.forEach(([fromIndex, toIndex], edgeIndex) => {
      const from = geometry.vertices[fromIndex];
      const to = geometry.vertices[toIndex];
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      const wire = wires[edgeIndex];
      wire.style.width = `${length.toFixed(2)}px`;
      wire.style.transformOrigin = "0 50%";
      wire.style.transform = wireTransform(edgeIndex, scale);
      wire.style.opacity = scale ? "1" : "0";
      wire.dataset.fullTransform = wireTransform(edgeIndex, 1);
      wire.dataset.emptyTransform = wireTransform(edgeIndex, 0);
    });
  }

  function layoutIdleScene() {
    measureGeometry();
    nodes.forEach((node, index) => {
      const point = geometry.row[index];
      node.style.transform = transformNode({ x: point.x, y: point.y });
      node.style.opacity = "1";
      node.style.willChange = "auto";
    });
    layoutWires(0);
  }

  function routedTransform(phase, scale = 0.86) {
    const vertexIndex = Math.round((((phase % 1) + 1) % 1) * 4) % 4;
    const point = geometry.vertices[vertexIndex];
    return transformNode({
      x: point.x,
      y: point.y,
      scale,
    });
  }

  /* ==========================================================
     INPUT + SLOT SYNC
     ========================================================== */
  function sanitizeCode(value) {
    return String(value).replace(/[^0-9]/g, "").slice(0, 4);
  }

  function activeSlotIndex() {
    const cursor = Number.isFinite(input.selectionStart) ? input.selectionStart : input.value.length;
    return clamp(cursor, 0, 3);
  }

  function syncSlots(value = input.value) {
    const cleanValue = sanitizeCode(value);
    const activeIndex = activeSlotIndex();

    nodes.forEach((node, index) => {
      const character = cleanValue[index] || "";
      digits[index].textContent = character;
      node.classList.toggle("has-value", Boolean(character));
      node.classList.toggle("is-active", appState === "idle" && index === activeIndex);
    });

    previousCode = cleanValue;
  }

  function setCode(value) {
    input.value = sanitizeCode(value);
    const end = input.value.length;
    try {
      input.setSelectionRange(end, end);
    } catch {
      // Selection APIs can be unavailable on a few embedded browsers.
    }
    syncSlots(input.value);
  }

  /* ==========================================================
     FEEDBACK + RESEND
     ========================================================== */
  function updateFeedbackDefault() {
    feedback.classList.remove("is-error");
    input.removeAttribute("aria-invalid");
    feedback.firstChild.textContent = "Didn’t receive it? ";

    if (resendSeconds > 0) {
      resendButton.disabled = true;
      resendButton.firstChild.textContent = "Resend in ";
      resendTime.hidden = false;
      resendTime.textContent = `0:${String(resendSeconds).padStart(2, "0")}`;
    } else {
      resendButton.disabled = false;
      resendButton.firstChild.textContent = "Resend code";
      resendTime.hidden = true;
    }
  }

  function showInputError(message) {
    feedback.classList.add("is-error");
    feedback.firstChild.textContent = `${message} `;
    resendButton.hidden = true;
    input.setAttribute("aria-invalid", "true");
    liveRegion.textContent = message;

    nodes.forEach((node) => {
      node.classList.remove("is-flash", "is-flash-fast");
      node.classList.add("is-error");
    });

    animateTransient(
      plane,
      [
        { transform: "translate3d(0, 0, 0)" },
        { transform: "translate3d(-7px, 0, 0)" },
        { transform: "translate3d(6px, 0, 0)" },
        { transform: "translate3d(-3px, 0, 0)" },
        { transform: "translate3d(0, 0, 0)" },
      ],
      { duration: 430, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }

  function focusInput() {
    form.classList.remove("is-primed");
    form.classList.add("is-input-focused");
    input.focus({ preventScroll: true });
    try {
      const cursor = input.value.length;
      input.setSelectionRange(cursor, cursor);
    } catch {
      // Selection APIs can be unavailable on a few embedded browsers.
    }
  }

  function clearInputError() {
    if (!feedback.classList.contains("is-error")) return;
    resendButton.hidden = false;
    input.removeAttribute("aria-invalid");
    nodes.forEach((node) => node.classList.remove("is-error"));
    updateFeedbackDefault();
  }

  function rejectWrongCode(cleanCode) {
    if (appState !== "idle") return;

    appState = "rejecting";
    setCode(cleanCode);
    showInputError("That code isn’t right. Try again.");
    focusInput();

    window.setTimeout(() => {
      if (appState !== "rejecting") return;

      setCode("");
      previousCode = "";
      clearInputError();
      nodes.forEach((node) => {
        node.classList.remove("is-error", "is-flash", "is-flash-fast");
      });
      syncSlots("");

      appState = "idle";
      focusInput();
    }, 280);
  }

  function flashNodes(indexes, { fast = false } = {}) {
    const duration = fast ? 480 : 1500;
    indexes.forEach((index) => {
      const node = nodes[index];
      node.classList.remove("is-flash", "is-flash-fast", "is-error");
      void node.offsetWidth;
      node.classList.add(fast ? "is-flash-fast" : "is-flash");
      window.setTimeout(() => {
        if (appState === "idle") {
          node.classList.remove("is-flash", "is-flash-fast");
        }
      }, duration);
    });
  }

  function startResendTimer() {
    window.clearInterval(resendTimer);
    updateFeedbackDefault();
    resendTimer = window.setInterval(() => {
      if (resendSeconds > 0) resendSeconds -= 1;
      updateFeedbackDefault();
      if (resendSeconds === 0) window.clearInterval(resendTimer);
    }, 1000);
  }

  /* ==========================================================
     CIRCUIT CHOREOGRAPHY
     Form square → draw wires → orbit → collapse.
     Velocity curve keeps loop two faster without a visible seam.
     ========================================================== */
  function buildVelocityLookup(sampleCount = 360) {
    const cumulative = [0];
    let total = 0;

    const velocityAt = (time) => {
      const launch = 0.18 + 0.82 * smoothstep(0, 0.085, time);
      const acceleration = 0.3 * smoothstep(0.4, 0.6, time);
      const landing = 1 - 0.9 * smoothstep(0.925, 1, time);
      return (launch + acceleration) * landing;
    };

    for (let index = 1; index <= sampleCount; index += 1) {
      const previousTime = (index - 1) / sampleCount;
      const currentTime = index / sampleCount;
      total += (velocityAt(previousTime) + velocityAt(currentTime)) / 2;
      cumulative.push(total);
    }

    return cumulative.map((value) => value / total);
  }

  function lookupProgress(lookup, time) {
    const scaled = clamp(time, 0, 1) * (lookup.length - 1);
    const index = Math.min(lookup.length - 2, Math.floor(scaled));
    const remainder = scaled - index;
    return lookup[index] + (lookup[index + 1] - lookup[index]) * remainder;
  }

  function orbitNodes(duration, signal, token) {
    const lookup = buildVelocityLookup();

    nodes.forEach((node) => {
      node.classList.remove("is-flash", "is-tracing");
      node.classList.add("is-routing");
      const path = node.querySelector(".node-trace-path");
      if (path) {
        path.style.animation = "";
        path.style.animationDelay = "";
      }
    });

    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(makeAbortError());
        return;
      }

      const startedAt = performance.now();
      let settled = false;

      const cleanUp = () => {
        signal.removeEventListener("abort", handleAbort);
        activeFrame = 0;
      };

      const handleAbort = () => {
        if (settled) return;
        settled = true;
        if (activeFrame) cancelAnimationFrame(activeFrame);
        cleanUp();
        reject(makeAbortError());
      };

      const render = (now) => {
        if (signal.aborted || token !== runToken) {
          handleAbort();
          return;
        }

        const time = clamp((now - startedAt) / duration, 0, 1);
        const travelledLoops = lookupProgress(lookup, time) * 2;
        const rotation = travelledLoops * 360;

        // Rotate the complete connected circuit as one object, then counter-rotate
        // each face so the digits stay upright and every wire remains attached.
        plane.style.transform = `rotateZ(${rotation.toFixed(3)}deg) translateZ(0px)`;

        nodes.forEach((node, index) => {
          const vertexIndex = Math.round(PHASE_OFFSETS[index] * 4) % 4;
          const point = geometry.vertices[vertexIndex];
          const wobble = time * Math.PI * 8 + index * Math.PI * 0.5;
          node.style.transform = transformNode({
            x: point.x,
            y: point.y,
            z: 3 * Math.sin(wobble),
            rx: 1.8 * Math.sin(wobble * 0.5),
            ry: 2.2 * Math.cos(wobble * 0.5),
            rz: -rotation,
            scale: 0.86,
          });
        });

        if (time < 1) {
          activeFrame = requestAnimationFrame(render);
          return;
        }

        nodes.forEach((node, index) => {
          node.style.transform = routedTransform(PHASE_OFFSETS[index]);
        });
        plane.style.transform = "rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)";
        settled = true;
        cleanUp();
        resolve();
      };

      signal.addEventListener("abort", handleAbort, { once: true });
      activeFrame = requestAnimationFrame(render);
    });
  }

  async function enterCircuit(signal, token) {
    guardRun(token, signal);
    appState = "processing";
    card.dataset.state = "processing";
    form.classList.remove("is-input-focused", "is-primed");
    input.blur();
    syncSlots(input.value);

    nodes.forEach((node, index) => {
      node.style.willChange = "transform";
      node.classList.remove("is-flash", "is-tracing");
    });

    // Restart the one square-formation trace cleanly after layout settles.
    void card.offsetWidth;
    nodes.forEach((node, index) => {
      node.classList.add("is-tracing");
      const path = node.querySelector(".node-trace-path");
      if (path) {
        path.style.animation = "none";
        void path.getBoundingClientRect();
        path.style.animation = "";
        path.style.animationDelay = `${index * 72}ms`;
      }
    });

    const planeAnimation = animateOwned(
      plane,
      [
        { transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)" },
        { offset: 0.72, transform: "rotateX(2deg) rotateY(-1deg) rotateZ(-0.6deg) translateZ(5px)" },
        { transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)" },
      ],
      { duration: 880, easing: "cubic-bezier(0.16, 1.08, 0.3, 1)" },
      signal,
    );

    const nodeAnimations = nodes.map((node, index) => {
      const destination = routedTransform(PHASE_OFFSETS[index]);
      return animateOwned(
        node,
        [
          { transform: node.style.transform },
          {
            offset: 0.74,
            transform: destination.replace("scale(0.8600)", "scale(0.9000)"),
            easing: "cubic-bezier(0.16, 1.12, 0.3, 1)",
          },
          { transform: destination },
        ],
        {
          duration: 820,
          delay: index * 34,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
        signal,
      );
    });

    const feedbackExit = animateOwned(
      feedback,
      [
        { opacity: "1", transform: "translate3d(0, 0, 0) scale(1)" },
        { opacity: "0", transform: "translate3d(0, 10px, 0) scale(0.96)" },
      ],
      { duration: 330, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      signal,
    );

    const demoExit = demoNote
      ? animateOwned(
          demoNote,
          [
            { opacity: "1", transform: "translate3d(0, 0, 0)" },
            { opacity: "0", transform: "translate3d(0, 8px, 0)" },
          ],
          { duration: 280, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
          signal,
        )
      : Promise.resolve();

    await Promise.all([planeAnimation, feedbackExit, demoExit, ...nodeAnimations]);
    guardRun(token, signal);
    layoutWires(0);
  }

  async function drawWires(signal, token) {
    guardRun(token, signal);

    // Tracing only plays while the square forms — stop it as the connecting lines begin.
    nodes.forEach((node) => {
      node.classList.remove("is-tracing", "is-flash");
      const path = node.querySelector(".node-trace-path");
      if (path) {
        path.style.animation = "";
        path.style.animationDelay = "";
      }
    });

    const drawing = wires.map((wire, index) => {
      wire.style.opacity = "1";
      wire.style.willChange = "transform";
      return animateOwned(
        wire,
        [
          { opacity: "1", transform: wire.dataset.emptyTransform },
          { opacity: "1", transform: wire.dataset.fullTransform },
        ],
        {
          duration: 440,
          delay: index * 92,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
        signal,
      );
    });

    await Promise.all(drawing);
    guardRun(token, signal);
    wires.forEach((wire) => wire.classList.add("is-live"));
  }

  async function collapseCircuit(signal, token) {
    guardRun(token, signal);
    nodes.forEach((node) => {
      node.classList.remove("is-routing", "is-tracing", "is-flash");
      node.classList.add("is-locking");
      const path = node.querySelector(".node-trace-path");
      if (path) {
        path.style.animation = "";
        path.style.animationDelay = "";
      }
    });
    wires.forEach((wire) => {
      wire.classList.remove("is-live");
    });

    await sleep(90, signal);
    guardRun(token, signal);

    const collapsingNodes = nodes.map((node, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      return animateOwned(
        node,
        [
          { opacity: "1", transform: node.style.transform },
          {
            offset: 0.72,
            opacity: "1",
            transform: transformNode({
              x: 0,
              y: 0,
              z: 54,
              rx: 42 * direction,
              ry: -34 * direction,
              rz: 56 * direction,
              scale: 0.42,
            }),
          },
          {
            opacity: "0",
            transform: transformNode({
              x: 0,
              y: 0,
              z: 78,
              rx: 82 * direction,
              ry: -65 * direction,
              rz: 112 * direction,
              scale: 0.001,
            }),
          },
        ],
        { duration: 520, easing: "cubic-bezier(0.72, 0, 0.86, 0.28)" },
        signal,
      );
    });

    const retractingWires = wires.map((wire, index) =>
      animateOwned(
        wire,
        [
          { opacity: "1", transform: wire.dataset.fullTransform },
          {
            opacity: "0.7",
            transform: collapsedWireTransform(index),
          },
        ],
        {
          duration: 360,
          delay: (wires.length - index - 1) * 28,
          easing: "cubic-bezier(0.65, 0.02, 0.82, 0.32)",
        },
        signal,
      ),
    );

    const coreFlash = animateOwned(
      collapseCore,
      [
        { opacity: "0", transform: "translate(-50%, -50%) scale(0) rotate(0deg)" },
        {
          offset: 0.68,
          opacity: "0.45",
          transform: "translate(-50%, -50%) scale(0.55) rotate(24deg)",
        },
        {
          offset: 0.86,
          opacity: "1",
          transform: "translate(-50%, -50%) scale(1.35) rotate(42deg)",
        },
        { opacity: "0", transform: "translate(-50%, -50%) scale(2.6) rotate(70deg)" },
      ],
      { duration: 550, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      signal,
    );

    await Promise.all([...collapsingNodes, ...retractingWires, coreFlash]);
    guardRun(token, signal);
  }

  /* ==========================================================
     SUCCESS + VERIFICATION RUN
     ========================================================== */
  function revealSuccess({ instant = false } = {}) {
    appState = "success";
    card.dataset.state = "success";
    card.setAttribute("aria-busy", "false");
    input.readOnly = false;
    title.textContent = "Verified successfully";
    subtitle.textContent = "Your number has been verified.";
    title.focus({ preventScroll: true });
    form.hidden = true;
    successView.hidden = false;
    successView.setAttribute("aria-hidden", "false");
    successView.classList.toggle("no-motion", instant || reduceMotion.matches);

    // Restart every CSS success animation cleanly on replay.
    successView.classList.remove("is-visible");
    void successView.offsetWidth;
    successView.classList.add("is-visible");

    liveRegion.textContent = "Verification successful";

    if (!instant && !reduceMotion.matches) {
      animateTransient(
        title,
        [
          { opacity: "0", transform: "translateY(11px) scale(0.97)" },
          { opacity: "1", transform: "translateY(0) scale(1)" },
        ],
        { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      animateTransient(
        subtitle,
        [
          { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          { opacity: "1", transform: "translateY(0) scale(1)" },
        ],
        { duration: 560, delay: 90, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    }
  }

  async function runVerification(code = input.value) {
    if (appState !== "idle") return;

    const cleanCode = sanitizeCode(code);
    if (cleanCode.length !== 4) {
      showInputError("Enter all four digits first.");
      input.focus({ preventScroll: true });
      return;
    }

    if (cleanCode !== DEMO_CODE) {
      rejectWrongCode(cleanCode);
      return;
    }

    cancelOwnedMotion();
    const token = ++runToken;
    runController = new AbortController();
    const { signal } = runController;
    appState = "filling";
    card.setAttribute("aria-busy", "true");
    input.readOnly = true;
    clearInputError();
    nodes.forEach((node) => node.classList.remove("is-error", "is-flash", "is-flash-fast"));
    liveRegion.textContent = "Verifying code";

    setCode(cleanCode);

    try {
      if (reduceMotion.matches) {
        card.dataset.state = "processing";
        await sleep(120, signal);
        guardRun(token, signal);
        revealSuccess({ instant: true });
        return;
      }

      await sleep(160, signal);
      guardRun(token, signal);
      await enterCircuit(signal, token);
      guardRun(token, signal);
      // Hold until the square-formation traces finish (1.4s + stagger).
      await sleep(780, signal);
      await drawWires(signal, token);
      guardRun(token, signal);
      await sleep(95, signal);
      await orbitNodes(1680, signal, token);
      guardRun(token, signal);
      await sleep(120, signal);
      await collapseCircuit(signal, token);
      guardRun(token, signal);
      revealSuccess();
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Verification animation failed:", error);
        resetExperience({ shouldFocus: true });
        showInputError("Verification was interrupted. Please try again.");
      }
    } finally {
      if (token === runToken && appState !== "success") {
        card.setAttribute("aria-busy", "false");
        input.readOnly = false;
      }
    }
  }

  /* ==========================================================
     RESET + SKIP
     ========================================================== */
  function resetExperience({ shouldFocus = true } = {}) {
    runToken += 1;
    cancelOwnedMotion();
    runController = null;
    appState = "idle";
    previousCode = "";

    card.dataset.state = "idle";
    card.setAttribute("aria-busy", "false");
    title.textContent = originalCopy.title;
    subtitle.innerHTML = originalCopy.subtitleHTML;
    input.readOnly = false;
    input.removeAttribute("aria-invalid");
    form.hidden = false;
    form.classList.remove("is-input-focused", "is-primed");
    successView.hidden = true;
    successView.setAttribute("aria-hidden", "true");
    successView.classList.remove("is-visible", "no-motion");
    resendButton.hidden = false;
    liveRegion.textContent = "";
    continueButton.querySelector("span").textContent = "Continue";
    continueButton.querySelector("i").textContent = "→";
    setCode("");

    [plane, feedback, demoNote, collapseCore, title, subtitle].forEach((element) => {
      element?.removeAttribute("style");
    });

    nodes.forEach((node) => {
      node.removeAttribute("style");
      node.classList.remove("is-routing", "is-tracing", "is-flash", "is-flash-fast", "is-locking", "is-error");
      const path = node.querySelector(".node-trace-path");
      if (path) path.removeAttribute("style");
    });

    digits.forEach((digit) => digit.removeAttribute("style"));

    wires.forEach((wire) => {
      wire.removeAttribute("style");
      wire.classList.remove("is-live");
    });

    updateFeedbackDefault();

    requestAnimationFrame(() => {
      layoutIdleScene();
      syncSlots("");
      if (shouldFocus) {
        focusInput();
      } else {
        form.classList.add("is-primed");
      }
    });
  }

  function skipToSuccess() {
    if (!["filling", "processing"].includes(appState)) return;
    runToken += 1;
    cancelOwnedMotion();
    runController = null;
    revealSuccess({ instant: reduceMotion.matches });
  }

  /* ==========================================================
     EVENTS
     ========================================================== */
  input.addEventListener("focus", () => {
    if (appState === "idle") {
      form.classList.remove("is-primed");
      form.classList.add("is-input-focused");
      syncSlots(input.value);
    }
  });

  input.addEventListener("blur", () => {
    form.classList.remove("is-input-focused");
  });

  input.addEventListener("input", () => {
    if (appState !== "idle") return;
    const oldValue = previousCode;
    const cleanValue = sanitizeCode(input.value);
    if (cleanValue !== input.value) input.value = cleanValue;
    clearInputError();
    syncSlots(cleanValue);

    const changedIndexes = [];
    digits.forEach((digit, index) => {
      if (cleanValue[index] && cleanValue[index] !== oldValue[index]) {
        changedIndexes.push(index);
        animateTransient(
          digit,
          [
            { opacity: "0", transform: "translateZ(12px) translateY(7px) scale(0.72)", color: "#7af5e8" },
            { offset: 0.66, opacity: "1", transform: "translateZ(14px) translateY(-1px) scale(1.09)", color: "#e8f7ff" },
            { opacity: "1", transform: "translateZ(12px) translateY(0) scale(1)", color: "#f2f4f3" },
          ],
          { duration: 280, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
        );
      }
    });

    if (changedIndexes.length) {
      const isBatch = changedIndexes.length > 1 || cleanValue.length - oldValue.length > 1;
      flashNodes(changedIndexes, { fast: isBatch });
    }

    if (cleanValue.length === 4 && oldValue.length < 4) {
      window.setTimeout(() => runVerification(cleanValue), isBatchDelay(changedIndexes.length));
    }
  });

  function isBatchDelay(changedCount) {
    return changedCount > 1 ? 320 : 120;
  }

  ["click", "keyup", "select"].forEach((eventName) => {
    input.addEventListener(eventName, () => {
      if (appState === "idle") syncSlots(input.value);
    });
  });

  nodes.forEach((node, index) => {
    node.addEventListener("pointerdown", (event) => {
      if (appState !== "idle") return;
      event.preventDefault();
      input.focus({ preventScroll: true });
      const position = Math.min(index, input.value.length);
      const selectionEnd = index < input.value.length ? position + 1 : position;
      try {
        input.setSelectionRange(position, selectionEnd);
      } catch {
        // Keep the field focused if selection placement is unsupported.
      }
      syncSlots(input.value);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runVerification(input.value);
  });

  resendButton.addEventListener("click", () => {
    if (resendButton.disabled) return;
    resendSeconds = 24;
    startResendTimer();
    liveRegion.textContent = "A new verification code has been sent";
    animateTransient(
      demoNote,
      [
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: "1" },
        { transform: "translate3d(0, -2px, 0) scale(1.02)", opacity: "1" },
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: "1" },
      ],
      { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  });

  continueButton.addEventListener("click", () => {
    const label = continueButton.querySelector("span");
    const arrow = continueButton.querySelector("i");
    label.textContent = "Complete";
    arrow.textContent = "✓";
    liveRegion.textContent = "Ready to continue";
    window.dispatchEvent(new CustomEvent("code-candy:continue", { detail: { verified: true } }));

    animateTransient(
      continueButton,
      [
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(1px) scale(0.975)" },
        { transform: "translateY(0) scale(1.012)" },
        { transform: "translateY(0) scale(1)" },
      ],
      { duration: 440, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && ["filling", "processing"].includes(appState)) {
      event.preventDefault();
      skipToSuccess();
      return;
    }

    // Keep typing available without clicking a box first.
    if (
      appState === "idle" &&
      document.activeElement !== input &&
      /^[0-9]$/.test(event.key) &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      event.preventDefault();
      focusInput();
      const next = sanitizeCode(input.value + event.key);
      if (next === input.value) return;
      input.value = next;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  const handleMotionPreference = () => {
    if (reduceMotion.matches && ["filling", "processing"].includes(appState)) {
      skipToSuccess();
    }
  };

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", handleMotionPreference);
  } else {
    reduceMotion.addListener(handleMotionPreference);
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = scene.clientWidth;
      if (!nextWidth) return;

      if (
        lastSceneWidth &&
        Math.abs(nextWidth - lastSceneWidth) > 2 &&
        ["filling", "processing"].includes(appState)
      ) {
        skipToSuccess();
        return;
      }

      if (appState === "idle") layoutIdleScene();
    });
    resizeObserver.observe(scene);
  } else {
    window.addEventListener("resize", () => {
      if (appState === "idle") layoutIdleScene();
    });
  }

  /* ==========================================================
     INIT
     ========================================================== */
  layoutIdleScene();
  syncSlots("");
  startResendTimer();
  focusInput();
  document.body.classList.add("is-ready");
})();
