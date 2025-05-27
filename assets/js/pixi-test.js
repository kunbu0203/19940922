(async function () {
  const app = new PIXI.Application();
  await app.init({
    backgroundAlpha: 0,
    resizeTo: document.querySelector('#canvas-container'),
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true
  });
  document.querySelector('#canvas-container').appendChild(app.view);
  const container = new PIXI.Container();
  container.x = 0;
  container.y = 0;
  app.stage.addChild(container);
  const itemTexture = await PIXI.Assets.load(`./../assets/image/map1/game/original/coffee.png`);
  const item = new PIXI.Sprite(itemTexture);
  item.width = 180;
  item.height = 91;
  container.addChild(item);
  window.addEventListener('resize', () => {
    stageResize();
  });
  stageResize();
  function stageResize() {
    const canvasW = document.querySelector('#canvas-container').offsetWidth;
    app.stage.scale.set(canvasW / (1920 / 2));
  }
})();