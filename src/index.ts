import {
  Application,
  Container,
  ParticleContainer,
  Sprite,
  Texture,
  Text,
  TextStyle,
  Graphics,
} from 'pixi.js';
import * as PIXI from 'pixi.js'
import { gsap } from 'gsap';

import { PixiPlugin } from "gsap/PixiPlugin";

// register the plugin
gsap.registerPlugin(PixiPlugin);

// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

const POLL_INTERVAL = 5000; // in milliseconds
const BG_COLOR = 0x1099bb;

const appWidth = window.innerWidth  / window.devicePixelRatio;
const appHeight = window.innerHeight / window.devicePixelRatio;

const app = new Application({
  width: appWidth,
  height: appHeight,
  sharedLoader: true,
  backgroundColor: BG_COLOR,
  resolution: window.devicePixelRatio || 1,
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
nightBg.width = app.screen.width;
nightBg.height = app.screen.height;
scene.addChild(nightBg);

/** statsbox **/
const textContainer = new Container();
scene.addChild(textContainer);
const textHeadlineStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 12,
  fontWeight: 'bold',
  fill: ['#ffffff', '#ECBF66'],
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
  fill: ['#ECBF66'],
  dropShadow: true,
  dropShadowBlur: 2,
  dropShadowColor: '#000000',
})
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
textContainer.x = appWidth - 200;
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
  star.x = Math.random() * appWidth;
  star.y = Math.random() * appHeight;
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

//skyline
const skylineTexture = resources.bg_no_fire.texture;
const skyline = new Sprite(skylineTexture);
skyline.scale.set(appWidth / skylineTexture.width);
skyline.y = appHeight - skyline.height;
scene.addChild(skyline);

//easter egg area
const hitArea = new Graphics();
hitArea.interactive = true;
hitArea.beginFill(0xff0000);
hitArea.drawCircle(0, 0, 20);
hitArea.alpha = 0;
hitArea.x = 425;
hitArea.y = 245;
app.stage.addChild(hitArea);

const nightBgAnim = gsap
  .timeline({ paused: true, defaults: {duration: 0.1} })
  .to(nightBg, {pixi: { hue: 280}})
  .to(nightBg, {pixi: { brightness: 3}})
  .to(nightBg, {pixi: { colorize:"red"}})
  .to(nightBg, {pixi: { colorMatrixFilter: undefined}}
  );
const skyLineAnim = gsap
.timeline({ paused: true, defaults: {duration: 0.2} })
.to(skyline, {pixi: {x: 0.5}})
.to(skyline, {pixi: {x: -0.5}});

//earth (and moon) quake
hitArea.on('pointerdown', (_) => {
  nightBgAnim.restart();
  nightBgAnim.yoyo(true).repeat(10).play()
  skyLineAnim.restart();
  skyLineAnim.yoyo(true).repeat(10).play();
})

//rocket
const LAUNCH_POINT_Y =
  appHeight - (skylineTexture.height - 1936) * skyline.scale.y;
const LAUNCH_POINT_X = 1700 * skyline.scale.x;

const rocket = new Sprite(resources.rocket.textures.off);
rocket.anchor.set(0.5);
rocket.scale = skyline.scale;
rocket.position.set(LAUNCH_POINT_X, LAUNCH_POINT_Y);
const rocketShakeTimeline = gsap
  .timeline({ paused: true })
  .fromTo(
    rocket,
    { x: (_i, r) => r.x - 10, yoyo: true, repeat: -1, duration: 0.1 },
    { x: (_i, r) => r.x + 10, yoyo: true, repeat: -1, duration: 0.1 },
  );
const rocketLaunchTimeline = gsap
  .timeline({ paused: true })
  .to(rocket, {
    x: LAUNCH_POINT_X,
    y: LAUNCH_POINT_Y,
    texture: resources.rocket.textures.on_ground,
    duration: 0,
  })
  .to(skyline, { texture: resources.bg_fire_medium.texture, duration: 0 })
  .to(rocket, { y: LAUNCH_POINT_Y, duration: 0.5 })
  .to(skyline, { texture: resources.bg_fire_max.texture, duration: 0 })
  .to(rocket, { texture: resources.rocket.textures.on_air, duration: 0 })
  .to(rocket, { y: -rocket.height, duration: 3 })
  .to(skyline, { texture: resources.bg_fire_medium.texture, duration: 0 }, 0.6)
  .to(skyline, { texture: resources.bg_no_fire.texture, duration: 0 }, 0.7);
app.stage.addChild(rocket);

function rocketReady() {
  rocketShakeTimeline.pause();
  rocketShakeTimeline.seek(0);
  rocketLaunchTimeline.pause();
  rocketLaunchTimeline.seek(0);
  rocket.texture = resources.rocket.textures.off;
  skyline.texture = resources.bg_no_fire.texture;
}

function rocketFiring() {
  rocketShakeTimeline.play();
  rocketLaunchTimeline.seek(0.4);
}

function rocketLaunch() {
  rocketShakeTimeline.play();
  rocketLaunchTimeline.play();
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

  const lastEvent = events[events.length - 1]
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
