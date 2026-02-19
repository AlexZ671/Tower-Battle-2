// ═══════════════════════════════════════════
// ГЛОБАЛЬНЫЕ модификаторы (навсегда, каждые 10 волн)
// ═══════════════════════════════════════════
export const GLOBAL_MODIFIER_POOL = [
  {
    id: 'g_hp_30',
    name: 'Закалка',
    desc: 'Все враги получают +30% HP навсегда',
    icon: '🛡',
    color: '#f85149',
    apply: (g) => { g.hpMult *= 1.3; },
  },
  {
    id: 'g_speed_20',
    name: 'Адреналин',
    desc: 'Все враги на 20% быстрее навсегда',
    icon: '💨',
    color: '#2ed573',
    apply: (g) => { g.speedMult *= 1.2; },
  },
  {
    id: 'g_reward_25',
    name: 'Инфляция',
    desc: '-25% золота за убийство навсегда',
    icon: '💸',
    color: '#e3b341',
    apply: (g) => { g.rewardMult *= 0.75; },
  },
  {
    id: 'g_regen',
    name: 'Живучесть',
    desc: 'Все враги регенерируют 3% HP/с навсегда',
    icon: '💚',
    color: '#2ecc71',
    apply: (g) => { g.regenPercent += 0.03; },
  },
  {
    id: 'g_count_25',
    name: 'Подкрепление',
    desc: '+25% врагов в каждой волне навсегда',
    icon: '👥',
    color: '#e67e22',
    apply: (g) => { g.countMult *= 1.25; },
  },
  {
    id: 'g_tower_slow',
    name: 'Помехи',
    desc: 'Башни стреляют на 15% медленнее навсегда',
    icon: '📡',
    color: '#a855f7',
    apply: (g) => { g.towerFireRateMult *= 1.15; },
  },
  {
    id: 'g_tower_range',
    name: 'Туман',
    desc: 'Дальность башен -15% навсегда',
    icon: '🌫',
    color: '#8b949e',
    apply: (g) => { g.towerRangeMult *= 0.85; },
  },
  {
    id: 'g_tower_dmg',
    name: 'Броня',
    desc: 'Башни наносят на 15% меньше урона навсегда',
    icon: '🔰',
    color: '#5dade2',
    apply: (g) => { g.towerDamageMult *= 0.85; },
  },
  {
    id: 'g_life_drain',
    name: 'Проклятие',
    desc: '-2 жизни прямо сейчас',
    icon: '💀',
    color: '#da3633',
    apply: (g) => { g.lifeDrain += 2; },
  },
  {
    id: 'g_cost_up',
    name: 'Налог',
    desc: 'Башни стоят на 20% дороже навсегда',
    icon: '💰',
    color: '#ffa502',
    apply: (g) => { g.towerCostMult *= 1.2; },
  },
];

