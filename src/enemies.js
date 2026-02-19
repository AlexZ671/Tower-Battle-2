import { sound } from './sound.js';

export const ENEMY_TYPES = {
  // ═══════ Обычные враги ═══════
  runner: {
    name: 'Бегун',
    hp: 30, speed: 2.5, radius: 8,
    color: '#ff6b6b', reward: 10, minWave: 1,
  },
  soldier: {
    name: 'Солдат',
    hp: 60, speed: 1.5, radius: 10,
    color: '#ffa502', reward: 15, minWave: 1,
  },
  tank: {
    name: 'Танк',
    hp: 200, speed: 0.8, radius: 14,
    color: '#7f8c8d', reward: 30, minWave: 5,
  },
  speeder: {
    name: 'Спидер',
    hp: 20, speed: 4, radius: 7,
    color: '#2ed573', reward: 8, minWave: 8,
  },
  splitter: {
    name: 'Делитель',
    hp: 70, speed: 1.8, radius: 11,
    color: '#e17055', reward: 18, minWave: 6,
    special: 'split', splitCount: 3, splitHpRatio: 0.3,
  },
  swarm: {
    name: 'Рой',
    hp: 12, speed: 3.0, radius: 5,
    color: '#fdcb6e', reward: 3, minWave: 7,
  },
  healer: {
    name: 'Целитель',
    hp: 60, speed: 1.3, radius: 10,
    color: '#00b894', reward: 22, minWave: 8,
    special: 'heal_aura', healRadius: 100, healPercent: 0.15, healCooldown: 4,
  },
  berserker: {
    name: 'Берсерк',
    hp: 90, speed: 1.5, radius: 10,
    color: '#d63031', reward: 20, minWave: 9,
    special: 'enrage',
  },
  armored: {
    name: 'Бронированный',
    hp: 120, speed: 1.0, radius: 12,
    color: '#636e72', reward: 25, minWave: 10,
    special: 'armor', armor: 5,
  },
  teleporter: {
    name: 'Телепортер',
    hp: 45, speed: 1.2, radius: 9,
    color: '#6c5ce7', reward: 20, minWave: 11,
    special: 'teleport', teleportCooldown: 5, teleportJump: 3,
  },

  // ═══════ Спец-враги ═══════
  shaman: {
    name: 'Шаман',
    hp: 80, speed: 1.2, radius: 10,
    color: '#a855f7', reward: 25, minWave: 7,
    special: 'shield_aura', auraRadius: 120, auraDuration: 2, auraCooldown: 6,
  },
  necro: {
    name: 'Некромант',
    hp: 100, speed: 1.0, radius: 11,
    color: '#6c5ce7', reward: 30, minWave: 12,
    special: 'death_spawn', deathSpawnCount: 2,
  },
  phantom: {
    name: 'Фантом',
    hp: 50, speed: 2.0, radius: 9,
    color: '#74b9ff', reward: 20, minWave: 10,
    special: 'phase', phaseOn: 2, phaseOff: 3,
  },

  // ═══════ Мини-боссы ═══════
  miniboss: {
    name: 'Страж',
    hp: 350, speed: 0.9, radius: 16,
    color: '#fd79a8', reward: 60, minWave: 5,
    isMini: true,
  },
  knight: {
    name: 'Рыцарь',
    hp: 250, speed: 0.8, radius: 15,
    color: '#b2bec3', reward: 50, minWave: 8,
    special: 'armor', armor: 8, isMini: true,
  },
  champion: {
    name: 'Чемпион',
    hp: 300, speed: 1.0, radius: 16,
    color: '#e84393', reward: 55, minWave: 12,
    special: 'enrage', isMini: true,
  },
  oracle: {
    name: 'Оракул',
    hp: 200, speed: 1.1, radius: 14,
    color: '#f39c12', reward: 50, minWave: 15,
    special: 'mass_shield', massShieldDuration: 3, isMini: true,
  },
  executioner: {
    name: 'Палач',
    hp: 280, speed: 0.9, radius: 15,
    color: '#2d3436', reward: 55, minWave: 18,
    special: 'tower_disable', disableRadius: 150, disableDuration: 3, isMini: true,
  },
  voidguard: {
    name: 'Страж Бездны',
    hp: 250, speed: 0.7, radius: 16,
    color: '#0c2461', reward: 60, minWave: 20,
    special: 'teleport', teleportCooldown: 4, teleportJump: 4, isMini: true,
  },

  // ═══════ Боссы ═══════
  boss: {
    name: 'Босс',
    hp: 500, speed: 0.6, radius: 18,
    color: '#e94560', reward: 100, minWave: 10,
    isBoss: true,
  },
  golem: {
    name: 'Голем',
    hp: 1000, speed: 0.4, radius: 22,
    color: '#8B4513', reward: 200, minWave: 20,
    special: 'armor', armor: 15, slowImmune: true, isBoss: true,
  },
  hydra: {
    name: 'Гидра',
    hp: 1200, speed: 0.5, radius: 20,
    color: '#27ae60', reward: 250, minWave: 30,
    special: 'split', splitCount: 2, splitHpRatio: 0.5,
    splitType: 'hydra_mini', isBoss: true,
  },
  hydra_mini: {
    name: 'Мини-гидра',
    hp: 400, speed: 0.7, radius: 14,
    color: '#2ecc71', reward: 50, minWave: 30,
    special: 'split', splitCount: 2, splitHpRatio: 0.4,
    splitType: 'hydra_micro', isBoss: false,
  },
  hydra_micro: {
    name: 'Микро-гидра',
    hp: 120, speed: 1.0, radius: 10,
    color: '#55efc4', reward: 20, minWave: 30,
  },
  titan: {
    name: 'Титан',
    hp: 1200, speed: 0.45, radius: 24,
    color: '#2980b9', reward: 350, minWave: 40,
    special: 'shield_self', shieldMaxHp: 500, shieldRegen: 0.02, isBoss: true,
  },
  leviathan: {
    name: 'Левиафан',
    hp: 3000, speed: 0.35, radius: 26,
    color: '#8e44ad', reward: 500, minWave: 50,
    special: 'tower_slow', slowAuraRadius: 200, towerSlowFactor: 0.5, isBoss: true,
  },
  reaper: {
    name: 'Жнец',
    hp: 800, speed: 0.8, radius: 18,
    color: '#2c3e50', reward: 200, minWave: 30,
    special: 'teleport', teleportCooldown: 5, teleportJump: 5,
    slowImmune: true, isBoss: true,
  },
  queen: {
    name: 'Матка',
    hp: 1800, speed: 0.3, radius: 22,
    color: '#c0392b', reward: 400, minWave: 40,
    special: 'spawn_walk', spawnInterval: 4, isBoss: true,
  },
};

