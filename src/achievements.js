// ═══════════════════════════════════════════
// Система ачивок с привязкой по токену
// ═══════════════════════════════════════════
import { sound } from './sound.js';

// ─── Определения ачивок ───
export const ACHIEVEMENTS = {
  // Боссы
  kill_boss:      { name: 'Первый рубеж',         desc: 'Убейте Босса',                  icon: '💀', secret: true },
  kill_golem:     { name: 'Каменное сердце',       desc: 'Убейте Голема',                 icon: '🪨', secret: true },
  kill_hydra:     { name: 'Головорез',             desc: 'Убейте Гидру',                  icon: '🐍', secret: true },
  kill_titan:     { name: 'Титаноборец',           desc: 'Убейте Титана',                 icon: '🛡️', secret: true },
  kill_queen:     { name: 'Конец династии',        desc: 'Убейте Матку',                  icon: '👑', secret: true },
  kill_reaper:    { name: 'Жнец жнецов',           desc: 'Убейте Жнеца',                  icon: '💀', secret: true },
  kill_leviathan: { name: 'Бездна повержена',      desc: 'Убейте Левиафана',              icon: '🌊', secret: true },

  // Боссы 2-го цикла
  kill_archon:      { name: 'Тень повержена',        desc: 'Убейте Архонта Тьмы',         icon: '🌑', secret: true },
  kill_colossus:    { name: 'Давид и Голиаф',        desc: 'Убейте Колосса',              icon: '🗿', secret: true },
  kill_plague_lord: { name: 'Дезинфекция',           desc: 'Убейте Чумного повелителя',   icon: '☣️', secret: true },
  kill_chronos:     { name: 'Время вышло',           desc: 'Убейте Хроноса',              icon: '⏰', secret: true },
  kill_absolute:    { name: 'Абсолютная победа',     desc: 'Убейте Абсолюта',             icon: '👁️', secret: true },

  // Мини-боссы
  kill_miniboss:    { name: 'Страж пал',             desc: 'Убейте Стража',               icon: '⚔️', secret: true },
  kill_knight:      { name: 'Рыцарь без доспехов',   desc: 'Убейте Рыцаря',              icon: '🗡️', secret: true },
  kill_champion:    { name: 'Низвержение чемпиона',  desc: 'Убейте Чемпиона',             icon: '🏆', secret: true },
  kill_oracle:      { name: 'Пророчество отменено',  desc: 'Убейте Оракула',              icon: '🔮', secret: true },
  kill_executioner: { name: 'Казнь палача',           desc: 'Убейте Палача',               icon: '🪓', secret: true },
  kill_voidguard:   { name: 'Бездна отступила',      desc: 'Убейте Стража Бездны',        icon: '🌀', secret: true },

  // Убийства
  first_kill:   { name: 'Первая кровь',      desc: 'Убейте первого врага',        icon: '🩸', secret: false },
  kills_100:    { name: 'Сотня',             desc: 'Убейте 100 врагов',           icon: '💯', secret: false },
  kills_500:    { name: 'Полтысячи',         desc: 'Убейте 500 врагов',           icon: '🔥', secret: false },
  kills_1000:   { name: 'Тысячник',          desc: 'Убейте 1000 врагов',          icon: '☠️', secret: false },
  kills_5000:   { name: 'Машина смерти',     desc: 'Убейте 5000 врагов',          icon: '⚡', secret: false },

  // Волны
  wave_10:  { name: 'Разминка',       desc: 'Доберитесь до 10 волны',    icon: '🌊', secret: false },
  wave_25:  { name: 'Четверть сотни',  desc: 'Доберитесь до 25 волны',    icon: '🌊', secret: false },
  wave_50:  { name: 'Полсотни',        desc: 'Доберитесь до 50 волны',    icon: '🌊', secret: false },

  // Башни
  merge_lv2:  { name: 'Ученик',            desc: 'Улучшите башню до 2 уровня',  icon: '🔧', secret: false },
  merge_lv3:  { name: 'Инженер',           desc: 'Улучшите башню до 3 уровня',  icon: '⚙️', secret: false },
  merge_lv4:  { name: 'Мастер-оружейник',  desc: 'Улучшите башню до 4 уровня',  icon: '🏗️', secret: false },
  towers_10:  { name: 'Крепость',          desc: 'Имейте 10 башен одновременно', icon: '🏰', secret: false },

  // Экономика
  rich:       { name: 'Богач',       desc: 'Накопите 5000 золота',     icon: '💰', secret: false },
  super_rich: { name: 'Магнат',      desc: 'Накопите 10000 золота',    icon: '💎', secret: false },

  // Особые
  no_damage_wave: { name: 'Неприкосновенный', desc: 'Пройдите волну без потери жизней', icon: '✨', secret: false },
  speed_demon:    { name: 'Скоростной демон',  desc: 'Пройдите волну на 10x скорости',  icon: '⏩', secret: false },

  // Волны — продвинутые
  wave_100:   { name: 'Центурион',          desc: 'Доберитесь до 100 волны',         icon: '🏛️', secret: false },
  wave_30:    { name: 'Тьма наступает',     desc: 'Доберитесь до 30 волны (ивент тьмы)', icon: '🌑', secret: false },

  // Убийства — продвинутые
  kills_10000: { name: 'Геноцид',           desc: 'Убейте 10000 врагов',             icon: '💀', secret: false },

  // Башни — продвинутые
  towers_20:     { name: 'Цитадель',          desc: 'Имейте 20 башен одновременно',    icon: '🏯', secret: false },
  all_types:     { name: 'Арсенал',           desc: 'Поставьте все 5 типов башен',     icon: '🎯', secret: false },
  max_army:      { name: 'Полная мощь',       desc: 'Имейте 3 башни 4-го уровня',     icon: '⭐', secret: false },

  // Экономика — продвинутые
  diamond_50:    { name: 'Ювелир',            desc: 'Накопите 50 алмазов',             icon: '💎', secret: false },
  buy_skin:      { name: 'Модник',            desc: 'Купите первый скин',              icon: '🎨', secret: false },

  // Монстры тьмы
  kill_shadow:      { name: 'Свет во тьме',       desc: 'Убейте Тень',                icon: '🔦', secret: true },
  kill_devourer:    { name: 'Несъедобный',         desc: 'Убейте Пожирателя',          icon: '🍽️', secret: true },
  kill_herald:      { name: 'Заря',                desc: 'Убейте Сумеречного вестника', icon: '🌅', secret: true },
  kill_shadow_lord: { name: 'Повелитель света',    desc: 'Убейте Теневого лорда',      icon: '👑', secret: true },

  // Секретные / хардкор
  no_damage_10:  { name: 'Стена',              desc: '10 волн подряд без потерь',       icon: '🧱', secret: true },
  survivor:      { name: 'На волоске',         desc: 'Выживите с 1 HP',                icon: '💔', secret: true },
  rich_death:    { name: 'Жадность',           desc: 'Проиграйте имея 3000+ золота',   icon: '🪙', secret: true },
  speed_50:      { name: 'Безумие',            desc: 'Дойдите до 50 волны на 10x',     icon: '🤯', secret: true },
};

