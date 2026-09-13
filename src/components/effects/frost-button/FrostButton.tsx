"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "./frost-button.css";

/**
 * Efeito de terceiro "Frost" (pacote hover-buttons-part-4) — gelo
 * cresce a partir das bordas do botão; o cursor "derrete" um
 * caminho conforme se move sobre ele. A matemática de pixel
 * (canvas 2D, mapa de calor/derretimento, "samambaias" de gelo
 * crescendo das bordas) é copiada quase literalmente do script.js
 * original — só foi adaptada para: (a) rodar dentro de uma classe
 * JS chamada a partir de um useEffect do React em vez de um
 * querySelectorAll global no carregamento da página, e (b) parar
 * de vez (cancelAnimationFrame + desconectar o ResizeObserver)
 * quando o componente desmonta, o que o script original — pensado
 * para uma página estática que nunca desmonta — não precisava
 * fazer.
 *
 * Escolhido para o VIGIA porque o motivo do gelo/frio combina
 * diretamente com o domínio do produto (clima, regiões frias como
 * Bituruna), diferente dos outros 5 botões do mesmo pacote
 * (borracha, papel colado, areia, gravidade, pin art), que não
 * têm relação com o contexto do produto e por isso não foram
 * usados.
 */

function spring(current: number, target: number, velocity: number, stiffness: number, damping: number) {
  const force = (target - current) * stiffness;
  velocity = (velocity + force) * damping;
  current += velocity;
  return { current, velocity };
}

type Surface = {
  btn: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  buf: HTMLCanvasElement;
  bufCtx: CanvasRenderingContext2D;
  dpr: number;
  w: number;
  h: number;
  img: ImageData | null;
};

