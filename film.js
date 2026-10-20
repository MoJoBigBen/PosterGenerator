// Film-Poster: Bild füllt das ganze Poster, Schrift liegt darüber.
// Nutzt $, FONT und wrapText aus app.js (erst beim Zeichnen aufgerufen).

const film = {
  img: null,
  px: 0.5, // Bildausschnitt: 0 = links/oben, 1 = rechts/unten
  py: 0.5,
};

const FILM_SAMPLE = {
  title: 'The Dark Knight',
  tagline: 'Why so serious?',
  year: '2008',
  cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'].join('\n'),
  en: { credits: 'Directed by Christopher Nolan · Written by Jonathan Nolan · Music by Hans Zimmer\n152 min. · Action, Crime, Drama' },
  de: { credits: 'Regie Christopher Nolan · Drehbuch Jonathan Nolan · Musik Hans Zimmer\n152 Min. · Action, Krimi, Drama' },
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

function renderFilm(ctx, L, H, scale) {
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

  // oben: Tagline
  if (tagline) {
    if (classic) {
      ctx.font = 'italic 400 36px Georgia, "Times New Roman", serif';
      wrapText(ctx, tagline, maxW).slice(0, 3).forEach((ln, i) => {
        drawTracked(ctx, ln, cx, m + 30 + i * 44, 0.4);
      });
    } else {
      ctx.font = `700 24px ${FONT}`;
      const tr = 24 * 0.4;
      wrapTracked(ctx, tagline.toUpperCase(), maxW, tr).slice(0, 2).forEach((ln, i) => {
        drawTracked(ctx, ln, cx, m + 24 + i * 36, tr);
      });
    }
  }

  // unten: von unten nach oben stapeln – Credits, Jahr, (Darsteller), Titel
  let y = H - m;

  if (credits.length) {
    const cs = 16, tr = cs * 0.1;
    ctx.font = `400 ${cs}px ${FONT}`;
    ctx.globalAlpha = 0.8;
    const lines = credits.flatMap((l) => wrapTracked(ctx, l.toUpperCase(), maxW, tr));
    for (let i = lines.length - 1; i >= 0; i--) {
      drawTracked(ctx, lines[i], cx, y, tr);
      y -= cs * 1.6;
    }
    ctx.globalAlpha = 1;
    y -= cs * 0.5;
  }

  if (year) {
    const ys = 28, tr = ys * 0.3;
    ctx.font = `400 ${ys}px ${FONT}`;
    ctx.globalAlpha = 0.65;
    drawTracked(ctx, year, cx, y, tr);
    ctx.globalAlpha = 1;
    y -= ys * 1.2 + 12;
  }

  if (classic && cast.length) {
    const cs = 34, tr = cs * 0.1;
    ctx.font = `700 ${cs}px ${FONT}`;
    for (let i = cast.length - 1; i >= 0; i--) {
      drawTracked(ctx, cast[i].toUpperCase(), cx, y, tr);
      y -= cs * 1.3;
    }
    y -= cs * 0.4;
  }

  if (title) {
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
      drawTracked(ctx, lines[i], cx, y, size * trk);
      y -= size * 1.1;
    }
    y -= size * 0.2;
  }

  if (!classic && cast.length) {
    const cs = 17, tr = cs * 0.22;
    ctx.font = `400 ${cs}px ${FONT}`;
    ctx.globalAlpha = 0.85;
    const lines = wrapTracked(ctx, cast.join('  ·  ').toUpperCase(), maxW, tr).slice(0, 2);
    for (let i = lines.length - 1; i >= 0; i--) {
      drawTracked(ctx, lines[i], cx, y, tr);
      y -= cs * 1.6;
    }
    ctx.globalAlpha = 1;
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
}

// ---------- Bild mit der Maus verschieben ----------

function initFilmDrag(canvas, onChange) {
  let drag = null;

  canvas.addEventListener('pointerdown', (e) => {
    if (!canvas.classList.contains('is-draggable')) return;
    drag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('is-dragging');
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drag || !film.img) return;
    const f = 1000 / canvas.getBoundingClientRect().width; // Bildschirm-px -> Poster-Einheiten
    const r = filmImageRect(1000, canvas.height * (1000 / canvas.width));
    if (r.slackX > 0.5) film.px = Math.min(1, Math.max(0, film.px - (e.clientX - drag.x) * f / r.slackX));
    if (r.slackY > 0.5) film.py = Math.min(1, Math.max(0, film.py - (e.clientY - drag.y) * f / r.slackY));
    drag = { x: e.clientX, y: e.clientY };
    onChange();
  });

  const end = () => { drag = null; canvas.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}
