// ═══════════════════════════════════════════
// Система скинов башен
// ═══════════════════════════════════════════
import { sound } from './sound.js';
import { achievements } from './achievements.js';

// ─── Определения скинов ───
export const SKINS = {
  gun_cyber: {
    id: 'gun_cyber',
    tower: 'gun',
    name: 'Neon Reaper',
    desc: 'Чёрно-красный киберпанк с неоновыми эффектами',
    cost: 100,
    color: '#1a1a1a',
    accent: '#ff1744',
    accent2: '#ff5252',
  },
  sniper_gauss: {
    id: 'sniper_gauss',
    tower: 'sniper',
    name: 'Gauss Mk.IV',
    desc: 'Электромагнитная пушка, бьёт разрядами',
    cost: 100,
    color: '#0a1628',
    accent: '#00e5ff',
    accent2: '#40c4ff',
  },
  cannon_soviet: {
    id: 'cannon_soviet',
    tower: 'cannon',
    name: 'Прогресс-7',
    desc: 'Футуристичная пушка с советской эстетикой',
    cost: 100,
    color: '#e0e0e0',
    accent: '#b71c1c',
    accent2: '#ffab00',
  },
  tesla_void: {
    id: 'tesla_void',
    tower: 'tesla',
    name: 'Void Engine',
    desc: 'Двигатель пустоты — чёрная дыра в миниатюре',
    cost: 100,
    color: '#0d0d1a',
    accent: '#7c4dff',
    accent2: '#e040fb',
  },
  artillery_volcano: {
    id: 'artillery_volcano',
    tower: 'artillery',
    name: 'Вулкан',
    desc: 'Извержение лавы — огненные снаряды сжигают всё',
    cost: 150,
    color: '#2a0a00',
    accent: '#ff4500',
    accent2: '#ffcc00',
  },
};

// ─── Менеджер скинов ───
export class SkinManager {
  constructor() {
    this.equipped = this._load('td_skins_equipped') || {};  // { gun: 'gun_cyber', ... }
    this.owned = this._load('td_skins_owned') || {};        // { gun_cyber: true, ... }
    this.diamonds = parseInt(localStorage.getItem('td_diamonds')) || 0;
  }

