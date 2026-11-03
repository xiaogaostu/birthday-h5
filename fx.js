/* ============================================================
   fx.js — star-field particle effects
   Integrated from cake-night-standalone.html (user build).
   ============================================================ */

(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);

  const PALETTE = ['#ffd27a', '#ff9d6e', '#7be8ff', '#b28bff', '#ff7cd0', '#9dffd8', '#fff4cf', '#8fb4ff', '#ffb35c', '#c6a6ff'];
  const SNOW = ['#eaf6ff', '#cfe7ff', '#ffffff', '#bcd8ff'];

  function hexRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  class ParticleField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.w = 0;
      this.h = 0;
      this.dpr = 1;
      this.mode = 'stars';
      this.particles = [];
      this.stars = [];
      this.meteors = [];
      this.blowHalos = [];
      this.haloRings = [];
      this.haloTimer = 1.2;
      this.meteorTimer = 0;
      this.ringAlpha = 0;
      this.ringTarget = 0;
      this.time = 0;
      this.last = performance.now();
      this.tx = 0;
      this.ty = 0;
      this.px = 0;
      this.py = 0;
      this.raf = 0;
      this.motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
      this.reduced = !!(this.motion && this.motion.matches);
      this.resize();
      this.makeStars();
      this.buildMode('stars', true);
      this.loop = this.loop.bind(this);
      this.start();
      window.addEventListener('resize', () => this.resize());
      if (this.motion) {
        const onChange = (ev) => {
          this.reduced = ev.matches;
          if (this.reduced) {
            cancelAnimationFrame(this.raf);
            this.raf = 0;
            this.settle();
          } else {
            this.last = performance.now();
            this.start();
          }
        };
        if (this.motion.addEventListener) this.motion.addEventListener('change', onChange);
        else if (this.motion.addListener) this.motion.addListener(onChange);
      }
    }

    start() {
      if (this.reduced) {
        this.draw();
        return;
      }
      if (!this.raf) this.raf = requestAnimationFrame(this.loop);
    }

    // Freeze into a calm, fully drawn frame for reduced-motion visitors.
    settle() {
      this.particles = this.particles.filter(p => p.fade > .01);
      this.particles.forEach(p => { p.dying = false; p.fade = 1; });
      this.meteors = [];
      this.ringAlpha = this.ringTarget;
      this.draw();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width || innerWidth);
      const h = Math.max(1, rect.height || innerHeight);
      const oldW = this.w || w;
      const oldH = this.h || h;
      this.w = w;
      this.h = h;
      this.dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2);
      this.canvas.width = Math.round(w * this.dpr);
      this.canvas.height = Math.round(h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (this.reduced) {
        const sx = w / oldW;
        const sy = h / oldH;
        this.particles.forEach(p => { p.x *= sx; p.y *= sy; });
        this.draw();
      }
    }

    pointer(x, y) {
      if (this.reduced) return;
      this.tx = x;
      this.ty = y;
    }

    makeStars() {
      const count = innerWidth < 700 ? 110 : 240;
      this.stars = [];
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random(),
          y: Math.random(),
          r: rand(.35, 1.35),
          tw: rand(.4, 1.8),
          phase: rand(0, TAU),
          depth: rand(.2, 1),
          flare: Math.random() < .08
        });
      }
    }

    spawnBokeh(mode, initial) {
      const isSnow = mode === 'snow';
      const palette = isSnow ? SNOW : PALETTE;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const big = Math.random();
      let r;
      if (isSnow) r = big < .7 ? rand(2.5, 9) : rand(14, 40);
      else if (mode === 'halo') r = rand(18, 86);
      else r = big < .3 ? rand(56, 128) : rand(8, 38);
      const p = {
        x: rand(-.08, 1.08) * this.w,
        y: rand(-.05, 1.05) * this.h,
        r,
        color,
        rgb: hexRgb(color),
        alpha: isSnow ? rand(.32, .7) : big < .3 ? rand(.22, .48) : rand(.14, .4),
        vx: isSnow ? rand(-4, 4) : rand(-7, 7),
        vy: isSnow ? rand(9, 26) : rand(-9, 5),
        depth: rand(.25, 1),
        phase: rand(0, TAU),
        fade: initial ? 1 : 0,
        dying: false,
        burst: false,
        life: 99
      };
      this.particles.push(p);
      return p;
    }

    spawnBurst() {
      // small mode-switch pop
      this.spawnBurstAt(this.w * .72, this.h * .46, 18, 25, 130);
    }

    spawnBurstAt(cx, cy, count, speedMin, speedMax) {
      for (let i = 0; i < count; i++) {
        const a = rand(0, TAU);
        const speed = rand(speedMin, speedMax);
        const p = this.spawnBokeh(this.mode === 'snow' ? 'stars' : this.mode, true);
        p.x = cx + rand(-36, 36);
        p.y = cy + rand(-36, 36);
        p.vx = Math.cos(a) * speed;
        p.vy = Math.sin(a) * speed * 0.92;
        p.r = rand(4, 22);
        p.alpha = rand(.32, .78);
        p.burst = true;
        p.life = rand(1.0, 2.2);
        p.depth = rand(.4, 1);
      }
    }

    /* Celebration when candle is blown — rings smash open, then rain to fill page. */
    celebrateBlow(opt) {
      if (this.reduced) {
        this.draw();
        return;
      }
      const o = opt || {};
      const cx = o.x != null ? o.x : this.w * 0.68;
      const cy = o.y != null ? o.y : this.h * 0.38;
      const diag = Math.hypot(this.w, this.h) || 1200;
      const ORB_COLORS = [
        '#ff6b9d', '#ffd27a', '#7be8ff', '#b28bff', '#ff7cd0', '#9dffd8',
        '#fff4cf', '#ff9d6e', '#8fb4ff', '#ffb35c', '#ff90c8', '#c6a6ff',
        '#ffe08a', '#6af0c0', '#ff80b0', '#a8d8ff', '#ffc878', '#e0a0ff'
      ];

      const spawnOrb = (a, speed, sizeMin, sizeMax, alphaMin, alphaMax, lifeMin, lifeMax, grow, extras) => {
        const color = ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)];
        const p = this.spawnBokeh('stars', true);
        p.x = cx + rand(-3, 3);
        p.y = cy + rand(-3, 3);
        p.vx = Math.cos(a) * speed;
        p.vy = Math.sin(a) * speed - rand(6, 34);
        p.r = rand(sizeMin, sizeMax);
        p.color = color;
        p.rgb = hexRgb(color);
        p.alpha = rand(alphaMin, alphaMax);
        p.burst = true;
        p.orb = true;
        p.flare = false;
        p.life = rand(lifeMin, lifeMax);
        p.depth = rand(0.55, 1);
        p.grow = grow;
        p.smashT = rand(0.24, 0.5); // 砸开 phase before rain
        p.ringPiece = false;
        if (extras) Object.assign(p, extras);
        return p;
      };

      // 1) Expanding smash rings from flame tip — 3 colored rings crack open (bright, energetic)
      this.blowHalos = [];
      const HALO_COLS = ['#ffd27a', '#ff7cd0', '#7be8ff', '#9dffd8'];
      for (let i = 0; i < 3; i++) {
        const color = HALO_COLS[i % HALO_COLS.length];
        const life = 0.9 + i * 0.12;
        this.blowHalos.push({
          x: cx,
          y: cy,
          r: 5 + i * 2.5,
          maxR: diag * (0.18 + i * 0.1), // wide crack, no full-screen wash
          life,
          maxLife: life,
          width: 1.9 + i * 0.35,
          rgb: hexRgb(color),
          delay: i * 0.05,
          cracked: true,
          segs: 8 + (i % 3),
          rot: rand(0, TAU)
        });
      }

      // 2) Ring shards — born on expanding arcs, smash outward, then fall (dense, vivid)
      for (let ring = 0; ring < 3; ring++) {
        const pieces = 30 + ring * 5;
        const baseR = diag * (0.04 + ring * 0.03);
        for (let i = 0; i < pieces; i++) {
          const a = (i / pieces) * TAU + rand(-0.08, 0.08) + ring * 0.17;
          const speed = rand(diag * 0.13, diag * 0.32);
          const roll = Math.random();
          const sizeMin = roll < 0.2 ? 12 : roll < 0.55 ? 7 : 4;
          const sizeMax = roll < 0.2 ? 25 : roll < 0.55 ? 16 : 10;
          const p = spawnOrb(a, speed, sizeMin, sizeMax, 0.34, 0.6, 1.2, 2.0, rand(0.04, 0.22), {
            ringPiece: true,
            smashT: 0.15 + ring * 0.05 + rand(0, 0.12),
            // start a little out on the ring so smash reads as cracking open
            x: cx + Math.cos(a) * (baseR + rand(-4, 10)),
            y: cy + Math.sin(a) * (baseR * 0.85 + rand(-4, 8))
          });
          // outward smash + slight tangential spin so shards peel off the ring
          const tang = a + Math.PI * 0.5;
          p.vx = Math.cos(a) * speed + Math.cos(tang) * rand(-29, 29);
          p.vy = Math.sin(a) * speed * 0.85 + Math.sin(tang) * rand(-22, 22) - rand(14, 56);
        }
      }

      // 3) Full-page fill — half from the flame burst, half raining from everywhere
      for (let i = 0; i < 110; i++) {
        const a = rand(0, TAU);
        const speed = rand(diag * 0.08, diag * 0.24);
        const p = spawnOrb(a, speed, 9, 24, 0.3, 0.55, 1.5, 2.3, rand(0.06, 0.26));
        p.smashT = rand(0.1, 0.26);
      }
      // 全屏落雨：从画面任意位置生成，直接洒满整个屏幕
      for (let i = 0; i < 110; i++) {
        const p = spawnOrb(rand(0, TAU), rand(diag * 0.02, diag * 0.09), 7, 21, 0.28, 0.52, 1.6, 2.6, rand(0.02, 0.12), {
          x: rand(0, this.w),
          y: rand(-0.06, 0.5) * this.h,
          ringPiece: false
        });
        p.vx = rand(-34, 34);
        p.vy = rand(diag * 0.12, diag * 0.34); // 直落雨
        p.smashT = rand(0.05, 0.2);
      }

      // 4) Near-tip bloom disks (bright swell while rings crack)
      for (let i = 0; i < 12; i++) {
        const a = rand(0, TAU);
        const p = spawnOrb(a, rand(12, 46), 16, 36, 0.16, 0.3, 0.9, 1.5, rand(0.18, 0.45));
        p.smashT = rand(0.22, 0.46);
      }

      // 5) Sparse short trails on some shards (not every particle)
      let trailed = 0;
      for (let i = this.particles.length - 1; i >= 0 && trailed < 30; i--) {
        const p = this.particles[i];
        if (!p.burst || !p.orb) continue;
        if (Math.random() > 0.18) continue;
        p.trail = true;
        p.trailPts = [];
        trailed++;
      }
    }

    buildMode(mode, initial) {
      this.mode = mode;
      this.ringTarget = mode === 'halo' ? 1 : 0;
      if (this.reduced) {
        this.particles = [];
        this.meteors = [];
      } else {
        this.particles.forEach(p => { p.dying = true; });
      }
      const count = mode === 'snow' ? 110 : mode === 'meteor' ? 42 : mode === 'halo' ? 56 : 140;
      for (let i = 0; i < count; i++) this.spawnBokeh(mode, initial || this.reduced);
      this.meteorTimer = 0;
      this.haloTimer = 1.2;
      if (!initial && !this.reduced) this.modeBurst(mode);
      if (this.reduced) this.ringAlpha = this.ringTarget;
    }

    setMode(mode) {
      if (mode === this.mode) return;
      this.buildMode(mode, false);
      if (this.reduced) this.draw();
    }

    /* 切换瞬间的模式专属爆发 —— 让点击有明显反馈 */
    modeBurst(mode) {
      const cx = this.w * .72;
      const cy = this.h * .46;
      if (mode === 'snow') {
        // 一捧雪花从顶部飘落
        for (let i = 0; i < 30; i++) {
          const p = this.spawnBokeh('snow', true);
          p.x = rand(0, this.w);
          p.y = rand(-60, this.h * .3);
          p.vx = rand(-14, 14);
          p.vy = rand(22, 60);
          p.r = rand(3, 16);
          p.alpha = rand(.4, .75);
          p.burst = true;
          p.life = rand(1.6, 2.8);
          p.fade = 1;
        }
      } else if (mode === 'meteor') {
        // 三道流星同时划落
        for (let i = 0; i < 3; i++) this.spawnMeteor(true);
      } else if (mode === 'halo') {
        // 三道光环涟漪扩散
        for (let i = 0; i < 3; i++) this.spawnHaloRing(true, i * .14);
      } else {
        // stars：金色星点 + 星芒爆开
        const GOLD = ['#ffd27a', '#ffe9a8', '#fff6dd', '#ffb84a'];
        for (let i = 0; i < 26; i++) {
          const p = this.spawnBokeh('stars', true);
          const a = rand(0, TAU);
          const sp = rand(40, 190);
          p.x = cx + rand(-30, 30);
          p.y = cy + rand(-30, 30);
          p.vx = Math.cos(a) * sp;
          p.vy = Math.sin(a) * sp * .9;
          p.r = rand(3, 12);
          p.alpha = rand(.4, .8);
          p.flare = Math.random() < .55;
          p.burst = true;
          p.life = rand(.9, 1.9);
          p.fade = 1;
          const gc = GOLD[Math.floor(Math.random() * GOLD.length)];
          p.color = gc;
          p.rgb = hexRgb(gc);
        }
      }
    }

    spawnHaloRing(strong, delay) {
      const base = Math.min(this.w, this.h);
      const cols = ['#c7b4ff', '#ffd8a8', '#aee7ff', '#ffb4dc'];
      const color = cols[Math.floor(Math.random() * cols.length)];
      const life = strong ? rand(1.7, 2.3) : rand(1.3, 1.9);
      this.haloRings.push({
        x: this.w * .72,
        y: this.h * .46,
        r0: base * (strong ? .1 : .14),
        r1: base * (strong ? 1.05 : .6),
        life,
        maxLife: life,
        delay: delay || 0,
        width: strong ? 2.2 : 1.4,
        color,
        rgb: hexRgb(color),
        rot: rand(0, TAU),
        segs: 8 + Math.floor(Math.random() * 3)
      });
    }

    spawnMeteor(strong) {
      const fromLeft = Math.random() < .25;
      const sx = fromLeft ? -40 : rand(this.w * .35, this.w * 1.05);
      const sy = rand(-50, this.h * .22);
      const angle = fromLeft ? rand(.35, .65) : rand(Math.PI * .72, Math.PI * .88);
      const speed = strong ? rand(480, 780) : rand(260, 420);
      this.meteors.push({
        x: sx,
        y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: strong ? rand(150, 280) : rand(90, 170),
        life: rand(1.2, 2.2),
        maxLife: 2.2,
        alpha: strong ? .9 : .35
      });
    }

    // 点击星星许愿：点击处一道金色流星飞向蛋糕，化作星尘
    shootWish(cssX, cssY) {
      const tx = this.w * 0.68;
      const ty = this.h * 0.46;
      const dx = tx - cssX;
      const dy = ty - cssY;
      const dist = Math.hypot(dx, dy) || 1;
      const spd = Math.min(680, dist * 2.4);
      this.meteors.push({
        x: cssX,
        y: cssY,
        vx: dx / dist * spd,
        vy: dy / dist * spd,
        len: rand(70, 130),
        life: rand(1.1, 1.7),
        maxLife: 1.7,
        alpha: .95,
        gold: true
      });
      this.spawnBurstAt(cssX, cssY, 16, 55, 150);
    }

    // 彩蛋：金色流星雨
    goldenBurst() {
      for (let i = 0; i < 12; i++) {
        const sx = rand(this.w * -0.15, this.w * 1.15);
        const sy = rand(-60, this.h * 0.3);
        const angle = rand(Math.PI * 0.7, Math.PI * 0.95);
        const speed = rand(320, 620);
        this.meteors.push({
          x: sx,
          y: sy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          len: rand(120, 230),
          life: rand(1.4, 2.5),
          maxLife: 2.5,
          alpha: rand(.72, .95),
          gold: true
        });
      }
      this.spawnBurstAt(this.w * 0.68, this.h * 0.46, 46, 90, 260);
    }

    update(dt) {
      this.time += dt;
      this.px = lerp(this.px, this.tx, .035);
      this.py = lerp(this.py, this.ty, .035);
      this.ringAlpha = lerp(this.ringAlpha, this.ringTarget, .035);

      const w = this.w;
      const h = this.h;

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.fade = p.dying ? Math.max(0, p.fade - dt * 1.7) : Math.min(1, p.fade + dt * 1.4);
        if (p.fade <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.burst) {
          // 砸开 → 落满: brief outward smash, then gravity rains shards across the page
          if (p.smashT != null && p.smashT > 0) {
            p.smashT -= dt;
            p.vx *= .988;
            p.vy = p.vy * .986 + 15 * dt;
          } else {
            p.vx = p.vx * .98 + rand(-6, 6) * dt;
            p.vy = p.vy * .99 + (p.ringPiece ? 88 : 70) * dt;
            // soft horizontal drift so pieces settle across full width
            if (Math.abs(p.vx) < 10) p.vx += (Math.random() - .5) * 16 * dt;
          }
          if (p.grow) p.r += p.grow * 11 * dt;
          if (p.trail) {
            if (!p.trailPts) p.trailPts = [];
            p.trailPts.push({ x: p.x, y: p.y, a: p.alpha * p.fade });
            if (p.trailPts.length > 7) p.trailPts.shift();
          }
          p.life -= dt;
          if (p.life <= 0) p.dying = true;
          // keep dying soft near bottom so page stays covered briefly
          if (p.x < -240 || p.x > w + 240 || p.y < -240) p.dying = true;
          if (p.y > h + 80) {
            p.y = h + 80;
            p.vy *= .2;
            p.dying = true;
          }
        } else {
          if (p.x < -140) p.x = w + 120;
          if (p.x > w + 140) p.x = -120;
          if (p.y < -160) p.y = h + 140;
          if (p.y > h + 160) p.y = -140;
        }
      }

      this.meteorTimer -= dt;
      if (this.meteorTimer <= 0) {
        if (this.mode === 'meteor') {
          if (this.meteors.length < 7) this.spawnMeteor(true);
          this.meteorTimer = rand(.35, .9);
        } else if (this.mode === 'stars' || this.mode === 'halo') {
          if (this.meteors.length < 5) this.spawnMeteor(false);
          this.meteorTimer = rand(1.6, 3.8);
        } else {
          this.meteorTimer = 3;
        }
      }

      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.life -= dt;
        if (m.life <= 0 || m.x < -300 || m.y > h + 300) this.meteors.splice(i, 1);
      }

      for (let i = this.blowHalos.length - 1; i >= 0; i--) {
        const holo = this.blowHalos[i];
        if (holo.delay > 0) {
          holo.delay -= dt;
          continue;
        }
        holo.life -= dt;
        const k = 1 - Math.max(0, holo.life) / holo.maxLife;
        // fast smash expand, then ease as shards take over the rain
        holo.r = holo.r + (holo.maxR - holo.r) * Math.min(1, dt * (3.8 + k * 1.4)) + holo.maxR * 0.7 * dt;
        if (holo.cracked) holo.rot = (holo.rot || 0) + dt * (0.35 + k * 0.6);
        if (holo.life <= 0) this.blowHalos.splice(i, 1);
      }

      // halo 模式：周期扩散光环涟漪（常驻可辨）
      this.haloTimer -= dt;
      if (this.haloTimer <= 0) {
        if (this.mode === 'halo') this.spawnHaloRing(false);
        this.haloTimer = rand(1.6, 2.6);
      }
      for (let i = this.haloRings.length - 1; i >= 0; i--) {
        const h = this.haloRings[i];
        if (h.delay > 0) { h.delay -= dt; continue; }
        h.life -= dt;
        if (h.life <= 0) this.haloRings.splice(i, 1);
      }
    }

    drawStars(alpha) {
      const ctx = this.ctx;
      const time = this.time;
      const px = this.px * 7;
      const py = this.py * 7;
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        const tw = .45 + .55 * (.5 + .5 * Math.sin(time * s.tw + s.phase));
        const x = s.x * this.w + px * s.depth;
        const y = s.y * this.h + py * s.depth;
        const r = s.r;
        ctx.globalAlpha = tw * alpha;
        ctx.fillStyle = i % 7 === 0 ? '#ffe4b8' : '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        if (s.flare) {
          ctx.globalAlpha = tw * alpha * .55;
          ctx.strokeStyle = '#fff6dd';
          ctx.lineWidth = .55;
          ctx.beginPath();
          ctx.moveTo(x - r * 4, y);
          ctx.lineTo(x + r * 4, y);
          ctx.moveTo(x, y - r * 4);
          ctx.lineTo(x, y + r * 4);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    drawParticles() {
      const ctx = this.ctx;
      for (const p of this.particles) {
        const x = p.x + this.px * 26 * p.depth;
        const y = p.y + this.py * 18 * p.depth;
        const pulse = .88 + .12 * Math.sin(this.time * .7 + p.phase);
        const a = p.alpha * p.fade * pulse;
        if (a < .002) continue;

        const [r, g, b] = p.rgb;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, p.r);
        grad.addColorStop(0, `rgba(255,255,255,${Math.min(.78, a * 1.05)})`);
        grad.addColorStop(.08, `rgba(${r},${g},${b},${a * .9})`);
        grad.addColorStop(.25, `rgba(${r},${g},${b},${a * .65})`);
        grad.addColorStop(.52, `rgba(${r},${g},${b},${a * .36})`);
        grad.addColorStop(.78, `rgba(${r},${g},${b},${a * .12})`);
        grad.addColorStop(.93, `rgba(${r},${g},${b},${a * .04})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, TAU);
        ctx.fill();

        // tiny star flare only for non-orb sparks
        if (p.flare && !p.orb && p.r < 14) {
          ctx.globalAlpha = a * .85;
          ctx.strokeStyle = `rgba(255,246,220,${a})`;
          ctx.lineWidth = Math.max(.6, p.r * .18);
          ctx.beginPath();
          ctx.moveTo(x - p.r * 3.2, y);
          ctx.lineTo(x + p.r * 3.2, y);
          ctx.moveTo(x, y - p.r * 3.2);
          ctx.lineTo(x, y + p.r * 3.2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Short particle trail behind some blow orbs (粒子轨迹)
        if (p.trail && p.trailPts && p.trailPts.length > 1) {
          const pts = p.trailPts;
          ctx.lineCap = 'round';
          for (let t = 1; t < pts.length; t++) {
            const a0 = pts[t - 1];
            const a1 = pts[t];
            const ta = (t / pts.length) * a * 0.38;
            ctx.strokeStyle = `rgba(${r},${g},${b},${ta})`;
            ctx.lineWidth = Math.max(0.8, p.r * 0.08 * (t / pts.length));
            ctx.beginPath();
            ctx.moveTo(a0.x, a0.y);
            ctx.lineTo(a1.x, a1.y);
            ctx.stroke();
          }
        }

        // Glassy rim + highlight so celebrate 彩球 read as round glowing balls
        if (p.orb || p.r > 18) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${a * (p.orb ? .62 : .52)})`;
          ctx.lineWidth = Math.max(.55, Math.min(1.6, p.r * .016));
          ctx.beginPath();
          ctx.arc(x, y, p.r * .82, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,255,255,${a * (p.orb ? .32 : .22)})`;
          ctx.beginPath();
          ctx.arc(x - p.r * .22, y - p.r * .26, Math.max(1.2, p.r * .08), 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    drawMeteors() {
      const ctx = this.ctx;
      for (const m of this.meteors) {
        const speed = Math.hypot(m.vx, m.vy) || 1;
        const ux = m.vx / speed;
        const uy = m.vy / speed;
        const tx = m.x - ux * m.len;
        const ty = m.y - uy * m.len;
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
        if (m.gold) {
          g.addColorStop(0, `rgba(255,246,210,${m.alpha})`);
          g.addColorStop(.18, `rgba(255,205,125,${m.alpha * .75})`);
          g.addColorStop(1, 'rgba(255,170,80,0)');
        } else {
          g.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
          g.addColorStop(.12, `rgba(210,230,255,${m.alpha * .7})`);
          g.addColorStop(1, 'rgba(170,190,255,0)');
        }
        ctx.strokeStyle = g;
        ctx.lineWidth = m.gold ? 1.9 : 1.3;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.globalAlpha = m.alpha;
        ctx.fillStyle = m.gold ? '#ffe9a8' : '#ffffff';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.gold ? 2.1 : 1.45, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    drawRings() {
      if (this.ringAlpha < .01) return;
      const ctx = this.ctx;
      const cx = this.w * .72;
      const cy = this.h * .46;
      const base = Math.min(this.w, this.h);
      const time = this.time;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const rx = base * (.20 + i * .023);
        const ry = rx * (.25 + i * .012);
        const rot = -.18 + i * .13;
        const cyi = cy + (i - 1) * this.h * .045;
        ctx.save();
        ctx.translate(cx, cyi);
        ctx.rotate(rot);
        ctx.globalAlpha = this.ringAlpha * (.18 - i * .015);
        ctx.strokeStyle = i === 1 ? '#c7b4ff' : '#ffd8a8';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
        ctx.stroke();

        const a0 = time * .32 + i * 1.9;
        ctx.globalAlpha = this.ringAlpha * .55;
        ctx.strokeStyle = i === 1 ? '#e3d9ff' : '#ffe7c2';
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 12;
        ctx.shadowColor = i === 1 ? 'rgba(180,150,255,.8)' : 'rgba(255,200,140,.8)';
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, a0, a0 + .85);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    drawBlowHalos() {
      if (!this.blowHalos || !this.blowHalos.length) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const holo of this.blowHalos) {
        if (holo.delay > 0) continue;
        const k = Math.max(0, holo.life) / holo.maxLife;
        const [r, g, b] = holo.rgb;
        const a = k * 0.92;
        const rad = Math.max(2, holo.r);
        ctx.lineWidth = holo.width * (0.6 + k * 1.0);
        ctx.shadowBlur = 22;
        ctx.shadowColor = `rgba(${r},${g},${b},${a * 0.85})`;
        if (holo.cracked) {
          // cracked ring arcs — 砸开 feel before pieces rain down
          const segs = holo.segs || 8;
          const rot = holo.rot || 0;
          const gap = 0.22;
          for (let s = 0; s < segs; s++) {
            const a0 = rot + (s / segs) * TAU + gap * 0.5;
            const a1 = rot + ((s + 1) / segs) * TAU - gap * 0.5;
            ctx.strokeStyle = `rgba(${r},${g},${b},${a * (0.7 + (s % 2) * 0.25)})`;
            ctx.beginPath();
            ctx.arc(holo.x, holo.y, rad, a0, a1);
            ctx.stroke();
          }
        } else {
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.beginPath();
          ctx.arc(holo.x, holo.y, rad, 0, TAU);
          ctx.stroke();
        }
        const grad = ctx.createRadialGradient(holo.x, holo.y, rad * 0.72, holo.x, holo.y, rad * 1.12);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.55, `rgba(${r},${g},${b},${a * 0.14})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(holo.x, holo.y, rad * 1.12, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }


    drawHaloRings() {
      if (!this.haloRings || !this.haloRings.length) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const h of this.haloRings) {
        if (h.delay > 0) continue;
        const k = Math.max(0, h.life) / h.maxLife;
        const [r, g, b] = h.rgb;
        const a = k * 0.7;
        const rad = h.r0 + (h.r1 - h.r0) * (1 - k);
        ctx.globalAlpha = a;
        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
        ctx.lineWidth = h.width * (0.5 + k * 0.8);
        ctx.shadowBlur = 18;
        ctx.shadowColor = `rgba(${r},${g},${b},${a * 0.8})`;
        ctx.beginPath();
        ctx.arc(h.x, h.y, rad, 0, TAU);
        ctx.stroke();
        const grad = ctx.createRadialGradient(h.x, h.y, rad * 0.85, h.x, h.y, rad * 1.18);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(.55, `rgba(${r},${g},${b},${a * 0.12})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(h.x, h.y, rad * 1.18, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = 'lighter';
      const starAlpha = this.mode === 'snow' ? .45 : this.mode === 'meteor' ? .8 : .72;
      this.drawStars(starAlpha);
      this.drawBlowHalos();
      this.drawParticles();
      this.drawMeteors();
      this.drawHaloRings();
      this.drawRings();
      ctx.globalCompositeOperation = 'source-over';
    }

    loop(now) {
      this.raf = 0;
      const dt = Math.min(.05, (now - this.last) / 1000 || .016);
      this.last = now;
      this.update(dt);
      this.draw();
      if (!this.reduced) this.raf = requestAnimationFrame(this.loop);
    }
  }

  window.ParticleField = ParticleField;
})();
