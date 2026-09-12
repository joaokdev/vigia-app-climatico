/**
 * Hover Buttons — Part 5
 * Canvas and pointer-driven effects for the six buttons in index.html.
 * All six effects use JS; shared helpers live at the top of this file.
 */

/* ==========================================================
   SPRING HELPER — shared damping for motion classes
   ========================================================== */
function spring(current, target, velocity, stiffness, damping) {
  const force = (target - current) * stiffness;
  velocity = (velocity + force) * damping;
  current += velocity;
  return { current, velocity };
}

/* ==========================================================
   CANVAS HELPER — shared resize + DPR setup
   Builds a DPR-correct canvas surface plus an offscreen
   logical-pixel buffer so per-pixel ImageData stays crisp.
   ========================================================== */
function createSurface(btn, selector, opts = {}) {
  const canvas = btn.querySelector(selector);
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  const buf = document.createElement("canvas");
  const bufCtx = buf.getContext("2d");

  const s = {
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
    if (opts.onResize) opts.onResize(s);
  };

  new ResizeObserver(resize).observe(btn);
  resize();
  return s;
}

// blit the offscreen logical-pixel buffer onto the visible (scaled) canvas
function blit(s) {
  s.bufCtx.putImageData(s.img, 0, 0);
  s.ctx.drawImage(s.buf, 0, 0);
}

// shared pointer tracking: keeps cx/cy updated and toggles is-active
function trackPointer(effect, btn) {
  const updatePointer = (e) => {
    const r = btn.getBoundingClientRect();
    effect.cx = e.clientX - r.left;
    effect.cy = e.clientY - r.top;
    if (effect.onMove) effect.onMove();
  };

  btn.addEventListener("mousemove", updatePointer);
  btn.addEventListener("mouseenter", (e) => {
    effect.active = true;
    btn.classList.add("is-active");
    updatePointer(e);
    if (effect.onEnter) effect.onEnter();
  });
  btn.addEventListener("mouseleave", () => {
    effect.active = false;
    btn.classList.remove("is-active");
    if (effect.onLeave) effect.onLeave();
  });
}

/* ==========================================================
   1. WATER RIPPLE — wave simulation follows the cursor
   Classic two-buffer heightfield ripple. The cursor drags a
   wake; idle rain-drops keep the surface alive while hovered.
   ========================================================== */
class RippleButton {
  constructor(btn) {
    this.btn = btn;
    this.cx = -999;
    this.cy = -999;
    this.active = false;
    this.prevX = -999;
    this.prevY = -999;
    this.lastDrop = 0;
    this.energy = 0;

    this.s = createSurface(btn, ".btn-ripple__canvas", { onResize: (s) => this._build(s) });
    if (!this.s) return;

    this.onEnter = () => {
      this.prevX = this.cx;
      this.prevY = this.cy;
      this._splash(this.cx, this.cy, 2.4);
    };

    trackPointer(this, btn);
    this._loop();
  }

  _build(s) {
    const W = s.w, H = s.h;
    if (!W || !H) return;
    this.cur = new Float32Array(W * H);
    this.prev = new Float32Array(W * H);
  }

