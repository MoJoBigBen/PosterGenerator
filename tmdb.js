// Filmdaten und Bilder von TMDB (themoviedb.org).
// Der API-Key gehört dem Benutzer und wird nur in dessen Browser gespeichert.
// Nutzt $, redraw() und loadRemoteImage()/applyImage() aus app.js.

const TMDB = {
  api: 'https://api.themoviedb.org/3',
  img: 'https://image.tmdb.org/t/p/',
  keyStore: 'posterGenerator.tmdbKey',
};

function tmdbMsg(text, warn = false) {
  const el = $('tmdbMsg');
  el.textContent = text;
  el.classList.toggle('warn', warn);
}

async function tmdbFetch(path, params = {}) {
  const key = $('tmdbKey').value.trim();
  if (!key) throw new Error(t('errNoKey'));

  const url = new URL(TMDB.api + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  // Lange Schlüssel sind das "API Read Access Token" (Bearer), kurze der klassische v3-Key.
  const opts = { headers: { accept: 'application/json' } };
  if (key.length > 40) opts.headers.Authorization = `Bearer ${key}`;
  else url.searchParams.set('api_key', key);

  let res;
  try {
    res = await fetch(url, opts);
  } catch {
    throw new Error(t('errUnreachable'));
  }
  if (res.status === 401) throw new Error(t('errRejected'));
  if (!res.ok) throw new Error(t('errTmdb', { status: res.status }));
  return res.json();
}

async function tmdbSearch() {
  const q = $('tmdbQuery').value.trim();
  if (!q) return;
  const box = $('tmdbResults');
  box.innerHTML = '';
  tmdbMsg(t('msgSearching'));
  try {
    const data = await tmdbFetch('/search/movie', { query: q, language: t('tmdbLang'), include_adult: 'false' });
    const hits = (data.results || []).slice(0, 8);
    tmdbMsg(hits.length ? '' : t('msgNone'));
    hits.forEach((m) => {
      const b = document.createElement('button');
      b.type = 'button';
      const year = (m.release_date || '').slice(0, 4);
      if (m.poster_path) {
        const im = document.createElement('img');
        im.src = `${TMDB.img}w92${m.poster_path}`;
        im.alt = '';
        b.appendChild(im);
      } else {
        const ph = document.createElement('span');
        ph.className = 'noimg';
        b.appendChild(ph);
      }
      const label = document.createElement('span');
      label.textContent = m.title + ' ';
      const small = document.createElement('small');
      small.textContent = year ? `(${year})` : '';
      label.appendChild(small);
      b.appendChild(label);
      b.addEventListener('click', () => tmdbLoadMovie(m.id));
      box.appendChild(b);
    });
  } catch (e) {
    tmdbMsg(e.message, true);
  }
}

const textlessFirst = (list) =>
  [...list].sort((a, b) =>
    (a.iso_639_1 === null ? 0 : 1) - (b.iso_639_1 === null ? 0 : 1) || (b.vote_average || 0) - (a.vote_average || 0));

async function tmdbLoadMovie(id) {
  tmdbMsg(t('msgLoadingFilm'));
  try {
    const d = await tmdbFetch(`/movie/${id}`, {
      language: t('tmdbLang'),
      append_to_response: 'credits,images',
      include_image_language: 'de,en,null',
    });

    // Übersetzte Taglines fehlen oft – dann die englische nehmen.
    let tagline = d.tagline || '';
    if (!tagline && t('tmdbLang') !== 'en-US') {
      try { tagline = (await tmdbFetch(`/movie/${id}`, { language: 'en-US' })).tagline || ''; } catch { /* egal */ }
    }

    const crew = d.credits?.crew || [];
    const named = (jobs) => {
      const hit = crew.find((c) => jobs.includes(c.job));
      return hit ? hit.name : '';
    };
    const first = [
      [t('credDirector'), named(['Director'])],
      [t('credWriter'), named(['Screenplay', 'Writer'])],
      [t('credMusic'), named(['Original Music Composer'])],
    ].filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join(' · ');
    const second = [
      d.runtime ? t('runtime', { n: d.runtime }) : '',
      (d.genres || []).map((g) => g.name).join(', '),
    ].filter(Boolean).join(' · ');

    $('fTitle').value = d.title || d.original_title || '';
    $('fTagline').value = tagline;
    $('fYear').value = (d.release_date || '').slice(0, 4);
    $('fCast').value = (d.credits?.cast || []).slice(0, 4).map((c) => c.name).join('\n');
    $('fCredits').value = [first, second].filter(Boolean).join('\n');
    $('tmdbResults').innerHTML = '';
    redraw();

    const posters = textlessFirst(d.images?.posters || []).slice(0, 8)
      .map((p) => ({ ...p, kind: 'poster' }));
    const backdrops = textlessFirst(d.images?.backdrops || []).slice(0, 6)
      .map((p) => ({ ...p, kind: 'backdrop' }));
    showTmdbImages([...posters, ...backdrops]);

    const start = posters.find((p) => p.iso_639_1 === null) || posters[0] || backdrops[0];
    if (start) await tmdbPickImage(start);
    else tmdbMsg(t('msgNoImage'), true);
  } catch (e) {
    tmdbMsg(e.message, true);
  }
}

function showTmdbImages(list) {
  const grid = $('tmdbThumbs');
  grid.innerHTML = '';
  $('tmdbImagesField').hidden = list.length === 0;
  list.forEach((entry) => {
    const b = document.createElement('button');
    b.type = 'button';
    if (entry.kind === 'backdrop') b.classList.add('wide');
    const im = document.createElement('img');
    im.src = `${TMDB.img}${entry.kind === 'poster' ? 'w185' : 'w300'}${entry.file_path}`;
    im.alt = '';
    b.appendChild(im);
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = t(entry.kind === 'poster' ? 'tagPoster' : 'tagStill') + (entry.iso_639_1 === null ? ` · ${t('tagTextless')}` : '');
    b.appendChild(tag);
    b.addEventListener('click', () => tmdbPickImage(entry, b));
    b._entry = entry;
    grid.appendChild(b);
  });
}

async function tmdbPickImage(entry, button) {
  tmdbMsg(t('msgLoadingImage'));
  try {
    const img = await loadRemoteImage(`${TMDB.img}original${entry.file_path}`);
    applyImage(img, '@dropTmdb');
    document.querySelectorAll('#tmdbThumbs button').forEach((b) => {
      b.classList.toggle('is-active', b === button || (!button && b._entry === entry));
    });
    tmdbMsg('');
  } catch {
    tmdbMsg(t('msgImageFail'), true);
  }
}

function initTmdb() {
  try { $('tmdbKey').value = localStorage.getItem(TMDB.keyStore) || ''; } catch { /* privater Modus */ }
  $('tmdbKey').addEventListener('input', () => {
    try { localStorage.setItem(TMDB.keyStore, $('tmdbKey').value.trim()); } catch { /* egal */ }
  });
  $('tmdbSearch').addEventListener('click', tmdbSearch);
  $('tmdbQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') tmdbSearch(); });
}
