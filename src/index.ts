import { Application, Sprite } from 'pixi.js';

const WIDTH = 400;
const HEIGHT = 300;
const BG_COLOR = 0x1099bb;

const app = new Application({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: BG_COLOR,
  resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const rocket = Sprite.from('assets/rocket.png');
app.stage.addChild(rocket);
rocket.position.set(WIDTH / 2 - rocket.width / 2, HEIGHT + rocket.height);
rocket.width = 32;
rocket.height = 64;

const ROCKET_SPEED = 1;
app.ticker.add((dt) => {
  const x2 = rocket.position.x;
  const y2 = rocket.position.y - ROCKET_SPEED * dt;
  rocket.position.set(x2, y2);
});
