import { CELL_SIZE, COLS, ROWS, grid, paths } from './map.js';

// ─── Standalone drawShape (для UI-иконок) ───
export function drawShape(ctx, shape, x, y, radius, color, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  _shapeBody(ctx, shape, radius);
  ctx.restore();
}

function _shapeBody(ctx, shape, r) {
  switch (shape) {
    case 'circle':
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); break;
    case 'square': {
      const s = r * 0.85;
      ctx.beginPath(); ctx.rect(-s, -s, s * 2, s * 2); ctx.fill(); ctx.stroke(); break;
    }
    case 'triangle': _poly(ctx, 3, r, -Math.PI / 2); break;
    case 'diamond':
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.65, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.65, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke(); break;
    case 'hexagon': _poly(ctx, 6, r, 0); break;
    case 'pentagon': _poly(ctx, 5, r, -Math.PI / 2); break;
  }
}

function _poly(ctx, n, r, off) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n + off;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

// ─── Экспортируемые функции отрисовки башен ───

export function drawGunTower(ctx, color, angle, time, level = 1) {
  const darker = _darken(color, 0.4);
  const darkest = _darken(color, 0.6);

  // Квадратная бронированная платформа со скошенными углами
  ctx.fillStyle = darker;
  ctx.beginPath();
  ctx.moveTo(-10, -14); ctx.lineTo(10, -14);
  ctx.lineTo(14, -10); ctx.lineTo(14, 10);
  ctx.lineTo(10, 14); ctx.lineTo(-10, 14);
  ctx.lineTo(-14, 10); ctx.lineTo(-14, -10);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();

  // Бронепластины (внутренние линии)
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(10, -6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(10, 6); ctx.stroke();

  // Круглая поворотная турель сверху
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();

  // Заклёпки по кругу турели
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Вращающаяся часть
  ctx.save(); ctx.rotate(angle);

  // Корпус орудия (трапеция)
  ctx.fillStyle = darkest;
  ctx.beginPath();
  ctx.moveTo(-1, -6); ctx.lineTo(10, -4);
  ctx.lineTo(10, 4); ctx.lineTo(-1, 6);
  ctx.closePath(); ctx.fill();

  // Ствол — основной с кожухом охлаждения
  ctx.fillStyle = '#a0a0a0';
  ctx.beginPath(); ctx.roundRect(8, -3, 16, 6, 1.5); ctx.fill();

  // Рёбра охлаждения на стволе
  ctx.strokeStyle = '#707070'; ctx.lineWidth = 0.8;
  for (let x = 11; x <= 21; x += 2.5) {
    ctx.beginPath(); ctx.moveTo(x, -2.5); ctx.lineTo(x, 2.5); ctx.stroke();
  }

  // Дульный срез
  ctx.fillStyle = '#555';
  ctx.beginPath(); ctx.roundRect(23, -3.5, 3, 7, 1); ctx.fill();
  // Отверстие
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(25, 0, 2, 0, Math.PI * 2); ctx.fill();

  // Щиток (бронеплита сбоку ствола)
  ctx.fillStyle = darker;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(4, -7); ctx.lineTo(12, -5.5);
  ctx.lineTo(12, -4); ctx.lineTo(4, -5);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, 7); ctx.lineTo(12, 5.5);
  ctx.lineTo(12, 4); ctx.lineTo(4, 5);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  // Дульная вспышка
  const flash = Math.sin(time * 14) * 0.5 + 0.5;
  if (flash > 0.6) {
    const alpha = (flash - 0.6) * 2;
    ctx.fillStyle = `rgba(255,180,40,${alpha})`;
    ctx.beginPath(); ctx.arc(27, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,150,${alpha * 0.6})`;
    ctx.beginPath(); ctx.arc(27, 0, 1.5, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();

  // Центральный индикатор
  ctx.fillStyle = '#4ade80';
  ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.3;
  ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawCannonTower(ctx, color, angle, time, level = 1) {
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const x = Math.cos(a) * 12, y = Math.sin(a) * 12;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle = _darken(color, 0.4); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
    ctx.lineTo(Math.cos(a) * 5, Math.sin(a) * 5);
    ctx.stroke();
  }
  ctx.save(); ctx.rotate(angle);
  ctx.fillStyle = '#b0b0b0';
  ctx.fillRect(6, -4.5, 15, 9);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.5;
  ctx.strokeRect(6, -4.5, 15, 9);
  ctx.fillStyle = '#909090';
  ctx.fillRect(10, -5, 2, 10);
  ctx.fillRect(16, -5, 2, 10);
  ctx.fillStyle = '#666';
  ctx.beginPath(); ctx.arc(21, 0, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(21, 0, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawSniperTower(ctx, color, angle, time, level = 1) {
  const darker = _darken(color, 0.4);
  const darkest = _darken(color, 0.6);

  // Основание — треугольная платформа с вырезами
  ctx.fillStyle = darker;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
    else ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke();

  // Опорные ноги (тренога)
  ctx.strokeStyle = darkest; ctx.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
    ctx.stroke();
  }

  // Центральный корпус (приподнятый)
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8; ctx.stroke();

  // Вращающаяся часть — длинный ствол
  ctx.save(); ctx.rotate(angle);

  // Крепление ствола
  ctx.fillStyle = darkest;
  ctx.beginPath(); ctx.roundRect(-1, -4, 8, 8, 2); ctx.fill();

  // Ствол — длинный и тонкий
  ctx.fillStyle = '#a0a0a0';
  ctx.beginPath(); ctx.roundRect(6, -1.5, 22, 3, 1); ctx.fill();

  // Затворная рама (утолщение)
  ctx.fillStyle = '#888';
  ctx.beginPath(); ctx.roundRect(8, -3, 6, 6, 1.5); ctx.fill();

  // Продольные канавки на стволе
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(15, -0.5); ctx.lineTo(26, -0.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(15, 0.5); ctx.lineTo(26, 0.5); ctx.stroke();

  // Дульный тормоз
  ctx.fillStyle = '#666';
  ctx.beginPath(); ctx.roundRect(26, -3, 4, 6, 1); ctx.fill();
  // Щели на дульном тормозе
  ctx.strokeStyle = '#444'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(27, -2.5); ctx.lineTo(27, 2.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(29, -2.5); ctx.lineTo(29, 2.5); ctx.stroke();

  // Оптический прицел
  ctx.fillStyle = '#555';
  ctx.beginPath(); ctx.roundRect(10, -6.5, 8, 3, 1.5); ctx.fill();
  // Линзы прицела
  ctx.fillStyle = '#5dade2';
  ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.3;
  ctx.beginPath(); ctx.arc(11, -5, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(17, -5, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Стойка прицела
  ctx.fillStyle = '#666';
  ctx.fillRect(13, -3.5, 1.5, 2);

  ctx.restore();

  // Перекрестие в центре (прицел)
  ctx.strokeStyle = '#5dade2';
  ctx.globalAlpha = 0.4 + Math.sin(time * 2) * 0.2;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-1.5, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1.5, 0); ctx.lineTo(4, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -1.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 1.5); ctx.lineTo(0, 4); ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawTeslaTower(ctx, color, angle, time, level = 1) {
  const r = 13;
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = _darken(color, 0.3); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = _darken(color, 0.2); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.stroke();
  const cr = 3.5 + Math.sin(time * 6) * 1.5;
  ctx.beginPath(); ctx.arc(0, 0, cr, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.7 + Math.sin(time * 8) * 0.2; ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color; ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.35 + Math.sin(time * 10) * 0.2;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const ex = Math.cos(a) * r, ey = Math.sin(a) * r;
    const j1 = Math.sin(time * 15 + i * 2) * 4;
    const j2 = Math.cos(time * 12 + i * 3) * 3;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(ex * 0.3 + j1, ey * 0.3 + j2, ex * 0.6 - j2, ey * 0.6 + j1, ex, ey);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function _darken(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * (1 - amount))},${Math.round(g * (1 - amount))},${Math.round(b * (1 - amount))})`;
}

// ─── Декор карты (пересоздаётся при загрузке) ───
let mapDecor = [];

export function rebuildDecor() {
  mapDecor = [];
  const rng = (s) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const rand = rng(42);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== 0) continue;
      if (rand() < 0.25) {
        mapDecor.push({
          x: c * CELL_SIZE + rand() * CELL_SIZE,
          y: r * CELL_SIZE + rand() * CELL_SIZE,
          h: 2 + rand() * 3,
          alpha: 0.06 + rand() * 0.06,
        });
      }
    }
  }
}

