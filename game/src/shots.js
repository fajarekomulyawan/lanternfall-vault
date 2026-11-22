// shots.js — frozen scenes for the screenshots in shots.json.
// Each scene loads a real floor, walks the actors to a telling moment and
// stops: the cover shows the title over Floor I, play shows a warden's
// cone biting around the Reading Room shelves while Wren waits in cover,
// alarm shows the eye nearly full with a chase on, and win shows the end.

export function applyShot(loadFloor, name, seed) {
  void seed;
  if (name === 'play') {
    const game = loadFloor(1);
    game.state = 'playing';
    game.time = 1.4;
    game.player.x = 500;
    game.player.y = 300;
    game.player.angle = 0.3;
    game.player.sneaking = true;
    const spots = [
      { x: 350, y: 220, angle: 0.4 },
      { x: 860, y: 280, angle: 2.6 },
      { x: 700, y: 560, angle: -1.2 },
      { x: 320, y: 620, angle: 0.5 },
    ];
    game.guards.forEach((g, i) => {
      const s = spots[i % spots.length];
      g.x = s.x;
      g.y = s.y;
      g.angle = s.angle;
      g.state = 'patrol';
    });
    game.guards[0].state = 'pause'; // sweeping his lantern, cone wide on the shelves
    game.detection = 0.22;
    game.score = 450;
    game.gemsCollected = 1;
    return game;
  }
  if (name === 'alarm') {
    const game = loadFloor(0);
    game.state = 'playing';
    game.time = 2.1;
    game.player.x = 716;
    game.player.y = 380;
    game.player.angle = 2.8;
    game.hasKey = true;
    game.level.exitOpen = true;
    const lead = game.guards[0];
    lead.x = 640;
    lead.y = 380;
    lead.angle = 0;
    lead.state = 'chase';
    lead.gaze = 0.9;
    game.guards[1].x = 800;
    game.guards[1].y = 240;
    game.guards[1].angle = 2.4;
    game.detection = 0.85;
    game.everChased = true;
    game.score = 750;
    game.gemsCollected = 2;
    return game;
  }
  if (name === 'win') {
    const game = loadFloor(2);
    game.state = 'won';
    game.time = 1;
    game.score = 3150;
    game.gemsCollected = 7;
    game.hasKey = true;
    game.level.exitOpen = true;
    return game;
  }
  // 'start' and anything else: the title over the first floor
  const game = loadFloor(0);
  game.state = 'title';
  game.time = 1;
  game.guards[0].angle = 0.5;
  game.guards[1].angle = -0.6;
  return game;
}
