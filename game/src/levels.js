// levels.js — the three floors of the Lanternfall Vault, drawn as tile maps.
// Legend:
//   #  stone wall        blocks movement and sight
//   C  packing crate     blocks movement and sight (tall cover)
//   S  display shelf     blocks movement and sight (tall cover)
//   T  reading table     blocks movement only (low cover: hide behind, seen over)
//   L  lamplight pool    walkable floor, but you are easier to spot standing in it
//   ,  carpet            walkable, muffles nothing, just pretty
//   K  the Ember Key     steal it, then the exit will open
//   E  exit door         locked until you hold the Ember Key
//   g  moonstone gem     optional loot, +150 each
//   P  player start
//   .  plain dark floor
// Guards are listed per level with patrol waypoints in tile coordinates.

export const LEVELS = [
  {
    name: 'Floor I — The Outer Gallery',
    hint: 'Steal the Ember Key from the vault nook, then slip out the east door.',
    map: [
      '################################',
      '#..........L..........##########',
      '#..g.......L....C.....#....K...#',
      '#..........L....C.....#........#',
      '#..SS..........C......#...g....#',
      '#..SS....L.....C......####.#####',
      '#...............L..........L...#',
      '#.....CC..........TTT..........#',
      '#.....CC....L.....TTT....L.....#',
      '#..........L...................#',
      '#..L...........CC.........L....E',
      '#..............CC..............#',
      '#.....TTT...........SS.........#',
      '#..L..TTT....L......SS....L....#',
      '#..............................#',
      '#......CC.....L..........CC....#',
      '#..L...CC................CC....#',
      '#..........................L...#',
      '#.P....L...........g...........#',
      '################################',
    ],
    guards: [
      { patrol: [[9, 7], [15, 7], [15, 12], [9, 12]] },
      { patrol: [[17, 3], [20, 3], [20, 9], [17, 9]] },
      { patrol: [[24, 13], [29, 13], [29, 17], [24, 17]] },
    ],
  },
  {
    name: 'Floor II — The Reading Room',
    hint: 'Shelves make a maze here. Pebbles (Space) pull a guard off his route.',
    map: [
      '################################',
      '#.P.........L......#.......K...#',
      '#.....SS...........#...........#',
      '#..L..SS....CC.....#..g....L...#',
      '#.....SS....CC.....#####.#######',
      '#..................L...........#',
      '####.#####....L........CC......#',
      '#........#..........L.CC...L...#',
      '#..SS....#..TTT................#',
      '#..SS....#..TTT....SS......L...#',
      '#........#.........SS..........E',
      '#..L.....#....L....SS..CC......#',
      '#.....#########........CC......#',
      '#.....#.......#..L.............#',
      '#..g..#...L...#......TTT....L..#',
      '#.....#.......#..L...TTT.......#',
      '#.....####.####................#',
      '#..L..........L......CC....g...#',
      '#..........L.........CC........#',
      '################################',
    ],
    guards: [
      { patrol: [[8, 5], [15, 5], [15, 9], [8, 9]] },
      { patrol: [[22, 6], [28, 6], [28, 9], [22, 9]] },
      { patrol: [[17, 13], [23, 13], [23, 17], [17, 17]] },
      { patrol: [[3, 14], [3, 17], [9, 17], [9, 14]] },
    ],
  },
  {
    name: 'Floor III — The Ember Vault',
    hint: 'Five lanterns, five guards, one key. Patience is the whole plan.',
    map: [
      '################################',
      '#..........L....#########......#',
      '#..CC..........#....K....#..L..#',
      '#..CC....L.....#.........#.....#',
      '#..............#####.#####.....#',
      '#..L......TTT.......L......CC..#',
      '#.........TTT..............CC..#',
      '#.....SS..........SS...........#',
      '#..L..SS....L.....SS....L......#',
      '#.....SS..........SS.........L.#',
      '#..............................E',
      '#..CC......L..........TTT......#',
      '#..CC.................TTT......#',
      '#......SS......CC..............#',
      '#..L...SS......CC....L.....g...#',
      '#......SS......CC..............#',
      '#..........................L...#',
      '#..L......g....L...........CC..#',
      '#.P........................CC..#',
      '################################',
    ],
    guards: [
      { patrol: [[9, 4], [13, 4], [13, 8], [9, 8]] },
      { patrol: [[20, 6], [26, 6], [26, 10], [20, 10]] },
      { patrol: [[10, 13], [10, 17], [13, 17], [13, 13]] },
      { patrol: [[24, 13], [29, 13], [29, 17], [24, 17]] },
      { patrol: [[13, 2], [13, 9], [14, 9], [14, 2]] },
    ],
  },
];

// Tiles a body cannot walk through.
export const SOLID = new Set(['#', 'C', 'S', 'T', 'E']);
// Tiles that hide a crouched figure behind them: they block a guard's sight.
export const SIGHT_BLOCKERS = new Set(['#', 'C', 'S']);

export function tileAt(level, tx, ty) {
  if (tx < 0 || ty < 0 || ty >= level.map.length || tx >= level.map[ty].length) return '#';
  return level.map[ty][tx];
}

export function isSolid(level, tx, ty) {
  const t = tileAt(level, tx, ty);
  if (t === 'E') return !level.exitOpen;
  return SOLID.has(t);
}

export function blocksSight(level, tx, ty) {
  return SIGHT_BLOCKERS.has(tileAt(level, tx, ty));
}

// Find the single tile carrying a marker character ('P', 'K', 'E').
export function findTile(level, marker) {
  for (let y = 0; y < level.map.length; y++) {
    const x = level.map[y].indexOf(marker);
    if (x >= 0) return { x, y };
  }
  return { x: 1, y: 1 };
}

export function findAllTiles(level, marker) {
  const found = [];
  for (let y = 0; y < level.map.length; y++) {
    for (let x = 0; x < level.map[y].length; x++) {
      if (level.map[y][x] === marker) found.push({ x, y });
    }
  }
  return found;
}
