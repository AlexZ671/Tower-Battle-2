import './style.css';
import { CELL_SIZE, LEVELS, pixelToCell, isValidPlacement, grid, loadLevel } from './map.js';
import { TOWER_TYPES, Tower } from './towers.js';
import { Enemy } from './enemies.js';
import { Projectile } from './projectiles.js';
import { WaveManager } from './waves.js';
import { Renderer, rebuildDecor } from './renderer.js';
import { UI } from './ui.js';
import { ParticleSystem } from './particles.js';
import { createEmptyGlobalModifiers, rollEventTier } from './modifiers.js';
import { sound } from './sound.js';

// ═══════════════════════════════════════════
// Главное меню
// ═══════════════════════════════════════════
const menuEl = document.getElementById('main-menu');
const levelCardsEl = document.getElementById('level-cards');
const gameContainerEl = document.getElementById('game-container');

let currentGame = null;

function buildMenu() {
  levelCardsEl.innerHTML = '';

  for (const level of LEVELS) {
    const card = document.createElement('div');
    card.className = 'level-card';
    card.style.borderColor = level.color + '40';
    card.innerHTML = `
      <div class="level-card-num" style="color:${level.color}">${level.id}</div>
      <div class="level-card-name">${level.name}</div>
      <div class="level-card-diff" style="color:${level.color}">${level.difficulty}</div>
      <div class="level-card-desc">${level.desc}</div>
      <div class="level-card-info">
        <span>Золото<div class="val" style="color:#e3b341">${level.startGold}</div></span>
        <span>Жизни<div class="val" style="color:#f85149">${level.startLives}</div></span>
        <span>Путей<div class="val">${level.pathCellArrays ? level.pathCellArrays.length : '?'}</div></span>
      </div>
    `;

    card.addEventListener('mouseenter', () => {
      card.style.borderColor = level.color;
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = level.color + '40';
    });
    card.addEventListener('click', () => startGame(level.id));

    levelCardsEl.appendChild(card);
  }
}

function showMenu() {
  if (currentGame) {
    currentGame.destroy();
    currentGame = null;
  }
  menuEl.classList.remove('hidden');
  gameContainerEl.classList.add('hidden');
  document.getElementById('game-over').classList.add('hidden');
}

function startGame(levelId) {
  if (currentGame) {
    currentGame.destroy();
    currentGame = null;
  }
  loadLevel(levelId);
  rebuildDecor();
  menuEl.classList.add('hidden');
  gameContainerEl.classList.remove('hidden');
  currentGame = new Game(levelId);
}

buildMenu();

// ═══════════════════════════════════════════
// Game
// ═══════════════════════════════════════════
class Game {
  constructor(levelId) {
    this.levelId = levelId;
    const level = LEVELS.find(l => l.id === levelId);

    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    this.waveManager = new WaveManager();
    this.particles = new ParticleSystem();

    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.gold = level.startGold;
    this.lives = level.startLives;
    this.gameOver = false;
    this.time = 0;

    this.globalMods = createEmptyGlobalModifiers();
    this.placementPreview = null;
    this.lastTime = 0;
    this.sellTooltip = null;
    this._destroyed = false;
    this.dragState = null;
    this._dragStartPos = null;
    this.gameSpeed = 1;
    this.autoWave = false;

    this.ui = new UI(this);
    this.setupInput();
    this.setupControls();
    this.loop = this.loop.bind(this);
    this._rafId = requestAnimationFrame(this.loop);
  }

  destroy() {
    this._destroyed = true;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this.hideSellTooltip();
    for (const tower of this.towers) {
      if (grid[tower.row] && grid[tower.row][tower.col] === 4) {
        grid[tower.row][tower.col] = 0;
      }
    }
    // Очистка обработчиков
    if (this._onMouseMove) this.canvas.removeEventListener('mousemove', this._onMouseMove);
    if (this._onMouseLeave) this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
    if (this._onMouseDown) this.canvas.removeEventListener('mousedown', this._onMouseDown);
    if (this._onMouseUp) this.canvas.removeEventListener('mouseup', this._onMouseUp);
    if (this._onClick) this.canvas.removeEventListener('click', this._onClick);
    if (this._onContext) this.canvas.removeEventListener('contextmenu', this._onContext);
  }

