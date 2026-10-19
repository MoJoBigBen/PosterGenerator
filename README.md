# Poster Generator

Eigene Album-Poster im Polaroid-Stil selber machen, statt sie online für viel
Geld zu kaufen: Cover hochladen, Titel, Künstler und Tracklist eintippen, als
PNG oder PDF in Druckqualität exportieren und im Copyshop oder bei einer
Online-Druckerei ausdrucken lassen.

Alles läuft **im Browser auf deinem Rechner**. Es gibt keinen Server und kein
Konto, und deine Bilder werden nirgends hochgeladen.

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
öffnen**, fertig.

1. **Cover** in das gestrichelte Feld ziehen, hineinklicken oder ein Bild aus
   der Zwischenablage einfügen (`Cmd+V`).
2. **Titel, Künstler, Jahr, Tracks** eintippen. Die Tracks stehen einer pro
   Zeile im Textfeld. Die Vorschau rechts aktualisiert sich sofort.
3. **Fußzeile** für Label oder einen Spruch, falls du eine willst.
4. **Tracklist**: als Fließtext (wie bei den Vorlagen) oder als Liste. Bei
   vielen Tracks teilt die Liste sich automatisch in Spalten auf.
5. **Hintergrund**: Creme, Weiß, Schwarz, drei Varianten aus der Coverfarbe
   (hell, normal, dunkel) oder eine eigene Farbe. Unter dem Hintergrund
   erscheinen die Farben aus dem Cover. Ein Klick auf eine Farbe setzt sie als
   Hintergrund. Die Schriftfarbe passt sich automatisch an.
6. **Farbpalette im Poster zeigen** setzt unten rechts kleine Farbquadrate aus
   dem Cover.
7. **Format** und **Qualität** wählen, dann **PNG** oder **PDF** klicken.

Unter den Knöpfen steht, wie groß die exportierte Datei in Pixeln wird.

## Formate

- A4 (21 × 29,7 cm), A3 (29,7 × 42 cm), A2 (42 × 59,4 cm)
- 30 × 40 cm, 40 × 50 cm, 50 × 70 cm

300 dpi ist die richtige Wahl für den Druck. Bei großen Formaten darfst du auf
200 oder 150 dpi gehen, wenn der Export zu lange dauert oder die Datei zu groß
wird. Auf Armlänge sieht man den Unterschied kaum.

Das **PDF** ist eine Seite in exakt der gewählten Größe, die Druckereien
direkt annehmen. Bei **30 × 40 cm** und **40 × 50 cm** wird das Cover etwas
kleiner, damit genug Platz für die Texte bleibt.

## Tipps

- Nimm ein **Cover mit mindestens 1000 × 1000 Pixeln**. Ein kleines Bild wird
  auf dem Poster sichtbar unscharf.
- Das Cover wird mittig quadratisch zugeschnitten, falls es das nicht schon
  ist.
- Der Titel wird automatisch kleiner, wenn er nicht auf eine oder zwei Zeilen
  passt. Genauso schrumpft die Tracklist, bis sie hineinpasst.

## Dateien

```
index.html   Oberfläche
style.css    Aussehen der Oberfläche
app.js       Poster-Zeichnung, Farbpalette, PNG- und PDF-Export
```

Das Poster wird auf ein Canvas gezeichnet. Das PDF baut `app.js` selbst
zusammen, es sind keine Bibliotheken eingebunden.

## Geplant

- Layouts für Filmposter
- Weitere Album-Stile
- Cover und Tracklist per Suche automatisch laden
