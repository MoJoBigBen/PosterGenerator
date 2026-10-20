# Poster Generator

🇬🇧 [English version](README.md)

Eigene Poster selber machen, statt sie online für viel Geld zu kaufen:

- **Album-Poster** im Polaroid-Stil: Cover, Titel, Künstler und Tracklist.
  Das Tool kann Alben suchen und alles automatisch ausfüllen.
- **Film-Poster** wie Kinoplakate: Das Bild füllt das ganze Poster, Titel,
  Tagline, Darsteller und Credits liegen darüber. Filmdaten und Bilder holt
  das Tool auf Wunsch direkt von TMDB.

Fertig exportierst du das Poster als PNG oder PDF in Druckqualität und lässt
es im Copyshop oder bei einer Online-Druckerei ausdrucken.

Alles läuft **im Browser auf deinem Rechner**. Es gibt keinen eigenen Server
und kein Konto. Deine Bilder werden nirgends hochgeladen. Nur die Suchen
(iTunes für Alben, TMDB für Filme, siehe unten) fragen bei diesen Diensten an.

## Download

Das Repo ist privat, du musst bei GitHub eingeloggt sein.

**Als ZIP:** auf GitHub oben rechts **Code → Download ZIP**, entpacken.

**Oder mit Git:**

```bash
git clone https://github.com/MoJoBigBen/PosterGenerator.git
```

Oder mit der GitHub-CLI:

```bash
gh repo clone MoJoBigBen/PosterGenerator
```

## Benutzen

Es ist nichts zu installieren. **`index.html` per Doppelklick im Browser
öffnen**, fertig. Oben links wechselst du zwischen **Album** und **Film**.

Die Oberfläche ist standardmäßig auf **Englisch**. Mit **EN | DE** oben rechts
schaltest du auf Deutsch um, das merkt sich der Browser. Beim Film-Poster
folgen auch die Texte von TMDB (Titel, Genres, Credits-Zeile) der Sprache.

Das Bild kommt immer über das gestrichelte Feld: ziehen, hineinklicken oder
aus der Zwischenablage einfügen (`Cmd+V`).

### Album

1. **Cover** laden oder von der Albumsuche laden lassen (siehe unten).
2. **Titel, Künstler, Jahr, Tracks** eintippen. Die Tracks stehen einer pro
   Zeile im Textfeld. Die Vorschau aktualisiert sich sofort.
3. **Fußzeile** für Label oder einen Spruch, falls du eine willst.
4. **Tracklist** als Fließtext oder als Liste. Bei vielen Tracks teilt die
   Liste sich in Spalten auf und die Schrift wird kleiner.
5. **Hintergrund**: Creme, Weiß, Schwarz, drei Varianten aus der Coverfarbe
   (hell, normal, dunkel) oder eine eigene Farbe. Unter dem Hintergrund
   erscheinen die Farben aus dem Cover. Ein Klick darauf setzt sie als
   Hintergrund. Die Schriftfarbe passt sich automatisch an.
6. **Farbpalette im Poster zeigen** setzt unten rechts kleine Farbquadrate aus
   dem Cover. Die Farbe, die gerade der Hintergrund ist, fehlt dabei, damit
   keine Lücke entsteht.

### Alben automatisch suchen

Oben im Album-Formular Künstler und Album eintippen (zum Beispiel
`Coldplay Parachutes`), auf **Suchen** klicken und das Album anklicken. Titel,
Künstler, Jahr, die komplette Tracklist, das Label (aus der Copyright-Zeile) und
das Cover füllen sich. Danach ist alles weiter bearbeitbar, und du kannst auch
ein eigenes Cover hineinziehen.

Genutzt wird die kostenlose **iTunes Search API** von Apple. Du brauchst keinen
Key und kein Konto. Gut zu wissen:

- Das Cover kommt in der größten Größe, die Apple hat. Das sind oft
  3000 × 3000 px, bei älteren Alben aber manchmal nur etwa 1400 px. Die
  dpi-Anzeige unter den Knöpfen sagt dir, ob das Cover im Druck weich wirkt.
- Deluxe-Versionen und Remasters erscheinen als eigene Ergebnisse. Nimm die
  passende.
- Alben, die nicht bei Apple Music sind, findet die Suche nicht. Dann nimmst du
  ein eigenes Cover und tippst die Tracks ein.
- Das Label ist eine Schätzung aus der Copyright-Zeile. Korrigiere es bei Bedarf
  im Feld Fußzeile.

### Film

Das Bild füllt das ganze Poster. Das **Format passt sich dem Bild an**: Ein
Hochformat-Poster bleibt hochkant, ein Standbild im Querformat gibt ein
Querformat-Poster. Im Format-Menü wählst du dazu die lange Seite
(30 cm, A3, A2, 70 cm). Du kannst auch ein festes Format wie A3 oder 50 × 70
wählen, dann wird das Bild zugeschnitten.

