import { CELL_SIZE } from './map.js';
import { sound } from './sound.js';

export const TOWER_TYPES = {
  gun: {
    name: 'Пулемёт',
    cost: 100,
    damage: 8,
    range: 3,
    fireRate: 0.15,
    color: '#2ecc71',
    shape: 'circle',
    projectileSpeed: 8,
    projectileColor: '#2ecc71',
    description: 'Быстрая стрельба, одна цель',
    special: null,
  },
  cannon: {
    name: 'Пушка',
    cost: 200,
    damage: 30,
    range: 3.5,
    fireRate: 1.2,
    color: '#e67e22',
    shape: 'square',
    projectileSpeed: 5,
    projectileColor: '#e67e22',
    description: 'Урон по площади',
    special: 'splash',
    splashRadius: 60,
  },
  sniper: {
    name: 'Снайпер',
    cost: 300,
    damage: 60,
    range: 6,
    fireRate: 2.0,
    color: '#3498db',
    shape: 'triangle',
    projectileSpeed: 14,
    projectileColor: '#3498db',
    description: 'Дальний, мощный',
    special: null,
  },
  tesla: {
    name: 'Тесла',
    cost: 400,
    damage: 20,
    range: 3.5,
    fireRate: 1.0,
    color: '#a855f7',
    shape: 'hexagon',
    projectileSpeed: 0,
    projectileColor: '#a855f7',
    description: 'Молния по цепи (3 цели)',
    special: 'chain',
    chainCount: 3,
    chainRange: 80,
  },
};

export const TOWER_ORDER = ['gun', 'cannon', 'sniper', 'tesla'];

export const LEVEL_MULTS = {
  1: { dmg: 1.0,  fireRate: 1.0,   range: 1.0  },
  2: { dmg: 1.1,  fireRate: 0.95,  range: 1.05 },
  3: { dmg: 1.25, fireRate: 0.9,   range: 1.1  },
  4: { dmg: 1.5,  fireRate: 0.85,  range: 1.15 },
};

// Хелпер — проверка попадания точки в луч (для снайпера лвл4)
function _onLine(ox, oy, angle, px, py, threshold) {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const tx = px - ox, ty = py - oy;
  const proj = tx * dx + ty * dy;
  if (proj < 0) return false;
  const perp = Math.abs(tx * dy - ty * dx);
  return perp <= threshold;
}

export class Tower {
  constructor(type, row, col) {
    const def = TOWER_TYPES[type];
    this.type = type;
    this.name = def.name;
    this.color = def.color;
    this.shape = def.shape;
    this.projectileSpeed = def.projectileSpeed;
    this.projectileColor = def.projectileColor;
    this.special = def.special;
    this.cost = def.cost;

    // Базовые статы (не масштабируются)
    this.baseDamage = def.damage;
    this.baseFireRate = def.fireRate;
    this.baseRange = def.range * CELL_SIZE;

    // Активные статы (масштабируются по уровню)
    this.damage = this.baseDamage;
    this.fireRate = this.baseFireRate;
    this.range = this.baseRange;

    this.splashRadius = def.splashRadius || 0;
    this.slowFactor = def.slowFactor || 1;
    this.slowDuration = def.slowDuration || 0;
    this.chainCount = def.chainCount || 0;
    this.chainRange = def.chainRange || 0;

    this.row = row;
    this.col = col;
    this.x = col * CELL_SIZE + CELL_SIZE / 2;
    this.y = row * CELL_SIZE + CELL_SIZE / 2;

    this.cooldown = 0;
    this.target = null;
    this.angle = 0;
    this.level = 1;
    this.disabledTimer = 0;
  }

  applyLevel(level) {
    this.level = level;
    const m = LEVEL_MULTS[level];
    this.damage = this.baseDamage * m.dmg;
    this.range = this.baseRange * m.range;
    this.fireRate = this.baseFireRate * m.fireRate;
    // Тесла лвл4: 6 целей в цепи
    if (level === 4 && this.type === 'tesla') {
      this.chainCount = 6;
    }
  }