  setupInput() {
    this._onMouseMove = (e) => {
      if (this.gameOver || this._destroyed) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Если тащим башню — только обновляем позицию
      if (this.dragState) {
        this.dragState.currentX = x;
        this.dragState.currentY = y;
        this.hideSellTooltip();
        this.placementPreview = null;
        return;
      }

      const { row, col } = pixelToCell(x, y);

      if (this.waveManager.waveActive || !this.ui.selectedTower) {
        const tower = this.getTowerAt(row, col);
        if (tower) {
          this.showSellTooltip(e, tower);
        } else {
          this.hideSellTooltip();
        }
      }

      if (this.ui.selectedTower && !this.waveManager.waveActive) {
        const def = TOWER_TYPES[this.ui.selectedTower];
        const realCost = Math.floor(def.cost * this.globalMods.towerCostMult);
        const valid = isValidPlacement(row, col) && !this.getTowerAt(row, col) && this.gold >= realCost;
        this.placementPreview = {
          row, col, valid,
          range: def.range * CELL_SIZE,
        };
      } else {
        this.placementPreview = null;
      }
    };

    this._onMouseLeave = () => {
      this.placementPreview = null;
      this.hideSellTooltip();
      this.dragState = null;
    };

    this._onMouseDown = (e) => {
      if (this.gameOver || this._destroyed || e.button !== 0) return;
      if (this.ui.selectedTower) return; // размещаем башню — не drag

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { row, col } = pixelToCell(x, y);

      const tower = this.getTowerAt(row, col);
      if (!tower || tower.level >= 4) return;

      const compatibles = this.towers.filter(t =>
        t !== tower && t.type === tower.type && t.level === tower.level
      );

      this._dragStartPos = { x, y };
      this.dragState = {
        tower,
        startRow: row,
        startCol: col,
        currentX: x,
        currentY: y,
        compatibles,
      };
      this.hideSellTooltip();
    };

    this._onMouseUp = (e) => {
      if (!this.dragState) return;
      const drag = this.dragState;
      const startPos = this._dragStartPos;
      this.dragState = null;
      this._dragStartPos = null;

      const rect = this.canvas.getBoundingClientRect();
      const ux = e.clientX - rect.left;
      const uy = e.clientY - rect.top;

      // Если мышь почти не двигалась — это был клик, не drag
      const moved = Math.hypot(ux - startPos.x, uy - startPos.y);
      if (moved < 8) return;

      const { row, col } = pixelToCell(ux, uy);
      const targetTower = this.getTowerAt(row, col);

      if (
        targetTower &&
        targetTower !== drag.tower &&
        targetTower.type === drag.tower.type &&
        targetTower.level === drag.tower.level &&
        drag.tower.level < 4
      ) {
        this._mergeTowers(drag.tower, targetTower);
      }
    };

    this._onClick = (e) => {
      if (this.gameOver || this._destroyed) return;
      if (this.waveManager.waveActive) return;
      if (!this.ui.selectedTower) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { row, col } = pixelToCell(x, y);
      const def = TOWER_TYPES[this.ui.selectedTower];
      const realCost = Math.floor(def.cost * this.globalMods.towerCostMult);

      if (isValidPlacement(row, col) && !this.getTowerAt(row, col) && this.gold >= realCost) {
        this.gold -= realCost;
        const tower = new Tower(this.ui.selectedTower, row, col);
        this.towers.push(tower);
        grid[row][col] = 4;
        sound.towerPlace();
        this.ui.updateHUD();
        this.ui.updateTowerButtons();
      }
    };

    this._onContext = (e) => {
      e.preventDefault();
      if (this._destroyed) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { row, col } = pixelToCell(x, y);

      const tower = this.getTowerAt(row, col);
      if (tower) {
        this.sellTower(tower);
        this.hideSellTooltip();
        return;
      }

      this.ui.selectedTower = null;
      this.placementPreview = null;
      this.ui.updateTowerButtons();
    };

    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('mouseup', this._onMouseUp);
    this.canvas.addEventListener('click', this._onClick);
    this.canvas.addEventListener('contextmenu', this._onContext);

    document.getElementById('restart-btn').onclick = () => {
      document.getElementById('game-over').classList.add('hidden');
      startGame(this.levelId);
    };

    document.getElementById('menu-btn').onclick = () => showMenu();
    document.getElementById('menu-btn-go').onclick = () => showMenu();
  }