  _splash(x, y, power) {
    const W = this.s.w, H = this.s.h;
    if (!this.prev) return;
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

  _loop() {
    const s = this.s;
    const ctx = s.ctx;
    const W = s.w, H = s.h;
    if (!W || !this.cur) {
      requestAnimationFrame(() => this._loop());
      return;
    }

    const now = performance.now();

    if (this.active) {
      // wake along the cursor path
      const dx = this.cx - this.prevX;
      const dy = this.cy - this.prevY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.min(6, Math.max(1, Math.round(dist / 3)));
      for (let i = 1; i <= steps; i++) {
        this._splash(
          this.prevX + (dx * i) / steps,
          this.prevY + (dy * i) / steps,
          0.9
        );
      }
      this.prevX = this.cx;
      this.prevY = this.cy;

      // ambient rain
      if (now - this.lastDrop > 420) {
        this.lastDrop = now;
        this._splash(4 + Math.random() * (W - 8), 4 + Math.random() * (H - 8), 1.6);
      }
    }

    // wave propagation
    const cur = this.cur, prev = this.prev;
    const damping = 0.972;
    let energy = 0;
    for (let y = 1; y < H - 1; y++) {
      const row = y * W;
      for (let x = 1; x < W - 1; x++) {
        const i = row + x;
        const v =
          ((prev[i - 1] + prev[i + 1] + prev[i - W] + prev[i + W]) * 0.5 - cur[i]) *
          damping;
        cur[i] = v;
        energy += v > 0 ? v : -v;
      }
    }
    this.cur = prev;
    this.prev = cur;
    this.energy = energy;

    ctx.clearRect(0, 0, W, H);

    if (energy < 4 && !this.active) {
      requestAnimationFrame(() => this._loop());
      return;
    }

    // render: slope-based light so waves read as glossy water
    const data = s.img.data;
    for (let y = 0; y < H; y++) {
      const row = y * W;
      for (let x = 0; x < W; x++) {
        const i = row + x;
        const xl = x > 0 ? cur[i - 1] : 0;
        const xr = x < W - 1 ? cur[i + 1] : 0;
        const slope = xr - xl;

        const j = i * 4;
        if (slope > 0.04) {
          // lit face
          const a = Math.min(0.85, slope * 0.5);
          data[j] = 170;
          data[j + 1] = 220;
          data[j + 2] = 255;
          data[j + 3] = a * 255;
        } else if (slope < -0.04) {
          // shadow face
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
    blit(s);

    requestAnimationFrame(() => this._loop());
  }
}

/* ==========================================================
   2. SCRATCH CARD — foil scrubs off, prize glows underneath
   The cursor erases the foil layer along its path. Foil
   heals itself a moment after the cursor leaves.
   ========================================================== */
class ScratchButton {
  constructor(btn) {
    this.btn = btn;
    this.cx = -999;
    this.cy = -999;
    this.active = false;
    this.prevX = -999;
    this.prevY = -999;
    this.heal = 0; // 0 = foil intact, counts up while healing
    this.healing = false;
    this.flakes = [];

    // foil lives on its own offscreen canvas so erasing is cheap
    this.foil = document.createElement("canvas");
    this.foilCtx = this.foil.getContext("2d");

    this.s = createSurface(btn, ".btn-scratch__canvas", { onResize: (s) => this._paintFoil(s) });
    if (!this.s) return;

    this.onEnter = () => {
      this.healing = false;
      if (this.heal > 0) {
        // finish any partial heal instantly so scratching starts clean
        this._paintFoil(this.s);
        this.heal = 0;
      }
      this.prevX = this.cx;
      this.prevY = this.cy;
    };
    this.onLeave = () => {
      this.healing = true;
      this.healStart = performance.now();
    };

    trackPointer(this, btn);
    this._loop();
  }

  _paintFoil(s) {
    const W = s.w, H = s.h;
    if (!W || !H) return;

    this.foil.width = W;
    this.foil.height = H;
    const fc = this.foilCtx;

    const g = fc.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#c8ccd6");
    g.addColorStop(0.35, "#9aa0ae");
    g.addColorStop(0.5, "#e6e9f0");
    g.addColorStop(0.65, "#9aa0ae");
    g.addColorStop(1, "#b8bcc8");
    fc.fillStyle = g;
    fc.fillRect(0, 0, W, H);

    // brushed speckle
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      fc.fillStyle = Math.random() < 0.5
        ? "rgba(255, 255, 255, 0.16)"
        : "rgba(60, 65, 80, 0.14)";
      fc.fillRect(x, y, 1 + Math.random() * 2, 1);
    }

    // diagonal shine bands
    fc.save();
    fc.globalAlpha = 0.12;
    fc.fillStyle = "#ffffff";
    for (let x = -H; x < W; x += 34) {
      fc.beginPath();
      fc.moveTo(x, H);
      fc.lineTo(x + H, 0);
      fc.lineTo(x + H + 8, 0);
      fc.lineTo(x + 8, H);
      fc.fill();
    }
    fc.restore();

    // label
    fc.font = "700 11px 'Syne', sans-serif";
    fc.textAlign = "center";
    fc.textBaseline = "middle";
    fc.fillStyle = "rgba(70, 75, 90, 0.75)";
    fc.fillText("S C R A T C H", W / 2, H / 2);
  }

  _scratchLine(x0, y0, x1, y1) {
    const fc = this.foilCtx;
    fc.save();
    fc.globalCompositeOperation = "destination-out";
    fc.lineCap = "round";
    fc.lineJoin = "round";
    fc.lineWidth = 22;
    fc.beginPath();
    fc.moveTo(x0, y0);
    fc.lineTo(x1, y1);
    fc.stroke();
    fc.restore();

    // silver flakes fly off the scratch point
    for (let i = 0; i < 3; i++) {
      this.flakes.push({
        x: x1 + (Math.random() - 0.5) * 10,
        y: y1 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -0.5 - Math.random() * 1.2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
      });
    }
  }

  _revealRatio() {
    const W = this.foil.width, H = this.foil.height;
    if (!W) return 0;
    const step = 6;
    const data = this.foilCtx.getImageData(0, 0, W, H).data;
    let clear = 0, total = 0;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        total++;
        if (data[(y * W + x) * 4 + 3] < 40) clear++;
      }
    }
    return total ? clear / total : 0;
  }

  _loop() {
    const s = this.s;
    const ctx = s.ctx;
    const W = s.w, H = s.h;
    if (!W || !this.foil.width) {
      requestAnimationFrame(() => this._loop());
      return;
    }

    if (this.active) {
      const dx = this.cx - this.prevX;
      const dy = this.cy - this.prevY;
      if (dx * dx + dy * dy > 1) {
        this._scratchLine(this.prevX, this.prevY, this.cx, this.cy);
        this.prevX = this.cx;
        this.prevY = this.cy;
      }
    }

    // heal: fade a fresh foil layer back in after the cursor leaves
    let healAlpha = 0;
    if (this.healing) {
      const t = (performance.now() - this.healStart) / 1000;
      if (t > 0.5) {
        healAlpha = Math.min(1, (t - 0.5) / 0.8);
        if (healAlpha >= 1) {
          this._paintFoil(s);
          this.healing = false;
          healAlpha = 0;
        }
      }
    }

    this.flakes = this.flakes.filter((f) => {
      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.08;
      f.rot += f.vr;
      f.life -= 0.03;
      return f.life > 0 && f.y < H + 6;
    });

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(this.foil, 0, 0);

    if (healAlpha > 0) {
      // temporary healing sheen while foil regrows
      ctx.save();
      ctx.globalAlpha = healAlpha;
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#c8ccd6");
      g.addColorStop(0.5, "#e6e9f0");
      g.addColorStop(1, "#b8bcc8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    for (const f of this.flakes) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.fillStyle = `rgba(220, 225, 235, ${f.life * 0.85})`;
      ctx.fillRect(-2, -1.2, 4, 2.4);
      ctx.restore();
    }

    // toggle the reveal glow roughly 5 times a second (getImageData is pricey)
    const now = performance.now();
    if (this.active && (!this._lastCheck || now - this._lastCheck > 200)) {
      this._lastCheck = now;
      this.btn.classList.toggle("is-revealed", this._revealRatio() > 0.45);
    }
    if (!this.active && !this.healing) {
      this.btn.classList.remove("is-revealed");
    }

    requestAnimationFrame(() => this._loop());
  }
}

/* ==========================================================
   3. GRASS — blades sway, the cursor brushes them apart
   Each blade is a quadratic curve with its own sway phase.
   The cursor pushes nearby blades away like a hand parting
   through a field.
   ========================================================== */
class GrassButton {
  constructor(btn) {
    this.btn = btn;
    this.blades = [];
    this.cx = -999;
    this.cy = -999;
    this.active = false;
    this.t = 0;

    this.s = createSurface(btn, ".btn-grass__canvas", { onResize: (s) => this._build(s) });
    if (!this.s) return;

    trackPointer(this, btn);
    this._loop();
  }

  _build(s) {
    const W = s.w, H = s.h;
    if (!W || !H) return;

    this.blades = [];
    const count = Math.floor(W / 2.6);
    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 = back row, 1 = front row
      this.blades.push({
        x: 2 + Math.random() * (W - 4),
        len: H * (0.36 + depth * 0.34) * (0.85 + Math.random() * 0.3),
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.7,
        depth,
        bend: 0,
        velBend: 0,
        hue: 118 + Math.random() * 26,
        sat: 45 + depth * 25,
        lit: 20 + depth * 22,
      });
    }
    this.blades.sort((a, b) => a.depth - b.depth);
  }

  _loop() {
    const s = this.s;
    const ctx = s.ctx;
    const W = s.w, H = s.h;
    if (!W) {
      requestAnimationFrame(() => this._loop());
      return;
    }
    if (!this.blades.length) this._build(s);

    this.t += 0.016;

    ctx.clearRect(0, 0, W, H);

    for (const b of this.blades) {
      // breeze
      let target = Math.sin(this.t * b.speed + b.phase) * 3.2 * (0.5 + b.depth * 0.5);

      // cursor parts the blades
      if (this.active) {
        const dx = b.x - this.cx;
        const reach = 34;
        if (Math.abs(dx) < reach) {
          const f = 1 - Math.abs(dx) / reach;
          const dir = dx >= 0 ? 1 : -1;
          const press = 1 - Math.min(1, Math.max(0, this.cy / H)); // lower cursor = harder push
          target += dir * f * f * (10 + press * 14);
        }
      }

      const r = spring(b.bend, target, b.velBend, 0.14, 0.8);
      b.bend = r.current;
      b.velBend = r.velocity;

      const tipX = b.x + b.bend;
      const tipY = H - b.len;
      const ctrlX = b.x + b.bend * 0.35;
      const ctrlY = H - b.len * 0.55;

      ctx.strokeStyle = `hsl(${b.hue}, ${b.sat}%, ${b.lit}%)`;
      ctx.lineWidth = 1 + b.depth * 1.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(b.x, H);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.stroke();

      // lit tip on foreground blades
      if (b.depth > 0.72) {
        ctx.strokeStyle = `hsla(${b.hue + 8}, ${b.sat + 12}%, ${b.lit + 20}%, 0.8)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(ctrlX, ctrlY);
        ctx.quadraticCurveTo(
          (ctrlX + tipX) / 2, (ctrlY + tipY) / 2,
          tipX, tipY
        );
        ctx.stroke();
      }
    }

    // fireflies drift up while hovered
    if (this.active) {
      if (!this.flies) this.flies = [];
      if (this.flies.length < 8 && Math.random() < 0.15) {
        this.flies.push({
          x: Math.random() * W,
          y: H,
          vy: -(0.25 + Math.random() * 0.4),
          wob: Math.random() * Math.PI * 2,
          life: 1,
        });
      }
    }
    if (this.flies) {
      this.flies = this.flies.filter((f) => {
        f.y += f.vy;
        f.wob += 0.08;
        f.x += Math.sin(f.wob) * 0.4;
        f.life = Math.min(f.life, f.y / H + 0.25);
        if (!this.active) f.life -= 0.02;
        if (f.life <= 0 || f.y < -4) return false;
        const a = Math.max(0, Math.min(0.85, f.life)) * (0.6 + 0.4 * Math.sin(f.wob * 2));
        ctx.fillStyle = `rgba(220, 255, 160, ${Math.max(0, a)})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
    }

    requestAnimationFrame(() => this._loop());
  }
}

/* ==========================================================
   4. THERMAL — heat blooms and diffuses under the cursor
   A heat field rendered through an infrared palette. The
   cursor injects warmth that spreads, glows, and cools off.
   ========================================================== */
class HeatButton {
  constructor(btn) {
    this.btn = btn;
    this.cx = -999;
    this.cy = -999;
    this.active = false;
    this.res = 2; // simulate at half resolution for speed

    this.s = createSurface(btn, ".btn-heat__canvas", { onResize: (s) => this._build(s) });
    if (!this.s) return;

    this._buildPalette();
    trackPointer(this, btn);
    this._loop();
  }

  _build(s) {
    if (!s.w) return;
    this.gw = Math.ceil(s.w / this.res);
    this.gh = Math.ceil(s.h / this.res);
    this.heat = new Float32Array(this.gw * this.gh);
    this.next = new Float32Array(this.gw * this.gh);
  }

  _buildPalette() {
    // infrared: black -> deep purple -> red -> orange -> yellow -> white
    const stops = [
      [0.0, 10, 2, 25, 0],
      [0.18, 60, 8, 90, 90],
      [0.4, 190, 30, 45, 170],
      [0.62, 255, 110, 20, 220],
      [0.82, 255, 205, 60, 245],
      [1.0, 255, 255, 235, 255],
    ];
    this.pal = new Uint8ClampedArray(256 * 4);
    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      let a = stops[0], b = stops[stops.length - 1];
      for (let k = 0; k < stops.length - 1; k++) {
        if (t >= stops[k][0] && t <= stops[k + 1][0]) {
          a = stops[k];
          b = stops[k + 1];
          break;
        }
      }
      const f = (t - a[0]) / (b[0] - a[0] || 1);
      this.pal[i * 4] = a[1] + (b[1] - a[1]) * f;
      this.pal[i * 4 + 1] = a[2] + (b[2] - a[2]) * f;
      this.pal[i * 4 + 2] = a[3] + (b[3] - a[3]) * f;
      this.pal[i * 4 + 3] = a[4] + (b[4] - a[4]) * f;
    }
  }

  _loop() {
    const s = this.s;
    const ctx = s.ctx;
    const W = s.w, H = s.h;
    if (!W || !this.heat) {
      requestAnimationFrame(() => this._loop());
      return;
    }

    const gw = this.gw, gh = this.gh;
    const heat = this.heat, next = this.next;

    // inject warmth at the cursor
    if (this.active && this.cx > -100) {
      const gx = this.cx / this.res;
      const gy = this.cy / this.res;
      const R = 7;
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          const x = Math.round(gx + dx);
          const y = Math.round(gy + dy);
          if (x < 0 || x >= gw || y < 0 || y >= gh) continue;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > R) continue;
          const i = y * gw + x;
          const add = (1 - d / R) * 0.35;
          heat[i] = Math.min(1.15, heat[i] + add);
        }
      }
    }

    // diffuse + cool
    const cool = this.active ? 0.988 : 0.965;
    let total = 0;
    for (let y = 0; y < gh; y++) {
      const row = y * gw;
      for (let x = 0; x < gw; x++) {
        const i = row + x;
        const l = x > 0 ? heat[i - 1] : heat[i];
        const r = x < gw - 1 ? heat[i + 1] : heat[i];
        const u = y > 0 ? heat[i - gw] : heat[i];
        const d = y < gh - 1 ? heat[i + gw] : heat[i];
        const v = (heat[i] * 0.6 + (l + r + u + d) * 0.1) * cool;
        next[i] = v;
        total += v;
      }
    }
    this.heat = next;
    this.next = heat;

    ctx.clearRect(0, 0, W, H);
    if (total < 0.5 && !this.active) {
      requestAnimationFrame(() => this._loop());
      return;
    }

    // render heat grid up to full size via palette
    const data = s.img.data;
    const cur = this.heat;
    const res = this.res;
    for (let y = 0; y < H; y++) {
      const gy = Math.min(gh - 1, (y / res) | 0);
      const grow = gy * gw;
      const row = y * W;
      for (let x = 0; x < W; x++) {
        const gx = Math.min(gw - 1, (x / res) | 0);
        let v = cur[grow + gx];
        if (v > 1) v = 1;
        const pi = ((v * 255) | 0) * 4;
        const j = (row + x) * 4;
        data[j] = this.pal[pi];
        data[j + 1] = this.pal[pi + 1];
        data[j + 2] = this.pal[pi + 2];
        data[j + 3] = this.pal[pi + 3];
      }
    }
    blit(s);

    requestAnimationFrame(() => this._loop());
  }
}

