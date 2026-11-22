// audio.js — small procedural sounds, made with oscillators, no files.
// A soft tick for footsteps, a glassy clink for the pebble, a low sting
// when the alarm fills. Browsers require a first gesture, so the context
// wakes lazily and stays silent in screenshot mode.

let ctx = null;

function wake() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq, seconds, gain, type = 'sine', slideTo = null) {
  const ac = wake();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + seconds);
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + seconds);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + seconds);
}

export const sound = {
  step(sneaking) {
    blip(sneaking ? 220 : 160, 0.05, sneaking ? 0.015 : 0.03, 'triangle');
  },
  pebble() {
    blip(1900, 0.09, 0.05, 'sine', 900);
    setTimeout(() => blip(2400, 0.07, 0.04, 'sine', 1200), 60);
  },
  pickup() {
    blip(660, 0.12, 0.05, 'sine', 990);
  },
  alarm() {
    blip(196, 0.5, 0.09, 'sawtooth', 98);
    blip(147, 0.6, 0.09, 'sawtooth', 73);
  },
  door() {
    blip(392, 0.25, 0.05, 'sine', 523);
  },
  caught() {
    blip(110, 0.7, 0.1, 'sawtooth', 55);
  },
};
