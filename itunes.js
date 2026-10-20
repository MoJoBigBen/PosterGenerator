// Albumsuche über die iTunes Search API (Apple): kein Key, kein Konto.
// Liefert Titel, Künstler, Jahr, Tracklist, Label und Cover.
// Nutzt $, t(), redraw(), loadRemoteImage() und applyImage() aus app.js.

const ITUNES = { api: 'https://itunes.apple.com' };

function albumMsg(text, warn = false) {
  const el = $('albumMsg');
  el.textContent = text;
  el.classList.toggle('warn', warn);
}

async function itunesFetch(path, params) {
  const url = new URL(ITUNES.api + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(t('errUnreachable', { service: 'iTunes' }));
  }
  if (!res.ok) throw new Error(t('errService', { service: 'iTunes', status: res.status }));
  return res.json();
}

// ".../100x100bb.jpg" -> größte verfügbare Fassung (Apple liefert höchstens die Originalgröße)
const biggestArtwork = (url) => url.replace(/\d+x\d+bb(?:-\d+)?\.(?:jpg|png)$/, '3000x3000bb.jpg');

// Aus dem Copyright-Eintrag das Label herausziehen:
//   "℗ 2000 Parlophone Records Ltd, a Warner Music Group Company"      -> "Parlophone Records Ltd"
//   "℗ 2013 Daft Life Limited under exclusive license to Columbia ..." -> "Columbia Records"
//   "℗ 2016 The copyright ... marketed and distributed by Sony ..."   -> "Sony Music Entertainment"
function labelFromCopyright(text = '') {
  const rest = text.replace(/^[℗©\s]*\d{4}(?:\s*[-–,]\s*\d{4})*\s*/, '').trim();
  const target = rest.match(/exclusive licen[sc]e to ([^,]+)/i) || rest.match(/distributed by ([^,]+)/i);
  const label = (target ? target[1] : rest.split(/,\s+a\s/i)[0]).trim();
  return label.length > 45 ? label.split(/[,.]/)[0].trim() : label;
}

async function albumSearch() {
  const q = $('albumQuery').value.trim();
  if (!q) return;
  const box = $('albumResults');
  box.innerHTML = '';
  albumMsg(t('msgSearching'));
  try {
    const data = await itunesFetch('/search', { term: q, media: 'music', entity: 'album', limit: 8 });
    const hits = data.results || [];
    albumMsg(hits.length ? '' : t('msgNone'));
    hits.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      const im = document.createElement('img');
      im.src = a.artworkUrl60 || a.artworkUrl100;
      im.alt = '';
      b.appendChild(im);
      const label = document.createElement('span');
      label.textContent = `${a.collectionName} `;
      const small = document.createElement('small');
      small.textContent = `${a.artistName} (${(a.releaseDate || '').slice(0, 4)})`;
      label.appendChild(small);
      b.appendChild(label);
      b.addEventListener('click', () => albumLoad(a));
      box.appendChild(b);
    });
  } catch (e) {
    albumMsg(e.message, true);
  }
}

async function albumLoad(album) {
  albumMsg(t('msgLoadingAlbum'));
  try {
    const data = await itunesFetch('/lookup', { id: album.collectionId, entity: 'song' });
    const songs = (data.results || [])
      .filter((r) => r.wrapperType === 'track' && r.kind === 'song')
      .sort((x, y) => (x.discNumber - y.discNumber) || (x.trackNumber - y.trackNumber));

    $('title').value = album.collectionName;
    $('artist').value = album.artistName;
    $('year').value = (album.releaseDate || '').slice(0, 4);
    $('tracks').value = songs.map((s) => s.trackName).join('\n');
    $('footer').value = labelFromCopyright(album.copyright);
    $('albumResults').innerHTML = '';
    redraw();

    try {
      const img = await loadRemoteImage(biggestArtwork(album.artworkUrl100));
      applyImage(img, '@dropItunes');
      albumMsg('');
    } catch {
      albumMsg(t('msgCoverFail'), true);
    }
  } catch (e) {
    albumMsg(e.message, true);
  }
}

function initItunes() {
  $('albumSearch').addEventListener('click', albumSearch);
  $('albumQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') albumSearch(); });
}
