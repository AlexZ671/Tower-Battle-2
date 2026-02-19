import { TOWER_TYPES, TOWER_ORDER } from './towers.js';
import {
  drawGunTower,
  drawCannonTower,
  drawSniperTower,
  drawTeslaTower,
} from './renderer.js';
import { pickRandomModifiers, createEmptyModifiers, pickRandomGlobalModifiers, pickHardModifiers } from './modifiers.js';
import { sound } from './sound.js';

const TOWER_DRAW_FN = {
  gun: drawGunTower,
  cannon: drawCannonTower,
  sniper: drawSniperTower,
  tesla: drawTeslaTower,
};

const PREVIEW_SIZE = 160;

export class UI {
  constructor(game) {
    this.game = game;
    this.selectedTower = null;
    this.previewRafId = null;

    this.hudWave = document.getElementById('hud-wave');
    this.hudLives = document.getElementById('hud-lives');
    this.hudGold = document.getElementById('hud-gold');
    this.towerPanel = document.getElementById('tower-panel');
    this.previewEl = document.getElementById('tower-preview');
    this.previewCanvas = document.getElementById('preview-canvas');
    this.previewInfo = document.getElementById('preview-info');
    this.previewCtx = this.previewCanvas.getContext('2d');

    this.modifierOverlay = document.getElementById('modifier-overlay');
    this.modifierCards = document.getElementById('modifier-cards');

    this.previewCanvas.width = PREVIEW_SIZE;
    this.previewCanvas.height = PREVIEW_SIZE;

    this.buildTowerPanel();
    this.updateHUD();
  }

  buildTowerPanel() {
    this.towerPanel.innerHTML = '';

    for (const type of TOWER_ORDER) {
      const def = TOWER_TYPES[type];
      const btn = document.createElement('div');
      btn.className = 'tower-btn';
      btn.dataset.type = type;

      const iconCanvas = document.createElement('canvas');
      iconCanvas.width = 32;
      iconCanvas.height = 32;
      const iconCtx = iconCanvas.getContext('2d');
      iconCtx.save();
      iconCtx.translate(16, 16);
      iconCtx.scale(0.75, 0.75);
      const drawFn = TOWER_DRAW_FN[type];
      if (drawFn) drawFn(iconCtx, def.color, 0, 0);
      iconCtx.restore();

      const nameSpan = document.createElement('span');
      nameSpan.className = 'tower-btn-name';
      nameSpan.textContent = def.name;

      const costSpan = document.createElement('span');
      costSpan.className = 'tower-btn-cost';
      costSpan.textContent = `${def.cost}`;

      btn.appendChild(iconCanvas);
      btn.appendChild(nameSpan);
      btn.appendChild(costSpan);

      btn.addEventListener('click', () => this.selectTower(type));
      btn.addEventListener('mouseenter', (e) => this.showPreview(type, e));
      btn.addEventListener('mousemove', (e) => this.movePreview(e));
      btn.addEventListener('mouseleave', () => this.hidePreview());

      this.towerPanel.appendChild(btn);
    }

    // Кнопка волны
    const waveBtn = document.createElement('button');
    waveBtn.id = 'wave-btn';
    waveBtn.textContent = 'Старт волны';
    waveBtn.addEventListener('click', () => this.game.onWaveButtonClick());
    this.towerPanel.appendChild(waveBtn);
  }

  selectTower(type) {
    // Нельзя выбирать башни во время волны
    if (this.game.waveManager.waveActive) return;
    this.selectedTower = this.selectedTower === type ? null : type;
    this.updateTowerButtons();
  }

  updateTowerButtons() {
    const waveActive = this.game.waveManager.waveActive;

    const costMult = this.game.globalMods ? this.game.globalMods.towerCostMult : 1;
    const buttons = this.towerPanel.querySelectorAll('.tower-btn');
    buttons.forEach(btn => {
      const type = btn.dataset.type;
      const def = TOWER_TYPES[type];
      const realCost = Math.floor(def.cost * costMult);
      btn.classList.toggle('selected', type === this.selectedTower);
      btn.classList.toggle('disabled', waveActive || this.game.gold < realCost);
      // Обновляем отображение цены
      const costSpan = btn.querySelector('.tower-btn-cost');
      if (costSpan) costSpan.textContent = `${realCost}`;
    });

    const waveBtn = document.getElementById('wave-btn');
    if (waveBtn) {
      waveBtn.disabled = !this.game.waveManager.canStartWave;
      waveBtn.textContent = this.game.waveManager.canStartWave
        ? (this.game.waveManager.waveNumber === 0 ? 'Старт волны' : 'След. волна')
        : `Волна ${this.game.waveManager.waveNumber}...`;
    }

    // Сбросить выбор при начале волны
    if (waveActive && this.selectedTower) {
      this.selectedTower = null;
      this.game.placementPreview = null;
    }
  }