// Список мини-боссов для волновой генерации
export const MINIBOSS_TYPES = ['miniboss', 'knight', 'champion', 'oracle', 'executioner', 'voidguard'];

const TRAIL_LENGTH = 6;
const TRAIL_INTERVAL = 0.04;

export class Enemy {
  constructor(type, waveNumber, modifiers = null, enemyPath) {
    const def = ENEMY_TYPES[type];
    this.type = type;
    this.name = def.name;
    this.radius = def.radius * (modifiers ? modifiers.sizeMult : 1);
    this.color = def.color;
    this.reward = Math.round(def.reward * (modifiers ? modifiers.rewardMult : 1));

    const hpMult = 1 + (waveNumber - 1) * 0.15;
    const speedMult = Math.min(1 + (waveNumber - 1) * 0.02, 2.0);

    this.maxHp = Math.round(def.hp * hpMult * (modifiers ? modifiers.hpMult : 1));
    this.hp = this.maxHp;
    this.baseSpeed = def.speed * speedMult * (modifiers ? modifiers.speedMult : 1);
    this.speed = this.baseSpeed;
    this.regenPercent = modifiers ? modifiers.regenPercent : 0;

    // Путь
    this.path = enemyPath;
    this.pathIndex = 0;
    this.x = enemyPath[0].x;
    this.y = enemyPath[0].y;

    this.alive = true;
    this.reachedEnd = false;
    this.slowTimer = 0;
    this.slowFactor = 1;

    this.trail = [];
    this.trailTimer = 0;
    this.damageFlash = 0;

    // Щит неуязвимости (от шамана или оракула)
    this.shielded = false;
    this.shieldTimer = 0;

    // Спец-способности
    this.special = def.special || null;
    this.slowImmune = def.slowImmune || false;
    this.isBoss = def.isBoss || false;
    this.isMini = def.isMini || false;

    // Шаман: аура щита
    if (this.special === 'shield_aura') {
      this.auraRadius = def.auraRadius;
      this.auraDuration = def.auraDuration;
      this.auraCooldown = def.auraCooldown;
      this.auraCooldownTimer = 2;
    }

    // Фантом: фазировка
    if (this.special === 'phase') {
      this.phaseOn = def.phaseOn;
      this.phaseOff = def.phaseOff;
      this.phaseTimer = def.phaseOff;
      this.phased = false;
    }

    // Некромант: смерть-спавн
    if (this.special === 'death_spawn') {
      this.deathSpawnCount = def.deathSpawnCount;
    }

    // Делитель / Гидра: сплит при смерти
    if (this.special === 'split') {
      this.splitCount = def.splitCount;
      this.splitHpRatio = def.splitHpRatio;
      this.splitType = def.splitType || null; // null = копии себя
    }

    // Целитель: аура лечения
    if (this.special === 'heal_aura') {
      this.healRadius = def.healRadius;
      this.healPercent = def.healPercent;
      this.healCooldown = def.healCooldown;
      this.healCooldownTimer = 2;
    }

    // Берсерк / Чемпион: ярость
    // (скорость пересчитывается в update)

    // Бронированный / Рыцарь / Голем: броня
    if (this.special === 'armor') {
      this.armor = def.armor;
    }

    // Телепортер / Страж Бездны / Жнец
    if (this.special === 'teleport') {
      this.teleportCooldown = def.teleportCooldown;
      this.teleportJump = def.teleportJump;
      this.teleportTimer = def.teleportCooldown;
      this.teleportFlash = 0;
    }

    // Оракул: массовый щит (одноразовый при спавне)
    if (this.special === 'mass_shield') {
      this.massShieldDuration = def.massShieldDuration;
      this.massShieldUsed = false;
    }

    // Палач: отключение башен при смерти
    if (this.special === 'tower_disable') {
      this.disableRadius = def.disableRadius;
      this.disableDuration = def.disableDuration;
    }

    // Титан: свой щит с HP
    if (this.special === 'shield_self') {
      this.shieldMaxHp = Math.round(def.shieldMaxHp * hpMult * (modifiers ? modifiers.hpMult : 1));
      this.shieldHp = this.shieldMaxHp;
      this.shieldRegen = def.shieldRegen;
    }

    // Левиафан: замедление башен
    if (this.special === 'tower_slow') {
      this.slowAuraRadius = def.slowAuraRadius;
      this.towerSlowFactor = def.towerSlowFactor;
    }

    // Матка: спавн на ходу
    if (this.special === 'spawn_walk') {
      this.spawnInterval = def.spawnInterval;
      this.spawnTimer = def.spawnInterval;
      this.pendingSpawns = [];
    }

    this.waveNumber = waveNumber;
    this.modifiers = modifiers;
  }

