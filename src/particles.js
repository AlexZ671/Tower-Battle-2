export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.ambient = [];
    this.initAmbient();
  }

  initAmbient() {
    // Светящиеся точки на фоне
    for (let i = 0; i < 40; i++) {
      this.ambient.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        r: 0.5 + Math.random() * 1.2,
        alpha: 0.1 + Math.random() * 0.2,
        speed: 0.1 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // Взрыв при смерти врага
  emitDeath(x, y, color, radius) {
    const count = 8 + Math.floor(radius);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.4 + Math.random() * 0.3,
        r: 1.5 + Math.random() * 2.5,
        color,
        type: 'death',
      });
    }
    // Кольцо взрыва
    this.particles.push({
      x, y,
      radius: 2,
      maxRadius: radius * 3,
      life: 0.3,
      maxLife: 0.3,
      color,
      type: 'ring',
    });
  }

  // Удар снаряда
  emitImpact(x, y, color) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 50;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.15 + Math.random() * 0.15,
        maxLife: 0.2,
        r: 1 + Math.random() * 1.5,
        color,
        type: 'spark',
      });
    }
  }

  // Вспышка выстрела
  emitMuzzle(x, y, angle, color) {
    this.particles.push({
      x: x + Math.cos(angle) * 14,
      y: y + Math.sin(angle) * 14,
      life: 0.08,
      maxLife: 0.08,
      r: 6,
      color,
      type: 'flash',
    });
  }

  // Splash-взрыв пушки
  emitSplash(x, y, radius) {
    this.particles.push({
      x, y,
      radius: 2,
      maxRadius: radius,
      life: 0.35,
      maxLife: 0.35,
      color: '#e67e22',
      type: 'ring',
    });
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 60;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.35,
        r: 1.5 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#e67e22' : '#f39c12',
        type: 'spark',
      });
    }
  }

  // Заморозка
  emitFrost(x, y) {
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: x + Math.cos(angle) * 5,
        y: y + Math.sin(angle) * 5,
        vx: Math.cos(angle) * 15,
        vy: Math.sin(angle) * 15 - 10,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.6,
        r: 1.5 + Math.random(),
        color: '#74b9ff',
        type: 'frost',
      });
    }
  }

  // Молния Теслы — искры вдоль цепи
  emitChainSparks(points) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      for (let j = 0; j < 3; j++) {
        const t = Math.random();
        this.particles.push({
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          life: 0.15 + Math.random() * 0.1,
          maxLife: 0.2,
          r: 1 + Math.random(),
          color: '#c084fc',
          type: 'spark',
        });
      }
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      if (p.vx !== undefined) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Затухание
        p.vx *= 0.95;
        p.vy *= 0.95;
      }
      if (p.type === 'ring') {
        const t = 1 - p.life / p.maxLife;
        p.radius = p.maxRadius * t;
      }
      if (p.type === 'frost') {
        p.vy -= 15 * dt; // плавает вверх
      }
    }
  }

  draw(ctx, time) {
    // Ambient
    for (const a of this.ambient) {
      const pulse = Math.sin(time * a.speed * 3 + a.phase) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 160, 255, ${a.alpha * pulse})`;
      ctx.fill();
    }

    // Частицы
    for (const p of this.particles) {
      const t = p.life / p.maxLife;

      if (p.type === 'ring') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2 * t;
        ctx.globalAlpha = t * 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (p.type === 'flash') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = t;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (p.type === 'frost') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = t * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        // spark, death
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * Math.max(t, 0.3), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = t;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
}