/* ==========================================================
   5. PAPER LANTERN — warm light follows the cursor
   Tiny class: just feeds cursor position into CSS custom
   properties; all the glow work happens in the stylesheet.
   ========================================================== */
class LanternButton {
  constructor(btn) {
    this.btn = btn;
    this.cx = 0;
    this.cy = 0;
    this.active = false;
    this.onMove = () => this._syncLight();
    this.onLeave = () => {
      this.btn.style.setProperty("--lx", "50%");
      this.btn.style.setProperty("--ly", "50%");
    };
    trackPointer(this, btn);
  }

  _syncLight() {
    this.btn.style.setProperty("--lx", `${this.cx.toFixed(1)}px`);
    this.btn.style.setProperty("--ly", `${this.cy.toFixed(1)}px`);
  }
}

/* ==========================================================
   6. DNA TWIST — double helix spirals across the button
   Two sine strands with base-pair rungs; hover speeds the
   twist and pulls the helix amplitude open near the cursor.
   ========================================================== */
class DnaButton {
  constructor(btn) {
    this.btn = btn;
    this.cx = -999;
    this.cy = -999;
    this.active = false;
    this.t = 0;
    this.speed = 0.014;
    this.open = 0;
    this.velOpen = 0;

    this.s = createSurface(btn, ".btn-dna__canvas");
    if (!this.s) return;

    trackPointer(this, btn);
    this._loop();
  }

