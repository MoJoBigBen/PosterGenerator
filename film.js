// Film-Poster: Bild füllt das ganze Poster, Schrift liegt darüber.
// Die Textelemente lassen sich in der Vorschau verschieben (mit Einrasten).
// Nutzt $, FONT und wrapText aus app.js (erst beim Zeichnen aufgerufen).

const film = {
  img: null,
  px: 0.5, // Bildausschnitt: 0 = links/oben, 1 = rechts/unten
  py: 0.5,
  offsets: {},   // Verschiebung je Textelement in Poster-Einheiten: { title: { x, y }, ... }
  boxes: {},     // Umrisse der Textelemente (inkl. Verschiebung), beim Zeichnen gefüllt
  hover: [],     // Elemente, die beim Ziehen mitwandern würden (nur Vorschau)
  guides: null,  // Einrast-Linien während des Ziehens: { x: [..], y: [..] }
};

const TEXT_KEYS = ['tagline', 'cast', 'title', 'season', 'year', 'credits'];
const BOTTOM_KEYS = ['cast', 'title', 'season', 'year', 'credits'];

const FILM_SAMPLE = {
  title: 'The Dark Knight',
  tagline: 'Why so serious?',
  year: '2008',
  cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'].join('\n'),
  en: { credits: 'Directed by Christopher Nolan · Written by Jonathan Nolan\nMusic by Hans Zimmer\n152 min. · Action, Crime, Drama' },
  de: { credits: 'Regie Christopher Nolan · Drehbuch Jonathan Nolan\nMusik Hans Zimmer\n152 Min. · Action, Krimi, Drama' },
};

const FILM_FONTS = {
  sans: { css: (s) => `700 ${s}px ${FONT}`, track: 0.28, max: 84 },
  serif: { css: (s) => `700 ${s}px Georgia, "Times New Roman", serif`, track: 0.12, max: 96 },
  compact: { css: (s) => `400 ${s}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`, track: 0.08, max: 130 },
};

// ---------- Text mit Buchstabenabstand ----------
// Canvas-eigenes letterSpacing ist nicht überall verfügbar, deshalb von Hand.

function trackedWidth(ctx, text, tr) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + tr;
  return Math.max(0, w - tr);
}

function drawTracked(ctx, text, cx, y, tr) {
  let x = cx - trackedWidth(ctx, text, tr) / 2;
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + tr;
  }
}

