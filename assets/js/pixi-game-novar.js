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

  // 新增物件
  const createItem = async _ref => {
    let {
      x,
      y,
      width,
      height,
      imgName,
      hitArea
    } = _ref;
    const name = imgName.split('-')[0];
    const container = new PIXI.Container();
    container.x = x + width * 0.5;
    container.y = y + height * 0.5;
    app.stage.addChild(container);
    const itemTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/map1/game/items/${imgName}.png`);
    const item = new PIXI.Sprite(itemTexture);
    item.anchor.set(0.5);
    item.eventMode = 'static';
    item.cursor = 'pointer';
    if (hitArea !== undefined && hitArea.length > 0) {
      const offsetX = width * -0.5;
      const offsetY = height * -0.5;
      const points = hitArea.map((val, i) => i % 2 === 0 ? val + offsetX : val + offsetY);
      item.hitArea = new PIXI.Polygon(points);

      // const hitShape = new PIXI.Graphics();
      // hitShape.beginFill(0xff0000, 0.3); // 紅色、30% 透明度
      // hitShape.drawPolygon(hitArea);
      // hitShape.endFill();
      // hitShape.x = offsetX;
      // hitShape.y = offsetY;
      // container.addChild(hitShape);
    }

    item.on('pointerdown', () => {
      if (!isStart) return;
      item.eventMode = 'none';
      if (name !== 'coffee') {
        score[name]++;
        currentScore++;
        // $(`[data-item="${name}"]`).addClass('-active').find('[data-num]').text(score[name]);
        $(`[data-item="${name}"]`).find('[data-num]').text(score[name]);
        addTl.play();
      } else {
        $('.game-stage').addClass('-coffee');
      }
      if (targetScore === currentScore) {
        setTimeout(() => {
          endTimer();
        }, 1000);
      }
      itemTl.play();
    });
    const originalTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/map1/game/original/${imgName}.png`);
    const original = new PIXI.Sprite(originalTexture);
    original.anchor.set(0.5);
    original.alpha = 0;
    container.addChild(item);
    container.addChild(original);
    const addTl = gsap.timeline();
    addTl.pause();
    if (name !== 'coffee') {
      const addTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/other/add.png`);
      const add = new PIXI.Sprite(addTexture);
      add.x = x + width * 0.5 - 55;
      add.y = y - 86;
      add.alpha = 0;
      addTl.to(add, {
        alpha: 1,
        duration: 0.3
      }).to(add, {
        alpha: 0,
        duration: 0.3,
        delay: 0.3
      });
      app.stage.addChild(add);
    }

    // 物件點擊動畫
    const itemTl = gsap.timeline();
    itemTl.pause();
    itemTl.to(container.scale, {
      x: 1.3,
      y: 1.3,
      duration: 0.5,
      ease: 'back.out(4)'
    }).to(original, {
      alpha: 1,
      duration: 0.5
    }, '<').to(container, {
      alpha: 0,
      duration: 0.3,
      delay: 0.2
    });
  };
  // 新增覆蓋葉子
  const createLeaf = async _ref2 => {
    let {
      x,
      y,
      width,
      height,
      imgName
    } = _ref2;
    const leafTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/map1/game/leaf/${imgName}.png`);
    const leaf = new PIXI.Sprite(leafTexture);
    leaf.anchor.set(1, 1);
    leaf.x = x + width;
    leaf.y = y + height;
    leaf.eventMode = 'static';
    leaf.on('pointerdown', () => {
      leaf.eventMode = 'none';
      leafTl.play();
    });
    app.stage.addChild(leaf);

    // 葉子點擊動畫
    const leafTl = gsap.timeline();
    leafTl.pause();
    leafTl.to(leaf, {
      y: y + height - 100,
      rotation: 40 * (Math.PI / 180),
      alpha: 0,
      duration: 0.6
    });
  };

  // 物件定位資料
  fetch(`https://kunbu0203.github.io/19940922/assets/image/map1/game/data.json`).then(res => res.json()).then(data => {
    Object.entries(data.items).forEach(_ref3 => {
      let [key, value] = _ref3;
      // 取得隨機序列資料
      const randomIndex = [1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, targetNum).map(i => i - 1);
      randomIndex.map(i => value[i]).forEach((item, i) => {
        const {
          x,
          y,
          width,
          height,
          hitArea
        } = item;
        const imgName = `${key}-${randomIndex[i] + 1}`;
        createItem({
          x,
          y,
          width,
          height,
          imgName,
          hitArea
        });

        // 若有葉子覆蓋
        if (item.leaf) {
          const {
            x,
            y,
            width,
            height
          } = item.leaf;
          createLeaf({
            x,
            y,
            width,
            height,
            imgName
          });
        }
      });
    });

    // 新增陷阱咖啡豆
    const {
      x,
      y,
      width,
      height
    } = data.coffee;
    createItem({
      x,
      y,
      width,
      height,
      imgName: 'coffee'
    });
    // 若咖啡豆有葉子覆蓋
    if (data.coffee.leaf) {
      const {
        x,
        y,
        width,
        height
      } = data.coffee.leaf;
      createLeaf({
        x,
        y,
        width,
        height,
        imgName: 'coffee'
      });
    }
  });
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