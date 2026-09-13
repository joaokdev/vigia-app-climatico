"use client";

import { useEffect, useRef } from "react";
import "./day-night-toggle.css";
import { useTheme } from "@/lib/theme/theme-provider";

/**
 * Efeito de terceiro "Day Night Window Toggle" — código de referência
 * fornecido pelo proprietário do projeto. CSS e animações preservados
 * sem alteração de cor/comportamento (apenas namespacing de seletores,
 * necessário para conviver com o resto do app). Removido apenas o
 * fundo ambiente de página inteira (`.page-backdrop`) e o wrapper de
 * vitrine em viewport cheio (`.showcase`) do pacote original — isso é
 * "lugar", não o efeito em si — e a marca do autor do pacote no
 * cabeçalho, substituída pelo texto do próprio VIGIA em português.
 *
 * A lógica de script.js foi portada de forma fiel (mesmos parâmetros
 * de CONFIG, mesmos cálculos de nuvens/estrelas/pássaros/estrelas
 * cadentes), adaptada para React (refs em vez de getElementById) e
 * conectada ao ThemeProvider real do VIGIA em vez de gerenciar seu
 * próprio localStorage isolado — assim ele passa a ser um controle
 * de tema de verdade, não apenas decorativo.
 */

const CONFIG = {
  starCount: 55,
  twinkleRatio: 0.45,
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

const MODE_COPY = {
  day: {
    icon: "\u2600\uFE0E",
    text: "Modo claro",
    hint: "Toque para alternar",
    label: "Modo claro. Toque na janela para mudar para o modo escuro.",
  },
  night: {
    icon: "\u263E\uFE0E",
    text: "Modo escuro",
    hint: "Toque para alternar",
    label: "Modo escuro. Toque na janela para mudar para o modo claro.",
  },
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

export function DayNightWindowToggle() {
  const { resolved, setPreference } = useTheme();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const starsLayerRef = useRef<HTMLSpanElement>(null);
  const birdsLayerRef = useRef<HTMLSpanElement>(null);
  const shootingStarsLayerRef = useRef<HTMLSpanElement>(null);
  const modeIconRef = useRef<HTMLSpanElement>(null);
  const modeTextRef = useRef<HTMLSpanElement>(null);
  const modeHintRef = useRef<HTMLParagraphElement>(null);

  // Estado interno da simulação (nuvens/estrelas/pássaros), montado
  // uma única vez e mantido em refs para não recriar em cada render.
  const stateRef = useRef<{
    clouds: HTMLElement[];
    stars: HTMLElement[];
    cloudWindy: boolean[];
    starWindy: boolean[];
    flockTimer: number | null;
    shootingStarTimer: number | null;
  }>({
    clouds: [],
    stars: [],
    cloudWindy: [],
    starWindy: [],
    flockTimer: null,
    shootingStarTimer: null,
  });

  // Monta o campo de estrelas e os listeners de proximidade uma vez.
  useEffect(() => {
    const toggle = toggleRef.current;
    const starsLayer = starsLayerRef.current;
    if (!toggle || !starsLayer) return;

    const state = stateRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Campo de estrelas
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
    state.stars = [...starsLayer.querySelectorAll<HTMLElement>(".star")];
    state.starWindy = state.stars.map(() => false);

    state.clouds = [...toggle.querySelectorAll<HTMLElement>(".cloud")];
    state.cloudWindy = state.clouds.map(() => false);

    function isNightMode() {
      return toggle!.classList.contains("is-night");
    }

    function distanceToRect(x: number, y: number, rect: { left: number; right: number; top: number; bottom: number }) {
      const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
      const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
      return Math.hypot(dx, dy);
    }
    function cloudHitRect(cloud: HTMLElement) {
      const rect = cloud.getBoundingClientRect();
      const padSide = Math.max(rect.width * 0.32, 22);
      const padTop = Math.max(rect.width * 0.36, 32);
      return { left: rect.left - padSide, right: rect.right + padSide, top: rect.top - padTop, bottom: rect.bottom + 10 };
    }
    function starHitRect(star: HTMLElement) {
      const rect = star.getBoundingClientRect();
      const pad = 18;
      return { left: rect.left - pad, right: rect.right + pad, top: rect.top - pad, bottom: rect.bottom + pad };
    }
    function setPlaybackRate(el: HTMLElement, animationName: string, rate: number) {
      el.getAnimations().forEach((anim) => {
        if ((anim as unknown as { animationName?: string }).animationName === animationName) {
          anim.playbackRate = rate;
        }
      });
    }
    function setWindy(el: HTMLElement, windyState: boolean[], index: number, isWindy: boolean, animationName: string, boostRate: number) {
      if (windyState[index] === isWindy) return;
      windyState[index] = isWindy;
      setPlaybackRate(el, animationName, isWindy ? boostRate : 1);
    }

    function onPointerMove(event: PointerEvent | MouseEvent) {
      const { clientX, clientY } = event;
      state.clouds.forEach((cloud, index) => {
        const dist = distanceToRect(clientX, clientY, cloudHitRect(cloud));
        const limit = state.cloudWindy[index] ? CONFIG.cloudFar : CONFIG.cloudNear;
        setWindy(cloud, state.cloudWindy, index, dist < limit, "dn-cloudDrift", CONFIG.cloudDriftBoost);
      });
      if (isNightMode()) {
        state.stars.forEach((star, index) => {
          if (!star.classList.contains("star--twinkle")) return;
          const dist = distanceToRect(clientX, clientY, starHitRect(star));
          const limit = state.starWindy[index] ? CONFIG.starFar : CONFIG.starNear;
          setWindy(star, state.starWindy, index, dist < limit, "dn-twinkle", CONFIG.starTwinkleBoost);
        });
      }
    }
    function onPointerLeave() {
      state.clouds.forEach((cloud, index) => setWindy(cloud, state.cloudWindy, index, false, "dn-cloudDrift", CONFIG.cloudDriftBoost));
      state.stars.forEach((star, index) => {
        if (!star.classList.contains("star--twinkle")) return;
        setWindy(star, state.starWindy, index, false, "dn-twinkle", CONFIG.starTwinkleBoost);
      });
    }
    function onCloudIteration(event: Event) {
      const ev = event as AnimationEvent;
      if (ev.animationName !== "dn-cloudDrift") return;
      const cloud = ev.currentTarget as HTMLElement;
      cloud.classList.toggle("is-dormant", Math.random() >= CONFIG.cloudSpawnChance);
    }

    toggle.addEventListener("mousemove", onPointerMove);
    toggle.addEventListener("mouseleave", onPointerLeave);
    state.clouds.forEach((cloud) => cloud.addEventListener("animationiteration", onCloudIteration));

    function clearBirds() {
      if (state.flockTimer) window.clearTimeout(state.flockTimer);
      state.flockTimer = null;
      birdsLayerRef.current?.replaceChildren();
    }
    function scheduleNextFlock(delayOverride?: number) {
      if (state.flockTimer) window.clearTimeout(state.flockTimer);
      state.flockTimer = null;
      if (!birdsLayerRef.current || isNightMode() || prefersReducedMotion.matches) return;
      const delay = delayOverride ?? randomBetween(CONFIG.flockMinDelay, CONFIG.flockMaxDelay);
      state.flockTimer = window.setTimeout(() => {
        createBirdFlock();
        scheduleNextFlock();
      }, delay);
    }
    function createBirdFlock() {
      const birdsLayer = birdsLayerRef.current;
      if (!birdsLayer || isNightMode() || prefersReducedMotion.matches) return;
      const flock = document.createElement("span");
      const birdCount = randomInt(CONFIG.flockMinBirds, CONFIG.flockMaxBirds);
      const direction = Math.random() < 0.5 ? 1 : -1;
      const travel = toggle!.getBoundingClientRect().width + 240;
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

    function clearShootingStars() {
      if (state.shootingStarTimer) window.clearTimeout(state.shootingStarTimer);
      state.shootingStarTimer = null;
      shootingStarsLayerRef.current?.replaceChildren();
    }
    function scheduleNextShootingStar(delayOverride?: number) {
      if (state.shootingStarTimer) window.clearTimeout(state.shootingStarTimer);
      state.shootingStarTimer = null;
      if (!shootingStarsLayerRef.current || !isNightMode() || prefersReducedMotion.matches) return;
      const delay = delayOverride ?? randomBetween(CONFIG.shootingStarMinDelay, CONFIG.shootingStarMaxDelay);
      state.shootingStarTimer = window.setTimeout(() => {
        createShootingStar();
        scheduleNextShootingStar();
      }, delay);
    }
    function createShootingStar() {
      const layer = shootingStarsLayerRef.current;
      if (!layer || !isNightMode() || prefersReducedMotion.matches) return;
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
      layer.appendChild(shootingStar);
    }

    // expõe os agendadores para o efeito de sincronização de tema, via propriedade no DOM node
    (toggle as unknown as Record<string, unknown>).__dnHandlers = {
      clearBirds,
      scheduleNextFlock,
      clearShootingStars,
      scheduleNextShootingStar,
    };

    scheduleNextFlock(CONFIG.firstAmbientDelay);

    return () => {
      toggle.removeEventListener("mousemove", onPointerMove);
      toggle.removeEventListener("mouseleave", onPointerLeave);
      state.clouds.forEach((cloud) => cloud.removeEventListener("animationiteration", onCloudIteration));
      if (state.flockTimer) window.clearTimeout(state.flockTimer);
      if (state.shootingStarTimer) window.clearTimeout(state.shootingStarTimer);
    };
  }, []);

  // Aplica a transição visual dia/noite sempre que o tema resolvido mudar
  // (clique neste próprio widget OU mudança pelo alternador do cabeçalho).
  useEffect(() => {
    const toggle = toggleRef.current;
    if (!toggle) return;
    const isNight = resolved === "dark";
    const copy = isNight ? MODE_COPY.night : MODE_COPY.day;

    toggle.classList.toggle("is-night", isNight);
    toggle.setAttribute("aria-pressed", String(isNight));
    toggle.setAttribute("aria-label", copy.label);
    if (modeIconRef.current) modeIconRef.current.textContent = copy.icon;
    if (modeTextRef.current) modeTextRef.current.textContent = copy.text;
    if (modeHintRef.current) modeHintRef.current.textContent = copy.hint;

    const handlers = (toggle as unknown as Record<string, unknown>).__dnHandlers as
      | {
          clearBirds: () => void;
          scheduleNextFlock: (d?: number) => void;
          clearShootingStars: () => void;
          scheduleNextShootingStar: (d?: number) => void;
        }
      | undefined;
    if (!handlers) return;
    if (isNight) {
      handlers.clearBirds();
      handlers.scheduleNextShootingStar(CONFIG.firstAmbientDelay);
    } else {
      handlers.clearShootingStars();
      handlers.scheduleNextFlock(CONFIG.firstAmbientDelay);
    }
  }, [resolved]);

  function handleToggle() {
    setPreference(resolved === "dark" ? "light" : "dark");
  }

  return (
    <div className="dn-root">
      <section className="appearance-widget" aria-labelledby="vigiaAppearanceTitle">
        <div className="appearance-widget__glow" aria-hidden="true" />
        <header className="appearance-widget__header">
          <div>
            <h2 className="appearance-widget__title" id="vigiaAppearanceTitle">
              Aparência
            </h2>
          </div>
        </header>

        <div className="appearance-widget__scene">
          <button
            ref={toggleRef}
            className="window-toggle"
            type="button"
            aria-pressed="false"
            aria-label="Modo claro. Toque na janela para mudar para o modo escuro."
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                handleToggle();
              }
            }}
          >
            <span className="window-toggle__shadow" aria-hidden="true" />
            <span className="window-toggle__frame">
              <span className="window-toggle__view">
                <span className="sky" aria-hidden="true">
                  <span className="sky__ambient sky__ambient--day" />
                  <span className="sky__ambient sky__ambient--night" />
                  <span className="sky__horizon" />
                </span>

                <span className="celestial celestial--sun" aria-hidden="true">
                  <span className="celestial__core" />
                  <span className="celestial__halo" />
                  <span className="celestial__rays" />
                </span>

                <span className="celestial celestial--moon" aria-hidden="true">
                  <span className="celestial__core" />
                  <span className="celestial__halo" />
                  <span className="celestial__crater celestial__crater--1" />
                  <span className="celestial__crater celestial__crater--2" />
                  <span className="celestial__crater celestial__crater--3" />
                </span>

                <span className="clouds" aria-hidden="true">
                  <span className="cloud cloud--1" />
                  <span className="cloud cloud--2" />
                  <span className="cloud cloud--3" />
                  <span className="cloud cloud--4" />
                  <span className="cloud cloud--5" />
                  <span className="cloud cloud--6" />
                  <span className="cloud cloud--7" />
                </span>

                <span className="birds" ref={birdsLayerRef} aria-hidden="true" />
                <span className="stars" ref={starsLayerRef} aria-hidden="true" />
                <span className="shooting-stars" ref={shootingStarsLayerRef} aria-hidden="true" />

                <span className="window-toggle__interior-vignette" aria-hidden="true" />
                <span className="window-toggle__glass" aria-hidden="true" />
                <span className="window-toggle__reflection" aria-hidden="true" />
                <span className="window-toggle__sheen" aria-hidden="true" />
                <span className="window-toggle__condensation" aria-hidden="true" />
              </span>
              <span className="window-toggle__sill" aria-hidden="true" />
            </span>
          </button>
        </div>

        <footer className="appearance-widget__footer">
          <div className="mode-status" aria-live="polite">
            <span className="mode-status__icon" ref={modeIconRef} aria-hidden="true">
              {"\u2600\uFE0E"}
            </span>
            <span className="mode-status__text" ref={modeTextRef}>
              Modo claro
            </span>
          </div>
          <p className="mode-status__hint" ref={modeHintRef}>
            Toque para alternar
          </p>
        </footer>
      </section>
    </div>
  );
}