  update(dt, enemies, createProjectile, particles, globalMods = null) {
    if (this.disabledTimer > 0) {
      this.disabledTimer -= dt;
      return;
    }

    this.cooldown -= dt;

    this.target = null;
    let bestProgress = -1;

    const rangeMult = globalMods ? globalMods.towerRangeMult : 1;
    const effectiveRange = this.range * rangeMult;

    // Замедление от Левиафана
    let towerSlowed = 1;
    for (const enemy of enemies) {
      if (!enemy.alive || enemy.special !== 'tower_slow') continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      if (Math.sqrt(dx * dx + dy * dy) <= enemy.slowAuraRadius) {
        towerSlowed = Math.min(towerSlowed, enemy.towerSlowFactor);
      }
    }

    for (const enemy of enemies) {
      if (!enemy.targetable) continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= effectiveRange && enemy.progress > bestProgress) {
        bestProgress = enemy.progress;
        this.target = enemy;
      }
    }

    if (this.target) {
      this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

      const fireRateMult = (globalMods ? globalMods.towerFireRateMult : 1) / towerSlowed;
      if (this.cooldown <= 0) {
        this.cooldown = this.fireRate * fireRateMult;
        this.shoot(this.target, enemies, createProjectile, particles, globalMods);
      }
    }
  }

  shoot(target, enemies, createProjectile, particles, globalMods = null) {
    const dmgMult = globalMods ? globalMods.towerDamageMult : 1;
    const effectiveDmg = this.damage * dmgMult;

    if (this.special === 'chain') {
      const hit = [target];
      target.takeDamage(effectiveDmg);
      // Тесла лвл4: замедление первой цели
      if (this.level === 4) target.applySlow(0.7, 1.5);

      let current = target;
      for (let i = 1; i < this.chainCount; i++) {
        let nearest = null;
        let nearestDist = this.chainRange;
        for (const e of enemies) {
          if (!e.alive || hit.includes(e)) continue;
          const dx = e.x - current.x;
          const dy = e.y - current.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          hit.push(nearest);
          nearest.takeDamage(effectiveDmg);
          // Тесла лвл4: замедление каждой цели в цепи
          if (this.level === 4) nearest.applySlow(0.7, 1.5);
          current = nearest;
        } else break;
      }

      createProjectile({
        type: 'chain',
        points: hit.map(e => ({ x: e.x, y: e.y })),
        startX: this.x,
        startY: this.y,
        color: this.projectileColor,
        timer: 0.3,
        particles,
      });
      if (particles) particles.emitMuzzle(this.x, this.y, this.angle, this.projectileColor);
      sound.teslaShoot();

    } else if (this.type === 'sniper' && this.level === 4) {
      // ═══ Снайпер лвл4: пробивающий луч ═══
      for (const e of enemies) {
        if (!e.alive || !e.targetable) continue;
        if (_onLine(this.x, this.y, this.angle, e.x, e.y, e.radius + 8)) {
          e.takeDamage(effectiveDmg);
          if (particles) particles.emitImpact(e.x, e.y, this.projectileColor);
        }
      }
      createProjectile({
        type: 'beam',
        x: this.x, y: this.y,
        angle: this.angle,
        length: this.range,
        color: this.projectileColor,
        timer: 0.15,
        particles,
      });
      if (particles) particles.emitMuzzle(this.x, this.y, this.angle, this.projectileColor);
      sound.beamFire();

    } else {
      // ═══ Обычный снаряд ═══
      createProjectile({
        type: 'bullet',
        x: this.x,
        y: this.y,
        targetId: target,
        speed: this.projectileSpeed * 60,
        damage: effectiveDmg,
        color: this.projectileColor,
        tower: this,
        particles,
      });
      if (particles) particles.emitMuzzle(this.x, this.y, this.angle, this.projectileColor);
      if (this.type === 'gun') sound.gunShoot();
      else if (this.type === 'cannon') sound.cannonShoot();
      else if (this.type === 'sniper') sound.sniperShoot();

      // ═══ Пулемёт лвл4: 2 доп. пули с разбросом ═══
      if (this.type === 'gun' && this.level === 4) {
        for (let bi = 0; bi < 2; bi++) {
          createProjectile({
            type: 'bullet',
            x: this.x,
            y: this.y,
            targetId: target,
            speed: this.projectileSpeed * 60,
            damage: Math.round(effectiveDmg * 0.35),
            color: this.projectileColor,
            tower: this,
            particles,
          });
        }
      }

      // ═══ Пушка лвл4: горящая зона ═══
      if (this.type === 'cannon' && this.level === 4) {
        createProjectile({
          type: 'burnzone',
          x: target.x,
          y: target.y,
          duration: 2.0,
          tickDamage: Math.round(this.damage * 0.15 * dmgMult),
          radius: this.splashRadius * 0.7,
          color: '#ff4500',
          particles,
        });
      }
    }
  }
}
