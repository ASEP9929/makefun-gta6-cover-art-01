// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos
// loaded; ?shot=cover shows the cover alone at the requested export size.
// window.__shotReady is set once the scene is painted.
import { SIZES, state, loadImage, redraw } from './main.js';
import { renderCover } from './cover.js';

async function loadSamples() {
  const names = ['pier', 'boulevard', 'street', 'boulevard'];
  for (let i = 0; i < 4; i++) {
    state.photos[i] = await loadImage(`samples/${names[i]}.jpg`);
  }
  state.crops[1].zoom = 1.15;
  state.crops[2].zoom = 1.1;
  state.crops[3].zoom = 1.2;
  state.crops[3].oy = -0.06;
}

function applyQuery(query) {
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('caption')) {
    state.caption = query.get('caption');
    document.getElementById('caption').value = state.caption;
  }
  if (query.get('subtitle')) {
    state.subtitle = query.get('subtitle');
    document.getElementById('subtitle').value = state.subtitle;
  }
  if (query.get('size') && SIZES[query.get('size')]) {
    state.size = query.get('size');
    document.querySelectorAll('#sizes .seg').forEach((b) => b.classList.toggle('active', b.dataset.size === state.size));
  }
  document.querySelectorAll('#layouts .seg').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('#grades .seg').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
}

export async function runShot(shot, query, redrawFn) {
  applyQuery(query);
  if (document.fonts) await document.fonts.load('80px Anton').catch(() => {});
  await loadSamples();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const [w, h] = SIZES[state.size];
    const out = renderCover(state, w, h);
    const canvas = document.getElementById('cover');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(out, 0, 0);
    const scale = Math.min(window.innerWidth / w, window.innerHeight / h);
    canvas.style.width = `${Math.round(w * scale)}px`;
    canvas.style.height = `${Math.round(h * scale)}px`;
  } else {
    redrawFn();
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