// Маппинг тип врага -> ID ачивки
const ENEMY_KILL_MAP = {
  boss: 'kill_boss', golem: 'kill_golem', hydra: 'kill_hydra',
  titan: 'kill_titan', queen: 'kill_queen', reaper: 'kill_reaper',
  leviathan: 'kill_leviathan', miniboss: 'kill_miniboss', knight: 'kill_knight',
  champion: 'kill_champion', oracle: 'kill_oracle', executioner: 'kill_executioner',
  voidguard: 'kill_voidguard', archon: 'kill_archon', colossus: 'kill_colossus',
  plague_lord: 'kill_plague_lord', chronos: 'kill_chronos', absolute: 'kill_absolute',
  shadow: 'kill_shadow', devourer: 'kill_devourer',
  herald: 'kill_herald', shadow_lord: 'kill_shadow_lord',
};

// ─── Менеджер ачивок ───
export class AchievementManager {
  constructor() {
    this.token = this._loadOrCreateToken();
    this.unlocked = this._loadUnlocked();
    this.totalKills = this._loadStat('totalKills');
    this._popupQueue = [];
    this._showingPopup = false;
    this._createPopupContainer();
  }

  // ─── Токен ───

  _loadOrCreateToken() {
    let token = localStorage.getItem('td_token');
    if (!token) {
      token = this._generateToken();
      localStorage.setItem('td_token', token);
    }
    return token;
  }

