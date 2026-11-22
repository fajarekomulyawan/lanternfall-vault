// player.js — Wren, the courier: walking, sneaking and the pebble trick.
// Hold Shift (or C) to crouch and move quietly. Press Space to toss a
// pebble toward the mouse: its clatter pulls one guard off his patrol.

import { TILE, PLAYER, PEBBLE } from './config.js';
import { moveBody } from './guards.js';

export function createPlayer(level, startTile) {
  return {
    x: startTile.x * TILE + TILE / 2,
    y: startTile.y * TILE + TILE / 2,
    angle: -Math.PI / 2,
    sneaking: false,
    moving: false,
    stepPhase: 0,
    pebbleCooldown: 0,
    pebble: null, // { x, y, landedAt } while a thrown pebble is live
  };
}

export function updatePlayer(level, player, input, dt) {
  player.sneaking = input.sneak;
  let dx = 0;
  let dy = 0;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  player.moving = dx !== 0 || dy !== 0;
  if (player.moving) {
    const len = Math.hypot(dx, dy);
    const speed = player.sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
    const mx = (dx / len) * speed * dt;
    const my = (dy / len) * speed * dt;
    moveBody(level, player, mx, my, PLAYER.radius);
    player.angle = Math.atan2(dy, dx);
    player.stepPhase += dt * (player.sneaking ? 5 : 9);
  }
  player.pebbleCooldown = Math.max(0, player.pebbleCooldown - dt);

  // The pebble: thrown at the mouse point, clatters once on landing.
  if (input.throwPebble && player.pebbleCooldown <= 0) {
    const tx = input.mouse.x;
    const ty = input.mouse.y;
    const d = Math.hypot(tx - player.x, ty - player.y);
    const reach = Math.min(d, PEBBLE.throwRange);
    const a = Math.atan2(ty - player.y, tx - player.x);
    player.pebble = {
      x: player.x + Math.cos(a) * reach,
      y: player.y + Math.sin(a) * reach,
      fresh: true, // guards react on the first frame they could hear it
    };
    player.pebbleCooldown = PEBBLE.cooldownSeconds;
    input.throwPebble = false;
  }
}

// How far a guard can hear this player's feet right now.
export function noiseRadius(player) {
  if (!player.moving) return 0;
  return player.sneaking ? PLAYER.noiseSneak : PLAYER.noiseWalk;
}
