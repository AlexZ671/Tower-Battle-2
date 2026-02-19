export const CELL_SIZE = 40;
export const COLS = 20;
export const ROWS = 15;
export const MAP_WIDTH = COLS * CELL_SIZE;
export const MAP_HEIGHT = ROWS * CELL_SIZE;

// 0 = пустая, 1 = путь, 2 = старт, 3 = финиш, 4 = башня

export let grid = [];
export let paths = [];

function range(start, end, step = 1) {
  const arr = [];
  if (step > 0) for (let i = start; i <= end; i += step) arr.push(i);
  else for (let i = start; i >= end; i += step) arr.push(i);
  return arr;
}

function cellsToPixels(cells) {
  return cells.map(([r, c]) => ({
    x: c * CELL_SIZE + CELL_SIZE / 2,
    y: r * CELL_SIZE + CELL_SIZE / 2,
  }));
}

// ═══════════════════════════════════════════
// УРОВЕНЬ 1: ЛУГ — один длинный S-путь
// Старт: левый край → Финиш: нижний центр
// ═══════════════════════════════════════════
const level1Cells = [
  ...range(0, 8).map(c => [2, c]),
  ...range(3, 6).map(r => [r, 8]),
  ...range(7, 2, -1).map(c => [6, c]),
  ...range(7, 9).map(r => [r, 2]),
  ...range(3, 17).map(c => [9, c]),
  ...range(10, 12).map(r => [r, 17]),
  ...range(16, 10, -1).map(c => [12, c]),
  [13, 10],
  [14, 10],
];

// ═══════════════════════════════════════════
// УРОВЕНЬ 2: РАЗВИЛКА — путь из левого края
// раздваивается на верхний и нижний, оба идут
// к финишу у правого края
// ═══════════════════════════════════════════
// Общее начало: слева по ряду 7 до колонки 4
// Вилка вверх: [7,4]→[3,4]→[3,4..17]→[3..7,17]→[7,17..19] → финиш [7,19]
// Вилка вниз: [7,4]→[11,4]→[11,4..17]→[11..7,17]→[7,17..19] → финиш [7,19]
// Нет, лучше чтобы пути не сходились до самого конца

const level2PathA = [
  // Старт слева, середина
  ...range(0, 4).map(c => [7, c]),
  // Вверх до ряда 3
  ...range(6, 3, -1).map(r => [r, 4]),
  // Верхний путь — вправо до 17
  ...range(5, 17).map(c => [3, c]),
  // Вниз к ряду 7
  ...range(4, 7).map(r => [r, 17]),
  // Финиш — вправо до края
  [7, 18], [7, 19],
];

const level2PathB = [
  // Тот же старт
  ...range(0, 4).map(c => [7, c]),
  // Вниз до ряда 11
  ...range(8, 11).map(r => [r, 4]),
  // Нижний путь — вправо до 17
  ...range(5, 17).map(c => [11, c]),
  // Вверх к ряду 7
  ...range(10, 7, -1).map(r => [r, 17]),
  // Финиш — вправо до края
  [7, 18], [7, 19],
];

// ═══════════════════════════════════════════
// УРОВЕНЬ 3: ОСАДА — база в центре карты,
// враги атакуют с трёх краёв
// ═══════════════════════════════════════════
// Финиш: [7, 10] — центр карты
// Вход сверху: [0,10] → вниз к [7,10]
// Вход слева: [7,0] → вправо через петлю к [7,10]
// Вход снизу: [14,10] → вверх к [7,10]

const level3PathA = [
  // Сверху — зигзаг вниз
  ...range(0, 3).map(r => [r, 3]),
  ...range(4, 10).map(c => [3, c]),
  ...range(4, 7).map(r => [r, 10]),
];

const level3PathB = [
  // Слева — петля через низ
  ...range(0, 4).map(c => [12, c]),
  ...range(5, 10).map(c => [12, c]),
  ...range(11, 8, -1).map(r => [r, 10]),
  [7, 10],
];

const level3PathC = [
  // Справа — петля через верх
  ...range(19, 15, -1).map(c => [2, c]),
  ...range(3, 7).map(r => [r, 15]),
  ...range(14, 10, -1).map(c => [7, c]),
];

// ═══════════════════════════════════════════
// УРОВЕНЬ 4: ХАОС — случайно сгенерированный путь
// Генерируется при каждой загрузке
// Алгоритм: зигзаг слева направо через всю карту
// ═══════════════════════════════════════════

function rngInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// Генерирует зигзагообразный путь слева направо через всю карту
// Путь состоит из чередующихся горизонтальных и вертикальных сегментов
function generateZigzagPath(rng, startRow, endRow) {
  const cells = [];
  let r = startRow;
  let c = 0;

  // Количество поворотов: 3-5
  const numTurns = rngInt(rng, 3, 5);
  // Равномерно распределяем колонки поворотов по ширине карты
  const turnCols = [];
  for (let i = 0; i < numTurns; i++) {
    const zone = Math.floor((COLS - 2) / (numTurns + 1)) * (i + 1);
    turnCols.push(Math.max(2, Math.min(COLS - 3, zone + rngInt(rng, -1, 1))));
  }

  for (let t = 0; t < numTurns; t++) {
    const targetCol = turnCols[t];

    // Горизонтальный сегмент: идём до turnCol
    const cDir = targetCol > c ? 1 : -1;
    while (c !== targetCol) {
      cells.push([r, c]);
      c += cDir;
    }
    cells.push([r, c]);

    // Вертикальный сегмент: идём к случайному ряду
    let targetRow;
    if (t === numTurns - 1) {
      // Последний поворот — направляемся к финишному ряду
      targetRow = endRow;
    } else {
      // Случайный ряд, но отличающийся от текущего минимум на 3
      let tries = 0;
      do {
        targetRow = rngInt(rng, 1, ROWS - 2);
        tries++;
      } while (tries < 20 && Math.abs(targetRow - r) < 3);
    }

    const rDir = targetRow > r ? 1 : -1;
    while (r !== targetRow) {
      r += rDir;
      cells.push([r, c]);
    }
  }

  // Дотягиваем горизонтально до правого края
  while (c < COLS - 1) {
    c++;
    cells.push([r, c]);
  }

  return cells;
}

function generateLevel4() {
  const rng = () => Math.random();

  // Случайный выбор: 1 или 2 пути
  const numPaths = rngInt(rng, 1, 2);

  if (numPaths === 1) {
    // Один зигзагообразный путь
    const startRow = rngInt(rng, 2, ROWS - 3);
    const endRow = rngInt(rng, 2, ROWS - 3);
    const path = generateZigzagPath(rng, startRow, endRow);

    return {
      pathCellArrays: [path],
      starts: [[path[0][0], path[0][1]]],
      ends: [[path[path.length - 1][0], path[path.length - 1][1]]],
    };
  } else {
    // Два пути: общий старт слева, расходятся в разные стороны
    const startRow = rngInt(rng, 5, ROWS - 6); // ближе к центру чтобы было куда расходиться
    const commonLen = rngInt(rng, 3, 6); // общий горизонтальный участок

    // Общее начало
    const commonCells = [];
    for (let c = 0; c <= commonLen; c++) {
      commonCells.push([startRow, c]);
    }

    // Верхний путь: уходит вверх, потом зигзагом к правому краю
    const upperRow = rngInt(rng, 1, Math.max(2, startRow - 3));
    const upperEnd = rngInt(rng, 1, Math.max(2, startRow - 2));

    // Нижний путь: уходит вниз, потом зигзагом к правому краю
    const lowerRow = rngInt(rng, Math.min(ROWS - 3, startRow + 3), ROWS - 2);
    const lowerEnd = rngInt(rng, Math.min(ROWS - 3, startRow + 2), ROWS - 2);

    // Строим верхнюю ветку
    const forkCol = commonLen;
    const upperCells = [...commonCells];
    // Вверх от форка
    for (let r = startRow - 1; r >= upperRow; r--) {
      upperCells.push([r, forkCol]);
    }
    // Зигзаг вправо в верхней зоне
    const upperZig = generateZigzagSubpath(rng, upperRow, forkCol + 1, upperEnd, 1, Math.max(1, startRow - 1));
    upperCells.push(...upperZig);

    // Строим нижнюю ветку
    const lowerCells = [...commonCells];
    // Вниз от форка
    for (let r = startRow + 1; r <= lowerRow; r++) {
      lowerCells.push([r, forkCol]);
    }
    // Зигзаг вправо в нижней зоне
    const lowerZig = generateZigzagSubpath(rng, lowerRow, forkCol + 1, lowerEnd, Math.min(ROWS - 2, startRow + 1), ROWS - 2);
    lowerCells.push(...lowerZig);

    return {
      pathCellArrays: [upperCells, lowerCells],
      starts: [[startRow, 0]],
      ends: [
        [upperCells[upperCells.length - 1][0], upperCells[upperCells.length - 1][1]],
        [lowerCells[lowerCells.length - 1][0], lowerCells[lowerCells.length - 1][1]],
      ],
    };
  }
}

