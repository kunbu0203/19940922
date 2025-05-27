(async function () {
  // 音樂
  const audio = document.querySelector('#audio');
  $('[data-voice]').on('click', function () {
    if ($(this).data('voice') === 'open') audio.play();
    introTl.play();
  });

  // 取得隨機目標數量(1-2個)
  const targetNum = Math.floor(Math.random() * 2) + 1;
  // const targetNum = 4;
  $('.task-num, [data-target]').text(targetNum);
  const targetScore = targetNum * $('[data-item]').length;
  let currentScore = 0;

  // 介紹進場動畫
  const introTl = gsap.timeline();
  introTl.pause();
  introTl.to('.intro-item', {
    opacity: 1,
    duration: 0.5,
    delay: 0.3,
    stagger: 0.1
  });

  // 指定進場動畫
  const taskTl = gsap.timeline();
  taskTl.pause();
  taskTl.to('.card.-task', {
    opacity: 1,
    duration: 0.5
  }).to('.card.-task .card-wrap', {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: 'back.out(2)'
  });

  // 說明進場動畫(點擊物件)
  const clickTl = gsap.timeline({
    repeat: -1
  });
  clickTl.pause();
  clickTl.to('.instruction-finger.-c', {
    x: 0,
    y: 0,
    duration: 1
  }).to('.instruction-finger.-c', {
    scale: 0.8,
    duration: 0.2
  }).to('.instruction-finger.-c>div', {
    opacity: 1,
    duration: 0.2
  }, '<').to('.instruction-finger.-c', {
    scale: 1,
    duration: 0.2
  }).to('.instruction-click>img', {
    scale: 1.2,
    duration: 0.2
  }, '<').to('.instruction-click>img', {
    scale: 1.1,
    duration: 0.2
  }).to('.instruction-click>img', {
    opacity: 0,
    duration: 0.4
  });
  // 說明進場動畫(撥開葉子)
  const leafTl = gsap.timeline({
    repeat: -1
  });
  leafTl.pause();
  leafTl.to('.instruction-finger.-l', {
    x: 0,
    y: 0,
    duration: 1
  }).to('.instruction-finger.-l', {
    y: '-20%',
    rotate: 20,
    duration: 0.2
  }).to('.instruction-finger.-l>div', {
    opacity: 1,
    rotate: -20,
    duration: 0.2
  }, '<').to('.instruction-leaf>img', {
    y: '-60%',
    rotate: 40,
    opacity: 0,
    duration: 0.8
  });

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
    gameEnd();
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
    const itemTexture = await PIXI.Assets.load(`./../assets/image/map${mapNum}/game/items/${imgName}.png`);
    const item = new PIXI.Sprite(itemTexture);
    item.anchor.set(0.5);
    item.eventMode = 'static';
    item.cursor = 'pointer';
    if (hitArea.length > 0) {
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
    const originalTexture = await PIXI.Assets.load(`./../assets/image/map${mapNum}/game/original/${imgName}.png`);
    const original = new PIXI.Sprite(originalTexture);
    original.anchor.set(0.5);
    original.alpha = 0;
    container.addChild(item);
    container.addChild(original);
    const addTl = gsap.timeline();
    addTl.pause();
    if (name !== 'coffee') {
      const addTexture = await PIXI.Assets.load(`./../assets/image/other/add.png`);
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
    const leafTexture = await PIXI.Assets.load(`./../assets/image/map${mapNum}/game/leaf/${imgName}.png`);
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
  fetch(`./../assets/image/map${mapNum}/game/data.json`).then(res => res.json()).then(data => {
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
      height,
      hitArea
    } = data.coffee;
    createItem({
      x,
      y,
      width,
      height,
      imgName: 'coffee',
      hitArea
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
  function gameEnd() {
    $('body').addClass('-isPopupOpen');
    if (targetScore === currentScore) {
      $('[data-popup="success"]').addClass('-show');
      $('body').addClass('-success');
    } else {
      $('[data-popup="fail"]').addClass('-show');
      $('body').addClass('-fail');
      $('[data-share]').remove();
    }
    $('[data-found]').text(currentScore);
    $('[data-notfound]').text(targetScore - currentScore);
    const percent = currentScore / targetScore;
    let level = 'A';
    let txt = '你是十六食穀收集達人 !';
    if (percent >= 0.76) {
      level = 'S';
      txt = '十六食穀之王非你莫屬';
    }
    ;
    if (percent <= 0.4) {
      level = 'B';
      txt = '還有好多食穀沒找到耶~再試試吧 !';
    }
    ;
    $('.score-level').addClass(`-${level}`).find('div').text(level);
    $('.score-desc').text(txt);
  }
  window.addEventListener('resize', () => {
    stageResize();
  });
  stageResize();
  function stageResize() {
    const canvasW = document.querySelector('#canvas-container').offsetWidth;
    app.stage.scale.set(canvasW / 1170);
  }
  $('[data-step-btn]').on('click.step', function () {
    const id = $(this).data('stepBtn');
    $('[data-step]').removeClass('-active');
    $(`[data-step="${id}"]`).addClass('-active');
    switch (id) {
      case 'task':
        taskTl.play();
        if ($('.main').hasClass('-f01')) {
          $('.header-subject').fadeOut(150, function () {
            $('.header-subject img').attr('src', './../assets/image/layout/subject-wt.png');
            $('.header-subject').fadeIn(150);
          });
        }
        break;
      case 'instruction':
        $('.header-logo').addClass('-hide');
        clickTl.play();
        leafTl.play();
        break;
      case 'game':
        setTimeout(() => {
          startTimer();
        }, 500);
        break;
      case 'level':
        $('.header-subject img').attr('src', './../assets/image/layout/subject-dk.png');
        $('.header-logo').removeClass('-hide');
        break;
      default:
        break;
    }
  });
})();