function createSurface(btn: HTMLElement, canvas: HTMLCanvasElement, onResize: (s: Surface) => void) {
  const ctx = canvas.getContext("2d");
  const buf = document.createElement("canvas");
  const bufCtx = buf.getContext("2d");
  if (!ctx || !bufCtx) return null;

  const s: Surface = {
    btn, canvas, ctx, buf, bufCtx,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    w: 0, h: 0, img: null,
  };

  const resize = () => {
    const w = btn.offsetWidth;
    const h = btn.offsetHeight;
    if (!w || !h) return;

    canvas.width = Math.round(w * s.dpr);
    canvas.height = Math.round(h * s.dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);

    buf.width = w;
    buf.height = h;

    s.w = w;
    s.h = h;
    s.img = bufCtx.createImageData(w, h);
    onResize(s);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(btn);
  resize();
  return { s, observer };
}

function blit(s: Surface) {
  if (!s.img) return;
  s.bufCtx.putImageData(s.img, 0, 0);
  s.ctx.drawImage(s.buf, 0, 0);
}

type Fern = { segs: { x1: number; y1: number; x2: number; y2: number; ba: number; bl: number }[]; n: number };

class FrostEngine {
  btn: HTMLElement;
  f = 0;
  vf = 0;
  cx = -999;
  cy = -999;
  active = false;
  warm: Float32Array | null = null;
  ferns: Fern[] = [];
  s: Surface | null = null;
  observer: ResizeObserver | null = null;
  destroyed = false;
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
  };
  private onLeave = () => {
    this.active = false;
    this.btn.classList.remove("is-active");
  };

  constructor(btn: HTMLElement, canvas: HTMLCanvasElement) {
    this.btn = btn;
    const created = createSurface(btn, canvas, (s) => this.build(s));
    if (!created) return;
    this.s = created.s;
    this.observer = created.observer;

    btn.addEventListener("mousemove", this.onMove);
    btn.addEventListener("mouseenter", this.onEnter);
    btn.addEventListener("mouseleave", this.onLeave);

    this.loop();
  }

  build(s: Surface) {
    const W = s.w, H = s.h;
    if (!W || !H) return;
    this.warm = new Float32Array(W * H);

    this.ferns = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const edge = i % 4;
      let x: number, y: number, base: number;
      if (edge === 0) { x = Math.random() * W; y = 0; base = Math.PI / 2; }
      else if (edge === 1) { x = Math.random() * W; y = H; base = -Math.PI / 2; }
      else if (edge === 2) { x = 0; y = Math.random() * H; base = 0; }
      else { x = W; y = Math.random() * H; base = Math.PI; }

      let ang = base + (Math.random() - 0.5) * 0.8;
      const n = 5;
      const segLen = (8 + Math.random() * 14) / n;
      const segs: Fern["segs"] = [];
      let px = x, py = y;
      for (let j = 0; j < n; j++) {
        const ex = px + Math.cos(ang) * segLen;
        const ey = py + Math.sin(ang) * segLen;
        segs.push({
          x1: px, y1: py, x2: ex, y2: ey,
          ba: ang + (Math.random() < 0.5 ? 0.7 : -0.7),
          bl: segLen * 0.65,
        });
        px = ex; py = ey;
        ang += (Math.random() - 0.5) * 0.4;
      }
      this.ferns.push({ segs, n });
    }
  }

  loop() {
    if (this.destroyed) return;
    const s = this.s;
    if (!s) return;
    const ctx = s.ctx;
    const W = s.w, H = s.h;
    if (!W) {
      requestAnimationFrame(() => this.loop());
      return;
    }

    const target = this.active ? 1 : 0;
    const r = spring(this.f, target, this.vf, 0.08, this.active ? 0.88 : 0.82);
    this.f = r.current;
    this.vf = r.velocity;

    ctx.clearRect(0, 0, W, H);

    if (this.f < 0.004 && !this.active) {
      requestAnimationFrame(() => this.loop());
      return;
    }
    if (!this.warm) this.build(s);
    const warm = this.warm!;
    const decay = this.active ? 0.95 : 0.9;
    const coverDepth = 5 + this.f * Math.min(W, H) * 0.95;
    const meltR = 30;
    const data = s.img!.data;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;

        let wv = warm[idx] * decay;
        if (this.active) {
          const dx = x - this.cx;
          const dy = y - this.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < meltR) {
            const add = 1 - dist / meltR;
            if (add > wv) wv = add;
          }
        }
        warm[idx] = wv;

        const edgeDist = Math.min(x, y, W - 1 - x, H - 1 - y);
        let cover = 1 - edgeDist / coverDepth;
        if (cover < 0) cover = 0;
        const grain = ((x * 71 + y * 131) % 37) / 37;
        let alpha = cover * this.f * (0.78 + grain * 0.22) * (1 - wv);
        if (alpha < 0) alpha = 0;

        const j = idx * 4;
        data[j] = 205 + grain * 35;
        data[j + 1] = 228 + grain * 22;
        data[j + 2] = 255;
        data[j + 3] = alpha * 230;
      }
    }
    blit(s);

    ctx.lineCap = "round";
    ctx.lineWidth = 1;
    const reveal = this.f;
    for (const fern of this.ferns) {
      const show = Math.ceil(reveal * fern.n);
      for (let k = 0; k < show && k < fern.segs.length; k++) {
        const sg = fern.segs[k];
        const mx = (sg.x1 + sg.x2) * 0.5;
        const my = (sg.y1 + sg.y2) * 0.5;
        const ix = Math.round(mx);
        const iy = Math.round(my);
        let wv = 0;
        if (ix >= 0 && ix < W && iy >= 0 && iy < H) wv = warm[iy * W + ix];
        const a = this.f * 0.5 * (1 - wv);
        if (a <= 0.02) continue;
        ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
        ctx.beginPath();
        ctx.moveTo(sg.x1, sg.y1);
        ctx.lineTo(sg.x2, sg.y2);
        ctx.moveTo(sg.x2, sg.y2);
        ctx.lineTo(sg.x2 + Math.cos(sg.ba) * sg.bl, sg.y2 + Math.sin(sg.ba) * sg.bl);
        ctx.stroke();
      }
    }

    requestAnimationFrame(() => this.loop());
  }

  destroy() {
    this.destroyed = true;
    this.observer?.disconnect();
    this.btn.removeEventListener("mousemove", this.onMove);
    this.btn.removeEventListener("mouseenter", this.onEnter);
    this.btn.removeEventListener("mouseleave", this.onLeave);
  }
}

export function FrostButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const canvas = canvasRef.current;
    if (!btn || !canvas) return;
    const engine = new FrostEngine(btn, canvas);
    return () => engine.destroy();
  }, []);

  return (
    <Link href={href} ref={btnRef} className="frost-btn">
      <span className="frost-btn__base" aria-hidden="true" />
      <canvas ref={canvasRef} className="frost-btn__canvas" aria-hidden="true" />
      <span className="frost-btn__text">{children}</span>
    </Link>
  );
}
