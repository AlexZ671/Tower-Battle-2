import { ENEMY_TYPES, MINIBOSS_TYPES } from './enemies.js';
import { paths } from './map.js';

export class WaveManager {
  constructor() {
    this.waveNumber = 0;
    this.spawning = false;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.6;
    this.waveActive = false;
    this.betweenWaves = true;
    this.currentModifiers = null;
  }

  startNextWave(modifiers = null) {
    this.waveNumber++;
    this.spawning = true;
    this.waveActive = true;
    this.betweenWaves = false;
    this.currentModifiers = modifiers;
    this.spawnQueue = this.generateWave(this.waveNumber, modifiers);
    this.spawnTimer = 0;
    this.spawnInterval = Math.max(0.25, 0.6 - this.waveNumber * 0.01);
    if (modifiers && modifiers.spawnMult) {
      this.spawnInterval *= modifiers.spawnMult;
    }
  }

  generateWave(wave, modifiers = null) {
    const queue = [];
    let baseCount = 5 + wave * 2;

    if (modifiers && modifiers.countMult) {
      baseCount = Math.round(baseCount * modifiers.countMult);
    }

    // ═══ Обычные враги ═══
    const basicTypes = ['runner', 'soldier', 'tank', 'speeder', 'splitter', 'swarm', 'healer', 'berserker', 'armored', 'teleporter'];
    const specialBasicTypes = ['splitter', 'healer', 'berserker', 'armored', 'teleporter', 'swarm'];
    const available = basicTypes.filter(t => wave >= ENEMY_TYPES[t].minWave);
    const availableSpecial = specialBasicTypes.filter(t => wave >= ENEMY_TYPES[t].minWave);

    for (let i = 0; i < baseCount; i++) {
      // После 15 волны: 40% шанс спавнить особого монстра вместо обычного
      let type;
      if (wave >= 15 && availableSpecial.length > 0 && Math.random() < 0.4) {
        type = availableSpecial[Math.floor(Math.random() * availableSpecial.length)];
      } else {
        type = available[Math.floor(Math.random() * available.length)];
      }
      // Рой спавнится пачкой
      if (type === 'swarm') {
        const extra = 2 + Math.floor(Math.random() * 3);
        for (let s = 0; s < extra; s++) queue.push('swarm');
      }
      queue.push(type);
    }

    // ═══ Шаман: волна 7+, каждые 3 волны (после 15 — каждые 2) ═══
    const shamanInterval = wave >= 15 ? 2 : 3;
    if (wave >= 7 && wave % shamanInterval === 0) {
      const count = Math.min(4, Math.floor(wave / 8) + 1);
      for (let i = 0; i < count; i++) {
        queue.splice(Math.floor(queue.length / 2), 0, 'shaman');
      }
    }

    // ═══ Фантом: волна 10+, каждые 2 волны (после 15 — каждую) ═══
    const phantomInterval = wave >= 15 ? 1 : 2;
    if (wave >= 10 && wave % phantomInterval === 0) {
      const count = Math.min(5, Math.floor(wave / 6));
      for (let i = 0; i < count; i++) {
        queue.splice(Math.floor(Math.random() * queue.length), 0, 'phantom');
      }
    }

    // ═══ Некромант: волна 12+, каждые 4 волны (после 15 — каждые 3) ═══
    const necroInterval = wave >= 15 ? 3 : 4;
    if (wave >= 12 && wave % necroInterval === 0) {
      const count = Math.min(3, Math.floor(wave / 12) + 1);
      for (let i = 0; i < count; i++) {
        queue.splice(Math.floor(queue.length / 3), 0, 'necro');
      }
    }

    // ═══ Мини-босс: каждую волну начиная с 5-й (кроме боссовых) ═══
    if (wave >= 5 && wave % 10 !== 0) {
      const availableMini = MINIBOSS_TYPES.filter(t => wave >= ENEMY_TYPES[t].minWave);
      const mini = availableMini[Math.floor(Math.random() * availableMini.length)];
      // Палач — в начало/середину, чтобы успел дать импакт
      const insertPos = (mini === 'executioner')
        ? Math.floor(queue.length * 0.3)
        : Math.floor(queue.length * 0.5 + Math.random() * queue.length * 0.3);
      queue.splice(insertPos, 0, mini);
      // С волны 15+ — 2 мини-босса
      if (wave >= 15) {
        const mini2 = availableMini[Math.floor(Math.random() * availableMini.length)];
        const insertPos2 = (mini2 === 'executioner')
          ? Math.floor(queue.length * 0.2)
          : Math.floor(queue.length * 0.4 + Math.random() * queue.length * 0.3);
        queue.splice(insertPos2, 0, mini2);
      }
    }

    // ═══ Боссы: каждые 10 волн ═══
    if (wave % 10 === 0) {
      const bossWave = wave % 50 || 50;
      if (bossWave === 10) queue.push('boss');
      else if (bossWave === 20) queue.push('golem');
      else if (bossWave === 30) queue.push('hydra');
      else if (bossWave === 40) queue.push('titan');
      else if (bossWave === 50) queue.push('leviathan');
      // Дополнительные боссы за каждый полный цикл 50 волн
      const cycles = Math.floor((wave - 1) / 50);
      for (let i = 0; i < cycles; i++) queue.push('boss');
    }

    // ═══ Жнец: волна 30+, 40% шанс нечётная волна ═══
    if (wave >= 30 && wave % 2 === 1 && Math.random() < 0.4) {
      queue.push('reaper');
    }

    // ═══ Матка: волна 40+, 30% шанс чётная волна (не боссовая) ═══
    if (wave >= 40 && wave % 2 === 0 && wave % 10 !== 0 && Math.random() < 0.3) {
      queue.push('queen');
    }

    return queue;
  }

  update(dt, createEnemy, enemies) {
    if (!this.spawning && this.waveActive) {
      const allDead = enemies.every(e => !e.alive);
      if (allDead && this.spawnQueue.length === 0) {
        this.waveActive = false;
        this.betweenWaves = true;
        this.currentModifiers = null;
      }
      return;
    }

    if (!this.spawning) return;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
      const type = this.spawnQueue.shift();
      const enemyPath = paths[Math.floor(Math.random() * paths.length)];
      createEnemy(type, this.waveNumber, this.currentModifiers, enemyPath);
      this.spawnTimer = this.spawnInterval;
    }

    if (this.spawnQueue.length === 0) {
      this.spawning = false;
    }
  }

  get canStartWave() {
    return this.betweenWaves;
  }
}
