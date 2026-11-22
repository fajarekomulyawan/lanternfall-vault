# lanternfall-vault

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/fajarekomulyawan/lanternfall-vault/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/fajarekomulyawan/lanternfall-vault/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

**Lanternfall Vault** — an original top-down stealth game for the desktop browser. You are Wren, a courier with quiet feet, slipping through three floors of a lantern-lit vault: steal each floor's Ember Key and reach the exit unseen. Lantern Wardens patrol set routes and pause to sweep their light; their vision cones are real raycasts, so walls, crates and shelves bite true shadows into the light, while low reading tables hide your body but not your head. Standing in a lamp pool makes you easy to spot; crouching in the dark makes you nearly a rumour. A detection eye fills under a warden's gaze and drains when you break his sight, so a near miss is a scare you can recover from. Toss a pebble to pull a warden off his route, mind your footsteps — running is loud — and collect moonstone gems on the way out. Plain static files and vanilla JavaScript modules: no library, no build step, no network, every sound synthesised live in WebAudio.

- **Move** with WASD or the arrow keys
- **Sneak** with Shift or C: slower and quieter, and far harder to see
- **Throw a pebble** with Space or a mouse click: its clatter lures a warden to investigate
- Three handcrafted floors — the Outer Gallery, the Reading Room and the Ember Vault — with 3, 4 and 5 wardens
- Patrols you can learn, a detection meter that forgives, and an unseen bonus for a clean floor

## Run it

```sh
python3 -m http.server 8080 --directory game   # then open http://localhost:8080 in desktop Chrome
node main.ts                                    # or hand the game in: copies game/ + screenshots/ to /output and writes dossier.json
```

The source is split by job: `game/src/config.js` (tuning), `levels.js` (the three floors as tile maps), `vision.js` (raycast line of sight, cones and lamplight), `guards.js` (patrol, investigate and chase), `player.js` (movement, sneaking and the pebble), `input.js` (keyboard/mouse), `audio.js` (synth sound), `render.js` (every pixel and the HUD), `shots.js` (deterministic screenshot scenes) and `main.js` (detection and the game loop).

---

<sub>Entered on [make.fun](https://make.fun/?ref=cxst033q&utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
