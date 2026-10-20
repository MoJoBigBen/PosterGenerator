# Poster Generator

🇩🇪 [Deutsche Version](README.de.md)

Make your own posters instead of paying a lot for them online:

- **Album posters** in a polaroid style: cover, title, artist and tracklist.
  The tool can look albums up for you and fill everything in.
- **Film posters** that look like cinema posters: the image fills the whole
  poster, with title, tagline, cast and credits on top. The tool can fetch
  film data and images straight from TMDB.

Export the finished poster as a PNG or PDF in print quality and have it
printed at a copy shop or an online print service.

Everything runs **in your browser, on your computer**. There is no server of
its own and no account. Your images are never uploaded anywhere. Only the
searches (iTunes for albums, TMDB for films, see below) contact those services.

## Use it online

**<https://mojobigben.github.io/PosterGenerator/>**

Open the link and start. Nothing to install, and it works on a computer or a
phone browser. Your images stay in your browser.

## Download

If you'd rather run it from your own computer:


The repo is public, so you don't need a GitHub account to download it.

**As a ZIP:** on GitHub click **Code → Download ZIP** (top right), then unzip.

**Or with Git:**

```bash
git clone https://github.com/MoJoBigBen/PosterGenerator.git
```

Or with the GitHub CLI:

```bash
gh repo clone MoJoBigBen/PosterGenerator
```

## Usage

There is nothing to install. **Open `index.html` in your browser** by
double-clicking it. Top left, switch between **Album** and **Film**.

The interface is in **English** by default. Click **EN | DE** at the top right
to switch to German. Your browser remembers the choice. For film posters, the
texts that come from TMDB (title, genres, credits line) follow the language too.

The image always goes into the dashed box: drag it in, click the box, or paste
from the clipboard (`Cmd+V`).

### Album

1. Load the **cover**, or let the album search do it (see below).
2. Type **title, artist, year and tracks**. Tracks go one per line in the text
   box. The preview updates immediately.
3. Add a **footer** for the label or a tagline if you like.
4. **Tracklist** as running text or as a list. With many tracks the list
   splits into columns and the text gets smaller.
5. **Background**: cream, white, black, three variants of the cover colour
   (light, normal, dark) or a custom colour. Below the background, the colours
   from the cover appear. Click one to use it as the background. The text colour
   adapts automatically.
6. **Show colour palette on the poster** puts small colour squares from the
   cover in the bottom right. The colour that is currently the background is
   left out so there is no gap.

### Finding albums automatically

At the top of the album form, type an artist and album (for example
`Coldplay Parachutes`), click **Search** and click the album. Title, artist,
year, the complete tracklist, the label (from the copyright line) and the cover
are filled in. Afterwards everything is still editable, and you can still drop
in your own cover.

It uses the free **iTunes Search API** from Apple. You don't need a key or an
account. Things to know:

- The cover comes in the largest size Apple has, which is often 3000 × 3000 px
  but for older albums can be around 1400 px. The dpi display below the buttons
  tells you if the cover will look soft in print.
- Deluxe editions and remasters show up as separate results, pick the one you
  want.
- Albums that aren't on Apple Music can't be found. Use your own cover and type
  the tracks in.
- The label is a best guess from the copyright line. Correct it in the footer
  field if needed.

### Film

The image fills the whole poster, and the **format adapts to the image**: a
portrait poster stays portrait, a landscape still gives a landscape poster. In
the format menu you choose the long side (30 cm, A3, A2, 70 cm). You can also
pick a fixed format like A3 or 50 × 70, in which case the image is cropped.

1. Load an **image**, either your own or through the TMDB search (see below).
2. Type **title, tagline, year, cast and credits**, or let TMDB fill them in.
3. **Style**:
   - **Teaser**: small tagline at the top, the title set wide at the bottom,
     with year and credits below. Like the Dark Knight teaser poster.
   - **Classic**: tagline as an italic line at the top, big title at the bottom
     and the cast as a name block. Like Pulp Fiction or Gone with the Wind.
4. **Font**: sans (wide), serif or compact (poster type). Pick the text colour
   next to it.
5. **Darkening** controls the dark gradient at the top and bottom that keeps
   the text readable on bright images.
6. **Image crop**: zoom with the slider and drag the image with the mouse
   right in the preview.
