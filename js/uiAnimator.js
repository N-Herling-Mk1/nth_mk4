// File: uiAnimator.js

let uiCanvas, uiCtx;
let tick = 0;
let noiseCanvas, noiseCtx;
const noiseDensity = 0.03; // ⬆️ More frequent noise specks

export function startUIAnimation() {
  console.log('startUIAnimation called');

  uiCanvas = document.getElementById('ui-canvas');
  if (!uiCanvas) return console.error('ui-canvas not found!');

  uiCtx = uiCanvas.getContext('2d');
  if (!uiCtx) return console.error('Failed to get 2D context from ui-canvas!');

  noiseCanvas = document.createElement('canvas');
  noiseCtx = noiseCanvas.getContext('2d');

  function resizeCanvas() {
    uiCanvas.width = uiCanvas.clientWidth;
    uiCanvas.height = uiCanvas.clientHeight;
    noiseCanvas.width = uiCanvas.width;
    noiseCanvas.height = uiCanvas.height;
    generateStatic();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function generateStatic() {
    const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < noiseDensity) {
        const blueBias = Math.random() * 255;
        data[i]     = blueBias * 0.15;              // Red
        data[i + 1] = blueBias * 0.3;               // Green
        data[i + 2] = blueBias;                     // Blue
        data[i + 3] = Math.random() * 100 + 50;      // ⬆️ More visible
      } else {
        data[i]     = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = Math.random() * 85;           // Ambient dark static
      }
    }

    noiseCtx.putImageData(imageData, 0, 0);
  }

  function draw() {
    requestAnimationFrame(draw);
    tick += 0.01;

    const w = uiCanvas.width;
    const h = uiCanvas.height;

    // ⬇️ Slow fading for trail effect
    uiCtx.fillStyle = 'rgba(0, 0, 0, 0.035)';
    uiCtx.fillRect(0, 0, w, h);

    // ⬆️ More static refresh frequency
    if (Math.floor(tick * 10) % 2 === 0) {
      generateStatic();
    }

    uiCtx.drawImage(noiseCanvas, 0, 0);

    // Draw ellipses
    uiCtx.save();
    uiCtx.translate(w / 2, h / 2);

    const ellipseCount = 4;
    const baseRadiusX = w * 0.45;
    const baseRadiusY = h * 0.3;

    for (let i = 0; i < ellipseCount; i++) {
      const speed = [0.02, 0.015, 0.01, 0.03][i];
      const rotation = tick * speed * (i % 2 === 0 ? 1 : -1);

      uiCtx.save();
      uiCtx.rotate(rotation);

      uiCtx.shadowColor = 'rgba(68, 217, 230, 0.4)';
      uiCtx.shadowBlur = 15;

      uiCtx.strokeStyle = 'rgba(68, 217, 230, 0.85)';
      uiCtx.lineWidth = 2;

      uiCtx.beginPath();
      uiCtx.ellipse(
        0,
        0,
        baseRadiusX - i * 25,
        baseRadiusY - i * 15,
        0,
        0,
        Math.PI * 2
      );
      uiCtx.stroke();

      uiCtx.restore();
    }

    uiCtx.restore();
  }

  draw();
}
