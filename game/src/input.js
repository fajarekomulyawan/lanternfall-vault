// input.js — keyboard and mouse, gathered once and read everywhere.
// WASD / arrows move, Shift or C sneaks, Space throws a pebble at the
// mouse, R restarts the floor, Enter starts and advances.

export function createInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    throwPebble: false,
    restart: false,
    confirm: false,
    mouse: { x: 640, y: 400 },
  };
  const down = (e, value) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') input.up = value;
    else if (k === 's' || k === 'arrowdown') input.down = value;
    else if (k === 'a' || k === 'arrowleft') input.left = value;
    else if (k === 'd' || k === 'arrowright') input.right = value;
    else if (k === 'shift' || k === 'c') input.sneak = value;
    else if (k === ' ' && value) {
      input.throwPebble = true;
      e.preventDefault();
    } else if (k === 'r' && value) input.restart = true;
    else if (k === 'enter' && value) input.confirm = true;
    if (k.startsWith('arrow') || k === ' ') e.preventDefault();
  };
  window.addEventListener('keydown', (e) => down(e, true));
  window.addEventListener('keyup', (e) => down(e, false));
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    input.mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
    input.mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
  });
  canvas.addEventListener('mousedown', () => {
    input.throwPebble = true;
  });
  return input;
}
