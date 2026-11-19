// Draws the multi-panel Vice City poster: photos in panels, a sunset/neon grade,
// a sun and skyline silhouette on the hero panel, and bold caption lettering.
// Every photo is drawn from an image the user loaded on their own machine.

export const GRADES = {
  sunset: { top: '#ff9a3d', mid: '#ff5e8a', bottom: '#7b2d8b', sun: '#ffd166', accent: '#ff5e8a', scrim: '10,4,18' },
  neon: { top: '#00e5ff', mid: '#ff2fb3', bottom: '#2b0a4d', sun: '#7df9ff', accent: '#00e5ff', scrim: '8,2,26' },
  dusk: { top: '#ffb13d', mid: '#b565d8', bottom: '#1c1040', sun: '#ffe9a8', accent: '#ffb13d', scrim: '12,5,22' },
};

export const LAYOUTS = {
  'sunset-strip': { panels: [0, 1, 2] },
  'four-corners': { panels: [0, 1, 2, 3] },
  skyline: { panels: [0, 1, 2, 3] },
};

/** Panel rectangles for a layout, as fractions of the cover, with a gutter between them. */
export function panelRects(layout, w, h) {
  const g = Math.round(Math.min(w, h) * 0.012);
  if (layout === 'four-corners') {
    const hw = (w - g) / 2, hh = (h - g) / 2;
    return [
      { x: 0, y: 0, w: hw, h: hh }, { x: hw + g, y: 0, w: hw, h: hh },
      { x: 0, y: hh + g, w: hw, h: hh }, { x: hw + g, y: hh + g, w: hw, h: hh },
    ];
  }
  if (layout === 'skyline') {
    const topH = h * 0.55 - g / 2, bw = (w - 2 * g) / 3, by = h * 0.55 + g / 2, bh = h - by;
    return [
      { x: 0, y: 0, w, h: topH },
      { x: 0, y: by, w: bw, h: bh }, { x: bw + g, y: by, w: bw, h: bh }, { x: 2 * (bw + g), y: by, w: bw, h: bh },
    ];
  }
  const heroW = w * 0.62, rx = heroW + g, rw = w - rx, rh = (h - g) / 2;
  return [
    { x: 0, y: 0, w: heroW, h },
    { x: rx, y: 0, w: rw, h: rh }, { x: rx, y: rh + g, w: rw, h: rh },
  ];
}

function drawPhotoInto(ctx, img, rect, crop) {
  const { zoom, ox, oy } = crop;
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale, ph = img.naturalHeight * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, rect.x + (rect.w - pw) / 2 + ox * rect.w, rect.y + (rect.h - ph) / 2 + oy * rect.h, pw, ph);
  ctx.restore();
}

function drawEmptyPanel(ctx, rect, index, grade) {
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  grad.addColorStop(0, grade.top);
  grad.addColorStop(0.55, grade.mid);
  grad.addColorStop(1, grade.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `400 ${Math.round(rect.h * 0.09)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`PHOTO ${index + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2);
}

/** A sun disc and a blocky skyline silhouette, drawn in the hero panel's upper area. */
function drawSunAndSkyline(ctx, rect, grade) {
  const cx = rect.x + rect.w * 0.74, cy = rect.y + rect.h * 0.17, r = Math.min(rect.w, rect.h) * 0.13;
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.1);
  glow.addColorStop(0, grade.sun);
  glow.addColorStop(0.35, grade.sun + '55');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2.1, cy - r * 2.1, r * 4.2, r * 4.2);
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  if (rect.h <= rect.w * 1.2) return; // skyline only on a tall hero panel
  const base = rect.y + rect.h * 0.7, bw = rect.w / 9;
  ctx.fillStyle = 'rgba(16,6,26,0.78)';
  const heights = [0.5, 0.8, 0.62, 1, 0.72, 0.9, 0.55, 0.78, 0.66];
  for (let i = 0; i < 9; i++) {
    const bh = rect.h * 0.07 * heights[i];
    ctx.fillRect(rect.x + i * bw, base - bh, bw * 0.82, bh);
  }
  ctx.fillRect(rect.x, base, rect.w, rect.h * 0.012);
}

function gradeWash(ctx, rect, grade) {
  const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, grade.top + '00');
  wash.addColorStop(0.55, grade.mid + '2e');
  wash.addColorStop(1, grade.bottom + '59');
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

function fitFont(ctx, text, maxWidth, startSize, family) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

/** Draws the whole cover onto `canvas` from the editor state. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(state.layout, w, h);
  const mapping = LAYOUTS[state.layout].panels;
  rects.forEach((rect, i) => {
    const slot = mapping[i];
    const img = state.photos[slot];
    if (img) drawPhotoInto(ctx, img, rect, state.crops[slot]);
    else drawEmptyPanel(ctx, rect, slot, grade);
    if (i === 0 && img) drawSunAndSkyline(ctx, rect, grade);
    gradeWash(ctx, rect, grade);
  });

  // Caption band: dark scrim, accent bar, big title, letterspaced subtitle.
  const bandH = h * 0.24, bandY = h - bandH;
  const scrim = ctx.createLinearGradient(0, bandY - h * 0.06, 0, h);
  scrim.addColorStop(0, `rgba(${grade.scrim},0)`);
  scrim.addColorStop(0.45, `rgba(${grade.scrim},0.82)`);
  scrim.addColorStop(1, `rgba(${grade.scrim},0.94)`);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY - h * 0.06, w, bandH + h * 0.06);

  const title = (state.caption || 'VICE CITY').trim().toUpperCase();
  const margin = w * 0.05;
  ctx.save();
  ctx.translate(w / 2, h - h * 0.115);
  ctx.rotate(-0.035);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const size = fitFont(ctx, title, w * 0.9, Math.round(h * 0.115), "400 Anton, sans-serif");
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeStyle = 'rgba(16,6,26,0.9)';
  ctx.strokeText(title, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = grade.accent;
  ctx.shadowBlur = size * 0.18;
  ctx.fillText(title, 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();

  const sub = (state.subtitle || '').trim();
  if (sub) {
    ctx.font = `700 ${Math.round(h * 0.028)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.accent;
    const spaced = sub.toUpperCase().split('').join(' ');
    ctx.fillText(spaced, w / 2, h - h * 0.035);
  }
  ctx.fillStyle = grade.accent;
  ctx.fillRect(margin, bandY + h * 0.018, w * 0.16, Math.max(3, h * 0.008));
  ctx.font = `700 ${Math.round(h * 0.016)}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('VICE COVER STUDIO', w - margin, h - h * 0.012);
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeRect(w * 0.006, h * 0.006, w * 0.988, h * 0.988);
}

/** Renders the cover at an export size and returns the canvas. */
export function renderCover(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, state);
  return canvas;
}
