import {
  Application,
  Container,
  ParticleContainer,
  Sprite,
  Texture,
  Text,
  TextStyle,
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

/** statsbox **/
const textContainer = new Container();
scene.addChild(textContainer);
const textHeadlineStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 12,
  fontWeight: 'bold',
  fill: ['#ffffff', '#ECBF66'], // gradient
  stroke: '#4a1850',
  strokeThickness: 2,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowDistance: 2,
  wordWrap: true,
  wordWrapWidth: 440,
  lineJoin: 'round',
});
const textHeadline = new Text('MOIA rockets launched');
textHeadline.x = 0;
textHeadline.y = 0;
textHeadline.style = textHeadlineStyle;

const textStatsStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 10,
  fill: ['#fff'],
});
const textSuccess = new Text('Success:');
textSuccess.x = 0;
textSuccess.y = 20;
textSuccess.style = textStatsStyle;
const textFailure = new Text('Failure:');
textFailure.x = 0;
textFailure.y = 35;
textFailure.style = textStatsStyle;

textContainer.addChild(textHeadline);
textContainer.addChild(textSuccess);
textContainer.addChild(textFailure);
textContainer.x = WIDTH - 300;
textContainer.y = 30;

const updateStatsText = ({
  success,
  failure,
}: {
  success: number;
  failure: number;
}) => {
  textSuccess.text = `Success: ${success}`;
  textFailure.text = `Failure: ${failure}`;
};

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

const LAUNCH_POINT_Y = (skylineTexture.height - 1936) * skyline.scale.y;
const LAUNCH_POINT_X = 1700 * skyline.scale.x;

const rocket = new Sprite(resources.rocket.textures.off);
rocket.anchor.set(0.5);
rocket.scale = skyline.scale;

app.stage.addChild(rocket);

function rocketReady() {
  rocket.position.set(LAUNCH_POINT_X, HEIGHT - LAUNCH_POINT_Y);
  rocket.texture = resources.rocket.textures.off;
  skyline.texture = resources.bg_no_fire.texture;
}

function rocketFiring() {
  const tl = gsap.timeline();
  tl.to(rocket, { texture: resources.rocket.textures.on_ground, duration: 0 });
  tl.to(skyline, {
    texture: resources.bg_fire_medium.texture,
    duration: 0,
  });
  tl.fromTo(
    rocket,
    { x: (_i, r) => r.x - 10, yoyo: true, repeat: -1, duration: 0.1 },
    { x: (_i, r) => r.x + 10, yoyo: true, repeat: -1, duration: 0.1 },
  );
}

function rocketLaunch() {
  const tl = gsap.timeline();
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchSequence() {
  rocketReady();
  await sleep(2000);
  rocketFiring();
  await sleep(2000);
  rocketLaunch();
}

let lastLaunchStatus: any = null

const fetchLastStatusAndUpdate = async () => {
  const res = await fetch('https://7am002ml7h.execute-api.eu-central-1.amazonaws.com/dev/events')
  const result = JSON.parse(await res.text())
  const events = result.events
  events.sort((a: any, b: any) => a.statusAt > b.statusAt)

  const lastEvent = events[0]
  const lastStatus = lastEvent.status

  if (lastLaunchStatus != lastStatus) {
    if (lastStatus == 'PENDING') {
      rocketReady()
    } else if (lastStatus == 'SUCCESS') {
      launchSequence()
    } else {
      // tipped over...
    }
    lastLaunchStatus = lastStatus
  }
}

const getStats = async () => {
  const res = await fetch(
    'https://7am002ml7h.execute-api.eu-central-1.amazonaws.com/dev/repositories/484750723/stats',
  );
  const data = await res.json();
  updateStatsText(data);
};

const initInterval = () =>
  setInterval(async () => {
    fetchLastStatusAndUpdate();
    getStats();
  }, POLL_INTERVAL);

const initPixiWorld = () => {
  app.ticker.add((dt) => {
    fadeInStars(dt);
    twinkleStars(dt);
  });

  rocketReady();

  // setTimeout(launchSequence, 1000);
  // setInterval(launchSequence, 12000);

  getStats();
  initInterval();
};

initPixiWorld();