  _generateToken() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) token += '-';
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }

  setToken(newToken) {
    this.token = newToken.trim().toUpperCase();
    localStorage.setItem('td_token', this.token);
    this.unlocked = this._loadUnlocked();
    this.totalKills = this._loadStat('totalKills');
  }

  // ─── Сохранение / загрузка ───

  _storageKey() {
    return `td_ach_${this.token}`;
  }

  _loadUnlocked() {
    try {
      return JSON.parse(localStorage.getItem(this._storageKey())) || {};
    } catch {
      return {};
    }
  }

  _save() {
    localStorage.setItem(this._storageKey(), JSON.stringify(this.unlocked));
    localStorage.setItem(this._storageKey() + '_kills', String(this.totalKills));
  }

  _loadStat(key) {
    return parseInt(localStorage.getItem(this._storageKey() + '_kills')) || 0;
  }

  // ─── Разблокировка ───

  unlock(id) {
    if (this.unlocked[id]) return;
    if (!ACHIEVEMENTS[id]) return;

    this.unlocked[id] = Date.now();
    this._save();
    this._queuePopup(id);
    sound.achievementUnlock();
  }

  isUnlocked(id) {
    return !!this.unlocked[id];
  }

  getProgress() {
    const total = Object.keys(ACHIEVEMENTS).length;
    const done = Object.keys(this.unlocked).length;
    return { done, total };
  }

  // ─── Трекинг событий ───

  onEnemyKill(enemyType) {
    this.totalKills++;
    this._save();

    // Ачивка за тип врага
    const achId = ENEMY_KILL_MAP[enemyType];
    if (achId) this.unlock(achId);

    // Ачивки за количество убийств
    if (this.totalKills >= 1) this.unlock('first_kill');
    if (this.totalKills >= 100) this.unlock('kills_100');
    if (this.totalKills >= 500) this.unlock('kills_500');
    if (this.totalKills >= 1000) this.unlock('kills_1000');
    if (this.totalKills >= 5000) this.unlock('kills_5000');
    if (this.totalKills >= 10000) this.unlock('kills_10000');
  }

  onWaveComplete(waveNumber) {
    if (waveNumber >= 10) this.unlock('wave_10');
    if (waveNumber >= 25) this.unlock('wave_25');
    if (waveNumber >= 30) this.unlock('wave_30');
    if (waveNumber >= 50) this.unlock('wave_50');
    if (waveNumber >= 100) this.unlock('wave_100');
  }

  onTowerMerge(newLevel) {
    if (newLevel >= 2) this.unlock('merge_lv2');
    if (newLevel >= 3) this.unlock('merge_lv3');
    if (newLevel >= 4) this.unlock('merge_lv4');
  }

  onGoldChange(gold) {
    if (gold >= 5000) this.unlock('rich');
    if (gold >= 10000) this.unlock('super_rich');
  }

  onTowerCount(count) {
    if (count >= 10) this.unlock('towers_10');
    if (count >= 20) this.unlock('towers_20');
  }

  onTowerTypes(types) {
    if (types.size >= 5) this.unlock('all_types');
  }

  onMaxLevelTowers(count) {
    if (count >= 3) this.unlock('max_army');
  }

  onWaveNoDamage() {
    this._noDamageStreak = (this._noDamageStreak || 0) + 1;
    this.unlock('no_damage_wave');
    if (this._noDamageStreak >= 10) this.unlock('no_damage_10');
  }

  onWaveDamageTaken() {
    this._noDamageStreak = 0;
  }

  onSpeedWave(speed, wave) {
    if (speed >= 10) this.unlock('speed_demon');
    if (speed >= 10 && wave >= 50) this.unlock('speed_50');
  }

  onLivesChange(lives) {
    if (lives === 1) this.unlock('survivor');
  }

  onGameOver(gold) {
    if (gold >= 3000) this.unlock('rich_death');
  }

  onDiamondChange(diamonds) {
    if (diamonds >= 50) this.unlock('diamond_50');
  }

  onSkinBuy() {
    this.unlock('buy_skin');
  }

  // ─── Popup (Steam-стиль, снизу-слева) ───

  _createPopupContainer() {
    let container = document.getElementById('achievement-popup-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'achievement-popup-container';
      document.body.appendChild(container);
    }
    this._popupContainer = container;
  }

  _queuePopup(id) {
    this._popupQueue.push(id);
    if (!this._showingPopup) this._showNextPopup();
  }

  _showNextPopup() {
    if (this._popupQueue.length === 0) {
      this._showingPopup = false;
      return;
    }

    this._showingPopup = true;
    const id = this._popupQueue.shift();
    const ach = ACHIEVEMENTS[id];

    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
      <div class="ach-popup-icon">${ach.icon}</div>
      <div class="ach-popup-text">
        <div class="ach-popup-label">Достижение разблокировано!</div>
        <div class="ach-popup-name">${ach.name}</div>
        <div class="ach-popup-desc">${ach.desc}</div>
      </div>
    `;

    this._popupContainer.appendChild(popup);

    // Анимация: вылет → задержка → уход
    requestAnimationFrame(() => popup.classList.add('show'));

    setTimeout(() => {
      popup.classList.remove('show');
      popup.classList.add('hide');
      setTimeout(() => {
        popup.remove();
        this._showNextPopup();
      }, 500);
    }, 3500);
  }

  // ─── Панель ачивок ───

  showPanel() {
    let overlay = document.getElementById('achievement-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'achievement-overlay';
      document.body.appendChild(overlay);
    }

    const { done, total } = this.getProgress();
    const ids = Object.keys(ACHIEVEMENTS);

    let cardsHtml = '';
    for (const id of ids) {
      const ach = ACHIEVEMENTS[id];
      const unlocked = this.isUnlocked(id);

      if (unlocked) {
        cardsHtml += `
          <div class="ach-card unlocked">
            <div class="ach-card-icon">${ach.icon}</div>
            <div class="ach-card-name">${ach.name}</div>
            <div class="ach-card-desc">${ach.desc}</div>
          </div>`;
      } else {
        cardsHtml += `
          <div class="ach-card locked">
            <div class="ach-card-icon">🔒</div>
            <div class="ach-card-name">${ach.secret ? '???' : ach.name}</div>
            <div class="ach-card-desc">${ach.secret ? 'Секретное достижение' : ach.desc}</div>
          </div>`;
      }
    }

    overlay.innerHTML = `
      <div id="ach-panel">
        <div id="ach-panel-header">
          <div id="ach-panel-title">Достижения</div>
          <div id="ach-panel-progress">${done} / ${total}</div>
          <button id="ach-panel-close">✕</button>
        </div>
        <div id="ach-panel-token">
          <span>Токен:</span>
          <span id="ach-token-display">${this.token}</span>
        </div>
        <div id="ach-panel-grid">${cardsHtml}</div>
      </div>
    `;

    overlay.classList.remove('hidden');

    document.getElementById('ach-panel-close').onclick = () => {
      overlay.classList.add('hidden');
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });

  }
}

// Глобальный экземпляр
export const achievements = new AchievementManager();