  update(dt, allEnemies) {
    if (!this.alive) return;

    if (this.damageFlash > 0) {
      this.damageFlash -= dt;
    }

    // Щит таймер
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.shielded = false;
      }
    }

    // Телепорт flash
    if (this.teleportFlash > 0) {
      this.teleportFlash -= dt;
    }

    // ── Шаман: аура щита ──
    if (this.special === 'shield_aura' && allEnemies) {
      this.auraCooldownTimer -= dt;
      if (this.auraCooldownTimer <= 0) {
        this.auraCooldownTimer = this.auraCooldown;
        for (const e of allEnemies) {
          if (!e.alive || e === this) continue;
          const dx = e.x - this.x, dy = e.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) <= this.auraRadius) {
            e.shielded = true;
            e.shieldTimer = this.auraDuration;
          }
        }
        this.shielded = true;
        this.shieldTimer = this.auraDuration;
        sound.shieldActivate();
      }
    }

    // ── Целитель: аура лечения ──
    if (this.special === 'heal_aura' && allEnemies) {
      this.healCooldownTimer -= dt;
      if (this.healCooldownTimer <= 0) {
        this.healCooldownTimer = this.healCooldown;
        let healed = false;
        for (const e of allEnemies) {
          if (!e.alive || e === this) continue;
          const dx = e.x - this.x, dy = e.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) <= this.healRadius) {
            e.hp = Math.min(e.maxHp, e.hp + e.maxHp * this.healPercent);
            healed = true;
          }
        }
        if (healed) sound.healPulse();
      }
    }

    // ── Фантом: фазировка ──
    if (this.special === 'phase') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phased = !this.phased;
        this.phaseTimer = this.phased ? this.phaseOn : this.phaseOff;
        sound.phaseToggle(this.phased);
      }
    }

    // ── Берсерк / Чемпион: ярость ──
    if (this.special === 'enrage') {
      const hpRatio = this.hp / this.maxHp;
      if (hpRatio <= 0.25) {
        this.speed = this.baseSpeed * 2.0;
        if (!this._enrageSounded2) { this._enrageSounded2 = true; sound.enrage(); }
      } else if (hpRatio <= 0.5) {
        this.speed = this.baseSpeed * 1.5;
        if (!this._enrageSounded1) { this._enrageSounded1 = true; sound.enrage(); }
      } else {
        this.speed = this.baseSpeed;
      }
    }

    // ── Телепорт ──
    if (this.special === 'teleport') {
      this.teleportTimer -= dt;
      if (this.teleportTimer <= 0) {
        this.teleportTimer = this.teleportCooldown;
        const newIndex = Math.min(this.pathIndex + this.teleportJump, this.path.length - 1);
        if (newIndex > this.pathIndex) {
          this.pathIndex = newIndex;
          this.x = this.path[this.pathIndex].x;
          this.y = this.path[this.pathIndex].y;
          this.teleportFlash = 0.3;
          sound.teleport();
        }
      }
    }

    // ── Оракул: массовый щит (одноразовый) ──
    if (this.special === 'mass_shield' && !this.massShieldUsed && allEnemies) {
      this.massShieldUsed = true;
      for (const e of allEnemies) {
        if (!e.alive) continue;
        e.shielded = true;
        e.shieldTimer = this.massShieldDuration;
      }
      sound.massShield();
    }

    // ── Титан: регенерация щита ──
    if (this.special === 'shield_self' && this.shieldHp < this.shieldMaxHp) {
      this.shieldHp = Math.min(this.shieldMaxHp, this.shieldHp + this.shieldMaxHp * this.shieldRegen * dt);
    }

    // ── Матка: спавн на ходу ──
    if (this.special === 'spawn_walk') {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        this.pendingSpawns.push({
          path: this.path, pathIndex: this.pathIndex,
          x: this.x, y: this.y, wave: this.waveNumber, mods: this.modifiers,
        });
        sound.queenSpawn();
      }
    }

    // Трейл
    this.trailTimer -= dt;
    if (this.trailTimer <= 0) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > TRAIL_LENGTH) {
        this.trail.shift();
      }
      this.trailTimer = TRAIL_INTERVAL;
    }

    // Замедление
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowFactor = 1;
      }
    }

    // Реген
    if (this.regenPercent > 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * this.regenPercent * dt);
    }

    // Движение
    const target = this.path[this.pathIndex + 1];
    if (!target) {
      this.reachedEnd = true;
      this.alive = false;
      return;
    }

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveSpeed = this.speed * this.slowFactor * 60 * dt;

    if (dist <= moveSpeed) {
      this.x = target.x;
      this.y = target.y;
      this.pathIndex++;
    } else {
      this.x += (dx / dist) * moveSpeed;
      this.y += (dy / dist) * moveSpeed;
    }
  }

  takeDamage(amount) {
    if (this.shielded) return;
    if (this.phased) return;

    // Титан: щит поглощает урон первым
    if (this.special === 'shield_self' && this.shieldHp > 0) {
      if (amount <= this.shieldHp) {
        this.shieldHp -= amount;
        this.damageFlash = 0.1;
        return;
      } else {
        amount -= this.shieldHp;
        this.shieldHp = 0;
      }
    }

    // Броня снижает урон
    if (this.armor > 0) {
      amount = Math.max(1, amount - this.armor);
    }

    this.hp -= amount;
    this.damageFlash = 0.1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  get targetable() {
    return this.alive && !this.phased;
  }

  applySlow(factor, duration) {
    if (this.slowImmune) return;
    this.slowFactor = factor;
    this.slowTimer = duration;
  }

  get progress() {
    return this.pathIndex / (this.path.length - 1);
  }
}