  _strandY(x, phase, H, amp) {
    return H / 2 + Math.sin(x * 0.055 + this.t * 2.4 + phase) * amp;
  }

  _loop() {
    const s = this.s;
    const ctx = s.ctx;
    const W = s.w, H = s.h;
    if (!W) {
      requestAnimationFrame(() => this._loop());
      return;
    }

    const targetSpeed = this.active ? 0.034 : 0.014;
    this.speed += (targetSpeed - this.speed) * 0.06;
    this.t += this.speed;

    const r = spring(this.open, this.active ? 1 : 0, this.velOpen, 0.1, 0.84);
    this.open = r.current;
    this.velOpen = r.velocity;

    ctx.clearRect(0, 0, W, H);

    const step = 4;
    const baseAmp = H * 0.22;

    // amplitude opens wider near the cursor while hovered
    const ampAt = (x) => {
      let amp = baseAmp * (1 + this.open * 0.35);
      if (this.open > 0.01 && this.cx > -100) {
        const dx = x - this.cx;
        amp += Math.exp(-(dx * dx) / 1400) * this.open * H * 0.14;
      }
      return amp;
    };

    // base-pair rungs
    for (let x = 6; x < W - 4; x += 14) {
      const amp = ampAt(x);
      const y1 = this._strandY(x, 0, H, amp);
      const y2 = this._strandY(x, Math.PI, H, amp);
      const depth = Math.abs(y1 - y2) / (amp * 2 || 1); // 0 = crossing, 1 = fully open
      ctx.strokeStyle = `rgba(140, 220, 255, ${0.1 + depth * (0.2 + this.open * 0.35)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();
    }

    // two strands, drawn as dotted beads so the twist reads clearly
    for (const [phase, hue] of [[0, 195], [Math.PI, 265]]) {
      for (let x = 2; x < W - 1; x += step) {
        const amp = ampAt(x);
        const y = this._strandY(x, phase, H, amp);
        // z-depth from the cosine: front beads bigger and brighter
        const z = (Math.cos(x * 0.055 + this.t * 2.4 + phase) + 1) / 2;
        const rad = 1 + z * 1.5;
        ctx.fillStyle = `hsla(${hue}, 85%, ${52 + z * 22}%, ${0.35 + z * 0.55})`;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(() => this._loop());
  }
}

/* ==========================================================
   INIT — wire up interactive buttons
   ========================================================== */
(function () {
  "use strict";

  document.querySelectorAll(".btn-ripple").forEach((el) => new RippleButton(el));
  document.querySelectorAll(".btn-scratch").forEach((el) => new ScratchButton(el));
  document.querySelectorAll(".btn-grass").forEach((el) => new GrassButton(el));
  document.querySelectorAll(".btn-heat").forEach((el) => new HeatButton(el));
  document.querySelectorAll(".btn-lantern").forEach((el) => new LanternButton(el));
  document.querySelectorAll(".btn-dna").forEach((el) => new DnaButton(el));
})();