7. **Moving the text**: many posters have a calm area meant for the text,
   sometimes higher up. Drag any text in the preview to move it. What moves is
   set under **Dragging moves**:
   - **Bottom text block**: cast, title, year and credits move together. The
     tagline at the top moves on its own.
   - **Single element**: only the one you grab.
   - **All text**: everything at once.

   The text **snaps** to the centre, the margins, the thirds of the poster and
   to the edges and centres of the other text elements. Blue guide lines show
   what it snapped to. Hold **Alt** (Option) to drag freely without snapping.
   **Double-click** a text to put it (and what moves with it) back, or use
   **Reset** to reset all text. The dashed frame and the guide lines show only
   in the preview, never in the export.

Below the buttons the tool shows how many **dpi** your image has in print.
Below about 150 dpi it looks blurry. This works for album covers too. From TMDB, take a poster or a still at
original size and don't print larger than A3.

### Loading films and series from TMDB

[TMDB](https://www.themoviedb.org) is a free film database. The tool pulls
title, tagline, year, cast, director, runtime and genre from it and shows the
posters and stills to choose from. Posters **without text** come first, and they
work best for your own design.

**Get an API key once** (free, for personal use):

1. Create an account at [themoviedb.org](https://www.themoviedb.org).
2. Under **Settings → API** request a key. Say it is a personal project.
3. Paste the **API key (v3)** or the **API Read Access Token** into the
   "API key" field. Both work.

The key is only stored in your browser's `localStorage`. It is not in the code
and not in the repo.

Then pick **Film** or **Series** above the search field, enter a title, click **Search** and click the result. All fields fill
in and the first textless poster is loaded. Under "Choose an image" you can pick
a different one.

<a href="https://www.themoviedb.org"><img src="assets/tmdb-logo.svg" alt="TMDB" height="16"></a>

**Series:** with **Series** selected the tool fills in the name, the start year,
the main cast, the creators, the number of seasons, the network and the genres.
Below the image choices there is a row **Series | S1 | S2 | …**. Click a season
to see its own posters. When you pick a season poster, the **Season** field
fills in (for example "Season 2") and appears on the poster above the year. You
can move it like any other text, or clear the field to hide it. Picking a
series image removes the season again.

*This product uses the TMDB API but is not endorsed or certified by TMDB.*

## Formats

- A4 (21 × 29.7 cm), A3 (29.7 × 42 cm), A2 (42 × 59.4 cm)
- 30 × 40 cm, 40 × 50 cm, 50 × 70 cm
- Film mode only: **Match image**, which adapts to the image (long side
  30 cm, A3, A2 or 70 cm)

300 dpi is the right choice for printing. For large formats you can go down to
200 or 150 dpi if the export takes too long or the file gets too big. At arm's
length you hardly see the difference. If an export would be too big for the
browser, the tool lowers the resolution by itself and tells you.

The **PDF** is a single page in exactly the chosen size, which print shops
accept directly. For album posters at **30 × 40 cm** and **40 × 50 cm** the
cover gets a little smaller so there is enough room for the text.

## Choosing where to save

By default PNG and PDF files go to your browser's download folder. Tick
**Choose where to save** below the export buttons and the tool opens a "Save
as" window each time, so you can pick the folder and file name yourself. The
choice is remembered.

This works in Chrome, Edge and Opera. Firefox and Safari don't allow it for web
pages. There, turn on "Ask where to save each file" in the browser's download
settings instead, which does the same thing.

## Tips

- For albums use a **cover of at least 1000 × 1000 pixels**. A smaller image
  will look visibly blurry on the poster.
- The album cover is cropped to a square from the centre if it isn't one.
- Title and tracklist shrink automatically when they don't fit.

## Files

```
index.html   Interface
style.css    Look of the interface
i18n.js      Texts in English and German
app.js       Album poster, colour palette, formats, PNG and PDF export
film.js      Film poster (full bleed, styles, image crop)
tmdb.js      Film search and images from TMDB
assets/      TMDB logo
itunes.js    Album search from iTunes
```

The poster is drawn on a canvas. `app.js` builds the PDF itself, so there are
no libraries.

## Planned

- More album, film and series styles
- Shrink the cover automatically when there are many tracks