// ─── Renderer ───
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = COLS * CELL_SIZE;
    canvas.height = ROWS * CELL_SIZE;
    this.time = 0;
  }

  clear() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }

  drawMap() {
    const ctx = this.ctx;
    const t = this.time;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * CELL_SIZE, y = r * CELL_SIZE;
        const cell = grid[r][c];
        if (cell === 1) ctx.fillStyle = '#1e1e2e';
        else if (cell === 2) { ctx.fillStyle = `rgba(42,157,92,${0.55 + Math.sin(t * 3) * 0.15})`; }
        else if (cell === 3) { ctx.fillStyle = `rgba(214,48,49,${0.55 + Math.sin(t * 3) * 0.15})`; }
        else if (cell === 4) ctx.fillStyle = '#171d28';
        else ctx.fillStyle = '#141c26';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    for (const d of mapDecor) {
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = '#2a5a3a';
      ctx.fillRect(d.x, d.y, 1, -d.h);
      ctx.fillRect(d.x + 2, d.y, 1, -d.h * 0.7);
      ctx.globalAlpha = 1;
    }

    // Стрелки на всех путях
    for (const p of paths) {
      this.drawPathArrows(ctx, t, p);
    }

    // Свечение стартов и финишей
    for (const p of paths) {
      this.drawEndGlow(ctx, p[0].x, p[0].y, '#2ecc71', t);
      this.drawEndGlow(ctx, p[p.length - 1].x, p[p.length - 1].y, '#e74c3c', t);
    }
  }

  drawPathArrows(ctx, t, pathPoints) {
    const speed = t * 40;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const a = pathPoints[i], b = pathPoints[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) continue;
      const nx = dx / len, ny = dy / len;
      const off = speed % 20;
      for (let d = -off; d < len; d += 20) {
        if (d < 2 || d > len - 2) continue;
        const px = a.x + nx * d, py = a.y + ny * d;
        ctx.beginPath();
        ctx.moveTo(px - ny * 4 - nx * 4, py + nx * 4 - ny * 4);
        ctx.lineTo(px, py);
        ctx.lineTo(px + ny * 4 - nx * 4, py - nx * 4 - ny * 4);
        ctx.stroke();
      }
    }
  }

  drawEndGlow(ctx, x, y, color, t) {
    const r = CELL_SIZE * 0.55 + Math.sin(t * 2) * 3;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.08 + Math.sin(t * 2.5) * 0.04;
    ctx.fill(); ctx.globalAlpha = 1;
  }

  drawTowers(towers, time, dragState) {
    const ctx = this.ctx;

    for (const tower of towers) {
      const { x, y, color, angle, type, cooldown, fireRate, level } = tower;

      // Совместимые башни — пульсирующий ореол
      if (dragState && dragState.compatibles.includes(tower)) {
        ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 + Math.sin(time * 6) * 0.15; ctx.fill(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(x, y, 24 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7 + Math.sin(time * 6) * 0.2; ctx.stroke(); ctx.globalAlpha = 1;
      }

      // Перетаскиваемая башня — приглушённая
      if (dragState && dragState.tower === tower) {
        ctx.globalAlpha = 0.3;
      }

      ctx.beginPath(); ctx.ellipse(x + 2, y + 2, 14, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();

      ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fillStyle = '#0c1018'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.stroke();

      if (cooldown > fireRate - 0.08) {
        ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 1;
      }

      ctx.save(); ctx.translate(x, y);
      if (tower.disabledTimer > 0) ctx.globalAlpha = 0.4;

      switch (type) {
        case 'gun': drawGunTower(ctx, color, angle, time, level); break;
        case 'cannon': drawCannonTower(ctx, color, angle, time, level); break;
        case 'sniper': drawSniperTower(ctx, color, angle, time, level); break;
        case 'tesla': drawTeslaTower(ctx, color, angle, time, level); break;
      }

      if (tower.disabledTimer > 0) {
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,0,0,0.2)'; ctx.fill();
        ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(8, 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(-8, 8); ctx.stroke();
      }

      // Визуал уровней (киберпанк)
      if (level >= 2) {
        const neonColors = { 2: '#00ffcc', 3: '#ff9900', 4: '#ff00ff' };
        const nc = neonColors[level];
        ctx.strokeStyle = nc; ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.4 + Math.sin(time * 3) * 0.2;
        ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (level >= 3) {
        ctx.strokeStyle = '#ff9900'; ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3 + Math.sin(time * 5) * 0.15;
        ctx.beginPath(); ctx.arc(0, 0, 19 + Math.sin(time * 5) * 1, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (level === 4) {
        ctx.save(); ctx.rotate(time * 2);
        ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + Math.sin(time * 8) * 0.3;
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI * 2) / 4;
          ctx.beginPath(); ctx.arc(0, 0, 20, a, a + Math.PI / 5); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      ctx.restore();

      // Восстанавливаем alpha если была приглушена
      if (dragState && dragState.tower === tower) {
        ctx.globalAlpha = 1;
      }

      // Индикатор уровня — точки
      if (level > 1) {
        const neonColors = { 2: '#00ffcc', 3: '#ff9900', 4: '#ff00ff' };
        const nc = neonColors[level];
        for (let i = 0; i < level - 1; i++) {
          const px = x + 10 + i * 5;
          const py = y - 15;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = nc; ctx.fill();
        }
      }
    }

    // Ghost башни при перетаскивании
    if (dragState) {
      const { tower, currentX, currentY } = dragState;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.translate(currentX, currentY);
      ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.fillStyle = '#0c1018'; ctx.fill();
      switch (tower.type) {
        case 'gun': drawGunTower(ctx, tower.color, tower.angle, time, tower.level); break;
        case 'cannon': drawCannonTower(ctx, tower.color, tower.angle, time, tower.level); break;
        case 'sniper': drawSniperTower(ctx, tower.color, tower.angle, time, tower.level); break;
        case 'tesla': drawTeslaTower(ctx, tower.color, tower.angle, time, tower.level); break;
      }
      ctx.restore();
    }
  }

  drawEnemies(enemies, time) {
    const ctx = this.ctx;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const { x, y, radius, color, type, hp, maxHp, slowTimer } = enemy;

      if (enemy.trail && enemy.trail.length > 1) {
        for (let i = 0; i < enemy.trail.length; i++) {
          const pt = enemy.trail[i];
          const fade = (i + 1) / enemy.trail.length;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, radius * fade * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = slowTimer > 0 ? '#74b9ff' : color;
          ctx.globalAlpha = 0.08 * fade; ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.beginPath(); ctx.ellipse(x + 1, y + radius * 0.6, radius * 0.75, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();

      const c = enemy.damageFlash > 0 ? '#fff' : (slowTimer > 0 ? '#74b9ff' : color);

      ctx.save(); ctx.translate(x, y);

      // Фантом в фазе — полупрозрачный
      if (enemy.phased) ctx.globalAlpha = 0.25;

      switch (type) {
        case 'runner': this._enemyRunner(ctx, c, radius, time); break;
        case 'soldier': this._enemySoldier(ctx, c, radius, time); break;
        case 'tank': this._enemyTank(ctx, c, radius, time); break;
        case 'speeder': this._enemySpeeder(ctx, c, radius, time); break;
        case 'splitter': this._enemySplitter(ctx, c, radius, time); break;
        case 'swarm': this._enemySwarm(ctx, c, radius, time); break;
        case 'healer': this._enemyHealer(ctx, c, radius, time); break;
        case 'berserker': this._enemyBerserker(ctx, c, radius, time, enemy.hp / enemy.maxHp); break;
        case 'armored': this._enemyArmored(ctx, c, radius, time); break;
        case 'teleporter': this._enemyTeleporter(ctx, c, radius, time, enemy.teleportFlash); break;
        case 'shaman': this._enemyShaman(ctx, c, radius, time); break;
        case 'necro': this._enemyNecro(ctx, c, radius, time); break;
        case 'phantom': this._enemyPhantom(ctx, c, radius, time, enemy.phased); break;
        case 'miniboss': this._enemyMiniboss(ctx, c, radius, time); break;
        case 'knight': this._enemyKnight(ctx, c, radius, time); break;
        case 'champion': this._enemyChampion(ctx, c, radius, time, enemy.hp / enemy.maxHp); break;
        case 'oracle': this._enemyOracle(ctx, c, radius, time); break;
        case 'executioner': this._enemyExecutioner(ctx, c, radius, time); break;
        case 'voidguard': this._enemyVoidguard(ctx, c, radius, time); break;
        case 'boss': this._enemyBoss(ctx, c, radius, time); break;
        case 'golem': this._enemyGolem(ctx, c, radius, time); break;
        case 'hydra': case 'hydra_mini': case 'hydra_micro': this._enemyHydra(ctx, c, radius, time, type); break;
        case 'titan': this._enemyTitan(ctx, c, radius, time, enemy); break;
        case 'leviathan': this._enemyLeviathan(ctx, c, radius, time); break;
        case 'reaper': this._enemyReaper(ctx, c, radius, time); break;
        case 'queen': this._enemyQueen(ctx, c, radius, time); break;
        default:
          ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fillStyle = c; ctx.fill();
      }

      if (enemy.phased) ctx.globalAlpha = 1;
      ctx.restore();

      // Эффект щита
      if (enemy.shielded && enemy.shieldTimer > 0) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + Math.sin(time * 8) * 0.3;
        ctx.stroke();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#a855f7';
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (hp < maxHp) {
        const bw = radius * 2.4, bh = 3;
        const bx = x - bw / 2, by = y - radius - 7;
        const ratio = hp / maxHp;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        this._roundRect(ctx, bx - 1, by - 1, bw + 2, bh + 2, 2); ctx.fill();
        ctx.fillStyle = ratio > 0.5 ? '#2ecc71' : ratio > 0.25 ? '#f39c12' : '#e74c3c';
        if (bw * ratio > 0.5) { this._roundRect(ctx, bx, by, bw * ratio, bh, 1.5); ctx.fill(); }
      }

      // Титан — полоска щита (синяя, над HP)
      if (enemy.special === 'shield_self' && enemy.shieldMaxHp > 0) {
        const bw = radius * 2.4, bh = 2.5;
        const bx = x - bw / 2, by = y - radius - 12;
        const ratio = enemy.shieldHp / enemy.shieldMaxHp;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        this._roundRect(ctx, bx - 1, by - 1, bw + 2, bh + 2, 2); ctx.fill();
        ctx.fillStyle = '#3498db';
        if (bw * ratio > 0.5) { this._roundRect(ctx, bx, by, bw * ratio, bh, 1.5); ctx.fill(); }
      }

      // Броня — серебристая обводка
      if (enemy.armor > 0) {
        ctx.beginPath(); ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(192,192,192,0.4)'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
  }

  _enemyRunner(ctx, color, r) {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.25, r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill();
  }

  _enemySoldier(ctx, color, r) {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.15);
    ctx.lineTo(0, r * 0.2);
    ctx.lineTo(r * 0.4, -r * 0.15);
    ctx.stroke();
  }

  _enemyTank(ctx, color, r) {
    const s = r * 0.8;
    this._roundRect(ctx, -s, -s, s * 2, s * 2, 3);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(-s, -1.5, s * 2, 3);
    ctx.fillRect(-1.5, -s, 3, s * 2);
  }

  _enemySpeeder(ctx, color, r) {
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.45); ctx.lineTo(0, r * 0.35);
    ctx.moveTo(-r * 0.2, -r * 0.15); ctx.lineTo(0, -r * 0.45); ctx.lineTo(r * 0.2, -r * 0.15);
    ctx.stroke();
  }

  // Шаман — фиолетовый ромб с аурой
  _enemyShaman(ctx, color, r, time) {
    // Аура — пульсирующий круг
    ctx.beginPath(); ctx.arc(0, 0, r + 8 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.15 + Math.sin(time * 4) * 0.1;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Тело — ромб
    ctx.save(); ctx.rotate(Math.PI / 4);
    const s = r * 0.85;
    ctx.fillStyle = color;
    ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.restore();

    // Символ — внутренняя звезда
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
      ctx.stroke();
    }

    // Центральная сфера
    const cr = 2.5 + Math.sin(time * 5) * 1;
    ctx.beginPath(); ctx.arc(0, 0, cr, 0, Math.PI * 2);
    ctx.fillStyle = '#e8daef';
    ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1;
  }

  // Некромант — тёмный шестиугольник с черепом
  _enemyNecro(ctx, color, r, time) {
    // Тёмная аура
    ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.globalAlpha = 0.3; ctx.fill(); ctx.globalAlpha = 1;

    // Тело — шестиугольник
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Символ смерти — крест
    ctx.strokeStyle = '#2d1b69'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.4); ctx.lineTo(0, r * 0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.1); ctx.lineTo(r * 0.3, -r * 0.1); ctx.stroke();

    // Огоньки (пульсирующие)
    ctx.fillStyle = '#bb86fc';
    ctx.globalAlpha = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.35, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.35, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Фантом — полупрозрачный призрак
  _enemyPhantom(ctx, color, r, time, phased) {
    // Волнистое тело
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.8, Math.PI, 0);
    // Нижний край — волнистый
    const wave = r * 0.55;
    ctx.lineTo(r * 0.8, wave);
    for (let i = 3; i >= -3; i--) {
      const wx = (i / 3) * r * 0.8;
      const wy = wave + Math.sin(i + time * 5) * r * 0.2;
      ctx.lineTo(wx, wy);
    }
    ctx.lineTo(-r * 0.8, wave);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke();

    // "Глаза"
    if (!phased) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.2, 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Мини-босс — звезда с бронёй
  _enemyMiniboss(ctx, color, r, time) {
    // Внешнее свечение
    ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.1 + Math.sin(time * 3) * 0.05; ctx.fill(); ctx.globalAlpha = 1;

    // Шестиконечная звезда (два треугольника)
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.55;
      if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Бронепластина внутри
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2); ctx.stroke();

    // Вращающийся внутренний символ
    ctx.save(); ctx.rotate(time * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, 0); ctx.lineTo(r * 0.25, 0);
    ctx.moveTo(0, -r * 0.25); ctx.lineTo(0, r * 0.25);
    ctx.stroke();
    ctx.restore();
  }

  // Босс — крутой визуал с множеством деталей
  _enemyBoss(ctx, color, r, time) {
    // Внешняя пульсирующая аура
    const auraR = r + 8 + Math.sin(time * 2) * 3;
    ctx.beginPath(); ctx.arc(0, 0, auraR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 1;

    // Вращающиеся кольца
    ctx.save(); ctx.rotate(time * 0.8);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 1.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r + 4, Math.PI * 1.5, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.save(); ctx.rotate(-time * 1.2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.globalAlpha = 0.12;
    ctx.beginPath(); ctx.arc(0, 0, r + 2, 0.5, Math.PI * 0.8 + 0.5); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Тело — пятиугольник с градиентом
    const bodyGrad = ctx.createRadialGradient(0, -r * 0.3, 0, 0, 0, r);
    bodyGrad.addColorStop(0, '#ff6b81');
    bodyGrad.addColorStop(0.7, color);
    bodyGrad.addColorStop(1, '#8b0000');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Внутренняя вращающаяся пентаграмма
    ctx.save(); ctx.rotate(time * 1.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55);
      else ctx.lineTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55);
    }
    ctx.closePath(); ctx.stroke();
    ctx.restore();

    // Бронепластины — линии от центра к вершинам
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9);
      ctx.stroke();
    }

    // Центральное ядро — пульсирующее свечение
    const coreR = 4 + Math.sin(time * 5) * 2;
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR + 2);
    coreGrad.addColorStop(0, '#fff');
    coreGrad.addColorStop(0.5, '#ffaaaa');
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(0, 0, coreR + 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, coreR * 0.5, 0, Math.PI * 2); ctx.fill();
  }

  // ═══════ НОВЫЕ ОБЫЧНЫЕ ВРАГИ ═══════

  // Делитель — круг из 3 сегментов с трещинами
  _enemySplitter(ctx, color, r, time) {
    const pulse = 1 + Math.sin(time * 4) * 0.05;
    const pr = r * pulse;
    // 3 сегмента
    for (let i = 0; i < 3; i++) {
      const a1 = (i * 2 * Math.PI) / 3 - Math.PI / 2 + 0.08;
      const a2 = ((i + 1) * 2 * Math.PI) / 3 - Math.PI / 2 - 0.08;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, pr, a1, a2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Трещины (тёмные линии между сегментами)
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * pr, Math.sin(a) * pr);
      ctx.stroke();
    }
    // Центральная точка
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;
  }

  // Рой — крошечный треугольник-насекомое с крылышками
  _enemySwarm(ctx, color, r, time) {
    const vibX = Math.sin(time * 30 + r) * 1.5;
    const vibY = Math.cos(time * 25 + r) * 1.5;
    ctx.translate(vibX, vibY);
    // Тело — маленький треугольник
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.7, r * 0.6);
    ctx.lineTo(r * 0.7, r * 0.6);
    ctx.closePath();
    ctx.fill();
    // Крылышки
    ctx.globalAlpha = 0.3;
    const wingFlap = Math.sin(time * 40) * 0.3;
    ctx.beginPath();
    ctx.ellipse(-r * 0.6, 0, r * 0.5, r * 0.25, -0.5 + wingFlap, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.6, 0, r * 0.5, r * 0.25, 0.5 - wingFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Целитель — круг с зелёным крестом и пульсирующим свечением
  _enemyHealer(ctx, color, r, time) {
    // Аура лечения
    const healPulse = Math.sin(time * 3);
    ctx.beginPath(); ctx.arc(0, 0, r + 6 + healPulse * 3, 0, Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15 + healPulse * 0.1; ctx.stroke(); ctx.globalAlpha = 1;
    // Тело
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
    // Крест
    const cw = r * 0.25, cl = r * 0.6;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(-cw, -cl, cw * 2, cl * 2);
    ctx.fillRect(-cl, -cw, cl * 2, cw * 2);
  }

  // Берсерк — ромб, краснеет при потере HP
  _enemyBerserker(ctx, color, r, time, hpRatio) {
    const enraged = hpRatio <= 0.5;
    const rageColor = enraged ? '#ff0000' : color;
    // Огненные частицы при низком HP
    if (hpRatio <= 0.25) {
      for (let i = 0; i < 4; i++) {
        const a = time * 5 + i * 1.5;
        const fx = Math.cos(a) * r * 0.8;
        const fy = Math.sin(a) * r * 0.8 - r * 0.3;
        ctx.beginPath(); ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6600';
        ctx.globalAlpha = 0.5 + Math.sin(time * 10 + i) * 0.3; ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Тело — ромб
    ctx.save(); ctx.rotate(Math.PI / 4);
    const s = r * 0.75;
    ctx.fillStyle = rageColor;
    ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.restore();
    // Внутренний символ ярости
    if (enraged) {
      ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.35); ctx.lineTo(-r * 0.2, -r * 0.1);
      ctx.lineTo(0, -r * 0.2); ctx.lineTo(r * 0.2, -r * 0.1);
      ctx.lineTo(0, -r * 0.35);
      ctx.stroke();
    }
  }

  // Бронированный — квадрат с двойной обводкой и заклёпками
  _enemyArmored(ctx, color, r, time) {
    const s = r * 0.85;
    // Внешняя обводка
    ctx.fillStyle = color;
    ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2.5;
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    // Внутренняя обводка
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    ctx.strokeRect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4);
    // Заклёпки по углам
    const dots = [[-s * 0.8, -s * 0.8], [s * 0.8, -s * 0.8], [-s * 0.8, s * 0.8], [s * 0.8, s * 0.8]];
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (const [dx, dy] of dots) {
      ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    // Горизонтальная полоса (металл)
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(-s, -2, s * 2, 4);
  }

  // Телепортер — мерцающий контур с глитч-эффектом
  _enemyTeleporter(ctx, color, r, time, teleportFlash) {
    // Вспышка при телепорте
    if (teleportFlash > 0) {
      ctx.beginPath(); ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = teleportFlash; ctx.fill(); ctx.globalAlpha = 1;
    }
    // Глитч-дрожание
    const glitch = Math.sin(time * 20) > 0.7 ? (Math.random() - 0.5) * 3 : 0;
    ctx.translate(glitch, 0);
    // Тело — круг с разрывами
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a1 = (i * Math.PI) / 2 + time * 2;
      const a2 = a1 + Math.PI / 3;
      ctx.beginPath(); ctx.arc(0, 0, r, a1, a2); ctx.stroke();
    }
    // Внутреннее заполнение полупрозрачное
    ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;
    // Центральная точка
    ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
  }

  // ═══════ НОВЫЕ МИНИ-БОССЫ ═══════

  // Рыцарь — пятиугольный щит с крестом
  _enemyKnight(ctx, color, r, time) {
    // Свечение
    ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.globalAlpha = 0.08; ctx.fill(); ctx.globalAlpha = 1;
    // Щит — пятиугольник
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.9, -r * 0.3);
    ctx.lineTo(r * 0.6, r * 0.8);
    ctx.lineTo(-r * 0.6, r * 0.8);
    ctx.lineTo(-r * 0.9, -r * 0.3);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Крест на щите
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.6); ctx.lineTo(0, r * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.05); ctx.lineTo(r * 0.4, -r * 0.05); ctx.stroke();
    // Заклёпки по краям
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    const rivets = [[0, -r * 0.85], [-r * 0.7, -r * 0.15], [r * 0.7, -r * 0.15], [-r * 0.45, r * 0.65], [r * 0.45, r * 0.65]];
    for (const [rx, ry] of rivets) {
      ctx.beginPath(); ctx.arc(rx, ry, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Чемпион — восьмиугольник с короной, пульсирует красным при низком HP
  _enemyChampion(ctx, color, r, time, hpRatio) {
    const enraged = hpRatio <= 0.5;
    // Аура при ярости
    if (enraged) {
      ctx.beginPath(); ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0000';
      ctx.globalAlpha = 0.1 + Math.sin(time * 6) * 0.08; ctx.fill(); ctx.globalAlpha = 1;
    }
    // Тело — восьмиугольник
    ctx.fillStyle = enraged ? '#ff1744' : color;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 - Math.PI / 8;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Корона — 3 зубца сверху
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.7);
    ctx.lineTo(-r * 0.35, -r * 1.1);
    ctx.lineTo(-r * 0.15, -r * 0.8);
    ctx.lineTo(0, -r * 1.15);
    ctx.lineTo(r * 0.15, -r * 0.8);
    ctx.lineTo(r * 0.35, -r * 1.1);
    ctx.lineTo(r * 0.5, -r * 0.7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // Оракул — парящий глаз с лучами
  _enemyOracle(ctx, color, r, time) {
    // Лучи от центра
    ctx.save(); ctx.rotate(time * 0.5);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.15 + Math.sin(time * 3 + i) * 0.1;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
      ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    // Тело — овал (глаз)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    // Зрачок
    const pupilX = Math.sin(time * 2) * r * 0.15;
    ctx.beginPath(); ctx.arc(pupilX, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e'; ctx.fill();
    // Блик
    ctx.beginPath(); ctx.arc(pupilX - r * 0.1, -r * 0.1, r * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
  }

  // Палач — тёмный треугольник (топор) с красными глазами и дымкой
  _enemyExecutioner(ctx, color, r, time) {
    // Дымка
    for (let i = 0; i < 3; i++) {
      const sx = Math.sin(time * 2 + i * 2) * r * 0.5;
      const sy = Math.cos(time * 1.5 + i * 2) * r * 0.5 + r * 0.3;
      ctx.beginPath(); ctx.arc(sx, sy, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fill();
    }
    // Тело — перевёрнутый треугольник (топор)
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.9, r * 0.7);
    ctx.lineTo(-r * 0.9, r * 0.7);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Лезвие (внутренний блик)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.5);
    ctx.lineTo(r * 0.4, r * 0.35);
    ctx.lineTo(-r * 0.4, r * 0.35);
    ctx.closePath(); ctx.stroke();
    // Красные глаза
    ctx.fillStyle = '#ff0000';
    ctx.globalAlpha = 0.7 + Math.sin(time * 5) * 0.3;
    ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Страж Бездны — портал-кольцо с вращающимися рунами
  _enemyVoidguard(ctx, color, r, time) {
    // Внешнее кольцо
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
    // Второе кольцо
    ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
    // Тёмный центр
    ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#050510'; ctx.fill();
    // Вращающиеся руны
    ctx.save(); ctx.rotate(time * 1.5);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const rx = Math.cos(a) * r * 0.85;
      const ry = Math.sin(a) * r * 0.85;
      ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    // Пульсирующая точка в центре
    const coreR = 2 + Math.sin(time * 4) * 1;
    ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fillStyle = '#7c3aed'; ctx.fill();
  }

  // ═══════ НОВЫЕ БОССЫ ═══════

  // Голем — каменная глыба из шестиугольников с лавой
  _enemyGolem(ctx, color, r, time) {
    // Аура
    ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6600'; ctx.globalAlpha = 0.08 + Math.sin(time * 2) * 0.04; ctx.fill(); ctx.globalAlpha = 1;
    // Тело — составная фигура из шестиугольников
    const hexR = r * 0.45;
    const hexPositions = [[0, 0], [-hexR * 1.5, -hexR * 0.5], [hexR * 1.5, -hexR * 0.5],
      [-hexR * 0.75, hexR * 1.1], [hexR * 0.75, hexR * 1.1], [0, -hexR * 1.3]];
    for (const [hx, hy] of hexPositions) {
      ctx.fillStyle = color;
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = hx + Math.cos(a) * hexR * 0.55;
        const py = hy + Math.sin(a) * hexR * 0.55;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // Лава в трещинах
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.3;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.6); ctx.lineTo(0, 0); ctx.lineTo(r * 0.4, -r * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-r * 0.2, r * 0.5); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(r * 0.3, r * 0.4); ctx.stroke();
    ctx.globalAlpha = 1;
    // Глаза из лавы
    ctx.fillStyle = '#ff6600';
    ctx.globalAlpha = 0.7 + Math.sin(time * 5) * 0.3;
    ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.25, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.25, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Гидра — тело с 3 головами (или 2/1 для мини/микро)
  _enemyHydra(ctx, color, r, time, variant) {
    const headCount = variant === 'hydra' ? 3 : variant === 'hydra_mini' ? 2 : 1;
    // Тело — овал
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.7, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Головы — треугольники расходятся веером
    const headSize = r * 0.4;
    for (let i = 0; i < headCount; i++) {
      const spread = headCount === 1 ? 0 : (i - (headCount - 1) / 2) * 0.6;
      const headAngle = -Math.PI / 2 + spread + Math.sin(time * 3 + i) * 0.1;
      const neckLen = r * 0.65;
      const hx = Math.cos(headAngle) * neckLen;
      const hy = Math.sin(headAngle) * neckLen;
      // Шея
      ctx.strokeStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(hx, hy); ctx.stroke();
      // Голова — треугольник
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(headAngle + Math.PI / 2);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -headSize);
      ctx.lineTo(-headSize * 0.5, headSize * 0.3);
      ctx.lineTo(headSize * 0.5, headSize * 0.3);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();
      // Глаз
      ctx.fillStyle = '#ff0000';
      ctx.beginPath(); ctx.arc(0, -headSize * 0.3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // Титан — рыцарь-гигант с энергетическим барьером
  _enemyTitan(ctx, color, r, time, enemy) {
    // Энергетический барьер (вращающееся кольцо)
    if (enemy.shieldHp > 0) {
      ctx.save(); ctx.rotate(time * 1.2);
      ctx.strokeStyle = '#3498db'; ctx.lineWidth = 3;
      ctx.globalAlpha = 0.3 + (enemy.shieldHp / enemy.shieldMaxHp) * 0.4;
      ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, Math.PI * 1.4); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r + 6, Math.PI * 1.6, Math.PI * 2.5); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    // Аура
    ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.globalAlpha = 0.08; ctx.fill(); ctx.globalAlpha = 1;
    // Тело — шестиугольник
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Бронепластины
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); ctx.stroke();
    }
    // Центральный символ
    ctx.save(); ctx.rotate(time * 0.8);
    ctx.strokeStyle = '#3498db'; ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
    // Ядро
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
  }

  // Левиафан — змеевидное тело из сегментов
  _enemyLeviathan(ctx, color, r, time) {
    // Аура замедления башен
    ctx.beginPath(); ctx.arc(0, 0, r + 12, 0, Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1 + Math.sin(time * 2) * 0.05; ctx.stroke();
    ctx.globalAlpha = 1;
    // Сегменты тела
    const segCount = 5;
    for (let i = 0; i < segCount; i++) {
      const angle = time * 1.5 + i * 0.8;
      const segX = Math.sin(angle) * (i - 2) * r * 0.2;
      const segY = (i - 2) * r * 0.35;
      const segR = r * (0.5 - i * 0.05);
      ctx.beginPath(); ctx.arc(segX, segY, segR, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
      // Энергия между сегментами
      if (i < segCount - 1) {
        const nextX = Math.sin(time * 1.5 + (i + 1) * 0.8) * (i - 1) * r * 0.2;
        const nextY = (i - 1) * r * 0.35;
        ctx.strokeStyle = '#bb86fc';
        ctx.globalAlpha = 0.3 + Math.sin(time * 5 + i) * 0.2;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(segX, segY); ctx.lineTo(nextX, nextY); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    // Глаза на верхнем сегменте
    const headX = Math.sin(time * 1.5) * (-2) * r * 0.2;
    const headY = -2 * r * 0.35;
    ctx.fillStyle = '#ff00ff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(headX - 3, headY - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headX + 3, headY - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Жнец — тёмная фигура с косой
  _enemyReaper(ctx, color, r, time) {
    // Дымный след
    for (let i = 0; i < 5; i++) {
      const sx = Math.sin(time * 2 + i) * r * 0.4;
      const sy = r * 0.3 + i * 3;
      ctx.beginPath(); ctx.arc(sx, sy, r * 0.25 + i * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fill();
    }
    // Капюшон — треугольник + полукруг
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 0.5, Math.PI, 0);
    ctx.lineTo(r * 0.6, r * 0.7);
    ctx.lineTo(-r * 0.6, r * 0.7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
    // Лицо — тёмная пустота
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.25, 0, Math.PI * 2); ctx.fill();
    // Глаза — красные точки
    ctx.fillStyle = '#ff0000';
    ctx.globalAlpha = 0.6 + Math.sin(time * 4) * 0.4;
    ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.1, -r * 0.2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Коса
    ctx.save(); ctx.translate(r * 0.4, -r * 0.3);
    ctx.rotate(0.3 + Math.sin(time * 2) * 0.1);
    // Древко
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.5); ctx.lineTo(0, r * 0.8); ctx.stroke();
    // Лезвие
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.5);
    ctx.quadraticCurveTo(-r * 0.6, -r * 0.3, -r * 0.3, -r * 0.1);
    ctx.stroke();
    ctx.restore();
  }

  // Матка — пульсирующий кокон с щупальцами
  _enemyQueen(ctx, color, r, time) {
    // Аура
    ctx.beginPath(); ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.globalAlpha = 0.06; ctx.fill(); ctx.globalAlpha = 1;
    // Щупальца
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + time * 0.5;
      const len = r * 0.8 + Math.sin(time * 3 + i * 2) * r * 0.2;
      const endX = Math.cos(a) * len;
      const endY = Math.sin(a) * len;
      const midX = Math.cos(a) * len * 0.5 + Math.sin(time * 2 + i) * 3;
      const midY = Math.sin(a) * len * 0.5 + Math.cos(time * 2 + i) * 3;
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
      // Кончик щупальца
      ctx.beginPath(); ctx.arc(endX, endY, 2, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Тело — пульсирующий овал
    const pulse = 1 + Math.sin(time * 3) * 0.08;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.7 * pulse, r * 0.55 * pulse, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Внутренняя пульсация
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.4 * pulse, r * 0.3 * pulse, time * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Вспышка при спавне
    const spawnPhase = (time * 0.25) % 1;
    if (spawnPhase < 0.1) {
      ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4444';
      ctx.globalAlpha = 0.3 * (1 - spawnPhase / 0.1); ctx.fill(); ctx.globalAlpha = 1;
    }
  }

  drawProjectiles(projectiles) {
    const ctx = this.ctx;
    for (const p of projectiles) {
      if (!p.alive) continue;
      if (p.type === 'chain') {
        ctx.strokeStyle = p.color; ctx.lineWidth = 2.5;
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let i = 0; i < p.points.length; i++) {
          const pt = p.points[i];
          if (i === 0) { ctx.moveTo(pt.x, pt.y); }
          else {
            const prev = p.points[i - 1];
            const mx = (prev.x + pt.x) / 2 + (Math.random() - 0.5) * 10;
            const my = (prev.y + pt.y) / 2 + (Math.random() - 0.5) * 10;
            ctx.quadraticCurveTo(mx, my, pt.x, pt.y);
          }
        }
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < p.points.length; i++) {
          if (i === 0) ctx.moveTo(p.points[i].x, p.points[i].y);
          else ctx.lineTo(p.points[i].x, p.points[i].y);
        }
        ctx.stroke();
      } else if (p.type === 'burnzone') {
        const t = p.timer / p.maxTimer;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4500';
        ctx.globalAlpha = 0.25 * t; ctx.fill();
        ctx.strokeStyle = '#ff6600'; ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 * t; ctx.stroke();
        ctx.globalAlpha = 1;

      } else if (p.type === 'beam') {
        const t = p.timer / p.maxTimer;
        const endX = p.x + Math.cos(p.angle) * p.length;
        const endY = p.y + Math.sin(p.angle) * p.length;
        ctx.save();
        ctx.strokeStyle = p.color; ctx.lineWidth = 3 * t;
        ctx.shadowColor = p.color; ctx.shadowBlur = 12 * t;
        ctx.globalAlpha = t;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(endX, endY); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(endX, endY); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        ctx.restore();

      } else {
        if (p.prevX !== undefined) {
          ctx.strokeStyle = p.color; ctx.lineWidth = 2;
          ctx.globalAlpha = 0.25;
          ctx.beginPath(); ctx.moveTo(p.prevX, p.prevY); ctx.lineTo(p.x, p.y); ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius + 1, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
      }
    }
  }

  drawPlacementPreview(row, col, valid, range) {
    const ctx = this.ctx;
    const x = col * CELL_SIZE, y = row * CELL_SIZE;
    const cx = x + CELL_SIZE / 2, cy = y + CELL_SIZE / 2;
    ctx.fillStyle = valid ? 'rgba(46,204,113,0.2)' : 'rgba(233,69,96,0.2)';
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    ctx.strokeStyle = valid ? 'rgba(46,204,113,0.5)' : 'rgba(233,69,96,0.5)';
    ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
    if (valid && range) {
      ctx.beginPath(); ctx.arc(cx, cy, range, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.015)'; ctx.fill();
    }
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }

  render(gameState) {
    this.time = gameState.time || 0;
    this.clear();
    this.drawMap();
    if (gameState.particles) gameState.particles.draw(this.ctx, this.time);
    if (gameState.placementPreview) {
      const pp = gameState.placementPreview;
      this.drawPlacementPreview(pp.row, pp.col, pp.valid, pp.range);
    }
    this.drawEnemies(gameState.enemies, this.time);
    this.drawTowers(gameState.towers, this.time, gameState.dragState || null);
    this.drawProjectiles(gameState.projectiles);
  }
}
