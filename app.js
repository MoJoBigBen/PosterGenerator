const $ = (id) => document.getElementById(id);

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

// name, width mm, height mm
const SIZES = [
  ['A4', 210, 297],
  ['A3', 297, 420],
  ['A2', 420, 594],
  ['30 × 40 cm', 300, 400],
  ['40 × 50 cm', 400, 500],
  ['50 × 70 cm', 500, 700],
];

const state = {
  cover: null,
  palette: [],
};

const SAMPLE = {
  title: 'Parachutes',
  artist: 'Coldplay',
  year: '2000',
  tracks: ['Don\'t Panic', 'Shiver', 'Spies', 'Sparks', 'Yellow', 'Trouble', 'Parachutes', 'High Speed', 'We Never Change', 'Everything\'s Not Lost'].join('\n'),
  footer: 'Parlophone Records',
};

// ---------- colour helpers ----------

const toHex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const fromHex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

function extractPalette(img, n = 5) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, 64, 64);
  const data = ctx.getImageData(0, 0, 64, 64).data;

  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b;
    buckets.set(key, e);
  }

  const scored = [...buckets.values()].map((e) => {
    const col = [e.r / e.n, e.g / e.n, e.b / e.n];
    const max = Math.max(...col), min = Math.min(...col);
    const sat = max ? (max - min) / max : 0;
    return { col, score: e.n * (0.35 + sat) };
  }).sort((a, b) => b.score - a.score);

  const picked = [];
  for (const { col } of scored) {
    const far = picked.every((p) => Math.hypot(p[0] - col[0], p[1] - col[1], p[2] - col[2]) > 70);
    if (far) picked.push(col);
    if (picked.length === n) break;
  }
  return picked;
}

function resolveColors() {
  const mode = $('bgMode').value;
  const dominant = state.palette[0] || [236, 235, 230];
  let bg;
  switch (mode) {
    case 'white': bg = [255, 255, 255]; break;
    case 'black': bg = [17, 17, 17]; break;
    case 'coverLight': bg = mix(dominant, [255, 255, 255], 0.82); break;
    case 'cover': bg = dominant; break;
    case 'coverDark': bg = mix(dominant, [0, 0, 0], 0.72); break;
    case 'custom': bg = fromHex($('customBg').value); break;
    default: bg = [236, 235, 230];
  }
  const dark = luminance(bg) < 0.55;
  return { bg: toHex(bg), fg: dark ? '#f3f3f3' : '#151515' };
}

// ---------- text layout ----------

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function parseTracks(raw) {
  return raw.split('\n').map((t) => t.trim()).filter(Boolean);
}

// Finds the biggest font size (and column count for list style) that fits the box.
function fitTracks(ctx, tracks, style, width, height) {
  const attempts = style === 'list' ? [1, 2, 3] : [1];
  for (const cols of attempts) {
    for (let s = 26; s >= 12; s--) {
      const r = layoutTracks(ctx, tracks, style, cols, s, width);
      if (r.height <= height) return r;
    }
  }
  const last = attempts[attempts.length - 1];
  return layoutTracks(ctx, tracks, style, last, 12, width);
}

function layoutTracks(ctx, tracks, style, cols, size, width) {
  ctx.font = `400 ${size}px ${FONT}`;
  const lh = size * 1.5;
  const gapCol = 28;
  const colW = (width - gapCol * (cols - 1)) / cols;
  let lines;
  if (style === 'list') {
    lines = tracks.flatMap((t) => wrapText(ctx, t.toUpperCase(), colW));
  } else {
    lines = wrapText(ctx, tracks.join(', ').toUpperCase(), width);
  }
  const rows = Math.ceil(lines.length / cols);
  return { lines, rows, cols, size, lh, colW, gapCol, height: rows * lh };
}

// ---------- drawing ----------