export function pickRandomGlobalModifiers(n = 3) {
  const pool = [...GLOBAL_MODIFIER_POOL];
  const result = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export function createEmptyGlobalModifiers() {
  return {
    hpMult: 1,
    speedMult: 1,
    countMult: 1,
    rewardMult: 1,
    regenPercent: 0,
    spawnMult: 1,
    sizeMult: 1,
    towerFireRateMult: 1,
    towerRangeMult: 1,
    towerDamageMult: 1,
    towerCostMult: 1,
    lifeDrain: 0,
  };
}

// ═══════════════════════════════════════════
// Волновые модификаторы (действуют 1 волну)
// ═══════════════════════════════════════════
export const MODIFIER_POOL = [
  {
    id: 'hp_25',
    name: 'Закалённые',
    desc: '+25% HP врагов',
    icon: '♥',
    color: '#f85149',
    apply: (m) => { m.hpMult *= 1.25; },
  },
  {
    id: 'hp_50',
    name: 'Бронированные',
    desc: '+50% HP врагов',
    icon: '♥♥',
    color: '#da3633',
    apply: (m) => { m.hpMult *= 1.5; },
  },
  {
    id: 'speed_15',
    name: 'Ускоренные',
    desc: '+15% скорости врагов',
    icon: '»',
    color: '#2ed573',
    apply: (m) => { m.speedMult *= 1.15; },
  },
  {
    id: 'speed_30',
    name: 'Стремительные',
    desc: '+30% скорости врагов',
    icon: '»»',
    color: '#1abc9c',
    apply: (m) => { m.speedMult *= 1.3; },
  },
  {
    id: 'count_30',
    name: 'Орда',
    desc: '+30% врагов в волне',
    icon: '☠',
    color: '#ffa502',
    apply: (m) => { m.countMult *= 1.3; },
  },
  {
    id: 'count_50',
    name: 'Нашествие',
    desc: '+50% врагов в волне',
    icon: '☠☠',
    color: '#e67e22',
    apply: (m) => { m.countMult *= 1.5; },
  },
  {
    id: 'reward_down',
    name: 'Скупые',
    desc: '-30% награды за убийство',
    icon: '◇',
    color: '#e3b341',
    apply: (m) => { m.rewardMult *= 0.7; },
  },
  {
    id: 'regen',
    name: 'Регенерация',
    desc: 'Враги лечатся 2% HP/с',
    icon: '+',
    color: '#2ecc71',
    apply: (m) => { m.regenPercent += 0.02; },
  },
  {
    id: 'spawn_fast',
    name: 'Блиц',
    desc: 'Враги спавнятся в 2x быстрее',
    icon: '⚡',
    color: '#a855f7',
    apply: (m) => { m.spawnMult *= 0.5; },
  },
  {
    id: 'size_up',
    name: 'Гиганты',
    desc: '+30% размер врагов, +20% HP',
    icon: '▲',
    color: '#7f8c8d',
    apply: (m) => { m.sizeMult *= 1.3; m.hpMult *= 1.2; },
  },
];

// ═══════════════════════════════════════════
// Жёсткие модификаторы (для ивентовых волн)
// ═══════════════════════════════════════════
export const HARD_MODIFIER_POOL = [
  {
    id: 'hard_hp_40',
    name: 'Стальная кожа',
    desc: '+40% HP врагов',
    icon: '♥♥♥',
    color: '#da3633',
    apply: (m) => { m.hpMult *= 1.4; },
  },
  {
    id: 'hard_hp_60',
    name: 'Неуязвимые',
    desc: '+60% HP врагов',
    icon: '🛡♥',
    color: '#f85149',
    apply: (m) => { m.hpMult *= 1.6; },
  },
  {
    id: 'hard_count_50',
    name: 'Армия тьмы',
    desc: '+50% врагов в волне',
    icon: '☠☠☠',
    color: '#e67e22',
    apply: (m) => { m.countMult *= 1.5; },
  },
  {
    id: 'hard_count_80',
    name: 'Вторжение',
    desc: '+80% врагов в волне',
    icon: '💀☠',
    color: '#ffa502',
    apply: (m) => { m.countMult *= 1.8; },
  },
  {
    id: 'hard_spawn_fast',
    name: 'Молниеносный блиц',
    desc: 'Спавн в 2.5x быстрее',
    icon: '⚡⚡',
    color: '#a855f7',
    apply: (m) => { m.spawnMult *= 0.4; },
  },
  {
    id: 'hard_regen_5',
    name: 'Сверхрегенерация',
    desc: 'Враги лечатся 5% HP/с',
    icon: '++',
    color: '#2ecc71',
    apply: (m) => { m.regenPercent += 0.05; },
  },
  {
    id: 'hard_size_hp',
    name: 'Колоссы',
    desc: '+40% размер, +40% HP',
    icon: '▲▲',
    color: '#7f8c8d',
    apply: (m) => { m.sizeMult *= 1.4; m.hpMult *= 1.4; },
  },
  {
    id: 'hard_speed_40',
    name: 'Буря',
    desc: '+40% скорости врагов',
    icon: '»»»',
    color: '#1abc9c',
    apply: (m) => { m.speedMult *= 1.4; },
  },
];

// ═══════════════════════════════════════════
// Ивентовые волны (редкости)
// ═══════════════════════════════════════════
export const EVENT_TIERS = [
  {
    id: 'rare',
    name: 'Редкая волна',
    color: '#58a6ff',
    glowColor: 'rgba(88, 166, 255, 0.4)',
    baseChance: 0.25,
    diffMult: 1.25, // модификаторы на 25% жёстче
  },
  {
    id: 'epic',
    name: 'Эпическая волна',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    baseChance: 0.10,
    diffMult: 1.5,
  },
  {
    id: 'legendary',
    name: 'Легендарная волна',
    color: '#f0883e',
    glowColor: 'rgba(240, 136, 62, 0.6)',
    baseChance: 0.05,
    diffMult: 2.0,
  },
];

// Определить ивент-тир для волны (null = обычная)
export function rollEventTier(waveNumber) {
  if (waveNumber < 15) return null;
  // +10% шанс каждые 10 волн после 15
  const bonusChance = Math.floor((waveNumber - 15) / 10) * 0.10;

  // Один бросок, проверяем пороги (от редкого к обычному)
  const roll = Math.random();
  const legChance = EVENT_TIERS[2].baseChance + bonusChance;
  const epicChance = EVENT_TIERS[1].baseChance + bonusChance;
  const rareChance = EVENT_TIERS[0].baseChance + bonusChance;

  if (roll < legChance) return EVENT_TIERS[2];       // Легендарная
  if (roll < legChance + epicChance) return EVENT_TIERS[1]; // Эпическая
  if (roll < legChance + epicChance + rareChance) return EVENT_TIERS[0]; // Редкая
  return null;
}

// Выбрать жёсткие модификаторы для ивентовой волны
export function pickHardModifiers(n = 3) {
  const pool = [...HARD_MODIFIER_POOL];
  const result = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// Выбрать n случайных неповторяющихся модификаторов
export function pickRandomModifiers(n = 3) {
  const pool = [...MODIFIER_POOL];
  const result = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// Пустой объект модификаторов (без изменений)
export function createEmptyModifiers() {
  return {
    hpMult: 1,
    speedMult: 1,
    countMult: 1,
    rewardMult: 1,
    regenPercent: 0,
    spawnMult: 1,
    sizeMult: 1,
  };
}