  updateHUD() {
    this.hudWave.textContent = `Волна: ${this.game.waveManager.waveNumber || '—'}`;
    this.hudLives.textContent = `HP: ${this.game.lives}`;
    this.hudGold.textContent = `${this.game.gold}`;
  }

  // ─── Карточки модификаторов ───

  showModifierCards(eventTier = null) {
    return new Promise((resolve) => {
      const choices = eventTier ? pickHardModifiers(3) : pickRandomModifiers(3);
      this.modifierCards.innerHTML = '';

      // Обновляем заголовок
      const titleEl = document.getElementById('modifier-title');
      if (titleEl) {
        if (eventTier) {
          titleEl.textContent = eventTier.name;
          titleEl.style.color = eventTier.color;
          titleEl.style.textShadow = `0 0 20px ${eventTier.glowColor}`;
        } else {
          titleEl.textContent = 'Выберите модификатор';
          titleEl.style.color = '#c9d1d9';
          titleEl.style.textShadow = 'none';
        }
      }

      // Звук ивентовой волны
      if (eventTier) sound.eventWave(eventTier.id);

      // Усиление описания для ивентовых волн
      const dm = eventTier ? eventTier.diffMult : 1;

      for (const mod of choices) {
        const card = document.createElement('div');
        card.className = 'modifier-card';
        if (eventTier) card.classList.add(`event-${eventTier.id}`);

        // Описание с учётом множителя ивента
        let desc = mod.desc;
        if (dm > 1) {
          desc = desc.replace(/(\d+(?:\.\d+)?)(%)/g, (_, num, pct) => {
            return Math.round(parseFloat(num) * dm) + pct;
          });
          desc = desc.replace(/(\d+(?:\.\d+)?)(x)/g, (_, num, x) => {
            return (parseFloat(num) * dm).toFixed(1) + x;
          });
        }

        card.innerHTML = `
          <div class="modifier-card-icon" style="color:${mod.color}">${mod.icon}</div>
          <div class="modifier-card-name">${mod.name}</div>
          <div class="modifier-card-desc">${desc}</div>
        `;

        card.addEventListener('click', () => {
          sound.cardSelect();
          card.classList.add('selected');
          const others = this.modifierCards.querySelectorAll('.modifier-card:not(.selected)');
          others.forEach(c => c.classList.add('dismissed'));

          const mods = createEmptyModifiers();
          mod.apply(mods);

          // Ивентовый множитель: усиливаем все отклонения от 1
          if (eventTier) {
            mods.hpMult = 1 + (mods.hpMult - 1) * dm;
            mods.speedMult = 1 + (mods.speedMult - 1) * dm;
            mods.countMult = 1 + (mods.countMult - 1) * dm;
            mods.rewardMult = 1 + (mods.rewardMult - 1) * dm;
            mods.regenPercent *= dm;
            mods.spawnMult = 1 + (mods.spawnMult - 1) * dm;
            mods.sizeMult = 1 + (mods.sizeMult - 1) * dm;
          }

          setTimeout(() => {
            this.modifierOverlay.classList.add('hidden');
            resolve(mods);
          }, 450);
        });

        this.modifierCards.appendChild(card);
      }

      this.modifierOverlay.classList.remove('hidden');
    });
  }

  // Авто-выбор рандомного модификатора (без UI)
  autoPickModifier(eventTier = null) {
    const choices = eventTier ? pickHardModifiers(3) : pickRandomModifiers(3);
    const mod = choices[Math.floor(Math.random() * choices.length)];
    const mods = createEmptyModifiers();
    mod.apply(mods);
    if (eventTier) {
      const dm = eventTier.diffMult;
      mods.hpMult = 1 + (mods.hpMult - 1) * dm;
      mods.speedMult = 1 + (mods.speedMult - 1) * dm;
      mods.countMult = 1 + (mods.countMult - 1) * dm;
      mods.rewardMult = 1 + (mods.rewardMult - 1) * dm;
      mods.regenPercent *= dm;
      mods.spawnMult = 1 + (mods.spawnMult - 1) * dm;
      mods.sizeMult = 1 + (mods.sizeMult - 1) * dm;
    }
    return mods;
  }

  // ─── Глобальные карточки (каждые 10 волн) ───

