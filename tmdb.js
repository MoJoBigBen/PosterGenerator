// Film- und Seriendaten und Bilder von TMDB (themoviedb.org).
// Der API-Key gehört dem Benutzer und wird nur in dessen Browser gespeichert.
// Nutzt $, redraw() und loadRemoteImage()/applyImage() aus app.js.

const TMDB = {
  api: 'https://api.themoviedb.org/3',
  img: 'https://image.tmdb.org/t/p/',
  keyStore: 'posterGenerator.tmdbKey',
};

let tmdbKind = 'movie'; // 'movie' oder 'tv'

// Bildauswahl einer geladenen Serie: Serien-Bilder und je Staffel eigene Poster
let tmdbSeries = null; // { id, seasons: [{ n, poster }], series: [entries], bySeason: { n: [entries] } }

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
    throw new Error(t('errUnreachable', { service: 'TMDB' }));
  }
  if (res.status === 401) throw new Error(t('errRejected'));
  if (!res.ok) throw new Error(t('errService', { service: 'TMDB', status: res.status }));
  return res.json();
}

function tmdbSetKind(kind) {
  tmdbKind = kind;
  document.querySelectorAll('#tmdbKind button').forEach((b) => b.classList.toggle('is-active', b.dataset.kind === kind));
  $('tmdbResults').innerHTML = '';
  tmdbMsg('');
}

async function tmdbSearch() {
  const q = $('tmdbQuery').value.trim();
  if (!q) return;
  const box = $('tmdbResults');
  box.innerHTML = '';
  tmdbMsg(t('msgSearching'));
  try {
    const data = await tmdbFetch(`/search/${tmdbKind}`, { query: q, language: t('tmdbLang'), include_adult: 'false' });
    const hits = (data.results || []).slice(0, 8);
    tmdbMsg(hits.length ? '' : t('msgNone'));
    hits.forEach((m) => {
      const b = document.createElement('button');
      b.type = 'button';
      const year = (m.release_date || m.first_air_date || '').slice(0, 4);
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
      label.textContent = (m.title || m.name) + ' ';
      const small = document.createElement('small');
      small.textContent = year ? `(${year})` : '';
      label.appendChild(small);
      b.appendChild(label);
      b.addEventListener('click', () => (tmdbKind === 'tv' ? tmdbLoadSeries(m.id) : tmdbLoadMovie(m.id)));
      box.appendChild(b);
    });
  } catch (e) {
    tmdbMsg(e.message, true);
  }
}

const textlessFirst = (list) =>
  [...list].sort((a, b) =>
    (a.iso_639_1 === null ? 0 : 1) - (b.iso_639_1 === null ? 0 : 1) || (b.vote_average || 0) - (a.vote_average || 0));

// Übersetzte Taglines fehlen oft – dann die englische nehmen.
async function tmdbTagline(kind, id, current) {
  if (current || t('tmdbLang') === 'en-US') return current || '';
  try { return (await tmdbFetch(`/${kind}/${id}`, { language: 'en-US' })).tagline || ''; } catch { return ''; }
}

const tmdbPosters = (list, extra = {}) => textlessFirst(list || []).slice(0, 8).map((p) => ({ ...p, kind: 'poster', ...extra }));
const tmdbBackdrops = (list) => textlessFirst(list || []).slice(0, 6).map((p) => ({ ...p, kind: 'backdrop' }));

// Drei Zeilen für den Credits-Block, leere fallen weg
const creditBlock = (lines) => lines.map((parts) => parts.filter(Boolean).join(' · ')).filter(Boolean).join('\n');

async function tmdbLoadMovie(id) {
  tmdbMsg(t('msgLoadingFilm'));
  try {
    const d = await tmdbFetch(`/movie/${id}`, {
      language: t('tmdbLang'),
      append_to_response: 'credits,images',
      include_image_language: 'de,en,null',
    });
    const tagline = await tmdbTagline('movie', id, d.tagline);

    const crew = d.credits?.crew || [];
    const credit = (key, jobs) => {
      const hit = crew.find((c) => jobs.includes(c.job));
      return hit ? `${t(key)} ${hit.name}` : '';
    };
    // Regie + Drehbuch, Musik, Laufzeit + Genre
    $('fCredits').value = creditBlock([
      [credit('credDirector', ['Director']), credit('credWriter', ['Screenplay', 'Writer'])],
      [credit('credMusic', ['Original Music Composer'])],
      [d.runtime ? t('runtime', { n: d.runtime }) : '', (d.genres || []).map((g) => g.name).join(', ')],
    ]);

    $('fTitle').value = d.title || d.original_title || '';
    $('fTagline').value = tagline;
    $('fYear').value = (d.release_date || '').slice(0, 4);
    $('fSeason').value = '';
    $('fCast').value = (d.credits?.cast || []).slice(0, 4).map((c) => c.name).join('\n');
    $('tmdbResults').innerHTML = '';
    tmdbSeries = null;
    showTmdbScopes([]);
    redraw();

    const posters = tmdbPosters(d.images?.posters);
    const backdrops = tmdbBackdrops(d.images?.backdrops);
    showTmdbImages([...posters, ...backdrops]);

    const start = posters.find((p) => p.iso_639_1 === null) || posters[0] || backdrops[0];
    if (start) await tmdbPickImage(start);
    else tmdbMsg(t('msgNoImage'), true);
  } catch (e) {
    tmdbMsg(e.message, true);
  }
}

