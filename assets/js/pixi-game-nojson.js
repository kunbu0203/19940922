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
    const itemTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/map${mapNum}/game/items/${imgName}.png`);
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
    const originalTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/map${mapNum}/game/original/${imgName}.png`);
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
    const leafTexture = await PIXI.Assets.load(`https://kunbu0203.github.io/19940922/assets/image/map${mapNum}/game/leaf/${imgName}.png`);
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
  const data = {
    items: {
      redBean: [{
        x: 221,
        y: 1427,
        width: 175,
        height: 86,
        leaf: {
          x: 268,
          y: 1369,
          width: 239,
          height: 157
        }
      }, {
        x: 728,
        y: 1233,
        width: 72,
        height: 39,
        leaf: {
          x: 735,
          y: 1175,
          width: 97,
          height: 123
        }
      }, {
        x: 921,
        y: 1419,
        width: 100,
        height: 48
      }, {
        x: 0,
        y: 1260,
        width: 110,
        height: 54
      }],
      mulberryLeaf: [{
        x: 924,
        y: 282,
        width: 136,
        height: 150
      }, {
        x: 640,
        y: 873,
        width: 130,
        height: 95
      }, {
        x: 72,
        y: 794,
        width: 108,
        height: 79
      }, {
        x: 171,
        y: 143,
        width: 146,
        height: 118
      }],
      jobsTears: [{
        x: 1006,
        y: 1359,
        width: 73,
        height: 46,
        leaf: {
          x: 987,
          y: 1279,
          width: 119,
          height: 78
        }
      }, {
        x: 618,
        y: 1176,
        width: 61,
        height: 32
      }, {
        x: 338,
        y: 1204,
        width: 92,
        height: 49,
        leaf: {
          x: 333,
          y: 1184,
          width: 119,
          height: 76
        }
      }, {
        x: 680,
        y: 1349,
        width: 146,
        height: 78
      }],
      redDate: [{
        x: 158,
        y: 540,
        width: 113,
        height: 97
      }, {
        x: 980,
        y: 998,
        width: 113,
        height: 97,
        leaf: {
          x: 939,
          y: 969,
          width: 231,
          height: 211
        }
      }, {
        x: 470,
        y: 758,
        width: 70,
        height: 72,
        leaf: {
          x: 466,
          y: 730,
          width: 106,
          height: 118
        }
      }, {
        x: 704,
        y: 549,
        width: 99,
        height: 86,
        leaf: {
          x: 674,
          y: 533,
          width: 152,
          height: 133
        }
      }],
      blackBean: [{
        x: 580,
        y: 1507,
        width: 149,
        height: 73
      }, {
        x: 848,
        y: 1290,
        width: 105,
        height: 52,
        leaf: {
          x: 835,
          y: 1265,
          width: 136,
          height: 90
        }
      }, {
        x: 70,
        y: 1478,
        width: 82,
        height: 40,
        leaf: {
          x: 7,
          y: 1394,
          width: 143,
          height: 182
        }
      }, {
        x: 252,
        y: 1316,
        width: 88,
        height: 50
      }]
    },
    coffee: {
      x: 430,
      y: 1280,
      width: 180,
      height: 91
    }
  };
  // 物件定位資料
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