// ═══════════════════════════════════════════
// Процедурный звуковой движок (Web Audio API)
// ═══════════════════════════════════════════

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.volume = 0.3;
  }

  setVolume(v) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  _ensureContext() {
    if (this.ctx) return true;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      return true;
    } catch {
      return false;
    }
  }

  // ─── Хелперы ───

  _now() {
    return this.ctx.currentTime;
  }

  _gain(vol) {
    const g = this.ctx.createGain();
    g.gain.value = vol;
    g.connect(this.masterGain);
    return g;
  }

  _osc(type, freq, dest, startTime, stopTime) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.connect(dest);
    o.start(startTime);
    o.stop(stopTime);
    return o;
  }

  _noiseBuffer(duration) {
    const sr = this.ctx.sampleRate;
    const len = sr * duration;
    const buf = this.ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  _playNoise(duration, dest, startTime) {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer(duration + 0.05);
    src.connect(dest);
    src.start(startTime);
    src.stop(startTime + duration);
    return src;
  }

  // ═══════════════════════════════════════
  // БАШНИ — Выстрелы
  // ═══════════════════════════════════════

  gunShoot() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.12);

    // Highpass шум — короткий щелчок
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2000;
    hp.connect(g);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(1, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    env.connect(hp);

    this._playNoise(0.05, env, t);
  }

  cannonShoot() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.2);

    // Низкий boom — sine sweep вниз
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.8, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    env.connect(g);

    const o = this._osc('sine', 80, env, t, t + 0.2);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    // Шум слой
    const noiseG = this.ctx.createGain();
    noiseG.gain.setValueAtTime(0.3, t);
    noiseG.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noiseG.connect(g);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    lp.connect(noiseG);
    this._playNoise(0.15, lp, t);
  }

  sniperShoot() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.15);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(1, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    env.connect(g);

    const o = this._osc('sine', 1500, env, t, t + 0.08);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.08);
  }

  teslaShoot() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.15);

    // Sawtooth с вибрато
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.6, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    env.connect(g);

    const o = this._osc('sawtooth', 800, env, t, t + 0.12);
    // Быстрое вибрато
    const lfo = this._osc('sine', 40, o.frequency, t, t + 0.12);
    lfo.frequency.value = 40;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.disconnect();
    lfo.connect(lfoGain);
    lfoGain.connect(o.frequency);

    // Шум
    const noiseG = this.ctx.createGain();
    noiseG.gain.setValueAtTime(0.3, t);
    noiseG.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    noiseG.connect(g);
    this._playNoise(0.1, noiseG, t);
  }

  splashHit() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.18);

    // Бас-удар
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.7, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    env.connect(g);

    const o = this._osc('sine', 60, env, t, t + 0.12);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.12);

    // Шум
    const noiseG = this.ctx.createGain();
    noiseG.gain.setValueAtTime(0.4, t);
    noiseG.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    noiseG.connect(g);
    this._playNoise(0.1, noiseG, t);
  }

  beamFire() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.15);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.8, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    env.connect(g);

    const o = this._osc('sine', 3000, env, t, t + 0.15);
    o.frequency.exponentialRampToValueAtTime(500, t + 0.15);
  }

  // ═══════════════════════════════════════
  // МОНСТРЫ — Способности
  // ═══════════════════════════════════════

  shieldActivate() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.12);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.01, t);
    env.gain.linearRampToValueAtTime(0.6, t + 0.05);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    env.connect(g);

    const o = this._osc('sine', 400, env, t, t + 0.2);
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
  }

  healPulse() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.1);

    // Колокольчик — два тона
    for (const freq of [800, 1200]) {
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.5, t);
      env.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      env.connect(g);
      this._osc('sine', freq, env, t, t + 0.3);
    }
  }

  teleport() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.15);

    // Bandpass sweep шум
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(200, t);
    bp.frequency.exponentialRampToValueAtTime(4000, t + 0.15);
    bp.Q.value = 2;
    bp.connect(g);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.8, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    env.connect(bp);

    this._playNoise(0.15, env, t);
  }

  phaseToggle(entering = true) {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.08);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    env.connect(g);

    const f1 = entering ? 600 : 1800;
    const f2 = entering ? 1800 : 600;
    const o = this._osc('sine', f1, env, t, t + 0.1);
    o.frequency.exponentialRampToValueAtTime(f2, t + 0.1);
  }

  enrage() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.15);

    // Distortion
    const dist = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = (Math.PI + 4) * x / (Math.PI + 4 * Math.abs(x));
    }
    dist.curve = curve;
    dist.connect(g);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.8, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    env.connect(dist);

    this._osc('sawtooth', 100, env, t, t + 0.2);
  }

  massShield() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.15);

    // Удлинённый shimmer
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.01, t);
    env.gain.linearRampToValueAtTime(0.7, t + 0.1);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    env.connect(g);

    const o = this._osc('sine', 300, env, t, t + 0.4);
    o.frequency.exponentialRampToValueAtTime(1500, t + 0.3);

    // Второй тон с задержкой
    const env2 = this.ctx.createGain();
    env2.gain.setValueAtTime(0.01, t + 0.05);
    env2.gain.linearRampToValueAtTime(0.5, t + 0.15);
    env2.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    env2.connect(g);

    const o2 = this._osc('sine', 500, env2, t + 0.05, t + 0.4);
    o2.frequency.exponentialRampToValueAtTime(2000, t + 0.35);
  }

  towerDisable() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.2);

    // EMP — низкий гул
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.8, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    env.connect(g);

    this._osc('sine', 50, env, t, t + 0.3);

    // Шум burst
    const noiseG = this.ctx.createGain();
    noiseG.gain.setValueAtTime(0.6, t);
    noiseG.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noiseG.connect(g);
    this._playNoise(0.15, noiseG, t);
  }

  queenSpawn() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.1);

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 500;
    lp.connect(g);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.7, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    env.connect(lp);

    this._playNoise(0.08, env, t);
  }

  // ═══════════════════════════════════════
  // ИГРОВЫЕ СОБЫТИЯ
  // ═══════════════════════════════════════

  towerPlace() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.15);

    // Механический клик — два тона
    const env1 = this.ctx.createGain();
    env1.gain.setValueAtTime(0.6, t);
    env1.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    env1.connect(g);
    this._osc('sine', 400, env1, t, t + 0.03);

    const env2 = this.ctx.createGain();
    env2.gain.setValueAtTime(0.4, t + 0.03);
    env2.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    env2.connect(g);
    this._osc('sine', 600, env2, t + 0.03, t + 0.06);
  }

  towerSell() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.12);

    // Монеты — 3 нарастающих тона
    const freqs = [1000, 1500, 2000];
    freqs.forEach((f, i) => {
      const delay = i * 0.04;
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.5, t + delay);
      env.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.06);
      env.connect(g);
      this._osc('sine', f, env, t + delay, t + delay + 0.06);
    });
  }

  towerMerge() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.18);

    // Восходящий sweep
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.01, t);
    env.gain.linearRampToValueAtTime(0.8, t + 0.1);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    env.connect(g);

    const o = this._osc('sine', 200, env, t, t + 0.35);
    o.frequency.exponentialRampToValueAtTime(2000, t + 0.25);

    // Shimmer
    const env2 = this.ctx.createGain();
    env2.gain.setValueAtTime(0.01, t + 0.1);
    env2.gain.linearRampToValueAtTime(0.4, t + 0.2);
    env2.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    env2.connect(g);
    this._osc('sine', 1200, env2, t + 0.1, t + 0.4);
  }

  enemyDeath() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.08);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    env.connect(g);

    const o = this._osc('sine', 300, env, t, t + 0.08);
    o.frequency.exponentialRampToValueAtTime(100, t + 0.08);
  }

  lifeLost() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.25);

    // Два тревожных гудка
    for (let i = 0; i < 2; i++) {
      const start = t + i * 0.18;
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.7, start);
      env.gain.exponentialRampToValueAtTime(0.01, start + 0.15);
      env.connect(g);

      const o = this._osc('sine', 500, env, start, start + 0.15);
      o.frequency.exponentialRampToValueAtTime(200, start + 0.15);
    }
  }

  gameOver() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.3);

    // 3 нисходящие ноты
    const notes = [400, 300, 200];
    notes.forEach((freq, i) => {
      const start = t + i * 0.25;
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.7, start);
      env.gain.exponentialRampToValueAtTime(0.01, start + 0.22);
      env.connect(g);
      this._osc('sine', freq, env, start, start + 0.22);
    });
  }

  waveStart() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.15);

    // Горн — два тона с crescendo
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.01, t);
    env.gain.linearRampToValueAtTime(0.6, t + 0.15);
    env.gain.setValueAtTime(0.6, t + 0.25);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    env.connect(g);

    this._osc('sine', 500, env, t, t + 0.4);

    const env2 = this.ctx.createGain();
    env2.gain.setValueAtTime(0.01, t);
    env2.gain.linearRampToValueAtTime(0.3, t + 0.15);
    env2.gain.setValueAtTime(0.3, t + 0.25);
    env2.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    env2.connect(g);

    this._osc('sine', 750, env2, t, t + 0.4);
  }

  // ═══════════════════════════════════════
  // UI
  // ═══════════════════════════════════════

  cardSelect() {
    if (!this._ensureContext()) return;
    const t = this._now();
    const g = this._gain(0.1);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    env.connect(g);

    this._osc('sine', 1000, env, t, t + 0.04);
  }

  eventWave(tier) {
    if (!this._ensureContext()) return;
    const t = this._now();

    if (tier === 'rare') {
      // Колокольчик
      const g = this._gain(0.12);
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.6, t);
      env.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      env.connect(g);
      this._osc('sine', 1200, env, t, t + 0.5);

    } else if (tier === 'epic') {
      // Аккорд
      const g = this._gain(0.15);
      for (const freq of [600, 900, 1200]) {
        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.5, t);
        env.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        env.connect(g);
        this._osc('sine', freq, env, t, t + 0.6);
      }

    } else if (tier === 'legendary') {
      // Органный ревёрб — мощный аккорд с долгим затуханием
      const g = this._gain(0.2);
      for (const freq of [400, 600, 800, 1000, 1200]) {
        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.01, t);
        env.gain.linearRampToValueAtTime(0.5, t + 0.15);
        env.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
        env.connect(g);
        this._osc('sine', freq, env, t, t + 1.0);
      }
      // Шум shimmer
      const noiseG = this.ctx.createGain();
      noiseG.gain.setValueAtTime(0.01, t);
      noiseG.gain.linearRampToValueAtTime(0.2, t + 0.2);
      noiseG.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
      noiseG.connect(g);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2000;
      bp.Q.value = 3;
      bp.connect(noiseG);
      this._playNoise(0.8, bp, t);
    }
  }
}

export const sound = new SoundEngine();
