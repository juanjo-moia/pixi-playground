import {
  Application,
  Container,
  Loader,
  ParticleContainer,
  Sprite,
  Texture,
} from 'pixi.js';
import { gsap } from 'gsap';

const WIDTH = 4096 / 4;
const HEIGHT = 4096 / 4;
const BG_COLOR = 0x1099bb;

const POLL_INTERVAL = 5000; // in milliseconds

const app = new Application({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: BG_COLOR,
  resolution: window.devicePixelRatio || 1,
  sharedLoader: true,
});

// We stop Pixi ticker using stop() function because autoStart = false does NOT stop the shared ticker:
// doc: http://pixijs.download/release/docs/PIXI.Application.html
app.ticker.stop();

// Now, we use 'tick' from gsap
gsap.ticker.add(() => {
  app.ticker.update();
});

document.body.appendChild(app.view);

// Scene
const resources: any = await new Promise((res) =>
  app.loader
    .add('bg_no_fire', 'assets/bg-no-fire.png')
    .add('bg_fire_medium', 'assets/bg-fire-medium.png')
    .add('bg_fire_max', 'assets/bg-fire-max.png')
    .add('rocket', 'assets/spritesheet.json')
    .add('star', 'assets/star.png')
    .load((_, r) => res(r)),
);

const scene = new Container();
app.stage.addChild(scene);

const nightBg = new Sprite(Texture.WHITE);
nightBg.tint = 0x02163b;
nightBg.width = WIDTH;
nightBg.height = HEIGHT;
scene.addChild(nightBg);

/** stars **/
const COUNT_STARS = 1000;
const starSprites = new ParticleContainer(COUNT_STARS, {
  uvs: true,
  alpha: true,
  scale: true,
  position: true,
});
starSprites.alpha = 0;
for (let i = 0; i < COUNT_STARS; i++) {
  const star = new Sprite(resources.star.texture);
  star.anchor.set(0.5);
  star.scale.set(Math.random() * 0.02);
  star.x = Math.random() * WIDTH;
  star.y = Math.random() * HEIGHT;
  star.alpha = Math.random();
  starSprites.addChild(star);
}
function fadeInStars(dt: number) {
  starSprites.alpha < 1 ? (starSprites.alpha += 0.003 * dt) : 1;
}
function twinkleStars(_: number) {
  for (const star of starSprites.children) {
    star.alpha = star.alpha > 0 ? star.alpha - 0.0002 : Math.random() + 0.01;
  }
}
scene.addChild(starSprites);

const skylineTexture = resources.bg_no_fire.texture;
const skyline = new Sprite(skylineTexture);
skyline.scale.set(WIDTH / skylineTexture.width);
skyline.y = WIDTH - skyline.height;
scene.addChild(skyline);

const GROUND_OFFSET = (skylineTexture.height - 1936) * skyline.scale.y;
const LAUNCH_POINT_X = 1700 * skyline.scale.x;

function launchRocket() {
  const rocket = new Sprite(resources.rocket.textures.off);
  app.stage.addChild(rocket);

  rocket.anchor.set(0.5);
  rocket.scale.set(0.25, 0.25);
  rocket.position.set(LAUNCH_POINT_X, HEIGHT - GROUND_OFFSET);

  const tl = gsap.timeline({ delay: 2 });
  tl.fromTo(
    rocket,
    { x: (_i, r) => r.x - 10, yoyo: true, repeat: -1, duration: 0.1 },
    { x: (_i, r) => r.x + 10, yoyo: true, repeat: -1, duration: 0.1 },
  );
  tl.to(
    rocket,
    { texture: resources.rocket.textures.on_air, duration: 0 },
    '+2',
  );
  tl.to(rocket, { y: -rocket.height, duration: 3 });
}

launchRocket();

app.ticker.add((dt) => {
  fadeInStars(dt);
  twinkleStars(dt);
});

setInterval(async () => {
  const res = await fetch('https://7am002ml7h.execute-api.eu-central-1.amazonaws.com/dev/repositories/484750723/stats');
  const text = await res.text()

  console.log(JSON.parse(text));
}, POLL_INTERVAL)
