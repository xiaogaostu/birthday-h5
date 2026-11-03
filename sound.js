/* ============================================================
   sound.js — a tiny generative music box (WebAudio, no assets)
   ============================================================ */
(() => {
  'use strict';

  class AmbientSound {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.delay = null;
      this.playing = false;
      this.timer = 0;
      this.notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    }

    async ensure() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      const ctx = new AC();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 18;
      comp.ratio.value = 3;
      comp.attack.value = .01;
      comp.release.value = .4;
      master.connect(comp);
      comp.connect(ctx.destination);
      this.master = master;

      const delay = ctx.createDelay(1.2);
      delay.delayTime.value = .42;
      const fb = ctx.createGain();
      fb.gain.value = .3;
      const wet = ctx.createGain();
      wet.gain.value = .26;
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(master);
      this.delay = delay;

      // warm pad
      const padBus = ctx.createGain();
      padBus.gain.value = .05;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 620;
      filter.Q.value = .4;
      padBus.connect(filter);
      filter.connect(master);

      [130.81, 196.0, 261.63].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.detune.value = (i - 1) * 4;
        const g = ctx.createGain();
        g.gain.value = i === 2 ? .12 : .2;
        osc.connect(g);
        g.connect(padBus);
        osc.start();

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = .05 + i * .013;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 2.5 + i;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.detune);
        lfo.start();
      });
      return true;
    }

    async start() {
      const ok = await this.ensure();
      if (!ok) return false;
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      if (this.playing) {
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.setTargetAtTime(.14, this.ctx.currentTime, .6);
        return true;
      }
      this.playing = true;
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(.0001, this.master.gain.value), now);
      this.master.gain.exponentialRampToValueAtTime(.14, now + 1.8);
      this.chime(now + .35);
      this.schedule();
      return true;
    }

    stop() {
      if (!this.ctx) return;
      this.playing = false;
      clearTimeout(this.timer);
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(.0001, this.master.gain.value), now);
      this.master.gain.exponentialRampToValueAtTime(.0001, now + .7);
    }

    schedule() {
      clearTimeout(this.timer);
      if (!this.playing) return;
      const wait = 2800 + Math.random() * 3200;
      this.timer = setTimeout(() => {
        if (!this.playing) return;
        this.chime();
        this.schedule();
      }, wait);
    }

    chime(when) {
      if (!this.ctx || !this.playing) return;
      const ctx = this.ctx;
      const t = when == null ? ctx.currentTime + .02 : when;
      const freq = this.notes[Math.floor(Math.random() * this.notes.length)];
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.065, t + .025);
      g.gain.exponentialRampToValueAtTime(.0001, t + 3.6);
      osc.connect(g);
      g.connect(this.master);
      if (this.delay) g.connect(this.delay);
      osc.start(t);
      osc.stop(t + 3.8);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 2.001;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(.0001, t);
      g2.gain.exponentialRampToValueAtTime(.018, t + .04);
      g2.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
      osc2.connect(g2);
      g2.connect(this.master);
      osc2.start(t);
      osc2.stop(t + 2.4);
    }
  }

  window.AmbientSound = AmbientSound;
})();
