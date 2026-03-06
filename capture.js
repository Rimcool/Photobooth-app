const MAX_SHOTS = 4;

let currentFilter = 'none';
let photos = [];
let countdownInterval = null;
let countdownValue = 3;
let isCapturing = false;
let selectedStickerSrc = null;
let placedStickers = [];
let draggingStickerId = null;
let dragOffset = { x: 0, y: 0 };

const video = document.getElementById('preview');
const canvas = document.getElementById('canvas');
const ctx = canvas?.getContext('2d');
const timerEl = document.getElementById('timer');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const doneBtn = document.getElementById('doneBtn');
const sessionStatus = document.getElementById('sessionStatus');
const thumbsEl = document.getElementById('thumbs');
const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
const stickerLayer = document.getElementById('stickerLayer');
const stickerOptionBtns = Array.from(document.querySelectorAll('.sticker-option'));
const clearStickersBtn = document.getElementById('clearStickersBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const printBtn = document.getElementById('printBtn');
const captureAgainBtn = document.getElementById('captureAgainBtn');
const reviewHint = document.getElementById('reviewHint');

function setTimerText(text, color = '#ffffff') {
  if (!timerEl) return;
  timerEl.textContent = text;
  timerEl.style.color = color;
}

function isVideoReady() {
  return video && video.srcObject && video.readyState >= 2;
}

function updateStatus() {
  const hasPhotos = photos.length > 0;

  if (sessionStatus) {
    sessionStatus.textContent = `Shot ${photos.length} / ${MAX_SHOTS}`;
  }

  if (captureBtn) {
    captureBtn.disabled = isCapturing || photos.length >= MAX_SHOTS;
    captureBtn.textContent = photos.length >= MAX_SHOTS ? 'All 4 Captured ✅' : 'Take Photo 📸';
  }

  if (doneBtn) doneBtn.disabled = false;

  [downloadBtn, shareBtn, printBtn, captureAgainBtn].forEach(btn => {
    if (!btn) return;
    btn.disabled = !hasPhotos;
  });

  if (reviewHint) {
    reviewHint.textContent = hasPhotos
      ? 'Great! You can Download, Share, Print, or Capture Again.'
      : 'Take at least 1 photo to enable actions.';
  }
}

function renderThumbs() {
  if (!thumbsEl) return;
  thumbsEl.innerHTML = '';

  for (let i = 0; i < MAX_SHOTS; i += 1) {
    const slot = document.createElement('div');
    slot.className = 'thumb';

    if (photos[i]) {
      const img = document.createElement('img');
      img.src = photos[i];
      img.alt = `Shot ${i + 1}`;
      slot.appendChild(img);
    } else {
      slot.textContent = `Shot ${i + 1}`;
    }

    thumbsEl.appendChild(slot);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function renderPlacedStickers() {
  if (!stickerLayer) return;
  stickerLayer.innerHTML = '';

  placedStickers.forEach(sticker => {
    const el = document.createElement('img');
    el.className = 'placed-sticker';
    el.src = sticker.src;
    el.alt = 'Placed sticker';
    el.dataset.id = sticker.id;
    el.style.left = `${sticker.x}px`;
    el.style.top = `${sticker.y}px`;
    el.style.width = `${sticker.size}px`;
    el.style.height = `${sticker.size}px`;
    el.style.transform = 'translate(-50%, -50%)';
    stickerLayer.appendChild(el);
  });
}

function clearPlacedStickers() {
  placedStickers = [];
  renderPlacedStickers();
}

function addStickerAt(clientX, clientY) {
  if (!stickerLayer || !selectedStickerSrc) return;

  const rect = stickerLayer.getBoundingClientRect();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const sticker = {
    id,
    src: selectedStickerSrc,
    x: clamp(clientX - rect.left, 40, rect.width - 40),
    y: clamp(clientY - rect.top, 40, rect.height - 40),
    size: 90
  };

  placedStickers.push(sticker);
  renderPlacedStickers();
}

function startStickerDrag(target, clientX, clientY) {
  if (!stickerLayer || !target?.dataset?.id) return;
  const sticker = placedStickers.find(item => item.id === target.dataset.id);
  if (!sticker) return;

  const rect = stickerLayer.getBoundingClientRect();
  draggingStickerId = sticker.id;
  dragOffset = {
    x: clientX - rect.left - sticker.x,
    y: clientY - rect.top - sticker.y
  };
}

function handleStickerDrag(clientX, clientY) {
  if (!stickerLayer || !draggingStickerId) return;
  const sticker = placedStickers.find(item => item.id === draggingStickerId);
  if (!sticker) return;

  const rect = stickerLayer.getBoundingClientRect();
  const half = sticker.size / 2;
  sticker.x = clamp(clientX - rect.left - dragOffset.x, half, rect.width - half);
  sticker.y = clamp(clientY - rect.top - dragOffset.y, half, rect.height - half);
  renderPlacedStickers();
}

function stopStickerDrag() {
  draggingStickerId = null;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildStripDataUrl() {
  if (!photos.length) return null;

  const stripCanvas = document.createElement('canvas');
  const shotWidth = 900;
  const shotHeight = 650;
  const gap = 26;
  const padding = 36;

  stripCanvas.width = shotWidth + padding * 2;
  stripCanvas.height = (shotHeight * photos.length) + (gap * (photos.length - 1)) + padding * 2;

  const stripCtx = stripCanvas.getContext('2d');
  if (!stripCtx) return null;

  stripCtx.fillStyle = '#ffffff';
  stripCtx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

  for (let index = 0; index < photos.length; index += 1) {
    const img = await loadImage(photos[index]);
    const y = padding + (index * (shotHeight + gap));
    stripCtx.fillStyle = '#f3f4f6';
    stripCtx.fillRect(padding - 6, y - 6, shotWidth + 12, shotHeight + 12);
    stripCtx.drawImage(img, padding, y, shotWidth, shotHeight);
  }

  stripCtx.fillStyle = '#7c3aed';
  stripCtx.font = 'bold 34px Poppins';
  stripCtx.fillText('Photobooth Strip', padding, stripCanvas.height - 18);

  return stripCanvas.toDataURL('image/png');
}

async function drawStickersOnCanvas() {
  if (!ctx || !canvas || !stickerLayer || !placedStickers.length) return;

  const layerRect = stickerLayer.getBoundingClientRect();
  const scaleX = canvas.width / layerRect.width;
  const scaleY = canvas.height / layerRect.height;

  for (const sticker of placedStickers) {
    try {
      const img = await loadImage(sticker.src);
      const drawWidth = sticker.size * scaleX;
      const drawHeight = sticker.size * scaleY;
      const drawX = (sticker.x * scaleX) - (drawWidth / 2);
      const drawY = (sticker.y * scaleY) - (drawHeight / 2);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    } catch {
      // ignore failed sticker load and continue
    }
  }
}

function saveAndOpenGallery() {
  if (!photos.length) {
    setTimerText('Take at least 1 photo', '#fbbf24');
    return;
  }
  localStorage.setItem('capturedPhotos', JSON.stringify(photos));
  window.electronAPI?.navigate('gallery');
}

function retakeAll() {
  photos = [];
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  isCapturing = false;
  setTimerText('Ready', '#ffffff');
  clearPlacedStickers();
  renderThumbs();
  updateStatus();
}

async function startCamera() {
  if (!video) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setTimerText('No camera support', '#ef4444');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    setTimerText('Ready', '#ffffff');
  } catch (err) {
    console.error('Camera error:', err);
    setTimerText('Camera blocked', '#ef4444');
  }
}

function startCountdown() {
  if (isCapturing || photos.length >= MAX_SHOTS) return;

  if (!isVideoReady()) {
    setTimerText('Waiting camera...', '#fbbf24');
    return;
  }

  isCapturing = true;
  updateStatus();

  if (countdownInterval) clearInterval(countdownInterval);
  countdownValue = 3;
  setTimerText(String(countdownValue), '#ffffff');

  countdownInterval = setInterval(() => {
    countdownValue -= 1;

    if (countdownValue > 0) {
      setTimerText(String(countdownValue), '#ffffff');
      return;
    }

    clearInterval(countdownInterval);
    countdownInterval = null;
    setTimerText('Smile! 📸', '#34d399');
    setTimeout(capturePhoto, 400);
  }, 1000);
}

async function capturePhoto() {
  if (!ctx || !video || !canvas || !isVideoReady()) {
    isCapturing = false;
    updateStatus();
    setTimerText('Camera not ready', '#ef4444');
    return;
  }

  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';
  await drawStickersOnCanvas();

  photos.push(canvas.toDataURL('image/png'));
  renderThumbs();
  clearPlacedStickers();

  isCapturing = false;
  updateStatus();

  if (photos.length >= MAX_SHOTS) {
    setTimerText('Perfect! Click Done ➜', '#a78bfa');
  } else {
    setTimerText(`Captured ${photos.length}/${MAX_SHOTS}`, '#a78bfa');
  }
}

if (captureBtn) captureBtn.addEventListener('click', startCountdown);
if (retakeBtn) retakeBtn.addEventListener('click', retakeAll);
if (doneBtn) doneBtn.addEventListener('click', saveAndOpenGallery);
if (captureAgainBtn) captureAgainBtn.addEventListener('click', retakeAll);

if (downloadBtn) {
  downloadBtn.addEventListener('click', async () => {
    if (!photos.length) return;

    const stripDataUrl = await buildStripDataUrl();
    if (!stripDataUrl) {
      setTimerText('Could not create strip', '#ef4444');
      return;
    }

    const result = await window.electronAPI.downloadStrip(stripDataUrl);
    if (result?.success) {
      setTimerText('Strip downloaded ✅', '#60a5fa');
      alert(`Photo strip saved to:\n${result.filePath}`);
      return;
    }

    if (result?.canceled) {
      setTimerText('Download cancelled', '#fbbf24');
      return;
    }

    setTimerText('Download failed', '#ef4444');
    alert(`Could not save strip. ${result?.error || ''}`);
  });
}

if (shareBtn) {
  shareBtn.addEventListener('click', () => {
    if (!photos.length) return;
    window.electronAPI.savePhotos(photos);
    window.electronAPI.onPhotosSaved((paths) => {
      setTimerText('Saved for sharing 📤', '#c084fc');
      alert(`Share these files:\n${paths.join('\n')}`);
    });
  });
}

if (printBtn) {
  printBtn.addEventListener('click', async () => {
    if (!photos.length) return;
    await window.electronAPI.printPhotos(photos);
    setTimerText('Sending to printer 🖨️', '#34d399');
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const isSame = btn.classList.contains('active');
    filterBtns.forEach(item => item.classList.remove('active'));

    if (isSame) {
      currentFilter = 'none';
      if (video) video.style.filter = 'none';
      return;
    }

    btn.classList.add('active');
    currentFilter = btn.dataset.filter || 'none';
    if (video) video.style.filter = currentFilter;
  });
});

stickerOptionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const isSame = btn.classList.contains('active');
    stickerOptionBtns.forEach(item => item.classList.remove('active'));

    if (isSame) {
      selectedStickerSrc = null;
      return;
    }

    btn.classList.add('active');
    selectedStickerSrc = btn.dataset.stickerSrc || null;
  });
});

if (clearStickersBtn) {
  clearStickersBtn.addEventListener('click', clearPlacedStickers);
}

if (stickerLayer) {
  stickerLayer.addEventListener('pointerdown', (event) => {
    const target = event.target;

    if (target instanceof HTMLElement && target.classList.contains('placed-sticker')) {
      startStickerDrag(target, event.clientX, event.clientY);
      return;
    }

    if (target === stickerLayer) {
      addStickerAt(event.clientX, event.clientY);
    }
  });

  stickerLayer.addEventListener('pointermove', (event) => {
    handleStickerDrag(event.clientX, event.clientY);
  });

  window.addEventListener('pointerup', stopStickerDrag);
  window.addEventListener('pointercancel', stopStickerDrag);
}

renderThumbs();
updateStatus();
startCamera();









