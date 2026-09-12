/**
 * Vault — Visualizer
 * Single SVG scene + GSAP master timeline.
 * Scrubs forward/backward: empty → paperclip → padlock → deadbolt → vault.
 */

(function (global) {
  "use strict";

  const Vault = (global.Vault = global.Vault || {});

  /* ==========================================================
     GEOMETRY CONSTANTS
     ========================================================== */
  const CX = 280;
  const CY = 280;
  const ORIGIN = CX + " " + CY;

  /* ==========================================================
     HELPERS
     ========================================================== */
  function prefersReducedMotion() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function prepStroke(el) {
    if (!el) return 0;
    let length = 0;
    try {
      length = el.getTotalLength();
    } catch (err) {
      length = 120;
    }
    gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
    return length;
  }

  /* ==========================================================
     CREATE VISUALIZER
     ========================================================== */
  function createVisualizer(svg) {
    if (!svg || typeof gsap === "undefined") {
      return {
        setTier: function () {},
        destroy: function () {},
        timeline: null,
      };
    }

    /* —— SVG refs —— */
    const root = svg;
    const emptyGroup = root.querySelector("#vv-empty");
    const clipGroup = root.querySelector("#vv-paperclip");
    const clipPath = root.querySelector("#vv-clip-path");
    const padGroup = root.querySelector("#vv-padlock");
    const padBody = root.querySelector("#vv-pad-body");
    const padFace = root.querySelector("#vv-pad-face");
    const padShackle = root.querySelector("#vv-pad-shackle");
    const padKeyhole = root.querySelector("#vv-pad-keyhole");
    const deadGroup = root.querySelector("#vv-deadbolt");
    const deadOuter = root.querySelector("#vv-dead-outer");
    const deadInner = root.querySelector("#vv-dead-inner");
    const deadCylinder = root.querySelector("#vv-dead-cylinder");
    const deadSlot = root.querySelector("#vv-dead-slot");
    const deadRing = root.querySelector("#vv-dead-ring");
    const deadBolts = root.querySelectorAll(".vv-dead-bolt");
    const vaultGroup = root.querySelector("#vv-vault");
    const vaultOuter = root.querySelector("#vv-vault-outer");
    const vaultMid = root.querySelector("#vv-vault-mid");
    const vaultDoor = root.querySelector("#vv-vault-door");
    const vaultHub = root.querySelector("#vv-vault-hub");
    const vaultSpokes = root.querySelector("#vv-vault-spokes");
    const vaultBolts = Array.prototype.slice.call(root.querySelectorAll(".vv-vault-bolt"));
    const vaultAccent = root.querySelectorAll(".vv-vault-accent");
    const vaultGroove = root.querySelector("#vv-vault-groove");

    const clipLen = prepStroke(clipPath);
    const shackleLen = prepStroke(padShackle);

    let master = null;
    let activeTween = null;
    let currentTier = 0;

    // Radial offset for vault bolts so they slide into place
    const boltOffsets = vaultBolts.map(function (bolt) {
      const bb = bolt.getBBox();
      const bx = bb.x + bb.width / 2;
      const by = bb.y + bb.height / 2;
      const dx = bx - CX;
      const dy = by - CY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      return {
        el: bolt,
        x: (dx / len) * 14,
        y: (dy / len) * 14,
      };
    });

    /* —— Initial state (tier 0 / empty) —— */
    function setInitialState() {
      gsap.set(emptyGroup, { autoAlpha: 1, scale: 1, svgOrigin: ORIGIN });

      gsap.set(clipGroup, {
        autoAlpha: 0,
        scale: 0.92,
        rotation: -8,
        svgOrigin: ORIGIN,
      });
      if (clipPath) gsap.set(clipPath, { strokeDashoffset: clipLen });

      gsap.set(padGroup, { autoAlpha: 0, svgOrigin: ORIGIN });
      gsap.set([padBody, padFace, padKeyhole], {
        autoAlpha: 0,
        scale: 0.55,
        svgOrigin: ORIGIN,
      });
      if (padShackle) {
        gsap.set(padShackle, {
          strokeDashoffset: shackleLen,
          y: -18,
          svgOrigin: ORIGIN,
        });
      }

      gsap.set(deadGroup, { autoAlpha: 0, svgOrigin: ORIGIN });
      gsap.set([deadOuter, deadRing], {
        scale: 0.2,
        autoAlpha: 0,
        svgOrigin: ORIGIN,
      });
      gsap.set(deadInner, { scale: 0.15, autoAlpha: 0, svgOrigin: ORIGIN });
      gsap.set(deadCylinder, {
        scale: 0.3,
        autoAlpha: 0,
        rotation: -90,
        svgOrigin: ORIGIN,
      });
      gsap.set(deadSlot, { autoAlpha: 0, scaleY: 0.2, svgOrigin: ORIGIN });
      gsap.set(deadBolts, { scale: 0, autoAlpha: 0, svgOrigin: ORIGIN });

      gsap.set(vaultGroup, { autoAlpha: 0, scale: 1, svgOrigin: ORIGIN });
      gsap.set([vaultOuter, vaultMid, vaultDoor, vaultGroove], {
        scale: 0.35,
        autoAlpha: 0,
        svgOrigin: ORIGIN,
      });
      gsap.set(vaultHub, {
        scale: 0.2,
        autoAlpha: 0,
        rotation: 0,
        svgOrigin: ORIGIN,
      });
      gsap.set(vaultSpokes, {
        scale: 0.2,
        autoAlpha: 0,
        rotation: -40,
        svgOrigin: ORIGIN,
      });

      boltOffsets.forEach(function (b) {
        gsap.set(b.el, {
          autoAlpha: 0,
          x: b.x,
          y: b.y,
          scale: 0.7,
          svgOrigin: ORIGIN,
        });
      });

      gsap.set(vaultAccent, { autoAlpha: 0 });
    }

    /* —— Master timeline —— */
    function buildTimeline() {
      setInitialState();

      const tl = gsap.timeline({ paused: true });

      // —— EMPTY ——
      tl.addLabel("empty", 0);

      // —— PAPERCLIP ——
      tl.to(emptyGroup, { autoAlpha: 0, duration: 0.35, ease: "power2.inOut" }, 0.05)
        .to(
          clipGroup,
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.55, ease: "power2.out" },
          0.1
        )
        .to(clipPath, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, 0.15)
        .to(
          clipGroup,
          { rotation: 3, duration: 0.26, ease: "power2.out", yoyo: true, repeat: 1 },
          0.78
        )
        .addLabel("paperclip", 1.05);

      // —— PADLOCK ——
      tl.to(
          clipGroup,
          { autoAlpha: 0, scale: 0.72, rotation: 14, duration: 0.4, ease: "power2.in" },
          1.1
        )
        .to(emptyGroup, { autoAlpha: 0, duration: 0.28, ease: "power2.inOut" }, 1.1)
        .set(padGroup, { autoAlpha: 1 }, 1.2)
        .to(
          [padBody, padFace],
          { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out", stagger: 0.04 },
          1.25
        )
        .to(padShackle, { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, 1.35)
        .to(padShackle, { y: 0, duration: 0.32, ease: "power3.inOut" }, 1.72)
        .to(
          padKeyhole,
          { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out" },
          1.85
        )
        .addLabel("padlock", 2.2);

      // —— DEADBOLT ——
      tl.to(
          [padBody, padFace, padKeyhole, padShackle],
          { autoAlpha: 0, scale: 0.88, duration: 0.35, ease: "power2.in" },
          2.25
        )
        .to(padGroup, { autoAlpha: 0, duration: 0.18 }, 2.48)
        .set(deadGroup, { autoAlpha: 1 }, 2.35)
        .to(deadOuter, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, 2.4)
        .to(deadRing, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, 2.5)
        .to(deadInner, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 2.55)
        .to(
          deadCylinder,
          { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.55, ease: "power3.inOut" },
          2.6
        )
        .to(deadSlot, { autoAlpha: 1, scaleY: 1, duration: 0.3, ease: "power2.out" }, 2.85)
        .to(
          deadBolts,
          { scale: 1, autoAlpha: 1, duration: 0.35, ease: "power2.out", stagger: 0.04 },
          2.9
        )
        .addLabel("deadbolt", 3.35);

      // —— VAULT ——
      tl.to(
          [deadOuter, deadRing, deadInner, deadCylinder, deadSlot],
          { autoAlpha: 0, scale: 1.1, duration: 0.35, ease: "power2.in" },
          3.4
        )
        .to(deadBolts, { autoAlpha: 0, scale: 0.75, duration: 0.25, ease: "power2.in" }, 3.4)
        .to(deadGroup, { autoAlpha: 0, duration: 0.12 }, 3.62)
        .set(vaultGroup, { autoAlpha: 1 }, 3.5)
        .to(vaultOuter, { scale: 1, autoAlpha: 1, duration: 0.55, ease: "power3.out" }, 3.55)
        .to(vaultMid, { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, 3.7)
        .to(
          [vaultDoor, vaultGroove],
          { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" },
          3.8
        )
        .to(vaultHub, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "power3.out" }, 3.9)
        .to(
          vaultSpokes,
          { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.55, ease: "power3.inOut" },
          3.95
        );

      boltOffsets.forEach(function (b, i) {
        tl.to(
          b.el,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.38,
            ease: "power2.out",
          },
          4.15 + i * 0.03
        );
      });

      tl.to(
          vaultAccent,
          { autoAlpha: 1, duration: 0.35, ease: "power2.out", stagger: 0.04 },
          4.35
        )
        .to(vaultHub, { rotation: 14, duration: 0.4, ease: "power2.inOut" }, 4.4)
        .to(
          vaultGroup,
          { scale: 1.012, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 },
          4.55
        )
        .addLabel("vault", 4.85);

      return tl;
    }

    master = buildTimeline();

    /* —— Public controls —— */
    function setTier(tierIndex, options) {
      const opts = options || {};
      const index = Math.max(0, Math.min(4, Number(tierIndex) || 0));
      const label = Vault.tiers.TIER_LABELS[index] || "empty";
      const reduced = prefersReducedMotion() || opts.instant;

      if (activeTween) {
        activeTween.kill();
        activeTween = null;
      }

      currentTier = index;

      if (reduced) {
        master.pause();
        master.seek(label);
        return;
      }

      activeTween = master.tweenTo(label, {
        duration: opts.duration != null ? opts.duration : 0.9,
        ease: opts.ease || "power2.inOut",
        onComplete: function () {
          activeTween = null;
        },
      });
    }

    function destroy() {
      if (activeTween) {
        activeTween.kill();
        activeTween = null;
      }
      if (master) {
        master.kill();
        master = null;
      }
      gsap.killTweensOf(root.querySelectorAll("*"));
    }

    master.pause(0);

    return {
      setTier: setTier,
      destroy: destroy,
      getTier: function () {
        return currentTier;
      },
      timeline: master,
    };
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */
  Vault.visualizer = {
    createVisualizer: createVisualizer,
    prefersReducedMotion: prefersReducedMotion,
  };
})(typeof window !== "undefined" ? window : globalThis);