function render(canvas) {
  const ctx = canvas.getContext('2d');
  const scale = canvas.width / 1000;
  const L = 1000;
  const H = canvas.height / scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textBaseline = 'alphabetic';

  const { bg, fg } = resolveColors();
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, L, H);

  const title = $('title').value.trim();
  const artist = $('artist').value.trim();
  const year = $('year').value.trim();
  const footer = $('footer').value.trim();
  const tracks = parseTracks($('tracks').value);
  // Eine Palettenfarbe, die dem Hintergrund entspricht, wäre unsichtbar und
  // risse eine Lücke in die Reihe – also gar nicht erst zeichnen.
  const bgRgb = fromHex(bg);
  const swatches = $('showPalette').checked
    ? state.palette.filter((c) => Math.hypot(c[0] - bgRgb[0], c[1] - bgRgb[1], c[2] - bgRgb[2]) > 30)
    : [];
  const showPalette = swatches.length > 0;

  const m = 75;
  const gap = 55;
  const cover = Math.min(L - 2 * m, H - 2 * m - gap - H * 0.25);
  const cw = cover;
  const x0 = (L - cw) / 2;

  // cover
  if (state.cover) {
    const img = state.cover;
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, side, side, x0, m, cw, cw);
  } else {
    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(x0, m, cw, cw);
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = fg;
    ctx.font = `400 28px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('COVER', L / 2, m + cw / 2 + 10);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = fg;
  ctx.textAlign = 'left';

  // footer area
  const hasFooter = footer || showPalette;
  const footerSize = 22;
  const footerBase = H - m;
  const textBottom = hasFooter ? footerBase - footerSize - 36 : footerBase;

  // title
  let y = m + cw + gap;
  if (title) {
    let ts = 80, lines = [], yearW = 0;
    for (; ts >= 34; ts -= 2) {
      ctx.font = `700 ${ts}px ${FONT}`;
      if (year) {
        ctx.font = `400 ${ts * 0.3}px ${FONT}`;
        yearW = ctx.measureText(year).width + ts * 0.18;
        ctx.font = `700 ${ts}px ${FONT}`;
      }
      lines = wrapText(ctx, title, cw - yearW);
      if (lines.length <= 2 && lines.every((l) => ctx.measureText(l).width <= cw - yearW)) break;
    }
    ctx.font = `700 ${ts}px ${FONT}`;
    lines.forEach((line, i) => {
      const base = y + ts * 0.8 + i * ts * 1.02;
      ctx.fillText(line, x0, base);
      if (year && i === lines.length - 1) {
        const w = ctx.measureText(line).width;
        ctx.font = `400 ${ts * 0.3}px ${FONT}`;
        ctx.fillText(year, x0 + w + ts * 0.18, base - ts * 0.55);
        ctx.font = `700 ${ts}px ${FONT}`;
      }
    });
    y += ts * 0.8 + (lines.length - 1) * ts * 1.02 + ts * 0.45;
  } else if (year) {
    ctx.font = `400 28px ${FONT}`;
    ctx.fillText(year, x0, y + 28);
    y += 28 + 24;
  }

  // artist + tracks
  let size = 22;
  if (artist || tracks.length) {
    const avail = textBottom - y;
    const artistH = artist ? 30 : 0;
    if (tracks.length) {
      const t = fitTracks(ctx, tracks, $('trackStyle').value, cw, avail - artistH);
      size = t.size;
      if (artist) {
        ctx.font = `600 ${t.size}px ${FONT}`;
        ctx.fillText(artist.toUpperCase(), x0, y + t.size);
        y += t.size * 1.5 + 4;
      }
      ctx.font = `400 ${t.size}px ${FONT}`;
      ctx.globalAlpha = 0.78;
      for (let c = 0; c < t.cols; c++) {
        for (let r = 0; r < t.rows; r++) {
          const line = t.lines[c * t.rows + r];
          if (line) ctx.fillText(line, x0 + c * (t.colW + t.gapCol), y + t.size + r * t.lh);
        }
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.font = `600 ${size}px ${FONT}`;
      ctx.fillText(artist.toUpperCase(), x0, y + size);
    }
  }

  // footer
  if (footer) {
    ctx.font = `400 ${footerSize}px ${FONT}`;
    ctx.globalAlpha = 0.6;
    ctx.fillText(footer, x0, footerBase);
    ctx.globalAlpha = 1;
  }
  if (showPalette) {
    const sw = 28, sg = 10;
    const total = swatches.length * sw + (swatches.length - 1) * sg;
    swatches.forEach((col, i) => {
      ctx.fillStyle = toHex(col);
      ctx.fillRect(x0 + cw - total + i * (sw + sg), footerBase - sw + 4, sw, sw);
    });
  }
}

// ---------- UI wiring ----------

const preview = $('preview');

function currentSize() {
  return SIZES[+$('size').value];
}

function redraw() {
  const [, w, h] = currentSize();
  preview.width = 1000;
  preview.height = Math.round(1000 * h / w);
  render(preview);
  const dpi = +$('dpi').value;
  const px = (mm) => Math.round(mm / 25.4 * dpi);
  $('hint').textContent = `Export: ${px(w)} × ${px(h)} px`;
}

function setCover(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.cover = img;
    state.palette = extractPalette(img);
    $('dropText').textContent = file.name || 'Cover geladen – anderes Bild ablegen zum Ersetzen';
    renderSwatches();
    redraw();
  };
  img.src = url;
}

function renderSwatches() {
  const box = $('swatches');
  box.innerHTML = '';
  $('swatchField').hidden = state.palette.length === 0;
  state.palette.forEach((col) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.style.background = toHex(col);
    b.title = toHex(col);
    b.addEventListener('click', () => {
      $('customBg').value = toHex(col);
      $('bgMode').value = 'custom';
      redraw();
    });
    box.appendChild(b);
  });
}

function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function filename(ext) {
  const base = [slug($('artist').value), slug($('title').value)].filter(Boolean).join('-') || 'poster';
  return `${base}-poster.${ext}`;
}

function exportCanvas() {
  const [, w, h] = currentSize();
  const dpi = +$('dpi').value;
  const c = document.createElement('canvas');
  c.width = Math.round(w / 25.4 * dpi);
  c.height = Math.round(h / 25.4 * dpi);
  render(c);
  return c;
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

const toBlob = (canvas, type, q) => new Promise((res) => canvas.toBlob(res, type, q));

async function withBusy(btn, fn) {
  btn.disabled = true;
  try { await fn(); } finally { btn.disabled = false; }
}

$('exportPng').addEventListener('click', (e) => withBusy(e.target, async () => {
  const blob = await toBlob(exportCanvas(), 'image/png');
  download(blob, filename('png'));
}));

$('exportPdf').addEventListener('click', (e) => withBusy(e.target, async () => {
  const [, w, h] = currentSize();
  const c = exportCanvas();
  const jpeg = new Uint8Array(await (await toBlob(c, 'image/jpeg', 0.95)).arrayBuffer());
  const pdf = buildPdf(jpeg, c.width, c.height, w / 25.4 * 72, h / 25.4 * 72);
  download(new Blob([pdf], { type: 'application/pdf' }), filename('pdf'));
}));

// Minimal single-page PDF that embeds one JPEG, so no library is needed.
function buildPdf(jpeg, pxW, pxH, wPt, hPt) {
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let pos = 0;
  const push = (d) => {
    const b = typeof d === 'string' ? enc.encode(d) : d;
    chunks.push(b);
    pos += b.length;
  };
  const obj = (n, body, stream) => {
    offsets[n] = pos;
    push(`${n} 0 obj\n${body}\n`);
    if (stream) { push('stream\n'); push(stream); push('\nendstream\n'); }
    push('endobj\n');
  };
  const f = (v) => v.toFixed(2);
  const content = `q ${f(wPt)} 0 0 ${f(hPt)} 0 0 cm /Im0 Do Q`;

  push('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(wPt)} ${f(hPt)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  obj(4, `<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`, jpeg);
  obj(5, `<< /Length ${content.length} >>`, content);

  const xref = pos;
  let table = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) table += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  push(table);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const out = new Uint8Array(pos);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

// inputs
SIZES.forEach(([name], i) => {
  const o = document.createElement('option');
  o.value = i;
  o.textContent = name;
  $('size').appendChild(o);
});
$('size').value = 1; // A3

$('title').value = SAMPLE.title;
$('artist').value = SAMPLE.artist;
$('year').value = SAMPLE.year;
$('tracks').value = SAMPLE.tracks;
$('footer').value = SAMPLE.footer;

['title', 'artist', 'year', 'tracks', 'footer', 'trackStyle', 'bgMode', 'customBg', 'showPalette', 'size', 'dpi']
  .forEach((id) => $(id).addEventListener('input', () => {
    if (id === 'customBg') $('bgMode').value = 'custom';
    redraw();
  }));

// cover input: click, drag & drop, paste
$('coverFile').addEventListener('change', (e) => setCover(e.target.files[0]));
const drop = $('drop');
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => setCover(e.dataTransfer.files[0]));
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => { e.preventDefault(); setCover(e.dataTransfer.files[0]); });
window.addEventListener('paste', (e) => {
  const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
  if (item) setCover(item.getAsFile());
});

redraw();