// Зигзаг в ограниченной зоне рядов (minRow..maxRow) от startCol до правого края
function generateZigzagSubpath(rng, startRow, startCol, endRow, minRow, maxRow) {
  const cells = [];
  let r = startRow;
  let c = startCol;

  // 2-3 поворота
  const numTurns = rngInt(rng, 2, 3);
  const colSpace = COLS - 1 - startCol;
  const turnCols = [];
  for (let i = 0; i < numTurns; i++) {
    const zone = startCol + Math.floor(colSpace / (numTurns + 1)) * (i + 1);
    turnCols.push(Math.max(startCol + 1, Math.min(COLS - 3, zone + rngInt(rng, -1, 1))));
  }

  for (let t = 0; t < numTurns; t++) {
    const targetCol = turnCols[t];

    // Горизонтально
    while (c < targetCol) {
      cells.push([r, c]);
      c++;
    }
    cells.push([r, c]);

    // Вертикально
    let targetRow;
    if (t === numTurns - 1) {
      targetRow = endRow;
    } else {
      let tries = 0;
      do {
        targetRow = rngInt(rng, minRow, maxRow);
        tries++;
      } while (tries < 20 && Math.abs(targetRow - r) < 2);
    }

    const rDir = targetRow > r ? 1 : -1;
    while (r !== targetRow) {
      r += rDir;
      cells.push([r, c]);
    }
  }

  // До правого края
  while (c < COLS - 1) {
    c++;
    cells.push([r, c]);
  }

  return cells;
}

// ═══════════════════════════════════════════
// Определения уровней
// ═══════════════════════════════════════════
export const LEVELS = [
  {
    id: 1,
    name: 'Луг',
    difficulty: 'Лёгкий',
    desc: 'Один длинный извилистый путь. Классический уровень для начала.',
    color: '#2ecc71',
    startGold: 300,
    startLives: 20,
    pathCellArrays: [level1Cells],
    starts: [[2, 0]],
    ends: [[14, 10]],
  },
  {
    id: 2,
    name: 'Развилка',
    difficulty: 'Средний',
    desc: 'Путь раздваивается! Враги случайно выбирают верхний или нижний маршрут.',
    color: '#e3b341',
    startGold: 350,
    startLives: 15,
    pathCellArrays: [level2PathA, level2PathB],
    starts: [[7, 0]],
    ends: [[7, 19]],
  },
  {
    id: 3,
    name: 'Осада',
    difficulty: 'Сложный',
    desc: 'База в центре карты. Враги атакуют с трёх сторон!',
    color: '#f85149',
    startGold: 450,
    startLives: 10,
    pathCellArrays: [level3PathA, level3PathB, level3PathC],
    starts: [[0, 3], [12, 0], [2, 19]],
    ends: [[7, 10]],
  },
  {
    id: 4,
    name: 'Хаос',
    difficulty: 'Случайный',
    desc: 'Каждая игра — новая карта! Путь генерируется случайно.',
    color: '#a855f7',
    startGold: 350,
    startLives: 15,
    pathCellArrays: null, // генерируется при загрузке
    starts: null,
    ends: null,
    randomGen: true,
  },
];

export let currentLevel = null;

export function loadLevel(levelId) {
  let level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  // Для случайного уровня — генерируем путь
  if (level.randomGen) {
    const gen = generateLevel4();
    level = { ...level, ...gen };
  }

  currentLevel = level;

  grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = new Array(COLS).fill(0);
  }

  for (const cellArray of level.pathCellArrays) {
    for (const [r, c] of cellArray) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        grid[r][c] = 1;
      }
    }
  }

  for (const [r, c] of level.starts) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = 2;
  }
  for (const [r, c] of level.ends) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = 3;
  }

  paths = level.pathCellArrays.map(cells => cellsToPixels(cells));
}

export function isValidPlacement(row, col) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
  return grid[row][col] === 0;
}

export function pixelToCell(x, y) {
  return {
    col: Math.floor(x / CELL_SIZE),
    row: Math.floor(y / CELL_SIZE),
  };
}

export function cellToPixel(row, col) {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}
