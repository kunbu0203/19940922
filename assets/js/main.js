$(function () {
  const $video = document.querySelector('[data-camera-video]');
  const $canvas = document.querySelector('[data-camera-canvas]');
  const ctx = $canvas.getContext('2d');
  let streamObj; // 預計用來存放 串流相關的物件(MediaStream)
  let front = true;

  // 開啟 webcam
  openCam();
  function openCam() {
    // 開啟視訊鏡頭，瀏覽器會跳詢問視窗
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: front ? 'user' : 'environment',
        width: {
          ideal: 656 * 3
        }
      }
    }).then(function (stream) {
      streamObj = stream; // 將串流物件放在 streamObj 全域變數，方便後面關閉 webcam 時會用到
      $video.srcObject = stream; // video 標籤顯示 webcam 畫面
      // $('[data-camera]').addClass('-open');
    }).catch(function (error) {
      // 若無法取得畫面，執行 catch
      alert('取得相機訪問權限失敗: ', error.message, error.name);
    });
  }
  $video.addEventListener('play', function () {
    // 將 video 標籤的影片寬高，顯示於 canvas 標籤上
    $canvas.width = $video.videoWidth;
    $canvas.height = $video.videoHeight;
    // drawCanvas();
  }, false);

  // function drawCanvas() {
  //     // 清空Canvas
  //     ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  //     ctx.save();
  //     if (front) {
  //         // 水平反轉
  //         ctx.translate($canvas.width, 0);
  //         ctx.scale(-1, 1);
  //     }
  //     ctx.drawImage($video, 0, 0, $canvas.width, $canvas.height);
  //     ctx.restore();
  //     // 進行下一幀的繪製
  //     requestAnimationFrame(drawCanvas);
  // }

  $('[data-camera-direction]').on('click', function () {
    streamObj.getTracks().forEach(track => track.stop());
    front = !front;
    openCam();
  });
  const faceMesh = new FaceMesh({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` // 本地路徑
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  faceMesh.onResults(onResults);
  function onResults(results) {
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      ctx.drawImage(results.image, 0, 0, $canvas.width, $canvas.height);
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          // drawConnectors(ctx, landmarks, FACEMESH_TESSELATION,
          //     { color: '#C0C0C070', lineWidth: 1 });
          drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {
            color: '#FF3030'
          });
          drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {
            color: '#30FF30'
          });
          drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
            color: '#E0E0E0'
          });
          drawConnectors(ctx, landmarks, FACEMESH_LIPS, {
            color: '#E0E0E0'
          });
        }
      }
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        // 提取頭部和相機的距離
        const nose = landmarks[0]; // 鼻子坐標
        const headTop = landmarks[10]; // 頭頂坐標
        const distance = Math.abs(nose.z - headTop.z); // 計算距離

        // 根據距離計算縮放比例，這裡假設距離越遠，縮放比例越小
        const scale = Math.max(0.5, 2 - distance) * 0.1; // 設置縮放邊界

        // 計算頭頂的座標
        const x = headTop.x * $canvas.width;
        const y = headTop.y * $canvas.height;

        // 繪製頭頂的圖片，根據距離調整大小
        ctx.drawImage(img, x - img.width * scale / 2, y - img.height * scale, img.width * scale, img.height * scale);
      }
    });
  }
  const img = new Image();
  img.src = '/assets/image/touch/logo.png'; // 你想顯示的圖片路徑

  const camera = new Camera($video, {
    onFrame: async () => {
      await faceMesh.send({
        image: $video
      });
    },
    width: {
      ideal: 656 * 3
    },
    height: $canvas.height * 4,
    facingMode: front ? 'user' : 'environment'
  });
  camera.start();
});