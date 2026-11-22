// vision.js — line of sight, vision cones and lamplight.
// A guard sees the player only when three things line up: the player is
// inside the cone's angle, inside its range, and no wall, crate or shelf
// stands between them. Low tables never block sight — that is their point.

import { TILE, GUARD } from './config.js';
import { blocksSight } from './levels.js';

export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// March from (x0, y0) to (x1, y1) in small steps; true when the way is clear.
export function hasLineOfSight(level, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 6));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const tx = Math.floor((x0 + dx * t) / TILE);
    const ty = Math.floor((y0 + dy * t) / TILE);
    if (blocksSight(level, tx, ty)) return false;
  }
  return true;
}

// How strongly one guard's gaze falls on the player right now:
// 0 = unseen, 1 = point blank in the middle of the cone.
export function gazeStrength(level, guard, player) {
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > GUARD.visionRange) return 0;
  const ang = Math.atan2(dy, dx);
  const off = Math.abs(angleDifference(ang, guard.angle));
  if (off > GUARD.visionHalfAngle) return 0;
  if (!hasLineOfSight(level, guard.x, guard.y, player.x, player.y)) return 0;
  const near = 1 - dist / GUARD.visionRange; // 0 at the rim, 1 at the guard
  const centred = 1 - off / GUARD.visionHalfAngle;
  return Math.min(1, 0.25 + near * 0.9 + centred * 0.25);
}

// The polygon a vision cone actually covers once walls bite chunks out of
// it: one ray per few degrees, each stopped at the first sight blocker.
export function conePolygon(level, guard) {
  const points = [[guard.x, guard.y]];
  const rays = 26;
  for (let i = 0; i <= rays; i++) {
    const a = guard.angle - GUARD.visionHalfAngle + (i / rays) * GUARD.visionHalfAngle * 2;
    points.push(rayEnd(level, guard.x, guard.y, a, GUARD.visionRange));
  }
  return points;
}

export function rayEnd(level, x, y, angle, range) {
  const step = 5;
  let last = [x, y];
  for (let d = step; d <= range; d += step) {
    const px = x + Math.cos(angle) * d;
    const py = y + Math.sin(angle) * d;
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (blocksSight(level, tx, ty)) {
      // stop at the blocker's face, a step back from the last clear point
      return last;
    }
    last = [px, py];
  }
  return [x + Math.cos(angle) * range, y + Math.sin(angle) * range];
}

// Is a world position standing in one of the level's lamp pools?
export function inLamplight(level, x, y) {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  return level.map[ty] && level.map[ty][tx] === 'L';
}