function wrapTracked(ctx, text, maxWidth, tr) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? line + ' ' + word : word;
    if (line && trackedWidth(ctx, test, tr) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const splitLines = (raw) => raw.split('\n').map((t) => t.trim()).filter(Boolean);

// ---------- Bildausschnitt ----------

function filmImageRect(L, H) {
  const img = film.img;
  const zoom = +$('fZoom').value;
  const sc = Math.max(L / img.naturalWidth, H / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * sc;
  const dh = img.naturalHeight * sc;
  return { dw, dh, slackX: dw - L, slackY: dh - H, x: -(dw - L) * film.px, y: -(dh - H) * film.py };
}

// ---------- Zeichnen ----------

function renderFilm(ctx, L, H, scale, isPreview) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, L, H);

  if (film.img) {
    const r = filmImageRect(L, H);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(film.img, r.x, r.y, r.dw, r.dh);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.35;
    ctx.font = `400 28px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(t('phImage'), L / 2, H / 2);
    ctx.globalAlpha = 1;
  }

  // Abdunkelung oben und unten, damit die Schrift lesbar bleibt
  const shade = +$('fShade').value / 100;
  if (shade > 0) {
    const bottom = ctx.createLinearGradient(0, H * 0.45, 0, H);
    bottom.addColorStop(0, 'rgba(0,0,0,0)');
    bottom.addColorStop(1, `rgba(0,0,0,${0.92 * shade})`);
    ctx.fillStyle = bottom;
    ctx.fillRect(0, H * 0.45, L, H * 0.55);

    const top = ctx.createLinearGradient(0, 0, 0, H * 0.25);
    top.addColorStop(0, `rgba(0,0,0,${0.7 * shade})`);
    top.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, L, H * 0.25);
  }

  const classic = $('fLayout').value === 'classic';
  const F = FILM_FONTS[$('fFont').value];
  const title = $('fTitle').value.trim().toUpperCase();
  const tagline = $('fTagline').value.trim();
  const year = $('fYear').value.trim();
  const season = $('fSeason').value.trim();
  const cast = splitLines($('fCast').value);
  const credits = splitLines($('fCredits').value);

  const m = L * 0.07;
  const maxW = L - 2 * m;
  const cx = L / 2;

  ctx.fillStyle = $('fColor').value;
  ctx.textAlign = 'left';
  if (shade > 0) {
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 16 * scale; // shadowBlur wird von der Skalierung nicht erfasst
  }

  // Jedes Textelement wird für sich gezeichnet und um seine Verschiebung versetzt.
  // Seine Lage ohne Verschiebung hält `boxes` fest (für Treffer und Einrasten).
  const boxes = {};
  const at = (key, draw) => {
    const o = film.offsets[key] || { x: 0, y: 0 };
    ctx.save();
    ctx.translate(o.x, o.y);
    draw();
    ctx.restore();
  };
  const line = (key, text, x, base, size, tr) => {
    const w = trackedWidth(ctx, text, tr);
    const b = boxes[key] || (boxes[key] = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
    b.x0 = Math.min(b.x0, x - w / 2);
    b.x1 = Math.max(b.x1, x + w / 2);
    b.y0 = Math.min(b.y0, base - size * 0.8);
    b.y1 = Math.max(b.y1, base + size * 0.22);
    drawTracked(ctx, text, x, base, tr);
  };

  // oben: Tagline
  if (tagline) {
    at('tagline', () => {
      if (classic) {
        ctx.font = 'italic 400 36px Georgia, "Times New Roman", serif';
        wrapText(ctx, tagline, maxW).slice(0, 3).forEach((ln, i) => line('tagline', ln, cx, m + 30 + i * 44, 36, 0.4));
      } else {
        ctx.font = `700 24px ${FONT}`;
        const tr = 24 * 0.4;
        wrapTracked(ctx, tagline.toUpperCase(), maxW, tr).slice(0, 2)
          .forEach((ln, i) => line('tagline', ln, cx, m + 24 + i * 36, 24, tr));
      }
    });
  }

  // unten: von unten nach oben stapeln – Credits, Jahr, (Darsteller), Titel
  let y = H - m;

  if (credits.length) {
    at('credits', () => {
      const cs = 16, tr = cs * 0.1;
      ctx.font = `400 ${cs}px ${FONT}`;
      ctx.globalAlpha = 0.8;
      const lines = credits.flatMap((l) => wrapTracked(ctx, l.toUpperCase(), maxW, tr));
      for (let i = lines.length - 1; i >= 0; i--) {
        line('credits', lines[i], cx, y, cs, tr);
        y -= cs * 1.6;
      }
      ctx.globalAlpha = 1;
      y -= cs * 0.5;
    });
  }

  if (year) {
    at('year', () => {
      const ys = 28, tr = ys * 0.3;
      ctx.font = `400 ${ys}px ${FONT}`;
      ctx.globalAlpha = 0.65;
      line('year', year, cx, y, ys, tr);
      ctx.globalAlpha = 1;
      y -= ys * 1.2 + 12;
    });
  }

  if (season) {
    at('season', () => {
      const ss = 30, tr = ss * 0.3;
      ctx.font = `700 ${ss}px ${FONT}`;
      line('season', season.toUpperCase(), cx, y, ss, tr);
      y -= ss * 1.2 + 12;
    });
  }

  if (classic && cast.length) {
    at('cast', () => {
      const cs = 34, tr = cs * 0.1;
      ctx.font = `700 ${cs}px ${FONT}`;
      for (let i = cast.length - 1; i >= 0; i--) {
        line('cast', cast[i].toUpperCase(), cx, y, cs, tr);
        y -= cs * 1.3;
      }
      y -= cs * 0.4;
    });
  }

  if (title) {
    at('title', () => {
      const maxLines = classic ? 3 : 2;
      const trk = classic ? F.track * 0.4 : F.track;
      const cap = classic ? Math.min(F.max * 1.3, 140) : F.max;
      let size = cap, lines = [];
      for (; size >= 28; size -= 2) {
        ctx.font = F.css(size);
        lines = wrapTracked(ctx, title, maxW, size * trk);
        if (lines.length <= maxLines && lines.every((l) => trackedWidth(ctx, l, size * trk) <= maxW)) break;
      }
      ctx.font = F.css(size);
      for (let i = lines.length - 1; i >= 0; i--) {
        line('title', lines[i], cx, y, size, size * trk);
        y -= size * 1.1;
      }
      y -= size * 0.2;
    });
  }

  if (!classic && cast.length) {
    at('cast', () => {
      const cs = 17, tr = cs * 0.22;
      ctx.font = `400 ${cs}px ${FONT}`;
      ctx.globalAlpha = 0.85;
      const lines = wrapTracked(ctx, cast.join('  ·  ').toUpperCase(), maxW, tr).slice(0, 2);
      for (let i = lines.length - 1; i >= 0; i--) {
        line('cast', lines[i], cx, y, cs, tr);
        y -= cs * 1.6;
      }
      ctx.globalAlpha = 1;
    });
  }

  // Verschiebung in die Umrisse einrechnen
  for (const [k, b] of Object.entries(boxes)) {
    const o = film.offsets[k];
    if (o) { b.x0 += o.x; b.x1 += o.x; b.y0 += o.y; b.y1 += o.y; }
  }
  film.boxes = boxes;

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';

  if (isPreview) drawFilmOverlay(ctx, L, H);
}

// Hilfslinien und Rahmen gibt es nur in der Vorschau, nie im Export.
function drawFilmOverlay(ctx, L, H) {
  const keys = film.hover.filter((k) => film.boxes[k]);
  if (keys.length) {
    const u = unionBox(keys);
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(u.x0 - 10, u.y0 - 10, u.x1 - u.x0 + 20, u.y1 - u.y0 + 20);
    ctx.restore();
  }
  if (film.guides) {
    ctx.save();
    ctx.strokeStyle = '#18d6ff';
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.95;
    (film.guides.x || []).forEach((gx) => { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); });
    (film.guides.y || []).forEach((gy) => { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(L, gy); ctx.stroke(); });
    ctx.restore();
  }
}

function unionBox(keys) {
  return keys.reduce((u, k) => {
    const b = film.boxes[k];
    return {
      x0: Math.min(u.x0, b.x0), y0: Math.min(u.y0, b.y0),
      x1: Math.max(u.x1, b.x1), y1: Math.max(u.y1, b.y1),
    };
  }, { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
}

// ---------- Textelemente: Treffer, Gruppen, Einrasten ----------

// Welches Textelement liegt unter dem Punkt? Bei Überlappung das kleinste.
function hitText(x, y) {
  const pad = 12;
  let best = null, bestArea = Infinity;
  for (const [k, b] of Object.entries(film.boxes)) {
    if (x < b.x0 - pad || x > b.x1 + pad || y < b.y0 - pad || y > b.y1 + pad) continue;
    const area = (b.x1 - b.x0) * (b.y1 - b.y0);
    if (area < bestArea) { best = k; bestArea = area; }
  }
  return best;
}

// Was wandert mit, wenn man `key` zieht? Hängt von der Auswahl "Ziehen bewegt" ab.
function dragGroup(key) {
  const scope = $('fMove').value;
  let keys;
  if (scope === 'single') keys = [key];
  else if (scope === 'all') keys = TEXT_KEYS;
  else keys = key === 'tagline' ? ['tagline'] : BOTTOM_KEYS; // "Block": der untere Textblock zusammen
  return keys.filter((k) => film.boxes[k]);
}

const SNAP_DISTANCE = 9; // in Poster-Einheiten (Breite = 1000)

// Rastet den Umriss `box` an Poster-Mitte, Rändern, Drittelslinien und anderen Elementen ein.
function snapBox(box, moving, L, H) {
  const m = L * 0.07;
  const xs = [L / 2, m, L - m];
  const ys = [m, H - m, H / 2, H / 3, (2 * H) / 3];
  for (const [k, b] of Object.entries(film.boxes)) {
    if (moving.includes(k)) continue;
    xs.push(b.x0, b.x1, (b.x0 + b.x1) / 2);
    ys.push(b.y0, b.y1, (b.y0 + b.y1) / 2);
  }
  const pick = (edges, lines) => {
    let best = null;
    for (const e of edges) {
      for (const l of lines) {
        const d = l - e;
        if (Math.abs(d) <= SNAP_DISTANCE && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, line: l };
      }
    }
    return best;
  };
  return {
    x: pick([box.x0, (box.x0 + box.x1) / 2, box.x1], xs),
    y: pick([box.y0, (box.y0 + box.y1) / 2, box.y1], ys),
  };
}

// ---------- Maus: Text verschieben oder Bild verschieben ----------

function initFilmDrag(canvas, onChange) {
  let drag = null;

  const units = (e) => {
    const r = canvas.getBoundingClientRect();
    const f = 1000 / r.width; // Bildschirm-px -> Poster-Einheiten
    return { x: (e.clientX - r.left) * f, y: (e.clientY - r.top) * f, f };
  };
  const posterHeight = () => canvas.height * (1000 / canvas.width);

  const setHover = (keys) => {
    const same = keys.length === film.hover.length && keys.every((k, i) => k === film.hover[i]);
    if (same) return;
    film.hover = keys;
    canvas.style.cursor = keys.length ? 'move' : '';
    onChange();
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (!canvas.classList.contains('is-draggable')) return;
    const p = units(e);
    const key = hitText(p.x, p.y);
    if (key) {
      const keys = dragGroup(key);
      drag = {
        type: 'text', keys, start: p,
        base: Object.fromEntries(keys.map((k) => [k, { ...(film.offsets[k] || { x: 0, y: 0 }) }])),
        box: unionBox(keys),
      };
    } else if (film.img) {
      drag = { type: 'image', last: { x: e.clientX, y: e.clientY } };
    } else {
      return;
    }
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('is-dragging');
    canvas.style.cursor = 'grabbing';
  });

  canvas.addEventListener('pointermove', (e) => {
    const p = units(e);
    if (!drag) {
      if (canvas.classList.contains('is-draggable')) {
        const key = hitText(p.x, p.y);
        setHover(key ? dragGroup(key) : []);
      }
      return;
    }

    if (drag.type === 'image') {
      const r = filmImageRect(1000, posterHeight());
      if (r.slackX > 0.5) film.px = Math.min(1, Math.max(0, film.px - (e.clientX - drag.last.x) * p.f / r.slackX));
      if (r.slackY > 0.5) film.py = Math.min(1, Math.max(0, film.py - (e.clientY - drag.last.y) * p.f / r.slackY));
      drag.last = { x: e.clientX, y: e.clientY };
      onChange();
      return;
    }

    // Text: erst den Roh-Versatz, dann im Poster halten, dann einrasten (Alt = ohne Einrasten)
    const L = 1000, H = posterHeight();
    let dx = p.x - drag.start.x;
    let dy = p.y - drag.start.y;
    const b = drag.box;
    if (L - b.x1 >= -b.x0) dx = Math.min(L - b.x1, Math.max(-b.x0, dx));
    if (H - b.y1 >= -b.y0) dy = Math.min(H - b.y1, Math.max(-b.y0, dy));

    film.guides = null;
    if (!e.altKey) {
      const moved = { x0: b.x0 + dx, x1: b.x1 + dx, y0: b.y0 + dy, y1: b.y1 + dy };
      const s = snapBox(moved, drag.keys, L, H);
      film.guides = { x: [], y: [] };
      if (s.x) { dx += s.x.d; film.guides.x.push(s.x.line); }
      if (s.y) { dy += s.y.d; film.guides.y.push(s.y.line); }
    }
    drag.keys.forEach((k) => {
      film.offsets[k] = { x: drag.base[k].x + dx, y: drag.base[k].y + dy };
    });
    onChange();
  });

  const end = () => {
    drag = null;
    film.guides = null;
    canvas.classList.remove('is-dragging');
    canvas.style.cursor = '';
    onChange();
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', () => { if (!drag) setHover([]); });

  // Doppelklick auf ein Textelement: seine Gruppe zurück an die Ausgangsposition
  canvas.addEventListener('dblclick', (e) => {
    const p = units(e);
    const key = hitText(p.x, p.y);
    if (!key) return;
    dragGroup(key).forEach((k) => { delete film.offsets[k]; });
    onChange();
  });
}

function resetFilmText() {
  film.offsets = {};
}