async function tmdbLoadSeries(id) {
  tmdbMsg(t('msgLoadingSeries'));
  try {
    const d = await tmdbFetch(`/tv/${id}`, {
      language: t('tmdbLang'),
      append_to_response: 'aggregate_credits,images',
      include_image_language: 'de,en,null',
    });
    const tagline = await tmdbTagline('tv', id, d.tagline);

    const creators = (d.created_by || []).slice(0, 2).map((c) => c.name);
    const seasonsReal = (d.seasons || []).filter((s) => s.season_number > 0);
    const count = d.number_of_seasons || seasonsReal.length;
    // Idee von, Staffeln + Sender, Laufzeit + Genre
    $('fCredits').value = creditBlock([
      [creators.length ? `${t('credCreated')} ${creators.join(' · ')}` : ''],
      [count ? t(count === 1 ? 'seasonOne' : 'seasonMany', { n: count }) : '', d.networks?.[0]?.name || ''],
      [d.episode_run_time?.[0] ? t('runtime', { n: d.episode_run_time[0] }) : '', (d.genres || []).map((g) => g.name).join(', ')],
    ]);

    $('fTitle').value = d.name || d.original_name || '';
    $('fTagline').value = tagline;
    $('fYear').value = (d.first_air_date || '').slice(0, 4);
    $('fSeason').value = '';
    $('fCast').value = (d.aggregate_credits?.cast || []).slice(0, 4).map((c) => c.name).join('\n');
    $('tmdbResults').innerHTML = '';

    const posters = tmdbPosters(d.images?.posters);
    const backdrops = tmdbBackdrops(d.images?.backdrops);
    tmdbSeries = {
      id,
      seasons: seasonsReal.map((s) => ({ n: s.season_number, poster: s.poster_path })),
      series: [...posters, ...backdrops],
      bySeason: {},
    };
    showTmdbScopes(tmdbSeries.seasons);
    selectTmdbScope('series');
    redraw();

    const start = posters.find((p) => p.iso_639_1 === null) || posters[0] || backdrops[0];
    if (start) await tmdbPickImage(start);
    else tmdbMsg(t('msgNoImage'), true);
  } catch (e) {
    tmdbMsg(e.message, true);
  }
}

// ---------- Bildauswahl: Serie oder Staffel ----------

function showTmdbScopes(seasons) {
  const box = $('tmdbScopes');
  box.innerHTML = '';
  box.hidden = seasons.length === 0;
  if (!seasons.length) return;
  const chip = (scope, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.scope = scope;
    b.textContent = label;
    b.addEventListener('click', () => selectTmdbScope(scope));
    box.appendChild(b);
  };
  chip('series', t('scopeSeries'));
  seasons.forEach((s) => chip(String(s.n), `S${s.n}`));
}

async function selectTmdbScope(scope) {
  document.querySelectorAll('#tmdbScopes button').forEach((b) => b.classList.toggle('is-active', b.dataset.scope === scope));
  if (!tmdbSeries) return;
  if (scope === 'series') {
    showTmdbImages(tmdbSeries.series);
    return;
  }

  const n = +scope;
  if (!tmdbSeries.bySeason[n]) {
    // Sofort das Standard-Poster der Staffel zeigen, dann weitere nachladen
    const first = tmdbSeries.seasons.find((s) => s.n === n)?.poster;
    showTmdbImages(first ? [{ file_path: first, kind: 'poster', season: n }] : []);
    try {
      const data = await tmdbFetch(`/tv/${tmdbSeries.id}/season/${n}/images`, { include_image_language: 'de,en,null' });
      const list = tmdbPosters(data.posters, { season: n });
      if (first && !list.some((p) => p.file_path === first)) list.unshift({ file_path: first, kind: 'poster', season: n, iso_639_1: null });
      tmdbSeries.bySeason[n] = list;
    } catch {
      tmdbSeries.bySeason[n] = first ? [{ file_path: first, kind: 'poster', season: n }] : [];
    }
  }
  // Der Benutzer könnte inzwischen eine andere Staffel gewählt haben
  const active = document.querySelector('#tmdbScopes button.is-active');
  if (active && active.dataset.scope === scope) showTmdbImages(tmdbSeries.bySeason[n]);
}

function showTmdbImages(list) {
  const grid = $('tmdbThumbs');
  grid.innerHTML = '';
  $('tmdbImagesField').hidden = list.length === 0 && $('tmdbScopes').hidden;
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
    const what = entry.season ? t('tagSeason', { n: entry.season }) : t(entry.kind === 'poster' ? 'tagPoster' : 'tagStill');
    tag.textContent = what + (entry.iso_639_1 === null ? ` · ${t('tagTextless')}` : '');
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
    // Ein Staffelposter setzt die Staffelnummer, ein Serien- oder Filmbild nimmt sie weg
    if (tmdbSeries) $('fSeason').value = entry.season ? t('seasonLabel', { n: entry.season }) : '';
    redraw();
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
  document.querySelectorAll('#tmdbKind button').forEach((b) => b.addEventListener('click', () => tmdbSetKind(b.dataset.kind)));
}
