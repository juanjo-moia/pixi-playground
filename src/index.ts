import { Application, Container, ParticleContainer, Sprite, Texture } from 'pixi.js';

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

/** background **/
const bgContainer = new Container();
app.stage.addChild(bgContainer);

const dayBg = new Sprite(Texture.WHITE);
dayBg.tint = 0x03a9f4;
bgContainer.addChild(dayBg)

const nightBg = new Sprite(Texture.WHITE);
nightBg.tint = 0x02163b;
nightBg.alpha = 0;
bgContainer.addChild(nightBg)

bgContainer.width = dayBg.width = nightBg.width = WIDTH;
bgContainer.height = dayBg.height = nightBg.height = HEIGHT;

/** stars **/
const COUNT_STARS = 1000;
const starSprites = new ParticleContainer(COUNT_STARS, {
  uvs: true,
  alpha: true,
  scale: true,
  position: true,
});
starSprites.alpha = 0;
app.stage.addChild(starSprites);

const stars = [];

for (let i = 0; i < COUNT_STARS; i++) {
  const star = Sprite.from('/assets/star.png');
  star.anchor.set(0.5);
  star.scale.set(Math.random() * 0.02);
  star.x = Math.random() * WIDTH;
  star.y = Math.random() * HEIGHT;
  star.alpha = Math.random();
  stars.push(star);
  starSprites.addChild(star)
}

/** rocket */
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

  nightBg.alpha += 0.003 * dt;
  starSprites.alpha += 0.003 * dt;
});
