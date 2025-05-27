(async function () {
  // 取得隨機目標數量(1-2個)
  const targetNum = Math.floor(Math.random() * 2) + 1;
  // const targetNum = 4;
  $('.task-num, [data-target]').text(targetNum);
  const targetScore = targetNum * $('[data-item]').length;
  let currentScore = 0;

  // 計時器
  let second = 30;
  let timer = null;
  let isStart = false;

  // 計時開始
  function startTimer() {
    if (timer !== null) return; // 避免重複開始

    isStart = true;
    timer = setInterval(() => {
      second--;
      $('[data-second]').text(second);
      if (second <= 0) endTimer();
    }, 1000);
  }
  function endTimer() {
    clearInterval(timer);
    isStart = false;
    timer = null;
    // gameEnd();
  }

  // 創建遊戲舞台
  const app = new PIXI.Application();
  await app.init({
    // width: 1170,
    // height: 1624,
    backgroundAlpha: 0,
    resizeTo: document.querySelector('#canvas-container'),
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true
  });
  document.querySelector('#canvas-container').appendChild(app.view);
  const container = new PIXI.Container();
  container.x = 430 + 180 * 0.5;
  container.y = 1280 + 91 * 0.5;
  app.stage.addChild(container);
  const itemTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/map1/game/items/coffee.png`);
  const item = new PIXI.Sprite(itemTexture);
  item.anchor.set(0.5);
  item.eventMode = 'static';
  item.cursor = 'pointer';
  const originalTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/map1/game/original/coffee.png`);
  const original = new PIXI.Sprite(originalTexture);
  original.anchor.set(0.5);
  original.alpha = 0;
  container.addChild(item);
  container.addChild(original);
  window.addEventListener('resize', () => {
    stageResize();
  });
  stageResize();
  function stageResize() {
    const canvasW = document.querySelector('#canvas-container').offsetWidth;
    app.stage.scale.set(canvasW / 1170);
  }
  startTimer();
})();