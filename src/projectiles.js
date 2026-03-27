import { sound } from './sound.js';

export class Projectile {
  constructor(data) {
    this.type = data.type; // 'bullet', 'chain', 'burnzone', 'beam'

    if (this.type === 'bullet') {
      this.x = data.x;
      this.y = data.y;
      this.prevX = data.x;
      this.prevY = data.y;
      this.target = data.targetId;
      this.speed = data.speed;
      this.damage = data.damage;
      this.color = data.color;
      this.tower = data.tower;
      this.alive = true;
      this.radius = 4;
      this.particles = data.particles || null;
    } else if (this.type === 'chain') {
      this.points = [{ x: data.startX, y: data.startY }, ...data.points];
      this.color = data.color;
      this.timer = data.timer;
      this.alive = true;
      this.particles = data.particles || null;
      if (this.particles) {
        this.particles.emitChainSparks(this.points);
      }
    } else if (this.type === 'burnzone') {
      this.x = data.x;
      this.y = data.y;
      this.timer = data.duration;
      this.maxTimer = data.duration;
      this.tickTimer = 0;
      this.tickInterval = 0.25;
      this.tickDamage = data.tickDamage;
      this.radius = data.radius;
      this.color = data.color || '#ff4500';
      this.alive = true;
      this.particles = data.particles || null;
    } else if (this.type === 'beam') {
      this.x = data.x;
      this.y = data.y;
      this.angle = data.angle;
      this.length = data.length;
      this.color = data.color;
      this.timer = data.timer;
      this.maxTimer = data.timer;
      this.alive = true;
    } else if (this.type === 'artillery_shell') {
      this.startX = data.x;
      this.startY = data.y;
      this.x = data.x;
      this.y = data.y;
      this.targetX = data.targetX;
      this.targetY = data.targetY;
      this.target = data.targetId;
      this.damage = data.damage;
      this.color = data.color;
      this.tower = data.tower;
      this.alive = true;
      this.radius = 5;
      this.particles = data.particles || null;
      // Время полёта зависит от дистанции
      const fdx = data.targetX - data.x, fdy = data.targetY - data.y;
      this.flightDuration = Math.max(0.35, Math.sqrt(fdx * fdx + fdy * fdy) / 300);
      this.flightTime = 0;
      this.arcHeight = Math.max(30, Math.sqrt(fdx * fdx + fdy * fdy) * 0.4);
    }
  }

  update(dt, enemies) {
    if (!this.alive) return;

    if (this.type === 'chain') {
      this.timer -= dt;
      if (this.timer <= 0) this.alive = false;
      return;
    }

    if (this.type === 'beam') {
      this.timer -= dt;
      if (this.timer <= 0) this.alive = false;
      return;
    }

    if (this.type === 'burnzone') {
      this.timer -= dt;
      if (this.timer <= 0) { this.alive = false; return; }
      this.tickTimer -= dt;
      if (this.tickTimer <= 0) {
        this.tickTimer += this.tickInterval;
        for (const e of enemies) {
          if (!e.alive) continue;
          const dx = e.x - this.x, dy = e.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) <= this.radius + e.radius) {
            e.takeDamage(this.tickDamage);
          }
        }
      }
      return;
    }

    // Artillery shell (баллистика)
    if (this.type === 'artillery_shell') {
      this.flightTime += dt;
      const t = Math.min(this.flightTime / this.flightDuration, 1);
      // Обновляем цель если жива (корректировка наведения)
      if (this.target && this.target.alive) {
        this.targetX = this.target.x;
        this.targetY = this.target.y;
      }
      // Линейная интерполяция по X/Y + параболическая дуга по высоте
      this.x = this.startX + (this.targetX - this.startX) * t;
      this.y = this.startY + (this.targetY - this.startY) * t;
      // Высота параболы: 0 на краях, max в середине
      this.heightOffset = -this.arcHeight * 4 * t * (1 - t);
      // Визуальный масштаб (больше в воздухе)
      this.visualScale = 1 + 0.5 * Math.sin(t * Math.PI);

      if (t >= 1) {
        this.alive = false;
        this.hit(this.target && this.target.alive ? this.target : { x: this.targetX, y: this.targetY, alive: false }, enemies);
      }
      return;
    }

    // Bullet
    const target = this.target;
    if (!target || !target.alive) {
      this.alive = false;
      return;
    }

    this.prevX = this.x;
    this.prevY = this.y;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const move = this.speed * dt;

    if (dist <= move + target.radius) {
      this.alive = false;
      this.hit(target, enemies);
    } else {
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
    }
  }

  hit(target, enemies) {
    const tower = this.tower;
    const ps = this.particles;

    if (tower.special === 'splash') {
      for (const e of enemies) {
        if (!e.alive) continue;
        const dx = e.x - target.x;
        const dy = e.y - target.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= tower.splashRadius) {
          const falloff = 1 - (d / tower.splashRadius) * 0.5;
          e.takeDamage(Math.round(this.damage * falloff));
        }
      }
      if (ps) ps.emitSplash(target.x, target.y, tower.splashRadius);
      sound.splashHit();
    } else {
      target.takeDamage(this.damage);
      if (ps) ps.emitImpact(target.x, target.y, this.color);
    }

    if (tower.special === 'slow') {
      target.applySlow(tower.slowFactor, tower.slowDuration);
      if (ps) ps.emitFrost(target.x, target.y);
    }
  }
}
