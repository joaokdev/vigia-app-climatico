"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "./ripple-button.css";

/**
 * Efeito de terceiro "Water Ripple" (pacote hover-buttons-part-5 —
 * este é o pacote explicitamente citado no VIGIA_MASTER_PROMPT.md
 * para microinterações). Simulação de heightfield de duas texturas
 * (clássica onda 2D): o cursor arrasta uma esteira de ondas, gotas
 * de "chuva" ambiente mantêm a superfície viva enquanto o botão
 * está em hover. A matemática de propagação de onda e o
 * sombreamento por inclinação (slope-based lighting) são copiados
 * do script.js original; a única mudança é a adição de um
 * destroy() para não deixar o loop de animação rodando para
 * sempre após o componente desmontar (o script original foi
 * escrito para uma página estática que nunca desmonta).
 *
 * Escolhido para ações relacionadas a rio/água no VIGIA — a
 * simulação É literalmente ondulação de superfície de água.
 */

function createSurface(
  btn: HTMLElement,
  canvas: HTMLCanvasElement,
  onResize: (w: number, h: number) => void
) {
  const ctx = canvas.getContext("2d");
  const buf = document.createElement("canvas");
  const bufCtx = buf.getContext("2d");
  if (!ctx || !bufCtx) return null;

  const state = {
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    w: 0,
    h: 0,
    img: null as ImageData | null,
  };

  const resize = () => {
    const w = btn.offsetWidth;
    const h = btn.offsetHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * state.dpr);
    canvas.height = Math.round(h * state.dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    buf.width = w;
    buf.height = h;
    state.w = w;
    state.h = h;
    state.img = bufCtx.createImageData(w, h);
    onResize(w, h);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(btn);
  resize();
  return { ctx, buf, bufCtx, state, observer };
}

class RippleEngine {
  btn: HTMLElement;
  cx = -999;
  cy = -999;
  active = false;
  prevX = -999;
  prevY = -999;
  lastDrop = 0;
  destroyed = false;
  cur: Float32Array | null = null;
  prev: Float32Array | null = null;
  surface: ReturnType<typeof createSurface>;

  private onMove = (e: MouseEvent) => {
    const r = this.btn.getBoundingClientRect();
    this.cx = e.clientX - r.left;
    this.cy = e.clientY - r.top;
  };
  private onEnter = (e: MouseEvent) => {
    this.active = true;
    this.btn.classList.add("is-active");
    const r = this.btn.getBoundingClientRect();
    this.cx = e.clientX - r.left;
    this.cy = e.clientY - r.top;
    this.prevX = this.cx;
    this.prevY = this.cy;
    this.splash(this.cx, this.cy, 2.4);
  };
  private onLeave = () => {
    this.active = false;
    this.btn.classList.remove("is-active");
  };

  constructor(btn: HTMLElement, canvas: HTMLCanvasElement) {
    this.btn = btn;
    this.surface = createSurface(btn, canvas, (w, h) => this.build(w, h));
    if (!this.surface) return;

    btn.addEventListener("mousemove", this.onMove);
    btn.addEventListener("mouseenter", this.onEnter);
    btn.addEventListener("mouseleave", this.onLeave);

    this.loop();
  }

  build(w: number, h: number) {
    if (!w || !h) return;
    this.cur = new Float32Array(w * h);
    this.prev = new Float32Array(w * h);
  }

  splash(x: number, y: number, power: number) {
    if (!this.surface || !this.prev) return;
    const { w: W, h: H } = this.surface.state;
    const R = 3;
    const ix = Math.round(x), iy = Math.round(y);
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const px = ix + dx, py = iy + dy;
        if (px < 1 || px >= W - 1 || py < 1 || py >= H - 1) continue;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > R) continue;
        this.prev[py * W + px] -= power * (1 - d / R);
      }
    }
  }

  loop() {
    if (this.destroyed) return;
    const surface = this.surface;
    if (!surface) return;
    const { ctx, state } = surface;
    const { w: W, h: H } = state;
    if (!W || !this.cur) {
      requestAnimationFrame(() => this.loop());
      return;
    }

    const now = performance.now();

    if (this.active) {
      const dx = this.cx - this.prevX;
      const dy = this.cy - this.prevY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.min(6, Math.max(1, Math.round(dist / 3)));
      for (let i = 1; i <= steps; i++) {
        this.splash(this.prevX + (dx * i) / steps, this.prevY + (dy * i) / steps, 0.9);
      }
      this.prevX = this.cx;
      this.prevY = this.cy;

      if (now - this.lastDrop > 420) {
        this.lastDrop = now;
        this.splash(4 + Math.random() * (W - 8), 4 + Math.random() * (H - 8), 1.6);
      }
    }

    const cur = this.cur, prev = this.prev!;
    const damping = 0.972;
    let energy = 0;
    for (let y = 1; y < H - 1; y++) {
      const row = y * W;
      for (let x = 1; x < W - 1; x++) {
        const i = row + x;
        const v = ((prev[i - 1] + prev[i + 1] + prev[i - W] + prev[i + W]) * 0.5 - cur[i]) * damping;
        cur[i] = v;
        energy += v > 0 ? v : -v;
      }
    }
    this.cur = prev;
    this.prev = cur;

    ctx.clearRect(0, 0, W, H);

    if (energy < 4 && !this.active) {
      requestAnimationFrame(() => this.loop());
      return;
    }

    const data = state.img!.data;
    const curNow = this.cur;
    for (let y = 0; y < H; y++) {
      const row = y * W;
      for (let x = 0; x < W; x++) {
        const i = row + x;
        const xl = x > 0 ? curNow[i - 1] : 0;
        const xr = x < W - 1 ? curNow[i + 1] : 0;
        const slope = xr - xl;

        const j = i * 4;
        if (slope > 0.04) {
          const a = Math.min(0.85, slope * 0.5);
          data[j] = 170;
          data[j + 1] = 220;
          data[j + 2] = 255;
          data[j + 3] = a * 255;
        } else if (slope < -0.04) {
          const a = Math.min(0.6, -slope * 0.35);
          data[j] = 4;
          data[j + 1] = 18;
          data[j + 2] = 40;
          data[j + 3] = a * 255;
        } else {
          data[j + 3] = 0;
        }
      }
    }
    surface.bufCtx.putImageData(state.img!, 0, 0);
    ctx.drawImage(surface.buf, 0, 0);

    requestAnimationFrame(() => this.loop());
  }

  destroy() {
    this.destroyed = true;
    this.surface?.observer.disconnect();
    this.btn.removeEventListener("mousemove", this.onMove);
    this.btn.removeEventListener("mouseenter", this.onEnter);
    this.btn.removeEventListener("mouseleave", this.onLeave);
  }
}

export function RippleButton({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const btnRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const canvas = canvasRef.current;
    if (!btn || !canvas) return;
    const engine = new RippleEngine(btn, canvas);
    return () => engine.destroy();
  }, []);

  const inner = (
    <>
      <span className="ripple-btn__base" aria-hidden="true" />
      <canvas ref={canvasRef} className="ripple-btn__canvas" aria-hidden="true" />
      <span className="ripple-btn__text">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} ref={btnRef} className="ripple-btn">
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" ref={btnRef} className="ripple-btn" onClick={onClick}>
      {inner}
    </button>
  );
}
