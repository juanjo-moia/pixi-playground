import {
  Application,
  Container,
  Loader,
  ParticleContainer,
  Sprite,
  Texture,
  Text,
  TextStyle
} from 'pixi.js';

const WIDTH = 4096 / 4;
const HEIGHT = 4096 / 4;
const BG_COLOR = 0x1099bb;

const app = new Application({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: BG_COLOR,
  resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

// Scene
const resources: any = await new Promise((res) =>
  Loader.shared
    .add('bg_no_fire', 'assets/bg-no-fire.png')
    .add('bg_fire_medium', 'assets/bg-fire-medium.png')
    .add('bg_fire_max', 'assets/bg-fire-max.png')
    .add('rocket', 'assets/rocket-off.png')
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

/** statsbox **/
const textContainer = new Container();
scene.addChild(textContainer)
const textHeadline = new Text('MOIA rocktes launched');
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
textHeadline.x = 0;
textHeadline.y = 0;
textHeadline.style = textHeadlineStyle;

const textSuccess = new Text('Success:');
const textSuccessStyle = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 12,
  fill: ['#fff']
})
textSuccess.x = 0;
textSuccess.y = 20;
textSuccess.style = textSuccessStyle;

textContainer.addChild(textHeadline);
textContainer.addChild(textSuccess);
textContainer.x = WIDTH - 300;
textContainer.y = 30;

const updateStatsText = (numberOfSuccess = 0) => {
  textSuccess.text = `Success: ${numberOfSuccess}`
}

updateStatsText(1)

/** rocket */
const rocket = new Sprite(resources.rocket.texture);
const ROCKET_SPEED = 1;
app.stage.addChild(rocket);
rocket.width = 64;
rocket.height = 128;
rocket.position.set(WIDTH / 2 - rocket.width / 2, HEIGHT + rocket.height);

function flyRocket(dt: number) {
  const x2 = rocket.position.x;
  const y2 = rocket.position.y - ROCKET_SPEED * dt;
  rocket.position.set(x2, y2);
}

app.ticker.add((dt) => {
  flyRocket(dt);
  fadeInStars(dt);
  twinkleStars(dt);
});
