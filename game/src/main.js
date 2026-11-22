// main.js — Lanternfall Vault: the loop that ties the floors together.
// Detection is the heart of it: a guard's gaze fills the eye at a rate set
// by distance, stance and lamplight; break his sight and it drains again,
// so a near miss is a scare you can recover from, not a fail state.

import { TILE, DETECTION, SCORE } from './config.js';
import { LEVELS, findTile, findAllTiles } from './levels.js';
import { createGuard, updateGuard } from './guards.js';
import { createPlayer, updatePlayer, noiseRadius } from './player.js';
import { createInput } from './input.js';
import { inLamplight } from './vision.js';
import { drawGame } from './render.js';
import { sound } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const params = new URLSearchParams(window.location.search);
const shotMode = params.get('shot');

function loadFloor(index) {
  const level = { ...LEVELS[index], exitOpen: false };
  const start = findTile(level, 'P');
  const game = {
    level,
    levelIndex: index,
    player: createPlayer(level, start),
    guards: [],
    hasKey: false,
    gemsTaken: new Set(),
    gemsCollected: 0,
    gemTiles: findAllTiles(level, 'g'),
    keyTile: findTile(level, 'K'),
    exitTile: findTile(level, 'E'),
    detection: 0,
    everChased: false,
    pebbleTimer: 0,
    time: 0,
    state: 'playing',
    score: 0,
  };
  game.guards = level.guards.map((spec, i) => {
    const g = createGuard(level, spec, i);
    g.levelRef = level;
    return g;
  });
  return game;
}

let game = loadFloor(0);
game.state = 'title';
let carriedScore = 0;
let carriedGems = 0;

function tileDistance(a, bx, by) {
  return Math.hypot(a.x - bx, a.y - by);
}

function centreOf(tile) {
  return { x: tile.x * TILE + TILE / 2, y: tile.y * TILE + TILE / 2 };
}

function onCaught() {
  if (game.state !== 'playing') return;
  game.state = 'caught';
  sound.caught();
}

function update(dt) {
  game.time += dt;
  if (game.state !== 'playing') {
    if (input.confirm) {
      input.confirm = false;
      if (game.state === 'title') {
        game = loadFloor(0);
        carriedScore = 0;
        carriedGems = 0;
      } else if (game.state === 'caught') {
        game = loadFloor(game.levelIndex);
        game.score = carriedScore;
        game.gemsCollected = carriedGems;
      } else if (game.state === 'floor-clear') {
        const next = game.levelIndex + 1;
        if (next >= LEVELS.length) {
          game.state = 'won';
        } else {
          carriedScore = game.score;
          carriedGems = game.gemsCollected;
          const keepScore = game.score;
          const keepGems = game.gemsCollected;
          game = loadFloor(next);
          game.score = keepScore;
          game.gemsCollected = keepGems;
        }
      } else if (game.state === 'won') {
        game = loadFloor(0);
        carriedScore = 0;
        carriedGems = 0;
        game.state = 'title';
      }
    }
    return;
  }

  if (input.restart) {
    input.restart = false;
    const keepScore = carriedScore;
    const keepGems = carriedGems;
    game = loadFloor(game.levelIndex);
    game.score = keepScore;
    game.gemsCollected = keepGems;
    return;
  }

  const prevStep = Math.floor(game.player.stepPhase);
  updatePlayer(game.level, game.player, input, dt);
  if (Math.floor(game.player.stepPhase) !== prevStep && game.player.moving) {
    sound.step(game.player.sneaking);
  }

  // The pebble clatters for one instant, then just lies there a while.
  let pebbleAt = null;
  if (game.player.pebble && game.player.pebble.fresh) {
    pebbleAt = { x: game.player.pebble.x, y: game.player.pebble.y };
    game.player.pebble.fresh = false;
    game.pebbleTimer = 3.2;
    sound.pebble();
  }
  if (game.pebbleTimer > 0) {
    game.pebbleTimer -= dt;
    if (game.pebbleTimer <= 0) game.player.pebble = null;
  }

  const noise = noiseRadius(game.player);
  let strongestGaze = 0;
  for (const guard of game.guards) {
    const distToPlayer = tileDistance(guard, game.player.x, game.player.y);
    const heardAt = noise > 0 && distToPlayer < noise + 26 ? { x: game.player.x, y: game.player.y } : null;
    const lure = pebbleAt && distToPlayer < 300 ? pebbleAt : null;
    updateGuard(game.level, guard, dt, { player: game.player, heardAt, pebbleAt: lure }, onCaught);
    strongestGaze = Math.max(strongestGaze, guard.gaze);
    if (guard.state === 'chase') game.everChased = true;
  }

  // Detection: fill under a gaze, drain in the dark.
  if (strongestGaze > 0) {
    let rate = DETECTION.fillPerSecondFar + strongestGaze * (DETECTION.fillPerSecondClose - DETECTION.fillPerSecondFar);
    if (game.player.sneaking) rate *= DETECTION.sneakMultiplier;
    rate *= inLamplight(game.level, game.player.x, game.player.y)
      ? DETECTION.lightMultiplier
      : DETECTION.shadowMultiplier + 0.4;
    game.detection = Math.min(1, game.detection + rate * dt);
    if (game.detection >= DETECTION.alarmAt) onCaught();
  } else {
    game.detection = Math.max(0, game.detection - DETECTION.decayPerSecond * dt);
  }

  // Pickups: the key, then the gems.
  const keyCentre = centreOf(game.keyTile);
  if (!game.hasKey && tileDistance(game.player, keyCentre.x, keyCentre.y) < 26) {
    game.hasKey = true;
    game.level.exitOpen = true;
    sound.pickup();
    setTimeout(() => sound.door(), 140);
  }
  for (const gem of game.gemTiles) {
    const key = gem.x + ',' + gem.y;
    if (game.gemsTaken.has(key)) continue;
    const c = centreOf(gem);
    if (tileDistance(game.player, c.x, c.y) < 24) {
      game.gemsTaken.add(key);
      game.gemsCollected += 1;
      game.score += SCORE.gem;
      sound.pickup();
    }
  }

  // The exit only counts once it stands open under your feet.
  if (game.hasKey) {
    const exit = centreOf(game.exitTile);
    if (tileDistance(game.player, exit.x, exit.y) < 30) {
      game.score += SCORE.levelBase + (game.everChased ? 0 : SCORE.unseenBonus);
      game.state = game.levelIndex + 1 >= LEVELS.length ? 'won' : 'floor-clear';
      sound.door();
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (!shotMode) update(dt);
  drawGame(ctx, game);
  requestAnimationFrame(frame);
}

if (shotMode) {
  game = applyShot(loadFloor, shotMode, params.get('seed'));
  // let the first frames settle, then tell the screenshot harness we are ready
  setTimeout(() => {
    drawGame(ctx, game);
    window.__shotReady = shotMode;
  }, 350);
}
requestAnimationFrame(frame);