  _load(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  _save() {
    localStorage.setItem('td_skins_equipped', JSON.stringify(this.equipped));
    localStorage.setItem('td_skins_owned', JSON.stringify(this.owned));
    localStorage.setItem('td_diamonds', String(this.diamonds));
  }

  addDiamonds(n) {
    this.diamonds += n;
    this._save();
  }

  buy(skinId) {
    const skin = SKINS[skinId];
    if (!skin || this.owned[skinId]) return false;
    if (this.diamonds < skin.cost) return false;
    this.diamonds -= skin.cost;
    this.owned[skinId] = true;
    this._save();
    achievements.onSkinBuy();
    return true;
  }

  equip(skinId) {
    const skin = SKINS[skinId];
    if (!skin || !this.owned[skinId]) return;
    this.equipped[skin.tower] = skinId;
    this._save();
  }

  unequip(towerType) {
    delete this.equipped[towerType];
    this._save();
  }

  getEquipped(towerType) {
    const id = this.equipped[towerType];
    return id ? SKINS[id] : null;
  }

  isOwned(skinId) {
    return !!this.owned[skinId];
  }
}

export const skinManager = new SkinManager();

// ═══════════════════════════════════════════
// Меню косметики (магазин скинов)
// ═══════════════════════════════════════════

const SKIN_DRAW_SHOP = {
  gun_cyber: drawGunSkin,
  sniper_gauss: drawSniperSkin,
  cannon_soviet: drawCannonSkin,
  tesla_void: drawTeslaSkin,
  artillery_volcano: drawArtillerySkin,
};

export function showSkinShop(onClose) {
  // Удаляем старый оверлей если есть
  let overlay = document.getElementById('skin-shop-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'skin-shop-overlay';
  overlay.innerHTML = `
    <div id="skin-shop-panel">
      <div id="skin-shop-header">
        <div id="skin-shop-title">Косметика</div>
        <div id="skin-shop-diamonds">💎 <span id="skin-shop-dia-count">${skinManager.diamonds}</span></div>
        <button id="skin-shop-close">✕</button>
      </div>
      <div id="skin-shop-grid"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const gridEl = document.getElementById('skin-shop-grid');

  for (const [id, skin] of Object.entries(SKINS)) {
    const owned = skinManager.isOwned(id);
    const equipped = skinManager.equipped[skin.tower] === id;
    const canBuy = skinManager.diamonds >= skin.cost;

    const card = document.createElement('div');
    card.className = 'skin-card' + (equipped ? ' equipped' : '') + (owned ? ' owned' : '');
    card.innerHTML = `
      <canvas class="skin-card-canvas" width="80" height="80"></canvas>
      <div class="skin-card-name">${skin.name}</div>
      <div class="skin-card-desc">${skin.desc}</div>
      <div class="skin-card-tower">${_towerName(skin.tower)}</div>
      <div class="skin-card-action"></div>
    `;

    gridEl.appendChild(card);

    // Рисуем превью скина
    const canvas = card.querySelector('.skin-card-canvas');
    const ctx = canvas.getContext('2d');
    _animateSkinPreview(canvas, ctx, id);

    // Кнопка действия
    const actionEl = card.querySelector('.skin-card-action');
    if (equipped) {
      actionEl.innerHTML = `<button class="skin-btn-unequip">Снять</button>`;
      actionEl.querySelector('button').onclick = () => {
        skinManager.unequip(skin.tower);
        _refreshShop(onClose);
      };
    } else if (owned) {
      actionEl.innerHTML = `<button class="skin-btn-equip">Надеть</button>`;
      actionEl.querySelector('button').onclick = () => {
        skinManager.equip(id);
        _refreshShop(onClose);
      };
    } else {
      actionEl.innerHTML = `<button class="skin-btn-buy${canBuy ? '' : ' disabled'}">💎 ${skin.cost}</button>`;
      const btn = actionEl.querySelector('button');
      if (canBuy) {
        btn.onclick = () => {
          skinManager.buy(id);
          skinManager.equip(id);
          sound.achievementUnlock();
          _refreshShop(onClose);
        };
      }
    }
  }

  // Закрытие
  document.getElementById('skin-shop-close').onclick = () => {
    _closeSkinShop(onClose);
  };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) _closeSkinShop(onClose);
  });
}

function _closeSkinShop(onClose) {
  const overlay = document.getElementById('skin-shop-overlay');
  if (overlay) overlay.remove();
  // Останавливаем все анимации
  _skinAnimations.forEach(id => cancelAnimationFrame(id));
  _skinAnimations.length = 0;
  if (onClose) onClose();
}

function _refreshShop(onClose) {
  _skinAnimations.forEach(id => cancelAnimationFrame(id));
  _skinAnimations.length = 0;
  const overlay = document.getElementById('skin-shop-overlay');
  if (overlay) overlay.remove();
  showSkinShop(onClose);
}

const _skinAnimations = [];

function _animateSkinPreview(canvas, ctx, skinId) {
  const w = canvas.width, h = canvas.height;
  let t = 0, last = 0;

  const draw = (ts) => {
    if (!document.contains(canvas)) return;
    if (!last) last = ts;
    t += (ts - last) / 1000;
    last = ts;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    const drawFn = SKIN_DRAW_SHOP[skinId];
    if (drawFn) drawFn(ctx, t * 0.5, t);
    ctx.restore();

    const rafId = requestAnimationFrame(draw);
    _skinAnimations.push(rafId);
  };

  const rafId = requestAnimationFrame(draw);
  _skinAnimations.push(rafId);
}

function _towerName(type) {
  const names = { gun: 'Пулемёт', cannon: 'Пушка', sniper: 'Снайпер', tesla: 'Тесла', artillery: 'Артиллерия' };
  return names[type] || type;
}

// ═══════════════════════════════════════════
// Отрисовка скинов башен
// ═══════════════════════════════════════════

function _hex(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function _rgba(hex, a) {
  const { r, g, b } = _hex(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Gun: Neon Reaper (чёрно-красный киберпанк) ───
export function drawGunSkin(ctx, angle, time) {
  const black = '#1a1a1a';
  const red = '#ff1744';
  const darkRed = '#b71c1c';

  // Основание — чёрный корпус с красными швами
  ctx.fillStyle = '#0d0d0d';
  ctx.beginPath();
  ctx.moveTo(-11, -14); ctx.lineTo(11, -14);
  ctx.lineTo(14, -11); ctx.lineTo(14, 11);
  ctx.lineTo(11, 14); ctx.lineTo(-11, 14);
  ctx.lineTo(-14, 11); ctx.lineTo(-14, -11);
  ctx.closePath(); ctx.fill();

  // Красные неоновые линии на корпусе
  ctx.strokeStyle = red; ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6 + Math.sin(time * 4) * 0.3;
  ctx.beginPath(); ctx.moveTo(-11, -7); ctx.lineTo(11, -7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-11, 7); ctx.lineTo(11, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-7, -11); ctx.lineTo(-7, 11); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, -11); ctx.lineTo(7, 11); ctx.stroke();
  ctx.globalAlpha = 1;

  // Турель — тёмная с красным свечением
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = red; ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.5 + Math.sin(time * 5) * 0.3;
  ctx.stroke(); ctx.globalAlpha = 1;

  // Красные индикаторы по кругу
  ctx.fillStyle = red;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + time * 0.5;
    ctx.globalAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 7, Math.sin(a) * 7, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Ствол
  ctx.save(); ctx.rotate(angle);

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.moveTo(-1, -5); ctx.lineTo(10, -3.5);
  ctx.lineTo(10, 3.5); ctx.lineTo(-1, 5);
  ctx.closePath(); ctx.fill();

  // Ствол — чёрный с красными полосами
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.roundRect(8, -3, 18, 6, 1.5); ctx.fill();

  // Красные полосы на стволе
  ctx.strokeStyle = red; ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.7;
  for (let x = 11; x <= 23; x += 3) {
    ctx.beginPath(); ctx.moveTo(x, -2.5); ctx.lineTo(x, 2.5); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Дульный срез — красное свечение
  ctx.fillStyle = darkRed;
  ctx.beginPath(); ctx.roundRect(25, -4, 3, 8, 1); ctx.fill();
  ctx.fillStyle = red;
  ctx.globalAlpha = 0.6 + Math.sin(time * 8) * 0.4;
  ctx.beginPath(); ctx.arc(27, 0, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Красная дульная вспышка
  const flash = Math.sin(time * 14) * 0.5 + 0.5;
  if (flash > 0.6) {
    const alpha = (flash - 0.6) * 2.5;
    ctx.fillStyle = `rgba(255,23,68,${alpha})`;
    ctx.beginPath(); ctx.arc(29, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,100,100,${alpha * 0.5})`;
    ctx.beginPath(); ctx.arc(29, 0, 2, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();

  // Центральный красный глаз
  ctx.fillStyle = red;
  ctx.globalAlpha = 0.7 + Math.sin(time * 4) * 0.3;
  ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();

  // Свечение вокруг
  ctx.globalAlpha = 0.1 + Math.sin(time * 3) * 0.05;
  ctx.fillStyle = red;
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── Sniper: Gauss Mk.IV (электромагнитная пушка) ───
export function drawSniperSkin(ctx, angle, time) {
  const blue = '#00e5ff';
  const darkBlue = '#006064';

  // Основание — тёмно-синий треугольник с электро-эффектом
  ctx.fillStyle = '#0a1628';
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
    else ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = blue; ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4 + Math.sin(time * 3) * 0.2;
  ctx.stroke(); ctx.globalAlpha = 1;

  // Электрические дуги на ногах
  ctx.strokeStyle = blue; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
    const ex = Math.cos(a) * 12, ey = Math.sin(a) * 12;
    ctx.beginPath(); ctx.moveTo(0, 0);
    const jx = Math.sin(time * 12 + i * 4) * 3;
    const jy = Math.cos(time * 10 + i * 3) * 3;
    ctx.quadraticCurveTo(ex * 0.5 + jx, ey * 0.5 + jy, ex, ey);
    ctx.globalAlpha = 0.3 + Math.sin(time * 5 + i) * 0.2;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ядро — пульсирующее электро-свечение
  ctx.fillStyle = '#0a1628';
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = blue; ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6 + Math.sin(time * 4) * 0.3;
  ctx.stroke(); ctx.globalAlpha = 1;

  // Вращающийся ствол
  ctx.save(); ctx.rotate(angle);

  // Рельсы гауссовой пушки (2 параллельных)
  ctx.fillStyle = '#1a2a3a';
  ctx.beginPath(); ctx.roundRect(5, -5, 24, 3, 1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(5, 2, 24, 3, 1); ctx.fill();

  // Электро-катушки между рельсами
  ctx.fillStyle = darkBlue;
  for (let x = 8; x <= 24; x += 4) {
    ctx.beginPath(); ctx.roundRect(x, -2, 2, 4, 0.5); ctx.fill();
  }

  // Разряд между рельсами
  ctx.strokeStyle = blue; ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5 + Math.sin(time * 15) * 0.4;
  ctx.beginPath(); ctx.moveTo(8, -2);
  for (let x = 10; x <= 26; x += 2) {
    ctx.lineTo(x, (Math.sin(time * 20 + x) > 0 ? -1 : 1) * 1.5);
  }
  ctx.stroke(); ctx.globalAlpha = 1;

  // Дульный конец — накопитель энергии
  ctx.fillStyle = '#0a1628';
  ctx.beginPath(); ctx.roundRect(27, -4, 5, 8, 2); ctx.fill();
  ctx.fillStyle = blue;
  ctx.globalAlpha = 0.5 + Math.sin(time * 6) * 0.4;
  ctx.beginPath(); ctx.arc(30, 0, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Заряжающая вспышка
  const charge = Math.sin(time * 8) * 0.5 + 0.5;
  if (charge > 0.7) {
    ctx.globalAlpha = (charge - 0.7) * 3;
    ctx.fillStyle = blue;
    ctx.beginPath(); ctx.arc(32, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(32, 0, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // Центральное ядро
  ctx.fillStyle = blue;
  ctx.globalAlpha = 0.6 + Math.sin(time * 5) * 0.3;
  ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── Cannon: Прогресс-7 (советский футуризм) ───
export function drawCannonSkin(ctx, angle, time) {
  const white = '#e0e0e0';
  const red = '#b71c1c';
  const gold = '#ffab00';

  // Основание — белый восьмиугольник
  ctx.fillStyle = white;
  ctx.strokeStyle = red; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const x = Math.cos(a) * 12, y = Math.sin(a) * 12;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Красная звезда в центре (СССР)
  ctx.fillStyle = red;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outer = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const inner = outer + Math.PI / 5;
    if (i === 0) ctx.moveTo(Math.cos(outer) * 6, Math.sin(outer) * 6);
    else ctx.lineTo(Math.cos(outer) * 6, Math.sin(outer) * 6);
    ctx.lineTo(Math.cos(inner) * 2.5, Math.sin(inner) * 2.5);
  }
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  // Внутренний круг с золотой обводкой
  ctx.strokeStyle = gold; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke();

  // Серпо-молото стилизованные засечки
  ctx.strokeStyle = '#999'; ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
    ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
    ctx.stroke();
  }

  // Ствол
  ctx.save(); ctx.rotate(angle);

  // Белый корпус ствола с красными полосами
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(6, -4.5, 15, 9);
  ctx.strokeStyle = red; ctx.lineWidth = 0.8;
  ctx.strokeRect(6, -4.5, 15, 9);

  // Красная полоса (советский стиль)
  ctx.fillStyle = red;
  ctx.fillRect(6, -5, 15, 1.5);
  ctx.fillRect(6, 3.5, 15, 1.5);

  // Обручи ствола (промышленный вид)
  ctx.fillStyle = '#aaa';
  ctx.fillRect(10, -5.5, 2.5, 11);
  ctx.fillRect(16, -5.5, 2.5, 11);

  // Дульный конец
  ctx.fillStyle = '#ccc';
  ctx.beginPath(); ctx.arc(21, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = red; ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(21, 0, 2.5, 0, Math.PI * 2); ctx.fill();

  // Золотая звезда на стволе
  ctx.fillStyle = gold;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outer = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const inner = outer + Math.PI / 5;
    const cx = 13, cy = 0;
    if (i === 0) ctx.moveTo(cx + Math.cos(outer) * 2.5, cy + Math.sin(outer) * 2.5);
    else ctx.lineTo(cx + Math.cos(outer) * 2.5, cy + Math.sin(outer) * 2.5);
    ctx.lineTo(cx + Math.cos(inner) * 1, cy + Math.sin(inner) * 1);
  }
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ─── Tesla: Void Engine (чёрная дыра) ───
export function drawTeslaSkin(ctx, angle, time) {
  const purple = '#7c4dff';
  const pink = '#e040fb';
  const r = 13;

  // Внешнее кольцо — вращающееся фиолетовое
  ctx.save(); ctx.rotate(time * 1.5);
  ctx.fillStyle = '#0d0d1a';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = purple; ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.3;
  ctx.stroke(); ctx.globalAlpha = 1;
  ctx.restore();

  // Орбитальные кольца
  ctx.strokeStyle = purple; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate(time * (1 + i * 0.7) + i * Math.PI / 3);
    ctx.globalAlpha = 0.3 + Math.sin(time * 3 + i * 2) * 0.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Внутреннее кольцо с розовым свечением
  ctx.strokeStyle = pink; ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4 + Math.sin(time * 5) * 0.3;
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;

  // Чёрная дыра в центре
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
  gradient.addColorStop(0, '#000000');
  gradient.addColorStop(0.5, '#1a0033');
  gradient.addColorStop(1, 'rgba(124,77,255,0.3)');
  ctx.fillStyle = gradient;
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();

  // Энергетические дуги к вершинам
  ctx.strokeStyle = pink; ctx.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + time;
    const ex = Math.cos(a) * r, ey = Math.sin(a) * r;
    const j1 = Math.sin(time * 18 + i * 2) * 5;
    const j2 = Math.cos(time * 14 + i * 3) * 4;
    ctx.globalAlpha = 0.2 + Math.sin(time * 8 + i) * 0.2;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(ex * 0.3 + j1, ey * 0.3 + j2, ex * 0.6 - j2, ey * 0.6 + j1, ex, ey);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Центральная яркая точка пульсирует
  const cr = 2 + Math.sin(time * 8) * 1;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.8 + Math.sin(time * 10) * 0.2;
  ctx.beginPath(); ctx.arc(0, 0, cr, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Внешнее свечение
  ctx.globalAlpha = 0.08 + Math.sin(time * 3) * 0.04;
  ctx.fillStyle = purple;
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── Artillery: Вулкан (огненная лава) ───
export function drawArtillerySkin(ctx, angle, time) {
  const lava = '#ff4500';
  const magma = '#ff6600';
  const gold = '#ffcc00';
  const dark = '#2a0a00';
  const rock = '#3d1a00';

  // Основание — скальная пятиугольная платформа с трещинами лавы
  ctx.fillStyle = dark;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const wobble = Math.sin(time * 2 + i * 1.5) * 0.5;
    const r = 15 + wobble;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = lava; ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6 + Math.sin(time * 3) * 0.3;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Лавовые трещины на базе
  ctx.strokeStyle = magma; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const a2 = ((i + 1) * 2 * Math.PI) / 5 - Math.PI / 2;
    const mx = (Math.cos(a1) + Math.cos(a2)) * 0.5 * 12;
    const my = (Math.sin(a1) + Math.sin(a2)) * 0.5 * 12;
    ctx.globalAlpha = 0.4 + Math.sin(time * 4 + i * 1.3) * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(mx * 0.5 + Math.sin(time * 3 + i) * 2, my * 0.5 + Math.cos(time * 2.5 + i) * 2, mx, my);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Внутренний магматический круг (кратер)
  const craterGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
  craterGrad.addColorStop(0, gold);
  craterGrad.addColorStop(0.4, lava);
  craterGrad.addColorStop(0.8, rock);
  craterGrad.addColorStop(1, dark);
  ctx.fillStyle = craterGrad;
  ctx.globalAlpha = 0.7 + Math.sin(time * 5) * 0.2;
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Пульсирующие угольки вокруг базы
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + time * 0.8;
    const dist = 12 + Math.sin(time * 6 + i * 2) * 2;
    const px = Math.cos(a) * dist;
    const py = Math.sin(a) * dist;
    const sz = 1 + Math.sin(time * 8 + i * 3) * 0.5;
    ctx.globalAlpha = 0.3 + Math.sin(time * 7 + i * 1.7) * 0.3;
    ctx.fillStyle = i % 2 === 0 ? gold : lava;
    ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Вращающийся ствол — одно большое жерло вулкана
  ctx.save(); ctx.rotate(angle);

  // Корпус ствола — тёмная скала (расширяющийся к базе)
  ctx.fillStyle = rock;
  ctx.beginPath();
  ctx.moveTo(-2, -8); ctx.lineTo(6, -6);
  ctx.lineTo(6, 6); ctx.lineTo(-2, 8);
  ctx.closePath(); ctx.fill();

  // Одно большое дуло — каменное жерло с лавой
  ctx.fillStyle = '#4a2000';
  ctx.beginPath(); ctx.roundRect(5, -6, 20, 12, 2); ctx.fill();

  // Лава внутри ствола (светящийся канал)
  ctx.globalAlpha = 0.5 + Math.sin(time * 6) * 0.3;
  const lavaGrad = ctx.createLinearGradient(7, 0, 23, 0);
  lavaGrad.addColorStop(0, magma);
  lavaGrad.addColorStop(0.5, lava);
  lavaGrad.addColorStop(1, gold);
  ctx.fillStyle = lavaGrad;
  ctx.beginPath(); ctx.roundRect(7, -4, 14, 8, 1); ctx.fill();
  ctx.globalAlpha = 1;

  // Каменные обручи с огненными трещинами
  ctx.fillStyle = '#5a2800';
  for (const x of [9, 15, 21]) {
    ctx.beginPath(); ctx.roundRect(x, -7, 2.5, 14, 0.5); ctx.fill();
  }
  ctx.strokeStyle = magma; ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.5 + Math.sin(time * 5) * 0.3;
  for (const x of [9, 15, 21]) {
    ctx.beginPath(); ctx.moveTo(x + 1, -7); ctx.lineTo(x + 1 + Math.sin(time * 4) * 0.5, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 1, 0); ctx.lineTo(x + 1 + Math.cos(time * 4) * 0.5, 7); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Массивный дульный срез — вулканическое жерло
  ctx.fillStyle = '#3d1500';
  ctx.beginPath(); ctx.roundRect(24, -7.5, 4, 15, 1.5); ctx.fill();

  // Раскалённое жерло
  const heatPulse = 0.5 + Math.sin(time * 8) * 0.5;
  const heatGrad = ctx.createRadialGradient(27, 0, 0, 27, 0, 5);
  heatGrad.addColorStop(0, gold);
  heatGrad.addColorStop(0.4, lava);
  heatGrad.addColorStop(1, 'rgba(255,69,0,0)');
  ctx.globalAlpha = 0.6 + heatPulse * 0.4;
  ctx.fillStyle = heatGrad;
  ctx.beginPath(); ctx.arc(27, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Огненная вспышка при «выстреле»
  const flash = Math.sin(time * 10) * 0.5 + 0.5;
  if (flash > 0.6) {
    const alpha = (flash - 0.6) * 2.5;
    // Огненный шар на дуле
    ctx.fillStyle = `rgba(255,200,0,${alpha})`;
    ctx.beginPath(); ctx.arc(30, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,200,${alpha * 0.6})`;
    ctx.beginPath(); ctx.arc(30, 0, 3, 0, Math.PI * 2); ctx.fill();
    // Искры
    for (let i = 0; i < 4; i++) {
      const sx = 30 + Math.cos(time * 20 + i * 1.5) * (4 + i * 2);
      const sy = Math.sin(time * 18 + i * 3) * 5;
      ctx.fillStyle = `rgba(255,180,0,${alpha * 0.8})`;
      ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.restore();

  // Центральное ядро — пульсирующая магма
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, gold);
  coreGrad.addColorStop(1, lava);
  ctx.fillStyle = coreGrad;
  ctx.globalAlpha = 0.7 + Math.sin(time * 6) * 0.3;
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Внешнее тепловое свечение
  ctx.globalAlpha = 0.06 + Math.sin(time * 2) * 0.04;
  ctx.fillStyle = lava;
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ═══════════════════════════════════════════
// Скин-звуки выстрелов
// ═══════════════════════════════════════════

export function playSkinShot(skinId) {
  if (skinId === 'gun_cyber') {
    _cyberShot();
  } else if (skinId === 'sniper_gauss') {
    _gaussShot();
  } else if (skinId === 'cannon_soviet') {
    _sovietShot();
  } else if (skinId === 'tesla_void') {
    _voidShot();
  } else if (skinId === 'artillery_volcano') {
    _volcanoShot();
  }
}

function _cyberShot() {
  if (!sound._ensureContext()) return;
  const t = sound._now();
  const g = sound._gain(0.15);

  // Электронный щелчок + бас
  const env = sound.ctx.createGain();
  env.gain.setValueAtTime(1, t);
  env.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
  env.connect(g);
  const o = sound._osc('square', 2000, env, t, t + 0.06);
  o.frequency.exponentialRampToValueAtTime(100, t + 0.06);

  // Distortion layer
  const dist = sound.ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = Math.tanh(x * 3);
  }
  dist.curve = curve;
  dist.connect(g);
  const env2 = sound.ctx.createGain();
  env2.gain.setValueAtTime(0.4, t);
  env2.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
  env2.connect(dist);
  sound._osc('sawtooth', 150, env2, t, t + 0.04);
}

function _gaussShot() {
  if (!sound._ensureContext()) return;
  const t = sound._now();
  const g = sound._gain(0.18);

  // Нарастающий электро-разряд
  const env = sound.ctx.createGain();
  env.gain.setValueAtTime(0.01, t);
  env.gain.linearRampToValueAtTime(0.9, t + 0.03);
  env.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  env.connect(g);
  const o = sound._osc('sawtooth', 400, env, t, t + 0.15);
  o.frequency.exponentialRampToValueAtTime(3000, t + 0.05);
  o.frequency.exponentialRampToValueAtTime(200, t + 0.15);

  // Электрический шум
  const bp = sound.ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 3;
  bp.connect(g);
  const nEnv = sound.ctx.createGain();
  nEnv.gain.setValueAtTime(0.5, t + 0.02);
  nEnv.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  nEnv.connect(bp);
  sound._playNoise(0.1, nEnv, t + 0.02);
}

function _sovietShot() {
  if (!sound._ensureContext()) return;
  const t = sound._now();
  const g = sound._gain(0.22);

  // Глубокий мощный бум
  const env = sound.ctx.createGain();
  env.gain.setValueAtTime(1, t);
  env.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
  env.connect(g);
  sound._osc('sine', 60, env, t, t + 0.25);

  // Металлический лязг
  const env2 = sound.ctx.createGain();
  env2.gain.setValueAtTime(0.6, t);
  env2.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
  env2.connect(g);
  sound._osc('square', 200, env2, t, t + 0.08);

  // Шум выброса
  const lp = sound.ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 600;
  lp.connect(g);
  const nEnv = sound.ctx.createGain();
  nEnv.gain.setValueAtTime(0.4, t);
  nEnv.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
  nEnv.connect(lp);
  sound._playNoise(0.2, nEnv, t);
}

function _voidShot() {
  if (!sound._ensureContext()) return;
  const t = sound._now();
  const g = sound._gain(0.15);

  // Обратный sweep (high → low, eerie)
  const env = sound.ctx.createGain();
  env.gain.setValueAtTime(0.01, t);
  env.gain.linearRampToValueAtTime(0.7, t + 0.05);
  env.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
  env.connect(g);
  const o = sound._osc('sine', 2000, env, t, t + 0.2);  // Внутренний магматический круг (кратер)
  const craterGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
  craterGrad.addColorStop(0, gold);
  craterGrad.addColorStop(0.4, lava);
  craterGrad.addColorStop(0.8, rock);
  craterGrad.addColorStop(1, dark);
  ctx.fillStyle = craterGrad;
  ctx.globalAlpha = 0.7 + Math.sin(time * 5) * 0.2;
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  o.frequency.exponentialRampToValueAtTime(80, t + 0.2);

  // Второй тон — dissonant
  const env2 = sound.ctx.createGain();
  env2.gain.setValueAtTime(0.01, t);
  env2.gain.linearRampToValueAtTime(0.4, t + 0.05);
  env2.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  env2.connect(g);
  sound._osc('sine', 1337, env2, t, t + 0.15);
}

function _volcanoShot() {
  if (!sound._ensureContext()) return;
  const t = sound._now();
  const g = sound._gain(0.25);

  // Глубокий рокот извержения
  const env = sound.ctx.createGain();
  env.gain.setValueAtTime(1, t);
  env.gain.exponentialRampToValueAtTime(0.3, t + 0.15);
  env.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
  env.connect(g);
  const o = sound._osc('sine', 45, env, t, t + 0.4);
  o.frequency.exponentialRampToValueAtTime(25, t + 0.4);

  // Средний тон — треск магмы
  const env2 = sound.ctx.createGain();
  env2.gain.setValueAtTime(0.7, t);
  env2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
  env2.connect(g);
  const o2 = sound._osc('sawtooth', 120, env2, t, t + 0.2);
  o2.frequency.exponentialRampToValueAtTime(60, t + 0.2);

  // Высокий шипящий выброс (пар/газ)
  const hp = sound.ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 2000;
  hp.connect(g);
  const lp = sound.ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 6000;
  lp.connect(hp);
  const nEnv = sound.ctx.createGain();
  nEnv.gain.setValueAtTime(0.01, t);
  nEnv.gain.linearRampToValueAtTime(0.5, t + 0.03);
  nEnv.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
  nEnv.connect(lp);
  sound._playNoise(0.25, nEnv, t);

  // Удар — камень/взрыв
  const env3 = sound.ctx.createGain();
  env3.gain.setValueAtTime(0.8, t);
  env3.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  env3.connect(g);
  sound._osc('square', 80, env3, t, t + 0.1);
}
