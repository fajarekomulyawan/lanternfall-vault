// guards.js — the Lantern Wardens: patrol, pause, investigate, chase.
// Each guard walks a loop of waypoints, stops at each one to sweep his
// lantern across the room, hurries to anything that clatters or catches
// his eye, and gives chase while he can still see his quarry.

import { TILE, GUARD } from './config.js';
import { isSolid } from './levels.js';
import { angleDifference, gazeStrength } from './vision.js';

export function createGuard(level, spec, index) {
  const [sx, sy] = spec.patrol[0];
  return {
    x: sx * TILE + TILE / 2,
    y: sy * TILE + TILE / 2,
    angle: index * 1.7, // varied starting facings
    patrol: spec.patrol.map(([tx, ty]) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 })),
    waypoint: 1 % spec.patrol.length,
    state: 'patrol', // patrol | pause | investigate | chase | stunned-look
    pauseLeft: 0,
    sweepBase: 0,
    investigateTarget: null,
    investigateLeft: 0,
    memoryLeft: 0, // chase memory after losing sight
    lastSeen: null,
    gaze: 0, // how strongly this guard sees the player, set every frame
    stepPhase: Math.random() * 6,
  };
}

// Slide a round body along x then y, stopping at solid tiles.
export function moveBody(level, body, dx, dy, radius) {
  const tryAxis = (nx, ny) => {
    const corners = [
      [nx - radius, ny - radius],
      [nx + radius, ny - radius],
      [nx - radius, ny + radius],
      [nx + radius, ny + radius],
    ];
    for (const [cx, cy] of corners) {
      if (isSolid(level, Math.floor(cx / TILE), Math.floor(cy / TILE))) return false;
    }
    return true;
  };
  if (tryAxis(body.x + dx, body.y)) body.x += dx;
  if (tryAxis(body.x, body.y + dy)) body.y += dy;
}

function walkToward(level, guard, target, speed, dt) {
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return true;
  const want = Math.atan2(dy, dx);
  guard.angle += clampTurn(angleDifference(want, guard.angle), dt * 6);
  const step = Math.min(dist, speed * dt);
  moveBody(level, guard, Math.cos(guard.angle) * step, Math.sin(guard.angle) * step, GUARD.radius);
  guard.stepPhase += dt * speed * 0.09;
  return dist < 14;
}

function clampTurn(v, max) {
  return Math.max(-max, Math.min(max, v));
}

// One frame of one guard. `stimulus` carries what the world is shouting:
// { player, heardAt: {x,y}|null, pebbleAt: {x,y}|null }
export function updateGuard(level, guard, dt, stimulus, onCatch) {
  guard.gaze = gazeStrength(level, guard, stimulus.player);

  if (guard.gaze > 0.55) {
    guard.state = 'chase';
    guard.memoryLeft = GUARD.loseSightSeconds;
    guard.lastSeen = { x: stimulus.player.x, y: stimulus.player.y };
  } else if (guard.state !== 'chase' && stimulus.pebbleAt) {
    guard.state = 'investigate';
    guard.investigateTarget = stimulus.pebbleAt;
    guard.investigateLeft = 0; // walk there first, then look around
  } else if (guard.state !== 'chase' && stimulus.heardAt && guard.state !== 'investigate') {
    guard.state = 'investigate';
    guard.investigateTarget = stimulus.heardAt;
    guard.investigateLeft = 0;
  }

  switch (guard.state) {
    case 'patrol': {
      const target = guard.patrol[guard.waypoint];
      if (walkToward(level, guard, target, GUARD.patrolSpeed, dt)) {
        guard.state = 'pause';
        guard.pauseLeft = GUARD.pauseSeconds;
        guard.sweepBase = guard.angle;
      }
      break;
    }
    case 'pause': {
      guard.pauseLeft -= dt;
      // sweep the lantern left and right while standing still
      const t = 1 - guard.pauseLeft / GUARD.pauseSeconds;
      guard.angle = guard.sweepBase + Math.sin(t * Math.PI * 2) * 0.7;
      if (guard.pauseLeft <= 0) {
        guard.state = 'patrol';
        guard.waypoint = (guard.waypoint + 1) % guard.patrol.length;
      }
      break;
    }
    case 'investigate': {
      if (guard.investigateLeft > 0) {
        guard.investigateLeft -= dt;
        guard.angle += Math.sin(guard.investigateLeft * 5) * dt * 1.4; // look about
        if (guard.investigateLeft <= 0) guard.state = 'patrol';
      } else if (guard.investigateTarget && walkToward(level, guard, guard.investigateTarget, GUARD.investigateSpeed, dt)) {
        guard.investigateLeft = 1.6;
      }
      break;
    }
    case 'chase': {
      const target = guard.gaze > 0 ? stimulus.player : guard.lastSeen;
      if (target) walkToward(level, guard, target, GUARD.chaseSpeed, dt);
      if (guard.gaze === 0) {
        guard.memoryLeft -= dt;
        if (guard.memoryLeft <= 0) {
          guard.state = 'investigate';
          guard.investigateTarget = guard.lastSeen;
          guard.investigateLeft = 0;
        }
      } else {
        guard.memoryLeft = GUARD.loseSightSeconds;
        guard.lastSeen = { x: stimulus.player.x, y: stimulus.player.y };
      }
      const d = Math.hypot(guard.x - stimulus.player.x, guard.y - stimulus.player.y);
      if (d < GUARD.radius + 14) onCatch(guard);
      break;
    }
    default:
      guard.state = 'patrol';
  }
}
