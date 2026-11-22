// config.js — Lanternfall Vault: every shared tuning constant in one place.
// The whole game is drawn on a fixed 1280x800 stage made of 40 px tiles,
// so screenshots, physics and patrols all agree on the same geometry.

export const TILE = 40;
export const COLS = 32;
export const ROWS = 20;
export const WIDTH = COLS * TILE; // 1280
export const HEIGHT = ROWS * TILE; // 800

export const PLAYER = {
  radius: 13,
  walkSpeed: 148, // px per second on foot
  sneakSpeed: 74, // crouched: half speed, far harder to spot
  noiseWalk: 54, // guards hear running feet inside this radius
  noiseSneak: 10, // sneaking is almost silent
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 62,
  chaseSpeed: 128,
  investigateSpeed: 96,
  visionRange: 196,
  visionHalfAngle: 0.56, // ~32 degrees either side of facing
  pauseSeconds: 1.6, // guards stop and sweep at each waypoint
  loseSightSeconds: 2.4, // how long a chase remembers the player
};

export const DETECTION = {
  fillPerSecondClose: 1.15, // point blank in lamplight fills the eye fast
  fillPerSecondFar: 0.34, // edge of the cone fills it slowly
  sneakMultiplier: 0.45, // crouching in shadow is strong
  lightMultiplier: 1.45, // standing in a lamp pool is dangerous
  shadowMultiplier: 0.6, // plain dark floor hides you a little
  decayPerSecond: 0.38, // break line of sight and the eye empties
  alarmAt: 1, // full eye means caught
};

export const PEBBLE = {
  cooldownSeconds: 2.5,
  lureSeconds: 3.2, // a guard studies the clatter this long
  throwRange: 230,
};

export const SCORE = {
  gem: 150,
  unseenBonus: 500, // finish a level never fully spotted
  levelBase: 300,
};
