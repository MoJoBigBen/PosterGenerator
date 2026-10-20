# Poster Generator

🇩🇪 [Deutsche Version](README.de.md)

Make your own posters instead of paying a lot for them online:

- **Album posters** in a polaroid style: cover, title, artist and tracklist.
- **Film posters** that look like cinema posters: the image fills the whole
  poster, with title, tagline, cast and credits on top. The tool can fetch
  film data and images straight from TMDB.

Export the finished poster as a PNG or PDF in print quality and have it
printed at a copy shop or an online print service.

Everything runs **in your browser, on your computer**. There is no server of
its own and no account. Your images are never uploaded anywhere. Only the
TMDB search (see below) talks to TMDB.

## Download

The repo is private, so you need to be logged in to GitHub.

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

1. Load the **cover**.
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

Below the buttons the tool shows how many **dpi** your image has in print.
Below about 150 dpi it looks blurry. From TMDB, take a poster or a still at
original size and don't print larger than A3.

### Loading films from TMDB

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

Then enter a film title, click **Search** and click the film. All fields fill
in and the first textless poster is loaded. Under "Choose an image" you can pick
a different one.

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
tmdb.js      Search and images from TMDB
```

The poster is drawn on a canvas. `app.js` builds the PDF itself, so there are
no libraries.

## Planned

- More album and film styles
- Load cover and tracklist automatically for albums
- Shrink the cover automatically when there are many tracks