  setupControls() {
    // Громкость
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        sound.setVolume(volumeSlider.value / 100);
      });
    }

    // Скорость
    const speedBtn = document.getElementById('speed-btn');
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        this.gameSpeed = this.gameSpeed === 1 ? 2 : 1;
        speedBtn.textContent = this.gameSpeed + 'x';
        speedBtn.classList.toggle('active', this.gameSpeed === 2);
      });
    }

    // Авто-волны
    const autoBtn = document.getElementById('auto-btn');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.autoWave = !this.autoWave;
        autoBtn.classList.toggle('active', this.autoWave);
      });
    }
  }

  getTowerAt(row, col) {
    return this.towers.find(t => t.row === row && t.col === col) || null;
  }

  _mergeTowers(dragged, target) {
    grid[dragged.row][dragged.col] = 0;
    this.towers = this.towers.filter(t => t !== dragged);
    target.cost += dragged.cost;
    target.applyLevel(target.level + 1);
    this.particles.emitDeath(target.x, target.y, target.color, 20);
    sound.towerMerge();
    this.ui.updateHUD();
    this.ui.updateTowerButtons();
  }

  sellTower(tower) {
    const refund = Math.floor(tower.cost * 0.5);
    this.gold += refund;
    grid[tower.row][tower.col] = 0;
    this.towers = this.towers.filter(t => t !== tower);
    sound.towerSell();
    this.ui.updateHUD();
    this.ui.updateTowerButtons();
  }

  showSellTooltip(event, tower) {
    if (!this.sellTooltip) {
      this.sellTooltip = document.createElement('div');
      this.sellTooltip.className = 'sell-tooltip';
      document.body.appendChild(this.sellTooltip);
    }
    const refund = Math.floor(tower.cost * 0.5);
    const lvl = tower.level > 1 ? ` [Лвл ${tower.level}]` : '';
    this.sellTooltip.textContent = `${tower.name}${lvl} | ПКМ — продать (${refund})`;
    this.sellTooltip.style.left = `${event.clientX + 12}px`;
    this.sellTooltip.style.top = `${event.clientY - 28}px`;
    this.sellTooltip.style.display = 'block';
  }

  hideSellTooltip() {
    if (this.sellTooltip) {
      this.sellTooltip.style.display = 'none';
    }
  }

  async onWaveButtonClick() {
    if (!this.waveManager.canStartWave) return;

    const nextWave = this.waveManager.waveNumber + 1;

    // Каждые 10 волн — глобальный модификатор
    if (nextWave > 1 && nextWave % 10 === 1) {
      const globalMod = await this.ui.showGlobalModifierCards();
      if (this._destroyed) return;

      // Применяем глобальный модификатор (стакается)
      globalMod.apply(this.globalMods);

      // Если есть отъём жизней
      if (this.globalMods.lifeDrain > 0) {
        this.lives = Math.max(1, this.lives - this.globalMods.lifeDrain);
        this.globalMods.lifeDrain = 0;
        this.ui.updateHUD();
      }
    }

    // Проверяем ивентовую волну
    const eventTier = rollEventTier(nextWave);

    // Волновой модификатор (жёсткий для ивентовых волн)
    const modifiers = await this.ui.showModifierCards(eventTier);
    if (this._destroyed) return;

    // Объединяем волновой + глобальный модификаторы
    modifiers.hpMult *= this.globalMods.hpMult;
    modifiers.speedMult *= this.globalMods.speedMult;
    modifiers.countMult *= this.globalMods.countMult;
    modifiers.rewardMult *= this.globalMods.rewardMult;
    modifiers.regenPercent += this.globalMods.regenPercent;
    modifiers.spawnMult *= this.globalMods.spawnMult;
    modifiers.sizeMult *= this.globalMods.sizeMult;

    this.waveManager.startNextWave(modifiers);
    sound.waveStart();
    this.ui.updateTowerButtons();
  }

  createEnemy(type, waveNumber, modifiers, enemyPath) {
    this.enemies.push(new Enemy(type, waveNumber, modifiers, enemyPath));
  }

  createProjectile(data) {
    data.particles = this.particles;
    this.projectiles.push(new Projectile(data));
  }

  update(dt) {
    if (this.gameOver || this._destroyed) return;

    this.time += dt;
    this.particles.update(dt);

    this.waveManager.update(dt, this.createEnemy.bind(this), this.enemies);

    for (const enemy of this.enemies) {
      enemy.update(dt, this.enemies);
      if (enemy.reachedEnd) {
        this.lives--;
        sound.lifeLost();
        if (this.lives <= 0) {
          this.lives = 0;
          this.endGame();
          return;
        }
      }
    }

    // Матка: собираем спавны на ходу
    for (const enemy of this.enemies) {
      if (enemy.alive && enemy.special === 'spawn_walk' && enemy.pendingSpawns.length > 0) {
        for (const sp of enemy.pendingSpawns) {
          const spawn = new Enemy('runner', sp.wave, sp.mods, sp.path);
          spawn.pathIndex = sp.pathIndex;
          spawn.x = sp.x + (Math.random() - 0.5) * 12;
          spawn.y = sp.y + (Math.random() - 0.5) * 12;
          spawn.reward = 0;
          this.enemies.push(spawn);
        }
        enemy.pendingSpawns = [];
      }
    }

    const deathSpawns = [];
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.alive) {
        if (!e.reachedEnd) {
          this.gold += e.reward;
          this.particles.emitDeath(e.x, e.y, e.color, e.radius);
          sound.enemyDeath();
          // Некромант — спавнит бегунов при смерти
          if (e.special === 'death_spawn' && e.deathSpawnCount > 0) {
            for (let s = 0; s < e.deathSpawnCount; s++) {
              deathSpawns.push({ type: 'runner', path: e.path, pathIndex: e.pathIndex, x: e.x, y: e.y, wave: e.waveNumber, mods: e.modifiers, reward: 0 });
            }
          }
          // Делитель / Гидра — сплит при смерти
          if (e.special === 'split' && e.splitCount > 0) {
            const splitType = e.splitType || e.type;
            const noSplit = !e.splitType; // копии себя не делятся дальше
            for (let s = 0; s < e.splitCount; s++) {
              deathSpawns.push({ type: splitType, path: e.path, pathIndex: e.pathIndex, x: e.x, y: e.y, wave: e.waveNumber, mods: e.modifiers, reward: 0, hpRatio: e.splitHpRatio, noSplit });
            }
          }
          // Палач — отключает ближайшие башни при смерти
          if (e.special === 'tower_disable') {
            for (const tower of this.towers) {
              const dx = tower.x - e.x, dy = tower.y - e.y;
              if (Math.sqrt(dx * dx + dy * dy) <= e.disableRadius) {
                tower.disabledTimer = e.disableDuration;
              }
            }
            this.particles.emitDeath(e.x, e.y, '#ff0000', e.disableRadius * 0.3);
            sound.towerDisable();
          }
        }
        this.enemies.splice(i, 1);
      }
    }
    // Спавн порождений (некромант, делитель, гидра)
    for (const sp of deathSpawns) {
      const spawn = new Enemy(sp.type, sp.wave, sp.mods, sp.path);
      spawn.pathIndex = sp.pathIndex;
      spawn.x = sp.x + (Math.random() - 0.5) * 14;
      spawn.y = sp.y + (Math.random() - 0.5) * 14;
      spawn.reward = sp.reward;
      if (sp.hpRatio) {
        spawn.maxHp = Math.round(spawn.maxHp * sp.hpRatio);
        spawn.hp = spawn.maxHp;
        spawn.radius = Math.round(spawn.radius * 0.7);
      }
      // Копии делителя не делятся снова (предотвращаем бесконечность)
      if (sp.noSplit) {
        spawn.special = null;
        spawn.splitCount = 0;
      }
      this.enemies.push(spawn);
    }

    for (const tower of this.towers) {
      tower.update(dt, this.enemies, this.createProjectile.bind(this), this.particles, this.globalMods);
    }

    for (const proj of this.projectiles) {
      proj.update(dt, this.enemies);
    }
    this.projectiles = this.projectiles.filter(p => p.alive);

    this.ui.updateHUD();
    this.ui.updateTowerButtons();

    // Авто-волны: автоматически начинаем следующую волну
    if (this.autoWave && this.waveManager.canStartWave && !this._autoWaveQueued) {
      this._autoWaveQueued = true;
      setTimeout(() => {
        if (this._destroyed || this.gameOver) return;
        this._autoWaveQueued = false;
        if (this.autoWave && this.waveManager.canStartWave) {
          this._autoStartWave();
        }
      }, 500);
    }
  }

  async _autoStartWave() {
    if (!this.waveManager.canStartWave || this._destroyed) return;

    const nextWave = this.waveManager.waveNumber + 1;

    // Глобальные модификаторы — показываем карточки (не пропускаем)
    if (nextWave > 1 && nextWave % 10 === 1) {
      const globalMod = await this.ui.showGlobalModifierCards();
      if (this._destroyed) return;
      globalMod.apply(this.globalMods);
      if (this.globalMods.lifeDrain > 0) {
        this.lives = Math.max(1, this.lives - this.globalMods.lifeDrain);
        this.globalMods.lifeDrain = 0;
        this.ui.updateHUD();
      }
    }

    // Авто-выбор: рандомный модификатор без показа карточек
    const eventTier = rollEventTier(nextWave);
    const modifiers = this.ui.autoPickModifier(eventTier);

    modifiers.hpMult *= this.globalMods.hpMult;
    modifiers.speedMult *= this.globalMods.speedMult;
    modifiers.countMult *= this.globalMods.countMult;
    modifiers.rewardMult *= this.globalMods.rewardMult;
    modifiers.regenPercent += this.globalMods.regenPercent;
    modifiers.spawnMult *= this.globalMods.spawnMult;
    modifiers.sizeMult *= this.globalMods.sizeMult;

    this.waveManager.startNextWave(modifiers);
    sound.waveStart();
    this.ui.updateTowerButtons();
  }

  endGame() {
    this.gameOver = true;
    this.hideSellTooltip();
    sound.gameOver();
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('game-over-wave').textContent =
      `Вы продержались ${this.waveManager.waveNumber} волн`;
  }

  loop(timestamp) {
    if (this._destroyed) return;
    const rawDt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    const dt = rawDt * this.gameSpeed;

    this.update(dt);
    this.renderer.render({
      towers: this.towers,
      enemies: this.enemies,
      projectiles: this.projectiles,
      placementPreview: this.placementPreview,
      particles: this.particles,
      time: this.time,
      dragState: this.dragState,
    });

    this._rafId = requestAnimationFrame(this.loop);
  }
}
