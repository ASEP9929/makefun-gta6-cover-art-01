// Wires the page: photo slots, layout/grade/size pickers, caption inputs, live
// preview and PNG export. A `?shot=` query sets up a fixed scene for a
// screenshot instead (./shots.js). Photos are read on this machine only.
import { drawCover, renderCover } from './cover.js';
import { runShot } from './shots.js';

export const SIZES = { '1080x1080': [1080, 1080], '1080x1350': [1080, 1350], '1920x1080': [1920, 1080] };

export const state = {
  layout: 'sunset-strip',
  grade: 'sunset',
  caption: 'VICE CITY',
  subtitle: 'one last ride',
  size: '1080x1080',
  photos: [null, null, null, null],
  crops: [
    { zoom: 1, ox: 0, oy: 0 }, { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 }, { zoom: 1, ox: 0, oy: 0 },
  ],
  activeSlot: 0,
};

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const zoomInput = document.getElementById('zoom');
const panXInput = document.getElementById('panx');
const panYInput = document.getElementById('pany');

export function redraw() {
  const [w, h] = SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas, state);
  syncSlotButtons();
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function syncSlotButtons() {
  document.querySelectorAll('#slots .slot').forEach((button, i) => {
    button.classList.toggle('active', i === state.activeSlot);
    button.classList.toggle('filled', Boolean(state.photos[i]));
  });
  const crop = state.crops[state.activeSlot];
  zoomInput.value = crop.zoom;
  panXInput.value = crop.ox;
  panYInput.value = crop.oy;
}

const slotsBox = document.getElementById('slots');
for (let i = 0; i < 4; i++) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'slot';
  button.textContent = `Photo ${i + 1}`;
  button.addEventListener('click', () => { state.activeSlot = i; syncSlotButtons(); });
  slotsBox.appendChild(button);
}

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.photos[state.activeSlot] = await loadImage(URL.createObjectURL(file));
  redraw();
});
async function loadSample(name) {
  state.photos[state.activeSlot] = await loadImage(`samples/${name}.jpg`);
  redraw();
}
document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard'));
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier'));
document.getElementById('sample-street').addEventListener('click', () => loadSample('street'));

for (const input of [zoomInput, panXInput, panYInput]) {
  input.addEventListener('input', () => {
    const crop = state.crops[state.activeSlot];
    crop.zoom = Number(zoomInput.value);
    crop.ox = Number(panXInput.value);
    crop.oy = Number(panYInput.value);
    redraw();
  });
}

function wireSegGroup(id, key) {
  document.getElementById(id).addEventListener('click', (e) => {
    const button = e.target.closest('button[data-' + key + ']');
    if (!button) return;
    state[key] = button.dataset[key];
    document.querySelectorAll(`#${id} .seg`).forEach((b) => b.classList.toggle('active', b === button));
    redraw();
  });
}
wireSegGroup('layouts', 'layout');
wireSegGroup('grades', 'grade');
wireSegGroup('sizes', 'size');

captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

document.getElementById('export').addEventListener('click', () => {
  const [w, h] = SIZES[state.size];
  const out = renderCover(state, w, h);
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    status.textContent = `Saved vice-cover-${w}x${h}.png`;
  }, 'image/png');
});

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, redraw);
} else if (document.fonts) {
  document.fonts.load('80px Anton').then(redraw).catch(() => redraw());
  redraw();
} else {
  redraw();
}