1. **Bild** laden, entweder selbst oder über die TMDB-Suche (siehe unten).
2. **Titel, Tagline, Jahr, Darsteller, Credits** eintippen oder von TMDB
   füllen lassen.
3. **Stil**:
   - **Teaser**: Tagline klein oben, der Titel breit gesetzt unten, darunter
     Jahr und Credits. Wie das Dark-Knight-Teaserplakat.
   - **Klassisch**: Tagline als Kursivzeile oben, unten der große Titel und die
     Darsteller als Namensblock. Wie Pulp Fiction oder Vom Winde verweht.
4. **Schrift**: Sans (breit gesetzt), Serif oder Kompakt (Plakatschrift).
   Die Schriftfarbe wählst du daneben.
5. **Abdunkelung** regelt den dunklen Verlauf oben und unten, damit die Schrift
   auf hellen Bildern lesbar bleibt.
6. **Bildausschnitt**: Mit dem Zoom-Regler vergrößerst du das Bild, mit der
   Maus verschiebst du es direkt in der Vorschau.

Unter den Knöpfen steht, wie viele **dpi** dein Bild im Druck hat. Unter etwa
150 dpi wirkt es unscharf. Das gilt auch für Album-Cover. Bei TMDB nimmst du am besten ein Poster oder eine
Szene in Originalgröße und druckst nicht größer als A3.

### Filme von TMDB laden

[TMDB](https://www.themoviedb.org) ist eine freie Filmdatenbank. Das Tool holt
daraus Titel, Tagline, Jahr, Darsteller, Regie, Laufzeit und Genre und zeigt
die Poster und Szenenbilder zur Auswahl. Poster **ohne Text** stehen zuerst,
die eignen sich am besten für ein eigenes Design.

**Einmalig einen API-Key holen** (kostenlos, für private Nutzung):

1. Bei [themoviedb.org](https://www.themoviedb.org) ein Konto anlegen.
2. Unter **Einstellungen → API** einen Key beantragen. Als Verwendung gibst du
   an, dass es ein privates Projekt ist.
3. Den **API-Schlüssel (v3)** oder das **API Read Access Token** in das Feld
   "API-Key" einfügen. Beides funktioniert.

Der Key wird nur im `localStorage` deines Browsers gespeichert und steht
nicht im Code und nicht im Repo.

Dann einen Filmtitel eingeben, auf **Suchen** klicken und den Film anklicken.
Alle Felder füllen sich, und das erste Poster ohne Text wird geladen. Unter
"Bild wählen" kannst du ein anderes Bild nehmen.

*This product uses the TMDB API but is not endorsed or certified by TMDB.*

## Formate

- A4 (21 × 29,7 cm), A3 (29,7 × 42 cm), A2 (42 × 59,4 cm)
- 30 × 40 cm, 40 × 50 cm, 50 × 70 cm
- Nur im Film-Modus: **Bildformat**, das sich dem Bild anpasst (lange Seite
  30 cm, A3, A2 oder 70 cm)

300 dpi ist die richtige Wahl für den Druck. Bei großen Formaten darfst du auf
200 oder 150 dpi gehen, wenn der Export zu lange dauert oder die Datei zu groß
wird. Auf Armlänge sieht man den Unterschied kaum. Sehr große Exporte kürzt das
Tool von selbst auf eine Auflösung, die der Browser schafft, und sagt es dir.

Das **PDF** ist eine Seite in exakt der gewählten Größe, die Druckereien
direkt annehmen. Beim Album-Poster wird das Cover bei **30 × 40 cm** und
**40 × 50 cm** etwas kleiner, damit genug Platz für die Texte bleibt.

## Tipps

- Beim Album nimm ein **Cover mit mindestens 1000 × 1000 Pixeln**. Ein kleines
  Bild wird auf dem Poster sichtbar unscharf.
- Das Album-Cover wird mittig quadratisch zugeschnitten, falls es das nicht
  schon ist.
- Titel und Tracklist werden automatisch kleiner, wenn sie nicht passen.

## Dateien

```
index.html   Oberfläche
style.css    Aussehen der Oberfläche
i18n.js      Texte auf Englisch und Deutsch
app.js       Album-Poster, Farbpalette, Formate, PNG- und PDF-Export
film.js      Film-Poster (Vollbild, Stile, Bildausschnitt)
tmdb.js      Filmsuche und Bilder von TMDB
itunes.js    Albumsuche von iTunes
```

Das Poster wird auf ein Canvas gezeichnet. Das PDF baut `app.js` selbst
zusammen, es sind keine Bibliotheken eingebunden.

## Geplant

- Weitere Album-Stile und Film-Stile
- Bei vielen Tracks das Cover automatisch verkleinern