  showGlobalModifierCards() {
    return new Promise((resolve) => {
      const choices = pickRandomGlobalModifiers(3);
      const overlay = document.getElementById('global-modifier-overlay');
      const container = document.getElementById('global-modifier-cards');
      container.innerHTML = '';

      for (const mod of choices) {
        const wrapper = document.createElement('div');
        wrapper.className = 'global-card-wrapper';

        wrapper.innerHTML = `
          <div class="global-card-inner">
            <div class="global-card-back"></div>
            <div class="global-card-front">
              <div class="gc-icon">${mod.icon}</div>
              <div class="gc-name" style="color:${mod.color}">${mod.name}</div>
              <div class="gc-desc">${mod.desc}</div>
              <div class="gc-tag">навсегда</div>
            </div>
          </div>
        `;

        wrapper.addEventListener('click', () => {
          if (wrapper.classList.contains('flipped') || wrapper.classList.contains('burning')) return;

          // Переворачиваем выбранную карту
          wrapper.classList.add('flipped');

          // Остальные карты сгорают с задержкой после переворота
          setTimeout(() => {
            const allCards = container.querySelectorAll('.global-card-wrapper');
            allCards.forEach(card => {
              if (card !== wrapper) {
                card.classList.add('burning');
              }
            });
          }, 800);

          // Даём время прочитать модификатор, потом закрываем
          setTimeout(() => {
            overlay.classList.add('hidden');
            resolve(mod);
          }, 3000);
        });

        container.appendChild(wrapper);
      }

      overlay.classList.remove('hidden');
    });
  }

  // ─── Превью башни ───

  showPreview(type, event) {
    const def = TOWER_TYPES[type];
    this.previewEl.classList.remove('hidden');

    this.previewInfo.innerHTML = `
      <div class="stat"><span class="stat-label">Урон:</span><span class="stat-value">${def.damage}</span></div>
      <div class="stat"><span class="stat-label">Дальность:</span><span class="stat-value">${def.range} кл</span></div>
      <div class="stat"><span class="stat-label">Скорость:</span><span class="stat-value">${(1 / def.fireRate).toFixed(1)}/с</span></div>
      <div class="stat-desc">${def.description}</div>
    `;

    this.positionPreview(event);
    this.startPreviewAnimation(type, def);
  }

  positionPreview(event) {
    const el = this.previewEl;
    const pad = 12;

    let x = event.clientX - PREVIEW_SIZE / 2 - pad;
    let y = event.clientY - PREVIEW_SIZE - 120;

    x = Math.max(pad, Math.min(x, window.innerWidth - PREVIEW_SIZE - pad * 4));
    y = Math.max(pad, y);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  movePreview(event) {
    this.positionPreview(event);
  }

  hidePreview() {
    this.previewEl.classList.add('hidden');
    if (this.previewRafId) {
      cancelAnimationFrame(this.previewRafId);
      this.previewRafId = null;
    }
  }

  startPreviewAnimation(type, def) {
    if (this.previewRafId) {
      cancelAnimationFrame(this.previewRafId);
    }

    const ctx = this.previewCtx;
    const s = PREVIEW_SIZE;
    const cx = s / 2;
    const cy = s / 2;
    let time = 0;
    let last = 0;

    const enemies = [0, 1, 2].map(i => ({
      angle: (i * Math.PI * 2) / 3,
      r: 50,
      speed: 0.7 + i * 0.15,
      size: 6,
    }));

    const animate = (ts) => {
      if (!last) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      time += dt;

      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = '#141e30';
      ctx.fillRect(0, 0, s, s);

      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Сначала вычисляем позиции врагов
      const positions = [];
      for (const e of enemies) {
        e.angle += e.speed * dt;
        const ex = cx + Math.cos(e.angle) * e.r;
        const ey = cy + Math.sin(e.angle) * e.r;
        positions.push({ x: ex, y: ey });

        ctx.beginPath();
        ctx.arc(ex, ey, e.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Башня — детализированный рендер (после positions)
      ctx.save();
      ctx.translate(cx, cy);
      const towerAngle = Math.atan2(positions[0].y - cy, positions[0].x - cx);
      const tDrawFn = TOWER_DRAW_FN[type];
      if (tDrawFn) tDrawFn(ctx, def.color, towerAngle, time);
      ctx.restore();

      // Визуал стрельбы
      const phase = time % def.fireRate;
      const shooting = phase < 0.15;
      const t0 = positions[0];

      if (shooting) {
        const t = phase / 0.15;

        if (def.special === 'chain') {
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 2;
          ctx.shadowColor = def.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          for (const p of positions) ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (def.special === 'splash') {
          const bx = cx + (t0.x - cx) * t;
          const by = cy + (t0.y - cy) * t;
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fillStyle = def.color;
          ctx.fill();
          if (t > 0.7) {
            ctx.beginPath();
            ctx.arc(t0.x, t0.y, 20 * (t - 0.7) / 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(230,126,34,${0.4 * (1 - (t - 0.7) / 0.3)})`;
            ctx.fill();
          }
        } else if (def.special === 'slow') {
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 2;
          ctx.shadowColor = def.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(t0.x, t0.y);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(t0.x, t0.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(116,185,255,0.25)';
          ctx.fill();
        } else {
          const bx = cx + (t0.x - cx) * t;
          const by = cy + (t0.y - cy) * t;
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fillStyle = def.color;
          ctx.shadowColor = def.color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(t0.x, t0.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      this.previewRafId = requestAnimationFrame(animate);
    };

    this.previewRafId = requestAnimationFrame(animate);
  }
}
